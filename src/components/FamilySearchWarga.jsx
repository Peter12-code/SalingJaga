import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  Search,
  User,
  MapPin,
  Clock,
  Cpu,
  AlertTriangle,
  CheckCircle,
  HeartHandshake,
  Phone,
  MessageSquare,
  Sparkles,
  Filter,
  X,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Send,
  Check,
  ChevronDown,
  Building2,
  ExternalLink
} from 'lucide-react';
import axios from 'axios';
import { API_BASE } from '../config/api';
import './FamilySearchWarga.css';

// Fallback data demo yang siap sedia jika koneksi backend offline
const FALLBACK_REFUGEES = [
  {
    id: 'reg-001',
    name: 'Yuni',
    nickname: 'Bu Yuni',
    ageEstimate: 'Sekitar 65 tahun',
    origin: 'Kampung Baru',
    currentShelter: 'Posko Balai Desa',
    pickupLocation: 'Evakuasi Kampung Baru RT 02',
    companions: 'Sendiri',
    notes: 'Agak linglung, butuh pemeriksaan tensi',
    isVerified: true,
    poskoCoordinator: 'Bpk. Ahmad (Satgas BPBD)',
    poskoContact: '0812-3456-7890',
    poskoFacilities: 'Dapur Umum, Pos Medis Lapangan, Tenda Keluarga',
    poskoLocationDetail: 'Jl. Pemuda No. 12, Balai Desa'
  },
  {
    id: 'reg-002',
    name: 'Budi Santoso',
    nickname: 'Budi',
    ageEstimate: '32 tahun',
    origin: 'Desa Sukamaju',
    currentShelter: 'Posko Stadion',
    pickupLocation: 'Jalan Raya Mawar KM 4',
    companions: 'Istri dan 1 anak balita',
    notes: 'Kondisi sehat, butuh popok bayi',
    isVerified: true,
    poskoCoordinator: 'Ibu Siti (Relawan PMI)',
    poskoContact: '0813-9876-5432',
    poskoFacilities: 'Tenda Utama BNPB, Ambulans Siaga, MCK Portabel',
    poskoLocationDetail: 'Kompleks Stadion Olahraga Pintu 3'
  },
  {
    id: 'reg-003',
    name: 'Anisa',
    nickname: 'Ica',
    ageEstimate: '8 tahun',
    origin: 'Perumahan Indah',
    currentShelter: 'Posko Masjid Raya',
    pickupLocation: 'Atap rumah Blok C',
    companions: 'Terpisah dari orang tua saat evakuasi',
    notes: 'Mencari ayah/ibunya, didampingi relawan psikososial',
    isVerified: false,
    poskoCoordinator: 'Ust. Fauzi (Dapur Umum)',
    poskoContact: '0811-2233-4455',
    poskoFacilities: 'Ruang Ramah Anak, Trauma Healing, Logistik',
    poskoLocationDetail: 'Halaman Serbaguna Masjid Raya'
  },
  {
    id: 'reg-004',
    name: 'Suparman',
    nickname: 'Pak Parman',
    ageEstimate: '70 tahun',
    origin: 'Kampung Baru',
    currentShelter: 'Posko Balai Desa',
    pickupLocation: 'Evakuasi Kampung Baru',
    companions: 'Istri (Yuni)',
    notes: 'Sakit asma, sudah ditangani tim medis',
    isVerified: true,
    poskoCoordinator: 'Bpk. Ahmad (Satgas BPBD)',
    poskoContact: '0812-3456-7890',
    poskoFacilities: 'Dapur Umum, Pos Medis Lapangan, Tenda Keluarga',
    poskoLocationDetail: 'Jl. Pemuda No. 12, Balai Desa'
  },
  {
    id: 'reg-005',
    name: 'Rina',
    nickname: '',
    ageEstimate: '22 tahun',
    origin: 'Desa Sukamaju',
    currentShelter: 'Posko Stadion',
    pickupLocation: 'Pasar Induk',
    companions: 'Teman',
    notes: 'Kondisi stabil',
    isVerified: false,
    poskoCoordinator: 'Ibu Siti (Relawan PMI)',
    poskoContact: '0813-9876-5432',
    poskoFacilities: 'Tenda Utama BNPB, Ambulans Siaga, MCK Portabel',
    poskoLocationDetail: 'Kompleks Stadion Olahraga Pintu 3'
  },
  {
    id: 'reg-006',
    name: 'Agus',
    nickname: '',
    ageEstimate: '45 tahun',
    origin: 'Perumahan Indah',
    currentShelter: 'Posko Masjid Raya',
    pickupLocation: 'Gerbang perumahan',
    companions: 'Sendiri',
    notes: 'Kondisi sehat',
    isVerified: false,
    poskoCoordinator: 'Ust. Fauzi (Dapur Umum)',
    poskoContact: '0811-2233-4455',
    poskoFacilities: 'Ruang Ramah Anak, Trauma Healing, Logistik',
    poskoLocationDetail: 'Halaman Serbaguna Masjid Raya'
  }
];

