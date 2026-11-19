# Vocabulary dictionary lookup

The admin vocabulary form looks up the exact entered term (including spaces) through the Next.js server route at `/api/dictionary`.

## Providers

1. [Free Dictionary API](https://dictionaryapi.dev/) is queried first for English definitions, parts of speech, IPA, audio, examples, synonyms, and antonyms.
2. If it has no usable definitions or fails, the route queries the [Wiktionary REST API](https://en.wiktionary.org/api/rest_v1/). Wiktionary examples are HTML-stripped before display.
3. [Datamuse](https://www.datamuse.com/api/) is queried for related-word suggestions only; it is never used as a definition source. A Datamuse failure does not invalidate a result from either dictionary.

Each outbound request has a five-second timeout. Successful normalized results are cached in memory per Next.js server process for 30 minutes, with a 200-entry cap. The cache is intentionally not persistent and can be empty after a process restart.

## Data and saving

English definitions are retained alongside Vietnamese translations. Vietnamese text is machine-translated per sense when the free MyMemory endpoint is available, clearly labeled for review, and can be edited before saving. A translation-provider error leaves the English result available and the Vietnamese field editable. Every returned definition remains a separate sense, and examples are editable as one example per line. Missing IPA, audio, examples, synonyms, and antonyms are left empty rather than generated.

Single-word entries can be identified as `WORD`. The provider does not reliably distinguish types of multi-word expressions, so those are returned as `UNKNOWN` and the editor requires a manual choice from the supported phrase types. The chosen type, source URL, English definitions, examples, and sense relations are saved with the existing vocabulary item and senses.

Before a remote lookup, the editor checks the vocabulary sets already loaded from the admin database. If the term exists, the duplicate-resolution flow is shown instead of making external requests. Saving continues through the existing authenticated vocabulary API.

## Attribution and availability

The result panel links to the source entry and displays a license link when the Free Dictionary response provides one. Wiktionary content is linked back to its source page. Review the current [Wikimedia Terms of Use](https://foundation.wikimedia.org/wiki/Policy:Terms_of_Use) before redistributing copied content.

The providers are third-party services with no availability guarantee in this application. The Datamuse API documentation currently states that an API key will be required starting February 1, 2027; related-word suggestions may stop working after that date until the integration is updated. Dictionary lookup and saving continue when Datamuse is unavailable.
