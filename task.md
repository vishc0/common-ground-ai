# Common Ground AI — MVP Task Tracker

Last updated: 2026-10-14

## Current objective

Launch a safe, invitation-only MVP for 50–100 participants in one or two low-risk topic areas. The MVP must support pseudonymous sessions, optional coarse context, screened questions, structured AI answers, reviewed tags, Explore, reactions/comments, and the initial Tree of Life.

## Your immediate tasks

- [ ] Choose the first one or two low-risk pilot topics.
  - Suggested starting pair: household cost reduction and community resource coordination.
  - Explicitly exclude medical diagnosis, legal advice, financial trading, elections, self-harm, weapons, and emergencies from the first pilot.
- [x] Create or select the Cloudflare account that will own production resources.
- [ ] Decide who besides you, if anyone, needs Cloudflare administrator access.
- [ ] Choose a working MVP domain or confirm that a Cloudflare-provided staging URL is acceptable initially.
- [ ] Approve the plain-language shared-learning and safety guidelines before real participants are invited.
- [ ] Decide the initial invitation group and identify one person responsible for participant support and safety incidents.
- [ ] Decide whether pilot questions may remain publicly readable after a participant deletes their profile, or must also be removed.
- [ ] Review the future dataset principle: participation is not training consent; any dataset contribution requires a separate opt-in.
- [ ] Set an initial monthly spending ceiling. Recommended MVP ceiling: $0 by default, with no automatic paid overages.

### Credential setup completed

- [x] Create the GitHub Environment named `Prod`.
- [x] Store `CLOUDFLARE_API_TOKEN` in the `Prod` Environment secrets.
- [x] Store `CLOUDFLARE_ACCOUNT_ID` in the `Prod` Environment secrets.
- [x] Correct `CLOUDFLARE_ACCOUNT_ID`: store only the Cloudflare Account ID (normally 32 hexadecimal characters), without a URL, label, spaces, or quotes.
- [x] Create the production D1 database and store its ID in `Prod` as `CLOUDFLARE_D1_DATABASE_ID`.
- [ ] Add Account → Queues → Edit to the existing Cloudflare API token; the first queue request failed with API code 10013.
- [x] Configure the deployment workflow with `environment: Prod`; environment secrets are unavailable to jobs that omit this declaration.
- [ ] Add required-reviewer or branch protection rules to the `Prod` Environment before automatic production deployment.
- [ ] Re-run the bootstrap workflow to verify the corrected credentials without printing secret values.

## Implementation tasks

### P0 — Local functional vertical slice

- [x] Add Cloudflare Worker and Wrangler configuration.
- [x] Create the initial D1 schema and migrations.
- [ ] Implement invitation-code verification and server-issued pseudonymous sessions.
- [ ] Implement profile storage using the versioned demographic schema.
- [x] Implement the initial server-side privacy and safety gateway.
- [x] Implement question creation with five-tag enforcement and idempotency.
- [x] Implement the D1 transactional outbox.
- [x] Add the AI provider boundary and validate the three-tier response schema.
- [ ] Make locally created questions available through the API and Explore.
- [ ] Add participant reset/deletion endpoints.
- [ ] Add contract tests for privacy, authorization, moderation, tag limits, idempotency, and deletion.

### P1 — Staging deployment

- [x] Authenticate Wrangler to the selected Cloudflare account.
- [ ] Create a staging D1 database.
- [ ] Create a staging Queue and consumer.
- [ ] Create a Turnstile widget and store its secret outside Git.
- [ ] Configure Workers AI and a hard daily inference budget.
- [ ] Deploy the staging Worker and static assets.
- [ ] Apply migrations to staging.
- [ ] Connect the frontend to the staging API.
- [ ] Enable privacy-safe logs and quota alerts.
- [ ] Run Ask → moderation → answer → Explore → thread end-to-end tests.
- [ ] Test AI failure, queue retry, duplicate submission, quota exhaustion, and recovery.

### P2 — Closed-pilot safety completion

- [ ] Add reactions, comments, follows, favorites, and reporting.
- [ ] Add moderation states and a small operator review screen.
- [ ] Add an appeal path for incorrectly rejected content.
- [ ] Add search pagination and controlled tag management on the backend.
- [ ] Add reviewable Tree edges without introducing a graph database.
- [ ] Document retention, deletion, incident response, backup, and restoration.
- [ ] Test mobile, keyboard navigation, screen-reader labels, and slow connections.
- [ ] Test moderation false positives across supported languages and communities.
- [ ] Complete an independent privacy/security review before inviting participants.

### P3 — Pilot launch and evaluation

- [ ] Create 50–100 single-use invitation codes.
- [ ] Seed the approved topic taxonomy and sample questions.
- [ ] Publish participant help, privacy, safety, and reporting pages.
- [ ] Invite participants gradually in small batches.
- [ ] Track useful-answer rate, time to answer, safety failures, appeals, moderation work, cost per answer, and cohort parity.
- [ ] Hold a weekly pilot review and record product decisions.
- [ ] Keep semantic search and dataset export disabled until the pilot review passes.
- [ ] Produce a go/change/stop decision after the pilot.

## Funding and organizational tasks

- [ ] Choose the project’s legal home before accepting material funds.
- [ ] Select an open-source license and contribution terms.
- [ ] Open a project bank account or fiscal-sponsor arrangement before launching fundraising.
- [ ] Finalize the GoFundMe narrative and itemized first-use budget.
- [ ] Prepare a one-page funder brief and lightweight pitch deck.
- [ ] Shortlist grants by shared interest rather than forcing the project into one cause.
- [ ] Document sponsor independence: funders cannot control ranking, moderation outcomes, or dataset access.
- [ ] Maintain the funding data-room checklist.

## Explicitly deferred

- [ ] Public AI-training dataset exports.
- [ ] Semantic/vector search.
- [ ] Public leaderboards.
- [ ] File uploads and evidence attachments.
- [ ] Mobile-native applications.
- [ ] Microservices or Kubernetes.
- [ ] Dedicated search or graph databases.
- [ ] Multi-region writes and federation.

## MVP launch gates

- [ ] Every write is pseudonymously authenticated, rate-limited, idempotent, and server-screened.
- [ ] Unsafe or uncertain material is not publicly discoverable.
- [ ] Raw questions, profile data, secrets, and IP addresses do not appear in application logs.
- [ ] Training consent defaults to off and no dataset export endpoint exists.
- [ ] Participant deletion and database restoration have both been tested.
- [ ] Reading and search continue when AI generation is unavailable.
- [ ] The pilot topic scope, exclusions, operator, and incident process are published.
- [ ] The deployed commit and database migration version are recorded.

## Next action

Correct the `CLOUDFLARE_ACCOUNT_ID` GitHub Environment secret, then re-run the one-time Cloudflare bootstrap workflow. Complete the pilot-topic decision while the remaining P0 work continues locally.
