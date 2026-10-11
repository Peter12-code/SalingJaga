import { useState } from 'react'
import {
  Building2,
  Users,
  Compass,
  Package,
  AlertTriangle,
  Plus,
  PhoneCall,
  Search,
  X,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import './PoskoCoordinationModal.css'

export default function PoskoCoordinationModal({ isOpen, onClose, onOpenAddPosko, onFocusPoskoOnMap }) {
  const { poskoList = [], setActiveTab, bpbdWilayah = 'Tangerang' } = useApp()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('semua') // 'semua' | 'kritis' | 'tersedia'

  if (!isOpen) return null

  // Posko pengungsian
  const shelterList = poskoList.map((p) => {
    const totalCap = Number(p.kapasitas || 0)
    const filled = Number(p.terisi || 0)
    const remaining = Math.max(0, totalCap - filled)
    const ratio = totalCap > 0 ? filled / totalCap : 0
    const isFullOrCritical = ratio >= 0.85
    const needs = p.kebutuhanTerdesak || (
      isFullOrCritical
        ? 'Makanan siap saji, Matras & selimut, Air mineral galon'
        : 'Suplemen vitamin, Paket P3K, Popok balita'
    )
    return {
      ...p,
      totalCap,
      filled,
      remaining,
      ratio,
      isFullOrCritical,
      needs,
    }
  })

  const totalCapAll = shelterList.reduce((acc, p) => acc + p.totalCap, 0)
  const totalFilledAll = shelterList.reduce((acc, p) => acc + p.filled, 0)
  const totalRemainingAll = Math.max(0, totalCapAll - totalFilledAll)
  const criticalCount = shelterList.filter((p) => p.isFullOrCritical).length

  const filteredShelters = shelterList.filter((p) => {
    if (filterStatus === 'kritis' && !p.isFullOrCritical) return false
    if (filterStatus === 'tersedia' && p.isFullOrCritical) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const text = `${p.nama || ''} ${p.alamat || ''} ${p.needs || ''} ${p.koordinator || ''}`.toLowerCase()
      return text.includes(q)
    }
    return true
  })

  const handleLihatPeta = (posko) => {
    onClose()
    if (setActiveTab) setActiveTab('map')
    if (onFocusPoskoOnMap) {
      setTimeout(() => onFocusPoskoOnMap(posko), 150)
    }
  }

  const handlePasokLogistik = () => {
    onClose()
    if (setActiveTab) setActiveTab('logistics')
  }

  return (
    <div
      className="posko-modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Modal Pusat Koordinasi Posko"
    >
      <div className="posko-modal-container">
        {/* Header */}
        <div className="posko-modal-header">
          <div className="posko-header-left">
            <div className="posko-header-icon-badge">
              <Building2 size={22} />
            </div>
            <div>
              <div className="posko-header-eyebrow">
                KOMANDO EVAKUASI · BPBD KOTA {bpbdWilayah.toUpperCase()}
              </div>
              <h2 className="posko-modal-title">Pusat Koordinasi Posko</h2>
            </div>
          </div>

          <div className="posko-header-actions">
            <button
              type="button"
              className="btn-posko-add-trigger"
              onClick={() => {
                onClose()
                if (onOpenAddPosko) onOpenAddPosko()
              }}
            >
              <Plus size={15} />
              <span>Tambah Posko Baru</span>
            </button>
            <button
              type="button"
              className="btn-posko-close"
              onClick={onClose}
              aria-label="Tutup pusat koordinasi posko"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Ringkasan Kapasitas Wilayah */}
        <div className="posko-metrics-row">
          <div className="metric-card-posko">
            <span className="metric-icon-wrap total">
              <Building2 size={18} />
            </span>
            <div className="metric-meta">
              <span className="metric-val">{shelterList.length}</span>
              <span className="metric-lbl">Titik Posko Terdaftar</span>
            </div>
          </div>

          <div className="metric-card-posko">
            <span className="metric-icon-wrap remaining">
              <Users size={18} />
            </span>
            <div className="metric-meta">
              <span className="metric-val text-green">{totalRemainingAll.toLocaleString('id-ID')}</span>
              <span className="metric-lbl">Total Kapasitas Tersisa (Jiwa)</span>
            </div>
          </div>

          <div className="metric-card-posko">
            <span className="metric-icon-wrap critical">
              <AlertTriangle size={18} />
            </span>
            <div className="metric-meta">
              <span className={`metric-val ${criticalCount > 0 ? 'text-red' : 'text-green'}`}>
                {criticalCount}
              </span>
              <span className="metric-lbl">Posko Kapasitas Kritis (≥85%)</span>
            </div>
          </div>
        </div>

        {/* Toolbar & Filter */}
        <div className="posko-toolbar">
          <div className="posko-search-box">
            <Search size={15} />
            <input
              type="text"
              placeholder="Cari posko, alamat, atau kebutuhan logistik..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="posko-filter-tabs">
            <button
              type="button"
              className={`filter-tab-btn ${filterStatus === 'semua' ? 'active' : ''}`}
              onClick={() => setFilterStatus('semua')}
            >
              Semua ({shelterList.length})
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${filterStatus === 'kritis' ? 'active' : ''}`}
              onClick={() => setFilterStatus('kritis')}
            >
              Kapasitas Kritis ({criticalCount})
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${filterStatus === 'tersedia' ? 'active' : ''}`}
              onClick={() => setFilterStatus('tersedia')}
            >
              Siap Tampung ({shelterList.length - criticalCount})
            </button>
          </div>
        </div>

        {/* Daftar Posko Koordinasi */}
        <div className="posko-cards-scroll">
          {filteredShelters.length === 0 ? (
            <div className="posko-empty-state">
              <Building2 size={36} />
              <h4>Tidak ada posko yang cocok</h4>
              <p>Periksa kata kunci pencarian atau sesuaikan filter status.</p>
            </div>
          ) : (
            <div className="posko-grid-cards">
              {filteredShelters.map((item) => {
                const percent = Math.round(item.ratio * 100)
                const isVeryFull = percent >= 90
                return (
                  <article key={item.id} className="posko-coordination-card">
                    {/* Top Row: Nama & Status Kapasitas */}
                    <div className="posko-card-header">
                      <div>
                        <div className="posko-card-ident">
                          <span className="posko-id">{item.id}</span>
                          <span className="posko-badge-tag">{item.kategori?.toUpperCase() || 'POSKO'}</span>
                        </div>
                        <h4 className="posko-card-name">{item.nama}</h4>
                        <p className="posko-card-address">{item.alamat || 'Kota Tangerang'}</p>
                      </div>

                      <div className="posko-capacity-pill-box">
                        <span className={`capacity-status-chip ${isVeryFull ? 'critical' : item.isFullOrCritical ? 'warning' : 'safe'}`}>
                          {item.remaining === 0 ? 'Penuh 100%' : `${item.remaining} Jiwa Tersisa`}
                        </span>
                        <small className="capacity-sub-ratio">
                          Terisi {item.filled} / {item.totalCap} ({percent}%)
                        </small>
                      </div>
                    </div>

                    {/* Progress Bar Keterisian */}
                    <div className="posko-progress-wrapper">
                      <div className="posko-progress-bar">
                        <div
                          className={`progress-fill ${isVeryFull ? 'fill-red' : item.isFullOrCritical ? 'fill-amber' : 'fill-green'}`}
                          style={{ width: `${Math.min(100, percent)}%` }}
                        />
                      </div>
                    </div>

                    {/* KEBUTUHAN TERDESAK */}
                    <div className="posko-urgent-needs-box">
                      <div className="urgent-needs-header">
                        <AlertTriangle size={13} className="needs-icon-warn" />
                        <span className="urgent-needs-label">Kebutuhan Terdesak Posko:</span>
                      </div>
                      <p className="urgent-needs-text">{item.needs}</p>
                    </div>

                    {/* Fasilitas & Koordinator */}
                    <div className="posko-footer-meta">
                      <div className="posko-contact-pill">
                        <PhoneCall size={12} />
                        <span>{item.kontak || 'Satgas BPBD (0812-9988-7711)'}</span>
                      </div>

                      {item.fasilitas && (
                        <div className="posko-facilities-preview">
                          <span>Fasilitas: {Array.isArray(item.fasilitas) ? item.fasilitas.slice(0, 3).join(' · ') : item.fasilitas}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions: Tombol Melihat Lokasi di Peta & Pasok Logistik */}
                    <div className="posko-card-actions">
                      <button
                        type="button"
                        className="btn-posko-view-map"
                        onClick={() => handleLihatPeta(item)}
                        title="Tinjau langsung titik koordinat posko di Peta GIS"
                      >
                        <Compass size={14} />
                        <span>Lihat Lokasi di Peta</span>
                      </button>

                      <button
                        type="button"
                        className="btn-posko-supply-logistics"
                        onClick={handlePasokLogistik}
                        title="Buka Gudang Logistik untuk mengirimkan bantuan ke posko ini"
                      >
                        <Package size={14} />
                        <span>Kirim Pasokan Logistik</span>
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="posko-modal-footer">
          <span className="posko-footer-count">
            Menampilkan <strong>{filteredShelters.length}</strong> titik posko wilayah Kota Tangerang
          </span>
          <button type="button" className="btn-posko-close-action" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
