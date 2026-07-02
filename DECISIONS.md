# DECISIONS

「みんなでごはん会」紹介サイト実装における CC 裁量の決定・根拠・参照。技術仕様案 v0.1 の「確定事項」を前提に、実装時点(2026-07)の最新情報を Web で確認して確定した。

## 環境・バージョン(exact 固定)

`bun install` 時に registry の最新安定版を確認して固定。`bun.lock` をコミット済み。

| パッケージ | 固定版 | 備考 |
| --- | --- | --- |
| astro | 7.0.5 | `output:'static'` は既定。`engines.node >=22.12.0` |
| @astrojs/check | 0.9.9 | 型チェック(`astro check`)。peer typescript `^5||^6` |
| typescript | 5.9.3 | 最新は 6.0.3 だが、ツール互換の安全側で 5.x を採用 |
| @tailwindcss/vite | 4.3.2 | Vite プラグイン方式(旧 @astrojs/tailwind は不使用) |
| tailwindcss | 4.3.2 | CSS-first(`@import "tailwindcss"` + `@theme`) |
| @biomejs/biome | 2.5.2 | lint/format |
| prettier | 3.9.4 | `.astro` のフォーマット用 |
| prettier-plugin-astro | 0.14.1 | 同上 |

- ランタイム/PM: **Bun 1.3.14**。Astro は `bunx --bun astro …` で Bun ランタイム実行。ローカルの Node は `v24.12.0`(`>=22.12.0` を満たす。研究時の「Node 23+ 非対応」という記述は誤りで、実測で 24 系ビルド成功)。
- Bun での `astro build`・`bun install`・inline スクリプトのバンドルはすべて成功。フォールバック(`npx astro build`)は不要だったが、Bun 側で問題が出た場合の退避策として README に記載。

参照: Astro Install & Setup / Configuration Reference、`docs.astro.build`。Bun+Astro recipe `docs.astro.build/en/recipes/bun/`。

## 決定 1: リアクティブ UI = ① 素の TS + Web Components(Svelte 不採用)

- **結論**: フレームワークランタイムを一切載せない。`@astrojs/svelte`・`svelte` は導入しない。
- **根拠(ルーブリック §4 を適用)**: 5 つのインタラクション(レスポンシブ zoom / hero スクロールズーム / appear-on-scroll / カルーセル / 動画スクロールロック＋メッセージ)はすべて**ローカルかつ命令的**(イベント→直接 DOM 操作)。島間で共有する状態も、派生状態も、状態からのテンプレート再レンダリングも無い。→ ルーブリック①が**規定の結論**であり逸脱ではない。
- **実装**: `src/scripts/` に 1 機能 1 ファイルの Web Component(`zoom-fit` / `hero-zoom` / `appear-observer` / `gohan-carousel` / `scroll-lock-video`)。`src/scripts/index.ts` で `customElements.define`。`index.astro` 末尾の `<script>` 1 本で読み込み → Astro が **inline module(約 3.6KB)** にバンドル。島外 JS ゼロ、FW ランタイム 0KB。
- **将来の拡張余地**: 中規模の状態(島間共有・動的リスト等)が必要になったら、ルーブリック②に従い `bun add -E svelte @astrojs/svelte` → `svelte.config.js`(`vitePreprocess()`)→ `astro.config.ts` の `integrations:[svelte()]` を追加し、当該コンポーネントのみ `.svelte` 化。「1 プロジェクト 1 FW」は維持。

参照: Astro Framework Components / Client Directives、`docs.astro.build`。

## 決定 2: 画像 = Sharp 不使用・`passthroughImageService()` + 事前最適化 webp + 素の `<img>`

