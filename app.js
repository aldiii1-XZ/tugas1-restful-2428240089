// =====================================================================
// Tugas 3 - RESTful API NoSQL (MongoDB)
// Lanjutan Tugas 1 / Kuis 1: data kolam ikan dipindah ke MongoDB.
// Embedding   : daftar ikan ditanam langsung di dalam dokumen kolam.
// Referencing : kolam menyimpan id pemilik (koleksi terpisah, di-populate).
// Endpoint utama GET /fish-ponds kini punya filtering, pagination,
// sorting, dan projection.
// Nama  : Aldi Yonatan Rusnawan
// NIM   : 2428240089
// Kelas : SI5B
// =====================================================================

// impor express dan mongoose
const express = require('express');
const mongoose = require('mongoose');

// buat instance aplikasi express
const app = express();
// port server (pakai PORT dari environment bila ada, default 3000)
const PORT = process.env.PORT || 3000;

// middleware untuk membaca body JSON dari request (req.body)
app.use(express.json());

// =====================================================================
// Schema Pemilik - koleksi terpisah yang akan DIRUJUK (referencing)
// oleh dokumen kolam.
// =====================================================================
const pemilikSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  alamat: { type: String, required: true },
  noHp: String,
});

const Pemilik = mongoose.model('Pemilik', pemilikSchema);

// =====================================================================
// Schema Ikan - subdokumen yang DITANAM (embedding) di dalam kolam.
// Ikan tidak hidup di koleksi sendiri, tapi menempel di dokumen kolam.
// =====================================================================
const ikanSchema = new mongoose.Schema(
  {
    namaIkan: { type: String, required: true },
    jumlah: { type: Number, required: true },
    umurHari: Number,
  },
  { _id: false }
);

// =====================================================================
// Schema Kolam - dokumen utama.
// Memuat embedding (array ikan) dan referencing (id pemilik).
// =====================================================================
const kolamSchema = new mongoose.Schema(
  {
    kodeKolam: { type: String, required: true },
    jenisIkan: { type: String, required: true },
    jumlahBibit: { type: Number, required: true },
    luasM2: { type: Number, required: true },
    tanggalTebar: { type: String, required: true },
    // embedding: daftar ikan ditanam langsung di dalam dokumen kolam
    ikan: [ikanSchema],
    // referencing: cukup simpan id pemilik, datanya ada di koleksi pemilik
    pemilik: { type: mongoose.Schema.Types.ObjectId, ref: 'Pemilik' },
  },
  { timestamps: true }
);

const Kolam = mongoose.model('Kolam', kolamSchema);

// =====================================================================
// Koneksi MongoDB.
// - Pakai MONGODB_URI dari environment bila diset (mis. MongoDB lokal).
// - Bila tidak diset, jalankan MongoDB in-memory untuk demo lokal
//   supaya tidak perlu instalasi server.
// =====================================================================
async function sambungMongo() {
  const uri = process.env.MONGODB_URI;

  if (uri) {
    await mongoose.connect(uri);
    console.log('Terhubung ke MongoDB:', uri);
    return;
  }

  const { MongoMemoryServer } = require('mongodb-memory-server');
  const mongoDemo = await MongoMemoryServer.create();
  await mongoose.connect(mongoDemo.getUri('paw2_kolam_ikan'));
  console.log('Terhubung ke MongoDB (in-memory untuk demo lokal)');
}

