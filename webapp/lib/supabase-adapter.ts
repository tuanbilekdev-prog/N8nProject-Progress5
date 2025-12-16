import { Adapter } from "next-auth/adapters";
import { Pool } from "pg";

// Supabase connection pool
let pool: Pool | null = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      host: process.env.SUPABASE_DB_HOST,
      port: parseInt(process.env.SUPABASE_DB_PORT || "5432"),
      database: process.env.SUPABASE_DB_NAME || "postgres",
      user: process.env.SUPABASE_DB_USER,
      password: process.env.SUPABASE_DB_PASSWORD,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }
  return pool;
}

export function SupabaseAdapter(): Adapter {
  const db = getPool();

  return {
    async createUser(user) {
      const result = await db.query(
        `INSERT INTO users (id, name, email, email_verified, image, created_at, updated_at)
         VALUES (gen_random_uuid()::TEXT, $1, $2, $3, $4, NOW(), NOW())
         RETURNING id, name, email, email_verified, image`,
        [user.name, user.email, user.emailVerified, user.image]
      );
      return {
        id: result.rows[0].id,
        name: result.rows[0].name,
        email: result.rows[0].email,
        emailVerified: result.rows[0].email_verified,
        image: result.rows[0].image
      };
    },

    async getUser(id) {
      const result = await db.query(
        `SELECT id, name, email, email_verified, image FROM users WHERE id = $1`,
        [id]
      );
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        emailVerified: row.email_verified,
        image: row.image
      };
    },

    async getUserByEmail(email) {
      const result = await db.query(
        `SELECT id, name, email, email_verified, image FROM users WHERE email = $1`,
        [email]
      );
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        emailVerified: row.email_verified,
        image: row.image
      };
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const result = await db.query(
        `SELECT u.id, u.name, u.email, u.email_verified, u.image
         FROM users u
         JOIN accounts a ON u.id = a.user_id
         WHERE a.provider = $1 AND a.provider_account_id = $2`,
        [provider, providerAccountId]
      );
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        emailVerified: row.email_verified,
        image: row.image
      };
    },

    async updateUser(user) {
      const result = await db.query(
        `UPDATE users SET name = $1, email = $2, email_verified = $3, image = $4, updated_at = NOW()
         WHERE id = $5
         RETURNING id, name, email, email_verified, image`,
        [user.name, user.email, user.emailVerified, user.image, user.id]
      );
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        emailVerified: row.email_verified,
        image: row.image
      };
    },

    async linkAccount(account) {
      await db.query(
        `INSERT INTO accounts (
          id, user_id, type, provider, provider_account_id,
          refresh_token, access_token, expires_at, token_type, scope, id_token, session_state
        ) VALUES (
          gen_random_uuid()::TEXT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        )`,
        [
          account.userId,
          account.type,
          account.provider,
          account.providerAccountId,
          account.refresh_token,
          account.access_token,
          account.expires_at,
          account.token_type,
          account.scope,
          account.id_token,
          account.session_state
        ]
      );
      return account;
    },

    async createSession({ sessionToken, userId, expires }) {
      const result = await db.query(
        `INSERT INTO sessions (id, session_token, user_id, expires)
         VALUES (gen_random_uuid()::TEXT, $1, $2, $3)
         RETURNING id, session_token, user_id, expires`,
        [sessionToken, userId, expires]
      );
      const row = result.rows[0];
      return {
        sessionToken: row.session_token,
        userId: row.user_id,
        expires: row.expires
      };
    },

    async getSessionAndUser(sessionToken) {
      const result = await db.query(
        `SELECT s.id, s.session_token, s.user_id, s.expires,
                u.id as user_id, u.name, u.email, u.email_verified, u.image
         FROM sessions s
         JOIN users u ON s.user_id = u.id
         WHERE s.session_token = $1 AND s.expires > NOW()`,
        [sessionToken]
      );
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        session: {
          sessionToken: row.session_token,
          userId: row.user_id,
          expires: row.expires
        },
        user: {
          id: row.user_id,
          name: row.name,
          email: row.email,
          emailVerified: row.email_verified,
          image: row.image
        }
      };
    },

    async updateSession({ sessionToken, ...session }) {
      const result = await db.query(
        `UPDATE sessions SET user_id = $1, expires = $2
         WHERE session_token = $3
         RETURNING id, session_token, user_id, expires`,
        [session.userId, session.expires, sessionToken]
      );
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        sessionToken: row.session_token,
        userId: row.user_id,
        expires: row.expires
      };
    },

    async deleteSession(sessionToken) {
      await db.query(`DELETE FROM sessions WHERE session_token = $1`, [sessionToken]);
    },

    async createVerificationToken({ identifier, token, expires }) {
      await db.query(
        `INSERT INTO verification_tokens (identifier, token, expires)
         VALUES ($1, $2, $3)`,
        [identifier, token, expires]
      );
      return { identifier, token, expires };
    },

    async useVerificationToken({ identifier, token }) {
      const result = await db.query(
        `DELETE FROM verification_tokens
         WHERE identifier = $1 AND token = $2
         RETURNING identifier, token, expires`,
        [identifier, token]
      );
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        identifier: row.identifier,
        token: row.token,
        expires: row.expires
      };
    }
  };
}

