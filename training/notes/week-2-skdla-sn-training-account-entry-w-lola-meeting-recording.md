# R11 Week 2 SKDLA & SN Training-Account Entry w_ Lola-Meeting Recording

Recording label: Week 2 SKDLA & SN Training-Account Entry w_ Lola-Meeting Recording.mp4

Source: https://drive.google.com/file/d/1WZH6J0rKT41OaRlShciLOrU_Mh_pgCQT/view

Captions through: 01:31:48

This follow-up covers checking existing ClearChoice records, entering MB2 office and doctor accounts for OC and LA, linking billing accounts, and creating principal-level portal logins. It distinguishes account entry from the later customer onboarding call. Notes reflect the recording and require verification against current policy.

## Account entry is different from onboarding

Source timestamp 00:00:09

The team is changing its terminology: account entry creates the system records first; an account executive subsequently contacts the office to onboard it, discuss pricing, and conduct the customer call. An email may still be titled onboarding even though it requests account entry.

Read the request and identify the group, requested locations, office details, doctors, billing contacts, and preferences. Do not assume a new form means a new account: many ClearChoice locations already exist.

## Verify an existing ClearChoice office

Source timestamp 00:02:05

Use CRM > Customer Service > Search. For Aspen group locations, including ClearChoice, search Address 2 because Address 1 contains the corporate name.

Retrieve the matching account number, then use Maintenance > Doctors to inspect the profile. ClearChoice is searched by location number rather than simply by practice name. If the request omitted the location number, obtain it from the existing verified record.

The demonstrated naming combines the office location number, city, state, and ClearChoice label. Compare address and ZIP against the incoming HubSpot request and check that requested preferences already exist.

When the account and its preferences are already correct, skip new-account creation. If new preferences are supplied, copy the preference block into Case Entry Preferences rather than retyping technical dental instructions from memory. Check that the correct account is selected before pasting.

## MB2 hierarchy and duplicate checks

Source timestamp 00:07:55

An MB2 office is created as the principal account and the individual doctors are subaccounts. Create the office first, but verify by address through CRM > Customer Service > Search before doing so.

Return to Maintenance > Doctors, Add new account, and then Add new past the prospect list. In this session, the prospect list is not used for the live account-entry exercise.

Put the office name in Last name and repeat it in Practice name. Practice name is required for the doctor portal. Onboarded by can identify the person who entered the account; the date is optional in the demonstration.

Save to obtain the generated account number, retain its numeric portion, remove the suffix letters, and add the appropriate location prefix. The example begins in OC, but the request can require both OC and LA.

## Requested locations and escalation of discrepancies

Source timestamp 00:11:54

For the portal, OC and LA accounts need different email addresses. Inspect the request for its location-specific email information. A request containing both locations requires the corresponding records, not one account ambiguously shared between them.

If you discover a mismatch or error in account/case information, route it through the lab’s customer-service leadership rather than independently involving another department or simply accepting the erroneous information.

The historical escalation contacts include Cassandra, Sylvia, Allison, and Kevin for LA. The leadership team will direct the issue to the responsible department. This was explicitly the arrangement for the early training period, not a guarantee of the current escalation roster.

## Office address and principal email notifications

Source timestamp 00:15:40

Enter the office address and phone and save. The trainer says an ABS prompt to add an out-of-state ZIP for tax setup may be declined; California accounts require appropriate tax handling. This does not mean leaving the actual ZIP out of the address.

For the principal office, add the office/office-manager email as primary and the corporate accounts-payable email for billing. Keep the doctor-specific email for that doctor’s subaccount.

The principal record receives statements. Payment confirmation is also permitted in the demonstration, but invoices must not be selected on the principal because invoicing is tied to the subaccounts. Add the accounts-payable contact and ensure its statement setting is selected as well.

Only one email is primary. The first added email normally becomes primary; if it needs to be changed before a portal exists, right-click the correct email and choose Make primary email.

## Custom 2 and MB2 classifications

Source timestamp 00:18:38

