# Validation — 8 October 2026

Passed:
- Clean dependency installation with `npm ci`.
- Production `npm run build`, including TypeScript and route generation.
- Missing AI credentials returns 503.
- Unauthenticated AI request returns 401.
- Invalid option selections and malformed JSON return 400.
- Oversized authenticated request returns 413.
- Headless Chromium at a 390×844 mobile viewport: studio renders without horizontal overflow.
- Demo-data guard disables final poster creation.
- Uploading an existing PNG, confirming the occasion and composing a poster works with mocked live Panchang data.
- Generated preview dimensions are exactly 1080×1350.
- Saved artwork is restored from IndexedDB after reloading.
- Poster preview visually inspected using a placeholder uploaded logo as the artwork, not an AI-generated deity image.

Not tested:
- Live OpenAI image generation or live Prokerala requests: credentials were not provided.
- Native sharing on a physical iPhone/Safari device. Existing daily-poster sharing is retained; the new studio uses a dedicated download/share click after preview creation.
- Automatic festival-date detection: deliberately not implemented; occasions require manual verification.

Development browser/test dependencies were used outside the delivered project and are not required by the app.
