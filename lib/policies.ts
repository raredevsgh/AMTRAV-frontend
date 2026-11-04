// The website's own policies: cookies, shipping and returns, and the warranty. The numbers
// that matter (return window, warranty length) are set once here. Have them confirmed before
// launch: they're promises to customers.
import { SUPPORT_CONTACT, type LegalDocument } from "./legal";

export const POLICIES_UPDATED = "3 November 2026";
/** Days after delivery in which an unused bag can be returned. */
export const RETURN_DAYS = 30;
/** Years the shell, wheels, handle and Smart Core are covered against defects. */
export const WARRANTY_YEARS = 2;

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
      paragraphs: [`Email ${SUPPORT_CONTACT} with your order number (it starts with AMT-) and we’ll send you a return label and instructions.`],
    },
  ],
};

export const warrantyPolicy: LegalDocument = {
  title: "Warranty",
  intro: `Every Amortrav bag is covered against defects in materials and workmanship for ${WARRANTY_YEARS} years from the day you add it to your account.`,
  sections: [
    {
      heading: "What’s covered",
      bullets: [
        "The shell, wheels, handles, zips and locks.",
        "The Smart Core: its sensors, battery, radios and charging.",
        "Repairs or a replacement part, or a replacement bag if a repair isn’t possible, at no cost to you.",
      ],
    },
    {
      heading: "What isn’t",
      bullets: [
        "Normal wear: scuffs, scratches and dents from travel.",
        "Damage from accidents, misuse, or repairs and changes not made by Amortrav.",
        "Battery capacity that falls gradually with age, as every battery’s does.",
        "Loss or theft of the bag.",
      ],
    },
    {
      heading: "Your registration",
      paragraphs: [
        "There’s nothing to fill in: adding the bag in the app registers its warranty to your account, with its serial number. You can see it under Account → Support and warranty.",
      ],
    },
    {
      heading: "Making a claim",
      paragraphs: [
        `Open the app and go to Account → Support and warranty, then choose the bag; the email it opens already includes its serial and model. Or write to ${SUPPORT_CONTACT} with the serial number and what happened. We may ask for photos, and we’ll arrange collection if the bag needs to come back to us.`,
        "This warranty is in addition to your rights under consumer law, which it doesn’t limit.",
      ],
    },
  ],
};
