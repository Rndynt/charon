import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In container: /app/data/charon.sqlite (volume mount)
// Local dev: ../../data/charon.sqlite relative to lib/
const DB_FILE = process.env.DB_PATH || path.resolve(__dirname, '../../data/charon.sqlite');

let _db = null;

export function getDb() {
  if (!_db) {
    _db = new Database(DB_FILE, { readonly: true, fileMustExist: true });
    _db.pragma('journal_mode = WAL');
    _db.pragma('busy_timeout = 5000');
  }
  return _db;
}

export function safeJson(str, fallback = null) {
  try { return str ? JSON.parse(str) : fallback; } catch { return fallback; }
}
