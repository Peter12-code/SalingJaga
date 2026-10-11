import { useState, useEffect } from 'react'
import { Radio, AlertTriangle, Send, CheckCircle2, Clock, MapPin, Users, History, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import './EWSBroadcastModal.css'

export default function EWSBroadcastModal({ isOpen, onClose, initialTab = 'broadcast' }) {
  const { ewsHistory = [], kirimSiaranEWS, bpbdWilayah = 'Tangerang' } = useApp()

  const [activeTab, setActiveTab] = useState(initialTab) // 'broadcast' | 'history'

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'broadcast')
    }
  }, [isOpen, initialTab])
  const [judul, setJudul] = useState('Peringatan Dini Banjir Kenaikan Debit Sungai Cisadane')
  const [tingkatBahaya, setTingkatBahaya] = useState('Siaga 1')
  const [selectedWilayah, setSelectedWilayah] = useState([
    'Kec. Ciledug',
    'Kec. Periuk',
    'Kec. Karawaci',
  ])
  const [pesan, setPesan] = useState(
    'Tinggi Muka Air (TMA) Pintu Air 10 mencapai 13.20 meter (Siaga 1). Warga bantaran Sungai Cisadane dan pemukiman rawan banjir diinstruksikan segera mengamankan dokumen penting dan bersiap evakuasi menuju Posko Pengungsian GOR Dimyati atau Balai Ciledug.'
  )
  const [isBroadcasting, setIsBroadcasting] = useState(false)

  if (!isOpen) return null

  const KECAMATAN_TANGERANG = [
    'Kec. Ciledug',
    'Kec. Periuk',
    'Kec. Karawaci',
    'Kec. Cipondoh',
    'Kec. Pinang',
    'Kec. Tangerang',
    'Kec. Cibodas',
    'Kec. Larangan',
    'Kec. Jatiuwung',
    'Kec. Batuceper',
    'Kec. Benda',
    'Kec. Neglasari',
    'Seluruh Kota Tangerang',
  ]

  const PRESETS = [
    {
      title: 'Kenaikan TMA Cisadane (Siaga 1)',
      level: 'Siaga 1',
      areas: ['Kec. Ciledug', 'Kec. Periuk', 'Kec. Karawaci'],
      message:
        'Tinggi Muka Air Pintu Air 10 Cisadane telah menyentuh batas Siaga 1 (13.20 m). Warga bantaran sungai dihimbau segera mematikan aliran listrik dan evakuasi ke Posko Terdekat.',
    },
    {
      title: 'Banjir Genangan Ciledug Indah',
      level: 'Waspada',
      areas: ['Kec. Ciledug', 'Kec. Pinang'],
      message:
        'Genangan air di Perumahan Ciledug Indah telah mencapai 60-80 cm. Tim SAR Gabungan BPBD telah disiagakan dengan perahu karet.',
    },
    {
      title: 'Cuaca Ekstrem & Angin Kencang',
      level: 'Waspada',
      areas: ['Seluruh Kota Tangerang'],
      message:
        'Peringatan BMKG: Hujan lebat disertai angin kencang berdurasi 3 jam ke depan. Hindari berteduh di bawah pohon rindang dan papan reklame besar.',
    },
    {
      title: 'Instruksi Tanggap Darurat Evakuasi',
      level: 'Tanggap Darurat',
      areas: ['Kec. Ciledug', 'Kec. Periuk'],
      message:
        'INSTRUKSI RESMI BPBD KOTA TANGERANG: Seluruh warga di radius 500m dari tanggul jebol segera evakuasi ke Posko Pengungsian Balai Warga dan GOR Dimyati.',
    },
  ]

  const handleApplyPreset = (p) => {
    setJudul(p.title)
    setTingkatBahaya(p.level)
    setSelectedWilayah(p.areas)
    setPesan(p.message)
  }

  const toggleWilayah = (kec) => {
    if (kec === 'Seluruh Kota Tangerang') {
      setSelectedWilayah(['Seluruh Kota Tangerang'])
      return
    }
    const filtered = selectedWilayah.filter((w) => w !== 'Seluruh Kota Tangerang')
    if (filtered.includes(kec)) {
      setSelectedWilayah(filtered.filter((w) => w !== kec))
    } else {
      setSelectedWilayah([...filtered, kec])
    }
  }

  const handleSubmitBroadcast = (e) => {
    e.preventDefault()
    if (!judul.trim() || !pesan.trim() || selectedWilayah.length === 0) {
      alert('Harap isi judul, wilayah sasaran, dan pesan siaran.')
      return
    }

    setIsBroadcasting(true)
    setTimeout(() => {
      kirimSiaranEWS({
        judul,
        tingkatBahaya,
        wilayahSasaran: selectedWilayah.join(', '),
        pesan,
        jangkauan: `${(selectedWilayah.length * 4800).toLocaleString('id-ID')} Warga & Seluruh Satgas Lapangan`,
      })
      setIsBroadcasting(false)
      setActiveTab('history')
    }, 700)
  }

  return (
    <div
      className="ews-modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Modal Siaran Peringatan Dini EWS"
    >
      <div className="ews-modal-container">
        {/* Header Modal */}
        <div className="ews-modal-header">
          <div className="ews-header-title-group">
            <div className="ews-header-badge-icon">
              <Radio size={22} className="ews-radio-pulse" />
            </div>
            <div>
              <div className="ews-header-eyebrow">
                PUSAT KOMANDO · BPBD KOTA {bpbdWilayah.toUpperCase()}
              </div>
              <h2 className="ews-modal-title">Sistem Peringatan Dini (EWS)</h2>
            </div>
          </div>

          <div className="ews-header-actions">
            <div className="ews-tab-switch">
              <button
                type="button"
                className={`btn-ews-tab ${activeTab === 'broadcast' ? 'active' : ''}`}
                onClick={() => setActiveTab('broadcast')}
              >
                <Send size={14} />
                <span>Siarkan Baru</span>
              </button>
              <button
                type="button"
                className={`btn-ews-tab ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <History size={14} />
                <span>Riwayat Pesan ({ewsHistory.length})</span>
              </button>
            </div>

            <button
              type="button"
              className="btn-ews-close"
              onClick={onClose}
              aria-label="Tutup jendela EWS"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab 1: Form Siarkan EWS */}
        {activeTab === 'broadcast' && (
          <form className="ews-form-body" onSubmit={handleSubmitBroadcast}>
            {/* Presets Cepat */}
            <div className="ews-presets-panel">
              <div className="presets-label">Template Cepat Respon Bencana:</div>
              <div className="presets-chips-row">
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="chip-preset-item"
                    onClick={() => handleApplyPreset(p)}
                  >
                    <span className={`chip-dot ${p.level.toLowerCase().includes('tanggap') || p.level.includes('1') ? 'red' : 'amber'}`} />
                    <span>{p.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="ews-form-grid">
              {/* Kolom Kiri: Parameter Pesan */}
              <div className="ews-form-col-left">
                <div className="ews-input-group">
                  <label htmlFor="ews-judul">
                    Judul Peringatan Resmi <span className="req">*</span>
                  </label>
                  <input
                    id="ews-judul"
                    type="text"
                    className="ews-text-input"
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                    placeholder="Contoh: Peringatan Kenaikan TMA Sungai Cisadane"
                    required
                  />
                </div>

                <div className="ews-input-group">
                  <label>
                    Tingkat Bahaya / Status <span className="req">*</span>
                  </label>
                  <div className="ews-danger-level-selector">
                    {['Waspada', 'Siaga 1', 'Tanggap Darurat'].map((level) => {
                      const isSelected = tingkatBahaya === level
                      const colorClass =
                        level === 'Tanggap Darurat'
                          ? 'danger-critical'
                          : level === 'Siaga 1'
                          ? 'danger-warning'
                          : 'danger-advisory'
                      return (
                        <button
                          key={level}
                          type="button"
                          className={`btn-danger-level ${colorClass} ${isSelected ? 'selected' : ''}`}
                          onClick={() => setTingkatBahaya(level)}
                        >
                          <AlertTriangle size={14} />
                          <span>{level}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="ews-input-group">
                  <label htmlFor="ews-pesan">
                    Isi Pesan Peringatan (Disiarkan ke Warga & Relawan) <span className="req">*</span>
                  </label>
                  <textarea
                    id="ews-pesan"
                    className="ews-textarea-input"
                    rows={4}
                    value={pesan}
                    onChange={(e) => setPesan(e.target.value)}
                    placeholder="Tuliskan arahan evakuasi, titik kumpul, dan himbauan keselamatan..."
                    required
                  />
                  <div className="ews-char-hint">
                    Pesan akan otomatis disertai identitas resmi:{' '}
                    <strong>BPBD Kota Tangerang</strong>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Wilayah Sasaran */}
              <div className="ews-form-col-right">
                <div className="ews-input-group">
                  <label>
                    Wilayah Sasaran (Kecamatan di Kota Tangerang) <span className="req">*</span>
                  </label>
                  <div className="ews-areas-grid">
                    {KECAMATAN_TANGERANG.map((kec) => {
                      const isChecked = selectedWilayah.includes(kec)
                      return (
                        <label
                          key={kec}
                          className={`ews-area-checkbox-card ${isChecked ? 'active' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleWilayah(kec)}
                          />
                          <span>{kec}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Ringkasan Jangkauan */}
                <div className="ews-broadcast-preview-box">
                  <div className="preview-box-header">
                    <Users size={15} />
                    <span>Estimasi Jangkauan Siaran</span>
                  </div>
                  <div className="preview-stat-number">
                    {selectedWilayah.includes('Seluruh Kota Tangerang')
                      ? '± 1.890.000 Penduduk'
                      : `± ${(selectedWilayah.length * 48000).toLocaleString('id-ID')} Penduduk`}
                  </div>
                  <p className="preview-note">
                    Sirene darurat dan notifikasi push instan akan terkirim ke seluruh ponsel dalam
                    radius selular terpilih via SalingJaga Network.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Form */}
            <div className="ews-modal-footer">
              <button type="button" className="btn-ews-cancel" onClick={onClose}>
                Batal
              </button>
              <button
                type="submit"
                className="btn-ews-submit"
                disabled={isBroadcasting}
              >
                <Radio size={16} />
                <span>
                  {isBroadcasting
                    ? 'Menyiarkan ke Seluruh Tower...'
                    : 'Siarkan EWS Resmi (BPBD Kota Tangerang)'}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Riwayat Pesan EWS Resmi */}
        {activeTab === 'history' && (
          <div className="ews-history-body">
            <div className="ews-history-header-bar">
              <div>
                <h3 className="history-section-title">Riwayat Siaran Peringatan Dini BPBD</h3>
                <p className="history-section-desc">
                  Arsip pesan siaran darurat resmi yang telah dikirimkan ke wilayah layanan Kota
                  Tangerang.
                </p>
              </div>
              <button
                type="button"
                className="btn-history-create-new"
                onClick={() => setActiveTab('broadcast')}
              >
                <Send size={13} />
                <span>Siarkan Peringatan Baru</span>
              </button>
            </div>

            <div className="ews-history-list">
              {ewsHistory.map((item) => {
                const isCritical =
                  item.tingkatBahaya === 'Tanggap Darurat' || item.tingkatBahaya === 'Siaga 1'
                return (
                  <article key={item.id} className="ews-history-card">
                    <div className="history-card-top">
                      <div className="history-ident">
                        <span className="history-id">{item.id}</span>
                        <span className={`history-badge ${isCritical ? 'critical' : 'warning'}`}>
                          {item.tingkatBahaya}
                        </span>
                        <span className="history-channel">
                          <Radio size={11} /> EWS Broadcast Network
                        </span>
                      </div>
                      <div className="history-time-meta">
                        <Clock size={12} />
                        <span>
                          {item.waktuKirim} · {item.tanggal}
                        </span>
                      </div>
                    </div>

                    <h4 className="history-title">{item.judul}</h4>
                    <p className="history-message">“{item.pesan}”</p>

                    <div className="history-card-footer">
                      <div className="history-target-area">
                        <MapPin size={12} />
                        <span>
                          <strong>Wilayah Sasaran:</strong> {item.wilayahSasaran}
                        </span>
                      </div>

                      <div className="history-deliver-stats">
                        <span className="deliver-pill success">
                          <CheckCircle2 size={12} /> {item.status || 'Terkirim 100%'}
                        </span>
                        <span className="deliver-pill recipients">
                          <Users size={12} /> {item.totalPenerima}
                        </span>
                        <span className="deliver-pill actor">
                          {item.aktor || 'BPBD Kota Tangerang'}
                        </span>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
