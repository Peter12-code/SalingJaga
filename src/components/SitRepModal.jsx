import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import {
  FileText,
  Copy,
  Download,
  Printer,
  X,
  Check,
  Building2,
  AlertTriangle,
  Users,
  Compass,
  Boxes,
  ShieldCheck,
  Send
} from 'lucide-react'
import './SitRepModal.css'

export default function SitRepModal({ isOpen, onClose }) {
  const {
    bpbdWilayah = 'Tangerang',
    statusWilayah = 'Siaga',
    laporan = [],
    poskoList = [],
    relawanList = [],
    logistikList = [],
    showNotif,
    catatAktivitas,
  } = useApp()

  const [customCatatan, setCustomCatatan] = useState(
    'Prioritas evakuasi kelompok rentan lansia dan balita di RW 06 Ciledug Indah. Tim perahu karet tambahan berkoordinasi dengan Basarnas.'
  )
  const [copied, setCopied] = useState(false)

  // Keyboard accessibility: tombol Esc menutup modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const now = new Date()
  const tanggalStr = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const jamStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'

  // Calculations for SitRep
  const totalLaporan = laporan.length
  const laporanAktif = laporan.filter((l) => l.status !== 'Selesai')
  const totalJiwaTerdampak = laporan.reduce((acc, curr) => acc + (Number(curr.jumlahWarga) || 0), 0)
  const totalBalitaLansia = laporan.reduce((acc, curr) => acc + (Number(curr.balitaDanLansia) || 0), 0)
  const totalLuka = laporan.reduce((acc, curr) => acc + (Number(curr.korbanLuka) || 0), 0)
  const totalMengungsi = laporan.reduce((acc, curr) => acc + (Number(curr.wargaMengungsi) || 0), 0)

  // Unmet needs aggregation
  const unmetNeedsList = []
  laporan.forEach((l) => {
    if (Array.isArray(l.kebutuhanDetail)) {
      l.kebutuhanDetail.forEach((kd) => {
        const sisa = kd.target - kd.terpenuhi
        if (sisa > 0) {
          unmetNeedsList.push(`${kd.nama}: sisa ${sisa} ${kd.satuan} (${l.lokasi})`)
        }
      })
    }
  })

  // Format Text for WhatsApp / Pimpinan / BNPB
  const generateSitRepText = () => {
    return `*LAPORAN SITUASI HARIAN (SITREP) PUSDALOPS BPBD KOTA ${bpbdWilayah.toUpperCase()}*
*Waktu:* ${tanggalStr}, ${jamStr}
*Status Wilayah:* ${statusWilayah.toUpperCase()}
------------------------------------------
*1. RINGKASAN DAMPAK BENCANA*
• Total Kejadian Terlapor: ${totalLaporan} titik (${laporanAktif.length} aktif, ${totalLaporan - laporanAktif.length} selesai)
• Total Warga Terdampak: ${totalJiwaTerdampak.toLocaleString('id-ID')} jiwa
• Kelompok Rentan (Balita & Lansia): ${totalBalitaLansia} jiwa
• Korban Luka: ${totalLuka} jiwa
• Warga Mengungsi: ${totalMengungsi} jiwa

*2. STATUS AKSES & LOKASI KEJADIAN*
${laporanAktif.map((l, idx) => `${idx + 1}. [${l.id}] ${l.jenis} - ${l.lokasi}
   - Status Akses: ${(l.aksesLokasi || 'terbatas').toUpperCase()}
   - Status Penanganan: ${l.status}
   - Kebutuhan: ${l.kebutuhan || '-'}`).join('\n')}

*3. POSKO PENGUNGSIAN & KAPASITAS*
${poskoList.map((p, idx) => `${idx + 1}. ${p.nama} (${p.lokasi})
   - Kapasitas: ${p.terisi}/${p.dayaTampung} jiwa (Sisa daya tampung: ${p.dayaTampung - p.terisi} jiwa)`).join('\n')}

*4. KEBUTUHAN TERDESAK BELUM TERPENUHI*
${unmetNeedsList.length > 0 ? unmetNeedsList.slice(0, 5).map((u, i) => `• ${u}`).join('\n') : '• Logistik utama terpantau aman terkendali'}

*5. KEKUATAN PERSONEL & TIM SAR*
• Tim Aktif Dikerahkan: ${relawanList.filter((r) => r.status === 'Bertugas' || r.status === 'Menuju Lokasi').length} tim
• Tim Siaga Pusdalops: ${relawanList.filter((r) => r.status === 'Siaga').length} tim

*6. CATATAN KHUSUS & REKOMENDASI PUSDALOPS*
${customCatatan || 'Situasi dalam pantauan aktif satgas.'}

------------------------------------------
_Dilaporkan resmi oleh Pusdalops BPBD Kota ${bpbdWilayah} via SalingJaga Command Platform._`
  }

  const handleCopyWA = () => {
    const text = generateSitRepText()
    navigator.clipboard.writeText(text)
    setCopied(true)
    catatAktivitas('ringkasan_dibuat', `Menyusun dan menyalin Ringkasan Situasi Harian (SitRep) untuk Pimpinan/BNPB (${tanggalStr})`)
    if (showNotif) {
      showNotif('📋 Ringkasan SitRep berhasil disalin! Format rapi siap dikirim ke grup WhatsApp pimpinan atau BNPB.', 'success')
    }
    setTimeout(() => setCopied(false), 3000)
  }

  const handleDownloadTxt = () => {
    const text = generateSitRepText()
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const dateFormatted = now.toISOString().slice(0, 10).replace(/-/g, '')
    link.href = url
    link.download = `SITREP_BPBD_${bpbdWilayah.toUpperCase()}_${dateFormatted}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    catatAktivitas('ringkasan_dibuat', `Mengunduh berkas laporan SitRep TXT resmi Kota ${bpbdWilayah}`)
    if (showNotif) {
      showNotif('⬇️ Berkas SitRep TXT berhasil diunduh.', 'success')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleShareWhatsApp = () => {
    const text = generateSitRepText()
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
    catatAktivitas('ringkasan_dibuat', `Membagikan Ringkasan Situasi Harian (SitRep) via WhatsApp (${tanggalStr})`)
    if (showNotif) {
      showNotif('📲 Membuka WhatsApp untuk membagikan Laporan SitRep...', 'info')
    }
  }

  return (
    <div className="sitrep-modal-backdrop" onClick={onClose}>
      <div
        className="sitrep-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="local-sitrep-title"
      >
        {/* HEADER */}
        <div className="sitrep-header">
          <div className="sitrep-header-left">
            <div className="sitrep-icon-badge">
              <FileText size={22} />
            </div>
            <div>
              <div className="sitrep-eyebrow">PUSDALOPS BPBD KOTA {bpbdWilayah.toUpperCase()}</div>
              <h2 id="local-sitrep-title" className="sitrep-title">Ringkasan Situasi Harian (SitRep)</h2>
              <span className="sitrep-subtitle">
                Format standar komando siap kirim untuk Walikota, Kepala Pelaksana BPBD, dan BNPB Pusat
              </span>
            </div>
          </div>
          <button type="button" className="sitrep-btn-close" onClick={onClose} aria-label="Tutup">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="sitrep-body">
          {/* CONTROL STRIP */}
          <div className="sitrep-action-toolbar">
            <div className="sitrep-meta-indicator">
              <span className="sitrep-pulse-dot" />
              <span>Dihasilkan otomatis: <strong>{tanggalStr} · {jamStr}</strong></span>
            </div>
            <div className="sitrep-buttons-group">
              <button
                type="button"
                className={`btn-sitrep-copy ${copied ? 'copied' : ''}`}
                onClick={handleCopyWA}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Format WhatsApp'}</span>
              </button>
              <button
                type="button"
                className="btn-sitrep-download"
                onClick={handleDownloadTxt}
              >
                <Download size={16} />
                <span>Unduh .TXT</span>
              </button>
              <button
                type="button"
                className="btn-sitrep-print"
                onClick={handlePrint}
              >
                <Printer size={16} />
                <span>Cetak</span>
              </button>
            </div>
          </div>

          {/* EDITABLE CATATAN PUSDALOPS */}
          <div className="sitrep-custom-note-card">
            <label htmlFor="customCatatan" className="sitrep-note-label">
              <ShieldCheck size={15} /> Tambahkan Catatan / Arahan Khusus Pimpinan:
            </label>
            <textarea
              id="customCatatan"
              className="sitrep-note-input"
              rows={2}
              value={customCatatan}
              onChange={(e) => setCustomCatatan(e.target.value)}
              placeholder="Tuliskan arahan taktis atau kebutuhan eskalasi BNPB..."
            />
          </div>

          {/* PREVIEW CONTAINER */}
          <div className="sitrep-preview-box">
            <div className="sitrep-preview-header">
              <span className="sitrep-preview-watermark">PREVIEW RESMI · DOKUMEN INTELIJEN BENCANA</span>
              <span className={`sitrep-preview-status status-${(statusWilayah || 'siaga').toLowerCase()}`}>
                STATUS: {statusWilayah.toUpperCase()}
              </span>
            </div>

            <div className="sitrep-kpi-summary-grid">
              <div className="kpi-box">
                <span className="kpi-num">{totalLaporan}</span>
                <span className="kpi-label">Kejadian Terlapor</span>
              </div>
              <div className="kpi-box">
                <span className="kpi-num">{totalJiwaTerdampak.toLocaleString('id-ID')}</span>
                <span className="kpi-label">Jiwa Terdampak</span>
              </div>
              <div className="kpi-box text-orange">
                <span className="kpi-num">{totalBalitaLansia}</span>
                <span className="kpi-label">Balita / Lansia</span>
              </div>
              <div className="kpi-box text-blue">
                <span className="kpi-num">{totalMengungsi}</span>
                <span className="kpi-label">Warga di Posko</span>
              </div>
            </div>

            <pre className="sitrep-monospaced-text">
              {generateSitRepText()}
            </pre>
          </div>
        </div>

        {/* FOOTER */}
        <div className="sitrep-footer">
          <span className="sitrep-footer-hint">
            💡 <strong>Tips:</strong> Klik "Salin Format WhatsApp" di atas untuk menyalin, atau bagikan langsung draf ke WhatsApp.
          </span>
          <button type="button" className="btn-sitrep-primary-action" onClick={handleShareWhatsApp}>
            <Send size={16} />
            <span>Bagikan via WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  )
}
