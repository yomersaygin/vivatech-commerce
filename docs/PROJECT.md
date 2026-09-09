# Vivatech Commerce — Proje Durumu

## Mevcut aşama
Aşama 6 — Sepet ve checkout temel akışı

## Tamamlanan
- Supabase temel şema ve RLS
- Admin giriş/yetkilendirme altyapısı
- Ürün CRUD + ürün görselleri Storage
- Kategori/marka CRUD
- Müşteri mağazası ve ürün detay sayfası
- Sepete ürün ekleme
- Sepet localStorage kalıcılığı
- Adet artır/azalt ve stok sınırı
- Sepetten ürün kaldırma
- Ara toplam/ürün toplam hesapları
- Checkout teslimat formu ve sipariş taslağı özeti

## Sonraki
- Müşteri üyeliği ve adres kaydı
- Gerçek sipariş oluşturma RPC/API akışı
- Atomik stok düşümü ile checkout bağlantısı
- Sipariş başarı ekranı

## Aşama 8 — Müşteri ve Gerçek Sipariş Akışı
- Müşteri giriş / kayıt ekranı eklendi.
- Auth kullanıcısı oluşunca customer profili otomatik oluşturulur.
- Checkout teslimat adresini customers/addresses yapısına kaydeder.
- create_customer_order_with_stock RPC ile sipariş, satırlar, stok düşümü ve stok hareketi tek transaction içinde çalışır.
- RPC anon role kapalı, authenticated role açık.
- Admin Siparişler ekranı eklendi.
- Ödeme entegrasyonu henüz yok; payment_status=pending.


## Aşama 8
- Sipariş detay ekranı
- Sipariş durum yönetimi
- İptalde atomik stok iadesi
- Çift stok iadesi koruması

## Aşama 9 — Müşteri Hesabı
- Hesabım dashboard eklendi.
- Müşterinin kendi sipariş listesi ve sipariş detay ekranı eklendi.
- Kayıtlı adres ekleme/düzenleme/silme eklendi.
- Profil bilgileri güncelleme eklendi.
- Tüm hesap ekranları mevcut RLS politikalarıyla kullanıcının kendi verisiyle sınırlıdır.


## Aşama 10 — Kargo ve Takip
- Siparişlere kargo firması, takip numarası, takip URL'si ve kargoya veriliş zamanı eklendi.
- Admin sipariş detayında kargo bilgileri düzenlenebilir.
- Müşteri kendi sipariş detayında kargo takip bilgilerini görebilir.
- Takip bağlantısı varsa doğrudan kargo takip sayfasına yönlendirme yapılır.

## Aşama 12 — Kampanya ve Kupon
- campaigns ve coupons tabloları
- kupon kullanım kayıtları
- sepet kupon doğrulama
- atomik checkout sırasında server-side indirim doğrulama
- admin kampanya/kupon yönetimi


## Aşama 13 — Banner & İçerik Yönetimi
- Admin banner CRUD temel akışı
- Başlangıç/bitiş tarihli banner görünürlüğü
- Ana sayfa içerik blokları
- Banner ve içeriklerin müşteri ana sayfasına bağlanması
- RLS ile yalnız aktif/geçerli içeriklerin public okunması

## Aşama 14 — Ürün Görsel Yönetimi ve Açıklama Editörü
- Çoklu ürün görseli yükleme alanı geliştirildi.
- Sürükle-bırak ile mevcut görsellerin sırası değiştirilebiliyor.
- Ana görsel tek tıkla seçilebiliyor.
- Ana görsel silinirse kalan ilk görsel yeni ana görsel oluyor.
- Yeni seçilen görseller yükleme öncesi önizleniyor ve tek tek kaldırılabiliyor.
- Dosya tipi ve 10 MB boyut sınırı istemci tarafında kontrol ediliyor.
- Açıklama editörüne başlık, madde, numaralı liste, vurgu ve özellik şablonu araçları eklendi.
- SEO taslağı oluşturma, SEO başlığı/meta açıklama karakter sayaçları eklendi.


## Aşama 15 — AI ürün metni
- Admin ürün formuna AI Açıklama + SEO Oluştur eklendi.
- Supabase Edge Function `generate-product-copy` deploy edildi ve JWT zorunlu.
- Zorunlu ücretli servis yok: AI anahtarı yoksa ücretsiz deterministik taslak üretir.
- AI sağlayıcı anahtarı daha sonra eklenirse aynı endpoint gerçek model çıktısını kullanır.
- Teknik özellik uydurmamayı hedefleyen prompt kuralı eklendi.
