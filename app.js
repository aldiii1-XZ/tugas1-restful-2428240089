// =====================================================================
// Tugas 1 - RESTful API Murni dengan Express.js
// Topik 23 - Perikanan: Kolam Ikan
// Resource: /fish-ponds
// Nama  : Aldi Yonatan Rusnawan
// NIM   : 2428240089
// Kelas : SI5B
// =====================================================================

// impor express
const express = require('express');
// buat instance aplikasi express
const app = express();
// port server (pakai PORT dari environment bila ada, default 3000)
const PORT = process.env.PORT || 3000;

// middleware untuk membaca body JSON dari request (req.body)
app.use(express.json());

// =====================================================================
// Data awal (array di memori) - minimal 3 data
// Field: kodeKolam*, jenisIkan*, jumlahBibit*, luasM2*, tanggalTebar*
// =====================================================================
let fishPonds = [
  {
    id: 1,
    kodeKolam: 'K-01',
    jenisIkan: 'lele',
    jumlahBibit: 3000,
    luasM2: 24,
    tanggalTebar: '2026-08-15',
  },
  {
    id: 2,
    kodeKolam: 'K-02',
    jenisIkan: 'nila',
    jumlahBibit: 2500,
    luasM2: 30,
    tanggalTebar: '2026-08-20',
  },
  {
    id: 3,
    kodeKolam: 'K-03',
    jenisIkan: 'lele',
    jumlahBibit: 4000,
    luasM2: 36,
    tanggalTebar: '2026-09-01',
  },
];

// penanda id berikutnya (id terakhir + 1)
let nextId = 4;

// =====================================================================
// GET / - info API (JSON, bukan teks/HTML)
// =====================================================================
app.get('/', (req, res) => {
  res.json({
    nama: 'Aldi Yonatan Rusnawan',
    nim: '2428240089',
    topik: '23 - Perikanan: Kolam Ikan',
    resource: '/fish-ponds',
    endpoints: [
      'GET    /fish-ponds',
      'GET    /fish-ponds/:id',
      'GET    /fish-ponds?jenisIkan=lele',
      'POST   /fish-ponds',
      'PUT    /fish-ponds/:id',
      'DELETE /fish-ponds/:id',
    ],
  });
});

// =====================================================================
// 1. GET /fish-ponds - ambil semua data (array langsung)
// =====================================================================
app.get('/fish-ponds', (req, res) => {
  // filter memakai query string ?jenisIkan=...
  const { jenisIkan } = req.query;

  // bila ada query filter, kembalikan hasil penyaringan (array)
  if (jenisIkan) {
    const hasil = fishPonds.filter(
      (k) => k.jenisIkan.toLowerCase() === jenisIkan.toLowerCase()
    );
    return res.json(hasil);
  }

  // tanpa filter: kembalikan seluruh data
  res.json(fishPonds);
});

// =====================================================================
// Jalankan server hanya saat lokal (bukan di Vercel/serverless)
// =====================================================================
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

// ekspor app untuk Vercel
module.exports = app;
