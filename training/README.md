# SKDLA Training Library

A standalone static training website, using the existing SKDLA Data Entry website as a visual and navigation reference. The content comes from 13 supplied WebVTT caption files representing 11 unique transcripts. It does not replace current approved production guidance.

## Use

Open `index.html` for the recording notes and source search. Host the folder on HTTPS (including GitHub Pages) or localhost to enable the optional AI worker. No server, API key, or paid inference account is required. Download links provide a combined Markdown manual and individual session notes.

The optional AI downloads WebLLM 0.2.82 and Qwen2.5 0.5B model weights to the browser on first use. This may be a substantial download. It needs WebGPU; it selects a compatible float16 or float32 model variant. Device compatibility varies. Source search works without AI. Questions and selected note text are processed locally; no question is sent to a remote AI API. Public runtime/model downloads contact jsDelivr and model hosting services. Fonts load from Google Fonts.

## Evidence and authority

- Every procedure section has a recording label and source timestamp.
- A timestamp link requests that position in Drive; player support may vary. The exact timestamp is also displayed for manual navigation.
- The Day 2 and Day 5 caption files are byte-for-byte identical.
- The Day 8 and Week 2 Account Entry with Lola (1) caption files are byte-for-byte identical.
- Duplicate caption files do not by themselves prove duplicate underlying videos.
- The ABS Training and NCE filename says 1:06:44 but its captions run to 2:02:37.880.
- Raw captions contain private identifiers and spoken credentials. They must not be committed or published. Only sanitized training notes are included.
- No application, email address, password, patient name, case number, or account-specific live information is required by this website.

## Editing

`data.js` is the sanitized recording library. `search.js` supplies source retrieval; `app.js` handles navigation and questions; `ai-worker.js` loads the optional local model. `coverage.json` contains provenance, caption hashes, and coverage limits without the raw captions. Updating approved guidance requires a human content review. The local model selects paragraph numbers through constrained JSON. Displayed process wording is copied from the selected note paragraphs and cited. The model does not generate new procedures. Selection can still be imperfect, so the full source remains visible.

## Validation

Run the workspace validation script against the generated dataset before publication. Check search, duplicate coverage, section timestamps, source citations, responsive layout, download links, and AI failure handling. A successful source-search check does not certify local AI inference on every GPU.

The runtime is pinned to 0.2.82 after a generation failure reproduced with 0.2.85 during device testing. See the upstream regression report: https://github.com/mlc-ai/web-llm/issues/844. Revalidate model loading and a source-cited answer before upgrading.
