# Otomatik Güncelleme Sistemi

Bu doküman, Autrex uygulamasının otomatik güncelleme özelliğinin nasıl çalıştığını açıklar.

## Nasıl Çalışır?

Uygulama, GitHub Releases (https://github.com/Spryzenweb/Autrex/releases) üzerinden otomatik güncellemeleri kontrol eder ve indirir. 

**ÖNEMLİ:** Kaynak kodlarınız hiçbir şekilde paylaşılmaz - sadece derlenmiş uygulama dosyaları (`.exe`, `.dmg`) Spryzenweb/Autrex reposunda yayınlanır. Ana geliştirme reponuz gizli kalır.

## Özellikler

- ✅ Uygulama başlangıcında otomatik güncelleme kontrolü (3 saniye gecikme ile)
- ✅ Kullanıcıya toast bildirimi ile güncelleme bildirimi
- ✅ İndirme ilerlemesi gösterimi
- ✅ Otomatik kurulum ve yeniden başlatma
- ✅ Güncelleme iptal etme desteği
- ✅ Changelog görüntüleme (opsiyonel)
- ✅ Windows ve macOS desteği

## Güncelleme Yayınlama

### Yöntem 1: Manuel Build ve Upload (Önerilen)

1. **Versiyon Güncelleme**

`package.json` dosyasındaki versiyonu güncelleyin:

```json
{
  "version": "1.2.0"
}
```

2. **Build Alma**

```bash
# Windows için
npm run build:win

# macOS için (macOS'ta çalıştırıyorsanız)
npm run build:mac

# Her ikisi için (macOS'ta)
npm run build:all
```

3. **GitHub Release Oluşturma**

- https://github.com/Spryzenweb/Autrex/releases/new adresine gidin
- Tag: `v1.2.0` (versiyon numarasıyla eşleşmeli)
- Release title: `v1.2.0` veya `Autrex v1.2.0`
- Description: Değişiklikleri yazın
- Build dosyalarını yükleyin:
  - `dist/Autrex-1.2.0-setup.exe` (Windows)
  - `dist/Autrex-1.2.0.dmg` (macOS)
  - `dist/Autrex-1.2.0-arm64.dmg` (macOS Apple Silicon)
- "Publish release" butonuna tıklayın

### Yöntem 2: GitHub Actions ile Otomatik (Opsiyonel)

**NOT:** Bu yöntem için GitHub Actions'ın Spryzenweb/Autrex reposunda çalışması gerekir.

1. **Versiyon Güncelleme**

```bash
# package.json'da versiyonu güncelleyin (örn: 1.2.0)
git add package.json
git commit -m "Bump version to 1.2.0"
```

2. **Tag Oluşturma ve Push**

```bash
git tag v1.2.0
git push origin main
git push origin v1.2.0
```

3. GitHub Actions otomatik olarak:
   - Windows ve macOS için build alır
   - GitHub Release oluşturur
   - Kurulum dosyalarını yükler

## Changelog Ekleme (Opsiyonel)

Kullanıcılara güncelleme notlarını göstermek için Spryzenweb/Autrex reposunda `changes.md` dosyası oluşturun:

```markdown
# v1.2.0

## Yeni Özellikler
- Otomatik güncelleme sistemi eklendi
- Performans iyileştirmeleri

## Hata Düzeltmeleri
- Skin yükleme hatası düzeltildi
```

## Kullanıcı Deneyimi

1. Kullanıcı uygulamayı açar
2. 3 saniye sonra otomatik güncelleme kontrolü yapılır
3. Güncelleme varsa sağ altta toast bildirimi görünür
4. Kullanıcı "İndir" butonuna tıklar
5. İndirme ilerlemesi gösterilir
6. İndirme tamamlandığında uygulama otomatik yeniden başlar

## Güvenlik

- ✅ Güncellemeler HTTPS üzerinden GitHub'dan indirilir
- ✅ electron-updater otomatik imza doğrulaması yapar
- ✅ Kaynak kodlarınız hiçbir zaman paylaşılmaz
- ✅ Sadece derlenmiş binary dosyalar yayınlanır

## Test Etme

Development modunda test etmek için `dev-app-update.yml` dosyası oluşturun:

```yaml
provider: generic
url: https://example.com/updates
```

## Sorun Giderme

### Güncelleme bulunamıyor
- Spryzenweb/Autrex reposunda release yayınlandığından emin olun
- Release'in "draft" olmadığını kontrol edin
- Tag formatının `v1.2.0` şeklinde olduğunu doğrulayın
- `latest.yml` dosyasının release'de olduğunu kontrol edin

### İndirme başarısız
- İnternet bağlantısını kontrol edin
- GitHub'ın erişilebilir olduğunu doğrulayın
- Firewall ayarlarını kontrol edin
- Antivirus yazılımının indirmeyi engellemediğini kontrol edin

### Build hatası
- Node.js versiyonunun 20 olduğunu doğrulayın
- `npm ci` ile temiz kurulum yapın
- `node_modules` ve `dist` klasörlerini silip tekrar deneyin
