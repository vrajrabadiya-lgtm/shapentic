import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    // ─── Credit / Plan fields (migrated from Supabase) ─────────────────
    plan: {
      type: String,
      enum: ["free", "starter", "growth", "pro"],
      default: "free",
    },
    builds_used: {
      type: Number,
      default: 0,
    },
    builds_limit: {
      type: Number,
      default: 3,
    },
    video_used: {
      type: Number,
      default: 0,
    },
    video_limit: {
      type: Number,
      default: 0,
    },
    builds_reset_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
