-- ============================================================
-- YEMEK TARİFİ UYGULAMASI - MS SQL Server Şeması (ASP Backend)
-- ============================================================

-- Veritabanı oluşturma
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'yemek_tarifi')
BEGIN
    CREATE DATABASE yemek_tarifi
        COLLATE Turkish_CI_AS;
END
GO

USE yemek_tarifi;
GO

-- ============================================================
-- 1. KATEGORİLER TABLOSU
-- ============================================================
IF OBJECT_ID('kategoriler', 'U') IS NULL
CREATE TABLE kategoriler (
    kategori_id       INT IDENTITY(1,1) PRIMARY KEY,
    kategori_adi      NVARCHAR(100)   NOT NULL,
    aciklama          NVARCHAR(MAX),
    ikon              NVARCHAR(10),
    olusturma_tarihi  DATETIME        DEFAULT GETDATE()
);
GO

-- ============================================================
-- 2. BİRİMLER TABLOSU
-- ============================================================
IF OBJECT_ID('birimler', 'U') IS NULL
CREATE TABLE birimler (
    birim_id    INT IDENTITY(1,1) PRIMARY KEY,
    birim_adi   NVARCHAR(50)    NOT NULL,
    kisaltma    NVARCHAR(10)    NOT NULL UNIQUE
);
GO

-- ============================================================
-- 3. MALZEMELER TABLOSU
-- ============================================================
IF OBJECT_ID('malzemeler', 'U') IS NULL
CREATE TABLE malzemeler (
    malzeme_id          INT IDENTITY(1,1) PRIMARY KEY,
    malzeme_adi         NVARCHAR(150)   NOT NULL,
    malzeme_kategori    NVARCHAR(100),
    varsayilan_birim_id INT REFERENCES birimler(birim_id),
    olusturma_tarihi    DATETIME        DEFAULT GETDATE()
);
GO

-- ============================================================
-- 4. TARİFLER TABLOSU
-- ============================================================
IF OBJECT_ID('tarifler', 'U') IS NULL
CREATE TABLE tarifler (
    tarif_id          INT IDENTITY(1,1) PRIMARY KEY,
    tarif_adi         NVARCHAR(200)   NOT NULL,
    aciklama          NVARCHAR(MAX),
    hazirlik_suresi   INT             NOT NULL DEFAULT 0,
    pisirme_suresi    INT             NOT NULL DEFAULT 0,
    porsiyon          INT             NOT NULL DEFAULT 1,
    zorluk_derecesi   NVARCHAR(20)    DEFAULT 'Orta'
                      CHECK (zorluk_derecesi IN ('Kolay','Orta','Zor')),
    kategori_id       INT             REFERENCES kategoriler(kategori_id) ON DELETE SET NULL,
    fotograf_yolu     NVARCHAR(500),
    talimatlar        NVARCHAR(MAX),
    aktif             BIT             DEFAULT 1,
    olusturma_tarihi  DATETIME        DEFAULT GETDATE(),
    guncelleme_tarihi DATETIME        DEFAULT GETDATE()
);
GO

-- ============================================================
-- 5. TARİF MALZEMELERİ TABLOSU
-- ============================================================
IF OBJECT_ID('tarif_malzemeleri', 'U') IS NULL
CREATE TABLE tarif_malzemeleri (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    tarif_id    INT             NOT NULL REFERENCES tarifler(tarif_id) ON DELETE CASCADE,
    malzeme_id  INT             NOT NULL REFERENCES malzemeler(malzeme_id),
    miktar      DECIMAL(10,2)   NOT NULL,
    birim_id    INT             REFERENCES birimler(birim_id),
    notlar      NVARCHAR(200),
    CONSTRAINT uq_tarif_malzeme UNIQUE (tarif_id, malzeme_id)
);
GO

-- ============================================================
-- 6. ALIŞVERİŞ LİSTELERİ TABLOSU
-- ============================================================
IF OBJECT_ID('alisveris_listeleri', 'U') IS NULL
CREATE TABLE alisveris_listeleri (
    liste_id         INT IDENTITY(1,1) PRIMARY KEY,
    liste_adi        NVARCHAR(200)   NOT NULL,
    olusturma_tarihi DATETIME        DEFAULT GETDATE()
);
GO

-- ============================================================
-- 7. ALIŞVERİŞ LİSTESİ KALEMLERİ
-- ============================================================
IF OBJECT_ID('alisveris_kalemleri', 'U') IS NULL
CREATE TABLE alisveris_kalemleri (
    kalem_id     INT IDENTITY(1,1) PRIMARY KEY,
    liste_id     INT             NOT NULL REFERENCES alisveris_listeleri(liste_id) ON DELETE CASCADE,
    malzeme_id   INT             REFERENCES malzemeler(malzeme_id),
    malzeme_adi  NVARCHAR(200)   NOT NULL,
    miktar       DECIMAL(10,2),
    birim_id     INT             REFERENCES birimler(birim_id),
    satin_alindi BIT             DEFAULT 0,
    notlar       NVARCHAR(300)
);
GO

-- ============================================================
-- İNDEKSLER
-- ============================================================
CREATE INDEX idx_tarifler_kategori     ON tarifler(kategori_id);
CREATE INDEX idx_tarifler_aktif        ON tarifler(aktif);
CREATE INDEX idx_tarif_malz_tarif      ON tarif_malzemeleri(tarif_id);
CREATE INDEX idx_tarif_malz_malzeme    ON tarif_malzemeleri(malzeme_id);
CREATE INDEX idx_alisveris_liste       ON alisveris_kalemleri(liste_id);
GO

-- ============================================================
-- ÖRNEK VERİLER
-- ============================================================
INSERT INTO kategoriler (kategori_adi, aciklama, ikon) VALUES
(N'Çorbalar',        N'Sıcak çorba tarifleri',        N'🍲'),
(N'Et Yemekleri',    N'Kırmızı ve beyaz et tarifleri', N'🥩'),
(N'Sebze Yemekleri', N'Sağlıklı sebze tarifleri',      N'🥗'),
(N'Tatlılar',        N'Türk ve dünya tatlıları',       N'🍰'),
(N'Kahvaltılık',     N'Kahvaltı tarifleri',            N'🍳'),
(N'Makarna',         N'Her türlü makarna tarifi',      N'🍝'),
(N'Salata',          N'Taze salata tarifleri',         N'🥙'),
(N'İçecekler',       N'Sıcak ve soğuk içecekler',     N'🥤');

INSERT INTO birimler (birim_adi, kisaltma) VALUES
(N'gram',        N'g'),
(N'kilogram',    N'kg'),
(N'mililitre',   N'ml'),
(N'litre',       N'lt'),
(N'adet',        N'adet'),
(N'yemek kaşığı',N'yk'),
(N'çay kaşığı',  N'çk'),
(N'su bardağı',  N'sb'),
(N'çay bardağı', N'çb'),
(N'demet',       N'demet'),
(N'dilim',       N'dilim'),
(N'diş',         N'diş');
GO
