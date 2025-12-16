import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { getUserByEmail, createUser } from "@/lib/supabase";
import { randomUUID } from "crypto";

// Check if Supabase is configured
const useSupabase = !!(
  (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) &&
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)
);

// Build providers array conditionally
const providers = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      username: { label: "Username", type: "text" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      if (!credentials?.username || !credentials?.password) {
        return null;
      }

      // If Supabase is configured, check database
      if (useSupabase) {
        try {
          const user = await getUserByEmail(credentials.username);

          if (!user) {
            console.log("User not found:", credentials.username);
            return null;
          }
          
          // Check password
          if (user.password) {
            const isValid = await bcrypt.compare(credentials.password, user.password);
            if (!isValid) {
              console.log("Password mismatch for user:", credentials.username);
              return null;
            }
          } else {
            // If no password set, allow "password" for demo
            if (credentials.password !== "password") {
              console.log("No password set and password is not 'password'");
              return null;
            }
          }

          console.log("Login successful for user:", user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name
          };
        } catch (error) {
          console.error("Database error during login:", error);
          return null;
        }
      }

      // Fallback: demo mode (if Supabase not configured)
      if (credentials.password === "password") {
        return {
          id: "demo-user",
          email: credentials.username,
          name: credentials.username
        };
      }

      return null;
    }
  })
];

// Only add Google Provider if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt", // Use JWT for simplicity, Supabase JS client handles data
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google OAuth - create user in database if not exists
      if (account?.provider === "google" && useSupabase && user.email) {
        try {
          // Check if user already exists
          let dbUser = await getUserByEmail(user.email);
          
          if (!dbUser) {
            // Create new user from Google OAuth
            console.log("Creating new user from Google OAuth:", user.email);
            const newUser = await createUser(
              user.name || user.email.split("@")[0], // Use name or email prefix as name
              user.email,
              "" // No password for OAuth users
            );
            
            // Update user object with database ID
            user.id = newUser.id;
            console.log("User created successfully:", newUser.id);
          } else {
            // User exists, use existing ID
            user.id = dbUser.id;
            console.log("User already exists:", dbUser.id);
          }
          
          // Save account info to accounts table if needed
          if (account && user.id) {
            try {
              const { getSupabaseClient } = await import("@/lib/supabaseClient");
              const supabase = getSupabaseClient();
              const { error: accountError } = await supabase
                .from('accounts')
                .upsert({
                  id: randomUUID(),
                  user_id: user.id,
                  type: account.type,
                  provider: account.provider,
                  provider_account_id: account.providerAccountId,
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state
                }, {
                  onConflict: 'provider,provider_account_id'
                });
              
              if (accountError) {
                console.error("Error saving account:", accountError);
              }
            } catch (err) {
              console.error("Error importing supabase client:", err);
            }
          }
        } catch (error) {
          console.error("Error in signIn callback:", error);
          // Don't block sign in if database error
        }
      }
      
      return true; // Allow sign in
    },
    async jwt({ token, user, account }) {
      // If user object exists (from signIn), use its ID
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      
      // If Google OAuth and user ID not set, try to get from database
      if (account?.provider === "google" && !token.id && token.email && useSupabase) {
        try {
          const dbUser = await getUserByEmail(token.email as string);
          if (dbUser) {
            token.id = dbUser.id;
            token.name = dbUser.name || token.name;
          }
        } catch (error) {
          console.error("Error getting user in jwt callback:", error);
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && token.id) {
        session.user.id = token.id as string;
        if (token.email) session.user.email = token.email as string;
        if (token.name) session.user.name = token.name as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development"
};

// Validate that secret is set
if (!process.env.NEXTAUTH_SECRET) {
  console.error("⚠️  WARNING: NEXTAUTH_SECRET is not set in environment variables!");
  console.error("   Please add NEXTAUTH_SECRET to your .env.local file");
  console.error("   You can generate one by running: .\\setup-env.ps1");
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

