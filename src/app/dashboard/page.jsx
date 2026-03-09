"use client";
import React from "react";
function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function DashboardRedirect() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  
  // Query user role directly using the session user ID
  const role = useQuery(
    api.auth.getUserRoleById,
    _optionalChain([session, 'optionalAccess', _ => _.user, 'optionalAccess', _2 => _2.id]) ? { authUserId: session.user.id } : "skip"
  );
  
  const isPending = sessionPending || (_optionalChain([session, 'optionalAccess', _3 => _3.user]) && role === undefined);

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.push("/auth/login");
      } else if (role) {
        switch (role) {
          case "admin":
            router.push("/admin/dashboard");
            break;
          case "accountant":
            router.push("/account/dashboard");
            break;
          case "cashier":
            router.push("/cashier/pos");
            break;
          default:
            router.push("/cashier/pos");
            break;
        }
      }
    }
  }, [session, role, isPending, router]);

  return (
    React.createElement('div', { className: "min-h-screen flex items-center justify-center"   }
      , React.createElement('div', { className: "flex flex-col items-center gap-4"   }
        , React.createElement(Loader2, { className: "h-8 w-8 animate-spin text-primary"   } )
        , React.createElement('p', { className: "text-muted-foreground"}, "Redirecting to your dashboard..."   )
      )
    )
  );
}
