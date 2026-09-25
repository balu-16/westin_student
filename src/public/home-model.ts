import type {
  PublicMedia,
  PublicSitePayload,
  PublishedContentEntry,
} from "../lib/publicApi";

export interface HomeImage {
  src: string;
  alt: string;
  generated: boolean;
  asset?: string;
  position?: string;
}

export const artwork = (asset: string, description: string): HomeImage => ({
  src: `/images/skybook/${asset}-960.webp`,
  asset,
  generated: true,
  alt: `Illustrative AI-generated scene: ${description}`,
});

export const homeImages = {
  business: artwork(
    "business",
    "college-age students discussing a business presentation",
  ),
  hospitality: artwork(
    "hospitality",
    "hospitality students practising table service",
  ),
  foundation: artwork(
    "foundation",
    "young adults studying together in a library",
  ),
  campus: artwork(
    "campus",
    "friends walking through a leafy imagined college courtyard",
  ),
  mentoring: artwork("mentoring", "students talking with a career mentor"),
  collaboration: artwork(
    "collaboration",
    "students collaborating on a project",
  ),
  publications: artwork(
    "publications",
    "an editorial still life of unbranded magazines and sketchbooks",
  ),
};

export interface HomeProgram {
  slug: string;
  label: string;
  shortLabel: string;
  title: string;
  summary: string;
  tags: string[];
  image: HomeImage;
}

export interface HomeStory {
  id: string;
  title: string;
  summary: string;
  category: string;
  href: string;
  date?: string;
  image?: HomeImage;
}

export interface HomePublication {
  id: string;
  title: string;
  date?: string;
  image?: HomeImage;
  pdf?: string;
  sizeBytes?: number;
}

export interface HomeModel {
  hero: { eyebrow: string; title: string; summary: string };
  programs: HomeProgram[];
  sections: Record<
    string,
    { title?: string; summary?: string; image?: HomeImage }
  >;
  stories: HomeStory[];
  publications: HomePublication[];
  voice?: { quote: string; name: string; context: string; image?: HomeImage };
}

const basePrograms: HomeProgram[] = [
  {
    slug: "bba",
    label: "Business management",
    shortLabel: "Business",
    title: "For the ideas that could change things.",
    summary:
      "Explore the people, decisions and possibilities behind the world of business. Bring your curiosity. Start finding your direction.",
    tags: ["Management", "Communication", "Enterprise"],
    image: homeImages.business,
  },
  {
    slug: "hotel-management",
    label: "Hotel management",
    shortLabel: "Hospitality",
    title: "For the people who make people feel welcome.",
    summary:
      "Discover a world shaped by thoughtful service, attention to detail and human connection. Explore your next step in hospitality.",
    tags: ["Hospitality", "Service", "Operations"],
    image: homeImages.hospitality,
  },
  {
    slug: "intermediate",
    label: "Intermediate",
    shortLabel: "Intermediate",
    title: "A strong beginning. An open future.",
    summary:
      "Explore MEC and CEC study pathways, ask the right questions and build a foundation for the possibilities ahead.",
    tags: ["MEC / CEC", "Foundations", "Next steps"],
    image: homeImages.foundation,
  },
];

export function safePublicUrl(value: unknown): string | undefined {
  if (
    typeof value !== "string" ||
    [...value].some(
      (character) => character === "\\" || character.charCodeAt(0) <= 32,
    )
  )
    return undefined;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && !url.username && !url.password)
      return url.href;
  } catch {
    /* Invalid or relative publisher URL: omit it. */
  }
  return undefined;
}

