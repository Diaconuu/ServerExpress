"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./routes/auth"));
const insertions_1 = __importDefault(require("./routes/insertions"));
const exchanges_1 = __importDefault(require("./routes/exchanges"));
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
exports.app.use("/", auth_1.default);
exports.app.use("/insertions", insertions_1.default);
exports.app.use("/exchanges", exchanges_1.default);
const PORT = process.env.PORT || 3000;
exports.app.listen(3000, () => {
    console.log("Server is running");
});
