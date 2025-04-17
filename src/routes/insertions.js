"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../config/db"));
const router = express_1.default.Router();
const getUserFromToken = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const authToken = req.headers.authorization;
    if (!authToken)
        return null;
    const [rows] = yield db_1.default.query('SELECT * FROM users WHERE authToken = ?', [authToken]);
    return rows[0] || null;
});
//creazione inserzione
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield getUserFromToken(req);
    if (!user)
        res.status(401).json({ message: 'Not authorized' });
    const { title, description, image_url, state } = req.body;
    try {
        yield db_1.default.query(`INSERT INTO insertions (title, description, image_url, state, createdAt, user_id)
       VALUES (?, ?, ?, ?, NOW(), ?)`, [title, description, image_url, state !== null && state !== void 0 ? state : 1, user.id]);
        res.status(201).json({ message: 'Inserted' });
    }
    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}));
//tutte le inserzioni
router.get('/', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield db_1.default.query('SELECT * FROM insertions WHERE state = true ORDER BY createdAt DESC');
        res.status(200).json(rows);
    }
    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}));
//dettaglio inserzione
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const [rows] = yield db_1.default.query('SELECT * FROM insertions WHERE id = ?', [id]);
        const insertion = rows[0];
        if (!insertion)
            res.status(404).json({ message: 'Insertion Not Found' });
        res.status(200).json(insertion);
    }
    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}));
//disattiva inserzione
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield getUserFromToken(req);
    if (!user)
        res.status(401).json({ message: 'Not authorized' });
    const { id } = req.params;
    try {
        const [rows] = yield db_1.default.query('SELECT * FROM insertions WHERE id = ?', [id]);
        const insertion = rows[0];
        if (!insertion)
            res.status(404).json({ message: 'Insertion Not Found' });
        if (insertion.user_id !== user.id) {
            res.status(403).json({ message: 'You dont have permission to delete' });
        }
        yield db_1.default.query('UPDATE insertions SET state = false WHERE id = ?', [id]);
        res.status(200).json({ message: 'Insertion deactivated' });
    }
    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}));
exports.default = router;
