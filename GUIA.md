# Valmont & Co. — Guía de la academia automática

## Qué hace sola (cada 3 horas)
1. Copia de valmontco.com (Shopify) todos los libros, guías y cursos, con sus fotos.
2. Crea en Stripe el botón de compra de cada producto que ya tenga su archivo.
3. Te avisa por Telegram de cada venta.
4. Actualiza la web, una página por producto para Google y el mapa del sitio.
5. El vigilante revisa fotos, precios y archivos que faltan.

## Las claves (GitHub → Settings → Secrets and variables → Actions)
| Nombre | Qué es |
|---|---|
| `STRIPE_SECRET_KEY` | La clave secreta de Stripe (la misma de tus otras tiendas) |
| `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID` | Tu bot de avisos |
| `VALMONT_DOWNLOADS` | La lista de enlaces de descarga de cada producto (la prepara Claude) |

## Cómo se entrega cada libro
El cliente paga con Stripe y en la misma página le sale su botón de descarga. Además le llega el recibo por correo.
Un producto **solo se puede comprar si ya tiene su archivo**, así nadie paga sin recibirlo.

## Cambiar algo de un producto
En `data/config.json`, dentro de `"products"`, por el nombre del producto:
- `"hidden": true` → lo oculta
- `"lang": "es"` o `"en"` → corrige el idioma
- `"amazon_url": "https://..."` → botón para comprarlo en papel en Amazon
