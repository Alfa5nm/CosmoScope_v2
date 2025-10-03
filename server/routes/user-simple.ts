import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import sqlite3 from 'sqlite3'
import type { RunResult } from 'sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const router = express.Router()

// Initialize database
const dbPath = process.env.DATABASE_PATH || join(__dirname, '../db.sqlite')

// Ensure the directory exists
import fs from 'fs'
const dbDir = dirname(dbPath)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err)
    console.error('Database path:', dbPath)
    console.error('Current working directory:', process.cwd())
    console.error('Directory exists:', fs.existsSync(dbDir))
  } else {
    console.log('Database connected successfully at:', dbPath)
  }
})

const runAsync = (sql: string, params: unknown[] = []) =>
  new Promise<RunResult>((resolve, reject) => {
    db.run(sql, params, function (this: RunResult, err) {
      if (err) {
        reject(err)
        return
      }
      resolve(this)
    })
  })

const getAsync = <T = Record<string, unknown>>(sql: string, params: unknown[] = []) =>
  new Promise<T | undefined>((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err)
        return
      }
      resolve(row as T | undefined)
    })
  })

const allAsync = <T = Record<string, unknown>>(sql: string, params: unknown[] = []) =>
  new Promise<T[]>((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err)
        return
      }
      resolve((rows as T[]) ?? [])
    })
  })

const toStringParam = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    return value
  }
  if (Array.isArray(value) && value.length > 0) {
    const [first] = value
    if (typeof first === 'string') {
      return first
    }
  }
  return undefined
}

// Create tables if they don't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      lastActive DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS checkpoints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      planet TEXT,
      coordinates TEXT,
      layer TEXT,
      date TEXT,
      questProgress TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS labels (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      planet TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT DEFAULT 'note',
      coordinates TEXT NOT NULL,
      layer TEXT,
      date TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
})

// Create guest user
router.post('/guest', async (_req, res) => {
  try {
    const userId = uuidv4()
    await runAsync('INSERT INTO users (id) VALUES (?)', [userId])
    res.json({
      userId,
      message: 'Guest user created successfully'
    })
  } catch (error) {
    console.error('Error creating guest user:', error)
    res.status(500).json({ error: 'Failed to create guest user' })
  }
})

// Get user info
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const user = await getAsync('SELECT * FROM users WHERE id = ?', [userId])

    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// Update user last active
router.patch('/:userId/active', async (req, res) => {
  try {
    const { userId } = req.params
    const result = await runAsync('UPDATE users SET lastActive = CURRENT_TIMESTAMP WHERE id = ?', [userId])

    if (result.changes === 0) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.json({ message: 'User activity updated' })
  } catch (error) {
    console.error('Error updating user activity:', error)
    res.status(500).json({ error: 'Failed to update user activity' })
  }
})

// Get user checkpoints
router.get('/:userId/checkpoints', async (req, res) => {
  try {
    const { userId } = req.params
    const checkpoints = await allAsync('SELECT * FROM checkpoints WHERE userId = ? ORDER BY updatedAt DESC', [userId])
    res.json(checkpoints)
  } catch (error) {
    console.error('Error fetching checkpoints:', error)
    res.status(500).json({ error: 'Failed to fetch checkpoints' })
  }
})

// Save checkpoint
router.post('/:userId/checkpoints', async (req, res) => {
  try {
    const { userId } = req.params
    const { planet, coordinates, layer, date, questProgress } = req.body ?? {}

    const user = await getAsync('SELECT id FROM users WHERE id = ?', [userId])
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const coordinatesValue = coordinates !== undefined ? JSON.stringify(coordinates) : null
    const questProgressValue = questProgress !== undefined ? JSON.stringify(questProgress) : null

    const result = await runAsync(
      `
        INSERT OR REPLACE INTO checkpoints
        (userId, planet, coordinates, layer, date, questProgress, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `,
      [userId, planet, coordinatesValue, layer, date, questProgressValue]
    )

    res.json({
      id: result.lastID ?? null,
      message: 'Checkpoint saved successfully'
    })
  } catch (error) {
    console.error('Error saving checkpoint:', error)
    res.status(500).json({ error: 'Failed to save checkpoint' })
  }
})

