import React, { useState, useEffect, useCallback } from 'react';
import { Brain, CheckCircle, AlertTriangle, HelpCircle, Shield, Building2, MapPin, Users, UserCheck } from 'lucide-react';
import axios from 'axios';
import { API_BASE } from '../config/api';
import { useApp } from '../context/AppContext';
import './FamilySearchAdmin.css';

export default function FamilySearchAdmin() {
  const { adminLevel, bpbdWilayah = 'Tangerang', poskoList = [] } = useApp();
  const isRegional = adminLevel === 'regional';

  const [activeSubTab, setActiveSubTab] = useState('reports'); // reports, registrations, matches
  const [reports, setReports] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  
  const [selectedReportId, setSelectedReportId] = useState(null);

  // New Registration State
  const [showRegForm, setShowRegForm] = useState(false);
  const [regData, setRegData] = useState({
    name: '',
    nickname: '',
    ageEstimate: '',
    origin: '',
    currentShelter: '',
    arrivalTime: '',
    pickupLocation: '',
    companions: '',
    notes: ''
  });

  const FALLBACK_REPORTS = [
    {
      id: 'mp-001',
      fullName: 'Sri Wahyuni',
      nickname: 'Bu Yuni',
      age: 'Sekitar 60 tahun',
      origin: 'Ciledug Indah, Tangerang',
      lastKnownLocation: 'Komplek Ciledug Indah RW 06',
      lastKnownTime: 'Kemarin sore saat tanggul jebol',
      lastClothing: 'Daster batik ungu bunga-bunga',
      notes: 'Terpisah saat perahu evakuasi pertama merapat.',
      relationship: 'Anak (Rian)',
      reporterContact: '0812-3456-7890',
      status: 'Menunggu verifikasi petugas',
      wilayah: 'Tangerang',
      timestamp: new Date().toISOString()
    },
    {
      id: 'mp-002',
      fullName: 'Budi Santoso',
      nickname: 'Budi',
      age: '32 tahun',
      origin: 'Periuk Damai, Tangerang',
      lastKnownLocation: 'Pintu Air Ledug Periuk',
      lastKnownTime: 'Pagi ini',
      lastClothing: 'Kaos hitam celana jeans',
      notes: 'Sempat membantu evakuasi warga lanjut usia.',
      relationship: 'Istri',
      reporterContact: '0898-7654-3210',
      status: 'Kecocokan terkonfirmasi',
      wilayah: 'Tangerang',
      timestamp: new Date().toISOString()
    },
    {
      id: 'mp-003',
      fullName: 'Anisa',
      nickname: 'Ica',
      age: '8 tahun',
      origin: 'Pasar Lama, Sukasari, Tangerang',
      lastKnownLocation: 'Area ruko Pasar Lama',
      lastKnownTime: 'Kemarin malam saat kebakaran',
      lastClothing: 'Baju merah celana pendek',
      notes: 'Terpisah dari ibu saat kobaran api merambat.',
      relationship: 'Ayah',
      reporterContact: '0811-2233-4455',
      status: 'Pencarian dibuat',
      wilayah: 'Tangerang',
      timestamp: new Date().toISOString()
    },
    {
      id: 'mp-004',
      fullName: 'Dewi Sartika',
      nickname: 'Dewi',
      age: '28 tahun',
      origin: 'Padang Barat, Sumatera Barat',
      lastKnownLocation: 'Pantai Muaro Padang',
      lastKnownTime: 'Kemarin siang',
      lastClothing: 'Jilbab cokelat, jaket denim',
      notes: 'Gempa pesisir pantai meruntuhkan deretan toko.',
      relationship: 'Suami',
      reporterContact: '0813-4455-6677',
      status: 'Pencarian dibuat',
      wilayah: 'Padang',
      timestamp: new Date().toISOString()
    }
  ];

  const FALLBACK_REGISTRATIONS = [
    {
      id: 'reg-001',
      name: 'Yuni',
      nickname: 'Bu Yuni',
      ageEstimate: 'Sekitar 65 tahun',
      origin: 'Ciledug Indah, Tangerang',
      currentShelter: 'Posko Pengungsian GOR Dimyati',
      wilayah: 'Tangerang',
      arrivalTime: new Date().toISOString(),
      pickupLocation: 'Evakuasi Ciledug Indah RW 06',
      companions: 'Sendiri',
      notes: 'Agak linglung, lansia hipertensi',
      isVerified: false
    },
    {
      id: 'reg-002',
      name: 'Budi Santoso',
      nickname: 'Budi',
      ageEstimate: '32 tahun',
      origin: 'Periuk Jaya, Tangerang',
      currentShelter: 'Posko Siaga Banjir Periuk',
      wilayah: 'Tangerang',
      arrivalTime: new Date().toISOString(),
      pickupLocation: 'Tanggul Kali Ledug Periuk',
      companions: 'Istri dan 1 anak balita',
      notes: 'Rumah terendam 1.8m, surat berharga selamat',
      isVerified: true
    },
    {
      id: 'reg-003',
      name: 'Anisa',
      nickname: 'Ica',
      ageEstimate: '8 tahun',
      origin: 'Sukasari, Tangerang',
      currentShelter: 'Posko Evakuasi Balai Warga Ciledug',
      wilayah: 'Tangerang',
      arrivalTime: new Date().toISOString(),
      pickupLocation: 'Atap ruko Pasar Lama',
      companions: 'Terpisah dari orang tua',
      notes: 'Menangis mencari ibunya (Sri Wahyuni)',
      isVerified: false
    },
    {
      id: 'reg-004',
      name: 'Suparman',
      nickname: 'Parman',
      ageEstimate: '70 tahun',
      origin: 'Ciledug Indah, Tangerang',
      currentShelter: 'Posko Pengungsian GOR Dimyati',
      wilayah: 'Tangerang',
      arrivalTime: new Date().toISOString(),
      pickupLocation: 'Evakuasi Ciledug Indah',
      companions: 'Istri (Yuni)',
      notes: 'Sakit asma, butuh inhaler berkala',
      isVerified: false
    },
    {
      id: 'reg-005',
      name: 'Rina Kartika',
      nickname: 'Rina',
      ageEstimate: '22 tahun',
      origin: 'Karawaci, Tangerang',
      currentShelter: 'Posko Pengungsian GOR Dimyati',
      wilayah: 'Tangerang',
      arrivalTime: new Date().toISOString(),
      pickupLocation: 'Bantaran Cisadane Karawaci',
      companions: 'Adik kandung',
      notes: 'Butuh pakaian ganti dan selimut hangat',
      isVerified: false
    },
    // DATA DARI WILAYAH LAIN (Hanya terlihat di dashboard supervisi BNPB Pusat)
    {
      id: 'reg-006',
      name: 'Dewi Sartika',
      nickname: 'Dewi',
      ageEstimate: '28 tahun',
      origin: 'Padang Barat, Sumbar',
      currentShelter: 'Posko Komando BNPB Padang Barat',
      wilayah: 'Padang',
      arrivalTime: new Date().toISOString(),
      pickupLocation: 'Pantai Muaro Padang',
      companions: 'Anak (1 tahun)',
      notes: 'Penyintas gempa Padang',
      isVerified: true
    },
    {
      id: 'reg-007',
      name: 'Bambang Irawan',
      nickname: 'Bambang',
      ageEstimate: '60 tahun',
      origin: 'Khatib Sulaiman, Padang',
      currentShelter: 'Posko Komando BNPB Padang Barat',
      wilayah: 'Padang',
      arrivalTime: new Date().toISOString(),
      pickupLocation: 'Pusat gempa Padang Barat',
      companions: 'Sendiri',
      notes: 'Luka jahitan di lengan kiri',
      isVerified: false
    },
    {
      id: 'reg-008',
      name: 'Lia Lestari',
      nickname: 'Lia',
      ageEstimate: '31 tahun',
      origin: 'Sungai Kunjang, Samarinda',
      currentShelter: 'Posko Darurat GOR Segiri Samarinda',
      wilayah: 'Samarinda',
      arrivalTime: new Date().toISOString(),
      pickupLocation: 'Kawasan Karhutla Palaran',
      companions: 'Sendiri',
      notes: 'Sesak napas akibat kabut asap',
      isVerified: false
    }
  ];

  const isTangerangShelter = useCallback((text = '') => {
    return /dimyati|ciledug|periuk|tangerang|balai warga|karawaci|sukasari|cisadane/i.test(text);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const regUrl = isRegional
        ? `${API_BASE}/admin/shelter-registrations?wilayah=${encodeURIComponent(bpbdWilayah || 'Tangerang')}`
        : `${API_BASE}/admin/shelter-registrations`;

      const [resReports, resRegs] = await Promise.all([
        axios.get(`${API_BASE}/admin/missing-persons`, { timeout: 2500 }),
        axios.get(regUrl, { timeout: 2500 })
      ]);
      setReports(resReports.data && resReports.data.length > 0 ? resReports.data : FALLBACK_REPORTS);
      setRegistrations(resRegs.data && resRegs.data.length > 0 ? resRegs.data : FALLBACK_REGISTRATIONS);
    } catch (err) {
      console.warn('Backend admin offline, menggunakan data demo:', err.message);
      setReports(FALLBACK_REPORTS);
      setRegistrations(FALLBACK_REGISTRATIONS);
    } finally {
      setLoading(false);
    }
  }, [isRegional, bpbdWilayah]);

  const fetchSuggestions = async (reportId) => {
    try {
      const res = await axios.get(`${API_BASE}/admin/match/suggestions/${reportId}`, { timeout: 2500 });
      const result = res.data || [];
      setSuggestions(result);
      return result;
    } catch (err) {
      setSuggestions([]);
      setFeedback({ type: 'error', message: 'Kandidat belum dapat dimuat. Coba lagi sesaat lagi.' });
      return [];
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Scoping data pengungsi: BPBD HANYA MENGELOLA PENGUNGSI DARI POSKO WILAYAHNYA
  const displayedRegistrations = registrations.filter(r => {
    if (!isRegional) return true; // BNPB melihat gabungan lintas daerah
    if (r.wilayah && r.wilayah.toLowerCase() === (bpbdWilayah || 'tangerang').toLowerCase()) return true;
    return isTangerangShelter(r.currentShelter || '') || isTangerangShelter(r.origin || '');
  });

  // Laporan yang ditampilkan: Untuk BPBD diprioritaskan laporan Tangerang
  const displayedReports = isRegional
    ? reports.filter(r => (r.wilayah && r.wilayah.toLowerCase() === (bpbdWilayah || 'tangerang').toLowerCase()) || isTangerangShelter(r.origin || '') || isTangerangShelter(r.lastKnownLocation || ''))
    : reports;

  const handleRegInputChange = (e) => {
    setRegData({ ...regData, [e.target.name]: e.target.value });
  };

  const submitRegistration = async (e) => {
    e.preventDefault();
    const targetWilayah = isRegional ? (bpbdWilayah || 'Tangerang') : 'Nasional';
    const newReg = {
      id: 'reg-' + Date.now(),
      ...regData,
      wilayah: targetWilayah,
      isVerified: false,
      timestamp: new Date().toISOString()
    };

    try {
      await axios.post(`${API_BASE}/admin/shelter-registrations`, newReg, { timeout: 2500 });
      setShowRegForm(false);
      setRegData({ name: '', nickname: '', ageEstimate: '', origin: '', currentShelter: '', arrivalTime: '', pickupLocation: '', companions: '', notes: '' });
      setFeedback({
        type: 'success',
        message: `Pengungsi berhasil dicatat di ${newReg.currentShelter} (Wilayah ${targetWilayah})!`
      });
      fetchData();
    } catch (err) {
      setRegistrations(prev => [newReg, ...prev]);
      setShowRegForm(false);
      setRegData({ name: '', nickname: '', ageEstimate: '', origin: '', currentShelter: '', arrivalTime: '', pickupLocation: '', companions: '', notes: '' });
      setFeedback({
        type: 'success',
        message: `Pengungsi baru tercatat lokal di posko ${newReg.currentShelter}!`
      });
    }
  };

  const analyzeMatch = async (reportId) => {
    try {
      setAnalyzingId(reportId);
      const response = await axios.post(`${API_BASE}/admin/match/analyze`, {
        reportId,
        wilayah: isRegional ? (bpbdWilayah || 'Tangerang') : undefined
      }, { timeout: 5000 });

      setSelectedReportId(reportId);
      setActiveSubTab('matches');
      setSuggestions(response.data.suggestions || []);
      setFeedback({
        type: response.data.suggestions?.length ? 'success' : 'info',
        message: response.data.suggestions?.length
          ? `${response.data.suggestions.length} kandidat ditemukan ${isRegional ? `pada posko ${bpbdWilayah}` : 'secara nasional'}.`
          : `Belum ada kandidat kuat pada posko ${isRegional ? bpbdWilayah : 'nasional'}.`
      });
      await fetchData();
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', message: 'Analisis belum dapat dijalankan. Coba lagi sesaat lagi.' });
    } finally {
      setAnalyzingId(null);
    }
  };

  const openCandidates = async (reportId) => {
    setSelectedReportId(reportId);
    setActiveSubTab('matches');
    setVerificationNotes('');
    await fetchSuggestions(reportId);
  };

  const handleVerification = async (suggestionId, action) => {
    try {
      const response = await axios.post(`${API_BASE}/admin/match/verify`, {
        suggestionId,
        action,
        notes: verificationNotes.trim(),
        adminId: isRegional ? `satgas-${bpbdWilayah.toLowerCase()}` : 'superadmin-bnpb'
      });
      setSuggestions(prev => prev.map(suggestion => suggestion.id === suggestionId ? { ...suggestion, status: action } : suggestion));
      setReports(prev => prev.map(report => report.id === selectedReportId ? { ...report, status: response.data.reportStatus } : report));
      setVerificationNotes('');
      setFeedback({
        type: 'success',
        message: action === 'Keluarga berhasil dihubungkan'
          ? 'Keluarga telah ditandai berhasil dihubungkan.'
          : 'Hasil verifikasi berhasil disimpan oleh petugas posko.'
      });
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', message: 'Verifikasi belum tersimpan. Coba lagi.' });
    }
  };

  // Posko options for dropdown
  const localPoskoList = poskoList.length > 0
    ? poskoList
    : [
        { id: 'PSK-TGR-01', nama: 'Posko Pengungsian GOR Dimyati', kapasitas: 600, terisi: 580 },
        { id: 'PSK-TGR-02', nama: 'Posko Evakuasi Balai Warga Ciledug', kapasitas: 350, terisi: 310 },
        { id: 'PSK-TGR-03', nama: 'Posko Siaga Banjir Periuk', kapasitas: 400, terisi: 180 }
      ];

  return (
    <div className="family-search-admin-container">
      {/* JURISDICTION / AUTHORITY HEADER BANNER */}
      <div className={`family-jurisdiction-banner ${isRegional ? 'regional-banner' : 'national-banner'}`}>
        <div className="banner-left-content">
          <div className="banner-badge-group">
            <span className={`badge-authority ${isRegional ? 'regional' : 'national'}`}>
              <Shield size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              {isRegional ? `BPBD KOTA ${bpbdWilayah.toUpperCase()}` : 'BNPB PUSAT (SUPERVISI NASIONAL)'}
            </span>
            <span className="badge-scope-pill">
              {isRegional ? 'Yurisdiksi Posko Lokal Terbatas' : 'Konsolidasi Agregat Multi-Daerah'}
            </span>
          </div>

          <h3 className="banner-title">
            {isRegional
              ? `Pengelolaan Penyintas & Temukan Keluarga – Posko Kota ${bpbdWilayah}`
              : 'Pusat Koordinasi Temukan Keluarga Terpadu – Agregat Lintas Daerah'}
          </h3>

          <p className="banner-description">
            {isRegional ? (
              <>
                SOP Otoritas Daerah: BPBD hanya mengelola data pengungsi pada posko wilayah yurisdiksinya (
                <strong>GOR Dimyati, Balai Warga Ciledug, Siaga Periuk</strong>). Laporan pencarian warga dicocokkan langsung
                dengan pengungsi posko setempat. Akses gabungan lintas provinsi dikelola oleh BNPB Nasional.
              </>
            ) : (
              <>
                Akses supervisi terpusat: Menyatukan data pengungsi dari seluruh posko kabupaten/kota dan provinsi di
                Indonesia secara realtime untuk mempermudah reuni keluarga lintas wilayah bencana.
              </>
            )}
          </p>
        </div>

        <div className="banner-right-metrics">
          <div className="metric-box primary">
            <div className="metric-icon-wrap">
              <Users size={18} />
            </div>
            <div className="metric-data">
              <span className="metric-value">{displayedRegistrations.length}</span>
              <span className="metric-label">{isRegional ? `Pengungsi Posko ${bpbdWilayah}` : 'Total Pengungsi Nasional'}</span>
            </div>
          </div>

          <div className="metric-box secondary">
            <div className="metric-icon-wrap">
              <Building2 size={18} />
            </div>
            <div className="metric-data">
              <span className="metric-value">{isRegional ? localPoskoList.length : `${poskoList.length + 2}+`}</span>
              <span className="metric-label">{isRegional ? 'Posko Lokal Aktif' : 'Posko Terkoneksi'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SUBNAV TAB BUTTONS */}
      <div className="admin-subnav-buttons">
        <button
          className={activeSubTab === 'reports' ? 'active' : ''}
          onClick={() => setActiveSubTab('reports')}
        >
          Laporan Pencarian ({displayedReports.length})
          {isRegional && <span className="subtab-micro-badge">Wilayah {bpbdWilayah}</span>}
        </button>
        <button
          className={activeSubTab === 'registrations' ? 'active' : ''}
          onClick={() => setActiveSubTab('registrations')}
        >
          Data Pengungsi di Posko ({displayedRegistrations.length})
          <span className="subtab-micro-badge">{isRegional ? 'Khusus Posko Lokal' : 'Gabungan Nasional'}</span>
        </button>
        <button
          className={activeSubTab === 'matches' ? 'active' : ''}
          onClick={() => setActiveSubTab('matches')}
        >
          Kandidat Kecocokan {selectedReportId ? '(Aktif)' : ''}
        </button>
      </div>

      {feedback && <div className={`family-feedback ${feedback.type}`} role="status">{feedback.message}</div>}

      {loading && <p className="loading-indicator">Memuat data pengungsi dan laporan...</p>}

      {/* TAB 1: LAPORAN PENCARIAN (WARGA) */}
      {!loading && activeSubTab === 'reports' && (
        <div className="dashboard-grid full-width">
          <div className="clean-white-card">
            <div className="card-header-flex">
              <div>
                <h3>Daftar Laporan Orang Hilang (Dari Warga)</h3>
                <p className="card-subtitle-text">
                  {isRegional
                    ? `Menampilkan laporan pencarian keluarga di area Kota ${bpbdWilayah} yang perlu dicocokkan dengan pengungsi posko lokal.`
                    : 'Menampilkan seluruh laporan pencarian keluarga dari berbagai daerah bencana di Indonesia.'}
                </p>
              </div>
              <div className="scope-tag-indicator">
                <MapPin size={14} />
                <span>Cakupan: {isRegional ? `Kota ${bpbdWilayah}` : 'Seluruh Indonesia (BNPB)'}</span>
              </div>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nama Dicari</th>
                    <th>Asal & Terakhir Terlihat</th>
                    <th>Wilayah Laporan</th>
                    <th>Status Pencarian</th>
                    <th>Aksi Kecocokan AI</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedReports.map(r => (
                    <tr key={r.id}>
                      <td className="cell-id">{r.id.substring(0, 8)}</td>
                      <td>
                        <strong>{r.fullName}</strong><br />
                        <small className="text-secondary">{r.age} | Panggilan: {r.nickname || '-'}</small>
                      </td>
                      <td>
                        <span className="location-origin">{r.origin}</span><br />
                        <small className="text-secondary">{r.lastKnownLocation}</small>
                      </td>
                      <td>
                        <span className={`badge-posko-jurisdiction ${r.wilayah === 'Tangerang' || isTangerangShelter(r.origin) ? 'badge-local' : 'badge-national'}`}>
                          {r.wilayah === 'Tangerang' || isTangerangShelter(r.origin) ? 'Kota Tangerang' : (r.wilayah || 'Nasional')}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill status-${r.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        {r.status === 'Menunggu verifikasi petugas' || r.status === 'Kecocokan terkonfirmasi' || r.status === 'Keluarga berhasil dihubungkan' ? (
                          <button className="btn-action-small btn-blue" onClick={() => openCandidates(r.id)}>
                            Lihat Hasil AI
                          </button>
                        ) : (
                          <button
                            className="btn-action-small btn-blue"
                            onClick={() => analyzeMatch(r.id)}
                            disabled={analyzingId === r.id}
                          >
                            {analyzingId === r.id ? 'Mencocokkan...' : r.status === 'Tidak ada kandidat' ? 'Analisis Ulang' : 'Cari Kandidat'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DATA PENGUNGSI DI POSKO (BPBD HANYA MENGELOLA POSKO WILAYAHNYA) */}
      {!loading && activeSubTab === 'registrations' && (
        <div className="dashboard-grid full-width">
          <div className="clean-white-card">
            <div className="card-header-flex">
              <div>
                <h3>
                  Data Pengungsi di Posko
                  {isRegional && <span className="local-title-tag"> (Wilayah Kota {bpbdWilayah})</span>}
                </h3>
                <p className="card-subtitle-text">
                  {isRegional
                    ? `BPBD Kota ${bpbdWilayah} hanya berwenang mendata & mengelola pengungsi pada posko wilayah ${bpbdWilayah}.`
                    : 'Supervisi BNPB Pusat: Menampilkan seluruh data pengungsi dari posko se-Indonesia.'}
                </p>
              </div>
              <button
                className="btn-hero-sos-vibrant-sm btn-blue-theme"
                onClick={() => setShowRegForm(!showRegForm)}
              >
                {showRegForm ? 'Batal' : '+ Catat Pengungsi Baru'}
              </button>
            </div>

            {/* FORM REGISTRASI PENGUNGSI BARU */}
            {showRegForm && (
              <form onSubmit={submitRegistration} className="reg-form clean-reg-box">
                <div className="reg-form-title">
                  <UserCheck size={18} />
                  <span>Formulir Pendataan Pengungsi Posko {isRegional ? `BPBD Kota ${bpbdWilayah}` : 'BNPB'}</span>
                </div>

                <div className="form-grid">
                  <div>
                    <label className="form-label-small">Nama Lengkap *</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Contoh: Siti Rahma"
                      value={regData.name}
                      onChange={handleRegInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label-small">Nama Panggilan</label>
                    <input
                      type="text"
                      name="nickname"
                      placeholder="Contoh: Bu Siti"
                      value={regData.nickname}
                      onChange={handleRegInputChange}
                    />
                  </div>
                  <div>
                    <label className="form-label-small">Perkiraan Usia *</label>
                    <input
                      type="text"
                      name="ageEstimate"
                      placeholder="Contoh: Sekitar 50 tahun / 8 tahun"
                      value={regData.ageEstimate}
                      onChange={handleRegInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label-small">Daerah Asal / Alamat Rumah *</label>
                    <input
                      type="text"
                      name="origin"
                      placeholder="Contoh: Ciledug Indah RW 06"
                      value={regData.origin}
                      onChange={handleRegInputChange}
                      required
                    />
                  </div>

                  {/* POSKO PENAMPUNGAN: DROPDOWN SESUAI YURISDIKSI WILAYAH */}
                  <div className="form-group-full">
                    <label className="form-label-small">
                      Posko Penampungan {isRegional ? `(Khusus Wilayah Kota ${bpbdWilayah})` : ''} *
                    </label>
                    <select
                      name="currentShelter"
                      value={regData.currentShelter}
                      onChange={handleRegInputChange}
                      required
                      className="form-select-posko"
                    >
                      <option value="">-- Pilih Posko Penampungan --</option>
                      {localPoskoList.map(p => (
                        <option key={p.id || p.nama} value={p.nama}>
                          {p.nama} {p.kapasitas ? `(Kapasitas ${p.terisi || 0}/${p.kapasitas} jiwa)` : ''}
                        </option>
                      ))}
                      <option value="Posko Darurat Mandiri Warga Tangerang">Posko Darurat Mandiri Warga (Tangerang)</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label-small">Lokasi Penjemputan / Evakuasi</label>
                    <input
                      type="text"
                      name="pickupLocation"
                      placeholder="Contoh: Tanggul Ciledug Indah"
                      value={regData.pickupLocation}
                      onChange={handleRegInputChange}
                    />
                  </div>
                  <div>
                    <label className="form-label-small">Rombongan / Pendamping</label>
                    <input
                      type="text"
                      name="companions"
                      placeholder="Contoh: Sendiri / Bersama 2 anak"
                      value={regData.companions}
                      onChange={handleRegInputChange}
                    />
                  </div>
                  <div className="form-group-full">
                    <label className="form-label-small">Catatan Khusus / Ciri Fisik / Kebutuhan Medis</label>
                    <input
                      type="text"
                      name="notes"
                      placeholder="Contoh: Hipertensi, butuh obat rutin, daster batik bunga-bunga"
                      value={regData.notes}
                      onChange={handleRegInputChange}
                    />
                  </div>
                </div>

                <div className="form-action-footer">
                  <button type="submit" className="btn-action-small btn-green">
                    Simpan Data ke Posko {isRegional ? bpbdWilayah : 'Pusat'}
                  </button>
                  <button type="button" className="btn-action-small btn-outline-cancel" onClick={() => setShowRegForm(false)}>
                    Batal
                  </button>
                </div>
              </form>
            )}

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nama & Usia</th>
                    <th>Posko Penampungan</th>
                    <th>Yurisdiksi Pengelola</th>
                    <th>Asal & Penjemputan</th>
                    <th>Pendamping</th>
                    <th>Status Verifikasi</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedRegistrations.map(r => (
                    <tr key={r.id}>
                      <td>
                        <strong>{r.name}</strong> {r.nickname && <span className="nickname-tag">({r.nickname})</span>}<br />
                        <small className="text-secondary">{r.ageEstimate}</small>
                      </td>
                      <td>
                        <strong className="text-shelter">{r.currentShelter}</strong>
                        {r.notes && <div className="notes-preview">Catatan: {r.notes}</div>}
                      </td>
                      <td>
                        <span className={`badge-posko-jurisdiction ${r.wilayah === 'Tangerang' || isTangerangShelter(r.currentShelter) ? 'badge-local' : 'badge-national'}`}>
                          {r.wilayah === 'Tangerang' || isTangerangShelter(r.currentShelter)
                            ? 'BPBD Kota Tangerang'
                            : `BNPB (${r.wilayah || 'Luar Wilayah'})`}
                        </span>
                      </td>
                      <td>
                        <span>{r.origin}</span><br />
                        <small className="text-secondary">Jemput: {r.pickupLocation || '-'}</small>
                      </td>
                      <td>{r.companions || 'Sendiri'}</td>
                      <td>
                        <span className={`badge-verification ${r.isVerified ? 'verified' : 'unverified'}`}>
                          {r.isVerified ? '✓ Terverifikasi Posko' : 'Belum Diverifikasi'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: KANDIDAT KECOCOKAN AI */}
      {!loading && activeSubTab === 'matches' && (
        <div className="matches-view">
          {!selectedReportId ? (
            <div className="clean-white-card empty-state">
              <h3>Pilih Laporan untuk Dilihat</h3>
              <p>Jalankan analisis AI pada tab "Laporan Pencarian" terlebih dahulu untuk mencocokkan dengan data pengungsi posko.</p>
            </div>
          ) : (
            <>
              {(() => {
                const report = reports.find(r => r.id === selectedReportId);
                if (!report) return null;

                return (
                  <div className="match-comparison-container">
                    {/* SISI KIRI: DATA LAPORAN */}
                    <div className="clean-white-card report-side">
                      <span className="badge-side">Laporan Orang Hilang (Warga)</span>
                      <h3>{report.fullName}</h3>
                      <ul className="report-detail-list">
                        <li><strong>Nama Panggilan:</strong> {report.nickname || '-'}</li>
                        <li><strong>Usia:</strong> {report.age}</li>
                        <li><strong>Asal Wilayah:</strong> {report.origin}</li>
                        <li><strong>Terakhir Terlihat:</strong> {report.lastKnownLocation} ({report.lastKnownTime})</li>
                        <li><strong>Pakaian Terakhir:</strong> {report.lastClothing || '-'}</li>
                        <li><strong>Catatan Pelapor:</strong> {report.notes || '-'}</li>
                        <li><strong>Kontak Pelapor:</strong> {report.reporterContact} ({report.relationship})</li>
                      </ul>
                    </div>

                    {/* SISI KANAN: KANDIDAT PENGUNGSI DI POSKO */}
                    <div className="suggestions-list-side">
                      {suggestions.length === 0 ? (
                        <div className="clean-white-card">
                          <h3>Belum ada kandidat kuat di posko</h3>
                          <p>
                            {isRegional
                              ? `AI belum menemukan kesamaan kuat pada posko wilayah Kota ${bpbdWilayah}. Lengkapi data pengungsi posko baru lalu jalankan analisis ulang.`
                              : 'Belum ada kandidat kuat pada posko nasional. Lengkapi data pengungsi lalu jalankan analisis ulang.'}
                          </p>
                        </div>
                      ) : (
                        suggestions.map(sugg => {
                          const candidate = registrations.find(r => r.id === sugg.registrationId);
                          const isCandidateLocal = candidate && (candidate.wilayah === 'Tangerang' || isTangerangShelter(candidate.currentShelter));

                          return (
                            <div key={sugg.id} className="clean-white-card match-candidate-card">
                              <div className="match-card-header">
                                <div className="candidate-badge-cluster">
                                  <span className="badge-side candidate">Kandidat Pengungsi Posko</span>
                                  <span className={`badge-posko-jurisdiction ${isCandidateLocal ? 'badge-local' : 'badge-national'}`}>
                                    {isCandidateLocal ? 'Posko BPBD Tangerang' : 'Posko Luar Daerah'}
                                  </span>
                                </div>
                                <span className={`evidence-badge level-${sugg.evidenceLevel}`}>
                                  Tingkat Bukti: {sugg.evidenceLevel.toUpperCase()}
                                </span>
                              </div>

                              <h3>{candidate?.name || 'Data Pengungsi'}</h3>
                              <ul className="candidate-detail-list">
                                <li><strong>Panggilan di Posko:</strong> {candidate?.nickname || '-'}</li>
                                <li><strong>Perkiraan Usia:</strong> {candidate?.ageEstimate}</li>
                                <li><strong>Posko Saat Ini:</strong> <strong className="text-shelter">{candidate?.currentShelter}</strong></li>
                                <li><strong>Lokasi Penjemputan:</strong> {candidate?.pickupLocation || '-'}</li>
                                <li><strong>Pendamping:</strong> {candidate?.companions || '-'}</li>
                              </ul>

                              <div className="ai-analysis-box">
                                <h4>
                                  <Brain size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                                  Analisis Kecocokan AI SalingJaga
                                </h4>

                                {sugg.supportingEvidence?.length > 0 && (
                                  <div className="evidence-section positive">
                                    <h5>
                                      <CheckCircle size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                      Persamaan yang Ditemukan
                                    </h5>
                                    <ul>{sugg.supportingEvidence.map((e, i) => <li key={i}>{e.explanation}</li>)}</ul>
                                  </div>
                                )}

                                {sugg.conflictingEvidence?.length > 0 && (
                                  <div className="evidence-section negative">
                                    <h5>
                                      <AlertTriangle size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                      Perbedaan / Perlu Verifikasi
                                    </h5>
                                    <ul>{sugg.conflictingEvidence.map((e, i) => <li key={i}>{e.explanation}</li>)}</ul>
                                  </div>
                                )}

                                {sugg.verificationQuestions?.length > 0 && (
                                  <div className="evidence-section questions">
                                    <h5>
                                      <HelpCircle size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                      Panduan Pertanyaan Verifikasi Petugas Posko
                                    </h5>
                                    <ul>{sugg.verificationQuestions.map((q, i) => <li key={i}>{q}</li>)}</ul>
                                  </div>
                                )}
                              </div>

                              <div className="verification-notes">
                                <label htmlFor={`verification-${sugg.id}`}>
                                  Catatan Verifikasi Petugas Posko ({isRegional ? `BPBD Kota ${bpbdWilayah}` : 'BNPB'})
                                </label>
                                <textarea
                                  id={`verification-${sugg.id}`}
                                  rows="2"
                                  value={verificationNotes}
                                  onChange={(event) => setVerificationNotes(event.target.value)}
                                  placeholder="Contoh: Sudah dikonfirmasi langsung dengan petugas posko GOR Dimyati, ciri fisik dan pakaian sesuai."
                                />
                              </div>

                              <div className="match-actions">
                                {sugg.status === 'Menunggu verifikasi petugas' && (
                                  <>
                                    <button
                                      className="btn-action-small btn-green"
                                      onClick={() => handleVerification(sugg.id, 'Kecocokan terkonfirmasi')}
                                    >
                                      Konfirmasi Kecocokan (Posko)
                                    </button>
                                    <button
                                      className="btn-action-small btn-red"
                                      onClick={() => handleVerification(sugg.id, 'Ditolak')}
                                    >
                                      Bukan Orang yang Sama
                                    </button>
                                  </>
                                )}
                                {sugg.status === 'Kecocokan terkonfirmasi' && (
                                  <button
                                    className="btn-action-small btn-blue"
                                    onClick={() => handleVerification(sugg.id, 'Keluarga berhasil dihubungkan')}
                                  >
                                    Tandai Keluarga Berhasil Dihubungkan
                                  </button>
                                )}
                                {['Ditolak', 'Keluarga berhasil dihubungkan'].includes(sugg.status) && (
                                  <span className="status-pill status-resolved">{sugg.status}</span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      )}
    </div>
  );
}
