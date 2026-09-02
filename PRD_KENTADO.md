# Product Requirements Document (PRD)
## Website Manajemen Produk & Inventaris — KENTADO

**Versi:** 1.0
**Tanggal:** 28 Agustus 2026
**Pemilik Produk:** Daffa (Pengelola/Admin KENTADO)

---

## 1. Latar Belakang

KENTADO adalah perusahaan yang memproduksi dan menjual tegi karate secara mandiri (self-production). Saat ini pencatatan bahan baku dan barang belum memiliki sistem digital yang terstruktur, sehingga sulit untuk melacak dengan jelas:

- Kapan dan berapa jumlah bahan/barang yang masuk (pembelian bahan baku)
- Kapan dan berapa jumlah bahan/barang yang keluar (terpakai untuk produksi atau terjual)
- Sisa stok terkini per jenis barang dan per kategori

Dibutuhkan sebuah website manajemen inventaris yang memungkinkan pencatatan barang masuk dan keluar secara jelas, terorganisir per kategori, dan mudah digunakan oleh satu admin/pengelola.

---

## 2. Tujuan Produk

1. Menyediakan sistem pencatatan barang masuk dan keluar yang jelas, dengan pembeda visual antara kedua jenis transaksi.
2. Memungkinkan pengelompokan barang ke dalam kategori (misal "Bahan Pokok"), dengan kemampuan menambah kategori baru sesuai kebutuhan.
3. Memudahkan input data melalui dropdown pencarian nama barang, sekaligus memungkinkan penambahan barang baru secara cepat tanpa keluar dari alur input.
4. Menyediakan riwayat transaksi yang lengkap dan dapat ditelusuri (siapa/apa, kapan, berapa banyak, berapa harga).
5. Menjaga akurasi stok berjalan (current stock) secara otomatis berdasarkan riwayat transaksi.

---

## 3. Target Pengguna

| Peran | Deskripsi | Jumlah |
|---|---|---|
| Admin/Owner | Mengelola seluruh data: kategori, barang, dan transaksi masuk/keluar | 1 orang |

*Catatan: Sistem dirancang untuk single-user di versi awal ini. Dukungan multi-user/role dapat menjadi pengembangan lanjutan (lihat bagian 9).*

---

## 4. Ruang Lingkup (Scope)

### 4.1 Termasuk dalam Scope (In Scope)
- Manajemen kategori (tambah, lihat, edit, hapus kategori)
- Manajemen barang/item per kategori (tambah, lihat, edit, hapus)
- Pencatatan transaksi barang masuk (IN)
- Pencatatan transaksi barang keluar (OUT) — baik karena terjual maupun terpakai untuk produksi
- Perhitungan stok otomatis berdasarkan riwayat transaksi
- Tabel riwayat transaksi dengan pembeda visual antara barang masuk dan keluar
- Dropdown pencarian nama barang saat input transaksi, dengan opsi tambah barang baru langsung dari dropdown
- Filter/pencarian riwayat transaksi (berdasarkan kategori, nama barang, tanggal, tipe transaksi)

### 4.2 Tidak Termasuk dalam Scope (Out of Scope — versi ini)
- Laporan/export ke PDF atau Excel
- Grafik/visualisasi data stok
- Notifikasi stok menipis
- Multi-user dengan role berbeda (staff gudang, dsb.)
- Fitur penjualan/kasir (POS) — sistem ini fokus pada pencatatan inventaris, bukan transaksi penjualan ke pelanggan

---

## 5. User Stories

| ID | Sebagai | Saya ingin | Agar |
|---|---|---|---|
| US-01 | Admin | menambahkan kategori baru | dapat mengelompokkan jenis barang sesuai kebutuhan bisnis yang berkembang |
| US-02 | Admin | mencatat barang yang baru masuk (tanggal, jumlah, harga) | stok bahan baku tercatat otomatis dan akurat |
| US-03 | Admin | mencatat barang yang keluar/terpakai (tanggal, jumlah) | stok berkurang sesuai pemakaian aktual untuk produksi atau penjualan |
| US-04 | Admin | melihat tabel transaksi dengan pembeda jelas antara barang masuk dan keluar | mudah membedakan riwayat pergerakan barang |
| US-05 | Admin | mencari nama barang lewat dropdown dengan search bar | tidak perlu scroll panjang saat daftar barang sudah banyak |
| US-06 | Admin | menambahkan nama barang baru langsung dari dropdown saat input transaksi | tidak perlu berpindah halaman jika barang belum terdaftar |
| US-07 | Admin | melihat riwayat transaksi lengkap per kategori maupun keseluruhan | dapat menelusuri histori pergerakan barang kapan saja |
| US-08 | Admin | melihat sisa stok terkini tiap barang | dapat mengambil keputusan produksi/pembelian dengan tepat |

---

## 6. Kebutuhan Fungsional (Functional Requirements)

### 6.1 Manajemen Kategori
- FR-1.1: Sistem harus menampilkan daftar semua kategori yang ada.
- FR-1.2: Admin dapat menambahkan kategori baru dengan nama unik.
- FR-1.3: Admin dapat mengedit nama kategori.
- FR-1.4: Admin dapat menghapus kategori (dengan validasi/peringatan jika kategori masih memiliki barang terkait).

