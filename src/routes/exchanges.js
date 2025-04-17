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
// inserimento di un nuovo scambio
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield getUserFromToken(req);
    if (!user)
        res.status(401).json({ message: 'Not authorized' });
    const { id_insertion, title, description, image_url } = req.body;
    try {
        yield db_1.default.query(`INSERT INTO exchanges (id_insertion, id_user, title, description, image_url, state, createdAt)
       VALUES (?, ?, ?, ?, ?, 'pending', NOW())`, [id_insertion, user.id, title, description, image_url]);
        res.status(201).json({ message: 'Exchanges successfully posted' });
    }
    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}));
// scambi proposti da me
router.get('/sent', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield getUserFromToken(req);
    if (!user)
        res.status(401).json({ message: 'Not authorized' });
    try {
        const [rows] = yield db_1.default.query(`SELECT e.*, i.title as insertion_target
       FROM exchanges e
       JOIN insertions i ON e.id_insertion = i.id
       WHERE e.id_user = ?
       ORDER BY e.createdAt DESC`, [user.id]);
        res.status(200).json(rows);
    }
    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}));
// scambi ricevuti
router.get('/received', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield getUserFromToken(req);
    if (!user)
        res.status(401).json({ message: 'Not authorized' });
    try {
        const [rows] = yield db_1.default.query(`SELECT e.*, i.title as insertion_target
       FROM exchanges e
       JOIN insertions i ON e.id_insertion = i.id
       WHERE i.user_id = ?
       ORDER BY e.createdAt DESC`, [user.id]);
        res.status(200).json(rows);
    }
    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}));
// accettare uno scambio
router.patch('/:id/accept', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield getUserFromToken(req);
    if (!user)
        res.status(401).json({ message: 'Not authorized' });
    const { id } = req.params;
    try {
        const [rows] = yield db_1.default.query(`SELECT e.*, i.user_id as insertion_owner
       FROM exchanges e
       JOIN insertions i ON e.id_insertion = i.id
       WHERE e.id = ?`, [id]);
        const exchange = rows[0];
        if (!exchange)
            res.status(404).json({ message: 'Exchange not found' });
        if (exchange.insertion_owner !== user.id) {
            res.status(403).json({ message: 'Not authorized to accept this insertion' });
        }
        yield db_1.default.query('UPDATE exchanges SET state = "accepted" WHERE id = ?', [id]);
        yield db_1.default.query('UPDATE insertions SET state = false WHERE id = ?', [exchange.id_insertion]);
        res.status(200).json({ message: 'Exchanges successfully accepted' });
    }
    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}));
//rifiutare uno scambio
router.patch('/:id/refuse', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield getUserFromToken(req);
    if (!user)
        res.status(401).json({ message: 'Not authorized' });
    const { id } = req.params;
    try {
        const [rows] = yield db_1.default.query(`SELECT e.*, i.user_id as insertion_owner
       FROM exchanges e
       JOIN insertions i ON e.id_insertion = i.id
       WHERE e.id = ?`, [id]);
        const exchange = rows[0];
        if (!exchange)
            res.status(404).json({ message: 'Exchange not found' });
        if (exchange.insertion_owner !== user.id) {
            res.status(403).json({ message: 'Not authorized to refuse this insertion' });
        }
        yield db_1.default.query('UPDATE exchanges SET state = "refused" WHERE id = ?', [id]);
        res.status(200).json({ message: 'Exchanges successfully refused' });
    }
    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}));
exports.default = router;
