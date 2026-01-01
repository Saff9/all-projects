
import Database from 'better-sqlite3';

const db = new Database('./visitors.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS visitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT UNIQUE,
    first_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    visits INTEGER DEFAULT 1
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS daily_visitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    ip TEXT,
    UNIQUE(date, ip)
  )
`);

export function logVisitor(ip: string) {
  try {
    const stmt = db.prepare(`
      INSERT INTO visitors (ip, last_visit, visits)
      VALUES (?, CURRENT_TIMESTAMP, COALESCE((SELECT visits + 1 FROM visitors WHERE ip = ?), 1))
      ON CONFLICT(ip) DO UPDATE SET
      last_visit = CURRENT_TIMESTAMP,
      visits = visits + 1
    `);
    stmt.run(ip, ip);

    const date = new Date().toISOString().split('T')[0];
    const dailyStmt = db.prepare(
      'INSERT OR IGNORE INTO daily_visitors (date, ip) VALUES (?, ?)'
    );
    dailyStmt.run(date, ip);
  } catch (e) {
    console.error('DB error:', e);
  }
}

export function getStats() {
  const total = db.prepare('SELECT COUNT(*) as count FROM visitors').get();
  const today = new Date().toISOString().split('T')[0];
  const daily = db.prepare('SELECT COUNT(*) as count FROM daily_visitors WHERE date = ?').get(today);
  
  return { totalVisitors: total.count, dailyVisitors: daily.count };
}

export default db;

