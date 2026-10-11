import { useState } from 'react'
import { CheckCircle2, Camera, Users, FileText, PackageCheck, X, AlertTriangle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import './CloseReportModal.css'

export default function CloseReportModal() {
  const { isCloseReportOpen, setIsCloseReportOpen, closeReportTarget, setCloseReportTarget, tutupLaporanResmi, bpbdWilayah = 'Tangerang' } = useApp()

  const [hasilAksi, setHasilAksi] = useState('')
  const [wargaTertangani, setWargaTertangani] = useState(closeReportTarget?.jumlahWarga || 0)
  const [fotoBukti, setFotoBukti] = useState('')
  const [logistikDisalurkan, setLogistikDisalurkan] = useState('')

  if (!isCloseReportOpen || !closeReportTarget) return null

  const PRESET_FOTO = [
    { label: 'Evakuasi Perahu SAR Selesai', url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80' },
    { label: 'Penyaluran Sembako Posko', url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80' },
    { label: 'Penanganan Medis & Tenda', url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80' },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!hasilAksi.trim()) {
      alert('Mohon isi ringkasan hasil aksi penanganan.')
      return
    }
    tutupLaporanResmi(closeReportTarget.id, {
      hasilAksi,
      wargaTertangani: Number(wargaTertangani) || closeReportTarget.jumlahWarga,
      fotoBukti: fotoBukti || closeReportTarget.foto,
      logistikDisalurkan: logistikDisalurkan || 'Tersalurkan penuh sesuai kebutuhan di lapangan',
    })
  }

  return (
    <div
      className="close-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsCloseReportOpen(false)
          setCloseReportTarget(null)
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Modal Penutupan Laporan Musibah"
    >
      <div className="close-modal-container">
        {/* Header */}
        <div className="close-modal-header">
          <div className="close-header-left">
            <div className="close-header-icon-badge">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div className="close-header-eyebrow">
                STANDAR OPERASIONAL PROSEDUR · BPBD KOTA {bpbdWilayah.toUpperCase()}
              </div>
              <h2 className="close-modal-title">Penutupan & Penyelesaian Laporan Musibah</h2>
            </div>
          </div>
          <button
            type="button"
            className="btn-close-modal-x"
            onClick={() => {
              setIsCloseReportOpen(false)
              setCloseReportTarget(null)
            }}
            aria-label="Batal penutupan laporan"
          >
            <X size={18} />
          </button>
        </div>

        {/* Info Insiden Target */}
        <div className="close-incident-summary">
          <div className="incident-summary-tag">
            <span>#{closeReportTarget.id}</span>
            <span className="dot-sep">·</span>
            <strong>{closeReportTarget.jenis}</strong>
          </div>
          <div className="incident-summary-loc">📍 {closeReportTarget.lokasi}</div>
          <p className="incident-summary-desc">{closeReportTarget.kondisi}</p>
        </div>

        {/* Notice Penutupan */}
        <div className="close-notice-box">
          <AlertTriangle size={16} className="notice-icon" />
          <p>
            Sebelum status diubah menjadi <strong>SELESAI</strong>, lengkapi hasil tindakan lapangan, verifikasi jumlah warga yang tertangani, dan lampirkan bukti foto agar arsip data bencana akuntabel untuk audit pimpinan dan BNPB.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="close-modal-form">
          <div className="form-group-close">
            <label htmlFor="hasil-aksi">
              Hasil Aksi & Penanganan Lapangan <span className="req">*</span>
            </label>
            <textarea
              id="hasil-aksi"
              rows={3}
              className="textarea-close"
              required
              placeholder="Contoh: Seluruh warga (320 jiwa) berhasil dievakuasi perahu karet ke Posko GOR Dimyati. Kebutuhan medis telah ditangani PMI dan debit air berangsur surut 40 cm..."
              value={hasilAksi}
              onChange={(e) => setHasilAksi(e.target.value)}
            />
          </div>

          <div className="form-row-close">
            <div className="form-group-close">
              <label htmlFor="warga-tertangani">
                Jumlah Warga Tertangani (Jiwa) <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <Users size={16} />
                <input
                  id="warga-tertangani"
                  type="number"
                  required
                  min={1}
                  className="input-close"
                  value={wargaTertangani}
                  onChange={(e) => setWargaTertangani(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group-close">
              <label htmlFor="logistik-disalurkan">
                Bantuan & Logistik yang Tersalurkan
              </label>
              <div className="input-with-icon">
                <PackageCheck size={16} />
                <input
                  id="logistik-disalurkan"
                  type="text"
                  className="input-close"
                  placeholder="Contoh: 150 paket sembako, 4 perahu karet, 60 matras"
                  value={logistikDisalurkan}
                  onChange={(e) => setLogistikDisalurkan(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-group-close">
            <label htmlFor="foto-bukti">
              Foto Bukti Penanganan Selesai (Dokumentasi Lapangan)
            </label>
            <div className="input-with-icon">
              <Camera size={16} />
              <input
                id="foto-bukti"
                type="url"
                className="input-close"
                placeholder="https://... URL foto dokumentasi satgas"
                value={fotoBukti}
                onChange={(e) => setFotoBukti(e.target.value)}
              />
            </div>

            {/* Presets Foto Cepat */}
            <div className="preset-photos-row">
              <span className="preset-label">Pilih Foto Cepat:</span>
              {PRESET_FOTO.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`btn-preset-photo ${fotoBukti === p.url ? 'active' : ''}`}
                  onClick={() => setFotoBukti(p.url)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="close-modal-footer">
            <button
              type="button"
              className="btn-cancel-close"
              onClick={() => {
                setIsCloseReportOpen(false)
                setCloseReportTarget(null)
              }}
            >
              Batal
            </button>
            <button type="submit" className="btn-confirm-close">
              <CheckCircle2 size={16} />
              <span>Sahkan & Tutup Laporan (Selesai)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
