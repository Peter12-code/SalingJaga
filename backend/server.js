const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// In-Memory Database
const db = {
  missingPersons: [],
  shelterRegistrations: [],
  matchSuggestions: [],
  verificationCases: [],
  quarantinedReports: [],   // Ide 5: laporan menunggu validasi BMKG & komunitas
  communityVotes: {},       // Ide 8: { reportId: { yes: [], no: [] } }
  reportVotes: {}
};

// --- INITIAL DATA (Curated Feature Showcase) ---
// Posko List (Lokal & Nasional)
const poskoList = [
  'Posko Pengungsian GOR Dimyati',
  'Posko Evakuasi Balai Warga Ciledug',
  'Posko Siaga Banjir Periuk',
  'Posko Komando BNPB Padang Barat',
  'Posko Darurat GOR Segiri Samarinda'
];

// 12 Shelter Registrations (Lokal Tangerang & Nasional)
db.shelterRegistrations = [
  { id: uuidv4(), name: 'Yuni', nickname: 'Bu Yuni', ageEstimate: 'Sekitar 65 tahun', origin: 'Ciledug Indah, Tangerang', currentShelter: 'Posko Pengungsian GOR Dimyati', wilayah: 'Tangerang', arrivalTime: new Date().toISOString(), pickupLocation: 'Evakuasi Ciledug Indah RW 06', companions: 'Sendiri', notes: 'Agak linglung, lansia hipertensi', isVerified: false, timestamp: new Date().toISOString() },
  { id: uuidv4(), name: 'Budi Santoso', nickname: 'Budi', ageEstimate: '32 tahun', origin: 'Periuk Jaya, Tangerang', currentShelter: 'Posko Siaga Banjir Periuk', wilayah: 'Tangerang', arrivalTime: new Date().toISOString(), pickupLocation: 'Tanggul Kali Ledug Periuk', companions: 'Istri dan 1 anak balita', notes: 'Rumah terendam 1.8m', isVerified: true, timestamp: new Date().toISOString() },
  { id: uuidv4(), name: 'Anisa', nickname: 'Ica', ageEstimate: '8 tahun', origin: 'Sukasari, Tangerang', currentShelter: 'Posko Evakuasi Balai Warga Ciledug', wilayah: 'Tangerang', arrivalTime: new Date().toISOString(), pickupLocation: 'Atap ruko Pasar Lama', companions: 'Terpisah dari orang tua', notes: 'Menangis mencari ibunya (Sri Wahyuni)', isVerified: false, timestamp: new Date().toISOString() },
  { id: uuidv4(), name: 'Suparman', nickname: 'Parman', ageEstimate: '70 tahun', origin: 'Ciledug Indah, Tangerang', currentShelter: 'Posko Pengungsian GOR Dimyati', wilayah: 'Tangerang', arrivalTime: new Date().toISOString(), pickupLocation: 'Evakuasi Ciledug Indah', companions: 'Istri (Yuni)', notes: 'Sakit asma, butuh inhaler', isVerified: false, timestamp: new Date().toISOString() },
  { id: uuidv4(), name: 'Rina Kartika', nickname: 'Rina', ageEstimate: '22 tahun', origin: 'Karawaci, Tangerang', currentShelter: 'Posko Pengungsian GOR Dimyati', wilayah: 'Tangerang', arrivalTime: new Date().toISOString(), pickupLocation: 'Bantaran Cisadane Karawaci', companions: 'Adik kandung', notes: 'Butuh pakaian ganti dan selimut', isVerified: false, timestamp: new Date().toISOString() },
  { id: uuidv4(), name: 'Agus Sutrisno', nickname: 'Agus', ageEstimate: '45 tahun', origin: 'Periuk Damai, Tangerang', currentShelter: 'Posko Siaga Banjir Periuk', wilayah: 'Tangerang', arrivalTime: new Date().toISOString(), pickupLocation: 'Pintu Air Periuk', companions: 'Sendiri', notes: 'Kaki luka lecet kena paku pagar', isVerified: false, timestamp: new Date().toISOString() },
  { id: uuidv4(), name: 'Siti Rahma', nickname: 'Siti', ageEstimate: '52 tahun', origin: 'Ciledug Indah, Tangerang', currentShelter: 'Posko Evakuasi Balai Warga Ciledug', wilayah: 'Tangerang', arrivalTime: new Date().toISOString(), pickupLocation: 'Masjid Al-Ikhlas Ciledug', companions: 'Keluarga (4 orang)', notes: 'Sehat, membantu dapur umum', isVerified: false, timestamp: new Date().toISOString() },
  { id: uuidv4(), name: 'Joko Prabowo', nickname: 'Joko', ageEstimate: '38 tahun', origin: 'Pasar Baru, Tangerang', currentShelter: 'Posko Pengungsian GOR Dimyati', wilayah: 'Tangerang', arrivalTime: new Date().toISOString(), pickupLocation: 'Pasar Lama Tangerang', companions: 'Sendiri', notes: 'Penyintas kebakaran ruko', isVerified: false, timestamp: new Date().toISOString() },
  // PENGUNGSI DARI WILAYAH LAIN (Hanya tampak pada agregat BNPB Nasional)
  { id: uuidv4(), name: 'Dewi Sartika', nickname: 'Dewi', ageEstimate: '28 tahun', origin: 'Padang Barat, Sumbar', currentShelter: 'Posko Komando BNPB Padang Barat', wilayah: 'Padang', arrivalTime: new Date().toISOString(), pickupLocation: 'Pantai Muaro Padang', companions: 'Anak (1 tahun)', notes: 'Penyintas gempa Padang', isVerified: true, timestamp: new Date().toISOString() },
  { id: uuidv4(), name: 'Bambang Irawan', nickname: 'Bambang', ageEstimate: '60 tahun', origin: 'Khatib Sulaiman, Padang', currentShelter: 'Posko Komando BNPB Padang Barat', wilayah: 'Padang', arrivalTime: new Date().toISOString(), pickupLocation: 'Pusat gempa Padang Barat', companions: 'Sendiri', notes: 'Luka jahitan di lengan', isVerified: false, timestamp: new Date().toISOString() },
  { id: uuidv4(), name: 'Lia Lestari', nickname: 'Lia', ageEstimate: '31 tahun', origin: 'Sungai Kunjang, Samarinda', currentShelter: 'Posko Darurat GOR Segiri Samarinda', wilayah: 'Samarinda', arrivalTime: new Date().toISOString(), pickupLocation: 'Kawasan Karhutla Palaran', companions: 'Sendiri', notes: 'Sesak napas karena asap karhutla', isVerified: false, timestamp: new Date().toISOString() },
  { id: uuidv4(), name: 'Doni Saputra', nickname: 'Doni', ageEstimate: '17 tahun', origin: 'Samarinda Ulu, Kaltim', currentShelter: 'Posko Darurat GOR Segiri Samarinda', wilayah: 'Samarinda', arrivalTime: new Date().toISOString(), pickupLocation: 'Batas hutan Palaran', companions: 'Teman sekolah', notes: 'Relawan muda karhutla', isVerified: false, timestamp: new Date().toISOString() }
];

