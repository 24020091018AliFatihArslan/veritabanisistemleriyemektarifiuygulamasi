// ============================================================
//  YEMEK TARİFİ - Paylaşılan Veri (localStorage simülasyonu)
// ============================================================

const CATEGORIES = {
    1: { adi: 'Çorbalar',        ikon: '🍲' },
    2: { adi: 'Et Yemekleri',    ikon: '🥩' },
    3: { adi: 'Sebze Yemekleri', ikon: '🥗' },
    4: { adi: 'Tatlılar',        ikon: '🍰' },
    5: { adi: 'Kahvaltılık',     ikon: '🍳' },
    6: { adi: 'Makarna',         ikon: '🍝' },
    7: { adi: 'Salata',          ikon: '🥙' },
    8: { adi: 'İçecekler',       ikon: '🥤' },
};

const BIRIMLER = [
    { id:1,  adi:'gram',         kisaltma:'g'     },
    { id:2,  adi:'kilogram',     kisaltma:'kg'    },
    { id:3,  adi:'mililitre',    kisaltma:'ml'    },
    { id:4,  adi:'litre',        kisaltma:'lt'    },
    { id:5,  adi:'adet',         kisaltma:'adet'  },
    { id:6,  adi:'yemek kaşığı', kisaltma:'yk'    },
    { id:7,  adi:'çay kaşığı',   kisaltma:'çk'    },
    { id:8,  adi:'su bardağı',   kisaltma:'sb'    },
    { id:9,  adi:'çay bardağı',  kisaltma:'çb'    },
    { id:10, adi:'demet',        kisaltma:'demet' },
    { id:11, adi:'dilim',        kisaltma:'dilim' },
    { id:12, adi:'diş',          kisaltma:'diş'   },
];

const DEFAULT_MALZEMELER = [
    { id:1,  adi:'Un',              kategori:'Kuru Malzeme', birimId:1  },
    { id:2,  adi:'Şeker',           kategori:'Kuru Malzeme', birimId:1  },
    { id:3,  adi:'Tuz',             kategori:'Kuru Malzeme', birimId:7  },
    { id:4,  adi:'Tereyağı',        kategori:'Süt Ürünleri', birimId:1  },
    { id:5,  adi:'Sıvıyağ',         kategori:'Yağlar',       birimId:6  },
    { id:6,  adi:'Yumurta',         kategori:'Süt Ürünleri', birimId:5  },
    { id:7,  adi:'Süt',             kategori:'Süt Ürünleri', birimId:4  },
    { id:8,  adi:'Domates',         kategori:'Sebze',        birimId:5  },
    { id:9,  adi:'Soğan',           kategori:'Sebze',        birimId:5  },
    { id:10, adi:'Sarımsak',        kategori:'Sebze',        birimId:12 },
    { id:11, adi:'Tavuk Göğsü',     kategori:'Et',           birimId:1  },
    { id:12, adi:'Kıyma',           kategori:'Et',           birimId:1  },
    { id:13, adi:'Patates',         kategori:'Sebze',        birimId:1  },
    { id:14, adi:'Havuç',           kategori:'Sebze',        birimId:5  },
    { id:15, adi:'Biber',           kategori:'Sebze',        birimId:5  },
    { id:16, adi:'Maydanoz',        kategori:'Ot',           birimId:10 },
    { id:17, adi:'Nane',            kategori:'Ot',           birimId:10 },
    { id:18, adi:'Pirinç',          kategori:'Tahıl',        birimId:8  },
    { id:19, adi:'Makarna',         kategori:'Tahıl',        birimId:1  },
    { id:20, adi:'Domates Salçası', kategori:'Konserve',     birimId:6  },
];

