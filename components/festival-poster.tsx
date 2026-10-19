'use client';
import { useEffect, useRef, useState } from 'react';
import { occasions, deities, styles } from '@/lib/poster-options';

type Data = { date: string; location: string; source: string; auspiciousPeriods: { name: string; start: string; end: string }[] };
const field = 'w-full rounded-xl border border-[#e3c28b] bg-white p-3 text-sm';
const button = 'rounded-xl bg-[#741b20] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40';
function image(src: string): Promise<HTMLImageElement> { return new Promise((resolve, reject) => { const i = new Image(); i.onload = () => resolve(i); i.onerror = () => reject(new Error('Could not load image.')); i.src = src; }); }
function artworkStore(mode: 'get' | 'put', key: string, value?: string): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open('panchang-artwork', 1);
    open.onupgradeneeded = () => open.result.createObjectStore('artwork');
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result, tx = db.transaction('artwork', mode === 'get' ? 'readonly' : 'readwrite');
      const req = mode === 'get' ? tx.objectStore('artwork').get(key) : tx.objectStore('artwork').put(value, key);
      tx.oncomplete = () => { db.close(); resolve(mode === 'get' ? req.result : value); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    };
  });
}
export function FestivalPoster({ data, language, loading }: { data: Data | null; language: 'ta' | 'en'; loading: boolean }) {
  const [occasion, setOccasion] = useState('daily'), [deity, setDeity] = useState('ganesha');
  const [style, setStyle] = useState<string>(styles[0]), [title, setTitle] = useState('');
  const [footer, setFooter] = useState('விசுவ ஹிந்து பரிஷத், கடலூர் மாவட்டம்');
  const [art, setArt] = useState(''), [preview, setPreview] = useState(''), [access, setAccess] = useState('');
  const [confirmed, setConfirmed] = useState(false), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  const blob = useRef<Blob | null>(null);
  const revision = useRef(0);
  const option = occasions.find(o => o.id === occasion)!;
  const cacheKey = `${occasion}:${deity}:${style}`;
  useEffect(() => { let active = true; setArt(''); void artworkStore('get', cacheKey).then(v => { if (active && v) setArt(v); }).catch(() => {}); return () => { active = false; }; }, [cacheKey]);
  useEffect(() => { revision.current++; setPreview(''); blob.current = null; }, [art, title, footer, occasion, data, language, confirmed]);
  useEffect(() => { setConfirmed(false); }, [data?.date, data?.location, occasion]);
  async function generate() {
    setBusy(true); setMessage('Generating artwork. This may take a few minutes…');
    try {
      const r = await fetch('/api/poster-artwork', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` }, body: JSON.stringify({ occasion, deity, style }) });
      const result = await r.json(); if (!r.ok) throw new Error(result.message || 'Generation failed.');
      setArt(result.image);
      await artworkStore('put', cacheKey, result.image).catch(() => { setMessage('Artwork ready; browser storage is unavailable. Download it to keep a copy.'); });
      setMessage('Artwork ready. Check the deity details before creating your poster.');
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Generation failed.'); } finally { setBusy(false); }
  }
  async function upload(file?: File) {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) { setMessage('Choose a PNG, JPEG or WebP image under 8 MB.'); return; }
    setBusy(true);
    try {
      const src = await new Promise<string>((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.onerror = reject; r.readAsDataURL(file); });
      const img = await image(src); const c = document.createElement('canvas'); const scale = Math.min(1, 1600 / Math.max(img.width, img.height)); c.width = img.width * scale; c.height = img.height * scale; c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      const normalized = c.toDataURL('image/png'); setArt(normalized); await artworkStore('put', cacheKey, normalized); setMessage('Uploaded artwork saved in this browser.');
    } catch { setMessage('Could not save the image. Browser storage may be full.'); } finally { setBusy(false); }
  }
  async function compose() {
    if (!data || data.source !== 'live' || !confirmed || !art) return;
    setBusy(true); setMessage('');
    const currentRevision = revision.current;
    try {
      await document.fonts.load('600 36px "Noto Sans Tamil"', 'தமிழ்');
      await document.fonts.ready;
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      const c = document.createElement('canvas'); c.width = 1080; c.height = 1350;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#fff9eb'; ctx.fillRect(0, 0, 1080, 1350);
      ctx.strokeStyle = '#dc7c19'; ctx.lineWidth = 6; ctx.strokeRect(22, 22, 1036, 1306);
      const drawText = (text: string, y: number, size: number, width = 950) => {
        ctx.fillStyle = '#741b20'; ctx.textAlign = 'left';
        do { ctx.font = `600 ${size--}px 'Noto Sans Tamil', Latha, Arial`; } while (ctx.measureText(text).width > width && size > 13);
        ctx.fillText(text, (1080 - ctx.measureText(text).width) / 2, y);
      };
      drawText(title.trim() || option[language], 98, 50, 770);
      const logo = await image('/cuddalore.png'); ctx.drawImage(logo, 930, 42, 98, 98);
      drawText(`${data.date} · ${data.location}`, 159, 28);
      const img = await image(art); const scale = Math.min(920 / img.width, 640 / img.height);
      const w = img.width * scale, h = img.height * scale; ctx.drawImage(img, (1080 - w) / 2, 190 + (640 - h) / 2, w, h);
      drawText(language === 'ta' ? 'சுப நேரங்கள்' : 'Auspicious periods', 895, 36);
      const periods = data.auspiciousPeriods;
      if (periods.length > 4) throw new Error('This compact layout fits four periods. Use the daily Panchang poster for the complete list.');
      if (!periods.length) drawText(language === 'ta' ? 'நேரங்கள் கிடைக்கவில்லை' : 'No periods supplied', 965, 28);
      periods.forEach((p, index) => { const y = 948 + index * 71; drawText(p.name, y, 28); drawText(`${p.start} – ${p.end}`, y + 33, 29); });
      drawText(footer, 1285, 28);
      const rendered = await new Promise<Blob>((resolve, reject) => c.toBlob(b => b ? resolve(b) : reject(new Error('Could not create poster.')), 'image/png'));
      if (currentRevision !== revision.current) { setMessage('Panchang selection changed. Create the preview again.'); return; }
      blob.current = rendered;
      setPreview(c.toDataURL('image/png')); setMessage('Preview ready. Check the title, artwork and timings before sharing.');
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Could not create poster.'); } finally { setBusy(false); }
  }
  async function download() {
    if (!blob.current || !data) return;
    const file = new File([blob.current], `festival-${data.date}.png`, { type: 'image/png' });
    try { if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: title || option[language] }); return; } }
    catch (e) { if (e instanceof Error && e.name === 'AbortError') return; }
    const url = URL.createObjectURL(file), a = document.createElement('a'); a.href = url; a.download = file.name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  return <section className="mx-auto my-8 max-w-5xl rounded-3xl border border-[#e3c28b] bg-[#fff9eb] p-6 text-[#741b20]">
    <h2 className="text-2xl font-bold">Festival poster studio</h2>
    <p className="my-2 text-sm">Create deity artwork, then add exact Tamil text and live Panchang timings. Select the date and location in the Panchang panel above.</p>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <label>Occasion<select disabled={busy} className={field} value={occasion} onChange={e => { setOccasion(e.target.value); setDeity(occasions.find(o => o.id === e.target.value)!.deity); setTitle(''); }}>{occasions.map(o => <option key={o.id} value={o.id}>{o[language]}</option>)}</select></label>
      <label>Deity<select disabled={busy} className={field} value={deity} onChange={e => setDeity(e.target.value)}>{deities.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
      <label>Art style<select disabled={busy} className={field} value={style} onChange={e => setStyle(e.target.value)}>{styles.map(s => <option key={s}>{s}</option>)}</select></label>
      <label>Poster title<input disabled={busy} className={field} maxLength={80} value={title} placeholder={option[language]} onChange={e => setTitle(e.target.value)} /></label>
      <label>Footer<input disabled={busy} className={field} maxLength={100} value={footer} onChange={e => setFooter(e.target.value)} /></label>
      <label>Upload deity artwork<input disabled={busy} className={field} type="file" accept="image/png,image/jpeg,image/webp" onChange={e => void upload(e.target.files?.[0])} /></label>
      <label>Poster access code<input className={field} type="password" autoComplete="off" value={access} onChange={e => setAccess(e.target.value)} placeholder="Required only for AI generation" /></label>
      <div className="flex items-end"><button disabled={busy || !access} className={button} onClick={() => void generate()}>{busy ? 'Working…' : art ? 'Generate new artwork' : 'Generate artwork'}</button></div>
    </div>
    <p className="mt-3 text-xs">Artwork is reused from this browser until you generate or upload a replacement. Each AI generation uses your API account.</p>
    {art && <div className="mt-4 flex items-center gap-4"><img src={art} alt="Selected deity artwork" className="h-40 w-40 rounded-xl object-contain" /><a className="underline" href={art} download={`artwork-${deity}.png`}>Save artwork</a></div>}
    <label className="my-5 flex gap-3 text-sm"><input type="checkbox" checked={confirmed} disabled={busy} onChange={e => setConfirmed(e.target.checked)} />I have verified this occasion for {data?.date || 'the selected date'} and location. The app does not automatically calculate festival dates.</label>
    {(!data || data.source !== 'live') && <p className="mb-4 text-sm">Load live Panchang data before creating a final poster. Demo data cannot be used.</p>}
    <div className="flex flex-wrap gap-3"><button className={button} disabled={busy || loading || !art || !confirmed || data?.source !== 'live'} onClick={() => void compose()}>Create poster preview</button>{preview && <button className={button} disabled={busy || loading} onClick={() => void download()}>Download / share PNG</button>}</div>
    <p role="status" className="mt-3 text-sm">{message}</p>
    {preview && <img src={preview} alt="Festival poster preview" className="mx-auto mt-5 w-full max-w-md rounded-xl border" />}
  </section>;
}
