import { BUSINESS } from './business.js'

const inr = (n) => `₹${Number(n).toLocaleString('en-IN')}`

/**
 * Policy pages. Razorpay checks that these exist (and match how the shop
 * actually works) before activating live payments.
 *
 * ⚠ These are a sensible draft for a made-to-order Indian D2C shop, not legal
 * advice. Read them once, change anything that is not how you operate, and
 * fill in BUSINESS.address / legalName / gstin in business.js.
 */

const Contact = () => (
  <>
    email <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> or WhatsApp{' '}
    <a href={`https://wa.me/${BUSINESS.whatsapp}`}>{BUSINESS.whatsappDisplay}</a>
  </>
)

export const POLICIES = {
  shipping: {
    title: 'Shipping policy',
    summary: 'Poured to order, shipped across India in about 7 days.',
    sections: [
      {
        h: 'Lead time',
        body: (
          <>
            <p>
              Nothing is pre-made. We pour your candles after you order, let them cure for about 48 hours so the scent
              holds, then pack and ship. Most orders leave our Mumbai studio within 4 working days and arrive within 7
              days of ordering. Custom (Secret Glow and Luxe) orders follow the date agreed with you.
            </p>
            <p>The expected date shown at checkout and in your order page is an estimate, not a guarantee.</p>
          </>
        ),
      },
      {
        h: 'Where we deliver',
        body: <p>Anywhere in India served by our courier partners. We do not ship internationally yet.</p>,
      },
      {
        h: 'Delivery charges',
        // A function: the numbers come from the API's live settings, never typed twice.
        body: (s) => (
          <p>
            Delivery is free on orders of {inr(s.freeShippingFrom)} and above. Below that a flat {inr(s.shippingFee)} is
            added, shown before you pay. Cash on delivery is available on orders up to {inr(s.codLimit)}.
          </p>
        ),
      },
      {
        h: 'Tracking',
        body: (
          <p>
            The day your order ships we email the courier name and tracking number, and it appears on your Orders page.
          </p>
        ),
      },
      {
        h: 'Wax and heat',
        body: (
          <p>
            Wax softens above about 45°C. In peak summer we may hold an order for a day or two rather than send it
            through the hottest part of the route — we will tell you if we do.
          </p>
        ),
      },
    ],
  },

  refunds: {
    title: 'Refunds and cancellations',
    summary: 'Cancel free until we start pouring. Damaged in transit? We replace it.',
    sections: [
      {
        h: 'Cancelling an order',
        body: (
          <p>
            You can cancel for a full refund until we start pouring — while the order shows "Order placed". Contact us
            (<Contact />) with your order number. Once pouring has started the candles are being made for you and the
            order can no longer be cancelled. Custom and personalised orders cannot be cancelled once the design is
            confirmed.
          </p>
        ),
      },
      {
        h: 'Damaged or wrong items',
        body: (
          <p>
            Candles are fragile and hand-made. If something arrives broken or is not what you ordered, send us an
            unboxing photo or video within 48 hours of delivery and we will replace it at no cost, or refund it if a
            replacement is not possible.
          </p>
        ),
      },
      {
        h: 'What is not a defect',
        body: (
          <p>
            Small differences in colour, swirl and texture between candles — and from photos — are part of hand-pouring.
            Frosting (a white bloom on soy wax) is natural and does not affect burning.
          </p>
        ),
      },
      {
        h: 'Returns',
        body: <p>Because every candle is made to order, we do not accept returns of undamaged items for a change of mind.</p>,
      },
      {
        h: 'How refunds are paid',
        body: (
          <p>
            Approved refunds on UPI payments go back to the same UPI account within 5–7 working days. Refunds on cash on
            delivery orders are paid by UPI or bank transfer to an account you give us.
          </p>
        ),
      },
    ],
  },

  privacy: {
    title: 'Privacy policy',
    summary: 'What we collect to make and deliver your order, and nothing more.',
    sections: [
      {
        h: 'What we collect',
        body: (
          <ul>
            <li>Your email address, to sign you in and send order updates.</li>
            <li>Delivery name, phone number and address, to ship your order.</li>
            <li>Order details, including any colour, scent or message requests.</li>
            <li>Payment status from Razorpay. We never see or store your UPI PIN, card or bank details.</li>
          </ul>
        ),
      },
      {
        h: 'Who we share it with',
        body: (
          <p>
            Only the services needed to run the shop: Razorpay (payments), our courier partners (delivery), our email
            provider (order emails) and our hosting and database providers. We do not sell your data or share it for
            advertising.
          </p>
        ),
      },
      {
        h: 'Cookies',
        body: (
          <p>
            We use one essential cookie to keep you signed in, and your browser's local storage to remember your cart.
            We do not use advertising or tracking cookies.
          </p>
        ),
      },
      {
        h: 'How long we keep it',
        body: <p>Order records are kept for as long as Indian tax law requires (currently 8 years). Sign-in codes expire after 10 minutes.</p>,
      },
      {
        h: 'Your choices',
        body: (
          <p>
            You can ask to see, correct or delete your personal data at any time — <Contact />. Deleting your account
            does not delete order records we must keep for tax purposes.
          </p>
        ),
      },
    ],
  },

  terms: {
    title: 'Terms of use',
    summary: 'The short version: hand-made products, prices in rupees, Indian law.',
    sections: [
      {
        h: 'Who we are',
        body: (
          <p>
            This site is run by {BUSINESS.legalName}, {BUSINESS.address}
            {BUSINESS.gstin ? ` (GSTIN ${BUSINESS.gstin})` : ''}. By placing an order you agree to these terms and to
            our shipping, refund and privacy policies.
          </p>
        ),
      },
      {
        h: 'Products and prices',
        body: (
          <p>
            All prices are in Indian rupees and include applicable taxes. The price charged is the one shown at checkout.
            We may correct obvious pricing errors before an order is confirmed and will tell you if we do. Photos show
            the design; each hand-poured piece varies slightly.
          </p>
        ),
      },
      {
        h: 'Orders',
        body: (
          <p>
            An order is confirmed once payment succeeds (UPI) or once it is placed (cash on delivery). We may decline or
            cancel an order — for example a suspected fraudulent or repeated undelivered COD order — and will refund any
            payment in full.
          </p>
        ),
      },
      {
        h: 'Candle safety',
        body: (
          <p>
            Candles are open flames. Never leave one burning unattended, keep it away from anything flammable and out of
            reach of children and pets, and follow the care notes on each product page. We are not liable for damage
            caused by unsafe use.
          </p>
        ),
      },
      {
        h: 'Custom messages',
        body: (
          <p>
            You are responsible for the wording you ask us to set into a Secret Glow candle. We may refuse wording that
            is offensive or infringes someone else's rights.
          </p>
        ),
      },
      {
        h: 'Law',
        body: <p>These terms are governed by the laws of India, with courts in Mumbai having jurisdiction.</p>,
      },
    ],
  },

  contact: {
    title: 'Contact us',
    summary: 'A person reads every message.',
    sections: [
      {
        h: 'Reach us',
        body: (
          <ul>
            <li>
              WhatsApp: <a href={`https://wa.me/${BUSINESS.whatsapp}`}>{BUSINESS.whatsappDisplay}</a> (fastest)
            </li>
            <li>
              Email: <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
            </li>
            <li>
              Instagram: <a href={`https://instagram.com/${BUSINESS.instagram}`}>@{BUSINESS.instagram}</a>
            </li>
            <li>Hours: {BUSINESS.hours}</li>
          </ul>
        ),
      },
      {
        h: 'Business details',
        body: (
          <p>
            {BUSINESS.legalName}
            <br />
            {BUSINESS.address}
            {BUSINESS.gstin && (
              <>
                <br />
                GSTIN {BUSINESS.gstin}
              </>
            )}
          </p>
        ),
      },
      {
        h: 'Wholesale and events',
        body: <p>Return gifts, wedding favours and reselling are welcome — rates differ from this site. Message us on WhatsApp.</p>,
      },
    ],
  },
}

export const POLICY_LINKS = [
  ['shipping', 'Shipping'],
  ['refunds', 'Refunds & cancellations'],
  ['privacy', 'Privacy'],
  ['terms', 'Terms'],
  ['contact', 'Contact'],
]
