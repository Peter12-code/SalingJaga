import { useState, useEffect } from 'react'
import {
  Radio,
  Send,
  CheckCircle2,
  Clock,
  MapPin,
  AlertTriangle,
  History,
  ShieldAlert,
  Users,
  Check,
  X,
  Volume2
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import './NationalEWSSection.css'

export default function NationalEWSSection() {
  const {
    wilayahNasionalList = [],
    riwayatEwsNasionalList = [],
    kirimEwsNasional,
  } = useApp()

  // Otomatis pilih wilayah kritis pertama dari data aktif yang tersedia
  const [selectedWilayahIds, setSelectedWilayahIds] = useState(() => {
    const firstCritical = wilayahNasionalList.find(
      (w) => w.butuhEskalasi || w.keparahan === 'kritis' || w.statusOperasional === 'Tanggap Darurat'
    )
    return firstCritical ? [firstCritical.id] : (wilayahNasionalList[0] ? [wilayahNasionalList[0].id] : [])
  })

  // Sinkronisasi dinamis jika daftar wilayah berubah atau ID dihapus
  useEffect(() => {
    const valid = selectedWilayahIds.filter((id) => wilayahNasionalList.some((w) => w.id === id))
    if (valid.length === 0 && wilayahNasionalList.length > 0) {
      const firstCritical = wilayahNasionalList.find(
        (w) => w.butuhEskalasi || w.keparahan === 'kritis' || w.statusOperasional === 'Tanggap Darurat'
      )
      setSelectedWilayahIds([firstCritical ? firstCritical.id : wilayahNasionalList[0].id])
    }
  }, [wilayahNasionalList])

  const [jenisPeringatan, setJenisPeringatan] = useState('Banjir Bandang & Lahar Hujan')
  const [levelPeringatan, setLevelPeringatan] = useState('AWAS (Siaga 1)')
  const [pesanEWS, setPesanEWS] = useState(
    'PERINGATAN DINI NASIONAL BNPB: Curah hujan ekstrem di hulu memicu potensi banjir bandang lahar dingin. Warga dalam radius 500 meter dari DAS segera evakuasi ke posko darurat.'
  )
  const [channelPilihan, setChannelPilihan] = useState('SMS Cell Broadcast BNPB, Sirene Posko, Radio VHF Darurat')
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)

  // Keyboard accessibility: tombol Esc menutup dialog
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isConfirmModalOpen) {
        setIsConfirmModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isConfirmModalOpen])

  const handleToggleRegion = (id) => {
    if (selectedWilayahIds.includes(id)) {
      setSelectedWilayahIds(selectedWilayahIds.filter((wId) => wId !== id))
    } else {
      setSelectedWilayahIds([...selectedWilayahIds, id])
    }
  }

  const handleSelectAllCritical = () => {
    const criticalIds = wilayahNasionalList
      .filter((w) => w.butuhEskalasi || w.keparahan === 'kritis')
      .map((w) => w.id)
    setSelectedWilayahIds(criticalIds)
  }

  const handleClearAll = () => {
    setSelectedWilayahIds([])
  }

  const selectedRegionsData = wilayahNasionalList.filter((w) => selectedWilayahIds.includes(w.id))
  const totalTargetResidents = selectedRegionsData.reduce((acc, r) => acc + (r.wargaTerdampak || 0), 0)

  // Buka dialog konfirmasi sebelum menyiarkan
  const handleSubmitClick = (e) => {
    e.preventDefault()
    if (selectedWilayahIds.length === 0 || !pesanEWS.trim()) return
    setIsConfirmModalOpen(true)
  }

  const handleConfirmBroadcast = () => {
    const targetNames = selectedRegionsData.map((w) => `${w.provinsi} (${w.nama})`)
    kirimEwsNasional(targetNames, jenisPeringatan, levelPeringatan, pesanEWS.trim(), {
      channel: channelPilihan,
      operator: 'Petugas Pusdalops BNPB Pusat',
      alasan: 'Kondisi cuaca ekstrem & peringatan dini terintegrasi BMKG/PVMBG',
      totalWarga: totalTargetResidents, // Gunakan satu sumber angka yang sama!
    })
    setIsConfirmModalOpen(false)
  }

  return (
    <section className="national-ews-section" aria-label="EWS nasional terarah">
      {/* SECTION HEADER */}
      <div className="ews-section-header">
        <div className="ews-header-left">
          <div className="ews-icon-badge">
            <Radio size={22} />
          </div>
          <div>
            <div className="ews-eyebrow">SISTEM PERINGATAN DINI MULTI-WILAYAH</div>
            <h3 className="ews-title">EWS Nasional Terarah (Early Warning System)</h3>
            <span className="ews-sub">
              Pusat penyiaran sirene peringatan dini lintas provinsi, SMS blast darurat operator seluler, dan jaringan radio kebencanaan
            </span>
          </div>
        </div>
      </div>

      <div className="ews-main-grid">
        {/* BROADCAST FORM */}
        <form className="ews-form-card" onSubmit={handleSubmitClick}>
          <div className="form-card-title">
            <ShieldAlert size={16} />
            <span>Formulir Penyiaran Darurat Terarah</span>
          </div>

          {/* 1. PILIH WILAYAH SASARAN BERDASARKAN ID */}
          <div className="form-group">
            <div className="group-label-row">
              <label>
                1. Pilih Wilayah Sasaran ({selectedWilayahIds.length} Wilayah Dipilih):
              </label>
              <div className="ews-quick-select-actions">
                <button
                  type="button"
                  className="btn-select-criticals"
                  onClick={handleSelectAllCritical}
                >
                  Pilih Wilayah Kritis
                </button>
                {selectedWilayahIds.length > 0 && (
                  <button
                    type="button"
                    className="btn-clear-selection"
                    onClick={handleClearAll}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            <div className="region-checkbox-grid">
              {wilayahNasionalList.map((w) => {
                const isChecked = selectedWilayahIds.includes(w.id)
                return (
                  <label key={w.id} className={`region-check-label ${isChecked ? 'checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleRegion(w.id)}
                    />
                    <div className="region-check-text">
                      <span className="reg-name">{w.nama}</span>
                      <span className="reg-prov">({w.provinsi})</span>
                    </div>
                    {w.butuhEskalasi && <span className="reg-badge-warn">Kritis</span>}
                  </label>
                )
              })}
            </div>

            {/* RINGKASAN PENERIMA EWS */}
            {selectedRegionsData.length > 0 ? (
              <div className="ews-recipient-summary-box">
                <div className="recipient-summary-header">
                  <span className="summary-title">
                    <Users size={13} /> Ringkasan Wilayah Sasaran Terpilih:
                  </span>
                  <span className="summary-reach">
                    Estimasi <strong>{totalTargetResidents.toLocaleString('id-ID')} Jiwa</strong> di zona bahaya
                  </span>
                </div>
                <div className="recipient-chips-list">
                  {selectedRegionsData.map((w) => (
                    <span key={w.id} className="recipient-chip">
                      <MapPin size={11} /> {w.nama} · {w.jenisBencana}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="ews-no-recipient-notice">
                <AlertTriangle size={14} />
                <span>Pilih minimal 1 wilayah sasaran di atas sebelum melakukan penyiaran.</span>
              </div>
            )}
          </div>

          {/* 2. JENIS & LEVEL */}
          <div className="form-two-col">
            <div className="form-group">
              <label htmlFor="jenisEws">2. Jenis Ancaman Bencana:</label>
              <select
                id="jenisEws"
                value={jenisPeringatan}
                onChange={(e) => setJenisPeringatan(e.target.value)}
              >
                <option value="Banjir Bandang & Lahar Hujan">Banjir Bandang & Lahar Hujan</option>
                <option value="Gempa Bumi & Potensi Tsunami">Gempa Bumi & Potensi Tsunami</option>
                <option value="Erupsi Vulkanik & Awan Panas">Erupsi Vulkanik & Awan Panas</option>
                <option value="Cuaca Ekstrem Siklon Tropis">Cuaca Ekstrem Siklon Tropis</option>
                <option value="Tanah Longsor Jalur Evakuasi">Tanah Longsor Jalur Evakuasi</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="levelEws">3. Tingkat Bahaya:</label>
              <select
                id="levelEws"
                value={levelPeringatan}
                onChange={(e) => setLevelPeringatan(e.target.value)}
              >
                <option value="AWAS (Siaga 1)">AWAS (Siaga 1 - Evakuasi Segera)</option>
                <option value="SIAGA (Siaga 2)">SIAGA (Siaga 2 - Siap Mengungsi)</option>
                <option value="WASPADA (Siaga 3)">WASPADA (Siaga 3 - Tingkatkan Kewaspadaan)</option>
              </select>
            </div>
          </div>

          {/* 3. KANAL PENYIARAN */}
          <div className="form-group">
            <label htmlFor="channelPilihan">4. Kanal Transmisi Penyiaran:</label>
            <select
              id="channelPilihan"
              value={channelPilihan}
              onChange={(e) => setChannelPilihan(e.target.value)}
            >
              <option value="SMS Cell Broadcast BNPB, Sirene Posko, Radio VHF Darurat">
                Seluruh Kanal (SMS Cell Broadcast, Sirene Posko, & Radio VHF)
              </option>
              <option value="SMS Cell Broadcast BNPB Saja">SMS Cell Broadcast Operator Seluler Saja</option>
              <option value="Sirene Peringatan Posko BPBD">Sirene Darurat di Titik Posko BPBD</option>
              <option value="Jaringan Radio Kebencanaan RAPI/ORARI">Jaringan Radio VHF/HF Darurat (RAPI/ORARI)</option>
            </select>
          </div>

          {/* 4. PESAN */}
          <div className="form-group">
            <label htmlFor="pesanEws">5. Teks Pesan Siaran ({pesanEWS.length}/320 Karakter):</label>
            <textarea
              id="pesanEws"
              rows={3}
              value={pesanEWS}
              onChange={(e) => setPesanEWS(e.target.value)}
              maxLength={320}
              placeholder="Ketik instruksi darurat untuk warga..."
            />
          </div>

          <button
            type="submit"
            className="btn-broadcast-submit"
            disabled={selectedWilayahIds.length === 0 || !pesanEWS.trim()}
          >
            <Radio size={16} />
            <span>Tinjau & Siarkan EWS Nasional</span>
          </button>
        </form>

        {/* RIWAYAT PENYIARAN */}
        <div className="ews-history-card">
          <div className="history-card-title">
            <History size={16} />
            <span>Riwayat Penyiaran EWS Nasional</span>
          </div>

          <div className="history-items-list">
            {riwayatEwsNasionalList.map((item) => (
              <div key={item.id} className="history-item">
                <div className="hist-top">
                  <span className="hist-level-badge">{item.level}</span>
                  <span className="hist-time">
                    <Clock size={12} /> {item.waktu}
                  </span>
                </div>
                <h5 className="hist-jenis">{item.jenis}</h5>
                <p className="hist-pesan">"{item.pesan}"</p>
                <div className="hist-targets">
                  <MapPin size={12} />
                  <span>Target: {Array.isArray(item.wilayahTarget) ? item.wilayahTarget.join(', ') : item.wilayahTarget}</span>
                </div>
                <div className="hist-meta-bot">
                  <span className="hist-reach">
                    <Users size={12} /> {item.jangkauanWarga}
                  </span>
                  <span className="hist-op">{item.operator}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL KONFIRMASI PENYIARAN EWS */}
      {isConfirmModalOpen && (
        <div className="ews-confirm-modal-backdrop" onClick={() => setIsConfirmModalOpen(false)}>
          <div
            className="ews-confirm-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
          >
            <div className="confirm-modal-header">
              <div className="confirm-icon-box">
                <Volume2 size={24} />
              </div>
              <div>
                <span className="confirm-eyebrow">VERIFIKASI AKSI KRITIS</span>
                <h4 id="confirm-modal-title" className="confirm-title">Konfirmasi Penyiaran EWS Nasional</h4>
              </div>
              <button
                type="button"
                className="confirm-btn-close"
                onClick={() => setIsConfirmModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="confirm-modal-body">
              <div className="confirm-alert-banner">
                <AlertTriangle size={18} />
                <span>
                  Peringatan darurat ini akan segera dipancarkan ke ponsel warga dan menembus jaringan sirene posko lokal.
                </span>
              </div>

              <div className="confirm-details-list">
                <div className="confirm-detail-row">
                  <span className="detail-label">Tingkat Bahaya:</span>
                  <strong className="detail-val text-red">{levelPeringatan}</strong>
                </div>
                <div className="confirm-detail-row">
                  <span className="detail-label">Jenis Bencana:</span>
                  <strong className="detail-val">{jenisPeringatan}</strong>
                </div>
                <div className="confirm-detail-row">
                  <span className="detail-label">Wilayah Sasaran:</span>
                  <div className="detail-val-regions">
                    {selectedRegionsData.map((w) => (
                      <span key={w.id} className="badge-region-target">
                        {w.nama} ({w.provinsi})
                      </span>
                    ))}
                  </div>
                </div>
                <div className="confirm-detail-row">
                  <span className="detail-label">Kanal Transmisi:</span>
                  <strong className="detail-val">{channelPilihan}</strong>
                </div>
                <div className="confirm-detail-row">
                  <span className="detail-label">Teks Siaran:</span>
                  <div className="detail-message-box">"{pesanEWS}"</div>
                </div>
              </div>
            </div>

            <div className="confirm-modal-footer">
              <button
                type="button"
                className="btn-confirm-cancel"
                onClick={() => setIsConfirmModalOpen(false)}
              >
                Batal / Periksa Kembali
              </button>
              <button
                type="button"
                className="btn-confirm-broadcast"
                onClick={handleConfirmBroadcast}
              >
                <Radio size={16} />
                <span>Konfirmasi & Siarkan Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
