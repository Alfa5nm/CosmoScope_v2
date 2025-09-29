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
const db = new sqlite3.Database(dbPath)

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

const toNumberParam = (value: unknown): number | undefined => {
  const stringValue = toStringParam(value)
  if (stringValue === undefined) {
    return undefined
  }
  const numericValue = Number(stringValue)
  return Number.isFinite(numericValue) ? numericValue : undefined
}

// Get all labels for a planet
router.get('/planet/:planet', (req, res) => {
  const { planet } = req.params
  const userId = toStringParam(req.query.userId)

  let query = 'SELECT * FROM labels WHERE planet = ?'
  const params: (string | number)[] = [planet]

  if (userId) {
    query += ' AND userId = ?'
    params.push(userId)
  }

  query += ' ORDER BY createdAt DESC'

  db.all(query, params, (err, labels) => {
    if (err) {
      console.error('Error fetching labels for planet:', err)
      res.status(500).json({ error: 'Failed to fetch labels for planet' })
      return
    }

    res.json(labels ?? [])
  })
})

// Get labels by category
router.get('/category/:category', (req, res) => {
  const { category } = req.params
  const userId = toStringParam(req.query.userId)
  const planet = toStringParam(req.query.planet)

  let query = 'SELECT * FROM labels WHERE category = ?'
  const params: (string | number)[] = [category]

  if (userId) {
    query += ' AND userId = ?'
    params.push(userId)
  }

  if (planet) {
    query += ' AND planet = ?'
    params.push(planet)
  }

  query += ' ORDER BY createdAt DESC'

  db.all(query, params, (err, labels) => {
    if (err) {
      console.error('Error fetching labels by category:', err)
      res.status(500).json({ error: 'Failed to fetch labels by category' })
      return
    }

    res.json(labels ?? [])
  })
})

// Get labels within bounds
router.get('/bounds', (req, res) => {
  const north = toNumberParam(req.query.north)
  const south = toNumberParam(req.query.south)
  const east = toNumberParam(req.query.east)
  const west = toNumberParam(req.query.west)
  const planet = toStringParam(req.query.planet)
  const userId = toStringParam(req.query.userId)

  if (north === undefined || south === undefined || east === undefined || west === undefined) {
    res.status(400).json({ error: 'Bounds parameters are required' })
    return
  }

  let query = `
    SELECT * FROM labels
    WHERE JSON_EXTRACT(coordinates, '$.lat') BETWEEN ? AND ?
    AND JSON_EXTRACT(coordinates, '$.lon') BETWEEN ? AND ?
  `
  const params: (string | number)[] = [south, north, west, east]

  if (planet) {
    query += ' AND planet = ?'
    params.push(planet)
  }

  if (userId) {
    query += ' AND userId = ?'
    params.push(userId)
  }

  query += ' ORDER BY createdAt DESC'

  db.all(query, params, (err, labels) => {
    if (err) {
      console.error('Error fetching labels within bounds:', err)
      res.status(500).json({ error: 'Failed to fetch labels within bounds' })
      return
    }

    res.json(labels ?? [])
  })
})

// Get label statistics
router.get('/stats', (req, res) => {
  const userId = toStringParam(req.query.userId)
  const planet = toStringParam(req.query.planet)

  const conditions: string[] = []
  const params: (string | number)[] = []

  if (userId) {
    conditions.push('userId = ?')
    params.push(userId)
  }

  if (planet) {
    conditions.push('planet = ?')
    params.push(planet)
  }

  const whereClause = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : ''
  const totalQuery = `SELECT COUNT(*) as total FROM labels${whereClause}`

  db.get(totalQuery, params, (err, totalRow) => {
    if (err) {
      console.error('Error fetching total count:', err)
      res.status(500).json({ error: 'Failed to fetch statistics' })
      return
    }

    const categoryQuery = `
      SELECT category, COUNT(*) as count
      FROM labels
      ${whereClause}
      GROUP BY category
    `

    db.all(categoryQuery, [...params], (categoryErr, categories) => {
      if (categoryErr) {
        console.error('Error fetching categories:', categoryErr)
        res.status(500).json({ error: 'Failed to fetch statistics' })
        return
      }

      const planetQuery = `
        SELECT planet, COUNT(*) as count
        FROM labels
        ${userId ? 'WHERE userId = ?' : ''}
        GROUP BY planet
      `
      const planetParams = userId ? [userId] : []

      db.all(planetQuery, planetParams, (planetErr, planets) => {
        if (planetErr) {
          console.error('Error fetching planets:', planetErr)
          res.status(500).json({ error: 'Failed to fetch statistics' })
          return
        }

        const total = (totalRow as { total: number } | undefined)?.total ?? 0
        const categoryRows = categories ?? []
        const planetRows = planets ?? []

        res.json({
          total,
          categories: categoryRows,
          planets: planetRows
        })
      })
    })
  })
})

