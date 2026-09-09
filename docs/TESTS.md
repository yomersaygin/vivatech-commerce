# Test Durumu — Aşama 6

- [x] cartSubtotal matematik kontrolü
- [x] cartCount toplam adet kontrolü
- [x] stok üstü adet clamp kontrolü
- [x] 0 stok ürün sepete eklenmez kuralı
- [x] Sepet UI bileşenleri oluşturuldu
- [x] Checkout formu oluşturuldu
- [ ] Tam Next.js production build (ortamda bağımlılık kurulumu gerekir)
- [ ] Gerçek tarayıcı E2E testi
- [ ] Gerçek sipariş veritabanı kaydı (Aşama 7)

## Aşama 7
PASS: checkout RPC anon EXECUTE=false, authenticated EXECUTE=true.
PASS: public wrapper SECURITY INVOKER; privileged implementation private schema içinde.
PASS: Supabase security advisor 0 lint.
PASS: A7 test siparişi veritabanında bırakılmadı (0 kayıt).
PASS: TypeScript database type generation succeeded after initial gateway timeout.
NOT PASS YET: gerçek müşteri ile tarayıcıdan signup/login -> checkout -> admin order E2E; test auth hesabı henüz oluşturulmadı.
NOT PASS YET: next build; npm install çalışma ortamında 45 saniye zaman aşımına uğradı.

- A8 iptal stok testi: PASS (16 -> 18)
- A8 ikinci iptal testi: PASS (stok 18 kaldı, return_in sayısı 1)
- A8 geçici test siparişi temizliği: PASS

## Aşama 9
- [x] Hesap sayfaları kaynak kodu oluşturuldu.
- [x] Sipariş listesi/detail sorguları RLS altında kullanıcı oturumunu kullanır.
- [x] Adres CRUD istemci akışı RLS altında kullanıcı customer_id'si ile çalışır.
- [x] Profil UPDATE mevcut customers self-update RLS politikasını kullanır.
- [ ] Gerçek iki farklı müşteri hesabıyla cross-user RLS E2E testi (test auth hesapları gerekir).
- [ ] Tam Next.js production build / browser E2E.


## Aşama 10 — Kargo Takip Testleri
- PASS: shipping_carrier / tracking_number / tracking_url alanları kaydedildi.
- PASS: preparing -> shipped durumunda shipped_at otomatik oluştu.
- PASS: test siparişi temizlendi; geride SHIP-TEST kaydı kalmadı.
- PASS: Supabase security advisor 0 bulgu.
- BEKLEMEDE: gerçek admin/müşteri hesabıyla tarayıcı E2E kargo takip testi.
- BEKLEMEDE: next build, bağımlılık kurulumu ortamda doğrulanmadı.

## Aşama 12
- Kupon doğrulama: PASS (%10 / 4.999 TL => 499,90 TL)
- Minimum sepet kontrolü: PASS (1.000 TL altı engellendi)
- Kupon kullanım limiti: veritabanı fonksiyonunda uygulanıyor
- Checkout indirim tutarı: server-side yeniden hesaplanıyor

- Kampanya/kupon test kayıtları temizlendi: PASS
- Supabase security advisor: PASS (0 finding)
- Gerçek authenticated checkout + kupon: PENDING (gerçek auth kullanıcı oturumu yok)


### Aşama 13
- Aktif banner anon görünürlük: PASS
- Süresi bitmiş banner anon görünürlük: PASS (0)
- Aktif içerik anon görünürlük: PASS
- Geçici test kayıtları temizlendi: PASS
- Supabase security advisor: PASS (0 lint)
- Full Next build: NOT PASS / ortam bağımlılıkları kurulu değil

## Aşama 14 Testleri
- DB transaction testi: üç geçici ürün görseli 0,1,2 sırasına getirildi ve yalnızca bir ana görsel kaldığı doğrulandı. Transaction rollback ile test verisi bırakılmadı. PASS.
- ZIP bütünlük testi: PASS.
- TypeScript tam derleme: PASS değil. Çalışma ortamında Next.js/React bağımlılıkları kurulu olmadığından tsc modül/type hataları veriyor; bu nedenle tam build doğrulaması yapılmış sayılmıyor.


## Aşama 15 — AI ürün metni
- Admin ürün formuna AI Açıklama + SEO Oluştur eklendi.
- Supabase Edge Function `generate-product-copy` deploy edildi ve JWT zorunlu.
- Zorunlu ücretli servis yok: AI anahtarı yoksa ücretsiz deterministik taslak üretir.
- AI sağlayıcı anahtarı daha sonra eklenirse aynı endpoint gerçek model çıktısını kullanır.
- Teknik özellik uydurmamayı hedefleyen prompt kuralı eklendi.
