import { useEffect, useState } from 'react'
import {
  ClipboardList,
  AlertTriangle,
  MapPinned,
  Users,
  Package,
  Search,
  Plus,
  ShieldAlert,
  Radio,
  Zap,
  Building2,
  Clock,
  Sparkles,
  Compass,
  Layers,
  RefreshCw,
  Rocket,
  Shield,
  Activity,
  History,
  Target,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  MapPin,
  X,
  FileText,
  PhoneCall,
  Menu,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import Header from '../components/Header'
import SummaryCards from '../components/SummaryCards'
import DisasterMap from '../components/DisasterMap'
import ReportList from '../components/ReportList'
import ReportDetailPanel from '../components/ReportDetailPanel'
import VolunteerDispatchSection from '../components/VolunteerDispatchSection'
import LogisticsLedgerSection from '../components/LogisticsLedgerSection'
import DisasterReportForm from '../components/DisasterReportForm'
import VolunteerDispatchModal from '../components/VolunteerDispatchModal'
import LogisticsDonationModal from '../components/LogisticsDonationModal'
import CitizenView from '../components/CitizenView'
import LoginBPBD from '../components/LoginBPBD'
import AddPoskoModal from '../components/AddPoskoModal'
import FamilySearchAdmin from '../components/FamilySearchAdmin'
import KarantinaPanel from '../components/KarantinaPanel'
import PriorityIncidentQueue from '../components/PriorityIncidentQueue'
import EWSBroadcastModal from '../components/EWSBroadcastModal'
import BPBDActivityModal from '../components/BPBDActivityModal'
import PoskoCoordinationModal from '../components/PoskoCoordinationModal'
import CloseReportModal from '../components/CloseReportModal'
import SitRepModal from '../components/SitRepModal'
import LocalContactsModal from '../components/LocalContactsModal'
import StatusWilayahModal from '../components/StatusWilayahModal'
import './Dashboard.css'

function Toast({ notification }) {
  if (!notification) return null
  return (
    <div className={`toast ${notification.type}`} role="alert" aria-live="polite">
      {notification.type === 'success' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      )}
      <span>{notification.msg}</span>
    </div>
  )
}

