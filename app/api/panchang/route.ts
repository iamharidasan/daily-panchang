import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Language = "ta" | "en";
type AnyObject = Record<string, unknown>;

type TimedItem = {
  name: string;
  start: string;
  end: string;
};

const demo = {
  ta: {
    weekday: "வியாழக்கிழமை",
    tamilMonth: "ஆவணி",
    tithi: [
      { name: "சதுர்த்தசி", start: "நேற்று 12:31 PM", end: "10:33 AM" },
      { name: "அமாவாசை", start: "10:33 AM", end: "நாளை 08:57 AM" },
    ],
    nakshatra: [
      { name: "மகம்", start: "நேற்று 03:14 PM", end: "02:04 PM" },
      { name: "பூரம்", start: "02:04 PM", end: "நாளை 01:16 PM" },
    ],
    yoga: [
      { name: "சித்தம்", start: "நேற்று 09:51 PM", end: "07:17 PM" },
      { name: "சாத்தியம்", start: "07:17 PM", end: "நாளை 05:01 PM" },
    ],
    karana: [
      { name: "சகுனி", start: "நேற்று 11:30 PM", end: "10:33 AM" },
      { name: "சதுஷ்பாதம்", start: "10:33 AM", end: "09:42 PM" },
      { name: "நாகம்", start: "09:42 PM", end: "நாளை 08:57 AM" },
    ],
    paksha: "கிருஷ்ண பட்சம்",
    rashi: "—",
    sunrise: "06:03 AM",
    sunset: "06:11 PM",
    moonrise: "05:03 AM",
    moonset: "05:41 PM",
    auspiciousPeriods: [
      { name: "அபிஜித் முகூர்த்தம்", start: "11:43 AM", end: "12:32 PM" },
      { name: "அமிர்த காலம்", start: "11:46 AM", end: "01:17 PM" },
      { name: "பிரம்ம முகூர்த்தம்", start: "04:27 AM", end: "05:15 AM" },
    ],
    inauspiciousPeriods: [
      { name: "ராகு காலம்", start: "01:38 PM", end: "03:09 PM" },
      { name: "எமகண்டம்", start: "06:03 AM", end: "07:34 AM" },
      { name: "குளிகை", start: "09:05 AM", end: "10:36 AM" },
      { name: "துர் முகூர்த்தம்", start: "10:06 AM", end: "10:55 AM" },
      { name: "துர் முகூர்த்தம்", start: "02:57 PM", end: "03:46 PM" },
      { name: "வர்ஜ்யம்", start: "09:48 PM", end: "11:21 PM" },
    ],
  },
  en: {
    weekday: "Thursday",
    tamilMonth: "Avani",
    tithi: [
      { name: "Chaturdashi", start: "Yesterday 12:31 PM", end: "10:33 AM" },
      { name: "Amavasya", start: "10:33 AM", end: "Tomorrow 08:57 AM" },
    ],
    nakshatra: [
      { name: "Magha", start: "Yesterday 03:14 PM", end: "02:04 PM" },
      { name: "Purva Phalguni", start: "02:04 PM", end: "Tomorrow 01:16 PM" },
    ],
    yoga: [
      { name: "Siddha", start: "Yesterday 09:51 PM", end: "07:17 PM" },
      { name: "Sadhya", start: "07:17 PM", end: "Tomorrow 05:01 PM" },
    ],
    karana: [
      { name: "Shakuni", start: "Yesterday 11:30 PM", end: "10:33 AM" },
      { name: "Chatushpada", start: "10:33 AM", end: "09:42 PM" },
      { name: "Naga", start: "09:42 PM", end: "Tomorrow 08:57 AM" },
    ],
    paksha: "Krishna Paksha",
    rashi: "—",
    sunrise: "06:03 AM",
    sunset: "06:11 PM",
    moonrise: "05:03 AM",
    moonset: "05:41 PM",
    auspiciousPeriods: [
      { name: "Abhijit Muhurat", start: "11:43 AM", end: "12:32 PM" },
      { name: "Amrit Kaal", start: "11:46 AM", end: "01:17 PM" },
      { name: "Brahma Muhurat", start: "04:27 AM", end: "05:15 AM" },
    ],
    inauspiciousPeriods: [
      { name: "Rahu", start: "01:38 PM", end: "03:09 PM" },
      { name: "Yamaganda", start: "06:03 AM", end: "07:34 AM" },
      { name: "Gulika", start: "09:05 AM", end: "10:36 AM" },
      { name: "Dur Muhurat", start: "10:06 AM", end: "10:55 AM" },
      { name: "Dur Muhurat", start: "02:57 PM", end: "03:46 PM" },
      { name: "Varjyam", start: "09:48 PM", end: "11:21 PM" },
    ],
  },
};

function object(value: unknown): AnyObject {
  return value && typeof value === "object" ? (value as AnyObject) : {};
}

