import { createAuthClient } from "better-auth/react"
import { jwtClient } from "better-auth/client/plugins";

export const authClient =  createAuthClient({
  // 2. ADD THE PLUGIN to the client instance
  plugins: [jwtClient()],
})