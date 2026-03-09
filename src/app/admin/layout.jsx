"use client";
import React from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Tags,
  Scale,
  Printer,
  DoorOpen,
  Percent,
  Users,
  Wallet,

  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";
import { AuthGuard } from "@/components/auth/auth-guard";

import {
  Building,
  Receipt,
  DollarSign,
  Calendar,
} from "lucide-react";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Menu Items",
    href: "/admin/menu",
    icon: UtensilsCrossed,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: Tags,
  },
  {
    title: "Units",
    href: "/admin/units",
    icon: Scale,
  },
  {
    title: "Printers",
    href: "/admin/printers",
    icon: Printer,
  },
  {
    title: "Rooms & Tables",
    href: "/admin/rooms",
    icon: DoorOpen,
  },
  {
    title: "Discounts",
    href: "/admin/discounts",
    icon: Percent,
  },
  {
    title: "Staff",
    href: "/admin/staff",
    icon: Users,
  },
  {
    title: "Payroll",
    href: "/admin/payroll",
    icon: Wallet,
  },
];

const settingsItems = [
  {
    title: "Restaurant",
    href: "/admin/settings/restaurant",
    icon: Building,
  },
  {
    title: "Tax",
    href: "/admin/settings/tax",
    icon: Percent,
  },
  {
    title: "Receipt",
    href: "/admin/settings/receipt",
    icon: Receipt,
  },
  {
    title: "Currency",
    href: "/admin/settings/currency",
    icon: DollarSign,
  },
  {
    title: "Financial Year",
    href: "/admin/settings/financial",
    icon: Calendar,
  },
];

export default function AdminLayout({
  children,
}

) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = "/auth/login";
  };

  return (
    React.createElement(AuthGuard, { allowedRoles: ["admin"]}
    , React.createElement(TooltipProvider, { delayDuration: 0}
      , React.createElement('div', { className: "flex h-screen" }
        /* Sidebar */
        , React.createElement('aside', {
          className: cn(
            "flex flex-col border-r bg-background transition-all duration-300",
            collapsed ? "w-16" : "w-64"
          )}

          /* Logo */
          , React.createElement('div', { className: "flex h-16 items-center justify-between border-b px-4"     }
            , !collapsed && (
              React.createElement(Link, { href: "/admin/dashboard", className: "flex items-center gap-2"  }
                , React.createElement(UtensilsCrossed, { className: "h-6 w-6 text-primary"  } )
                , React.createElement('span', { className: "font-bold text-lg" }, "Restaurant ERP" )
              )
            )
            , React.createElement(Button, {
              variant: "ghost",
              size: "icon",
              onClick: () => setCollapsed(!collapsed),
              className: cn(collapsed && "mx-auto")}

              , collapsed ? (
                React.createElement(ChevronRight, { className: "h-4 w-4" } )
              ) : (
                React.createElement(ChevronLeft, { className: "h-4 w-4" } )
              )
            )
          )

          /* Navigation */
          , React.createElement(ScrollArea, { className: "flex-1 py-4" }
            , React.createElement('nav', { className: "flex flex-col gap-1 px-2"   }
              , sidebarItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                if (collapsed) {
                  return (
                    React.createElement(Tooltip, { key: item.href}
                      , React.createElement(TooltipTrigger, { asChild: true}
                        , React.createElement(Link, {
                          href: item.href,
                          className: cn(
                            "flex h-10 w-10 items-center justify-center rounded-lg mx-auto",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}

                          , React.createElement(Icon, { className: "h-5 w-5" } )
                        )
                      )
                      , React.createElement(TooltipContent, { side: "right"}
                        , item.title
                      )
                    )
                  );
                }

                return (
                  React.createElement(Link, {
                    key: item.href,
                    href: item.href,
                    className: cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}

                    , React.createElement(Icon, { className: "h-5 w-5" } )
                    , item.title
                  )
                );
              })

              /* Settings Section */
              , !collapsed && (
                React.createElement('div', { className: "mt-4 pt-4 border-t border-border"   }
                  , React.createElement('p', { className: "px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider"      }, "Settings"

                  )
                  , settingsItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      React.createElement(Link, {
                        key: item.href,
                        href: item.href,
                        className: cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}

                        , React.createElement(Icon, { className: "h-4 w-4" } )
                        , item.title
                      )
                    );
                  })
                )
              )
              , collapsed && (
                React.createElement(React.Fragment, null
                  , React.createElement('div', { className: "mt-4 pt-4 border-t border-border"   } )
                  , settingsItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      React.createElement(Tooltip, { key: item.href}
                        , React.createElement(TooltipTrigger, { asChild: true}
                          , React.createElement(Link, {
                            href: item.href,
                            className: cn(
                              "flex h-10 w-10 items-center justify-center rounded-lg mx-auto",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}

                            , React.createElement(Icon, { className: "h-5 w-5" } )
                          )
                        )
                        , React.createElement(TooltipContent, { side: "right"}
                          , item.title
                        )
                      )
                    );
                  })
                )
              )
            )
          )

          /* Footer */
          , React.createElement(Separator, {} )
          , React.createElement('div', { className: "p-2"}
            , collapsed ? (
              React.createElement(Tooltip, {}
                , React.createElement(TooltipTrigger, { asChild: true}
                  , React.createElement(Button, {
                    variant: "ghost",
                    size: "icon",
                    className: "w-10 h-10 mx-auto"  ,
                    onClick: handleLogout}

                    , React.createElement(LogOut, { className: "h-5 w-5" } )
                  )
                )
                , React.createElement(TooltipContent, { side: "right"}, "Logout")
              )
            ) : (
              React.createElement(Button, {
                variant: "ghost",
                className: "w-full justify-start gap-3"  ,
                onClick: handleLogout}

                , React.createElement(LogOut, { className: "h-5 w-5" } ), "Logout"

              )
            )
          )
        )

        /* Main Content */
        , React.createElement('main', { className: "flex-1 overflow-auto" }
          , React.createElement('div', { className: "p-6"}, children)
        )
      )
    )
    )
  );
}
