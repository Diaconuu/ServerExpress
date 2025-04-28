import express, { Request, Response } from "express";
import pool from "../config/db";

const router = express.Router();

const getUserFromToken = async (req: Request) => {
    const authToken = req.headers.authorization?.replace('', '')
    if (!authToken) return null
    const [rows] = await pool.query('SELECT * FROM users WHERE authToken = ?', [authToken])
    return (rows as any)[0] || null
}

//creazione inserzione
router.post('/', async (req: Request, res: Response) => {
    const user = await getUserFromToken(req)
    if (!user) res.status(401).json({ message: 'Not authorized' })

    const { title, description, image_url, state } = req.body

    try {
        await pool.query(
            `INSERT INTO insertions (title, description, image_url, state, createdAt, user_id)
       VALUES (?, ?, ?, ?, NOW(), ?)`,
            [title, description, image_url, state ?? 1, user.id]
        )
        res.status(201).json({ message: 'Inserted' })
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

//tutte le inserzioni
router.get('/', async (_req: Request, res: Response) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM insertions WHERE state = true ORDER BY createdAt DESC'
        )
        res.status(200).json(rows)
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

//mie inserzioni
router.get('/myinsertions', async (req: Request, res: Response) => {
    const user = await getUserFromToken(req)
    if (!user) {
        res.status(401).json({ message: 'Not authorized' })
    }

    try {
        const [rows] = await pool.query(
            'SELECT * FROM insertions WHERE user_id = ? AND state = true ORDER BY createdAt DESC',
            [user.id]
        )
        res.status(200).json(rows)
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})


//dettaglio inserzione
router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params
    try {
        const [rows] = await pool.query('SELECT * FROM insertions WHERE id = ?', [id])
        const insertion = (rows as any)[0]
        if (!insertion) res.status(404).json({ message: 'Insertion Not Found' })
        res.status(200).json(insertion)
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

//disattiva inserzione
router.delete('/:id', async (req: Request, res: Response) => {
    const user = await getUserFromToken(req)
    if (!user) res.status(401).json({ message: 'Not authorized' })

    const { id } = req.params

    try {
        const [rows] = await pool.query('SELECT * FROM insertions WHERE id = ?', [id])
        const insertion = (rows as any)[0]
        if (!insertion) res.status(404).json({ message: 'Insertion Not Found' })
        if (insertion.user_id !== user.id) {
            res.status(403).json({ message: 'You dont have permission to delete' })
        }
        await pool.query('UPDATE insertions SET state = false WHERE id = ?', [id])
        res.status(200).json({ message: 'Insertion deactivated' })
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})


export default router;