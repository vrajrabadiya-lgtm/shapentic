import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "3d_studio_secret_key_change_in_prod";
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Email transporter ───────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.hostinger.com",
  port: parseInt(process.env.EMAIL_PORT || "465"),
  secure: true,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

function sendWelcomeEmail(name, email) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Shapentic</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Logo / Brand -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <div style="display:inline-block;background:linear-gradient(135deg,#2997ff,#0071e3);border-radius:16px;padding:12px 24px;">
                <span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Shapentic</span>
              </div>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background:#161617;border-radius:24px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">

              <!-- Hero gradient bar -->
              <div style="height:4px;background:linear-gradient(90deg,#2997ff,#0071e3,#30d158);"></div>

              <table width="100%" cellpadding="0" cellspacing="0">
                <!-- Greeting -->
                <tr>
                  <td style="padding:40px 40px 0;">
                    <p style="margin:0 0 8px;color:#86868b;font-size:13px;font-weight:500;letter-spacing:0.5px;text-transform:uppercase;">Welcome aboard</p>
                    <h1 style="margin:0 0 16px;color:#f5f5f7;font-size:32px;font-weight:700;letter-spacing:-0.5px;line-height:1.2;">Hello, ${name} 👋</h1>
                    <p style="margin:0;color:#86868b;font-size:16px;line-height:1.6;">We're thrilled to have you join <strong style="color:#f5f5f7;">Shapentic</strong> — the next-generation platform for AI-powered 3D design and website creation.</p>
                  </td>
                </tr>

                <!-- Divider -->
                <tr><td style="padding:32px 40px;"><div style="height:1px;background:rgba(255,255,255,0.08);"></div></td></tr>

                <!-- Features -->
                <tr>
                  <td style="padding:0 40px;">
                    <p style="margin:0 0 20px;color:#f5f5f7;font-size:17px;font-weight:600;">What you can do with Shapentic</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:12px 16px;background:#1c1c1e;border-radius:12px;margin-bottom:10px;display:block;">
                          <span style="color:#2997ff;font-size:18px;">✦</span>
                          <span style="color:#f5f5f7;font-size:14px;font-weight:500;margin-left:10px;">Generate full websites with AI in seconds</span>
                        </td>
                      </tr>
                      <tr><td style="height:8px;"></td></tr>
                      <tr>
                        <td style="padding:12px 16px;background:#1c1c1e;border-radius:12px;">
                          <span style="color:#30d158;font-size:18px;">✦</span>
                          <span style="color:#f5f5f7;font-size:14px;font-weight:500;margin-left:10px;">Build and customize 3D design elements</span>
                        </td>
                      </tr>
                      <tr><td style="height:8px;"></td></tr>
                      <tr>
                        <td style="padding:12px 16px;background:#1c1c1e;border-radius:12px;">
                          <span style="color:#ff9f0a;font-size:18px;">✦</span>
                          <span style="color:#f5f5f7;font-size:14px;font-weight:500;margin-left:10px;">Access premium templates and presets</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- CTA Button -->
                <tr>
                  <td style="padding:32px 40px;">
                    <a href="https://www.shapentic.com" style="display:inline-block;background:linear-gradient(135deg,#2997ff,#0071e3);color:#fff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:980px;letter-spacing:-0.2px;">Start Creating →</a>
                  </td>
                </tr>

                <!-- Divider -->
                <tr><td style="padding:0 40px;"><div style="height:1px;background:rgba(255,255,255,0.08);"></div></td></tr>

                <!-- Footer note -->
                <tr>
                  <td style="padding:28px 40px 40px;">
                    <p style="margin:0;color:#86868b;font-size:13px;line-height:1.6;">If you have any questions, reply to this email or reach us at <a href="mailto:${process.env.EMAIL_USER}" style="color:#2997ff;text-decoration:none;">${process.env.EMAIL_USER}</a>. We're always here to help.</p>
                    <p style="margin:16px 0 0;color:#86868b;font-size:13px;">— The Shapentic Team</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Bottom footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;color:#3a3a3c;font-size:12px;">© 2025 Shapentic. All rights reserved.</p>
              <p style="margin:6px 0 0;color:#3a3a3c;font-size:12px;">You're receiving this because you created an account at shapentic.com</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  transporter.sendMail({
    from: `"Shapentic" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to Shapentic — Let's build something amazing ✦",
    html,
  }).catch(err => console.error("Welcome email error:", err.message));
}

// ─── Middleware: verify JWT token ────────────────────────────────────────────
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided." });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

// ─── SIGNUP ──────────────────────────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required." });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters." });

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered." });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: "7d" });

    sendWelcomeEmail(newUser.name, newUser.email);

    res.status(201).json({
      message: "Account created successfully!",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── LOGIN ───────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required." });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(404).json({ message: "No account found with this email." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect password." });

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── GET CURRENT USER (protected) ────────────────────────────────────────────
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── UPDATE PROFILE NAME (protected) ─────────────────────────────────────────
router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ message: "Name is required." });

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name: name.trim() },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found." });
    res.status(200).json({ message: "Name updated successfully.", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── UPDATE PASSWORD (protected) ─────────────────────────────────────────────
router.put("/update-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Both current and new password are required." });
    if (newPassword.length < 6)
      return res.status(400).json({ message: "New password must be at least 6 characters." });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect." });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── GOOGLE OAUTH ────────────────────────────────────────────────────────────
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: "Google credential is required." });

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;

    // Find or create user
    let user = await User.findOne({ email: email.toLowerCase() });
    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      user = new User({
        name: name.trim(),
        email: email.toLowerCase(),
        password: await bcrypt.hash(googleId + JWT_SECRET, 10), // non-usable password
        googleId,
        avatar: picture,
      });
      await user.save();
    } else {
      // Update google fields if missing
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = picture;
        await user.save();
      }
    }

    user.lastLogin = new Date();
    await user.save();

    if (isNewUser) sendWelcomeEmail(user.name, user.email);

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.status(200).json({
      message: "Google sign-in successful!",
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (error) {
    console.error("Google auth error:", error.message);
    res.status(401).json({ message: "Invalid Google credential." });
  }
});

export default router;