### 6.2 Manajemen Barang (Item)
- FR-2.1: Setiap barang harus terhubung ke satu kategori.
- FR-2.2: Admin dapat menambahkan barang baru beserta satuan (unit) opsional.
- FR-2.3: Sistem menampilkan stok berjalan (current stock) untuk tiap barang, dihitung otomatis dari total transaksi IN dikurangi total transaksi OUT.
- FR-2.4: Admin dapat mengedit atau menghapus data barang (dengan validasi jika barang memiliki riwayat transaksi).

### 6.3 Transaksi Barang Masuk (IN)
- FR-3.1: Form input transaksi masuk harus memuat: kategori, nama barang (dropdown+search), tanggal, jumlah, harga per unit, catatan (opsional).
- FR-3.2: Sistem menghitung otomatis total harga (jumlah × harga per unit).
- FR-3.3: Setelah disimpan, stok barang terkait bertambah sesuai jumlah yang diinput.

### 6.4 Transaksi Barang Keluar (OUT)
- FR-4.1: Form input transaksi keluar harus memuat: kategori, nama barang (dropdown+search), tanggal, jumlah, keterangan tujuan (terjual/terpakai produksi), catatan (opsional).
- FR-4.2: Setelah disimpan, stok barang terkait berkurang sesuai jumlah yang diinput.
- FR-4.3: Sistem memberi peringatan jika jumlah yang diinput melebihi stok tersedia (opsional/tetap dapat dilanjutkan atas konfirmasi admin).

### 6.5 Dropdown Pencarian Barang
- FR-5.1: Dropdown nama barang harus menyediakan search bar untuk memfilter daftar secara real-time.
- FR-5.2: Jika nama barang yang dicari tidak ditemukan, sistem menampilkan opsi "+ Tambah barang baru" yang memungkinkan admin menambahkan barang tanpa meninggalkan form transaksi.
- FR-5.3: Dropdown difilter otomatis berdasarkan kategori yang telah dipilih sebelumnya.

### 6.6 Tabel & Riwayat Transaksi
- FR-6.1: Tabel transaksi menampilkan pembeda visual yang jelas antara transaksi IN dan OUT (misal warna, label/badge berbeda).
- FR-6.2: Admin dapat memfilter riwayat transaksi berdasarkan kategori, nama barang, tipe transaksi (IN/OUT), dan rentang tanggal.
- FR-6.3: Setiap baris transaksi menampilkan: tanggal, nama barang, kategori, tipe, jumlah, harga (jika ada), catatan.
- FR-6.4: Tersedia halaman riwayat global (lintas kategori) dan halaman riwayat per kategori.

---

## 7. Kebutuhan Non-Fungsional (Non-Functional Requirements)

| ID | Kebutuhan | Deskripsi |
|---|---|---|
| NFR-1 | Usability | Alur input transaksi harus sesederhana mungkin — maksimal beberapa klik dari dashboard ke form submit |
| NFR-2 | Performa | Pencarian pada dropdown barang harus responsif (idealnya <300ms) meski jumlah barang sudah ratusan |
| NFR-3 | Konsistensi Data | Perhitungan stok harus selalu konsisten dengan total riwayat transaksi (tidak boleh ada selisih) |
| NFR-4 | Aksesibilitas | Website dapat diakses melalui browser desktop maupun mobile (responsive) |
| NFR-5 | Keamanan | Akses ke sistem harus melalui login admin (autentikasi sederhana) agar data tidak diakses sembarang orang |

---

## 8. Alur Pengguna Utama (Core User Flow)

1. Admin login ke sistem.
2. Admin membuka Dashboard → melihat ringkasan stok per kategori.
3. Jika kategori yang dibutuhkan belum tersedia, admin membuka halaman Kategori → klik "Tambah Kategori" → mengisi nama kategori baru (misal "Aksesoris") → simpan, sehingga kategori tersebut langsung dapat dipilih saat input transaksi.
4. Admin klik "Tambah Transaksi" → memilih kategori → mencari/memilih nama barang (atau menambahkan baru) → memilih tipe (Masuk/Keluar) → mengisi jumlah, harga (jika masuk), tanggal, catatan → submit.
5. Sistem menyimpan transaksi dan memperbarui stok barang terkait secara otomatis.
6. Admin dapat membuka halaman kategori atau riwayat global untuk meninjau seluruh histori transaksi dengan pembeda visual IN/OUT.

---

## 9. Kemungkinan Pengembangan Lanjutan (Future Considerations)

*Tidak termasuk dalam versi awal, namun dapat dipertimbangkan ke depannya:*
- Laporan dan export data (PDF/Excel)
- Grafik tren stok dan pengeluaran bahan baku
- Notifikasi otomatis saat stok mendekati batas minimum
- Dukungan multi-user dengan role berbeda (admin vs staff gudang)
- Integrasi dengan modul penjualan/kasir

---

## 10. Metrik Keberhasilan (Success Metrics)

- Seluruh transaksi keluar-masuk barang tercatat 100% melalui sistem (tidak ada lagi pencatatan manual terpisah)
- Admin dapat menemukan riwayat transaksi barang tertentu dalam waktu kurang dari 1 menit
- Tidak ada selisih antara stok tercatat di sistem dengan stok fisik (setelah proses adaptasi awal)
