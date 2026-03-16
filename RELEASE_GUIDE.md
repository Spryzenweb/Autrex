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
   - Publish et

## Otomatik Güncelleme Nasıl Çalışır?

1. Kullanıcı uygulamayı açar
2. Uygulama GitHub'dan güncelleme kontrolü yapar
3. Yeni versiyon varsa bildirim gösterir
4. Kullanıcı "İndir" butonuna tıklar
5. Güncelleme indirilir ve otomatik kurulur

## Önemli Notlar

✅ **Kaynak kodlarınız güvende:** Sadece derlenmiş dosyalar Spryzenweb/Autrex'te yayınlanır
✅ **Ücretsiz:** GitHub Releases tamamen ücretsizdir
✅ **Otomatik:** Kullanıcılar manuel güncelleme yapmaz
✅ **Güvenli:** HTTPS ve imza doğrulaması

## Detaylı Dokümantasyon

Daha fazla bilgi için: `docs/AUTO_UPDATE.md`
