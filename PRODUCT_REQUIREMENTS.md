# Common Ground AI — Product Requirements and Evolution Architecture

## 1. Product definition

Common Ground AI is a free public problem-solving network. A participant supplies broad, non-identifying context, asks a question, receives a structured AI proposal, evaluates it, and may offer a disagreement or alternative. The system organizes those interactions into an explorable knowledge graph called the Tree of Life.

It is not a popularity forum and it does not collect or reveal private model chain-of-thought. It stores concise rationales, assumptions, citations, feedback, and outcomes suitable for public inspection.

## 2. Non-negotiable principles

1. Core participation remains free for individuals.
2. Collect the minimum context required; discourage and redact PII.
3. Popularity never substitutes for factual accuracy, safety, or rights.
4. Preserve minority and dissenting perspectives when expressed safely.
5. Explain ranking, moderation, automated classification, and uncertainty.
6. Obtain explicit consent before using contributions for model training or research.
7. Keep model, cloud, storage, and search providers replaceable.
8. Start as a modular monolith; split services only when measured load or team ownership requires it.

## 3. Module A — Ask and Answer

- Anonymous browsing and pseudonymous participation.
- Optional coarse profile: country/region, age band, role/life stage, language, and relevant domain experience.
- Never request exact address, birth date, legal identity, financial account, medical record, or employer identity for ordinary participation.
- Question composer: title, description, desired outcome, attempted actions, and up to five AI-ranked tags. The participant may remove or correct suggestions before submission.
- AI response: summary, recommended steps, assumptions, tradeoffs, uncertainty, sources, safety notes, and escalation path.
- Feedback: useful / partly useful / not useful, structured reason, optional alternative, and later outcome follow-up.
- High-risk topics receive constrained responses and qualified-resource routing.

## 4. Module B — Explore and Participate

- Case-insensitive dictionary search across question text and tag aliases in the MVP, with paginated results; add semantic search after sufficient evaluation data exists.
- Filter by up to five tags, coarse context relevance, recency, evidence level, and usefulness.
- Question page: leading answer, credible alternatives, agreement, unresolved disagreement, sources, version history, and related branches.
- Activities: evaluate, flag an assumption, submit evidence, propose an alternative, comment, follow, or report.
- Leaderboards reward constructive outcomes and calibration—not raw engagement or personal popularity.
- Ranking resists brigading, duplicate accounts, recency gaming, and coordinated voting.

## 5. Module C — Tree of Life

- Every question begins as an unconnected seed.
- Connections are proposed using shared tags, semantic similarity, causal relationships, and participant review.
- Nodes: questions, answer versions, alternatives, evidence, consensus summaries, unresolved tensions, and tested outcomes.
- Edge types: `related_to`, `prerequisite_of`, `contradicts`, `supports`, `derived_from`, `works_for`, and `fails_for`.
- Roots represent durable human needs; trunks are broad domains; branches are problem families; leaves are active questions; fruit is solutions with repeated positive outcomes.
- Users can inspect and challenge every proposed connection.
- Visualization loads only a visible neighborhood, never the entire graph at once.
- Disconnected seeds remain discoverable and valid.
- The MVP renders a two-dimensional, progressively expandable five-level hierarchy: human need, domain, tag space, problem cluster, and question leaf.

## 6. Tag requirements

- Maximum five tags per question, ordered by relevance and enforced in UI, API, and database.
- Stable tag IDs independent of display labels.
- Aliases, parent-child relationships, translations, deprecations, and merge history.
- Separate topic tags, context tags, and goal tags.
- AI may suggest tags; the participant confirms them.
- Moderator merges preserve history and cannot silently change meaning.
- Tags support navigation; semantic embeddings improve recall when wording differs.

## 7. Core data model

- `users`: pseudonymous account, trust state, consent version, locale.
- `profile_facets`: coarse, optional, independently removable context.
- `questions`: author, text, status, risk class, language, timestamps.
- `tags`, `tag_aliases`, `question_tags`: ranked taxonomy capped at five.
- `answers`: model/provider version, public rationale, sources, confidence, safety state.
- `feedback`: rating, reason code, explanation, context snapshot, outcome state.
- `alternatives`, `comments`, `evidence`: community improvement and provenance.
- `graph_nodes`, `graph_edges`: typed, scored, and versioned relationships.
- `moderation_cases`, `appeals`, `audit_events`: accountable safety operations.
- `consents`, `deletion_requests`: privacy and data-rights records.

Demographic collection is schema-driven. The initial contract is `dist/metadata/demographics.schema.json`; every stored question links to a participant UID and a versioned snapshot of the coarse profile used for that answer. Production storage must separate participant/profile records from public question content and prevent public UID enumeration.

### Anonymous UID lifecycle

- Generate a random browser UID; never derive it from fingerprinting or demographic values.
- Store it in first-party browser storage with clear disclosure and deletion controls.
- Treat it as pseudonymous—not anonymous data and not authentication.
- Allow replacement when lost; multiple UIDs per person are acceptable for the MVP.
- Never reconstruct identity or combine the UID with advertising datasets.
- Require stronger identity only for moderators or abuse-sensitive capabilities.

## 8. Safety and shared-learning guidelines

The guidelines are versioned, explainable commitments—not one enormous prompt:

1. Human dignity, privacy, autonomy, non-discrimination, and child safety.
2. Disallowed content and behavior.
3. Topic rules for health, legal, finance, civic processes, self-harm, violence, and regulated work.
4. Evidence and source standards.
5. Ranking and consensus rules.
6. Moderator powers, limits, appeals, and transparency.
7. Research/training consent and data-use limitations.
8. Emergency changes, sunset dates, and public change logs.

