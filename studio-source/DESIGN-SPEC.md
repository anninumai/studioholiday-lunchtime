# STUDIO 版デザイン仕様（抽出結果）

対象: `https://preview.studio.site/live/BVqXp0GwqR`（STUDIO＝Nuxt CSR。chrome-devtools MCP でレンダリング後の実 DOM / 実 CSS / 計算済み値を抽出）。
これは「見た目を合わせる」ための一次情報。数値はすべて STUDIO が実際に出している実値（目分量ではない）。

## 抽出物の所在（`studio-source/src/`）
- `css/studio-inline.css` — STUDIO 生成のデザイン CSS（`.sd[data-s-<uuid>]{...}` 104 ルール、実値）。**最重要の一次ソース**。
- `studio-rendered.html` — レンダリング後の実 DOM 構造（`data-s-<uuid>` 付き）。
- `css/studio-entry.css` — STUDIO ランタイム基底 CSS（`.section`/`.sticky`/`.image`/`.appear`/`.text` の土台、42KB minified）。
- `css/google-fonts.css` — Zen Maru Gothic + Lato の @font-face 参照。
- `assets/` — 実アセット 7 点（下表）。
- `data/raw-extract.json` — 生の抽出データ（inlineCss + canvasHtml）。

## グローバル
- **body**: `background:#ffffff`（`transition: background .5s`）。**ピンクは CSS 色ではなく写真由来**（現行リポの `#ef5b9f` 色帯は STUDIO 版に無いが、message1 の背景は**ピンク調の写真**。§4 参照）。メッセージ文字は白 `#ffffff`。
- **デザイン幅**: 1280px 基準（カード 956px、フッター内側 1280px、`.image` 全幅）。
- **ブレークポイント**: `max-width: 840px`（タブレット）/ `max-width: 540px`（モバイル）の 2 段。
- **フォント**: 本文 `--s-font-0aa45100: 'Zen Maru Gothic'`（リポの自己ホストと一致）/ `--s-font-9d9e02e5: Lato`。
- **タイポ共通**: `letter-spacing: 0.15em`、`line-height: 1.4`、`.text { margin:0; padding:0 }`。
- **配色トークン**: 白 `#ffffff` / 墨 `#333333` / 緑 `#6ab31d`（`#6ab31e` の揺れあり）/ ホバー朱 `#ff5035` / 区切り線 `#e6e6e6` / プレースホルダ灰 `#EEEEEE`。

## アセット対応表
| ローカルファイル | 実寸 | 実体形式 | 役割 |
| --- | --- | --- | --- |
| `assets/pattern_5760x4096.webp` | 5760×4096 | PNG(16MB!) | 緑葉パターン**固定背景**（`.image:before`, `background-size:cover; repeat`） |
| `message_bg.webp`（STUDIO `s-5756x5100…73f8fdb7_regular`, 実配信1799×1594） | — | WebP | **メッセージ1のピンク写真背景**（`7613af40 .image::before`, cover 50%/50%）。破れ枠＋厨房集合写真＋のれん。→ `public/assets/studio/message_bg.webp` |
| `access_bg.webp`（STUDIO `s-5760x6416…695730b3_regular`, 実配信1615×1800） | — | WebP | **メッセージ2の緑パターン写真背景**（`5929934b .image::before`, cover 50%/50%）。→ `public/assets/studio/access_bg.webp` |
| `assets/sticky_5760x3912.webp` | 5760×3912 | PNG | **ヒーロー画像**（sticky, スクロール連動で scale 1→1.4 ズーム） |
| `assets/video_1920x1080.mp4` | 1920×1080 | MP4 | ロゴ動画（sticky, `blur(100px)`→鮮明にフェードイン, autoplay/playsinline/muted相当） |
| `assets/photo_5760x3384.webp` | 5760×3384 | PNG | creature セクションの横長画像（表示高 605px） |
| `assets/station_1940x1052.webp` | 1940×1052 | WebP | カルーセルの新大久保駅写真（7 スライド全て同一画像） |
| `assets/footer_logo_235x152.webp` | 235×152 | PNG | フッターロゴ（表示幅 144px） |
| `assets/footer_wordmark_1102x76.webp` | 1102×76 | PNG | フッターワードマーク（表示高 32px） |

> 注: `_v-frms_webp_` 変種は URL 拡張子が .webp でも実体は PNG。パターンは 16MB と巨大 → クローン時に webp 再エンコード/リサイズ推奨。

## ページ構成（上→下）と実値