function text(
  record: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function mediaImage(media: PublicMedia[] | undefined): HomeImage | undefined {
  const image = media?.find(
    (item) =>
      typeof item.mimeType === "string" &&
      item.mimeType.startsWith("image/") &&
      safePublicUrl(item.url),
  );
  if (!image) return undefined;
  const x =
    typeof image.focalX === "number" && Number.isFinite(image.focalX)
      ? Math.max(0, Math.min(1, image.focalX)) * 100
      : 50;
  const y =
    typeof image.focalY === "number" && Number.isFinite(image.focalY)
      ? Math.max(0, Math.min(1, image.focalY)) * 100
      : 50;
  return {
    src: safePublicUrl(image.url)!,
    alt:
      (typeof image.altText === "string" && image.altText) ||
      (typeof image.caption === "string" && image.caption) ||
      "Published college image",
    generated: false,
    position: `${x}% ${y}%`,
  };
}

function validEntries(
  payload: PublicSitePayload | null,
): PublishedContentEntry[] {
  if (!Array.isArray(payload?.entries)) return [];
  return payload.entries
    .filter(
      (entry) =>
        entry &&
        typeof entry.slug === "string" &&
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug) &&
        typeof entry.entryType === "string" &&
        entry.content &&
        typeof entry.content === "object" &&
        !Array.isArray(entry.content),
    )
    .map((entry) => ({
      ...entry,
      media: Array.isArray(entry.media)
        ? entry.media.filter((item) => item && typeof item === "object")
        : [],
    }));
}

export function createHomeModel(payload: PublicSitePayload | null): HomeModel {
  const entries = validEntries(payload);
  const sectionEntries = entries.filter(
    (entry) => entry.entryType === "homepage-section",
  );
  const hero = sectionEntries.find(
    (entry) => entry.slug === "hero" || entry.slug === "home-hero",
  );
  const sections: HomeModel["sections"] = {};
  for (const entry of sectionEntries) {
    sections[entry.slug] = {
      title: text(entry.content, "title"),
      summary: text(entry.content, "summary"),
      image: mediaImage(entry.media),
    };
  }
  const voice = entries.find(
    (entry) =>
      entry.entryType === "testimonial" &&
      text(entry.content, "quote") &&
      text(entry.content, "name"),
  );
  const stories = entries
    .filter(
      (entry) =>
        ["news", "event-story", "blog"].includes(entry.entryType) &&
        text(entry.content, "title"),
    )
    .sort(
      (a, b) =>
        (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0),
    )
    .slice(0, 4)
    .map((entry) => ({
      id: entry.id || entry.slug,
      title: text(entry.content, "title")!,
      summary: text(entry.content, "summary") || "",
      category:
        entry.entryType === "event-story"
          ? "Campus events"
          : entry.entryType === "blog"
            ? "Ideas & perspectives"
            : "College news",
      href:
        entry.entryType === "event-story"
          ? "/campus/events"
          : `/${entry.entryType}`,
      date: validDate(text(entry.content, "date") || entry.publishedAt),
      image: mediaImage(entry.media),
    }));
  const publications = entries
    .filter(
      (entry) => entry.entryType === "magazine" && text(entry.content, "title"),
    )
    .slice(0, 3)
    .map((entry) => {
      const pdf = entry.media.find(
        (item) =>
          item.mimeType === "application/pdf" && safePublicUrl(item.url),
      );
      return {
        id: entry.id || entry.slug,
        title: text(entry.content, "title")!,
        date: validDate(text(entry.content, "date") || entry.publishedAt),
        image: mediaImage(entry.media),
        pdf: safePublicUrl(pdf?.url),
        sizeBytes:
          typeof pdf?.sizeBytes === "number" &&
          Number.isFinite(pdf.sizeBytes) &&
          pdf.sizeBytes > 0
            ? pdf.sizeBytes
            : undefined,
      };
    });
  return {
    hero: {
      eyebrow:
        text(hero?.content || {}, "eyebrow") || "Your next chapter starts here",
      title:
        text(hero?.content || {}, "title") || "Big dreams. Bright beginnings.",
      summary:
        text(hero?.content || {}, "summary") ||
        "Discover business, hospitality and a campus full of possibility.",
    },
    programs: basePrograms.map((program) => {
      const entry = entries.find(
        (item) => item.entryType === "program" && item.slug === program.slug,
      );
      return entry
        ? {
            ...program,
            title: text(entry.content, "title") || program.title,
            summary: text(entry.content, "summary") || program.summary,
            image: mediaImage(entry.media) || program.image,
          }
        : program;
    }),
    sections,
    stories,
    publications,
    voice: voice
      ? {
          quote: text(voice.content, "quote")!,
          name: text(voice.content, "name")!,
          context: text(voice.content, "context") || "",
          image: mediaImage(voice.media),
        }
      : undefined,
  };
}

function validDate(value: unknown): string | undefined {
  return typeof value === "string" && Number.isFinite(Date.parse(value))
    ? new Date(value).toISOString()
    : undefined;
}

export function displayDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}