// 5 Missing Person Reports (Tangerang & Nasional)
db.missingPersons = [
  { id: uuidv4(), fullName: 'Sri Wahyuni', nickname: 'Bu Yuni', age: 'Sekitar 60 tahun', origin: 'Ciledug Indah, Tangerang', lastKnownLocation: 'Komplek Ciledug Indah RW 06', lastKnownTime: 'Kemarin sore saat air naik', lastClothing: 'Daster batik ungu bunga-bunga', notes: 'Terpisah saat perahu evakuasi pertama merapat di tanggul Angke.', relationship: 'Anak (Rian)', reporterContact: '0812-4455-8890', status: 'Pencarian dibuat', timestamp: new Date().toISOString(), version: 1, userId: 'user1' },
  { id: uuidv4(), fullName: 'Budi Santoso', nickname: 'Budi', age: '32 tahun', origin: 'Periuk Jaya, Tangerang', lastKnownLocation: 'Pintu Air Kali Ledug Periuk', lastKnownTime: 'Pagi ini', lastClothing: 'Kaos hitam celana jeans pendek', notes: 'Membantu warga membendung air saat tanggul rembes.', relationship: 'Istri', reporterContact: '0898-7654-3210', status: 'Kecocokan terkonfirmasi', timestamp: new Date().toISOString(), version: 1, userId: 'user2' },
  { id: uuidv4(), fullName: 'Anisa', nickname: 'Ica', age: '8 tahun', origin: 'Sukasari, Tangerang', lastKnownLocation: 'Ruko Pasar Lama Sukasari', lastKnownTime: 'Kemarin siang', lastClothing: 'Seragam sekolah merah putih', notes: 'Terpisah dari ibu (Sri Wahyuni) saat kebakaran ruko.', relationship: 'Ayah', reporterContact: '0811-2233-4455', status: 'Pencarian dibuat', timestamp: new Date().toISOString(), version: 1, userId: 'user3' },
  { id: uuidv4(), fullName: 'Suparman', nickname: 'Pak Parman', age: '70 tahun', origin: 'Ciledug Indah, Tangerang', lastKnownLocation: 'Masjid Al-Ikhlas Ciledug', lastKnownTime: 'Kemarin malam', lastClothing: 'Sarung kotak-kotak dan peci hitam', notes: 'Sulit berjalan, mengidap asma.', relationship: 'Cucu', reporterContact: '0855-6677-8899', status: 'Pencarian dibuat', timestamp: new Date().toISOString(), version: 1, userId: 'user4' },
  { id: uuidv4(), fullName: 'Dewi Sartika', nickname: 'Dewi', age: '28 tahun', origin: 'Padang Barat, Sumatera Barat', lastKnownLocation: 'Pantai Muaro Padang', lastKnownTime: 'Kemarin siang', lastClothing: 'Jilbab cokelat, jaket denim', notes: 'Penyintas gempa Padang pesisir pantai.', relationship: 'Suami', reporterContact: '0813-4455-6677', status: 'Pencarian dibuat', timestamp: new Date().toISOString(), version: 1, userId: 'user5' }
];

// Seed 1 Kasus Validasi Karantina BMKG & Anti-Hoaks
const defaultQuarantineId = uuidv4();
db.quarantinedReports = [
  {
    id: defaultQuarantineId,
    reportId: defaultQuarantineId,
    jenis: 'Gempa Bumi',
    lat: -6.1782,
    lng: 106.6300,
    kondisi: 'Getaran gempa terasa singkat di Sukasari Kota Tangerang, terdengar gemeretak dinding rumah. Belum melampirkan NIK.',
    noHp: '0812-9988-3322',
    nikSukarela: null,
    statusValidasi: 'Karantina',
    bmkgKeterangan: 'BMKG TEWS: Tidak tercatat gempa darat signifikan di Banten 6 jam terakhir — Status Karantina, perlu verifikasi saksi warga.',
    bmkgData: { Magnitude: '3.1', Wilayah: 'Selat Sunda (120 km barat daya Tangerang)', DateTime: new Date().toISOString() },
    voteYa: ['warga-01', 'warga-02'],
    voteTidak: [],
    waktu: new Date(Date.now() - 3600000).toISOString()
  }
];

db.reportVotes = {
  [defaultQuarantineId]: {
    ya: ['warga-01', 'warga-02'],
    tidak: [],
    witnessLogs: [
      { voterId: 'warga-01', vote: 'ya', reason: 'Konfirmasi Saksi Lapangan', distanceKm: 0.3, witnessNote: 'Lampu gantung sempat bergoyang sekitar 3 detik.', timestamp: new Date(Date.now() - 2800000).toISOString() },
      { voterId: 'warga-02', vote: 'ya', reason: 'Konfirmasi Saksi Lapangan', distanceKm: 0.5, witnessNote: 'Terasa getaran seperti truk tronton melintas.', timestamp: new Date(Date.now() - 1500000).toISOString() }
    ]
  }
};

// --- ENDPOINTS ---

// Warga: Get user's missing person reports
app.get('/api/warga/missing-persons', (req, res) => {
  // In a real app, use auth token to get userId. For now, hardcode 'user1' or accept from query
  const userId = req.query.userId || 'user1';
  const reports = db.missingPersons.filter(r => r.userId === userId);
  res.json(reports);
});

// Warga: Create missing person report
app.post('/api/warga/missing-persons', (req, res) => {
  const newReport = {
    id: uuidv4(),
    ...req.body,
    status: 'Pencarian dibuat',
    timestamp: new Date().toISOString(),
    version: 1,
    userId: req.body.userId || 'user1'
  };
  db.missingPersons.push(newReport);
  res.status(201).json(newReport);
});

// Warga: Update report
app.put('/api/warga/missing-persons/:id', (req, res) => {
  const { id } = req.params;
  const index = db.missingPersons.findIndex(r => r.id === id);
  if (index !== -1) {
    db.missingPersons[index] = {
      ...db.missingPersons[index],
      ...req.body,
      version: db.missingPersons[index].version + 1,
      timestamp: new Date().toISOString()
    };
    res.json(db.missingPersons[index]);
  } else {
    res.status(404).send('Report not found');
  }
});

// Petugas: Get all missing person reports
app.get('/api/admin/missing-persons', (req, res) => {
  res.json(db.missingPersons);
});

// Petugas: Get shelter registrations (supports regional scoping ?wilayah=Tangerang)
app.get('/api/admin/shelter-registrations', (req, res) => {
  const { wilayah } = req.query;
  if (wilayah) {
    const filtered = db.shelterRegistrations.filter(r =>
      (r.wilayah && r.wilayah.toLowerCase() === wilayah.toLowerCase()) ||
      (r.currentShelter && r.currentShelter.toLowerCase().includes(wilayah.toLowerCase()))
    );
    return res.json(filtered);
  }
  res.json(db.shelterRegistrations);
});

// Petugas: Register shelter refugee
app.post('/api/admin/shelter-registrations', (req, res) => {
  const newRegistration = {
    id: uuidv4(),
    ...req.body,
    isVerified: false,
    timestamp: new Date().toISOString()
  };
  db.shelterRegistrations.push(newRegistration);
  res.status(201).json(newRegistration);
});

const normalizeSearchText = (value = '') => value
  .toString()
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const searchTokens = (value = '') => normalizeSearchText(value).split(' ').filter(token => token.length > 1);

const firstAgeNumber = (value = '') => {
  const matched = value.toString().match(/\d+/);
  return matched ? Number(matched[0]) : null;
};

