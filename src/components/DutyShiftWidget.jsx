import { useState, useEffect } from 'react'
import {
  ShieldCheck,
  Clock,
  Users,
  Radio,
  FileText,
  RotateCcw,
  CheckCircle2,
  X,
  History,
  Send,
  AlertCircle
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import './DutyShiftWidget.css'

export default function DutyShiftWidget() {
  const { activeShift, lakukanSerahTerimaShift } = useApp()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [handoverNote, setHandoverNote] = useState('')
  const [nextSquad, setNextSquad] = useState('Regu Bravo')
  const [timeUntilShift, setTimeUntilShift] = useState('')

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date()
      // Shift target: 20:00 WIB if before 20:00, or 08:00 WIB next morning
      const target = new Date()
      if (now.getHours() < 20 && now.getHours() >= 8) {
        target.setHours(20, 0, 0, 0)
      } else {
        target.setHours(now.getHours() >= 20 ? 32 : 8, 0, 0, 0)
      }
      const diffMs = target - now
      if (diffMs <= 0) {
        setTimeUntilShift('Waktunya Pergantian Shift')
        return
      }
      const hours = Math.floor(diffMs / (1000 * 60 * 60))
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      setTimeUntilShift(`${hours} Jam ${minutes} Menit`)
    }

    calculateTimeRemaining()
    const timer = setInterval(calculateTimeRemaining, 60000)
    return () => clearInterval(timer)
  }, [])

  const handleSubmitHandover = (e) => {
    e.preventDefault()
    if (lakukanSerahTerimaShift) {
      lakukanSerahTerimaShift(handoverNote, nextSquad)
    }
    setHandoverNote('')
    setIsModalOpen(false)
  }

  return (
    <section className="duty-shift-container" aria-label="Status petugas piket dan shift pusdalops">
      {/* SHIFT BANNER BAR */}
      <div className="duty-shift-card">
        <div className="duty-card-left">
          <div className="duty-badge-row">
            <span className="duty-status-beacon" />
            <span className="duty-regu-name">{activeShift.regu}</span>
            <span className="duty-divider">|</span>
            <span className="duty-shift-name">{activeShift.shiftName}</span>
          </div>

          <div className="duty-headline">
            <h3 className="duty-title">Pusdalops BPBD Kota Tangerang — Siaga 24 Jam</h3>
            <p className="duty-desc">
              Pusat kendali komunikasi radio, monitoring DAS Cisadane/Angke, dan komando penugasan lapangan.
            </p>
          </div>

          {/* 4 ROSTER PETUGAS PIKET */}
          <div className="duty-officers-grid">
            <div className="duty-officer-item">
              <span className="officer-role">Perwira Jaga:</span>
              <strong className="officer-name">{activeShift.perwiraJaga}</strong>
              <small className="officer-nip">NIP. {activeShift.nipPerwira}</small>
            </div>
            <div className="duty-officer-item">
              <span className="officer-role">Operator Radio / EWS:</span>
              <strong className="officer-name">{activeShift.operatorRadio}</strong>
              <small className="officer-nip">Frekuensi: 155.200 MHz</small>
            </div>
            <div className="duty-officer-item">
              <span className="officer-role">Analis GIS & Triase AI:</span>
              <strong className="officer-name">{activeShift.analisGis}</strong>
              <small className="officer-nip">Satelit BMKG & Peta GIS</small>
            </div>
            <div className="duty-officer-item">
              <span className="officer-role">Dispatcher Logistik:</span>
              <strong className="officer-name">{activeShift.dispatcherLogistik}</strong>
              <small className="officer-nip">Armada & Gudang Siaga</small>
            </div>
          </div>
        </div>

        {/* SHIFT TIMING & ACTION */}
        <div className="duty-card-right">
          <div className="shift-countdown-box">
            <div className="countdown-icon-wrap">
              <Clock size={16} />
            </div>
            <div>
              <span className="countdown-label">Pergantian Shift Selanjutnya:</span>
              <strong className="countdown-val">
                {timeUntilShift || '05 Jam 30 Menit'} (Pukul {activeShift.jamSelesai})
              </strong>
            </div>
          </div>

          <button
            type="button"
            className="btn-shift-handover"
            onClick={() => setIsModalOpen(true)}
            title="Klik untuk membuka serah terima tugas piket"
          >
            <RotateCcw size={15} />
            <span>Serah Terima Shift</span>
          </button>
        </div>
      </div>

      {/* MODAL SERAH TERIMA SHIFT */}
      {isModalOpen && (
        <div className="shift-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div
            className="shift-modal-box"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-shift-title"
          >
            <div className="shift-modal-header">
              <div className="modal-title-wrap">
                <RotateCcw size={20} className="modal-icon-rotate" />
                <div>
                  <h3 id="modal-shift-title" className="modal-title">
                    Serah Terima Piket Jaga (Shift Handover)
                  </h3>
                  <p className="modal-sub">
                    Pusdalops-PB BPBD Kota Tangerang — Dokumentasi kelanjutan operasional bencana
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setIsModalOpen(false)}
                aria-label="Tutup modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitHandover} className="shift-modal-body">
              <div className="shift-form-row">
                <div className="form-group-half">
                  <label className="shift-input-label">Regu yang Menyerahkan:</label>
                  <div className="shift-static-field">
                    <strong>{activeShift.regu}</strong>
                    <span>{activeShift.perwiraJaga}</span>
                  </div>
                </div>

                <div className="form-group-half">
                  <label htmlFor="selectNextSquad" className="shift-input-label">
                    Regu Penerima Tugas:
                  </label>
                  <select
                    id="selectNextSquad"
                    className="shift-select"
                    value={nextSquad}
                    onChange={(e) => setNextSquad(e.target.value)}
                  >
                    <option value="Regu Bravo">Regu Bravo (Lettu Rahmat Hidayat, S.Sos)</option>
                    <option value="Regu Charlie">Regu Charlie (Lettu Joko Santoso, ST)</option>
                    <option value="Regu Alpha">Regu Alpha (Kapten Hendra Setiawan, S.STP)</option>
                  </select>
                </div>
              </div>

              <div className="form-group-full">
                <label htmlFor="handoverNotes" className="shift-input-label">
                  Catatan Kejadian Berjalan & Kondisi Logistik:
                </label>
                <textarea
                  id="handoverNotes"
                  className="shift-textarea"
                  rows={4}
                  placeholder="Contoh: Titik banjir Ciledug masih membutuhkan 2 unit perahu cadangan. Genset di Posko GOR Dimyati beroperasi lancar. Siagakan tim evakuasi untuk antisipasi kiriman debit Bendung Katulampa..."
                  value={handoverNote}
                  onChange={(e) => setHandoverNote(e.target.value)}
                  required
                />
              </div>

              {/* RIWAYAT SERAH TERIMA SEBELUMNYA */}
              <div className="shift-history-section">
                <div className="history-header">
                  <History size={14} />
                  <span>Log Serah Terima Terakhir:</span>
                </div>
                {activeShift.riwayatShift && activeShift.riwayatShift.length > 0 && (
                  <div className="history-item-box">
                    <div className="history-item-top">
                      <span className="history-time">{activeShift.riwayatShift[0].waktu}</span>
                      <span className="history-regu-transition">
                        {activeShift.riwayatShift[0].reguSebelum} ➔ {activeShift.riwayatShift[0].reguSesudah}
                      </span>
                    </div>
                    <p className="history-notes">"{activeShift.riwayatShift[0].catatan}"</p>
                    <small className="history-officers">
                      Diserahkan oleh: {activeShift.riwayatShift[0].petugasSerah} | Diterima oleh: {activeShift.riwayatShift[0].petugasTerima}
                    </small>
                  </div>
                )}
              </div>

              <div className="shift-modal-footer">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn-modal-submit">
                  <CheckCircle2 size={16} />
                  <span>Sahkan Serah Terima Shift</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
