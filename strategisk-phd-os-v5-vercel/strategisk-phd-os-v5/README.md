# strategiSK — Personal PhD Planning OS

Aplikasi responsive untuk memantau perjalanan PhD GBT 2.5 tahun: Draft 111, kalendar, diari/TDR, TM168, FOW, FOD, task, konsultasi SV, expert, publication, pengumpulan data dan analisis.

## Fungsi yang telah bekerja

- Dashboard responsive desktop, tablet dan telefon
- Days Remaining: short, mid dan long-term target
- Draft 111 tracker + sejarah naik draft
- Kalendar aktiviti dan Daily Diary/TDR
- Weekly target, TM168, FOW dan FOD
- Monthly target
- Chapter progress
- Data collection dan data analysis progress
- Expert list
- Publication tracker
- SV consultation log
- Task tracker
- Tetapan profil, tarikh mula dan sasaran GBT
- Light/dark mode
- LocalStorage automatik
- Export/import backup JSON
- Google Drive personal sync melalui `appDataFolder`
- WhatsApp: buka mesej laporan yang telah siap diisi
- Telegram: auto-send melalui Vercel Serverless Function

## 1. Jalankan pada Windows

Pasang Node.js LTS dahulu. Kemudian extract ZIP ini dan buka folder dalam VS Code.

```bash
npm install
npm run dev
```

Buka alamat yang dipaparkan, biasanya `http://localhost:5173`.

> Folder `node_modules` akan muncul selepas `npm install`. Jangan upload folder itu ke GitHub.

## 2. Fail yang perlu upload ke GitHub

Upload semua kandungan projek kecuali:

- `node_modules/`
- `dist/`
- `.env`
- `.env.local`
- `.vercel/`

Fail `.gitignore` sudah disediakan.

## 3. Deploy ke Vercel

1. Import repository GitHub dalam Vercel.
2. Framework Preset: **Vite**.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Deploy.

## 4. Google Drive personal sync

Aplikasi menggunakan Google Identity Services dan scope minimum `drive.appdata`. Data disimpan dalam fail tersembunyi bernama `strategiSK-data.json` dalam akaun Google pengguna.

### Google Cloud Console

1. Cipta Google Cloud project.
2. Enable **Google Drive API**.
3. Configure OAuth consent screen.
4. Create **OAuth Client ID → Web application**.
5. Tambah Authorized JavaScript Origins:
   - `http://localhost:5173`
   - domain Vercel anda, contoh `https://strategisk.vercel.app`
6. Copy Client ID.

### Vercel Environment Variable

Tambah:

```text
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

Redeploy. Selepas itu tekan **Sambung Drive** dalam aplikasi.

## 5. Telegram auto-send

Cipta bot melalui BotFather dan dapatkan bot token. Dapatkan Chat ID sendiri. Dalam Vercel, tambah:

```text
TELEGRAM_BOT_TOKEN=token_bot_anda
TELEGRAM_DEFAULT_CHAT_ID=chat_id_anda
```

Chat ID juga boleh diubah dalam Settings aplikasi.

## 6. WhatsApp

Untuk akaun WhatsApp personal, browser hanya boleh membuka mesej yang sudah diisi; pengguna masih perlu tekan **Send**. Penghantaran automatik sebenar memerlukan WhatsApp Business Cloud API dan konfigurasi Meta Business.

## Penyimpanan data

- Tanpa Google Drive: data disimpan dalam browser/peranti melalui localStorage.
- Selepas connect Drive: tekan **Simpan ke Drive** atau **Pulihkan dari Drive**.
- Gunakan Export JSON sebagai backup tambahan.

## Kemas kini v2

- FOW dan FOD mempunyai butang WhatsApp/Telegram sendiri serta jadual template ayat.
- SV Consultation: satu tarikh, komen, tindakan, status berwarna dan upload gambar bukti.
- Monthly Target boleh disimpan sebagai archive mengikut nama bulan.
- Task Assignment menjadi blok utama kedua di dashboard dengan tema kuning emas.
- Delete/Edit ditambah pada tracker berkaitan.
- Kalendar menggunakan satu warna merah dan event boleh dipadam.
- Daily Diary menggunakan label Refleksi, serta slider sejarah di dashboard.
- Timeline 2.5 tahun kini berbentuk Gantt berdasarkan tarikh mula dan 30 bulan.

### Maksud `drive.appdata`

`drive.appdata` bukan fail atau plugin. Ia ialah OAuth scope Google. Anda hanya perlu enable Google Drive API dan menggunakan Google OAuth Client ID. Kod aplikasi sudah meminta scope tersebut semasa pengguna menekan Sambung Drive.
