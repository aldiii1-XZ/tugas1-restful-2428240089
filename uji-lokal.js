// Skrip uji lokal: menjalankan seluruh endpoint lalu mencetak status
const app = require('./app.js');

const server = app.listen(3999, async () => {
  const B = 'http://localhost:3999';
  const hasil = [];

  async function uji(no, nama, opsi) {
    const r = await fetch(B + opsi.url, opsi.opt || {});
    let body = await r.text();
    try { body = JSON.stringify(JSON.parse(body)); } catch (e) {}
    hasil.push({ no, nama, status: r.status, body: body.slice(0, 220) });
  }

  const j = (d) => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) });
  const p = (d) => ({ method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) });

  await uji(1, 'GET /', { url: '/' });
  await uji(2, 'GET /fish-ponds', { url: '/fish-ponds' });
  await uji(3, 'GET /fish-ponds/1', { url: '/fish-ponds/1' });
  await uji(4, 'GET /fish-ponds/99', { url: '/fish-ponds/99' });
  await uji(5, 'GET /fish-ponds?jenisIkan=lele', { url: '/fish-ponds?jenisIkan=lele' });
  await uji(6, 'POST /fish-ponds', { url: '/fish-ponds', opt: j({ kodeKolam: 'K-04', jenisIkan: 'nila', jumlahBibit: 2000, luasM2: 20, tanggalTebar: '2026-09-10' }) });
  await uji(7, 'POST /fish-ponds (kosong)', { url: '/fish-ponds', opt: j({ kodeKolam: '', jenisIkan: 'lele' }) });
  await uji(8, 'PUT /fish-ponds/1', { url: '/fish-ponds/1', opt: p({ kodeKolam: 'K-01', jenisIkan: 'mujair', jumlahBibit: 1500, luasM2: 18, tanggalTebar: '2026-07-01' }) });
  await uji(9, 'PUT /fish-ponds/99', { url: '/fish-ponds/99', opt: p({ kodeKolam: 'K-99', jenisIkan: 'lele', jumlahBibit: 100, luasM2: 10, tanggalTebar: '2026-01-01' }) });
  await uji(10, 'DELETE /fish-ponds/3', { url: '/fish-ponds/3', opt: { method: 'DELETE' } });
  await uji(11, 'DELETE /fish-ponds/99', { url: '/fish-ponds/99', opt: { method: 'DELETE' } });
  await uji(12, 'GET /endpoint-ngawur', { url: '/endpoint-ngawur' });

  const harap = { 1: 200, 2: 200, 3: 200, 4: 404, 5: 200, 6: 201, 7: 400, 8: 200, 9: 404, 10: 200, 11: 404, 12: 404 };
  let lulus = 0;
  for (const h of hasil) {
    const ok = h.status === harap[h.no];
    if (ok) lulus++;
    console.log(`${ok ? 'LULUS' : 'GAGAL'} | ${String(h.no).padStart(2)} | ${h.nama.padEnd(34)} | harap ${harap[h.no]} dapat ${h.status}`);
    console.log(`        ${h.body}`);
  }
  console.log(`\nTOTAL: ${lulus}/${hasil.length} lulus`);
  server.close();
  process.exit(lulus === hasil.length ? 0 : 1);
});