Every automated decision records the policy version, rule, action, and appeal route. New topics require safety tests before rollout.

### Dataset learning boundary

- Ordinary participation, community publication, research participation, and AI-training contribution are four separate choices.
- Default training status is off. Consent must identify the dataset purpose, included fields, license, intended users, retention, and practical withdrawal limits.
- Public question text is not automatically safe to redistribute as training data; re-screen, minimize, deduplicate, and document every export.
- Dataset releases include provenance, consent receipts, removal history, coverage limitations, known biases, and intended/prohibited uses.
- Preserve reasoned dissent and cohort-specific outcomes. Harm removal must not become viewpoint removal.
- Evaluate models trained on the data for safety, factuality, pluralism, disparate performance, privacy leakage, and resistance to majority capture.

All user-supplied question, profile free-text, alternative, comment, tag proposal, and search-report content passes through one server-side moderation gateway before storage or model invocation. The gateway combines normalization, language-aware profanity and abuse detection, PII detection/redaction, intent classification, topic policy, rate limits, and human review for uncertain cases. Disallowed questions receive a brief refusal and safe-reframing guidance; raw rejected content is not published. Search queries should be screened for abuse telemetry without preventing legitimate safety research. Client-side checks provide immediate feedback but are never the enforcement boundary.

## 9. MVP architecture

Use one repository and one deployable backend with internal modules:

`responsive PWA -> API -> modular application -> relational database`

Internal modules: identity, questions, answers, feedback, search, graph, moderation, notifications, analytics, and provider adapters. Start with relational full-text search. Use a transactional outbox so workers can reliably update moderation, embeddings, summaries, and graph connections.

Initial infrastructure:

- Static/PWA frontend on free-tier hosting.
- Serverless API or small autoscaling container.
- Managed PostgreSQL-compatible free tier.
- Object storage only for necessary attachments.
- Multi-provider AI adapter with quotas, caching, timeouts, and fallbacks.
- Background queue for moderation, embeddings, and graph construction.
- Privacy-safe metrics and structured audit logs.

Do not begin with microservices, Kubernetes, permanent VMs, a separate graph database, or a separate search cluster.

## 10. Evolution path

### Phase 0 — Prototype

One invitation-only group, synthetic content, and human-reviewed AI answers. Validate comprehension and safety.

### Phase 1 — Pilot

Three to five cohorts, two low-risk topic families, real accounts, persistence, moderation queue, search, controlled tags, and outcome follow-up.

### Phase 2 — Community beta

Rate limits, trust signals, multilingual support, semantic retrieval, graph suggestions, abuse defenses, transparency reports, and independent policy review.

### Phase 3 — Scale

Split only measured bottlenecks: AI orchestration, search/indexing, graph computation, moderation, and notifications. Add event streaming, read replicas, regional caches, and asynchronous regional replication.

### Phase 4 — Federated public infrastructure

Regional data residency, interoperable schemas, independent community stewardship groups, privacy-budgeted research APIs, and portable communities.

## 11. Reliability and scalability

- Stateless instances, idempotent APIs, globally unique IDs, and versioned API/event schemas.
- Queue slow AI and graph work; expose progress and retry safely.
- Cache public questions and answer snapshots at the edge.
- Cursor pagination and progressive graph loading.
- Layered rate limits and anti-abuse signals.
- Multi-provider AI fallback, circuit breakers, and budget ceilings.
- Backups, point-in-time recovery, restore drills, and explicit RPO/RTO.
- Graceful degradation: reading and search continue when AI is unavailable.
- Feature flags and staged topic/region rollouts.

## 12. Community learning safeguards and anti-capture

- Keep factual confidence, safety status, usefulness, and popularity separate.
- Publish ranking factors and material algorithm changes.
- Label sponsors and forbid sponsor control over conclusions.
- Surface principled dissent, not only majority views.
- Analyze cohorts so large demographics cannot erase smaller groups.
- Require moderator/expert conflict disclosures.
- Provide appeals, correction history, community notes, and external audits.

## 13. Sustainable free access

Fund core access through grants, donations, public-interest partnerships, transparent sponsorships, and paid organizational tools built on aggregated insights. Never sell individual profiles, private question histories, or targeted access to vulnerable groups.

Free infrastructure tiers are an MVP tool, not a permanent dependency. Track cost per question and useful outcome, cache repeated work, use smaller models for classification, reserve costly models for complex cases, and switch providers through adapters as credits change.

## 14. Success metrics

- Useful-answer rate and time to first useful action.
- Reported outcome improvement after 7/30 days.
- Disagreement resolution without suppressing dissent.
- Citation coverage and factual correction rate.
- Safety incident and successful appeal rates.
- Accurate graph connection rate.
- Cost per answer and cost per useful outcome.
- Quality and safety parity across cohorts.
- Contributor retention without engagement dark patterns.

## 15. First implementation backlog

1. Select two low-risk pilot topics and define exclusions.
2. Approve shared-learning guidelines v1 and moderation/appeal rules.
3. Add pseudonymous identity and consent.
4. Implement questions and maximum-five tag validation at all layers.
5. Add answer orchestration using a strict public response schema.
6. Add feedback, alternatives, and outcome follow-up.
7. Build keyword/tag search; add semantic search only after enough data exists.
8. Add reporting, moderation, appeals, and immutable audit events.
9. Generate graph suggestions asynchronously with human confirmation.
10. Run a closed pilot and measure usefulness, safety, cost, and branch quality before expanding.
