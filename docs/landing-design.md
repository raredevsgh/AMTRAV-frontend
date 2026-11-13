# Landing-page discovery refresh

The first visit now presents the luggage alongside the headline, with an immediate
route to the range and a secondary action to watch the product film. The example
journey sits below the film so its status never covers the luggage.

Three compact links help visitors choose a bag, understand its features, or follow
a journey. The range follows immediately, using four manually selected tabs to
show the luggage, finish, dimensions, and included Smart Core. The Shop action
opens the existing localized catalog; no prices or availability are assumed.

The existing Clerk-inspired visual language is retained: neutral surfaces, blue
accents, fine borders, compact controls, restrained motion, and generous spacing.
New copy is provided in all six site languages. The product selector supports
keyboard navigation, light/dark themes, and the existing reduced-motion and pause
controls.

## References

- [Clerk](https://clerk.com/): restrained interface framing and clear action hierarchy.
- [Tumi revamp by Elux Design on Dribbble](https://dribbble.com/shots/24879376-Tumi-Revamp-Ecommerce-Landing-Page):
  prominent product presentation, curated collections, and concise product details.
- [VOYAGE by Arlo on Dribbble](https://dribbble.com/shots/27742936-VOYAGE-Luxury-Travel-Luggage-Landing-Page):
  editorial travel positioning. Its project description was reviewed.

The Tumi reference artwork was inspected for layout inspiration; no third-party
artwork, testimonials, customer numbers, or certification claims were copied into
the app. Mobbin's gallery could not be accessed during research.

## Implementation

- `components/marketing/trace-landing.tsx`: hero and page order.
- `components/marketing/landing-discovery.tsx`: discovery links and product selector.
- `app/marketing-polish.css`: responsive hero presentation.
- `app/landing-discovery.css`: prefixed styles for the new components.
- `lib/i18n/discovery.ts`: typed copy for all six locales.

The project's custom Turbopack CSS loader did not export CSS Module class names
in the local build. The new components therefore use prefixed global classes,
consistent with the site's existing stylesheets.

## Verification

TypeScript, targeted ESLint, and formatting checks passed. Browser checks covered
all four selections, arrow/End keyboard navigation, localized Shop destinations,
film dismissal and focus restoration, and all six locales at 375px. The hero and
new discovery sections had no automated WCAG A/AA violations in the light/dark
axe checks. Automated checks are not a complete accessibility certification.

These are repository changes; no production deployment was performed.
