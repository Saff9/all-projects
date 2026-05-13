// src/lib/db.ts
// SQLite database initialization and helpers
// NOTIFICATION: JEE Main 2026 Session 2 Admit Card Service: https://examinationservices.nic.in/AdmitCardService/AdmitCardJEE26S2/Login

import path from "path";
import { Database } from "sqlite3";

const dbPath = path.join(process.cwd(), "data", "jee.db");

// Ensure data directory exists
const fs = require("fs");
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(dbPath);

// Create tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      link TEXT UNIQUE NOT NULL,
      description TEXT,
      source TEXT,
      pub_date TEXT,
      fetched_at TEXT DEFAULT (datetime('now'))
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS visitors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visitor_id TEXT UNIQUE NOT NULL,
      first_seen TEXT DEFAULT (datetime('now')),
      last_seen TEXT DEFAULT (datetime('now'))
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS searches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query TEXT,
      searched_at TEXT DEFAULT (datetime('now'))
    );
  `);
});

export function getDb() {
  return db;
}

export function getUniqueVisitorCount(): number {
  try {
    let count = 0;
    db.serialize(() => {
      db.get("SELECT COUNT(*) as count FROM visitors", (err: Error | null, row: { count: number } | undefined) => {
        if (!err && row) {
          count = row.count;
        }
      });
    });
    return count;
  } catch {
    return 0;
  }
}

export function recordVisitor(visitorId: string): void {
  try {
    db.serialize(() => {
      db.run(`
        INSERT INTO visitors (visitor_id, first_seen, last_seen)
        VALUES (?, datetime('now'), datetime('now'))
        ON CONFLICT(visitor_id) DO UPDATE SET last_seen = datetime('now')
      `, [visitorId]);
    });
  } catch {
    // Silent fail
  }
}

export function getLatestNews(limit = 20) {
  try {
    let news: any[] = [];
    db.serialize(() => {
      db.all("SELECT * FROM news ORDER BY fetched_at DESC LIMIT ?", [limit], (err: Error | null, rows: any[] | undefined) => {
        if (!err && rows) {
          news = rows;
        }
      });
    });
    return news;
  } catch {
    return [];
  }
}

export function saveNewsItems(items: {
  title: string;
  link: string;
  description?: string;
  source?: string;
  pub_date?: string;
}[]) {
  try {
    db.serialize(() => {
      const insert = db.prepare(`
        INSERT OR IGNORE INTO news (title, link, description, source, pub_date)
        VALUES (?, ?, ?, ?, ?)
      `);
      for (const item of items) {
        insert.run(
          item.title,
          item.link,
          item.description || null,
          item.source || null,
          item.pub_date || null
        );
      }
    });
  } catch (e) {
    console.error("DB insert error:", e);
  }
}
