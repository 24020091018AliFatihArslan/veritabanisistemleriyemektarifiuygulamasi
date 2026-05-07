# 🍽️ YemekTarifi Web Uygulaması

> Türk mutfağının eşsiz lezzetlerini keşfedin. Üç farklı sunucu teknolojisi ve veritabanı sistemiyle geliştirilmiş çok platformlu yemek tarifi uygulaması.

![Platform](https://img.shields.io/badge/Platform-Web-orange)
![JSP](https://img.shields.io/badge/Backend1-JSP-green)
![ASP](https://img.shields.io/badge/Backend2-ASP-blue)
![PHP](https://img.shields.io/badge/Backend3-PHP-purple)
![PostgreSQL](https://img.shields.io/badge/DB1-PostgreSQL-316192)
![MSSQL](https://img.shields.io/badge/DB2-MSSQL-CC2927)
![MySQL](https://img.shields.io/badge/DB3-MySQL-4479A1)

---

## 📌 Proje Hakkında

Bu proje, bir **Yemek Tarifi** web sitesinin üç farklı sunucu tarafı dili ve üç farklı veritabanı yönetim sistemi kullanılarak oluşturulmasını kapsamaktadır. Her platform aynı veritabanı yapısını (aynı tablo ve alan isimleri) ve aynı ekran tasarımını kullanır.

| # | Backend Dili | Veritabanı |
|---|-------------|------------|
| 1 | **JSP** (Java Server Pages) | **PostgreSQL** |
| 2 | **ASP** (Classic ASP / VBScript) | **MS SQL Server** |
| 3 | **PHP** (PDO) | **MySQL** |

---

## 🖥️ Uygulama Ekranları

### Ekran 1 — Ana Sayfa (`index.html`)
- 🦸 **Hero Bölümü** — Animasyonlu karşılama, floating yemek kartları, istatistikler
- 🔍 **Gerçek Zamanlı Arama** — Tarif adı, kategori veya açıklamayla anlık filtreleme
- 🏷️ **Kategori Sekmeleri** — Çorbalar, Et, Sebze, Tatlılar, Kahvaltı, Makarna, Salata, İçecekler
- ↕️ **Sıralama** — En yeni / En hızlı / En kolay / A-Z
- 🃏 **Tarif Kartları** — Fotoğraf, zorluk rozeti, süre, porsiyon bilgisi
- 🔲 **Detay Modalı** — Malzeme listesi + adım adım yapılış + alışveriş listesine ekle

### Ekran 2 — Tarif Yönetimi (`tarif-yonetim.html`)

| Panel | İkon | Açıklama |
|-------|------|---------|
| Tarif Listesi | 📋 | Tüm tarifler tablo görünümünde; detay, düzenle, sil |
| Yeni Tarif | ➕ | CRUD formu — tarif ekle/düzenle/sil, fotoğraf yükle |
| Malzeme Seçme | 🧺 | Malzeme kataloğu, kategori filtresi, yeni malzeme ekleme |
| Tarif Detay | 📖 | Seçilen tarifin tam malzeme ve adım detayı |
| Alışveriş Listesi | 🛒 | Tarif bazlı otomatik liste oluşturma, yazdırma, işaretleme |

---

## 🗄️ Veritabanı Tasarımı

### Tablolar

```
kategoriler
    │
    └──► tarifler ◄──── tarif_malzemeleri ──► malzemeler
                                                   │
                                               birimler

alisveris_listeleri ──► alisveris_kalemleri
```

| Tablo | Açıklama |
|-------|---------|
| `kategoriler` | Yemek kategorileri (Çorbalar, Tatlılar vb.) |
| `birimler` | Ölçü birimleri (gram, litre, adet, yemek kaşığı...) |
| `malzemeler` | Malzeme kataloğu |
| `tarifler` | Ana tarif tablosu |
| `tarif_malzemeleri` | Tarif ↔ Malzeme ilişki tablosu |
| `alisveris_listeleri` | Alışveriş listesi başlıkları |
| `alisveris_kalemleri` | Alışveriş listesi kalemleri |

### Veri Tipi Karşılaştırması

| Alan | PostgreSQL | MS SQL Server | MySQL |
|------|-----------|--------------|-------|
| Otomatik ID | `SERIAL` | `INT IDENTITY(1,1)` | `INT AUTO_INCREMENT` |
| Uzun metin | `TEXT` | `NVARCHAR(MAX)` | `TEXT` |
| Tarih/Saat | `TIMESTAMP DEFAULT NOW()` | `DATETIME DEFAULT GETDATE()` | `DATETIME DEFAULT NOW()` |
| Boolean | `BOOLEAN` | `BIT` | `TINYINT(1)` |
| Ondalık | `NUMERIC(10,2)` | `DECIMAL(10,2)` | `DECIMAL(10,2)` |
| Enum benzeri | `CHECK (IN (...))` | `CHECK (IN (...))` | `ENUM(...)` |

---

## ⚙️ CRUD Operasyonları

Her üç platformda **Create, Read, Update, Delete** işlemleri desteklenmektedir.

> **Not:** Silme işlemleri **yumuşak silme** (soft delete) ile yapılır — `aktif = FALSE/0` olarak işaretlenir, kayıt fiziksel olarak silinmez.

| İşlem | JSP / PostgreSQL | ASP / MSSQL | PHP / MySQL |
|-------|-----------------|-------------|------------|
| **Create** | `action=create` POST | `action=create` POST | `POST /tarifler.php` |
| **Read** | `SELECT` + `ResultSet` | `SELECT` + `DataReader` | `GET /tarifler.php` |
| **Update** | `action=update` POST | `action=update` POST | `PUT /tarifler.php?id=X` |
| **Delete** | `action=delete` GET | `action=delete` GET | `DELETE /tarifler.php?id=X` |

---

## 📁 Proje Yapısı

```
YemekTarifi/
│
├── 📄 index.html                    # Ana Sayfa — tarif listesi
├── 📄 tarif-yonetim.html            # Yönetim Sayfası — CRUD panelleri
│
├── 📂 css/
│   ├── style.css                    # Ana CSS (dark theme, glassmorphism)
│   └── yonetim.css                  # Yönetim sayfası stilleri
│
├── 📂 js/
│   ├── data.js                      # Paylaşılan veri katmanı (localStorage)
│   ├── main.js                      # Ana sayfa JavaScript
│   └── yonetim.js                   # Yönetim sayfası JavaScript
│
├── 📂 database/
│   ├── postgresql_schema.sql        # PostgreSQL şeması (JSP için)
│   ├── mssql_schema.sql             # MS SQL Server şeması (ASP için)
│   └── mysql_schema.sql             # MySQL şeması (PHP için)
│
└── 📂 backend/
    ├── 📂 jsp/
    │   ├── tarifler.jsp             # Tarif listesi sayfası
    │   └── tarif-crud.jsp           # CRUD işlemleri (create/update/delete)
    ├── 📂 asp/
    │   └── tarifler.asp             # Tarif listesi + CRUD (VBScript)
    └── 📂 php/
        ├── config.php               # Veritabanı bağlantı ayarları
        └── tarifler.php             # REST API endpoint (CRUD)
```

---

## 🚀 Kurulum ve Çalıştırma

### ▶️ Frontend Demo (Sunucu Gerekmez)
```bash
# index.html dosyasını çift tıklayarak tarayıcıda açın
# localStorage üzerinden tam CRUD işlemleri çalışır
```

### 🐘 PostgreSQL + JSP (Tomcat)
```bash
# 1. Veritabanını oluşturun
psql -U postgres -f database/postgresql_schema.sql

# 2. PostgreSQL JDBC sürücüsünü Tomcat'a ekleyin
#    postgresql-XX.jar  →  $TOMCAT_HOME/lib/

# 3. backend/jsp/ klasörünü Tomcat webapps altına kopyalayın

# 4. Bağlantı bilgilerini güncelleyin
#    backend/jsp/tarifler.jsp içinde:
String DB_URL  = "jdbc:postgresql://localhost:5432/yemek_tarifi";
String DB_USER = "postgres";
String DB_PASS = "şifreniz";
```

### 🪟 MS SQL Server + ASP (IIS)
```
1. SQL Server Management Studio'da mssql_schema.sql çalıştırın
2. IIS Manager → Classic ASP etkinleştirin
3. backend/asp/ klasörünü IIS site dizinine kopyalayın
4. tarifler.asp içindeki bağlantı string'ini güncelleyin:
   "Server=localhost;Database=yemek_tarifi;User Id=sa;Password=şifreniz;"
```

### 🐬 MySQL + PHP (Apache/XAMPP)
```bash
# 1. Veritabanını oluşturun
mysql -u root -p < database/mysql_schema.sql

# 2. backend/php/ klasörünü htdocs altına kopyalayın

# 3. Bağlantı bilgilerini güncelleyin
#    backend/php/config.php içinde:
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', 'şifreniz');
```

---

## 🎨 Tasarım Özellikleri

- 🌙 **Dark Mode** — Koyu arka plan (`#0f0e17`), yüksek kontrast
- 🔮 **Glassmorphism** — Blur efektli yarı saydam kartlar
- 🎨 **Renk Paleti** — Turuncu `#ff6b35` & Mor `#a855f7` & Yeşil `#06d6a0`
- ✨ **Animasyonlar** — Floating kartlar, fade-in, scale-in geçişleri
- 📱 **Responsive** — Mobil, tablet ve masaüstü uyumlu
- 🔤 **Google Fonts** — Playfair Display (başlıklar) + Inter (metin)

---

## 📊 Örnek Veriler

| Tablo | Hazır Kayıt |
|-------|------------|
| kategoriler | 8 (Çorbalar, Et, Sebze, Tatlılar, Kahvaltı, Makarna, Salata, İçecekler) |
| birimler | 12 (gram, kg, ml, litre, adet, yemek kaşığı...) |
| malzemeler | 20 (Un, Şeker, Domates, Tavuk, Kıyma...) |
| tarifler (demo) | 8 (Mercimek Çorbası, Tavuk Sote, Menemen, Cheesecake...) |

---

## 👤 Geliştirici Notu

Bu proje bir **üniversite ödevi** kapsamında hazırlanmıştır. Amaç; aynı veritabanı yapısının ve aynı uygulama mantığının üç farklı sunucu teknolojisinde (JSP, ASP, PHP) nasıl uygulanacağını göstermektir.

---

## 📝 Lisans

Bu proje eğitim amaçlıdır.
