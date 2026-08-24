# strategiSK PhD OS v26

## Safe Storage Architecture

- Text/data database: Google Drive `appDataFolder` as `strategiSK-data.json`.
- Visible media folders created in **My Drive > strategiSK**: `diary`, `learning-point`, `consultation`, `experts`, `sketches`, `backups`.
- Existing base64 images are migrated to visible Drive files on the next successful sync.
- Cloud JSON keeps Drive file IDs/metadata instead of embedding migrated media.
- Automatic backup snapshot is created before cloud overwrite and before cloud pull where possible.
- Manual **Snapshot Drive** button is available in Settings.
- `schemaVersion: 2` supports forward data migrations without resetting user content.

## Google OAuth scopes required

Enable Google Drive API and request:

- `https://www.googleapis.com/auth/drive.appdata`
- `https://www.googleapis.com/auth/drive.file`
- user profile/email scopes already used by the app

After updating Google Auth Platform Data Access, press **Reconnect** once so Google grants the new `drive.file` scope.

## Vercel

Set `VITE_GOOGLE_CLIENT_ID` in Vercel Environment Variables and redeploy.


## v26 final personal improvements
- Correct Hijri date formatter with Malay Hijri month names.
- Auto-save remains local on every data change.
- Optional automatic two-way Google Drive sync every 6 hours while the app is open and Drive is connected.
- Calendar search remains an overlay and does not resize the existing calendar/diary layout.


## v26 safety change
- Header Sync button is hidden until Google login is connected.
- Users must connect/reconnect Google Drive first from Settings before manual dashboard sync becomes available.
- This prevents accidental local-first sync from a device that has not authenticated yet.


## v26 profile quick sync
Klik nama/profil di topbar untuk meminta token Google baharu, menguji akses appData + folder media, dan hanya jika ujian berjaya menjalankan Two-Way Sync. Jika ujian Drive gagal, sync dihentikan untuk mengelakkan overwrite tanpa pengesahan akses.
