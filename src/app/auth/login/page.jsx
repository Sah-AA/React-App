"use client";
import React from "react";


import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { UtensilsCrossed, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signIn } from "@/lib/auth-client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Login failed. Please check your credentials.");
      } else {
        router.push(callbackUrl);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    React.createElement(Card, { className: "shadow-lg"}
      , React.createElement(CardHeader, { className: "text-center"}
        , React.createElement('div', { className: "flex justify-center mb-4"  }
          , React.createElement('div', { className: "p-3 bg-primary/10 rounded-full"  }
            , React.createElement(UtensilsCrossed, { className: "h-8 w-8 text-primary"  } )
          )
        )
        , React.createElement(CardTitle, { className: "text-2xl"}, "Welcome Back" )
        , React.createElement(CardDescription, {}, "Sign in to your Restaurant ERP account"

        )
      )
      , React.createElement('form', { onSubmit: handleSubmit}
        , React.createElement(CardContent, { className: "space-y-4"}
          , error && (
            React.createElement(Alert, { variant: "destructive"}
              , React.createElement(AlertCircle, { className: "h-4 w-4" } )
              , React.createElement(AlertDescription, {}, error)
            )
          )
          , React.createElement('div', { className: "space-y-2"}
            , React.createElement(Label, { htmlFor: "email"}, "Email")
            , React.createElement(Input, {
              id: "email",
              type: "email",
              placeholder: "admin@restaurant.com",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              required: true,
              disabled: isLoading}
            )
          )
          , React.createElement('div', { className: "space-y-2"}
            , React.createElement(Label, { htmlFor: "password"}, "Password")
            , React.createElement(Input, {
              id: "password",
              type: "password",
              placeholder: "••••••••",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              required: true,
              disabled: isLoading}
            )
          )
        )
        , React.createElement(CardFooter, { className: "flex flex-col gap-4"  }
          , React.createElement(Button, { type: "submit", className: "w-full", disabled: isLoading}
            , isLoading ? (
              React.createElement(React.Fragment, null
                , React.createElement(Loader2, { className: "mr-2 h-4 w-4 animate-spin"   } ), "Signing in..."

              )
            ) : (
              "Sign In"
            )
          )
          , React.createElement('p', { className: "text-sm text-muted-foreground text-center"  }, "Don't have an account?"
               , " "
            , React.createElement(Link, { href: "/auth/register", className: "text-primary hover:underline" }, "Create one"

            )
          )
        )
      )
    )
  );
}

export default function LoginPage() {
  return (
    React.createElement('div', { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4"        }
      , React.createElement('div', { className: "w-full max-w-md" }
        , React.createElement(Suspense, { fallback: 
          React.createElement(Card, { className: "shadow-lg"}
            , React.createElement(CardHeader, { className: "text-center"}
              , React.createElement('div', { className: "flex justify-center mb-4"  }
                , React.createElement('div', { className: "p-3 bg-primary/10 rounded-full"  }
                  , React.createElement(Loader2, { className: "h-8 w-8 text-primary animate-spin"   } )
                )
              )
              , React.createElement(CardTitle, { className: "text-2xl"}, "Loading...")
            )
          )
        }
          , React.createElement(LoginForm, {} )
        )
      )
    )
  );
}
