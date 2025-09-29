// server.js
import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import cors from "cors";
import bodyParser from "body-parser";
import Database from "better-sqlite3";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// =====================
// Config
// =====================
const PORT = process.env.PORT || 5001;
const ENV = process.env.ENVIRONMENT || "sandbox";
const CONSUMER_KEY = process.env.CONSUMER_KEY;
const CONSUMER_SECRET = process.env.CONSUMER_SECRET;
const SHORTCODE = process.env.SHORTCODE;
const PASSKEY = process.env.PASSKEY;
const CALLBACK_URL = process.env.CALLBACK_URL;

if (!CONSUMER_KEY || !CONSUMER_SECRET || !SHORTCODE || !PASSKEY || !CALLBACK_URL) {
  console.error(
    "❌ Please set CONSUMER_KEY, CONSUMER_SECRET, SHORTCODE, PASSKEY and CALLBACK_URL in .env"
  );
  process.exit(1);
}

// Choose base URL depending on environment
const BASE_URL =
  ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

const AUTH_URL = `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`;
const STK_PUSH_URL = `${BASE_URL}/mpesa/stkpush/v1/processrequest`;

// =====================
// Simple token cache
// =====================
let tokenCache = { token: null, expiry: 0 };

async function getAccessToken() {
  if (tokenCache.token && Date.now() < tokenCache.expiry) {
    return tokenCache.token;
  }
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
  const resp = await axios.get(AUTH_URL, {
    headers: { Authorization: `Basic ${auth}` },
  });
  const token = resp.data.access_token;
  tokenCache.token = token;
  tokenCache.expiry = Date.now() + 3500 * 1000; // ~1 hour
  return token;
}

// =====================
// Helpers
// =====================
function getTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
    now.getDate()
  )}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

// =====================
// DB Init (SQLite)
// =====================
const db = new Database("./mpesa_demo.db");

db.prepare(
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    phone TEXT,
    wallet_balance REAL DEFAULT 0
  )`
).run();

db.prepare(
  `CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    checkout_request_id TEXT,
    merchant_request_id TEXT,
    user_id TEXT,
    phone TEXT,
    amount REAL,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`
).run();

// Create a sample demo user if not exists
const demoUserId = "user-demo-1";
const check = db.prepare("SELECT COUNT(*) as c FROM users WHERE id = ?").get(demoUserId);
if (check.c === 0) {
  db.prepare("INSERT INTO users (id, name, phone, wallet_balance) VALUES (?,?,?,?)").run(
    demoUserId,
    "Demo User",
    "254712345678",
    0
  );
  console.log("Inserted demo user with id:", demoUserId);
}

// =====================
// Routes
// =====================

// 1. STK Push
app.post("/api/stkpush", async (req, res) => {
  try {
    const { phone, amount, userId } = req.body;
    if (!phone || !amount) return res.status(400).json({ error: "phone and amount are required" });

    if (!/^(?:\+?254|0)7\d{8}$/.test(String(phone).trim())) {
      return res.status(400).json({ error: "Invalid Kenyan phone number format" });
    }

    const amt = Number(amount);
    if (!amt || amt <= 0) return res.status(400).json({ error: "Invalid amount" });

    const token = await getAccessToken();
    const timestamp = getTimestamp();
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString("base64");

    const payload = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amt,
      PartyA: phone.replace(/^\+/, ""),
      PartyB: SHORTCODE,
      PhoneNumber: phone.replace(/^\+/, ""),
      CallBackURL: CALLBACK_URL,
      AccountReference: `wallet:${userId || "unknown"}`,
      TransactionDesc: "Wallet deposit",
    };

    const mpesaResp = await axios.post(STK_PUSH_URL, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const rv = mpesaResp.data;
    const checkoutRequestID = rv.CheckoutRequestID || null;
    const merchantRequestID = rv.MerchantRequestID || null;

    db.prepare(
      `INSERT INTO transactions 
        (checkout_request_id, merchant_request_id, user_id, phone, amount, status)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(checkoutRequestID, merchantRequestID, userId || demoUserId, phone, amt, "PENDING");

    return res.json({ success: true, data: rv });
  } catch (err) {
    console.error("STK Push error:", err.response?.data || err.message);
    return res
      .status(500)
      .json({ success: false, error: err.response?.data || err.message });
  }
});

// 2. Callback from Safaricom
app.post("/api/mpesa/callback", (req, res) => {
  try {
    const body = req.body;
    console.log("📩 MPESA CALLBACK RECEIVED:", JSON.stringify(body, null, 2));

    const stk = body?.Body?.stkCallback;
    if (!stk) return res.status(400).send("No stkCallback");

    const { MerchantRequestID, CheckoutRequestID, ResultCode, CallbackMetadata } = stk;

    const tx = db
      .prepare("SELECT * FROM transactions WHERE checkout_request_id = ?")
      .get(CheckoutRequestID);

    let paidAmount = null;
    if (CallbackMetadata && Array.isArray(CallbackMetadata.Item)) {
      CallbackMetadata.Item.forEach((item) => {
        if (item.Name === "Amount") paidAmount = item.Value;
      });
    }

    const newStatus = ResultCode === 0 ? "COMPLETED" : "FAILED";
    db.prepare(
      "UPDATE transactions SET merchant_request_id = ?, status = ?, amount = COALESCE(?, amount) WHERE checkout_request_id = ?"
    ).run(MerchantRequestID, newStatus, paidAmount, CheckoutRequestID);

    if (newStatus === "COMPLETED" && tx) {
      const userId = tx.user_id;
      const amt = paidAmount || tx.amount || 0;
      db.prepare("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?").run(
        amt,
        userId
      );
      console.log(`✅ Updated wallet for user ${userId} by ${amt}`);
    }

    return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (err) {
    console.error("Callback handling error:", err);
    return res.status(500).send("Error");
  }
});

// 3. Get User Info
app.get("/api/user/:id", (req, res) => {
  const id = req.params.id;
  const user = db
    .prepare("SELECT id, name, phone, wallet_balance FROM users WHERE id = ?")
    .get(id);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({ user });
});

// =====================
// Start Server
// =====================
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
