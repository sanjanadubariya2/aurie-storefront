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
| POST   | `/auth/phone/otp`     | `{ sent }`                 |
| POST   | `/auth/phone/verify`  | `{ verified }`             |
| GET    | `/auth/me`            | `{ customer }`             |
| GET    | `/products`           | `{ products }`             |
| GET    | `/collections`        | `{ collections }`          |
| POST   | `/orders`             | `{ order }`                |
| GET    | `/orders`             | `{ orders }`               |
| POST   | `/payments/upi`       | `{ razorpayOrderId, key }` |

`GET /products` should return exactly the shape in `src/data/products.js` — use
that file as the seed script.

## Wiring UPI

`Checkout.jsx` marks the spot. Create the Razorpay order server-side, return its
id, open the Razorpay checkout, then `POST /orders` on success. The Razorpay key
secret stays on the server; only the public key id comes to the browser.

## Admin

Not in this build. It is a separate route group (`/admin`) behind a role check —
order table with status updates, product and price CRUD, and image upload. The
`STATUS_FLOW` array in `src/api/orders.js` is what the admin status dropdown
should be built from so the customer timeline stays in sync.

## Notes

- Product photos in `public/products/` were lifted from the print catalogue.
  Replace them with higher-resolution originals before launch, and add width and
  height attributes if you swap in a CDN.
- Prices live in the data layer only. No component hardcodes a rupee figure.
- Free delivery above ₹999 and the ₹2,000 cash-on-delivery ceiling are in
  `CartContext.jsx` and `PaymentPicker.jsx` respectively.
