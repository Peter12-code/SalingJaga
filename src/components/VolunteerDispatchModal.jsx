import { useState } from 'react'
import { useApp } from '../context/AppContext'
import './VolunteerDispatchModal.css'

export default function VolunteerDispatchModal() {
  const {
    dispatchModalOpen,
    setDispatchModalOpen,
    dispatchTargetReport,
    dispatchTargetVolunteerId,
    relawanList,
    laporan,
    dispatchRelawan,
  } = useApp()

  const [selectedRelawanId, setSelectedRelawanId] = useState(dispatchTargetReport ? '' : (dispatchTargetVolunteerId || ''))
  const [selectedReportId, setSelectedReportId] = useState(
    dispatchTargetReport?.id || (laporan[0] ? laporan[0].id : '')
  )
  const [notes, setNotes] = useState('')

  if (!dispatchModalOpen) return null

  const targetLaporan =
    laporan.find((l) => l.id === (dispatchTargetReport?.id || selectedReportId)) || laporan[0]
  const availableRelawan = relawanList

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedRelawanId) {
      alert('Pilih tim relawan yang akan ditugaskan.')
      return
    }
    dispatchRelawan(selectedRelawanId, targetLaporan, notes)
  }

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && setDispatchModalOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div className="dispatch-modal-card">
        
        <div className="dispatch-modal-header">
          <div className="dispatch-header-title">
            <span className="dispatch-siren-icon">🚨</span>
            <div>
              <h3>Penugasan Tim Relawan Cepat</h3>
              <p>Kerahkan unit tanggap darurat ke titik musibah</p>
            </div>
          </div>
          <button type="button" className="btn-close-dispatch" onClick={() => setDispatchModalOpen(false)} aria-label="Tutup formulir penugasan">
            ×
          </button>
        </div>

        {targetLaporan && (
          <div className="target-incident-box">
            <div className="target-top">
              <span className="target-id">{targetLaporan.id}</span>
              <span className="target-type">{targetLaporan.jenis}</span>
              <span className={`target-prio ${targetLaporan.analisisAI?.prioritas || 'sedang'}`}>
                {targetLaporan.analisisAI?.prioritas?.toUpperCase() || 'SEDANG'}
              </span>
            </div>
            <div className="target-loc">📍 {targetLaporan.lokasi}</div>
            <div className="target-victims">
              👥 <strong>{targetLaporan.jumlahWarga}</strong> Warga terdampak · Kebutuhan:{' '}
              {targetLaporan.kebutuhan.substring(0, 70)}...
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="dispatch-form">
          
          {!dispatchTargetReport && (
            <div className="form-group-dispatch">
              <label>Pilih Lokasi Kejadian Musibah</label>
              <select
                className="select-dispatch"
                value={selectedReportId}
                onChange={(e) => setSelectedReportId(e.target.value)}
              >
                {laporan.map((l) => (
                  <option key={l.id} value={l.id}>
                    [{l.id}] {l.jenis} - {l.lokasi} ({l.jumlahWarga} warga)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group-dispatch">
            <label>Pilih Tim / Unit Siaga Lapangan <span className="req">*</span></label>
            <div className="relawan-options-list">
              {availableRelawan.map((rel) => {
                const isSelected = selectedRelawanId === rel.id
                return (
                  <button
                    type="button"
                    key={rel.id}
                    className={`relawan-option-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedRelawanId(rel.id)}
                    aria-pressed={isSelected}
                  >
                    <div className="relawan-option-left">
                      <div className="relawan-name">
                        {rel.namaTim}
                        <span className={`rel-status-chip ${rel.status.toLowerCase().replace(/[\s()]+/g, '-')}`}>
                          {rel.status}
                        </span>
                      </div>
                      <div className="relawan-spec">🛠️ {rel.spesialisasi}</div>
                      <div className="relawan-gear">
                        📦 {rel.perlengkapan.join(' · ')}
                      </div>
                    </div>
                    <div className="relawan-option-right">
                      <span className="personel-badge">{rel.jumlahPersonel} Personel</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="form-group-dispatch">
            <label>Instruksi Taktis Khusus (Opsional)</label>
            <input
              type="text"
              className="input-dispatch"
              placeholder="contoh: Prioritaskan evakuasi lansia di RT 04, koordinasi dengan Kades di balai desa"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="dispatch-actions">
            <button
              type="button"
              className="btn-dispatch-cancel"
              onClick={() => setDispatchModalOpen(false)}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-dispatch-submit"
              disabled={!selectedRelawanId}
            >
              📡 Konfirmasi Kerahkan Tim Sekarang
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
