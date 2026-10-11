import { useState } from 'react'
import { useApp } from '../context/AppContext'
import './AddModal.css'

export default function AddRelawanModal({ isOpen, onClose }) {
  const { setRelawanList, showNotif } = useApp()
  const [formData, setFormData] = useState({
    namaTim: '',
    spesialisasi: 'SAR & Evakuasi',
    jumlahPersonel: 10,
    picNama: '',
    kontak: '',
    perlengkapan: ''
  })

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const newId = `REL-${Math.floor(Math.random() * 900) + 100}`
    const newTeam = {
      id: newId,
      namaTim: formData.namaTim,
      status: 'Standby',
      spesialisasi: formData.spesialisasi,
      lokasiTugas: '',
      jumlahPersonel: Number(formData.jumlahPersonel),
      kontak: formData.picNama + ' (' + formData.kontak + ')',
      perlengkapan: formData.perlengkapan.split(',').map(s => s.trim()),
      catatanPenugasan: ''
    }
    
    setRelawanList(prev => [newTeam, ...prev])
    showNotif(`Tim Relawan ${formData.namaTim} berhasil ditambahkan!`)
    onClose()
  }

  return (
    <div className="premium-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="premium-modal-content">
        <div className="premium-modal-header">
          <h2 className="premium-modal-title">Registrasi Tim Relawan</h2>
          <p className="premium-modal-subtitle">Daftarkan armada/personil baru untuk operasional siaga.</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="premium-form-group">
            <label>Nama Tim / Organisasi</label>
            <input className="premium-input" required type="text" placeholder="ex: SAR Nasional, PMI Jabar" value={formData.namaTim} onChange={e => setFormData({...formData, namaTim: e.target.value})} />
          </div>
          
          <div className="premium-form-row">
            <div className="premium-form-group">
              <label>Spesialisasi Tim</label>
              <input className="premium-input" required type="text" placeholder="ex: Medis, Water Rescue" value={formData.spesialisasi} onChange={e => setFormData({...formData, spesialisasi: e.target.value})} />
            </div>
            <div className="premium-form-group">
              <label>Jumlah Personel</label>
              <input className="premium-input" required type="number" placeholder="Berapa orang?" value={formData.jumlahPersonel} onChange={e => setFormData({...formData, jumlahPersonel: e.target.value})} />
            </div>
          </div>

          <div className="premium-form-row">
            <div className="premium-form-group">
              <label>Nama Koordinator (PIC)</label>
              <input className="premium-input" required type="text" placeholder="Nama penanggung jawab" value={formData.picNama} onChange={e => setFormData({...formData, picNama: e.target.value})} />
            </div>
            <div className="premium-form-group">
              <label>Nomor WhatsApp PIC</label>
              <input className="premium-input" required type="text" placeholder="08xx-xxxx-xxxx" value={formData.kontak} onChange={e => setFormData({...formData, kontak: e.target.value})} />
            </div>
          </div>

          <div className="premium-form-group">
            <label>Daftar Perlengkapan</label>
            <input className="premium-input" required type="text" placeholder="Perahu Karet, Tenda, Obat-obatan (pisahkan koma)" value={formData.perlengkapan} onChange={e => setFormData({...formData, perlengkapan: e.target.value})} />
          </div>
          
          <div className="premium-modal-actions">
            <button type="button" className="btn-premium-cancel" onClick={onClose}>Batal</button>
            <button type="submit" className="btn-premium-save">✨ Simpan Tim</button>
          </div>
        </form>
      </div>
    </div>
  )
}
