import { useState } from 'react'
import { useApp } from '../context/AppContext'
import './LogisticsDonationModal.css'

export default function LogisticsDonationModal() {
  const {
    donationModalOpen,
    setDonationModalOpen,
    donationTargetItem,
    logistikList,
    donasiLogistik,
  } = useApp()

  const [jumlah, setJumlah] = useState('10')
  const [namaDonatur, setNamaDonatur] = useState('')

  if (!donationModalOpen) return null

  const targetItem = logistikList.find((i) => i.id === donationTargetItem?.id)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!targetItem || !jumlah || Number(jumlah) < 1) {
      alert('Masukkan jumlah bantuan yang valid.')
      return
    }
    donasiLogistik(
      targetItem.id,
      Number(jumlah),
      namaDonatur.trim() || 'Donatur Peduli SalingJaga'
    )
  }

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && setDonationModalOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div className="donation-modal-card">
        
        <div className="donation-modal-header">
          <div className="donation-header-title">
            <span className="donation-box-icon">📦</span>
            <div>
              <h3>Catat Pasokan Logistik</h3>
              <p>Perbarui angka stok dalam simulasi dashboard</p>
            </div>
          </div>
          <button type="button" className="btn-close-dispatch" onClick={() => setDonationModalOpen(false)} aria-label="Tutup formulir pasokan">
            ×
          </button>
        </div>

        {targetItem && (
          <div className="target-item-box">
            <div className="target-item-top">
              <span className="target-item-cat">{targetItem.kategori}</span>
              <span className={`target-item-urgency ${targetItem.urgensi}`}>
                Urgensi {targetItem.urgensi.toUpperCase()}
              </span>
            </div>
            <h4 className="target-item-name">{targetItem.nama}</h4>
            <div className="target-item-progress-wrap">
              <div className="target-item-progress-bar">
                <div
                  className="target-item-progress-fill"
                  style={{
                    width: `${Math.min(100, Math.round((targetItem.terkumpul / targetItem.target) * 100))}%`,
                  }}
                />
              </div>
              <div className="target-item-stats">
                <span>
                  Terkumpul: <strong>{targetItem.terkumpul}</strong> / {targetItem.target} {targetItem.satuan}
                </span>
                <span>
                  ({Math.round((targetItem.terkumpul / targetItem.target) * 100)}%)
                </span>
              </div>
            </div>
            <p className="target-item-desc">{targetItem.keterangan}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="donation-form">
          
          <div className="form-row-2">
            <div className="form-group-dispatch">
              <label>Jumlah Donasi / Pasokan ({targetItem?.satuan}) <span className="req">*</span></label>
              <input
                type="number"
                min="1"
                className="input-dispatch"
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value)}
                required
              />
            </div>
            <div className="form-group-dispatch">
              <label>Nama Donatur / Organisasi</label>
              <input
                type="text"
                className="input-dispatch"
                placeholder="contoh: Komunitas Alumni / PT Sinergi"
                value={namaDonatur}
                onChange={(e) => setNamaDonatur(e.target.value)}
              />
            </div>
          </div>

          <div className="donation-warning" style={{marginTop: '15px', padding: '12px', backgroundColor: '#fef3c7', borderLeft: '4px solid #f59e0b', borderRadius: '4px', fontSize: '0.85rem', color: '#92400e'}}>
            <strong>Mode demo:</strong> Jumlah terkumpul dalam aplikasi akan bertambah setelah disimpan. Penyerahan dan verifikasi barang fisik tidak dilakukan di sini.
          </div>

          <div className="donation-actions" style={{marginTop: '20px'}}>
            <button
              type="button"
              className="btn-dispatch-cancel"
              onClick={() => setDonationModalOpen(false)}
            >
              Batal
            </button>
            <button type="submit" className="btn-donation-submit">
              Catat Pasokan Demo
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
