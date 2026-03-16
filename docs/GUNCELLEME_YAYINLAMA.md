# Güncelleme Yayınlama Rehberi

Bu dokümantasyon, Autrex için yeni sürüm yayınlama sürecini adım adım açıklar.

## 📋 Ön Hazırlık

### 1. Sürüm Numarası Belirleme

Semantic Versioning (SemVer) kullanıyoruz: `MAJOR.MINOR.PATCH`

- **MAJOR** (1.x.x): Geriye dönük uyumsuz değişiklikler
- **MINOR** (x.1.x): Yeni özellikler (geriye dönük uyumlu)
- **PATCH** (x.x.1): Hata düzeltmeleri

**Örnekler:**
- Yeni özellik ekliyorsan: `1.1.2` → `1.2.0`
- Hata düzeltiyorsan: `1.1.2` → `1.1.3`
- Büyük değişiklik: `1.1.2` → `2.0.0`

### 2. Değişiklikleri Dokümante Et

`changes.md` dosyasını güncelle:

```markdown
# v1.x.x

## 🎉 Yeni Özellikler
- Özellik 1
- Özellik 2

## 🔧 İyileştirmeler
- İyileştirme 1
- İyileştirme 2

## 🐛 Hata Düzeltmeleri
- Düzeltme 1
- Düzeltme 2

## 📝 Notlar
Önemli notlar buraya
```

## 🔨 Build Süreci

### Adım 1: Sürüm Numarasını Güncelle

`package.json` dosyasında version'ı değiştir:

```json
{
  "version": "1.2.0"
}
```

### Adım 2: Build Al

```bash
npm run build:win
```

**Oluşacak Dosyalar:**
- `dist/Autrex-{version}-setup.exe` - Windows installer
- `dist/latest.yml` - Otomatik güncelleme için gerekli

### Adım 3: Build'i Doğrula

```bash
ls -lh dist/Autrex-*-setup.exe dist/latest.yml
```

`latest.yml` içeriğini kontrol et:
```bash
cat dist/latest.yml
```

Doğru version numarasını görmeli ve dosya boyutu mantıklı olmalı.

## 📤 GitHub'a Yayınlama

### Yöntem 1: Manuel Release (Önerilen)

1. **GitHub Releases Sayfasına Git:**
   ```
   https://github.com/Spryzenweb/Autrex/releases/new
   ```

2. **Release Bilgilerini Doldur:**
   - **Tag:** `v1.x.x` (örn: `v1.2.0`)
   - **Release title:** `v1.x.x - Kısa Açıklama`
   - **Description:** `changes.md` içeriğini kopyala

3. **Dosyaları Yükle:**
   - `dist/Autrex-{version}-setup.exe`
   - `dist/latest.yml`
   
   ⚠️ **ÖNEMLİ:** Her iki dosyayı da yüklemelisin!

4. **"Publish release" Butonuna Bas**

### Yöntem 2: GitHub Actions (Otomatik)

⚠️ **Şu an çalışmıyor** - Git remote yapılandırması gerekli

Gelecekte kullanmak için:

```bash
# Git remote ekle (bir kere)
git remote add origin https://github.com/Spryzenweb/Autrex.git

# Her release için
git add .
git commit -m "v1.x.x: Açıklama"
git tag v1.x.x
git push origin main
git push origin v1.x.x
```

GitHub Actions otomatik olarak build alıp release oluşturacak.

## ✅ Yayınlama Sonrası Kontroller

### 1. Release Sayfasını Kontrol Et

https://github.com/Spryzenweb/Autrex/releases/latest

**Kontrol Listesi:**
- ✅ Doğru version numarası
- ✅ `Autrex-{version}-setup.exe` dosyası var
- ✅ `latest.yml` dosyası var
- ✅ Changelog doğru görünüyor

### 2. latest.yml İçeriğini Doğrula

GitHub'daki `latest.yml` dosyasını aç ve kontrol et:
- Version numarası doğru mu?
- Dosya adı doğru mu?
- SHA512 hash var mı?

### 3. Otomatik Güncellemeyi Test Et

**Test Senaryosu:**
1. Eski sürümü (örn: v1.1.2) yükle
2. Uygulamayı aç
3. 3 saniye bekle
4. Güncelleme modal'ı çıkmalı
5. "Şimdi Güncelle" butonuna bas
6. İndirme progress bar'ı görünmeli
7. İndirme bitince uygulama otomatik kapanıp yeni sürüm kurulmalı

## ⚠️ Dikkat Edilmesi Gerekenler

### Kritik Kurallar

1. **latest.yml Dosyasını Asla Unutma**
   - Bu dosya olmadan otomatik güncelleme ÇALIŞMAZ
   - Her release'de mutlaka yükle

2. **Sürüm Numarası Tutarlılığı**
   - `package.json` version
   - Git tag (`v1.x.x`)
   - Release title
   - Hepsi aynı olmalı!

3. **Zorunlu Güncelleme Sistemi**
   - v1.1.3'ten itibaren güncelleme ZORUNLU
   - Kullanıcılar eski sürümü kullanamaz
   - "Later" butonu YOK

4. **Test Etmeyi Unutma**
   - Her release'den önce mutlaka test et
   - Eski sürümden yeni sürüme güncellemeyi dene

### Sık Yapılan Hatalar

❌ **latest.yml dosyasını yüklemeyi unutmak**
- Sonuç: Otomatik güncelleme çalışmaz

❌ **Yanlış version numarası**
- Sonuç: Güncelleme tespit edilmez

❌ **Tag'i push etmeyi unutmak**
- Sonuç: GitHub Actions çalışmaz (otomatik yöntemde)

