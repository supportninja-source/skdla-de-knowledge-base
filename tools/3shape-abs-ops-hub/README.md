# 3Shape → ABS Operations Hub

A secure Google Apps Script web front end for the existing **3Shape to ABS Reconciliation Tracker**. Version 1 deliberately keeps the current Google Sheet as the live source of truth so the existing Scrape Log, ABS Outcome, reconciliation, pending, ClearPath, productivity, historical, and EOD data appear in the website without a risky bulk copy of patient data.

## What is included

- Dashboard / EOD report by operational Shift Date
- Reconciliation drill-down with All / Pending / Completed / Escalated / Issues filters
- Pending Queue and older-shift carryover
- Unmatched ABS viewer
- ClearPath Queue Control using the selected scrape cohort
- Shift Productivity using 12 cases/hour, existing schedules, breaks/lunches, and the 5-cycle scraper rotation
- Hourly Activity by Ninja and interval
- Historical shift performance
- Data Quality Issues
- Scrape Intake form
- Local PDF patient-name suggestion; the selected PDF remains in the browser and is not committed to GitHub
- ABS Outcome form with validation:
  - Completed requires ABS Case ID
  - Escalated requires an escalation reason or notes
- Productivity miss-reason storage
- Web Hub audit trail

## Existing-data migration

There is **no separate import step in Version 1**. After the web app is linked to the existing tracker by Script Property, it reads the current workbook directly. That means your existing historical data is already the website's data source rather than being duplicated into GitHub or a second database.

The website writes only the real input cells in `Scrape Log` and `ABS Outcome`. It does **not** overwrite the tracker helper/array-formula columns. Existing matching formulas, Tracker IDs, normalized names, Shift Date fields, PDF-link keys, and reconciliation formulas remain in control.

## Data and security design

**Never put patient PDFs, patient data, the Google Sheet ID, or credentials in GitHub.**

The app reads/writes the tracker through Google Apps Script. The Sheet ID is stored only as a Script Property named `TRACKER_SPREADSHEET_ID`. An optional `ALLOWED_EMAILS` Script Property can restrict use to a comma-separated list of email addresses.

Two tabs are created automatically the first time the web app runs:

- `Web Hub Config` — stores ClearPath manual inputs per Shift Date.
- `Web Hub Audit` — records web-app write actions.

Existing tracker tabs are not replaced.

## Deploy the website

1. Open **script.google.com** while signed into the Google account that can access the tracker.
2. Create a **New project** named `3Shape ABS Operations Hub`.
3. In the Apps Script editor, create five script files and paste the corresponding files from `apps-script/backend/`:
   - `00_ConfigAndApi.gs`
   - `01_Writes.gs`
   - `02_Reconciliation.gs`
   - `03_ProductivityAndClearPath.gs`
   - `04_Utilities.gs`
4. Add four HTML files and paste the corresponding files from `apps-script/`:
   - `Index.html`
   - `Styles.html`
   - `Shell.html`
   - `Client.html`
5. In **Project Settings**, enable **Show "appsscript.json" manifest file in editor** and replace it with `apps-script/appsscript.json`.
6. In **Project Settings → Script properties**, add:
   - `TRACKER_SPREADSHEET_ID` = the ID from the existing `3Shape to ABS Reconciliation Tracker` URL.
   - Optional: `ALLOWED_EMAILS` = comma-separated email addresses allowed to use the site.
7. Run `getBootstrap` once from the Apps Script editor and approve the Google authorization prompt. Running it without an argument uses the current operational Shift Date.
8. Choose **Deploy → New deployment → Web app**.
9. Use a secured deployment. Recommended:
   - Execute as **User accessing the web app** if every Ninja already has access to the tracker Sheet, or **Me** if the script owner should mediate Sheet access.
   - Limit access to your intended signed-in Google Workspace users. **Do not deploy this anonymously/publicly when patient data is involved.**
10. Click **Deploy** and distribute the resulting Web App URL only to authorized users.

When code changes later, use **Deploy → Manage deployments → Edit → New version → Deploy**.

## How to use the website

### Dashboard / EOD

Choose **Shift Date** at the top. One operational Shift Date represents **9:00 PM on the selected date through 8:00 AM the following date**.

Dashboard cards show Total Scraped, Completed in ABS, Escalated, Pending / No ABS Update, Reconciled, Reconciliation Rate, Data Quality Issues, and the EOD result. EOD becomes **PASS** only when the selected scrape cohort is fully accounted for and no detected data-quality issue remains.

### Scrape Intake

Open **Scrape Intake**, select the Ninja, paste the 3Shape / SharePoint / PDF source link, optionally choose the PDF for local patient-name detection, verify the patient-name suggestion, then click **Save to Scrape Log**. The existing tracker formulas continue generating the matching and reconciliation helper fields.

### ABS Processing

Open **ABS Processing**, paste the matching PDF/source link, select the Ninja, choose **Completed** or **Escalated**, provide the ABS Case ID for Completed or escalation reason/notes for Escalated, then save.

### Reconciliation

Open **Reconciliation** and filter by All, Pending, Completed, Escalated, or Issues. The website uses the selected **scrape cohort** as the reconciliation source of truth instead of simply counting every raw ABS timestamp during the clock shift.

### Pending Queue

Shows cases from the selected scrape cohort with no matched Completed/Escalated ABS outcome. Use the source link and EOD action to investigate the case in ClearPath or with the assigned Ninja.

### ClearPath Queue Control

For the selected Shift Date enter only:

- Opening ClearPath Queue
- Other / Client Uploads, when applicable
- Closing ClearPath Queue

The website then calculates our uploads, Ninja Completed, Ninja Escalated, client/other processed, total available, total accounted, difference, and **BALANCED / CHECK DIFFERENCE** status.

### Shift Productivity

The page uses **12 cases/hour** and Actual Productivity = **Completed + Escalated**. Existing Ninja shifts, staggered breaks/lunches, the five scraper cycles, prorated targets, and `NO TARGET - SCRAPING`, `NO TARGET - BREAK/LUNCH`, and `OFF SHIFT` logic are preserved. Filter by Ninja to review each interval and save productivity-miss reasons.

### Hourly Activity

Shows total shift activity by Ninja plus an interval selector for the 9 PM → 8 AM operating hours. This is the workload/activity view; official target logic remains under **Shift Productivity**.

### Historical View

Choose From / To Shift Dates to compare scraped, completed, escalated, pending, reconciled, and reconciliation rate across prior shifts.

### Data Quality

Flags issues such as missing ABS Case ID, missing escalation reason, and multiple ABS updates where applicable.

## Files

Backend:

- `apps-script/backend/00_ConfigAndApi.gs`
- `apps-script/backend/01_Writes.gs`
- `apps-script/backend/02_Reconciliation.gs`
- `apps-script/backend/03_ProductivityAndClearPath.gs`
- `apps-script/backend/04_Utilities.gs`

Web UI:

- `apps-script/Index.html`
- `apps-script/Styles.html`
- `apps-script/Shell.html`
- `apps-script/Client.html`
- `apps-script/appsscript.json`

## Recommended rollout

1. Deploy this Sheet-backed web version.
2. Compare a few historical Shift Dates against the existing workbook's EOD, ClearPath, reconciliation, hourly, and productivity pages.
3. Let the team use the web forms while keeping the Google Sheet as the fallback/source of truth.
4. After the workflow is stable, the backend can be migrated to a private database such as Supabase while retaining Google Sheets as a reporting/export layer if desired.
