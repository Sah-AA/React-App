"use client";
import React from "react";
function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

import { authClient } from "@/lib/auth-client";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, } from "react";
import { Loader2 } from "lucide-react";









export function AuthGuard({
  children,
  allowedRoles,
  fallbackUrl = "/auth/login",
}) {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  // Only query for user role when we have a session
  const userWithRole = useQuery(
    api.auth.getCurrentUserWithRole,
    session ? {} : "skip"
  );
  const router = useRouter();

  const isPending = sessionPending || (session && userWithRole === undefined);

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        // Not logged in, redirect to login
        router.push(`${fallbackUrl}?callbackUrl=${window.location.pathname}`);
      } else if (userWithRole) {
        // Check if user has the required role
        const userRole = userWithRole.role || "user";
        if (!allowedRoles.includes(userRole )) {
          // User doesn't have permission, redirect to unauthorized
          router.push("/unauthorized");
        }
      }
    }
  }, [session, userWithRole, isPending, router, allowedRoles, fallbackUrl]);

  if (isPending) {
    return (
      React.createElement('div', { className: "min-h-screen flex items-center justify-center"   }
        , React.createElement('div', { className: "flex flex-col items-center gap-4"   }
          , React.createElement(Loader2, { className: "h-8 w-8 animate-spin text-primary"   } )
          , React.createElement('p', { className: "text-muted-foreground"}, "Loading...")
        )
      )
    );
  }

  if (!session) {
    return null;
  }

  const userRole = _optionalChain([userWithRole, 'optionalAccess', _ => _.role]) || "user";
  if (!allowedRoles.includes(userRole )) {
    return null;
  }

  return React.createElement(React.Fragment, null, children);
}

// Backward compatibility exports
export const RoleGuard = AuthGuard;

export function useCurrentUser() {
  return useQuery(api.auth.getCurrentUserWithRole);
}

export function useUserRole() {
  const user = useQuery(api.auth.getCurrentUserWithRole);
  if (!user) return null;
  return (user.role ) || "cashier";
}
