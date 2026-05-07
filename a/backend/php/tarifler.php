<?php
// ============================================================
//  YEMEK TARİFİ - PHP Backend (MySQL)
//  tarifler.php - CRUD İşlemleri (REST API tarzı)
// ============================================================
require_once 'config.php';

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$method = $_SERVER['REQUEST_METHOD'];
$pdo    = getDB();

// ---- CREATE (POST) ----
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) $data = $_POST;

    $sql = "INSERT INTO tarifler 
            (tarif_adi, kategori_id, hazirlik_suresi, pisirme_suresi, 
             porsiyon, zorluk_derecesi, aciklama, talimatlar, fotograf_yolu)
            VALUES (:adi, :kat, :haz, :pis, :por, :zor, :acik, :tal, :foto)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':adi'  => $data['tarif_adi']       ?? '',
        ':kat'  => (int)($data['kategori_id']    ?? 1),
        ':haz'  => (int)($data['hazirlik_suresi'] ?? 0),
        ':pis'  => (int)($data['pisirme_suresi']  ?? 0),
        ':por'  => (int)($data['porsiyon']         ?? 1),
        ':zor'  => $data['zorluk_derecesi']  ?? 'Orta',
        ':acik' => $data['aciklama']         ?? '',
        ':tal'  => $data['talimatlar']       ?? '',
        ':foto' => $data['fotograf_yolu']    ?? null,
    ]);
    $newId = $pdo->lastInsertId();

    // Malzemeleri kaydet
    if (!empty($data['malzemeler'])) {
        $ingSql = "INSERT INTO tarif_malzemeleri (tarif_id, malzeme_id, miktar, birim_id, notlar) 
                   VALUES (:tid, :mid, :mik, :bid, :not) 
                   ON DUPLICATE KEY UPDATE miktar=VALUES(miktar)";
        $ingStmt = $pdo->prepare($ingSql);
        foreach ($data['malzemeler'] as $m) {
            $ingStmt->execute([
                ':tid' => $newId,
                ':mid' => (int)$m['malzeme_id'],
                ':mik' => (float)$m['miktar'],
                ':bid' => isset($m['birim_id']) ? (int)$m['birim_id'] : null,
                ':not' => $m['notlar'] ?? null,
            ]);
        }
    }
    echo json_encode(['success' => true, 'tarif_id' => $newId, 'message' => 'Tarif eklendi!']);

// ---- READ (GET) ----
} elseif ($method === 'GET') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;

    if ($id) {
        // Tek tarif + malzemeleri
        $stmt = $pdo->prepare(
            "SELECT t.*, k.kategori_adi, k.ikon as kategori_ikon 
             FROM tarifler t LEFT JOIN kategoriler k ON t.kategori_id = k.kategori_id
             WHERE t.tarif_id = ? AND t.aktif = 1"
        );
        $stmt->execute([$id]);
        $tarif = $stmt->fetch();
        if (!$tarif) { http_response_code(404); echo json_encode(['error' => 'Tarif bulunamadı']); exit; }

        $mStmt = $pdo->prepare(
            "SELECT tm.*, m.malzeme_adi, b.kisaltma as birim
             FROM tarif_malzemeleri tm
             JOIN malzemeler m ON tm.malzeme_id = m.malzeme_id
             LEFT JOIN birimler b ON tm.birim_id = b.birim_id
             WHERE tm.tarif_id = ?"
        );
        $mStmt->execute([$id]);
        $tarif['malzemeler'] = $mStmt->fetchAll();
        echo json_encode($tarif);
    } else {
        // Tüm tarifler
        $kategori = isset($_GET['kategori']) ? (int)$_GET['kategori'] : null;
        $zorluk   = isset($_GET['zorluk'])   ? $_GET['zorluk']        : null;
        $ara      = isset($_GET['ara'])       ? '%' . $_GET['ara'] . '%' : null;

        $where = ["t.aktif = 1"];
        $params = [];
        if ($kategori) { $where[] = "t.kategori_id = ?"; $params[] = $kategori; }
        if ($zorluk)   { $where[] = "t.zorluk_derecesi = ?"; $params[] = $zorluk; }
        if ($ara)      { $where[] = "(t.tarif_adi LIKE ? OR t.aciklama LIKE ?)"; $params[] = $ara; $params[] = $ara; }

        $sql = "SELECT t.tarif_id, t.tarif_adi, t.aciklama, 
                       t.hazirlik_suresi, t.pisirme_suresi, t.porsiyon,
                       t.zorluk_derecesi, t.fotograf_yolu, t.olusturma_tarihi,
                       k.kategori_adi, k.ikon as kategori_ikon
                FROM tarifler t LEFT JOIN kategoriler k ON t.kategori_id = k.kategori_id
                WHERE " . implode(' AND ', $where) . "
                ORDER BY t.olusturma_tarihi DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        echo json_encode($stmt->fetchAll());
    }

// ---- UPDATE (PUT) ----
} elseif ($method === 'PUT') {
    $id   = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$id || !$data) { http_response_code(400); echo json_encode(['error' => 'Geçersiz istek']); exit; }

    $sql = "UPDATE tarifler SET 
                tarif_adi=:adi, kategori_id=:kat, hazirlik_suresi=:haz,
                pisirme_suresi=:pis, porsiyon=:por, zorluk_derecesi=:zor,
                aciklama=:acik, talimatlar=:tal, guncelleme_tarihi=NOW()
            WHERE tarif_id=:id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':adi'  => $data['tarif_adi'],
        ':kat'  => (int)$data['kategori_id'],
        ':haz'  => (int)$data['hazirlik_suresi'],
        ':pis'  => (int)$data['pisirme_suresi'],
        ':por'  => (int)$data['porsiyon'],
        ':zor'  => $data['zorluk_derecesi'],
        ':acik' => $data['aciklama'] ?? '',
        ':tal'  => $data['talimatlar'] ?? '',
        ':id'   => $id,
    ]);
    // Malzemeleri güncelle
    if (isset($data['malzemeler'])) {
        $pdo->prepare("DELETE FROM tarif_malzemeleri WHERE tarif_id = ?")->execute([$id]);
        $ingStmt = $pdo->prepare(
            "INSERT INTO tarif_malzemeleri (tarif_id, malzeme_id, miktar, birim_id) VALUES (?,?,?,?)"
        );
        foreach ($data['malzemeler'] as $m) {
            $ingStmt->execute([$id, (int)$m['malzeme_id'], (float)$m['miktar'], $m['birim_id'] ?? null]);
        }
    }
    echo json_encode(['success' => true, 'message' => 'Tarif güncellendi!']);

// ---- DELETE (DELETE) ----
} elseif ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID gerekli']); exit; }

    $stmt = $pdo->prepare("UPDATE tarifler SET aktif = 0 WHERE tarif_id = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true, 'message' => 'Tarif silindi.']);

} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
