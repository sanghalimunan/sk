# strategiSK PhD OS v24

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


## v24 final personal improvements
- Correct Hijri date formatter with Malay Hijri month names.
- Auto-save remains local on every data change.
- Optional automatic two-way Google Drive sync every 6 hours while the app is open and Drive is connected.
- Calendar search remains an overlay and does not resize the existing calendar/diary layout.