const DEFAULT_TARIFLER = [
    {
        id: 1, adi: 'Mercimek Çorbası',
        aciklama: 'Geleneksel Türk mercimek çorbası, hem doyurucu hem lezzetli bir klasik.',
        hazirlik: 10, pisirme: 25, porsiyon: 4,
        zorluk: 'Kolay', kategoriId: 1, emoji: '🍲',
        talimatlar: [
            'Soğanı yağda altın rengi olana kadar kavurun.',
            'Mercimeği ve havucu ekleyip 2-3 dakika kavurun.',
            '4 bardak su ekleyip kısık ateşte 25 dakika pişirin.',
            'Pişen karışımı blenderdan geçirin.',
            'Tuz, karabiber ve kimyon ekleyip karıştırın.',
            'Üzerine kızarmış ekmek küpleri ile servis yapın.'
        ],
        malzemeler: [
            { id:3, adi:'Tuz', miktar:1.5, birim:'çk' },
            { id:9, adi:'Soğan', miktar:1, birim:'adet' },
        ]
    },
    {
        id: 2, adi: 'Tavuk Sote',
        aciklama: 'Renkli sebzelerle hafif ve lezzetli tavuk sote. Pratik ve sağlıklı bir seçenek.',
        hazirlik: 15, pisirme: 20, porsiyon: 2,
        zorluk: 'Orta', kategoriId: 2, emoji: '🥩',
        talimatlar: [
            'Tavuk göğsünü küp şeklinde doğrayın.',
            'Tavada sıvıyağı kızdırın.',
            'Tavukları ekleyip altın rengi olana kadar kavurun.',
            'Biber, soğan ve domatesi ekleyin.',
            'Tuz ve baharatları ekleyip 5 dakika daha pişirin.',
            'Maydanoz serperek servis yapın.'
        ],
        malzemeler: [
            { id:11, adi:'Tavuk Göğsü', miktar:400, birim:'g' },
            { id:5,  adi:'Sıvıyağ',     miktar:2,   birim:'yk' },
            { id:8,  adi:'Domates',      miktar:2,   birim:'adet' },
            { id:9,  adi:'Soğan',        miktar:1,   birim:'adet' },
            { id:15, adi:'Biber',        miktar:2,   birim:'adet' },
            { id:3,  adi:'Tuz',          miktar:1,   birim:'çk' },
        ]
    },
    {
        id: 3, adi: 'Peynirli Makarna',
        aciklama: 'Kremsi peynir sosuyla klasik İtalyan tarzı makarna, 20 dakikada hazır.',
        hazirlik: 5, pisirme: 15, porsiyon: 3,
        zorluk: 'Kolay', kategoriId: 6, emoji: '🍝',
        talimatlar: [
            'Makarnayı tuzlu suda al dente pişirin.',
            'Tereyağını tavada eritin.',
            'Sarımsak ekleyip kısık ateşte kavurun.',
            'Süt ekleyip karıştırın.',
            'Rendelenmiş peyniri ekleyip eritin.',
            'Süzülmüş makarnayı ekleyip karıştırarak servis yapın.'
        ],
        malzemeler: [
            { id:19, adi:'Makarna',   miktar:300, birim:'g'   },
            { id:4,  adi:'Tereyağı', miktar:50,  birim:'g'   },
            { id:7,  adi:'Süt',      miktar:0.5, birim:'lt'  },
            { id:10, adi:'Sarımsak', miktar:3,   birim:'diş' },
            { id:3,  adi:'Tuz',      miktar:1,   birim:'çk'  },
        ]
    },
    {
        id: 4, adi: 'Çoban Salatası',
        aciklama: 'Taze sebzelerle hazırlanan ferahlatıcı çoban salatası.',
        hazirlik: 10, pisirme: 0, porsiyon: 4,
        zorluk: 'Kolay', kategoriId: 7, emoji: '🥗',
        talimatlar: [
            'Domatesleri küp şeklinde doğrayın.',
            'Salatalık ve biberi doğrayın.',
            'Soğanı ince halkalar halinde kesin.',
            'Hepsini büyük bir kaseye alın.',
            'Zeytinyağı, limon suyu ve tuz ekleyin.',
            'Maydanoz serperek servis yapın.'
        ],
        malzemeler: [
            { id:8,  adi:'Domates',  miktar:3,   birim:'adet'  },
            { id:9,  adi:'Soğan',    miktar:1,   birim:'adet'  },
            { id:15, adi:'Biber',    miktar:2,   birim:'adet'  },
            { id:16, adi:'Maydanoz', miktar:0.5, birim:'demet' },
            { id:3,  adi:'Tuz',      miktar:1,   birim:'çk'    },
        ]
    },
    {
        id: 5, adi: 'Menemen',
        aciklama: 'Kahvaltının vazgeçilmezi! Yumurtalı ve domatesli nefis menemen tarifi.',
        hazirlik: 5, pisirme: 12, porsiyon: 2,
        zorluk: 'Kolay', kategoriId: 5, emoji: '🍳',
        talimatlar: [
            'Tavada yağı ısıtın.',
            'Biber ve domatesi ekleyip kavurun.',
            'Yumurtaları kırıp karıştırın.',
            'Tuz ve karabiber ekleyin.',
            'Yumurta pişene kadar kısık ateşte bekletin.',
            'Maydanoz serperek servis yapın.'
        ],
        malzemeler: [
            { id:6,  adi:'Yumurta', miktar:3,   birim:'adet' },
            { id:8,  adi:'Domates', miktar:2,   birim:'adet' },
            { id:15, adi:'Biber',   miktar:1,   birim:'adet' },
            { id:5,  adi:'Sıvıyağ', miktar:2,   birim:'yk'   },
            { id:3,  adi:'Tuz',     miktar:0.5, birim:'çk'   },
        ]
    },
    {
        id: 6, adi: 'İrmik Helvası',
        aciklama: 'Annem gibi yapılan geleneksel Türk irmik helvası. Mis gibi fındık kokusuyla.',
        hazirlik: 5, pisirme: 20, porsiyon: 6,
        zorluk: 'Orta', kategoriId: 4, emoji: '🍮',
        talimatlar: [
            'Tereyağını tencerede eritin.',
            'İrmiği ekleyip sürekli karıştırarak 10 dakika kavurun.',
            'Ayrı bir tencerede süt ve şekeri kaynatın.',
            'Sütü yavaşça irmik karışımına ekleyin.',
            'Kapağını kapatıp 10 dakika demlenmeye bırakın.',
            'Fındık ile servis yapın.'
        ],
        malzemeler: [
            { id:4, adi:'Tereyağı', miktar:100, birim:'g'  },
            { id:2, adi:'Şeker',    miktar:1,   birim:'sb' },
            { id:7, adi:'Süt',      miktar:2,   birim:'sb' },
        ]
    },
    {
        id: 7, adi: 'Kıymalı Pide',
        aciklama: 'Fırından çıkmış sıcak sıcak kıymalı pide. Türk mutfağının favorisi.',
        hazirlik: 30, pisirme: 20, porsiyon: 4,
        zorluk: 'Zor', kategoriId: 2, emoji: '🥙',
        talimatlar: [
            'Hamuru un, su, maya ve tuzla yoğurup mayalanmaya bırakın.',
            'Kıymayı soğan, domates ve baharatlarla kavurun.',
            'Hamuru açıp üzerine iç harcı yayın.',
            'Kenarları katlayarak pide şekli verin.',
            '220°C fırında 18-20 dakika pişirin.',
            'Sıcak sıcak servis yapın.'
        ],
        malzemeler: [
            { id:12, adi:'Kıyma',    miktar:300, birim:'g'    },
            { id:1,  adi:'Un',       miktar:3,   birim:'sb'   },
            { id:9,  adi:'Soğan',    miktar:2,   birim:'adet' },
            { id:8,  adi:'Domates',  miktar:2,   birim:'adet' },
            { id:3,  adi:'Tuz',      miktar:1,   birim:'çk'   },
        ]
    },
    {
        id: 8, adi: 'Limonata',
        aciklama: 'Ev yapımı ferahlatıcı limonata. Yaz sıcaklarının baş tacı.',
        hazirlik: 10, pisirme: 5, porsiyon: 6,
        zorluk: 'Kolay', kategoriId: 8, emoji: '🥤',
        talimatlar: [
            'Limonları sıkıp suyunu alın.',
            'Şeker şerbeti hazırlayın.',
            'Limon suyu, şerbet ve suyu karıştırın.',
            'Nane yaprakları ekleyin.',
            'Buzlu olarak servis yapın.'
        ],
        malzemeler: [
            { id:2,  adi:'Şeker',   miktar:200, birim:'g'   },
            { id:17, adi:'Nane',    miktar:1,   birim:'demet'},
        ]
    },
];