Use the correct Lab ID, New Customer as origin lab, DSO as market segment, MB2 as the strategic/key-account classification, and True for the first-90-days flag in this new-account example.

The trainer is uncertain about a newly added MB2 senior back-office field and three available names, speculating that they may map to regions. Allison agrees to seek the official list. Treat that mapping as unresolved in this session; do not assign a regional director by guess.

Names for account executives/managers are discussed but a definitive list is still being obtained. An executive or manager field is not interchangeable with the office’s own office-manager contact.

On Locations, clear other locations and leave only OC for the OC record. Re-highlight OC to set its default courier. FedEx Second Day is the shipping service demonstrated again in the subaccount and AR exercises. Save after the individual changes.

## MB2 name tags and principal status

Source timestamp 00:21:51

Append (MB2) to the office account’s name and to the doctor subaccounts. The practice-name field for the doctor also includes the MB2 tag during the correction at 00:31:08.

The tag helps AR staff distinguish similarly named practices when posting payments and helps case-entry staff match the Rx to the right MB2 doctor. If the tag was missed, return to the record and add it; the trainer explains it is an identification aid rather than a separate technical penalty.

On the principal account, use Change Status and clear Allow Case Entry, then save. The principal is a billing/office account; cases are entered under the doctor subaccounts. Verify that the principal displays that case entry is not allowed.

## Primary email cannot simply change after portal creation

Source timestamp 00:23:17

The trainer distinguishes the email Source field: Email Communication Profile indicates the portal has not been created, while Web Service indicates that a portal has been created.

The demonstrated rule is that the primary email must remain the portal-associated email once the portal exists. Do not casually change it to another contact. If a portal-linked email needs correction, seek the approved administrative process.

This is separate from adding other billing or communication emails. Additional contacts do not automatically become the portal login.

## Create the doctor subaccount

Source timestamp 00:25:20

Create a new doctor record with DR title, the doctor’s first and last names, the practice name, and the MB2 name tag. Save, remove generated suffix letters, add the correct location prefix, and save again.

Add the same office address, but use the doctor’s supplied email on the subaccount. Select invoice notification only. The trainer explicitly says the doctor does not receive statements or payment confirmation from this subaccount configuration.

Apply the same location Lab ID, DSO/MB2 classification, and first-90-days flag as appropriate. Leave only the correct location enabled and set its default FedEx Second Day courier.

Open AR > Doctor AR Setup. If it was already open before the account was created, close and reopen it so the new account can appear. Select the right doctor, not merely another person with the same last name.

## AR pricing and linking every doctor

Source timestamp 00:34:28

In Doctor AR Setup, leave the standard General defaults, open Pricing, select MB2, choose FedEx Second Day, and save.

Find the office principal account and open General. Select Account is a bill-to account and confirm. Choose Link, find the new doctor subaccount, move it to the list, Process, confirm, and exit.

Verify that the doctor appears under the principal. Repeat the full doctor profile, pricing, and linking sequence for every additional doctor supplied in the request, even if that doctor has not yet begun sending cases.

When similar names appear, verify first name, last name, MB2 affiliation, and location before changing pricing or linking. The demonstrated exercise specifically encounters two doctors with similar names and warns against selecting the wrong record.

## Repeat correctly for LA

Source timestamp 00:44:30

Switch the active location to LA before the supervised LA exercise. If the location switch is missing after permissions are added, close ABS and log back in so the updated permissions can appear.

Create the LA principal and subaccounts using the corresponding LA details and distinct email, the correct prefix, LA Lab ID/location membership, MB2 pricing, and FedEx Second Day. Do not copy an OC account’s identity into the LA AR record.

LA automatically selects several email options, such as new-case and case-shipping notifications. The trainer instructs clearing the unwanted defaults and keeping the principal’s statement setting.

An account-manager record with an OC-prefixed name is used in the LA demonstration. The historical name shown is not proof that all LA accounts should use an OC manager; use the current approved assignment list.

Repeat the principal bill-to setting, doctor linking, and Allow Case Entry restriction. Check accounts-payable email on the LA principal too; the exercise returns to add/verify that missing billing contact and statement setting.

