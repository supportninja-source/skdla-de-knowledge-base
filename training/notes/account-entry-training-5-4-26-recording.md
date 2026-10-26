# R10 Account Entry Training-5.4.26 Recording

Recording label: Account Entry Training-5.4.26 Recording.mp4

Source: https://drive.google.com/file/d/1zeKEBQX8vZm-MCIL7-eVepV4RPOPDwEM/view

Captions through: 03:05:51

John and Lola supervise account entry for a BioHorizons private office, MB2, Incisive, TRRI, and a private practice requiring a principal with doctor subaccounts. The session adds practical inbox tracking, corrects mistakes made during live practice, and clarifies which groups receive portal access or different outgoing communication. These are historical training notes from auto-generated captions, not independently confirmed current SOPs.

## Prerequisites and account structures

Source timestamp 00:00:57

Account-entry staff need ABS, Doctor AR Setup, the ability to change between OC and LA where required, and the shared account-entry/onboarding mailbox. Missing access is escalated to the appropriate lead; it is not a reason to leave pricing or linking silently unfinished.

Most private offices use an individual doctor record, while MB2 and Carabelli are described as needing an office principal and doctor subaccounts. The request should state what is needed. Do not guess account hierarchy merely from the presence of several names.

Read the full request for location-specific emails and details. The trainer initially says MB2 generally needs OC and LA, but the actual MB2 example later explicitly requires only OC because no LA email was supplied. Use the request-specific direction, not the earlier generalization, to determine scope.

## BioHorizons uses the private-practice sequence

Source timestamp 00:07:36

BioHorizons is a package/affiliation in this example, not the practice name to type into the profile. Use the actual clinic/practice name from the request. The trainer describes it as affiliated like a DSO but entered through the private-practice structure.

First verify by CRM > Customer Service > Search that the office is not already in ABS. Only after no matching account is found should you use Maintenance > Doctors to create the doctor profile and populate the actual Practice name. Record the account creator’s initials.

For this example, the trainer says BioHorizons is OC and that an unspecified location defaults to OC in their workflow. Preserve that as session-specific training and confirm current routing rules before using it broadly.

Enter the address, keep the third address line blank in the demonstrated workflow, add phone and email, and set the appropriate notification preferences. Select the BioHorizons package indicator in Custom 2.

Bobby is identified as handling BioHorizons in Strategic Account Executive, and Nick is selected as the account manager in this historical example. Other private practices later in the recording have no assigned manager; these fields are group/request dependent.

Leave only OC selected on Locations, set FedEx Second Day, then use AR > Doctor AR Setup > Pricing to choose Signature 2 for the demonstrated BioHorizons account and the shipping service.

## Track work in the shared mailbox

Source timestamp 00:18:18

After completing the account work, categorize the request as Done and move it into the responsible person’s folder. The purpose is to remove finished work from the active inbox while retaining an easy verification trail.

The trainer creates individual folders for the people doing account entry. Later, a separate waiting state is used for records whose portal credentials still need to be sent. Account creation and customer notification are separate completion steps.

Do not mark a request fully complete just because the profile was saved. Confirm required AR pricing, linking, portal setup, and outgoing communication or preserve the outstanding step visibly.

## Create the private-office portal login

Source timestamp 00:19:30

Obtain the correct account number and primary email, then use Maintenance > Doctor Portal Login. Search the email first to check whether a login already exists.

If absent, right-click the appropriate grid area, Add new login, enter the account number, and populate the username with the email. Use DR and the doctor’s actual first/last names for an individual doctor account. Review the matching account displayed at the top before saving.

The trainer says no other settings need changing in this exercise. Save and select No at the automatic notification prompt, consistent with the earlier Lola training. No credentials or temporary passwords from the recording are included in these notes.

ABS and the portal may take up to two hours to connect. The later discussion prefers testing and sending credentials the next day so the office does not immediately encounter an ingestion error. Treat the timing as the trainer’s observed estimate.

## Repair an existing HubSpot contact instead of duplicating it

Source timestamp 00:22:53

