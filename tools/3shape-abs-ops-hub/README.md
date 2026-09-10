# 3Shape → ABS Operations Hub

A secure Google Apps Script web front end for the existing **3Shape to ABS Reconciliation Tracker**. Version 1 intentionally keeps the existing Google Sheet as the source of truth so historical Scrape Log, ABS Outcome, reconciliation, pending, ClearPath, productivity, and EOD records are immediately available without copying patient data into GitHub.

## What is included

- Dashboard / EOD report by operational Shift Date
- Reconciliation drill-down
- Pending Queue
- Unmatched ABS viewer
- ClearPath Queue Control with opening/closing queue and other/client uploads
- Shift Productivity using the workbook's 12 cases/hour target, schedules, breaks/lunch, and 5-cycle scraper rotation
- Hourly Activity by Ninja and hour
- Historical shift performance
- Data Quality Issues
- Scrape Intake form
- Local PDF patient-name suggestion (PDF stays in the browser; verify the detected name before saving)
- ABS Outcome form with validation:
  - Completed requires ABS Case ID
  - Escalated requires an escalation reason or notes
- Productivity miss-reason storage
- Web Hub audit trail

## Data and security design

**Do not put patient PDFs, patient data, the Google Sheet ID, or credentials in GitHub.**

The app reads/writes the existing Google Sheet through Apps Script. The Sheet ID is stored only as a Script Property named `TRACKER_SPREADSHEET_ID`. An optional `ALLOWED_EMAILS` Script Property can restrict use to a comma-separated list of email addresses.

Two tabs are created automatically the first time the web app runs:

- `Web Hub Config` — stores ClearPath manual inputs per Shift Date.
- `Web Hub Audit` — records web-app write actions.

Existing tracker tabs are not replaced.

## Deploy the website

1. Open **script.google.com** while signed into the Google account that can access the tracker.
2. Create a **New project** named `3Shape ABS Operations Hub`.
3. Replace `Code.gs` with the contents of `apps-script/Code.gs`.
4. Add a new HTML file named **Index** and paste `apps-script/Index.html` into it.
5. In **Project Settings**, enable **Show "appsscript.json" manifest file in editor**. Replace its content with `apps-script/appsscript.json`.
6. In **Project Settings → Script properties**, add:
   - `TRACKER_SPREADSHEET_ID` = the ID of the existing `3Shape to ABS Reconciliation Tracker`.
   - Optional: `ALLOWED_EMAILS` = comma-separated email addresses allowed to use the site.
7. Run `getBootstrap` once from the Apps Script editor and approve the Google authorization prompt. A blank argument is fine.
8. Choose **Deploy → New deployment → Web app**.
9. Use a secured deployment. Recommended:
   - Execute as: **User accessing the web app** if every Ninja has access to the tracker Sheet, or **Me** if you want the script owner to mediate Sheet access.
   - Who has access: your Google Workspace organization / intended signed-in users. **Do not use anonymous public access for patient data.**
10. Click **Deploy** and use the Web App URL as the team's new Operations Hub.

When you change the code later, use **Deploy → Manage deployments → Edit → New version → Deploy**.

## How to use it

### Dashboard / EOD

Choose **Shift Date** at the top. One operational Shift Date means **9:00 PM on the selected date through 8:00 AM the next day**.

Dashboard cards show Total Scraped, Completed in ABS, Escalated, Pending / No ABS Update, Reconciled, Reconciliation Rate, Data Quality Issues, and EOD result. The EOD result is **PASS** only when the selected scrape cohort is fully reconciled and there are no detected data-quality issues.

### Scrape Intake

Open **Scrape Intake**, select the Ninja, paste the 3Shape / OneDrive / SharePoint source link, optionally choose the PDF for local patient-name detection, verify the suggested patient name, then click **Save to Scrape Log**. The existing Sheet formulas continue generating Tracker ID, normalized name, shift date, PDF keys, and matching fields.

### ABS Processing

Open **ABS Processing**, paste the matching PDF/source link, select the Ninja, choose **Completed** or **Escalated**, provide the ABS Case ID for Completed or escalation reason/notes for Escalated, then save. Existing ABS Outcome formulas continue populating matching fields.

### Reconciliation

Open **Reconciliation** and filter by All, Pending, Completed, Escalated, or Issues. The site uses the selected **scrape cohort** as the reconciliation source of truth, not merely every ABS timestamp that occurred during the clock shift.

### Pending Queue

Shows cases from the selected scrape cohort with no matched Completed/Escalated ABS outcome. Use the source link and EOD action to investigate in ClearPath or with the assigned Ninja.

### ClearPath Queue Control

For the selected Shift Date enter only Opening ClearPath Queue, Other / Client Uploads if any, and Closing ClearPath Queue. The site automatically calculates our uploads, Ninja Completed, Ninja Escalated, client/other processed, total available, total accounted, difference, and BALANCED / CHECK status.

### Productivity

The site uses **12 cases/hour**, Actual Productivity = **Completed + Escalated**, existing Ninja schedules, staggered breaks/lunches, the 5-cycle scraping rotation, prorated targets, and `NO TARGET - SCRAPING`, `NO TARGET - BREAK/LUNCH`, and `OFF SHIFT` rules. Filter by Ninja to review each interval and add productivity-miss reasons.

### Hourly Activity

Shows total shift activity by Ninja plus an interval selector for the 9 PM → 8 AM hours. This is the workload/activity view; productivity target logic remains under **Productivity**.

### History

Choose a from/to Shift Date range to compare scraped, completed, escalated, pending, reconciled, and reconciliation rate across prior shifts.

### Data Quality

Flags reconciliation problems such as missing ABS Case ID, missing escalation reason, or duplicate/multiple ABS updates where applicable.

## Existing-data migration

No bulk data copy is required for Version 1. The web app points directly to the current tracker workbook, so the existing historical records remain available immediately. This avoids duplicating or exposing patient data and gives a clean migration path:

1. Use the Sheet-backed web app first.
2. Validate that web totals match the original workbook.
3. Once stable, optionally migrate the backend to a private database such as Supabase while keeping Google Sheets as an export/reporting layer.

## Files

- `apps-script/Code.gs` — backend and tracker integration
- `apps-script/Index.html` — responsive web UI
- `apps-script/appsscript.json` — Apps Script manifest
