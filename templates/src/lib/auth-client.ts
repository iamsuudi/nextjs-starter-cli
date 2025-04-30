import { createAuthClient } from "better-auth/client";
import { auth } from "./auth";

export const authClient = createAuthClient(auth);
