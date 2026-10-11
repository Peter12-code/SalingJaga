import { useState } from 'react'
import {
  Shield,
  FileCheck,
  Rocket,
  Building2,
  Radio,
  SlidersHorizontal,
  Clock,
  Filter,
  X,
  Search,
  CheckCircle,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import './BPBDActivityModal.css'

export default function BPBDActivityModal({ isOpen, onClose }) {
  const { aktivitasBPBD = [], bpbdWilayah = 'Tangerang' } = useApp()
  const [filterType, setFilterType] = useState('semua')
  const [searchQuery, setSearchQuery] = useState('')

  if (!isOpen) return null

  const FILTER_OPTIONS = [
    { id: 'semua', label: 'Semua Aktivitas' },
    { id: 'laporan_ditinjau', label: 'Laporan Ditinjau' },
    { id: 'tim_dikerahkan', label: 'Tim Dikerahkan' },
    { id: 'posko_ditambahkan', label: 'Posko Ditambahkan' },
    { id: 'ews_disiarkan', label: 'EWS Disiarkan' },
    { id: 'status_diubah', label: 'Status Wilayah' },
  ]

  const getActivityIcon = (tipe) => {
    switch (tipe) {
      case 'laporan_ditinjau':
        return <FileCheck size={16} className="act-icon-blue" />
      case 'tim_dikerahkan':
        return <Rocket size={16} className="act-icon-orange" />
      case 'posko_ditambahkan':
        return <Building2 size={16} className="act-icon-emerald" />
      case 'ews_disiarkan':
        return <Radio size={16} className="act-icon-red" />
      case 'status_diubah':
        return <SlidersHorizontal size={16} className="act-icon-purple" />
      default:
        return <Shield size={16} className="act-icon-slate" />
    }
  }

  const filteredActivities = aktivitasBPBD.filter((act) => {
    if (filterType !== 'semua' && act.tipe !== filterType) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const text = `${act.deskripsi || ''} ${act.badge || ''} ${act.id || ''}`.toLowerCase()
      return text.includes(q)
    }
    return true
  })

  return (
    <div
      className="activity-modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Modal Log Riwayat Aktivitas BPBD"
    >
      <div className="activity-modal-container">
        {/* Header */}
        <div className="activity-modal-header">
          <div className="activity-header-left">
            <div className="activity-header-icon-badge">
              <Shield size={22} />
            </div>
            <div>
              <div className="activity-header-eyebrow">
                BUKU LOG AUDIT OPERASIONAL RESMI
              </div>
              <h2 className="activity-modal-title">
                Riwayat Aktivitas BPBD Kota {bpbdWilayah}
              </h2>
            </div>
          </div>

          <button
            type="button"
            className="btn-activity-close"
            onClick={onClose}
            aria-label="Tutup jendela aktivitas"
          >
            <X size={18} />
          </button>
        </div>

        {/* Subheader info akun */}
        <div className="activity-account-banner">
          <div className="account-banner-pill">
            <span className="dot-active-account" />
            <span>Akun Resmi Satgas: <strong>BPBD Kota {bpbdWilayah}</strong></span>
          </div>
          <p className="account-banner-desc">
            Semua peninjauan laporan musibah, pengerahan tim relawan, penambahan titik posko, dan siaran peringatan dini tercatat permanen atas nama otoritas BPBD setempat.
          </p>
        </div>

        {/* Filter bar */}
        <div className="activity-toolbar">
          <div className="activity-search-box">
            <Search size={15} />
            <input
              type="text"
              placeholder="Cari aktivitas, ID laporan, atau tim..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="activity-filter-chips">
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`chip-filter-btn ${filterType === f.id ? 'active' : ''}`}
                onClick={() => setFilterType(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline List */}
        <div className="activity-timeline-scroll">
          {filteredActivities.length === 0 ? (
            <div className="activity-empty-state">
              <Clock size={36} />
              <h4>Tidak ada aktivitas yang cocok</h4>
              <p>Belum ada catatan aktivitas untuk filter atau kata kunci ini.</p>
            </div>
          ) : (
            <div className="activity-timeline-list">
              {filteredActivities.map((act) => (
                <div key={act.id} className="activity-timeline-item">
                  <div className="timeline-marker">
                    <div className={`timeline-icon-wrap ${act.tipe}`}>
                      {getActivityIcon(act.tipe)}
                    </div>
                    <div className="timeline-vertical-line" />
                  </div>

                  <div className="activity-item-card">
                    <div className="item-card-top">
                      <div className="item-meta-group">
                        <span className="item-id">{act.id}</span>
                        <span className={`item-badge-pill ${act.tipe}`}>
                          {act.badge || 'Aktivitas'}
                        </span>
                      </div>
                      <div className="item-time">
                        <Clock size={12} />
                        <span>{act.waktu} · {act.tanggal || 'Hari ini'}</span>
                      </div>
                    </div>

                    <p className="item-description">{act.deskripsi}</p>

                    <div className="item-card-bottom">
                      <span className="item-actor-pill">
                        <Shield size={12} /> {act.aktor || `BPBD Kota ${bpbdWilayah}`}
                      </span>
                      <span className="item-verified-badge">
                        <CheckCircle size={12} /> Tercatat di Log Audit
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="activity-modal-footer">
          <span className="footer-count-text">
            Menampilkan <strong>{filteredActivities.length}</strong> catatan aktivitas hari ini
          </span>
          <button type="button" className="btn-activity-done" onClick={onClose}>
            Selesai
          </button>
        </div>
      </div>
    </div>
  )
}
