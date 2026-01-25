import express from "express";
import session from "express-session";
import { google } from "googleapis";
import dotenv from "dotenv";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";
import createAuthRouter from "./routes/auth.js";

const app = express();

// Create session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}))

// Load environment variables
dotenv.config();

// Postgress
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create static file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the dist folder
app.use(express.static(path.join(__dirname, "dist")));

// Mount the auth router, passing the database pool
app.use("/auth", createAuthRouter({ pool }));

app.get("/api/inbox", async (req, res) => {
    // #region Route to receive all emails
    const userId = req.session.userId;
    if (!userId) return res.status(401).send("Unauthorized");
    const gmail = await getGmailClientForUser(userId);
    const list = await gmail.users.messages.list({ userId: "me", maxResults: 10 });
    res.json(list.data);
    // #endregion
});

app.get("/hello", (req, res) => {
    res.status(200).send("hello world");
});

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

async function getGmailClientForUser(userId) {
    // #region Get Gmail Client
    const { rows } = await pool.query(
        'select refresh_token from google_tokens where user_id = $1',
        [userId]
    );
    if (!rows.length) throw new Error("No refresh token");
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
    oauth2Client.setCredentials({ refresh_token: rows[0].refresh_token });
    return google.gmail({ version: "v1", auth: oauth2Client });
    // #endregion
}

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