export default function Dashboard({ viewRole }) {
  const {
    userRole,
    setUserRole,
    activeTab,
    showForm,
    notification,
    selectedLaporan,
    setActiveTab,
    dispatchModalOpen,
    setDispatchModalOpen,
    setDispatchTargetReport,
    isAuthenticated,
    adminLevel,
    laporan = [],
    relawanList = [],
    poskoList = [],
    logistikList = [],
    bpbdWilayah = 'Tangerang',
    statusWilayah = 'Siaga',
    setStatusWilayah,
    updateStatusWilayah,
    activeIncidentId,
    setActiveIncidentId,
    activeIncident,
    aktivitasBPBD = [],
    ewsHistory = [],
    setReportFilter,
    showNotif,
    isSitRepOpen,
    setIsSitRepOpen,
    isContactsOpen,
    setIsContactsOpen,
    kontakPentingList = [],
  } = useApp()

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const [currentTime, setCurrentTime] = useState('')
  const [lastUpdatedTime, setLastUpdatedTime] = useState('10:42 WIB')
  const [isSyncing, setIsSyncing] = useState(false)
  const [isAddPoskoOpen, setIsAddPoskoOpen] = useState(false)
  const [isEwsOpen, setIsEwsOpen] = useState(false)
  const [ewsInitialTab, setEwsInitialTab] = useState('broadcast')
  const [isActivityOpen, setIsActivityOpen] = useState(false)
  const [isPoskoCoordOpen, setIsPoskoCoordOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false)

  // Real-time WIB digital clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const formatted = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB'
      )
      if (!lastUpdatedTime) {
        setLastUpdatedTime(formatted)
      }
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [lastUpdatedTime])

  const handleManualSync = () => {
    setIsSyncing(true)
    setTimeout(() => {
      const now = new Date()
      setLastUpdatedTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
      )
      setIsSyncing(false)
      if (showNotif) {
        showNotif('Sinkronisasi data lapangan dan satelit berhasil diperbarui.', 'success')
      }
    }, 450)
  }

  useEffect(() => {
    if (viewRole && viewRole !== userRole) {
      setUserRole(viewRole)
    }
  }, [viewRole, userRole, setUserRole])

  if (viewRole === 'petugas' && (!isAuthenticated || adminLevel !== 'regional')) {
    return <LoginBPBD initialRole="regional" />
  }

  // INDIKATOR DATA WARGA MASUK:
  // 1. Jumlah laporan baru masuk
  const laporanBaruCount = laporan.filter((l) => l.status === 'Baru').length
  // 2. Laporan yang menunggu validasi (belum 3 verifikasi atau berstatus Baru/Karantina)
  const menungguValidasiCount = laporan.filter(
    (l) => l.status === 'Baru' || (l.konfirmasiWarga || 0) < 3 || l.status === 'Menunggu Konfirmasi'
  ).length
  // 3. Laporan yang membutuhkan respons kurang dari dua jam (prioritas kritis / tinggi yang belum selesai)
  const butuhRespons2JamCount = laporan.filter(
    (l) => ['kritis', 'tinggi'].includes(l.analisisAI?.prioritas) && l.status !== 'Selesai'
  ).length

  const unhandledReports = laporan.filter((l) => l.status === 'Baru' || l.status === 'Diproses').length
  const criticalCount = laporan.filter((l) => ['kritis', 'tinggi'].includes(l.analisisAI?.prioritas)).length

  const ADMIN_TABS = [
    {
      id: 'map',
      label: 'Peta Situasi',
      shortLabel: 'Peta',
      icon: MapPinned,
      badge: `${laporan.length} Titik`,
      badgeColor: 'badge-emerald',
    },
    {
      id: 'reports',
      label: 'Laporan Musibah',
      shortLabel: 'Laporan',
      icon: ClipboardList,
      badge: unhandledReports ? `${unhandledReports} Aktif` : null,
      badgeColor: criticalCount > 0 ? 'badge-red' : 'badge-amber',
    },
    {
      id: 'volunteers',
      label: 'Bursa Relawan',
      shortLabel: 'Relawan',
      icon: Users,
      badge: `${relawanList.length} Tim`,
      badgeColor: 'badge-blue',
    },
    {
      id: 'logistics',
      label: 'Gudang Logistik',
      shortLabel: 'Logistik',
      icon: Package,
      badge: `${logistikList.length} Item`,
      badgeColor: 'badge-purple',
    },
    {
      id: 'family',
      label: 'Cari Keluarga',
      shortLabel: 'Keluarga',
      icon: Search,
      badge: 'Pencocokan',
      badgeColor: 'badge-cyan',
    },
    {
      id: 'karantina',
      label: 'Validasi Laporan',
      shortLabel: 'Validasi',
      icon: ShieldAlert,
      badge: 'Anti-Hoaks',
      badgeColor: 'badge-amber',
    },
  ]

  return (
    <div className="dashboard-page">
      <Header />

      <main className="dashboard-main" id="main-content">
        {userRole === 'warga' ? (
          <CitizenView />
        ) : (
          <div className="admin-command-view">
            {/* 1. COMMAND CENTER HERO BANNER (BPBD DAERAH) */}
            <div className="admin-titlebar-vibrant">
              <div className="admin-titlebar-glow" />

              <div className="admin-titlebar-content">
                <div className="admin-title-left">
                  <div className="admin-eyebrow-pill">
                    <span className="live-ping-beacon" />
                    <span className="eyebrow-label">
                      SITUATION ROOM · PUSDALOPS BPBD KOTA {bpbdWilayah.toUpperCase()}
                    </span>
                    <span className="eyebrow-divider">|</span>
                    <span className="eyebrow-clock">
                      <Clock size={11} /> {currentTime || 'WIB'}
                    </span>
                  </div>

                  <h1 className="admin-title-heading">
                    Pusat Komando <span className="title-gradient-word">BPBD Kota {bpbdWilayah}</span>
                  </h1>

                  <p className="admin-title-subtitle">
                    Kendalikan penanganan bencana, percepat evakuasi warga terdampak, kerahkan armada relawan lapangan, dan pimpin distribusi logistik di seluruh wilayah Kota {bpbdWilayah}.
                  </p>

                  <div className="admin-meta-chips-row">
                    {/* Cakupan wilayah aktif di hero */}
                    <span className="meta-chip chip-coverage">
                      <MapPin size={13} /> Wilayah layanan: Kota {bpbdWilayah}
                    </span>

                    {/* Status operasional wilayah interaktif (membuka dialog konfirmasi) */}
                    <span
                      className={`meta-chip chip-territory status-${(statusWilayah || 'Siaga').toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => setIsStatusModalOpen(true)}
                      title="Klik untuk konfirmasi pembaruan status kesiapsiagaan wilayah"
                      style={{ cursor: 'pointer' }}
                    >
                      <Activity size={13} /> Status Wilayah: <strong>{statusWilayah}</strong> ▾
                    </span>

                    <span className="meta-chip chip-location">
                      <Building2 size={13} /> Kantor Pusdalops Satgas 24 Jam
                    </span>

                    <span className="meta-chip chip-date">
                      {today}
                    </span>
                  </div>
                </div>

                {/* ACTION TOOLS DI SISI KANAN BANNER (TIGA AKSI DARURAT HARIAN OPERASIONAL) */}
                <div className="admin-title-actions">
                  <div className="admin-hero-btn-row">
                    {/* 1. SIARKAN EWS & RIWAYAT SIARAN */}
                    <button
                      type="button"
                      className="btn-admin-action btn-action-broadcast"
                      onClick={() => {
                        setEwsInitialTab('broadcast')
                        setIsEwsOpen(true)
                      }}
                      title="Siarkan sirene darurat dan peringatan dini ke seluruh warga & relawan"
                    >
                      <Radio size={16} />
                      <span>Siarkan EWS</span>
                    </button>

                    {/* 2. LIHAT INSIDEN MENDESAK (Pengganti Kerahkan Tim ambigu) */}
                    <button
                      type="button"
                      className="btn-admin-action btn-action-urgent-incidents"
                      onClick={() => {
                        setActiveTab('reports')
                        if (setReportFilter) setReportFilter('kritis')
                        setTimeout(() => {
                          document.getElementById('admin-workspace-nav')?.scrollIntoView({ behavior: 'smooth' })
                        }, 80)
                      }}
                      title="Buka dan tangani daftar musibah dengan tingkat prioritas kritis/mendesak"
                    >
                      <AlertTriangle size={16} />
                      <span>Lihat Insiden Mendesak</span>
                    </button>

                    {/* 3. UPDATE STATUS SIAGA (Dialog konfirmasi resmi) */}
                    <button
                      type="button"
                      className="btn-admin-action btn-action-status-siaga"
                      onClick={() => setIsStatusModalOpen(true)}
                      title="Perbarui status operasional kesiapsiagaan wilayah Kota Tangerang"
                    >
                      <Activity size={16} />
                      <span>Update Status Siaga</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SECONDARY TOOLBAR: RIWAYAT AKTIVITAS BPBD & KOORDINASI POSKO */}
            <div className="admin-operational-tools-strip">
              <div className="tools-strip-left">
                <button
                  type="button"
                  className="btn-tool-secondary"
                  onClick={() => setIsActivityOpen(true)}
                  title="Lihat riwayat laporan ditinjau, tim dikerahkan, posko terdaftar, dan EWS"
                >
                  <History size={15} />
                  <span>Riwayat Aktivitas BPBD</span>
                  <span className="tool-counter-chip">{aktivitasBPBD.length}</span>
                </button>

                <button
                  type="button"
                  className="btn-tool-secondary"
                  onClick={() => setIsPoskoCoordOpen(true)}
                  title="Buka pusat koordinasi posko: kapasitas tersisa dan kebutuhan mendesak"
                >
                  <Building2 size={15} />
                  <span>Pusat Koordinasi Posko</span>
                  <span className="tool-counter-chip green">{poskoList.length} Posko</span>
                </button>

                <button
                  type="button"
                  className="btn-tool-secondary"
                  onClick={() => {
                    setEwsInitialTab('history')
                    setIsEwsOpen(true)
                  }}
                  title="Buka langsung tab riwayat siaran pesan EWS sebelumnya"
                >
                  <Radio size={15} />
                  <span>Riwayat Pesan EWS</span>
                  <span className="tool-counter-chip red">{ewsHistory.length}</span>
                </button>

                {/* RINGKASAN SIAP KIRIM (SITREP) */}
                <button
                  type="button"
                  className="btn-tool-secondary btn-tool-sitrep"
                  onClick={() => setIsSitRepOpen(true)}
                  title="Buat Ringkasan Situasi Harian (SitRep) format WhatsApp / TXT untuk Walikota & BNPB"
                >
                  <FileText size={15} />
                  <span>Ringkasan Siap Kirim</span>
                </button>

                {/* KONTAK PENTING LOKAL */}
                <button
                  type="button"
                  className="btn-tool-secondary btn-tool-contacts"
                  onClick={() => setIsContactsOpen(true)}
                  title="Buka direktori darurat: Faskes, Damkar, PMI, Camat, Operator Alat Berat, dan Posko"
                >
                  <PhoneCall size={15} />
                  <span>Kontak Penting Lokal</span>
                  <span className="tool-counter-chip emerald">{(kontakPentingList || []).length}</span>
                </button>
              </div>

              <div className="tools-strip-right">
                <div className="status-sync-group">
                  <span className="live-ping-beacon-sm" />
                  <span className="sync-label">
                    Pembaruan terakhir · <strong>{lastUpdatedTime || '10:42 WIB'}</strong>
                  </span>
                  <button
                    type="button"
                    className="btn-sync-refresh"
                    onClick={handleManualSync}
                    title="Perbarui data lapangan sekarang"
                    aria-label="Perbarui data sekarang"
                  >
                    <RefreshCw size={12} className={isSyncing ? 'spinning' : ''} />
                  </button>
                </div>
              </div>
            </div>

            {/* MODE INSIDEN AKTIF BANNER (KETIKA SATU BENCANA BESAR TERPILIH) */}
            {activeIncidentId && activeIncident && (
              <div className="incident-focus-alert-banner" role="alert">
                <div className="focus-alert-content">
                  <div className="focus-alert-badge">
                    <Target size={18} className="focus-target-icon" />
                    <span>MODE INSIDEN AKTIF</span>
                  </div>
                  <div className="focus-alert-info">
                    <h3 className="focus-alert-title">
                      Fokus Bencana: #{activeIncident.id} — {activeIncident.jenis} ({activeIncident.lokasi})
                    </h3>
                    <p className="focus-alert-desc">
                      Seluruh dashboard (laporan, posko evakuasi, dan relawan) disaring khusus ke kejadian ini agar data operasional tidak bercampur dengan kejadian lain.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-exit-focus-mode"
                  onClick={() => setActiveIncidentId(null)}
                  title="Kembali ke tampilan seluruh wilayah Kota Tangerang"
                >
                  <X size={15} />
                  <span>Keluar dari Mode Insiden</span>
                </button>
              </div>
                )}

                {/* INDIKATOR DATA WARGA MASUK (3 KARTU INTERAKTIF) */}
                <section className="citizen-inflow-section" aria-label="Indikator data warga masuk">
              <div className="inflow-section-header">
                <div className="inflow-header-title">
                  <span className="inflow-dot-beacon" />
                  <h4>Indikator Data Warga Masuk</h4>
                  <span className="inflow-subtext">Aliran data pelaporan real-time warga Kota {bpbdWilayah}</span>
                </div>
              </div>

              <div className="citizen-inflow-grid">
                {/* 1. Laporan Baru Masuk */}
                <button
                  type="button"
                  className="inflow-stat-card card-new-report"
                  onClick={() => {
                    if (setReportFilter) setReportFilter('Baru')
                    setActiveTab('reports')
                  }}
                  title="Klik untuk melihat laporan yang baru masuk"
                >
                  <div className="inflow-card-top">
                    <div className="inflow-icon-circle blue">
                      <ClipboardList size={18} />
                    </div>
                    <span className="inflow-tag-pill tag-blue">Baru Masuk</span>
                  </div>
                  <div className="inflow-card-body">
                    <div className="inflow-number-row">
                      <span className="inflow-val">{laporanBaruCount}</span>
                      <span className="inflow-unit">Laporan</span>
                    </div>
                    <div className="inflow-label-text">
                      <strong>Laporan Baru</strong>
                      <span>Menunggu triase dan penanganan awal</span>
                    </div>
                  </div>
                  <div className="inflow-card-footer">
                    <span>Lihat di Berkas <ArrowRight size={12} /></span>
                  </div>
                </button>

                {/* 2. Menunggu Validasi Komunitas / Anti-Hoaks */}
                <button
                  type="button"
                  className="inflow-stat-card card-pending-validation"
                  onClick={() => setActiveTab('karantina')}
                  title="Klik untuk membuka verifikasi anti-hoaks warga"
                >
                  <div className="inflow-card-top">
                    <div className="inflow-icon-circle amber">
                      <ShieldAlert size={18} />
                    </div>
                    <span className="inflow-tag-pill tag-amber">Perlu Konfirmasi</span>
                  </div>
                  <div className="inflow-card-body">
                    <div className="inflow-number-row">
                      <span className="inflow-val">{menungguValidasiCount}</span>
                      <span className="inflow-unit">Laporan</span>
                    </div>
                    <div className="inflow-label-text">
                      <strong>Menunggu Validasi</strong>
                      <span>Verifikasi saksi komunitas & screening</span>
                    </div>
                  </div>
                  <div className="inflow-card-footer">
                    <span>Buka Panel Validasi <ArrowRight size={12} /></span>
                  </div>
                </button>

                {/* 3. Butuh Respons Kurang Dari Dua Jam */}
                <button
                  type="button"
                  className="inflow-stat-card card-urgent-golden"
                  onClick={() => {
                    if (setReportFilter) setReportFilter('Baru')
                    setActiveTab('reports')
                  }}
                  title="Klik untuk menangani musibah batas waktu respons < 2 jam"
                >
                  <div className="inflow-card-top">
                    <div className="inflow-icon-circle red">
                      <Clock size={18} />
                    </div>
                    <span className="inflow-tag-pill tag-red">Golden Time</span>
                  </div>
                  <div className="inflow-card-body">
                    <div className="inflow-number-row">
                      <span className="inflow-val text-red">{butuhRespons2JamCount}</span>
                      <span className="inflow-unit">Darurat</span>
                    </div>
                    <div className="inflow-label-text">
                      <strong>Respons &lt; 2 Jam</strong>
                      <span>Prioritas kritis evakuasi jiwa</span>
                    </div>
                  </div>
                  <div className="inflow-card-footer">
                    <span>Tindakan Darurat <ArrowRight size={12} /></span>
                  </div>
                </button>
              </div>
                </section>

            {/* KARTU RINGKASAN WILAYAH */}
            <SummaryCards />

            {/* 3. MENU NAVIGASI RUANG KOMANDO (HORIZONTAL TABS DI ATAS MAP / KONTEN) */}
            <nav
              className="admin-workspace-nav sticky-admin-nav"
              id="admin-workspace-nav"
              aria-label="Menu navigasi ruang komando"
            >
              {ADMIN_TABS.map(({ id, label, shortLabel, icon: Icon, badge, badgeColor }) => (
                <button
                  key={id}
                  type="button"
                  className={`admin-workspace-tab ${activeTab === id ? 'active' : ''}`}
                  onClick={() => setActiveTab(id)}
                  aria-current={activeTab === id ? 'page' : undefined}
                >
                  <Icon size={17} className="workspace-tab-icon" />
                  <span className="workspace-tab-text">
                    <span className="tab-label-full">{label}</span>
                    <span className="tab-label-short">{shortLabel}</span>
                  </span>
                  {badge && (
                    <span className={`tab-counter-badge ${badgeColor || ''}`}>
                      {badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* 4. ISI HALAMAN SESUAI MENU AKTIF */}
            <div className="admin-tab-pane">
              {activeTab === 'reports' && (
                <div className="dashboard-grid">
                  <ReportList />
                  <ReportDetailPanel />
                </div>
              )}

              {activeTab === 'map' && (
                <div className="tab-pane-map">
                  <div className="admin-map-heading">
                    <div>
                      <h2>Peta Situasi GIS Operasional Kota {bpbdWilayah}</h2>
                      <p>Visualisasi pemetaan radius bahaya, titik posko pengungsian, dan faskes darurat 24 jam.</p>
                    </div>
                    <div className="map-heading-action-group">
                      <button
                        type="button"
                        className="btn-posko-coord-trigger"
                        onClick={() => {
                          setActiveIncidentId(null)
                          if (showNotif) showNotif('Menampilkan seluruh titik posko pengungsian aktif di peta.', 'info')
                        }}
                        title="Tampilkan seluruh sebaran titik posko pengungsian aktif"
                      >
                        <Building2 size={15} /> Tampilkan Semua Posko
                      </button>
                      <button
                        type="button"
                        className="btn-add-posko"
                        onClick={() => setIsAddPoskoOpen(true)}
                        title="Tambah titik posko darurat baru"
                      >
                        <Plus size={16} /> Tambah Posko
                      </button>
                    </div>
                  </div>
                  <DisasterMap />

                  {selectedLaporan && (
                    <div className="map-spotlight-card">
                      <div className="spotlight-left">
                        <div className="spotlight-header-tags">
                          <span className="spotlight-beacon-live" />
                          <span className="spotlight-tag">LOKASI INCIDENT TERPILIH</span>
                          <span className="spotlight-id">#{selectedLaporan.id}</span>
                        </div>
                        <h3 className="spotlight-title">
                          {selectedLaporan.jenis} — {selectedLaporan.lokasi}
                        </h3>
                        <p className="spotlight-desc">{selectedLaporan.kondisi}</p>
                        <div className="spotlight-needs">
                          <strong>Kebutuhan Mendesak:</strong> {selectedLaporan.kebutuhan}
                        </div>
                      </div>
                      <div className="spotlight-actions">
                        <button
                          type="button"
                          className="btn-spotlight-detail"
                          onClick={() => setActiveTab('reports')}
                        >
                          <ClipboardList size={15} /> Buka Detail & AI Triase
                        </button>
                        <button
                          type="button"
                          className="btn-spotlight-dispatch"
                          onClick={() => {
                            setDispatchTargetReport(selectedLaporan)
                            setDispatchModalOpen(true)
                          }}
                        >
                          <AlertTriangle size={15} /> Kerahkan Relawan
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TINDAKAN PRIORITAS HARI INI DI BAWAH PETA */}
                  <PriorityIncidentQueue />
                </div>
              )}

              {activeTab === 'volunteers' && <VolunteerDispatchSection />}

              {activeTab === 'logistics' && <LogisticsLedgerSection />}

              {activeTab === 'family' && <FamilySearchAdmin />}

              {activeTab === 'karantina' && <KarantinaPanel />}
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      {showForm && <DisasterReportForm />}
      {dispatchModalOpen && <VolunteerDispatchModal />}
      <LogisticsDonationModal />
      <AddPoskoModal isOpen={isAddPoskoOpen} onClose={() => setIsAddPoskoOpen(false)} />
      <EWSBroadcastModal isOpen={isEwsOpen} onClose={() => setIsEwsOpen(false)} initialTab={ewsInitialTab} />
      <BPBDActivityModal isOpen={isActivityOpen} onClose={() => setIsActivityOpen(false)} />
      <PoskoCoordinationModal
        isOpen={isPoskoCoordOpen}
        onClose={() => setIsPoskoCoordOpen(false)}
        onOpenAddPosko={() => setIsAddPoskoOpen(true)}
      />
      <CloseReportModal />
      <SitRepModal isOpen={isSitRepOpen} onClose={() => setIsSitRepOpen(false)} />
      <LocalContactsModal isOpen={isContactsOpen} onClose={() => setIsContactsOpen(false)} />
      <StatusWilayahModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        currentStatus={statusWilayah}
        bpbdWilayah={bpbdWilayah}
        onSaveStatus={updateStatusWilayah}
      />

      <Toast notification={notification} />
    </div>
  )
}
