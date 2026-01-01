CREATE TABLE IF NOT EXISTS meds (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  default_dose REAL,
  default_units TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_meds_user ON meds(user_id);
CREATE INDEX IF NOT EXISTS idx_meds_user_name ON meds(user_id, name);

CREATE TABLE IF NOT EXISTS dose_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  med_id TEXT,
  med_name_snapshot TEXT NOT NULL,
  amount REAL NOT NULL,
  units TEXT NOT NULL,
  site TEXT NOT NULL,
  note TEXT,
  taken_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dose_user_taken ON dose_logs(user_id, taken_at DESC);
CREATE INDEX IF NOT EXISTS idx_dose_user_med_taken ON dose_logs(user_id, med_id, taken_at DESC);

CREATE TABLE IF NOT EXISTS site_rotation_state (
  user_id TEXT NOT NULL,
  med_id TEXT NOT NULL,
  last_site TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, med_id)
);

CREATE INDEX IF NOT EXISTS idx_rotation_user ON site_rotation_state(user_id);
