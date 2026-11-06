# Aurie — storefront

React + Vite + Tailwind front end for the Aurie candle shop. Runs fully on mock
data, so every screen is clickable before a single endpoint exists.

```bash
npm install
npm run dev        # http://localhost:5173
```

## Demo mode

With `VITE_API_URL` unset, the app serves the catalogue from
`src/data/products.js` and fakes auth, orders and payment. Any six-digit OTP is
accepted; `000000` fails so you can see the error state. Orders persist in
`localStorage` so the tracking page has something to show.

Copy `.env.example` to `.env` and set `VITE_API_URL` to switch every call to the
real backend. Nothing else changes.

## Structure

```
src/
├── api/          One module per backend area. Each exports the same function
│                 whether it hits the server or the mock, so components never
│                 branch on it.
│   ├── client.js     fetch wrapper, JWT header, ApiError
│   ├── auth.js       email + phone OTP
│   ├── catalog.js    products, collections
│   └── orders.js     place, list, status flow
├── context/      CartContext, AuthContext, ToastContext
├── components/
│   ├── ui/       Button, Field, OtpInput, Modal, Drawer, Stepper, Toaster…
│   ├── layout/   Header, Footer, Layout
│   ├── home/     Hero, CollectionRail, SecretGlowFeature, HowItWorks
│   ├── product/  ProductCard, TierPicker, QuickView, FilterBar
│   ├── cart/     CartDrawer, CartLine
│   ├── auth/     AuthModal
│   ├── checkout/ AddressForm, PhoneVerify, PaymentPicker, OrderSummary
│   └── orders/   OrderTimeline
├── pages/        Home, Shop, Checkout, Orders, NotFound
├── hooks/        useReveal, useLockBodyScroll, useEscape
└── lib/          format (₹, dates), validate, storage
```

## Endpoints the backend needs

Contracts are written at the top of each file in `src/api/`.

| Method | Path                  | Returns                    |
| ------ | --------------------- | -------------------------- |
| POST   | `/auth/email/otp`     | `{ sent }`                 |
| POST   | `/auth/email/verify`  | `{ token, customer }`      |
| GET    | `/auth/me`            | `{ customer }`             |
| GET    | `/products`           | `{ products }`             |
| GET    | `/collections`        | `{ collections }`          |
| POST   | `/orders`             | `{ order }` — cash on delivery only |
| GET    | `/orders`             | `{ orders }` (unpaid UPI attempts excluded) |
| POST   | `/payments/order`     | `{ razorpayOrderId, amount, currency, keyId, orderId }` |
| POST   | `/payments/verify`    | `{ order }`                |

`GET /products` should return exactly the shape in `src/data/products.js` — use
that file as the seed script.

## Checkout

Two steps: delivery address, then payment. Sign-in is by email code only.
Phone verification is switched off until an SMS/WhatsApp provider is set up —
`components/checkout/PhoneVerify.jsx` and the API's `/auth/phone/*` routes are
kept for that day.

UPI: `POST /payments/order` creates the order as `awaiting_payment` plus a
Razorpay order, the Razorpay popup takes the money, and `POST /payments/verify`
(or Razorpay's webhook) moves it to `placed`. The cart is re-checked against the
live catalogue when checkout opens, so stale prices or removed products never
reach the server.

## Admin

A separate app: `../aurie-admin`. Keep `STATUS_FLOW` here identical to the one
in `aurie-admin/src/api/endpoints.js` and `aurie-api/src/models/Order.js`.

## Pages

`/` home · `/shop` (filters, search and sort live in the URL) · `/p/:slug` product
page · `/checkout` · `/orders` · `/policies/{shipping,refunds,privacy,terms,contact}`.
Business details for the policies and footer live in `src/content/business.js`
— fill in the registered address before launch.

## Sessions

The API sets an httpOnly `aurie_session` cookie on sign-in; `src/api/client.js`
sends `credentials: 'include'` and never sees a token. In production the API
must be on the same site as the shop (`api.aurie.website`), or browsers will
drop the cookie.

## Deploying on Vercel

`vercel.json` rewrites every path to `index.html`, so links like `/shop?c=secret`
and refreshing on `/orders` work instead of returning Vercel's 404. Set
`VITE_API_URL` in the Vercel project and redeploy — it is baked in at build time.

Two serverless functions live in `api/`:
- `api/share.js` — link-preview HTML (title, photo, price) for WhatsApp,
  Instagram and other crawlers that do not run JavaScript. `vercel.json` sends
  only those user agents to it for `/p/:slug`.
- `api/sitemap.js` — `/sitemap.xml`, built from the live catalogue.

Both read `API_URL` (or `VITE_API_URL`) from the Vercel project's environment.

## Notes

- Product photos in `public/products/` were lifted from the print catalogue.
  Replace them with higher-resolution originals before launch, and add width and
  height attributes if you swap in a CDN.
- Prices live in the data layer only. No component hardcodes a rupee figure.
- Free delivery from ₹999 and the ₹2,000 cash-on-delivery ceiling are constants
  at the top of `CartContext.jsx`. The API has the same numbers in
  `lib/createOrder.js` and its total is the one charged — change both together.
