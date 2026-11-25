#!/usr/bin/env python3
"""
Valmont & Co. — Motor de la academia (todo automático, solo Python estándar).

Cada ejecución hace, en este orden:
  1. COPIA DE SHOPIFY: mientras Shopify siga abierto, lee todos los libros, guías y cursos de
     valmontco.com (títulos, textos, precios y fotos) y los guarda en la web nueva. Las fotos se
     copian a la web, así que al cerrar Shopify no se pierde nada.
  2. COBROS: crea en Stripe un enlace de pago para cada producto que ya tenga su archivo de descarga.
     Al pagar, Stripe le enseña al cliente su botón de descarga y le manda el recibo.
     (Los enlaces de descarga van en el secreto VALMONT_DOWNLOADS, nunca en el repositorio público.)
  3. VENTAS: mira las ventas nuevas en Stripe y te avisa por Telegram.
  4. WEB: genera el catálogo, una página por producto (para Google) y el mapa del sitio.
  5. VIGILANTE: revisa que no falten fotos, precios ni enlaces y corrige lo que puede.
"""

import html
import json
import os
import re
import sys
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import DATA, ROOT, TODAY, env, load_json, notify, request, save_json, slug, stripe  # noqa: E402

CFG = load_json("config.json", {})
SITE = CFG.get("site_url", "https://valmontco.com").rstrip("/")
SHOP = CFG.get("shopify_url", "https://www.valmontco.com").rstrip("/")
IMG_DIR = os.path.join(ROOT, "assets", "img")


def log(m):
    print(f"[academia] {m}", flush=True)


# ------------------------------------------------------------------ 1. Copia desde Shopify
def detect_lang(title, handle, body):
    t = f"{title} {handle}".lower()
    en_marks = ("versión en inglés", "version en ingles", "english version", "english edition", "edición en inglés",
                "edicion en ingles", "english-version", "english-edition", "-en-", "(en)")
    es_marks = ("versión en español", "version en espanol", "spanish version", "spanish edition", "edición en español",
                "edicion en espanol", "spanish-version", "spanish-edition", "version-espanol", "(es)")
    if any(m in t for m in en_marks):
        return "en"
    if any(m in t for m in es_marks):
        return "es"
    if re.search(r"\b(spanish|español|espanol)\b", t):
        return "es"
    if re.search(r"\b(english|inglés|ingles)\b", t):
        return "en"
    text = re.sub(r"<[^>]+>", " ", body or "").lower()
    es = len(re.findall(r"\b(el|la|los|las|de|que|para|con|una|inversión|mercado)\b", text))
    en = len(re.findall(r"\b(the|and|of|to|for|with|your|investment|market)\b", text))
    return "es" if es >= en else "en"


def detect_kind(ptype, title, price):
    t = f"{ptype} {title}".lower()
    if price <= 0:
        return "free"
    if any(w in t for w in ("curso", "course", "masterclass", "clase")):
        return "course"
    if any(w in t for w in ("guía", "guia", "guide")):
        return "guide"
    if any(w in t for w in ("suscrip", "subscription", "membres")):
        return "subscription"
    return "book"


ALLOWED = {"p", "br", "strong", "b", "em", "i", "ul", "ol", "li", "h2", "h3", "h4", "blockquote"}


def clean_html(raw):
    raw = re.sub(r"(?is)<(script|style|iframe|object)[^>]*>.*?</\1>", "", raw or "")
    raw = re.sub(r"(?i)<h1", "<h2", raw).replace("</h1>", "</h2>")

    def keep(m):
        tag = m.group(2).lower()
        return f"<{m.group(1)}{tag}>" if tag in ALLOWED else " "
    raw = re.sub(r"<(/?)([a-zA-Z0-9]+)[^>]*>", keep, raw)
    raw = re.sub(r"\s+", " ", raw)
    return raw.strip()


def fetch_image(url, handle, i):
    os.makedirs(IMG_DIR, exist_ok=True)
    ext = url.split("?")[0].rsplit(".", 1)[-1].lower()
    ext = ext if ext in ("jpg", "jpeg", "png", "webp", "gif") else "jpg"
    name = f"{handle}-{i}.{ext}"
    path = os.path.join(IMG_DIR, name)
    if not os.path.exists(path):
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=60) as r, open(path, "wb") as f:
            f.write(r.read())
    return f"assets/img/{name}"


