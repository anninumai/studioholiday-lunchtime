// All Japanese copy, verbatim. Single source of truth for the page content.
// Do not "normalize" characters (full-width hyphen 「−」, commas, etc.).

export const content = {
  meta: {
    title: "みんなでごはん会 | STUDIO HOLIDAY",
    description: "みんなでごはんを食べる会を開催中 — by HOLIDAY KITCHEN / K,D,C,,,",
  },
  noren: {
    src: "/assets/noren.webp",
    width: 2560,
    height: 1808,
    alt: "みんなでごはん会 同釜共食 by HOLIDAY KITCHEN / K,D,C,,,",
  },
  pink: {
    photo: {
      src: "/assets/pink_photo_full.webp",
      width: 2560,
      height: 1984,
      alt: "みんなでごはん会の様子",
    },
    c1: ["こんにちは、スタジオホリデーです。", "詳細、メッセージは仮置きです。"],
    c2: "みんなでごはんを食べる会を開催中",
    c3: [
      "同じ釜の飯を食うという体験から",
      "新しい体験や仕事をしようよと",
      "コラボレーションが生まれることが僕たちは大好きです。",
    ],
  },
  join: [
    "ご参加、興味のある方はお気軽に",
    "スタホリメンバーにお声がけください。メッセージは仮置きです。",
  ],
  card: {
    name: "株式会社STUDIO HOLIDAY",
    time: "毎週木曜日12:00-13:00頃",
    address: "東京都新宿区百人町1丁目10−15JR新大久保駅ビル4F",
    tagline: "Kimchi, Durian, Cardamom,,,",
    access: "JR新大久保駅から徒歩1分",
    mapLabel: "Google maps",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=東京都新宿区百人町1丁目10-15",
  },
  carousel: {
    caption: "階段を降りて大久保通り出口(右)へすすむ",
    slides: [
      { src: "/assets/station.webp", alt: "JR新大久保駅" },
      { src: "/assets/station.webp", alt: "JR新大久保駅" },
      { src: "/assets/station.webp", alt: "JR新大久保駅" },
    ],
  },
  video: { src: "/assets/logo_video.mp4", width: 1147, height: 645 },
  chopsticks: [
    { src: "/assets/chopstick1.webp", cls: "one", width: 364, height: 600 },
    { src: "/assets/chopstick2.webp", cls: "two", width: 307, height: 600 },
  ],
  creature: { src: "/assets/creature.webp", width: 1200, height: 705 },
  footer: {
    logo: { src: "/assets/footer_logo.webp", width: 235, height: 152, alt: "みんなでごはん会" },
    wordmark: {
      src: "/assets/footer_wordmark.webp",
      width: 600,
      height: 41,
      alt: "by HOLIDAY KITCHEN / K,D,C,,,",
    },
  },
} as const;
