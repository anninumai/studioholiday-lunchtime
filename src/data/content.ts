// All Japanese copy, verbatim. Single source of truth for the page content.
// Do not "normalize" characters (full-width hyphen 「−」, triple comma 「,,,」, etc.).
// Assets are the optimized STUDIO originals under /assets/studio/.

export const content = {
  meta: {
    title: "みんなでごはん会 | STUDIO HOLIDAY",
    description: "みんなでごはんを食べる会を開催中 — by HOLIDAY KITCHEN / K,D,C,,,",
  },
  // Section background images (bg pattern / message / access photos) are owned by
  // global.css (fixed & ::before layers), not referenced here.
  // Hero image (not pinned) that scroll-zooms 1 -> 1.4 as the section scrolls past.
  hero: {
    src: "/assets/studio/hero.webp",
    width: 2400,
    height: 1630,
    alt: "みんなでごはん会 同釜共食 by HOLIDAY KITCHEN / K,D,C,,,",
  },
  // Noren: the cloth itself is drawn in the SVG (NorenHero); this is the center
  // emblem printed on it (its #f2f2f2 background was keyed to transparent).
  noren: {
    logo: "/assets/noren-logo.webp",
    tabs: "/assets/noren-tabs.webp", // hand-drawn tab strip threaded on the rod
    alt: "みんなでごはん会ののれん",
  },
  // Sticky logo video that blurs into focus.
  video: { src: "/assets/studio/intro_video.mp4", width: 1920, height: 1080 },
  // White message copy over the green background. 3rd line has a <br>.
  message: [
    "こんにちは、スタジオホリデーです。詳細、メッセージは仮置きです。",
    "みんなでごはんを食べる会を開催中",
    [
      "同じ釜の飯を食うという体験から新しい体験や仕事をしようよと",
      "コラボレーションが生まれることが僕たちは大好きです。",
    ],
  ],
  join: [
    "ご参加、興味のある方はお気軽に",
    "スタホリメンバーにお声がけください。メッセージは仮置きです。",
  ],
  card: {
    name: "株式会社STUDIO HOLIDAY",
    time: "毎週木曜日12:00-13:00頃",
    addressLines: ["東京都新宿区百人町1丁目10−15JR新大久保駅ビル4F", "Kimchi, Durian, Cardamom,,,"],
    access: "JR新大久保駅から徒歩1分",
    mapLabel: "Google maps ",
    mapUrl: "https://maps.app.goo.gl/DJeuMw5D5rwiaYx99",
  },
  // Carousel slides. Slide 1 is the real photo; slides 2-4 are mock placeholders
  // to be swapped for real images later — drop files into public/assets/studio/
  // and update src / width / height / alt / caption here (add or remove entries freely).
  carousel: [
    {
      src: "/assets/studio/station.webp",
      width: 1200,
      height: 650,
      alt: "JR新大久保駅",
      caption: "階段を降りて大久保通り出口(右)へすすむ",
    },
    {
      src: "/assets/studio/slide-placeholder-2.webp",
      width: 1200,
      height: 650,
      alt: "",
      caption: "（写真2・差し替え予定）",
    },
    {
      src: "/assets/studio/slide-placeholder-3.webp",
      width: 1200,
      height: 650,
      alt: "",
      caption: "（写真3・差し替え予定）",
    },
    {
      src: "/assets/studio/slide-placeholder-4.webp",
      width: 1200,
      height: 650,
      alt: "",
      caption: "（写真4・差し替え予定）",
    },
  ],
  // Wide feature photo, shown at 605px height, centered.
  photo: { src: "/assets/studio/feature_photo.webp", width: 2400, height: 1410, alt: "" },
  footer: {
    logo: {
      src: "/assets/studio/footer_logo.webp",
      width: 235,
      height: 152,
      alt: "みんなでごはん会",
    },
    wordmark: {
      src: "/assets/studio/footer_wordmark.webp",
      width: 930,
      height: 64,
      alt: "by HOLIDAY KITCHEN / K,D,C,,,",
    },
  },
} as const;
