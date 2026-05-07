<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.sql.*" %>
<%
// ============================================================
//  YEMEK TARİFİ - JSP Backend (PostgreSQL)
//  Sayfa: Ana Tarif Listesi
// ============================================================

// Veritabanı bağlantı ayarları
String DB_URL  = "jdbc:postgresql://localhost:5432/yemek_tarifi";
String DB_USER = "postgres";
String DB_PASS = "yourpassword";

Connection conn = null;
ResultSet rs    = null;
PreparedStatement ps = null;

try {
    Class.forName("org.postgresql.Driver");
    conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
%>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>Yemek Tarifi - JSP/PostgreSQL</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
<h2>📋 Tarifler (JSP + PostgreSQL)</h2>
<table border="1">
    <thead>
        <tr><th>#</th><th>Tarif Adı</th><th>Kategori</th><th>Süre</th><th>Zorluk</th><th>Porsiyon</th></tr>
    </thead>
    <tbody>
<%
    String sql = "SELECT t.tarif_id, t.tarif_adi, k.kategori_adi, " +
                 "(t.hazirlik_suresi + t.pisirme_suresi) AS toplam_sure, " +
                 "t.zorluk_derecesi, t.porsiyon " +
                 "FROM tarifler t " +
                 "LEFT JOIN kategoriler k ON t.kategori_id = k.kategori_id " +
                 "WHERE t.aktif = TRUE ORDER BY t.olusturma_tarihi DESC";
    ps = conn.prepareStatement(sql);
    rs = ps.executeQuery();
    int row = 1;
    while (rs.next()) {
%>
        <tr>
            <td><%= row++ %></td>
            <td><%= rs.getString("tarif_adi") %></td>
            <td><%= rs.getString("kategori_adi") %></td>
            <td><%= rs.getInt("toplam_sure") %> dk</td>
            <td><%= rs.getString("zorluk_derecesi") %></td>
            <td><%= rs.getInt("porsiyon") %> kişi</td>
        </tr>
<%  }  %>
    </tbody>
</table>
<%
} catch (Exception ex) {
    out.println("<p style='color:red'>Hata: " + ex.getMessage() + "</p>");
} finally {
    if (rs != null) try { rs.close(); } catch(Exception e){}
    if (ps != null) try { ps.close(); } catch(Exception e){}
    if (conn != null) try { conn.close(); } catch(Exception e){}
}
%>
</body>
</html>
