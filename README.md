# Vivatech Commerce — Aşama 14

Bu paket Aşama 13 üzerine ürün yönetimi kullanım kolaylığı geliştirmelerini içerir.

## Yeni
- Çoklu görsel seçme ve sürükle-bırak yükleme alanı
- Yükleme öncesi görsel önizleme
- Ana görsel seçme
- Mevcut görselleri sürükleyerek sıralama
- Ana görsel silinince otomatik yedek ana görsel
- Açıklama editörü araç çubuğu
- Hazır özellik açıklama şablonu
- SEO taslağı oluşturma
- SEO karakter sayaçları

## Test durumu
- Veritabanı görsel sırası/tek ana görsel davranışı: PASS
- ZIP bütünlüğü: PASS
- Tam Next.js build: doğrulanmadı; bağımlılıklar çalışma ortamında kurulu değil.


## Aşama 15 — AI ürün metni
- Admin ürün formuna AI Açıklama + SEO Oluştur eklendi.
- Supabase Edge Function `generate-product-copy` deploy edildi ve JWT zorunlu.
- Zorunlu ücretli servis yok: AI anahtarı yoksa ücretsiz deterministik taslak üretir.
- AI sağlayıcı anahtarı daha sonra eklenirse aynı endpoint gerçek model çıktısını kullanır.
- Teknik özellik uydurmamayı hedefleyen prompt kuralı eklendi.
