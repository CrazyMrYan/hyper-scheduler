#!/bin/bash

# 获取当前版本
VERSION=$(node -p "require('./package.json').version")
echo "📦 Current version: v$VERSION"

# 构建文档
echo "🔨 Building documentation..."
yarn docs:build

# 创建临时目录
TEMP_DIR=$(mktemp -d)
echo "📁 Created temp directory: $TEMP_DIR"

# 克隆 gh-pages 分支
echo "📥 Cloning gh-pages branch..."
git clone --depth 1 --branch gh-pages https://github.com/CrazyMrYan/hyper-scheduler.git "$TEMP_DIR" || {
  echo "⚠️  gh-pages branch doesn't exist, creating new one..."
  mkdir -p "$TEMP_DIR"
  cd "$TEMP_DIR"
  git init
  git checkout -b gh-pages
  cd -
}

# 保存旧版本文档
if [ -d "$TEMP_DIR/versions" ]; then
  echo "💾 Preserving old versions..."
  cp -r "$TEMP_DIR/versions" docs/.vitepress/dist/
fi

# 创建版本目录
echo "📂 Creating version directory..."
mkdir -p "docs/.vitepress/dist/versions/v$VERSION"
cp -r docs/.vitepress/dist/* "docs/.vitepress/dist/versions/v$VERSION/" 2>/dev/null || true

# 生成版本列表
echo "📝 Generating version list..."
VERSIONS_JSON="docs/.vitepress/dist/versions.json"
echo "[" > "$VERSIONS_JSON"

# 扫描所有版本
FIRST=true
for dir in docs/.vitepress/dist/versions/*/; do
  if [ -d "$dir" ]; then
    VER=$(basename "$dir")
    if [ "$FIRST" = true ]; then
      FIRST=false
    else
      echo "," >> "$VERSIONS_JSON"
    fi
    echo "  \"$VER\"" >> "$VERSIONS_JSON"
  fi
done

echo "" >> "$VERSIONS_JSON"
echo "]" >> "$VERSIONS_JSON"

echo "✅ Version deployment prepared!"
echo "📋 Available versions:"
cat "$VERSIONS_JSON"

# 清理
rm -rf "$TEMP_DIR"
