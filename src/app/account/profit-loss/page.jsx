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
import {
  Download,
  Calendar,
  Printer,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export default function ProfitLossPage() {
  const [dateFrom, setDateFrom] = useState("2025-01-01");
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0]);
  const [selectedPeriod, setSelectedPeriod] = useState("current-month");

  // Build date range for query
  const dateRange = {
    from: dateFrom ? new Date(dateFrom) : undefined,
    to: dateTo ? new Date(dateTo) : undefined,
  };

  // Fetch profit/loss from Convex
  const profitLoss = useQuery(api.accounting.getProfitLoss, {
    startDate: _optionalChain([dateRange, 'access', _2 => _2.from, 'optionalAccess', _3 => _3.getTime, 'call', _4 => _4()]) || 0,
    endDate: _optionalChain([dateRange, 'access', _5 => _5.to, 'optionalAccess', _6 => _6.getTime, 'call', _7 => _7()]) || Date.now(),
  });

  const isLoading = profitLoss === undefined;

  // Calculate values with fallbacks
  const revenue = _optionalChain([profitLoss, 'optionalAccess', _8 => _8.revenue]) || { items: [], total: 0 };
  const costOfGoodsSold = _optionalChain([profitLoss, 'optionalAccess', _9 => _9.costOfGoodsSold]) || { items: [], total: 0 };
  const operatingExpenses = _optionalChain([profitLoss, 'optionalAccess', _10 => _10.operatingExpenses]) || { items: [], total: 0 };
  const depreciation = _optionalChain([profitLoss, 'optionalAccess', _11 => _11.depreciation]) || { items: [], total: 0 };
  const otherExpenses = _optionalChain([profitLoss, 'optionalAccess', _12 => _12.otherExpenses]) || { items: [], total: 0 };

  const grossProfit = revenue.total - costOfGoodsSold.total;
  const operatingProfit = grossProfit - operatingExpenses.total;
  const profitBeforeDepreciation = operatingProfit;
  const profitAfterDepreciation = profitBeforeDepreciation - depreciation.total;
  const netProfit = profitAfterDepreciation - otherExpenses.total;

  const grossMargin = revenue.total > 0 
    ? ((grossProfit / revenue.total) * 100).toFixed(1)
    : "0.0";
  const netMargin = revenue.total > 0
    ? ((netProfit / revenue.total) * 100).toFixed(1)
    : "0.0";

  return (
    React.createElement('div', { className: "space-y-6"}
      , React.createElement('div', { className: "flex items-center justify-between"  }
        , React.createElement('div', {}
          , React.createElement('h1', { className: "text-2xl font-bold" }, "Profit & Loss Statement"   )
          , React.createElement('p', { className: "text-muted-foreground"}, "Income statement showing profitability"

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
                , React.createElement(SelectItem, { value: "custom"}, "Custom Range" )
              )
            )
            , React.createElement('div', { className: "flex items-center gap-2"  }
              , React.createElement(Calendar, { className: "h-4 w-4 text-muted-foreground"  } )
              , React.createElement(Input, {
                type: "date",
                value: dateFrom,
                onChange: (e) => setDateFrom(e.target.value),
                className: "w-40"}
              )
              , React.createElement('span', { className: "text-muted-foreground"}, "to")
              , React.createElement(Input, {
                type: "date",
                value: dateTo,
                onChange: (e) => setDateTo(e.target.value),
                className: "w-40"}
              )
            )
          )
        )
      )

      /* Key Metrics */
      , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-4 gap-4"   }
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground"  }, "Total Revenue"

            )
          )
          , React.createElement(CardContent, {}
            , isLoading ? (
              React.createElement(Skeleton, { className: "h-8 w-32" } )
            ) : (
              React.createElement('p', { className: "text-2xl font-bold" }, "Rs. "
                 , revenue.total.toLocaleString()
              )
            )
          )
        )
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground"  }, "Gross Profit"

            )
          )
          , React.createElement(CardContent, {}
            , isLoading ? (
              React.createElement(Skeleton, { className: "h-8 w-32" } )
            ) : (
              React.createElement(React.Fragment, null
                , React.createElement('p', { className: "text-2xl font-bold text-blue-600"  }, "Rs. "
                   , grossProfit.toLocaleString()
                )
                , React.createElement('p', { className: "text-sm text-muted-foreground" }, grossMargin, "% margin" )
              )
            )
          )
        )
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground"  }, "Net Profit"

            )
          )
          , React.createElement(CardContent, {}
            , isLoading ? (
              React.createElement(Skeleton, { className: "h-8 w-32" } )
            ) : (
              React.createElement(React.Fragment, null
                , React.createElement('div', { className: "flex items-center gap-2"  }
                  , React.createElement('p', {
                    className: `text-2xl font-bold ${
                      netProfit >= 0 ? "text-green-600" : "text-red-600"
                    }`}
, "Rs. "
                     , Math.abs(netProfit).toLocaleString()
                  )
                  , netProfit >= 0 ? (
                    React.createElement(TrendingUp, { className: "h-5 w-5 text-green-600"  } )
                  ) : (
                    React.createElement(TrendingDown, { className: "h-5 w-5 text-red-600"  } )
                  )
                )
                , React.createElement('p', { className: "text-sm text-muted-foreground" }, netMargin, "% margin" )
              )
            )
          )
        )
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground"  }, "Total Expenses"

            )
          )
          , React.createElement(CardContent, {}
            , isLoading ? (
              React.createElement(Skeleton, { className: "h-8 w-32" } )
            ) : (
              React.createElement('p', { className: "text-2xl font-bold text-red-600"  }, "Rs."
                , " "
                , (
                  costOfGoodsSold.total +
                  operatingExpenses.total +
                  depreciation.total +
                  otherExpenses.total
                ).toLocaleString()
              )
            )
          )
        )
      )

      /* P&L Statement */
      , React.createElement(Card, {}
        , React.createElement(CardHeader, { className: "text-center border-b" }
          , React.createElement(CardTitle, { className: "text-xl"}, "Statement of Profit and Loss"

          )
          , React.createElement(CardDescription, {}, "For the period "
               , new Date(dateFrom).toLocaleDateString(), " to" , " "
            , new Date(dateTo).toLocaleDateString()
          )
        )
        , React.createElement(CardContent, { className: "p-0"}
          , isLoading ? (
            React.createElement('div', { className: "p-6 space-y-4" }
              , [...Array(15)].map((_, i) => (
                React.createElement(Skeleton, { key: i, className: "h-10 w-full" } )
              ))
            )
          ) : (
            React.createElement(Table, {}
              , React.createElement(TableHeader, {}
                , React.createElement(TableRow, { className: "bg-muted/50"}
                  , React.createElement(TableHead, { className: "w-[60%]"}, "Particulars")
                  , React.createElement(TableHead, { className: "text-right"}, "Amount (Rs.)" )
                  , React.createElement(TableHead, { className: "text-right"}, "Total (Rs.)" )
                )
              )
              , React.createElement(TableBody, {}
                /* Revenue Section */
                , React.createElement(TableRow, { className: "bg-green-500/5"}
                  , React.createElement(TableCell, { colSpan: 3, className: "font-bold text-green-700" }, "REVENUE"

                  )
                )
                , revenue.items.map((item, index) => (
                  React.createElement(TableRow, { key: `rev-${index}`}
                    , React.createElement(TableCell, { className: "pl-8"}, item.name)
                    , React.createElement(TableCell, { className: "text-right"}
                      , item.amount.toLocaleString()
                    )
                    , React.createElement(TableCell, {})
                  )
                ))
                , React.createElement(TableRow, { className: "font-medium bg-green-500/10" }
                  , React.createElement(TableCell, { className: "pl-4"}, "Total Revenue" )
                  , React.createElement(TableCell, {})
                  , React.createElement(TableCell, { className: "text-right text-green-700 font-bold"  }
                    , revenue.total.toLocaleString()
                  )
                )

                /* COGS Section */
                , React.createElement(TableRow, { className: "bg-red-500/5"}
                  , React.createElement(TableCell, { colSpan: 3, className: "font-bold text-red-700" }, "COST OF GOODS SOLD"

                  )
                )
                , costOfGoodsSold.items.map((item, index) => (
                  React.createElement(TableRow, { key: `cogs-${index}`}
                    , React.createElement(TableCell, { className: "pl-8"}, item.name)
                    , React.createElement(TableCell, { className: "text-right"}
                      , item.amount.toLocaleString()
                    )
                    , React.createElement(TableCell, {})
                  )
                ))
                , React.createElement(TableRow, { className: "font-medium bg-red-500/10" }
                  , React.createElement(TableCell, { className: "pl-4"}, "Total Cost of Goods Sold"    )
                  , React.createElement(TableCell, {})
                  , React.createElement(TableCell, { className: "text-right text-red-700 font-bold"  }, "("
                    , costOfGoodsSold.total.toLocaleString(), ")"
                  )
                )

                /* Gross Profit */
                , React.createElement(TableRow, { className: "bg-blue-500/10 font-bold text-lg"  }
                  , React.createElement(TableCell, {}, "GROSS PROFIT" )
                  , React.createElement(TableCell, {})
                  , React.createElement(TableCell, { className: "text-right text-blue-700" }
                    , grossProfit.toLocaleString()
                  )
                )

                /* Operating Expenses */
                , React.createElement(TableRow, { className: "bg-orange-500/5"}
                  , React.createElement(TableCell, { colSpan: 3, className: "font-bold text-orange-700" }, "OPERATING EXPENSES"

                  )
                )
                , operatingExpenses.items.map((item, index) => (
                  React.createElement(TableRow, { key: `opex-${index}`}
                    , React.createElement(TableCell, { className: "pl-8"}, item.name)
                    , React.createElement(TableCell, { className: "text-right"}
                      , item.amount.toLocaleString()
                    )
                    , React.createElement(TableCell, {})
                  )
                ))
                , React.createElement(TableRow, { className: "font-medium bg-orange-500/10" }
                  , React.createElement(TableCell, { className: "pl-4"}, "Total Operating Expenses"  )
                  , React.createElement(TableCell, {})
                  , React.createElement(TableCell, { className: "text-right text-orange-700 font-bold"  }, "("
                    , operatingExpenses.total.toLocaleString(), ")"
                  )
                )

                /* Operating Profit */
                , React.createElement(TableRow, { className: "bg-muted font-bold" }
                  , React.createElement(TableCell, {}, "OPERATING PROFIT (EBITDA)"  )
                  , React.createElement(TableCell, {})
                  , React.createElement(TableCell, { className: "text-right"}
                    , operatingProfit.toLocaleString()
                  )
                )

                /* Depreciation */
                , React.createElement(TableRow, { className: "bg-gray-500/5"}
                  , React.createElement(TableCell, { colSpan: 3, className: "font-bold text-gray-700" }, "DEPRECIATION & AMORTIZATION"

                  )
                )
                , depreciation.items.map((item, index) => (
                  React.createElement(TableRow, { key: `dep-${index}`}
                    , React.createElement(TableCell, { className: "pl-8"}, item.name)
                    , React.createElement(TableCell, { className: "text-right"}
                      , item.amount.toLocaleString()
                    )
                    , React.createElement(TableCell, {})
                  )
                ))
                , React.createElement(TableRow, { className: "font-medium bg-gray-500/10" }
                  , React.createElement(TableCell, { className: "pl-4"}, "Total Depreciation" )
                  , React.createElement(TableCell, {})
                  , React.createElement(TableCell, { className: "text-right text-gray-700 font-bold"  }, "("
                    , depreciation.total.toLocaleString(), ")"
                  )
                )

                /* Profit Before Tax */
                , React.createElement(TableRow, { className: "bg-muted font-bold" }
                  , React.createElement(TableCell, {}, "PROFIT BEFORE INTEREST & TAX (EBIT)"     )
                  , React.createElement(TableCell, {})
                  , React.createElement(TableCell, { className: "text-right"}
                    , profitAfterDepreciation.toLocaleString()
                  )
                )

                /* Other Expenses */
                , React.createElement(TableRow, { className: "bg-purple-500/5"}
                  , React.createElement(TableCell, { colSpan: 3, className: "font-bold text-purple-700" }, "OTHER EXPENSES"

                  )
                )
                , otherExpenses.items.map((item, index) => (
                  React.createElement(TableRow, { key: `other-${index}`}
                    , React.createElement(TableCell, { className: "pl-8"}, item.name)
                    , React.createElement(TableCell, { className: "text-right"}
                      , item.amount.toLocaleString()
                    )
                    , React.createElement(TableCell, {})
                  )
                ))
                , React.createElement(TableRow, { className: "font-medium bg-purple-500/10" }
                  , React.createElement(TableCell, { className: "pl-4"}, "Total Other Expenses"  )
                  , React.createElement(TableCell, {})
                  , React.createElement(TableCell, { className: "text-right text-purple-700 font-bold"  }, "("
                    , otherExpenses.total.toLocaleString(), ")"
                  )
                )

                /* Net Profit */
                , React.createElement(TableRow, {
                  className: `font-bold text-lg ${
                    netProfit >= 0 ? "bg-green-500/20" : "bg-red-500/20"
                  }`}

                  , React.createElement(TableCell, { className: "text-lg"}, "NET "
                     , netProfit >= 0 ? "PROFIT" : "LOSS"
                  )
                  , React.createElement(TableCell, {})
                  , React.createElement(TableCell, {
                    className: `text-right text-xl ${
                      netProfit >= 0 ? "text-green-700" : "text-red-700"
                    }`}

                    , netProfit >= 0 ? "" : "("
                    , Math.abs(netProfit).toLocaleString()
                    , netProfit >= 0 ? "" : ")"
                  )
                )
              )
            )
          )
        )
      )
    )
  );
}
