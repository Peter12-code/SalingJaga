import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Package, Camera, Boxes, CheckCircle2, AlertTriangle, Check } from 'lucide-react'
import './LogisticsLedgerSection.css'

export default function LogisticsLedgerSection() {
  const { logistikList, setDonationModalOpen, setDonationTargetItem, userRole, konfirmasiDonasi } = useApp()
  const [filterCat, setFilterCat] = useState('Semua')
  const [fotoBuktiDonasi, setFotoBuktiDonasi] = useState({})

  const categories = ['Semua', 'Evakuasi', 'Pangan', 'Medis', 'Shelter', 'Khusus Balita', 'Sandang']

  const filtered = filterCat === 'Semua'
    ? logistikList
    : logistikList.filter((i) => i.kategori === filterCat)

  const handleDonate = (item) => {
    setDonationTargetItem(item)
    setDonationModalOpen(true)
  }

  const criticalItemsCount = logistikList.filter((i) => i.urgensi === 'kritis').length

  return (
    <div className="logistics-section-wrapper">
      {/* SECTION HEADER */}
      <div className="section-head-bar">
        <div className="head-bar-info">
          <div className="head-bar-icon-wrap icon-purple">
            <Package size={22} />
          </div>
          <div>
            <h2 className="l-section-title">Pusat Logistik & Gudang Bantuan Darurat</h2>
            <p className="l-section-sub">
              Pelacakan akuntabel stok sembako, peralatan evakuasi, medis, dan pasokan penyintas bencana
            </p>
          </div>
        </div>

        <div className="l-stats-pill">
          <span className="l-stats-dot" />
          <span>Total: <strong>{logistikList.length} Kebutuhan</strong> ({criticalItemsCount} Urgensi Kritis)</span>
        </div>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="l-filter-toolbar">
        {categories.map((c) => {
          const count = c === 'Semua'
            ? logistikList.length
            : logistikList.filter((i) => i.kategori === c).length
          return (
            <button
              key={c}
              type="button"
              className={`l-filter-btn ${filterCat === c ? 'active' : ''}`}
              onClick={() => setFilterCat(c)}
            >
              <span>{c}</span>
              <span className="l-filter-count">{count}</span>
            </button>
          )
        })}
      </div>

      {/* CARDS GRID */}
      <div className="l-cards-grid">
        {filtered.map((item) => {
          const pct = Math.min(100, Math.round((item.terkumpul / item.target) * 100))
          const isCritical = item.urgensi === 'kritis'

          return (
            <div key={item.id} className="l-item-card">
              <div className="l-card-top">
                <span className="l-cat-badge">{item.kategori}</span>
                <span className={`l-urgency-badge ${item.urgensi}`}>
                  {isCritical && <span className="urgency-ping-dot" />}
                  Urgensi {item.urgensi.toUpperCase()}
                </span>
              </div>

              <h3 className="l-item-title">{item.nama}</h3>
              <p className="l-item-desc">{item.keterangan}</p>

              <div className="l-progress-area">
                <div className="l-progress-header">
                  <span className="l-progress-label">Tingkat Pemenuhan:</span>
                  <span className="l-progress-pct">{pct}% Terpenuhi</span>
                </div>
                <div className="l-bar-track">
                  <div
                    className={`l-bar-fill ${pct >= 100 ? 'done' : isCritical ? 'danger' : 'normal'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="l-numbers-row">
                  <span>
                    Terkumpul: <strong>{item.terkumpul.toLocaleString('id-ID')}</strong> {item.satuan}
                  </span>
                  <span>
                    Target: <strong>{item.target.toLocaleString('id-ID')}</strong> {item.satuan}
                  </span>
                </div>
              </div>

              <div className="l-card-bottom">
                <div className="l-shortage">
                  {item.target - item.terkumpul > 0 ? (
                    <span className="shortage-text">
                      Kurang <strong>{(item.target - item.terkumpul).toLocaleString('id-ID')}</strong> {item.satuan}
                    </span>
                  ) : (
                    <span className="target-reached-text">
                      <CheckCircle2 size={13} /> Target Terpenuhi
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="btn-item-donate"
                  onClick={() => handleDonate(item)}
                >
                  Catat Pasokan
                </button>
              </div>

              {userRole === 'petugas' && item.menungguVerifikasi && item.menungguVerifikasi.length > 0 && (
                <div className="l-pending-verifications">
                  <div className="l-pending-title">Menunggu Konfirmasi Lapangan:</div>
                  {item.menungguVerifikasi.map((donasi) => (
                    <div key={donasi.id} className="l-pending-item">
                      <div className="l-pending-info">
                        <strong>{donasi.jumlah} {item.satuan}</strong> dari {donasi.namaDonatur}
                      </div>
                      <div className="l-pending-actions">
                        <input
                          type="file"
                          id={`foto-bukti-${donasi.id}`}
                          style={{ display: 'none' }}
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setFotoBuktiDonasi((prev) => ({ ...prev, [donasi.id]: e.target.files[0] }))
                            }
                          }}
                        />
                        <label
                          htmlFor={`foto-bukti-${donasi.id}`}
                          className={`btn-attach-foto ${fotoBuktiDonasi[donasi.id] ? 'attached' : ''}`}
                          title="Lampirkan Foto Bukti Distribusi"
                        >
                          <Camera size={13} />
                          {fotoBuktiDonasi[donasi.id] ? 'Terlampir' : 'Bukti'}
                        </label>
                        <button
                          type="button"
                          className="btn-konfirmasi-donasi"
                          onClick={() => {
                            konfirmasiDonasi(item.id, donasi.id, fotoBuktiDonasi[donasi.id])
                            setFotoBuktiDonasi((prev) => {
                              const next = { ...prev }
                              delete next[donasi.id]
                              return next
                            })
                          }}
                        >
                          <Check size={13} /> Sahkan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
