# Amortrav email logo

The BIMI asset is [`public/brand/amortrav-bimi.svg`](../public/brand/amortrav-bimi.svg).
It preserves the original vector artwork and gradients from
`axum-backend/src/brand/assets/amortrav-icon-v1.svg`, centered on an opaque white
512 × 512 canvas with room for circular inbox crops. It uses SVG Tiny P/S 1.2,
includes a company title and description, and has no fonts, embedded bitmaps,
scripts, animation, or external resources. Its size is 4,423 bytes.

The file passed the BIMI Group's `SVG_PS-latest.rnc.txt` Relax NG schema
validation and was rendered for visual inspection. This validates the asset,
not the domain's BIMI deployment or certificate eligibility.

## Publish

1. Deploy the web app. The file is served at `/brand/amortrav-bimi.svg` without
   authentication or locale redirection. If the app is hosted at `amortrav.com`,
   its URL will be `https://amortrav.com/brand/amortrav-bimi.svg`.
2. Verify the public URL returns the SVG over HTTPS with status 200 and
   `Content-Type: image/svg+xml`.
3. Check the sending domain's SPF, DKIM, and enforced DMARC configuration against
   the mailbox provider's requirements. Do not change DMARC enforcement until
   legitimate sending services have been accounted for.
4. Obtain a VMC or CMC if required by the receiving mailbox provider. The
   certificate must cover this logo; the SVG alone does not establish eligibility.
5. Publish a TXT record at `default._bimi` on the sending domain. For a
   self-asserted record, if the URL above is the actual public location:

   ```text
   v=BIMI1; l=https://amortrav.com/brand/amortrav-bimi.svg;
   ```

   With a certificate, append `a=` with its real HTTPS PEM URL:

   ```text
   v=BIMI1; l=https://amortrav.com/brand/amortrav-bimi.svg; a=https://YOUR-CERTIFICATE-HOST/YOUR-CERTIFICATE.pem;
   ```

   Replace the placeholder before publishing. Self-asserted records have limited
   provider support. BIMI is a domain-level email identity feature, not a profile
   picture upload; the receiving provider decides whether the logo is displayed.

## Status (2026-11-13)

- The logo is live at `https://amortrav.com/brand/amortrav-bimi.svg` (200,
  `image/svg+xml`).
- `default._bimi.amortrav.com` holds the self-asserted record
  `v=BIMI1; l=https://amortrav.com/brand/amortrav-bimi.svg; a=;`.
- DMARC is `p=none` while reports are collected. BIMI needs `p=quarantine` or
  `p=reject`, so no provider shows the logo yet. Gmail and Apple Mail also need a
  VMC or CMC (step 4).

References: [SVG requirements](https://bimigroup.org/creating-bimi-svg-logo-files/),
[implementation guide](https://bimigroup.org/implementation-guide/), and
[schema validation](https://bimigroup.org/using-the-rnc-schema-to-validate-bimi-svg-images/).
