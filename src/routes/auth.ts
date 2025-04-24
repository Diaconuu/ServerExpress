import express, { Request, Response } from "express";
import bcrypt from "bcrypt-ts";
import { v4 as uuidv4 } from 'uuid'
import {Insert_user} from "../models/User";
import {body, validationResult} from "express-validator";
import pool from "../config/db";

const router = express.Router();
const validateEmail = () => body('email').trim().isEmail();

router.post("/signup", validateEmail(), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.sendStatus(400);
    }
    try {
        const newUser = await pool.query(Insert_user,[
            req.body.email,
            await bcrypt.hash(req.body.password, 10),
            req.body.name || null,
            req.body.surname || null
        ])
        res.status(201).json({ message: "User Created."});
    } catch (err) {
        console.log(err);
    }
});

router.post("/login",validateEmail(), async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ? LIMIT 1',
            [req.body.email]
        )
        const user = (rows as any)[0]

        if (user && await bcrypt.compare(req.body.password, user.password)) {

            const newToken = uuidv4()
            await pool.query('UPDATE users SET authToken = ? WHERE id = ?', [newToken, user.id])

            res.status(200).json({
                message:"Login Successfully. Token:",
                authToken: newToken });
        } else {
            res.status(401).json({ message: "Invalid Credential" });
        }
    } catch (err) {
        console.log(err);
    }
});

router.get("/me", async (req, res) => {

    const authToken = req.headers.authorization;
    if (!authToken) {
        res.status(401).json({ message: 'No Token' })
    }

    try {
        const [rows] = await pool.query(
            'SELECT email, name, surname FROM users WHERE authToken = ? LIMIT 1',
            [authToken])
        const user = (rows as any)[0]
        if (user) {
            res.status(200).json({email: user.email, name: user.name, surname: user.surname});
        }
        else{
            res.status(404).json({message:"Not Found"});
        }
    }
    catch (err) {
        console.log(err);
    }
});

router.patch('/me', async (req, res) => {
    const authToken = req.headers.authorization;
    if (!authToken) res.status(401).json({ message: 'No Token' });

    const updates = req.body;
    const fields = Object.keys(updates);

    if (fields.length === 0) {
        res.status(400).json({ message: 'Nessun campo da aggiornare' });
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => updates[field]);

    const query = `UPDATE users SET ${setClause} WHERE authToken = ?`;

    try {
        await pool.query(query, [...values, authToken]);
        res.status(200).json({ message: 'Profilo aggiornato' });
    } catch (err) {
        console.error('Errore aggiornamento profilo:', err);
        res.sendStatus(500);
    }
});


router.post('/logout', async (req, res) => {

    const authToken = req.headers.authorization;
    if (!authToken) {
        res.status(401).json({ message: 'No Token' })
    }

    try {
        const [result] = await pool.query(
            'UPDATE users SET authToken = NULL WHERE authToken = ?',
            [authToken]
        )
        res.status(200).json({ message: 'Logout eseguito con successo' })
    } catch (err) {
        console.error('Errore logout:', err)
        res.sendStatus(500)
    }
})


export default router;