DOM: `.render-canvas > .StudioCanvas > div[66e5ee07]`（flex column, bg #fff, 全高 5866px @1268幅）。

### 1. 固定背景セクション（`f3fc34d7` `.section.fixed`）
`position:fixed; inset:0; width:100%; height:100vh; z-index:0; background:#FFFFFF`。
内側 `.image`(`0ee97add`) の `::before` に緑パターン（`pattern_5760x4096`）: `position:absolute; inset:0; background-size:cover; background-position:50% 50%; background-repeat:repeat`。
→ **常時画面いっぱいに緑パターンが固定表示**され、以降のコンテンツがその上をスクロール。

### 2. ヒーロー・ズーム（`cf644bd5`, height 1524px）
スクロール連動アニメ:
```
animation-timeline: scroll(); animation-timing-function: linear; animation-fill-mode: both;
@keyframes { 0%{scale:1 1} 25%{scale:1.4 1.4; translate:0 0} 100%{scale:1.4 1.4} }
```
子 `.sticky`(`dacc1ea0`, `position:sticky; top:0; height:100%`) 内に `<img>`(`2d333973`, width:100%, height:auto) = `sticky_5760x3912`。
→ **スクロール量に応じて 1→1.4 倍にズーム**（25% 地点で 1.4 に達し以降維持）。
→ **注意（実測で確認）**: CSS には `position:sticky` があるが `height:100%`（= 親 cf644bd5 の 1524px と同一）のため sticky は**実質無効**で、ヒーロー画像は**pin されず普通に上へ流れながら**ズームする（実測: scrollY 0/400/800 で img top = 0/-498/-996）。クローンでは sticky を付けず（付けると最上部に余白が出る）、セクションに scale アニメだけを掛けて同挙動を再現している。

### 3. 動画（`06981576`, height **200vh**）
子 `.image.sticky`(`b13120cd`, `position:sticky; top:0; height:100vh; flex center`, ::before に緑パターン)。
内側 `<video>`(`a91a2a18`, `height:100vh; width:auto; object-fit:contain`, autoplay playsinline)= `video_1920x1080`。
appear 演出: `filter:blur(100px); opacity:0` →（`.appear-active`）`transition:2000ms ease-in-out` で鮮明化。
→ **200vh の区間で動画が中央 sticky。ビューポート進入で blur から 2 秒かけてフェードイン。**

### 4. メッセージ 1（`efa86fdf`>`b557b8e2`>`7613af40` `.image`, height 1280px）
**背景 = ピンク写真**（`7613af40 .image::before` に `message_bg` を `cover 50%/50%`。画像は上=破れ枠＋厨房集合写真、下=ピンク無地）。`7613af40` は `justify-content:flex-end` で**テキスト群を下部に寄せる**。
`202c7f14`(height 385px, flex column center, gap 16px) に白文字 3 本（`color:#ffffff; font-size:16px; font-weight:700; letter-spacing:0.15em; line-height:1.4`）。各行は `width:auto`（例: 1行目 588px）で `align-items:center` により**中央寄せの塊**として配置（`text-align` 自体は left/left/center だが単一行はシュリンク中央のため見た目は全行中央）:
- 「こんにちは、スタジオホリデーです。詳細、メッセージは仮置きです。」
- 「みんなでごはんを食べる会を開催中」
- 「同じ釜の飯を食うという体験から新しい体験や仕事をしようよと<br>コラボレーションが生まれることが僕たちは大好きです。」
→ ピンク写真の下半分（ピンク無地部）に白文字が中央配置。

> **抽出時の教訓**: `.image::before` の背景画像は**遅延ロード**で、初回（スクロール前）取得の HTML では空だった。全画面スクロールで発火後に再取得しないと、この message1(ピンク) / message2(緑) の背景写真を**見落とす**（実際に一度見落とした）。