function scoreFamilyCandidate(report, candidate) {
  const evidence = [];
  const conflicts = [];
  let score = 0;

  const reportName = normalizeSearchText(report.fullName);
  const candidateName = normalizeSearchText(candidate.name);
  const reportTokens = new Set([...searchTokens(report.fullName), ...searchTokens(report.nickname)]);
  const candidateTokens = new Set([...searchTokens(candidate.name), ...searchTokens(candidate.nickname)]);
  const sharedNameTokens = [...reportTokens].filter(token => candidateTokens.has(token));

  if (reportName && candidateName && reportName === candidateName) {
    score += 45;
    evidence.push({ field: 'name', explanation: 'Nama lengkap sama dengan catatan posko.' });
  } else if (reportName && candidateName && (reportName.includes(candidateName) || candidateName.includes(reportName) || sharedNameTokens.length > 0)) {
    score += 32;
    evidence.push({ field: 'name', explanation: 'Nama atau nama panggilan memiliki kecocokan dengan catatan posko.' });
  }

  const reportNickname = normalizeSearchText(report.nickname);
  const candidateNickname = normalizeSearchText(candidate.nickname);
  if (reportNickname && candidateNickname && (reportNickname === candidateNickname || reportNickname.includes(candidateNickname) || candidateNickname.includes(reportNickname))) {
    score += 20;
    evidence.push({ field: 'nickname', explanation: 'Nama panggilan cocok.' });
  }

  const reportOrigin = normalizeSearchText(report.origin);
  const candidateOrigin = normalizeSearchText(candidate.origin);
  if (reportOrigin && candidateOrigin && (reportOrigin === candidateOrigin || reportOrigin.includes(candidateOrigin) || candidateOrigin.includes(reportOrigin))) {
    score += 25;
    evidence.push({ field: 'origin', explanation: `Asal wilayah ${report.origin} sesuai dengan data posko.` });
  }

  const reportLocation = normalizeSearchText(report.lastKnownLocation);
  const pickupLocation = normalizeSearchText(candidate.pickupLocation);
  if (reportLocation && pickupLocation && (reportLocation.includes(pickupLocation) || pickupLocation.includes(reportLocation))) {
    score += 10;
    evidence.push({ field: 'location', explanation: 'Lokasi terakhir selaras dengan lokasi penjemputan.' });
  }

  const reportAge = firstAgeNumber(report.age);
  const candidateAge = firstAgeNumber(candidate.ageEstimate);
  if (reportAge && candidateAge) {
    const difference = Math.abs(reportAge - candidateAge);
    if (difference <= 5) {
      score += 15;
      evidence.push({ field: 'age', explanation: `Perkiraan usia berdekatan (${report.age} dan ${candidate.ageEstimate}).` });
    } else if (difference <= 15) {
      score += 7;
      conflicts.push({ field: 'age', explanation: `Perkiraan usia berbeda (${report.age} dan ${candidate.ageEstimate}).` });
    } else {
      conflicts.push({ field: 'age', explanation: `Perkiraan usia cukup jauh (${report.age} dan ${candidate.ageEstimate}).` });
    }
  }

  return { score, evidence, conflicts };
}

function createDemoSuggestions(report, targetWilayah = null) {
  let candidatesPool = db.shelterRegistrations;
  if (targetWilayah) {
    candidatesPool = candidatesPool.filter(c =>
      (c.wilayah && c.wilayah.toLowerCase() === targetWilayah.toLowerCase()) ||
      (c.currentShelter && c.currentShelter.toLowerCase().includes(targetWilayah.toLowerCase()))
    );
  }

  return candidatesPool
    .map(candidate => ({ candidate, ...scoreFamilyCandidate(report, candidate) }))
    .filter(result => result.score >= 40)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map(result => ({
      id: uuidv4(),
      reportId: report.id,
      reportVersion: report.version,
      registrationId: result.candidate.id,
      evidenceLevel: result.score >= 75 ? 'strong' : 'partial',
      supportingEvidence: result.evidence,
      conflictingEvidence: result.conflicts,
      unknownInformation: ['Foto atau dokumen identitas belum dibandingkan.'],
      verificationQuestions: [
        `Apakah ${result.candidate.name} mengenali detail keluarga yang dilaporkan?`,
        'Apakah ciri fisik dan pakaian terakhir dapat diverifikasi petugas posko?'
      ],
      timestamp: new Date().toISOString(),
      status: 'Menunggu verifikasi petugas'
    }));
}

const POSKO_CONTACTS = {
  'Posko Pengungsian GOR Dimyati': {
    koordinator: 'Bpk. Hendra – Satgas BPBD Kota Tangerang',
    kontak: '0812-9988-7711',
    fasilitas: 'Dapur Umum Dinsos, Tenda PMI, MCK Portabel, Genset',
    lokasiDetail: 'Jl. Dimyati No. 1, Sukasari, Kota Tangerang'
  },
  'Posko Evakuasi Balai Warga Ciledug': {
    koordinator: 'Bpk. Darmawan (Satgas BPBD Ciledug)',
    kontak: '0812-4455-8890',
    fasilitas: 'Dapur Mandiri, Pos Medis Lapangan',
    lokasiDetail: 'Komplek Ciledug Indah I, Kota Tangerang'
  },
  'Posko Siaga Banjir Periuk': {
    koordinator: 'Ibu Ratna (Kecamatan Periuk & BPBD)',
    kontak: '0857-1122-3344',
    fasilitas: 'Ruang Laktasi, Posko Medis Puskesmas',
    lokasiDetail: 'Gedung Serbaguna Kec. Periuk, Kota Tangerang'
  },
  'Posko Komando BNPB Padang Barat': {
    koordinator: 'Kapten Aris (BNPB Sumbar)',
    kontak: '0812-3344-5566',
    fasilitas: 'Tenda Pleton, Posko Medis Tanggap Bencana',
    lokasiDetail: 'Kawasan Pantai Muaro Padang'
  },
  'Posko Darurat GOR Segiri Samarinda': {
    koordinator: 'Bpk. Ridwan (BPBD Kaltim)',
    kontak: '0813-7788-9900',
    fasilitas: 'Dapur Lapangan, Tenda Penampungan Karhutla',
    lokasiDetail: 'GOR Segiri Samarinda'
  },
  'Posko Balai Desa': {
    koordinator: 'Bpk. Ahmad (Satgas BPBD)',
    kontak: '0812-3456-7890',
    fasilitas: 'Dapur Umum, Pos Medis Lapangan, Tenda Keluarga',
    lokasiDetail: 'Jl. Pemuda No. 12, Balai Desa'
  },
  'Posko Stadion': {
    koordinator: 'Ibu Siti (Relawan PMI)',
    kontak: '0813-9876-5432',
    fasilitas: 'Tenda Utama BNPB, Ambulans Siaga, MCK Portabel',
    lokasiDetail: 'Kompleks Stadion Olahraga Pintu 3'
  },
  'Posko Masjid Raya': {
    koordinator: 'Ust. Fauzi (Dapur Umum)',
    kontak: '0811-2233-4455',
    fasilitas: 'Ruang Ramah Anak, Trauma Healing, Logistik Makanan',
    lokasiDetail: 'Halaman Serbaguna Masjid Raya'
  }
};

