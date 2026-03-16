# 📦 Release Kılavuzu - Autrex

## Hızlı Başlangıç

### Otomatik Script ile (Önerilen)

**macOS/Linux:**
```bash
npm run release
```

**Windows:**
```bash
npm run release:win
```

Script sizden:
1. Yeni versiyon numarasını sorar
2. Build alır
3. Sonraki adımları gösterir

### Manuel Yöntem

1. **Versiyon güncelle:**
```bash
# package.json'da version değiştir: "1.2.0"
```

2. **Build al:**
```bash
npm run build:win    # Windows
npm run build:mac    # macOS
```

3. **GitHub'da Release oluştur:**
   - https://github.com/Spryzenweb/Autrex/releases/new
   - Tag: `v1.2.0`
   - `dist/` klasöründeki dosyaları yükle
   - ⚠️ **MUTLAKA** hem `.exe` hem de `latest.yml` yükle
   - Publish et

## Otomatik Güncelleme Nasıl Çalışır?

1. Kullanıcı uygulamayı açar
2. Uygulama GitHub'dan güncelleme kontrolü yapar (3 saniye sonra)
3. Yeni versiyon varsa **zorunlu güncelleme modal'ı** çıkar
4. Kullanıcı "Şimdi Güncelle" butonuna basmak zorunda (kapatamaz)
5. Güncelleme indirilir ve otomatik kurulur
6. Uygulama yeniden başlar

## ⚠️ Kritik: Zorunlu Güncelleme Sistemi

v1.1.3'ten itibaren:
- ✅ Güncelleme ZORUNLU - kullanıcı kaçamaz
- ✅ "Later" butonu YOK
- ✅ Modal kapatılamaz
- ✅ Lisans ekranında da güncelleme kontrolü var

## Önemli Notlar

✅ **Kaynak kodlarınız güvende:** Sadece derlenmiş dosyalar Spryzenweb/Autrex'te yayınlanır
✅ **Ücretsiz:** GitHub Releases tamamen ücretsizdir
✅ **Otomatik:** Kullanıcılar manuel güncelleme yapmaz
✅ **Güvenli:** HTTPS ve imza doğrulaması
✅ **Zorunlu:** Kullanıcılar eski sürümü kullanamaz

## 📚 Detaylı Dokümantasyon

- **Türkçe Rehber:** `docs/GUNCELLEME_YAYINLAMA.md` - Adım adım detaylı açıklama
- **English Guide:** `docs/RELEASE_PUBLISHING.md` - Step-by-step detailed guide
- **Teknik Detaylar:** `docs/AUTO_UPDATE.md` - Sistem mimarisi ve kod açıklamaları

## 🎯 Hızlı Checklist

Her release öncesi:
- [ ] `package.json` version güncellendi
- [ ] `changes.md` güncellendi
- [ ] Build başarılı
- [ ] `latest.yml` oluştu
- [ ] GitHub'da her iki dosya da yüklendi
- [ ] Test edildi

