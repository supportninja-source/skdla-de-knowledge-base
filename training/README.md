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

## Validation

Checked the full dataset, exact source wording in composed answers, FOCUS definition, urgent escalation, technical notification, account entry, unsupported queries, syntax, and browser answer/citation rendering. Meaning-based model loading is checked in the browser; source matching remains available on failure. No Groq key, account change, billing, or installed AI server is needed.
