-- ============================================================
-- YEMEK TARİFİ UYGULAMASI - PostgreSQL Şeması (JSP Backend)
-- ============================================================

-- Veritabanı oluşturma
CREATE DATABASE yemek_tarifi
    WITH ENCODING = 'UTF8'
    LC_COLLATE = 'tr_TR.UTF-8'
    LC_CTYPE = 'tr_TR.UTF-8'
    TEMPLATE = template0;

\c yemek_tarifi;

-- ============================================================
-- 1. KATEGORİLER TABLOSU
-- ============================================================
CREATE TABLE kategoriler (
    kategori_id   SERIAL          PRIMARY KEY,
    kategori_adi  VARCHAR(100)    NOT NULL,
    aciklama      TEXT,
    ikon          VARCHAR(10),
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. BİRİMLER TABLOSU
-- ============================================================
CREATE TABLE birimler (
    birim_id     SERIAL          PRIMARY KEY,
    birim_adi    VARCHAR(50)     NOT NULL,
    kisaltma     VARCHAR(10)     NOT NULL UNIQUE
);

-- ============================================================
-- 3. MALZEMELER TABLOSU
-- ============================================================
CREATE TABLE malzemeler (
    malzeme_id    SERIAL          PRIMARY KEY,
    malzeme_adi   VARCHAR(150)    NOT NULL,
    malzeme_kategori VARCHAR(100),
    varsayilan_birim_id INTEGER REFERENCES birimler(birim_id),
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 4. TARİFLER TABLOSU
-- ============================================================
CREATE TABLE tarifler (
    tarif_id          SERIAL          PRIMARY KEY,
    tarif_adi         VARCHAR(200)    NOT NULL,
    aciklama          TEXT,
    hazirlik_suresi   INTEGER         NOT NULL DEFAULT 0,  -- dakika
    pisirme_suresi    INTEGER         NOT NULL DEFAULT 0,  -- dakika
    porsiyon          INTEGER         NOT NULL DEFAULT 1,
    zorluk_derecesi   VARCHAR(20)     CHECK (zorluk_derecesi IN ('Kolay','Orta','Zor')) DEFAULT 'Orta',
    kategori_id       INTEGER         REFERENCES kategoriler(kategori_id) ON DELETE SET NULL,
    fotograf_yolu     VARCHAR(500),
    talimatlar        TEXT,
    aktif             BOOLEAN         DEFAULT TRUE,
    olusturma_tarihi  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    guncelleme_tarihi TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 5. TARİF MALZEMELERİ TABLOSU (İlişki Tablosu)
-- ============================================================
CREATE TABLE tarif_malzemeleri (
    id          SERIAL      PRIMARY KEY,
    tarif_id    INTEGER     NOT NULL REFERENCES tarifler(tarif_id) ON DELETE CASCADE,
    malzeme_id  INTEGER     NOT NULL REFERENCES malzemeler(malzeme_id) ON DELETE RESTRICT,
    miktar      NUMERIC(10,2) NOT NULL,
    birim_id    INTEGER     REFERENCES birimler(birim_id),
    notlar      VARCHAR(200),
    UNIQUE (tarif_id, malzeme_id)
);

-- ============================================================
-- 6. ALIŞVERİŞ LİSTELERİ TABLOSU
-- ============================================================
CREATE TABLE alisveris_listeleri (
    liste_id        SERIAL      PRIMARY KEY,
    liste_adi       VARCHAR(200) NOT NULL,
    olusturma_tarihi TIMESTAMP  DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 7. ALIŞVERİŞ LİSTESİ KALEMLERİ
-- ============================================================
CREATE TABLE alisveris_kalemleri (
    kalem_id    SERIAL      PRIMARY KEY,
    liste_id    INTEGER     NOT NULL REFERENCES alisveris_listeleri(liste_id) ON DELETE CASCADE,
    malzeme_id  INTEGER     REFERENCES malzemeler(malzeme_id),
    malzeme_adi VARCHAR(200) NOT NULL,
    miktar      NUMERIC(10,2),
    birim_id    INTEGER     REFERENCES birimler(birim_id),
    satin_alindi BOOLEAN    DEFAULT FALSE,
    notlar      VARCHAR(300)
);

-- ============================================================
-- İNDEKSLER
-- ============================================================
CREATE INDEX idx_tarifler_kategori ON tarifler(kategori_id);
CREATE INDEX idx_tarifler_aktif    ON tarifler(aktif);
CREATE INDEX idx_tarif_malz_tarif  ON tarif_malzemeleri(tarif_id);
CREATE INDEX idx_tarif_malz_malzeme ON tarif_malzemeleri(malzeme_id);
CREATE INDEX idx_alisveris_kalemleri_liste ON alisveris_kalemleri(liste_id);

-- ============================================================
-- ÖRNEK VERİLER
-- ============================================================
INSERT INTO kategoriler (kategori_adi, aciklama, ikon) VALUES
('Çorbalar',   'Sıcak çorba tarifleri',       '🍲'),
('Et Yemekleri','Kırmızı ve beyaz et tarifleri','🥩'),
('Sebze Yemekleri','Sağlıklı sebze tarifleri', '🥗'),
('Tatlılar',   'Türk ve dünya tatlıları',      '🍰'),
('Kahvaltılık','Kahvaltı tarifleri',            '🍳'),
('Makarna',    'Her türlü makarna tarifi',      '🍝'),
('Salata',     'Taze salata tarifleri',         '🥙'),
('Içecekler',  'Sıcak ve soğuk içecekler',     '🥤');

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
('Un',              'Kuru Malzeme', 1),
('Şeker',           'Kuru Malzeme', 1),
('Tuz',             'Kuru Malzeme', 7),
('Tereyağı',        'Süt Ürünleri', 1),
('Sıvıyağ',         'Yağlar',       6),
('Yumurta',         'Süt Ürünleri', 5),
('Süt',             'Süt Ürünleri', 4),
('Domates',         'Sebze',        5),
('Soğan',           'Sebze',        5),
('Sarımsak',        'Sebze',       12),
('Tavuk Göğsü',     'Et',           1),
('Kıyma',           'Et',           1),
('Patates',         'Sebze',        1),
('Havuç',           'Sebze',        5),
('Biber',           'Sebze',        5),
('Maydanoz',        'Ot',          10),
('Nane',            'Ot',          10),
('Pirinç',          'Tahıl',        8),
('Makarna',         'Tahıl',        1),
('Domates Salçası', 'Konserve',     6);

INSERT INTO tarifler (tarif_adi, aciklama, hazirlik_suresi, pisirme_suresi, porsiyon, zorluk_derecesi, kategori_id, talimatlar) VALUES
('Mercimek Çorbası',
 'Geleneksel Türk mercimek çorbası, hem doyurucu hem lezzetli.',
 10, 25, 4, 'Kolay', 1,
 '1. Soğanı yağda kavurun.\n2. Mercimeği ekleyin.\n3. Su ekleyip pişirin.\n4. Blenderdan geçirin.\n5. Tuz ve baharat ekleyin.'),

('Tavuk Sote',
 'Sebzeli hafif tavuk sote, pratik ve lezzetli.',
 15, 20, 2, 'Orta', 2,
 '1. Tavukları küp doğrayın.\n2. Tavada yağı kızdırın.\n3. Tavukları kavurun.\n4. Sebzeleri ekleyin.\n5. Baharat ekleyip servis yapın.'),

('Türk Kahvesi Cheesecake',
 'Türk kahvesi aromalı nefis bir cheesecake tarifi.',
 30, 60, 8, 'Zor', 4,
 '1. Krem peyniri çırpın.\n2. Yumurta ekleyin.\n3. Türk kahvesi ekleyin.\n4. Fırında 160°C''de pişirin.\n5. Soğutup servis edin.');