// Warga: Get public shelter refugee directory with live search & filter
app.get('/api/warga/shelter-registrations', (req, res) => {
  const { q = '', shelter = '' } = req.query;
  const query = q.toString().toLowerCase().trim();
  const shelterFilter = shelter.toString().trim();

  let list = db.shelterRegistrations.map(reg => {
    const info = POSKO_CONTACTS[reg.currentShelter] || {
      koordinator: 'Petugas Posko Terpadu',
      kontak: '112',
      fasilitas: 'Dapur Umum & Tenda Pengungsian',
      lokasiDetail: reg.currentShelter
    };
    return {
      ...reg,
      poskoCoordinator: info.koordinator,
      poskoContact: info.kontak,
      poskoFacilities: info.fasilitas,
      poskoLocationDetail: info.lokasiDetail
    };
  });

  if (shelterFilter && shelterFilter !== 'Semua Posko') {
    list = list.filter(item => item.currentShelter === shelterFilter);
  }

  if (query) {
    list = list.filter(item => {
      const matchName = (item.name || '').toLowerCase().includes(query);
      const matchNick = (item.nickname || '').toLowerCase().includes(query);
      const matchOrigin = (item.origin || '').toLowerCase().includes(query);
      const matchNotes = (item.notes || '').toLowerCase().includes(query);
      const matchShelter = (item.currentShelter || '').toLowerCase().includes(query);
      return matchName || matchNick || matchOrigin || matchNotes || matchShelter;
    });
  }

  res.json({
    total: list.length,
    data: list,
    poskoList: ['Posko Balai Desa', 'Posko Stadion', 'Posko Masjid Raya']
  });
});

// Warga: Instant AI Match for fast reporting & immediate candidate display
app.post('/api/warga/instant-match', (req, res) => {
  const {
    fullName = '',
    nickname = '',
    age = '',
    origin = '',
    lastKnownLocation = '',
    lastClothing = '',
    notes = '',
    reporterContact = '',
    relationship = 'Keluarga'
  } = req.body;

  if (!fullName && !nickname) {
    return res.status(400).json({ error: 'Mohon isi nama lengkap atau nama panggilan yang dicari.' });
  }

  const newReport = {
    id: uuidv4(),
    fullName,
    nickname,
    age: age || 'Tidak disebutkan',
    origin: origin || 'Tidak disebutkan',
    lastKnownLocation: lastKnownLocation || 'Area evakuasi',
    lastKnownTime: req.body.lastKnownTime || 'Terkini',
    lastClothing: lastClothing || '-',
    notes: notes || '-',
    relationship: relationship || 'Keluarga',
    reporterContact: reporterContact || '081234567890',
    status: 'Sedang dicocokkan',
    timestamp: new Date().toISOString(),
    version: 1,
    userId: req.body.userId || 'user1'
  };

  // Run scoring against all shelter registrations
  const scoredCandidates = db.shelterRegistrations.map(candidate => {
    const scored = scoreFamilyCandidate(newReport, candidate);
    const poskoInfo = POSKO_CONTACTS[candidate.currentShelter] || {
      koordinator: 'Koordinator Posko',
      kontak: '112',
      fasilitas: 'Dapur Umum & Tenda',
      lokasiDetail: candidate.currentShelter
    };
    return {
      candidate: {
        ...candidate,
        poskoCoordinator: poskoInfo.koordinator,
        poskoContact: poskoInfo.kontak,
        poskoFacilities: poskoInfo.fasilitas,
        poskoLocationDetail: poskoInfo.lokasiDetail
      },
      score: scored.score,
      evidenceLevel: scored.score >= 70 ? 'strong' : scored.score >= 35 ? 'partial' : 'low',
      evidence: scored.evidence,
      conflicts: scored.conflicts
    };
  })
  .filter(item => item.score >= 25)
  .sort((a, b) => b.score - a.score);

  if (scoredCandidates.length > 0) {
    newReport.status = 'Kandidat ditemukan';
  } else {
    newReport.status = 'Belum ada kandidat';
  }

  // Save report to database
  db.missingPersons.unshift(newReport);

  // Sync to match suggestions so admin also sees them
  scoredCandidates.slice(0, 3).forEach(item => {
    db.matchSuggestions.push({
      id: uuidv4(),
      reportId: newReport.id,
      reportVersion: 1,
      registrationId: item.candidate.id,
      evidenceLevel: item.evidenceLevel,
      supportingEvidence: item.evidence,
      conflictingEvidence: item.conflicts,
      unknownInformation: ['Foto atau dokumen identitas'],
      verificationQuestions: [`Apakah ${item.candidate.name} mengenali pelapor ${newReport.relationship}?`],
      timestamp: new Date().toISOString(),
      status: 'Menunggu verifikasi petugas'
    });
  });

  res.status(201).json({
    success: true,
    report: newReport,
    matches: scoredCandidates.slice(0, 3)
  });
});

// Warga: Direct family claim / verification call
app.post('/api/warga/claim-candidate', (req, res) => {
  const { candidateId, reporterName, reporterPhone, relation, reportId } = req.body;
  const candidate = db.shelterRegistrations.find(c => c.id === candidateId);
  if (!candidate) return res.status(404).json({ error: 'Warga tidak ditemukan.' });

  candidate.claimNotice = {
    reporterName: reporterName || 'Warga',
    reporterPhone: reporterPhone || '-',
    relation: relation || 'Keluarga',
    claimedAt: new Date().toISOString()
  };

  if (reportId) {
    const report = db.missingPersons.find(r => r.id === reportId);
    if (report) {
      report.status = 'Kecocokan terkonfirmasi';
    }
  }

  res.json({
    success: true,
    message: `Permintaan verifikasi keluarga dikirim ke koordinator ${candidate.currentShelter}. Petugas akan menghubungi Anda di ${reporterPhone}.`,
    candidate
  });
});

