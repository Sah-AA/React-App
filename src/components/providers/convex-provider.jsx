"use client";
import React from "react";

import { ConvexReactClient } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export function ConvexClientProvider({ children, initialToken }) {
  return React.createElement(
    ConvexBetterAuthProvider,
    {
      client: convex,
      authClient: authClient,
      initialToken: initialToken,
    },

    children,
  );
}
