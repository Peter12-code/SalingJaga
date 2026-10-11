import { X, Building2, Phone, Mail, MapPin, ShieldCheck, Globe, Users, Award, Radio } from 'lucide-react'
import './ProfilBnpbModal.css'

export default function ProfilBnpbModal({ isOpen, onClose, onNavigateAdmin }) {
  if (!isOpen) return null

  return (
    <div className="profil-bnpb-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="profilBnpbTitle">
      <div className="profil-bnpb-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profil-bnpb-header">
          <div className="profil-bnpb-title-wrap">
            <div className="profil-bnpb-icon-emblem">
              <Globe size={22} className="text-amber" />
            </div>
            <div>
              <h2 id="profilBnpbTitle" className="profil-bnpb-title">Profil Instansi BNPB Pusat</h2>
              <p className="profil-bnpb-sub">Pusat Pengendalian Operasi Penanggulangan Bencana (PUSDALOPS PB)</p>
            </div>
          </div>
          <button type="button" className="btn-close-profil" onClick={onClose} aria-label="Tutup Profil">
            <X size={18} />
          </button>
        </div>

        <div className="profil-bnpb-body">
          {/* IDENTITAS RESMI */}
          <div className="profil-hero-badge-card">
            <div className="profil-hero-left">
              <span className="official-pill">INSTANSI PEMERINTAH PUSAT</span>
              <h3 className="agency-full-name">Badan Nasional Penanggulangan Bencana (BNPB)</h3>
              <p className="agency-decree">Berdasarkan UU No. 24 Tahun 2007 & Perpres No. 1 Tahun 2019</p>
            </div>
            <div className="profil-hero-right">
              <div className="status-krisis-tag">
                <span className="dot-pulse-amber" />
                <span>SIAGA KRISIS NASIONAL</span>
              </div>
              <span className="coverage-sub">Cakupan 38 Provinsi · 514 Kab/Kota</span>
            </div>
          </div>

          {/* GRID DETAIL */}
          <div className="profil-grid-details">
            <div className="profil-card-field">
              <div className="profil-card-label">
                <MapPin size={15} />
                <span>Markas Komando Graha BNPB</span>
              </div>
              <div className="profil-card-val">
                Graha BNPB Lt. 11, Jl. Pramuka Kav. 38, Matraman, Jakarta Timur 13120
              </div>
            </div>

            <div className="profil-card-field">
              <div className="profil-card-label">
                <Phone size={15} />
                <span>Hotline Pusdalops & Call Center</span>
              </div>
              <div className="profil-card-val">
                <strong>117</strong> (Bebas Pulsa 24 Jam) · (021) 29827793 · 0812-1237-5700
              </div>
            </div>

            <div className="profil-card-field">
              <div className="profil-card-label">
                <Users size={15} />
                <span>Pimpinan & Penanggung Jawab</span>
              </div>
              <div className="profil-card-val">
                Letjen TNI Suharyanto, S.Sos., M.M. (Kepala BNPB)
                <span className="val-sub">Piket Komandan Pusdalops: Drs. Hendro Wibowo</span>
              </div>
            </div>

            <div className="profil-card-field">
              <div className="profil-card-label">
                <Mail size={15} />
                <span>Email & Telemetri Kedinasan</span>
              </div>
              <div className="profil-card-val">
                pusdalops@bnpb.go.id · pusdatin@bnpb.go.id
              </div>
            </div>

            <div className="profil-card-field">
              <div className="profil-card-label">
                <Award size={15} />
                <span>Kredensial Keamanan Siber & Sandi</span>
              </div>
              <div className="profil-card-val">
                ISO/IEC 27001:2022 Certified · BSSN Kriptografi Kedaruratan Tingkat 4
              </div>
            </div>

            <div className="profil-card-field">
              <div className="profil-card-label">
                <Radio size={15} />
                <span>Infrastruktur EWS & Data</span>
              </div>
              <div className="profil-card-val">
                Integrasi Kominfo SMS CB, BMKG Inatews, PVMBG Magma, & Telemetri Satelit
              </div>
            </div>
          </div>
        </div>

        <div className="profil-bnpb-footer">
          <button type="button" className="btn-profil-close" onClick={onClose}>
            Tutup
          </button>
          <button
            type="button"
            className="btn-profil-to-admin"
            onClick={() => {
              onClose()
              if (onNavigateAdmin) onNavigateAdmin()
            }}
          >
            <ShieldCheck size={16} />
            <span>Buka Administrasi Akun BPBD</span>
          </button>
        </div>
      </div>
    </div>
  )
}