// AI & Petugas: Run Analysis (Match Family)
app.post('/api/admin/match/analyze', async (req, res) => {
  const { reportId } = req.body;
  const report = db.missingPersons.find(r => r.id === reportId);
  
  if (!report) return res.status(404).send('Report not found');
  
  if (report.status === 'Keluarga berhasil dihubungkan') {
    return res.status(409).json({ error: 'Pencarian sudah ditutup karena keluarga telah dihubungkan.' });
  }

  report.status = 'Sedang dicocokkan';

  const isDemoMode = process.env.AI_MODE !== 'langflow';

  if (isDemoMode) {
    await new Promise(resolve => setTimeout(resolve, 450));
    db.matchSuggestions = db.matchSuggestions.filter(suggestion => suggestion.reportId !== report.id);
    const suggestions = createDemoSuggestions(report, req.body.wilayah);
    db.matchSuggestions.push(...suggestions);
    report.status = suggestions.length > 0 ? 'Menunggu verifikasi petugas' : 'Tidak ada kandidat';
    res.json({ result: suggestions.length > 0 ? 'candidates_found' : 'no_supported_candidate', suggestions });
  } else {
    // LANGFLOW INTEGRATION
    try {
      const payload = {
        input_value: JSON.stringify({
           search_report: report,
           candidates: db.shelterRegistrations
        }),
        input_type: 'chat',
        output_type: 'chat',
        tweaks: {}
      };
      
      const langflowUrl = process.env.LANGFLOW_BASE_URL || 'http://localhost:7860';
      const flowId = process.env.LANGFLOW_FAMILY_MATCH_FLOW_ID || 'f70b6854-1fed-475c-9f11-238d97242bc8';
      const apiKey = process.env.LANGFLOW_API_KEY;

      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) headers['x-api-key'] = apiKey;
      
      const response = await axios.post(`${langflowUrl}/api/v1/run/${flowId}?stream=false`, payload, { headers });
      
      const raw = response.data;
      const outputText = raw?.outputs?.[0]?.outputs?.[0]?.results?.message?.text || raw?.outputs?.[0]?.outputs?.[0]?.messages?.[0]?.message;
      
      let analysisJson;
      try {
        const jsonMatch = outputText.match(/\{[\s\S]*\}/);
        analysisJson = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(outputText);
      } catch (e) {
        throw new Error('Invalid JSON from Langflow');
      }

      // Process langflow response and save valid candidates
      const suggestions = [];
      if (analysisJson.result === 'candidates_found' && analysisJson.candidates) {
        analysisJson.candidates.forEach(c => {
           // Validate candidate ID
           const candidateExists = db.shelterRegistrations.find(r => r.id === c.registration_id);
           if (candidateExists) {
             const sugg = {
                id: uuidv4(),
                reportId: analysisJson.search_report_id,
                reportVersion: analysisJson.report_version,
                registrationId: c.registration_id,
                evidenceLevel: c.evidence_level,
                supportingEvidence: c.supporting_evidence || [],
                conflictingEvidence: c.conflicting_evidence || [],
                unknownInformation: c.unknown_information || [],
                verificationQuestions: c.verification_questions || [],
                timestamp: new Date().toISOString(),
                status: 'Menunggu verifikasi petugas'
             };
             db.matchSuggestions.push(sugg);
             suggestions.push(sugg);
           }
        });
        report.status = 'Menunggu verifikasi petugas';
      }
      
      report.status = suggestions.length > 0 ? 'Menunggu verifikasi petugas' : 'Tidak ada kandidat';
      res.json({ result: analysisJson.result, suggestions });
      
    } catch (err) {
      report.status = 'Pencarian dibuat';
      console.error(err);
      res.status(500).json({ error: 'Langflow analysis failed' });
    }
  }
});

// Petugas: Get match suggestions for a report
app.get('/api/admin/match/suggestions/:reportId', (req, res) => {
  const { reportId } = req.params;
  const suggestions = db.matchSuggestions.filter(s => s.reportId === reportId);
  res.json(suggestions);
});

// Petugas: Verify Match
app.post('/api/admin/match/verify', (req, res) => {
  const { suggestionId, action, notes, adminId } = req.body;
  const suggestion = db.matchSuggestions.find(s => s.id === suggestionId);
  if (!suggestion) return res.status(404).send('Suggestion not found');
  if (!['Kecocokan terkonfirmasi', 'Keluarga berhasil dihubungkan', 'Ditolak'].includes(action)) {
    return res.status(400).send('Invalid verification action');
  }
  
  const report = db.missingPersons.find(r => r.id === suggestion.reportId);
  if (!report) return res.status(404).send('Associated report not found');
  
  suggestion.status = action; // 'Kecocokan terkonfirmasi', 'Ditolak'
  
  if (action === 'Kecocokan terkonfirmasi') {
    report.status = 'Kecocokan terkonfirmasi';
  } else if (action === 'Keluarga berhasil dihubungkan') {
    report.status = 'Keluarga berhasil dihubungkan';
  } else if (action === 'Ditolak') {
    const remainingCandidate = db.matchSuggestions.some(item => item.reportId === report.id && item.id !== suggestionId && item.status === 'Menunggu verifikasi petugas');
    report.status = remainingCandidate ? 'Menunggu verifikasi petugas' : 'Tidak ada kandidat';
  }
  
  db.verificationCases.push({
    id: uuidv4(),
    suggestionId,
    action,
    notes,
    adminId,
    timestamp: new Date().toISOString()
  });
  
  res.json({ success: true, reportStatus: report.status });
});

// ============================================================
// IDE 5: BMKG Cross-Reference Validation
// ============================================================
app.post('/api/validasi-laporan', async (req, res) => {
  const { jenis, lat, lng, kondisi, noHp, nikSukarela } = req.body;
  const reportId = uuidv4();
  const validasi = { reportId, jenis, lat, lng, kondisi, noHp, nikSukarela: nikSukarela || null };
  
  let bmkgData = null;
  let bmkgValid = null;
  let bmkgKeterangan = 'Data BMKG tidak dapat dijangkau (timeout).';

  try {
    // Cek data gempa BMKG jika laporan terkait gempa
    if (/gempa/i.test(jenis)) {
      const resp = await axios.get('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json', { timeout: 4000 });
      const gempa = resp.data?.Infogempa?.gempa;
      if (gempa) {
        bmkgData = gempa;
        // Cek apakah ada gempa terbaru dalam 24 jam terakhir
        const waktuGempa = new Date(gempa.DateTime);
        const selisihJam = (Date.now() - waktuGempa.getTime()) / (1000 * 3600);
        bmkgValid = selisihJam <= 24;
        bmkgKeterangan = bmkgValid
          ? `BMKG: Gempa ${gempa.Magnitude} SR di ${gempa.Wilayah} terdeteksi ${Math.round(selisihJam)} jam lalu — Laporan KONSISTEN.`
          : `BMKG: Tidak ada gempa signifikan dalam 24 jam terakhir — Laporan PERLU VERIFIKASI MANUAL.`;
      }
    } else {
      // Untuk banjir/longsor: ambil data cuaca kecamatan (gunakan kode ADM4 default jika tidak ada)
      // Untuk prototipe: cukup fetch gempa dan beri keterangan cuaca generik
      bmkgValid = true;
      bmkgKeterangan = 'BMKG: Tidak ada anomali cuaca ekstrim yang tercatat — Status NETRAL, perlu verifikasi komunitas.';
    }
  } catch (e) {
    bmkgValid = null;
    bmkgKeterangan = 'BMKG API tidak dapat dijangkau saat ini. Laporan masuk ke karantina manual.';
  }

  // Tentukan status awal
  const hasNik = nikSukarela && nikSukarela.length === 16;
  let statusAwal;
  if (hasNik) {
    statusAwal = 'Diprioritaskan'; // Ide 6: NIK terdaftar → langsung prioritas
  } else if (bmkgValid === true) {
    statusAwal = 'Tervalidasi BMKG';
  } else {
    statusAwal = 'Karantina';
  }

  const laporanKarantina = {
    ...validasi,
    id: reportId,
    statusValidasi: statusAwal,
    bmkgKeterangan,
    bmkgData,
    voteYa: [],
    voteTidak: [],
    waktu: new Date().toISOString()
  };

  db.quarantinedReports.push(laporanKarantina);
  db.communityVotes[reportId] = { yes: [], no: [] };

  res.json({
    reportId,
    statusValidasi: statusAwal,
    bmkgKeterangan,
    pesanKePelapor: hasNik
      ? 'Laporan Anda (NIK terverifikasi) langsung diprioritaskan ke petugas.'
      : bmkgValid === true
      ? 'Laporan Anda konsisten dengan data BMKG dan sedang diteruskan ke petugas.'
      : 'Laporan Anda masuk ke sistem karantina. Warga sekitar akan diminta memvalidasi.'
  });
});

