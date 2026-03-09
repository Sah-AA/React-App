"use client";
import React from "react";
function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  QrCode,
  Receipt,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Calculator,
} from "lucide-react";
import { toast } from "sonner";







const DENOMINATIONS = [1000, 500, 100, 50, 20, 10, 5, 2, 1];

export default function DayClosePage() {
  const router = useRouter();

  // Fetch session summary from Convex
  const sessionSummary = useQuery(api.dashboard.getSessionSummary);
  const closeSession = useMutation(api.cashierSessions.close);

  const [cashCounts, setCashCounts] = useState(
    DENOMINATIONS.map((d) => ({ denomination: d, quantity: 0, total: 0 }))
  );
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [remarks, setRemarks] = useState("");

  // Calculate totals
  const countedCash = cashCounts.reduce((sum, c) => sum + c.total, 0);
  const expectedCash = _nullishCoalesce(_optionalChain([sessionSummary, 'optionalAccess', _ => _.expectedCash]), () => ( 0));
  const variance = countedCash - expectedCash;

  const handleQuantityChange = (index, quantity) => {
    const updated = [...cashCounts];
    updated[index].quantity = quantity;
    updated[index].total = updated[index].denomination * quantity;
    setCashCounts(updated);
  };

  const handleCloseDay = async () => {
    if (!_optionalChain([sessionSummary, 'optionalAccess', _2 => _2.sessionId])) {
      toast.error("No active session found");
      return;
    }

    setIsLoading(true);
    try {
      await closeSession({
        sessionId: sessionSummary.sessionId,
        closingCash: countedCash,
        notes: remarks || undefined,
      });

      toast.success("Day closed successfully");
      router.push("/cashier/pos");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to close day");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (sessionSummary === undefined) {
    return (
      React.createElement('div', { className: "min-h-screen bg-background" }
        , React.createElement('div', { className: "h-14 border-b px-4 flex items-center justify-between bg-background sticky top-0 z-10"         }
          , React.createElement('div', { className: "flex items-center gap-4"  }
            , React.createElement(Button, { variant: "ghost", size: "icon", onClick: () => router.back()}
              , React.createElement(ArrowLeft, { className: "h-5 w-5" } )
            )
            , React.createElement('div', {}
              , React.createElement(Skeleton, { className: "h-5 w-24" } )
              , React.createElement(Skeleton, { className: "h-4 w-48 mt-1"  } )
            )
          )
        )

        , React.createElement('div', { className: "container max-w-6xl mx-auto p-6 space-y-6"    }
          , React.createElement(Card, {}
            , React.createElement(CardHeader, {}
              , React.createElement(Skeleton, { className: "h-6 w-48" } )
              , React.createElement(Skeleton, { className: "h-4 w-64 mt-2"  } )
            )
            , React.createElement(CardContent, {}
              , React.createElement('div', { className: "grid grid-cols-2 md:grid-cols-4 gap-4"   }
                , [1, 2, 3, 4].map((i) => (
                  React.createElement(Skeleton, { key: i, className: "h-24 w-full" } )
                ))
              )
            )
          )

          , React.createElement('div', { className: "grid md:grid-cols-2 gap-6"  }
            , React.createElement(Card, {}
              , React.createElement(CardHeader, {}
                , React.createElement(Skeleton, { className: "h-6 w-32" } )
                , React.createElement(Skeleton, { className: "h-4 w-48 mt-2"  } )
              )
              , React.createElement(CardContent, {}
                , React.createElement('div', { className: "space-y-2"}
                  , [1, 2, 3, 4, 5].map((i) => (
                    React.createElement(Skeleton, { key: i, className: "h-12 w-full" } )
                  ))
                )
              )
            )
            , React.createElement(Card, {}
              , React.createElement(CardHeader, {}
                , React.createElement(Skeleton, { className: "h-6 w-40" } )
                , React.createElement(Skeleton, { className: "h-4 w-56 mt-2"  } )
              )
              , React.createElement(CardContent, {}
                , React.createElement('div', { className: "space-y-4"}
                  , [1, 2, 3, 4].map((i) => (
                    React.createElement(Skeleton, { key: i, className: "h-12 w-full" } )
                  ))
                )
              )
            )
          )
        )
      )
    );
  }

  // No active session state
  if (sessionSummary === null) {
    return (
      React.createElement('div', { className: "min-h-screen bg-background" }
        , React.createElement('div', { className: "h-14 border-b px-4 flex items-center justify-between bg-background sticky top-0 z-10"         }
          , React.createElement('div', { className: "flex items-center gap-4"  }
            , React.createElement(Button, { variant: "ghost", size: "icon", onClick: () => router.back()}
              , React.createElement(ArrowLeft, { className: "h-5 w-5" } )
            )
            , React.createElement('div', {}
              , React.createElement('h1', { className: "font-semibold"}, "Day Close" )
            )
          )
        )

        , React.createElement('div', { className: "container max-w-6xl mx-auto p-6"   }
          , React.createElement(Card, {}
            , React.createElement(CardContent, { className: "flex flex-col items-center justify-center py-16 text-muted-foreground"     }
              , React.createElement(AlertTriangle, { className: "h-16 w-16 mb-4 opacity-50"   } )
              , React.createElement('p', { className: "text-lg font-medium" }, "No Active Session"  )
              , React.createElement('p', { className: "text-sm mt-2" }, "You don't have an active session to close. Please open a session first."

              )
              , React.createElement(Button, { className: "mt-6", onClick: () => router.push("/cashier/pos")}, "Go to POS"

              )
            )
          )
        )
      )
    );
  }

  return (
    React.createElement('div', { className: "min-h-screen bg-background" }
      /* Header */
      , React.createElement('div', { className: "h-14 border-b px-4 flex items-center justify-between bg-background sticky top-0 z-10"         }
        , React.createElement('div', { className: "flex items-center gap-4"  }
          , React.createElement(Button, { variant: "ghost", size: "icon", onClick: () => router.back()}
            , React.createElement(ArrowLeft, { className: "h-5 w-5" } )
          )
          , React.createElement('div', {}
            , React.createElement('h1', { className: "font-semibold"}, "Day Close" )
            , React.createElement('p', { className: "text-sm text-muted-foreground" }
              , new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            )
          )
        )
      )

      , React.createElement('div', { className: "container max-w-6xl mx-auto p-6 space-y-6"    }
        /* Sales Summary */
        , React.createElement(Card, {}
          , React.createElement(CardHeader, {}
            , React.createElement(CardTitle, {}, "Today's Sales Summary"  )
            , React.createElement(CardDescription, {}, "Overview of all transactions for this session"

            )
          )
          , React.createElement(CardContent, {}
            , React.createElement('div', { className: "grid grid-cols-2 md:grid-cols-4 gap-4"   }
              , React.createElement('div', { className: "p-4 bg-muted/50 rounded-lg"  }
                , React.createElement('div', { className: "flex items-center gap-2 text-muted-foreground mb-2"    }
                  , React.createElement(Receipt, { className: "h-4 w-4" } )
                  , React.createElement('span', { className: "text-sm"}, "Total Sales" )
                )
                , React.createElement('p', { className: "text-2xl font-bold" }, "Rs. "
                   , sessionSummary.totalSales.toLocaleString()
                )
                , React.createElement('p', { className: "text-sm text-muted-foreground" }
                  , sessionSummary.totalOrders, " orders"
                )
              )
              , React.createElement('div', { className: "p-4 bg-green-500/10 rounded-lg"  }
                , React.createElement('div', { className: "flex items-center gap-2 text-green-600 mb-2"    }
                  , React.createElement(Banknote, { className: "h-4 w-4" } )
                  , React.createElement('span', { className: "text-sm"}, "Cash Sales" )
                )
                , React.createElement('p', { className: "text-2xl font-bold text-green-600"  }, "Rs. "
                   , sessionSummary.cashSales.toLocaleString()
                )
              )
              , React.createElement('div', { className: "p-4 bg-blue-500/10 rounded-lg"  }
                , React.createElement('div', { className: "flex items-center gap-2 text-blue-600 mb-2"    }
                  , React.createElement(CreditCard, { className: "h-4 w-4" } )
                  , React.createElement('span', { className: "text-sm"}, "Card Sales" )
                )
                , React.createElement('p', { className: "text-2xl font-bold text-blue-600"  }, "Rs. "
                   , sessionSummary.cardSales.toLocaleString()
                )
              )
              , React.createElement('div', { className: "p-4 bg-purple-500/10 rounded-lg"  }
                , React.createElement('div', { className: "flex items-center gap-2 text-purple-600 mb-2"    }
                  , React.createElement(QrCode, { className: "h-4 w-4" } )
                  , React.createElement('span', { className: "text-sm"}, "QR/Online")
                )
                , React.createElement('p', { className: "text-2xl font-bold text-purple-600"  }, "Rs. "
                   , sessionSummary.qrSales.toLocaleString()
                )
              )
            )
          )
        )

        , React.createElement('div', { className: "grid md:grid-cols-2 gap-6"  }
          /* Cash Count */
          , React.createElement(Card, {}
            , React.createElement(CardHeader, {}
              , React.createElement(CardTitle, { className: "flex items-center gap-2"  }
                , React.createElement(Calculator, { className: "h-5 w-5" } ), "Cash Count"

              )
              , React.createElement(CardDescription, {}, "Count the cash in your drawer"

              )
            )
            , React.createElement(CardContent, {}
              , React.createElement(Table, {}
                , React.createElement(TableHeader, {}
                  , React.createElement(TableRow, {}
                    , React.createElement(TableHead, {}, "Denomination")
                    , React.createElement(TableHead, { className: "text-center"}, "Quantity")
                    , React.createElement(TableHead, { className: "text-right"}, "Total")
                  )
                )
                , React.createElement(TableBody, {}
                  , cashCounts.map((item, index) => (
                    React.createElement(TableRow, { key: item.denomination}
                      , React.createElement(TableCell, { className: "font-medium"}, "Rs. "
                         , item.denomination
                      )
                      , React.createElement(TableCell, {}
                        , React.createElement(Input, {
                          type: "number",
                          min: "0",
                          value: item.quantity || "",
                          onChange: (e) =>
                            handleQuantityChange(index, parseInt(e.target.value) || 0)
                          ,
                          className: "w-20 mx-auto text-center"  }
                        )
                      )
                      , React.createElement(TableCell, { className: "text-right"}, "Rs. "
                         , item.total.toLocaleString()
                      )
                    )
                  ))
                )
              )

              , React.createElement(Separator, { className: "my-4"} )

              , React.createElement('div', { className: "flex justify-between items-center font-bold text-lg"    }
                , React.createElement('span', {}, "Total Counted" )
                , React.createElement('span', {}, "Rs. " , countedCash.toLocaleString())
              )
            )
          )

          /* Reconciliation */
          , React.createElement(Card, {}
            , React.createElement(CardHeader, {}
              , React.createElement(CardTitle, {}, "Cash Reconciliation" )
              , React.createElement(CardDescription, {}, "Compare counted cash with expected"

              )
            )
            , React.createElement(CardContent, { className: "space-y-6"}
              , React.createElement('div', { className: "space-y-4"}
                , React.createElement('div', { className: "flex justify-between items-center p-3 bg-muted/50 rounded-lg"     }
                  , React.createElement('span', { className: "text-sm text-muted-foreground" }, "Opening Cash" )
                  , React.createElement('span', { className: "font-medium"}, "Rs. "
                     , sessionSummary.openingCash.toLocaleString()
                  )
                )
                , React.createElement('div', { className: "flex justify-between items-center p-3 bg-muted/50 rounded-lg"     }
                  , React.createElement('span', { className: "text-sm text-muted-foreground" }, "Cash Sales" )
                  , React.createElement('span', { className: "font-medium"}, "+ Rs. "
                      , sessionSummary.cashSales.toLocaleString()
                  )
                )
                , React.createElement(Separator, {} )
                , React.createElement('div', { className: "flex justify-between items-center p-3 bg-primary/10 rounded-lg"     }
                  , React.createElement('span', { className: "font-medium"}, "Expected Cash" )
                  , React.createElement('span', { className: "font-bold text-lg" }, "Rs. "
                     , expectedCash.toLocaleString()
                  )
                )
                , React.createElement('div', { className: "flex justify-between items-center p-3 bg-muted/50 rounded-lg"     }
                  , React.createElement('span', { className: "font-medium"}, "Counted Cash" )
                  , React.createElement('span', { className: "font-bold text-lg" }, "Rs. "
                     , countedCash.toLocaleString()
                  )
                )
              )

              , React.createElement(Separator, {} )

              /* Variance */
              , React.createElement('div', {
                className: `p-4 rounded-lg ${
                  variance === 0
                    ? "bg-green-500/10"
                    : variance > 0
                    ? "bg-blue-500/10"
                    : "bg-red-500/10"
                }`}

                , React.createElement('div', { className: "flex items-center justify-between"  }
                  , React.createElement('div', { className: "flex items-center gap-2"  }
                    , variance === 0 ? (
                      React.createElement(CheckCircle, { className: "h-5 w-5 text-green-600"  } )
                    ) : (
                      React.createElement(AlertTriangle, {
                        className: `h-5 w-5 ${
                          variance > 0 ? "text-blue-600" : "text-red-600"
                        }`}
                      )
                    )
                    , React.createElement('span', { className: "font-medium"}, "Variance")
                  )
                  , React.createElement('span', {
                    className: `font-bold text-xl ${
                      variance === 0
                        ? "text-green-600"
                        : variance > 0
                        ? "text-blue-600"
                        : "text-red-600"
                    }`}

                    , variance > 0 ? "+" : "", "Rs. "
                     , variance.toLocaleString()
                  )
                )
                , React.createElement('p', { className: "text-sm text-muted-foreground mt-2"  }
                  , variance === 0
                    ? "Cash count matches expected amount"
                    : variance > 0
                    ? "Cash surplus detected"
                    : "Cash shortage detected"
                )
              )

              /* Remarks */
              , React.createElement('div', { className: "space-y-2"}
                , React.createElement(Label, { htmlFor: "remarks"}, "Remarks (optional)" )
                , React.createElement(Input, {
                  id: "remarks",
                  placeholder: "Any notes about the variance or the day..."       ,
                  value: remarks,
                  onChange: (e) => setRemarks(e.target.value)}
                )
              )

              /* Close Button */
              , React.createElement(Button, {
                className: "w-full",
                size: "lg",
                onClick: () => setShowConfirmDialog(true)}
, "Close Day"

              )
            )
          )
        )

        /* Order Summary Table */
        , React.createElement(Card, {}
          , React.createElement(CardHeader, {}
            , React.createElement(CardTitle, {}, "Payment Method Breakdown"  )
          )
          , React.createElement(CardContent, {}
            , React.createElement(Table, {}
              , React.createElement(TableHeader, {}
                , React.createElement(TableRow, {}
                  , React.createElement(TableHead, {}, "Payment Method" )
                  , React.createElement(TableHead, { className: "text-right"}, "Amount")
                )
              )
              , React.createElement(TableBody, {}
                , React.createElement(TableRow, {}
                  , React.createElement(TableCell, { className: "flex items-center gap-2"  }
                    , React.createElement(Banknote, { className: "h-4 w-4 text-green-600"  } ), "Cash"

                  )
                  , React.createElement(TableCell, { className: "text-right"}, "Rs. "
                     , sessionSummary.cashSales.toLocaleString()
                  )
                )
                , React.createElement(TableRow, {}
                  , React.createElement(TableCell, { className: "flex items-center gap-2"  }
                    , React.createElement(CreditCard, { className: "h-4 w-4 text-blue-600"  } ), "Card"

                  )
                  , React.createElement(TableCell, { className: "text-right"}, "Rs. "
                     , sessionSummary.cardSales.toLocaleString()
                  )
                )
                , React.createElement(TableRow, {}
                  , React.createElement(TableCell, { className: "flex items-center gap-2"  }
                    , React.createElement(QrCode, { className: "h-4 w-4 text-purple-600"  } ), "QR/Fonepay"

                  )
                  , React.createElement(TableCell, { className: "text-right"}, "Rs. "
                     , sessionSummary.qrSales.toLocaleString()
                  )
                )
                , React.createElement(TableRow, {}
                  , React.createElement(TableCell, { className: "flex items-center gap-2"  }
                    , React.createElement(Receipt, { className: "h-4 w-4 text-orange-600"  } ), "Credit"

                  )
                  , React.createElement(TableCell, { className: "text-right"}, "Rs. "
                     , sessionSummary.creditSales.toLocaleString()
                  )
                )
                , React.createElement(TableRow, { className: "font-bold"}
                  , React.createElement(TableCell, {}, "Total")
                  , React.createElement(TableCell, { className: "text-right"}, "Rs. "
                     , sessionSummary.totalSales.toLocaleString()
                  )
                )
              )
            )
          )
        )
      )

      /* Confirm Dialog */
      , React.createElement(Dialog, { open: showConfirmDialog, onOpenChange: setShowConfirmDialog}
        , React.createElement(DialogContent, {}
          , React.createElement(DialogHeader, {}
            , React.createElement(DialogTitle, {}, "Confirm Day Close"  )
            , React.createElement(DialogDescription, {}, "Are you sure you want to close the day? This action cannot be undone."

            )
          )
          , React.createElement('div', { className: "py-4 space-y-3" }
            , React.createElement('div', { className: "flex justify-between" }
              , React.createElement('span', {}, "Total Sales" )
              , React.createElement('span', { className: "font-medium"}, "Rs. "
                 , sessionSummary.totalSales.toLocaleString()
              )
            )
            , React.createElement('div', { className: "flex justify-between" }
              , React.createElement('span', {}, "Counted Cash" )
              , React.createElement('span', { className: "font-medium"}, "Rs. " , countedCash.toLocaleString())
            )
            , React.createElement('div', { className: "flex justify-between" }
              , React.createElement('span', {}, "Variance")
              , React.createElement('span', {
                className: `font-medium ${
                  variance === 0
                    ? "text-green-600"
                    : variance > 0
                    ? "text-blue-600"
                    : "text-red-600"
                }`}

                , variance > 0 ? "+" : "", "Rs. " , variance.toLocaleString()
              )
            )
          )
          , React.createElement(DialogFooter, {}
            , React.createElement(Button, { variant: "outline", onClick: () => setShowConfirmDialog(false)}, "Cancel"

            )
            , React.createElement(Button, { onClick: handleCloseDay, disabled: isLoading}
              , isLoading && React.createElement(Loader2, { className: "h-4 w-4 mr-2 animate-spin"   } ), "Confirm Close"

            )
          )
        )
      )
    )
  );
}
