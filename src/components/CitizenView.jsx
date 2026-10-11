import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Home,
  Map as MapIcon,
  ClipboardList,
  Package,
  Search,
  Phone,
  AlertTriangle,
  Radio,
  ShieldCheck,
  CheckCircle2,
  Users,
  MapPin,
  Sparkles,
  HeartHandshake,
  ThumbsUp,
  ThumbsDown,
  Activity,
  Layers,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertOctagon,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import DisasterMap from './DisasterMap'
import FamilySearchWarga from './FamilySearchWarga'
import BMKGLiveWidget from './BMKGLiveWidget'
import SaksiVerifikasiModal from './SaksiVerifikasiModal'
import './CitizenView.css'

export default function CitizenView() {
  const {
    setShowForm,
    poskoList,
    laporan,
    logistikList,
    setDonationModalOpen,
    setDonationTargetItem,
    citizenTab: activeTab,
    setCitizenTab: setActiveTab,
    setSelectedId,
    showNotif,
    validasiKomunitas,
  } = useApp()

  const [selectedCategory, setSelectedCategory] = useState('semua')
  const [votedReports, setVotedReports] = useState(() => {
    try {
      const saved = {}
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith('voted_report_')) {
          const reportId = k.replace('voted_report_', '')
          saved[reportId] = localStorage.getItem(k)
        }
      }
      return saved
    } catch {
      return {}
    }
  })

  // Modal Verifikasi Saksi & Anti-Hoaks
  const [isWitnessModalOpen, setIsWitnessModalOpen] = useState(false)
  const [witnessModalReport, setWitnessModalReport] = useState(null)
  const [witnessModalMode, setWitnessModalMode] = useState('saksi')

  const openWitnessModal = (item, mode = 'saksi') => {
    setWitnessModalReport(item)
    setWitnessModalMode(mode)
    setIsWitnessModalOpen(true)
  }

  const urgentReports = laporan.filter((item) => ['kritis', 'tinggi'].includes(item.analisisAI?.prioritas))

  // Scroll Adaptif Menu Navigasi untuk Layar/Window Kecil
  const navTabsRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkNavScroll = useCallback(() => {
    const el = navTabsRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const isScrollable = scrollWidth > clientWidth + 3
    setCanScrollLeft(isScrollable && scrollLeft > 8)
    setCanScrollRight(isScrollable && scrollLeft + clientWidth < scrollWidth - 8)
  }, [])

  useEffect(() => {
    checkNavScroll()
    const handleResize = () => checkNavScroll()
    window.addEventListener('resize', handleResize)

    let observer
    if (window.ResizeObserver && navTabsRef.current) {
      observer = new ResizeObserver(() => checkNavScroll())
      observer.observe(navTabsRef.current)
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      if (observer) observer.disconnect()
    }
  }, [checkNavScroll])

  useEffect(() => {
    const el = navTabsRef.current
    if (!el) return
    const activeEl = el.querySelector('.citizen-nav-tab.active')
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
    }
    checkNavScroll()
  }, [activeTab, checkNavScroll])

  const handleNavScroll = (direction) => {
    const el = navTabsRef.current
    if (!el) return
    const scrollDistance = 200
    el.scrollBy({
      left: direction === 'left' ? -scrollDistance : scrollDistance,
      behavior: 'smooth'
    })
    setTimeout(checkNavScroll, 280)
  }

  const handleViewOnMap = (id) => {
    if (setSelectedId) setSelectedId(id)
    setActiveTab('peta')
    if (showNotif) showNotif('Membuka titik bencana pada Peta GIS...', 'info')
  }

  const handleDonate = (report) => {
    const matched = logistikList.find(item =>
      report.lokasi?.toLowerCase().includes(item.lokasiTujuan?.toLowerCase().split(' ')[0] || '')
    ) || logistikList[0]
    setDonationTargetItem(matched)
    setDonationModalOpen(true)
  }

  const handleVote = async (reportId, voteType, meta = {}) => {
    if (validasiKomunitas) {
      validasiKomunitas(reportId, voteType, meta)
    }
    setVotedReports((prev) => ({ ...prev, [reportId]: voteType }))

    try {
      const voterId = 'warga-' + (localStorage.getItem('wargaId') || Math.random().toString(36).slice(2, 7))
      await fetch('http://localhost:3001/api/vote-laporan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId,
          vote: voteType,
          voterId,
          reason: meta?.alasan,
          distanceKm: meta?.jarakKm,
          witnessNote: meta?.catatan
        })
      })
    } catch {
      // Fallback state already handled via validasiKomunitas
    }
  }

  const filteredLaporan = laporan.filter((item) => {
    if (selectedCategory === 'semua') return true
    if (selectedCategory === 'banjir') return /banjir/i.test(item.jenis)
    if (selectedCategory === 'gempa') return /gempa/i.test(item.jenis)
    if (selectedCategory === 'kebakaran') return /kebakaran/i.test(item.jenis)
    if (selectedCategory === 'prioritas') return ['kritis', 'tinggi'].includes(item.analisisAI?.prioritas)
    return true
  })

  const hotlines = [
    {
      name: 'Panggilan Darurat 112',
      number: '112',
      desc: 'Bebas pulsa dari semua HP & operator (Kedaruratan umum)',
      icon: '🚨',
      tag: 'BEBAS PULSA',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
      btnBg: '#dc2626',
    },
    {
      name: 'Basarnas (SAR & Evakuasi)',
      number: '115',
      desc: 'Evakuasi perahu banjir, longsor lereng, reruntuhan gedung',
      icon: '🚤',
      tag: 'EVAKUASI SAR',
      gradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
      btnBg: '#ea580c',
    },
    {
      name: 'Ambulans & Gawat Darurat',
      number: '119',
      desc: 'Tenaga medis darurat, ambulans siaga, rujukan RSUD',
      icon: '🏥',
      tag: 'MEDIS 24 JAM',
      gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
      btnBg: '#059669',
    },
    {
      name: 'Pemadam Kebakaran',
      number: '113',
      desc: 'Kebakaran pemukiman, pasar, serta penyelamatan hewan',
      icon: '🔥',
      tag: 'DAMKAR SIAGA',
      gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
      btnBg: '#0284c7',
    },
    {
      name: 'Call Center BNPB Nasional',
      number: '117',
      desc: 'Komando koordinasi logistik & tanggap darurat nasional',
      icon: '🛡️',
      tag: 'POSKO PUSAT',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
      btnBg: '#4f46e5',
    },
  ]

  return (
    <div className="citizen-portal-vibrant">
      
      <nav className="citizen-nav-bar" aria-label="Menu Layanan Warga">
        <div className="citizen-nav-scroll-wrapper">
          {canScrollLeft && (
            <button
              type="button"
              className="nav-scroll-btn nav-scroll-left"
              onClick={() => handleNavScroll('left')}
              aria-label="Scroll menu ke kiri"
              title="Geser menu ke kiri"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          <div
            className={`citizen-nav-tabs-group ${canScrollLeft ? 'has-left-fade' : ''} ${canScrollRight ? 'has-right-fade' : ''}`}
            ref={navTabsRef}
            onScroll={checkNavScroll}
          >
            <button
              className={`citizen-nav-tab tab-home ${activeTab === 'beranda' ? 'active' : ''}`}
              onClick={() => setActiveTab('beranda')}
            >
              <Home size={17} />
              <span className="nav-tab-label">Beranda</span>
            </button>
            <button
              className={`citizen-nav-tab tab-map ${activeTab === 'peta' ? 'active' : ''}`}
              onClick={() => setActiveTab('peta')}
            >
              <MapIcon size={17} />
              <span className="nav-tab-label">Peta & Posko</span>
              <span className="tab-counter-badge">{poskoList.length}</span>
            </button>
            <button
              className={`citizen-nav-tab tab-reports ${activeTab === 'laporan' ? 'active' : ''}`}
              onClick={() => setActiveTab('laporan')}
            >
              <ClipboardList size={17} />
              <span className="nav-tab-label">
                Laporan <span className="tab-counter-badge">{laporan.length}</span>
              </span>
            </button>
            <button
              className={`citizen-nav-tab tab-logistics ${activeTab === 'bantuan' ? 'active' : ''}`}
              onClick={() => setActiveTab('bantuan')}
            >
              <Package size={17} />
              <span className="nav-tab-label">Kebutuhan</span>
            </button>
            <button
              className={`citizen-nav-tab tab-family ${activeTab === 'keluarga' ? 'active' : ''}`}
              onClick={() => setActiveTab('keluarga')}
            >
              <Search size={17} />
              <span className="nav-tab-label">Temukan Keluarga</span>
            </button>
            <button
              className={`citizen-nav-tab tab-hotline ${activeTab === 'darurat' ? 'active' : ''}`}
              onClick={() => setActiveTab('darurat')}
            >
              <Phone size={17} />
              <span className="nav-tab-label">Kontak Darurat</span>
            </button>
          </div>

          {canScrollRight && (
            <button
              type="button"
              className="nav-scroll-btn nav-scroll-right"
              onClick={() => handleNavScroll('right')}
              aria-label="Scroll menu ke kanan"
              title="Geser menu ke kanan"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* UTILITY & FAST ACTION DI SISI KANAN NAVBAR */}
        <div className="citizen-nav-utility-group">
          {/* TOMBOL PANGGILAN DARURAT 112 (TEL:112 BEBAS PULSA) */}
          <a
            href="tel:112"
            className="nav-emergency-call-btn"
            title="Panggil Darurat Bebas Pulsa 112 (Semua Operator)"
            aria-label="Panggil Darurat Bebas Pulsa 112"
          >
            <span className="nav-hotline-dot-pulse" />
            <Phone size={13} className="emergency-icon-phone" />
            <span className="nav-hotline-label">Darurat:</span>
            <strong>112</strong>
          </a>

          {/* AKSES CEPAT KONTAK DARURAT */}
          <button
            type="button"
            className="nav-quick-contacts-btn"
            onClick={() => setActiveTab('darurat')}
            title="Buka Direktori Kontak Darurat Lengkap"
          >
            <Phone size={14} />
            <span className="quick-contacts-text">Kontak Darurat</span>
          </button>

          {/* TOMBOL UTAMA LAPOR KEJADIAN */}
          <button
            className="nav-quick-report-action"
            onClick={() => setShowForm(true)}
            title="Laporkan bencana baru di sekitar Anda"
          >
            <AlertTriangle size={15} />
            <span>Lapor Kejadian</span>
          </button>
        </div>
      </nav>

      {/* STRIP DARURAT TETAP: 112 & KONTAK DARURAT SELALU TERLIHAT TERPISAH DARI MENU HORIZONTAL */}
      <div className="citizen-fixed-emergency-strip" aria-label="Akses Cepat Kedaruratan">
        <a
          href="tel:112"
          className="btn-strip-call-112"
          title="Telepon Langsung Darurat 112 Bebas Pulsa"
        >
          <span className="call-live-beacon" />
          <Phone size={14} />
          <span>Panggil Darurat: <strong>112</strong></span>
          <span className="strip-badge-free">BEBAS PULSA</span>
        </a>

        <button
          type="button"
          className="btn-strip-contacts"
          onClick={() => setActiveTab('darurat')}
          title="Buka Direktori Kontak Darurat Lengkap (Ambulans, Basarnas, Damkar)"
        >
          <Phone size={13} />
          <span>Kontak Darurat</span>
        </button>
      </div>

      {activeTab === 'beranda' && (
        <div className="citizen-tab-pane">
          
          <section className="vibrant-hero-card">
            <div className="vibrant-hero-left">
              <div className="hero-tagline-badge">
                <span className="hero-badge-dot" />
                <span>Portal Siaga Bencana Warga Terpadu</span>
              </div>
              <h1 className="vibrant-hero-title">
                Saling Menjaga, <br />
                <span className="hero-highlight-gradient">Cepat Menolong Sesama</span>
              </h1>
              <p className="vibrant-hero-desc">
                Pantau informasi bencana, cari posko terdekat, dan temukan keluarga yang terpisah secara terpusat.
              </p>
              <div className="hero-action-row">
                <button
                  type="button"
                  className="hero-primary-action hero-btn-track"
                  onClick={() => setActiveTab('laporan')}
                  title="Pantau perkembangan dan status validasi laporan Anda"
                >
                  <ClipboardList size={18} />
                  <span>Pantau Status Laporan Saya</span>
                </button>
                <button
                  type="button"
                  className="hero-secondary-action"
                  onClick={() => setActiveTab('peta')}
                >
                  <MapIcon size={18} />
                  <span>Buka Peta Evakuasi</span>
                </button>
              </div>
              <div className="hero-trust-row" aria-label="Keterangan data">
                <span><span className="hero-live-dot" /> Terhubung Langsung Satelit BMKG</span>
                <span>Sensor Cuaca & Gempa Otomatis GPS</span>
              </div>
            </div>

            <div className="vibrant-hero-right">
              <BMKGLiveWidget
                laporan={laporan}
                onOpenReportForm={() => setShowForm(true)}
              />
            </div>
          </section>

          {/* 1. EMPAT PILAR UTAMA & EKOSISTEM SALINGJAGA */}
          <section className="portal-features-section">
            <div className="section-header-modern">
              <div className="section-pill-tag">
                <Sparkles size={14} />
                <span>EKOSISTEM KESIAPSIAGAAN NASIONAL</span>
              </div>
              <h2>4 Pilar Utama SalingJaga</h2>
              <p>
                Menghubungkan sensor satelit BMKG, partisipasi gotong royong warga, serta respon cepat komando petugas penolong dalam satu sistem tanggap bencana.
              </p>
            </div>

            <div className="pillar-cards-grid">
              <div className="pillar-card">
                <div className="pillar-icon-box icon-emerald">
                  <Radio size={22} />
                </div>
                <span className="pillar-tag">BMKG TEWS & GPS</span>
                <h3>Sensor Satelit & Cuaca Realtime</h3>
                <p>Prakiraan cuaca hingga tingkat kelurahan, deteksi radius gempa otomatis dari posisi GPS Anda, dan peringatan bahaya banjir.</p>
                <div className="pillar-badge-footer">
                  <span className="pulse-dot-green" /> <span>Update Tiap Menit</span>
                </div>
              </div>

              <div className="pillar-card">
                <div className="pillar-icon-box icon-blue">
                  <ShieldCheck size={22} />
                </div>
                <span className="pillar-tag">ANTI-HOAKS</span>
                <h3>Validasi AI & Komunitas</h3>
                <p>Mencegah laporan fiksi dengan verifikasi silang data BMKG, pencatatan NIK sukarela, serta pemungutan suara (vote) warga sekitar.</p>
                <div className="pillar-badge-footer">
                  <CheckCircle2 size={13} className="text-blue" /> <span>Cegah Data Palsu</span>
                </div>
              </div>

              <div className="pillar-card">
                <div className="pillar-icon-box icon-amber">
                  <MapPin size={22} />
                </div>
                <span className="pillar-tag">GIS LOGISTIK</span>
                <h3>Peta Posko & Ranjang Siaga</h3>
                <p>Informasi real-time sisa kasur pengungsian, stok obat-obatan faskes darurat, serta rute evakuasi aman menuju titik kumpul.</p>
                <div className="pillar-badge-footer">
                  <Activity size={13} className="text-amber" /> <span>Kapasitas Terbuka</span>
                </div>
              </div>

              <div className="pillar-card">
                <div className="pillar-icon-box icon-purple">
                  <Users size={22} />
                </div>
                <span className="pillar-tag">PENCARIAN WARGA</span>
                <h3>Temukan Keluarga Terpisah</h3>
                <p>Pencocokan AI antara warga hilang dengan registrasi pengungsi di posko untuk mempertemukan keluarga terdampak lebih cepat.</p>
                <div className="pillar-badge-footer">
                  <Sparkles size={13} className="text-purple" /> <span>Pencocokan Cerdas</span>
                </div>
              </div>
            </div>

            {/* Ekosistem Lembaga & Instansi Terpadu */}
            <div className="institution-ecosystem-bar">
              <div className="ecosystem-title-row">
                <ShieldCheck size={18} className="text-emerald" />
                <span>Terhubung & Terintegrasi dengan Ekosistem Penanggulangan Bencana:</span>
              </div>
              <div className="institution-chips-wrap">
                <div className="inst-badge">
                  <span className="inst-symbol">🛡️</span>
                  <div>
                    <strong>BNPB Pusat</strong>
                    <small>Komando & Logistik</small>
                  </div>
                </div>
                <div className="inst-badge">
                  <span className="inst-symbol">🚤</span>
                  <div>
                    <strong>Basarnas</strong>
                    <small>Evakuasi SAR Lapangan</small>
                  </div>
                </div>
                <div className="inst-badge">
                  <span className="inst-symbol">🏢</span>
                  <div>
                    <strong>BPBD Daerah</strong>
                    <small>Posko & Koordinator</small>
                  </div>
                </div>
                <div className="inst-badge">
                  <span className="inst-symbol">🏥</span>
                  <div>
                    <strong>Kemenkes RI</strong>
                    <small>Fasilitas & Medis Darurat</small>
                  </div>
                </div>
                <div className="inst-badge">
                  <span className="inst-symbol">🩸</span>
                  <div>
                    <strong>PMI</strong>
                    <small>Dapur Umum & Darah</small>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. FEED SITUASI MUSIBAH & LAPORAN WARGA TERKINI */}
          <section className="clean-white-card disaster-feed-section">
            <div className="feed-header-wrap">
              <div className="feed-title-col">
                <div className="feed-badge-pulse">
                  <span className="live-pulse-dot" />
                  <span>RADAR KEJADIAN WARGA TERVERIFIKASI</span>
                </div>
                <h2>Pantauan Musibah & Laporan Warga Terkini</h2>
                <p>Laporan langsung dari warga di lapangan yang telah melalui validasi BMKG & voting komunitas.</p>
              </div>

              {/* FILTER KATEGORI CEPAT */}
              <div className="feed-filter-bar">
                <button
                  className={`feed-filter-btn ${selectedCategory === 'semua' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('semua')}
                >
                  Semua ({laporan.length})
                </button>
                <button
                  className={`feed-filter-btn ${selectedCategory === 'banjir' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('banjir')}
                >
                  🌊 Banjir ({laporan.filter(l => /banjir/i.test(l.jenis)).length})
                </button>
                <button
                  className={`feed-filter-btn ${selectedCategory === 'gempa' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('gempa')}
                >
                  🌋 Gempa ({laporan.filter(l => /gempa/i.test(l.jenis)).length})
                </button>
                <button
                  className={`feed-filter-btn ${selectedCategory === 'kebakaran' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('kebakaran')}
                >
                  🔥 Kebakaran ({laporan.filter(l => /kebakaran/i.test(l.jenis)).length})
                </button>
                <button
                  className={`feed-filter-btn filter-urgent ${selectedCategory === 'prioritas' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('prioritas')}
                >
                  🔴 Mendesak ({urgentReports.length})
                </button>
              </div>
            </div>

            {/* KARTU KEJADIAN INTERAKTIF */}
            {filteredLaporan.length === 0 ? (
              <div className="feed-empty-state">
                <ShieldCheck size={36} className="text-emerald" />
                <p>Tidak ada laporan untuk kategori ini saat ini.</p>
              </div>
            ) : (
              <div className="incidents-vibrant-row">
                {filteredLaporan.map((item) => {
                  const prio = item.analisisAI?.prioritas || 'sedang'
                  const isUrgent = ['kritis', 'tinggi'].includes(prio)
                  const userVote = votedReports[item.id]

                  return (
                    <div key={item.id} className={`incident-vibrant-card prio-${prio}`}>
                      {/* Baris Atas: Icon Tipe, ID, Status */}
                      <div className="incident-card-top-row">
                        <div className="incident-type-cluster">
                          <span className={`incident-icon-disc type-${item.jenis.toLowerCase().replace(/\s+/g, '-')}`}>
                            {/banjir/i.test(item.jenis) ? '🌊' : /gempa/i.test(item.jenis) ? '🌋' : /kebakaran/i.test(item.jenis) ? '🔥' : '⚠️'}
                          </span>
                          <div>
                            <span className="incident-badge-id">{item.id}</span>
                            <h4 className="incident-title-text">{item.jenis}</h4>
                          </div>
                        </div>

                        <div className="incident-status-cluster">
                          {isUrgent && <span className="prio-badge-red">Mendesak</span>}
                          <span className={`status-pill status-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {item.status}
                          </span>
                        </div>
                      </div>

                      {/* Validasi Anti-Hoaks Tags (Ide 5 & Ide 8) */}
                      <div className="incident-trust-pills-row">
                        <span className="trust-pill verified-bmkg" title="Tervalidasi silang data cuaca/gempa BMKG">
                          <ShieldCheck size={12} /> BMKG Checked
                        </span>
                        <span className="trust-pill verified-community" title="Divalidasi oleh warga sekitar">
                          <Users size={12} /> Komunitas ({item.voteYa?.length || 3} Valid)
                        </span>
                        {item.nikSukarela && (
                          <span className="trust-pill verified-nik" title="Dilaporkan dengan identitas KTP terverifikasi">
                            🆔 NIK Terverifikasi
                          </span>
                        )}
                      </div>

                      {/* Lokasi & Jumlah Warga */}
                      <div className="incident-loc-card-row">
                        <MapPin size={15} className="text-emerald" />
                        <span className="incident-loc-name">{item.lokasi}</span>
                        <span className="incident-victim-badge">
                          <strong>{item.jumlahWarga}</strong> Warga
                        </span>
                      </div>

                      {/* Kondisi Lapangan */}
                      <p className="incident-desc-text">
                        {item.kondisi}
                      </p>

                      {/* Kebutuhan Mendesak Chip */}
                      <div className="incident-urgent-box">
                        <span className="urgent-box-label">📦 Kebutuhan Diperlukan:</span>
                        <div className="urgent-chips-wrap">
                          {item.kebutuhan.split(',').map((k, i) => (
                            <span key={i} className="urgent-chip-tag">
                              {k.trim()}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Tombol Aksi Lapangan */}
                      <div className="incident-card-action-bar">
                        <button
                          className="btn-card-map-action"
                          onClick={() => handleViewOnMap(item.id)}
                          title="Buka titik koordinat musibah di Peta GIS"
                        >
                          <MapIcon size={14} /> Buka di Peta
                        </button>
                        <button
                          className="btn-card-donate-action"
                          onClick={() => handleDonate(item)}
                          title="Bantu donasi logistik untuk kebutuhan warga ini"
                        >
                          <HeartHandshake size={14} /> Bantu Kebutuhan
                        </button>

                        {/* Validasi Komunitas Berbasis Saksi Mata Lapangan & Anti-Hoaks */}
                        <div className="card-witness-verification-group" aria-label="Verifikasi Saksi Lapangan">
                          <button
                            type="button"
                            className={`btn-witness-confirm ${userVote === 'ya' ? 'confirmed' : ''}`}
                            onClick={() => openWitnessModal(item, 'saksi')}
                            title="Konfirmasi kejadian ini sebagai saksi lapangan terdekat (Radius < 2.5 km)"
                          >
                            <Eye size={13} className="witness-icon" />
                            <span>{userVote === 'ya' ? '✓ Dikonfirmasi Saksi' : 'Saksi Lapangan'}</span>
                            <span className="witness-counter-chip" title={`${item.konfirmasiWarga || 1} saksi telah mengonfirmasi`}>
                              {item.konfirmasiWarga || 1}
                            </span>
                          </button>

                          <button
                            type="button"
                            className={`btn-witness-flag-hoax ${userVote === 'tidak' ? 'flagged' : ''}`}
                            onClick={() => openWitnessModal(item, 'hoaks')}
                            title="Laporkan jika kejadian ini fiktif/hoaks/salah lokasi untuk ditinjau BPBD"
                          >
                            <AlertOctagon size={13} />
                            <span>{userVote === 'tidak' ? 'Ditandai Fiktif' : 'Fiktif?'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Info Trust & Geofencing Note */}
                      <div className="card-witness-trust-footer">
                        <span className="witness-trust-dot" />
                        <span>Verifikasi saksi berbasis radius GPS & pengawasan Pusdalops BPBD</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {activeTab === 'peta' && (
        <div className="citizen-tab-pane">
          <div className="tab-banner-header">
            <div>
              <h2>Peta Lokasi Bahaya & Posko Aman Pengungsian</h2>
              <p>
                Gunakan peta interaktif ini untuk melihat titik laporan dan lokasi posko dalam data simulasi.
              </p>
            </div>
          </div>

          <DisasterMap />

          <div className="clean-white-card">
            <h3 className="section-subtitle-clean"><ShieldCheck size={20} style={{verticalAlign: 'middle', marginRight: '8px'}} /> Daftar Posko & Faskes Simulasi</h3>
            <div className="shelters-vibrant-grid">
              {poskoList.map((p) => {
                const sisa = Math.max(0, p.kapasitas - p.terisi)
                return (
                  <div key={p.id} className="shelter-vibrant-card">
                    <div className="shelter-card-topbar">
                      <span className="shelter-chip-tag">
                        {p.kategori === 'posko' ? 'Posko Pengungsian' : p.kategori === 'faskes' ? 'Fasilitas Medis' : 'Depo Logistik'}
                      </span>
                      <span className={`shelter-badge-bed ${sisa > 40 ? 'bed-safe' : 'bed-limited'}`}>
                        {sisa > 0 ? `Sisa ${sisa} Ranjang` : 'Kapasitas Penuh'}
                      </span>
                    </div>

                    <h4 className="shelter-card-title">{p.nama}</h4>

                    <div className="shelter-card-facilities">
                      <strong>Fasilitas:</strong> {p.fasilitas.join(' · ')}
                    </div>

                    <div className="shelter-card-footer">
                      <div className="shelter-card-pic">
                        <span>Koordinator: {p.koordinator}</span>
                        <strong>📞 {p.kontak}</strong>
                      </div>
                      <a href={`tel:${p.kontak.replace(/[^0-9]/g, '')}`} className="btn-call-shelter-action">
                        Hubungi Posko
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'laporan' && (
        <div className="citizen-tab-pane">
          <div className="tab-banner-header">
            <div>
              <h2>Pantau Laporan Musibah & Status Penanganan</h2>
              <p>Transparansi laporan warga yang masuk dari seluruh penjuru wilayah untuk koordinasi tanggap darurat.</p>
            </div>
          </div>

          <div className="reports-vibrant-feed">
            {laporan.map((item) => {
              const prio = item.analisisAI?.prioritas || 'sedang'
              return (
                <div key={item.id} className="report-full-vibrant-card">
                  <div className="report-top-meta-row">
                    <div className="report-id-group">
                      <span className="report-badge-id">{item.id}</span>
                      <h3 className="report-title-bold">{item.jenis}</h3>
                      <span className={`prio-pill ${prio}`}>Prioritas {prio.toUpperCase()}</span>
                    </div>
                    <span className={`status-pill status-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="report-meta-items">
                    <span>📍 <strong>Lokasi:</strong> {item.lokasi}</span>
                    <span>👥 <strong>Warga Terdampak:</strong> {item.jumlahWarga} Jiwa</span>
                    <span>🕒 <strong>Waktu Lapor:</strong> {new Date(item.waktuLapor).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                  </div>

                  <p className="report-kondisi-paragraph">{item.kondisi}</p>

                  <div className="report-urgent-banner">
                    <strong>Kebutuhan Mendesak:</strong> {item.kebutuhan}
                  </div>

                  <div className="report-bottom-strip">
                    <span>Pelapor: {item.pelapor.replace(/(\d{4})-\d{4}-\d{3,4}/, '$1-****-****')}</span>
                    {item.analisisAI && (
                      <span className="ai-check-tag">
                        ✓ Dianalisis AI (Skor Urgensi: {item.analisisAI.skor}/100)
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'bantuan' && (
        <div className="citizen-tab-pane">
          <div className="tab-banner-header">
            <div>
              <h2>Kebutuhan Logistik Pengungsi & Penyaluran Bantuan</h2>
              <p>Daftar pasokan barang mendesak yang sedang dibutuhkan penyintas di posko pengungsian.</p>
            </div>
          </div>

          <div className="logistics-vibrant-grid">
            {logistikList.map((item) => {
              const pct = Math.min(100, Math.round((item.terkumpul / item.target) * 100))
              return (
                <div key={item.id} className="logistics-vibrant-card">
                  <div className="logistics-card-top">
                    <span className="logistics-cat-badge">{item.kategori}</span>
                    <span className={`logistics-urgency-badge ${item.urgensi}`}>
                      Urgensi {item.urgensi.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="logistics-item-name">{item.nama}</h3>
                  <p className="logistics-item-desc">{item.keterangan}</p>

                  <div className="logistics-meter-box">
                    <div className="meter-label-row">
                      <span>Progres Pengumpulan:</span>
                      <strong>{pct}% Terkumpul</strong>
                    </div>
                    <div className="meter-track-bar">
                      <div
                        className={`meter-fill-bar ${pct >= 100 ? 'fill-green' : item.urgensi === 'kritis' ? 'fill-red' : 'fill-blue'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="meter-stats-row">
                      <span>Terkumpul: <strong>{item.terkumpul.toLocaleString('id-ID')}</strong> {item.satuan}</span>
                      <span>Target: {item.target.toLocaleString('id-ID')} {item.satuan}</span>
                    </div>
                  </div>

                  <button
                    className="btn-donate-logistics-action"
                    onClick={() => {
                      setDonationTargetItem(item)
                      setDonationModalOpen(true)
                    }}
                  >
                    Salurkan Bantuan Barang Ini
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'darurat' && (
        <div className="citizen-tab-pane">
          <div className="tab-banner-header">
            <div>
              <h2>📞 Panggilan Darurat & Nomor Bantuan Bebas Pulsa</h2>
              <p>Simpan atau klik nomor di bawah ini untuk menghubungi instansi penolong saat situasi darurat.</p>
            </div>
          </div>

          <div className="hotlines-vibrant-grid">
            {hotlines.map((h, idx) => (
              <div key={idx} className="hotline-vibrant-card" style={{ borderTop: `5px solid ${h.btnBg}` }}>
                <div className="hotline-top-strip">
                  <span className="hotline-tag-label">{h.tag}</span>
                </div>
                <h3 className="hotline-name-title">{h.name}</h3>
                <div className="hotline-number-display">{h.number}</div>
                <p className="hotline-desc-text">{h.desc}</p>
                <a
                  href={`tel:${h.number.replace(/[^0-9]/g, '')}`}
                  className="btn-call-hotline-vibrant"
                  style={{ background: h.btnBg }}
                >
                  📞 Panggil Sekarang ({h.number})
                </a>
              </div>
            ))}
          </div>

          <div className="clean-white-card">
            <h3 className="section-subtitle-clean">🛡️ Panduan Singkat Keselamatan Bencana</h3>
            <div className="tips-vibrant-row">
              <div className="tip-vibrant-box border-blue">
                <span className="tip-icon">🌊</span>
                <h4>Saat Terjadi Banjir</h4>
                <p>Segera matikan saklar MCB listrik rumah, amankan surat berharga ke dalam kantong plastik kedap air, dan segera menuju titik evakuasi sebelum air makin tinggi.</p>
              </div>
              <div className="tip-vibrant-box border-purple">
                <span className="tip-icon">🏚️</span>
                <h4>Saat Terjadi Gempa Bumi</h4>
                <p>Drop, Cover, Hold On! Berlindung di bawah meja kokoh, lindungi kepala dan leher. Setelah guncangan mereda, keluar rumah menuju lapangan terbuka lewat tangga darurat.</p>
              </div>
              <div className="tip-vibrant-box border-orange">
                <span className="tip-icon">⛰️</span>
                <h4>Tanda Ancaman Longsor</h4>
                <p>Waspadai suara gemuruh misterius, retakan baru di lantai/dinding tanah, atau air sumur yang mendadak keruh setelah hujan deras. Segera mengungsi.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'keluarga' && (
         <div className="citizen-tab-pane">
           <FamilySearchWarga />
         </div>
      )}

      {/* Modal Verifikasi Saksi Mata & Pelaporan Hoaks Terstruktur */}
      <SaksiVerifikasiModal
        isOpen={isWitnessModalOpen}
        onClose={() => setIsWitnessModalOpen(false)}
        targetLaporan={witnessModalReport}
        mode={witnessModalMode}
        onSubmitVerification={(reportId, voteType, meta) => handleVote(reportId, voteType, meta)}
      />
    </div>
  )
}
