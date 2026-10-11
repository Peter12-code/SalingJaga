import { useState, useEffect } from 'react'
import { Activity, ShieldAlert, CheckCircle2, AlertTriangle, X, User, FileText, Clock } from 'lucide-react'
import './StatusWilayahModal.css'

export default function StatusWilayahModal({
  isOpen,
  onClose,
  currentStatus = 'Siaga',
  bpbdWilayah = 'Tangerang',
  onSaveStatus,
}) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)
  const [alasan, setAlasan] = useState('')
  const [petugas, setPetugas] = useState('Drs. H. Maryono Hasan, M.AP (Kalaksa)')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(currentStatus || 'Siaga')
      setAlasan('')
      setErrorMsg('')
    }
  }, [isOpen, currentStatus])

  if (!isOpen) return null

  const STATUS_OPTIONS = [
    {
      id: 'Normal',
      label: 'Status Normal',
      badgeColor: 'emerald',
      icon: CheckCircle2,
      headline: 'Kondisi Aman Terkendali',
      desc: 'Tidak ada ancaman hidrometeorologi signifikan. Satgas bertugas dalam jadwal piket rutin pemantauan sensor.',
    },
    {
      id: 'Siaga',
      label: 'Status Siaga',
      badgeColor: 'amber',
      icon: AlertTriangle,
      headline: 'Waspada Potensi Bahaya',
      desc: 'Peningkatan debit sungai/hujan ekstrem. Armada relawan, perahu karet, dan posko aju disiagakan di titik rawan.',
    },
    {
      id: 'Tanggap Darurat',
      label: 'Tanggap Darurat',
      badgeColor: 'red',
      icon: ShieldAlert,
      headline: 'Eskalasi Krisis Bencana',
      desc: 'Kejadian bencana aktif meluas. Aktivasi posko pengungsian utama, evakuasi SAR massal, dan mobilisasi logistik darurat.',
    },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!alasan.trim()) {
      setErrorMsg('Mohon isi alasan perubahan status kesiapsiagaan wilayah.')
      return
    }
    if (!petugas.trim()) {
      setErrorMsg('Mohon cantumkan nama petugas atau penanggung jawab yang mengesahkan.')
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      if (onSaveStatus) {
        onSaveStatus(selectedStatus, {
          alasan: alasan.trim(),
          petugas: petugas.trim(),
          waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        })
      }
      setIsSubmitting(false)
      onClose()
    }, 250)
  }

  return (
    <div className="status-dialog-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="status-dialog-box" role="dialog" aria-modal="true" aria-labelledby="status-dialog-title">
        {/* Header */}
        <div className="status-dialog-header">
          <div className="status-header-icon-wrap">
            <Activity size={20} className="status-icon-activity" />
          </div>
          <div className="status-header-text">
            <h3 id="status-dialog-title">Perbarui Status Kesiapsiagaan Wilayah</h3>
            <p>Pusdalops BPBD Kota {bpbdWilayah} · Penetapan Kondisi Operasional</p>
          </div>
          <button type="button" className="btn-status-dialog-close" onClick={onClose} aria-label="Tutup dialog">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="status-dialog-form">
          {/* Status Options Cards */}
          <div className="status-options-label">
            <span>Pilih Tingkat Kesiapsiagaan</span>
            <span className="current-indicator">Saat ini: <strong>{currentStatus}</strong></span>
          </div>

          <div className="status-options-grid">
            {STATUS_OPTIONS.map((opt) => {
              const Icon = opt.icon
              const isSelected = selectedStatus === opt.id
              return (
                <div
                  key={opt.id}
                  className={`status-option-card ${opt.badgeColor} ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedStatus(opt.id)
                    setErrorMsg('')
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedStatus(opt.id)
                    }
                  }}
                >
                  <div className="option-radio-indicator">
                    <span className={`radio-dot ${isSelected ? 'checked' : ''}`} />
                  </div>
                  <div className="option-card-content">
                    <div className="option-card-top">
                      <span className={`option-status-pill ${opt.badgeColor}`}>
                        <Icon size={14} /> {opt.label}
                      </span>
                    </div>
                    <strong className="option-headline">{opt.headline}</strong>
                    <p className="option-desc">{opt.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Form Fields: Alasan & Petugas */}
          <div className="status-form-group">
            <label htmlFor="status-alasan">
              <FileText size={15} />
              <span>Alasan Perubahan Status <span className="text-red">*</span></span>
            </label>
            <textarea
              id="status-alasan"
              rows={3}
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Contoh: Kenaikan TMA Pintu Air 10 mencapai 13.2 meter, BMKG mendeteksi curah hujan lebat di hulu selama 4 jam ke depan."
              required
            />
          </div>

          <div className="status-form-group">
            <label htmlFor="status-petugas">
              <User size={15} />
              <span>Pejabat / Petugas yang Mengesahkan <span className="text-red">*</span></span>
            </label>
            <input
              id="status-petugas"
              type="text"
              value={petugas}
              onChange={(e) => setPetugas(e.target.value)}
              placeholder="Nama dan jabatan (misal: Kalaksa BPBD)"
              required
            />
          </div>

          {errorMsg && (
            <div className="status-dialog-error" role="alert">
              <AlertTriangle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="status-dialog-footer">
            <button type="button" className="btn-status-cancel" onClick={onClose} disabled={isSubmitting}>
              Batal
            </button>
            <button
              type="submit"
              className={`btn-status-confirm ${selectedStatus === 'Tanggap Darurat' ? 'btn-red' : 'btn-emerald'}`}
              disabled={isSubmitting}
            >
              <CheckCircle2 size={16} />
              <span>{isSubmitting ? 'Menerapkan...' : `Terapkan Status ${selectedStatus}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
