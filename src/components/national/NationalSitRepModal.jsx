import { useState, useEffect } from 'react'
import {
  FileText,
  Copy,
  Download,
  Printer,
  X,
  Check,
  Send,
  Building2,
  ShieldCheck,
  Flame,
  Truck
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import './NationalSitRepModal.css'

export default function NationalSitRepModal({ isOpen, onClose }) {
  const {
    wilayahNasionalList = [],
    permintaanDukunganList = [],
    distribusiNasionalList = [],
    keluargaLintasDaerahData,
    showNotif,
  } = useApp()

  const [customArahan, setCustomArahan] = useState(
    'Prioritas pengerahan helikopter water bombing dan evakuasi di Lembah Anai (Sumbar). Koordinasi perkuatan jembatan darurat dengan Kementerian PUPR dan TNI AU.'
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

  // Macro Calculations
  const totalWilayah = wilayahNasionalList.length
  const totalKejadian = wilayahNasionalList.reduce((acc, curr) => acc + (curr.kejadianAktif || 0), 0)
  const totalTerdampak = wilayahNasionalList.reduce((acc, curr) => acc + (curr.wargaTerdampak || 0), 0)
  const totalPengungsi = wilayahNasionalList.reduce((acc, curr) => acc + (curr.wargaMengungsi || 0), 0)
  const totalLuka = wilayahNasionalList.reduce((acc, curr) => acc + (curr.korbanLuka || 0), 0)
  const totalMeninggal = wilayahNasionalList.reduce((acc, curr) => acc + (curr.korbanJiwa || 0), 0)

  const wilayahKritis = wilayahNasionalList.filter((w) => w.butuhEskalasi || w.keparahan === 'kritis')
  const armadaBergerak = distribusiNasionalList.filter((d) => d.status !== 'Tiba di Posko')

  const generateNationalSitRep = () => {
    return `*LAPORAN SITUASI BENCANA NASIONAL (DRAFT SITREP BNPB · DATA SIMULASI)*
*Nomor Berkas:* SITREP-NAS-SIM/${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}
*Waktu Penyusunan:* ${tanggalStr}, ${jamStr}
*Pusat Pengendali Operasi:* PUSDALOPS BNPB GRAHA BNPB JAKARTA (MODE SIMULASI)
--------------------------------------------------
*1. RINGKASAN SITUASI MAKRO NASIONAL*
• Total Wilayah Bencana Aktif: ${totalWilayah} Kabupaten/Kota (${wilayahKritis.length} wilayah butuh eskalasi pusat)
• Total Titik Kejadian Bencana: ${totalKejadian} lokasi
• Total Warga Terdampak: ${totalTerdampak.toLocaleString('id-ID')} jiwa
• Total Warga Mengungsi: ${totalPengungsi.toLocaleString('id-ID')} jiwa
• Korban Luka: ${totalLuka} jiwa | Korban Jiwa: ${totalMeninggal} jiwa

*2. PERINGKAT DAERAH KRITIS & BUTUH DUKUNGAN PUSAT*
${wilayahKritis.map((w, idx) => `${idx + 1}. [PRIORITAS #${w.rank}] ${w.nama} (${w.provinsi})
   - Status: ${w.status.toUpperCase()} (Urgensi: ${w.skorUrgensi}/100)
   - Bencana: ${w.jenisBencana} (${w.wargaTerdampak.toLocaleString('id-ID')} jiwa terdampak)
   - Alasan: ${w.alasanPrioritas}
   - Kebutuhan: ${w.kebutuhanUtama}
   - Kesiapan BPBD: ${w.responsBPBD}`).join('\n\n')}

*3. LOGISTIK & SUMBER DAYA NASIONAL YANG SEDANG BERGERAK*
${armadaBergerak.map((d, idx) => `${idx + 1}. ${d.namaBantuan}
   - Rute: ${d.asal} ➔ ${d.tujuan}
   - Moda & Status: ${d.moda} (${d.status} - ETA ${d.eta})
   - Manifest: ${d.noManifest}`).join('\n\n')}

*4. TEMUKAN KELUARGA LINTAS WILAYAH*
• Agregat Pencarian Nasional: ${keluargaLintasDaerahData?.agregatNasional?.totalLaporanPencarian || 1420} laporan (${keluargaLintasDaerahData?.agregatNasional?.berhasilDipertemukan || 1180} berhasil dipertemukan)
• Kasus Eskalasi Antarposko: ${keluargaLintasDaerahData?.kasusEskalasi?.length || 3} kasus terfasilitasi

*5. ARAHAN STRATEGIS PIMPINAN BNPB*
${customArahan || 'Operasi tanggap darurat terkendali penuh di bawah koordinasi Pusdalops BNPB.'}

--------------------------------------------------
_Laporan draft intelijen bencana disusun via SalingJaga National Platform (Simulasi Operasional)._`
  }

  const handleShareWhatsApp = () => {
    const text = generateNationalSitRep()
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
    if (showNotif) {
      showNotif('📲 Membuka WhatsApp untuk membagikan Laporan SitRep Nasional...', 'info')
    }
  }

  const handleCopy = () => {
    const text = generateNationalSitRep()
    navigator.clipboard.writeText(text)
    setCopied(true)
    if (showNotif) {
      showNotif('📋 Laporan Situasi Nasional (SitRep BNPB) berhasil disalin ke clipboard!', 'success')
    }
    setTimeout(() => setCopied(false), 3000)
  }

  const handleDownload = () => {
    const text = generateNationalSitRep()
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const dateFormatted = now.toISOString().slice(0, 10).replace(/-/g, '')
    link.href = url
    link.download = `SITREP_NASIONAL_BNPB_${dateFormatted}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    if (showNotif) {
      showNotif('⬇️ Berkas SitRep Nasional TXT berhasil diunduh.', 'success')
    }
  }

  return (
    <div className="national-sitrep-modal-backdrop" onClick={onClose}>
      <div
        className="national-sitrep-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="national-sitrep-title"
      >
        {/* HEADER */}
        <div className="national-sitrep-header">
          <div className="sitrep-header-left">
            <div className="sitrep-badge-icon">
              <FileText size={22} />
            </div>
            <div>
              <div className="sitrep-eyebrow">SALINGJAGA · DRAFT SITREP BNPB (DATA SIMULASI)</div>
              <h2 id="national-sitrep-title" className="sitrep-title">Laporan Situasi Bencana Nasional (SitRep BNPB)</h2>
              <span className="sitrep-subtitle">
                Ringkasan operasional situasi multi-wilayah untuk latihan koordinasi tanggap darurat (Simulasi Terintegrasi)
              </span>
            </div>
          </div>
          <button type="button" className="sitrep-btn-close" onClick={onClose} aria-label="Tutup">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="national-sitrep-body">
          {/* TOOLBAR */}
          <div className="sitrep-action-toolbar">
            <div className="sitrep-timestamp-badge">
              <span className="live-beacon-dot" />
              <span>Disusun otomatis: <strong>{tanggalStr} · {jamStr}</strong></span>
            </div>

            <div className="sitrep-btn-group">
              <button
                type="button"
                className={`btn-sitrep-copy ${copied ? 'copied' : ''}`}
                onClick={handleCopy}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Teks SitRep'}</span>
              </button>
              <button type="button" className="btn-sitrep-download" onClick={handleDownload}>
                <Download size={16} />
                <span>Unduh .TXT</span>
              </button>
              <button type="button" className="btn-sitrep-print" onClick={() => window.print()}>
                <Printer size={16} />
                <span>Cetak</span>
              </button>
            </div>
          </div>

          {/* EDITABLE ARAHAN */}
          <div className="sitrep-arahan-input-box">
            <label htmlFor="arahanPusat" className="arahan-label">
              <ShieldCheck size={15} /> Tambahkan Arahan Strategis Pimpinan BNPB:
            </label>
            <textarea
              id="arahanPusat"
              rows={2}
              className="arahan-textarea"
              value={customArahan}
              onChange={(e) => setCustomArahan(e.target.value)}
              placeholder="Tuliskan arahan pengerahan eskalasi dan koordinasi kementerian..."
            />
          </div>

          {/* PREVIEW CONTAINER WITH BIG WATERMARK */}
          <div className="sitrep-preview-container">
            <div className="sitrep-big-watermark" aria-hidden="true">
              DRAFT · DATA SIMULASI
            </div>

            <div className="preview-top-watermark">
              <span>DATA SIMULASI TERINTEGRASI · PUSDALOPS BNPB</span>
              <span className="doc-classification">KLASIFIKASI: DRAFT SIMULASI OPERASIONAL</span>
            </div>

            {/* KPI QUAD */}
            <div className="preview-kpi-quad">
              <div className="kpi-block">
                <span className="kpi-val">{totalWilayah}</span>
                <span className="kpi-lbl">Wilayah Terpantau</span>
              </div>
              <div className="kpi-block highlight-red">
                <span className="kpi-val">{wilayahKritis.length}</span>
                <span className="kpi-lbl">Butuh Dukungan Pusat</span>
              </div>
              <div className="kpi-block highlight-orange">
                <span className="kpi-val">{totalTerdampak.toLocaleString('id-ID')}</span>
                <span className="kpi-lbl">Total Jiwa Terdampak</span>
              </div>
              <div className="kpi-block highlight-green">
                <span className="kpi-val">{armadaBergerak.length}</span>
                <span className="kpi-lbl">Armada Pusat Bergerak</span>
              </div>
            </div>

            <pre className="sitrep-text-pre">{generateNationalSitRep()}</pre>
          </div>
        </div>

        {/* FOOTER */}
        <div className="national-sitrep-footer">
          <span className="sitrep-footer-note">
            💡 Format teks ini disiapkan untuk latihan simulasi koordinasi darurat dan pemantauan data bencana lintas wilayah.
          </span>
          <div className="sitrep-footer-actions">
            <button
              type="button"
              className="btn-sitrep-primary"
              onClick={handleShareWhatsApp}
              title="Buka WhatsApp dengan draft laporan lengkap yang telah disiapkan"
            >
              <Send size={16} />
              <span>Bagikan via WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
