import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { STATUS_LAPORAN } from '../data/dummyData'
import {
  MapPin,
  Users,
  Compass,
  AlertTriangle,
  Camera,
  Sparkles,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Check,
  FileText,
  Boxes,
  UsersRound,
  ShieldAlert,
  AlertOctagon,
  CopyCheck,
  Navigation,
  Send,
  MessageSquarePlus,
  PackageCheck,
  Plus,
  Info,
  ChevronRight
} from 'lucide-react'
import './ReportDetailPanel.css'

function formatTime(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function NoSelection() {
  return (
    <div className="no-selection">
      <div className="no-sel-radar-beacon">
        <Compass size={36} className="radar-icon-spin" />
      </div>
      <h3>Pilih Laporan Musibah</h3>
      <p>
        Pilih salah satu insiden dari antrian di sebelah kiri untuk meninjau berkas intelijen situasi, titik koordinat GIS, status akses jalan, kebutuhan per kejadian, dan catatan lapangan.
      </p>
    </div>
  )
}

function AiResultPanel({ ai }) {
  if (!ai) return null

  if (ai.raw) {
    return (
      <div className="ai-raw-wrapper">
        <div className="ai-block-title">
          <FileText size={16} /> Respons Mentah Model AI
        </div>
        <pre className="ai-raw">{ai.raw}</pre>
      </div>
    )
  }

  return (
    <div className="ai-result-card">
      {ai.engineSource && (
        <div className="ai-engine-source">
          <Sparkles size={13} />
          <span>Mesin Triase Cerdas: {ai.engineSource}</span>
        </div>
      )}

      {ai.batasWaktuRespons && (
        <div className="ai-golden-time-card">
          <div className="golden-time-left">
            <span className="golden-beacon-dot" />
            <div>
              <span className="golden-time-kicker">GOLDEN TIME RESPONS DARURAT</span>
              <strong className="golden-time-value">{ai.batasWaktuRespons}</strong>
            </div>
          </div>
          <span className="golden-time-badge">Standar BNPB</span>
        </div>
      )}

      {ai.ringkasan && (
        <div className="ai-block ai-strategy-block">
          <div className="ai-block-title">
            <Sparkles size={15} className="ai-title-icon" />
            <span>Rekomendasi Strategi Tanggap Darurat</span>
          </div>
          <p className="ai-text-value">{ai.ringkasan}</p>
        </div>
      )}

      {Array.isArray(ai.kebutuhanUtama) && ai.kebutuhanUtama.length > 0 && (
        <div className="ai-block">
          <div className="ai-block-title">
            <Boxes size={15} className="ai-title-icon" />
            <span>Kebutuhan Logistik & Peralatan Primer</span>
          </div>
          <ul className="ai-list">
            {ai.kebutuhanUtama.map((k, i) => (
              <li key={i}>{k}</li>
            ))}
          </ul>
        </div>
      )}

      {Array.isArray(ai.jenisRelawan) && ai.jenisRelawan.length > 0 && (
        <div className="ai-block">
          <div className="ai-block-title">
            <UsersRound size={15} className="ai-title-icon" />
            <span>Kualifikasi Tim Relawan yang Diperlukan</span>
          </div>
          <div className="ai-chip-list">
            {ai.jenisRelawan.map((r, i) => (
              <span key={i} className="ai-chip">
                {r}
              </span>
            ))}
          </div>
        </div>
      )}

      {Array.isArray(ai.tindakanAdmin) && ai.tindakanAdmin.length > 0 && (
        <div className="ai-block">
          <div className="ai-block-title">
            <ShieldCheck size={15} className="ai-title-icon" />
            <span>Instruksi Komando & Tindakan Pusdalops</span>
          </div>
          <ul className="ai-list">
            {ai.tindakanAdmin.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      )}

      {Array.isArray(ai.perluVerifikasi) && ai.perluVerifikasi.length > 0 && (
        <div className="ai-block ai-block-warn">
          <div className="ai-block-title warn-title">
            <ShieldAlert size={15} className="ai-title-icon text-amber" />
            <span>Data Kritis yang Perlu Dicek Tim Lapangan</span>
          </div>
          <ul className="ai-list warn">
            {ai.perluVerifikasi.map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        </div>
      )}

      {ai.dibuatPada && (
        <div className="ai-analyzed-time">
          <Clock size={12} /> Dianalisis oleh sistem: {formatTime(ai.dibuatPada)}
        </div>
      )}
    </div>
  )
}

function PenangananUpload({ laporanId }) {
  const [uploadedPhoto, setUploadedPhoto] = useState(null)

  if (uploadedPhoto) {
    return (
      <div className="penanganan-photo-preview">
        <span className="penanganan-preview-label">
          <CheckCircle2 size={15} /> Bukti Tindakan Lapangan Telah Diunggah:
        </span>
        <img src={uploadedPhoto} alt="Bukti Penanganan" className="bukti-foto-img" />
        <p className="penanganan-success-text">
          Foto bukti terdokumentasi dalam audit log penanganan musibah.
        </p>
      </div>
    )
  }

  return (
    <div className="penanganan-upload-box">
      <div className="upload-box-meta">
        <span className="upload-box-title">Bukti Aksi / Penanganan Lapangan</span>
        <span className="upload-box-sub">Unggah dokumentasi foto armada bantuan atau evakuasi warga</span>
      </div>
      <div className="photo-upload-container">
        <input
          type="file"
          accept="image/*"
          id={`fotoPenanganan-${laporanId}`}
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setUploadedPhoto(URL.createObjectURL(e.target.files[0]))
            }
          }}
        />
        <label htmlFor={`fotoPenanganan-${laporanId}`} className="btn-upload-photo">
          <Camera size={15} /> Pilih Foto Bukti Lapangan
        </label>
      </div>
    </div>
  )
}