### 5. メッセージ 2 + 情報カード（`6e47951a`>`bbbbdce4`>`5929934b`, height 1280px）
**背景 = 緑パターン写真**（`5929934b .image::before` に `access_bg` を `cover 50%/50%`）。この 1 枚の背景の上に join 文・白カード・特集写真(§6)が乗る（§6/§7 は 5929934b の入れ子）。
- `8e7dadfb`(margin 88px 0 48px, gap16) 白文字 `cb5fbb14`(16px/700/center): 「ご参加、興味のある方はお気軽に<br>スタホリメンバーにお声がけください。メッセージは仮置きです。」
- **白カード** `3a29b1ab`: `background:#fff; border-radius:20px; width:956px; height:380px; padding:40px; flex-direction:row; justify-content:space-between`。SP では column / width calc(100%-40px) / margin20 / padding20 / gap16。
  - **左** `b3de5c78`(width:380px, flex column, gap16, justify center) 墨文字 #333:
    - `56b3668c`「株式会社STUDIO HOLIDAY」font-size:20px; weight:500
    - `9964c483`「毎週木曜日12:00-13:00頃」16px/500
    - `dcc75fce`「東京都新宿区百人町1丁目10−15JR新大久保駅ビル4F<br>Kimchi, Durian, Cardamom,,,」16px/500
    - `4e69dd87`「JR新大久保駅から徒歩1分」16px/500
    - `9c9194cc`「Google maps 」16px/500（リンク想定）
  - **右** `7e54daef`(width:441px): **カルーセル** `a00788c0`(`data-type="carousel"`, height:302px, overflow hidden, flex row, padding-bottom 80px→64(840)→48(540)):
    - トラック `d0afec7e`: 7 スライド。各 `6d6ba184` > `<img>`(`ca63bd28`, `border-radius:8px`, station 画像) + キャプション `f9bac137`(12px/500)「階段を降りて大久保通り出口(右)へすすむ」。SP で slide 幅 440(840)/280(540)、画像高 240(840)/160(540)。track に `_animatingNext/_animatingPrev`→`translateX(∓100%)` のスライド遷移、`transition-timing-function: cubic-bezier(0.58,0.21,0.41,0.96)`。自動再生（`_playing`）。
    - ナビ `58974f0c`(`position:absolute; bottom:0; left:0; right:0; flex row; gap16; z-index:3`): prev/next 円形ボタン `145b056f`/`5345dbf0`（`width/height:20px; border:1px solid #6ab31d; border-radius:50%; background:#fff; hover→background:#ff5035`）、アイコン色 #6ab31d（hover 時 #fff）。SP で 32px。

### 6. creature セクション（`ef459eec`, height 780px → SP 450px）
`bd4acc88` > `<img>`(`88d9e5bf`, `height:605px; width:auto`)= `photo_5760x3384`（横長）。中央配置。

### 7. フッター（`a057a690` `<footer>`）
`background:#fff; border-radius:80px 80px 0 0; position:absolute; bottom:0; left:0; right:0; width:100%; padding:64px 40px 24px; gap:60px; z-index:1`。SP で padding 縮小。
- `3e74eb9d`(width:1280px, flex column, gap24) > `f83cd459`(flex row, gap40, center; 840 で column):
  - `22c050a3`(flex, gap16): ロゴ `efb90e6a`(width:144px)= footer_logo / ワードマーク `2530890d`(height:32px)= footer_wordmark。SP で共に height 28px。
  - 区切り線 `7e17a473`: `background:#e6e6e6; height:1px; width:100%`。

## 現行リポとの主な差分（= 直すべき点）
1. **イントロ演出が別物**: リポ＝「白のれんが上昇→動画→ピンクメッセージ」の JS 状態機械。STUDIO＝「固定緑パターン + sticky ヒーロー画像の scale ズーム(1→1.4) + sticky 動画の blur フェードイン」を **CSS `animation-timeline: scroll()`（scroll-driven animation）** で実現。
2. **ピンクは写真、色帯ではない**: 現行リポの `#ef5b9f` 色帯は不使用だが、message1 の背景は**ピンク調の写真**（`message_bg`）、message2 は**緑パターン写真**（`access_bg`）。メッセージ文字は各背景の上に白で中央配置。
3. **デザイン幅 1440→1280**、ブレークポイント（リポは JS zoom 全幅フィット、STUDIO は 840/540 の MQ + 1280 中央）。
4. **情報カード**: 白角丸カード(956×380)に会社情報＋カルーセルを横並び（リポは AccessSection 構成が別）。
5. **フッター**: 角丸上部(80px)の白フッター＋ロゴ2点＋区切り線。
6. **アセット差し替え**: 上表の 7 点に。チョッキ(chopstick)・のれん(noren.webp)・pink_photo 等リポ固有アセットは STUDIO 版では未使用。

## 未確定・要判断
- 公開 URL（本番）未提供 → プレビュー基準。ホバー/自動再生等は本番と差の可能性。
- `scroll()` timeline は Chrome/Edge 115+ 等モダンのみ。Safari/Firefox 用フォールバック要否は方針次第。
- ライセンスフォント無し（Zen Maru Gothic は Google Fonts 無料）→ フォント持ち込み問題なし。
