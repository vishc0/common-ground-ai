# MVP Deployment Decision — October 2026

## Decision

Use a Cloudflare-first stack for the functional MVP, while keeping application interfaces provider-neutral.

| Need | MVP service | Reason |
|---|---|---|
| Web/PWA and API | Cloudflare Workers/static assets | One global runtime; Free plan currently includes 100,000 requests/day. |
| Relational data | Cloudflare D1 | Simple SQL for questions, answers, demographics, tags, reactions, follows, moderation, and graph edges. |
| Background work | Cloudflare Queues | Asynchronous answer generation, moderation, tag suggestions, and graph linking. |
| AI inference | Workers AI behind our own `AIProvider` interface | Free allocation for pilot use; swap models/providers without changing domain logic. |
| Bot defense | Cloudflare Turnstile | Free challenges; apply to posting, reacting, and account-sensitive actions. |
| Semantic search | Defer; then Cloudflare Vectorize | Keyword/tag search first. Add embeddings only after enough real questions exist. |
| Object storage | Defer; then R2 | No uploads in the first pilot. Use later for exports, evidence files, and public datasets. |
| Observability | Structured Worker logs plus privacy-safe counters | Do not log raw question text by default. |

The current static prototype can remain on its existing Site URL while the public GitHub repository becomes the canonical source. The first functional backend can be a separate Worker API, then the frontend can move to the same deployment when stable.

## Why this stack

It minimizes providers, credentials, network hops, and operational surfaces. Current free allocations are enough for a closed pilot:

- Workers: 100,000 requests/day on Free, with 10 ms CPU per invocation.
- D1: 5 million rows read and 100,000 rows written/day on Free; limits fail closed when exceeded.
- Queues: 10,000 operations/day with 24-hour message retention; normal delivery commonly consumes three operations.
- Workers AI: 10,000 neurons/day free; excess requests fail unless a paid plan is enabled.
- Vectorize: 30 million queried vector dimensions/month and 5 million stored vector dimensions on Free.
- R2: 10 GB-month storage, 1 million Class A, and 10 million Class B operations/month free for Standard storage.
- Turnstile: free plan with unlimited challenges and up to 20 widgets.

