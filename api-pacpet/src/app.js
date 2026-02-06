import express from "express";
import "dotenv/config"
import "./config/database.js";
import "./mqtt/feedingSubscriber.js";
import cors from "cors";
import feedingRoutes from "./routes/feedingRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
app.use(cors()); 
app.use(express.json());

app.use(express.json());
app.use("/api", feedingRoutes);
app.use("/auth", authRoutes);

export default app;
