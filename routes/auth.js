import express from "express";
import { google } from "googleapis";

const SCOPES = [
    "openid",
    "email",
    "profile",
    "https://mail.google.com/"
];

export default function createAuthRouter({ pool }) {
    const router = express.Router();
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    /**
     * Start the Google OAuth flow.
     *
     * @route GET /auth/google
     * @summary Redirects the user to Google's OAuth consent screen
     * @returns {void} 302 - Redirects to Google
     */
    router.get("/google", (req, res) => {
        const url = oauth2Client.generateAuthUrl({
            access_type: "offline",
            prompt: "consent",
            scope: SCOPES,
        });
        res.redirect(url);
    });

    /**
     * Handle Google's OAuth callback.
     *
     * @route GET /auth/google/callback
     * @summary Exchanges auth code for tokens and stores the user session
     * @param {string} code.query.required - Authorization code from Google
     * @returns {void} 302 - Redirects to the app
     * @returns {Error} 400 - Missing code
     * @returns {Error} 500 - Unexpected server error
     */
    router.get("/google/callback", async (req, res, next) => {
        // #region Google redirects back with code
        const code = req.query.code;
        if (!code) return res.status(400).send("Missing code");

        try {
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
                await client.query("COMMIT");
            } catch (err) {
                await client.query("ROLLBACK");
                throw err;
            } finally {
                client.release();
            }

            res.redirect("/");
        } catch (err) {
            next(err);
        }
        // #endregion
    });

    return router;
}