These are provider limits as of October 2026 and must be rechecked before launch. Sources: [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/), [Queues pricing](https://developers.cloudflare.com/queues/platform/pricing/), [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/), [Vectorize pricing](https://developers.cloudflare.com/vectorize/platform/pricing/), [R2 pricing](https://developers.cloudflare.com/r2/pricing/), and [Turnstile plans](https://developers.cloudflare.com/turnstile/plans/).

## Alternative considered

Cloudflare frontend/API plus Supabase Postgres/Auth is a strong alternative when SQL tooling and built-in authentication matter more than minimizing providers. Supabase Free currently includes 500 MB database storage, 50,000 monthly active users, 1 GB file storage, and 5 GB egress, but inactive free projects may pause after about one week. Sources: [Supabase pricing](https://supabase.com/pricing) and [project pausing](https://supabase.com/docs/guides/platform/free-project-pausing).

Do not use Hugging Face free inference as the primary production dependency. The free-user monthly credit is currently only $0.10 and is explicitly subject to change. It remains useful for experiments and provider compatibility testing. Source: [Hugging Face pricing](https://huggingface.co/docs/inference-providers/main/pricing).

## Functional MVP topology

```text
Browser PWA
  ├─ terms + schema-driven demographics
  ├─ server-issued pseudonymous session cookie
  └─ HTTPS JSON API
       └─ Worker modular monolith
            ├─ synchronous: validate, redact, classify, store
            ├─ D1: users/profile facets/questions/tags/answers/reactions/edges
            ├─ Queue: answer, safety review, tag suggestion, graph proposal
            ├─ Workers AI through AIProvider adapter
            └─ scheduled cleanup: retention, deletion, aggregates
```

The browser-generated UID is prototype-only. The functional pilot replaces it with an opaque, server-issued session in a `Secure`, `HttpOnly`, `SameSite=Lax` cookie. It is not identity proof and must not be derived from profile values or device fingerprinting.

## Request lifecycle

1. Client submits its server session, profile schema version, coarse profile, question, intent confirmation, and reviewed tag suggestions.
2. API enforces size limits, five-tag maximum, rate limit, Turnstile, and idempotency key.
3. Deterministic PII and abuse checks run before persistence. Suspected content is rejected or quarantined—not merely logged.
4. Safe question record is stored with a transactional outbox event.
5. Queue worker performs model moderation, generates the three-tier answer, attaches public rationale/sources, and stores provider/model/policy versions.
6. Client polls or receives the completed answer. Reading remains available if AI is down.
7. Agree/disagree/pass, reason, follow, and favorite are separate idempotent events.
8. A later worker proposes tags and graph edges; human/community review can accept or challenge them.

## MVP deployable components

| Component | Deployable | Responsibility | MVP scaling boundary |
|---|---|---|---|
| Web app | Static assets served by the Worker | Consent, context, Ask, Explore, thread and Tree UI | Edge-cached assets |
| API | Same Worker, `/v1/*` routes | Sessions, validation, reads, writes, authorization and response contracts | Stateless Worker instances |
| Job consumer | Queue consumer exported by the same Worker | Model moderation, answer generation and tag proposal | Queue concurrency |
| Database | One D1 database per environment | Private profiles, public content, consent receipts, jobs and audit events | Indexed relational access |
| AI adapter | Workers AI binding | Moderation and structured answer generation | Daily neuron budget and circuit breaker |
| Abuse defense | Turnstile + application rate limits | Protect session creation and writes | Per-session, per-IP hash and global limits |
| Operations | Workers Logs + D1 metrics | Privacy-safe failures, latency, quota and safety counters | Sampled logs; never raw questions |

Do not split these into separately deployed services for the pilot. Keep module interfaces inside the Worker so a measured bottleneck can be extracted later.

## Environments and promotion

| Environment | Data | Audience | Deployment rule |
|---|---|---|---|
| Local | Local D1 and mock AI | Developers | Migrations and contract tests must pass |
| Staging | Separate D1, queue and AI budget | Invited testers | Deploy from `main`; synthetic data may be reset |
| Pilot | Separate D1 and secrets | 50–100 invited participants | Promote an immutable tested commit; migrations first |

Never point staging at pilot data. Bindings are non-inheritable across Wrangler environments, so every database, queue, AI binding, variable and secret must be declared or verified per environment.

## Zero-cost pilot guardrails

- Invitation codes and one or two low-risk topics.
- 50–100 participants, maximum 3 questions/person/day.
- Maximum question length 1,000 characters; no file uploads.
- One answer generation attempt plus one controlled retry.
- Daily global AI budget below the provider limit; stop generation before exhaustion.
- Cache equivalent public questions and reuse approved answer summaries.
- Defer embeddings; use D1 full-text/normalized keyword and tag search.
- Queue only work that can finish within the free 24-hour retention window.
- Export encrypted backups on a documented schedule; free D1 is not a complete resilience strategy.

## Portability boundaries

Define interfaces before infrastructure code:

- `QuestionRepository`
- `ProfileRepository`
- `SearchIndex`
- `GraphRepository`
- `AIProvider`
- `ModerationProvider`
- `JobQueue`
- `ObjectStore`

Domain objects and migrations remain free of provider SDK types. Events use versioned JSON schemas. This lets D1 move to PostgreSQL, Workers AI move to another inference provider, and Queues move to a broker without rewriting product rules.

## Upgrade triggers

Upgrade because of measured pressure, not forecasts:

- Paid Workers: sustained quota exhaustion or need for longer CPU tasks.
- Managed PostgreSQL: analytics/joins, write concurrency, regional/data-residency needs, or operational tooling exceed D1.
- Dedicated search/vector system: relevance testing proves keyword/tag search inadequate and corpus size justifies it.
- Separate services: one module needs independent scaling, security isolation, release cadence, or ownership.
- Multi-region write architecture: only after a real availability or residency requirement.

## Build sequence

1. Add Worker API and D1 migrations to this repository.
2. Implement terms/consent, profile schema versioning, UID, and delete/reset controls.
3. Implement question submission with five-tag enforcement and quarantine.
4. Add mock `AIProvider`; test the three-tier response contract before connecting inference.
5. Add Workers AI adapter, hard quotas, timeout, retry, and circuit breaker.
6. Add reactions, follows, favorites, and question history.
7. Add moderation console and appeals before public posting.
8. Add tag/keyword exploration.
9. Run a closed pilot; evaluate safety, usefulness, cost, and retention.
10. Add semantic links and Tree of Life graph suggestions only after the pilot dataset is adequate.
