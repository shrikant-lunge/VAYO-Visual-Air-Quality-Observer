# TODO

## Report Hotspot updates
- [x] Add backend endpoint `GET /api/hotspot/reports?city=...` to list active hotspot reports.
- [x] Update `frontend/src/pages/ReportHotspot.jsx` to display all uploaded hotspot reports with image + location + label/confidence and a Delete button.
- [ ] Fix issue: submitting new hotspot report returns 404.
- [ ] Fix issue: report image not loading in UI.

## Debug checklist
- [ ] Confirm backend has `POST /api/hotspot/report` and `PATCH /api/hotspot/report/<id>/status` routes.
- [ ] Confirm frontend uses correct backend base URL for images and API.

