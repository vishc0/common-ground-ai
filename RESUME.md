# Common Ground AI — resume here

Saved: 2026-10-15. Work stopped at the user's request to save status.

## Deployment

- Repository: https://github.com/vishc0/common-ground-ai
- Branch: `main`; Git remote is named `github`.
- Live app: https://common-ground-mvp.shivarama-aiagency.workers.dev/
- Latest deployed commit: `49ae3f7`.
- Deployment run: https://github.com/vishc0/common-ground-ai/actions/runs/38682364549 (successful).
- Worker version reported by deployment: `fa2bc57c-8e6f-41d3-b945-5e18647cf0f4`. Subsequent secret installation also creates Worker versions.
- D1: `common-ground`; migrations `0001_initial.sql` and `0002_comments.sql` applied.
- Queue: `common-ground-answers`; consumer attached.
- Cloudflare credentials are in GitHub Environment `Prod`. Never print or commit their values.
- Turnstile widget created by `turnstile.yml`; both widget credentials installed as Worker secrets. Public site key is served by `/v1/config`.

## Latest user decisions

- No invitation code: removed from frontend and session validation. Do not reintroduce it.
- AI generation: two attempts total, initial attempt plus one retry; second failure stops generation.
- Questions and comments need spell-check and harmful-content screening.
- Continue MVP work autonomously until user input is actually required.

## Implemented

- Ask now calls the session/question API and polls the saved answer status.
- Explore loads published questions with their saved AI answers; dictionary matching includes answer text and tags.
- Legacy browser-only questions are displayed as drafts without fabricated answers.
- Browser spell-check enabled on textareas.
- Comments use a D1 table and server screening before storage.
- Real Turnstile configured; safety-notice acceptance remains required.
- AI output schema and basic content screening before publication.
- Queue retries preserve pending status until the second failure.
- Anonymous static asset access fixed.
- Eight tests passed at last deployment; live script confirmed no invitation field or invitation payload.

## Next steps and known limitations

1. Verify the full real-browser flow: notice → optional context → Turnstile → question → generated answer → Explore → thread → comment. This has NOT been verified end to end. A person must complete any bot challenge.
2. Check real Workers AI output against the schema, and confirm failures and the single retry in production. Do not claim the live AI flow works solely from deployment success.
3. Refactor `dist/live.js` adapter and legacy `dist/app.js` into one coherent frontend. Legacy reactions/follows/favorites remain browser-local, sample/static code remains in app.js, and tag suggestions are keyword rules rather than AI.
4. Replace the current 200-row Explore fetch/client pagination with server dictionary search, tag filtering, and pagination.
5. Add write rate limits and an enforced daily inference budget before wider promotion; none currently implemented. Basic regex screening is not a complete NLP moderation system.
6. Complete transactional outbox dispatch/recovery: a queue-send error after the DB commit can leave a pending job undispatched.
7. Implement versioned demographic storage/validation and snapshot context for answers. Optional context currently stays in browser storage.
8. Fix deletion: current endpoint marks participant deleted but does not revoke sessions or remove contributions. Decide and document contribution deletion behavior.
9. Add durable reactions/follows/favorites/reporting, moderation review and appeals, then reviewable Tree connections. Tree remains illustrative.
10. Clean up stale deployment workflow invitation secrets and dead `processJob` implementation. Do not rotate or print session secrets.
11. Update storage/consent wording consistently across the UI. Some prototype wording remains.
12. Complete remaining `task.md` launch gates and owner decisions before inviting participants. No training export exists; participation is not training consent.

## Useful commands

```powershell
npm run check
node --check dist/live.js
git diff --check
git push github main
gh workflow run deploy-prod.yml --repo vishc0/common-ground-ai --ref main
```

Use `apply_patch` for edits. Do not modify synced project files under `sources/`.
