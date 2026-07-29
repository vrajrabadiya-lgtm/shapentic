// Must load first so EMAIL_* / MONGO_URI exist before route modules read them
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import designRoutes from "./routes/designs.js";
import contactRoutes from "./routes/contactRoutes.js";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import aiRoutes from "./routes/ai.js";

const app = express();
const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/3d-builder";

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:3000",
  // CLIENT_ORIGIN = your Vercel deployment URL (set in Render env vars)
  process.env.CLIENT_ORIGIN,
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, same-origin) or allowed origins
    // Also allow any vercel.app subdomain for preview deployments
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      /\.vercel\.app$/.test(origin) ||
      /\.onrender\.com$/.test(origin)
    ) {
      callback(null, true);
    } else {
      console.warn(`[CORS Warning] Origin disallowed: ${origin}`);
      callback(null, true); // Fallback allow to prevent preflight blockage during development
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api/designs", designRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "3D Web Builder API is active.",
    endpoints: {
      saveDesign: "POST /api/designs",
      getDesigns: "GET /api/designs/:userId",
      deleteDesign: "DELETE /api/designs/:id",
      submitContactMessage: "POST /api/contact",
      projectRoutes: "CRUD /api/projects"
    }
  });
});

// Global error handling middleware (ensures standard JSON response on exceptions)
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err.stack || err.message || err);
  res.status(500).json({ message: err.message || "Internal server error." });
});

// Database connection & Server startup — skipped when imported by tests
async function startServer() {
  // Start listening regardless of DB status
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} (no DB required)`);
  });

  if (process.env.NODE_ENV !== "test") {
    try {
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 5000, // 5 second timeout
      });
      console.log("Connected to MongoDB Atlas / Local Database successfully.");
    } catch (err) {
      console.warn("Database connection error:", err.message);
      console.warn("Server started without MongoDB. Database-dependent routes will return errors.");
    }
  }
}

startServer();

export default app;
