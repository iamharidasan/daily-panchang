"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  Check,
  Download,
  Languages,
  LoaderCircle,
  LocateFixed,
  MapPin,
  MoonStar,
  RefreshCw,
  Sparkles,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Language = "ta" | "en";

type TimedItem = {
  name: string;
  start: string;
  end: string;
};

type PanchangamData = {
  date: string;
  location: string;
  source: "live" | "demo";
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  weekday: string;
  tamilMonth: string;
  tithi: TimedItem[];
  nakshatra: TimedItem[];
  yoga: TimedItem[];
  karana: TimedItem[];
  paksha: string;
  rashi: string;
  auspiciousPeriods: TimedItem[];
  inauspiciousPeriods: TimedItem[];
};

type DetailRow = {
  label: string;
  value: string | TimedItem[];
};

type City = { id: string; ta: string; en: string; lat: number; lng: number };

const cities: City[] = [
  { id: "cuddalore", ta: "கடலூர்", en: "Cuddalore", lat: 11.748, lng: 79.7714 },
  { id: "chennai", ta: "சென்னை", en: "Chennai", lat: 13.0827, lng: 80.2707 },
  { id: "madurai", ta: "மதுரை", en: "Madurai", lat: 9.9252, lng: 78.1198 },
  { id: "coimbatore", ta: "கோயம்புத்தூர்", en: "Coimbatore", lat: 11.0168, lng: 76.9558 },
];

const labels = {
  ta: {
    brand: "நித்ய பஞ்சாங்கம்",
    title: "இன்றைய பஞ்சாங்கம்",
    date: "நாள்",
    place: "இடம்",
    language: "மொழி",
    generate: "பஞ்சாங்கம் பார்க்க",
    generating: "கணக்கிடுகிறது…",
    download: "படமாக பதிவிறக்கு",
    live: "நேரடி கணிப்பு",
    demo: "மாதிரி தரவு",
    demoNote: "Prokerala API சான்றுகளைச் சேர்த்ததும் நேரடி பஞ்சாங்கம் தோன்றும்.",
    sunrise: "சூரிய உதயம்",
    sunset: "சூரிய அஸ்தமனம்",
    moonrise: "சந்திர உதயம்",
    moonset: "சந்திர அஸ்தமனம்",
    panchanga: "பஞ்சாங்க குறிப்புகள்",
    timings: "கால நேரங்கள்",
    tithi: "திதி",
    star: "நட்சத்திரம்",
    yoga: "யோகம்",
    karana: "கரணம்",
    paksha: "பட்சம்",
    rashi: "சந்திர ராசி",
    rahu: "ராகு காலம்",
    yama: "எமகண்டம்",
    gulika: "குளிகை",
    abhijit: "அபிஜித் முகூர்த்தம்",
    auspicious: "சுப நேரங்கள்",
    inauspicious: "தவிர்க்க வேண்டிய நேரங்கள்",
    start: "தொடக்கம்",
    end: "முடிவு",
    footer: "சுபம் உண்டாகட்டும்",
    locationPermission: "உங்கள் இருப்பிடத்தைப் பெற முடியவில்லை.",
    apiError: "பஞ்சாங்க விவரங்களைப் பெற முடியவில்லை. மீண்டும் முயலவும்.",
  },
  en: {
    brand: "Nithya Panchangam",
    title: "Daily Panchangam",
    date: "Date",
    place: "Location",
    language: "Language",
    generate: "View Panchangam",
    generating: "Calculating…",
    download: "Download image",
    live: "Live calculation",
    demo: "Sample data",
    demoNote: "Live Panchangam will appear after adding the Prokerala API credentials.",
    sunrise: "Sunrise",
    sunset: "Sunset",
    moonrise: "Moonrise",
    moonset: "Moonset",
    panchanga: "Panchanga details",
    timings: "Daily timings",
    tithi: "Tithi",
    star: "Nakshatra",
    yoga: "Yoga",
    karana: "Karana",
    paksha: "Paksha",
    rashi: "Moon sign",
    rahu: "Rahu Kalam",
    yama: "Yamagandam",
    gulika: "Gulika",
    abhijit: "Abhijit Muhurta",
    auspicious: "Auspicious periods",
    inauspicious: "Inauspicious periods",
    start: "Start",
    end: "End",
    footer: "May the day be auspicious",
    locationPermission: "We could not access your current location.",
    apiError: "Unable to load Panchangam details. Please try again.",
  },
};

function localIsoDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function displayDate(date: string, language: Language) {
  return new Intl.DateTimeFormat(language === "ta" ? "ta-IN" : "en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function rangeText(item: TimedItem) {
  return `${item.start} – ${item.end}`;
}

function loadPosterImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

export function PanchangamApp() {
  const [language, setLanguage] = useState<Language>("ta");
  const [date, setDate] = useState(localIsoDate);
  const [cityId, setCityId] = useState("cuddalore");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [customPlace, setCustomPlace] = useState<string | null>(null);
  const [data, setData] = useState<PanchangamData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloaded, setDownloaded] = useState(false);

  const t = labels[language];
  const loadPanchangam = useCallback(
    async (input?: { date?: string; cityId?: string; language?: Language }) => {
      const nextDate = input?.date ?? date;
      const nextLanguage = input?.language ?? language;
      const nextCityId = input?.cityId ?? cityId;
      const nextCity = cities.find((item) => item.id === nextCityId) ?? cities[0];
      const point = input ? { lat: nextCity.lat, lng: nextCity.lng } : (coordinates ?? { lat: nextCity.lat, lng: nextCity.lng });
      const place = input ? nextCity[nextLanguage] : (customPlace ?? nextCity[nextLanguage]);

      setDate(nextDate);
      setLanguage(nextLanguage);
      setCityId(nextCityId);
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          date: nextDate,
          lat: String(point.lat),
          lng: String(point.lng),
          location: place,
          language: nextLanguage,
        });
        const response = await fetch(`/api/panchang?${params.toString()}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Request failed");
        const result = (await response.json()) as PanchangamData;
        setData(result);
        return { source: result.source, date: result.date, location: result.location };
      } catch {
        setError(labels[nextLanguage].apiError);
        throw new Error(labels[nextLanguage].apiError);
      } finally {
        setLoading(false);
      }
    },
    [cityId, coordinates, customPlace, date, language],
  );

  useEffect(() => {
    void loadPanchangam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const modelContext = (
      document as Document & {
        modelContext?: {
          registerTool: (tool: Record<string, unknown>, options?: { signal?: AbortSignal }) => void | Promise<void>;
        };
      }
    ).modelContext;
    if (!modelContext?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(
      modelContext.registerTool(
        {
          name: "generate_panchangam",
          title: "Generate Panchangam",
          description: "Generate and display the Panchangam for a supported Tamil Nadu city and date.",
          inputSchema: {
            type: "object",
            properties: {
              date: { type: "string", description: "Date in YYYY-MM-DD format" },
              cityId: { type: "string", enum: cities.map((item) => item.id) },
              language: { type: "string", enum: ["ta", "en"] },
            },
            required: ["date", "cityId", "language"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: true },
          execute: async (input: unknown) => {
            const value = input as { date?: string; cityId?: string; language?: Language };
            if (
              !/^\d{4}-\d{2}-\d{2}$/.test(value.date ?? "") ||
              !cities.some((item) => item.id === value.cityId) ||
              !["ta", "en"].includes(value.language ?? "")
            ) {
              throw new Error("A valid date, cityId and language are required.");
            }
            return loadPanchangam(value as { date: string; cityId: string; language: Language });
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => undefined);
    return () => lifecycle.abort();
  }, [loadPanchangam]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError(t.locationPermission);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({ lat: position.coords.latitude, lng: position.coords.longitude });
        setCustomPlace(language === "ta" ? "தற்போதைய இருப்பிடம்" : "Current location");
        setError("");
      },
      () => setError(t.locationPermission),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  };

  const downloadPoster = async () => {
    if (!data) return;
    await document.fonts.ready;

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cream = "#fff9eb";
    const maroon = "#741b20";
    const saffron = "#dc7c19";
    const muted = "#6f574c";
    const panel = "#f7e9cd";
    const border = "#e3c28b";
    const blue = "#0143B9";

    ctx.fillStyle = cream;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = saffron;
    ctx.lineWidth = 10;
    ctx.strokeRect(24, 24, 1032, canvas.height - 48);
    ctx.lineWidth = 2;
    ctx.strokeRect(42, 42, 996, canvas.height - 84);

    const logo = await loadPosterImage("/cuddalore.png").catch(() => null);
    ctx.textAlign = "center";
    if (logo) {
      ctx.drawImage(logo, 430, 50, 220, 220);
    } else {
      ctx.fillStyle = saffron;
      ctx.font = "700 76px 'Noto Sans Tamil', Latha, Arial";
      ctx.fillText("ௐ", 540, 170);
    }

    ctx.fillStyle = maroon;
    ctx.font = "700 48px 'Noto Sans Tamil', Latha, Arial";
    ctx.fillText(t.title, 540, 320);
    ctx.font = "600 25px 'Noto Sans Tamil', Latha, Arial";
    ctx.fillText(displayDate(data.date, language), 540, 363);
    ctx.fillStyle = muted;
    ctx.font = "500 22px 'Noto Sans Tamil', Latha, Arial";
    ctx.fillText(data.location, 540, 400);
    ctx.strokeStyle = border;
    ctx.beginPath();
    ctx.moveTo(72, 426);
    ctx.lineTo(1008, 426);
    ctx.stroke();

    const solarItems = [
      [t.sunrise, data.sunrise],
      [t.sunset, data.sunset],
      [t.moonrise, data.moonrise],
      [t.moonset, data.moonset],
    ];

    solarItems.forEach(([label, value], index) => {
      const x = 72 + index * 237;
      ctx.fillStyle = panel;
      ctx.fillRect(x, 452, 219, 96);
      ctx.textAlign = "center";
      ctx.fillStyle = saffron;
      ctx.font = "600 17px 'Noto Sans Tamil', Latha, Arial";
      ctx.fillText(label, x + 109.5, 484);
      ctx.fillStyle = maroon;
      ctx.font = "700 22px 'Noto Sans Tamil', Latha, Arial";
      ctx.fillText(value, x + 109.5, 522);
    });

    const drawSection = (x: number, y: number, width: number, title: string, items: TimedItem[]) => {
      const safeItems = items.length ? items : [{ name: "—", start: "", end: "" }];
      const itemHeight = 55;
      const height = 49 + safeItems.length * itemHeight + 10;

      ctx.fillStyle = "#fffdf7";
      ctx.fillRect(x, y, width, height);
      ctx.strokeStyle = border;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      ctx.fillStyle = maroon;
      ctx.fillRect(x, y, width, 49);
      ctx.textAlign = "left";
      ctx.fillStyle = "#fff5dc";
      ctx.font = "700 21px 'Noto Sans Tamil', Latha, Arial";
      ctx.fillText(title, x + 18, y + 32);

      safeItems.forEach((item, index) => {
        const itemY = y + 49 + index * itemHeight;
        if (index > 0) {
          ctx.strokeStyle = "#efe1c9";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x + 16, itemY);
          ctx.lineTo(x + width - 16, itemY);
          ctx.stroke();
        }
        ctx.fillStyle = maroon;
        ctx.font = "700 19px 'Noto Sans Tamil', Latha, Arial";
        ctx.fillText(item.name, x + 18, itemY + 23);
        if (item.start || item.end) {
          ctx.fillStyle = muted;
          ctx.font = "600 16px 'Noto Sans Tamil', Latha, Arial";
          ctx.fillText(rangeText(item), x + 18, itemY + 45);
        }
      });
      return y + height + 13;
    };

    const plainItem = (value: string): TimedItem[] => [{ name: value, start: "", end: "" }];
    const leftX = 72;
    const rightX = 552;
    const columnWidth = 456;
    let leftY = 576;
    let rightY = 576;

    leftY = drawSection(leftX, leftY, columnWidth, t.tithi, data.tithi);
    leftY = drawSection(leftX, leftY, columnWidth, t.star, data.nakshatra);
    leftY = drawSection(leftX, leftY, columnWidth, t.yoga, data.yoga);
    leftY = drawSection(leftX, leftY, columnWidth, t.karana, data.karana);
    leftY = drawSection(leftX, leftY, columnWidth, t.paksha, plainItem(data.paksha));
    drawSection(leftX, leftY, columnWidth, t.rashi, plainItem(data.rashi));

    rightY = drawSection(rightX, rightY, columnWidth, t.auspicious, data.auspiciousPeriods);
    drawSection(rightX, rightY, columnWidth, t.inauspicious, data.inauspiciousPeriods);

    ctx.textAlign = "center";
    ctx.fillStyle = saffron;
    ctx.font = "600 24px 'Noto Sans Tamil', Latha, Arial";
    ctx.fillText(`சண்முக ஹரிதாசன்`, 540, 1770);

    ctx.textAlign = "center";
    ctx.fillStyle = blue;
    ctx.font = "600 18px 'Noto Sans Tamil', Latha, Arial";
    ctx.fillText(`கடலூர் மாவட்ட செயலாளர், விசுவ ஹிந்து பரிஷத்`, 540, 1805);

    ctx.textAlign = "center";
    ctx.fillStyle = saffron;
    ctx.font = "600 26px 'Noto Sans Tamil', Latha, Arial";
    ctx.fillText(`• ${t.footer} •`, 540, 1850);

    const link = document.createElement("a");
    link.download = `panchangam-${data.date}.png`;
    link.href = canvas.toDataURL("image/png", 1);
    link.click();
    setDownloaded(true);
    window.setTimeout(() => setDownloaded(false), 1800);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[#e6cfa8] bg-[#fffaf0]/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1480px] items-center justify-between px-5 py-4 lg:px-9">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-full text-2xl">
              <img src="/cuddalore.png" alt="Logo" width={100} height={100} />
            </div>
            <div>
              <p className="font-display text-xl font-bold text-[#741b20]">{t.brand}</p>
              <p className="text-xs font-medium tracking-wide text-[#8e6f5a]">Cuddalore District</p>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-[#e6cfa8] bg-white p-1" aria-label={t.language}>
            <Button
              type="button"
              size="sm"
              variant={language === "ta" ? "default" : "ghost"}
              className="rounded-full px-4"
              aria-pressed={language === "ta"}
              onClick={() => setLanguage("ta")}
            >
              தமிழ்
            </Button>
            <Button
              type="button"
              size="sm"
              variant={language === "en" ? "default" : "ghost"}
              className="rounded-full px-4"
              aria-pressed={language === "en"}
              onClick={() => setLanguage("en")}
            >
              English
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1480px] gap-7 px-5 py-7 lg:grid-cols-[390px_minmax(0,1fr)] lg:px-9 lg:py-10">
        <section
          className="h-fit rounded-[28px] border border-[#e6cfa8] bg-white p-5 shadow-[0_18px_60px_rgba(88,46,20,0.08)] lg:sticky lg:top-6 lg:p-6"
          aria-labelledby="controls-heading"
        >
          <div className="mb-6 flex items-start gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[#fff0d1] text-[#9b4a16]">
              <CalendarDays />
            </div>
            <div>
              <h1 id="controls-heading" className="font-display text-2xl font-bold text-[#4d1719]">
                {t.title}
              </h1>
              <p className="mt-1 text-sm text-[#806b5f]">
                {language === "ta" ? "தேதியும் இடமும் தேர்வு செய்யுங்கள்" : "Choose a date and location"}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#5a332c]">
                <CalendarDays className="size-4 text-[#b25b18]" />
                {t.date}
              </span>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="h-12 w-full rounded-xl border border-[#dbc3a0] bg-[#fffcf6] px-4 text-base outline-none transition focus:border-[#b85f1c] focus:ring-3 focus:ring-[#e9b469]/25"
              />
            </label>

            <div>
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#5a332c]">
                <MapPin className="size-4 text-[#b25b18]" />
                {t.place}
              </span>
              <select
                value={cityId}
                onChange={(event) => {
                  setCityId(event.target.value);
                  setCoordinates(null);
                  setCustomPlace(null);
                }}
                className="h-12 w-full rounded-xl border border-[#dbc3a0] bg-[#fffcf6] px-4 text-base outline-none transition focus:border-[#b85f1c] focus:ring-3 focus:ring-[#e9b469]/25"
              >
                {cities.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item[language]}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="ghost"
                className="mt-2 w-full justify-start rounded-xl text-[#8a4517]"
                onClick={useCurrentLocation}
              >
                <LocateFixed className="size-4" />
                {language === "ta" ? "எனது இருப்பிடத்தைப் பயன்படுத்து" : "Use my current location"}
              </Button>
              {coordinates && (
                <p className="mt-1 flex items-center gap-2 text-xs text-[#6e7d4d]">
                  <Check className="size-3.5" />
                  {customPlace}
                </p>
              )}
            </div>

            <div>
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#5a332c]">
                <Languages className="size-4 text-[#b25b18]" />
                {t.language}
              </span>
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#f8edda] p-1.5">
                <Button
                  type="button"
                  variant={language === "ta" ? "secondary" : "ghost"}
                  className="h-10 rounded-lg"
                  onClick={() => setLanguage("ta")}
                >
                  தமிழ்
                </Button>
                <Button
                  type="button"
                  variant={language === "en" ? "secondary" : "ghost"}
                  className="h-10 rounded-lg"
                  onClick={() => setLanguage("en")}
                >
                  English
                </Button>
              </div>
            </div>

            <Button
              type="button"
              size="lg"
              className="h-12 w-full rounded-xl bg-[#741b20] text-base text-white shadow-lg shadow-[#741b20]/15 hover:bg-[#5e1217]"
              disabled={loading}
              onClick={() => void loadPanchangam()}
            >
              {loading ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
              {loading ? t.generating : t.generate}
            </Button>
            {error && (
              <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}
          </div>
        </section>

        <section className="min-w-0" aria-live="polite">
          {data ? (
            <>
              <article className="poster-card relative overflow-hidden rounded-[32px] border border-[#dfbd80] bg-[#fff9eb] p-5 shadow-[0_25px_80px_rgba(100,53,20,0.13)] sm:p-8 lg:p-10">
                <div className="pointer-events-none absolute inset-3 rounded-[24px] border border-[#e7bd72]" />
                <div className="pointer-events-none absolute inset-5 rounded-[20px] border border-[#eddaa9]" />
                <div className="relative">
                  <div className="flex flex-col items-center text-center">
                    <img src="/cuddalore.png" alt="Logo" width={100} height={100} />
                    {/* <span className="mb-1 text-4xl font-bold text-[#dc7c19]">ௐ</span> */}
                    <h2 className="font-display text-3xl font-extrabold text-[#741b20] sm:text-4xl">{t.title}</h2>
                    <p className="mt-3 text-base font-semibold text-[#68443b] sm:text-lg">{displayDate(data.date, language)}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-[#8e6f5a]">
                      <MapPin className="size-4" />
                      {data.location}
                    </p>
                    <span
                      className={`mt-3 rounded-full px-3 py-1 text-xs font-bold ${data.source === "live" ? "bg-emerald-100 text-emerald-800" : "bg-[#fff0cf] text-[#955018]"}`}
                    >
                      {data.source === "live" ? t.live : t.demo}
                    </span>
                  </div>

                  <div className="my-7 flex items-center gap-3">
                    <span className="h-px flex-1 bg-[#e7c891]" />
                    <span className="size-2 rotate-45 bg-[#cf791d]" />
                    <span className="h-px flex-1 bg-[#e7c891]" />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-4">
                    {[
                      [Sun, t.sunrise, data.sunrise],
                      [Sun, t.sunset, data.sunset],
                      [MoonStar, t.moonrise, data.moonrise],
                      [MoonStar, t.moonset, data.moonset],
                    ].map(([Icon, label, value], index) => {
                      const IconComponent = Icon as typeof Sun;
                      return (
                        <div key={String(label)} className="rounded-2xl border border-[#ead4ad] bg-white/65 p-4 text-center">
                          <IconComponent className={`mx-auto mb-2 size-5 ${index < 2 ? "text-[#d67917]" : "text-[#6b5797]"}`} />
                          <p className="text-xs font-semibold text-[#8b7061]">{String(label)}</p>
                          <p className="mt-1 font-bold text-[#501b1d]">{String(value)}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 grid gap-5 xl:grid-cols-2">
                    <DetailGroup
                      title={t.panchanga}
                      startLabel={t.start}
                      endLabel={t.end}
                      rows={[
                        { label: t.tithi, value: data.tithi },
                        { label: t.star, value: data.nakshatra },
                        { label: t.yoga, value: data.yoga },
                        { label: t.karana, value: data.karana },
                        { label: t.paksha, value: data.paksha },
                        { label: t.rashi, value: data.rashi },
                      ]}
                    />
                    <DetailGroup
                      title={t.timings}
                      startLabel={t.start}
                      endLabel={t.end}
                      rows={[
                        { label: t.auspicious, value: data.auspiciousPeriods },
                        { label: t.inauspicious, value: data.inauspiciousPeriods },
                      ]}
                    />
                  </div>

                  <div className="mt-7 flex items-center justify-center gap-2 text-center font-display text-lg font-bold text-[#a35619]">
                    <Sparkles className="size-4" />
                    {t.footer}
                    <Sparkles className="size-4" />
                  </div>
                </div>
              </article>

              {data.source === "demo" && (
                <p className="mt-4 rounded-xl border border-[#efd49f] bg-[#fff8e8] px-4 py-3 text-center text-sm text-[#8a5726]">
                  {t.demoNote}
                </p>
              )}

              <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  type="button"
                  size="lg"
                  className="h-12 rounded-xl bg-[#cf731b] px-6 text-white hover:bg-[#b85f12]"
                  onClick={() => void downloadPoster()}
                >
                  <Download />
                  {downloaded ? (language === "ta" ? "பதிவிறக்கப்பட்டது" : "Downloaded") : t.download}
                </Button>
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-xl border-[#d9b987] bg-white px-6 text-[#6e2a20]"
                  onClick={() => void loadPanchangam()}
                >
                  <RefreshCw />
                  {language === "ta" ? "புதுப்பிக்க" : "Refresh"}
                </Button>
              </div>
            </>
          ) : (
            <div className="grid min-h-[620px] place-items-center rounded-[32px] border border-[#e1c797] bg-[#fff9eb]">
              <LoaderCircle className="size-8 animate-spin text-[#a75219]" />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function DetailGroup({
  title,
  rows,
  startLabel,
  endLabel,
}: {
  title: string;
  rows: DetailRow[];
  startLabel: string;
  endLabel: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e5c998] bg-white/55">
      <h3 className="bg-[#741b20] px-5 py-3 font-display text-lg font-bold text-[#fff5dc]">{title}</h3>
      <dl className="divide-y divide-[#ead9bc] px-5">
        {rows.map(({ label, value }) => (
          <div key={label} className="grid gap-2 py-3 sm:grid-cols-[minmax(110px,0.7fr)_minmax(0,1.3fr)] sm:gap-4">
            <dt className="pt-0.5 text-sm font-medium text-[#866b5d]">{label}</dt>
            <dd className="min-w-0 text-[#551f20]">
              {typeof value === "string" ? (
                <p className="font-bold sm:text-right">{value}</p>
              ) : value.length ? (
                <div className="space-y-2">
                  {value.map((item, index) => (
                    <div key={`${item.name}-${item.start}-${index}`} className="rounded-xl bg-[#fff9eb] px-3 py-2">
                      <p className="font-bold sm:text-right">{item.name}</p>
                      <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-[#806b5f] sm:justify-end">
                        <span>
                          <span className="text-[#ac681f]">{startLabel}:</span> {item.start}
                        </span>
                        <span>
                          <span className="text-[#ac681f]">{endLabel}:</span> {item.end}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-bold sm:text-right">—</p>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
