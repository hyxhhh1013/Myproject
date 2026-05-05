import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());

// Initialize DB if not exists
if (!fs.existsSync(DB_FILE)) {
  const initialData = {
    tasks: [
      { id: '1', content: '设计系统架构图 (后端)', status: 'todo' },
      { id: '2', content: '实现 API 接口', status: 'inProgress' },
      { id: '3', content: '数据库选型', status: 'done' }
    ]
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

// Helper to read/write DB
const readDb = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
const writeDb = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// Routes
app.get('/api/tasks', (req, res) => {
  const db = readDb();
  res.json(db.tasks);
});

app.post('/api/tasks', (req, res) => {
  const db = readDb();
  const newTask = { id: Date.now().toString(), ...req.body };
  db.tasks.push(newTask);
  writeDb(db);
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const db = readDb();
  const index = db.tasks.findIndex(t => t.id === req.params.id);
  if (index !== -1) {
    db.tasks[index] = { ...db.tasks[index], ...req.body };
    writeDb(db);
    res.json(db.tasks[index]);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  const db = readDb();
  const initialLength = db.tasks.length;
  db.tasks = db.tasks.filter(t => t.id !== req.params.id);
  if (db.tasks.length !== initialLength) {
    writeDb(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
