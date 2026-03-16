@echo off
REM Autrex Release Script for Windows
REM Bu script yeni bir release oluşturmanıza yardımcı olur

echo.
echo 🚀 Autrex Release Script
echo ========================
echo.

REM Mevcut versiyonu göster
for /f "tokens=*" %%i in ('node -p "require('./package.json').version"') do set CURRENT_VERSION=%%i
echo 📦 Mevcut versiyon: v%CURRENT_VERSION%
echo.

REM Yeni versiyon sor
set /p NEW_VERSION="Yeni versiyon numarasını girin (örn: 1.2.0): "

if "%NEW_VERSION%"=="" (
  echo ❌ Versiyon numarası gerekli!
  exit /b 1
)

echo.
echo 📝 Değişiklikler:
echo v%CURRENT_VERSION% → v%NEW_VERSION%
echo.
set /p CONFIRM="Devam etmek istiyor musunuz? (y/n): "

if /i not "%CONFIRM%"=="y" (
  echo ❌ İptal edildi
  exit /b 0
)

REM Versiyon güncelle
echo.
echo 📝 package.json güncelleniyor...
call npm version %NEW_VERSION% --no-git-tag-version

REM Build al
echo.
echo 🔨 Build alınıyor...
call npm run build

REM Windows build
echo.
echo 🪟 Windows build alınıyor...
call npm run build:win

echo.
echo ✅ Build tamamlandı!
echo.
echo 📦 Build dosyaları dist\ klasöründe:
dir /b dist\*.exe 2>nul || echo Build dosyaları bulunamadı
echo.
echo 📋 Sonraki adımlar:
echo 1. https://github.com/Spryzenweb/Autrex/releases/new adresine git
echo 2. Tag: v%NEW_VERSION%
echo 3. Title: Autrex v%NEW_VERSION%
echo 4. dist\ klasöründeki dosyaları yükle
echo 5. Release notlarını yaz
echo 6. 'Publish release' butonuna tıkla
echo.
echo 🎉 Tamamlandı!
pause
