# R06 Day 8: NCE Training Part 1

Recording label: Day 8_ NCE Training Part 1.mp4

Source: https://drive.google.com/file/d/1P-iQA4iz5OtqKDiadO-_Xas__675unET/view

Captions through: 01:06:33

Lola introduces new account entry for private practices and Aspen group DSOs, demonstrates ABS and HubSpot setup, and explains portal verification. This is historical training guidance from auto-generated captions. The supplied transcript is identical to the Week 2 Account Entry with Lola recording marked (1).

## Active location and account changes

Source timestamp 00:02:02

ABS can show account creation information across locations, but an update must be made while working in the location to which that account belongs. The example is an address change: an apparent update from another location may not appear correctly when the actual location is opened.

Use the green arrow and its drop-down at the lower left, choose Change active location, confirm the location change, select LA or OC, then Select and close. Check the location label at the lower left before continuing. LA and OC are the locations used in this session; do not choose other available locations merely because they appear.

## Verify that the account does not already exist

Source timestamp 00:04:27

Maintenance > Doctors shows doctor profiles and supports searches by last name or account number. Before creating anything, also use CRM > Customer Service > Search to verify the office by address.

Place the cursor carefully in the Address 1 search field. The trainer warns that clicking the wrong part of the grid can select an unrelated account and lead to an accidental update. Move the address column toward the front if that makes searching easier.

Try the address both normally and with a leading space when needed. Historical records sometimes contain an extra leading space, and the normal search may miss them. A matching result means an account already exists; inspect it before deciding whether a new record is necessary.

Once absence has been verified, return to Maintenance > Doctors, right-click the gray area, and choose Add new account. The intervening list contains prospect accounts. The trainee is told to proceed with Add new rather than manage prospects during this workflow.

## Create a private practice profile

Source timestamp 00:08:37

Decide whether the request is for an office account or an individual doctor account. For an office account, enter the office name in Last name. For a doctor account, use the DR title and the doctor’s first and last names.

Practice name must be populated for the portal to work. If no separate practice name is available, copy the doctor’s name. During the supervised exercise, the trainer stresses that formatting must match: if DR has punctuation in one name field, use matching punctuation in the other. The trainer personally avoids the period.

Record the account creator’s initials in Onboarded by when appropriate. After the initial save generates an account number, retain its numeric portion, remove the letters after the numbers, and add the correct location prefix. The demonstrated private account uses OC. Save again.

An unwanted Aspen selection can be inherited into the DSO field. At the time of this session, the issue was not fixed. For a non-Aspen account, remove the inherited Aspen value before saving; do not accept a prefilled DSO simply because it appears automatically.

## Address phone and sales tax

Source timestamp 00:10:03

Enter the office’s actual address. A different billing address may be added if the doctor wants statements mailed elsewhere. In the practice exercise, the third street-address field is left blank.

The training says California customers require the applicable sales tax. If the correct tax is absent from ABS, contact Lola to have the tax record created rather than inventing a rate. The rate shown for one demonstration city is an example from that session, not a universal rate.

When changing a tax, select the correct tax and remove the previous selected tax using the left arrow. Otherwise both may remain selected. Confirm and save. This is an account configuration lesson, not independent tax advice or a current tax-rate schedule.

A phone number is required for the portal. Enter it using dashes rather than parentheses. The later practice example uses an out-of-state address and the trainer declines the prompt to add its ZIP code because the office is outside California. Preserve the real ZIP in the address; do not confuse declining an ABS ZIP/tax setup prompt with omitting the postal address.

## Email notifications and communication preferences

Source timestamp 00:13:02

Add the doctor’s preferred email address because the portal also depends on that field. Use the requested email for statements and invoices and select the corresponding notification options according to the office’s preference.

The first demonstration says only statements and invoices are generally used and other selected options should be cleared. Later, at 00:55:32, the exercise permits charge confirmation as well and refers to red-highlighted boxes that should remain unselected. These instructions are not fully consistent, and the red-box meanings cannot be recovered from captions alone; verify the approved notification settings before production use.

Specific communication instructions can be stored in the preference area, labeled for office staff if needed, or in case preferences on the main screen. Office hours may be entered if supplied but are not required in the demonstration. The ordinary Custom tab and the unused office-information fields are not part of the demonstrated setup.

## Custom 2 location and shipping fields

Source timestamp 00:15:03

In Custom 2, use the correct Lab ID, the appropriate market segment, and the strategic/key-account classification. For this private-practice example, Lab ID is OC, market segment is Private Practice, and the key-account value is the new-account classification for 2026.

The first-90-days flag is described as useful rather than mandatory; the exercise sets it to True for a new account. Mark BioHorizons only when the onboarding information identifies the office as a BioHorizons customer. Do not infer the affiliation.

For a private office, enter an account executive only if the request identifies one; the trainer says it can be left blank when no executive submitted the request. Later discussion says an associated account manager should be added when known, with a list still being obtained.

Use the scrollbar instead of the mouse wheel in the sensitive Custom 2 screen; the trainer warns that wheel scrolling can change values in other fields.

On Locations, leave only the intended account location selected and clear the other locations. Save each change. Re-highlight the intended location before setting its default courier, demonstrated as FedEx Second Day. Location membership matters for AR reporting, so verify it rather than treating the prefix as sufficient.

## Set private practice pricing in AR

Source timestamp 00:17:20

Go to AR > Doctor AR Setup and find the newly created account. The General screen is normally left at its defaults. Open Pricing, select the approved price list, choose the shipping service, and save.

Signature 2 is the usual private-office price list in this training unless an account manager specifies a different list. The location default and the AR shipping setting are both demonstrated; do not assume setting one automatically completes the other.

