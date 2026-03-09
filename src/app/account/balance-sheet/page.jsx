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
import {
  Table,
  TableBody,
  TableCell,


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
import { Download, Calendar, Printer, Scale } from "lucide-react";

export default function BalanceSheetPage() {
  const [asOfDate, setAsOfDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedPeriod, setSelectedPeriod] = useState("current");

  // Fetch balance sheet from Convex
  const balanceSheet = useQuery(api.accounting.getBalanceSheet, {});

  const isLoading = balanceSheet === undefined;

  // Extract data with fallbacks
  const assets = _optionalChain([balanceSheet, 'optionalAccess', _2 => _2.assets]) || { current: [], fixed: [], other: [], totalCurrent: 0, totalFixed: 0, total: 0 };
  const liabilities = _optionalChain([balanceSheet, 'optionalAccess', _3 => _3.liabilities]) || { current: [], longTerm: [], totalCurrent: 0, totalLongTerm: 0, total: 0 };
  const equity = _optionalChain([balanceSheet, 'optionalAccess', _4 => _4.equity]) || [];
  const totalEquity = _optionalChain([balanceSheet, 'optionalAccess', _5 => _5.totalEquity]) || 0;

  const totalLiabilitiesAndEquity = liabilities.total + totalEquity;
  const isBalanced = Math.abs(assets.total - totalLiabilitiesAndEquity) < 0.01;

  return (
    React.createElement('div', { className: "space-y-6"}
      , React.createElement('div', { className: "flex items-center justify-between"  }
        , React.createElement('div', {}
          , React.createElement('h1', { className: "text-2xl font-bold" }, "Balance Sheet" )
          , React.createElement('p', { className: "text-muted-foreground"}, "Statement of financial position"

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
                , React.createElement(SelectItem, { value: "current"}, "Current")
                , React.createElement(SelectItem, { value: "last-month"}, "End of Last Month"   )
                , React.createElement(SelectItem, { value: "last-quarter"}, "End of Last Quarter"   )
                , React.createElement(SelectItem, { value: "last-year"}, "End of Last Year"   )
              )
            )
            , React.createElement('div', { className: "ml-auto flex items-center gap-2"   }
              , React.createElement(Scale, { className: "h-4 w-4 text-muted-foreground"  } )
              , isLoading ? (
                React.createElement(Skeleton, { className: "h-5 w-40" } )
              ) : isBalanced ? (
                React.createElement('span', { className: "text-green-600 font-medium" }, "✓ Balance Sheet is Balanced"

                )
              ) : (
                React.createElement('span', { className: "text-red-600 font-medium" }, "✗ Difference: Rs."
                    , " "
                  , Math.abs(assets.total - totalLiabilitiesAndEquity).toLocaleString()
                )
              )
            )
          )
        )
      )

      /* Summary Cards */
      , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-4"   }
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground"  }, "Total Assets"

            )
          )
          , React.createElement(CardContent, {}
            , isLoading ? (
              React.createElement(Skeleton, { className: "h-8 w-32" } )
            ) : (
              React.createElement('p', { className: "text-2xl font-bold text-blue-600"  }, "Rs. "
                 , assets.total.toLocaleString()
              )
            )
          )
        )
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground"  }, "Total Liabilities"

            )
          )
          , React.createElement(CardContent, {}
            , isLoading ? (
              React.createElement(Skeleton, { className: "h-8 w-32" } )
            ) : (
              React.createElement('p', { className: "text-2xl font-bold text-red-600"  }, "Rs. "
                 , liabilities.total.toLocaleString()
              )
            )
          )
        )
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground"  }, "Total Equity"

            )
          )
          , React.createElement(CardContent, {}
            , isLoading ? (
              React.createElement(Skeleton, { className: "h-8 w-32" } )
            ) : (
              React.createElement('p', { className: "text-2xl font-bold text-green-600"  }, "Rs. "
                 , totalEquity.toLocaleString()
              )
            )
          )
        )
      )

      /* Balance Sheet Statement */
      , React.createElement('div', { className: "grid grid-cols-1 lg:grid-cols-2 gap-6"   }
        /* Assets Side */
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "text-center border-b bg-blue-500/5"  }
            , React.createElement(CardTitle, { className: "text-lg text-blue-700" }, "ASSETS")
          )
          , React.createElement(CardContent, { className: "p-0"}
            , isLoading ? (
              React.createElement('div', { className: "p-6 space-y-4" }
                , [...Array(8)].map((_, i) => (
                  React.createElement(Skeleton, { key: i, className: "h-8 w-full" } )
                ))
              )
            ) : (
              React.createElement(Table, {}
                , React.createElement(TableBody, {}
                  /* Current Assets */
                  , assets.current.length > 0 && (
                    React.createElement(React.Fragment, null
                      , React.createElement(TableRow, { className: "bg-blue-500/10"}
                        , React.createElement(TableCell, {
                          colSpan: 2,
                          className: "font-bold text-blue-700" }
, "Current Assets"

                        )
                      )
                      , assets.current.map((item, index) => (
                        React.createElement(TableRow, { key: `ca-${index}`}
                          , React.createElement(TableCell, { className: "pl-8"}, item.name)
                          , React.createElement(TableCell, { className: "text-right"}
                            , item.amount.toLocaleString()
                          )
                        )
                      ))
                      , React.createElement(TableRow, { className: "font-medium"}
                        , React.createElement(TableCell, { className: "pl-4"}, "Total Current Assets"

                        )
                        , React.createElement(TableCell, { className: "text-right font-bold" }
                          , assets.totalCurrent.toLocaleString()
                        )
                      )
                    )
                  )

                  /* Fixed Assets */
                  , assets.fixed.length > 0 && (
                    React.createElement(React.Fragment, null
                      , React.createElement(TableRow, { className: "bg-blue-500/10"}
                        , React.createElement(TableCell, {
                          colSpan: 2,
                          className: "font-bold text-blue-700" }
, "Fixed Assets"

                        )
                      )
                      , assets.fixed.map((item, index) => (
                        React.createElement(TableRow, { key: `fa-${index}`}
                          , React.createElement(TableCell, { className: "pl-8"}, item.name)
                          , React.createElement(TableCell, { className: "text-right"}
                            , item.amount.toLocaleString()
                          )
                        )
                      ))
                      , React.createElement(TableRow, { className: "font-medium"}
                        , React.createElement(TableCell, { className: "pl-4"}, "Total Fixed Assets (Net)"

                        )
                        , React.createElement(TableCell, { className: "text-right font-bold" }
                          , assets.totalFixed.toLocaleString()
                        )
                      )
                    )
                  )

                  /* Other Assets */
                  , assets.other && assets.other.length > 0 && (
                    React.createElement(React.Fragment, null
                      , React.createElement(TableRow, { className: "bg-blue-500/10"}
                        , React.createElement(TableCell, {
                          colSpan: 2,
                          className: "font-bold text-blue-700" }
, "Other Assets"

                        )
                      )
                      , assets.other.map((item, index) => (
                        React.createElement(TableRow, { key: `oa-${index}`}
                          , React.createElement(TableCell, { className: "pl-8"}, item.name)
                          , React.createElement(TableCell, { className: "text-right"}
                            , item.amount.toLocaleString()
                          )
                        )
                      ))
                    )
                  )

                  /* Total Assets */
                  , React.createElement(TableRow, { className: "bg-blue-500/20 font-bold text-lg"  }
                    , React.createElement(TableCell, {}, "TOTAL ASSETS" )
                    , React.createElement(TableCell, { className: "text-right text-blue-700" }, "Rs. "
                       , assets.total.toLocaleString()
                    )
                  )
                )
              )
            )
          )
        )

        /* Liabilities & Equity Side */
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "text-center border-b bg-purple-500/5"  }
            , React.createElement(CardTitle, { className: "text-lg text-purple-700" }, "LIABILITIES & EQUITY"

            )
          )
          , React.createElement(CardContent, { className: "p-0"}
            , isLoading ? (
              React.createElement('div', { className: "p-6 space-y-4" }
                , [...Array(8)].map((_, i) => (
                  React.createElement(Skeleton, { key: i, className: "h-8 w-full" } )
                ))
              )
            ) : (
              React.createElement(Table, {}
                , React.createElement(TableBody, {}
                  /* Current Liabilities */
                  , liabilities.current.length > 0 && (
                    React.createElement(React.Fragment, null
                      , React.createElement(TableRow, { className: "bg-red-500/10"}
                        , React.createElement(TableCell, {
                          colSpan: 2,
                          className: "font-bold text-red-700" }
, "Current Liabilities"

                        )
                      )
                      , liabilities.current.map((item, index) => (
                        React.createElement(TableRow, { key: `cl-${index}`}
                          , React.createElement(TableCell, { className: "pl-8"}, item.name)
                          , React.createElement(TableCell, { className: "text-right"}
                            , item.amount.toLocaleString()
                          )
                        )
                      ))
                      , React.createElement(TableRow, { className: "font-medium"}
                        , React.createElement(TableCell, { className: "pl-4"}, "Total Current Liabilities"

                        )
                        , React.createElement(TableCell, { className: "text-right font-bold" }
                          , liabilities.totalCurrent.toLocaleString()
                        )
                      )
                    )
                  )

                  /* Long Term Liabilities */
                  , liabilities.longTerm.length > 0 && (
                    React.createElement(React.Fragment, null
                      , React.createElement(TableRow, { className: "bg-red-500/10"}
                        , React.createElement(TableCell, {
                          colSpan: 2,
                          className: "font-bold text-red-700" }
, "Long Term Liabilities"

                        )
                      )
                      , liabilities.longTerm.map((item, index) => (
                        React.createElement(TableRow, { key: `lt-${index}`}
                          , React.createElement(TableCell, { className: "pl-8"}, item.name)
                          , React.createElement(TableCell, { className: "text-right"}
                            , item.amount.toLocaleString()
                          )
                        )
                      ))
                      , React.createElement(TableRow, { className: "font-medium"}
                        , React.createElement(TableCell, { className: "pl-4"}, "Total Long Term Liabilities"

                        )
                        , React.createElement(TableCell, { className: "text-right font-bold" }
                          , liabilities.totalLongTerm.toLocaleString()
                        )
                      )
                    )
                  )

                  /* Total Liabilities */
                  , React.createElement(TableRow, { className: "bg-red-500/20 font-bold" }
                    , React.createElement(TableCell, {}, "TOTAL LIABILITIES" )
                    , React.createElement(TableCell, { className: "text-right text-red-700" }
                      , liabilities.total.toLocaleString()
                    )
                  )

                  /* Equity */
                  , equity.length > 0 && (
                    React.createElement(React.Fragment, null
                      , React.createElement(TableRow, { className: "bg-green-500/10"}
                        , React.createElement(TableCell, {
                          colSpan: 2,
                          className: "font-bold text-green-700" }
, "Owner's Equity"

                        )
                      )
                      , equity.map((item, index) => (
                        React.createElement(TableRow, { key: `eq-${index}`}
                          , React.createElement(TableCell, { className: "pl-8"}, item.name)
                          , React.createElement(TableCell, { className: "text-right"}
                            , item.amount.toLocaleString()
                          )
                        )
                      ))
                      , React.createElement(TableRow, { className: "font-bold bg-green-500/20" }
                        , React.createElement(TableCell, {}, "TOTAL EQUITY" )
                        , React.createElement(TableCell, { className: "text-right text-green-700" }
                          , totalEquity.toLocaleString()
                        )
                      )
                    )
                  )

                  /* Total Liabilities & Equity */
                  , React.createElement(TableRow, { className: "bg-purple-500/20 font-bold text-lg"  }
                    , React.createElement(TableCell, {}, "TOTAL LIABILITIES & EQUITY"   )
                    , React.createElement(TableCell, { className: "text-right text-purple-700" }, "Rs. "
                       , totalLiabilitiesAndEquity.toLocaleString()
                    )
                  )
                )
              )
            )
          )
        )
      )

      /* Key Ratios */
      , React.createElement(Card, {}
        , React.createElement(CardHeader, {}
          , React.createElement(CardTitle, {}, "Key Financial Ratios"  )
          , React.createElement(CardDescription, {}, "Important ratios derived from the balance sheet"

          )
        )
        , React.createElement(CardContent, {}
          , isLoading ? (
            React.createElement('div', { className: "grid grid-cols-2 md:grid-cols-4 gap-4"   }
              , [...Array(4)].map((_, i) => (
                React.createElement(Skeleton, { key: i, className: "h-24 w-full" } )
              ))
            )
          ) : (
            React.createElement('div', { className: "grid grid-cols-2 md:grid-cols-4 gap-4"   }
              , React.createElement('div', { className: "p-4 border rounded-lg"  }
                , React.createElement('p', { className: "text-sm text-muted-foreground" }, "Current Ratio" )
                , React.createElement('p', { className: "text-2xl font-bold" }
                  , liabilities.totalCurrent > 0 
                    ? (assets.totalCurrent / liabilities.totalCurrent).toFixed(2)
                    : "N/A"
                )
                , React.createElement('p', { className: "text-xs text-muted-foreground" }, "Current Assets / Current Liabilities"

                )
              )
              , React.createElement('div', { className: "p-4 border rounded-lg"  }
                , React.createElement('p', { className: "text-sm text-muted-foreground" }, "Debt to Equity Ratio"

                )
                , React.createElement('p', { className: "text-2xl font-bold" }
                  , totalEquity > 0
                    ? (liabilities.total / totalEquity).toFixed(2)
                    : "N/A"
                )
                , React.createElement('p', { className: "text-xs text-muted-foreground" }, "Total Debt / Total Equity"

                )
              )
              , React.createElement('div', { className: "p-4 border rounded-lg"  }
                , React.createElement('p', { className: "text-sm text-muted-foreground" }, "Quick Ratio" )
                , React.createElement('p', { className: "text-2xl font-bold" }
                  , liabilities.totalCurrent > 0
                    ? ((assets.totalCurrent * 0.9) / liabilities.totalCurrent).toFixed(2)
                    : "N/A"
                )
                , React.createElement('p', { className: "text-xs text-muted-foreground" }, "(Current Assets - Inventory) / Current Liabilities"

                )
              )
              , React.createElement('div', { className: "p-4 border rounded-lg"  }
                , React.createElement('p', { className: "text-sm text-muted-foreground" }, "Working Capital"

                )
                , React.createElement('p', { className: "text-2xl font-bold text-green-600"  }, "Rs."
                  , " "
                  , (assets.totalCurrent - liabilities.totalCurrent).toLocaleString()
                )
                , React.createElement('p', { className: "text-xs text-muted-foreground" }, "Current Assets - Current Liabilities"

                )
              )
            )
          )
        )
      )
    )
  );
}
