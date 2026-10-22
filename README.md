# Tugas 1 — RESTful API Murni dengan Express.js

**Nama:** Aldi Yonatan Rusnawan
**NIM:** 2428240089
**Kelas:** SI5B
**Nomor Topik:** 23 — Perikanan: Kolam Ikan
**Resource:** `/fish-ponds`

- **Link Repository GitHub:** https://github.com/aldiii1-XZ/tugas1-restful-2428240089
- **Link Deploy Vercel:** https://tugas1-restful-2428240089.vercel.app

---

## Deskripsi

RESTful API murni (tanpa tampilan) untuk mengelola data **kolam ikan**, dibangun dengan
Node.js dan Express.js. Data disimpan dalam array di memori (tanpa database).
Seluruh response berformat JSON.

## Cara Menjalankan Secara Lokal

```bash
# 1. pasang dependency
npm install

# 2. jalankan server (mode produksi lokal)
npm start

# atau jalankan dengan auto-reload saat pengembangan
npm run dev
```

Server berjalan di `http://localhost:3000`.

## Daftar Endpoint

| No | Method | Endpoint | Fungsi | Status sukses | Status gagal |
|----|--------|----------|--------|---------------|--------------|
| 1 | GET | `/fish-ponds` | Ambil semua data | 200 | — |
| 2 | GET | `/fish-ponds/:id` | Ambil satu data | 200 | 404 |
| 3 | GET | `/fish-ponds?jenisIkan=lele` | Filter berdasarkan jenis ikan | 200 | — |
| 4 | POST | `/fish-ponds` | Tambah data baru | 201 | 400 |
| 5 | PUT | `/fish-ponds/:id` | Ubah seluruh data | 200 | 400 / 404 |
| 6 | DELETE | `/fish-ponds/:id` | Hapus data | 200 | 404 |
| 7 | GET | `/` | Info API | 200 | — |

## Field Data

| Field | Tipe | Wajib |
|-------|------|-------|
| `kodeKolam` | string | ya (*) |
| `jenisIkan` | string | ya (*) |
| `jumlahBibit` | number | ya (*) |
| `luasM2` | number | ya (*) |
| `tanggalTebar` | string (YYYY-MM-DD) | ya (*) |

`id` dibuat otomatis oleh server (angka bertambah), tidak dikirim di body.

## Contoh Request (POST / PUT)

```json
{
  "kodeKolam": "K-04",
  "jenisIkan": "lele",
  "jumlahBibit": 3000,
  "luasM2": 24,
  "tanggalTebar": "2026-08-15"
}
```

## Contoh Response

**GET `/fish-ponds/1`** (200) — data langsung:

```json
{
  "id": 1,
  "kodeKolam": "K-01",
  "jenisIkan": "lele",
  "jumlahBibit": 3000,
  "luasM2": 24,
  "tanggalTebar": "2026-08-15"
}
```

**POST `/fish-ponds`** (201):

```json
{
  "status": "success",
  "message": "Data berhasil ditambahkan",
  "data": { "id": 4, "kodeKolam": "K-04", "jenisIkan": "lele", "jumlahBibit": 3000, "luasM2": 24, "tanggalTebar": "2026-08-15" }
}
```

**Error 404:**

```json
{ "status": "error", "message": "Data dengan id 99 tidak ditemukan", "data": null }
```

**Error 400:**

```json
{ "status": "error", "message": "Field kodeKolam wajib diisi", "data": null }
```

## Teknologi

- Node.js (LTS)
- Express.js 4
- nodemon (dev)
- Vercel (deploy serverless)

## Automated API testing (Tugas 2)

Postman Collection untuk menguji API di `app.js` ada di [`postman/Tugas2_Kolam_Ikan.postman_collection.json`](postman/Tugas2_Kolam_Ikan.postman_collection.json). Environment development ada di [`postman/Development.postman_environment.json`](postman/Development.postman_environment.json).

Collection mencakup GET seluruh kolam, GET berdasarkan ID, filter `jenisIkan`, POST berhasil, validasi POST gagal, PUT, DELETE, dan GET ID tidak ditemukan. Setiap request memiliki assertion status serta isi/struktur respons. Jalankan API dengan `npm start`, impor kedua berkas JSON ke Postman, pilih environment Tugas 2 - Development, lalu jalankan Collection Runner. Data di server hanya ada di memori; restart server untuk memulihkan data awal.

Jalankan otomatis via Newman dengan `node run-postman-tests.js` atau klik `run-postman-tests.cmd` di Windows. Skrip pemeriksaan JSON lokal: `node verify-postman.js`.

Environment bawaan memakai `base_url = http://localhost:3001`. Ubah nilainya bila server berjalan di port lain (misalnya `3000`).

Laporan Tugas 2 (PDF): [`Laporan_Tugas2_Postman_Automation_FINAL.pdf`](Laporan_Tugas2_Postman_Automation_FINAL.pdf) — versi DOCX: [`Laporan_Tugas2_Postman_Automation_FINAL.docx`](Laporan_Tugas2_Postman_Automation_FINAL.docx). Hasil run terakhir: `postman/latest-newman-results.json` (8 request, 17 assertion, 0 gagal).
