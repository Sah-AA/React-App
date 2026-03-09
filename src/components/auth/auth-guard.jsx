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
  
  // Query user role directly from userRoles table using session user ID
  const role = useQuery(
    api.auth.getUserRoleById,
    _optionalChain([session, 'optionalAccess', _ => _.user, 'optionalAccess', _2 => _2.id]) ? { authUserId: session.user.id } : "skip"
  );
  
  const router = useRouter();
  const isPending = sessionPending || (_optionalChain([session, 'optionalAccess', _3 => _3.user]) && role === undefined);

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.push(`${fallbackUrl}?callbackUrl=${window.location.pathname}`);
      } else if (role !== undefined) {
        if (!allowedRoles.includes(role )) {
          router.push("/unauthorized");
        }
      }
    }
  }, [session, role, isPending, router, allowedRoles, fallbackUrl]);

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

  if (!allowedRoles.includes(role )) {
    return null;
  }

  return React.createElement(React.Fragment, null, children);
}
