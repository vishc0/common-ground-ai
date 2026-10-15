# Ethical MVP Review — Shared Human Learning

## Position

The project should build a plural, inspectable record of human needs, proposed solutions, disagreements, evidence, and outcomes. It must not claim to reproduce a single human consciousness, treat majority preference as truth, or convert ordinary participation into unrestricted training data.

## MVP findings and resolutions

1. **Training consent was ambiguous.** The site now states that prototype data stays in the browser and participation is not consent to AI training. A future dataset requires a separate informed opt-in.
2. **Illustrative metrics looked live.** The community pulse is now explicitly a sample prototype snapshot.
3. **Tag review was unreliable.** Duplicate click handlers could cancel selections, and submission could overwrite participant review. Tags now have one accessible state handler and reviewed selections are preserved.
4. **Context labels were fictional.** Hard-coded location and age labels are replaced by the participant's optional browser-local profile.
5. **Locally asked questions were not discoverable.** They now appear at the start of Explore and can open as threads in the same browser.
6. **Data control was incomplete.** A context/data panel now explains storage and training status and provides a confirmed local-data reset.
7. **Legacy unsafe records could reappear.** Explore now re-screens browser-local questions at read time, quarantining records that fail the current policy.

## Required before a public pilot

- Enforce safety, privacy, rate limits, and authorization on the server; client filters are only user feedback.
- Publish plain-language community learning, moderation, appeals, and dataset-use guidelines.
- Define a granular consent receipt containing purpose, fields, license, recipients, retention, withdrawal limits, and policy version.
- Quarantine rejected material with strict retention; never publish it or silently add it to a dataset.
- Test false positives across languages and communities; preserve safe dissent and legitimate safety research.
- Separate usefulness, evidence quality, safety, popularity, and demographic coverage in ranking.
- Add provenance, versioning, deletion workflows, dataset cards, model cards, and independent red-team review.
- Do not launch a training-data export until legal, privacy, security, and community stewardship reviews pass.