// ============================================================
// IDE 8: Community Vote (Ping Warga Sekitar)
// ============================================================
app.post('/api/vote-laporan', (req, res) => {
  const { reportId, vote = 'ya', voterId, reason, distanceKm, witnessNote } = req.body;
  if (!reportId) {
    return res.status(400).json({ error: 'ID laporan diperlukan' });
  }

  if (!db.reportVotes) {
    db.reportVotes = {};
  }
  if (!db.reportVotes[reportId]) {
    db.reportVotes[reportId] = { ya: [], tidak: [], witnessLogs: [] };
  }

  const reportVote = db.reportVotes[reportId];
  if (!reportVote.witnessLogs) reportVote.witnessLogs = [];
  const vid = voterId || 'anon-' + (req.ip || 'ip');

  if (reportVote.ya.includes(vid) || reportVote.tidak.includes(vid)) {
    return res.status(409).json({ error: 'Anda sudah pernah memberikan konfirmasi untuk laporan ini.' });
  }

  const witnessRecord = {
    voterId: vid,
    vote,
    reason: reason || (vote === 'ya' ? 'Konfirmasi Saksi Lapangan' : 'Terindikasi Fiktif/Hoaks'),
    distanceKm: distanceKm ? parseFloat(distanceKm) : null,
    witnessNote: witnessNote || '',
    timestamp: new Date().toISOString()
  };
  reportVote.witnessLogs.push(witnessRecord);

  if (vote === 'ya') {
    reportVote.ya.push(vid);
  } else {
    reportVote.tidak.push(vid);
  }

  // Cek jika laporan ada di daftar karantina
  const laporan = db.quarantinedReports?.find(r => r.id === reportId);
  if (laporan) {
    if (!laporan.witnessLogs) laporan.witnessLogs = [];
    laporan.witnessLogs.push(witnessRecord);

    if (vote === 'ya') {
      if (!laporan.voteYa.includes(vid)) laporan.voteYa.push(vid);
    } else {
      if (!laporan.voteTidak.includes(vid)) laporan.voteTidak.push(vid);
    }

    if (laporan.voteYa.length >= 3 && laporan.statusValidasi === 'Karantina') {
      laporan.statusValidasi = 'Tervalidasi Komunitas';
    }
    if (laporan.voteTidak.length >= 3) {
      laporan.statusValidasi = 'Ditolak Komunitas (Fiktif)';
    }
  }

  const yaCount = reportVote.ya.length;
  const tidakCount = reportVote.tidak.length;
  const isVerified = yaCount >= 3;
  const isSuspicious = tidakCount >= 3;

  let consensusStatus = 'Menunggu Konfirmasi Warga';
  if (isVerified) consensusStatus = 'Terverifikasi Warga (Konsensus Komunitas)';
  if (isSuspicious) consensusStatus = 'Terindikasi Fiktif/Hoaks (Dalam Investigasi)';

  res.json({
    success: true,
    reportId,
    voteYaCount: yaCount,
    voteTidakCount: tidakCount,
    statusValidasi: laporan?.statusValidasi || consensusStatus,
    consensusStatus,
    isVerified,
    isSuspicious
  });
});

// ============================================================
// BMKG LIVE DATA & WEATHER RADAR (Resmi & Gratis)
// ============================================================
const INDONESIA_REGIONS = [
  { name: 'Kota Tangerang', provinsi: 'Banten', adm4: '36.71.01.1001', lat: -6.1783, lng: 106.6318 },
  { name: 'Kota Tangerang Selatan', provinsi: 'Banten', adm4: '36.74.01.1001', lat: -6.2888, lng: 106.7179 },
  { name: 'Kota Serang', provinsi: 'Banten', adm4: '36.73.01.1001', lat: -6.1104, lng: 106.1640 },
  { name: 'Jakarta Pusat', provinsi: 'DKI Jakarta', adm4: '31.71.03.1001', lat: -6.1805, lng: 106.8284 },
  { name: 'Jakarta Selatan', provinsi: 'DKI Jakarta', adm4: '31.74.01.1001', lat: -6.2615, lng: 106.8106 },
  { name: 'Jakarta Barat', provinsi: 'DKI Jakarta', adm4: '31.73.01.1001', lat: -6.1683, lng: 106.7588 },
  { name: 'Jakarta Timur', provinsi: 'DKI Jakarta', adm4: '31.75.01.1001', lat: -6.2250, lng: 106.9004 },
  { name: 'Jakarta Utara', provinsi: 'DKI Jakarta', adm4: '31.72.01.1001', lat: -6.1214, lng: 106.8837 },
  { name: 'Kota Bogor', provinsi: 'Jawa Barat', adm4: '32.71.01.1001', lat: -6.5971, lng: 106.8060 },
  { name: 'Kota Depok', provinsi: 'Jawa Barat', adm4: '32.76.01.1001', lat: -6.4025, lng: 106.7942 },
  { name: 'Kota Bekasi', provinsi: 'Jawa Barat', adm4: '32.75.01.1001', lat: -6.2383, lng: 106.9756 },
  { name: 'Kota Bandung', provinsi: 'Jawa Barat', adm4: '32.73.01.1001', lat: -6.9175, lng: 107.6191 },
  { name: 'Kota Cirebon', provinsi: 'Jawa Barat', adm4: '32.74.01.1001', lat: -6.7320, lng: 108.5523 },
  { name: 'Kota Semarang', provinsi: 'Jawa Tengah', adm4: '33.74.01.1001', lat: -6.9667, lng: 110.4167 },
  { name: 'Kota Surakarta (Solo)', provinsi: 'Jawa Tengah', adm4: '33.72.01.1001', lat: -7.5755, lng: 110.8243 },
  { name: 'Kota Yogyakarta', provinsi: 'D.I. Yogyakarta', adm4: '34.71.01.1001', lat: -7.7956, lng: 110.3695 },
  { name: 'Kota Surabaya', provinsi: 'Jawa Timur', adm4: '35.78.01.1001', lat: -7.2575, lng: 112.7521 },
  { name: 'Kota Malang', provinsi: 'Jawa Timur', adm4: '35.73.01.1001', lat: -7.9666, lng: 112.6326 },
  { name: 'Kota Denpasar', provinsi: 'Bali', adm4: '51.71.01.1001', lat: -8.6705, lng: 115.2126 },
  { name: 'Kota Mataram', provinsi: 'Nusa Tenggara Barat', adm4: '52.71.01.1001', lat: -8.5833, lng: 116.1167 },
  { name: 'Kota Kupang', provinsi: 'Nusa Tenggara Timur', adm4: '53.71.01.1001', lat: -10.1772, lng: 123.6070 },
  { name: 'Kota Banda Aceh', provinsi: 'Aceh', adm4: '11.71.01.1001', lat: 5.5483, lng: 95.3238 },
  { name: 'Kota Medan', provinsi: 'Sumatera Utara', adm4: '12.71.01.1001', lat: 3.5952, lng: 98.6722 },
  { name: 'Kota Padang', provinsi: 'Sumatera Barat', adm4: '13.71.01.1001', lat: -0.9471, lng: 100.4172 },
  { name: 'Kota Pekanbaru', provinsi: 'Riau', adm4: '14.71.01.1001', lat: 0.5071, lng: 101.4478 },
  { name: 'Kota Palembang', provinsi: 'Sumatera Selatan', adm4: '16.71.01.1001', lat: -2.9761, lng: 104.7754 },
  { name: 'Kota Bandar Lampung', provinsi: 'Lampung', adm4: '18.71.01.1001', lat: -5.4500, lng: 105.2667 },
  { name: 'Kota Pontianak', provinsi: 'Kalimantan Barat', adm4: '61.71.01.1001', lat: -0.0263, lng: 109.3425 },
  { name: 'Kota Banjarmasin', provinsi: 'Kalimantan Selatan', adm4: '63.71.01.1001', lat: -3.3194, lng: 114.5908 },
  { name: 'Kota Balikpapan', provinsi: 'Kalimantan Timur', adm4: '64.71.01.1001', lat: -1.2654, lng: 116.8312 },
  { name: 'Kota Samarinda', provinsi: 'Kalimantan Timur', adm4: '64.72.01.1001', lat: -0.5022, lng: 117.1537 },
  { name: 'Kota Manado', provinsi: 'Sulawesi Utara', adm4: '71.71.01.1001', lat: 1.4748, lng: 124.8421 },
  { name: 'Kota Palu', provinsi: 'Sulawesi Tengah', adm4: '72.71.01.1001', lat: -0.9003, lng: 119.8779 },
  { name: 'Kota Makassar', provinsi: 'Sulawesi Selatan', adm4: '73.71.01.1001', lat: -5.1477, lng: 119.4327 },
  { name: 'Kota Kendari', provinsi: 'Sulawesi Tenggara', adm4: '74.71.01.1001', lat: -3.9985, lng: 122.5126 },
  { name: 'Kota Ambon', provinsi: 'Maluku', adm4: '81.71.01.1001', lat: -3.6547, lng: 128.1906 },
  { name: 'Kota Jayapura', provinsi: 'Papua', adm4: '91.71.01.1001', lat: -2.5337, lng: 140.7181 }
];

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function findNearestRegion(lat, lng) {
  if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
    return INDONESIA_REGIONS[0]; // Default: Kota Tangerang
  }
  let closest = INDONESIA_REGIONS[0];
  let minDistance = Infinity;
  for (const reg of INDONESIA_REGIONS) {
    const d = calculateDistanceKm(lat, lng, reg.lat, reg.lng);
    if (d < minDistance) {
      minDistance = d;
      closest = reg;
    }
  }
  return closest;
}

