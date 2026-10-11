import { useApp } from '../context/AppContext'
import './EarlyWarningSection.css'

export default function EarlyWarningSection() {
  const { peringatanList, broadcastEWS } = useApp()

  const sensors = [
    {
      nama: 'Sensor Ketinggian Muka Air DAS Cimanuk (STA-04)',
      status: 'BAHAYA (Siaga 1)',
      nilai: '3.85 Meter',
      ambang: 'Batas Normal: 2.10 Meter',
      kondisi: 'Naik +45 cm dalam 2 jam terakhir akibat hujan hulu',
      warna: 'red',
    },
    {
      nama: 'Stasiun Pengukur Curah Hujan Sukamaju Selatan',
      status: 'HUJAN EKSTREM',
      nilai: '138 mm / Hari',
      ambang: 'Kategori Ekstrem > 100 mm/hari',
      kondisi: 'Diprakirakan berlanjut hingga pukul 21.00 WIB',
      warna: 'orange',
    },
    {
      nama: 'Extensometer Pergerakan Lereng Tebing Cigombong',
      status: 'WASPADA GERAKAN',
      nilai: '6.4 mm / Jam',
      ambang: 'Batas Kritis: 5.0 mm/jam',
      kondisi: 'Pergeseran terdeteksi pada lapisan tanah lapuk',
      warna: 'orange',
    },
    {
      nama: 'Akselerograf Gempa Bumi Lokal Lereng Pasirwangi',
      status: 'NORMAL (GETARAN SUSULAN RENDAH)',
      nilai: '0.02 g (PGA)',
      ambang: 'Ambang Gempa Kuat: > 0.15 g',
      kondisi: 'Seismisitas pasca-gempa M 4.8 menurun',
      warna: 'green',
    },
  ]

  return (
    <div className="ews-section-wrapper">
      <div className="section-head-bar">
        <div>
          <h2 className="ews-page-title">⚡ Sistem Peringatan Dini (EWS) & Telemetri Sensor</h2>
          <p className="ews-page-sub">
            Integrasi data sensor BMKG, PVMBG, sensor ketinggian air sungai, dan sirene broadcast warga
          </p>
        </div>
      </div>

      <div className="ews-telemetry-grid">
        {sensors.map((s, idx) => (
          <div key={idx} className={`sensor-card ${s.warna}`}>
            <div className="sensor-card-top">
              <span className="sensor-tag">TELEMETRI IOT</span>
              <span className={`sensor-status-badge ${s.warna}`}>{s.status}</span>
            </div>
            <h4 className="sensor-name">{s.nama}</h4>
            <div className="sensor-reading">
              <span className="sensor-reading-val">{s.nilai}</span>
              <span className="sensor-reading-threshold">{s.ambang}</span>
            </div>
            <p className="sensor-desc">{s.kondisi}</p>
          </div>
        ))}
      </div>

      <div className="ews-alerts-container">
        <h3 className="ews-alerts-heading">Maklumat Bahaya & Perintah Evakuasi Resmi</h3>
        <div className="ews-alerts-list">
          {peringatanList.map((p) => (
            <div key={p.id} className="ews-alert-item-card">
              <div className="ews-card-header">
                <span className="ews-item-level">{p.level}</span>
                <span className="ews-item-source">{p.sumber}</span>
              </div>
              <h4 className="ews-item-title">{p.judul}</h4>
              <p className="ews-item-detail">{p.rincian}</p>
              <div className="ews-recommendation-box">
                <strong>Instruksi Tanggap Darurat:</strong> {p.rekomendasi}
              </div>
              <div className="ews-item-footer">
                <span className="ews-time">
                  Dikeluarkan: {new Date(p.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </span>
                <button
                  className="btn-broadcast-alert"
                  onClick={() => broadcastEWS(p.id)}
                >
                  📢 Siarkan Peringatan ke 1.840 Kontak Warga (SMS & WA)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
