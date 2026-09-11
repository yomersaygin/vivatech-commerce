# Vivatech Commerce — Güncel Test Durumu

## Otomatik CI / Production-Mode Smoke
- PASS: GitHub Actions Node 22 bağımlılık kurulumu.
- PASS: `npm run lint` — 0 uyarı / 0 hata.
- PASS: `@typescript-eslint/no-explicit-any` CI'da ERROR seviyesinde; yeni kontrolsüz `any` kullanımı build'i durdurur.
- PASS: `npm run build` gerçek Next.js production build.
- PASS: `npm start` ile production sunucusu ayağa kalkıyor.
- PASS: `/`, `/products`, `/account`, `/checkout`, `/api/health` HTTP smoke testleri.
- PASS: `/api/health` sözleşmesi (`status=ok`, `service=vivatech-commerce`, timestamp).
- PASS: müşteri giriş/checkout kritik kaynak sözleşmeleri.
- Son tam doğrulama: GitHub Actions Build #67 — SUCCESS.

## Sepet ve Checkout
- PASS: cartSubtotal matematik kontrolü.
- PASS: cartCount toplam adet kontrolü.
- PASS: stok üstü adet clamp kontrolü.
- PASS: 0 stok ürün sepete eklenmez kuralı.
- PASS: sepet localStorage kalıcılığı.
- PASS: kayıtlı adres / yeni adres checkout kaynak akışı.
- PASS: güncel checkout `create_customer_order_with_stock_v3` RPC kullanıyor.
- PASS: sipariş numarası veritabanı tarafından üretiliyor ve V3 RPC doğrudan geri döndürüyor.
- PASS: eski V2 RPC authenticated kullanıcıdan kapalı; yalnız service_role erişimi bırakıldı.
- PASS: CartProvider kupon cevabı explicit type ile işleniyor; hook dependency uyarıları giderildi.
- PENDING: güncel V3 checkout akışının gerçek oturumlu tarayıcı E2E testi.

## Gerçek Sipariş ve Stok Akışı
- PASS: gerçek authenticated sipariş oluşturma önceki V2 akışında doğrulandı.
- PASS: sipariş satırı, stok düşümü ve satış stok hareketi oluştu.
- PASS: yetersiz stokta transaction tamamen rollback oluyor.
- PASS: başka müşteriye ait teslimat adresi ile sipariş engelleniyor ve rollback oluyor.
- PASS: geçersiz ürün UUID ile sipariş engelleniyor ve rollback oluyor.
- PASS: aynı ürünün birden fazla satırda bulunması stok kontrolünde toplam miktar üzerinden güvenli çalışıyor.
- PASS: kupon müşteri kullanım limiti aynı müşteri için transaction testiyle doğrulandı.

## Sipariş İptali ve Durum Yönetimi
- PASS: müşteri iptal RPC sahiplik/durum kontrolü yapıyor.
- PASS: iptal stok iadesi doğrulandı.
- PASS: ikinci iptalde çift stok iadesi oluşmuyor.
- PASS: aynı ürün bir siparişte birden fazla satırdaysa iptal sırasında miktarlar gruplanıp tek stok iadesi hareketi oluşturuluyor.
- PASS: admin sipariş durum RPC'si SECURITY DEFINER + `is_admin()` kontrolüyle doğrulandı.
- PASS: normal müşteri admin durum RPC'sini çalıştıramıyor.
- PASS: teslim edilmiş/iptal edilmiş siparişler terminal durumda.

## Müşteri Hesabı / RLS
- PASS: müşterinin kendi müşteri kaydı görünür, başka müşteri görünmez.
- PASS: müşterinin kendi adresleri görünür, başkasının adresleri görünmez.
- PASS: müşterinin kendi siparişleri ve sipariş satırları görünür, başkasının verileri görünmez.
- PASS: başka müşterinin profil/adres verilerini update/delete etme engelleniyor.
- PASS: müşteri `auth_user_id` ve adres `customer_id` sahiplik alanlarını değiştiremiyor.
- PASS: siparişte kullanılmış adres silinemez.
- PASS: ilk adres otomatik varsayılan; tek varsayılan adres kuralı DB seviyesinde korunuyor.
- PASS: müşteri hesap/sipariş/adres/profile sayfalarındaki lint/type borcu temizlendi.
- PENDING: güncel profil/adres ekranlarının gerçek authenticated browser UI E2E testi.