A request submitted through HubSpot may already create or attach the sender’s email to a contact. If Add contact reports that the email already belongs to someone, exit and search for that exact email.

Open the existing contact. Use Actions > View all properties to add the correct ABS account number, and set the lab code to OC or LA as appropriate. The BioHorizons example already has the contact but lacks its account linkage.

The trainer first describes this as a BioHorizons quirk; later at 02:16:48, the team observes the same behavior for another new contact. Check existing contacts generally rather than assuming this occurs only for BioHorizons.

If account-number properties cannot be edited, request the necessary access through Allison. Do not create another contact to work around an editing restriction.

## Use the correct outgoing route for MB2 and Carabelli

Source timestamp 00:26:50

For MB2, the trainer forwards completion information to the internal account team rather than emailing the MB2 office directly. The example recipients are Erin and Tori, sometimes with Nick included; these are historical role assignments requiring current verification.

The completion information identifies the office principal, doctor subaccounts, and portal access information through the approved channel. Keep real credentials out of public documentation or site data.

The trainer says Carabelli uses the same internal communication approach. A broader cleanup project for older Carabelli accounts is mentioned: some were entered only under doctor names and still needed office principal accounts and links. This is a historical project note, not authorization to restructure every account.

## MB2 principal name and requested location

Source timestamp 00:33:40

Verify the office by address in CRM before creating the principal. Use Maintenance > Doctors > Add new account > Add new. Put the practice name, not the doctor’s name, in Last name and Practice name.

Append (MB2) to both appropriate name fields. Choose MB2 in the DSO selection; clear or replace an inherited Aspen value. Save, remove the generated suffix letters, add the requested location prefix, and save again.

Read the bottom of the request for its explicit OC and LA email assignments. In the demonstrated example, only an OC email is present, so the trainer confirms that only OC is needed. A later line in a broader discussion must not override this specific requirement.

Check the account number character by character. The hands-on exercise catches an alphabetic character left at the end; retaining an S or other suffix by mistake defeats the intended account-number format.

## MB2 address primary email and accounts payable

Source timestamp 00:39:36

Put the street address on the first address line and the suite on the next line. If ABS recognizes the ZIP code, entering it can populate city/state. Check the result because a later exercise shows a ZIP linked to the wrong city; auto-population is a shortcut, not proof of correctness.

Format the phone as three digits, dash, three digits, dash, four digits. Save before moving on.

For the principal, use the location-specific office email identified in the request, not whichever email appears first. Add the corporate accounts-payable email as another contact.

The principal receives statements; remove invoice notification from the office/principal email settings. The trainer confirms the earlier Lola rule that invoices belong to the doctor subaccounts.

## MB2 Custom 2 location and ownership

Source timestamp 00:45:21

Set Lab ID to the account’s correct location, Origin lab to New Customer, market segment to DSO, strategic/key account to MB2, and the first-90-days flag to True for the new account.

This session resolves the earlier uncertainty about MB2 Senior Back Office Director: choose the director explicitly named in the request email. Do not infer the director from geography or select one of the available names at random.

Tori is selected as Strategic Account Executive and Erin as Account Manager in this example. Earlier recordings used other names or said a list was pending; use a verified current assignment list for production work.

On Locations, clear the other locations one by one and save each change. Highlight the intended location, set its default FedEx Second Day courier, assign the approved account manager, and save.

## MB2 doctor creation and corrected email mistake

Source timestamp 00:51:14

Create a separate doctor subaccount with DR title, the doctor’s first/last names, the MB2 tag, the actual practice name with MB2 tag, and the proper location-prefixed account number. Add the verified office address and phone.

During initial practice, an office-manager email is incorrectly placed on the doctor subaccount and no notification is selected. At 01:09:39 to 01:10:59, the trainer corrects this: edit the subaccount email to the supplied doctor email and select Receive invoices. The corrected final state takes precedence over the earlier mistaken click sequence.

Apply the matching MB2 Custom 2 settings, director, location, courier, and approved manager. Check the exact doctor name and account identity before setting AR data.