// =====================================================================
// Data awal (seed) - diisi otomatis bila koleksi masih kosong.
// Data kolamnya masih sama dengan Tugas 1, sekarang plus ikan dan pemilik.
// =====================================================================
async function seedAwal() {
  if ((await Kolam.countDocuments()) > 0) return;

  const budi = await Pemilik.create({
    nama: 'Budi Santoso',
    alamat: 'Desa Sukamaju',
    noHp: '0812-3456-7890',
  });

  const sari = await Pemilik.create({
    nama: 'Sari Wulandari',
    alamat: 'Desa Mekarjaya',
    noHp: '0813-9876-5432',
  });

  await Kolam.create([
    {
      kodeKolam: 'K-01',
      jenisIkan: 'lele',
      jumlahBibit: 3000,
      luasM2: 24,
      tanggalTebar: '2026-08-15',
      ikan: [{ namaIkan: 'Lele Sangkuriang', jumlah: 3000, umurHari: 45 }],
      pemilik: budi._id,
    },
    {
      kodeKolam: 'K-02',
      jenisIkan: 'nila',
      jumlahBibit: 2500,
      luasM2: 30,
      tanggalTebar: '2026-08-20',
      ikan: [
        { namaIkan: 'Nila Gesit', jumlah: 2000, umurHari: 40 },
        { namaIkan: 'Nila Merah', jumlah: 500, umurHari: 30 },
      ],
      pemilik: sari._id,
    },
    {
      kodeKolam: 'K-03',
      jenisIkan: 'lele',
      jumlahBibit: 4000,
      luasM2: 36,
      tanggalTebar: '2026-09-01',
      ikan: [{ namaIkan: 'Lele Dumbo', jumlah: 4000, umurHari: 35 }],
      pemilik: budi._id,
    },
  ]);

  console.log('Data awal (seed) berhasil ditambahkan');
}

// =====================================================================
// Helper validasi: memeriksa seluruh field wajib pada body kolam.
// Mengembalikan pesan error (string) atau null bila valid.
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

// Validasi data ikan (embedding) bila ikut dikirim di body.
function validasiIkan(ikan) {
  // ikan sifatnya opsional
  if (ikan === undefined || ikan === null) return null;
  if (!Array.isArray(ikan)) return 'Field ikan harus berupa array';

  for (const item of ikan) {
    if (!item || !item.namaIkan) return 'Setiap data ikan wajib punya namaIkan';
    if (item.jumlah === undefined || item.jumlah === null || item.jumlah === '')
      return 'Setiap data ikan wajib punya jumlah';
  }

  return null;
}

// Membuang karakter khusus regex (dipakai filter jenis ikan).
function escapeRegex(teks) {
  return String(teks).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Pembungkus handler async: error yang lolos diubah jadi response 500 JSON.
const jalankan = (fn) => (req, res) =>
  Promise.resolve(fn(req, res)).catch((err) => {
    res.status(500).json({
      status: 'error',
      message: `Terjadi kesalahan di server: ${err.message}`,
      data: null,
    });
  });

// =====================================================================
// GET / - info API (JSON, bukan teks/HTML)
// =====================================================================
app.get('/', (req, res) => {
  res.json({
    nama: 'Aldi Yonatan Rusnawan',
    nim: '2428240089',
    topik: '23 - Perikanan: Kolam Ikan',
    resource: '/fish-ponds',
    database: 'MongoDB (mongoose)',
    fitur: [
      'embedding: daftar ikan ditanam di dalam dokumen kolam',
      'referencing: kolam menunjuk id pemilik (koleksi terpisah)',
      'filtering, pagination, sorting, projection di GET /fish-ponds',
    ],
    contohQuery: [
      'GET /fish-ponds?jenisIkan=lele',
      'GET /fish-ponds?page=2&limit=2',
      'GET /fish-ponds?sort=jumlahBibit&order=desc',
      'GET /fish-ponds?fields=kodeKolam,jenisIkan,jumlahBibit',
    ],
    endpoints: [
      'GET    /fish-ponds',
      'GET    /fish-ponds/:id',
      'POST   /fish-ponds',
      'PUT    /fish-ponds/:id',
      'DELETE /fish-ponds/:id',
    ],
  });
});

// =====================================================================
// 1. GET /fish-ponds - endpoint utama.
// Mendukung:
//   filtering  : ?jenisIkan=lele&kodeKolam=K-01
//   pagination : ?page=2&limit=2
//   sorting    : ?sort=jumlahBibit&order=desc
//   projection : ?fields=kodeKolam,jenisIkan,jumlahBibit
// =====================================================================
app.get(
  '/fish-ponds',
  jalankan(async (req, res) => {
    const { jenisIkan, kodeKolam, page, limit, sort, order, fields } = req.query;

    // ---- filtering
    const filter = {};
    if (jenisIkan)
      filter.jenisIkan = { $regex: `^${escapeRegex(jenisIkan)}$`, $options: 'i' };
    if (kodeKolam)
      filter.kodeKolam = { $regex: `^${escapeRegex(kodeKolam)}$`, $options: 'i' };

    // ---- pagination
    const halaman = Math.max(parseInt(page, 10) || 1, 1);
    const batas = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const lewati = (halaman - 1) * batas;

    // ---- sorting (naik/turun sesuai order)
    const urut = sort ? { [sort]: order === 'desc' ? -1 : 1 } : { _id: 1 };

    // ---- projection (pilih field yang ditampilkan saja)
    const pilih = fields
      ? fields.split(',').map((f) => f.trim()).join(' ')
      : null;

    // susun query: filter -> sort -> pagination -> projection -> populate pemilik
    let query = Kolam.find(filter).sort(urut).skip(lewati).limit(batas);
    if (pilih) query = query.select(pilih);

    // populate pemilik, kecuali bila field-nya ikut dipangkas projection
    if (!pilih || pilih.includes('pemilik')) query = query.populate('pemilik');

    const data = await query;

    // total seluruh data (untuk info halaman)
    const total = await Kolam.countDocuments(filter);

    res.json({
      status: 'success',
      meta: {
        total,
        page: halaman,
        limit: batas,
        totalPages: Math.ceil(total / batas) || 1,
      },
      data,
    });
  })
);

// =====================================================================
// 2. GET /fish-ponds/:id - ambil satu data lengkap.
// Data pemilik ikut di-populate (bukti referencing antar koleksi).
// =====================================================================
app.get(
  '/fish-ponds/:id',
  jalankan(async (req, res) => {
    const { id } = req.params;

    // id MongoDB harus ObjectId valid (24 karakter heksadesimal)
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({
        status: 'error',
        message: `Data dengan id ${id} tidak ditemukan`,
        data: null,
      });
    }

    const kolam = await Kolam.findById(id).populate('pemilik');

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
  })
);

