// Delegate sign-out to the NextAuth handler, which this specific route would otherwise shadow.
import { handlers } from "@/auth";

export const { POST } = handlers;
