/* Valmont & Co. — tienda de la academia (sin librerías, sin servidor). */
(function () {
  "use strict";
  var T = {
    es: {
      nav: [["#/", "Inicio"], ["#/s/free", "Gratis"], ["#/s/book", "Libros"], ["#/s/guide", "Guías"], ["#/s/course", "Cursos"], ["#/s/subs", "Suscripciones"]],
      hero: "Aprende a invertir en bolsa con método",
      heroSub: "Libros digitales, guías ilustradas y cursos en vídeo sobre el mercado de valores. Descarga inmediata tras el pago.",
      cta: "Empieza gratis", ctaB: "Ver libros",
      free: "Empieza gratis", book: "Libros digitales", guide: "Guías", course: "Cursos en vídeo", subs: "Suscripciones",
      freeSub: "Introducciones y prólogos gratuitos para conocer el método Valmont.",
      bookSub: "Ediciones digitales en español e inglés. ¿Lo prefieres en papel? También en Amazon.",
      guideSub: "Guías paso a paso con imágenes, en español e inglés.",
      courseSub: "Masterclasses en vídeo (en español; versión en inglés con subtítulos próximamente).",
      subsSub: "Información diaria de mercado en tu correo y en Telegram.",
      buy: "Comprar", get: "Descargar gratis", soon: "Muy pronto", amazon: "En papel en Amazon",
      edition: "Edición", only: "Ver solo", all: "Todas", esEd: "Español", enEd: "Inglés",
      instant: "Descarga inmediata · Pago seguro con Stripe", back: "← Volver",
      nexusT: "Nexus Terminal Pro", nexusTag: "Trading · Señales y pronósticos del mercado",
      nexusD: "Predice el mercado y te envía señales de trading: dónde entrar y dónde no, con pronósticos diarios calculados sobre miles de acciones, criptomonedas y divisas, y un historial público de aciertos.",
      nexusL: ["Señales de trading y pronósticos de cada sesión", "Avisos diarios por correo y Telegram", "Zonas Pro de la web: escáner completo y herramientas", "Histórico público de aciertos para comprobarlo todo"],
      nexusC: "Suscribirme a Nexus Pro", nexusP: "Plan Pro · 5 €/mes", nexusF: "También tiene versión gratis",
      equityT: "Equity Intrinsic Premium", equityTag: "Inversión · Predicción de acciones y valor intrínseco",
      equityD: "Predice qué acciones tienen recorrido y calcula cuánto vale de verdad cada empresa con datos oficiales: tres métodos de valoración, margen de seguridad y salud financiera.",
      equityL: ["Acciones por debajo de su valor real, cada día", "Resumen diario por correo en tu idioma", "Canal de Telegram con nuevas oportunidades", "Valoración con tres métodos y 10 años de cuentas"],
      equityC: "Ver planes de Equity Intrinsic", equityP: "Plan Premium · 5 €/mes", equityF: "También tiene versión gratis",
      promoT: "Pon en práctica lo aprendido", promoD: "Tus libros y cursos te dan el método. Nuestras plataformas te dan los datos de cada día.",
      join: "Unirme", none: "Pronto habrá productos aquí.",
      thanks: "¡Gracias por tu compra!", thanksD: "Tu enlace de descarga aparece en la página de pago y en el correo de Stripe. Si tienes cualquier problema, escríbenos.",
      legal: "Aviso legal", privacy: "Privacidad", terms: "Condiciones", refunds: "Devoluciones",
      disc: "Contenido educativo. No es asesoramiento financiero personalizado. Invertir conlleva riesgo de pérdida."
    },
    en: {
      nav: [["#/", "Home"], ["#/s/free", "Free"], ["#/s/book", "Books"], ["#/s/guide", "Guides"], ["#/s/course", "Courses"], ["#/s/subs", "Subscriptions"]],
      hero: "Learn to invest in the stock market with a method",
      heroSub: "Digital books, illustrated guides and video courses on the stock market. Instant download after payment.",
      cta: "Start free", ctaB: "See books",
      free: "Start free", book: "Digital books", guide: "Guides", course: "Video courses", subs: "Subscriptions",
      freeSub: "Free introductions and prologues to discover the Valmont method.",
      bookSub: "Digital editions in English and Spanish. Prefer paper? Also on Amazon.",
      guideSub: "Step-by-step illustrated guides, in English and Spanish.",
      courseSub: "Video masterclasses (in Spanish; English-subtitled version coming soon).",
      subsSub: "Daily market insight in your inbox and on Telegram.",
      buy: "Buy", get: "Free download", soon: "Coming soon", amazon: "Paperback on Amazon",
      edition: "Edition", only: "Show only", all: "All", esEd: "Spanish", enEd: "English",
      instant: "Instant download · Secure payment with Stripe", back: "← Back",
      nexusT: "Nexus Terminal Pro", nexusTag: "Trading · Market signals and forecasts",
      nexusD: "Predicts the market and sends you trading signals: where to enter and where not to, with daily forecasts across thousands of stocks, cryptocurrencies and forex pairs, plus a public track record.",
      nexusL: ["Trading signals and forecasts for every session", "Daily alerts by email and Telegram", "Pro areas of the site: full scanner and tools", "Public track record so you can check everything"],
      nexusC: "Subscribe to Nexus Pro", nexusP: "Pro plan · €5/month", nexusF: "Also has a free version",
      equityT: "Equity Intrinsic Premium", equityTag: "Investing · Stock predictions and intrinsic value",
      equityD: "Predicts which stocks have room to run and calculates what every company is really worth using official data: three valuation methods, margin of safety and financial health.",
      equityL: ["Stocks below their real value, every day", "Daily email summary in your language", "Telegram channel with new opportunities", "Three valuation methods and 10 years of financials"],
      equityC: "See Equity Intrinsic plans", equityP: "Premium plan · €5/month", equityF: "Also has a free version",
      promoT: "Put what you learn into practice", promoD: "Our books and courses give you the method. Our platforms give you the data every day.",
      join: "Join", none: "Products coming soon.",
      thanks: "Thank you for your purchase!", thanksD: "Your download link is shown on the payment page and in the Stripe email. If anything goes wrong, write to us.",
      legal: "Legal notice", privacy: "Privacy", terms: "Terms", refunds: "Refunds",
      disc: "Educational content. Not personalised financial advice. Investing involves risk of loss."
    }
  };
  var L = "es", CAT = { products: [], links: {} }, ED = "auto";
  try { L = localStorage.getItem("vl_lang") || ((navigator.language || "es").slice(0, 2) === "es" ? "es" : "en"); } catch (e) {}
  if (/[?&]lang=en/.test(location.search)) L = "en";
  function t(k) { return T[L][k]; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function $(id) { return document.getElementById(id); }
  function money(v) { return "$" + (Math.round(v * 100) / 100).toFixed(2).replace(/\.00$/, ""); }

  function card(p) {
    var img = p.images && p.images[0] ? '<img loading="lazy" src="' + esc(p.images[0]) + '" alt="' + esc(p.title) + '">' : '<div class="ph">V</div>';
    var flag = p.kind === "course" ? "ES" : (p.lang || "es").toUpperCase();
    return '<a class="card" href="#/p/' + esc(p.id) + '">' + img + '<span class="flag">' + flag + '</span>' +
      '<h3>' + esc(p.title) + '</h3><div class="price">' + (p.price_usd > 0 ? (p.compare_usd ? '<s>' + money(p.compare_usd) + '</s> ' : '') + money(p.price_usd) : t("get")) + '</div></a>';
  }
  function list(kind) {
    return CAT.products.filter(function (p) {
      if (p.kind !== kind) return false;
      if (kind === "course" || ED === "all") return true;
      var want = ED === "auto" ? L : ED;
      return p.lang === want;
    });
  }
  function section(kind, limit) {
    var items = list(kind); if (limit) items = items.slice(0, limit);
    return '<section class="sec"><div class="sec-h"><h2>' + t(kind) + '</h2><p>' + t(kind + "Sub") + '</p></div>' +
      (items.length ? '<div class="grid">' + items.map(card).join("") + '</div>' : '<p class="muted">' + t("none") + '</p>') + '</section>';
  }
  function edBar() {
    var o = [["auto", (L === "es" ? t("esEd") : t("enEd"))], ["es", t("esEd")], ["en", t("enEd")], ["all", t("all")]];
    return '<div class="edbar">' + t("edition") + ': ' + o.slice(1).map(function (x) {
      var on = (ED === x[0]) || (ED === "auto" && x[0] === L);
      return '<button class="' + (on ? "on" : "") + '" data-ed="' + x[0] + '">' + x[1] + '</button>';
    }).join("") + '</div>';
  }
  var UTM = "utm_source=valmont&utm_medium=web&utm_campaign=";
  function plat(key, full) {
    var l = CAT.links || {};
    var nexus = key === "nexus";
    var base = nexus ? (l.nexus || "https://nexusterminalalerts.com/") : (l.equity || "https://equityintrinsic.com/");
    var href = base + (base.indexOf("?") < 0 ? "?" : "&") + UTM + (full ? "suscripciones" : "promo") + (nexus ? "#pro" : "#planes");
    var logo = nexus ? "https://nexusterminalalerts.com/logo.png" : "https://equityintrinsic.com/logo-completo.png";
    var feats = full ? '<ul class="feat">' + (T[L][key + "L"] || []).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : "";
    return '<a class="sub plat ' + key + '" target="_blank" rel="noopener" href="' + esc(href) + '">' +
      '<div class="plat-h"><img class="plat-logo" src="' + logo + '" alt="' + esc(t(key + "T")) + '" loading="lazy" onerror="this.style.display=\'none\'">' +
      '<div><span class="tag">' + esc(t(key + "Tag")) + '</span><h3>' + esc(t(key + "T")) + '</h3></div></div>' +
      '<p>' + esc(t(key + "D")) + '</p>' + feats +
      '<p class="free-note">' + esc(t(key + "F")) + '</p>' +
      '<div class="plat-f"><span class="pp">' + esc(t(key + "P")) + '</span><span class="btn">' + esc(t(key + "C")) + ' →</span></div></a>';
  }
  function subs() {
    return '<section class="sec"><div class="sec-h"><h2>' + t("subs") + '</h2><p>' + t("subsSub") + '</p></div><div class="subs">' +
      plat("nexus", true) + plat("equity", true) + '</div></section>';
  }
  function promo() {
    return '<section class="promo"><div class="promo-t"><span class="tag">Valmont &amp; Co. · Partners</span><h2>' + t("promoT") + '</h2><p>' + t("promoD") + '</p></div>' +
      '<div class="subs">' + plat("nexus", false) + plat("equity", false) + '</div></section>';
  }
  function home() {
    return '<section class="hero"><h1>' + t("hero") + '</h1><p>' + t("heroSub") + '</p><div><a class="btn" href="#/s/free">' + t("cta") + '</a> <a class="btn ghost" href="#/s/book">' + t("ctaB") + '</a></div></section>' +
      edBar() + section("free", 4) + section("book", 8) + promo() + section("guide", 8) + section("course", 6) + subs();
  }
  function product(id) {
    var p = CAT.products.filter(function (x) { return x.id === id; })[0];
    if (!p) return home();
    var gal = (p.images || []).map(function (s) { return '<img src="' + esc(s) + '" alt="' + esc(p.title) + '">'; }).join("");
    var act;
    if (p.kind === "subscription") {  /* las suscripciones van a su plataforma: Nexus (trading) o Equity (inversión) */
      var k = /nexus|trading|alert|señal|signal|cripto|crypto|forex/i.test(p.title + " " + (p.body || "")) ? "nexus" : "equity";
      return '<a class="back" href="#/s/subs">' + t("back") + '</a><section class="sec"><div class="sec-h"><h2>' + esc(p.title) + '</h2><p>' + t("subsSub") + '</p></div><div class="subs">' + plat(k, true) + '</div></section>';
    }
    if (p.kind === "free" && p.free_url) act = '<a class="btn" target="_blank" rel="noopener" href="' + esc(p.free_url) + '">' + t("get") + '</a>';
    else if (p.pay_url) act = '<a class="btn" href="' + esc(p.pay_url) + '">' + t("buy") + ' · ' + money(p.price_usd) + '</a><p class="muted small">' + t("instant") + '</p>';
    else act = '<span class="btn off">' + t("soon") + '</span>';
    if (p.amazon_url || (CAT.amazon && p.kind === "book")) act += ' <a class="btn ghost" target="_blank" rel="noopener" href="' + esc(p.amazon_url || CAT.amazon) + '">' + t("amazon") + '</a>';
    return '<a class="back" href="#/">' + t("back") + '</a><article class="prod"><div class="gal">' + (gal || '<div class="ph big">V</div>') + '</div><div class="info">' +
      '<span class="flag">' + (p.kind === "course" ? "ES" : (p.lang || "es").toUpperCase()) + '</span><h1>' + esc(p.title) + '</h1>' +
      '<div class="price big">' + (p.price_usd > 0 ? money(p.price_usd) : t("get")) + '</div>' + act +
      '<div class="body">' + (p.body || "") + '</div><p class="muted small">' + t("disc") + '</p></div></article>' + promo();
  }
  function legal(k) {
    var c = 'Valmont &amp; Co. — Community16 LLC · 500 4th St NW, Suite 102 #1327, Albuquerque, NM 87102, USA · community16jalda@gmail.com';
    var txt = {
      es: { legal: "Valmont &amp; Co. es una marca de Community16 LLC (Nuevo México, EE. UU.). " + c,
            privacy: "Solo tratamos los datos necesarios para cobrar y entregar tu compra. Los pagos los procesa Stripe; no guardamos datos de tarjetas. Puedes pedir la eliminación de tus datos escribiendo a community16jalda@gmail.com.",
            terms: "Los productos son contenido digital para uso personal. Queda prohibida su redistribución. El contenido es educativo y no constituye asesoramiento financiero.",
            refunds: "Al ser contenido digital de descarga inmediata, al comprar aceptas que la entrega empiece en el acto. Si el archivo no funciona o no lo recibes, escríbenos en 14 días y lo solucionamos o te devolvemos el dinero." },
      en: { legal: "Valmont &amp; Co. is a brand of Community16 LLC (New Mexico, USA). " + c,
            privacy: "We only process the data needed to charge and deliver your purchase. Payments are processed by Stripe; we never store card data. To request deletion of your data, write to community16jalda@gmail.com.",
            terms: "Products are digital content for personal use. Redistribution is prohibited. Content is educational and not financial advice.",
            refunds: "As instantly downloadable digital content, by buying you agree that delivery starts immediately. If the file doesn't work or you don't receive it, contact us within 14 days and we'll fix it or refund you." }
    };
    return '<a class="back" href="#/">' + t("back") + '</a><article class="legal"><h1>' + t(k) + '</h1><p>' + txt[L][k] + '</p></article>';
  }
  function render() {
    var h = location.hash || "#/", m;
    var html;
    if ((m = h.match(/^#\/p\/(.+)$/))) html = product(decodeURIComponent(m[1]));
    else if ((m = h.match(/^#\/s\/(\w+)$/))) html = m[1] === "subs" ? subs() : edBar() + section(m[1]) + (m[1] === "free" ? "" : promo());
    else if ((m = h.match(/^#\/l\/(\w+)$/))) html = legal(m[1]);
    else if (h === "#/gracias") html = '<section class="hero"><h1>' + t("thanks") + '</h1><p>' + t("thanksD") + '</p></section>';
    else html = home();
    $("app").innerHTML = html;
    $("nav").innerHTML = t("nav").map(function (n) { return '<a href="' + n[0] + '">' + n[1] + '</a>'; }).join("");
    $("foot").innerHTML = '<div>' + ["legal", "privacy", "terms", "refunds"].map(function (k) { return '<a href="#/l/' + k + '">' + t(k) + '</a>'; }).join(" · ") +
      '</div><p>' + t("disc") + '</p><p>© ' + new Date().getFullYear() + ' Valmont &amp; Co. · Community16 LLC</p>';
    document.documentElement.lang = L;
    [].forEach.call(document.querySelectorAll(".lang button"), function (b) { b.className = b.getAttribute("data-l") === L ? "on" : ""; });
    window.scrollTo(0, 0);
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-l]");
    if (b) { L = b.getAttribute("data-l"); ED = "auto"; try { localStorage.setItem("vl_lang", L); } catch (x) {} render(); return; }
    var d = e.target.closest("[data-ed]");
    if (d) { ED = d.getAttribute("data-ed"); render(); }
  });
  window.addEventListener("hashchange", render);
  fetch("data/catalog.json", { cache: "no-cache" }).then(function (r) { return r.json(); })
    .then(function (c) { CAT = c; render(); }).catch(function () { render(); });
})();
