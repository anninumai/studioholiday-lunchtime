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
astro.config.ts       # output:static / passthroughImageService / @tailwindcss/vite
src/
  pages/index.astro    # 1 枚もの本体（各セクションを合成 + 島の読み込み）
  layouts/BaseLayout.astro
  components/           # Hero / BackgroundBands / VideoSection / PinkSection /
                        # AccessSection / Creature / SiteFooter / MessageLayer (.astro, 静的)
  scripts/             # Web Components（素 TS・ランタイム 0）
                        #   zoom-fit / hero-zoom / appear-observer / carousel / scroll-lock-video
  data/content.ts      # 全 JP コピー・メタ（verbatim）
  styles/global.css    # @import "tailwindcss"; @theme{...}; + レイアウト CSS
public/
  assets/              # 画像・動画（事前最適化済み webp / mp4）
  fonts/               # Zen Maru Gothic サブセット（zen-local.css + 49 woff2）
  favicon.svg
_legacy/               # 移植元の手組みモック（参照専用・ビルド対象外）
```

## 主な演出（島）

- **TOP カーテンイントロ**（`intro-sequence`）: 画面を固定し、緑パターン背景はそのまま **のれん（白い暖簾）だけがスクロールで上昇** → 上がり切ると **動画がフェードイン＆頭(0)から再生** → 終了で **フェードアウト** → 下の **メッセージ（ピンクセクション）がフェードイン** → 解除して通常スクロール。控えめな「スキップ」あり。
- **appear**: 各要素がビューポート進入でフェード＋スライドイン
- **カルーセル**: 新大久保駅の写真を横スライド
- すべて `prefers-reduced-motion: reduce` で無効化（イントロは静的ヒーロー、全体スクロール可）

## デザイン基盤

横 1440px 固定デザインを JS の `zoom = innerWidth / 1440` で全幅フィット。ピクセル精密な絶対配置・破れエッジ（clip-path）は `global.css` の素 CSS、配色トークンは Tailwind `@theme`。
# -
