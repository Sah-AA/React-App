import React from "react";
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CreditCard,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function CashierLayout({
  children,
}

) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = "/auth/login";
  };

  return (
    React.createElement(AuthGuard, { allowedRoles: ["admin", "cashier"]}
    , React.createElement('div', { className: "flex flex-col h-screen bg-background"   }
      /* Top Header Bar */
      , React.createElement('header', { className: "h-14 border-b bg-background flex items-center justify-between px-4"      }
        , React.createElement('div', { className: "flex items-center gap-4"  }
          , React.createElement(Link, { href: "/cashier/pos", className: "flex items-center gap-2"  }
            , React.createElement(Home, { className: "h-5 w-5 text-primary"  } )
            , React.createElement('span', { className: "font-bold text-lg" }, "POS Terminal" )
          )

          , React.createElement('nav', { className: "flex items-center gap-1 ml-6"   }
            , React.createElement(Link, {
              href: "/cashier/pos",
              className: cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                pathname === "/cashier/pos" || pathname.startsWith("/cashier/pos/table")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent"
              )}
, "Tables"

            )
            , React.createElement(Link, {
              href: "/cashier/credit",
              className: cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                pathname === "/cashier/credit-payment"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent"
              )}

              , React.createElement('span', { className: "flex items-center gap-1.5"  }
                , React.createElement(CreditCard, { className: "h-4 w-4" } ), "Credit Payment"

              )
            )
          )
        )

        , React.createElement('div', { className: "flex items-center gap-2"  }
          , React.createElement('div', { className: "flex items-center gap-2 text-sm text-muted-foreground mr-4"     }
            , React.createElement(User, { className: "h-4 w-4" } )
            , React.createElement('span', {}, "Cashier")
          )
          , React.createElement(Button, {
            variant: "ghost",
            size: "sm",
            onClick: handleLogout,
            className: "gap-2"}

            , React.createElement(LogOut, { className: "h-4 w-4" } ), "Logout"

          )
        )
      )

      /* Main Content */
      , React.createElement('main', { className: "flex-1 overflow-hidden" }
        , children
      )
    )
    )
  );
}
