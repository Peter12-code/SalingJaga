import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  Activity,
  AlertTriangle,
  CloudRain,
  Radio,
  ChevronLeft,
  ChevronRight,
  Phone,
  ShieldCheck,
  ExternalLink,
  X,
  Compass,
  MapPin,
  Clock
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import './LiveAlertTicker.css'

export default function LiveAlertTicker() {
  const {
    laporan = [],
    poskoList = [],
    peringatanList = [],
    setActiveTab,
    setCitizenTab,
    userRole,
    setShowForm
  } = useApp()

  const [alerts, setAlerts] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [bmkgRaw, setBmkgRaw] = useState(null)
  const timerRef = useRef(null)

  // 1. Fetch data BMKG terbaru dari backend
  useEffect(() => {
    let isMounted = true

    const loadBMKG = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/bmkg/live')
        if (!res.ok) throw new Error('Network error')
        const data = await res.json()
        if (!isMounted) return
        setBmkgRaw(data)

        const dynamicAlerts = []

        // Gempa BMKG
        if (data.gempa?.terbaru) {
          const g = data.gempa.terbaru
          dynamicAlerts.push({
            id: 'bmkg-gempa',
            badge: 'BMKG GEMPA',
            badgeColor: 'badge-red',
            icon: Activity,
            title: `Gempa M ${g.Magnitude || '4.0'} · ${g.Wilayah || 'Wilayah Indonesia'}`,
            subtitle: `Kedalaman ${g.Kedalaman || '10 km'} · ${g.Potensi || 'Tidak berpotensi tsunami'}`,
            time: g.Jam || 'Hari ini',
            details: g,
            type: 'gempa'
          })
        }

        // Cuaca / EWS BMKG
        if (data.cuaca?.peringatanCuaca || data.cuaca?.kondisi) {
          dynamicAlerts.push({
            id: 'bmkg-cuaca',
            badge: 'BMKG CUACA',
            badgeColor: 'badge-cyan',
            icon: CloudRain,
            title: data.cuaca.peringatanCuaca || `Kondisi Cuaca: ${data.cuaca.kondisi} (${data.cuaca.suhu}°C)`,
            subtitle: `Risiko Banjir: ${data.cuaca.risikoBanjir || 'Waspada Genangan'} · Kelembapan ${data.cuaca.kelembapan || 80}%`,
            time: 'Update Real-Time',
            details: data.cuaca,
            type: 'cuaca'
          })
        }

        // Laporan SalingJaga Terkini
        const criticalCount = laporan.filter(l => ['kritis', 'tinggi'].includes(l.analisisAI?.prioritas)).length
        dynamicAlerts.push({
          id: 'salingjaga-feed',
          badge: 'RADAR KEJADIAN',
          badgeColor: 'badge-amber',
          icon: AlertTriangle,
          title: `Pantauan SalingJaga: ${laporan.length} Titik Musibah Aktif (${criticalCount} Prioritas Tinggi)`,
          subtitle: `${poskoList.length} Posko & Faskes Evakuasi Siaga Menerima Warga`,
          time: 'Siaga 24 Jam',
          details: { laporan, poskoList },
          type: 'laporan'
        })

        // Hotline Darurat Bebas Pulsa
        dynamicAlerts.push({
          id: 'hotline-112',
          badge: 'DARURAT 24/7',
          badgeColor: 'badge-emerald',
          icon: Phone,
          title: 'Layanan Darurat Nasional Bebas Pulsa: Hubungi 112 / BASARNAS 115',
          subtitle: 'Respon Cepat BPBD, Tim Medis, Ambulans & Evakuasi Bencana',
          time: 'Bebas Pulsa',
          details: null,
          type: 'hotline'
        })

        setAlerts(dynamicAlerts)
      } catch {
        // Fallback alerts jika backend belum siap
        const criticalCount = laporan.filter(l => ['kritis', 'tinggi'].includes(l.analisisAI?.prioritas)).length
        setAlerts([
          {
            id: 'salingjaga-fallback-1',
            badge: 'RADAR SIAGA',
            badgeColor: 'badge-amber',
            icon: AlertTriangle,
            title: `Pantauan SalingJaga: ${laporan.length} Titik Musibah Aktif (${criticalCount} Prioritas Tinggi)`,
            subtitle: `${poskoList.length} Posko Evakuasi Siaga di Lapangan`,
            time: 'Siaga',
            type: 'laporan'
          },
          {
            id: 'hotline-fallback',
            badge: 'DARURAT 24/7',
            badgeColor: 'badge-emerald',
            icon: Phone,
            title: 'Hotline Darurat Nasional Bebas Pulsa: Call Center 112 & BASARNAS 115',
            subtitle: 'Respon Cepat Evakuasi & Tim Medis Lapangan',
            time: 'Bebas Pulsa',
            type: 'hotline'
          }
        ])
      }
    }

    loadBMKG()
    const interval = setInterval(loadBMKG, 60000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [laporan, poskoList])

  // 2. Carousel rotasi otomatis setiap 4.5 detik
  useEffect(() => {
    if (alerts.length <= 1 || isPaused) return

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % alerts.length)
    }, 4500)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [alerts.length, isPaused])

  // Handle ESC key and prevent body scroll when modal is open
  useEffect(() => {
    if (!modalOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setModalOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [modalOpen])

  const handlePrev = (e) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev - 1 + alerts.length) % alerts.length)
  }

  const handleNext = (e) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % alerts.length)
  }

  const handleOpenModal = () => {
    if (alerts.length > 0) {
      setSelectedAlert(alerts[currentIndex])
      setModalOpen(true)
    }
  }

  const handleOpenMap = () => {
    setModalOpen(false)
    setActiveTab('map')
    if (setCitizenTab) setCitizenTab('peta')
  }

  const handleOpenReportForm = () => {
    setModalOpen(false)
    setShowForm(true)
  }

  if (alerts.length === 0) return null

  const current = alerts[currentIndex] || alerts[0]
  const IconComponent = current.icon || AlertTriangle

  return (
    <>
      {/* Ticker Bar di Tengah Header */}
      <div
        className="header-ticker-pill"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onClick={handleOpenModal}
        role="button"
        tabIndex={0}
        title="Klik untuk melihat ringkasan peringatan dini & radar BMKG"
      >
        {/* Pulsing Live Dot & Badge */}
        <div className="ticker-badge-cluster">
          <span className="ticker-live-ping" />
          <span className={`ticker-chip ${current.badgeColor}`}>
            <IconComponent size={12} className="ticker-chip-icon" />
            <span>{current.badge}</span>
          </span>
        </div>

        {/* Ticker Content Sliding */}
        <div className="ticker-body">
          <div className="ticker-text-wrapper" key={current.id}>
            <span className="ticker-title">{current.title}</span>
            <span className="ticker-separator">·</span>
            <span className="ticker-subtitle">{current.subtitle}</span>
          </div>
        </div>

        {/* Action Controls & Counter */}
        <div className="ticker-controls">
          <span className="ticker-counter">
            {currentIndex + 1}/{alerts.length}
          </span>
          <button
            type="button"
            className="ticker-nav-btn"
            onClick={handlePrev}
            aria-label="Peringatan sebelumnya"
            title="Sebelumnya"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            type="button"
            className="ticker-nav-btn"
            onClick={handleNext}
            aria-label="Peringatan berikutnya"
            title="Berikutnya"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Modal Detail Peringatan Dini & Radar BMKG (Menggunakan createPortal agar tidak terpotong header) */}
      {modalOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="ticker-modal-backdrop"
          onClick={() => setModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="ticker-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ticker-modal-header">
              <div className="ticker-modal-header-left">
                <span className="ticker-modal-icon-badge">
                  <Radio size={20} />
                </span>
                <div>
                  <h3 className="ticker-modal-title">Radar Siaga & Peringatan Dini Nasional</h3>
                  <p className="ticker-modal-sub">Sumber Data Resmi: BMKG, BNPB, & Konsensus Warga SalingJaga</p>
                </div>
              </div>
              <button
                type="button"
                className="ticker-modal-close"
                onClick={() => setModalOpen(false)}
                aria-label="Tutup modal"
                title="Tutup (ESC)"
              >
                <X size={18} />
              </button>
            </div>

            <div className="ticker-modal-content">
              {/* Card 1: Gempa BMKG Terkini */}
              {bmkgRaw?.gempa?.terbaru ? (
                <div className="ticker-info-box box-gempa">
                  <div className="info-box-header">
                    <span className="info-box-badge badge-red">
                      <Activity size={14} /> BMKG AUTOGEMPA TERKINI
                    </span>
                    <span className="info-box-time">
                      <Clock size={12} /> {bmkgRaw.gempa.terbaru.Tanggal} · {bmkgRaw.gempa.terbaru.Jam}
                    </span>
                  </div>
                  <div className="gempa-grid-stats">
                    <div className="gempa-mag-badge">
                      <strong>M {bmkgRaw.gempa.terbaru.Magnitude}</strong>
                      <span>Kekuatan</span>
                    </div>
                    <div className="gempa-meta">
                      <h4>{bmkgRaw.gempa.terbaru.Wilayah}</h4>
                      <div className="gempa-detail-row">
                        <span>Kedalaman: <strong>{bmkgRaw.gempa.terbaru.Kedalaman}</strong></span>
                        <span>Koordinat: <strong>{bmkgRaw.gempa.terbaru.Coordinates}</strong></span>
                      </div>
                      <p className="gempa-potensi-note">
                        ⚠️ {bmkgRaw.gempa.terbaru.Potensi}
                      </p>
                    </div>
                  </div>
                  {bmkgRaw.gempa.terbaru.shakemapUrl && (
                    <div className="gempa-shakemap-preview">
                      <a
                        href={bmkgRaw.gempa.terbaru.shakemapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-shakemap-link"
                      >
                        <ExternalLink size={13} /> Buka Peta Guncangan BMKG Resmi (Shakemap)
                      </a>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Card 2: Pantauan Musibah Lapangan SalingJaga */}
              <div className="ticker-info-box box-situasi">
                <div className="info-box-header">
                  <span className="info-box-badge badge-amber">
                    <AlertTriangle size={14} /> SITUASI LAPANGAN TERKINI
                  </span>
                  <span className="info-box-time">Konsensus Komunitas Aktif</span>
                </div>
                <div className="situasi-stats-row">
                  <div className="situasi-stat-pill">
                    <strong>{laporan.length}</strong>
                    <span>Total Musibah</span>
                  </div>
                  <div className="situasi-stat-pill">
                    <strong>{laporan.filter(l => ['kritis', 'tinggi'].includes(l.analisisAI?.prioritas)).length}</strong>
                    <span>Prioritas Mendesak</span>
                  </div>
                  <div className="situasi-stat-pill">
                    <strong>{poskoList.length}</strong>
                    <span>Posko Terbuka</span>
                  </div>
                </div>
                <p className="situasi-note">
                  Laporan diverifikasi silang dengan koordinat satelit OpenStreetMap dan konfirmasi langsung dari warga sekitar.
                </p>
              </div>

              {/* Card 3: Hotline Darurat */}
              <div className="ticker-info-box box-hotline">
                <div className="info-box-header">
                  <span className="info-box-badge badge-emerald">
                    <Phone size={14} /> PANGGILAN DARURAT CEPAT
                  </span>
                  <span className="info-box-time">Siaga 24 Jam Bebas Pulsa</span>
                </div>
                <div className="hotline-grid">
                  <div className="hotline-item">
                    <span className="hotline-num">112</span>
                    <div>
                      <strong>Panggilan Darurat Terpadu</strong>
                      <small>Bebas Pulsa Nasional (Semua Operator)</small>
                    </div>
                  </div>
                  <div className="hotline-item">
                    <span className="hotline-num">115</span>
                    <div>
                      <strong>BASARNAS (SAR)</strong>
                      <small>Pencarian & Pertolongan Air/Darat</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="ticker-modal-footer">
              <button
                type="button"
                className="btn-ticker-close-secondary"
                onClick={() => setModalOpen(false)}
              >
                Tutup
              </button>
              <button
                type="button"
                className="btn-ticker-view-map"
                onClick={handleOpenMap}
              >
                <Compass size={16} /> Buka Peta Evakuasi
              </button>
              <button
                type="button"
                className="btn-ticker-report"
                onClick={handleOpenReportForm}
              >
                <AlertTriangle size={16} /> Laporkan Kejadian
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