export default function ReportDetailPanel() {
  const {
    selectedLaporan,
    setSelectedId,
    loadingAnalysis,
    analysisError,
    analisisAI,
    ubahStatusLaporan,
    setActiveTab,
    setDispatchModalOpen,
    setDispatchTargetReport,
    getPotentialDuplicates,
    checkKelengkapanData,
    updateAksesLokasi,
    updateKebutuhanDetail,
    tambahCatatanLapangan,
    openCloseReportModal,
  } = useApp()

  const [inputCatatan, setInputCatatan] = useState('')

  if (!selectedLaporan) {
    return (
      <aside className="detail-panel">
        <NoSelection />
      </aside>
    )
  }

  const l = selectedLaporan
  const hasAI = !!l.analisisAI
  const prio = (l.analisisAI?.prioritas || 'sedang').toLowerCase()

  // 1. Deteksi Laporan Ganda
  const duplicates = getPotentialDuplicates ? getPotentialDuplicates(l) : []

  // 2. Indikator Data Belum Lengkap
  const dataIncomplete = checkKelengkapanData ? checkKelengkapanData(l) : []

  const handleOpenMap = () => {
    setActiveTab('map')
  }

  const handleOpenDispatch = () => {
    setDispatchTargetReport(l)
    setDispatchModalOpen(true)
  }

  const handleStageClick = (st) => {
    if (st === STATUS_LAPORAN.SELESAI) {
      if (openCloseReportModal) {
        openCloseReportModal(l)
      } else {
        ubahStatusLaporan(l.id, st)
      }
    } else {
      ubahStatusLaporan(l.id, st)
    }
  }

  const handleKirimCatatan = (e) => {
    e.preventDefault()
    if (!inputCatatan.trim()) return
    tambahCatatanLapangan(l.id, inputCatatan.trim())
    setInputCatatan('')
  }

  const handlePresetNote = (presetText) => {
    setInputCatatan(presetText)
  }

  return (
    <aside className="detail-panel" aria-label={`Detail berkas laporan ${l.id}`}>
      {/* TACTICAL HEADER */}
      <div className="detail-header-tactical">
        <div className="header-top-row">
          <div className="header-ident-box">
            <span className="detail-id-badge">#{l.id}</span>
            <span className={`detail-priority-chip ${prio}`}>
              {prio.toUpperCase()}
            </span>
          </div>
          <div className="header-status-group">
            {/* BADGE AKSES JALAN DI HEADER */}
            <span className={`access-pill access-${(l.aksesLokasi || 'terbuka').toLowerCase()}`}>
              <Navigation size={12} />
              <span>Akses {l.aksesLokasi || 'Terbuka'}</span>
            </span>

            <span className={`detail-status-pill status-${l.status.toLowerCase().replace(/\s+/g, '-')}`}>
              <span className="status-live-dot" />
              {l.status}
            </span>
          </div>
        </div>

        <h2 className="detail-jenis-title">{l.jenis}</h2>

        <div className="detail-meta-row">
          <span className="meta-chip">
            <MapPin size={13} /> {l.lokasi}
          </span>
          <span className="meta-chip">
            <Users size={13} /> {Number(l.jumlahWarga || 0).toLocaleString('id-ID')} jiwa terdampak
          </span>
        </div>
      </div>

      <div className="detail-body">
        {/* 1. DETEKSI LAPORAN GANDA BANNER */}
        {duplicates.length > 0 && (
          <div className="duplicate-warning-banner" role="alert">
            <div className="dup-banner-header">
              <div className="dup-icon-circle">
                <CopyCheck size={16} />
              </div>
              <div className="dup-banner-titles">
                <strong>Potensi Laporan Ganda Terdeteksi ({duplicates.length})</strong>
                <span>Ditemukan laporan warga berdekatan ({`< 2.5 km`}) dengan jenis bencana serupa</span>
              </div>
            </div>
            <div className="dup-candidates-list">
              {duplicates.map((dup) => (
                <div key={dup.id} className="dup-candidate-item">
                  <div className="dup-info">
                    <span className="dup-id">#{dup.id}</span>
                    <span className="dup-jenis">{dup.jenis}</span>
                    <span className="dup-loc">· {dup.lokasi}</span>
                    <span className="dup-status">({dup.status})</span>
                  </div>
                  <button
                    type="button"
                    className="btn-dup-switch"
                    onClick={() => setSelectedId(dup.id)}
                    title="Buka laporan ini untuk memeriksa"
                  >
                    <span>Buka Berkas</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              ))}
            </div>
            <p className="dup-advice-note">
              💡 <em>Periksa apakah ini insiden yang sama agar tidak mengerahkan tim ganda atau mendata korban dua kali.</em>
            </p>
          </div>
        )}

        {/* 2. INDIKATOR DATA BELUM LENGKAP BANNER */}
        {dataIncomplete.length > 0 && (
          <div className="incomplete-data-banner" role="alert">
            <div className="incomplete-header">
              <AlertTriangle size={16} className="text-amber" />
              <strong>Indikator Data Belum Lengkap ({dataIncomplete.length} Hal)</strong>
            </div>
            <p className="incomplete-desc">
              Laporan ini membutuhkan verifikasi tambahan oleh Satgas/Relawan sebelum penanganan penuh:
            </p>
            <div className="incomplete-tags-list">
              {dataIncomplete.map((item, idx) => (
                <span key={idx} className="incomplete-tag">
                  ⚠️ {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* QUICK ACTION STRIP */}
        <div className="quick-action-strip">
          <button
            type="button"
            className="btn-strip-map"
            onClick={handleOpenMap}
            title="Tinjau lokasi bencana di Peta Situasi GIS"
          >
            <Compass size={16} /> Lihat di Peta GIS
          </button>
          <button
            type="button"
            className="btn-strip-dispatch"
            onClick={handleOpenDispatch}
            title="Kerahkan tim SAR / relawan ke titik ini"
          >
            <AlertTriangle size={16} /> Kerahkan Tim Relawan
          </button>
        </div>

        {/* DEMOGRAPHICS QUAD */}
        <div className="demographics-quad">
          <div className="demo-box">
            <span className="demo-num">{Number(l.jumlahWarga || 0).toLocaleString('id-ID')}</span>
            <span className="demo-lbl">Total Warga</span>
          </div>
          <div className="demo-box demo-highlight-orange">
            <span className="demo-num">{l.balitaDanLansia || 0}</span>
            <span className="demo-lbl">Balita & Lansia</span>
          </div>
          <div className="demo-box demo-highlight-red">
            <span className="demo-num">{l.korbanLuka || 0}</span>
            <span className="demo-lbl">Korban Luka</span>
          </div>
          <div className="demo-box demo-highlight-blue">
            <span className="demo-num">{l.wargaMengungsi || 0}</span>
            <span className="demo-lbl">Mengungsi</span>
          </div>
        </div>

        {/* 3. STATUS AKSES JALAN / LOKASI (OPERASIONAL SEBELUM KIRIM TIM) */}
        <div className="access-status-section">
          <div className="access-section-title">
            <Navigation size={16} />
            <span>Status Akses Jalur Transportasi / Lapangan:</span>
          </div>
          <p className="access-section-hint">
            Penting diverifikasi sebelum mengirim tim dan menentukan armada (perahu karet vs truk tinggi).
          </p>
          <div className="access-btn-toggle-group">
            {['Terbuka', 'Terbatas', 'Tertutup'].map((statusKey) => {
              const isSelected = (l.aksesLokasi || 'Terbuka').toLowerCase() === statusKey.toLowerCase()
              return (
                <button
                  key={statusKey}
                  type="button"
                  className={`btn-access-choice choice-${statusKey.toLowerCase()} ${isSelected ? 'active' : ''}`}
                  onClick={() => updateAksesLokasi(l.id, statusKey)}
                >
                  <span className="choice-dot" />
                  <span className="choice-title">{statusKey}</span>
                  {isSelected && <Check size={14} className="choice-check" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* 4. DAFTAR KEBUTUHAN PER KEJADIAN (ITEMIZED UNMET NEEDS) */}
        <div className="incident-needs-section">
          <div className="incident-needs-header">
            <div className="needs-header-left">
              <Boxes size={17} />
              <div>
                <strong>Daftar Kebutuhan per Kejadian Ini</strong>
                <span className="needs-header-sub">Kebutuhan spesifik yang belum terpenuhi di titik musibah</span>
              </div>
            </div>
            {Array.isArray(l.kebutuhanDetail) && (
              <span className="needs-unmet-count">
                {l.kebutuhanDetail.filter((k) => k.terpenuhi < k.target).length} Belum Lengkap
              </span>
            )}
          </div>

          <div className="incident-needs-list">
            {Array.isArray(l.kebutuhanDetail) && l.kebutuhanDetail.length > 0 ? (
              l.kebutuhanDetail.map((k) => {
                const sisa = Math.max(0, k.target - k.terpenuhi)
                const isFulfilled = sisa === 0
                const percent = Math.min(100, Math.round((k.terpenuhi / k.target) * 100))

                return (
                  <div key={k.id} className={`incident-need-card ${isFulfilled ? 'fulfilled' : ''}`}>
                    <div className="need-card-top">
                      <span className="need-name">{k.nama}</span>
                      <span className={`need-status-pill ${isFulfilled ? 'badge-ok' : 'badge-needed'}`}>
                        {isFulfilled ? 'Terpenuhi' : `Sisa ${sisa} ${k.satuan}`}
                      </span>
                    </div>

                    <div className="need-progress-wrapper">
                      <div className="need-progress-bar">
                        <div
                          className={`need-progress-fill ${isFulfilled ? 'fill-green' : 'fill-blue'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="need-progress-text">
                        {k.terpenuhi} / {k.target} {k.satuan} ({percent}%)
                      </span>
                    </div>

                    {!isFulfilled && (
                      <div className="need-action-row">
                        <button
                          type="button"
                          className="btn-need-fulfill-sm"
                          onClick={() => updateKebutuhanDetail(l.id, k.id, k.terpenuhi + 1)}
                          title="Tambah 1 terpenuhi"
                        >
                          +1 {k.satuan}
                        </button>
                        <button
                          type="button"
                          className="btn-need-fulfill-sm"
                          onClick={() => updateKebutuhanDetail(l.id, k.id, Math.min(k.target, k.terpenuhi + 5))}
                          title="Tambah 5 terpenuhi"
                        >
                          +5
                        </button>
                        <button
                          type="button"
                          className="btn-need-fulfill-all"
                          onClick={() => updateKebutuhanDetail(l.id, k.id, k.target)}
                          title="Tandai seluruh kebutuhan item ini telah tiba di lokasi"
                        >
                          <PackageCheck size={13} />
                          <span>Penuhi Semua</span>
                        </button>
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="need-empty-fallback">
                <Info size={16} />
                <span>Kebutuhan ringkas: <strong>{l.kebutuhan || 'Belum dirinci'}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* 5. CATATAN LAPANGAN / FIELD UPDATES TIMELINE */}
        <div className="field-notes-section">
          <div className="field-notes-header">
            <div className="notes-header-left">
              <MessageSquarePlus size={16} />
              <div>
                <strong>Catatan Lapangan & Pembaruan Situasi</strong>
                <span className="notes-header-sub">Kotak pembaruan cepat dari satgas lapangan</span>
              </div>
            </div>
            <span className="notes-count-badge">
              {Array.isArray(l.catatanLapangan) ? l.catatanLapangan.length : 0} Catatan
            </span>
          </div>

          {/* TIMELINE RIWAYAT CATATAN */}
          <div className="field-notes-timeline">
            {Array.isArray(l.catatanLapangan) && l.catatanLapangan.length > 0 ? (
              l.catatanLapangan.map((c) => (
                <div key={c.id} className="timeline-note-bubble">
                  <div className="note-bubble-meta">
                    <span className="note-author">{c.oleh || 'Pusdalops BPBD'}</span>
                    <span className="note-time">{formatTime(c.waktu)}</span>
                  </div>
                  <p className="note-bubble-text">{c.teks}</p>
                </div>
              ))
            ) : (
              <div className="notes-empty-state">
                <span>Belum ada catatan lapangan. Tambahkan pembaruan pertama di bawah.</span>
              </div>
            )}
          </div>

          {/* QUICK PRESETS CHIPS */}
          <div className="notes-preset-chips">
            <span className="preset-label">Preset cepat:</span>
            <button
              type="button"
              className="btn-preset-chip"
              onClick={() => handlePresetNote('Akses jalan utama terputus, butuh perahu karet.')}
            >
              Jalan terputus
            </button>
            <button
              type="button"
              className="btn-preset-chip"
              onClick={() => handlePresetNote('Evakuasi lansia & balita ke posko selesai dilaksanakan.')}
            >
              Evakuasi lansia selesai
            </button>
            <button
              type="button"
              className="btn-preset-chip"
              onClick={() => handlePresetNote('Bantuan sembako & selimut tahap 1 telah didistribusikan.')}
            >
              Logistik tahap 1 tiba
            </button>
            <button
              type="button"
              className="btn-preset-chip"
              onClick={() => handlePresetNote('Debit air mulai surut 30 cm, pembersihan material dimulai.')}
            >
              Air mulai surut
            </button>
          </div>

          {/* INPUT FORM CATATAN */}
          <form className="notes-input-form" onSubmit={handleKirimCatatan}>
            <input
              type="text"
              placeholder="Tuliskan catatan lapangan (misal: 'Jalan utama tertutup', 'Butuh perahu tambahan')..."
              value={inputCatatan}
              onChange={(e) => setInputCatatan(e.target.value)}
            />
            <button
              type="submit"
              className="btn-send-note"
              disabled={!inputCatatan.trim()}
              title="Kirim catatan pembaruan lapangan"
            >
              <Send size={15} />
              <span>Simpan Catatan</span>
            </button>
          </form>
        </div>

        {/* DOSSIER INFORMATION TABLE */}
        <div className="dossier-card-grid">
          <div className="dossier-row">
            <span className="dossier-label">Waktu Pelaporan</span>
            <span className="dossier-value">{formatTime(l.waktuLapor)}</span>
          </div>
          <div className="dossier-row">
            <span className="dossier-label">Nama Pelapor</span>
            <span className="dossier-value">{l.pelapor || 'Warga Sekitar'}</span>
          </div>
          <div className="dossier-row">
            <span className="dossier-label">Koordinat GIS</span>
            <span className="dossier-value coords-value">
              {l.lat?.toFixed(5) || '-'}, {l.lng?.toFixed(5) || '-'}
              <span className="radius-tag">Radius {l.radius || 750}m</span>
            </span>
          </div>
          <div className="dossier-row full-span">
            <span className="dossier-label">Kronologi / Situasi Terkini</span>
            <p className="dossier-paragraph">{l.kondisi || '-'}</p>
          </div>
          <div className="dossier-row full-span urgent-row">
            <span className="dossier-label urgent-label">Kebutuhan Mendesak Warga</span>
            <p className="dossier-urgent-text">{l.kebutuhan || '-'}</p>
          </div>

          {l.foto && (
            <div className="dossier-row full-span">
              <span className="dossier-label">Foto Bukti Bencana di Lokasi</span>
              <img src={l.foto} alt="Bukti Bencana" className="bukti-foto-img" />
            </div>
          )}
        </div>

        {/* 6. OPERATIONAL STATUS PROGRESS STEPPER (WITH CLEAN CLOSURE MODAL FOR 'SELESAI') */}
        <div className="operational-stepper-box">
          <div className="stepper-box-top">
            <span className="stepper-box-title">Tahapan Penanganan Komando:</span>
            {l.status !== STATUS_LAPORAN.SELESAI && (
              <button
                type="button"
                className="btn-direct-close-report"
                onClick={() => openCloseReportModal && openCloseReportModal(l)}
                title="Buka dialog penutupan resmi dengan bukti foto dan data warga tertangani"
              >
                <CheckCircle2 size={14} />
                <span>Tutup Laporan Resmi</span>
              </button>
            )}
          </div>

          <div className="stepper-stages-bar">
            {Object.values(STATUS_LAPORAN).map((st, idx) => {
              const isCurrent = l.status === st
              return (
                <button
                  key={st}
                  type="button"
                  className={`btn-step-stage ${isCurrent ? 'current' : ''}`}
                  onClick={() => handleStageClick(st)}
                  disabled={isCurrent}
                  title={
                    st === STATUS_LAPORAN.SELESAI
                      ? 'Klik untuk menutup laporan resmi dengan hasil aksi dan bukti foto'
                      : `Klik untuk ubah status ke ${st}`
                  }
                >
                  <span className="step-idx">{idx + 1}</span>
                  <span className="step-label">{st}</span>
                  {isCurrent && <Check size={13} className="step-check-icon" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* ACTION EVIDENCE UPLOAD */}
        {l.status !== STATUS_LAPORAN.BARU && (
          <PenangananUpload laporanId={l.id} />
        )}

        <hr className="panel-divider" />

        {/* AI TRIAGE ASSISTANT SECTION */}
        <div className="ai-dossier-section">
          <div className="ai-section-titlebar">
            <div className="ai-titlebar-left">
              <div className="ai-beacon-icon">
                <Sparkles size={16} />
              </div>
              <div>
                <span className="ai-section-title">Triase Cerdas & Strategi AI</span>
                <span className="ai-section-sub">Analisis algoritma BNPB & peringatan dini</span>
              </div>
            </div>
            {l.analisisAI?.dibuatPada && (
              <span className="ai-timestamp-pill">
                <Clock size={11} /> {formatTime(l.analisisAI.dibuatPada)}
              </span>
            )}
          </div>

          {loadingAnalysis && (
            <div className="ai-loading-card">
              <div className="tactical-spinner" />
              <div>
                <strong>Menghitung Triase Tanggap Bencana…</strong>
                <p>Memetakan kebutuhan personil, logistik, dan batas waktu penyelamatan.</p>
              </div>
            </div>
          )}

          {!loadingAnalysis && analysisError && (
            <div className="ai-error-box">
              <AlertTriangle size={18} />
              <span>{analysisError}</span>
            </div>
          )}

          {!loadingAnalysis && !analysisError && hasAI && (
            <AiResultPanel ai={l.analisisAI} />
          )}

          {!loadingAnalysis && !hasAI && !analysisError && (
            <div className="ai-empty-prompt">
              <Sparkles size={28} className="empty-sparkle" />
              <h4>Rekomendasi AI Belum Dibuat</h4>
              <p>
                Gunakan asisten triase untuk mengklasifikasi tingkat keparahan, kebutuhan logistik, dan batas respons penyelamatan.
              </p>
            </div>
          )}

          {l.diperbaruiOleh && (
            <div className="audit-trail-box">
              <ShieldCheck size={20} className="audit-icon" />
              <div className="audit-content">
                <strong>Log Audit Sistem Komando</strong>
                <p>Status terakhir diperbarui oleh: <span>{l.diperbaruiOleh}</span></p>
                <p>Waktu: <span>{formatTime(l.waktuPembaruan)}</span></p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER ACTION */}
      <div className="detail-footer-actions">
        <button
          type="button"
          className="btn-ai-analyze-tactical"
          onClick={() => analisisAI(l.id)}
          disabled={loadingAnalysis}
          aria-busy={loadingAnalysis}
        >
          {loadingAnalysis ? (
            <>
              <div className="tactical-spinner btn-spinner" />
              <span>Memproses Triase AI…</span>
            </>
          ) : (
            <>
              <Sparkles size={17} />
              <span>{hasAI ? 'Perbarui Analisis & Triase AI' : 'Jalankan Triase Cerdas AI'}</span>
            </>
          )}
        </button>

        <p className="footer-disclaimer">
          SalingJaga terintegrasi dengan BNPB, BMKG, Basarnas, PMI, dan Satgas BPBD Kota Tangerang.
        </p>
      </div>
    </aside>
  )
}
