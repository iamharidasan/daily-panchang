# Tamil Panchangam

A lightweight Tamil and English Panchangam app built with Next.js and the Prokerala Advanced Panchang API.

## Features

- Date and Tamil Nadu city selection
- Current-location coordinates
- Tamil and English interface
- Start and end times for every Tithi, Nakshatra, Yoga, and Karana returned by the API
- All auspicious and inauspicious periods, including multiple intervals under one category
- Cuddalore VHP logo in the downloadable poster
- Mobile-friendly fixed 1080 × 1920 (9:16) downloadable PNG
- Sample-data mode when API credentials are absent

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Add your Prokerala credentials to `.env.local`:

```env
PROKERALA_CLIENT_ID=your_client_id
PROKERALA_CLIENT_SECRET=your_client_secret
```

The credentials are read only by the server API route.

## Commands

- `npm run dev` — start development
- `npm run build` — create a production build
- `npm start` — run the production Next.js server
