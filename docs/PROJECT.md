# Vivatech Commerce — Proje Durumu

## Mevcut aşama
Aşama 21 — Üretim doğrulama ve otomatik smoke-test altyapısı

## Tamamlanan ana kapsam
- Next.js + Supabase + GitHub + Vercel temeli
- Supabase şema, RLS ve kritik RPC güvenlik sertleştirmeleri
- Admin giriş/yetkilendirme altyapısı
- Ürün, kategori ve marka CRUD
- Ürün görsel yönetimi ve Storage
- Müşteri mağazası, arama/filtreleme ve ürün detayları
- Sepet, kupon ve checkout akışı
- Müşteri üyeliği, profil ve adres yönetimi
- Gerçek sipariş oluşturma, atomik stok düşümü ve stok hareketleri
- Sipariş iptali ve tek seferlik atomik stok iadesi
- Admin sipariş listesi, detay, durum geçişleri ve kargo bilgileri
- Müşteri sipariş geçmişi, detay ve kargo takibi
- Sipariş teslimat adresi snapshot yapısı
- Kampanya, kupon, banner ve içerik yönetimi
- AI ürün açıklaması/SEO endpoint'i; ücretli anahtar yoksa ücretsiz deterministik fallback
- Ana sayfa ve katalog için Vivatech görsel yönü

## Aşama 20 — Güvenlik ve veri bütünlüğü
- Sipariş numarası veritabanında üretilir; checkout V3 RPC order_number döndürür.
- Legacy checkout RPC authenticated role için kapatıldı.
- Kritik private helper fonksiyonlar doğrudan istemci erişimine kapalıdır.
- Müşteri, adres, sipariş, order_items ve stok hareketlerinde RLS/ACL sertleştirmeleri yapıldı.
- Sipariş geçmişini koruyan FK ve silme kısıtları eklendi.
- Aynı ürünün bir siparişte birden fazla satırda bulunması halinde iptal stok iadesi aggregate edilir.
- Sipariş adresi immutable snapshot olarak saklanır.
- Admin sipariş durum RPC'sinin SECURITY DEFINER yetki problemi düzeltildi.
- Son veri bütünlüğü kontrollerinde orphan order item, negatif stok, bozuk sipariş toplamı, eksik snapshot ve duplicate order number bulunmadı.

## Aşama 21 — Otomatik doğrulama
- `/api/health` endpoint'i eklendi.
- GitHub Actions Node 22 üzerinde bağımlılık kurulumu, lint ve `next build` çalıştırıyor.
- Gerçek Next production server yerel CI ortamında `npm start` ile ayağa kaldırılıyor.
- `/`, `/products`, `/account`, `/checkout`, `/api/health` rotaları production-mode smoke testten geçiriliyor.
- Health JSON sözleşmesi doğrulanıyor.
- İstemci tarafında render edilen müşteri akışları için kaynak kod sözleşmeleri kontrol ediliyor.
- Build #51: lint PASS, production build PASS, production server PASS, kritik rotalar PASS, health contract PASS, customer flow contracts PASS.
- ESLint mevcut legacy teknik borçları warning olarak görünür tutuyor; CI'yı gereksiz yere bloke etmiyor.

## Bilinen doğrulama sınırları
- GitHub Actions içindeki smoke test gerçek Next production runtime testidir, fakat gerçek bir etkileşimli tarayıcı E2E değildir.
- Vercel production alias deployment protection/SSO arkasında olduğundan GitHub'ın anonim curl isteği production HTTP E2E olarak kullanılamaz.
- Güncel V3 checkout için authenticated browser UI E2E henüz yapılmadı.
- Profil/adres ekranlarının son sürümü için authenticated browser UI E2E henüz yapılmadı.
- Password reset uçtan uca doğrulaması Supabase varsayılan e-posta rate limit nedeniyle tamamlanmadı.

## Maliyet kuralı
Proje zorunlu ücretli servise bağlanmayacaktır. Mevcut ücretsiz katmanlar yeterli olduğu sürece 0 TL mimari korunur; ücret gerektiren bir ihtiyaç çıkarsa önce ücretsiz alternatif seçilir.

## Sonraki teknik hedef
Aşama 21 içinde otomatik doğrulama kapsamını genişletmek, proje durum/test dokümantasyonunu güncel tutmak ve tarayıcı gerektirmeden güvenilir şekilde doğrulanabilecek kritik iş kurallarını CI'a eklemek.
