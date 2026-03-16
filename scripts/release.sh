#!/bin/bash

# Autrex Release Script
# Bu script yeni bir release oluşturmanıza yardımcı olur

set -e

echo "🚀 Autrex Release Script"
echo "========================"
echo ""

# Mevcut versiyonu al
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📦 Mevcut versiyon: v$CURRENT_VERSION"
echo ""

# Yeni versiyon sor
echo "Yeni versiyon numarasını girin (örn: 1.2.0):"
read NEW_VERSION

if [ -z "$NEW_VERSION" ]; then
  echo "❌ Versiyon numarası gerekli!"
  exit 1
fi

echo ""
echo "📝 Değişiklikler:"
echo "v$CURRENT_VERSION → v$NEW_VERSION"
echo ""
echo "Devam etmek istiyor musunuz? (y/n)"
read CONFIRM

if [ "$CONFIRM" != "y" ]; then
  echo "❌ İptal edildi"
  exit 0
fi

# Versiyon güncelle
echo ""
echo "📝 package.json güncelleniyor..."
npm version $NEW_VERSION --no-git-tag-version

# Build al
echo ""
echo "🔨 Build alınıyor..."
npm run build

# Platform seç
echo ""
echo "Hangi platform için build almak istiyorsunuz?"
echo "1) Windows"
echo "2) macOS"
echo "3) Her ikisi (sadece macOS'ta çalışır)"
read PLATFORM

case $PLATFORM in
  1)
    echo "🪟 Windows build alınıyor..."
    npm run build:win
    ;;
  2)
    echo "🍎 macOS build alınıyor..."
    npm run build:mac
    ;;
  3)
    echo "🌍 Tüm platformlar için build alınıyor..."
    npm run build:all
    ;;
  *)
    echo "❌ Geçersiz seçim!"
    exit 1
    ;;
esac

echo ""
echo "✅ Build tamamlandı!"
echo ""
echo "📦 Build dosyaları dist/ klasöründe:"
ls -lh dist/*.{exe,dmg} 2>/dev/null || echo "Build dosyaları bulunamadı"
echo ""
echo "📋 Sonraki adımlar:"
echo "1. https://github.com/Spryzenweb/Autrex/releases/new adresine git"
echo "2. Tag: v$NEW_VERSION"
echo "3. Title: Autrex v$NEW_VERSION"
echo "4. dist/ klasöründeki dosyaları yükle"
echo "5. Release notlarını yaz"
echo "6. 'Publish release' butonuna tıkla"
echo ""
echo "🎉 Tamamlandı!"
