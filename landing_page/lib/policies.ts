// The website's own policies: cookies, shipping and returns, and the warranty. The numbers
// that matter (return window, warranty length) are set once here. Have them confirmed before
// launch: they're promises to customers.
import { RETURNS_CONTACT, SUPPORT_CONTACT, type LegalDocument } from "./legal";

export const POLICIES_UPDATED = "3 November 2026";
/** Days after delivery in which an unused bag can be returned. */
export const RETURN_DAYS = 30;
/** Warranty coverage: Unconditional Lifetime Functional Guarantee (All Years, never expires). */
export const WARRANTY_DURATION = "Lifetime (All Years · Never Expires)";
export const WARRANTY_YEARS = "Lifetime";

export const cookiePolicy: LegalDocument = {
  title: "Cookies",
  intro:
    "Amortrav’s website stores only what it needs to work. There are no advertising, analytics or tracking cookies, so there’s nothing to accept or decline.",
  sections: [
    {
      heading: "Cookies we set",
      bullets: [
        "amortrav_access and amortrav_refresh: keep staff signed in to the console. Set only when you sign in, readable only by our server (HttpOnly), and removed when you sign out.",
        "amortrav_mfa: holds a sign-in in progress between your password and your second step, for a few minutes.",
      ],
    },
    {
      heading: "Other storage in your browser",
      bullets: [
        "Checkout: a random key for the order you’re placing, kept in this tab’s session storage, so pressing Pay twice or retrying after a network error never places a second order. It’s gone when you close the tab.",
        "Console: an offline copy of the devices and records you’ve opened, so the console still works on a weak connection, and a service worker that keeps the console’s pages available offline. Signing out clears the copy.",
      ],
    },
    {
      heading: "Other sites",
      paragraphs: [
        "When you pay, you’re on Stripe’s payment page, which sets its own cookies to process the payment and prevent fraud; Stripe’s cookie policy applies there. Maps in the console come from Mapbox, which receives the map area being displayed.",
      ],
    },
    {
      heading: "Your choices",
      paragraphs: [
        "You can clear cookies and site data in your browser settings at any time. The public pages and the shop work without the console cookies; clearing them signs you out of the console.",
      ],
    },
  ],
};

export const shippingPolicy: LegalDocument = {
  title: "Shipping & returns",
  intro: "How your order reaches you, and what to do if a bag isn’t right.",
  sections: [
    {
      heading: "Shipping",
      bullets: [
        "We ship to the countries listed at checkout. Shipping costs and any import duties are shown before you pay.",
        "Your bags are held for you from the moment you start checkout, and packed once payment is confirmed.",
        "When your order leaves us, we email you its tracking. Your order page, linked from your receipt, shows its status at any time.",
      ],
    },
    {
      heading: "When it arrives",
      paragraphs: [
        "Inside the box is the bag’s QR code. Scan it in the Amortrav app to add the bag to your account; until then, nobody can claim it. Keep the packaging until you’ve added the bag.",
      ],
    },
    {
      heading: "Returns",
      bullets: [
        `You can return an unused bag within ${RETURN_DAYS} days of delivery for a full refund of the price you paid.`,
        "If you’ve already added the bag in the app, remove it from your account first (Bag → More → Remove from my bags) so it can be reset.",
        "Return it in its original packaging, with the QR code card. We refund to the payment method you used once it reaches us.",
        "Arrived damaged or not what you ordered? Tell us within 7 days of delivery and we’ll cover the return shipping and send a replacement.",
      ],
    },
    {
      heading: "Start a return",
      paragraphs: [`Email ${RETURNS_CONTACT} with your order number (it starts with AMT-) and we’ll send you a return label and instructions.`],
    },
  ],
};

export const warrantyPolicy: LegalDocument = {
  title: "Unconditional Lifetime Guarantee",
  intro:
    "Every AMORTRAV suitcase is protected by our unconditional Lifetime Functional Guarantee for all years — with no end date and no expiration. Free repairs, certified servicing, and genuine replacement parts are provided free of charge anytime throughout the life of your bag.",
  sections: [
    {
      heading: "What’s covered for all years",
      bullets: [
        "The aerospace shell, Hinomoto 360° Multiwheel® system, telescopic pull handle, perimeter zippers, and TSA locks — covered for life.",
        "The TRACE Smart Core: sensors, battery management, wireless telemetry, and charging hardware.",
        "100% free parts, professional craftsmanship repairs, or full replacement bag if repair is not viable — with zero service fees anytime.",
        "Complimentary prepaid insured courier shipping or immediate drop-off at any of our global boutique ateliers.",
      ],
    },
    {
      heading: "What isn’t",
      bullets: [
        "Purely cosmetic surface patina, scratches, and character scuffs acquired through travels that do not impede mechanical function.",
        "Third-party modifications or repairs attempted outside AMTRAV certified ateliers.",
        "Loss or theft of the bag.",
      ],
    },
    {
      heading: "Your registration",
      paragraphs: [
        "Your lifetime guarantee is active the moment your suitcase is crafted or paired in the AMTRAV app. There are no receipts to keep and no renewal deadlines — your luggage serial number holds your permanent lifetime service record.",
      ],
    },
    {
      heading: "Requesting free service anytime",
      paragraphs: [
        `Submit a repair request anytime via our Repair Request Portal (/services/repairs), visit any AMTRAV Boutique Atelier worldwide, or email ${SUPPORT_CONTACT} with your bag's serial number. Our certified technicians will handle everything with white-glove priority.`,
        "This lifetime guarantee is in addition to your statutory consumer rights, which remain fully protected.",
      ],
    },
  ],
};
