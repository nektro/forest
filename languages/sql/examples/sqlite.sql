-- A small SQLite schema with an FTS index and an upsert.
PRAGMA foreign_keys = ON;
PRAGMA main.journal_mode = WAL;

.mode box
.headers on

CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL COLLATE NOCASE,
  body TEXT,
  [created at] TEXT DEFAULT (datetime('now')),
  tags TEXT CHECK (json_valid(tags)),
  UNIQUE (title) ON CONFLICT REPLACE
) STRICT;

CREATE VIRTUAL TABLE notes_fts USING fts5(title, body, content='notes', content_rowid='id');

CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes
BEGIN
  INSERT INTO notes_fts (rowid, title, body) VALUES (new.id, new.title, new.body);
END;

INSERT INTO notes (title, body, tags) VALUES (?1, ?2, json_array('todo'))
  ON CONFLICT (title) DO UPDATE SET body = excluded.body WHERE excluded.body IS NOT NULL;

INSERT OR IGNORE INTO notes (title) VALUES (:title), ($title), (@title);

WITH RECURSIVE counter(n) AS (
  SELECT 1
  UNION ALL
  SELECT n + 1 FROM counter WHERE n < 10
)
SELECT n, n * n AS 'square' FROM counter;

SELECT n.id, n.title, highlight(notes_fts, 1, '<b>', '</b>') AS snippet
FROM notes_fts JOIN notes n ON n.id = notes_fts.rowid
WHERE notes_fts MATCH 'sqlite NOT mysql'
  AND n.tags->>'$[0]' = 'todo'
  AND n.body NOT NULL
ORDER BY rank
LIMIT 5 OFFSET 0;

SELECT t.value FROM notes, json_each(notes.tags) AS t WHERE t.value GLOB 'to*';

ATTACH DATABASE 'archive.db' AS archive;
INSERT INTO archive.notes SELECT * FROM main.notes WHERE id IN (SELECT id FROM notes LIMIT 10);
DETACH archive;
VACUUM;
EXPLAIN QUERY PLAN SELECT * FROM notes INDEXED BY sqlite_autoindex_notes_1 WHERE title = 'x';
