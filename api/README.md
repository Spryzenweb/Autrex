# Autrex License API

Online lisans doğrulama ve yönetim API'si.

## 🚀 Kurulum

### 1. Supabase Projesi Oluştur

1. [Supabase](https://supabase.com) hesabı oluştur
2. Yeni proje oluştur
3. SQL Editor'de `supabase/schema.sql` dosyasını çalıştır
4. Settings > API'den şu bilgileri al:
   - Project URL
   - Anon/Public Key

### 2. Vercel Projesi Oluştur

1. [Vercel](https://vercel.com) hesabı oluştur
2. GitHub repo'yu bağla
3. Environment Variables ekle:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Deploy et

### 3. Lisans Anahtarları Oluştur

```bash
# 10 ömür boyu lisans
npm run generate-keys 10 REGULAR

# 50 haftalık lisans
npm run generate-keys 50 WEEKLY
```

### 4. Lisansları Supabase'e Yükle

Supabase Dashboard > Table Editor > licenses tablosuna git ve:

```sql
-- Toplu ekleme
SELECT insert_licenses_bulk(
  ARRAY[
    'AUTR-XXXX-XXXX-XXXX',
    'AUTR-YYYY-YYYY-YYYY',
    'AUTR-ZZZZ-ZZZZ-ZZZZ'
  ],
  'REGULAR'
);
```

Veya manuel olarak tek tek ekle.

## 📡 API Endpoints

### POST /api/licenses/validate

Lisans anahtarını doğrula.

**Request:**

```json
{
  "key": "AUTR-XXXX-XXXX-XXXX",
  "hardwareId": "abc123..."
}
```

**Response:**

```json
{
  "valid": true,
  "active": true,
  "type": "REGULAR",
  "expiresAt": null,
  "message": "Lisans geçerli"
}
```

### POST /api/licenses/activate

Lisansı aktive et.

**Request:**

```json
{
  "key": "AUTR-XXXX-XXXX-XXXX",
  "hardwareId": "abc123..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Lisans başarıyla aktive edildi",
  "activatedAt": "2025-01-15T10:30:00Z",
  "expiresAt": null
}
```

### POST /api/licenses/deactivate

Lisansı deaktive et.

**Request:**

```json
{
  "key": "AUTR-XXXX-XXXX-XXXX",
  "hardwareId": "abc123..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Lisans başarıyla deaktive edildi"
}
```

## 🔒 Güvenlik

- ✅ CORS koruması
- ✅ Hardware ID binding
- ✅ Tek cihaz kontrolü
- ✅ Aktivasyon geçmişi
- ✅ IP ve User-Agent logging

## 📊 Database Schema

```sql
licenses
├── id (UUID)
├── key (VARCHAR, UNIQUE)
├── type (VARCHAR)
├── created_at (TIMESTAMP)
├── activated_at (TIMESTAMP)
├── expires_at (TIMESTAMP)
├── hardware_id (VARCHAR)
├── is_active (BOOLEAN)
├── activation_count (INTEGER)
└── metadata (JSONB)

license_activations
├── id (UUID)
├── license_id (UUID)
├── hardware_id (VARCHAR)
├── activated_at (TIMESTAMP)
├── ip_address (VARCHAR)
└── user_agent (TEXT)

license_deactivations
├── id (UUID)
├── license_id (UUID)
├── hardware_id (VARCHAR)
├── deactivated_at (TIMESTAMP)
└── reason (TEXT)
```

## 🎯 Sonraki Adımlar

1. ✅ API endpoints oluşturuldu
2. ✅ Database schema hazır
3. ⏳ Supabase bağlantısı (environment variables gerekli)
4. ⏳ Vercel deploy
5. ⏳ Electron app'te online validation aktif et

## 💡 Test

```bash
# Local test (Vercel CLI ile)
vercel dev

# Test request
curl -X POST http://localhost:3000/api/licenses/validate \
  -H "Content-Type: application/json" \
  -d '{"key":"AUTR-TEST-1234-ABCD","hardwareId":"test123"}'
```
