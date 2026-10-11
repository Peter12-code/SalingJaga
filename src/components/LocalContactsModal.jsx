import { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  PhoneCall,
  MessageSquare,
  Search,
  X,
  Copy,
  Check,
  Building2,
  Shield,
  Truck,
  HeartPulse,
  Flame,
  Tent,
  Users,
  ExternalLink
} from 'lucide-react'
import './LocalContactsModal.css'

const KATEGORI_OPTIONS = [
  'Semua',
  'Faskes / RS',
  'Damkar',
  'PMI',
  'Aparat Kecamatan',
  'Operator Alat Berat',
  'Pengelola Posko',
]

export default function LocalContactsModal({ isOpen, onClose }) {
  const { kontakPentingList = [], bpbdWilayah = 'Tangerang', showNotif } = useApp()
  const [selectedKategori, setSelectedKategori] = useState('Semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState(null)

  if (!isOpen) return null

  const filteredContacts = kontakPentingList.filter((k) => {
    const matchCat = selectedKategori === 'Semua' || k.kategori === selectedKategori
    const matchQuery =
      searchQuery.trim() === '' ||
      k.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.pic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.keterangan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.alamat.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchQuery
  })

  const handleCopyPhone = (kontak) => {
    navigator.clipboard.writeText(kontak.telepon)
    setCopiedId(kontak.id)
    if (showNotif) {
      showNotif(`📞 Nomor ${kontak.nama} (${kontak.telepon}) tersalin ke clipboard!`)
    }
    setTimeout(() => setCopiedId(null), 2500)
  }

  const getCategoryIcon = (kat) => {
    switch (kat) {
      case 'Faskes / RS':
        return <HeartPulse size={16} />
      case 'Damkar':
        return <Flame size={16} />
      case 'PMI':
        return <Shield size={16} />
      case 'Aparat Kecamatan':
        return <Building2 size={16} />
      case 'Operator Alat Berat':
        return <Truck size={16} />
      case 'Pengelola Posko':
        return <Tent size={16} />
      default:
        return <Users size={16} />
    }
  }

  return (
    <div className="contacts-modal-backdrop" onClick={onClose}>
      <div className="contacts-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="contacts-header">
          <div className="contacts-header-left">
            <div className="contacts-icon-badge">
              <PhoneCall size={22} />
            </div>
            <div>
              <div className="contacts-eyebrow">DIREKTORI TANGGAP DARURAT · KOTA {bpbdWilayah.toUpperCase()}</div>
              <h2 className="contacts-title">Kontak Penting & Komando Lapangan</h2>
              <span className="contacts-subtitle">
                Hubungi faskes, damkar, PMI, camat, operator alat berat PU, dan pengelola posko secara instan
              </span>
            </div>
          </div>
          <button type="button" className="contacts-btn-close" onClick={onClose} aria-label="Tutup">
            <X size={20} />
          </button>
        </div>

        {/* SEARCH & FILTER STRIP */}
        <div className="contacts-filter-strip">
          <div className="contacts-search-box">
            <Search size={16} className="contacts-search-icon" />
            <input
              type="text"
              placeholder="Cari instansi, nama PIC, armada, atau lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="btn-clear-contacts-search"
                onClick={() => setSearchQuery('')}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="contacts-category-tabs" role="group">
            {KATEGORI_OPTIONS.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`cat-pill-btn ${selectedKategori === cat ? 'active' : ''}`}
                onClick={() => setSelectedKategori(cat)}
              >
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CONTACT CARDS GRID */}
        <div className="contacts-grid-content">
          {filteredContacts.length === 0 ? (
            <div className="contacts-empty-state">
              <p>Tidak ada kontak yang cocok dengan filter atau pencarian Anda.</p>
            </div>
          ) : (
            filteredContacts.map((c) => {
              const waClean = c.telepon.replace(/\D/g, '').replace(/^0/, '62')
              const waLink = `https://wa.me/${waClean}?text=Halo%20${encodeURIComponent(c.nama)},%20kami%20dari%20Pusdalops%20BPBD%20Kota%20Tangerang%20berkoordinasi%20terkait%20penanganan%20darurat.`
              const telLink = `tel:${c.telepon}`

              return (
                <div key={c.id} className="contact-tactical-card">
                  <div className="contact-card-top">
                    <span className="contact-cat-badge">
                      {getCategoryIcon(c.kategori)}
                      <span>{c.kategori}</span>
                    </span>
                    <span className="contact-status-available">Siaga 24 Jam</span>
                  </div>

                  <h3 className="contact-org-name">{c.nama}</h3>
                  <div className="contact-pic-row">
                    <strong>PIC:</strong> <span>{c.pic}</span>
                  </div>
                  <div className="contact-address-row">
                    <span>{c.alamat}</span>
                  </div>
                  <p className="contact-details-note">
                    {c.keterangan}
                  </p>

                  <div className="contact-card-actions">
                    <a
                      href={telLink}
                      className="btn-contact-action btn-call"
                      title={`Panggil langsung ke ${c.telepon}`}
                    >
                      <PhoneCall size={14} />
                      <span>{c.telepon}</span>
                    </a>

                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-contact-action btn-wa"
                      title="Kirim pesan koordinasi WhatsApp"
                    >
                      <MessageSquare size={14} />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      className="btn-contact-copy"
                      onClick={() => handleCopyPhone(c)}
                      title="Salin nomor kontak"
                    >
                      {copiedId === c.id ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* FOOTER */}
        <div className="contacts-modal-footer">
          <span className="contacts-footer-counter">
            Menampilkan <strong>{filteredContacts.length}</strong> dari {kontakPentingList.length} kontak penting satgas wilayah Kota {bpbdWilayah}.
          </span>
          <button type="button" className="btn-contacts-done" onClick={onClose}>
            Selesai
          </button>
        </div>
      </div>
    </div>
  )
}
