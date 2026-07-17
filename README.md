# みんなでごはん会 — STUDIO HOLIDAY

STUDIO HOLIDAY の取り組み「みんなでごはん会」を紹介する 1 枚もの縦スクロールの静的サイト。

- **スタック**: Astro (SSG) / TypeScript strict / Tailwind CSS v4 (`@tailwindcss/vite`, CSS-first) / 素の TS + Web Components(リアクティブ FW なし）
- **ランタイム / PM**: Bun
- **Lint/Format**: Biome(TS/JS/JSON）＋ Prettier（.astro）
- 設計判断とその根拠は [`DECISIONS.md`](./DECISIONS.md) を参照。

## セットアップ / 開発

```bash
bun install
bun run dev        # 開発サーバー (bunx --bun astro dev)
bun run build      # 本番ビルド → dist/
bun run preview    # dist/ をローカル配信
bun run check      # 型チェック (astro check)
bun run lint       # Biome
bun run fmt        # Prettier (.astro)
```

> Bun ランタイムで問題が出た場合のフォールバック: `npx astro build`（Node で実行）。

## 構成

```
astro.config.ts       # output:static / Astro標準画像サービス(Sharp) / @tailwindcss/vite
src/
  assets/site/        # astro:assets でビルド時最適化する画像ソース
  pages/index.astro    # 1 枚もの本体（固定背景 + 各セクションを合成 + 島の読み込み）
  layouts/BaseLayout.astro
  components/           # HeroZoom / VideoStage / MessageLead / InfoCard /
                        # PhotoSection / SiteFooter (.astro, 静的)
  scripts/             # Web Components（素 TS・ランタイム 0）
                        #   appear-observer / carousel
  data/content.ts      # 全 JP コピー・メタ（verbatim）
  styles/global.css    # @import "tailwindcss"; @theme{...}; + レイアウト CSS
public/
  assets/studio/       # 動画・提案資料など、固定URLで参照する公開アセット
  fonts/               # Zen Maru Gothic ページ専用サブセット（500 / 700）
  favicon.svg
_legacy/               # 移植元の手組みモック（参照専用・ビルド対象外）
studio-source/          # STUDIO 公開版の抽出物（DESIGN-SPEC.md / 生 CSS・HTML、参照専用）
```

## 主な演出

STUDIO 公開版に一致（設計規範は [`DESIGN.md`](./DESIGN.md)、実測仕様は `studio-source/DESIGN-SPEC.md`）。

- **固定背景**: 緑の葉パターンを全画面 `position: fixed` で敷き、以降のコンテンツがその上をスクロール。
- **ヒーロー ズーム**: sticky のヒーロー画像が **純 CSS `animation-timeline: scroll()`** でスクロール連動 `scale 1 → 1.4`（進捗 25% で 1.4 到達）。
- **動画 フェードイン**: 200vh 区間で sticky の動画が `filter: blur(100px)` から 2 秒かけて鮮明化。
- **appear**: 各要素がビューポート進入でフェード＋スライドイン（`appear-observer`）。
- **カルーセル**: 新大久保駅の写真を横スライド（自動再生、prev/next）。
- すべて `prefers-reduced-motion: reduce` で無効化（ヒーローは静止、全体スクロール可）。scroll ズームは `@supports` ガードで非対応ブラウザ（Firefox 安定版）も静止フォールバック。

## デザイン基盤

基準 1280px 中央 + `max-width: 840px / 540px` の 2 段メディアクエリで全幅レスポンシブ。配色・フォント・角丸トークンは Tailwind `@theme`（`--color-*` / `--font-*` / `--radius-*`）で定義し、素 CSS から `var(...)` 参照。日本語テキストは字間 `0.15em`・行間 `1.4`。