// =====================================================================
// 3. POST /fish-ponds - tambah data baru.
// Body boleh memuat ikan (embedding) dan pemilik (referencing).
// Body: { "kodeKolam": "K-04", "jenisIkan": "lele", "jumlahBibit": 3000,
//         "luasM2": 24, "tanggalTebar": "2026-08-15",
//         "ikan": [{ "namaIkan": "Lele Sangkuriang", "jumlah": 3000, "umurHari": 10 }],
//         "pemilik": "<id pemilik>" }
// =====================================================================
app.post(
  '/fish-ponds',
  jalankan(async (req, res) => {
    // validasi seluruh field wajib
    const error = validasiKolam(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error,
        data: null,
      });
    }

    // validasi data ikan bila dikirim
    const errorIkan = validasiIkan(req.body.ikan);
    if (errorIkan) {
      return res.status(400).json({
        status: 'error',
        message: errorIkan,
        data: null,
      });
    }

    // bila pemilik ikut dikirim, pastikan id valid dan datanya ada
    if (
      req.body.pemilik !== undefined &&
      req.body.pemilik !== null &&
      req.body.pemilik !== ''
    ) {
      if (!mongoose.isValidObjectId(req.body.pemilik)) {
        return res.status(400).json({
          status: 'error',
          message: 'Field pemilik harus berupa id pemilik yang valid',
          data: null,
        });
      }
      const pemilik = await Pemilik.findById(req.body.pemilik);
      if (!pemilik) {
        return res.status(400).json({
          status: 'error',
          message: 'Data pemilik tidak ditemukan',
          data: null,
        });
      }
    }

    // ambil field dari body
    const { kodeKolam, jenisIkan, jumlahBibit, luasM2, tanggalTebar, ikan, pemilik } = req.body;

    const baru = await Kolam.create({
      kodeKolam,
      jenisIkan,
      jumlahBibit,
      luasM2,
      tanggalTebar,
      ikan: ikan || [],
      pemilik: pemilik || null,
    });

    // berhasil -> 201 + data yang baru dibuat
    res.status(201).json({
      status: 'success',
      message: 'Data berhasil ditambahkan',
      data: baru,
    });
  })
);

