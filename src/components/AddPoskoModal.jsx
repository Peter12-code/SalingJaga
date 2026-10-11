import { useState } from 'react'
import { useApp } from '../context/AppContext'
import './AddModal.css'

export default function AddPoskoModal({ isOpen, onClose }) {
  const { setPoskoList, showNotif, catatAktivitas } = useApp()
  const [formData, setFormData] = useState({
    nama: '',
    kategori: 'posko',
    alamat: 'Jl. Daan Mogot, Kota Tangerang',
    kapasitas: 250,
    koordinator: 'Satgas BPBD Kota Tangerang',
    kontak: '0812-9988-7711',
    fasilitas: 'Dapur Umum Mandiri, Tenda Medis, Air Bersih, Toilet Portabel',
    kebutuhanTerdesak: 'Makanan siap saji, Selimut & Matras, Susu Bayi',
    lat: -6.1783,
    lng: 106.6319
  })

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const newId = `PSK-TGR-${Math.floor(Math.random() * 900) + 100}`
    const newPosko = {
      id: newId,
      wilayah: 'Tangerang',
      nama: formData.nama,
      kategori: formData.kategori,
      alamat: formData.alamat || 'Kota Tangerang',
      lat: Number(formData.lat),
      lng: Number(formData.lng),
      kapasitas: Number(formData.kapasitas),
      terisi: 0,
      fasilitas: formData.fasilitas.split(',').map(s => s.trim()),
      kebutuhanTerdesak: formData.kebutuhanTerdesak || 'Selimut & Matras, Obat-obatan dasar, Air Bersih',
      koordinator: formData.koordinator,
      kontak: formData.kontak,
      statusPasokan: 'Siap Tampung (Kapasitas Kosong)',
    }
    
    setPoskoList(prev => [newPosko, ...prev])
    if (catatAktivitas) {
      catatAktivitas(
        'posko_ditambahkan',
        `Mendaftarkan posko baru ${formData.nama} (Kapasitas ${formData.kapasitas} Jiwa) di ${newPosko.alamat}`
      )
    }
    showNotif(`Posko / Faskes ${formData.nama} berhasil ditambahkan ke Peta GIS!`)
    onClose()
  }

  return (
    <div className="premium-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="premium-modal-content">
        <div className="premium-modal-header">
          <h2 className="premium-modal-title">Registrasi Fasilitas Darurat</h2>
          <p className="premium-modal-subtitle">Tambah Posko Pengungsian, Depo Logistik, atau Faskes.</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="premium-form-group">
            <label>Nama Titik Fasilitas</label>
            <input className="premium-input" required type="text" placeholder="ex: Posko GOR Sudirman" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} />
          </div>

          <div className="premium-form-row">
            <div className="premium-form-group">
              <label>Kategori</label>
              <select className="premium-input" value={formData.kategori} onChange={e => setFormData({...formData, kategori: e.target.value})}>
                <option value="posko">Posko Pengungsian</option>
                <option value="faskes">Fasilitas Medis (Faskes)</option>
                <option value="logistik">Depo Logistik</option>
              </select>
            </div>
            <div className="premium-form-group">
              <label>Daya Tampung (Orang)</label>
              <input className="premium-input" required type="number" placeholder="Kapasitas max" value={formData.kapasitas} onChange={e => setFormData({...formData, kapasitas: e.target.value})} />
            </div>
          </div>

          <div className="premium-form-row">
            <div className="premium-form-group">
              <label>Koordinator Lapangan</label>
              <input className="premium-input" required type="text" placeholder="Nama penanggung jawab" value={formData.koordinator} onChange={e => setFormData({...formData, koordinator: e.target.value})} />
            </div>
            <div className="premium-form-group">
              <label>Kontak Darurat (WA)</label>
              <input className="premium-input" required type="text" placeholder="08xx-xxxx-xxxx" value={formData.kontak} onChange={e => setFormData({...formData, kontak: e.target.value})} />
            </div>
          </div>

          <div className="premium-form-group">
            <label>Fasilitas Tersedia</label>
            <input className="premium-input" required type="text" placeholder="Air Bersih, Dapur Umum, Velbed (pisahkan koma)" value={formData.fasilitas} onChange={e => setFormData({...formData, fasilitas: e.target.value})} />
          </div>

          <div className="premium-form-row">
            <div className="premium-form-group">
              <label>Koordinat Latitude</label>
              <input className="premium-input" required type="number" step="0.0001" placeholder="ex: -6.8372" value={formData.lat} onChange={e => setFormData({...formData, lat: e.target.value})} />
            </div>
            <div className="premium-form-group">
              <label>Koordinat Longitude</label>
              <input className="premium-input" required type="number" step="0.0001" placeholder="ex: 108.2255" value={formData.lng} onChange={e => setFormData({...formData, lng: e.target.value})} />
            </div>
          </div>
          
          <div className="premium-modal-actions">
            <button type="button" className="btn-premium-cancel" onClick={onClose}>Batal</button>
            <button type="submit" className="btn-premium-save">✨ Simpan Fasilitas</button>
          </div>
        </form>
      </div>
    </div>
  )
}