The principal’s Change Status must have Allow Case Entry cleared. The exercise returns to do this at approximately 01:01:14. Cases should be entered under doctors, not under the billing principal.

## AR setup linking and principal-only portal

Source timestamp 01:01:29

Searching the Practice name can display the office and all its doctors together, which is helpful when several doctors share one office. Account-number columns may be moved forward for easier verification.

In Doctor AR Setup, configure the appropriate group price list and shipping service for the new account(s). The trainer demonstrates selecting the principal and doctor entries separately; do not assume updating one covers every record.

From the principal, use the bill-to account setting and Link, identify the doctor, Add to list, Process, confirm, and exit. Verify the final linkage in General.

Create the portal only for the principal account in this structure. If an already-open portal window does not load correctly, close and reopen it; do not create a second account because the first window was stale.

## Triage requests that are not ready for normal entry

Source timestamp 01:13:13

A case arriving from customer service with no account or incomplete account information may require investigation rather than immediate ordinary entry. The trainer asks staff to mark such work For John so he can review it.

An email asking about reduction copings or pricing is not necessarily account-entry work. Route it for an office call or lead review as directed instead of creating a new account just to clear the inbox.

An Open Implants form may contain only a doctor name and email, without enough information to create the milling-center account. Mark it for the designated lead rather than inventing missing fields.

A Typeform preference submission can arrive before the office is in ABS. Keep it in a separate pending folder and check weekly for the completed account, then add the supplied information to Case Preferences. Do not discard preferences or attach them to a different doctor with a similar name.

## Incisive structure and fields

Source timestamp 01:14:56

The Incisive example is entered like an individual private doctor account, then linked to the existing Incisive principal in AR. It does not require creating a new office principal and doctor subaccounts as in MB2.

Create requested OC and LA records when the request asks for both. Enter the real doctor/practice/address information, including any middle initial and verified city. The supplied mailing address is confirmed as the physical address for this particular example.

For Incisive, no email-notification boxes are selected in the demonstrated setup. Select the Incisive classification and the market segment spoken as GPO in Custom 2. The trainer also mentions a packing-list setting, but its exact screen label/state is not fully narrated and must be checked visually.

Use the Incisive Purchasing manager record for the relevant location as shown. The MB2 back-office-director field does not apply.

The account-number prefix is corrected later in the exercise: the OC Incisive account begins OCIN rather than just OC. The trainer says this IN marker is for Incisive specifically. Follow the proper LA equivalent only after confirming the visible approved format; it is not spelled out as fully in the transcript.

## Incisive pricing linking and no new portal

Source timestamp 01:25:14

Although the request mentions Standard/Essentials pricing, the trainer identifies a dedicated Incisive Dental price-list entry in ABS and selects it. Do not independently add products to an unrelated pricing section; use the approved account-level list and confirm current mappings when request wording differs.

Find the existing Incisive principal in Doctor AR Setup and link the doctor account to it. Verify the linked relationship under General. The corporate email is already associated with the main account in this example and does not need to be copied into every doctor record.

The trainer explicitly says not to create an Incisive portal: Incisive is moving to its own portal. At approximately 01:42:33 and again 01:46:02, he clarifies that old request templates may still ask for portal login information, but staff are no longer creating that portal.

Reply to the requester that the account was created and provide the relevant OC/LA account identifiers through the approved business channel. Do not send an irrelevant portal-login template or include the account-entry mailbox itself as an accidental reply recipient.

## OC and LA AR must be handled separately

Source timestamp 01:28:27

The trainer explains that account profiles can be created while viewing either location, but AR work is location-specific. OC accounts do not appear in LA AR; switch to the appropriate active location for pricing and linking.

The exercise uses two ABS instances, one for OC and one for LA, to copy verified details more easily. The trainer cautions that this depends on available licenses and permission. It is an optional convenience, not a requirement or a workaround for licensing limits.

LA may automatically check email-notification options. Clear unintended selections; for the Incisive example, leave the notification options unselected as instructed. Check the location field and manager selection rather than carrying over OC choices automatically.

