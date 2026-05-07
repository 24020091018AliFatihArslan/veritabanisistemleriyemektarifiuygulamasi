-- ============================================================
-- YEMEK TARİFİ UYGULAMASI - MySQL Şeması (PHP Backend)
-- ============================================================

CREATE DATABASE IF NOT EXISTS yemek_tarifi
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_turkish_ci;

USE yemek_tarifi;

-- ============================================================
-- 1. KATEGORİLER TABLOSU
-- ============================================================
CREATE TABLE IF NOT EXISTS kategoriler (
    kategori_id       INT AUTO_INCREMENT PRIMARY KEY,
    kategori_adi      VARCHAR(100)    NOT NULL,
    aciklama          TEXT,
    ikon              VARCHAR(10),
    olusturma_tarihi  DATETIME        DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- ============================================================
-- 2. BİRİMLER TABLOSU
-- ============================================================
CREATE TABLE IF NOT EXISTS birimler (
    birim_id    INT AUTO_INCREMENT PRIMARY KEY,
    birim_adi   VARCHAR(50)     NOT NULL,
    kisaltma    VARCHAR(10)     NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- ============================================================
-- 3. MALZEMELER TABLOSU
-- ============================================================
CREATE TABLE IF NOT EXISTS malzemeler (
    malzeme_id          INT AUTO_INCREMENT PRIMARY KEY,
    malzeme_adi         VARCHAR(150)    NOT NULL,
    malzeme_kategori    VARCHAR(100),
    varsayilan_birim_id INT,
    olusturma_tarihi    DATETIME        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (varsayilan_birim_id) REFERENCES birimler(birim_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- ============================================================
-- 4. TARİFLER TABLOSU
-- ============================================================
CREATE TABLE IF NOT EXISTS tarifler (
    tarif_id          INT AUTO_INCREMENT PRIMARY KEY,
    tarif_adi         VARCHAR(200)    NOT NULL,
    aciklama          TEXT,
    hazirlik_suresi   INT             NOT NULL DEFAULT 0,
    pisirme_suresi    INT             NOT NULL DEFAULT 0,
    porsiyon          INT             NOT NULL DEFAULT 1,
    zorluk_derecesi   ENUM('Kolay','Orta','Zor') DEFAULT 'Orta',
    kategori_id       INT,
    fotograf_yolu     VARCHAR(500),
    talimatlar        TEXT,
    aktif             TINYINT(1)      DEFAULT 1,
    olusturma_tarihi  DATETIME        DEFAULT CURRENT_TIMESTAMP,
    guncelleme_tarihi DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (kategori_id) REFERENCES kategoriler(kategori_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- ============================================================
-- 5. TARİF MALZEMELERİ TABLOSU
-- ============================================================
CREATE TABLE IF NOT EXISTS tarif_malzemeleri (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    tarif_id    INT             NOT NULL,
    malzeme_id  INT             NOT NULL,
    miktar      DECIMAL(10,2)   NOT NULL,
    birim_id    INT,
    notlar      VARCHAR(200),
    UNIQUE KEY uq_tarif_malzeme (tarif_id, malzeme_id),
    FOREIGN KEY (tarif_id)   REFERENCES tarifler(tarif_id)   ON DELETE CASCADE,
    FOREIGN KEY (malzeme_id) REFERENCES malzemeler(malzeme_id) ON DELETE RESTRICT,
    FOREIGN KEY (birim_id)   REFERENCES birimler(birim_id)   ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- ============================================================
-- 6. ALIŞVERİŞ LİSTELERİ TABLOSU
-- ============================================================
CREATE TABLE IF NOT EXISTS alisveris_listeleri (
    liste_id         INT AUTO_INCREMENT PRIMARY KEY,
    liste_adi        VARCHAR(200)    NOT NULL,
    olusturma_tarihi DATETIME        DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- ============================================================
-- 7. ALIŞVERİŞ LİSTESİ KALEMLERİ
-- ============================================================
CREATE TABLE IF NOT EXISTS alisveris_kalemleri (
    kalem_id     INT AUTO_INCREMENT PRIMARY KEY,
    liste_id     INT             NOT NULL,
    malzeme_id   INT,
    malzeme_adi  VARCHAR(200)    NOT NULL,
    miktar       DECIMAL(10,2),
    birim_id     INT,
    satin_alindi TINYINT(1)      DEFAULT 0,
    notlar       VARCHAR(300),
    FOREIGN KEY (liste_id)   REFERENCES alisveris_listeleri(liste_id) ON DELETE CASCADE,
    FOREIGN KEY (malzeme_id) REFERENCES malzemeler(malzeme_id)        ON DELETE SET NULL,
    FOREIGN KEY (birim_id)   REFERENCES birimler(birim_id)            ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- ============================================================
-- İNDEKSLER
-- ============================================================
CREATE INDEX idx_tarifler_kategori     ON tarifler(kategori_id);
CREATE INDEX idx_tarifler_aktif        ON tarifler(aktif);
CREATE INDEX idx_tarif_malz_tarif      ON tarif_malzemeleri(tarif_id);
CREATE INDEX idx_tarif_malz_malzeme    ON tarif_malzemeleri(malzeme_id);
CREATE INDEX idx_alisveris_liste       ON alisveris_kalemleri(liste_id);

-- ============================================================
-- ÖRNEK VERİLER
-- ============================================================
INSERT INTO kategoriler (kategori_adi, aciklama, ikon) VALUES
('Çorbalar',        'Sıcak çorba tarifleri',        '🍲'),
('Et Yemekleri',    'Kırmızı ve beyaz et tarifleri','🥩'),
('Sebze Yemekleri', 'Sağlıklı sebze tarifleri',     '🥗'),
('Tatlılar',        'Türk ve dünya tatlıları',      '🍰'),
('Kahvaltılık',     'Kahvaltı tarifleri',            '🍳'),
('Makarna',         'Her türlü makarna tarifi',     '🍝'),
('Salata',          'Taze salata tarifleri',         '🥙'),
('İçecekler',       'Sıcak ve soğuk içecekler',     '🥤');

INSERT INTO birimler (birim_adi, kisaltma) VALUES
('gram',        'g'),
('kilogram',    'kg'),
('mililitre',   'ml'),
('litre',       'lt'),
('adet',        'adet'),
('yemek kaşığı','yk'),
('çay kaşığı',  'çk'),
('su bardağı',  'sb'),
('çay bardağı', 'çb'),
('demet',       'demet'),
('dilim',       'dilim'),
('diş',         'diş');

INSERT INTO malzemeler (malzeme_adi, malzeme_kategori, varsayilan_birim_id) VALUES
('Un',               'Kuru Malzeme', 1),
('Şeker',            'Kuru Malzeme', 1),
('Tuz',              'Kuru Malzeme', 7),
('Tereyağı',         'Süt Ürünleri', 1),
('Sıvıyağ',          'Yağlar',       6),
('Yumurta',          'Süt Ürünleri', 5),
('Süt',              'Süt Ürünleri', 4),
('Domates',          'Sebze',        5),
('Soğan',            'Sebze',        5),
('Sarımsak',         'Sebze',       12),
('Tavuk Göğsü',      'Et',           1),
('Kıyma',            'Et',           1),
('Patates',          'Sebze',        1),
('Havuç',            'Sebze',        5),
('Biber',            'Sebze',        5),
('Maydanoz',         'Ot',          10),
('Nane',             'Ot',          10),
('Pirinç',           'Tahıl',        8),
('Makarna',          'Tahıl',        1),
('Domates Salçası',  'Konserve',     6);

INSERT INTO tarifler (tarif_adi, aciklama, hazirlik_suresi, pisirme_suresi, porsiyon, zorluk_derecesi, kategori_id, talimatlar) VALUES
('Mercimek Çorbası',
 'Geleneksel Türk mercimek çorbası, hem doyurucu hem lezzetli.',
 10, 25, 4, 'Kolay', 1,
 '1. Soğanı yağda kavurun.\n2. Mercimeği ekleyin.\n3. Su ekleyip pişirin.\n4. Blenderdan geçirin.\n5. Tuz ve baharat ekleyin.'),

('Tavuk Sote',
 'Sebzeli hafif tavuk sote, pratik ve lezzetli.',
 15, 20, 2, 'Orta', 2,
 '1. Tavukları küp doğrayın.\n2. Tavada yağı kızdırın.\n3. Tavukları kavurun.\n4. Sebzeleri ekleyin.\n5. Baharat ekleyip servis yapın.');
