<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.sql.*" %>
<%
// ============================================================
//  YEMEK TARİFİ - JSP Backend (PostgreSQL)
//  Sayfa: Tarif CRUD İşlemleri
// ============================================================

String DB_URL  = "jdbc:postgresql://localhost:5432/yemek_tarifi";
String DB_USER = "postgres";
String DB_PASS = "a1a23456";

String action  = request.getParameter("action");
String message = "";

Connection conn = null;
PreparedStatement ps = null;

try {
    Class.forName("org.postgresql.Driver");
    conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);

    // ---- CREATE ----
    if ("create".equals(action)) {
        String adi     = request.getParameter("tarif_adi");
        int    katId   = Integer.parseInt(request.getParameter("kategori_id"));
        int    hazirlik= Integer.parseInt(request.getParameter("hazirlik_suresi"));
        int    pisirme = Integer.parseInt(request.getParameter("pisirme_suresi"));
        int    pors    = Integer.parseInt(request.getParameter("porsiyon"));
        String zorluk  = request.getParameter("zorluk_derecesi");
        String aciklama= request.getParameter("aciklama");
        String talim   = request.getParameter("talimatlar");

        String sql = "INSERT INTO tarifler (tarif_adi, kategori_id, hazirlik_suresi, pisirme_suresi, " +
                     "porsiyon, zorluk_derecesi, aciklama, talimatlar) VALUES (?,?,?,?,?,?,?,?)";
        ps = conn.prepareStatement(sql);
        ps.setString(1, adi);
        ps.setInt(2, katId);
        ps.setInt(3, hazirlik);
        ps.setInt(4, pisirme);
        ps.setInt(5, pors);
        ps.setString(6, zorluk);
        ps.setString(7, aciklama);
        ps.setString(8, talim);
        ps.executeUpdate();
        message = "✅ Tarif başarıyla eklendi!";

    // ---- UPDATE ----
    } else if ("update".equals(action)) {
        int    id      = Integer.parseInt(request.getParameter("tarif_id"));
        String adi     = request.getParameter("tarif_adi");
        int    katId   = Integer.parseInt(request.getParameter("kategori_id"));
        int    hazirlik= Integer.parseInt(request.getParameter("hazirlik_suresi"));
        int    pisirme = Integer.parseInt(request.getParameter("pisirme_suresi"));
        int    pors    = Integer.parseInt(request.getParameter("porsiyon"));
        String zorluk  = request.getParameter("zorluk_derecesi");
        String aciklama= request.getParameter("aciklama");
        String talim   = request.getParameter("talimatlar");

        String sql = "UPDATE tarifler SET tarif_adi=?, kategori_id=?, hazirlik_suresi=?, pisirme_suresi=?, " +
                     "porsiyon=?, zorluk_derecesi=?, aciklama=?, talimatlar=?, " +
                     "guncelleme_tarihi=CURRENT_TIMESTAMP WHERE tarif_id=?";
        ps = conn.prepareStatement(sql);
        ps.setString(1, adi);   ps.setInt(2, katId);    ps.setInt(3, hazirlik);
        ps.setInt(4, pisirme);  ps.setInt(5, pors);      ps.setString(6, zorluk);
        ps.setString(7, aciklama); ps.setString(8, talim); ps.setInt(9, id);
        ps.executeUpdate();
        message = "✅ Tarif güncellendi!";

    // ---- DELETE ----
    } else if ("delete".equals(action)) {
        int id = Integer.parseInt(request.getParameter("tarif_id"));
        ps = conn.prepareStatement("UPDATE tarifler SET aktif=FALSE WHERE tarif_id=?");
        ps.setInt(1, id);
        ps.executeUpdate();
        message = "🗑️ Tarif silindi.";

    // ---- READ ONE ----
    } else if ("read".equals(action)) {
        // Tek tarif detayı - tarifler.jsp'e yönlendir
        response.sendRedirect("tarifler.jsp?id=" + request.getParameter("tarif_id"));
        return;
    }

} catch (Exception ex) {
    message = "❌ Hata: " + ex.getMessage();
} finally {
    if (ps != null) try { ps.close(); } catch(Exception e){}
    if (conn != null) try { conn.close(); } catch(Exception e){}
}

// İşlem sonrası ana sayfaya dön
response.sendRedirect("tarifler.jsp?msg=" + java.net.URLEncoder.encode(message, "UTF-8"));
%>
