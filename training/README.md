# SKDLA Training Library — free process assistant

Public static website with notes from 13 labeled caption files, representing 11 unique transcripts and 150 source sections. Training recordings do not establish current policy.

## Same approach as the original knowledge base

The assistant uses lexical matching plus the same meaning-based search model as the original SKDLA website: Transformers.js 3.8.1 and quantized Xenova/all-MiniLM-L6-v2. The model runs in a background browser worker. It downloads on first use, embeds the 150 topic sections, and matches a question to relevant notes. Immediate lexical answers work while this loads or if browser/network support prevents loading.

A dedicated answer box is visible below the question area and updates automatically after typing pauses. Common process questions use reviewed, concise answer patterns for urgent cases, technical notifications, missing scans, private-practice accounts, HubSpot replies, Incisive portals, and FOCUS. These patterns pin their supporting recording sections and preserve conditions and exceptions. Other questions use matched note paragraphs. Both modes include source IDs, full-section links, recording labels, and timestamps underneath. The patterns summarize the notes; they do not establish current policy. This is a source-based process assistant, not a hosted generative chatbot or ChatGPT-equivalent reasoning model. Matching can still be imperfect; review context and current approved guidance. Different account workflows and historical instructions may conflict. Unknown questions are left unanswered rather than inventing a process.

No sign-in, API key, paid inference, provider question quota, local server, or always-on owner computer is required. Every visitor runs search in their own browser. No questions are sent to an AI provider or saved by the website. Public model/runtime downloads contact Hugging Face and jsDelivr; fonts load from Google Fonts. Browser capabilities, internet access, hosting bandwidth, and model-host availability still impose practical limits. There is no promise of unlimited hosting or uninterrupted operation.

## Sources and editing

- `data.js`: sanitized recording notes. Never add raw captions, credentials, or customer identifiers.
- `search.js`: lexical retrieval; `semantic-worker.js`: AI meaning-based matching.
- `process-assistant.js`: hybrid retrieval and source-paragraph answer composition; `process-answers.js`: reviewed answer patterns with required recording sources.
- `answer-core.js`: evidence packing and source/quote checks; `app.js`: navigation and question interface.
- Individual notes, combined notes, provenance hashes, duplicate notices, and timestamp links remain available.
- Drive player support for timestamp links varies; manually seek to the displayed time if necessary.
- Two caption pairs are identical: Day 2/Day 5 and Day 8/Week 2 Lola (1). This does not prove their underlying videos are identical.
- The ABS/NCE filename says 1:06:44, but captions extend to 2:02:37.880.

## Version 6 answer behavior

Documented procedures use accessible numbered lists with a recording citation for each step. Definitions stay concise. Additional scenario matches cover held-case photos, images without a live case, cancellation before entry, new uploads, duplicate tickets, missing night guards, late cases, carrier labels, warm transfers, and DSO definitions. General procedure answers preserve one source section's order and exceptions instead of mixing unrelated workflows. Semantic search only reranks lexical matches, and each displayed answer passes the source/quote validator. Matching remains fallible; this update does not add a hosted reasoning model or establish current policy.

The external DE knowledge-base navigation link has been removed from the training page.

## Validation

Run `node training/answer-tests.cjs` from the repository root for workflow, unsupported-query, source-validation, and ordered-fallback regression checks.

## Version 7: complete passage coverage and private captions

The original 13 VTT files were parsed in full and checked against the existing SHA-256 hashes, cue counts, word counts, and caption time ranges. The inventory covers 196,462 caption words, or 167,647 words across 11 unique transcripts; two caption pairs are identical. `caption-audit.json` records this file-integrity audit. It does not certify every summary statement or current policy.

Public search indexes every word of all 538 note passages in 150 sections. Semantic input uses 547 overlapping windows instead of truncating long sections or relying on one embedding per section. Public note vectors are cached by corpus hash. Search uses passage relevance, distinct carrier/account names, scenario qualification, separate answers for multiple questions, and separately cited related evidence and limits. Unsupported cancellation policies and ambiguous account levels ask for clarification. This remains an extractive assistant, not a general reasoning model.

For complete original wording, the page accepts the original VTT files or a private `skdla-private-captions-v1` JSON bundle. `caption-search.js` indexes all cues locally, preserves recording timestamps, and deduplicates identical transcripts. Imported raw captions and their vectors are kept in memory, never uploaded or written to the public repository. Clearing or reloading removes imported text. A separately supplied self-contained private HTML copy can embed all captions for local use; it is not deployed publicly. Caption excerpts are labeled as excerpts rather than converted into invented process steps. Spoken credentials and customer examples may exist in raw captions, so those sources remain private.

Run `node training/coverage-tests.cjs` for all-passage coverage, cross-recording questions, ambiguity, cancellation limits, and multiple-question checks. Pass a local private bundle path as the final argument to additionally check that every cue in all 13 original files is covered and that wording absent from notes can be retrieved. The private bundle is not part of this repository.

Checked the full dataset, exact source wording in composed answers, FOCUS definition, urgent escalation, technical notification, account entry, unsupported queries, syntax, and browser answer/citation rendering. Meaning-based model loading is checked in the browser; source matching remains available on failure. No Groq key, account change, billing, or installed AI server is needed.
