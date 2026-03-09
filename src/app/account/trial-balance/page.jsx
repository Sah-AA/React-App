"use client";
import React from "react";
function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Calendar, Printer, CheckCircle } from "lucide-react";

export default function TrialBalancePage() {
  const [asOfDate, setAsOfDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedPeriod, setSelectedPeriod] = useState("current-month");

  // Fetch trial balance from Convex
  const trialBalance = useQuery(api.accounting.getTrialBalance, {});

  const isLoading = trialBalance === undefined;

  // Build arrays from trial balance data
  const assets = _optionalChain([trialBalance, 'optionalAccess', _2 => _2.assets]) || [];
  const liabilities = _optionalChain([trialBalance, 'optionalAccess', _3 => _3.liabilities]) || [];
  const equity = _optionalChain([trialBalance, 'optionalAccess', _4 => _4.equity]) || [];
  const income = _optionalChain([trialBalance, 'optionalAccess', _5 => _5.income]) || [];
  const expenses = _optionalChain([trialBalance, 'optionalAccess', _6 => _6.expenses]) || [];

  const allAccounts = [...assets, ...liabilities, ...equity, ...income, ...expenses];

  const totalDebit = _optionalChain([trialBalance, 'optionalAccess', _7 => _7.totalDebits]) || 0;
  const totalCredit = _optionalChain([trialBalance, 'optionalAccess', _8 => _8.totalCredits]) || 0;
  const isBalanced = _optionalChain([trialBalance, 'optionalAccess', _9 => _9.isBalanced]) || false;

  const getCategoryColor = (code) => {
    if (code.startsWith("1")) return "bg-blue-500/10 text-blue-600";
    if (code.startsWith("2")) return "bg-red-500/10 text-red-600";
    if (code.startsWith("3")) return "bg-purple-500/10 text-purple-600";
    if (code.startsWith("4")) return "bg-green-500/10 text-green-600";
    if (code.startsWith("5")) return "bg-orange-500/10 text-orange-600";
    return "";
  };

  return (
    React.createElement('div', { className: "space-y-6"}
      , React.createElement('div', { className: "flex items-center justify-between"  }
        , React.createElement('div', {}
          , React.createElement('h1', { className: "text-2xl font-bold" }, "Trial Balance" )
          , React.createElement('p', { className: "text-muted-foreground"}, "Summary of all ledger account balances"

          )
        )
        , React.createElement('div', { className: "flex items-center gap-2"  }
          , React.createElement(Button, { variant: "outline"}
            , React.createElement(Printer, { className: "h-4 w-4 mr-2"  } ), "Print"

          )
          , React.createElement(Button, { variant: "outline"}
            , React.createElement(Download, { className: "h-4 w-4 mr-2"  } ), "Export"

          )
        )
      )

      /* Filters */
      , React.createElement(Card, {}
        , React.createElement(CardContent, { className: "pt-6"}
          , React.createElement('div', { className: "flex flex-wrap items-center gap-4"   }
            , React.createElement('div', { className: "flex items-center gap-2"  }
              , React.createElement(Calendar, { className: "h-4 w-4 text-muted-foreground"  } )
              , React.createElement('span', { className: "text-sm text-muted-foreground" }, "As of:" )
              , React.createElement(Input, {
                type: "date",
                value: asOfDate,
                onChange: (e) => setAsOfDate(e.target.value),
                className: "w-40"}
              )
            )
            , React.createElement(Select, { value: selectedPeriod, onValueChange: setSelectedPeriod}
              , React.createElement(SelectTrigger, { className: "w-[180px]"}
                , React.createElement(SelectValue, {} )
              )
              , React.createElement(SelectContent, {}
                , React.createElement(SelectItem, { value: "current-month"}, "Current Month" )
                , React.createElement(SelectItem, { value: "current-quarter"}, "Current Quarter" )
                , React.createElement(SelectItem, { value: "current-year"}, "Current Year" )
                , React.createElement(SelectItem, { value: "last-month"}, "Last Month" )
                , React.createElement(SelectItem, { value: "last-year"}, "Last Year" )
              )
            )
            , React.createElement('div', { className: "ml-auto flex items-center gap-2"   }
              , isBalanced ? (
                React.createElement(Badge, { className: "bg-green-500/10 text-green-600" }
                  , React.createElement(CheckCircle, { className: "h-3 w-3 mr-1"  } ), "Balanced"

                )
              ) : (
                React.createElement(Badge, { variant: "destructive"}, "Difference: Rs."
                   , " "
                  , Math.abs(totalDebit - totalCredit).toLocaleString()
                )
              )
            )
          )
        )
      )

      /* Trial Balance Report */
      , React.createElement(Card, {}
        , React.createElement(CardHeader, { className: "text-center border-b" }
          , React.createElement(CardTitle, { className: "text-xl"}, "Trial Balance" )
          , React.createElement(CardDescription, {}, "As of "
              , new Date(asOfDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          )
        )
        , React.createElement(CardContent, { className: "p-0"}
          , isLoading ? (
            React.createElement('div', { className: "p-6 space-y-4" }
              , [...Array(10)].map((_, i) => (
                React.createElement(Skeleton, { key: i, className: "h-10 w-full" } )
              ))
            )
          ) : (
            React.createElement(Table, {}
              , React.createElement(TableHeader, {}
                , React.createElement(TableRow, { className: "bg-muted/50"}
                  , React.createElement(TableHead, { className: "w-24"}, "Code")
                  , React.createElement(TableHead, {}, "Account Name" )
                  , React.createElement(TableHead, { className: "text-right w-40" }, "Debit (Rs.)" )
                  , React.createElement(TableHead, { className: "text-right w-40" }, "Credit (Rs.)" )
                )
              )
              , React.createElement(TableBody, {}
                /* Assets Section */
                , assets.length > 0 && (
                  React.createElement(React.Fragment, null
                    , React.createElement(TableRow, { className: "bg-blue-500/5"}
                      , React.createElement(TableCell, { colSpan: 4, className: "font-bold text-blue-700" }, "ASSETS"

                      )
                    )
                    , assets.map((account) => (
                      React.createElement(TableRow, { key: account.id}
                        , React.createElement(TableCell, {}
                          , React.createElement(Badge, { variant: "outline", className: getCategoryColor(account.code)}
                            , account.code
                          )
                        )
                        , React.createElement(TableCell, {}, account.name)
                        , React.createElement(TableCell, { className: "text-right font-medium" }
                          , account.debit > 0 ? account.debit.toLocaleString() : "-"
                        )
                        , React.createElement(TableCell, { className: "text-right font-medium" }
                          , account.credit > 0 ? account.credit.toLocaleString() : "-"
                        )
                      )
                    ))
                  )
                )

                /* Liabilities Section */
                , liabilities.length > 0 && (
                  React.createElement(React.Fragment, null
                    , React.createElement(TableRow, { className: "bg-red-500/5"}
                      , React.createElement(TableCell, { colSpan: 4, className: "font-bold text-red-700" }, "LIABILITIES"

                      )
                    )
                    , liabilities.map((account) => (
                      React.createElement(TableRow, { key: account.id}
                        , React.createElement(TableCell, {}
                          , React.createElement(Badge, { variant: "outline", className: getCategoryColor(account.code)}
                            , account.code
                          )
                        )
                        , React.createElement(TableCell, {}, account.name)
                        , React.createElement(TableCell, { className: "text-right font-medium" }
                          , account.debit > 0 ? account.debit.toLocaleString() : "-"
                        )
                        , React.createElement(TableCell, { className: "text-right font-medium" }
                          , account.credit > 0 ? account.credit.toLocaleString() : "-"
                        )
                      )
                    ))
                  )
                )

                /* Equity Section */
                , equity.length > 0 && (
                  React.createElement(React.Fragment, null
                    , React.createElement(TableRow, { className: "bg-purple-500/5"}
                      , React.createElement(TableCell, { colSpan: 4, className: "font-bold text-purple-700" }, "EQUITY"

                      )
                    )
                    , equity.map((account) => (
                      React.createElement(TableRow, { key: account.id}
                        , React.createElement(TableCell, {}
                          , React.createElement(Badge, { variant: "outline", className: getCategoryColor(account.code)}
                            , account.code
                          )
                        )
                        , React.createElement(TableCell, {}, account.name)
                        , React.createElement(TableCell, { className: "text-right font-medium" }
                          , account.debit > 0 ? account.debit.toLocaleString() : "-"
                        )
                        , React.createElement(TableCell, { className: "text-right font-medium" }
                          , account.credit > 0 ? account.credit.toLocaleString() : "-"
                        )
                      )
                    ))
                  )
                )

                /* Income Section */
                , income.length > 0 && (
                  React.createElement(React.Fragment, null
                    , React.createElement(TableRow, { className: "bg-green-500/5"}
                      , React.createElement(TableCell, { colSpan: 4, className: "font-bold text-green-700" }, "INCOME"

                      )
                    )
                    , income.map((account) => (
                      React.createElement(TableRow, { key: account.id}
                        , React.createElement(TableCell, {}
                          , React.createElement(Badge, { variant: "outline", className: getCategoryColor(account.code)}
                            , account.code
                          )
                        )
                        , React.createElement(TableCell, {}, account.name)
                        , React.createElement(TableCell, { className: "text-right font-medium" }
                          , account.debit > 0 ? account.debit.toLocaleString() : "-"
                        )
                        , React.createElement(TableCell, { className: "text-right font-medium" }
                          , account.credit > 0 ? account.credit.toLocaleString() : "-"
                        )
                      )
                    ))
                  )
                )

                /* Expenses Section */
                , expenses.length > 0 && (
                  React.createElement(React.Fragment, null
                    , React.createElement(TableRow, { className: "bg-orange-500/5"}
                      , React.createElement(TableCell, { colSpan: 4, className: "font-bold text-orange-700" }, "EXPENSES"

                      )
                    )
                    , expenses.map((account) => (
                      React.createElement(TableRow, { key: account.id}
                        , React.createElement(TableCell, {}
                          , React.createElement(Badge, { variant: "outline", className: getCategoryColor(account.code)}
                            , account.code
                          )
                        )
                        , React.createElement(TableCell, {}, account.name)
                        , React.createElement(TableCell, { className: "text-right font-medium" }
                          , account.debit > 0 ? account.debit.toLocaleString() : "-"
                        )
                        , React.createElement(TableCell, { className: "text-right font-medium" }
                          , account.credit > 0 ? account.credit.toLocaleString() : "-"
                        )
                      )
                    ))
                  )
                )

                /* Totals Row */
                , React.createElement(TableRow, { className: "bg-muted font-bold text-lg"  }
                  , React.createElement(TableCell, { colSpan: 2, className: "text-right"}, "TOTAL"

                  )
                  , React.createElement(TableCell, { className: "text-right text-green-700" }
                    , totalDebit.toLocaleString()
                  )
                  , React.createElement(TableCell, { className: "text-right text-red-700" }
                    , totalCredit.toLocaleString()
                  )
                )
              )
            )
          )
        )
      )

      /* Summary */
      , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-4"   }
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground"  }, "Total Accounts"

            )
          )
          , React.createElement(CardContent, {}
            , React.createElement('p', { className: "text-2xl font-bold" }, allAccounts.length)
          )
        )
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground"  }, "Total Debit"

            )
          )
          , React.createElement(CardContent, {}
            , React.createElement('p', { className: "text-2xl font-bold text-green-600"  }, "Rs. "
               , totalDebit.toLocaleString()
            )
          )
        )
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground"  }, "Total Credit"

            )
          )
          , React.createElement(CardContent, {}
            , React.createElement('p', { className: "text-2xl font-bold text-red-600"  }, "Rs. "
               , totalCredit.toLocaleString()
            )
          )
        )
      )
    )
  );
}
