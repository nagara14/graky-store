import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's role. */
            role: string
            id: string
        } & DefaultSession["user"]
    }

    /**
     * The shape of the user object returned in the OAuth providers' `profile` callback,
     * or the second parameter of the `session` callback, when using a database.
     */
    interface User {
        role?: string
        id: string
        email: string
        name?: string | null
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role?: string
        id?: string
    }
}

declare module "@auth/core/adapters" {
    interface AdapterUser {
        role?: string
    }
}