function at(source: AnyObject, paths: string[]): unknown {
  for (const path of paths) {
    let value: unknown = source;
    for (const key of path.split(".")) value = object(value)[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function nameOf(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return nameOf(value[0]);
  const item = object(value);
  return String(item.name ?? item.value ?? item.title ?? "—");
}

function dayPartTime(hour: number, minute: string, language: Language): string {
  const clock = `${String(hour % 12 || 12).padStart(2, "0")}:${minute}`;

  let dayPart: string;

  if (hour >= 5 && hour < 12) {
    dayPart = language === "ta" ? "காலை" : "Morning";
  } else if (hour >= 12 && hour < 15) {
    dayPart = language === "ta" ? "மதியம்" : "Afternoon";
  } else if (hour >= 15 && hour < 21) {
    dayPart = language === "ta" ? "மாலை" : "Evening";
  } else {
    dayPart = language === "ta" ? "இரவு" : "Night";
  }

  return `${dayPart} ${clock}`;
}

function timeOf(value: unknown, selectedDate?: string, language: Language = "en"): string {
  if (typeof value !== "string") return "—";
  const match = value.match(/T(\d{2}):(\d{2})/);
  if (!match) return value;
  const hour = Number(match[1]);
  const time = dayPartTime(hour, match[2], language);
  const timestampDate = value.match(/^(\d{4}-\d{2}-\d{2})T/)?.[1];

  if (!selectedDate || !timestampDate || timestampDate === selectedDate) return time;
  if (timestampDate < selectedDate) return `${language === "ta" ? "நேற்று" : "Yesterday"} ${time}`;
  return `${language === "ta" ? "நாளை" : "Tomorrow"} ${time}`;
}

function demoFor(language: Language): AnyObject {
  const replaceTime = (value: unknown): unknown => {
    if (typeof value === "string") {
      return value.replace(/(\d{2}):(\d{2}) (AM|PM)/g, (_, hours: string, minutes: string, meridiem: string) => {
        const hour = (Number(hours) % 12) + (meridiem === "PM" ? 12 : 0);
        return dayPartTime(hour, minutes, language);
      });
    }
    if (Array.isArray(value)) return value.map(replaceTime);
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceTime(item)]));
    }
    return value;
  };

  return object(replaceTime(demo[language]));
}

function timedItems(value: unknown, selectedDate: string, language: Language): TimedItem[] {
  const entries = Array.isArray(value) ? value : value ? [value] : [];

  return entries.flatMap((entry) => {
    const item = object(entry);
    const periods = Array.isArray(item.period) ? item.period : [item];

    return periods.map((period) => {
      const interval = object(period);
      return {
        name: nameOf(item),
        start: timeOf(interval.start ?? interval.start_time ?? interval.from, selectedDate, language),
        end: timeOf(interval.end ?? interval.end_time ?? interval.to, selectedDate, language),
      };
    });
  });
}

async function accessToken() {
  const clientId = process.env.PROKERALA_CLIENT_ID;
  const clientSecret = process.env.PROKERALA_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });
  const response = await fetch("https://api.prokerala.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) throw new Error("Prokerala authentication failed");
  const result = object(await response.json());
  return String(result.access_token ?? "");
}

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  const date = search.get("date") ?? new Date().toISOString().slice(0, 10);
  const lat = Number(search.get("lat") ?? 11.748);
  const lng = Number(search.get("lng") ?? 79.7714);
  const language: Language = search.get("language") === "en" ? "en" : "ta";
  const location = search.get("location") ?? (language === "ta" ? "கடலூர்" : "Cuddalore");

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    Math.abs(lat) > 90 ||
    Math.abs(lng) > 180
  ) {
    return NextResponse.json({ message: "Invalid date or coordinates" }, { status: 400 });
  }

  try {
    const token = await accessToken();
    if (!token) return NextResponse.json({ date, location, source: "demo", ...demoFor(language) });

    const params = new URLSearchParams({
      ayanamsa: "1",
      coordinates: `${lat},${lng}`,
      datetime: `${date}T06:00:00+05:30`,
      la: language,
    });
    const response = await fetch(`https://api.prokerala.com/v2/astrology/panchang/advanced?${params}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Prokerala request failed: ${response.status}`);
    const root = object(await response.json());
    const data = object(root.data ?? root);
    const tithiValue = at(data, ["tithi", "tithis"]);
    const directPaksha = nameOf(at(data, ["paksha"]));

    return NextResponse.json({
      date,
      location,
      source: "live",
      weekday: nameOf(at(data, ["weekday", "vaara"])),
      tamilMonth: nameOf(at(data, ["lunar_month", "month", "masa"])),
      tithi: timedItems(tithiValue, date, language),
      nakshatra: timedItems(at(data, ["nakshatra", "nakshatras"]), date, language),
      yoga: timedItems(at(data, ["yoga", "yogas"]), date, language),
      karana: timedItems(at(data, ["karana", "karanas"]), date, language),
      paksha: directPaksha !== "—" ? directPaksha : nameOf(object(Array.isArray(tithiValue) ? tithiValue[0] : tithiValue).paksha),
      rashi: nameOf(at(data, ["raasi", "rashi", "moon_sign"])),
      sunrise: timeOf(at(data, ["sunrise"]), date, language),
      sunset: timeOf(at(data, ["sunset"]), date, language),
      moonrise: timeOf(at(data, ["moonrise"]), date, language),
      moonset: timeOf(at(data, ["moonset"]), date, language),
      auspiciousPeriods: timedItems(at(data, ["auspicious_period"]), date, language),
      inauspiciousPeriods: timedItems(at(data, ["inauspicious_period"]), date, language),
    });
  } catch (error) {
    console.error("Panchang API error", error);
    return NextResponse.json({ message: "Unable to retrieve Panchangam" }, { status: 502 });
  }
}