def sync_shopify(db):
    if not CFG.get("sync_from_shopify", True):
        return
    page, seen = 1, 0
    while page < 20:
        try:
            data = request(f"{SHOP}/products.json?limit=250&page={page}", timeout=60)
        except Exception as e:
            log(f"Shopify no responde ({str(e)[:80]}); sigo con lo que ya tengo.")
            return
        items = data.get("products", [])
        if not items:
            break
        for sp in items:
            seen += 1
            h = sp["handle"]
            v = (sp.get("variants") or [{}])[0]
            price = float(v.get("price") or 0)
            old = db.get(h, {})
            p = {
                **old,
                "id": h,
                "title": sp["title"].strip(),
                "type_shop": sp.get("product_type", ""),
                "kind": old.get("kind_fixed") or detect_kind(sp.get("product_type", ""), sp["title"], price),
                "lang": old.get("lang_fixed") or detect_lang(sp["title"], h, sp.get("body_html")),
                "price_usd": price,
                "compare_usd": float(v.get("compare_at_price") or 0) or None,
                "body": clean_html(sp.get("body_html")),
                "tags": sp.get("tags", []) if isinstance(sp.get("tags"), list) else
                [t.strip() for t in str(sp.get("tags", "")).split(",") if t.strip()],
                "updated": TODAY,
            }
            imgs = []
            for i, im in enumerate((sp.get("images") or [])[:6]):
                try:
                    imgs.append(fetch_image(im["src"], h, i))
                except Exception as e:
                    log(f"No pude copiar una foto de {h}: {str(e)[:60]}")
            if imgs:
                p["images"] = imgs
            db[h] = p
        page += 1
    log(f"Leídos de Shopify: {seen} productos.")


# ------------------------------------------------------------------ 2. Enlaces de pago de Stripe
def downloads():
    try:
        return json.loads(env("VALMONT_DOWNLOADS") or "{}")
    except Exception:
        log("El secreto VALMONT_DOWNLOADS no es un JSON válido.")
        return {}


def make_links(db):
    if not env("STRIPE_SECRET_KEY"):
        log("Falta STRIPE_SECRET_KEY: los productos se ven pero aún no se pueden comprar.")
        return
    dl = downloads()
    for p in db.values():
        if p.get("hidden") or p["kind"] in ("free", "subscription") or p["price_usd"] <= 0:
            continue
        url = dl.get(p["id"])
        if not url:
            p.pop("pay_url", None)  # sin archivo no se vende: así nadie paga sin recibirlo
            continue
        cents = int(round(p["price_usd"] * 100))
        sig = f"{cents}|{url}"
        if p.get("pay_url") and p.get("pay_sig") == sig:
            continue
        try:
            if p.get("pay_id"):
                stripe(f"/payment_links/{p['pay_id']}", {"active": "false"})
            if not p.get("stripe_product"):
                prod = stripe("/products", {"name": p["title"][:250], "metadata[valmont_id]": p["id"]})
                p["stripe_product"] = prod["id"]
            price = stripe("/prices", {"product": p["stripe_product"], "unit_amount": cents, "currency": "usd"})
            es = p["lang"] == "es"
            msg = (f"¡Gracias por tu compra! Descarga aquí «{p['title'][:80]}»: {url}  — "
                   f"Guarda este enlace. Recibirás también el recibo por correo.") if es else \
                  (f"Thank you for your purchase! Download «{p['title'][:80]}» here: {url}  — "
                   f"Keep this link. Your receipt is on its way by email.")
            link = stripe("/payment_links", {
                "line_items[0][price]": price["id"], "line_items[0][quantity]": 1,
                "metadata[valmont_id]": p["id"], "allow_promotion_codes": "true",
                "after_completion[type]": "hosted_confirmation",
                "after_completion[hosted_confirmation][custom_message]": msg[:500],
                "customer_creation": "always",
            })
            p.update(pay_url=link["url"], pay_id=link["id"], pay_sig=sig)
            log(f"Enlace de pago listo: {p['id']}")
        except Exception as e:
            log(f"Stripe falló con {p['id']}: {str(e)[:150]}")


# ------------------------------------------------------------------ 3. Ventas nuevas
def check_sales(db):
    if not env("STRIPE_SECRET_KEY"):
        return
    st = load_json("sales_state.json", {"seen": [], "total_usd": 0, "count": 0})
    by_link = {p.get("pay_id"): p for p in db.values() if p.get("pay_id")}
    try:
        sess = stripe("/checkout/sessions?limit=50&status=complete").get("data", [])
    except Exception as e:
        log(f"No pude leer las ventas: {str(e)[:100]}")
        return
    new = []
    for s in sess:
        if s["id"] in st["seen"] or s.get("payment_status") != "paid":
            continue
        p = by_link.get(s.get("payment_link"))
        if not p:
            continue
        st["seen"].append(s["id"])
        amt = (s.get("amount_total") or 0) / 100
        st["total_usd"] = round(st["total_usd"] + amt, 2)
        st["count"] += 1
        p["sales"] = p.get("sales", 0) + 1
        new.append(f"• {p['title'][:70]} — ${amt:.2f}")
    st["seen"] = st["seen"][-500:]
    save_json("sales_state.json", st)
    if new:
        notify("💰 Valmont & Co. — venta nueva:\n" + "\n".join(new) +
               f"\n\nTotal acumulado: {st['count']} ventas · ${st['total_usd']:.2f}")


# ------------------------------------------------------------------ 4. Web
KIND_ES = {"book": "Libro digital", "guide": "Guía", "course": "Curso en vídeo", "free": "Gratis", "subscription": "Suscripción"}
KIND_EN = {"book": "Digital book", "guide": "Guide", "course": "Video course", "free": "Free", "subscription": "Subscription"}


