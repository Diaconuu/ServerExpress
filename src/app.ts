import express, { Request, Response, NextFunction } from "express";
import auth from "./routes/auth";
import insertions from "./routes/insertions";
import exchanges from "./routes/exchanges";
import cors from 'cors';

export const app = express();
app.use(cors());
app.use(express.json());
app.use("/", auth);
app.use("/insertions", insertions);
app.use("/exchanges", exchanges);

const PORT = process.env.PORT || 3000;

app.listen(3000, () => {
    console.log("Server is running");
});