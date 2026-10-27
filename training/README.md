# SKDLA Training Library

A separate training website based on 13 supplied caption files (11 unique transcripts), with 150 source sections. It does not establish current policy.

## Hosted AI connection

The website uses Groq Qwen3.8 27B with structured source-cited answers. Each visitor enters their own API key in the connection box. The key is checked against Groq, cleared from the input immediately, retained only in page memory, and sent only to https://api.groq.com for authentication. It is never bundled, committed, logged, or stored in browser storage. Closing/navigating away clears the page's key. Do not put a shared secret in this public repository.

Use a free Groq account without enabling billing. Groq quotas and model access apply; the website cannot certify the visitor's billing plan. Questions on the website do not use ChatGPT or Work credits. Groq's current free limits and privacy terms are available in its console. This integration requires the visitor's account/key; without one, notes and source search work normally.

Asking sends the question, optional scenario details, and up to six full relevant sanitized note sections to Groq. Do not enter patient identifiers or other private information. No raw captions are sent. Questions and keys are not saved by this website; Groq's own data terms apply. No automatic model substitution or paid upgrade occurs on a quota or access error. Qwen3.8 is a provider preview model; availability may change. The website falls back to source excerpts if the model is unavailable.

Answers use a strict JSON schema, valid source IDs, exact supporting quotes, and an optional clarification. Each quote is checked against the supplied evidence before displaying the answer. Reference validation is not a guarantee of semantic accuracy. The assistant is instructed to retain conditions, explain conflicts, preserve definitions exactly, and avoid treating historical recordings as current policy. The full notes remain accessible under each recording label.

## Why local AI was replaced

Device testing found the 3B browser model too slow and the 1.5B model returned an incorrect acronym expansion despite a matching quote. The public interface therefore uses the stronger hosted option, with source search available independently. The weak local generation option was removed.

## Evidence and editing

- Every section has a recording label, timestamp, and context link.
- Timestamp links request a position in Drive; seek manually to the displayed time if the player ignores it.
- Day 2 and Day 5 caption files are identical; Day 8 and Week 2 Account Entry with Lola (1) caption files are identical. This does not establish that their videos are identical.
- The ABS/NCE filename says 1:06:44, but its captions extend to 2:02:37.880.
- Raw captions contain private identifiers and spoken credentials and must never be published. Only sanitized notes are included.
- `data.js` contains reviewed notes; `search.js` retrieves sections; `answer-core.js` packs evidence and verifies quotes; `cloud-ai.js` handles the fixed Groq endpoint; `app.js` handles the interface.

## Verification limits

Dataset provenance, retrieval, citation/quote checks, navigation, failure handling, and credential non-persistence were checked locally. A real hosted model answer must be tested after the user connects their Groq account; no key is included in this project. AI drafts still need review against the recording evidence and current approved instructions.
