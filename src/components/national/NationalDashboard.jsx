import { useState, useEffect } from 'react'
import {
  Compass,
  Flame,
  Inbox,
  Truck,
  BarChart3,
  HeartHandshake,
  Radio,
  FileText,
  Clock,
  Shield,
  Activity,
  AlertTriangle,
  Send,
  Building2,
  RefreshCw,
  Globe,
  Users,
  History,
  ChevronRight,
  ShieldCheck
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Header from '../Header'
import LoginBPBD from '../LoginBPBD'
import NationalMap from './NationalMap'
import NationalPriorityRankings from './NationalPriorityRankings'
import NationalSupportQueue from './NationalSupportQueue'
import NationalResourceDistribution from './NationalResourceDistribution'
import NationalCapacityMatrix from './NationalCapacityMatrix'
import NationalEWSSection from './NationalEWSSection'
import NationalFamilyAggregator from './NationalFamilyAggregator'
import NationalBPBDAdmin from './NationalBPBDAdmin'
import NationalSitRepModal from './NationalSitRepModal'
import NationalActivityLogModal from './NationalActivityLogModal'
import './NationalDashboard.css'

export default function NationalDashboard() {
  const {
    isAuthenticated,
    adminLevel,
    wilayahNasionalList = [],
    permintaanDukunganList = [],
    distribusiNasionalList = [],
    akunBpbdList = [],
    nationalActiveTab,
    setNationalActiveTab,
    isNationalSitRepOpen,
    setIsNationalSitRepOpen,
    isNationalActivityLogOpen,
    setIsNationalActivityLogOpen,
    showNotif,
  } = useApp()

  if (!isAuthenticated || adminLevel !== 'nasional') {
    return <LoginBPBD initialRole="nasional" />
  }

  const [currentTime, setCurrentTime] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)

  // Real-time WIB Digital Clock
  useEffect(() => {
    const update = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB'
      )
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleManualSync = () => {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
      if (showNotif) {
        showNotif('Sinkronisasi data simulasi satelit & telemetry BPBD berhasil diperbarui.', 'info')
      }
    }, 400)
  }

  // Macro KPIs
  const totalWilayah = wilayahNasionalList.length
  const butuhEskalasiCount = wilayahNasionalList.filter((w) => w.butuhEskalasi).length
  const totalTerdampak = wilayahNasionalList.reduce((acc, curr) => acc + (curr.wargaTerdampak || 0), 0)
  const armadaBergerakCount = distribusiNasionalList.filter((d) => d.status !== 'Tiba di Posko').length
  const pendingRequestsCount = permintaanDukunganList.filter((r) => r.status === 'Menunggu Persetujuan').length
  const akunMenungguCount = akunBpbdList.filter((a) => a.status === 'Menunggu Verifikasi').length

  const todayStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="national-dashboard-page">
      <Header />

      <main className="national-dashboard-main" id="main-content">
        {/* 1. EXPANSIVE CALM COMMAND CENTER HERO (BNPB NASIONAL) */}
        <section className="national-command-hero" aria-label="Hero Pusdalops BNPB Nasional">
          <div className="hero-glow-layer" />

          <div className="hero-content-wrapper">
            <div className="hero-left-title-block">
              <div className="hero-eyebrow-pill">
                <span className="hero-pulse-dot" />
                <span className="eyebrow-agency">
                  PUSDALOPS BNPB PUSAT · PUSAT KENDALI KRISIS BENCANA NASIONAL
                </span>
                <span className="eyebrow-divider">|</span>
                <span className="eyebrow-time">
                  <Clock size={11} /> {currentTime || 'WIB'}
                </span>
              </div>

              <h1 className="hero-main-heading">
                Pusat Komando & Analisis <span className="hero-gradient-text">Bencana Nasional</span>
              </h1>

              <p className="hero-subtitle">
                Pantau perbandingan kapasitas 38 provinsi, eskalasikan perbantuan darurat ke BPBD daerah, koordinasikan mobilisasi logistik nasional, dan satukan data penanganan krisis bencana Republik Indonesia.
              </p>

              <div className="hero-meta-chips-row">
                <span className="hero-chip chip-hq">
                  <Building2 size={13} /> Graha BNPB Jakarta Timur
                </span>
                <span className="hero-chip chip-coverage">
                  <Globe size={13} /> Cakupan nasional: 38 provinsi · {totalWilayah} wilayah kejadian aktif
                </span>
                <span className="hero-chip chip-status">
                  <Activity size={13} /> Status Siaga Darurat Nasional
                </span>
                <span className="hero-chip chip-date">{todayStr}</span>
              </div>
            </div>

            {/* HERO ACTION BUTTONS (TINDAKAN KOMANDO UTAMA) */}
            <div className="hero-right-actions">
              <button
                type="button"
                className="btn-hero-admin-bpbd"
                onClick={() => setNationalActiveTab('akun-bpbd')}
                title="Buka panel pengelolaan & verifikasi akun resmi BPBD daerah"
              >
                <ShieldCheck size={16} />
                <span>Kelola Akun BPBD</span>
                {akunMenungguCount > 0 && (
                  <span className="hero-btn-badge">{akunMenungguCount}</span>
                )}
              </button>

              <button
                type="button"
                className="btn-hero-sitrep"
                onClick={() => setIsNationalSitRepOpen(true)}
                title="Buat Laporan Situasi Bencana Nasional (SitRep BNPB) untuk Presiden & Kabinet"
              >
                <FileText size={16} />
                <span>Buat SitRep Nasional</span>
              </button>
            </div>
          </div>
        </section>

        {/* 2. MACRO KPI RIBBON */}
        <section className="national-macro-kpi-ribbon" aria-label="Ringkasan indikator makro nasional">
          <div className="ribbon-card">
            <div className="ribbon-icon-circle blue">
              <Compass size={18} />
            </div>
            <div className="ribbon-info">
              <span className="ribbon-val">{totalWilayah} Daerah</span>
              <span className="ribbon-lbl">Wilayah Bencana Terpantau</span>
            </div>
          </div>

          <div className="ribbon-card highlight-critical">
            <div className="ribbon-icon-circle red">
              <AlertTriangle size={18} />
            </div>
            <div className="ribbon-info">
              <span className="ribbon-val">{butuhEskalasiCount} Wilayah</span>
              <span className="ribbon-lbl">Butuh Dukungan Pusat</span>
            </div>
          </div>

          <div className="ribbon-card">
            <div className="ribbon-icon-circle orange">
              <Users size={18} />
            </div>
            <div className="ribbon-info">
              <span className="ribbon-val">{totalTerdampak.toLocaleString('id-ID')} Jiwa</span>
              <span className="ribbon-lbl">Warga Terdampak Nasional</span>
            </div>
          </div>

          <div className="ribbon-card">
            <div className="ribbon-icon-circle green">
              <Truck size={18} />
            </div>
            <div className="ribbon-info">
              <span className="ribbon-val">{armadaBergerakCount} Pengiriman</span>
              <span className="ribbon-lbl">Armada Logistik Bergerak</span>
            </div>
          </div>
        </section>

        {/* 3. CALM EXPANSIVE TABBED NAVIGATION BAR */}
        <nav className="national-navigation-toolbar" aria-label="Menu navigasi komando nasional">
          <div className="nav-tabs-scroll-container">
            <div className="nav-tabs-left" role="tablist">
              <button
                type="button"
                className={`nav-tab-btn ${nationalActiveTab === 'peta' ? 'active' : ''}`}
                onClick={() => setNationalActiveTab('peta')}
                role="tab"
                aria-selected={nationalActiveTab === 'peta'}
              >
                <Compass size={15} />
                <span className="tab-label-full">Peta & Prioritas Nasional</span>
                <span className="tab-label-short">Peta</span>
              </button>

              <button
                type="button"
                className={`nav-tab-btn ${nationalActiveTab === 'permintaan' ? 'active' : ''}`}
                onClick={() => setNationalActiveTab('permintaan')}
                role="tab"
                aria-selected={nationalActiveTab === 'permintaan'}
              >
                <Inbox size={15} />
                <span className="tab-label-full">Permintaan Dukungan BPBD</span>
                <span className="tab-label-short">Dukungan</span>
                {pendingRequestsCount > 0 && (
                  <span className="tab-pill-badge red">{pendingRequestsCount}</span>
                )}
              </button>

              <button
                type="button"
                className={`nav-tab-btn ${nationalActiveTab === 'distribusi' ? 'active' : ''}`}
                onClick={() => setNationalActiveTab('distribusi')}
                role="tab"
                aria-selected={nationalActiveTab === 'distribusi'}
              >
                <Truck size={15} />
                <span className="tab-label-full">Distribusi Sumber Daya</span>
                <span className="tab-label-short">Distribusi</span>
                {armadaBergerakCount > 0 && (
                  <span className="tab-pill-badge green">{armadaBergerakCount}</span>
                )}
              </button>

              <button
                type="button"
                className={`nav-tab-btn ${nationalActiveTab === 'kapasitas' ? 'active' : ''}`}
                onClick={() => setNationalActiveTab('kapasitas')}
                role="tab"
                aria-selected={nationalActiveTab === 'kapasitas'}
              >
                <BarChart3 size={15} />
                <span className="tab-label-full">Perbandingan Kapasitas Daerah</span>
                <span className="tab-label-short">Kapasitas</span>
              </button>

              <button
                type="button"
                className={`nav-tab-btn ${nationalActiveTab === 'keluarga' ? 'active' : ''}`}
                onClick={() => setNationalActiveTab('keluarga')}
                role="tab"
                aria-selected={nationalActiveTab === 'keluarga'}
              >
                <HeartHandshake size={15} />
                <span className="tab-label-full">Temukan Keluarga Lintas Wilayah</span>
                <span className="tab-label-short">Keluarga</span>
              </button>

              <button
                type="button"
                className={`nav-tab-btn ${nationalActiveTab === 'ews' ? 'active' : ''}`}
                onClick={() => setNationalActiveTab('ews')}
                role="tab"
                aria-selected={nationalActiveTab === 'ews'}
              >
                <Radio size={15} />
                <span className="tab-label-full">EWS Nasional Terarah</span>
                <span className="tab-label-short">EWS</span>
              </button>

              <button
                type="button"
                className={`nav-tab-btn ${nationalActiveTab === 'akun-bpbd' ? 'active' : ''}`}
                onClick={() => setNationalActiveTab('akun-bpbd')}
                role="tab"
                aria-selected={nationalActiveTab === 'akun-bpbd'}
              >
                <ShieldCheck size={15} />
                <span className="tab-label-full">Administrasi Akun BPBD</span>
                <span className="tab-label-short">Akun BPBD</span>
                {akunMenungguCount > 0 && (
                  <span className="tab-pill-badge red">{akunMenungguCount}</span>
                )}
              </button>
            </div>

            <div className="nav-tabs-mobile-hint" aria-hidden="true" title="Geser untuk menu lainnya">
              <span>Geser menu</span>
              <ChevronRight size={13} />
            </div>
          </div>

          <div className="nav-sync-right">
            {/* LOG AKTIVITAS DI UTILITY BAR */}
            <button
              type="button"
              className="btn-nav-log-aktivitas"
              onClick={() => setIsNationalActivityLogOpen(true)}
              title="Buka Catatan Log Aktivitas Komando Resmi BNPB"
            >
              <History size={14} />
              <span>Log Aktivitas</span>
            </button>

            {/* TOMBOL PERBARUI DATA DENGAN IKON & TEKS JELAS */}
            <button
              type="button"
              className="btn-perbarui-data"
              onClick={handleManualSync}
              title="Perbarui sinkronisasi satelit & telemetry BPBD"
            >
              <RefreshCw size={14} className={isSyncing ? 'spinning' : ''} />
              <span>Perbarui Data</span>
            </button>
          </div>
        </nav>

        {/* 4. TAB CONTENTS */}
        <div className="national-tab-content-container">
          {nationalActiveTab === 'peta' && (
            <div className="tab-peta-view-layout">
              {/* PETA NASIONAL SEBAGAI PUSAT DASHBOARD */}
              <NationalMap />

              {/* PERINGKAT DAERAH PRIORITAS */}
              <NationalPriorityRankings />
            </div>
          )}

          {nationalActiveTab === 'permintaan' && <NationalSupportQueue />}

          {nationalActiveTab === 'distribusi' && <NationalResourceDistribution />}

          {nationalActiveTab === 'kapasitas' && <NationalCapacityMatrix />}

          {nationalActiveTab === 'keluarga' && <NationalFamilyAggregator />}

          {nationalActiveTab === 'ews' && <NationalEWSSection />}

          {nationalActiveTab === 'akun-bpbd' && <NationalBPBDAdmin />}
        </div>
      </main>

      {/* NATIONAL SITREP MODAL */}
      <NationalSitRepModal
        isOpen={isNationalSitRepOpen}
        onClose={() => setIsNationalSitRepOpen(false)}
      />

      {/* NATIONAL AUDIT ACTIVITY LOG MODAL */}
      <NationalActivityLogModal
        isOpen={isNationalActivityLogOpen}
        onClose={() => setIsNationalActivityLogOpen(false)}
      />
    </div>
  )
}
