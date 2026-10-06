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
// Helper validasi: memeriksa seluruh field wajib pada body
// Mengembalikan pesan error (string) atau null bila valid
// =====================================================================
function validasiKolam(body) {
  const { kodeKolam, jenisIkan, jumlahBibit, luasM2, tanggalTebar } = body;

  // field wajib tidak boleh kosong
  if (!kodeKolam) return 'Field kodeKolam wajib diisi';
  if (!jenisIkan) return 'Field jenisIkan wajib diisi';
  if (jumlahBibit === undefined || jumlahBibit === null || jumlahBibit === '')
    return 'Field jumlahBibit wajib diisi';
  if (luasM2 === undefined || luasM2 === null || luasM2 === '')
    return 'Field luasM2 wajib diisi';
  if (!tanggalTebar) return 'Field tanggalTebar wajib diisi';

  // validasi tipe data number
  if (typeof jumlahBibit !== 'number')
    return 'Field jumlahBibit harus berupa angka';
  if (typeof luasM2 !== 'number')
    return 'Field luasM2 harus berupa angka';

  // body valid
  return null;
}

// =====================================================================
// 2. GET /fish-ponds/:id - ambil satu data (objek langsung)
// =====================================================================
app.get('/fish-ponds/:id', (req, res) => {
  // ubah parameter id menjadi angka
  const id = parseInt(req.params.id);
  // cari data berdasarkan id
  const kolam = fishPonds.find((k) => k.id === id);

  // bila tidak ditemukan -> 404 JSON
  if (!kolam) {
    return res.status(404).json({
      status: 'error',
      message: `Data dengan id ${id} tidak ditemukan`,
      data: null,
    });
  }

  // bila ditemukan -> data langsung
  res.json(kolam);
});

// =====================================================================
// 3. POST /fish-ponds - tambah data baru
// Body: { "kodeKolam": "K-04", "jenisIkan": "lele", "jumlahBibit": 3000, "luasM2": 24, "tanggalTebar": "2026-08-15" }
// =====================================================================
app.post('/fish-ponds', (req, res) => {
  // validasi seluruh field wajib
  const error = validasiKolam(req.body);
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error,
      data: null,
    });
  }

  // ambil field dari body
  const { kodeKolam, jenisIkan, jumlahBibit, luasM2, tanggalTebar } = req.body;

  // id dibuat otomatis oleh server (tidak dari body)
  const baru = {
    id: nextId++,
    kodeKolam,
    jenisIkan,
    jumlahBibit,
    luasM2,
    tanggalTebar,
  };

  // simpan ke array
  fishPonds.push(baru);

  // berhasil -> 201 + data yang baru dibuat
  res.status(201).json({
    status: 'success',
    message: 'Data berhasil ditambahkan',
    data: baru,
  });
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
