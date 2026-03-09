"use client";
import React from "react";
function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import {
  UtensilsCrossed,
  ChefHat,
  BarChart3,
  CreditCard,
  Users,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function LandingPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const userRole = useQuery(
    api.auth.getUserRoleById,
    _optionalChain([session, 'optionalAccess', _ => _.user, 'optionalAccess', _2 => _2.id]) ? { authUserId: session.user.id } : "skip"
  );

  const handleDashboardClick = () => {
    if (!session) {
      router.push("/auth/login");
      return;
    }

    // Redirect based on role
    switch (userRole) {
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
        router.push("/dashboard");
    }
  };

  return (
    React.createElement('div', { className: "min-h-screen bg-gradient-to-b from-cornsilk via-background to-cornsilk"    }
      /* Navigation */
      , React.createElement('nav', { className: "fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"        }
        , React.createElement('div', { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"    }
          , React.createElement('div', { className: "flex items-center justify-between h-16"   }
            , React.createElement(Link, { href: "/", className: "flex items-center gap-2"  }
              , React.createElement('div', { className: "p-2 bg-primary rounded-lg"  }
                , React.createElement(UtensilsCrossed, { className: "h-6 w-6 text-primary-foreground"  } )
              )
              , React.createElement('span', { className: "font-bold text-xl text-primary"  }, "Restaurant ERP" )
            )
            , React.createElement('div', { className: "flex items-center gap-4"  }
              , session ? (
                React.createElement(Button, { onClick: handleDashboardClick, className: "gap-2"}, "Go to Dashboard"

                  , React.createElement(ArrowRight, { className: "h-4 w-4" } )
                )
              ) : (
                React.createElement(React.Fragment, null
                  , React.createElement(Link, { href: "/auth/login"}
                    , React.createElement(Button, { variant: "ghost"}, "Sign In" )
                  )
                  , React.createElement(Link, { href: "/auth/register"}
                    , React.createElement(Button, {}, "Get Started" )
                  )
                )
              )
            )
          )
        )
      )

      /* Hero Section */
      , React.createElement('section', { className: "pt-32 pb-20 px-4"  }
        , React.createElement('div', { className: "max-w-7xl mx-auto text-center"  }
          , React.createElement('div', { className: "inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full text-secondary mb-6"        }
            , React.createElement(Sparkles, { className: "h-4 w-4" } )
            , React.createElement('span', { className: "text-sm font-medium" }, "Complete Restaurant Management Solution"   )
          )
          , React.createElement('h1', { className: "text-5xl md:text-7xl font-bold text-primary mb-6 leading-tight"     }, "Manage Your Restaurant"

            , React.createElement('br', {} )
            , React.createElement('span', { className: "text-copper"}, "Like Never Before"  )
          )
          , React.createElement('p', { className: "text-xl text-muted-foreground max-w-2xl mx-auto mb-10"    }, "All-in-one ERP system for restaurants. POS, inventory, accounting, staff management, and analytics — everything you need to run a successful restaurant."


          )
          , React.createElement('div', { className: "flex flex-col sm:flex-row items-center justify-center gap-4"     }
            , React.createElement(Button, { size: "lg", className: "text-lg px-8 py-6 gap-2"   , onClick: handleDashboardClick}
              , session ? "Open Dashboard" : "Start Free Trial"
              , React.createElement(ArrowRight, { className: "h-5 w-5" } )
            )
            , React.createElement(Link, { href: "#features"}
              , React.createElement(Button, { variant: "outline", size: "lg", className: "text-lg px-8 py-6"  }, "Learn More"

              )
            )
          )
        )
      )

      /* Stats Section */
      , React.createElement('section', { className: "py-16 bg-primary text-primary-foreground"  }
        , React.createElement('div', { className: "max-w-7xl mx-auto px-4"  }
          , React.createElement('div', { className: "grid grid-cols-2 md:grid-cols-4 gap-8 text-center"    }
            , React.createElement('div', {}
              , React.createElement('div', { className: "text-4xl font-bold mb-2"  }, "500+")
              , React.createElement('div', { className: "text-primary-foreground/70"}, "Restaurants")
            )
            , React.createElement('div', {}
              , React.createElement('div', { className: "text-4xl font-bold mb-2"  }, "1M+")
              , React.createElement('div', { className: "text-primary-foreground/70"}, "Orders Processed" )
            )
            , React.createElement('div', {}
              , React.createElement('div', { className: "text-4xl font-bold mb-2"  }, "99.9%")
              , React.createElement('div', { className: "text-primary-foreground/70"}, "Uptime")
            )
            , React.createElement('div', {}
              , React.createElement('div', { className: "text-4xl font-bold mb-2"  }, "24/7")
              , React.createElement('div', { className: "text-primary-foreground/70"}, "Support")
            )
          )
        )
      )

      /* Features Section */
      , React.createElement('section', { id: "features", className: "py-24 px-4" }
        , React.createElement('div', { className: "max-w-7xl mx-auto" }
          , React.createElement('div', { className: "text-center mb-16" }
            , React.createElement('h2', { className: "text-4xl font-bold text-primary mb-4"   }, "Everything You Need to Succeed"

            )
            , React.createElement('p', { className: "text-xl text-muted-foreground max-w-2xl mx-auto"   }, "Powerful features designed specifically for restaurant operations"

            )
          )

          , React.createElement('div', { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-8"   }
            /* Feature Cards */
            , React.createElement('div', { className: "p-8 rounded-2xl bg-card border border-border hover:shadow-xl transition-shadow"      }
              , React.createElement('div', { className: "p-3 bg-copper/10 rounded-xl w-fit mb-6"    }
                , React.createElement(CreditCard, { className: "h-8 w-8 text-copper"  } )
              )
              , React.createElement('h3', { className: "text-xl font-bold mb-3"  }, "POS System" )
              , React.createElement('p', { className: "text-muted-foreground"}, "Fast, intuitive point-of-sale with table management, split bills, and multiple payment methods."


              )
            )

            , React.createElement('div', { className: "p-8 rounded-2xl bg-card border border-border hover:shadow-xl transition-shadow"      }
              , React.createElement('div', { className: "p-3 bg-secondary/10 rounded-xl w-fit mb-6"    }
                , React.createElement(ChefHat, { className: "h-8 w-8 text-secondary"  } )
              )
              , React.createElement('h3', { className: "text-xl font-bold mb-3"  }, "Kitchen Management" )
              , React.createElement('p', { className: "text-muted-foreground"}, "Real-time order tickets, kitchen display system, and inventory tracking for ingredients."


              )
            )

            , React.createElement('div', { className: "p-8 rounded-2xl bg-card border border-border hover:shadow-xl transition-shadow"      }
              , React.createElement('div', { className: "p-3 bg-accent/20 rounded-xl w-fit mb-6"    }
                , React.createElement(BarChart3, { className: "h-8 w-8 text-accent"  } )
              )
              , React.createElement('h3', { className: "text-xl font-bold mb-3"  }, "Analytics & Reports"  )
              , React.createElement('p', { className: "text-muted-foreground"}, "Detailed sales reports, profit margins, popular items, and peak hour analysis."


              )
            )

            , React.createElement('div', { className: "p-8 rounded-2xl bg-card border border-border hover:shadow-xl transition-shadow"      }
              , React.createElement('div', { className: "p-3 bg-primary/10 rounded-xl w-fit mb-6"    }
                , React.createElement(Users, { className: "h-8 w-8 text-primary"  } )
              )
              , React.createElement('h3', { className: "text-xl font-bold mb-3"  }, "Staff Management" )
              , React.createElement('p', { className: "text-muted-foreground"}, "Role-based access, attendance tracking, payroll management, and performance metrics."


              )
            )

            , React.createElement('div', { className: "p-8 rounded-2xl bg-card border border-border hover:shadow-xl transition-shadow"      }
              , React.createElement('div', { className: "p-3 bg-green-500/10 rounded-xl w-fit mb-6"    }
                , React.createElement(Shield, { className: "h-8 w-8 text-green-600"  } )
              )
              , React.createElement('h3', { className: "text-xl font-bold mb-3"  }, "Accounting")
              , React.createElement('p', { className: "text-muted-foreground"}, "Complete double-entry accounting, journal entries, trial balance, and financial reports."


              )
            )

            , React.createElement('div', { className: "p-8 rounded-2xl bg-card border border-border hover:shadow-xl transition-shadow"      }
              , React.createElement('div', { className: "p-3 bg-blue-500/10 rounded-xl w-fit mb-6"    }
                , React.createElement(Zap, { className: "h-8 w-8 text-blue-600"  } )
              )
              , React.createElement('h3', { className: "text-xl font-bold mb-3"  }, "Real-time Sync" )
              , React.createElement('p', { className: "text-muted-foreground"}, "All data syncs in real-time across devices. Never miss an order or transaction."


              )
            )
          )
        )
      )

      /* CTA Section */
      , React.createElement('section', { className: "py-24 px-4 bg-primary"  }
        , React.createElement('div', { className: "max-w-4xl mx-auto text-center"  }
          , React.createElement(Clock, { className: "h-12 w-12 text-accent mx-auto mb-6"    } )
          , React.createElement('h2', { className: "text-4xl font-bold text-primary-foreground mb-6"   }, "Ready to Transform Your Restaurant?"

          )
          , React.createElement('p', { className: "text-xl text-primary-foreground/80 mb-10"  }, "Join hundreds of restaurants already using our platform to streamline operations and boost profits."


          )
          , React.createElement(Button, { 
            size: "lg", 
            variant: "secondary", 
            className: "text-lg px-8 py-6 gap-2"   ,
            onClick: handleDashboardClick}

            , session ? "Go to Dashboard" : "Get Started Today"
            , React.createElement(ArrowRight, { className: "h-5 w-5" } )
          )
        )
      )

      /* Footer */
      , React.createElement('footer', { className: "py-12 px-4 border-t border-border"   }
        , React.createElement('div', { className: "max-w-7xl mx-auto" }
          , React.createElement('div', { className: "flex flex-col md:flex-row items-center justify-between gap-6"     }
            , React.createElement('div', { className: "flex items-center gap-2"  }
              , React.createElement('div', { className: "p-2 bg-primary rounded-lg"  }
                , React.createElement(UtensilsCrossed, { className: "h-5 w-5 text-primary-foreground"  } )
              )
              , React.createElement('span', { className: "font-bold text-lg text-primary"  }, "Restaurant ERP" )
            )
            , React.createElement('p', { className: "text-muted-foreground text-sm" }, "© 2026 Restaurant ERP. All rights reserved."

            )
          )
        )
      )
    )
  );
}
