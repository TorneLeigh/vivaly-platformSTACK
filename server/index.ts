import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import cors from "cors";
import * as Sentry from "@sentry/node";

import { registerRoutes } from "./routes";
import { startPaymentReleaseCron } from "./cron-jobs";
import { setupVite, serveStatic, log } from "./vite";

import "./types";

const app = express();

if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN });
  app.use(Sentry.Handlers.requestHandler());
}

app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true
}));

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

const PgStore = connectPg(session);
app.use(session({
  store: new PgStore({ conString: process.env.DATABASE_URL }),
  secret: process.env.SESSION_SECRET || "change-this-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: "lax"
  }
}));

registerRoutes(app);
serveStatic(app);
startPaymentReleaseCron();

app.use(Sentry.Handlers.errorHandler());
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Unexpected server error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  log(`✅ Server running on port ${PORT}`);
});