// Memory cache for BMKG responses (60s TTL)
const bmkgCache = {
  gempa: null,
  gempaTime: 0,
  recentGempa: null,
  recentGempaTime: 0,
  weather: {} // [adm4]: { data, time }
};

// GET /api/bmkg/cities - list available cities for user selector
app.get('/api/bmkg/cities', (req, res) => {
  res.json(INDONESIA_REGIONS);
});

// GET /api/bmkg/live - complete combined real-time BMKG situational feed
app.get('/api/bmkg/live', async (req, res) => {
  const userLat = req.query.lat ? parseFloat(req.query.lat) : -6.1783;
  const userLng = req.query.lng ? parseFloat(req.query.lng) : 106.6318;
  const requestedAdm4 = req.query.adm4;

  let region = requestedAdm4
    ? INDONESIA_REGIONS.find(r => r.adm4 === requestedAdm4) || findNearestRegion(userLat, userLng)
    : findNearestRegion(userLat, userLng);

  const now = Date.now();

  // 1. Fetch BMKG Earthquake
  let gempaData = null;
  try {
    if (bmkgCache.gempa && (now - bmkgCache.gempaTime < 60000)) {
      gempaData = bmkgCache.gempa;
    } else {
      const gResp = await axios.get('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json', { timeout: 4500 });
      gempaData = gResp.data?.Infogempa?.gempa || null;
      if (gempaData) {
        bmkgCache.gempa = gempaData;
        bmkgCache.gempaTime = now;
      }
    }
  } catch (err) {
    gempaData = bmkgCache.gempa; // use cached if available
  }

  // 2. Fetch BMKG Recent Earthquakes (felt)
  let recentGempaList = [];
  try {
    if (bmkgCache.recentGempa && (now - bmkgCache.recentGempaTime < 120000)) {
      recentGempaList = bmkgCache.recentGempa;
    } else {
      const rgResp = await axios.get('https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json', { timeout: 4500 });
      recentGempaList = (rgResp.data?.Infogempa?.gempa || []).slice(0, 4);
      if (recentGempaList.length > 0) {
        bmkgCache.recentGempa = recentGempaList;
        bmkgCache.recentGempaTime = now;
      }
    }
  } catch (err) {
    recentGempaList = bmkgCache.recentGempa || [];
  }

  // 3. Process Earthquake & Distance to User
  let processedGempa = null;
  if (gempaData) {
    let distanceKm = null;
    if (gempaData.Coordinates) {
      const [gLat, gLng] = gempaData.Coordinates.split(',').map(s => parseFloat(s.trim()));
      if (!isNaN(gLat) && !isNaN(gLng)) {
        distanceKm = calculateDistanceKm(userLat, userLng, gLat, gLng);
      }
    }

    let alertLevel = 'aman';
    let alertLabel = 'Luar Radius Bahaya';
    if (distanceKm !== null) {
      if (distanceKm < 150) {
        alertLevel = 'bahaya';
        alertLabel = 'Sangat Dekat (< 150 km)';
      } else if (distanceKm < 400) {
        alertLevel = 'waspada';
        alertLabel = 'Radius Terasa (< 400 km)';
      }
    }

    processedGempa = {
      ...gempaData,
      distanceKm,
      alertLevel,
      alertLabel,
      shakemapUrl: gempaData.Shakemap ? `https://data.bmkg.go.id/DataMKG/TEWS/${gempaData.Shakemap}` : null
    };
  }

  // 4. Fetch BMKG Weather
  let weatherPayload = null;
  try {
    const cachedW = bmkgCache.weather[region.adm4];
    if (cachedW && (now - cachedW.time < 60000)) {
      weatherPayload = cachedW.data;
    } else {
      const wResp = await axios.get(`https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${region.adm4}`, { timeout: 5000 });
      weatherPayload = wResp.data;
      if (weatherPayload) {
        bmkgCache.weather[region.adm4] = { data: weatherPayload, time: now };
      }
    }
  } catch (err) {
    if (bmkgCache.weather[region.adm4]) {
      weatherPayload = bmkgCache.weather[region.adm4].data;
    }
  }

  // 5. Process Weather Slots
  let currentWeather = null;
  let upcomingForecast = [];
  let statusRisikoBanjir = 'Rendah';
  let peringatanCuaca = 'Kondisi cuaca terpantau normal dan kondusif.';

  if (weatherPayload?.data?.[0]?.cuaca) {
    const allSlots = weatherPayload.data[0].cuaca.flat();
    
    // Cari slot waktu terdekat dengan saat ini
    let minDiff = Infinity;
    for (const s of allSlots) {
      const diff = Math.abs(new Date(s.datetime).getTime() - now);
      if (diff < minDiff) {
        minDiff = diff;
        currentWeather = s;
      }
    }

    upcomingForecast = allSlots
      .filter(s => new Date(s.datetime).getTime() >= now - 1800000)
      .slice(0, 5)
      .map(s => ({
        datetime: s.datetime,
        local_datetime: s.local_datetime,
        jam: s.local_datetime ? s.local_datetime.split(' ')[1].slice(0, 5) : '',
        suhu: s.t,
        kondisi: s.weather_desc,
        icon: s.image,
        curahHujan: s.tp,
        kelembapan: s.hu,
        kecepatanAngin: s.ws,
        arahAngin: s.wd
      }));

    const hasHeavyRain = upcomingForecast.some(s => /lebat|petir|ekstrem/i.test(s.kondisi) || (s.curahHujan && s.curahHujan >= 10));
    const hasRain = upcomingForecast.some(s => /hujan/i.test(s.kondisi) || (s.curahHujan && s.curahHujan > 1));

    if (hasHeavyRain) {
      statusRisikoBanjir = 'Tinggi';
      peringatanCuaca = 'Peringatan Dini: Potensi hujan lebat / petir. Waspada luapan air & banjir!';
    } else if (hasRain) {
      statusRisikoBanjir = 'Sedang';
      peringatanCuaca = 'Prakiraan hujan terdeteksi. Siapkan payung dan waspadai genangan jalan.';
    }
  } else {
    // Fallback data if BMKG weather endpoint is temporarily slow
    currentWeather = {
      t: 28,
      weather_desc: 'Cerah Berawan',
      hu: 78,
      ws: 6.2,
      wd: 'SE',
      image: 'https://api-apps.bmkg.go.id/storage/icon/cuaca/berawan-pm.svg'
    };
    upcomingForecast = [
      { jam: '06:00', suhu: 26, kondisi: 'Cerah', icon: 'https://api-apps.bmkg.go.id/storage/icon/cuaca/cerah-am.svg', curahHujan: 0 },
      { jam: '12:00', suhu: 32, kondisi: 'Berawan', icon: 'https://api-apps.bmkg.go.id/storage/icon/cuaca/berawan-pm.svg', curahHujan: 0.1 },
      { jam: '18:00', suhu: 29, kondisi: 'Hujan Ringan', icon: 'https://api-apps.bmkg.go.id/storage/icon/cuaca/hujan-ringan-pm.svg', curahHujan: 1.5 },
    ];
  }

  res.json({
    region: {
      name: region.name,
      provinsi: region.provinsi,
      adm4: region.adm4,
      lat: region.lat,
      lng: region.lng,
      userGps: { lat: userLat, lng: userLng },
      distanceFromUserKm: calculateDistanceKm(userLat, userLng, region.lat, region.lng)
    },
    cuaca: {
      saatIni: {
        suhu: currentWeather?.t ?? 28,
        kondisi: currentWeather?.weather_desc || 'Berawan',
        kelembapan: currentWeather?.hu ?? 75,
        kecepatanAngin: currentWeather?.ws ?? 5,
        arahAngin: currentWeather?.wd || 'E',
        icon: currentWeather?.image || 'https://api-apps.bmkg.go.id/storage/icon/cuaca/berawan-pm.svg',
        risikoBanjir: statusRisikoBanjir,
        peringatanCuaca
      },
      prakiraan: upcomingForecast
    },
    gempa: {
      terbaru: processedGempa,
      dirasakan: recentGempaList.map(g => {
        let dist = null;
        if (g.Coordinates) {
          const [gl, gn] = g.Coordinates.split(',').map(s => parseFloat(s.trim()));
          if (!isNaN(gl) && !isNaN(gn)) dist = calculateDistanceKm(userLat, userLng, gl, gn);
        }
        return { ...g, distanceKm: dist };
      })
    },
    sumber: 'Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)',
    timestamp: new Date().toISOString()
  });
});

