CREATE TABLE applications (
  id          TEXT PRIMARY KEY,
  company     TEXT NOT NULL,
  role        TEXT NOT NULL,
  ctc         REAL,
  base        REAL,
  location    TEXT NOT NULL DEFAULT '',
  tag         TEXT NOT NULL DEFAULT 'lock' CHECK (tag IN ('lock', 'chill', 'dilemma')),
  test_done   INTEGER NOT NULL DEFAULT 0 CHECK (test_done IN (0, 1)),
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);

CREATE INDEX applications_created_at ON applications (created_at);
