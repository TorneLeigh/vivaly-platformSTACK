import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";

import { insertUserSchema } from "../shared/schema";
import { requireAuth } from "./auth-middleware";
import { sendPasswordResetEmail } from "./email-service";

export async function registerRoutes(app: Express): Promise<Server> {
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const upload = multer({ dest: "uploads/" });
  app.use("/uploads", express.static("uploads"));

  // Test route
  app.get("/api/test", (req, res) => {
    res.json({ message: "API is working!" });
  });

  // Registration route
  app.post("/api/register", async (req, res) => {
    try {
      const validationResult = insertUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid input",
          details: validationResult.error.errors,
        });
      }

      const { email, password, firstName, lastName, phone, isNanny, isCaregiver } =
        validationResult.data;

      const hashedPassword = await bcrypt.hash(password, 12);

      // TODO: Replace with actual DB insert
      const user = {
        id: randomUUID(),
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        isNanny,
        isCaregiver,
        createdAt: new Date(),
      };

      console.log("✅ Registered user:", user);
      res.status(200).json({ message: "Account created successfully", user });
    } catch (err) {
      console.error("❌ Registration error:", err);
      res.status(500).json({ message: "Server error during registration" });
    }
  });

  return createServer(app);
}
