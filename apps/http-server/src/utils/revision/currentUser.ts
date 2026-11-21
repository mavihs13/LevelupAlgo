import { Users } from "@repo/database/db";
import type { Request } from "express";

interface RevisionAuthRequest extends Request {
    user?: { email: string; isVerified?: boolean };
}

/** Return the signed-in user document (AuthMiddleware already validated the JWT). */
export async function getCurrentUser(req: RevisionAuthRequest) {
    const email = req.user?.email;
    if (!email) return null;
    return Users.findOne({ email });
}
