#!/usr/bin/env bash
# 現在の作業ツリーから、メインページの自己完結した静的保存版を生成する。
#
#   出力: public/archives/main-before-zabuton/   （閲覧 URL /archives/main-before-zabuton/）
#         backups/main-before-zabuton-source.tar.gz
#
# 保存版はローカル (base=/) でも GitHub Pages (base=/studioholiday-lunchtime/) でも
# 開けなければならないので、絶対パスではなく相対パスに落とす。センチネル base で
# ビルドし、後処理で "./" に置換する。
#   - astro.config.ts が inlineStylesheets:"always" なので CSS は HTML 内に全量インライン
#   - 生成される JS チャンクは相対 import のみで絶対パス文字列を含まない
#   → 相対化が必要なのは index.html 1 ファイルだけ
#
# 注意: このスクリプトは「今の作業ツリー」を写す。コミット済みの保存版は座布団
# 再構成に着手する前の状態から生成したもの。撮り直す場合は対象のコミットを
# チェックアウトしてから実行すること。
set -euo pipefail

cd "$(dirname "$0")/.."

SENTINEL="/__ARCHIVE_BASE__/"
ARCHIVE_DIR="public/archives/main-before-zabuton"
TARBALL="backups/main-before-zabuton-source.tar.gz"

# ---- 1. 復元用ソース --------------------------------------------------------
echo "==> $TARBALL"
mkdir -p backups
tar czf "$TARBALL" \
  --exclude="./public/archives" \
  --exclude=".DS_Store" \
  ./src ./public ./.github \
  ./astro.config.ts ./tsconfig.json ./package.json ./bun.lock \
  ./biome.json ./.prettierrc.json ./.gitignore \
  ./README.md ./DESIGN.md ./DECISIONS.md

# ---- 2. センチネル base でビルド --------------------------------------------
# SITE_URL は渡さない → Astro.site 未設定 → canonical を出力しない
# （保存版が本番ページの canonical を名乗らないように）
echo "==> astro build (base=$SENTINEL)"
BASE_PATH="$SENTINEL" bunx --bun astro build

# ---- 3. dist/ を保存版へ複製 ------------------------------------------------
# proposal-layout / proposals は比較案であって「変更前のメインページ」ではないので除外
echo "==> $ARCHIVE_DIR"
rm -rf "$ARCHIVE_DIR"
mkdir -p "$ARCHIVE_DIR"
rsync -a --exclude="proposal-layout" --exclude="proposals" --exclude="archives" \
  dist/ "$ARCHIVE_DIR/"

# ---- 4. index.html の後処理 -------------------------------------------------
sed -i '' "s#${SENTINEL}#./#g" "$ARCHIVE_DIR/index.html"
sed -i '' 's#<meta charset="utf-8">#<meta charset="utf-8"><meta name="robots" content="noindex,nofollow">#' "$ARCHIVE_DIR/index.html"

# ---- 5. 検証 ----------------------------------------------------------------
if grep -rq "__ARCHIVE_BASE__" "$ARCHIVE_DIR"; then
  echo "!! センチネルが残っている" >&2; exit 1
fi
if grep -Eq '(src|href)="/[^/]' "$ARCHIVE_DIR/index.html"; then
  echo "!! 絶対パスが残っている:" >&2
  grep -Eo '(src|href)="/[^"]*"' "$ARCHIVE_DIR/index.html" | sort -u >&2
  exit 1
fi
echo "==> OK ($(du -sh "$ARCHIVE_DIR" | cut -f1) / $(du -h "$TARBALL" | cut -f1))"
