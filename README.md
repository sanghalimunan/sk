strategiSK v35.5

strategiSK v35.5

Minor spacing refinement for SV Consultation desktop/mobile layout.

strategiSK v35.4 — Persistent Media Cache

- IndexedDB local image cache per device
- cache-first media display
- Drive background refresh with retry
- uploaded image cached immediately after successful Drive upload
- cached images remain visible while Drive/token is temporarily slow
- Clear Media Cache control in Settings
- preserves v35.3 Drive Recovery & Repair and safe multi-device sync

# strategiSK v35.3 — Drive Recovery & Repair

- Detect duplicate strategiSK root folders.
- Lock one canonical root for future uploads.
- Scan all learning-point folders for orphan images.
- Recover selected orphan images into Learning Points grouped by capture/upload date.
- Compare latest Learning media and latest visible backup timestamps.
- Keeps v35.2 multi-device conflict protection.

# strategiSK v35.2 — Multi-Device Safe Sync

- Local autosave immediately.
- Idle sync after about 25 seconds when connected.
- Cloud refresh/check every 5 minutes and on app focus/visibility return.
- Cloud revision ID + device identity stored in metadata.
- Pull-before-push protection.
- If cloud changed while local edits exist, sync stops with Conflict instead of overwriting.
- Conflict resolution: Use Cloud Latest or Keep This Device; safety backup created first.
- Pending change counter shown in the top sync button.

strategiSK v35.0

strategiSK v34.9.1

# strategiSK PhD OS v34.9

## v34.9 — Draft 111 mobile readability
- Mobile Draft 111 history now uses one full-width card per draft, inspired by the Expert List layout.
- No horizontal scrolling on phone.
- Each card clearly separates Draft, Date, Pages, Focus, Notes, Thesis File, Edit and Delete actions.
- Desktop Draft 111 history keeps the existing table layout.
- Based on v34.9; all existing storage, Learning Point folders and Drive features are preserved.


## v34.9 fix
- Restored the Draft 111 Tracker page that was accidentally omitted in v33.2.
- Draft history, edit, delete and progress display are available again.
- Keeps the v33.2 Learning Point 2-column visual grid and sketch-to-visual-reference behavior.


Personal PhD operating system — Vercel / React + Vite.

## v34.9 improvements
- Dashboard: Today's Schedule, Daily Diary, Today's Win and Diary Photo content typography enlarged to match Latest Supervisor Consultation.
- Calendar & Diary: added Monthly Timeline view without changing the existing calendar layout.
- Diary Labels: add/remove labels in every diary entry.
- Monthly Timeline: filter diary stories by label, browse month-by-month, show date, reflection and photo, and open the original diary date.
- Calendar Search also searches diary labels.
- Existing Google Drive smart multi-device sync and safe media storage are preserved.

## Deploy
1. Upload/push this project to GitHub.
2. Import it into Vercel.
3. Keep the existing VITE_GOOGLE_CLIENT_ID environment variable.
4. Deploy.

Do not commit node_modules or local .env files.


## v33 Learning Point & Expert Print
- Multi-image upload with full-width stacked reading view and double-click preview.
- Print / Save as PDF for a complete Learning Point.
- Upload PowerPoint, PDF and HTML reference files to `strategiSK/learning-files` on Drive sync.
- Print / Save as PDF for the complete Expert List in a clean table.
- Schema version 3 migration preserves existing Learning Points and adds `attachments`.


## v33 — Mindmap Creator
- New Mindmap Creator menu after Learning Point.
- Add branches and child topics, edit colours/sides, save with strategiSK data, and Export PDF via browser print.
- Responsive desktop/tablet/mobile workspace.
- Schema v4; previous data migrates without reset.


## v33 changes
- Mindmap Creator removed from the application and future synced data.
- Learning Point uploaded images are medium width on desktop (about half the workspace), 70% on tablet, and full width on phone.
- Multi-image upload, double-click preview, Print/PDF, and Learning Point attachments remain available.


## v34.9 display adjustment
- Learning Point uploaded images: desktop 50% width, tablet 50% width, phone 100% width.


## v34.9 performance
- Uploaded media no longer keeps embedded base64 data in local state after successful Drive upload.
- Smart Sync only creates a cloud safety snapshot when the cloud changed since the device baseline.
- Text-only sync after initial media upload is substantially lighter.


## v34.9 major update
- Click diary labels to open an all-years filtered timeline.
- Print / PDF for Calendar & Diary, SV Consultation and Draft 111 history.
- Supervisor Consultation menu shortened to SV Consultation.
- Learning Point rich-note editor preserves pasted HTML tables/lists/formatting.
- A4 landscape sketch canvas supports image upload/paste before annotation.
- Hijri date moved below diary content to avoid overlap.
- Draft history typography enlarged.


## v34.9 update
- SV Consultation supports multiple image upload. One image is shown at a time with arrows, dots and touch swipe; consultation image frame is 4:3 and cropped to frame.
- Calendar & Diary supports multiple images per diary story. One image is shown at a time with swipe/arrows.
- Diary and Monthly Timeline image viewers use `object-fit: contain`, so portrait and landscape images are shown fully without cropping.
- Diary label input splits comma-separated text into separate labels (e.g. `thesis, progress, hlp`).
- Existing single-image diary/SV records are migrated automatically to the multi-image structure. Schema version 6.
- Expert List image frame is 4:3 while keeping fixed-frame cover behaviour.


## v35.5
- SV Consultation spacing tightened for a cleaner desktop layout.
- Learning Point top section and actions now reflow more neatly on narrower desktop widths.


## v35.6
- SV Consultation desktop layout refined to avoid overlap on narrower desktop widths.
- Consultation typography enlarged for clearer reading, closer to Learning Point.
- Consultation image panel now reflows more neatly under medium desktop widths.


## v35.7 — Fast Media Engine
- True cache-first image loading: fresh IndexedDB cache is used without re-downloading from Drive.
- Seven-day media cache freshness window.
- Lazy loading near viewport to avoid fetching every SV Consultation image at once.
- Drive media downloads limited to three concurrent requests.
- In-memory object URL cache makes repeat views within the same session nearly instant.
- Existing Drive, recovery, sync, and media upload behavior preserved.


## v35.8 — Edit-Safe Save
- Added explicit Save buttons to Learning Point, SV Consultation and Expert List.
- Auto sync is paused while typing/editing fields and resumes after focus leaves the editor.
- Learning Point / SV / Expert image uploads first persist current local edits.
- First visible SV consultation images are requested eagerly while the media queue still limits concurrent Drive downloads.


## v35.9 — No-Loss Sync Guard + Adaptive Rich Text
- Prevents a cloud pull from overwriting newer local edits, even if an earlier sync is still running.
- Adds persistent local change sequence tracking and a single-sync lock.
- If edits happen during upload, local data remains Pending and a follow-up sync is scheduled instead of clearing the dirty state.
- Saves a local recovery snapshot before any cloud pull.
- Learning Point pasted text now adapts to dark mode; pasted black/font background colors are stripped while structure such as tables/lists remains.


## v36.0 — Local Draft First
- Learning Point, SV Consultation and Expert List edit locally first.
- Google Drive sync is blocked while an unsaved Local Draft exists.
- Press Save to commit the draft, then safe cloud sync can run.
- Pending SV images remain as local data URLs until Save, so they display immediately and cannot vanish during an in-progress edit.
- Auto-auth, force download and manual cloud sync are also blocked while a Local Draft is unsaved.
- Local drafts persist in browser storage across refresh/reopen until saved.
