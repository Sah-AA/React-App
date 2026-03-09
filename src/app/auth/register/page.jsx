"use client";
import React from "react";
function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UtensilsCrossed, Loader2 } from "lucide-react";
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
import { authClient } from "@/lib/auth-client";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const initializeUserRole = useMutation(api.auth.initializeUserRole);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const result = await authClient.signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });

      if (result.error) {
        toast.error(result.error.message || "Registration failed");
        return;
      }

      // Initialize user role in our userRoles table (default to user)
      if (_optionalChain([result, 'access', _ => _.data, 'optionalAccess', _2 => _2.user, 'optionalAccess', _3 => _3.id])) {
        await initializeUserRole({
          authUserId: result.data.user.id,
          role: "user",
        });
      }

      toast.success("Account created successfully!");
      router.push("/auth/login");
    } catch (error) {
      toast.error("An error occurred during registration");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    React.createElement('div', { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4"        }
      , React.createElement(Card, { className: "w-full max-w-md shadow-xl"  }
      , React.createElement(CardHeader, { className: "text-center"}
        , React.createElement('div', { className: "flex justify-center mb-4"  }
          , React.createElement('div', { className: "p-3 bg-primary/10 rounded-full"  }
            , React.createElement(UtensilsCrossed, { className: "h-8 w-8 text-primary"  } )
          )
        )
        , React.createElement(CardTitle, { className: "text-2xl"}, "Create Account" )
        , React.createElement(CardDescription, {}, "Set up a new user for Restaurant ERP"

        )
      )
      , React.createElement('form', { onSubmit: handleSubmit}
        , React.createElement(CardContent, { className: "space-y-4"}
          , React.createElement('div', { className: "space-y-2"}
            , React.createElement(Label, { htmlFor: "name"}, "Full Name" )
            , React.createElement(Input, {
              id: "name",
              type: "text",
              placeholder: "John Doe" ,
              value: formData.name,
              onChange: (e) =>
                setFormData({ ...formData, name: e.target.value })
              ,
              required: true,
              disabled: isLoading}
            )
          )
          , React.createElement('div', { className: "space-y-2"}
            , React.createElement(Label, { htmlFor: "email"}, "Email")
            , React.createElement(Input, {
              id: "email",
              type: "email",
              placeholder: "admin@restaurant.com",
              value: formData.email,
              onChange: (e) =>
                setFormData({ ...formData, email: e.target.value })
              ,
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
              value: formData.password,
              onChange: (e) =>
                setFormData({ ...formData, password: e.target.value })
              ,
              required: true,
              disabled: isLoading}
            )
          )
          , React.createElement('div', { className: "space-y-2"}
            , React.createElement(Label, { htmlFor: "confirmPassword"}, "Confirm Password" )
            , React.createElement(Input, {
              id: "confirmPassword",
              type: "password",
              placeholder: "••••••••",
              value: formData.confirmPassword,
              onChange: (e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              ,
              required: true,
              disabled: isLoading}
            )
          )
        )
        , React.createElement(CardFooter, { className: "flex flex-col gap-4"  }
          , React.createElement(Button, { type: "submit", className: "w-full", disabled: isLoading}
            , isLoading ? (
              React.createElement(React.Fragment, null
                , React.createElement(Loader2, { className: "mr-2 h-4 w-4 animate-spin"   } ), "Creating account..."

              )
            ) : (
              "Create Account"
            )
          )
          , React.createElement('p', { className: "text-sm text-muted-foreground text-center"  }, "Already have an account?"
               , " "
            , React.createElement(Link, { href: "/auth/login", className: "text-primary hover:underline" }, "Sign in"

            )
          )
        )
      )
    )
    )
  );
}
