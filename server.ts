import express from "express";
import { createServer as createViteServer } from "vite";
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('forgesite.db');

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    prompt TEXT NOT NULL,
    specification TEXT,
    html TEXT NOT NULL,
    css TEXT NOT NULL,
    js TEXT NOT NULL,
    react_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/projects", (req, res) => {
    const projects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
    res.json(projects);
  });

  app.post("/api/projects", (req, res) => {
    const { id, name, prompt, specification, html, css, js, react_code } = req.body;
    const stmt = db.prepare(`
      INSERT INTO projects (id, name, prompt, specification, html, css, js, react_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, name, prompt, specification, html, css, js, react_code);
    res.json({ success: true });
  });

  app.delete("/api/projects/:id", (req, res) => {
    const stmt = db.prepare('DELETE FROM projects WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ success: true });
  });

  app.put("/api/projects/:id", (req, res) => {
    const { name } = req.body;
    const stmt = db.prepare('UPDATE projects SET name = ? WHERE id = ?');
    stmt.run(name, req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ForgeSite AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
