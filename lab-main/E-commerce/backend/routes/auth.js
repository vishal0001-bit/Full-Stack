import { Router } from "express";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, addresses: user.addresses || [] });
const tokenFor = (user) => jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 60) return res.status(400).json({ message: "Name must be between 2 and 60 characters" });
    if (typeof email !== "string" || !emailPattern.test(email) || email.length > 254) return res.status(400).json({ message: "Enter a valid email address" });
    if (typeof password !== "string" || password.length < 8 || password.length > 128) return res.status(400).json({ message: "Password must be between 8 and 128 characters" });
    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password });
    res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
  } catch (error) { next(error); }
});

async function authenticate(req, res, next, roles) {
  try {
    const { email, password } = req.body;
    if (typeof email !== "string" || typeof password !== "string") return res.status(400).json({ message: "Email and password are required" });
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user || !(await user.comparePassword(password)) || !roles.includes(user.role)) {
      return res.status(401).json({ message: "Email or password is incorrect" });
    }
    res.json({ token: tokenFor(user), user: publicUser(user) });
  } catch (error) { next(error); }
}

router.post("/login", (req, res, next) => authenticate(req, res, next, ["customer"]));
router.post("/seller-login", (req, res, next) => authenticate(req, res, next, ["seller", "admin"]));

router.post("/forgot-password", async (req, res, next) => {
  try {
    const { SMTP_HOST, SMTP_USER, SMTP_PASS, MAIL_FROM, CLIENT_URL } = process.env;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !MAIL_FROM || !CLIENT_URL) {
      return res.status(503).json({ message: "Password reset email is not configured. Please contact store support." });
    }
    if (typeof req.body.email !== "string" || !emailPattern.test(req.body.email)) return res.status(400).json({ message: "Enter a valid email address" });
    const user = await User.findOne({ email: req.body.email.toLowerCase().trim() }).select("+passwordResetToken +passwordResetExpires");
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      user.passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");
      user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();
      const port = Number(process.env.SMTP_PORT) || 587;
      const transporter = nodemailer.createTransport({ host: SMTP_HOST, port, secure: process.env.SMTP_SECURE === "true", auth: { user: SMTP_USER, pass: SMTP_PASS } });
      try {
        await transporter.sendMail({
          from: MAIL_FROM, to: user.email, subject: "Reset your ShopEase password",
          text: `Use this link within 30 minutes to reset your ShopEase password: ${CLIENT_URL.replace(/\/$/, "")}/reset-password?token=${token}`,
        });
      } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        throw error;
      }
    }
    res.json({ message: "If an account exists for that email, a password reset link is on its way." });
  } catch (error) { next(error); }
});

router.post("/reset-password", async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (typeof token !== "string" || token.length !== 64 || typeof password !== "string" || password.length < 8 || password.length > 128) {
      return res.status(400).json({ message: "Enter a valid reset link and a password of at least 8 characters" });
    }
    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({ passwordResetToken: hashed, passwordResetExpires: { $gt: new Date() } }).select("+passwordResetToken +passwordResetExpires");
    if (!user) return res.status(400).json({ message: "This password reset link is invalid or has expired" });
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json({ message: "Your password has been updated. You can sign in now." });
  } catch (error) { next(error); }
});

router.get("/me", requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

router.patch("/profile", requireAuth, async (req, res, next) => {
  try {
    const updates = {};
    if (typeof req.body.name === "string") {
      if (req.body.name.trim().length < 2 || req.body.name.trim().length > 60) return res.status(400).json({ message: "Name must be between 2 and 60 characters" });
      updates.name = req.body.name.trim();
    }
    if (typeof req.body.phone === "string") {
      if (req.body.phone.length > 20) return res.status(400).json({ message: "Phone number must be 20 characters or fewer" });
      updates.phone = req.body.phone.trim();
    }
    if (!Object.keys(updates).length) return res.status(400).json({ message: "There are no profile changes to save" });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ user: publicUser(user) });
  } catch (error) { next(error); }
});

const addressFields = ["label", "fullName", "phone", "line1", "city", "state", "postalCode"];
function cleanAddress(body) {
  const address = {};
  for (const field of addressFields) {
    const value = body[field];
    if (field === "label" && value === undefined) { address.label = "Home"; continue; }
    const maxLength = field === "line1" ? 160 : field === "label" ? 30 : field === "postalCode" ? 12 : field === "phone" ? 20 : 80;
    if (typeof value !== "string" || !value.trim() || value.length > maxLength) return null;
    address[field] = value.trim();
  }
  return address;
}

router.post("/addresses", requireAuth, async (req, res, next) => {
  try {
    const address = cleanAddress(req.body);
    if (!address) return res.status(400).json({ message: "Please complete all delivery address fields" });
    const user = await User.findById(req.user._id);
    if (user.addresses.length >= 10) return res.status(400).json({ message: "You can save up to 10 delivery addresses" });
    user.addresses.push(address);
    await user.save();
    res.status(201).json({ user: publicUser(user) });
  } catch (error) { next(error); }
});

router.patch("/addresses/:addressId", requireAuth, async (req, res, next) => {
  try {
    const address = cleanAddress(req.body);
    if (!address) return res.status(400).json({ message: "Please complete all delivery address fields" });
    const user = await User.findById(req.user._id);
    const existing = user.addresses.id(req.params.addressId);
    if (!existing) return res.status(404).json({ message: "Saved address not found" });
    existing.set(address);
    await user.save();
    res.json({ user: publicUser(user) });
  } catch (error) { next(error); }
});

router.delete("/addresses/:addressId", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const existing = user.addresses.id(req.params.addressId);
    if (!existing) return res.status(404).json({ message: "Saved address not found" });
    existing.deleteOne();
    await user.save();
    res.json({ user: publicUser(user) });
  } catch (error) { next(error); }
});

export default router;
