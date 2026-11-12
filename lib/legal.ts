// The Privacy Policy and Terms of Use, as published on the website. The app shows the same
// text (mobile-app/src/lib/legal.ts); this copy adds what only the website does: shop orders,
// payment through Stripe, and the browser storage listed on the Cookies page. Change both
// together, and have counsel review before release.

export const LEGAL_UPDATED = "25 October 2026";
/** Data requests and privacy questions. */
export const PRIVACY_CONTACT = "compliance@amortrav.com";
/** Where Support and warranty sends travellers. */
export const SUPPORT_CONTACT = "complaints@amortrav.com";
/** Returns and order questions, handled by the team that ships orders. */
export const RETURNS_CONTACT = "inventory@amortrav.com";

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalDocument {
  title: string;
  intro: string;
  sections: LegalSection[];
}

export const privacyPolicy: LegalDocument = {
  title: "Privacy Policy",
  intro:
    "This policy explains what Amortrav collects when you use the Amortrav app and smart-luggage trackers, why, who it is shared with, and the choices you have. We collect only what the service needs, we don’t sell your data and we don’t show ads.",
  sections: [
    {
      heading: "What we collect",
      bullets: [
        "Account: when you sign in with Google, your email address, name, profile photo and Google account identifier. When you create an account with your email, your email address, first and last name, the username you choose and your password (stored only as a one-way hash), plus when you accepted these terms and confirmed you are 18 or older. We don’t ask for your date of birth.",
        "Profile photo (optional): a photo you choose or take. The app shrinks it on your phone and we remove its metadata, including any location where it was taken, before storing it. Only you and authorised Amortrav staff can see it.",
        "Preferences: your appearance, units, map, alert and haptics settings, so your other devices follow them.",
        "Security: whether two-step verification is on, your authenticator secret (encrypted), recovery codes (stored only as one-way hashes), your active sign-in sessions (device type and time) and a log of security events such as sign-ins.",
        "Your bags: the serial numbers of bags you add, the names you give them, and the positions their trackers report (location, accuracy and time), together with the movement timeline derived from those positions.",
        "Your location (optional): with your permission, while the app is open, to show you on the map, measure how far your bags are and recognise when you’re at an airport.",
        "Camera (optional): used only to read the QR code on your bag’s packaging. Images never leave your phone.",
        "Shop orders: when you buy from our website, your email address, the bags you ordered, the shipping name, address and phone number you give the payment page, and the order’s payment status. Card details go straight to Stripe; we never see or store them.",
      ],
    },
    {
      heading: "How we use it",
      bullets: [
        "To sign you in, keep your account secure and let you see and manage your bags.",
        "To show where your bags were last seen and what has happened to them, including live updates.",
        "To show live aircraft around the airport you’re at. Your position is sent to us only to find the nearest airport; it isn’t stored.",
        "To send essential account emails: the code that confirms your email address, password reset codes and a notice when your password changes, a welcome message and a note when a bag is added to your account.",
        "So that a small number of authorised Amortrav staff can help you and keep the service safe: they can see your account details, bags, their latest positions and recent activity when needed for support, security or legal reasons. Each time they open an account it is recorded.",
      ],
      paragraphs: [
        "We don’t use your data for advertising, we don’t track you across other apps or websites, and we don’t sell or rent personal data.",
      ],
    },
    {
      heading: "Who we share it with",
      paragraphs: ["Only the service providers needed to run Amortrav, each limited to what it needs:"],
      bullets: [
        "Google, to sign you in.",
        "Cloudflare, which carries traffic between the app and our servers.",
        "Mapbox, which supplies map images; it sees the map area being displayed and your network address.",
        "OpenSky Network, which supplies live aircraft data; it sees only the area around an airport, never your identity or position.",
        "Our email provider (Resend), to deliver account and order emails.",
        "Stripe, which takes payment for shop orders and sees what you enter on its payment page.",
        "The carrier that delivers your order, which receives the shipping name, address and phone number.",
      ],
    },
    {
      heading: "On your phone",
      paragraphs: [
        "Your sign-in is kept in the iOS Keychain. To work without a connection, the app keeps a copy of your bags and their latest positions in its private storage. Signing out, or the session ending, deletes that copy.",
      ],
    },
    {
      heading: "On this website",
      paragraphs: [
        "The website uses only the storage it needs to work: sign-in cookies for the console, and a key that stops a checkout being placed twice. It sets no advertising or analytics cookies. Our Cookies page lists each one.",
      ],
    },
    {
      heading: "How long we keep it",
      paragraphs: [
        "We keep your account data while your account exists. When you delete your account, we erase your profile (name, username, uploaded photo, preferences and agreements), Google link, password, two-step verification settings and recovery codes, and the location history and timeline of your bags; your bags are released so they can be set up again. A minimal security record of past actions is kept without your personal details.",
      ],
    },
    {
      heading: "Your choices and rights",
      bullets: [
        "Delete your account at any time in the app: Account → Delete account.",
        "Turn location or camera access on or off in iOS Settings → Amortrav.",
        "Sign out of every device from Account.",
        `Ask for a copy of your data, a correction or deletion by writing to ${PRIVACY_CONTACT}. Depending on where you live, you may also have the right to object to or restrict processing and to complain to your data protection authority.`,
      ],
    },
    {
      heading: "Security",
      paragraphs: [
        "Data is encrypted in transit, sign-in tokens are short-lived, authenticator secrets are encrypted at rest and you can add two-step verification. No system is perfectly secure, so please keep your Google account and phone protected.",
      ],
    },
    {
      heading: "Children",
      paragraphs: [
        "Amortrav accounts are for adults: you must be 18 or older to create one. We don’t knowingly collect data from anyone younger; if you believe a child has an account, write to us and we’ll delete it.",
      ],
    },
    {
      heading: "Changes and contact",
      paragraphs: [
        "If we change this policy we’ll update the date above and, for significant changes, tell you in the app.",
        `Questions or requests: ${PRIVACY_CONTACT}.`,
      ],
    },
  ],
};