## Fix inherited Aspen defaults and missing access

Source timestamp 01:49:24

Lola adds multi-location and AR permissions for the trainee during the call. Sign out and back in if the new permissions do not appear. Shared Outlook mailbox access is a separate prerequisite and still needs the appropriate administrator.

At approximately 01:59:23, the team investigates the unwanted Aspen DSO default. It appears to inherit from the selected Aspen record/filter. Lola creates/selects a neutral test account/filter and demonstrates that Add new no longer inherits Aspen.

The exact arrow/filter selection is screen-dependent and is not fully identified by the captions. The reliable check is to inspect the new profile’s actual DSO value and clear or correct unintended affiliation. Do not recreate production accounts or manipulate undocumented filters based solely on this transcript.

## Private practice AR and HubSpot completion

Source timestamp 02:03:30

For the ordinary private-office example, populate DR and the doctor’s names, the actual practice name, the correct OC account number, street/suite, ZIP, phone, email, and the proper notification options.

Use Private Practice market segment and the new-customer key-account classification. An ordinary private practice in this example has no strategic account executive or account manager assigned. Set only the correct location and FedEx Second Day, then save.

In AR > Doctor AR Setup, search by the exact last name or account number. If missing, reopen the window and check spelling. The exercise finds that a misspelled last name, not a nonexistent account, caused the failed search.

Choose Signature 2 unless another approved price list is specified, choose FedEx Second Day, and save. Then create the individual portal login with the primary email as username and choose No for the automatic ABS notification.

HubSpot may already contain the email from the submitted form. Add the ABS account number and lab code to the existing contact. If editing is disabled, have the lead obtain the correct permission.

## Portal timing templates and waiting states

Source timestamp 02:15:58

John prepares HubSpot immediately after ABS login creation but waits to send customer information; Lola prefers waiting for ingestion first. The discussion treats the difference as staff preference, not an error in the account data.

For the portal email template, open the contact’s Email composer, Templates, and choose Finance in the owner filter to reveal the SKDLA Portal template in the demonstrated setup. A template hidden by an owner filter is different from missing edit permission.

The portal can take up to two hours to work. Both trainers prefer the next day for testing and credential delivery, because customers often click as soon as they receive the email even if asked to wait.

Keep requests needing credential delivery in a clear waiting folder/state. Test that the portal works before sending the approved message, then mark the notification step complete. The exact waiting-folder name in the transcript varies, so use the team’s agreed tracking convention.

## TRRI configuration and unresolved outgoing access

Source timestamp 02:23:43

TRRI is entered structurally like an individual private-practice account, without linking the doctor to a newly created corporate principal in this example. After debate, the trainers inspect existing TRRI records and confirm DSO as the market segment, despite the private-practice-style structure.

For the California TRRI example, verify that sales tax is present; the team corrects a missing tax using Change Taxes. Put Suite before a suite number rather than leaving an unlabeled number on the second address line.

Shantel is identified as the TRRI contact and Strategic Account Executive in this historical session. Select the SKDLA TRI/TRRI key-account and price-list entries as demonstrated. Caption spelling varies, so verify the actual ABS labels. The account manager field is left blank in this example.

The team later remembers to append the TRRI identification tag after the account/practice names, similar to the MB2 tagging concept. Exact spelling and punctuation require confirmation because the captions also transcribe it as TRI/CRI.

The trainer says TRRI credential communication must come from the TRRI mailbox, not ordinary HubSpot. Trainees do not yet have that mailbox, so the communication is left with John while Allison is asked to decide the access/process. Do not send through the wrong brand just to complete the task.

There is brief uncertainty over whether TRRI still needs portal credentials; the final spoken direction is that the credentials are still created, but notification is sent by the different TRRI route. Verify current TRRI policy before production use.

## Private office with multiple doctor accounts

Source timestamp 02:38:03

A customer-service request reports work for a doctor without the expected account. Search by address and broaden the address search when a full name/string gives no result. Inspect the existing doctor(s) at that same practice before creating new records.

