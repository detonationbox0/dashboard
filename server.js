import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { google } from "googleapis";
import dotenv from "dotenv";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";
import createAuthRouter from "./routes/auth.js";

// Load environment variables
dotenv.config();

const app = express();

// Postgres connection pool for app data + session store.
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const PgSession = connectPgSimple(session);
const isProd = process.env.NODE_ENV === "production";

// Trust the first proxy so secure cookies work behind a reverse proxy.
app.set("trust proxy", 1);
app.use(session({
    store: new PgSession({
        pool,
        tableName: "session",
        createTableIfMissing: false
    }),
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: isProd,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 30
    }
}));

// Create static file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the built client app.
app.use(express.static(path.join(__dirname, "dist")));

// Mount the auth router, passing the database pool for user lookups.
app.use("/auth", createAuthRouter({ pool }));

app.get("/api/inbox", async (req, res) => {
    // #region Route to receive all emails
    const userId = req.session.userId;
    if (!userId) return res.status(401).send("Unauthorized");
    try {
        const gmail = await getGmailClientForUser(userId);
        // Pull a small page of recent messages and normalize a compact response.
        const list = await gmail.users.messages.list({ userId: "me", maxResults: 10 });
        const items = list.data.messages || [];

        if (!items.length) {
            return res.json({ messages: [] });
        }

        const messages = await Promise.all(
            items.map(async ({ id, threadId }) => {
                const response = await gmail.users.messages.get({
                    userId: "me",
                    id,
                    format: "metadata",
                    metadataHeaders: ["To", "From", "Subject"]
                });
                const headers = response.data.payload?.headers || [];
                const headerMap = headers.reduce((acc, header) => {
                    if (header?.name) acc[header.name.toLowerCase()] = header.value || "";
                    return acc;
                }, {});

                return {
                    id,
                    threadId: response.data.threadId || threadId,
                    to: headerMap.to || "",
                    from: headerMap.from || "",
                    subject: headerMap.subject || "",
                    snippet: response.data.snippet || ""
                };
            })
        );

        res.json({ messages });
    } catch (error) {
        console.error("Error fetching inbox:", error);
        res.status(500).send("Failed to load inbox");
    }
    // #endregion
});

app.get("/api/threads/:threadId", async (req, res, next) => {
    // #region Route to receive the latest message snippet for a thread
    const userId = req.session.userId;
    if (!userId) return res.status(401).send("Unauthorized");

    try {
        const gmail = await getGmailClientForUser(userId);
        const thread = await gmail.users.threads.get({
            userId: "me",
            id: req.params.threadId
        });
        const messages = thread.data.messages || [];
        if (!messages.length) return res.status(404).send("Thread has no messages");

        const latestMessage = messages[messages.length - 1];
        res.json({
            threadId: thread.data.id,
            messageId: latestMessage.id,
            snippet: latestMessage.snippet || ""
        });
    } catch (err) {
        next(err);
    }
    // #endregion
});

app.get("/hello", (req, res) => {
    res.status(200).send("hello world");
});

app.get(/.*/, (req, res) => {
    // SPA fallback for client-side routes.
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

async function getGmailClientForUser(userId) {
    // #region Get Gmail Client
    // Look up refresh token and create a Gmail client on-demand.
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
