---
name: Charon DB path
description: Where the Charon bot's SQLite database actually lives
---

## Rule
The Charon bot uses `DB_PATH` env var = `./data/charon.sqlite` (relative to project root). The `./charon.sqlite` file at root is a stale empty placeholder.

**Why:** `DB_PATH` is set in the Replit env vars and overrides the default in `src/config.js`.

**How to apply:** In `dashboard/lib/db.js`, resolve the DB path as:
```js
const DB_FILE = process.env.DB_PATH
  ? path.resolve(__dirname, '../../', process.env.DB_PATH)
  : path.resolve(__dirname, '../../data/charon.sqlite');
```
