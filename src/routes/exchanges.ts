import express, { Request, Response, NextFunction } from "express";
import pool from "../config/db";

const router = express.Router();

const getUserFromToken = async (req: Request) => {
    const authToken = req.headers.authorization;
    if (!authToken) return null
    const [rows] = await pool.query('SELECT * FROM users WHERE authToken = ?', [authToken])
    return (rows as any)[0] || null
}

// inserimento di un nuovo scambio
router.post('/', async (req: Request, res: Response) => {
    const user = await getUserFromToken(req)
    if (!user) res.status(401).json({ message: 'Not authorized' })

    const { id_insertion, title, description, image_url } = req.body

    try {
        await pool.query(
            `INSERT INTO exchanges (id_insertion, id_user, title, description, image_url, state, createdAt)
       VALUES (?, ?, ?, ?, ?, 'pending', NOW())`,
            [id_insertion, user.id, title, description, image_url]
        )

        res.status(201).json({ message: 'Exchanges successfully posted' })
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

// scambi proposti da me
router.get('/sent', async (req: Request, res: Response) => {
    const user = await getUserFromToken(req)
    if (!user) res.status(401).json({ message: 'Not authorized' })

    try {
        const [rows] = await pool.query(
            `SELECT e.*, i.title
       FROM exchanges e
       JOIN insertions i ON e.id_insertion = i.id
       WHERE e.id_user = ?
       ORDER BY e.createdAt DESC`,
            [user.id]
        )

        res.status(200).json(rows)
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

// scambi ricevuti
router.get('/received', async (req: Request, res: Response) => {
    const user = await getUserFromToken(req)
    if (!user) res.status(401).json({ message: 'Not authorized' })

    try {
        const [rows] = await pool.query(
            `SELECT e.*, i.title
       FROM exchanges e
       JOIN insertions i ON e.id_insertion = i.id
       WHERE i.user_id = ?
       ORDER BY e.createdAt DESC`,
            [user.id]
        )

       res.status(200).json(rows)
    } catch (err) {
        console.error(err)
       res.sendStatus(500)
    }
})


// accettare uno scambio
router.patch('/:id/accept', async (req: Request, res: Response) => {
    const user = await getUserFromToken(req)
    if (!user) res.status(401).json({ message: 'Not authorized' })

    const { id } = req.params

    try {
        const [rows] = await pool.query(
            `SELECT e.*, i.user_id 
       FROM exchanges e
       JOIN insertions i ON e.id_insertion = i.id
       WHERE e.id = ?`,
            [id]
        )

        const exchange = (rows as any)[0]

        if (!exchange) res.status(404).json({ message: 'Exchange not found' })

        if (exchange.user_id !== user.id) {
            res.status(403).json({ message: 'Not authorized to accept this insertion' })
        }

        await pool.query('UPDATE exchanges SET state = "accepted" WHERE id = ?', [id])
        await pool.query('UPDATE insertions SET state = false WHERE id = ?', [exchange.id_insertion])
        res.status(200).json({ message: 'Exchanges successfully accepted' })
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

//rifiutare uno scambio
router.patch('/:id/refuse', async (req: Request, res: Response) => {
    const user = await getUserFromToken(req)
    if (!user) res.status(401).json({ message: 'Not authorized' })

    const { id } = req.params

    try {
        const [rows] = await pool.query(
            `SELECT e.*, i.user_id
       FROM exchanges e
       JOIN insertions i ON e.id_insertion = i.id
       WHERE e.id = ?`,
            [id]
        )

        const exchange = (rows as any)[0]

        if (!exchange) res.status(404).json({ message: 'Exchange not found' })

        if (exchange.user_id !== user.id) {
            res.status(403).json({ message: 'Not authorized to refuse this insertion' })
        }

        await pool.query('UPDATE exchanges SET state = "refused" WHERE id = ?', [id])
        res.status(200).json({ message: 'Exchanges successfully refused' })
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

export default router;