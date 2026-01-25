import express from "express";
import session from "express-session";
import { google } from "googleapis";
import dotenv from "dotenv";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

const app = express();

app.use(session({
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}))

// Postgress
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Google Auth
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Google Scopes
const SCOPES = [
  "openid",
  "email",
  "profile",
  "https://mail.google.com/"
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "dist")));

// Send user to Google 
app.get("/auth/google", (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: SCOPES,
    });
    res.redirect(url);
});

// Google redirects back with code
app.get("/auth/google/callback", async (req, res) => {
    // #region Google redirects back with code
    const code = req.query.code;
    if (!code) return res.status(400).send("Missing code");

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user profile (sub/email)
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const googleSub = userInfo.data.id;
    const email = userInfo.data.email;

    // Upsert user + tokens to DB
    const client = await pool.connect();
    try {
        const userRes = await client.query(
            `
            insert into users (google_sub, email)
            values ($1, $2)
            on conflict (google_sub) do update set email = excluded.email
            returning id
            `,
            [googleSub, email]
        );

        const userId = userRes.rows[0].id;
        req.session.userId = userId;

        if (tokens.refresh_token) {
            await client.query(
                `
                insert into google_tokens (user_id, refresh_token, scope, token_type, expiry_date)
                values ($1, $2, $3, $4, $5)
                on conflict (user_id) do update set
                    refresh_token = excluded.refresh_token,
                    scope = excluded.scope,
                    token_type = excluded.token_type,
                    expiry_date = excluded.expiry_date,
                    updated_at = now()
                `,
                [ userId, tokens.refresh_token, tokens.scope, tokens.token_type, tokens.expiry_date ]
            );
        }
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }

    res.redirect("/");
    // #endregion
});

// Route to receive all emails
app.get("/api/inbox", async (req, res) => {
    // #region Route to receive all emails
    const userId = req.session.userId;
    if (!userId) return res.status(401).send("Unauthorized");
    const gmail = await getGmailClientForUser(userId);
    const list = await gmail.users.messages.list({ userId: "me", maxResults: 10 });
    res.json(list.data);
    // #endregion
});

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Get Gmail Client
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