// LocalStorage CRUD işlemleri
function getTarifler() {
    const data = localStorage.getItem('yemek_tarifler');
    return data ? JSON.parse(data) : [...DEFAULT_TARIFLER];
}
function saveTarifler(list) {
    localStorage.setItem('yemek_tarifler', JSON.stringify(list));
}
function getMalzemeler() {
    const data = localStorage.getItem('yemek_malzemeler');
    return data ? JSON.parse(data) : [...DEFAULT_MALZEMELER];
}
function saveMalzemeler(list) {
    localStorage.setItem('yemek_malzemeler', JSON.stringify(list));
}
function getShoppingLists() {
    const data = localStorage.getItem('yemek_alisveris');
    return data ? JSON.parse(data) : [];
}
function saveShoppingLists(list) {
    localStorage.setItem('yemek_alisveris', JSON.stringify(list));
}

// İlk yüklemede localStorage'ı başlat
if (!localStorage.getItem('yemek_tarifler')) saveTarifler(DEFAULT_TARIFLER);
if (!localStorage.getItem('yemek_malzemeler')) saveMalzemeler(DEFAULT_MALZEMELER);

function getCategoryName(id) {
    return CATEGORIES[id] ? CATEGORIES[id].adi : 'Diğer';
}
function getCategoryIcon(id) {
    return CATEGORIES[id] ? CATEGORIES[id].ikon : '🍴';
}
function getBirim(id) {
    return BIRIMLER.find(b => b.id === id) || { kisaltma: '' };
}
function getDifficultyClass(zorluk) {
    if (zorluk === 'Kolay') return 'diff-easy badge-easy';
    if (zorluk === 'Zor')   return 'diff-hard badge-hard';
    return 'diff-medium badge-medium';
}
function getTotalTime(h, p) {
    const total = h + p;
    if (total >= 60) return `${Math.floor(total/60)}s ${total%60}dk`;
    return `${total} dk`;
}
