import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Users, PenTool, Phone, Rocket, Plus, ShieldCheck, Radio } from 'lucide-react'
import AddRelawanModal from './AddRelawanModal'
import './VolunteerDispatchSection.css'

export default function VolunteerDispatchSection() {
  const { relawanList, setDispatchModalOpen, setDispatchTargetReport, setDispatchTargetVolunteerId } = useApp()
  const [filterSpec, setFilterSpec] = useState('Semua')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const specs = ['Semua', 'Water Rescue', 'Medis', 'Dapur', 'K9', 'Logistik', 'Psikososial']

  const filtered = filterSpec === 'Semua'
    ? relawanList
    : relawanList.filter((r) => r.spesialisasi.toLowerCase().includes(filterSpec.toLowerCase()))

  const handleDispatch = (rel) => {
    setDispatchTargetReport(null)
    setDispatchTargetVolunteerId(rel.id)
    setDispatchModalOpen(true)
  }

  const activeTeamsCount = relawanList.filter((r) =>
    ['Di Lokasi', 'Aktif Operasi', 'Menuju Lokasi'].includes(r.status)
  ).length

  return (
    <div className="volunteer-section-wrapper">
      {/* SECTION HEADER */}
      <div className="section-head-bar">
        <div className="head-bar-info">
          <div className="head-bar-icon-wrap">
            <Users size={22} />
          </div>
          <div>
            <h2 className="v-section-title">Pusat Penugasan & Bursa Relawan Siaga</h2>
            <p className="v-section-sub">
              Koordinasi tim relawan bersertifikasi, SAR, tenaga medis, dan unit respon darurat lapangan
            </p>
          </div>
        </div>

        <div className="v-stats-actions">
          <div className="v-stats-pill">
            <span className="v-stats-dot" />
            <span>Terdaftar: <strong>{relawanList.length} Tim</strong> ({activeTeamsCount} Bertugas)</span>
          </div>
          <button 
            type="button"
            className="btn-add-relawan-tactical"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={16} /> Tambah Tim Relawan
          </button>
        </div>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="v-filter-toolbar">
        {specs.map((s) => {
          const count = s === 'Semua'
            ? relawanList.length
            : relawanList.filter((r) => r.spesialisasi.toLowerCase().includes(s.toLowerCase())).length
          return (
            <button
              key={s}
              type="button"
              className={`v-filter-btn ${filterSpec === s ? 'active' : ''}`}
              onClick={() => setFilterSpec(s)}
            >
              <span>{s}</span>
              <span className="v-filter-count">{count}</span>
            </button>
          )
        })}
      </div>

      {/* TEAM CARDS GRID */}
      <div className="v-cards-grid">
        {filtered.map((rel) => {
          const statusClass = rel.status.toLowerCase().replace(/[\s()]+/g, '-')
          const isOperational = ['di-lokasi', 'aktif-operasi', 'menuju-lokasi'].includes(statusClass)

          return (
            <div key={rel.id} className="v-team-card">
              <div className="v-card-top">
                <span className="v-team-id">#{rel.id}</span>
                <span className={`v-status-badge ${statusClass}`}>
                  {isOperational && <span className="status-ping-mini" />}
                  {rel.status}
                </span>
              </div>

              <h3 className="v-team-name">{rel.namaTim}</h3>
              <div className="v-team-spec">
                <PenTool size={13} /> {rel.spesialisasi}
              </div>

              <div className="v-card-meta-row">
                <div className="v-meta-item">
                  <span className="v-meta-label">Kekuatan Personel</span>
                  <span className="v-meta-val">{rel.jumlahPersonel} Personel</span>
                </div>
                <div className="v-meta-item">
                  <span className="v-meta-label">Lokasi Penugasan</span>
                  <span className="v-meta-val v-task-val" title={rel.lokasiTugas || 'Siaga di Posko'}>
                    {rel.lokasiTugas || 'Siaga di Posko'}
                  </span>
                </div>
              </div>

              {rel.catatanPenugasan && (
                <div className="v-task-note">
                  <strong>Instruksi Komando:</strong> {rel.catatanPenugasan}
                </div>
              )}

              <div className="v-gear-section">
                <div className="v-gear-title">Perlengkapan Lapangan:</div>
                <div className="v-gear-tags">
                  {rel.perlengkapan.map((g, i) => (
                    <span key={i} className="v-gear-tag">
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              <div className="v-card-footer">
                <span className="v-contact">
                  <Phone size={13} /> {rel.kontak}
                </span>
                <button
                  type="button"
                  className="btn-v-dispatch"
                  onClick={() => handleDispatch(rel)}
                >
                  <Rocket size={14} /> Tugaskan Tim
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <AddRelawanModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  )
}