// Get user labels
router.get('/:userId/labels', async (req, res) => {
  try {
    const { userId } = req.params
    const planet = toStringParam(req.query.planet)

    let query = 'SELECT * FROM labels WHERE userId = ?'
    const params: (string | null)[] = [userId]

    if (planet) {
      query += ' AND planet = ?'
      params.push(planet)
    }

    query += ' ORDER BY createdAt DESC'

    const labels = await allAsync(query, params)
    res.json(labels)
  } catch (error) {
    console.error('Error fetching labels:', error)
    res.status(500).json({ error: 'Failed to fetch labels' })
  }
})

// Create label
router.post('/:userId/labels', async (req, res) => {
  try {
    const { userId } = req.params
    const { planet, name, description, category, coordinates, layer, date } = req.body ?? {}

    if (!planet || !name || !coordinates) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }

    const user = await getAsync('SELECT id FROM users WHERE id = ?', [userId])
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const labelId = uuidv4()
    const coordinatesValue = JSON.stringify(coordinates)

    await runAsync(
      `
        INSERT INTO labels
        (id, userId, planet, name, description, category, coordinates, layer, date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        labelId,
        userId,
        planet,
        name,
        description,
        category || 'note',
        coordinatesValue,
        layer,
        date
      ]
    )

    res.status(201).json({
      id: labelId,
      message: 'Label created successfully'
    })
  } catch (error) {
    console.error('Error creating label:', error)
    res.status(500).json({ error: 'Failed to create label' })
  }
})

// Update label
router.put('/:userId/labels/:labelId', async (req, res) => {
  try {
    const { userId, labelId } = req.params
    const { name, description, category, coordinates, layer, date } = req.body ?? {}
    const coordinatesValue = coordinates !== undefined ? JSON.stringify(coordinates) : null

    const result = await runAsync(
      `
        UPDATE labels
        SET name = ?, description = ?, category = ?, coordinates = ?, layer = ?, date = ?
        WHERE id = ? AND userId = ?
      `,
      [name, description, category, coordinatesValue, layer, date, labelId, userId]
    )

    if (result.changes === 0) {
      res.status(404).json({ error: 'Label not found' })
      return
    }

    res.json({ message: 'Label updated successfully' })
  } catch (error) {
    console.error('Error updating label:', error)
    res.status(500).json({ error: 'Failed to update label' })
  }
})

// Delete label
router.delete('/:userId/labels/:labelId', async (req, res) => {
  try {
    const { userId, labelId } = req.params
    const result = await runAsync('DELETE FROM labels WHERE id = ? AND userId = ?', [labelId, userId])

    if (result.changes === 0) {
      res.status(404).json({ error: 'Label not found' })
      return
    }

    res.json({ message: 'Label deleted successfully' })
  } catch (error) {
    console.error('Error deleting label:', error)
    res.status(500).json({ error: 'Failed to delete label' })
  }
})

// Get user statistics
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params

    const labelsCount = await getAsync<{ count: number }>('SELECT COUNT(*) as count FROM labels WHERE userId = ?', [userId])
    const checkpointsCount = await getAsync<{ count: number }>('SELECT COUNT(*) as count FROM checkpoints WHERE userId = ?', [userId])
    const planets = await allAsync<{ planet: string }>(
      `
        SELECT DISTINCT planet FROM labels
        WHERE userId = ? AND planet IS NOT NULL
      `,
      [userId]
    )

    res.json({
      labelsCount: labelsCount?.count ?? 0,
      checkpointsCount: checkpointsCount?.count ?? 0,
      planetsVisited: planets.length,
      planets: planets.map((p) => p.planet)
    })
  } catch (error) {
    console.error('Error fetching user statistics:', error)
    res.status(500).json({ error: 'Failed to fetch statistics' })
  }
})

export default router
