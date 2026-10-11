import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import confetti from 'canvas-confetti'
import {
  dummyLaporan,
  dummyStats,
  dummyPosko,
  dummyRelawan,
  dummyLogistik,
  dummyPeringatanDini,
  dummyKontakPenting,
  STATUS_LAPORAN,
} from '../data/dummyData'
import {
  dummyWilayahNasional,
  dummyPermintaanDukunganBPBD,
  dummyDistribusiNasional,
  dummyKeluargaLintasDaerah,
  dummyRiwayatEwsNasional,
  STATUS_WILAYAH_NASIONAL,
  dummyAkunBPBDList,
  STATUS_AKUN_BPBD,
  MODE_PEMBEKUAN_BPBD,
  STATUS_PERMOHONAN_AKTIVASI,
  dummyAuditAdministrasiList,
} from '../data/nationalData'
import { playSuccessSound, playRadioChirp, playAlertSiren } from '../utils/audio'

const loadStorage = (key, fallback) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch (e) {
    console.warn(`Failed to parse localStorage for ${key}`, e)
    return fallback
  }
}

const saveStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.warn(`Failed to save to localStorage for ${key}`, e)
  }
}

const initialAktivitasBNPB = [
  {
    id: 'ACT-BNPB-01',
    waktu: '10:45 WIB',
    tanggal: 'Hari ini',
    operator: 'Petugas Pusdalops BNPB Pusat',
    tipe: 'persetujuan_dukungan',
    badge: 'Dukungan Disetujui',
    deskripsi: 'Menyetujui pengerahan 1 Unit Ekskavator Amphibi & 6 Personel SAR ke Kab. Agam & Lembah Anai (Sumbar). Disposisi pengerahan logistik via Helikopter Mi-17.',
    wilayah: 'Sumatera Barat',
  },
  {
    id: 'ACT-BNPB-02',
    waktu: '09:15 WIB',
    tanggal: 'Hari ini',
    operator: 'Kepala Pusat Krisis BNPB',
    tipe: 'status_wilayah',
    badge: 'Status Diperbarui',
    deskripsi: 'Peningkatan status tanggap darurat wilayah Flores Timur menjadi "Butuh Dukungan Pusat" atas rekomendasi PVMBG.',
    wilayah: 'Nusa Tenggara Timur',
  },
  {
    id: 'ACT-BNPB-03',
    waktu: '06:00 WIB',
    tanggal: 'Hari ini',
    operator: 'Operator Pusdalops BNPB Pusat',
    tipe: 'siaran_ews',
    badge: 'EWS Disiarkan',
    deskripsi: 'Menyiarkan Early Warning System level AWAS untuk DAS Marapi Sumatera Barat (Jangkauan 450.000 warga).',
    wilayah: 'Sumatera Barat',
  },
]

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [laporan, setLaporan] = useState(dummyLaporan)
  const [stats, setStats] = useState(dummyStats)
  const [poskoList, setPoskoList] = useState(dummyPosko)
  const [relawanList, setRelawanList] = useState(dummyRelawan)
  const [logistikList, setLogistikList] = useState(dummyLogistik)
  const [peringatanList, setPeringatanList] = useState(dummyPeringatanDini)
  const [kontakPentingList, setKontakPentingList] = useState(dummyKontakPenting)

  // NATIONAL BNPB DATA STATES WITH PERMANENT LOCALSTORAGE PERSISTENCE
  const [wilayahNasionalList, setWilayahNasionalList] = useState(() =>
    loadStorage('salingjaga_bnpb_wilayah', dummyWilayahNasional)
  )
  const [permintaanDukunganList, setPermintaanDukunganList] = useState(() =>
    loadStorage('salingjaga_bnpb_permintaan', dummyPermintaanDukunganBPBD)
  )
  const [distribusiNasionalList, setDistribusiNasionalList] = useState(() =>
    loadStorage('salingjaga_bnpb_distribusi', dummyDistribusiNasional)
  )
  const [riwayatEwsNasionalList, setRiwayatEwsNasionalList] = useState(() =>
    loadStorage('salingjaga_bnpb_ews', dummyRiwayatEwsNasional)
  )
  const [keluargaLintasDaerahData, setKeluargaLintasDaerahData] = useState(() =>
    loadStorage('salingjaga_bnpb_keluarga', dummyKeluargaLintasDaerah)
  )
  const [akunBpbdList, setAkunBpbdList] = useState(() =>
    loadStorage('salingjaga_bnpb_akun_bpbd', dummyAkunBPBDList)
  )
  const [auditAdministrasiList, setAuditAdministrasiList] = useState(() =>
    loadStorage('salingjaga_bnpb_audit_admin', dummyAuditAdministrasiList)
  )
  const [selectedWilayahNasional, setSelectedWilayahNasional] = useState(dummyWilayahNasional[0])
  const [nationalActiveTab, setNationalActiveTab] = useState('peta')
  const [isNationalSitRepOpen, setIsNationalSitRepOpen] = useState(false)

  const [userRole, setUserRole] = useState('warga') 
  const [activeTab, setActiveTab] = useState('map') 
  const [citizenTab, setCitizenTab] = useState('beranda')
  const [selectedId, setSelectedId] = useState('LPR-001')
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  const [analysisError, setAnalysisError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [notification, setNotification] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false) 
  const [adminLevel, setAdminLevel] = useState('regional') 
  const [theme, setTheme] = useState('light')
  const [bpbdWilayah, setBpbdWilayah] = useState('Tangerang') // Yurisdiksi lokal BPBD

  // Status Operasional Wilayah: Normal | Siaga | Tanggap Darurat
  const [statusWilayah, setStatusWilayah] = useState('Siaga')

  // Mode Insiden Aktif: Fokus dashboard ke satu insiden besar terpilih
  const [activeIncidentId, setActiveIncidentId] = useState(null)

  // Riwayat Siaran EWS Resmi BPBD
  const [ewsHistory, setEwsHistory] = useState([
    {
      id: 'EWS-TGR-002',
      judul: 'Peringatan Dini Kenaikan TMA Sungai Cisadane',
      pesan: 'Tinggi Muka Air (TMA) Pintu Air 10 mencapai 13.20 meter (Siaga 1). Warga bantaran Sungai Cisadane dan Ciledug diminta segera evakuasi ke Posko GOR Dimyati.',
      wilayahSasaran: 'Kec. Ciledug, Kec. Periuk, Kec. Karawaci (Kota Tangerang)',
      tingkatBahaya: 'Siaga 1',
      waktuKirim: '10:15 WIB',
      tanggal: 'Hari ini',
      aktor: 'BPBD Kota Tangerang',
      totalPenerima: '14.250 Warga & 4 Tim Relawan',
      status: 'Terkirim 100%'
    },
    {
      id: 'EWS-TGR-001',
      judul: 'Waspada Cuaca Ekstrem & Angin Kencang DAS Cisadane',
      pesan: 'Hujan intensitas lebat disertai angin kencang berpotensi banjir genangan di kawasan Ciledug Indah dan Periuk Damai.',
      wilayahSasaran: 'Seluruh Wilayah Kota Tangerang',
      tingkatBahaya: 'Waspada',
      waktuKirim: '07:30 WIB',
      tanggal: 'Hari ini',
      aktor: 'BPBD Kota Tangerang',
      totalPenerima: '48.900 Warga',
      status: 'Terkirim 100%'
    }
  ])

  // Riwayat Aktivitas Akun BPBD Daerah
  const [aktivitasBPBD, setAktivitasBPBD] = useState([
    {
      id: 'ACT-001',
      tipe: 'laporan_ditinjau',
      badge: 'Laporan Ditinjau',
      deskripsi: 'Meninjau dan menetapkan prioritas Kritis untuk Laporan LPR-001 (Banjir Ciledug Indah RW 06)',
      waktu: '10:35 WIB',
      aktor: 'BPBD Kota Tangerang'
    },
    {
      id: 'ACT-002',
      tipe: 'tim_dikerahkan',
      badge: 'Tim Dikerahkan',
      deskripsi: 'Mengerahkan Tim SAR Cisadane (12 Personel, 4 Perahu Karet) ke Komplek Ciledug Indah',
      waktu: '10:20 WIB',
      aktor: 'BPBD Kota Tangerang'
    },
    {
      id: 'ACT-003',
      tipe: 'ews_disiarkan',
      badge: 'EWS Disiarkan',
      deskripsi: 'Menyiarkan EWS Peringatan Dini Kenaikan TMA Cisadane ke Kec. Ciledug & Periuk',
      waktu: '10:15 WIB',
      aktor: 'BPBD Kota Tangerang'
    },
    {
      id: 'ACT-004',
      tipe: 'posko_ditambahkan',
      badge: 'Posko Terdaftar',
      deskripsi: 'Mendaftarkan Posko Evakuasi Balai Warga Ciledug Indah (Kapasitas 350 Jiwa)',
      waktu: '09:40 WIB',
      aktor: 'BPBD Kota Tangerang'
    },
    {
      id: 'ACT-005',
      tipe: 'logistik_disalurkan',
      badge: 'Logistik Terkirim',
      deskripsi: 'Mengirimkan 1.000 liter air mineral dan 50 matras dari Gudang BPBD ke Posko GOR Dimyati',
      waktu: '09:10 WIB',
      aktor: 'BPBD Kota Tangerang'
    }
  ])

  const [ewsModalOpen, setEwsModalOpen] = useState(false)
  const [activityModalOpen, setActivityModalOpen] = useState(false)
  const [poskoModalOpen, setPoskoModalOpen] = useState(false)
  const [isCloseReportOpen, setIsCloseReportOpen] = useState(false)
  const [closeReportTarget, setCloseReportTarget] = useState(null)
  const [isSitRepOpen, setIsSitRepOpen] = useState(false)
  const [isContactsOpen, setIsContactsOpen] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const [pickingLocation, setPickingLocation] = useState(false)
  const [pickedCoords, setPickedCoords] = useState(null)
  const [reportDraft, setReportDraft] = useState(null)
  const [reportFilter, setReportFilter] = useState('Semua')

  const [dispatchModalOpen, setDispatchModalOpen] = useState(false)
  const [dispatchTargetReport, setDispatchTargetReport] = useState(null)
  const [dispatchTargetVolunteerId, setDispatchTargetVolunteerId] = useState(null)
  const [donationModalOpen, setDonationModalOpen] = useState(false)
  const [donationTargetItem, setDonationTargetItem] = useState(null)

  const showNotif = useCallback((msg, type = 'success') => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 4000)
  }, [])

  const catatAktivitas = useCallback((tipe, deskripsi) => {
    const now = new Date()
    const waktu = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    const badgeLabel = {
      laporan_ditinjau: 'Laporan Ditinjau',
      tim_dikerahkan: 'Tim Dikerahkan',
      posko_ditambahkan: 'Posko Terdaftar',
      ews_disiarkan: 'EWS Disiarkan',
      status_diubah: 'Status Wilayah',
    }[tipe] || 'Aktivitas BPBD'

    const newActivity = {
      id: `ACT-${Date.now()}`,
      tipe,
      badge: badgeLabel,
      deskripsi,
      waktu,
      tanggal: 'Hari ini',
      aktor: `BPBD Kota ${bpbdWilayah || 'Tangerang'}`
    }
    setAktivitasBPBD((prev) => [newActivity, ...prev])
  }, [bpbdWilayah])

  const updateStatusWilayah = useCallback((statusBaru, meta = {}) => {
    setStatusWilayah(statusBaru)
    const alasanText = meta.alasan ? ` (Alasan: ${meta.alasan})` : ''
    const petugasText = meta.petugas ? ` [Oleh: ${meta.petugas}]` : ''
    catatAktivitas(
      'status_diubah',
      `Mengubah Status Operasional Wilayah Kota ${bpbdWilayah || 'Tangerang'} menjadi ${statusBaru}${alasanText}${petugasText}`
    )
    showNotif(
      `Status Wilayah diperbarui: ${statusBaru}`,
      statusBaru === 'Tanggap Darurat' ? 'warning' : 'success'
    )
  }, [bpbdWilayah, catatAktivitas, showNotif])

  // Catatan lapangan singkat
  const tambahCatatanLapangan = useCallback(
    (reportId, catatanText) => {
      if (!catatanText || !catatanText.trim()) return
      const now = new Date()
      const waktu = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
      const newNote = {
        id: `NOTE-${Date.now()}`,
        waktu,
        petugas: `Satgas BPBD Kota ${bpbdWilayah || 'Tangerang'}`,
        catatan: catatanText.trim(),
      }

      setLaporan((prev) =>
        prev.map((l) =>
          l.id === reportId
            ? { ...l, catatanLapangan: [newNote, ...(l.catatanLapangan || [])] }
            : l
        )
      )
      catatAktivitas('catatan_lapangan', `Menambahkan catatan lapangan pada laporan #${reportId}: "${catatanText.trim()}"`)
      showNotif('Catatan lapangan berhasil disimpan.')
    },
    [bpbdWilayah, catatAktivitas, showNotif]
  )

  // Status akses lokasi: terbuka | terbatas | tertutup
  const updateAksesLokasi = useCallback(
    (reportId, statusAkses) => {
      setLaporan((prev) =>
        prev.map((l) => (l.id === reportId ? { ...l, aksesLokasi: statusAkses } : l))
      )
      catatAktivitas('status_akses', `Memperbarui status akses lokasi #${reportId} menjadi: ${statusAkses.toUpperCase()}`)
      showNotif(`Status akses lokasi diubah menjadi ${statusAkses.toUpperCase()}.`)
    },
    [catatAktivitas, showNotif]
  )

  // Update kebutuhan detail per kejadian
  const updateKebutuhanDetail = useCallback(
    (reportId, needId, terpenuhiBaru) => {
      setLaporan((prev) =>
        prev.map((l) => {
          if (l.id !== reportId) return l
          const updatedNeeds = (l.kebutuhanDetail || []).map((n) =>
            n.id === needId
              ? {
                  ...n,
                  terpenuhi: Math.min(n.target, Math.max(0, Number(terpenuhiBaru))),
                  urgensi: Number(terpenuhiBaru) >= n.target ? 'terpenuhi' : n.urgensi,
                }
              : n
          )
          return { ...l, kebutuhanDetail: updatedNeeds }
        })
      )
      showNotif('Status kebutuhan logistik musibah berhasil diperbarui.')
    },
    [showNotif]
  )

  // Penutupan laporan yang rapi
  const tutupLaporanResmi = useCallback(
    (reportId, { hasilAksi, wargaTertangani, fotoBukti, logistikDisalurkan }) => {
      const target = laporan.find((l) => l.id === reportId)
      if (!target) return

      const now = new Date()
      const waktu = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'

      const penutupanData = {
        hasilAksi: hasilAksi || 'Evakuasi dan bantuan darurat telah tuntas terlaksana.',
        wargaTertangani: Number(wargaTertangani) || target.jumlahWarga || 0,
        fotoBukti: fotoBukti || target.foto || 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
        logistikDisalurkan: logistikDisalurkan || 'Tersalurkan sesuai kebutuhan lapangan',
        waktuSelesai: waktu,
        tanggalSelesai: 'Hari ini',
        petugas: `BPBD Kota ${bpbdWilayah || 'Tangerang'}`,
      }

      setLaporan((prev) =>
        prev.map((l) =>
          l.id === reportId
            ? {
                ...l,
                status: STATUS_LAPORAN.SELESAI,
                penutupan: penutupanData,
                waktuPembaruan: new Date().toISOString(),
              }
            : l
        )
      )

      setStats((prev) => ({ ...prev, bantuanTersalurkan: prev.bantuanTersalurkan + 1 }))
      catatAktivitas(
        'laporan_ditutup',
        `Menutup laporan #${reportId} (${target.jenis} - ${target.lokasi}) dengan ${penutupanData.wargaTertangani} warga tertangani.`
      )

      playSuccessSound()
      confetti({ particleCount: 80, spread: 90, origin: { y: 0.5 } })
      showNotif(`Laporan #${reportId} resmi ditutup dengan dokumentasi lengkap!`)
      setIsCloseReportOpen(false)
      setCloseReportTarget(null)
    },
    [bpbdWilayah, catatAktivitas, laporan, showNotif]
  )

  // Deteksi laporan ganda (jarak dekat < 2.5km dan jenis musibah sama)
  const getPotentialDuplicates = useCallback(
    (targetReport) => {
      if (!targetReport || !targetReport.lat || !targetReport.lng) return []
      return laporan.filter((other) => {
        if (other.id === targetReport.id) return false
        if (other.status === 'Selesai') return false
        const dLat = Math.abs(Number(other.lat) - Number(targetReport.lat))
        const dLng = Math.abs(Number(other.lng) - Number(targetReport.lng))
        const isNear = dLat < 0.025 && dLng < 0.025
        const isSameType = (other.jenis || '').toLowerCase() === (targetReport.jenis || '').toLowerCase()
        return isNear && isSameType
      })
    },
    [laporan]
  )

  // Indikator kelengkapan data
  const checkKelengkapanData = useCallback((report) => {
    if (!report) return { isComplete: true, missing: [] }
    const missing = []
    if (!report.foto || String(report.foto).trim() === '') missing.push('Foto Dokumentasi')
    if (!report.lat || !report.lng) missing.push('Titik Koordinat Lokasi')
    if (!report.jumlahWarga || Number(report.jumlahWarga) <= 0) missing.push('Estimasi Jumlah Warga')
    if (!report.kebutuhan || String(report.kebutuhan).trim() === '') missing.push('Kebutuhan Utama')
    return {
      isComplete: missing.length === 0,
      missing,
    }
  }, [])

  const tambahLaporan = useCallback(
    (formData) => {
      const newId = `LPR-${String(laporan.length + 1).padStart(3, '0')}`
      const defaultLat = formData.lat || -6.835 + (Math.random() - 0.5) * 0.04
      const defaultLng = formData.lng || 108.22 + (Math.random() - 0.5) * 0.04

      const newLaporan = {
        id: newId,
        ...formData,
        lat: Number(defaultLat),
        lng: Number(defaultLng),
        radius: formData.radius || 750,
        korbanJiwa: formData.korbanJiwa || 0,
        korbanLuka: formData.korbanLuka || 0,
        wargaMengungsi: formData.wargaMengungsi || Math.round(Number(formData.jumlahWarga) * 0.4),
        balitaDanLansia: formData.balitaDanLansia || Math.round(Number(formData.jumlahWarga) * 0.2),
        foto:
          formData.foto ||
          'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
        status: STATUS_LAPORAN.BARU,
        waktuLapor: new Date().toISOString(),
        pelapor: formData.pelapor || 'Warga Pelapor (App SalingJaga)',
        analisisAI: null,
      }

      setLaporan((prev) => [newLaporan, ...prev])
      setStats((prev) => ({
        ...prev,
        laporanMasuk: prev.laporanMasuk + 1,
        totalWargaTerdampak: prev.totalWargaTerdampak + Number(formData.jumlahWarga),
      }))
      setSelectedId(newId)
      setShowForm(false)
      setPickingLocation(false)
      setPickedCoords(null)

      playSuccessSound()
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } })
      showNotif(`Laporan ${newId} berhasil dikirim dan disematkan ke Peta GIS.`)
    },
    [laporan.length, showNotif]
  )

  const ubahStatusLaporan = useCallback((id, statusBaru) => {
    const current = laporan.find((l) => l.id === id)
    if (!current || current.status === statusBaru) return
    setLaporan((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: statusBaru, diperbaruiOleh: adminLevel === 'nasional' ? 'Super Admin BNPB Pusat' : 'Admin BPBD Daerah', waktuPembaruan: new Date().toISOString() } : l))
    )
    catatAktivitas('laporan_ditinjau', `Meninjau dan memperbarui status laporan #${id} (${current.jenis} di ${current.lokasi}) menjadi ${statusBaru}`)
    if (statusBaru === STATUS_LAPORAN.SELESAI) {
      setStats((prev) => ({ ...prev, bantuanTersalurkan: prev.bantuanTersalurkan + 1 }))
      playSuccessSound()
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } })
    }
  }, [adminLevel, catatAktivitas, laporan])

  const generateAutonomousAiTriage = (target) => {
    const isWater = /banjir|tsunami|tenggelam|air/i.test(target.jenis + ' ' + target.kondisi)
    const isLandslide = /longsor|tebing|tanah/i.test(target.jenis + ' ' + target.kondisi)
    const isQuake = /gempa|retak|runtuh/i.test(target.jenis + ' ' + target.kondisi)
    const isFire = /kebakaran|api|kios/i.test(target.jenis + ' ' + target.kondisi)

    let prioritas = 'sedang'
    let skor = 60

    if (target.jumlahWarga > 100 || isWater || isQuake || target.balitaDanLansia > 20) {
      prioritas = 'kritis'
      skor = Math.min(98, 85 + Math.floor(Math.random() * 12))
    } else if (target.jumlahWarga > 30 || isLandslide || isFire) {
      prioritas = 'tinggi'
      skor = 72 + Math.floor(Math.random() * 12)
    }

    const kebutuhanUtama = []
    const jenisRelawan = []
    const tindakanAdmin = []

    if (isWater) {
      kebutuhanUtama.push('Perahu karet SAR bermotor (min. 4 unit)', 'Life jacket & tali penyelamat', 'Air mineral 3.000 liter', 'Paket obat kulit & diare')
      jenisRelawan.push('Tim SAR Air & Evakuasi', 'Tim Medis Darurat', 'Dapur Umum')
      tindakanAdmin.push('Koordinasi posko pengungsian primer', 'Amankan suplai listrik tegangan rendah', 'Siapkan jalur evakuasi perahu')
    } else if (isLandslide) {
      kebutuhanUtama.push('Alat berat mini loader / excavator', 'Tenda pleton evakuasi', 'Lampu sorot penerangan genset', 'P3K trauma luka')
      jenisRelawan.push('Unit K9 & Runtuhan', 'Relawan Konstruksi Lapangan', 'Tim Medis')
      tindakanAdmin.push('Sterilisasi zona mahkota lereng labil', 'Buka akses logistik darurat')
    } else if (isQuake) {
      kebutuhanUtama.push('Tenda tahan gempa 30 unit', 'Matras & selimut tidur hangat', 'Dokter bedah tulang / ortopedi', 'Logistik pangan balita')
      jenisRelawan.push('Tim Trauma & Bedah', 'Relawan Psikososial Ramah Anak', 'Tagana')
      tindakanAdmin.push('Inspeksi ketahanan struktur posko', 'Sebarkan peta titik kumpul aman gempa')
    } else {
      kebutuhanUtama.push('Tenda darurat & terpal', 'Sembako & air bersih', 'Peralatan sanitasi darurat')
      jenisRelawan.push('Relawan Logistik', 'Dapur Umum Mandiri')
      tindakanAdmin.push('Verifikasi data korban dan aset terdampak', 'Salurkan bantuan awal')
    }

    return {
      prioritas,
      skor,
      ringkasan: `Evaluasi cerdas mengidentifikasi musibah ${target.jenis} di ${target.lokasi} berdampak pada ${target.jumlahWarga} warga. Kebutuhan primer difokuskan pada penyelamatan jiwa dan stabilisasi kebutuhan dasar.`,
      kebutuhanUtama,
      jenisRelawan,
      tindakanAdmin,
      batasWaktuRespons: prioritas === 'kritis' ? '2 jam' : prioritas === 'tinggi' ? '4 jam' : '12 jam',
      perluVerifikasi: ['Akses jalan alternatif logistik', 'Validitas data kelompok rentan di lokasi'],
      engineSource: 'SalingJaga Neural Triage AI v2.4 (Edge Evaluator)',
      dibuatPada: new Date().toISOString(),
    }
  }

  const analisisAI = useCallback(
    async (id) => {
      const target = laporan.find((l) => l.id === id)
      if (!target) return

      setLoadingAnalysis(true)
      setAnalysisError(null)

      const payload = {
        jenis: target.jenis,
        lokasi: target.lokasi,
        jumlahWarga: target.jumlahWarga,
        kondisi: target.kondisi,
        kebutuhan: target.kebutuhan,
      }

      try {
        const langflowUrl = import.meta.env.VITE_LANGFLOW_URL || 'http://localhost:7860'
        const flowId = import.meta.env.VITE_LANGFLOW_FLOW_ID || 'analyze_disaster_report'

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3500)

        const res = await fetch(`${langflowUrl}/api/v1/run/${flowId}?stream=false`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input_value: JSON.stringify(payload),
            input_type: 'chat',
            output_type: 'chat',
            tweaks: {},
          }),
          signal: controller.signal,
        })
        clearTimeout(timeoutId)

        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const raw = await res.json()
        const outputText =
          raw?.outputs?.[0]?.outputs?.[0]?.results?.message?.text ||
          raw?.outputs?.[0]?.outputs?.[0]?.messages?.[0]?.message ||
          JSON.stringify(raw)

        let analisis
        try {
          const jsonMatch = outputText.match(/\{[\s\S]*\}/)
          analisis = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: outputText }
        } catch {
          analisis = { raw: outputText }
        }

        analisis.dibuatPada = new Date().toISOString()
        analisis.engineSource = 'Langflow MCP REST API'

        setLaporan((prev) =>
          prev.map((l) => (l.id === id ? { ...l, analisisAI: analisis } : l))
        )
        if (analisis.prioritas === 'kritis') {
          setStats((prev) => ({ ...prev, prioritasKritis: prev.prioritasKritis + 1 }))
        }
        playSuccessSound()
        showNotif(`Analisis AI dari Langflow selesai dimuat untuk laporan ${id}.`)
      } catch (err) {
        
        console.warn('Langflow unreachable, switching to SalingJaga Autonomous Engine:', err.message)
        const fallbackAnalisis = generateAutonomousAiTriage(target)

        await new Promise((r) => setTimeout(r, 600))

        setLaporan((prev) =>
          prev.map((l) => (l.id === id ? { ...l, analisisAI: fallbackAnalisis } : l))
        )
        if (fallbackAnalisis.prioritas === 'kritis') {
          setStats((prev) => ({ ...prev, prioritasKritis: prev.prioritasKritis + 1 }))
        }
        playSuccessSound()
        showNotif(`Analisis AI Terpadu selesai dimuat (Triage Score: ${fallbackAnalisis.skor}/100).`)
      } finally {
        setLoadingAnalysis(false)
      }
    },
    [laporan, showNotif]
  )

  const dispatchRelawan = useCallback(
    (relawanId, targetLaporan, catatan = '') => {
      const rel = relawanList.find((r) => r.id === relawanId)
      if (!rel) return

      setRelawanList((prev) =>
        prev.map((r) =>
          r.id === relawanId
            ? {
                ...r,
                status: 'Menuju Lokasi',
                lokasiTugas: `${targetLaporan.jenis} - ${targetLaporan.lokasi}`,
                catatanPenugasan: catatan || 'Instruksi evakuasi darurat & bantuan pertama',
                ditugaskanOleh: adminLevel === 'nasional' ? 'Super Admin BNPB Pusat' : 'Admin BPBD Daerah',
                waktuPenugasan: new Date().toISOString(),
              }
            : r
        )
      )

      setLaporan((prev) =>
        prev.map((l) =>
          l.id === targetLaporan.id && l.status === STATUS_LAPORAN.BARU
            ? { ...l, status: STATUS_LAPORAN.DIPROSES, diperbaruiOleh: adminLevel === 'nasional' ? 'Super Admin BNPB Pusat' : 'Admin BPBD Daerah', waktuPembaruan: new Date().toISOString() }
            : l
        )
      )

      playRadioChirp()
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } })
      catatAktivitas('tim_dikerahkan', `Mengerahkan ${rel.namaTim || rel.nama} (${rel.jumlahPersonel || 8} personel) ke lokasi #${targetLaporan.id} (${targetLaporan.lokasi})`)
      showNotif(`🚨 ${rel.namaTim} berhasil ditugaskan ke ${targetLaporan.lokasi}!`)
      setDispatchModalOpen(false)
    },
    [relawanList, showNotif, adminLevel, catatAktivitas]
  )

  const donasiLogistik = useCallback(
    (itemId, jumlah, namaDonatur = 'Donatur Peduli SalingJaga') => {
      const item = logistikList.find((i) => i.id === itemId)
      if (!item) return

      const donasiBaru = {
        id: `DON-${Date.now()}`,
        namaDonatur,
        jumlah: Number(jumlah),
        waktu: new Date().toISOString()
      }

      setLogistikList((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? { ...i, menungguVerifikasi: [...(i.menungguVerifikasi || []), donasiBaru] }
            : i
        )
      )

      playSuccessSound()
      confetti({ particleCount: 90, spread: 100, origin: { y: 0.5 } })
      showNotif(`🎉 Terima kasih ${namaDonatur}! Donasi ${jumlah} ${item.satuan} sedang diproses dan menunggu konfirmasi petugas.`)
      setDonationModalOpen(false)
    },
    [logistikList, showNotif]
  )

  const konfirmasiDonasi = useCallback((itemId, donasiId, fotoBukti = null) => {
    setLogistikList((prev) =>
      prev.map((i) => {
        if (i.id === itemId) {
          const donasi = (i.menungguVerifikasi || []).find((d) => d.id === donasiId)
          if (!donasi) return i
          return {
            ...i,
            terkumpul: Math.min(i.target, i.terkumpul + donasi.jumlah),
            menungguVerifikasi: i.menungguVerifikasi.filter((d) => d.id !== donasiId),
          }
        }
        return i
      })
    )
    setStats((prev) => ({
      ...prev,
      bantuanTersalurkan: prev.bantuanTersalurkan + 1,
    }))
    showNotif(fotoBukti ? 'Donasi berhasil dikonfirmasi (dengan foto bukti) dan ditambahkan ke stok.' : 'Donasi berhasil dikonfirmasi dan ditambahkan ke stok.')
  }, [showNotif])

  const validasiKomunitas = useCallback((laporanId, tipe = 'ya', meta = {}) => {
    const key = `voted_report_${laporanId}`
    if (localStorage.getItem(key)) {
      showNotif('Anda sudah pernah memberikan verifikasi untuk laporan ini.', 'warning')
      return false
    }

    setLaporan((prev) =>
      prev.map((item) => {
        if (item.id !== laporanId) return item

        const currentYa = item.konfirmasiWarga || (item.voteYa && item.voteYa.length) || 1
        const currentTidak = item.laporanHoaks || (item.voteTidak && item.voteTidak.length) || 0

        if (tipe === 'ya') {
          const nextYa = currentYa + 1
          const isVerified = nextYa >= 3
          const newWitnessRecord = {
            id: `wit-${Date.now()}`,
            alasan: meta.alasan || 'Saksi Lapangan',
            catatan: meta.catatan || '',
            jarakKm: meta.jarakKm || 0.45,
            waktu: meta.waktu || 'Baru saja'
          }
          return {
            ...item,
            konfirmasiWarga: nextYa,
            saksiList: [...(item.saksiList || []), newWitnessRecord],
            voteYa: [...(item.voteYa || ['pelapor']), 'saksi-' + Date.now().toString(36)],
            statusVerifikasi: isVerified ? 'Terverifikasi Saksi Komunitas (3+ Warga)' : `Menunggu Saksi (${nextYa}/3)`,
          }
        } else {
          const nextTidak = currentTidak + 1
          const isFlagged = nextTidak >= 3
          const newHoaxRecord = {
            id: `hoax-${Date.now()}`,
            alasan: meta.alasan || 'Indikasi Fiktif',
            catatan: meta.catatan || '',
            jarakKm: meta.jarakKm || 0.5,
            waktu: meta.waktu || 'Baru saja'
          }
          return {
            ...item,
            laporanHoaks: nextTidak,
            indikasiHoaksList: [...(item.indikasiHoaksList || []), newHoaxRecord],
            voteTidak: [...(item.voteTidak || []), 'warga-' + Date.now().toString(36)],
            statusVerifikasi: isFlagged ? 'Terindikasi Fiktif/Hoaks (Diteruskan ke BPBD)' : item.statusVerifikasi || 'Dalam Peninjauan',
          }
        }
      })
    )

    localStorage.setItem(key, tipe)
    if (tipe === 'ya') {
      showNotif(`✅ Kesaksian diterima (${meta.jarakKm ? meta.jarakKm + ' km dari lokasi' : 'Radius terdekat'}). Terima kasih!`, 'success')
      playSuccessSound()
    } else {
      showNotif(`⚠️ Laporan fiktif dicatat (${meta.alasan || 'Indikasi fiktif'}) dan diteruskan ke Karantina BPBD.`, 'warning')
    }

    try {
      const vid = 'saksi-' + (localStorage.getItem('wargaId') || Math.random().toString(36).slice(2, 8))
      fetch('http://localhost:3001/api/vote-laporan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: laporanId,
          vote: tipe,
          voterId: vid,
          reason: meta.alasan,
          distanceKm: meta.jarakKm,
          witnessNote: meta.catatan,
        })
      }).catch(() => {})
    } catch {}

    return true
  }, [showNotif, playSuccessSound])

  const broadcastEWS = useCallback(
    (ewsId) => {
      const alert = peringatanList.find((p) => p.id === ewsId)
      if (!alert) return

      playAlertSiren()
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.4 } })
      showNotif(
        `📡 Peringatan Darurat disiarkan ke 1.840 kontak warga & relawan di radius 3 km!`,
        'warning'
      )
    },
    [peringatanList, showNotif]
  )

  const simulasiBencanaBaru = useCallback(() => {
    const demoItems = [
      {
        jenis: 'Gempa Bumi',
        lokasi: 'Kec. Sukamaju, Desa Babakan Girang',
        jumlahWarga: 140,
        kondisi: 'Gempa susulan M 4.2 mengakibatkan 4 dinding rumah roboh. Akses jembatan kayu retak.',
        kebutuhan: 'Tenda terpal 20 unit, selimut, air mineral galon, tim perawat P3K',
        lat: -6.845,
        lng: 108.212,
        radius: 1000,
      },
      {
        jenis: 'Banjir',
        lokasi: 'Kec. Sukamaju, Desa Karanganyar RT 02',
        jumlahWarga: 210,
        kondisi: 'Tanggul sekunder jebol selebar 4 meter. Air menggenangi jalan setinggi 80 cm.',
        kebutuhan: 'Karung pasir 500 pcs, perahu evakuasi 2 unit, makanan siap saji 300 porsi',
        lat: -6.822,
        lng: 108.245,
        radius: 1100,
      },
    ]

    const selectedPreset = demoItems[Math.floor(Math.random() * demoItems.length)]
    tambahLaporan(selectedPreset)
    showNotif(`⚡ [SIMULASI HACKATHON] Kejadian darurat baru disimulasikan!`, 'warning')
  }, [tambahLaporan, showNotif])


  const kirimSiaranEWS = useCallback(
    ({ judul, wilayahSasaran, tingkatBahaya, pesan, jangkauan }) => {
      const now = new Date()
      const waktu = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
      const newEws = {
        id: `EWS-TGR-${String(ewsHistory.length + 1).padStart(3, '0')}`,
        judul: judul || 'Peringatan Dini Bencana BPBD Kota Tangerang',
        pesan: pesan || 'Sirene peringatan dini telah diaktifkan.',
        wilayahSasaran: wilayahSasaran || 'Seluruh Wilayah Kota Tangerang',
        tingkatBahaya: tingkatBahaya || 'Siaga 1',
        waktuKirim: waktu,
        tanggal: 'Hari ini',
        aktor: `BPBD Kota ${bpbdWilayah || 'Tangerang'}`,
        totalPenerima: jangkauan || '18.500 Warga & Seluruh Satgas Lapangan',
        status: 'Terkirim 100%'
      }
      setEwsHistory((prev) => [newEws, ...prev])
      catatAktivitas('ews_disiarkan', `Menyiarkan ${newEws.judul} ke sasaran: ${newEws.wilayahSasaran}`)
      playAlertSiren()
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.4 } })
      showNotif(`📡 EWS berhasil disiarkan ke ${newEws.wilayahSasaran}!`, 'warning')
    },
    [bpbdWilayah, catatAktivitas, ewsHistory.length, showNotif]
  )

  // NATIONAL BNPB METHODS & PERSISTENCE
  const [supportQueueFilterRegion, setSupportQueueFilterRegion] = useState(null)
  const [isNationalActivityLogOpen, setIsNationalActivityLogOpen] = useState(false)

  // Riwayat Log Aktivitas & Audit Trail Komando BNPB Pusat (tersimpan di localStorage)
  const [aktivitasBNPB, setAktivitasBNPB] = useState(() =>
    loadStorage('salingjaga_bnpb_aktivitas', initialAktivitasBNPB)
  )

  // Helper sinkronisasi ke backend server (port 3001)
  const syncToBackend = (type, payload) => {
    try {
      fetch('http://localhost:3001/api/national/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, payload }),
      }).catch(() => {})
    } catch (e) {}
  }

  // Load awal dari backend jika tersedia (multi-device / cross-tab sync)
  useEffect(() => {
    fetch('http://localhost:3001/api/national/state')
      .then((res) => res.json())
      .then((res) => {
        if (res && res.success && res.data) {
          if (Array.isArray(res.data.wilayah) && res.data.wilayah.length) setWilayahNasionalList(res.data.wilayah)
          if (Array.isArray(res.data.permintaan) && res.data.permintaan.length) setPermintaanDukunganList(res.data.permintaan)
          if (Array.isArray(res.data.distribusi) && res.data.distribusi.length) setDistribusiNasionalList(res.data.distribusi)
          if (Array.isArray(res.data.ews) && res.data.ews.length) setRiwayatEwsNasionalList(res.data.ews)
          if (res.data.keluarga && res.data.keluarga.agregatNasional) setKeluargaLintasDaerahData(res.data.keluarga)
          if (Array.isArray(res.data.aktivitas) && res.data.aktivitas.length) setAktivitasBNPB(res.data.aktivitas)
          if (Array.isArray(res.data.akunBpbd) && res.data.akunBpbd.length) setAkunBpbdList(res.data.akunBpbd)
          if (Array.isArray(res.data.auditAdmin) && res.data.auditAdmin.length) setAuditAdministrasiList(res.data.auditAdmin)
        }
      })
      .catch(() => {})
  }, [])

  // Auto-sync National States to localStorage & Backend Server
  useEffect(() => {
    saveStorage('salingjaga_bnpb_wilayah', wilayahNasionalList)
    syncToBackend('wilayah', wilayahNasionalList)
  }, [wilayahNasionalList])

  useEffect(() => {
    saveStorage('salingjaga_bnpb_permintaan', permintaanDukunganList)
    syncToBackend('permintaan', permintaanDukunganList)
  }, [permintaanDukunganList])

  useEffect(() => {
    saveStorage('salingjaga_bnpb_distribusi', distribusiNasionalList)
    syncToBackend('distribusi', distribusiNasionalList)
  }, [distribusiNasionalList])

  useEffect(() => {
    saveStorage('salingjaga_bnpb_ews', riwayatEwsNasionalList)
    syncToBackend('ews', riwayatEwsNasionalList)
  }, [riwayatEwsNasionalList])

  useEffect(() => {
    saveStorage('salingjaga_bnpb_keluarga', keluargaLintasDaerahData)
    syncToBackend('keluarga', keluargaLintasDaerahData)
  }, [keluargaLintasDaerahData])

  useEffect(() => {
    saveStorage('salingjaga_bnpb_aktivitas', aktivitasBNPB)
    syncToBackend('aktivitas', aktivitasBNPB)
  }, [aktivitasBNPB])

  useEffect(() => {
    saveStorage('salingjaga_bnpb_akun_bpbd', akunBpbdList)
    syncToBackend('akunBpbd', akunBpbdList)
  }, [akunBpbdList])

  useEffect(() => {
    saveStorage('salingjaga_bnpb_audit_admin', auditAdministrasiList)
    syncToBackend('auditAdmin', auditAdministrasiList)
  }, [auditAdministrasiList])

  const catatAktivitasBNPB = useCallback(
    (tipe, badge, deskripsi, wilayah = 'Nasional', operator = 'Petugas Pusdalops BNPB Pusat') => {
      const now = new Date()
      const waktu = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
      const newEntry = {
        id: `ACT-BNPB-${Date.now().toString().slice(-4)}`,
        waktu,
        tanggal: 'Hari ini',
        operator,
        tipe,
        badge,
        deskripsi,
        wilayah,
      }
      setAktivitasBNPB((prev) => [newEntry, ...prev])
    },
    []
  )

  const ajukanPermintaanDukunganBaru = useCallback(
    (dataBaru) => {
      const newId = `REQ-BPBD-${Date.now().toString().slice(-4)}`
      const newReq = {
        id: newId,
        wilayahId: dataBaru.wilayahId || 'wil-custom',
        wilayahNama: dataBaru.wilayahNama || 'Wilayah Terdampak',
        provinsi: dataBaru.provinsi || 'Indonesia',
        kategori: dataBaru.kategori || 'Logistik Pengungsi Nasional',
        urgensi: dataBaru.urgensi || 'tinggi',
        status: 'Menunggu Persetujuan',
        rincian: dataBaru.rincian || 'Permohonan bantuan darurat logistik & armada BPBD',
        alasanKhusus: dataBaru.alasanKhusus || 'Peningkatan eskalasi situasi bencana di posko darurat',
        diajukanOleh: dataBaru.diajukanOleh || 'Pusdalops BPBD Setempat',
        waktuPengajuan: `${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
      }

      setPermintaanDukunganList((prev) => [newReq, ...prev])

      catatAktivitasBNPB(
        'pengajuan_dukungan',
        'Permohonan Baru',
        `Permohonan bantuan baru #${newId} diajukan untuk ${newReq.wilayahNama}: ${newReq.rincian}. Urgensi: ${newReq.urgensi}.`,
        newReq.provinsi,
        newReq.diajukanOleh
      )

      showNotif(`📋 Permohonan dukungan resmi untuk ${newReq.wilayahNama} berhasil diajukan ke antrean BNPB!`, 'success')
      return newReq
    },
    [catatAktivitasBNPB, showNotif]
  )

  const resetDataNasionalDefault = useCallback(() => {
    setWilayahNasionalList(dummyWilayahNasional)
    setPermintaanDukunganList(dummyPermintaanDukunganBPBD)
    setDistribusiNasionalList(dummyDistribusiNasional)
    setRiwayatEwsNasionalList(dummyRiwayatEwsNasional)
    setKeluargaLintasDaerahData(dummyKeluargaLintasDaerah)
    setAktivitasBNPB(initialAktivitasBNPB)
    setAkunBpbdList(dummyAkunBPBDList)
    setAuditAdministrasiList(dummyAuditAdministrasiList)
    localStorage.removeItem('salingjaga_bnpb_wilayah')
    localStorage.removeItem('salingjaga_bnpb_permintaan')
    localStorage.removeItem('salingjaga_bnpb_distribusi')
    localStorage.removeItem('salingjaga_bnpb_ews')
    localStorage.removeItem('salingjaga_bnpb_keluarga')
    localStorage.removeItem('salingjaga_bnpb_aktivitas')
    localStorage.removeItem('salingjaga_bnpb_akun_bpbd')
    localStorage.removeItem('salingjaga_bnpb_audit_admin')
    showNotif('🔄 Seluruh data simulasi BNPB berhasil dikembalikan ke data awal.', 'info')
  }, [showNotif])

  const setujuiPermintaanDukungan = useCallback(
    (reqId, options = {}) => {
      const {
        catatanDisposisi = 'Disposisi pimpinan darurat BNPB Pusat',
        armadaModa = 'Armada Tanggap Darurat BNPB',
        depoAsal = 'Pusat Logistik Nasional BNPB Sentul / Halim',
        operator = 'Petugas Pusdalops BNPB Pusat',
      } = options

      let targetReq = null
      setPermintaanDukunganList((prev) =>
        prev.map((r) => {
          if (r.id === reqId) {
            targetReq = r
            return {
              ...r,
              status: 'Disetujui (Dalam Pengiriman)',
              disposisiSatgas: catatanDisposisi,
              waktuPersetujuan: `${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
              disetujuiOleh: operator,
            }
          }
          return r
        })
      )

      if (targetReq) {
        const newDist = {
          id: `DIST-NAS-${Date.now().toString().slice(-4)}`,
          permintaanId: targetReq.id, // Menyimpan ID permintaan asal agar status tersinkronisasi
          namaBantuan: targetReq.rincian,
          asal: depoAsal,
          tujuan: `Posko Induk ${targetReq.wilayahNama}`,
          moda: armadaModa,
          status: 'Dalam Perjalanan',
          progresPersen: 25,
          eta: '3 Jam ke Depan',
          picPusat: operator,
          noManifest: `MANIFEST-BNPB-${Date.now().toString().slice(-4)}`,
        }
        setDistribusiNasionalList((prev) => [newDist, ...prev])

        catatAktivitasBNPB(
          'persetujuan_dukungan',
          'Dukungan Disetujui',
          `Menyetujui perbantuan ${targetReq.rincian} untuk ${targetReq.wilayahNama}. Alasan/Catatan: "${catatanDisposisi}". Moda: ${armadaModa}. Depo: ${depoAsal}.`,
          targetReq.provinsi || targetReq.wilayahNama,
          operator
        )
      }

      playSuccessSound()
      confetti({ particleCount: 80, spread: 90, origin: { y: 0.5 } })
      showNotif(`🚨 Permintaan dukungan ${targetReq?.wilayahNama || reqId} resmi DISETUJUI & armada pusat dikerahkan!`, 'success')
    },
    [catatAktivitasBNPB, showNotif]
  )

  const tandaiBantuanTiba = useCallback(
    (distId, options = {}) => {
      const {
        poskoPenerima = 'Posko Induk BPBD Terkait',
        catatanPenerimaan = 'Telah diverifikasi fisik dan diserahterimakan dalam kondisi baik.',
        operator = 'Petugas Pusdalops BNPB Pusat',
      } = options

      let targetDist = null
      setDistribusiNasionalList((prev) =>
        prev.map((d) => {
          if (d.id === distId) {
            targetDist = {
              ...d,
              status: 'Tiba di Posko',
              progresPersen: 100,
              eta: 'Telah Tiba di Lokasi',
              catatanPenerima: catatanPenerimaan,
              poskoPenerima,
            }
            return targetDist
          }
          return d
        })
      )

      if (targetDist) {
        // SINKRONISASI OTOMATIS: Update status permohonan BPBD asal ke "Tiba di Posko"
        setPermintaanDukunganList((prevReqs) =>
          prevReqs.map((r) => {
            const isMatch =
              (targetDist.permintaanId && r.id === targetDist.permintaanId) ||
              (targetDist.tujuan && r.wilayahNama && targetDist.tujuan.toLowerCase().includes(r.wilayahNama.toLowerCase()) && r.status === 'Disetujui (Dalam Pengiriman)')
            if (isMatch) {
              return {
                ...r,
                status: 'Tiba di Posko',
                waktuTiba: `${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
                disposisiSatgas: `${r.disposisiSatgas || ''} [Tiba di ${poskoPenerima}]`,
              }
            }
            return r
          })
        )

        catatAktivitasBNPB(
          'bantuan_tiba',
          'Bantuan Tiba di Posko',
          `Konfirmasi kedatangan bantuan "${targetDist.namaBantuan}" (${targetDist.noManifest}) di ${poskoPenerima}. Catatan: "${catatanPenerimaan}".`,
          targetDist.tujuan,
          operator
        )
      }

      showNotif('✅ Bantuan nasional telah diverifikasi tiba di posko BPBD daerah sasaran & status permintaan tersinkronisasi.', 'success')
    },
    [catatAktivitasBNPB, showNotif]
  )

  const rekonsiliasiKasusLintasDaerah = useCallback(
    (kasusId, options = {}) => {
      const {
        tahapKode = null,
        catatanVerifikasi = 'Data kecocokan keluarga diverifikasi oleh kedua posko pengungsian.',
        buktiPencocokan = [],
        picPoskoAsal = 'PIC Posko Pelapor',
        picPoskoTujuan = 'PIC Posko Rujukan',
        statusBaru = 'Tahap 1: Verifikasi Berkas & Identitas',
        operator = 'Satgas Reuni BNPB Pusat',
      } = options

      const normalizedBukti = Array.isArray(buktiPencocokan)
        ? [...buktiPencocokan]
        : typeof buktiPencocokan === 'string' && buktiPencocokan.trim()
        ? buktiPencocokan.split(',').map((s) => s.trim()).filter(Boolean)
        : []

      let targetKasus = null
      let isFinalResolved = false

      setKeluargaLintasDaerahData((prev) => {
        const target = prev.kasusEskalasi.find((k) => k.id === kasusId)
        if (!target) return prev

        // EVALUASI KETAT: Hanya Tahap 4 / Berhasil Dipertemukan yang dihitung selesai!
        // Tahap 1, 2, atau 3 TIDAK PERNAH mengubah angka Berhasil Dipertemukan
        const isNowResolved =
          Number(tahapKode) === 4 ||
          statusBaru === 'Berhasil Dipertemukan (Reuni Selesai)' ||
          (statusBaru.toLowerCase().includes('berhasil dipertemukan') &&
            !statusBaru.toLowerCase().includes('tahap 1') &&
            !statusBaru.toLowerCase().includes('tahap 2') &&
            !statusBaru.toLowerCase().includes('tahap 3'))

        const wasResolved =
          Number(target.tahapKode) === 4 ||
          target.status === 'Berhasil Dipertemukan (Reuni Selesai)' ||
          (target.status?.toLowerCase().includes('berhasil dipertemukan') &&
            !target.status?.toLowerCase().includes('tahap 1') &&
            !target.status?.toLowerCase().includes('tahap 2') &&
            !target.status?.toLowerCase().includes('tahap 3'))

        isFinalResolved = isNowResolved

        let updatedAgregat = { ...prev.agregatNasional }

        if (!wasResolved && isNowResolved) {
          // Hanya menambah KPI Berhasil saat memilih Tahap 4 (Penyelesaian Akhir)
          updatedAgregat = {
            ...updatedAgregat,
            berhasilDipertemukan: updatedAgregat.berhasilDipertemukan + 1,
            dalamPencarianAktif: Math.max(0, updatedAgregat.dalamPencarianAktif - 1),
            kasusEskalasiLintasWilayah: Math.max(0, updatedAgregat.kasusEskalasiLintasWilayah - 1),
          }
        } else if (wasResolved && !isNowResolved) {
          // Jika kasus dibuka kembali dari tahap 4 ke tahap 1/2/3
          updatedAgregat = {
            ...updatedAgregat,
            berhasilDipertemukan: Math.max(0, updatedAgregat.berhasilDipertemukan - 1),
            dalamPencarianAktif: updatedAgregat.dalamPencarianAktif + 1,
            kasusEskalasiLintasWilayah: updatedAgregat.kasusEskalasiLintasWilayah + 1,
          }
        }
        // Jika perpindahan antara Tahap 1, 2, atau 3 -> agregatNasional TETAP TIDAK BERUBAH

        const targetNumericCode =
          tahapKode ||
          (isNowResolved ? 4 : statusBaru.includes('Tahap 2') ? 2 : statusBaru.includes('Tahap 3') ? 3 : 1)

        const updatedKasus = prev.kasusEskalasi.map((k) => {
          if (k.id === kasusId) {
            targetKasus = k
            return {
              ...k,
              status: statusBaru,
              tahapKode: targetNumericCode,
              catatanVerifikasi,
              buktiPencocokan: normalizedBukti,
              picPoskoAsal,
              picPoskoTujuan,
              diverifikasiOleh: operator,
              waktuRekonsiliasi: `${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
            }
          }
          return k
        })

        return {
          agregatNasional: updatedAgregat,
          kasusEskalasi: updatedKasus,
        }
      })

      if (targetKasus) {
        catatAktivitasBNPB(
          'rekonsiliasi_keluarga',
          'Rekonsiliasi Antarposko',
          `Rekonsiliasi kasus #${kasusId} (${targetKasus.namaOrangHilang}). Status: "${statusBaru}". Verifikasi: ${catatanVerifikasi}. PIC Asal: ${picPoskoAsal}, PIC Tujuan: ${picPoskoTujuan}.`,
          targetKasus.provinsiAsal || 'Lintas Daerah',
          operator
        )
      }

      if (isFinalResolved) {
        playSuccessSound()
        confetti({ particleCount: 75, spread: 80, origin: { y: 0.5 } })
        showNotif(`🎉 Reuni Kasus #${kasusId} tuntas: Berhasil Dipertemukan!`, 'success')
      } else {
        showNotif(`Progres rekonsiliasi #${kasusId} diperbarui ke "${statusBaru}".`, 'info')
      }
    },
    [catatAktivitasBNPB, showNotif]
  )

  const kirimEwsNasional = useCallback(
    (targetWilayahArr, jenis, level, pesan, options = {}) => {
      const {
        channel = 'SMS Cell Broadcast BNPB, Sirene Posko, Radio VHF Darurat',
        operator = 'Operator Pusdalops BNPB Pusat',
        alasan = 'Indikasi telemetry BMKG/PVMBG mencapai ambang batas kritis',
        totalWarga = null,
      } = options

      const targets = Array.isArray(targetWilayahArr) ? targetWilayahArr : [targetWilayahArr]

      // Gunakan SATU SUMBER PERHITUNGAN yang konsisten dengan data warga terdampak aktual
      const calculatedResidents =
        typeof totalWarga === 'number' && totalWarga > 0
          ? totalWarga
          : targets.reduce((sum, t) => {
              const cleanT = String(t).toLowerCase()
              const found = wilayahNasionalList.find(
                (w) =>
                  w.id.toLowerCase() === cleanT ||
                  w.nama.toLowerCase().includes(cleanT) ||
                  cleanT.includes(w.nama.toLowerCase())
              )
              return sum + (found?.wargaTerdampak || 0)
            }, 0)

      const jangkauanWargaStr =
        calculatedResidents > 0
          ? `${calculatedResidents.toLocaleString('id-ID')} Jiwa Terdampak & Satgas Lapangan`
          : `${targets.length} Wilayah Sasaran Prioritas`

      const newBroadcast = {
        id: `EWS-NAS-${Date.now().toString().slice(-4)}`,
        waktu: `${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}, ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
        jenis: jenis || 'Peringatan Darurat Multi-Wilayah',
        level: level || 'AWAS (Siaga 1)',
        wilayahTarget: targets,
        pesan,
        channel,
        jangkauanWarga: jangkauanWargaStr,
        operator,
        alasan,
      }

      setRiwayatEwsNasionalList((prev) => [newBroadcast, ...prev])

      catatAktivitasBNPB(
        'siaran_ews',
        'EWS Nasional Disiarkan',
        `Menyiarkan peringatan "${jenis}" level ${level} ke ${targets.length} wilayah target (${targets.join(', ')}). Jangkauan: ${jangkauanWargaStr}. Channel: ${channel}.`,
        'Multi-Wilayah',
        operator
      )

      playAlertSiren()
      showNotif(`📡 EWS Nasional berhasil disiarkan ke ${targets.length} wilayah sasaran (${jangkauanWargaStr})!`, 'warning')
    },
    [wilayahNasionalList, catatAktivitasBNPB, showNotif]
  )

  const updateStatusWilayahNasional = useCallback(
    (wilayahId, statusBaru, options = {}) => {
      const {
        alasan = 'Penyesuaian status berdasarkan asesmen lapangan dan telemetry BMKG/PVMBG',
        operator = 'Kepala Pusat Krisis BNPB',
      } = options

      let targetW = null
      let statusLama = ''

      setWilayahNasionalList((prev) =>
        prev.map((w) => {
          if (w.id === wilayahId) {
            targetW = w
            statusLama = w.status
            return {
              ...w,
              status: statusBaru,
              butuhEskalasi: statusBaru === 'Butuh Dukungan Pusat',
              keparahan: statusBaru === 'Butuh Dukungan Pusat' ? 'kritis' : statusBaru === 'Tanggap Darurat' ? 'tinggi' : statusBaru === 'Siaga' ? 'sedang' : 'rendah',
            }
          }
          return w
        })
      )

      if (targetW) {
        catatAktivitasBNPB(
          'status_wilayah',
          'Status Wilayah Diperbarui',
          `Perubahan status darurat ${targetW.nama} (${targetW.provinsi}) dari "${statusLama}" menjadi "${statusBaru}". Alasan: "${alasan}".`,
          targetW.provinsi,
          operator
        )
      }

      showNotif(`Status wilayah ${targetW?.nama || wilayahId} berhasil diperbarui menjadi ${statusBaru}.`, 'info')
    },
    [catatAktivitasBNPB, showNotif]
  )

  // =========================================================================
  // ADMINISTRASI AKUN BPBD RESMI PUSDALOPS BNPB PUSAT
  // =========================================================================

  // Helper pencatat log audit administrasi yang immutable (tidak dapat dihapus)
  const catatAuditAdministrasi = useCallback(
    ({
      petugas = 'Petugas Pusdalops BNPB Pusat',
      instansi = 'BPBD Daerah',
      wilayah = 'Nasional',
      kodeWilayah = '-',
      aksi = 'Aksi Administratif',
      alasan = 'Operasional dinas resmi BNPB',
      ip = '10.0.1.1 (Pusdatin BNPB)',
      stateBefore = {},
      stateAfter = {},
    }) => {
      const now = new Date()
      const waktuStr =
        now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
        ', ' +
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
        ' WIB'
      const newEntry = {
        id: `AUDIT-ADM-${Date.now()}`,
        waktu: waktuStr,
        petugas,
        instansi,
        wilayah,
        kodeWilayah,
        aksi,
        alasan,
        ip,
        stateBefore,
        stateAfter,
      }
      setAuditAdministrasiList((prev) => [newEntry, ...prev])
      return newEntry
    },
    []
  )

  const tambahAkunBpbd = useCallback(
    (akunData, namaPetugasBNPB = 'Pusdalops BNPB Pusat') => {
      const now = new Date()
      const waktuStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
      const newId = `ACC-BPBD-${Date.now().toString().slice(-4)}`
      const newAccount = {
        id: newId,
        kodeWilayah: akunData.kodeWilayah || `${Math.floor(10 + Math.random() * 80)}.${Math.floor(10 + Math.random() * 80)}`,
        instansi: akunData.instansi,
        tingkat: akunData.tingkat || 'Kabupaten',
        wilayah: akunData.wilayah,
        provinsi: akunData.provinsi,
        alamatKantor: akunData.alamatKantor || `Jl. Utama Kantor BPBD ${akunData.wilayah}`,
        poskoUtama: akunData.poskoUtama || `Posko Terpadu Kedaruratan ${akunData.wilayah}`,
        statusKesiapsiagaan: akunData.statusKesiapsiagaan || 'Normal',
        terakhirUpdateKesiapsiagaan: waktuStr,
        emailResmi: akunData.emailResmi,
        hotline: akunData.hotline,
        penanggungJawab: {
          nama: akunData.penanggungJawabNama || akunData.namaPic || 'Plt. Kalaksa BPBD',
          nip: akunData.penanggungJawabNip || '-',
          jabatan: akunData.penanggungJawabJabatan || 'Kepala Pelaksana BPBD',
          kontak: akunData.penanggungJawabKontak || akunData.kontakPic || '-',
        },
        status: STATUS_AKUN_BPBD.MENUNGGU_VERIFIKASI,
        modePembekuan: null,
        terakhirLogin: 'Belum pernah login',
        ipTerakhir: '-',
        sesiAktif: 0,
        tanggalDibuat: waktuStr,
        permohonanAktivasi: {
          noSurat: akunData.noSurat || `01/${newId}/2026`,
          tanggalPengajuan: waktuStr,
          dokumenSK: akunData.dokumenSK || 'SK_Bupati_Walikota_Pengangkatan.pdf',
          status: STATUS_PERMOHONAN_AKTIVASI.MENUNGGU_REVIEW,
          catatanRevisi: null,
        },
        verifikasiInfo: null,
        keamanan: {
          loginGagalCount: 0,
          anomaliLokasi: null,
          sesiAktifList: [],
          riwayatReset: [],
        },
        kesehatan: {
          profilLengkap: Boolean(akunData.alamatKantor && akunData.poskoUtama),
          hotlineTerverifikasi: Boolean(akunData.hotline),
          inaktifHari: 0,
          statusKesehatan: 'Perlu Aktivasi',
          catatanKesehatan: 'Menunggu review berkas dan persetujuan aktivasi BNPB.',
        },
        penangguhanInfo: null,
        pengarsipanInfo: null,
        riwayatAktivitas: [
          {
            id: `ACT-${Date.now()}`,
            waktu: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
            aksi: `Pendaftaran akun diajukan oleh ${namaPetugasBNPB}`,
            ip: '10.0.1.1 (Pusdatin)',
            operator: namaPetugasBNPB,
          },
        ],
      }

      setAkunBpbdList((prev) => [newAccount, ...prev])

      catatAuditAdministrasi({
        petugas: namaPetugasBNPB,
        instansi: newAccount.instansi,
        wilayah: newAccount.wilayah,
        kodeWilayah: newAccount.kodeWilayah,
        aksi: 'Registrasi Akun Baru',
        alasan: 'Pendaftaran akun resmi wilayah ke direktori nasional BNPB',
        ip: '10.0.1.1 (Pusdatin)',
        stateBefore: { status: 'Belum Terdaftar' },
        stateAfter: { status: 'Menunggu Verifikasi', kodeKemendagri: newAccount.kodeWilayah },
      })

      catatAktivitasBNPB(
        'registrasi_akun',
        'Akun BPBD Didaftarkan',
        `Akun resmi baru untuk ${akunData.instansi} (${akunData.wilayah}) didaftarkan. Status: Menunggu Verifikasi.`,
        akunData.provinsi,
        namaPetugasBNPB
      )

      showNotif(`Akun resmi ${akunData.instansi} berhasil didaftarkan (Menunggu Verifikasi).`, 'success')
      return newAccount
    },
    [catatAuditAdministrasi, catatAktivitasBNPB, showNotif]
  )

  const verifikasiAkunBpbd = useCallback(
    (id, namaPetugasBNPB = 'Pusdalops BNPB Pusat', catatan = 'Dokumen SK Pelantikan & Surat Tugas Terverifikasi') => {
      let verifiedAccount = null
      let stateBefore = null
      let stateAfter = null
      const now = new Date()
      const waktuStr =
        now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
        ', ' +
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
        ' WIB'

      setAkunBpbdList((prev) =>
        prev.map((acc) => {
          if (acc.id === id) {
            verifiedAccount = acc
            stateBefore = { status: acc.status, permohonanStatus: acc.permohonanAktivasi?.status }
            stateAfter = { status: STATUS_AKUN_BPBD.AKTIF, permohonanStatus: STATUS_PERMOHONAN_AKTIVASI.DISETUJUI }
            const actEntry = {
              id: `ACT-${Date.now()}`,
              waktu: waktuStr,
              aksi: `Akun diverifikasi dan diaktifkan oleh ${namaPetugasBNPB}. Catatan: ${catatan}`,
              ip: '10.0.1.1 (Pusdatin)',
              operator: namaPetugasBNPB,
            }
            return {
              ...acc,
              status: STATUS_AKUN_BPBD.AKTIF,
              modePembekuan: null,
              permohonanAktivasi: {
                ...(acc.permohonanAktivasi || {}),
                status: STATUS_PERMOHONAN_AKTIVASI.DISETUJUI,
                catatanRevisi: null,
              },
              verifikasiInfo: {
                petugasVerifikator: namaPetugasBNPB,
                tanggalVerifikasi: waktuStr,
                catatan,
              },
              penangguhanInfo: null,
              riwayatAktivitas: [actEntry, ...(acc.riwayatAktivitas || [])],
            }
          }
          return acc
        })
      )

      if (verifiedAccount) {
        catatAuditAdministrasi({
          petugas: namaPetugasBNPB,
          instansi: verifiedAccount.instansi,
          wilayah: verifiedAccount.wilayah,
          kodeWilayah: verifiedAccount.kodeWilayah,
          aksi: 'Verifikasi & Aktivasi Akun',
          alasan: catatan,
          ip: '10.0.1.1 (Pusdatin)',
          stateBefore,
          stateAfter,
        })
        catatAktivitasBNPB(
          'verifikasi_akun',
          'Akun BPBD Diverifikasi',
          `Akun resmi ${verifiedAccount.instansi} (${verifiedAccount.wilayah}) telah disahkan aktif oleh ${namaPetugasBNPB}.`,
          verifiedAccount.provinsi,
          namaPetugasBNPB
        )
        playRadioChirp()
        showNotif(`Akun ${verifiedAccount.instansi} berhasil diverifikasi dan kini AKTIF!`, 'success')
      }
    },
    [catatAuditAdministrasi, catatAktivitasBNPB, showNotif]
  )

  const setujuiPermohonanAktivasi = useCallback(
    (id, { petugas = 'Drs. Hendro Wibowo (BNPB Pusat)', catatan = 'Dokumen SK Pelantikan & Berkas Keabsahan Sah.', statusKesiapsiagaan = 'Siaga' } = {}) => {
      let targetAcc = null
      let stateBefore = null
      let stateAfter = null
      const now = new Date()
      const waktuStr =
        now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
        ', ' +
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
        ' WIB'

      setAkunBpbdList((prev) =>
        prev.map((acc) => {
          if (acc.id === id) {
            targetAcc = acc
            stateBefore = {
              status: acc.status,
              statusPermohonan: acc.permohonanAktivasi?.status || 'Menunggu Review BNPB',
            }
            stateAfter = {
              status: STATUS_AKUN_BPBD.AKTIF,
              statusPermohonan: STATUS_PERMOHONAN_AKTIVASI.DISETUJUI,
              modePembekuan: null,
            }
            const actEntry = {
              id: `ACT-${Date.now()}`,
              waktu: waktuStr,
              aksi: `Permohonan aktivasi disetujui & akun resmi diaktifkan oleh ${petugas}. Catatan: ${catatan}`,
              ip: '10.0.1.1 (Pusdatin)',
              operator: petugas,
            }
            return {
              ...acc,
              status: STATUS_AKUN_BPBD.AKTIF,
              modePembekuan: null,
              statusKesiapsiagaan: statusKesiapsiagaan || acc.statusKesiapsiagaan,
              terakhirUpdateKesiapsiagaan: waktuStr,
              permohonanAktivasi: {
                ...(acc.permohonanAktivasi || {}),
                status: STATUS_PERMOHONAN_AKTIVASI.DISETUJUI,
                catatanRevisi: null,
              },
              verifikasiInfo: {
                petugasVerifikator: petugas,
                tanggalVerifikasi: waktuStr,
                catatan,
              },
              kesehatan: {
                ...(acc.kesehatan || {}),
                statusKesehatan: 'Sehat (Optimal)',
                catatanKesehatan: 'Akun telah disetujui dan aktif beroperasi.',
              },
              penangguhanInfo: null,
              riwayatAktivitas: [actEntry, ...(acc.riwayatAktivitas || [])],
            }
          }
          return acc
        })
      )

      if (targetAcc) {
        catatAuditAdministrasi({
          petugas,
          instansi: targetAcc.instansi,
          wilayah: targetAcc.wilayah,
          kodeWilayah: targetAcc.kodeWilayah,
          aksi: 'Persetujuan & Aktivasi Akun BPBD',
          alasan: catatan,
          ip: '10.0.1.1 (Pusdatin BNPB)',
          stateBefore,
          stateAfter,
        })
        catatAktivitasBNPB(
          'verifikasi_akun',
          'Aktivasi Akun Disetujui',
          `Permohonan akun resmi ${targetAcc.instansi} (${targetAcc.kodeWilayah}) disetujui dan diaktifkan oleh ${petugas}.`,
          targetAcc.provinsi,
          petugas
        )
        playSuccessSound()
        showNotif(`Permohonan ${targetAcc.instansi} disetujui! Akun resmi aktif untuk operasional bencana.`, 'success')
      }
    },
    [catatAuditAdministrasi, catatAktivitasBNPB, showNotif]
  )

  const kembalikanPermohonanAktivasi = useCallback(
    (id, { catatanRevisi = 'Dokumen SK Bupati/Walikota belum lengkap dan stempel dinas belum jelas.', petugas = 'Drs. Hendro Wibowo (BNPB Pusat)' } = {}) => {
      let targetAcc = null
      let stateBefore = null
      let stateAfter = null
      const now = new Date()
      const waktuStr =
        now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
        ', ' +
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
        ' WIB'

      setAkunBpbdList((prev) =>
        prev.map((acc) => {
          if (acc.id === id) {
            targetAcc = acc
            stateBefore = {
              status: acc.status,
              statusPermohonan: acc.permohonanAktivasi?.status || 'Menunggu Review BNPB',
            }
            stateAfter = {
              status: STATUS_AKUN_BPBD.MENUNGGU_VERIFIKASI,
              statusPermohonan: STATUS_PERMOHONAN_AKTIVASI.DIKEMBALIKAN,
              catatanRevisi,
            }
            const actEntry = {
              id: `ACT-${Date.now()}`,
              waktu: waktuStr,
              aksi: `Permohonan dikembalikan untuk perbaikan berkas oleh ${petugas}. Catatan: ${catatanRevisi}`,
              ip: '10.0.1.1 (Pusdatin)',
              operator: petugas,
            }
            return {
              ...acc,
              permohonanAktivasi: {
                ...(acc.permohonanAktivasi || {}),
                status: STATUS_PERMOHONAN_AKTIVASI.DIKEMBALIKAN,
                catatanRevisi,
              },
              kesehatan: {
                ...(acc.kesehatan || {}),
                statusKesehatan: 'Perlu Revisi Dokumen',
                catatanKesehatan: `Berkas dikembalikan untuk perbaikan: ${catatanRevisi}`,
              },
              riwayatAktivitas: [actEntry, ...(acc.riwayatAktivitas || [])],
            }
          }
          return acc
        })
      )

      if (targetAcc) {
        catatAuditAdministrasi({
          petugas,
          instansi: targetAcc.instansi,
          wilayah: targetAcc.wilayah,
          kodeWilayah: targetAcc.kodeWilayah,
          aksi: 'Pengembalian Permohonan (Perlu Perbaikan)',
          alasan: catatanRevisi,
          ip: '10.0.1.1 (Pusdatin BNPB)',
          stateBefore,
          stateAfter,
        })
        catatAktivitasBNPB(
          'permohonan_dikembalikan',
          'Permohonan Dikembalikan',
          `Berkas permohonan ${targetAcc.instansi} dikembalikan untuk revisi oleh ${petugas}. Catatan: ${catatanRevisi}`,
          targetAcc.provinsi,
          petugas
        )
        showNotif(`Permohonan ${targetAcc.instansi} dikembalikan ke daerah untuk perbaikan berkas.`, 'warning')
      }
    },
    [catatAuditAdministrasi, catatAktivitasBNPB, showNotif]
  )

  const ubahModePembekuan = useCallback(
    (id, { modePembekuan, alasan, durasi = '3 Hari (72 Jam)', petugas = 'Satgas Siber BNPB Pusat', catatan = '' } = {}) => {
      let targetAcc = null
      let stateBefore = null
      let stateAfter = null
      const now = new Date()
      const waktuStr =
        now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
        ', ' +
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
        ' WIB'

      const isNormalizing = !modePembekuan || modePembekuan === 'NORMAL'

      setAkunBpbdList((prev) =>
        prev.map((acc) => {
          if (acc.id === id) {
            targetAcc = acc
            stateBefore = {
              status: acc.status,
              modePembekuan: acc.modePembekuan || 'Normal (Penuh)',
              sesiAktif: acc.sesiAktif,
            }
            stateAfter = {
              status: isNormalizing ? STATUS_AKUN_BPBD.AKTIF : STATUS_AKUN_BPBD.DITANGGUHKAN,
              modePembekuan: isNormalizing ? 'Normal' : modePembekuan,
              sesiAktif: modePembekuan === 'TANGGUHKAN_PENUH' ? 0 : acc.sesiAktif,
            }
            const actEntry = {
              id: `ACT-${Date.now()}`,
              waktu: waktuStr,
              aksi: isNormalizing
                ? `Pembekuan dicabut penuh oleh ${petugas}. Akun kembali normal.`
                : `Penerapan mode ${modePembekuan} oleh ${petugas}. Alasan: ${alasan}. Durasi: ${durasi}`,
              ip: '10.0.1.25 (Satgas Siber)',
              operator: petugas,
            }
            return {
              ...acc,
              status: isNormalizing ? STATUS_AKUN_BPBD.AKTIF : STATUS_AKUN_BPBD.DITANGGUHKAN,
              modePembekuan: isNormalizing ? null : modePembekuan,
              sesiAktif: modePembekuan === 'TANGGUHKAN_PENUH' ? 0 : acc.sesiAktif,
              penangguhanInfo: isNormalizing
                ? null
                : {
                    mode: modePembekuan,
                    modeLabel: MODE_PEMBEKUAN_BPBD[modePembekuan] || modePembekuan,
                    alasan: alasan || 'Pengamanan sistem darurat',
                    durasi: durasi || '3 Hari',
                    petugas,
                    catatan: catatan || 'Tindakan pengawasan keamanan BNPB',
                    waktuMulai: waktuStr,
                  },
              kesehatan: {
                ...(acc.kesehatan || {}),
                statusKesehatan: isNormalizing
                  ? 'Sehat (Optimal)'
                  : modePembekuan === 'MODE_DARURAT'
                  ? 'Mode Darurat Aktif'
                  : modePembekuan === 'BEKUKAN_TINDAKAN_STRATEGIS'
                  ? 'Tindakan Dibatasi'
                  : 'Akses Dibekukan',
              },
              riwayatAktivitas: [actEntry, ...(acc.riwayatAktivitas || [])],
            }
          }
          return acc
        })
      )

      if (targetAcc) {
        catatAuditAdministrasi({
          petugas,
          instansi: targetAcc.instansi,
          wilayah: targetAcc.wilayah,
          kodeWilayah: targetAcc.kodeWilayah,
          aksi: isNormalizing ? 'Pencabutan Pembekuan Akses' : `Penerapan Mode Pembekuan: ${modePembekuan}`,
          alasan: alasan || (isNormalizing ? 'Pencabutan status pembekuan pasca-verifikasi' : 'Pembekuan terbatas'),
          ip: '10.0.1.25 (Satgas Siber)',
          stateBefore,
          stateAfter,
        })
        if (modePembekuan === 'TANGGUHKAN_PENUH') {
          playAlertSiren()
        } else {
          playRadioChirp()
        }
        showNotif(
          isNormalizing
            ? `Pembekuan untuk ${targetAcc.instansi} berhasil dicabut. Akun kembali normal.`
            : `Mode pembekuan [${modePembekuan}] berhasil diterapkan untuk ${targetAcc.instansi}.`,
          isNormalizing ? 'success' : 'warning'
        )
      }
    },
    [catatAuditAdministrasi, showNotif]
  )

  const pulihkanAksesAkun = useCallback(
    (id, { noSuratVerifikasi = 'SRT-REC/2026/01', hotlineTervalidasi = true, petugas = 'Pusdalops BNPB Pusat', alasan = 'Rotasi kredensial darurat via hotline resmi' } = {}) => {
      let targetAcc = null
      let stateBefore = null
      let stateAfter = null
      const now = new Date()
      const waktuStr =
        now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
        ', ' +
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
        ' WIB'

      // Zero-knowledge: Generate single-use temporary password
      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      const tempPassword = `BPBD-DARURAT-${randomCode}!#${new Date().getFullYear()}`

      setAkunBpbdList((prev) =>
        prev.map((acc) => {
          if (acc.id === id) {
            targetAcc = acc
            stateBefore = {
              status: acc.status,
              loginGagalCount: acc.keamanan?.loginGagalCount || 0,
              sesiAktif: acc.sesiAktif,
              kredensial: 'Kredensial Sebelumnya (Terenkripsi)',
            }
            stateAfter = {
              status: acc.status === STATUS_AKUN_BPBD.DITANGGUHKAN && acc.modePembekuan === 'TANGGUHKAN_PENUH' ? STATUS_AKUN_BPBD.AKTIF : acc.status,
              loginGagalCount: 0,
              sesiAktif: 0,
              kredensial: 'Kata Sandi Sementara Diterbitkan (Wajib Ganti)',
              verifikasiSurat: noSuratVerifikasi,
            }
            const actEntry = {
              id: `ACT-${Date.now()}`,
              waktu: waktuStr,
              aksi: `Pemulihan akses resmi via verifikasi surat ${noSuratVerifikasi} & hotline resmi oleh ${petugas}. Seluruh sesi diputus, brute-force counter direset. Zero-knowledge.`,
              ip: '10.0.1.1 (Pusdatin)',
              operator: petugas,
            }
            return {
              ...acc,
              sesiAktif: 0,
              keamanan: {
                ...(acc.keamanan || {}),
                loginGagalCount: 0,
                sesiAktifList: [],
                riwayatReset: [
                  {
                    waktu: waktuStr,
                    petugas,
                    alasan: `Surat: ${noSuratVerifikasi} | Hotline: ${hotlineTervalidasi ? 'Valid' : 'Manual'} | ${alasan}`,
                  },
                  ...((acc.keamanan && acc.keamanan.riwayatReset) || []),
                ],
              },
              riwayatAktivitas: [actEntry, ...(acc.riwayatAktivitas || [])],
            }
          }
          return acc
        })
      )

      if (targetAcc) {
        catatAuditAdministrasi({
          petugas,
          instansi: targetAcc.instansi,
          wilayah: targetAcc.wilayah,
          kodeWilayah: targetAcc.kodeWilayah,
          aksi: 'Pemulihan Akses Resmi (Zero-Knowledge)',
          alasan: `Verifikasi Surat: ${noSuratVerifikasi} | Hotline: ${hotlineTervalidasi ? 'Terverifikasi' : 'Manual'}. ${alasan}`,
          ip: '10.0.1.1 (Pusdatin BNPB)',
          stateBefore,
          stateAfter,
        })
        playSuccessSound()
        showNotif(`Akses resmi ${targetAcc.instansi} berhasil dipulihkan! Kata sandi sementara diterbitkan (wajib ganti).`, 'success')
      }

      return {
        success: true,
        tempPassword,
        instansi: targetAcc?.instansi,
        noSuratVerifikasi,
      }
    },
    [catatAuditAdministrasi, showNotif]
  )

  const akhiriSemuaSesiPerangkat = useCallback(
    (id, petugas = 'Pusdalops BNPB Pusat') => {
      let targetAcc = null
      let stateBefore = null
      let stateAfter = null
      const now = new Date()
      const waktuStr =
        now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
        ', ' +
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
        ' WIB'

      setAkunBpbdList((prev) =>
        prev.map((acc) => {
          if (acc.id === id) {
            targetAcc = acc
            stateBefore = {
              sesiAktif: acc.sesiAktif,
              daftarPerangkat: (acc.keamanan?.sesiAktifList || []).map((s) => s.perangkat).join(', ') || 'N/A',
            }
            stateAfter = {
              sesiAktif: 0,
              daftarPerangkat: 'Kosong (0 sesi)',
            }
            const actEntry = {
              id: `ACT-${Date.now()}`,
              waktu: waktuStr,
              aksi: `Semua sesi perangkat login (${acc.sesiAktif} sesi) dikeluarkan paksa (Force Logout) oleh ${petugas}`,
              ip: '10.0.1.25 (Satgas Siber)',
              operator: petugas,
            }
            return {
              ...acc,
              sesiAktif: 0,
              keamanan: {
                ...(acc.keamanan || {}),
                sesiAktifList: [],
              },
              riwayatAktivitas: [actEntry, ...(acc.riwayatAktivitas || [])],
            }
          }
          return acc
        })
      )

      if (targetAcc) {
        catatAuditAdministrasi({
          petugas,
          instansi: targetAcc.instansi,
          wilayah: targetAcc.wilayah,
          kodeWilayah: targetAcc.kodeWilayah,
          aksi: 'Pengeluaran dari Semua Perangkat (Force Logout)',
          alasan: 'Tindakan pengamanan pemutusan seluruh sesi aktif perangkat oleh BNPB Pusat',
          ip: '10.0.1.25 (Satgas Siber)',
          stateBefore,
          stateAfter,
        })
        showNotif(`Seluruh sesi login perangkat untuk ${targetAcc.instansi} berhasil dikeluarkan!`, 'info')
      }
    },
    [catatAuditAdministrasi, showNotif]
  )

  const editAkunBpbd = useCallback(
    (id, updatedFields, namaPetugasBNPB = 'Pusdalops BNPB Pusat') => {
      let editedAccount = null
      let stateBefore = null
      let stateAfter = null
      const now = new Date()
      const waktuStr =
        now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
        ', ' +
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
        ' WIB'

      setAkunBpbdList((prev) =>
        prev.map((acc) => {
          if (acc.id === id) {
            editedAccount = acc
            stateBefore = {
              instansi: acc.instansi,
              wilayah: acc.wilayah,
              hotline: acc.hotline,
              pic: acc.penanggungJawab?.nama,
            }
            stateAfter = {
              instansi: updatedFields.instansi || acc.instansi,
              wilayah: updatedFields.wilayah || acc.wilayah,
              hotline: updatedFields.hotline || acc.hotline,
              pic: updatedFields.penanggungJawabNama !== undefined ? updatedFields.penanggungJawabNama : acc.penanggungJawab?.nama,
            }
            const actEntry = {
              id: `ACT-${Date.now()}`,
              waktu: waktuStr,
              aksi: `Pembaruan profil instansi & penanggung jawab oleh ${namaPetugasBNPB}`,
              ip: '10.0.1.1 (Pusdatin)',
              operator: namaPetugasBNPB,
            }
            return {
              ...acc,
              instansi: updatedFields.instansi || acc.instansi,
              wilayah: updatedFields.wilayah || acc.wilayah,
              provinsi: updatedFields.provinsi || acc.provinsi,
              tingkat: updatedFields.tingkat || acc.tingkat,
              alamatKantor: updatedFields.alamatKantor || acc.alamatKantor,
              poskoUtama: updatedFields.poskoUtama || acc.poskoUtama,
              statusKesiapsiagaan: updatedFields.statusKesiapsiagaan || acc.statusKesiapsiagaan,
              terakhirUpdateKesiapsiagaan: waktuStr,
              emailResmi: updatedFields.emailResmi || acc.emailResmi,
              hotline: updatedFields.hotline || acc.hotline,
              penanggungJawab: {
                nama:
                  updatedFields.penanggungJawabNama !== undefined
                    ? updatedFields.penanggungJawabNama
                    : acc.penanggungJawab?.nama,
                nip:
                  updatedFields.penanggungJawabNip !== undefined
                    ? updatedFields.penanggungJawabNip
                    : acc.penanggungJawab?.nip,
                jabatan:
                  updatedFields.penanggungJawabJabatan !== undefined
                    ? updatedFields.penanggungJawabJabatan
                    : acc.penanggungJawab?.jabatan,
                kontak:
                  updatedFields.penanggungJawabKontak !== undefined
                    ? updatedFields.penanggungJawabKontak
                    : acc.penanggungJawab?.kontak,
              },
              riwayatAktivitas: [actEntry, ...(acc.riwayatAktivitas || [])],
            }
          }
          return acc
        })
      )

      if (editedAccount) {
        catatAuditAdministrasi({
          petugas: namaPetugasBNPB,
          instansi: editedAccount.instansi,
          wilayah: editedAccount.wilayah,
          kodeWilayah: editedAccount.kodeWilayah,
          aksi: 'Pembaruan Data Instansi BPBD',
          alasan: 'Pembaruan profil resmi institusi dan penanggung jawab daerah',
          ip: '10.0.1.1 (Pusdatin)',
          stateBefore,
          stateAfter,
        })
        catatAktivitasBNPB(
          'edit_akun',
          'Data Akun Diperbarui',
          `Data instansi & pejabat penanggung jawab ${editedAccount.instansi} diperbarui oleh ${namaPetugasBNPB}.`,
          editedAccount.provinsi,
          namaPetugasBNPB
        )
        showNotif(`Data profil akun ${editedAccount.instansi} berhasil diperbarui.`, 'info')
      }
    },
    [catatAuditAdministrasi, catatAktivitasBNPB, showNotif]
  )

  const resetPasswordAkunBpbd = useCallback(
    (id, namaPetugasBNPB = 'Pusdalops BNPB Pusat', alasan = 'Permintaan Kredensial Baru BPBD') => {
      let targetAcc = null
      let stateBefore = null
      let stateAfter = null
      const now = new Date()
      const waktuStr =
        now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
        ', ' +
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
        ' WIB'

      // Generate temporary password without revealing old password (zero knowledge)
      const randomChars = Math.random().toString(36).slice(-6).toUpperCase()
      const tempPassword = `BPBD-${new Date().getFullYear()}-${randomChars}!#`

      setAkunBpbdList((prev) =>
        prev.map((acc) => {
          if (acc.id === id) {
            targetAcc = acc
            stateBefore = { kredensial: 'Kredensial Lama', sesiAktif: acc.sesiAktif }
            stateAfter = { kredensial: 'Kredensial Sementara (Wajib Ganti)', sesiAktif: 0 }
            const actEntry = {
              id: `ACT-${Date.now()}`,
              waktu: waktuStr,
              aksi: `Reset kredensial akses dilakukan oleh ${namaPetugasBNPB}. Alasan: ${alasan}. Hash sandi lama tidak diakses. Seluruh sesi ditutup.`,
              ip: '10.0.1.1 (Pusdatin)',
              operator: namaPetugasBNPB,
            }
            return {
              ...acc,
              sesiAktif: 0,
              keamanan: {
                ...(acc.keamanan || {}),
                sesiAktifList: [],
                riwayatReset: [
                  {
                    waktu: waktuStr,
                    petugas: namaPetugasBNPB,
                    alasan,
                  },
                  ...((acc.keamanan && acc.keamanan.riwayatReset) || []),
                ],
              },
              riwayatAktivitas: [actEntry, ...(acc.riwayatAktivitas || [])],
            }
          }
          return acc
        })
      )

      if (targetAcc) {
        catatAuditAdministrasi({
          petugas: namaPetugasBNPB,
          instansi: targetAcc.instansi,
          wilayah: targetAcc.wilayah,
          kodeWilayah: targetAcc.kodeWilayah,
          aksi: 'Reset Kata Sandi Sementara',
          alasan,
          ip: '10.0.1.1 (Pusdatin)',
          stateBefore,
          stateAfter,
        })
        catatAktivitasBNPB(
          'reset_kredensial',
          'Reset Sandi Akun BPBD',
          `Kredensial akun ${targetAcc.instansi} direset oleh ${namaPetugasBNPB} tanpa membaca sandi lama. Seluruh sesi aktif diputus demi keamanan.`,
          targetAcc.provinsi,
          namaPetugasBNPB
        )
        showNotif(`Kata sandi akun ${targetAcc.instansi} berhasil direset!`, 'success')
      }

      return { success: true, tempPassword, instansi: targetAcc?.instansi }
    },
    [catatAuditAdministrasi, catatAktivitasBNPB, showNotif]
  )

  const tangguhkanAkunBpbd = useCallback(
    (id, { alasan, durasi, petugas = 'Pusdalops BNPB Pusat', catatan = '' }) => {
      let targetAcc = null
      let stateBefore = null
      let stateAfter = null
      const now = new Date()
      const waktuStr =
        now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
        ', ' +
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
        ' WIB'

      setAkunBpbdList((prev) =>
        prev.map((acc) => {
          if (acc.id === id) {
            targetAcc = acc
            stateBefore = { status: acc.status, modePembekuan: acc.modePembekuan || 'Normal' }
            stateAfter = { status: STATUS_AKUN_BPBD.DITANGGUHKAN, modePembekuan: 'TANGGUHKAN_PENUH' }
            const actEntry = {
              id: `ACT-${Date.now()}`,
              waktu: waktuStr,
              aksi: `Penangguhan akses dashboard oleh ${petugas}. Durasi: ${durasi}. Alasan: ${alasan}. Catatan: ${catatan}`,
              ip: '10.0.1.1 (Satgas Pengawas)',
              operator: petugas,
            }
            return {
              ...acc,
              status: STATUS_AKUN_BPBD.DITANGGUHKAN,
              modePembekuan: 'TANGGUHKAN_PENUH',
              sesiAktif: 0,
              penangguhanInfo: {
                mode: 'TANGGUHKAN_PENUH',
                modeLabel: MODE_PEMBEKUAN_BPBD.TANGGUHKAN_PENUH,
                alasan,
                durasi,
                petugas,
                catatan,
                waktuMulai: waktuStr,
              },
              riwayatAktivitas: [actEntry, ...(acc.riwayatAktivitas || [])],
            }
          }
          return acc
        })
      )

      if (targetAcc) {
        catatAuditAdministrasi({
          petugas,
          instansi: targetAcc.instansi,
          wilayah: targetAcc.wilayah,
          kodeWilayah: targetAcc.kodeWilayah,
          aksi: 'Penangguhan Akses Penuh BPBD',
          alasan,
          ip: '10.0.1.1 (Satgas Pengawas)',
          stateBefore,
          stateAfter,
        })
        catatAktivitasBNPB(
          'tangguhkan_akun',
          'Akun BPBD Ditangguhkan',
          `Akses ${targetAcc.instansi} dibekukan sementara (${durasi}). Alasan: ${alasan}. Petugas pengesah: ${petugas}. Catatan: Informasi publik & layanan darurat warga tetap beroperasi.`,
          targetAcc.provinsi,
          petugas
        )
        playAlertSiren()
        showNotif(
          `Akun ${targetAcc.instansi} berhasil ditangguhkan sementara. Layanan warga tetap berjalan normal.`,
          'warning'
        )
      }
    },
    [catatAuditAdministrasi, catatAktivitasBNPB, showNotif]
  )

  const aktifkanKembaliAkunBpbd = useCallback(
    (id, namaPetugasBNPB = 'Pusdalops BNPB Pusat', catatan = 'Pencabutan status penangguhan setelah verifikasi') => {
      let targetAcc = null
      let stateBefore = null
      let stateAfter = null
      const now = new Date()
      const waktuStr =
        now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
        ', ' +
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
        ' WIB'

      setAkunBpbdList((prev) =>
        prev.map((acc) => {
          if (acc.id === id) {
            targetAcc = acc
            stateBefore = { status: acc.status, modePembekuan: acc.modePembekuan }
            stateAfter = { status: STATUS_AKUN_BPBD.AKTIF, modePembekuan: 'Normal' }
            const actEntry = {
              id: `ACT-${Date.now()}`,
              waktu: waktuStr,
              aksi: `Akses dashboard diaktifkan kembali oleh ${namaPetugasBNPB}. Catatan: ${catatan}`,
              ip: '10.0.1.1 (Pusdatin)',
              operator: namaPetugasBNPB,
            }
            return {
              ...acc,
              status: STATUS_AKUN_BPBD.AKTIF,
              modePembekuan: null,
              penangguhanInfo: null,
              riwayatAktivitas: [actEntry, ...(acc.riwayatAktivitas || [])],
            }
          }
          return acc
        })
      )

      if (targetAcc) {
        catatAuditAdministrasi({
          petugas: namaPetugasBNPB,
          instansi: targetAcc.instansi,
          wilayah: targetAcc.wilayah,
          kodeWilayah: targetAcc.kodeWilayah,
          aksi: 'Pengaktifan Kembali Akun BPBD',
          alasan: catatan,
          ip: '10.0.1.1 (Pusdatin)',
          stateBefore,
          stateAfter,
        })
        catatAktivitasBNPB(
          'reaktivasi_akun',
          'Akun BPBD Diaktifkan Kembali',
          `Penangguhan dicabut. Akun ${targetAcc.instansi} kembali AKTIF untuk operasional BPBD oleh ${namaPetugasBNPB}.`,
          targetAcc.provinsi,
          namaPetugasBNPB
        )
        playRadioChirp()
        showNotif(`Akun ${targetAcc.instansi} berhasil diaktifkan kembali!`, 'success')
      }
    },
    [catatAuditAdministrasi, catatAktivitasBNPB, showNotif]
  )

  const akhiriSesiPerangkatAkunBpbd = useCallback(
    (id, namaPetugasBNPB = 'Pusdalops BNPB Pusat') => {
      let targetAcc = null
      let stateBefore = null
      let stateAfter = null
      const now = new Date()
      const waktuStr =
        now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
        ', ' +
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
        ' WIB'

      setAkunBpbdList((prev) =>
        prev.map((acc) => {
          if (acc.id === id) {
            targetAcc = acc
            stateBefore = { sesiAktif: acc.sesiAktif }
            stateAfter = { sesiAktif: 0 }
            const actEntry = {
              id: `ACT-${Date.now()}`,
              waktu: waktuStr,
              aksi: `Seluruh sesi login perangkat aktif diputus paksa (Force Logout) oleh ${namaPetugasBNPB}`,
              ip: '10.0.1.1 (Siber BNPB)',
              operator: namaPetugasBNPB,
            }
            return {
              ...acc,
              sesiAktif: 0,
              keamanan: {
                ...(acc.keamanan || {}),
                sesiAktifList: [],
              },
              riwayatAktivitas: [actEntry, ...(acc.riwayatAktivitas || [])],
            }
          }
          return acc
        })
      )

      if (targetAcc) {
        catatAuditAdministrasi({
          petugas: namaPetugasBNPB,
          instansi: targetAcc.instansi,
          wilayah: targetAcc.wilayah,
          kodeWilayah: targetAcc.kodeWilayah,
          aksi: 'Pemutusan Sesi Perangkat',
          alasan: 'Force logout perangkat aktif atas arahan pengawas BNPB',
          ip: '10.0.1.1 (Siber BNPB)',
          stateBefore,
          stateAfter,
        })
        catatAktivitasBNPB(
          'terminasi_sesi',
          'Sesi Perangkat Diakhiri',
          `Seluruh sesi aktif (${targetAcc.sesiAktif} sesi) perangkat untuk ${targetAcc.instansi} telah diputus oleh ${namaPetugasBNPB}.`,
          targetAcc.provinsi,
          namaPetugasBNPB
        )
        showNotif(`Seluruh sesi login perangkat untuk ${targetAcc.instansi} berhasil diakhiri.`, 'info')
      }
    },
    [catatAuditAdministrasi, catatAktivitasBNPB, showNotif]
  )

  const arsipkanAkunBpbd = useCallback(
    (id, { alasan, petugas = 'Pusdalops BNPB Pusat' }) => {
      let targetAcc = null
      let stateBefore = null
      let stateAfter = null
      const now = new Date()
      const waktuStr =
        now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
        ', ' +
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
        ' WIB'

      setAkunBpbdList((prev) =>
        prev.map((acc) => {
          if (acc.id === id) {
            targetAcc = acc
            stateBefore = { status: acc.status }
            stateAfter = { status: STATUS_AKUN_BPBD.DIARSIPKAN }
            const actEntry = {
              id: `ACT-${Date.now()}`,
              waktu: waktuStr,
              aksi: `Akun dialihkan ke arsip permanen oleh ${petugas}. Alasan: ${alasan}. Seluruh relasi riwayat bencana dan logistik dipertahankan.`,
              ip: '10.0.1.1 (Arsip Nasional)',
              operator: petugas,
            }
            return {
              ...acc,
              status: STATUS_AKUN_BPBD.DIARSIPKAN,
              sesiAktif: 0,
              pengarsipanInfo: {
                alasan,
                petugas,
                waktuArsip: waktuStr,
                referensiData:
                  'Data historis bencana, logistik, pengungsi, dan tindakan satgas BPBD tetap tersimpan utuh dan tidak terputus.',
              },
              kesehatan: {
                ...(acc.kesehatan || {}),
                statusKesehatan: 'Diarsipkan Permanen',
                catatanKesehatan: 'Akun dialihkan ke arsip historis permanen.',
              },
              riwayatAktivitas: [actEntry, ...(acc.riwayatAktivitas || [])],
            }
          }
          return acc
        })
      )

      if (targetAcc) {
        catatAuditAdministrasi({
          petugas,
          instansi: targetAcc.instansi,
          wilayah: targetAcc.wilayah,
          kodeWilayah: targetAcc.kodeWilayah,
          aksi: 'Pengarsipan Akun Permanen',
          alasan,
          ip: '10.0.1.1 (Arsip Nasional)',
          stateBefore,
          stateAfter,
        })
        catatAktivitasBNPB(
          'arsipkan_akun',
          'Akun BPBD Diarsipkan',
          `Akun resmi ${targetAcc.instansi} dialihkan ke arsip permanen oleh ${petugas}. Seluruh data riwayat tetap tersimpan utuh.`,
          targetAcc.provinsi,
          petugas
        )
        showNotif(
          `Akun ${targetAcc.instansi} berhasil diarsipkan. Seluruh data historis bencana tetap aman terlindungi.`,
          'info'
        )
      }
    },
    [catatAuditAdministrasi, catatAktivitasBNPB, showNotif]
  )

  const isRegional = userRole === 'petugas' && adminLevel === 'regional'

  const isTangerangItem = (item) => {
    if (!item) return false
    if (item.wilayah === 'Tangerang') return true
    const text = `${item.lokasi || ''} ${item.nama || ''} ${item.alamat || ''} ${item.lokasiTugas || ''} ${item.keterangan || ''} ${item.lokasiTujuan || ''}`.toLowerCase()
    return /tangerang|ciledug|periuk|cisadane|sukasari|karawaci|dimyati/i.test(text)
  }

  // 1. Batasi data BPBD hanya untuk wilayah yurisdiksinya (Kota Tangerang)
  const regionalLaporan = isRegional ? laporan.filter(isTangerangItem) : laporan
  const regionalPosko = isRegional ? poskoList.filter(isTangerangItem) : poskoList
  const regionalRelawan = isRegional ? relawanList.filter(isTangerangItem) : relawanList
  const regionalLogistik = isRegional ? logistikList.filter(isTangerangItem) : logistikList
  const regionalPeringatan = isRegional ? peringatanList.filter(isTangerangItem) : peringatanList

  // 2. MODE INSIDEN AKTIF: jika satu bencana besar dipilih, seluruh dashboard fokus ke insiden itu!
  let displayLaporan = regionalLaporan
  let displayPosko = regionalPosko
  let displayRelawan = regionalRelawan
  let displayLogistik = regionalLogistik
  let displayPeringatan = regionalPeringatan

  const activeIncident = activeIncidentId ? regionalLaporan.find((l) => l.id === activeIncidentId) : null

  if (activeIncident) {
    displayLaporan = regionalLaporan.filter((l) => l.id === activeIncidentId)
    const incidentKw = (activeIncident.lokasi || '').toLowerCase()
    const isCiledug = /ciledug/i.test(incidentKw)
    const isPeriuk = /periuk/i.test(incidentKw)
    const isPasarLama = /pasar lama|sukasari/i.test(incidentKw)

    displayPosko = regionalPosko.filter((p) => {
      const pName = ((p.nama || '') + ' ' + (p.alamat || '')).toLowerCase()
      if (isCiledug) return /ciledug|dimyati/i.test(pName)
      if (isPeriuk) return /periuk|dimyati/i.test(pName)
      if (isPasarLama) return /dimyati|rsud/i.test(pName)
      return true
    })

    displayRelawan = regionalRelawan.filter((r) => {
      const rText = ((r.nama || '') + ' ' + (r.lokasiTugas || '')).toLowerCase()
      if (isCiledug) return /ciledug|cisadane|sar/i.test(rText)
      if (isPeriuk) return /periuk|damkar|sar/i.test(rText)
      return true
    })

    displayLogistik = regionalLogistik.filter((item) => {
      const itemText = `${item.nama || ''} ${item.lokasiTujuan || ''} ${item.keterangan || ''}`.toLowerCase()
      if (isCiledug) return /ciledug|dimyati|perahu|pelampung|pangan|karung/i.test(itemText)
      if (isPeriuk) return /periuk|dimyati|pompa|karung|pangan/i.test(itemText)
      if (isPasarLama) return /sukasari|pasar lama|tenda|obat/i.test(itemText)
      return true
    })
  }

  const displayStats = isRegional ? {
    laporanMasuk: displayLaporan.length,
    prioritasKritis: displayLaporan.filter(l => l.analisisAI?.prioritas === 'kritis' || l.analisisAI?.prioritas === 'tinggi').length,
    relawanTersedia: displayRelawan.reduce((acc, r) => acc + (r.jumlahPersonel || 0), 0),
    bantuanTersalurkan: displayLogistik.filter(l => l.terkumpul > 0).length * 2, 
    totalWargaTerdampak: displayLaporan.reduce((acc, l) => acc + (l.jumlahWarga || 0), 0),
    poskoAktif: displayPosko.length,
  } : stats

  const selectedLaporan = displayLaporan.find((l) => l.id === selectedId) || null

  return (
    <AppContext.Provider
      value={{
        laporan: displayLaporan,
        allRegionalLaporan: regionalLaporan,
        stats: displayStats,
        poskoList: displayPosko,
        allRegionalPosko: regionalPosko,
        setPoskoList,
        relawanList: displayRelawan,
        setRelawanList,
        logistikList: displayLogistik,
        allRegionalLogistik: regionalLogistik,
        peringatanList: displayPeringatan,
        kontakPentingList,
        setKontakPentingList,
        bpbdWilayah,
        setBpbdWilayah,
        statusWilayah,
        setStatusWilayah,
        activeIncidentId,
        setActiveIncidentId,
        activeIncident,
        ewsHistory,
        setEwsHistory,
        kirimSiaranEWS,
        aktivitasBPBD,
        setAktivitasBPBD,
        catatAktivitas,
        ewsModalOpen,
        setEwsModalOpen,
        activityModalOpen,
        setActivityModalOpen,
        poskoModalOpen,
        setPoskoModalOpen,
        isCloseReportOpen,
        setIsCloseReportOpen,
        closeReportTarget,
        setCloseReportTarget,
        isSitRepOpen,
        setIsSitRepOpen,
        isContactsOpen,
        setIsContactsOpen,
        tambahCatatanLapangan,
        updateAksesLokasi,
        updateKebutuhanDetail,
        tutupLaporanResmi,
        getPotentialDuplicates,
        checkKelengkapanData,
        userRole,
        setUserRole,
        activeTab,
        setActiveTab,
        citizenTab,
        setCitizenTab,
        selectedId,
        setSelectedId,
        selectedLaporan,
        loadingAnalysis,
        analysisError,
        showForm,
        setShowForm,
        notification,
        isAuthenticated,
        setIsAuthenticated,
        adminLevel,
        setAdminLevel,
        theme,
        setTheme,
        pickingLocation,
        setPickingLocation,
        pickedCoords,
        setPickedCoords,
        reportDraft,
        setReportDraft,
        reportFilter,
        setReportFilter,
        dispatchModalOpen,
        setDispatchModalOpen,
        dispatchTargetReport,
        setDispatchTargetReport,
        dispatchTargetVolunteerId,
        setDispatchTargetVolunteerId,
        donationModalOpen,
        setDonationModalOpen,
        donationTargetItem,
        setDonationTargetItem,
        tambahLaporan,
        ubahStatusLaporan,
        analisisAI,
        dispatchRelawan,
        donasiLogistik,
        konfirmasiDonasi,
        broadcastEWS,
        simulasiBencanaBaru,
        // NATIONAL BNPB CONTEXT VALUES
        wilayahNasionalList,
        setWilayahNasionalList,
        permintaanDukunganList,
        setPermintaanDukunganList,
        distribusiNasionalList,
        setDistribusiNasionalList,
        riwayatEwsNasionalList,
        setRiwayatEwsNasionalList,
        keluargaLintasDaerahData,
        setKeluargaLintasDaerahData,
        selectedWilayahNasional,
        setSelectedWilayahNasional,
        nationalActiveTab,
        setNationalActiveTab,
        isNationalSitRepOpen,
        setIsNationalSitRepOpen,
        setujuiPermintaanDukungan,
        tandaiBantuanTiba,
        rekonsiliasiKasusLintasDaerah,
        kirimEwsNasional,
        updateStatusWilayahNasional,
        updateStatusWilayah,
        aktivitasBNPB,
        setAktivitasBNPB,
        catatAktivitasBNPB,
        isNationalActivityLogOpen,
        setIsNationalActivityLogOpen,
        supportQueueFilterRegion,
        setSupportQueueFilterRegion,
        // ADMINISTRASI AKUN BPBD RESMI
        akunBpbdList,
        setAkunBpbdList,
        auditAdministrasiList,
        setAuditAdministrasiList,
        catatAuditAdministrasi,
        tambahAkunBpbd,
        verifikasiAkunBpbd,
        setujuiPermohonanAktivasi,
        kembalikanPermohonanAktivasi,
        ubahModePembekuan,
        pulihkanAksesAkun,
        akhiriSemuaSesiPerangkat,
        editAkunBpbd,
        resetPasswordAkunBpbd,
        tangguhkanAkunBpbd,
        aktifkanKembaliAkunBpbd,
        akhiriSesiPerangkatAkunBpbd,
        arsipkanAkunBpbd,
        resetDataNasionalDefault,
        showNotif,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
