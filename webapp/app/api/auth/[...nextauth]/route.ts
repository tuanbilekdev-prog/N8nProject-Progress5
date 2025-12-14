import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";

// In production, you should use a database
// For now, we'll use a simple in-memory store
// You can replace this with your database
const users = [
  {
    id: "1",
    email: "admin@example.com",
    password: "$2a$10$rOzJqJqJqJqJqJqJqJqJqO", // "password" hashed
    name: "Admin User"
  }
];

// Initialize with a default password hash
// In production, you should hash passwords when creating users
const defaultPassword = "password";
let defaultPasswordHash: string | null = null;

async function getDefaultPasswordHash() {
  if (!defaultPasswordHash) {
    defaultPasswordHash = await bcrypt.hash(defaultPassword, 10);
  }
  return defaultPasswordHash;
}

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

      // For demo purposes: allow any username/email with password "password"
      // In production, you should use a database and properly hash passwords
      if (credentials.password === "password") {
        return {
          id: "demo-user",
          email: credentials.username,
          name: credentials.username
        };
      }

      // Check if user exists in the users array (for admin@example.com)
      const user = users.find(
        u => u.email === credentials.username
      );

      if (user) {
        // For demo, also allow "password" for admin user
        if (credentials.password === "password") {
          return {
            id: user.id,
            email: user.email,
            name: user.name
          };
        }
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
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
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