In this example, an office-level principal is needed for two doctors, including one already in ABS. Create the practice principal using the office name in Last name and Practice name, but do not add an MB2 tag because this is a private practice.

The principal receives statements and approved confirmation notification, not invoices. Doctor subaccounts receive invoice notification only. Apply Private Practice classifications and correct location/courier.

Before selecting a price list for the new office and doctor, inspect the existing doctor’s actual AR fee schedule. The trainers find Signature 2 and use that for the related records. Do not overwrite pricing with an assumed generic default without checking the linked office’s arrangement.

Create the additional doctor subaccount with the practice name, proper prefix, address, phone, and communication email. The same communication email is allowed in this specific example because that subaccount is not being given its own portal; this is not a rule that one login email can be reused across independent portals.

## Link both doctors and notify customer service

Source timestamp 02:57:02

Search by Practice name in Doctor AR Setup to view the existing doctor, the newly added doctor, and the new practice principal together. Apply and verify each new record’s price list and FedEx Second Day service.

On the practice principal’s General tab, select Account is a bill-to account and confirm. Choose Link, add both doctor records to the list, Process, confirm, and exit. Verify the principal contains the correct doctors, including the existing account.

Return to Maintenance > Doctors for the principal, choose Change Status, clear Allow Case Entry, and save. This prevents case entry under the billing principal; the doctor records remain the case-entry accounts.

Finally reply to the customer-service request that the account has been created so they can proceed with the case. The trainer corrects a question about ABS notes: the requested completion notification is a reply to the source email, not simply a note placed somewhere in ABS.

## Completion checklist

- [ ] Verify mailbox, ABS, location-switch, AR, and HubSpot edit access before taking ownership of full account entry.
- [ ] Identify the actual group, structure, requested locations, and precise email assignments from the request; search for duplicates first.
- [ ] Use the corrected final email settings: MB2 principal statements/accounts payable, doctor subaccount correct doctor email with invoices only.
- [ ] Set the current approved classifications and group price list; inspect existing related-doctor pricing before restructuring a private practice.
- [ ] Check account-number prefixes, name spelling, location membership, courier, and inherited Aspen values.
- [ ] Make office principals bill-to accounts, link the correct doctors, and disable principal case entry.
- [ ] Keep OC and LA AR work separate; do not assume a visible cross-location profile means AR is shared.
- [ ] Incisive: individual account linked to the existing Incisive principal, dedicated pricing, no new portal per this recording.
- [ ] TRRI: preserve its DSO classification and dedicated outgoing communication route; escalate missing mailbox access and uncertain labels.
- [ ] Prepare/test portal and HubSpot where applicable, hold credential delivery until working, and visibly track pending delivery.
- [ ] Categorize/move completed requests, route incomplete or unusual work to the lead, and reply to customer service when new accounts unlock case processing.

## Limits and points to confirm

- The shared temporary portal credentials spoken in related training are intentionally excluded; use the organization’s current approved credential process.
- The early general statement that MB2 always needs both locations is narrowed by the actual OC-only example; confirm requested scope from the form.
- The initial MB2 doctor email/notification selection is an error corrected at 01:09:39 to 01:10:59; follow the corrected state.
- Staff/manager assignments differ from earlier recordings. Treat names as historical role examples and confirm the current assignment list.
- Incisive portal instructions explicitly changed: this session says not to create new portals even if an old request template asks for one.
- TRRI naming and ABS labels are inconsistently transcribed as TRRI, TRI, or CRI. The exact suffix, key-account label, and price-list text need visual/current-policy confirmation.
- TRRI outgoing credential mailbox access and the final delivery owner were unresolved and referred to Allison.
- A packing-list setting for Incisive and a neutral-filter workaround for inherited Aspen are screen-dependent and cannot be fully reproduced from captions.
- Tax rates, current group mappings, and present-day access controls were not independently verified. This manual describes the training process, not tax/legal advice.
- The recording contains long screen-only practice stretches. Notes preserve narrated steps and corrections, but do not claim to verify unspoken clicks or video-only information.

