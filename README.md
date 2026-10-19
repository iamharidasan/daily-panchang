# Daily Panchang + Festival Poster Studio

## Run

Requires Node.js 22.13 or newer.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Set `PROKERALA_CLIENT_ID` and `PROKERALA_CLIENT_SECRET` for live Panchang data.
Set `OPENAI_API_KEY`, `OPENAI_IMAGE_MODEL` (default `gpt-image-2.5-flare`) and a long random `POSTER_ADMIN_TOKEN` for AI artwork. These variables are server-only. Enter the poster admin token in the studio's password field; it is not persisted. API usage is billed to your OpenAI account. Model availability depends on account access. Upload mode requires no OpenAI key.

## Create a poster

1. Fetch Panchang data for the desired date and location using the original panel.
2. Open Festival poster studio below the panel.
3. Select an occasion, deity and artwork style. Occasion/deity mappings are editable in `lib/poster-options.ts`.
4. Generate artwork or upload PNG/JPEG/WebP (up to 8 MB). Review deity attributes before sharing.
5. Edit the title and footer. The default footer is the Cuddalore VHP name.
6. Verify the observance for the selected date/location and tick confirmation.
7. Create the 1080×1350 poster preview, review it, and download/share.

The original 1080×1920 daily poster is retained. The compact festival poster includes up to four auspicious periods; if more are supplied, use the complete daily poster. It never silently truncates periods. Uploaded artwork is contained without cropping.

## Date accuracy and scope

Occasions are selected manually, not calculated automatically. The current Panchang endpoint supplies no festival calendar. Before adding automatic festival discovery, integrate a verified regional observance calendar with explicit sunrise/tithi and location rules. The model only creates artwork; it does not calculate dates, timings or Tamil text. Only live Panchang responses can be used for final festival posters. The current upstream integration uses India's +05:30 offset; other timezone support requires an explicit timezone input.

Artwork is saved in IndexedDB in the same browser by occasion/deity/style. It survives reloads but does not sync across devices; clearing browser storage removes it. Use Save artwork for a backup. A new generation replaces the saved artwork for that selection. Generated artwork has no text; Canvas adds text and the original logo. PNG previews are not persisted.

## Deployment

```sh
npm run build
npm start
```

Configure the environment variables in your host. The image endpoint allows 180 seconds and aborts its upstream call after 165 seconds. Your hosting plan must support this duration; on hosts with shorter limits, move generation to a background job. Protect the admin token, use HTTPS, and configure API project spend limits. Token authentication protects the paid endpoint, but it is not a multi-user login system or distributed rate limiter.

No new runtime dependencies, database, Redis or cloud storage were added. The existing iPhone download path is preserved; the new poster uses a separate preview step so native sharing occurs from a fresh button tap.

## Validation

See `VALIDATION.md` for checks performed and limitations. Live paid image generation requires your API credentials and is not exercised by source-only validation.

Tamil font files are bundled locally under `public/fonts`, with their OFL license. The festival renderer explicitly loads the Tamil font before drawing text.
