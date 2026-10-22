const fs = require('fs');
const path = require('path');

const root = __dirname;
const collection = JSON.parse(
  fs.readFileSync(path.join(root, 'postman/Tugas2_Kolam_Ikan.postman_collection.json'), 'utf8')
);
const environment = JSON.parse(
  fs.readFileSync(path.join(root, 'postman/Development.postman_environment.json'), 'utf8')
);

if (collection.item.length !== 8) throw new Error('Collection harus berisi 8 request');
if (!collection.item.every((item) => item.event?.some((event) => event.listen === 'test'))) {
  throw new Error('Ada request tanpa test script');
}

const methods = ['GET', 'GET', 'GET', 'POST', 'PUT', 'POST', 'GET', 'DELETE'];
if (collection.item.some((item, index) => item.request.method !== methods[index])) {
  throw new Error('Method request tidak sesuai urutan yang diminta');
}
if (collection.item.some((item) => item.request.url.raw && !item.request.url.raw.includes('{{base_url}}'))) {
  throw new Error('URL request harus menggunakan base_url');
}
if (!collection.variable?.some((variable) => variable.key === 'createdId')) {
  throw new Error('Collection perlu variable createdId');
}
if (environment.values.some((variable) => variable.key === 'api_key' || variable.key === 'token')) {
  throw new Error('Environment tidak boleh memuat secret');
}
if (
  collection.item.find((item) => item.name === 'GET Kolam by ID')?.request.url.raw !==
  '{{base_url}}/fish-ponds/2'
) {
  throw new Error('GET by ID harus memakai seeded ID 2');
}

const baseUrl = collection.variable?.find((variable) => variable.key === 'base_url')?.value;
const environmentBaseUrl = environment.values.find((variable) => variable.key === 'base_url')?.value;
if (baseUrl !== 'http://localhost:3000' || environmentBaseUrl !== baseUrl) {
  throw new Error('base_url tidak konsisten');
}
if (
  collection.item.find((item) => item.name === 'PUT Ubah Kolam')?.request.url.raw !==
  '{{base_url}}/fish-ponds/{{createdId}}'
) {
  throw new Error('PUT tidak memakai createdId dari POST');
}
if (
  collection.item.find((item) => item.name === 'DELETE Kolam')?.request.url.raw !==
  '{{base_url}}/fish-ponds/{{createdId}}'
) {
  throw new Error('DELETE tidak memakai createdId dari POST');
}

console.log(`${collection.info.name} | ${collection.item.length} requests | ${environment.name}`);