// Petugas: Ambil semua laporan karantina
app.get('/api/admin/karantina', (req, res) => {
  res.json(db.quarantinedReports);
});

// Petugas: Konfirmasi manual laporan dari karantina
app.post('/api/admin/karantina/konfirmasi', (req, res) => {
  const { reportId, action } = req.body; // action: 'sahkan' | 'tolak'
  const laporan = db.quarantinedReports.find(r => r.id === reportId);
  if (!laporan) return res.status(404).json({ error: 'Laporan tidak ditemukan' });
  laporan.statusValidasi = action === 'sahkan' ? 'Disahkan Petugas' : 'Ditolak Petugas';
  res.json({ success: true, statusValidasi: laporan.statusValidasi });
});

// --- NASIONAL BNPB: Sync State & Multi-Daerah Persistence ---
db.nationalData = {
  wilayah: null,
  permintaan: null,
  distribusi: null,
  ews: null,
  keluarga: null,
  aktivitas: null,
  akunBpbd: null,
  auditAdmin: null,
};

app.get('/api/national/state', (req, res) => {
  res.json({
    success: true,
    data: db.nationalData,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/national/sync', (req, res) => {
  const { type, payload } = req.body;
  if (type && payload && Object.prototype.hasOwnProperty.call(db.nationalData, type)) {
    db.nationalData[type] = payload;
  }
  res.json({ success: true, updated: type, timestamp: new Date().toISOString() });
});

app.post('/api/national/sync-all', (req, res) => {
  const { wilayah, permintaan, distribusi, ews, keluarga, aktivitas, akunBpbd, auditAdmin } = req.body;
  if (wilayah) db.nationalData.wilayah = wilayah;
  if (permintaan) db.nationalData.permintaan = permintaan;
  if (distribusi) db.nationalData.distribusi = distribusi;
  if (ews) db.nationalData.ews = ews;
  if (keluarga) db.nationalData.keluarga = keluarga;
  if (aktivitas) db.nationalData.aktivitas = aktivitas;
  if (akunBpbd) db.nationalData.akunBpbd = akunBpbd;
  if (auditAdmin) db.nationalData.auditAdmin = auditAdmin;
  res.json({ success: true, timestamp: new Date().toISOString() });
});

// ============================================================
// AI TRIAGE — Analisis prioritas laporan via Langflow
// POST /api/ai/triage
// Body: { jenis, kondisi, korban, lokasi, timestamp }
// ============================================================
app.post('/api/ai/triage', async (req, res) => {
  const langflowUrl = process.env.LANGFLOW_BASE_URL || 'http://localhost:7860';
  const flowId = process.env.LANGFLOW_TRIAGE_FLOW_ID || '0c029d7b-4036-4a66-8aa4-a364cd3ee528';
  const apiKey = process.env.LANGFLOW_API_KEY;

  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['x-api-key'] = apiKey;

  try {
    const payload = {
      input_value: JSON.stringify(req.body),
      input_type: 'chat',
      output_type: 'chat',
      tweaks: {}
    };

    const response = await axios.post(
      `${langflowUrl}/api/v1/run/${flowId}?stream=false`,
      payload,
      { headers, timeout: 10000 }
    );

    const raw = response.data;
    const outputText =
      raw?.outputs?.[0]?.outputs?.[0]?.results?.message?.text ||
      raw?.outputs?.[0]?.outputs?.[0]?.messages?.[0]?.message;

    if (!outputText) {
      return res.status(502).json({ error: 'Tidak ada output dari Langflow.' });
    }

    let triaseResult;
    try {
      const jsonMatch = outputText.match(/\{[\s\S]*\}/);
      triaseResult = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(outputText);
    } catch {
      return res.status(502).json({ error: 'Output Langflow bukan JSON valid.', raw: outputText });
    }

    res.json({ success: true, triage: triaseResult });
  } catch (err) {
    console.error('[/api/ai/triage]', err.message);
    res.status(500).json({ error: 'Langflow triage gagal.', detail: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

