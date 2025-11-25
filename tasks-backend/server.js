import express from 'express'
import cors from 'cors'
import Axios from 'axios'
import AsyncLock from 'async-lock'
import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()
app.use(cors())
app.use(express.json())
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use(express.static(path.join(__dirname, 'public')))

const lock = new AsyncLock()
const db = new Database('tasks.db')
db.exec(`
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  max_submissions INTEGER NOT NULL,
  submissions_count INTEGER NOT NULL DEFAULT 0
);
`)
const insertTask = db.prepare('INSERT INTO tasks(title, description, max_submissions) VALUES (?, ?, ?)')
const listTasks = db.prepare('SELECT id, title, description, max_submissions, submissions_count FROM tasks')
const getTask = db.prepare('SELECT id, title, description, max_submissions, submissions_count FROM tasks WHERE id = ?')
const updateCount = db.prepare('UPDATE tasks SET submissions_count = submissions_count + 1 WHERE id = ?')
const createDefault = db.prepare('SELECT count(1) as c FROM tasks')
if (createDefault.get().c === 0) {
  insertTask.run('Sample Task', 'Demo', 3)
}

app.get('/tasks', (req, res) => {
  const rows = listTasks.all()
  res.json(rows)
})

app.get('/tasks/:id', (req, res) => {
  const id = Number(req.params.id)
  const t = getTask.get(id)
  if (!t) return res.status(404).json({ error: 'Task not found' })
  res.json(t)
})

app.post('/tasks', (req, res) => {
  const { title, description, max_submissions } = req.body || {}
  if (!title || !description) return res.status(400).json({ error: 'Invalid payload' })
  const info = insertTask.run(title, description, Number(max_submissions) || 1)
  const t = getTask.get(info.lastInsertRowid)
  res.status(201).json(t)
})

app.post('/tasks/:id/submit', async (req, res) => {
  const id = Number(req.params.id)
  const payload = req.body || {}
  const t = getTask.get(id)
  if (!t) return res.status(404).json({ error: 'Task not found' })
  try {
    await lock.acquire(`task-${id}`, async () => {
      const trx = db.transaction(() => {
        const current = getTask.get(id)
        if (current.submissions_count >= current.max_submissions) throw new Error('Max submissions reached')
        updateCount.run(id)
      })
      trx()
    })
  } catch (e) {
    return res.status(409).json({ error: 'Max submissions reached' })
  }
  try {
    await Axios.post('http://localhost:8002/notify', { task_id: id, data: payload })
  } catch {}
  const updated = getTask.get(id)
  res.json({ status: 'ok', submissions_count: updated.submissions_count })
})

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`Tasks backend listening on http://localhost:${port}`)
})