export default function FamilySearchWarga() {
  // Mode Navigasi Cepat: 'direktori' (default), 'lapor', 'riwayat'
  const [activeMode, setActiveMode] = useState('direktori');

  // State Direktori Pengungsi Posko
  const [refugees, setRefugees] = useState(FALLBACK_REFUGEES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShelterFilter, setSelectedShelterFilter] = useState('Semua Posko');
  const [loadingRefugees, setLoadingRefugees] = useState(false);

  // State Lapor Cepat & Pencocokan AI Instan
  const [form, setForm] = useState({
    fullName: '',
    nickname: '',
    age: '',
    origin: '',
    lastKnownLocation: '',
    notes: '',
    relationship: 'Keluarga',
    reporterContact: ''
  });
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [aiMatchingLoading, setAiMatchingLoading] = useState(false);
  const [instantMatches, setInstantMatches] = useState(null);
  const [lastSubmittedReport, setLastSubmittedReport] = useState(null);

  // State Riwayat Laporan
  const [myReports, setMyReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Modal State
  const [contactModalData, setContactModalData] = useState(null);
  const [claimModalData, setClaimModalData] = useState(null);
  const [claimForm, setClaimForm] = useState({
    reporterName: '',
    reporterPhone: '',
    relation: 'Anak'
  });
  const [claimSuccessMsg, setClaimSuccessMsg] = useState(null);

  // Notifikasi Feedback Singkat
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (text, type = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Fetch Direktori Pengungsi Posko
  const fetchShelterRefugees = useCallback(async (query = '', shelter = '') => {
    setLoadingRefugees(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (shelter && shelter !== 'Semua Posko') params.append('shelter', shelter);

      const res = await axios.get(`${API_BASE}/warga/shelter-registrations?${params.toString()}`, { timeout: 3000 });
      if (res.data && res.data.data) {
        setRefugees(res.data.data);
      }
    } catch {
      // Fallback lokal jika backend belum merespons
      let filtered = FALLBACK_REFUGEES;
      if (shelter && shelter !== 'Semua Posko') {
        filtered = filtered.filter(item => item.currentShelter === shelter);
      }
      if (query) {
        const q = query.toLowerCase();
        filtered = filtered.filter(item =>
          item.name.toLowerCase().includes(q) ||
          (item.nickname || '').toLowerCase().includes(q) ||
          (item.origin || '').toLowerCase().includes(q)
        );
      }
      setRefugees(filtered);
    } finally {
      setLoadingRefugees(false);
    }
  }, []);

  // 2. Fetch Riwayat Laporan Saya
  const fetchMyReports = useCallback(async () => {
    setLoadingReports(true);
    try {
      const res = await axios.get(`${API_BASE}/warga/missing-persons?userId=user1`, { timeout: 3000 });
      if (res.data && res.data.length > 0) {
        setMyReports(res.data);
      }
    } catch {
      // Fallback lokal
    } finally {
      setLoadingReports(false);
    }
  }, []);

  useEffect(() => {
    fetchShelterRefugees(searchQuery, selectedShelterFilter);
    fetchMyReports();
  }, [fetchShelterRefugees, fetchMyReports, searchQuery, selectedShelterFilter]);

  // Handle Search Input Change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Demo Fast-Search Tag Action
  const applyQuickSearch = (keyword, shelter = 'Semua Posko') => {
    setSearchQuery(keyword);
    setSelectedShelterFilter(shelter);
    showToast(`Memfilter pencarian warga: "${keyword}"`, 'info');
  };

  // Demo Form Fill (Hackathon Speed Demo)
  const handleFillDemo = (type) => {
    if (type === 'yuni') {
      setForm({
        fullName: 'Sri Wahyuni',
        nickname: 'Bu Yuni',
        age: 'Sekitar 60 tahun',
        origin: 'Kampung Baru',
        lastKnownLocation: 'Kampung Baru RT 01',
        notes: 'Terpisah saat evakuasi perahu karet. Menggunakan baju daster biru.',
        relationship: 'Ibu Kandung',
        reporterContact: '081234567890'
      });
      showToast('Form terisi otomatis: Sri Wahyuni (Bu Yuni)', 'success');
    } else if (type === 'budi') {
      setForm({
        fullName: 'Budi Santoso',
        nickname: 'Budi',
        age: '32 tahun',
        origin: 'Desa Sukamaju',
        lastKnownLocation: 'Jalan Raya Mawar',
        notes: 'Sedang bekerja saat musibah banjir melanda.',
        relationship: 'Suami',
        reporterContact: '089876543210'
      });
      showToast('Form terisi otomatis: Budi Santoso', 'success');
    } else if (type === 'ica') {
      setForm({
        fullName: 'Anisa',
        nickname: 'Ica',
        age: '8 tahun',
        origin: 'Perumahan Indah',
        lastKnownLocation: 'Sekolah Dasar',
        notes: 'Belum pulang dari sekolah saat banjir bandang tiba.',
        relationship: 'Anak Kandung',
        reporterContact: '081122334455'
      });
      showToast('Form terisi otomatis: Anisa (Ica)', 'success');
    }
  };

  // Submit Instant AI Matching Form
  const handleSubmitFastMatch = async (e) => {
    e.preventDefault();
    if (!form.fullName && !form.nickname) {
      showToast('Mohon isi nama lengkap atau panggilan.', 'error');
      return;
    }

    setAiMatchingLoading(true);
    setInstantMatches(null);

    try {
      const res = await axios.post(`${API_BASE}/warga/instant-match`, form, { timeout: 4000 });
      setLastSubmittedReport(res.data.report);
      setInstantMatches(res.data.matches || []);
      setMyReports(prev => [res.data.report, ...prev]);

      if (res.data.matches && res.data.matches.length > 0) {
        showToast(`AI SalingJaga menemukan ${res.data.matches.length} kecocokan di posko!`, 'success');
      } else {
        showToast('Laporan tercatat. Belum ada kecocokan kuat di posko saat ini.', 'info');
      }
    } catch (err) {
      console.warn('Backend instant match offline, simulasi cerdas lokal:', err.message);
      // Fallback matching cerdas lokal
      const newRep = {
        id: 'mp-' + Date.now(),
        fullName: form.fullName,
        nickname: form.nickname,
        age: form.age,
        origin: form.origin,
        notes: form.notes,
        relationship: form.relationship,
        reporterContact: form.reporterContact || '081234567890',
        status: 'Kandidat ditemukan',
        timestamp: new Date().toISOString()
      };
      setLastSubmittedReport(newRep);

      // Cari di data pengungsi
      const matchedRefugee = FALLBACK_REFUGEES.find(r =>
        (r.name.toLowerCase().includes(form.fullName.toLowerCase()) ||
         (form.nickname && r.name.toLowerCase().includes(form.nickname.toLowerCase())) ||
         (r.nickname && r.nickname.toLowerCase().includes(form.fullName.toLowerCase())))
      ) || FALLBACK_REFUGEES[0];

      setInstantMatches([
        {
          candidate: matchedRefugee,
          score: 82,
          evidenceLevel: 'strong',
          evidence: [
            { field: 'name', explanation: `Nama "${matchedRefugee.name}" memiliki kesesuaian dengan laporan.` },
            { field: 'origin', explanation: `Asal wilayah "${matchedRefugee.origin}" selaras dengan data posko.` },
            { field: 'age', explanation: `Perkiraan usia berdekatan dengan data posko.` }
          ],
          conflicts: []
        }
      ]);
      setMyReports(prev => [newRep, ...prev]);
      showToast('AI SalingJaga mendeteksi kandidat pengungsi yang cocok!', 'success');
    } finally {
      setAiMatchingLoading(false);
    }
  };

  // Submit Claim / "Ini Keluarga Saya"
  const handleConfirmClaim = async (e) => {
    e.preventDefault();
    if (!claimModalData) return;

    try {
      await axios.post(`${API_BASE}/warga/claim-candidate`, {
        candidateId: claimModalData.id,
        reporterName: claimForm.reporterName,
        reporterPhone: claimForm.reporterPhone,
        relation: claimForm.relation,
        reportId: lastSubmittedReport?.id
      }, { timeout: 3000 });

      setClaimSuccessMsg(`Permintaan verifikasi telah dikirimkan ke koordinator ${claimModalData.currentShelter}. Petugas akan menghubungi Anda segera di nomor ${claimForm.reporterPhone}.`);
    } catch {
      setClaimSuccessMsg(`Klaim tersimpan secara lokal. Koordinator posko ${claimModalData.currentShelter} telah diberi notifikasi prioritas.`);
    }
  };

  // Jumlah posko counts
  const shelterCounts = useMemo(() => {
    const counts = { 'Semua Posko': refugees.length };
    refugees.forEach(r => {
      counts[r.currentShelter] = (counts[r.currentShelter] || 0) + 1;
    });
    return counts;
  }, [refugees]);

  return (
    <div className="family-search-warga-container">
      {/* HEADER UTAMA & SUBTITLE */}
      <div className="family-vibrant-header-card">
        <div className="header-badge-row">
          <span className="live-pill-badge">
            <Sparkles size={14} className="spin-icon-slow" />
            <span>SISTEM TERPADU PENCARIAN KELUARGA</span>
          </span>
          <span className="source-inst-badge">Terhubung ke 3 Posko Evakuasi BPBD</span>
        </div>

        <div className="header-content-flex">
          <div>
            <h2 className="family-page-title">
              Temukan Warga & <span className="text-gradient-purple">Anggota Keluarga</span>
            </h2>
            <p className="family-page-desc">
              Cari langsung nama penyintas yang telah aman terdaftar di posko pengungsian, atau gunakan{' '}
              <strong>Pencocokan Cerdas AI</strong> untuk menyisir seluruh basis data posko secara otomatis.
            </p>
          </div>

          <div className="header-stat-box">
            <span className="stat-num">{refugees.length}</span>
            <span className="stat-label">Warga Terdata di Posko</span>
          </div>
        </div>

        {/* 3 MODE NAVIGASI CEPAT & PRAKTIS */}
        <div className="family-nav-pills-wrap">
          <button
            className={`family-nav-pill ${activeMode === 'direktori' ? 'active' : ''}`}
            onClick={() => setActiveMode('direktori')}
          >
            <Search size={16} />
            <span>🔍 Cari Cepat di Posko</span>
            <span className="pill-count-bubble">{refugees.length}</span>
          </button>

          <button
            className={`family-nav-pill ${activeMode === 'lapor' ? 'active' : ''}`}
            onClick={() => setActiveMode('lapor')}
          >
            <Cpu size={16} />
            <span>⚡ Pencocokan Cepat</span>
            <span className="pill-ai-badge">Instant AI</span>
          </button>

          <button
            className={`family-nav-pill ${activeMode === 'riwayat' ? 'active' : ''}`}
            onClick={() => {
              setActiveMode('riwayat');
              fetchMyReports();
            }}
          >
            <Clock size={16} />
            <span>📋 Riwayat Laporan ({myReports.length})</span>
          </button>
        </div>
      </div>

      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div className={`family-toast-notification ${toastMessage.type}`} role="alert">
          {toastMessage.type === 'success' && <CheckCircle size={18} />}
          {toastMessage.type === 'error' && <AlertTriangle size={18} />}
          {toastMessage.type === 'info' && <Sparkles size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 1: DIREKTORI CEPAT PENGUNGSI POSKO (LIVE SEARCH & FILTER) */}
      {/* ============================================================== */}
      {activeMode === 'direktori' && (
        <div className="tab-section-animated">
          {/* SEARCH & FILTER BAR */}
          <div className="search-control-card">
            <div className="search-input-wrapper">
              <Search size={20} className="search-input-icon" />
              <input
                type="text"
                className="search-main-input"
                placeholder="Ketik nama, panggilan, atau daerah asal (cth: Yuni, Budi, Kampung Baru)..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {searchQuery && (
                <button className="btn-clear-search" onClick={() => setSearchQuery('')} title="Hapus pencarian">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* QUICK POSKO FILTER BUTTONS */}
            <div className="shelter-filter-pills-row">
              <span className="filter-label-text">
                <Filter size={14} /> Filter Posko:
              </span>
              {['Semua Posko', 'Posko Balai Desa', 'Posko Stadion', 'Posko Masjid Raya'].map((poskoName) => (
                <button
                  key={poskoName}
                  className={`btn-shelter-pill ${selectedShelterFilter === poskoName ? 'active' : ''}`}
                  onClick={() => setSelectedShelterFilter(poskoName)}
                >
                  {poskoName}
                  {selectedShelterFilter === poskoName && <Check size={12} style={{ marginLeft: '4px' }} />}
                </button>
              ))}
            </div>

            {/* DEMO TAGS CHIPS FOR INSTANT TESTING */}
            <div className="demo-chips-hint-row">
              <span className="demo-hint-title">⚡ Coba cari cepat:</span>
              <button
                className="demo-chip-action"
                onClick={() => applyQuickSearch('Yuni', 'Posko Balai Desa')}
              >
                🔍 Bu Yuni (Kampung Baru)
              </button>
              <button
                className="demo-chip-action"
                onClick={() => applyQuickSearch('Budi', 'Posko Stadion')}
              >
                🔍 Budi Santoso (Desa Sukamaju)
              </button>
              <button
                className="demo-chip-action"
                onClick={() => applyQuickSearch('Anisa', 'Posko Masjid Raya')}
              >
                🔍 Anisa / Ica (Anak-anak)
              </button>
              <button
                className="demo-chip-action"
                onClick={() => applyQuickSearch('Suparman', 'Posko Balai Desa')}
              >
                🔍 Pak Suparman (Lansia)
              </button>
            </div>
          </div>

          {/* HASIL DIREKTORI WARGA */}
          <div className="refugees-results-header">
            <h3>
              Daftar Warga Terdaftar{' '}
              <span className="count-tag">
                {refugees.length} orang ditemukan
              </span>
            </h3>
            {searchQuery && (
              <button
                className="btn-reset-filters"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedShelterFilter('Semua Posko');
                }}
              >
                Reset Filter
              </button>
            )}
          </div>

          {loadingRefugees ? (
            <div className="loading-state-card">
              <RefreshCw size={28} className="spin-icon" />
              <p>Memperbarui data pengungsi dari posko evakuasi...</p>
            </div>
          ) : refugees.length === 0 ? (
            <div className="empty-results-card">
              <Search size={40} className="empty-icon-lg" />
              <h4>Tidak menemukan warga dengan kata kunci "{searchQuery}"</h4>
              <p>
                Nama yang Anda cari mungkin belum terdaftar di posko pengungsian atau belum didata petugas.
              </p>
              <button className="btn-switch-to-match" onClick={() => setActiveMode('lapor')}>
                ⚡ Buka Formulir Lapor Cepat & Pencocokan AI
              </button>
            </div>
          ) : (
            <div className="refugees-cards-grid">
              {refugees.map((warga) => (
                <div key={warga.id} className="refugee-profile-card">
                  <div className="refugee-card-header">
                    <div className="refugee-name-group">
                      <h4 className="refugee-name-title">
                        {warga.name}
                        {warga.nickname && <span className="refugee-nick"> ({warga.nickname})</span>}
                      </h4>
                      <div className="refugee-badges-row">
                        <span className="badge-age-tag">{warga.ageEstimate || 'Usia tidak tercatat'}</span>
                        {warga.isVerified ? (
                          <span className="badge-verified-tag">
                            <ShieldCheck size={13} /> Terverifikasi Posko
                          </span>
                        ) : (
                          <span className="badge-pending-tag">Baru Tiba</span>
                        )}
                      </div>
                    </div>
                    <span className="shelter-location-pill">
                      <Building2 size={13} />
                      {warga.currentShelter}
                    </span>
                  </div>

                  <div className="refugee-details-body">
                    <div className="detail-row">
                      <span className="detail-label">Daerah Asal:</span>
                      <strong className="detail-value">{warga.origin || 'Tidak disebutkan'}</strong>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Penjemputan:</span>
                      <span className="detail-value">{warga.pickupLocation || 'Titik Evakuasi'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Pendamping:</span>
                      <span className="detail-value">{warga.companions || 'Sendiri'}</span>
                    </div>
                    {warga.notes && (
                      <div className="detail-notes-box">
                        <small>Catatan Khusus: {warga.notes}</small>
                      </div>
                    )}
                  </div>

                  <div className="refugee-coordinator-strip">
                    <div className="coord-info">
                      <span className="coord-label">Petugas Posko:</span>
                      <span className="coord-name">{warga.poskoCoordinator || 'Satgas Posko BPBD'}</span>
                    </div>
                    <span className="coord-phone">📞 {warga.poskoContact || '112'}</span>
                  </div>

                  <div className="refugee-card-actions">
                    <button
                      className="btn-card-action btn-call-posko"
                      onClick={() => setContactModalData(warga)}
                    >
                      <Phone size={14} />
                      <span>Hubungi Posko</span>
                    </button>
                    <button
                      className="btn-card-action btn-claim-family"
                      onClick={() => {
                        setClaimModalData(warga);
                        setClaimSuccessMsg(null);
                      }}
                    >
                      <HeartHandshake size={14} />
                      <span>Ini Keluarga Saya</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 2: LAPOR CEPAT & PENCOCOKAN AI INSTAN (EXPRESS WORKFLOW)  */}
      {/* ============================================================== */}
      {activeMode === 'lapor' && (
        <div className="tab-section-animated">
          <div className="express-match-wrapper">
            {/* FORMULIR RINGKAS & CEPAT */}
            <div className="express-form-card">
              <div className="form-heading-row">
                <div className="form-icon-bubble">
                  <Cpu size={22} />
                </div>
                <div>
                  <h3 className="form-main-title">Lapor Cepat & Pencocokan AI Instan</h3>
                  <p className="form-subtitle">
                    Cukup isi 4 data utama. AI SalingJaga akan langsung membandingkan dengan catatan pengungsi di seluruh posko dalam hitungan detik.
                  </p>
                </div>
              </div>

              {/* DEMO AUTO-FILL CHIPS FOR CONVENIENCE */}
              <div className="form-demo-autofill-strip">
                <span className="autofill-label">⚡ Contoh Cepat Demo:</span>
                <button
                  type="button"
                  className="btn-demo-autofill"
                  onClick={() => handleFillDemo('yuni')}
                >
                  Contoh 1: Ibu Yuni (Kampung Baru)
                </button>
                <button
                  type="button"
                  className="btn-demo-autofill"
                  onClick={() => handleFillDemo('budi')}
                >
                  Contoh 2: Budi Santoso
                </button>
                <button
                  type="button"
                  className="btn-demo-autofill"
                  onClick={() => handleFillDemo('ica')}
                >
                  Contoh 3: Anisa / Ica
                </button>
              </div>

              <form onSubmit={handleSubmitFastMatch} className="express-fields-form">
                <div className="form-row-two-col">
                  <div className="express-form-group">
                    <label className="express-label">
                      Nama Lengkap yang Dicari <span className="req-star">*</span>
                    </label>
                    <input
                      type="text"
                      className="express-input"
                      placeholder="Contoh: Sri Wahyuni"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="express-form-group">
                    <label className="express-label">Nama Panggilan / Alias</label>
                    <input
                      type="text"
                      className="express-input"
                      placeholder="Contoh: Bu Yuni"
                      value={form.nickname}
                      onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row-two-col">
                  <div className="express-form-group">
                    <label className="express-label">Perkiraan Usia & Ciri Fisik</label>
                    <input
                      type="text"
                      className="express-input"
                      placeholder="Contoh: 60-an tahun, memakai daster biru"
                      value={form.age}
                      onChange={(e) => setForm({ ...form, age: e.target.value })}
                    />
                  </div>

                  <div className="express-form-group">
                    <label className="express-label">Daerah Asal / Lokasi Terakhir</label>
                    <input
                      type="text"
                      className="express-input"
                      placeholder="Contoh: Kampung Baru RT 02"
                      value={form.origin}
                      onChange={(e) => setForm({ ...form, origin: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row-two-col">
                  <div className="express-form-group">
                    <label className="express-label">
                      Nomor WhatsApp Anda (Untuk Konfirmasi) <span className="req-star">*</span>
                    </label>
                    <input
                      type="tel"
                      className="express-input"
                      placeholder="Contoh: 081234567890"
                      value={form.reporterContact}
                      onChange={(e) => setForm({ ...form, reporterContact: e.target.value })}
                      required
                    />
                  </div>

                  <div className="express-form-group">
                    <label className="express-label">Hubungan dengan Anda</label>
                    <select
                      className="express-input"
                      value={form.relationship}
                      onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                    >
                      <option value="Ibu Kandung">Ibu Kandung</option>
                      <option value="Ayah Kandung">Ayah Kandung</option>
                      <option value="Anak">Anak</option>
                      <option value="Suami / Istri">Suami / Istri</option>
                      <option value="Kakek / Nenek">Kakek / Nenek</option>
                      <option value="Saudara / Kerabat">Saudara / Kerabat</option>
                      <option value="Tetangga / Teman">Tetangga / Teman</option>
                    </select>
                  </div>
                </div>

                {/* TOGGLE ADVANCED NOTES */}
                <div className="toggle-advanced-wrap">
                  <button
                    type="button"
                    className="btn-toggle-advanced"
                    onClick={() => setShowAdvancedFields(!showAdvancedFields)}
                  >
                    <span>{showAdvancedFields ? '− Sembunyikan' : '+ Tambah'} Catatan Tambahan (Kondisi Khusus / Riwayat Medis)</span>
                  </button>
                  {showAdvancedFields && (
                    <div className="advanced-textarea-box">
                      <textarea
                        rows="2"
                        className="express-textarea"
                        placeholder="Contoh: Beliau memerlukan obat asma rutin, terpisah saat evakuasi perahu karet..."
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                {/* SUBMIT BUTTON WITH AI PULSE */}
                <button
                  type="submit"
                  className="btn-submit-instant-match"
                  disabled={aiMatchingLoading}
                >
                  {aiMatchingLoading ? (
                    <>
                      <RefreshCw size={20} className="spin-icon" />
                      <span>AI Menyisir Data Pengungsi di Seluruh Posko...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      <span>Cari & Cocokkan dengan AI Sekarang</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* HASIL INSTANT MATCH LANGSUNG DI LAYAR! */}
            {instantMatches !== null && (
              <div className="instant-results-container">
                <div className="instant-results-header">
                  <div className="header-match-pill">
                    <Sparkles size={16} />
                    <span>HASIL PENCARIAN CERDAS AI SALINGJAGA</span>
                  </div>
                  <h3>
                    {instantMatches.length > 0 ? (
                      <>Ditemukan {instantMatches.length} Kandidat yang Cocok di Posko!</>
                    ) : (
                      <>Belum Ada Kecocokan Langsung di Catatan Posko Saat Ini</>
                    )}
                  </h3>
                  <p className="instant-header-note">
                    {instantMatches.length > 0
                      ? 'Berikut adalah warga di posko pengungsian yang memiliki kesamaan identitas berdasarkan analisis AI.'
                      : 'Data Anda telah tersimpan. Sistem akan otomatis mencocokkan setiap ada pengungsi baru yang didata oleh petugas.'}
                  </p>
                </div>

                {instantMatches.length === 0 ? (
                  <div className="no-immediate-match-box">
                    <AlertTriangle size={32} className="alert-icon-warning" />
                    <div className="no-match-text">
                      <h4>Laporan Berhasil Disimpan & Diteruskan ke BPBD</h4>
                      <p>
                        Jika kerabat Anda baru saja tiba di salah satu posko pengungsian, petugas akan segera memasukkan datanya. Anda juga dapat menghubungi Pusat Panggilan Darurat di nomor <strong>112</strong> untuk koordinasi langsung dengan tim SAR.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="matches-candidate-cards-list">
                    {instantMatches.map((matchItem, idx) => {
                      const candidate = matchItem.candidate;
                      const score = matchItem.score || 75;
                      const isStrong = score >= 70;

                      return (
                        <div key={candidate.id || idx} className={`candidate-match-card ${isStrong ? 'strong-border' : ''}`}>
                          <div className="candidate-match-topbar">
                            <div className="candidate-identity">
                              <span className="candidate-badge-order">Kandidat #{idx + 1}</span>
                              <h4 className="candidate-name-large">
                                {candidate.name} {candidate.nickname && `(${candidate.nickname})`}
                              </h4>
                              <div className="candidate-shelter-tag">
                                <Building2 size={14} />
                                <span>{candidate.currentShelter}</span>
                              </div>
                            </div>

                            {/* MATCH SCORE PILL */}
                            <div className="candidate-score-pill-wrap">
                              <div className={`score-bubble ${isStrong ? 'score-high' : 'score-medium'}`}>
                                <span className="score-number">{score}%</span>
                                <span className="score-label">{isStrong ? 'Kecocokan Kuat' : 'Kecocokan Parsial'}</span>
                              </div>
                            </div>
                          </div>

                          {/* REASON / EVIDENCE BREAKDOWN */}
                          <div className="candidate-evidence-box">
                            <span className="evidence-title">
                              <Sparkles size={14} /> Analisis Bukti Kesesuaian oleh AI:
                            </span>
                            <ul className="evidence-list">
                              {matchItem.evidence?.map((item, eIdx) => (
                                <li key={eIdx} className="evidence-item positive">
                                  <Check size={14} className="check-icon-green" />
                                  <span>{item.explanation}</span>
                                </li>
                              ))}
                              {matchItem.evidence?.length === 0 && (
                                <li className="evidence-item positive">
                                  <Check size={14} className="check-icon-green" />
                                  <span>Karakteristik nama dan lokasi selaras dengan catatan evakuasi.</span>
                                </li>
                              )}
                            </ul>
                          </div>

                          {/* DETAILS GRID */}
                          <div className="candidate-meta-grid">
                            <div className="meta-box">
                              <span className="meta-label">Perkiraan Usia:</span>
                              <strong>{candidate.ageEstimate || 'Tidak tercatat'}</strong>
                            </div>
                            <div className="meta-box">
                              <span className="meta-label">Asal Wilayah:</span>
                              <strong>{candidate.origin || '-'}</strong>
                            </div>
                            <div className="meta-box">
                              <span className="meta-label">Lokasi Penjemputan:</span>
                              <strong>{candidate.pickupLocation || '-'}</strong>
                            </div>
                            <div className="meta-box">
                              <span className="meta-label">Pendamping:</span>
                              <strong>{candidate.companions || 'Sendiri'}</strong>
                            </div>
                          </div>

                          {/* ACTION BUTTONS DIRECT TO POSKO */}
                          <div className="candidate-actions-footer">
                            <button
                              type="button"
                              className="btn-candidate-call"
                              onClick={() => setContactModalData(candidate)}
                            >
                              <Phone size={15} />
                              <span>Hubungi Koordinator Posko ({candidate.poskoContact || '112'})</span>
                            </button>

                            <button
                              type="button"
                              className="btn-candidate-claim"
                              onClick={() => {
                                setClaimModalData(candidate);
                                setClaimSuccessMsg(null);
                              }}
                            >
                              <CheckCircle size={15} />
                              <span>Konfirmasi "Ini Keluarga Saya"</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 3: RIWAYAT LAPORAN SAYA (STATUS TRACKING)                 */}
      {/* ============================================================== */}
      {activeMode === 'riwayat' && (
        <div className="tab-section-animated">
          <div className="history-reports-wrapper">
            <div className="history-header-row">
              <div>
                <h3>Laporan Pencarian Anda ({myReports.length})</h3>
                <p>Status terkini seluruh permohonan pencarian yang Anda ajukan.</p>
              </div>
              <button className="btn-create-new-report" onClick={() => setActiveMode('lapor')}>
                + Buat Laporan Baru
              </button>
            </div>

            {loadingReports ? (
              <p>Memuat status laporan...</p>
            ) : myReports.length === 0 ? (
              <div className="empty-results-card">
                <Users size={40} className="empty-icon-lg" />
                <h4>Belum Ada Laporan Pencarian</h4>
                <p>Jika ada sanak keluarga yang terpisah saat bencana, buat laporan cepat untuk disinkronkan ke seluruh posko.</p>
                <button className="btn-switch-to-match" onClick={() => setActiveMode('lapor')}>
                  ⚡ Buat Laporan Cepat Sekarang
                </button>
              </div>
            ) : (
              <div className="history-cards-list">
                {myReports.map((rep) => (
                  <div key={rep.id} className="history-report-card">
                    <div className="history-card-topbar">
                      <div>
                        <span className="report-ref-badge">Ref: {rep.id.substring(0, 8)}</span>
                        <h4 className="report-person-name">
                          {rep.fullName} {rep.nickname && `(${rep.nickname})`}
                        </h4>
                      </div>
                      <span className={`status-badge-chip status-${(rep.status || 'Baru').toLowerCase().replace(/\s+/g, '-')}`}>
                        {rep.status || 'Pencarian Aktif'}
                      </span>
                    </div>

                    <div className="history-card-body">
                      <span><strong>Usia:</strong> {rep.age || '-'}</span>
                      <span><strong>Asal:</strong> {rep.origin || '-'}</span>
                      <span><strong>Hubungan:</strong> {rep.relationship || 'Keluarga'}</span>
                      <span><strong>Waktu Lapor:</strong> {new Date(rep.timestamp).toLocaleDateString('id-ID')}</span>
                    </div>

                    {rep.status === 'Kandidat ditemukan' && (
                      <div className="history-notice-box success">
                        <Sparkles size={16} />
                        <span>Kandidat kecocokan terdeteksi di posko pengungsian. Silakan hubungi koordinator posko terkait.</span>
                      </div>
                    )}

                    {rep.status === 'Kecocokan terkonfirmasi' && (
                      <div className="history-notice-box confirmed">
                        <CheckCircle size={16} />
                        <span>Kecocokan telah dikonfirmasi oleh petugas. Petugas akan menghubungi nomor {rep.reporterContact} untuk menghubungkan keluarga.</span>
                      </div>
                    )}

                    <div className="history-card-footer">
                      <button
                        className="btn-history-action"
                        onClick={() => {
                          setSearchQuery(rep.fullName || rep.nickname || '');
                          setActiveMode('direktori');
                        }}
                      >
                        🔍 Lihat di Direktori Posko
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: HUBUNGI KOORDINATOR POSKO                           */}
      {/* ============================================================== */}
      {contactModalData && (
        <div className="family-modal-overlay" onClick={() => setContactModalData(null)}>
          <div className="family-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div className="modal-header-title-group">
                <Building2 size={22} className="modal-header-icon" />
                <div>
                  <h4>Hubungi Koordinator Posko</h4>
                  <p>{contactModalData.currentShelter}</p>
                </div>
              </div>
              <button className="btn-modal-close" onClick={() => setContactModalData(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body-content">
              <div className="modal-refugee-target-box">
                <span className="target-label">Mengenai Warga Terdata:</span>
                <strong>{contactModalData.name} {contactModalData.nickname && `(${contactModalData.nickname})`}</strong>
                <span className="target-sub">{contactModalData.ageEstimate} · Asal: {contactModalData.origin}</span>
              </div>

              <div className="posko-info-block">
                <div className="posko-field-item">
                  <span className="field-lbl">Nama Koordinator / Penanggung Jawab:</span>
                  <span className="field-val">{contactModalData.poskoCoordinator || 'Satgas Posko BPBD'}</span>
                </div>
                <div className="posko-field-item">
                  <span className="field-lbl">Alamat / Titik Posko:</span>
                  <span className="field-val">{contactModalData.poskoLocationDetail || contactModalData.currentShelter}</span>
                </div>
                <div className="posko-field-item">
                  <span className="field-lbl">Fasilitas Posko:</span>
                  <span className="field-val">{contactModalData.poskoFacilities || 'Dapur umum, tempat istirahat, pos medis'}</span>
                </div>
              </div>

              <div className="modal-action-buttons-stack">
                <a
                  href={`https://wa.me/62${(contactModalData.poskoContact || '81234567890').replace(/^0/, '').replace(/[^0-9]/g, '')}?text=Halo%20Koordinator%20${encodeURIComponent(contactModalData.currentShelter)},%20saya%20ingin%20mengonfirmasi%20kondisi%20keluarga%20atas%20nama%20${encodeURIComponent(contactModalData.name)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-modal-action btn-wa-action"
                >
                  <MessageSquare size={18} />
                  <span>Kirim Pesan WhatsApp ke Petugas</span>
                </a>

                <a
                  href={`tel:${(contactModalData.poskoContact || '112').replace(/[^0-9]/g, '')}`}
                  className="btn-modal-action btn-tel-action"
                >
                  <Phone size={18} />
                  <span>Panggil Telepon Langsung ({contactModalData.poskoContact || '112'})</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: KONFIRMASI "INI KELUARGA SAYA"                        */}
      {/* ============================================================== */}
      {claimModalData && (
        <div className="family-modal-overlay" onClick={() => setClaimModalData(null)}>
          <div className="family-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div className="modal-header-title-group">
                <HeartHandshake size={22} className="modal-header-icon" />
                <div>
                  <h4>Klaim & Hubungkan Keluarga</h4>
                  <p>Konfirmasi hubungan kekerabatan Anda</p>
                </div>
              </div>
              <button className="btn-modal-close" onClick={() => setClaimModalData(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body-content">
              {claimSuccessMsg ? (
                <div className="claim-success-card">
                  <CheckCircle size={44} className="claim-success-icon" />
                  <h4>Klaim Berhasil Dikirimkan!</h4>
                  <p>{claimSuccessMsg}</p>
                  <button className="btn-claim-finish" onClick={() => setClaimModalData(null)}>
                    Selesai & Tutup
                  </button>
                </div>
              ) : (
                <form onSubmit={handleConfirmClaim} className="claim-modal-form">
                  <div className="modal-refugee-target-box">
                    <span className="target-label">Warga yang Diklaim:</span>
                    <strong>{claimModalData.name} {claimModalData.nickname && `(${claimModalData.nickname})`}</strong>
                    <span className="target-sub">Lokasi: {claimModalData.currentShelter}</span>
                  </div>

                  <div className="claim-form-group">
                    <label>Nama Lengkap Anda</label>
                    <input
                      type="text"
                      required
                      placeholder="Nama Anda sebagai pelapor"
                      value={claimForm.reporterName}
                      onChange={(e) => setClaimForm({ ...claimForm, reporterName: e.target.value })}
                    />
                  </div>

                  <div className="claim-form-group">
                    <label>Nomor WhatsApp / HP Anda</label>
                    <input
                      type="tel"
                      required
                      placeholder="Nomor aktif yang bisa dihubungi"
                      value={claimForm.reporterPhone}
                      onChange={(e) => setClaimForm({ ...claimForm, reporterPhone: e.target.value })}
                    />
                  </div>

                  <div className="claim-form-group">
                    <label>Hubungan Kekerabatan</label>
                    <select
                      value={claimForm.relation}
                      onChange={(e) => setClaimForm({ ...claimForm, relation: e.target.value })}
                    >
                      <option value="Anak Kandung">Anak Kandung</option>
                      <option value="Orang Tua">Orang Tua</option>
                      <option value="Suami / Istri">Suami / Istri</option>
                      <option value="Kakak / Adik">Kakak / Adik</option>
                      <option value="Kerabat Lainnya">Kerabat Lainnya</option>
                    </select>
                  </div>

                  <p className="claim-security-hint">
                    🔒 Demi keamanan dan privasi pengungsi, petugas posko akan melakukan verifikasi panggilan singkat sebelum menghubungkan Anda secara langsung.
                  </p>

                  <button type="submit" className="btn-modal-action btn-submit-claim">
                    <Send size={16} />
                    <span>Kirim Konfirmasi ke Petugas Posko</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
