"use client";
import React from "react";
function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

import { useState } from "react";
import { useQuery } from "convex/react";

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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,

} from "lucide-react";
import { api } from "convex/_generated/api";


export default function LedgerPage() {
  const [selectedAccount, setSelectedAccount] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Fetch accounts from Convex
  const accounts = useQuery(api.chartOfAccounts.list);
  
  // Build date range for query
  const dateRange = {
    from: dateFrom ? new Date(dateFrom) : undefined,
    to: dateTo ? new Date(dateTo) : undefined,
  };

  // Fetch ledger entries from Convex
  const ledgerEntries = useQuery(
    api.accounting.getLedgerEntries,
    selectedAccount
      ? {
          accountId: selectedAccount ,
          startDate: _optionalChain([dateRange, 'access', _2 => _2.from, 'optionalAccess', _3 => _3.getTime, 'call', _4 => _4()]),
          endDate: _optionalChain([dateRange, 'access', _5 => _5.to, 'optionalAccess', _6 => _6.getTime, 'call', _7 => _7()]),
        }
      : "skip"
  );

  const isLoading = accounts === undefined;
  const isLoadingEntries = selectedAccount && ledgerEntries === undefined;

  const selectedAccountData = _optionalChain([accounts, 'optionalAccess', _8 => _8.find, 'call', _9 => _9((a) => a._id === selectedAccount)]);
  const selectedAccountName = _optionalChain([selectedAccountData, 'optionalAccess', _10 => _10.name]) || "Select an account";
  const openingBalance = _optionalChain([selectedAccountData, 'optionalAccess', _11 => _11.openingBalance]) || 0;

  // Filter entries by search query (if entries are loaded)
  const filteredEntries = (ledgerEntries || []).filter((entry) => {
    const matchesSearch = entry.particulars
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalDebit = filteredEntries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = filteredEntries.reduce((sum, e) => sum + e.credit, 0);
  const closingBalance = filteredEntries.length > 0 
    ? filteredEntries[filteredEntries.length - 1].balance 
    : openingBalance;

  return (
    React.createElement('div', { className: "space-y-6"}
      , React.createElement('div', { className: "flex items-center justify-between"  }
        , React.createElement('div', {}
          , React.createElement('h1', { className: "text-2xl font-bold" }, "Ledger")
          , React.createElement('p', { className: "text-muted-foreground"}, "View account-wise transaction history"

          )
        )
        , React.createElement(Button, { variant: "outline"}
          , React.createElement(Download, { className: "h-4 w-4 mr-2"  } ), "Export"

        )
      )

      /* Account Selection & Filters */
      , React.createElement(Card, {}
        , React.createElement(CardHeader, {}
          , React.createElement(CardTitle, {}, "Ledger Filters" )
          , React.createElement(CardDescription, {}, "Select account and date range to view transactions"

          )
        )
        , React.createElement(CardContent, {}
          , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-5 gap-4"   }
            , React.createElement('div', { className: "md:col-span-2"}
              , isLoading ? (
                React.createElement(Skeleton, { className: "h-10 w-full" } )
              ) : (
                React.createElement(Select, { value: selectedAccount, onValueChange: setSelectedAccount}
                  , React.createElement(SelectTrigger, {}
                    , React.createElement(SelectValue, { placeholder: "Select account" } )
                  )
                  , React.createElement(SelectContent, {}
                    , _optionalChain([accounts, 'optionalAccess', _12 => _12.map, 'call', _13 => _13((account) => (
                      React.createElement(SelectItem, { key: account._id, value: account._id}
                        , account.code, " - "  , account.name
                      )
                    ))])
                  )
                )
              )
            )
            , React.createElement('div', {}
              , React.createElement(Input, {
                type: "date",
                value: dateFrom,
                onChange: (e) => setDateFrom(e.target.value),
                placeholder: "From date" }
              )
            )
            , React.createElement('div', {}
              , React.createElement(Input, {
                type: "date",
                value: dateTo,
                onChange: (e) => setDateTo(e.target.value),
                placeholder: "To date" }
              )
            )
            , React.createElement('div', { className: "relative"}
              , React.createElement(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"       } )
              , React.createElement(Input, {
                placeholder: "Search...",
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value),
                className: "pl-9"}
              )
            )
          )
        )
      )

      /* Account Summary */
      , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-4"   }
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground"  }, "Opening Balance"

            )
          )
          , React.createElement(CardContent, {}
            , isLoading ? (
              React.createElement(Skeleton, { className: "h-8 w-32" } )
            ) : (
              React.createElement('p', { className: "text-2xl font-bold" }, "Rs. " , openingBalance.toLocaleString())
            )
          )
        )
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground"  }, "Period Movement"

            )
          )
          , React.createElement(CardContent, {}
            , isLoadingEntries ? (
              React.createElement(Skeleton, { className: "h-8 w-40" } )
            ) : (
              React.createElement('div', { className: "flex items-center gap-4"  }
                , React.createElement('div', { className: "flex items-center text-green-600"  }
                  , React.createElement(ArrowUpRight, { className: "h-4 w-4 mr-1"  } )
                  , React.createElement('span', { className: "font-medium"}, "Rs. " , totalDebit.toLocaleString())
                )
                , React.createElement('div', { className: "flex items-center text-red-600"  }
                  , React.createElement(ArrowDownRight, { className: "h-4 w-4 mr-1"  } )
                  , React.createElement('span', { className: "font-medium"}, "Rs. "
                     , totalCredit.toLocaleString()
                  )
                )
              )
            )
          )
        )
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground"  }, "Closing Balance"

            )
          )
          , React.createElement(CardContent, {}
            , isLoadingEntries ? (
              React.createElement(Skeleton, { className: "h-8 w-32" } )
            ) : (
              React.createElement('p', { className: "text-2xl font-bold text-blue-600"  }, "Rs. " , closingBalance.toLocaleString())
            )
          )
        )
      )

      /* Ledger Table */
      , React.createElement(Card, {}
        , React.createElement(CardHeader, {}
          , React.createElement('div', { className: "flex items-center justify-between"  }
            , React.createElement('div', {}
              , React.createElement(CardTitle, {}, selectedAccountName, " Ledger" )
              , React.createElement(CardDescription, {}
                , !selectedAccount 
                  ? "Please select an account to view transactions"
                  : `Showing ${filteredEntries.length} transactions`
              )
            )
          )
        )
        , React.createElement(CardContent, {}
          , React.createElement(ScrollArea, { className: "h-[500px]"}
            , isLoadingEntries ? (
              React.createElement('div', { className: "space-y-2"}
                , [...Array(5)].map((_, i) => (
                  React.createElement(Skeleton, { key: i, className: "h-12 w-full" } )
                ))
              )
            ) : !selectedAccount ? (
              React.createElement('div', { className: "flex flex-col items-center justify-center py-12 text-muted-foreground"     }
                , React.createElement(Calendar, { className: "h-12 w-12 mb-4 opacity-50"   } )
                , React.createElement('p', {}, "Select an account to view its ledger entries"       )
              )
            ) : filteredEntries.length === 0 ? (
              React.createElement('div', { className: "flex flex-col items-center justify-center py-12 text-muted-foreground"     }
                , React.createElement(Calendar, { className: "h-12 w-12 mb-4 opacity-50"   } )
                , React.createElement('p', {}, "No transactions found for this account"     )
              )
            ) : (
              React.createElement(Table, {}
                , React.createElement(TableHeader, {}
                  , React.createElement(TableRow, {}
                    , React.createElement(TableHead, {}, "Date")
                    , React.createElement(TableHead, {}, "Voucher No." )
                    , React.createElement(TableHead, { className: "w-[300px]"}, "Particulars")
                    , React.createElement(TableHead, { className: "text-right"}, "Debit")
                    , React.createElement(TableHead, { className: "text-right"}, "Credit")
                    , React.createElement(TableHead, { className: "text-right"}, "Balance")
                  )
                )
                , React.createElement(TableBody, {}
                  /* Opening Balance Row */
                  , React.createElement(TableRow, { className: "bg-muted/50"}
                    , React.createElement(TableCell, { className: "font-medium"}, "-")
                    , React.createElement(TableCell, {}, "-")
                    , React.createElement(TableCell, { className: "font-medium"}, "Opening Balance" )
                    , React.createElement(TableCell, { className: "text-right"}, "-")
                    , React.createElement(TableCell, { className: "text-right"}, "-")
                    , React.createElement(TableCell, { className: "text-right font-medium" }, "Rs. "
                       , openingBalance.toLocaleString()
                    )
                  )

                  , filteredEntries.map((entry) => (
                    React.createElement(TableRow, { key: entry.id}
                      , React.createElement(TableCell, {}
                        , React.createElement('div', { className: "flex items-center text-sm text-muted-foreground"   }
                          , React.createElement(Calendar, { className: "h-3 w-3 mr-1"  } )
                          , new Date(entry.date).toLocaleDateString()
                        )
                      )
                      , React.createElement(TableCell, {}
                        , React.createElement(Badge, { variant: "outline", className: "font-mono text-xs" }
                          , entry.voucherNo
                        )
                      )
                      , React.createElement(TableCell, {}, entry.particulars)
                      , React.createElement(TableCell, { className: "text-right"}
                        , entry.debit > 0 && (
                          React.createElement('span', { className: "text-green-600 font-medium" }, "Rs. "
                             , entry.debit.toLocaleString()
                          )
                        )
                      )
                      , React.createElement(TableCell, { className: "text-right"}
                        , entry.credit > 0 && (
                          React.createElement('span', { className: "text-red-600 font-medium" }, "Rs. "
                             , entry.credit.toLocaleString()
                          )
                        )
                      )
                      , React.createElement(TableCell, { className: "text-right font-medium" }, "Rs. "
                         , entry.balance.toLocaleString()
                      )
                    )
                  ))

                  /* Totals Row */
                  , React.createElement(TableRow, { className: "bg-muted/50 font-bold" }
                    , React.createElement(TableCell, { colSpan: 3, className: "text-right"}, "Total"

                    )
                    , React.createElement(TableCell, { className: "text-right text-green-600" }, "Rs. "
                       , totalDebit.toLocaleString()
                    )
                    , React.createElement(TableCell, { className: "text-right text-red-600" }, "Rs. "
                       , totalCredit.toLocaleString()
                    )
                    , React.createElement(TableCell, { className: "text-right"}, "Rs. "
                       , closingBalance.toLocaleString()
                    )
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