The supervised exercise reaches a missing AR permission at approximately 01:00:14. Lola agrees to grant Doctor AR Setup access after the call. An account profile alone is not a finished account-entry workflow when pricing remains unset.

## Find or create the HubSpot contact

Source timestamp 00:19:45

Search HubSpot by the primary email before adding a contact. If the email is absent, create the contact using the supplied doctor details, DR as job title, the account phone, the lab code, and the ABS account number.

The trainer initially allows a customer-service representative or the account creator as contact owner. The discussion explains that ownership relates to routing and tickets can be reassigned. Most tickets were handled by customer service at that time; some accounts required dedicated routing.

ClearChoice is cited as a special case for the case coordination team. A definitive routing document was still to be provided. The account-owner discussion includes assumptions about how the workflow operates; do not turn the provisional explanation into a permanent routing rule.

## Portal prerequisites and testing

Source timestamp 00:24:14

Create the ABS portal login before trying to test the customer portal. The contact shown in the example already has its ABS login configured; this is a test of that existing setup, not a complete demonstration of creating a new login.

The trainer tests the portal before sending information to a customer so the office does not need to report a failed login. A shared temporary password is spoken in the recording; it is deliberately excluded from these notes and must not be embedded in a public knowledge base.

An incorrect-username error is treated as a possible ingestion problem. Only a person with the appropriate admin access should use the admin Reset user action for the verified email. The trainer reports that the reset may take a couple of hours to ingest or may work immediately; neither is a guaranteed service-level commitment.

If login succeeds but no history appears, compare against Cases > Case Inquiry in ABS using the correct account number. If ABS contains history, log out of the portal and back in to check whether the data appears. In the demonstrated Incisive account, the user can see cases but not full account information.

The trainer postpones creating a new portal login until a real, approved email is available, warning that an email used for a test may be difficult to reuse. This session does not finish that new-login demonstration.

## Private practice and DSO account structures

Source timestamp 00:32:30

A typical private practice has an individual office or doctor account. Some private practices instead need an office-level principal account and doctor subaccounts so the statement has an office header while charges are separated by doctor.

Aspen and ClearChoice are described as corporate principal accounts with location subaccounts. MB2 is described differently: the office is the principal account and individual doctors are attached below it. A DSO label does not imply that every group uses the same hierarchy.

The session introduces Aspen only as one example. MB2 and Incisive are specifically left for further training, so the Aspen sequence must not be copied to all DSOs.

## Aspen group search and profile setup

Source timestamp 00:35:35

For Aspen and ClearChoice, search Address 2 rather than Address 1 because Address 1 is used for the corporate name. Verify absence before creating the new location.

Use Maintenance > Doctors > Add new account. The demonstrated Last name is the location number; corporate name and location information identify the office. Remove the generated suffix letters and use the appropriate location prefix for the account number.

Address 1 contains the relevant corporate label and Address 2 contains the physical street address. The spoken corporate-label examples include Aspen Dental, ClearChoice, and Beacon; verify the actual requested group label rather than copying the caption spelling.

In Custom 2, select the location Lab ID, the designated account executive, DSO market segment, and the Aspen account classification. Jillian is identified as the executive for Aspen in this historical session. Other groups have other executives, and a reference document was still being supplied.

Leave only the intended location enabled, save, then open Doctor AR Setup. If the new account is missing, close and reopen the AR window to refresh its data.

## Aspen pricing and principal account linking

Source timestamp 00:40:39

Choose the group-specific price list: Aspen for Aspen, ClearChoice for ClearChoice, MB2 for MB2, and the corresponding approved list for other DSOs. The trainer explicitly clarifies that DSOs do not default to Signature 2. The broad earlier wording about defaults applies to private practices, not DSOs.

Use the verified corporate principal account in Doctor AR Setup, choose Link, search for the newly created location account, Add to list, Process, confirm, and exit. Verify that the location is attached to the corporate record. The exact corporate account number spoken in the demonstration is omitted from this shareable manual.

Unlink is described as a similar process using Unlink, but the narration then says the success message reports linked. That wording is ambiguous; verify the resulting account relationship instead of relying on the captioned message.

At the end, the team plans further live practice, supervised nesting, and training for MB2 and Incisive. These are historical training plans rather than active scheduling commitments.

## Completion checklist

- [ ] Check the correct LA or OC location before editing account information.
- [ ] Search for duplicates by name/account and address, accounting for leading spaces; use Address 2 for Aspen group locations.
- [ ] Confirm the requested office-versus-doctor structure, fill Practice name, remove unintended Aspen affiliation, and save the correct prefixed account number.
- [ ] Verify the real address, phone formatting, email, applicable tax configuration, and approved notification preferences.
- [ ] Set Custom 2 classifications, intended location only, courier, account ownership where supplied, and AR pricing.
- [ ] Search HubSpot by email before creating another contact; preserve the verified lab code and account number.
- [ ] Test only an approved, correctly created portal login; escalate resets to an authorized administrator.
- [ ] Confirm group-specific pricing and principal/subaccount relationships before declaring a DSO complete.

## Limits and points to confirm

- Captions are auto-generated and do not verify spelling of field labels, staff names, corporate names, or the appearance of screen-only controls.
- Private-practice email-option instructions differ between the first demonstration and later exercise; the red-highlighted boxes are not identified in the transcript.
- Day 8 includes testing an existing Incisive portal. A later May 4 recording says not to create new Incisive portals; use the later group-specific direction and confirm current policy.
- The new ABS portal-login creation was deferred here; do not treat this recording as a full standalone portal-creation SOP.
- Tax settings and staff assignments are historical examples requiring current business verification; no rate or individual is guaranteed current.
- Actual video displays were not reviewed; on-screen actions not described in the transcript remain unverified.

