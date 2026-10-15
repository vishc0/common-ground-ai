CREATE TABLE comments (id TEXT PRIMARY KEY, question_id TEXT NOT NULL REFERENCES questions(id), participant_id TEXT NOT NULL REFERENCES participants(id), text TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE INDEX idx_comments_question ON comments(question_id, created_at);
