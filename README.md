# strategiSK PhD OS v34.8

## v34.8 — Draft 111 mobile readability
- Mobile Draft 111 history now uses one full-width card per draft, inspired by the Expert List layout.
- No horizontal scrolling on phone.
- Each card clearly separates Draft, Date, Pages, Focus, Notes, Thesis File, Edit and Delete actions.
- Desktop Draft 111 history keeps the existing table layout.
- Based on v34.7; all existing storage, Learning Point folders and Drive features are preserved.


## v34.7 fix
- Restored the Draft 111 Tracker page that was accidentally omitted in v33.2.
- Draft history, edit, delete and progress display are available again.
- Keeps the v33.2 Learning Point 2-column visual grid and sketch-to-visual-reference behavior.


Personal PhD operating system — Vercel / React + Vite.

## v34.7 improvements
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


## v34.7 display adjustment
- Learning Point uploaded images: desktop 50% width, tablet 50% width, phone 100% width.


## v34.7 performance
- Uploaded media no longer keeps embedded base64 data in local state after successful Drive upload.
- Smart Sync only creates a cloud safety snapshot when the cloud changed since the device baseline.
- Text-only sync after initial media upload is substantially lighter.


## v34.7 major update
- Click diary labels to open an all-years filtered timeline.
- Print / PDF for Calendar & Diary, SV Consultation and Draft 111 history.
- Supervisor Consultation menu shortened to SV Consultation.
- Learning Point rich-note editor preserves pasted HTML tables/lists/formatting.
- A4 landscape sketch canvas supports image upload/paste before annotation.
- Hijri date moved below diary content to avoid overlap.
- Draft history typography enlarged.