def page_html(p):
    title = html.escape(p["title"])
    desc = html.escape(re.sub(r"<[^>]+>", " ", p.get("body", ""))[:155].strip())
    img = f"{SITE}/{p['images'][0]}" if p.get("images") else f"{SITE}/assets/og.jpg"
    lang = p["lang"]
    ld = {"@context": "https://schema.org", "@type": "Book" if p["kind"] in ("book", "guide", "free") else "Course",
          "name": p["title"], "image": img, "inLanguage": lang, "description": desc,
          "publisher": {"@type": "Organization", "name": "Valmont & Co."}}
    if p["kind"] != "course":
        ld["bookFormat"] = "https://schema.org/EBook"
    if p["price_usd"] > 0:
        ld["offers"] = {"@type": "Offer", "price": f"{p['price_usd']:.2f}", "priceCurrency": "USD",
                        "availability": "https://schema.org/InStock", "url": f"{SITE}/p/{p['id']}/"}
    return f"""<!doctype html><html lang="{lang}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} · Valmont &amp; Co.</title><meta name="description" content="{desc}">
<link rel="canonical" href="{SITE}/p/{p['id']}/">
<meta property="og:title" content="{title}"><meta property="og:image" content="{img}"><meta property="og:type" content="product">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
<meta http-equiv="refresh" content="0;url={SITE}/#/p/{p['id']}">
</head><body><h1>{title}</h1><p>{desc}</p><a href="{SITE}/#/p/{p['id']}">Valmont &amp; Co.</a></body></html>"""


def build_site(db):
    visible = [p for p in db.values() if not p.get("hidden")]
    order = {"free": 0, "book": 1, "guide": 2, "course": 3, "subscription": 4}
    visible.sort(key=lambda p: (order.get(p["kind"], 9), -p.get("sales", 0), p["title"]))
    pub = []
    for p in visible:
        pub.append({k: p.get(k) for k in ("id", "title", "kind", "lang", "price_usd", "compare_usd", "body", "images",
                                          "pay_url", "amazon_url", "free_url", "sales")})
    save_json("catalog.json", {"updated": TODAY, "products": pub,
                               "links": CFG.get("links", {}), "amazon": CFG.get("amazon_author_url", "")})
    urls = [f"{SITE}/"]
    for p in visible:
        d = os.path.join(ROOT, "p", p["id"])
        os.makedirs(d, exist_ok=True)
        with open(os.path.join(d, "index.html"), "w", encoding="utf-8") as f:
            f.write(page_html(p))
        urls.append(f"{SITE}/p/{p['id']}/")
    with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        for u in urls:
            f.write(f"  <url><loc>{u}</loc><lastmod>{TODAY}</lastmod></url>\n")
        f.write("</urlset>\n")
    with open(os.path.join(ROOT, "robots.txt"), "w") as f:
        f.write(f"User-agent: *\nAllow: /\nSitemap: {SITE}/sitemap.xml\n")
    log(f"Web generada: {len(visible)} productos.")


# ------------------------------------------------------------------ 5. Vigilante
def watchdog(db):
    fixes, alerts = [], []
    overrides = CFG.get("products", {})
    for p in db.values():
        o = overrides.get(p["id"], {})
        for k in ("hidden", "amazon_url", "free_url"):
            if k in o:
                p[k] = o[k]
        if "lang" in o:
            p["lang"] = p["lang_fixed"] = o["lang"]
        if "kind" in o:
            p["kind"] = p["kind_fixed"] = o["kind"]
        if p.get("images"):
            ok = [i for i in p["images"] if os.path.exists(os.path.join(ROOT, i))]
            if len(ok) != len(p["images"]):
                p["images"] = ok
                fixes.append(f"fotos rotas quitadas en {p['id']}")
        if not p.get("images") and not p.get("hidden"):
            alerts.append(f"sin foto: {p['title'][:50]}")
        if p["kind"] not in ("free", "subscription") and p["price_usd"] <= 0:
            p["kind"] = "free"
            fixes.append(f"{p['id']} pasa a gratis (precio 0)")
    dl = downloads()
    for p in db.values():  # los gratis se descargan directamente (no hace falta pagar)
        if p["kind"] == "free" and dl.get(p["id"]) and not p.get("free_url"):
            p["free_url"] = dl[p["id"]]
    missing = [p["title"][:60] for p in db.values()
               if p["kind"] in ("book", "guide", "course", "free") and not p.get("hidden") and not dl.get(p["id"]) and not p.get("free_url")]
    st = load_json("watch_state.json", {"last_missing": []})
    if missing and missing != st.get("last_missing"):
        alerts.append(f"{len(missing)} productos aún sin archivo de descarga (no se pueden comprar todavía)")
    st["last_missing"] = missing
    save_json("watch_state.json", st)
    for f in fixes:
        log("Corregido: " + f)
    if alerts:
        notify("🛡️ Vigilante Valmont:\n• " + "\n• ".join(alerts[:15]))


def main():
    db = {p["id"]: p for p in load_json("products.json", {"products": []}).get("products", [])}
    sync_shopify(db)
    watchdog(db)
    make_links(db)
    check_sales(db)
    build_site(db)
    save_json("products.json", {"updated": TODAY, "products": list(db.values())})
    return 0


if __name__ == "__main__":
    sys.exit(main())