- **Sharp 検証結果**: Bun 環境で Sharp(ネイティブモジュール)は不安定。本プロジェクトは画像が既に手作業で webp 最適化済み・レイアウトが固定ピクセルのため、ビルド時変換の利点が無い。→ `astro.config.ts` で `image: { service: passthroughImageService() }`(`astro/config` からの export を実測確認)。Sharp は **install しない**。
- **`<img>` 方針**: `astro:assets` の `<Image>` は使わず素の `<img>`(`src=/assets/...`、`public/` の安定 URL)。背景画像(葉パターン)は CSS の `url(/assets/...)`。
- **CLS 対策**: 全 `<img>`/`<video>` に intrinsic 由来の `width`/`height` 属性を付与(CSS で表示幅を制御、比率は属性で確保)。検証で 3 幅とも横スクロール 0・レイアウトシフト無し。
- **フォールバック(不要だが記録)**: どうしても astro:assets 変換が要る場面が出たら、CI で `npm i --no-save sharp` の後に `astro build`。本番では不要。

参照: Astro Images / Image Service API、`docs.astro.build/en/guides/images/`。

## 決定 3: Lint/Format = Biome(TS/JS/JSON)＋ Prettier(.astro)

- Biome を TS/JS/JSON に適用(`preset: "recommended"`)。**CSS は Biome 対象外**(`!**/*.css`): Tailwind v4 の `@theme` 等を Biome CSS パーサが解釈できないため。`global.css` は Tailwind/手管理、フォント CSS はベンダー物。
- `.astro` は Biome の実験的対応で誤検知が出るため **Prettier + prettier-plugin-astro** に委譲。Svelte 不採用のため `.svelte` は対象外。
- `_legacy/` `dist/` `.astro/` `public/` `bun.lock` は Biome 対象外。
- スクリプト: `bun run lint`(biome)/ `bun run fmt`(prettier .astro)/ `bun run check`(astro/tsc)。全て green。

参照: Biome Language Support / v2 系ブログ、`biomejs.dev`。

## 決定 4: アセット・フォント配置 = `public/` 直下

- 素 `<img>`・CSS `url()` に安定 URL が必要 → `public/assets/`。
- フォントは事前サブセット woff2 49 個 + `zen-local.css`(相対 `url(./zmg_*)`)。**無改変**で `public/fonts/` に配置し、`<head>` に `<link rel="stylesheet" href="/fonts/zen-local.css">` で読み込み(Vite バンドルを通さず相対 URL をそのまま解決)。unicode-range サブセットによりブラウザは必要分のみ取得。Astro Fonts API は 49 個の事前サブセットには過剰と判断。

## 決定 5: レイアウト = 固定 1440px + JS `zoom` を踏襲

- 実測再現済みの proven な方式。座標・clip-path・sticky・scroll 計算がこの前提で成立。`transform: scale()` へ変えるとスクロール高さ計算が破綻するため方式は変えない。
- 全幅フィット: `zoom = innerWidth/1440`(上限なし)で任意幅を埋める。検証で 390/1440/1920 とも左右余白 0。
- **横スクロール対策**: hero の箸が 1440 を約 19px はみ出す(元デザイン由来)。`html, body { overflow-x: clip }` で非表示(`hidden` と違い scroll container を作らず sticky を壊さない)。
- sticky hero は `<hero-zoom>`/`<zoom-fit>`(`display:contents`)でラップしても containing block は `.page` のままで正常動作を検証済み。

## 決定 6: 既存ディレクトリを in-place で Astro 化

- 現行 `index.html`/`styles.css`/`logo_hero_master.png` を `_legacy/` に退避(視覚回帰の参照)。`.claude/` 設定を保持。

## 決定 7: TOP を「のれんカーテン」固定イントロに再構築（更新）

