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
const bcrypt_ts_1 = __importDefault(require("bcrypt-ts"));
const uuid_1 = require("uuid");
const User_1 = require("../models/User");
const express_validator_1 = require("express-validator");
const db_1 = __importDefault(require("../config/db"));
const router = express_1.default.Router();
const validateEmail = () => (0, express_validator_1.body)('email').trim().isEmail();
router.post("/signup", validateEmail(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.sendStatus(400);
    }
    try {
        const newUser = yield db_1.default.query(User_1.Insert_user, [
            req.body.email,
            yield bcrypt_ts_1.default.hash(req.body.password, 10),
            req.body.name || null,
            req.body.surname || null
        ]);
        res.status(201).json({ message: "User Created." });
    }
    catch (err) {
        console.log(err);
    }
}));
router.post("/login", validateEmail(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield db_1.default.query('SELECT * FROM users WHERE email = ? LIMIT 1', [req.body.email]);
        const user = rows[0];
        if (user && (yield bcrypt_ts_1.default.compare(req.body.password, user.password))) {
            const newToken = (0, uuid_1.v4)();
            yield db_1.default.query('UPDATE users SET authToken = ? WHERE id = ?', [newToken, user.id]);
            res.status(200).json({
                message: "Login Successfully. Token:",
                authToken: newToken
            });
        }
        else {
            res.status(401).json({ message: "Invalid Credential" });
        }
    }
    catch (err) {
        console.log(err);
    }
}));
router.get("/me", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authToken = req.headers.authorization;
    if (!authToken) {
        res.status(401).json({ message: 'No Token' });
    }
    try {
        const [rows] = yield db_1.default.query('SELECT email, name, surname FROM users WHERE authToken = ? LIMIT 1', [authToken]);
        const user = rows[0];
        if (user) {
            res.status(200).json({ email: user.email, name: user.name, surname: user.surname });
        }
        else {
            res.status(404).json({ message: "Not Found" });
        }
    }
    catch (err) {
        console.log(err);
    }
}));
router.post('/logout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authToken = req.headers.authorization;
    if (!authToken) {
        res.status(401).json({ message: 'No Token' });
    }
    try {
        const [result] = yield db_1.default.query('UPDATE users SET authToken = NULL WHERE authToken = ?', [authToken]);
        res.status(200).json({ message: 'Logout eseguito con successo' });
    }
    catch (err) {
        console.error('Errore logout:', err);
        res.sendStatus(500);
    }
}));
exports.default = router;
