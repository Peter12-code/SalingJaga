import { useState, useEffect } from 'react'
import {
  History,
  X,
  Shield,
  Clock,
  MapPin,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Radio,
  Truck,
  HeartHandshake,
  Download,
  Lock,
  KeyRound,
  Archive,
  ShieldCheck
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import './NationalActivityLogModal.css'

export default function NationalActivityLogModal({ isOpen, onClose }) {
  const { aktivitasBNPB = [] } = useApp()
  const [filterType, setFilterType] = useState('semua')

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const filteredLogs = aktivitasBNPB.filter((log) => {
    if (filterType === 'semua') return true
    if (filterType === 'akun_bpbd') {
      return (
        log.tipe.includes('akun') ||
        log.tipe.includes('kredensial') ||
        log.tipe.includes('sesi')
      )
    }
    return log.tipe === filterType
  })

  const handleDownloadLog = () => {
    const textContent = [
      '================================================================',
      'LOG AUDIT & RIWAYAT AKTIVITAS KOMANDO PUSDALOPS BNPB PUSAT',
      `Diekspor pada: ${new Date().toLocaleString('id-ID')} WIB`,
      '================================================================\n',
      ...filteredLogs.map(
        (l, i) =>
          `[${i + 1}] ${l.waktu} | ${l.badge.toUpperCase()} | Operator: ${l.operator}\nWilayah: ${l.wilayah}\nUraian: ${l.deskripsi}\n`
      ),
    ].join('\n')

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `LOG-KOMANDO-BNPB-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getLogIcon = (tipe) => {
    switch (tipe) {
      case 'persetujuan_dukungan':
        return <Truck size={16} className="log-type-icon text-green" />
      case 'bantuan_tiba':
        return <CheckCircle2 size={16} className="log-type-icon text-emerald" />
      case 'status_wilayah':
        return <AlertTriangle size={16} className="log-type-icon text-amber" />
      case 'siaran_ews':
        return <Radio size={16} className="log-type-icon text-red" />
      case 'rekonsiliasi_keluarga':
        return <HeartHandshake size={16} className="log-type-icon text-blue" />
      case 'registrasi_akun':
      case 'verifikasi_akun':
      case 'reaktivasi_akun':
        return <ShieldCheck size={16} className="log-type-icon text-emerald" />
      case 'tangguhkan_akun':
        return <Lock size={16} className="log-type-icon text-red" />
      case 'reset_kredensial':
      case 'reset_password':
        return <KeyRound size={16} className="log-type-icon text-amber" />
      case 'arsipkan_akun':
        return <Archive size={16} className="log-type-icon text-slate" />
      default:
        return <FileText size={16} className="log-type-icon" />
    }
  }

  return (
    <div
      className="national-log-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="national-log-title"
    >
      <div className="national-log-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="national-log-header">
          <div className="log-header-left">
            <div className="log-header-badge">
              <History size={22} />
            </div>
            <div>
              <span className="log-header-eyebrow">AUDIT TRAIL & CATATAN AKSI RESMI</span>
              <h3 id="national-log-title" className="log-header-title">Log Aktivitas Komando BNPB Pusat</h3>
              <span className="log-header-sub">
                Seluruh aksi strategis persetujuan bantuan, perubahan status wilayah, dan penyiaran darurat tercatat transparan dengan stempel waktu dan identitas operator.
              </span>
            </div>
          </div>
          <button type="button" className="log-btn-close" onClick={onClose} aria-label="Tutup log">
            <X size={18} />
          </button>
        </div>

        {/* CONTROLS */}
        <div className="national-log-toolbar">
          <div className="log-filter-pills">
            <button
              type="button"
              className={`log-filter-btn ${filterType === 'semua' ? 'active' : ''}`}
              onClick={() => setFilterType('semua')}
            >
              Semua ({aktivitasBNPB.length})
            </button>
            <button
              type="button"
              className={`log-filter-btn ${filterType === 'persetujuan_dukungan' ? 'active' : ''}`}
              onClick={() => setFilterType('persetujuan_dukungan')}
            >
              Dukungan BPBD
            </button>
            <button
              type="button"
              className={`log-filter-btn ${filterType === 'status_wilayah' ? 'active' : ''}`}
              onClick={() => setFilterType('status_wilayah')}
            >
              Status Wilayah
            </button>
            <button
              type="button"
              className={`log-filter-btn ${filterType === 'siaran_ews' ? 'active' : ''}`}
              onClick={() => setFilterType('siaran_ews')}
            >
              Siaran EWS
            </button>
            <button
              type="button"
              className={`log-filter-btn ${filterType === 'rekonsiliasi_keluarga' ? 'active' : ''}`}
              onClick={() => setFilterType('rekonsiliasi_keluarga')}
            >
              Rekonsiliasi Keluarga
            </button>
            <button
              type="button"
              className={`log-filter-btn ${filterType === 'akun_bpbd' ? 'active' : ''}`}
              onClick={() => setFilterType('akun_bpbd')}
            >
              Administrasi Akun
            </button>
          </div>

          <button
            type="button"
            className="btn-download-audit-log"
            onClick={handleDownloadLog}
            title="Unduh berkas log audit format teks resmi"
          >
            <Download size={14} />
            <span>Unduh Berkas Log (.TXT)</span>
          </button>
        </div>

        {/* LOG LIST */}
        <div className="national-log-body">
          {filteredLogs.length === 0 ? (
            <div className="log-empty-state">
              <History size={36} className="text-muted" />
              <p>Belum ada catatan aktivitas untuk kategori ini.</p>
            </div>
          ) : (
            <div className="log-timeline-list">
              {filteredLogs.map((log) => (
                <div key={log.id} className="log-timeline-item">
                  <div className="log-item-icon-box">{getLogIcon(log.tipe)}</div>
                  <div className="log-item-content">
                    <div className="log-item-top">
                      <span className="log-item-badge">{log.badge}</span>
                      <span className="log-item-time">
                        <Clock size={12} /> {log.waktu} · {log.tanggal}
                      </span>
                    </div>
                    <p className="log-item-desc">{log.deskripsi}</p>
                    <div className="log-item-meta">
                      <span className="log-item-operator">
                        <Shield size={12} /> {log.operator}
                      </span>
                      <span className="log-item-region">
                        <MapPin size={12} /> Wilayah: {log.wilayah}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="national-log-footer">
          <span className="log-footer-hint">
            Catatan komando disimpan aman dan diverifikasi secara berkala untuk kepatuhan SOP Tanggap Darurat Nasional.
          </span>
          <button type="button" className="btn-log-done" onClick={onClose}>
            Tutup Log Komando
          </button>
        </div>
      </div>
    </div>
  )
}