export const termsOfUse: LegalDocument = {
  title: "Terms of Use",
  intro:
    "These terms are an agreement between you and Amortrav for the Amortrav app and service. By creating an account or using the app you accept them.",
  sections: [
    {
      heading: "The service",
      paragraphs: [
        "Amortrav shows the last reported position and activity of bags fitted with Amortrav trackers that you have added to your account, and live aircraft near airports. Positions depend on the tracker, its battery and network coverage: they can be approximate, delayed or unavailable. Don’t rely on Amortrav for safety-critical or emergency purposes.",
      ],
    },
    {
      heading: "Your account",
      bullets: [
        "You must be 18 or older to create an account, and the details you give us, including your name, must be accurate.",
        "You sign in with your Google account or your email and password, and must keep them, and your phone, secure.",
        "Usernames must not impersonate anyone, including Amortrav, or be offensive. We may change or remove a username that breaks this rule.",
        "You’re responsible for activity on your account. Tell us at once if you think it has been misused, and use “Sign out everywhere” in Account.",
        "We recommend turning on two-step verification.",
      ],
    },
    {
      heading: "Adding bags",
      paragraphs: [
        "Only add bags you own or are entitled to track, using the code that came with them. Each code works once. Don’t use Amortrav to track people, or anyone else’s property without their permission.",
      ],
    },
    {
      heading: "Buying from our shop",
      paragraphs: [
        "When you order on our website, your order is confirmed once payment is taken, and we email you a receipt. We hold the bags in your order for 30 minutes while you pay. Prices include the taxes shown at checkout; shipping and any import duties are shown before you pay. Returns and the warranty are described on their own pages, and don’t limit any rights you have under the law where you live.",
      ],
    },
    {
      heading: "Acceptable use",
      bullets: [
        "Don’t interfere with, overload or try to gain unauthorised access to the service or other accounts.",
        "Don’t reverse engineer the app except where the law allows it.",
        "Don’t use the service unlawfully or to harm others.",
      ],
    },
    {
      heading: "Third-party services",
      paragraphs: [
        "Sign-in is provided by Google, maps by Mapbox and aircraft data by the OpenSky Network. Their availability and terms are outside our control. Aircraft data is shown as received and may be incomplete.",
      ],
    },
    {
      heading: "Ending",
      paragraphs: [
        "You can stop using Amortrav and delete your account at any time in the app. We may suspend or close accounts that break these terms or put the service or others at risk, and we may change or discontinue features with reasonable notice where practical.",
      ],
    },
    {
      heading: "Disclaimers and liability",
      paragraphs: [
        "The service is provided “as is” and “as available”. To the extent the law allows, we are not liable for indirect or consequential loss, or for loss arising from inaccurate, delayed or missing location data, including lost or delayed luggage. Nothing in these terms limits rights you have under consumer law that can’t be excluded.",
      ],
    },
    {
      heading: "Apple",
      paragraphs: [
        "These terms are between you and Amortrav, not Apple. Apple has no obligation to provide support for the app, and is not responsible for any claims relating to it. Apple and its subsidiaries are third-party beneficiaries of these terms and may enforce them.",
      ],
    },
    {
      heading: "Changes and contact",
      paragraphs: [
        "We may update these terms; the date above shows the latest version and continued use means you accept it. For significant changes we’ll tell you in the app.",
        `Questions: ${PRIVACY_CONTACT}.`,
      ],
    },
  ],
};