// Search labels
router.get('/search', (req, res) => {
  const searchTerm = toStringParam(req.query.q)
  const userId = toStringParam(req.query.userId)
  const planet = toStringParam(req.query.planet)
  const category = toStringParam(req.query.category)

  if (!searchTerm) {
    res.status(400).json({ error: 'Search query is required' })
    return
  }

  let query = `
    SELECT * FROM labels
    WHERE (name LIKE ? OR description LIKE ?)
  `
  const params: (string | number)[] = [`%${searchTerm}%`, `%${searchTerm}%`]

  if (userId) {
    query += ' AND userId = ?'
    params.push(userId)
  }

  if (planet) {
    query += ' AND planet = ?'
    params.push(planet)
  }

  if (category) {
    query += ' AND category = ?'
    params.push(category)
  }

  query += ' ORDER BY createdAt DESC'

  db.all(query, params, (err, labels) => {
    if (err) {
      console.error('Error searching labels:', err)
      res.status(500).json({ error: 'Failed to search labels' })
      return
    }

    res.json(labels ?? [])
  })
})

// Get label by ID
router.get('/:labelId', (req, res) => {
  const { labelId } = req.params

  db.get('SELECT * FROM labels WHERE id = ?', [labelId], (err, label) => {
    if (err) {
      console.error('Error fetching label:', err)
      res.status(500).json({ error: 'Failed to fetch label' })
      return
    }

    if (!label) {
      res.status(404).json({ error: 'Label not found' })
      return
    }

    res.json(label)
  })
})

// Create label
router.post('/', (req, res) => {
  const { userId, planet, name, description, category, coordinates, layer, date } = req.body ?? {}

  if (!userId || !planet || !name || !coordinates) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }

  const labelId = uuidv4()
  const coordinatesValue = JSON.stringify(coordinates)

  db.run(
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
    ],
    function (err) {
      if (err) {
        console.error('Error creating label:', err)
        res.status(500).json({ error: 'Failed to create label' })
        return
      }

      res.status(201).json({
        id: labelId,
        message: 'Label created successfully'
      })
    }
  )
})

// Update label
router.put('/:labelId', (req, res) => {
  const { labelId } = req.params
  const { name, description, category, coordinates, layer, date } = req.body ?? {}
  const coordinatesValue = coordinates !== undefined ? JSON.stringify(coordinates) : null

  db.run(
    `
      UPDATE labels
      SET name = ?, description = ?, category = ?, coordinates = ?, layer = ?, date = ?
      WHERE id = ?
    `,
    [
      name,
      description,
      category,
      coordinatesValue,
      layer,
      date,
      labelId
    ],
    function (this: RunResult, err) {
      if (err) {
        console.error('Error updating label:', err)
        res.status(500).json({ error: 'Failed to update label' })
        return
      }

      if (this.changes === 0) {
        res.status(404).json({ error: 'Label not found' })
        return
      }

      res.json({ message: 'Label updated successfully' })
    }
  )
})

// Delete label
router.delete('/:labelId', (req, res) => {
  const { labelId } = req.params

  db.run('DELETE FROM labels WHERE id = ?', [labelId], function (this: RunResult, err) {
    if (err) {
      console.error('Error deleting label:', err)
      res.status(500).json({ error: 'Failed to delete label' })
      return
    }

    if (this.changes === 0) {
      res.status(404).json({ error: 'Label not found' })
      return
    }

    res.json({ message: 'Label deleted successfully' })
  })
})

export default router