旧 TOP（ロゴ拡大 sticky hero ＋ 下段の別動画セクション ＋ #msg-layer オーバーレイ）を廃止し、1 つの**固定オーバーレイのイントロ**に統合。
- **メカニズム**: `<intro-sequence>`（素 TS Web Component, `src/scripts/intro-sequence.ts`）＋ `IntroStage.astro`。プログレッシブエンハンスメント: 既定（no-JS/reduced-motion）は **in-flow の静的ヒーロー**（`.intro-stage { position:relative; height:100svh }`、のれん中央・動画非表示・スクロール自由）。JS（非 reduced-motion）が `.is-active` を付け **`position:fixed` の固定オーバーレイ**にし、`document.body.overflow=hidden` でロック。旧「sticky トラック」案は空きスクロール領域が出るため採用せず、この固定オーバーレイ方式に変更。
- **フロー**（状態機械 `rise→video→fading→done`）: 緑葉パターン背景は固定。wheel/touch/key の入力で `p` を増やし **のれんだけ translateY で上昇**（`p=Δ/rise`, `rise=(innerH+norenH)/2+40`）。`p>=1` で **動画を `.show` フェードイン＋`currentTime=0; play()`**。`ended`（＋フォールバックタイマー）で **動画フェードアウト** → `finish()` で **カーテンを `fade-out` で消して下の**ピンクセクション（＝メッセージ: ピンク帯＋破れ枠の集合写真＋白コピー）**を出現** → ロック解除 → 以降通常スクロール。**スキップ**: `.intro-skip` ボタン／動画中の入力で `endVideo` に早送り。
- **`ended` リスナ必須**: 自然終了で即メッセージへ遷移させるため `video.addEventListener("ended", endVideo)` を必ず配線（フォールバックタイマーだけだと遅延するバグを修正済み）。
- **レイアウト**: 下段は単一の `.page`（`zoom-fit` 対象）。旧 hero/green-light 帯を削除し、ピンク帯・dense 緑帯・写真・コピー・カード・キャラ・フッターの top を **一律 −2050px** シフト（pink 0 / dense 1070 / footer 2206、`.page height:2460`）。pink の torn `clip-path` は帯内部座標のため不変。`.page` 背景に light 緑パターンを敷き、pink 上端の破れから緑が覗く。
- **アセット**: `暖簾.png`(5760×4068, 上部が opaque 白＝白のれん) → `public/assets/noren.webp`(2560×1808, PIL)。透過ではなく白地なので「白いのれんが上がって背後の緑が現れる」挙動になる。
- **reduced-motion**: イントロは静的ヒーロー、`.intro-video`/`.intro-skip` は `display:none`、のれんは中央固定、ロックなし。全要素スクロールで到達可（トラップなし）。
- **削除**: `Hero.astro`/`VideoSection.astro`/`MessageLayer.astro`/`hero-zoom.ts`/`scroll-lock-video.ts`、`content.hero`/`content.message`、`#msg-layer` CSS。
- **検証**: Puppeteer で **21/21 pass**（固定ロック→のれん上昇→動画フェードイン＆頭出し再生→`ended`でフェードアウト→ピンク出現→解除→フッター到達／reduced-motion 静的・非ロック／3 幅 full-bleed／コンソールエラー 0）。視覚: 4 状態（のれん/上昇/動画/メッセージ）を確認。

## パフォーマンス実測(preview ビルド)

- 初期 HTML 7KB(inline module JS 約 3.6KB + critical CSS 含む)、外部 CSS 10KB、**FW ランタイム 0**。フォントは on-demand、動画は `preload="metadata"`。
- 目標(Lighthouse Perf≥95 / CLS<0.05 等)はローカルでは十分達成見込み。**本番の実測はデプロイ後に CDN/圧縮込みで再確認**(保留)。

## 検証結果

Puppeteer(システム Chrome)で 1440/1920/390 + reduced-motion を自動検証: **24/24 pass**。full-bleed(横スクロール 0)、hero ズーム(1→1.4)、appear、カルーセル、スクロールロック→再生→`ended`でメッセージ→解除、reduced-motion 無効化、コンソールエラー 0。視覚回帰: 元サイトと全セクション一致。

## 人の確認が必要(保留)

1. **対象ブラウザ範囲**: 既定は modern evergreen(`zoom` / `overflow:clip` 対応 = Chromium/Safari 16.4+/最近の Firefox。Tailwind v4 の baseline と一致)。より広い対応が必要なら要相談。
2. **デプロイ先 / CI / git**: 出力は host 非依存の静的 `dist/`。ホスト・CI・git 初期化の要否は未定(Sharp 不使用のため CI での sharp 対応は不要)。
3. **モバイル Safari の動画自動再生**: `muted playsinline` + スクロールロック時 `currentTime=0; play()` は実機での最終確認が望ましい(レガシーで動作実績あり)。
4. **カルーセルの reduced-motion**: レガシー未定義のため現状維持(transition 有効)。無効化希望なら要相談。
