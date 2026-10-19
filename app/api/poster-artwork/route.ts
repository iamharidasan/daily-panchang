import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { deities, occasions, styles } from '@/lib/poster-options';
export const runtime = 'nodejs';
export const maxDuration = 180;

export async function POST(request: NextRequest) {
  const key = process.env.OPENAI_API_KEY;
  const secret = process.env.POSTER_ADMIN_TOKEN;
  if (!key || !secret) return NextResponse.json({ message: 'Set OPENAI_API_KEY and POSTER_ADMIN_TOKEN on the server to enable AI artwork. Uploaded images work without these keys.' }, { status: 503 });
  const supplied = request.headers.get('authorization')?.replace(/^Bearer /, '') ?? '';
  const a = Buffer.from(supplied), b = Buffer.from(secret);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return NextResponse.json({ message: 'Incorrect poster access code.' }, { status: 401 });
  try {
    const raw = await request.text();
    if (raw.length > 2048) return NextResponse.json({ message: 'Request too large.' }, { status: 413 });
    const body = JSON.parse(raw);
    const deity = deities.find(d => d.id === body.deity);
    const occasion = occasions.find(o => o.id === body.occasion);
    const style = styles.find(s => s === body.style);
    if (!deity || !occasion || !style) return NextResponse.json({ message: 'Choose a valid deity, occasion and style.' }, { status: 400 });
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(165000),
      body: JSON.stringify({
        model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2.5-flare',
        size: '1024x1024', quality: 'medium', n: 1,
        prompt: `Create a respectful Hindu devotional artwork for ${occasion.en}. Depict ${deity.prompt}. Style: ${style}. Warm cream, maroon and saffron palette. Center the complete deity with comfortable margins; no cropped head or sacred attributes. Restrained temple background. No text, lettering, numbers, dates, logos or watermark. This is an artwork panel; all poster text will be added separately.`,
      }),
    });
    if (!response.ok) {
      console.error('Artwork API status', response.status);
      return NextResponse.json({ message: response.status === 429 ? 'Image service quota or rate limit reached. Check API billing or try later.' : 'Image generation failed. Check model access and API configuration, then retry.' }, { status: 502 });
    }
    const result = await response.json();
    const image = result.data?.[0]?.b64_json;
    if (typeof image !== 'string') throw new Error('Missing image');
    return NextResponse.json({ image: `data:image/png;base64,${image}` }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ message: error instanceof SyntaxError ? 'Invalid request.' : 'Artwork generation timed out or failed. Please retry.' }, { status: error instanceof SyntaxError ? 400 : 502 });
  }
}
