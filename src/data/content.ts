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
  // White message copy over the pink photo (message_bg). 5 paragraphs: line 1 is
  // the lead tagline (.msg--lead); line 4 is the long emotional line (.msg--long),
  // which uses "\n" for its 3 controlled line breaks (rendered as <br> in MessageLead).
  message: [
    "同釜共飲、毎週木曜、参加無料。",
    "STUDIO HOLIDAYが主催する「みんなでごはん会」。",
    "新大久保駅直結のキッチンスペースで開かれます。",
    "ごはんを食べながらだと、おしゃべりもはずむ。\n新しいアイデアも思いつく。\nなんだかいろいろ、うまくいく。",
    "お近くにお越しの際は、お立ち寄りください。",
  ],
  join: [
    "STUDIO HOLIDAYのキッチンスタッフが、腕によりをかけてお待ちしています。",
    "お越しの際はSTUDIO HOLIDAYメンバー、K,D,C,,,メンバーにお声がけください。",
  ],
  card: {
    role: "Design & Deploy Partner",
    name: "STUDIO HOLIDAY",
    time: "毎週木曜日12:00-13:00頃",
    addressLines: [
      "東京都新宿区百人町1丁目10−15JR",
      "新大久保駅ビル4F",
      "Kimchi, Durian, Cardamom,,,",
    ],
    access: "JR新大久保駅直結",
    mapLabel: "Google maps ",
    mapUrl: "https://maps.app.goo.gl/DJeuMw5D5rwiaYx99",
  },
  // 3-step access guide from the station to the 4F (all real photos). Captions are
  // numbered ①②③ so the order reads clearly. Add/remove entries freely.
  carousel: [
    {
      src: "/assets/studio/station.webp",
      width: 1200,
      height: 650,
      alt: "JR新大久保駅",
      caption: "① 階段を降りて大久保通り出口(右)へすすむ",
    },
    {
      src: "/assets/studio/access-street.webp",
      width: 1200,
      height: 650,
      alt: "新大久保駅前の通り（JR大久保方面の案内板）",
      caption: "② 改札を出てJR大久保方面(左)へすすむ",
    },
    {
      src: "/assets/studio/access-building.webp",
      width: 1200,
      height: 650,
      alt: "ビル入口の青いエレベーター（K,D,C,,, / ファクトリーキッチン 4F）",
      caption: "③ 建物の外端にある青いエレベーターで4Fまで上がる",
    },
  ],
  // Wide feature photo, shown at 605px height, centered.
  photo: {
    src: "/assets/studio/feature_photo.webp",
    width: 2400,
    height: 1410,
    alt: "",
    // Speech bubble the character says (see .speech in global.css).
    speech: '同じ釜の飯を食べて、"おなかま"に。',
  },
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
    // Credit shown next to the STUDIO HOLIDAY logo (the "/" separator is CSS).
    credit: "K,D,C,,,",
  },
} as const;
