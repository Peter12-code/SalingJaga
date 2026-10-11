import { useState, useEffect } from 'react'
import {
  Users,
  Search,
  CheckCircle2,
  Share2,
  Building2,
  ArrowRight,
  ShieldCheck,
  Check,
  MapPin,
  HeartHandshake,
  PhoneCall,
  FileCheck,
  Video,
  Truck,
  X,
  AlertCircle,
  ExternalLink
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import './NationalFamilyAggregator.css'

const TAHAPAN_OPTIONS = [
  {
    kode: 1,
    label: 'Tahap 1: Verifikasi Berkas & Identitas',
    desc: 'Pengecekan NIK/KK, foto pelapor, dan catatan fisik pengungsi di posko tujuan',
  },
  {
    kode: 2,
    label: 'Tahap 2: Video Call & Konfirmasi Keluarga',
    desc: 'Panggilan daring tatap muka didampingi petugas BPBD kedua posko',
  },
  {
    kode: 3,
    label: 'Tahap 3: Koordinasi Armada Penjemputan / Evakuasi',
    desc: 'Pengaturan transportasi antarposko/antarprovinsi untuk reuni fisik',
  },
  {
    kode: 4,
    label: 'Berhasil Dipertemukan (Reuni Selesai)',
    desc: 'Keluarga telah berkumpul kembali dan berita acara serah terima rampung',
  },
]

export default function NationalFamilyAggregator() {
  const { keluargaLintasDaerahData, rekonsiliasiKasusLintasDaerah, showNotif } = useApp()

  const { agregatNasional, kasusEskalasi = [] } = keluargaLintasDaerahData || {}

  const percentResolved = agregatNasional
    ? Math.round((agregatNasional.berhasilDipertemukan / agregatNasional.totalLaporanPencarian) * 100)
    : 83

  // Modal State
  const [activeModalCase, setActiveModalCase] = useState(null)
  const [selectedTahap, setSelectedTahap] = useState(TAHAPAN_OPTIONS[0].label)
  const [catatanInput, setCatatanInput] = useState('')
  const [operatorInput, setOperatorInput] = useState('Satgas Reuni BNPB Regional 2')
  const [checkedEvidence, setCheckedEvidence] = useState([
    'Fotokopi Kartu Keluarga / Akta Kelahiran',
    'Ciri Fisik & Pakaian Terakhir Terverifikasi'
  ])

  // Keyboard accessibility: tombol Esc menutup modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeModalCase) {
        setActiveModalCase(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeModalCase])

  const openReconcileModal = (kasus) => {
    setActiveModalCase(kasus)
    setSelectedTahap(kasus.status || TAHAPAN_OPTIONS[0].label)
    setCatatanInput(kasus.catatanVerifikasi || 'Pencocokan data dasar telah diverifikasi oleh petugas posko kedua daerah.')
    setOperatorInput(kasus.petugasPenghubung || 'Satgas Reuni BNPB Pusat')
    
    // Pertahankan format daftar bukti secara permanen tanpa reset
    if (Array.isArray(kasus.buktiPencocokan)) {
      setCheckedEvidence([...kasus.buktiPencocokan])
    } else if (typeof kasus.buktiPencocokan === 'string' && kasus.buktiPencocokan.trim()) {
      setCheckedEvidence(kasus.buktiPencocokan.split(',').map((s) => s.trim()).filter(Boolean))
    } else {
      setCheckedEvidence([
        'Fotokopi Kartu Keluarga / Akta Kelahiran',
        'Ciri Fisik & Pakaian Terakhir Terverifikasi'
      ])
    }
  }

  const handleToggleEvidence = (item) => {
    if (checkedEvidence.includes(item)) {
      setCheckedEvidence(checkedEvidence.filter((e) => e !== item))
    } else {
      setCheckedEvidence([...checkedEvidence, item])
    }
  }

  const handleSaveReconciliation = () => {
    if (!activeModalCase) return

    const matchedTahap = TAHAPAN_OPTIONS.find((t) => t.label === selectedTahap)
    const tahapKode = matchedTahap ? matchedTahap.kode : 1

    rekonsiliasiKasusLintasDaerah(activeModalCase.id, {
      tahapKode,
      statusBaru: selectedTahap,
      catatanVerifikasi: catatanInput,
      buktiPencocokan: [...checkedEvidence],
      picPoskoAsal: activeModalCase.picPoskoAsal || 'PIC Posko Pelapor',
      picPoskoTujuan: activeModalCase.picPoskoTujuan || 'PIC Posko Rujukan',
      operator: operatorInput || 'Satgas Pusdalops Reuni BNPB Pusat',
    })

    if (showNotif) {
      showNotif(`✅ Progres rekonsiliasi #${activeModalCase.id} diperbarui ke "${selectedTahap}".`, 'success')
    }

    setActiveModalCase(null)
  }

  return (
    <section className="national-family-section" aria-label="Temukan keluarga lintas daerah dan eskalasi antarposko">
      {/* HEADER */}
      <div className="family-section-header">
        <div className="family-header-left">
          <div className="family-icon-badge">
            <HeartHandshake size={22} />
          </div>
          <div>
            <div className="family-eyebrow">REKONSILIASI PENYINTAS BENCANA ANTARPROVINSI</div>
            <h3 className="family-title">Temukan Keluarga Lintas Daerah & Eskalasi Antarposko</h3>
            <span className="family-sub">
              Monitoring agregat pencarian orang hilang se-Indonesia dan fasilitasi penyatuan keluarga yang terpisah lintas wilayah administratif
            </span>
          </div>
        </div>
      </div>

      {/* AGREGAT MACRO KPI GRID */}
      <div className="family-macro-kpi-grid">
        <div className="macro-kpi-card">
          <span className="macro-kpi-num">{agregatNasional?.totalLaporanPencarian.toLocaleString('id-ID')}</span>
          <span className="macro-kpi-label">Total Pencarian Masuk Nasional</span>
          <span className="macro-kpi-hint">Seluruh laporan terintegrasi BNPB & BPBD</span>
        </div>

        <div className="macro-kpi-card highlight-green">
          <span className="macro-kpi-num">{agregatNasional?.berhasilDipertemukan.toLocaleString('id-ID')}</span>
          <span className="macro-kpi-label">Berhasil Dipertemukan ({percentResolved}%)</span>
          <span className="macro-kpi-hint">Terselesaikan melalui sistem SalingJaga</span>
        </div>

        <div className="macro-kpi-card highlight-blue">
          <span className="macro-kpi-num">{agregatNasional?.dalamPencarianAktif.toLocaleString('id-ID')}</span>
          <span className="macro-kpi-label">Ditangani BPBD Setempat</span>
          <span className="macro-kpi-hint">Pencarian intra-kabupaten/kota</span>
        </div>

        <div className="macro-kpi-card highlight-amber">
          <span className="macro-kpi-num">{agregatNasional?.kasusEskalasiLintasWilayah}</span>
          <span className="macro-kpi-label">Eskalasi Antarposko / Provinsi</span>
          <span className="macro-kpi-hint">Membutuhkan koordinasi BNPB</span>
        </div>
      </div>

      {/* STRATEGIC NOTICE */}
      <div className="family-strategic-notice">
        <ShieldCheck size={18} className="notice-icon" />
        <div className="notice-content">
          <strong>Prinsip Operasional BNPB Pusat:</strong>
          <p>
            BNPB memfasilitasi integrasi data pencarian warga, verifikasi identitas, dan penyambungan komunikasi antar-satgas posko yang terpisah antar-kabupaten atau antar-provinsi. Setiap rekonsiliasi wajib melalui verifikasi dokumen KK, video call daring antarposko, dan pencatatan berita acara resmi.
          </p>
        </div>
      </div>

      {/* KASUS ESKALASI LIST */}
      <div className="inter-region-cases-wrapper">
        <div className="cases-header-row">
          <h4 className="cases-section-title">
            Antrean Kasus Terpisah Lintas Wilayah ({kasusEskalasi.length} Kasus Terpantau)
          </h4>
          <span className="cases-instruction-hint">
            Klik “Fasilitasi Penghubungan Antarposko” untuk memverifikasi kontak, bukti, dan tahapan proses reuni.
          </span>
        </div>

        <div className="cases-cards-feed">
          {kasusEskalasi.map((kasus) => {
            const isResolved = kasus.status?.includes('Berhasil Dipertemukan') || kasus.status?.includes('Reuni Selesai')

            return (
              <div key={kasus.id} className={`inter-case-card ${isResolved ? 'case-resolved' : ''}`}>
                {/* TOP IDENTIFIERS */}
                <div className="case-card-top">
                  <div className="case-identifiers-cluster">
                    <span className="case-id">#{kasus.id}</span>
                    {kasus.idLaporanWarga && (
                      <span className="case-link-pill pill-citizen">
                        Laporan Warga: <strong>{kasus.idLaporanWarga}</strong>
                      </span>
                    )}
                    {kasus.idRegistrasiPosko && (
                      <span className="case-link-pill pill-shelter">
                        Posko Rujukan: <strong>{kasus.idRegistrasiPosko}</strong>
                      </span>
                    )}
                  </div>

                  <span className={`case-status-pill ${isResolved ? 'pill-resolved' : 'pill-pending'}`}>
                    {kasus.status}
                  </span>
                </div>

                <div className="case-body-main">
                  <h5 className="case-person-name">{kasus.namaOrangHilang}</h5>
                  <p className="case-desc">{kasus.deskripsi}</p>
                </div>

                {/* TWO SHELTERS COMPARISON MATRIX */}
                <div className="case-shelters-dual-grid">
                  {/* ASAL */}
                  <div className="shelter-col origin-col">
                    <div className="shelter-col-header">
                      <span className="dot-shelter origin-dot" />
                      <span className="shelter-kicker">POSKO PELAPOR (ASAL)</span>
                    </div>
                    <strong className="shelter-title">{kasus.poskoAsal || kasus.pelapor}</strong>
                    <span className="shelter-geo">{kasus.wilayahAsal || kasus.provinsiAsal}</span>
                    
                    <div className="shelter-contacts-sub">
                      <span>Pelapor: <strong>{kasus.pelapor}</strong></span>
                      {kasus.kontakPelapor && <span className="contact-small">Telp: {kasus.kontakPelapor}</span>}
                      {kasus.picPoskoAsal && (
                        <div className="pic-line">
                          <PhoneCall size={11} />
                          <span>PIC: <strong>{kasus.picPoskoAsal}</strong> ({kasus.kontakPoskoAsal})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shelter-bridge-divider">
                    <div className="bridge-line" />
                    <div className="bridge-icon">
                      <ArrowRight size={14} />
                    </div>
                  </div>

                  {/* DITEMUKAN */}
                  <div className="shelter-col dest-col">
                    <div className="shelter-col-header">
                      <span className="dot-shelter dest-dot" />
                      <span className="shelter-kicker">LOKASI TERLACAK (POSKO RUJUKAN)</span>
                    </div>
                    <strong className="shelter-title">{kasus.poskoDitemukan || kasus.statusTerkini}</strong>
                    <span className="shelter-geo">{kasus.wilayahDitemukan || kasus.provinsiDitemukan}</span>

                    <div className="shelter-contacts-sub">
                      {kasus.picPoskoTujuan && (
                        <div className="pic-line">
                          <PhoneCall size={11} />
                          <span>PIC Posko: <strong>{kasus.picPoskoTujuan}</strong> ({kasus.kontakPoskoTujuan})</span>
                        </div>
                      )}
                      {kasus.catatanVerifikasi && (
                        <span className="notes-small">
                          Catatan: {kasus.catatanVerifikasi}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* BUKTI PENCOCOKAN TAGS */}
                {(() => {
                  const buktiList = Array.isArray(kasus.buktiPencocokan)
                    ? kasus.buktiPencocokan
                    : typeof kasus.buktiPencocokan === 'string' && kasus.buktiPencocokan.trim()
                    ? kasus.buktiPencocokan.split(',').map((s) => s.trim()).filter(Boolean)
                    : []

                  return buktiList.length > 0 ? (
                    <div className="case-evidence-tags-row">
                      <span className="evidence-label">Bukti Pencocokan:</span>
                      {buktiList.map((b, idx) => (
                        <span key={idx} className="evidence-tag">
                          <Check size={11} /> {b}
                        </span>
                      ))}
                    </div>
                  ) : null
                })()}

                {/* CARD FOOTER */}
                <div className="case-card-footer">
                  <span className="case-contact-officer">
                    Penghubung BNPB: <strong>{kasus.petugasPenghubung}</strong>
                  </span>

                  <button
                    type="button"
                    className={`btn-reconcile-case ${isResolved ? 'btn-resolved-state' : ''}`}
                    onClick={() => openReconcileModal(kasus)}
                    title="Buka panel pencocokan data dan verifikasi antarposko"
                  >
                    {isResolved ? (
                      <>
                        <CheckCircle2 size={14} />
                        <span>Lihat Berkas Rekonsiliasi (Selesai)</span>
                      </>
                    ) : (
                      <>
                        <Share2 size={14} />
                        <span>Fasilitasi Penghubungan Antarposko</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* RECONCILIATION MULTI-STEP DIALOG MODAL */}
      {activeModalCase && (
        <div className="reconciliation-modal-backdrop" onClick={() => setActiveModalCase(null)}>
          <div
            className="reconciliation-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="recon-modal-title"
          >
            {/* MODAL HEADER */}
            <div className="recon-modal-header">
              <div className="recon-header-left">
                <div className="recon-badge-icon">
                  <HeartHandshake size={22} />
                </div>
                <div>
                  <div className="recon-eyebrow">PROTOKOL REKONSILIASI KELUARGA BNPB PUSAT</div>
                  <h3 id="recon-modal-title" className="recon-modal-title">
                    Fasilitasi Penghubungan & Verifikasi Antarposko
                  </h3>
                  <span className="recon-modal-subtitle">
                    Kasus #{activeModalCase.id} · {activeModalCase.namaOrangHilang}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="recon-btn-close"
                onClick={() => setActiveModalCase(null)}
                aria-label="Tutup Dialog"
              >
                <X size={20} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="recon-modal-body">
              {/* CROSS-LINKING SUMMARY CARD */}
              <div className="recon-cross-link-card">
                <div className="cross-box">
                  <span className="cross-kicker">Posko Pelapor (Asal):</span>
                  <strong>{activeModalCase.poskoAsal || activeModalCase.pelapor}</strong>
                  <span className="cross-detail">{activeModalCase.wilayahAsal}</span>
                  <div className="cross-contact">
                    <PhoneCall size={12} />
                    <span>PIC: {activeModalCase.picPoskoAsal} ({activeModalCase.kontakPoskoAsal})</span>
                  </div>
                </div>

                <div className="cross-arrow">
                  <ArrowRight size={20} />
                </div>

                <div className="cross-box">
                  <span className="cross-kicker">Posko Rujukan (Ditemukan):</span>
                  <strong>{activeModalCase.poskoDitemukan || activeModalCase.statusTerkini}</strong>
                  <span className="cross-detail">{activeModalCase.wilayahDitemukan}</span>
                  <div className="cross-contact">
                    <PhoneCall size={12} />
                    <span>PIC: {activeModalCase.picPoskoTujuan} ({activeModalCase.kontakPoskoTujuan})</span>
                  </div>
                </div>
              </div>

              {/* TAHAPAN PROSES SELECTION */}
              <div className="recon-form-group">
                <label className="recon-label">
                  <FileCheck size={15} />
                  <span>Pilih Tahapan Rekonsiliasi Saat Ini:</span>
                </label>
                <div className="tahapan-selector-grid">
                  {TAHAPAN_OPTIONS.map((opt) => (
                    <button
                      key={opt.kode}
                      type="button"
                      className={`btn-tahap-card ${selectedTahap === opt.label ? 'active' : ''}`}
                      onClick={() => setSelectedTahap(opt.label)}
                    >
                      <div className="tahap-num-circle">{opt.kode}</div>
                      <div className="tahap-text">
                        <strong>{opt.label}</strong>
                        <p>{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* BUKTI PENCOCOKAN CHECKLIST */}
              <div className="recon-form-group">
                <label className="recon-label">
                  <CheckCircle2 size={15} />
                  <span>Bukti Pencocokan & Dokumen Pendukung:</span>
                </label>
                <div className="evidence-checkboxes-grid">
                  {[
                    'Fotokopi Kartu Keluarga / Akta Kelahiran',
                    'Ciri Fisik & Pakaian Terakhir Terverifikasi',
                    'Panggilan Video Tatap Muka Terkonfirmasi',
                    'KTP / Rekam Medis Pengungsi Terverifikasi',
                    'Berita Acara Serah Terima Diteken Kedua Posko'
                  ].map((item) => (
                    <label key={item} className="evidence-checkbox-item">
                      <input
                        type="checkbox"
                        checked={checkedEvidence.includes(item)}
                        onChange={() => handleToggleEvidence(item)}
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* CATATAN VERIFIKASI */}
              <div className="recon-form-group">
                <label className="recon-label" htmlFor="recon-notes">
                  Catatan Verifikasi Antarposko:
                </label>
                <textarea
                  id="recon-notes"
                  rows={2}
                  className="recon-textarea"
                  value={catatanInput}
                  onChange={(e) => setCatatanInput(e.target.value)}
                  placeholder="Rincian hasil verifikasi, kondisi psikologis anak/keluarga, atau rencana jam penjemputan..."
                />
              </div>

              {/* AKUN OPERATOR PENGHUBUNG */}
              <div className="recon-form-group">
                <label className="recon-label" htmlFor="recon-operator">
                  Akun Petugas Penghubung BNPB:
                </label>
                <input
                  id="recon-operator"
                  type="text"
                  className="recon-input"
                  value={operatorInput}
                  onChange={(e) => setOperatorInput(e.target.value)}
                />
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="recon-modal-footer">
              <button
                type="button"
                className="btn-recon-cancel"
                onClick={() => setActiveModalCase(null)}
              >
                Batal
              </button>

              <button
                type="button"
                className="btn-recon-submit"
                onClick={handleSaveReconciliation}
              >
                <Check size={16} />
                <span>Simpan Pembaruan Tahapan Rekonsiliasi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