// =====================================================================
// 4. PUT /fish-ponds/:id - ubah seluruh data (penggantian penuh).
// Body: sama seperti POST.
// =====================================================================
app.put(
  '/fish-ponds/:id',
  jalankan(async (req, res) => {
    const { id } = req.params;

    // cek dulu id-nya berupa ObjectId yang valid
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({
        status: 'error',
        message: `Data dengan id ${id} tidak ditemukan`,
        data: null,
      });
    }

    // validasi seluruh field wajib -> 400 bila kosong
    const error = validasiKolam(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error,
        data: null,
      });
    }

    // validasi data ikan bila dikirim
    const errorIkan = validasiIkan(req.body.ikan);
    if (errorIkan) {
      return res.status(400).json({
        status: 'error',
        message: errorIkan,
        data: null,
      });
    }

    // bila pemilik ikut dikirim, pastikan id valid dan datanya ada
    if (
      req.body.pemilik !== undefined &&
      req.body.pemilik !== null &&
      req.body.pemilik !== ''
    ) {
      if (!mongoose.isValidObjectId(req.body.pemilik)) {
        return res.status(400).json({
          status: 'error',
          message: 'Field pemilik harus berupa id pemilik yang valid',
          data: null,
        });
      }
      const pemilik = await Pemilik.findById(req.body.pemilik);
      if (!pemilik) {
        return res.status(400).json({
          status: 'error',
          message: 'Data pemilik tidak ditemukan',
          data: null,
        });
      }
    }

    // ambil field dari body
    const { kodeKolam, jenisIkan, jumlahBibit, luasM2, tanggalTebar, ikan, pemilik } = req.body;

    // ganti seluruh data (id tetap)
    const diubah = await Kolam.findByIdAndUpdate(
      id,
      {
        kodeKolam,
        jenisIkan,
        jumlahBibit,
        luasM2,
        tanggalTebar,
        ikan: ikan || [],
        pemilik: pemilik || null,
      },
      { new: true, runValidators: true }
    );

    // bila id tidak ada -> 404
    if (!diubah) {
      return res.status(404).json({
        status: 'error',
        message: `Data dengan id ${id} tidak ditemukan`,
        data: null,
      });
    }

    // berhasil -> 200 + data hasil perubahan
    res.status(200).json({
      status: 'success',
      message: `Data kolam dengan id ${id} berhasil diubah`,
      data: diubah,
    });
  })
);

// =====================================================================
// 5. DELETE /fish-ponds/:id - hapus data
// =====================================================================
app.delete(
  '/fish-ponds/:id',
  jalankan(async (req, res) => {
    const { id } = req.params;

    // cek dulu id-nya berupa ObjectId yang valid
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({
        status: 'error',
        message: `Data dengan id ${id} tidak ditemukan`,
        data: null,
      });
    }

    const terhapus = await Kolam.findByIdAndDelete(id);

    // bila id tidak ada -> 404
    if (!terhapus) {
      return res.status(404).json({
        status: 'error',
        message: `Data dengan id ${id} tidak ditemukan`,
        data: null,
      });
    }

    // berhasil -> 200 + pesan menyebut id + data null
    res.status(200).json({
      status: 'success',
      message: `Data kolam dengan id ${id} berhasil dihapus`,
      data: null,
    });
  })
);

// =====================================================================
// Middleware catch-all 404 - route yang tidak terdaftar (JSON)
// =====================================================================
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint tidak ditemukan',
    data: null,
  });
});

// =====================================================================
// Jalankan server: konek MongoDB -> isi data awal -> listen.
// Listen dilewati di lingkungan produksi (Vercel/serverless).
// =====================================================================
async function mulai() {
  await sambungMongo();
  await seedAwal();

  if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
      console.log(`Server berjalan di http://localhost:${PORT}`);
    });
  }
}

mulai().catch((err) => {
  console.error('Gagal menjalankan server:', err.message);
  process.exit(1);
});

// ekspor app untuk Vercel
module.exports = app;