## A pricing inquiry is not automatically a new account

Source timestamp 01:13:48

A separate private-office email is reviewed as a fee-schedule inquiry. Search by name and address to determine whether a current account exists. A name search alone is not sufficient to establish that the office is new.

The trainer personally prefers waiting for a first case rather than creating an active account for a mere prospect. Prospect entry and later promotion are described as possible, but this inquiry is left uncreated because the request is not confirmed account-entry work.

Keep the distinction between answering an inquiry, recording a prospect, and creating a customer account. Do not add an account solely because a pricing email arrived.

## Create a principal-level ABS portal login

Source timestamp 01:18:44

Use Maintenance > Doctors to open the correct principal account and copy its primary email. Record the matching account number. Then open Doctor Portal Login in ABS.

Search the Login field with that email before adding anything. If it has already been used, obtain a different appropriate email rather than creating a duplicate. If it is absent, right-click the gray area and choose Add new login.

Enter the verified account number and press Tab. Confirm the demonstrated prompt to set up the admin login for that customer account. Use the primary email as Username and copy the account name into the matching name fields; for an office-only record, the office name goes in Last name.

The system supplies the temporary password in the demonstration. Do not publish or reuse a password from training notes. Review the allowed features: Pickup request and Account emulation are the two options the trainer says should remain unselected. Save.

When ABS asks whether to send notification, select No. The trainer warns that Yes sends an unhelpful/confusing email to the office. This No applies to that ABS notification prompt, not to all future legitimate customer communication.

## Portal level ingestion and completion

Source timestamp 01:23:25

For a principal/subaccount structure, create the portal for the principal only, not separately for each doctor subaccount. A genuinely individual doctor account instead receives an individual-level portal.

Repeat the login process for the LA principal using its LA identity and distinct email. The trainer verifies uniqueness, adds the login, and again chooses No for the automatic notification.

The trainer says portal ingestion takes about two hours; the demonstrated plan is to test it the following morning before sending credentials and to create/verify HubSpot as part of completion. Keep a reminder or tracker so a created login is not forgotten while waiting.

Verify that the portal works for the customer before sending access information. The May 4 follow-up clarifies that HubSpot may be prepared immediately or later according to staff preference, while outgoing credentials should wait for a working portal.

Incisive is deferred to the next session because its billing arrangement differs: Incisive, rather than the individual customer, is billed. Do not generalize the MB2 linking and portal instructions to Incisive without its separate process.

## Completion checklist

- [ ] Confirm whether the request is account entry, an existing-office update, or only a fee-schedule inquiry.
- [ ] For ClearChoice/Aspen, search Address 2 and verify the location-number record before creating anything.
- [ ] For MB2, create the office principal plus all requested doctor subaccounts with (MB2) tags.
- [ ] Use distinct verified OC and LA details and emails; check the actual active location and AR location.
- [ ] Principal: statements and approved payment confirmation, accounts-payable contact, bill-to enabled, Allow Case Entry disabled.
- [ ] Doctor subaccount: correct doctor email, invoice only, MB2 price list, correct courier, linked to the right principal.
- [ ] Preserve an existing portal-linked primary email; search email uniqueness before creating a login.
- [ ] Create the portal at principal level, exclude the two demonstrated restricted features, save, and choose No for the automatic ABS notification.
- [ ] Track ingestion and verify portal operation before sending credentials; escalate unresolved assignments or discrepancies to the lab leadership team.

## Limits and points to confirm

- The MB2 senior back-office director mapping is unresolved in this recording; a later May 4 session says to use the director named in the incoming request.
- Executive/manager names and early-training escalation assignments are historical and may have changed.
- The portal feature names and checkbox states come from spoken captions; verify the actual approved screen configuration.
- The recording contains an audio interruption around 00:26 to 00:30 and extended hands-on sections with sparse narration. Unspoken screen actions remain unverified.
- The two-hour ingestion timing is the trainer’s estimate, not a guaranteed completion time.
- Current Incisive guidance cannot be inferred from this MB2-focused session; the later May 4 session says not to create Incisive portals.

