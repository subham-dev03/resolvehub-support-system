import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";

import authRoutes from "./routes/auth.js";
import ticketRoutes from "./routes/tickets.js";
import userRoutes from "./routes/users.js";
import categoryRoutes from "./routes/categories.js";
import { seedAdmin } from "./seed.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173"
  })
);

app.use(express.json());

app.use(
  "/uploads",
  express.static(
    path.join(process.cwd(), "uploads")
  )
);

app.get("/", (req, res) =>
  res.json({
    message: "HelpDesk API is running"
  })
);

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/tickets",
  ticketRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/categories",
  categoryRoutes
);

const PORT =
  process.env.PORT || 5000;

mongoose
  .connect(
    process.env.MONGO_URI ||
      "mongodb://127.0.0.1:27017/helpdesk"
  )
  .then(async () => {
    console.log("MongoDB connected");

    await seedAdmin();

    app.listen(
      PORT,
      () =>
        console.log(
          `Server running on http://localhost:${PORT}`
        )
    );
  })
  .catch((err) => {
    console.error(
      "MongoDB connection failed:",
      err.message
    );

    process.exit(1);
  });