❌ **changes.md'yi güncellememeyi unutmak**
- Sonuç: Kullanıcılar ne değiştiğini bilmez

## 🔄 Güncelleme Akışı

```
Kod Değişiklikleri
    ↓
package.json version güncelle
    ↓
changes.md güncelle
    ↓
npm run build:win
    ↓
dist/ klasöründeki dosyaları kontrol et
    ↓
GitHub Release oluştur
    ↓
Autrex-{version}-setup.exe yükle
    ↓
latest.yml yükle
    ↓
Publish release
    ↓
Test et (eski sürümden güncelleme)
```

## 🧪 Test Süreci

### Geliştirme Ortamında Test

`src/main/services/updaterService.ts` içinde:

```typescript
// Test için aç
autoUpdater.forceDevUpdateConfig = true

// Production için kapat
// autoUpdater.forceDevUpdateConfig = true
```

Sonra:
```bash
npm run dev
```

### Production Test

1. Eski sürümü yükle (örn: v1.1.2)
2. GitHub'da yeni release yayınla (örn: v1.1.3)
3. Uygulamayı aç
4. Güncelleme modal'ının çıkmasını bekle
5. Güncellemeyi indir ve kur

## 📊 Güncelleme Sistemi Nasıl Çalışır?

### Kontrol Mekanizması

1. **Uygulama Açılışında:**
   - 3 saniye sonra otomatik kontrol
   - `https://github.com/Spryzenweb/Autrex/releases/latest` adresine istek

2. **latest.yml İndirilir:**
   ```yaml
   version: 1.2.0
   files:
     - url: Autrex-1.2.0-setup.exe
       sha512: [hash]
       size: 102802969
   ```

3. **Sürüm Karşılaştırması:**
   - GitHub version: `1.2.0`
   - Mevcut version: `1.1.2`
   - `1.2.0 > 1.1.2` → Güncelleme var!

4. **Modal Gösterilir:**
   - Zorunlu güncelleme ekranı açılır
   - Kullanıcı kapatamaz
   - Sadece "Şimdi Güncelle" butonu var

5. **İndirme:**
   - `.exe` dosyası indirilir
   - Progress bar gösterilir
   - SHA512 hash doğrulanır

6. **Kurulum:**
   - İndirme bitince otomatik kurulum
   - Uygulama kapanır
   - Yeni sürüm kurulur
   - Uygulama yeniden açılır

## 🚨 Acil Durum Prosedürü

### Hatalı Release Yayınlandıysa

1. **Hemen Yeni Patch Release Yayınla:**
   ```bash
   # Sürümü artır (örn: 1.2.0 → 1.2.1)
   # Hatayı düzelt
   npm run build:win
   # GitHub'da yeni release oluştur
   ```

2. **Eski Release'i Sil (Opsiyonel):**
   - GitHub'da eski release'i draft'a çek
   - Veya tamamen sil

### Güncelleme Sistemi Çalışmıyorsa

**Kontrol Listesi:**
1. ✅ `latest.yml` dosyası GitHub release'de var mı?
2. ✅ Version numarası doğru mu?
3. ✅ `.exe` dosyası adı `latest.yml` ile eşleşiyor mu?
4. ✅ `electron-builder.yml` içinde repo bilgisi doğru mu?
   ```yaml
   publish:
     provider: github
     owner: Spryzenweb
     repo: Autrex
   ```
5. ✅ `updaterService.ts` içinde repo bilgisi doğru mu?
   ```typescript
   autoUpdater.setFeedURL({
     provider: 'github',
     owner: 'Spryzenweb',
     repo: 'Autrex'
   })
   ```

## 📝 Checklist: Her Release İçin

Yeni release yayınlamadan önce bu listeyi kontrol et:

- [ ] `package.json` version güncellendi
- [ ] `changes.md` güncellendi
- [ ] `npm run build:win` başarılı
- [ ] `dist/Autrex-{version}-setup.exe` oluştu
- [ ] `dist/latest.yml` oluştu ve doğru version'ı gösteriyor
- [ ] GitHub release oluşturuldu
- [ ] Her iki dosya da yüklendi (`.exe` ve `.yml`)
- [ ] Release yayınlandı (draft değil)
- [ ] Eski sürümden güncelleme test edildi

## 🎯 Hızlı Komutlar

```bash
# Sürüm güncelle ve build al
npm version patch  # veya minor, major
npm run build:win

# Dosyaları kontrol et
ls -lh dist/Autrex-*-setup.exe dist/latest.yml
cat dist/latest.yml

# Git işlemleri (remote ekledikten sonra)
git add .
git commit -m "v1.x.x: Açıklama"
git tag v1.x.x
git push origin main
git push origin v1.x.x
```

## 💡 İpuçları

1. **Her Zaman Test Et:** Production'a göndermeden önce mutlaka test et
2. **Changelog Yaz:** Kullanıcılar ne değiştiğini bilmek ister
3. **Küçük Adımlar:** Büyük değişiklikleri küçük release'lere böl
4. **Backup Al:** Önemli değişikliklerden önce backup al
5. **Kullanıcı Geri Bildirimi:** Release sonrası kullanıcı geri bildirimlerini takip et

## 🔗 Faydalı Linkler

- **GitHub Releases:** https://github.com/Spryzenweb/Autrex/releases
- **electron-builder Docs:** https://www.electron.build/
- **electron-updater Docs:** https://www.electron.build/auto-update

## 📞 Sorun mu Yaşıyorsun?

1. `dist/latest.yml` dosyasını kontrol et
2. GitHub release'de her iki dosyanın da olduğunu doğrula
3. Console loglarını kontrol et (DevTools)
4. `updaterService.ts` içindeki logları oku

---

**Son Güncelleme:** v1.1.3 - Mart 2026
