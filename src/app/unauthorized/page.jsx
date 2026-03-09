"use client";
import React from "react";


import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldX, Home } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    React.createElement('div', { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4"        }
      , React.createElement(Card, { className: "w-full max-w-md shadow-xl border-red-200"   }
        , React.createElement(CardHeader, { className: "space-y-1 text-center" }
          , React.createElement('div', { className: "flex justify-center mb-4"  }
            , React.createElement('div', { className: "p-3 rounded-full bg-red-100 text-red-600"   }
              , React.createElement(ShieldX, { className: "h-8 w-8" } )
            )
          )
          , React.createElement(CardTitle, { className: "text-2xl font-bold text-red-600"  }, "Access Denied" )
          , React.createElement(CardDescription, {}, "You don't have permission to access this page."

          )
        )
        , React.createElement(CardContent, { className: "space-y-4"}
          , React.createElement('p', { className: "text-center text-muted-foreground text-sm"  }, "This area is restricted to authorized users only. If you believe you should have access, please contact your administrator."


          )
          , React.createElement('div', { className: "flex flex-col gap-2"  }
            , React.createElement(Button, { asChild: true, className: "w-full"}
              , React.createElement(Link, { href: "/"}
                , React.createElement(Home, { className: "mr-2 h-4 w-4"  } ), "Go to Home"

              )
            )
            , React.createElement(Button, { asChild: true, variant: "outline", className: "w-full"}
              , React.createElement(Link, { href: "/auth/login"}, "Back to Login"

              )
            )
          )
        )
      )
    )
  );
}