## Sipariş Geçmişi Bütünlüğü
- PASS: `shipping_address_snapshot` mevcut siparişlere backfill edildi.
- PASS: kayıtlı adres sonradan düzenlense bile geçmiş sipariş snapshot'ı değişmiyor.
- PASS: sipariş snapshot ve shipping_address_id doğrudan değiştirilemiyor.
- PASS: sipariş geçmişine bağlı customer/address/order/product silme zincirleri RESTRICT ile korunuyor.
- PASS: orders_without_customer = 0.
- PASS: orphan_order_items = 0.
- PASS: invalid_order_items = 0.
- PASS: negative_stock_products = 0.
- PASS: bad_order_totals = 0.
- PASS: missing_shipping_snapshots = 0.
- PASS: duplicate_order_numbers = 0.
- PASS: invalid_stock_movements = 0.
- PASS: orders_without_items = 0.

## Ürün / Stok Güvenliği
- PASS: ürün fiyatı, karşılaştırma fiyatı ve stok için negatif değer kontrolleri.
- PASS: SKU/slug/barcode uniqueness kontrolleri.
- PASS: normal authenticated kullanıcı doğrudan ürün yazamaz; admin işlemleri RLS ile korunur.
- PASS: stock_movements quantity > 0 constraint.
- PASS: order cancellation için duplicate return movement unique koruması.
- PASS: anon/authenticated doğrudan stock_movements yazamaz.
- PASS: ürün formundaki görsel önizleme Next Image bileşenine geçirildi; ilgili lint uyarısı kaldırıldı.

## Kupon ve Kampanya
- PASS: yüzde kupon hesabı.
- PASS: minimum sepet kontrolü.
- PASS: kullanım limiti / müşteri başı limit server-side uygulanıyor.
- PASS: checkout sırasında indirim server-side yeniden hesaplanıyor.
- PASS: kupon tarih/değer/limit constraint'leri.
- PASS: kupon kodu case-insensitive unique.
- PASS: public kupon wrapper çalışıyor; kritik hesaplama helper'ları private schema içinde.
- PASS: admin kampanya/kupon sayfasındaki gevşek `any` tipleri kaldırıldı.
- PENDING: gerçek authenticated browser checkout + kupon E2E testi.

## Kargo Takibi
- PASS: shipping_carrier / tracking_number / tracking_url alanları.
- PASS: preparing -> shipped geçişinde `shipped_at` oluşuyor.
- PASS: admin kargo güncelleme yetkisi transaction testinde doğrulandı.
- PASS: normal müşteri kargo alanlarını güncelleyemiyor.
- PENDING: gerçek admin/müşteri browser E2E kargo takip testi.

## Admin Sipariş Ekranları
- PASS: admin RLS bağlamında sipariş, müşteri, adres ve sipariş satırları görünür.
- PASS: admin order detail nested relation erişimleri doğrulandı.
- PASS: sipariş durum geçişleri DB tarafından kontrol ediliyor.
- PASS: takip URL'si UI seviyesinde http/https doğrulamasına sahip.
- PASS: admin sipariş liste/detay sayfalarındaki `any` ve hook dependency uyarıları temizlendi.
- PENDING: güncel admin ekranlarının gerçek browser UI E2E testi.

## Aşama 14–15
- PASS: çoklu ürün görseli sıralama / tek ana görsel DB transaction testi.
- PASS: ürün açıklama/SEO araçları build içinde doğrulanıyor.
- PASS: `generate-product-copy` Edge Function deploy edilmiş ve JWT zorunlu.
- PASS: ücretli AI anahtarı olmadan deterministik ücretsiz fallback mevcut.
- PENDING: AI endpoint'in gerçek authenticated UI çağrısı browser E2E.

## Supabase Güvenlik / Performans
- PASS: kritik private helper'larda anon/authenticated doğrudan EXECUTE yok.
- PASS: V3 checkout ve müşteri iptal RPC'leri authenticated için kontrollü açık.
- PASS: admin order status RPC yalnız admin kontrolüyle çalışıyor.
- PASS: `auth_rls_initplan` = 0.
- PASS: `multiple_permissive_policies` = 0.
- NOT BLOCKING: Supabase Free planda Leaked Password Protection kullanılamıyor; ücretli plana geçilmedi.
- NOT BLOCKING: bilinçli SECURITY DEFINER business RPC advisor uyarıları mevcut; yetkileri zayıflatmak için kapatılmadı.

## Şu Anda Test Edilmiş Sayılmayanlar
- Gerçek tarayıcı ile güncel V3 signup/login -> checkout -> order -> admin görünürlüğü E2E.
- Password reset akışının baştan sona gerçek tarayıcı testi; Supabase default mail rate limit nedeniyle önceki deneme tamamlanamadı.
- Güncel profil/adres/müşteri sipariş ekranlarının gerçek browser UI E2E'si.
- Güncel admin sipariş ekranlarının gerçek browser UI E2E'si.

Not: Kaynak sözleşmesi, DB transaction testi ve production-mode HTTP smoke testi gerçek browser E2E değildir; dokümanda ayrı kategoriler olarak tutulur.
