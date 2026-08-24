# strategiSK PhD OS v28

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


## v28 final personal improvements
- Correct Hijri date formatter with Malay Hijri month names.
- Auto-save remains local on every data change.
- Optional automatic two-way Google Drive sync every 6 hours while the app is open and Drive is connected.
- Calendar search remains an overlay and does not resize the existing calendar/diary layout.


## v28 smart multi-device sync
- App content is locked until Google sign-in succeeds.
- After successful sign-in, if this device has no unsynced edits, the app loads the latest Drive data first.
- Local edits are tracked with a dirty flag. Pressing **Sync Sekarang** uploads only when this device has changed.
- If this device has no local changes, **Sync Sekarang** only refreshes/downloads the latest Drive copy and never uploads stale local data.
- If Drive changed elsewhere after this device's last baseline, the previous cloud copy is backed up before an explicit local upload.
- Successful pull/upload clears the dirty flag and records the latest cloud baseline.
- The app remembers that Google was connected and attempts silent session restoration on later visits; if Google no longer has an active browser session, the sign-in safety screen remains.
