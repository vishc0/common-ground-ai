# Common Ground AI — Functional MVP Delivery Plan

## Outcome

Ship an invitation-only, low-risk pilot where a participant can accept the notice, create a pseudonymous session, provide optional coarse context, ask a question, receive a screened three-tier answer, review AI-proposed tags, find the question in Explore, react or comment safely, and inspect its initial Tree placement.

The MVP is not a training-data marketplace. Dataset export remains disabled. The system records separate consent capabilities now so an informed opt-in can be designed and reviewed later.

## Architecture decision

Use one Cloudflare Worker containing internal modules, one D1 database, one Queue, Workers AI, Turnstile, and static assets. This is the smallest architecture that provides durable data, asynchronous AI work, abuse protection, and clean future extraction boundaries.

```text
Browser
  │ HTTPS + HttpOnly session
  ▼
Cloudflare Worker
  ├── session + invitation module
  ├── safety and privacy gateway
  ├── questions / answers / feedback API
  ├── search and tags module
  ├── Tree projection module
  ├── D1 repositories
  └── transactional outbox ──► Queue consumer ──► AI provider
                                      │
                                      └── moderation → answer → tags → publish
```

## Component contracts

### 1. Session and invitation

- `POST /v1/sessions` accepts an invitation code and Turnstile token.
- Store only a salted invitation-code hash; never store the original code.
- Return a random session in a `Secure`, `HttpOnly`, `SameSite=Lax` cookie.
- Rotate the session on reset; do not fingerprint the device.
- Rate-limit session creation and every write operation.

### 2. Profiles and consent

- `PUT /v1/profile` accepts only fields from the versioned demographic schema.
- Keep profile records private and separate from public questions.
- Store accepted notice version independently from any future research or training consent.
- `DELETE /v1/me` deletes or tombstones participant-owned pilot data according to the published retention rule.
- Training consent defaults to `none`; no MVP route exports training data.

### 3. Questions and AI jobs

- `POST /v1/questions` validates length, intent acknowledgement, maximum five controlled tag IDs, Turnstile, rate limits and an idempotency key.
- Normalize input and run deterministic PII/abuse screening before persistence.
- Reject clearly disallowed content without storing the raw text; retain only a privacy-safe event code and content hash for abuse controls.
- Store acceptable content as `pending`; it is never searchable until asynchronous model moderation succeeds.
- Write the question and outbox job in one D1 transaction.
- Queue consumer performs model moderation, generates the structured answer, validates the response schema, proposes controlled tags, then publishes atomically.
- Fail safely as `needs_review` or `generation_failed`; never publish an unvalidated model response.

### 4. Explore, threads and Tree

- `GET /v1/questions?query=&tags=&cursor=` returns only published records using cursor pagination.
- `GET /v1/questions/:id` returns the public answer, assumptions, sources, tags and aggregate reactions.
- `POST /v1/questions/:id/reactions` and `/comments` repeat the safety, Turnstile, rate-limit and idempotency controls.
- Tree MVP uses stored, reviewable edges between controlled tags, clusters and questions. It does not need a graph database.
- Each edge records proposer, method, confidence, status and policy version.

## Minimum database groups

1. Private: `participants`, `sessions`, `profile_facets`, `notice_acceptances`, `dataset_consents`.
2. Public workflow: `questions`, `answers`, `tags`, `question_tags`, `comments`, `reactions`, `follows`.
3. Knowledge map: `graph_nodes`, `graph_edges`.
4. Safety and operations: `moderation_events`, `idempotency_keys`, `rate_limit_buckets`, `outbox_jobs`, `audit_events`.

Public API queries must never join profile facets directly into public responses. Cohort analysis runs through minimum-group thresholds and aggregate views later.

## Four delivery milestones

### Milestone 1 — Durable local vertical slice

- Add Worker project, D1 migration, runtime configuration and local scripts.
- Implement health, session, profile, question creation and question retrieval.
- Use a deterministic mock AI provider.
- Add contract tests for five-tag limit, PII rejection, unsafe intent, idempotency, private/public separation and deletion.

Exit: one local command starts the app; a clean database can complete Ask → answer → Explore.

### Milestone 2 — Asynchronous staging

- Create separate staging D1 and Queue resources.
- Add transactional outbox dispatch and queue consumer.
- Connect Workers AI through the provider interface with strict timeouts, schema validation, retry ceiling and daily budget cutoff.
- Add Turnstile test keys locally and real staging keys server-side.
- Enable privacy-safe structured logs and quota counters.

Exit: staging survives AI failure without losing questions or exposing partial answers.

### Milestone 3 — Safety-complete closed pilot

- Add invitation management, moderation states, reports, appeals and operator review.
- Add comments/reactions/follows and searchable controlled tags.
- Complete deletion, retention, backup/restore and incident runbooks.
- Run multilingual and cohort-focused false-positive tests.

Exit: every write is authenticated pseudonymously, screened, rate-limited, auditable and reversible where promised.

### Milestone 4 — Pilot launch and evidence

- Invite 50–100 people into one or two low-risk topic areas.
- Cap each participant at three questions per day.
- Measure useful-answer rate, safety failures, moderation burden, latency, cost per useful answer and cohort parity.
- Hold dataset export and semantic search until the pilot review passes.

Exit: documented evidence supports proceeding, changing scope, or stopping.

## Deployment sequence

1. Authenticate Wrangler to the project Cloudflare account.
2. Create `common-ground-staging` D1, queue and Turnstile widget.
3. Insert returned resource IDs into staging bindings; store secrets with Wrangler, never Git.
4. Apply migrations locally, run tests, then apply them to staging.
5. Deploy the Worker and verify `/healthz` plus database and queue diagnostics.
6. Configure the web app API origin and Turnstile site key.
7. Run the full safety and recovery checklist with synthetic data.
8. Create independent pilot resources only after staging passes.
9. Apply pilot migrations, deploy the same immutable commit, seed controlled tags and invitation hashes.
10. Keep the existing Sites URL as the non-production prototype until the functional pilot replaces it deliberately.

## Launch gates

- No raw question text, profile values, secrets or IP addresses in application logs.
- Unsafe and uncertain content is not publicly readable.
- Training consent is off and dataset export is unavailable.
- Server-side Turnstile validation is enabled; client-only validation is rejected.
- All write endpoints enforce idempotency and rate limits.
- Restore test and participant deletion test both pass.
- AI outage leaves reading/search operational and pending jobs recoverable.
- Accessibility, mobile layout and keyboard flows pass.
- One named operator owns incident response during the pilot.

## First implementation sprint

1. Repository layout and Wrangler configuration.
2. D1 schema and migration tests.
3. Session/invitation endpoints.
4. Server-side validation and moderation gateway.
5. Question/outbox transaction and mock queue consumer.
6. Frontend API adapter with mock/local fallback removed in staging.
7. Contract and end-to-end tests.
8. Staging resource creation and deployment.

The first sprint should end with a working vertical slice, not every planned table or screen.
