"use client";
import React from "react";
function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  User,
  Phone,

  Calendar,
  CreditCard,
  Receipt,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

export default function CreditPage() {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentNote, setPaymentNote] = useState("");

  // Fetch data from Convex
  const customersWithCredit = useQuery(api.customers.getWithCredit);
  const transactions = useQuery(api.customers.getCreditTransactions, {});
  const recordPayment = useMutation(api.customers.recordCreditPayment);

  const isLoading = customersWithCredit === undefined;
  const isLoadingTransactions = transactions === undefined;

  const handleRecordPayment = async () => {
    if (!selectedCustomer) return;
    if (paymentAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      await recordPayment({
        customerId: selectedCustomer._id ,
        amount: paymentAmount,
        notes: paymentNote || undefined,
      });
      toast.success(
        `Payment of Rs. ${paymentAmount.toLocaleString()} recorded for ${selectedCustomer.name}`
      );
      setIsPaymentDialogOpen(false);
      setSelectedCustomer(null);
      setPaymentAmount(0);
      setPaymentMethod("cash");
      setPaymentNote("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to record payment");
    }
  };

  const getStatusBadge = (customer) => {
    const status = customer.currentCredit > customer.creditLimit 
      ? "overdue" 
      : customer.currentCredit > customer.creditLimit * 0.8 
        ? "warning" 
        : "good";
    
    switch (status) {
      case "good":
        return (
          React.createElement(Badge, { className: "bg-green-500/10 text-green-600" }
            , React.createElement(CheckCircle, { className: "h-3 w-3 mr-1"  } ), "Good Standing"

          )
        );
      case "warning":
        return (
          React.createElement(Badge, { className: "bg-orange-500/10 text-orange-600" }
            , React.createElement(Clock, { className: "h-3 w-3 mr-1"  } ), "High Balance"

          )
        );
      case "overdue":
        return (
          React.createElement(Badge, { className: "bg-red-500/10 text-red-600" }
            , React.createElement(AlertCircle, { className: "h-3 w-3 mr-1"  } ), "Over Limit"

          )
        );
      default:
        return React.createElement(Badge, { variant: "outline"}, status);
    }
  };

  const filteredCustomers = (customersWithCredit || []).filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery)
  );

  const totalOutstanding = (customersWithCredit || []).reduce(
    (sum, c) => sum + c.currentCredit,
    0
  );
  const customersWithBalance = (customersWithCredit || []).filter(
    (c) => c.currentCredit > 0
  ).length;
  const overdueCustomers = (customersWithCredit || []).filter(
    (c) => c.currentCredit > c.creditLimit
  ).length;

  return (
    React.createElement('div', { className: "space-y-6"}
      , React.createElement('div', { className: "flex items-center justify-between"  }
        , React.createElement('div', {}
          , React.createElement('h1', { className: "text-2xl font-bold" }, "Credit Management" )
          , React.createElement('p', { className: "text-muted-foreground"}, "Manage customer credit accounts and receivables"

          )
        )
      )

      /* Summary Cards */
      , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-4 gap-4"   }
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground"  }, "Total Outstanding"

            )
          )
          , React.createElement(CardContent, {}
            , isLoading ? (
              React.createElement(Skeleton, { className: "h-8 w-32" } )
            ) : (
              React.createElement('p', { className: "text-2xl font-bold text-orange-600"  }, "Rs. "
                 , totalOutstanding.toLocaleString()
              )
            )
          )
        )
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground"  }, "Credit Customers"

            )
          )
          , React.createElement(CardContent, {}
            , isLoading ? (
              React.createElement(Skeleton, { className: "h-8 w-16" } )
            ) : (
              React.createElement('p', { className: "text-2xl font-bold" }
                , (customersWithCredit || []).length
              )
            )
          )
        )
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground"  }, "With Balance"

            )
          )
          , React.createElement(CardContent, {}
            , isLoading ? (
              React.createElement(Skeleton, { className: "h-8 w-16" } )
            ) : (
              React.createElement('p', { className: "text-2xl font-bold text-blue-600"  }
                , customersWithBalance
              )
            )
          )
        )
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground"  }, "Over Limit"

            )
          )
          , React.createElement(CardContent, {}
            , isLoading ? (
              React.createElement(Skeleton, { className: "h-8 w-16" } )
            ) : (
              React.createElement('p', { className: "text-2xl font-bold text-red-600"  }
                , overdueCustomers
              )
            )
          )
        )
      )

      , React.createElement(Tabs, { defaultValue: "customers"}
        , React.createElement(TabsList, {}
          , React.createElement(TabsTrigger, { value: "customers"}, "Credit Customers" )
          , React.createElement(TabsTrigger, { value: "transactions"}, "Transactions")
          , React.createElement(TabsTrigger, { value: "aging"}, "Aging Report" )
        )

        , React.createElement(TabsContent, { value: "customers", className: "mt-4"}
          , React.createElement(Card, {}
            , React.createElement(CardHeader, {}
              , React.createElement('div', { className: "flex items-center justify-between"  }
                , React.createElement(CardTitle, {}, "Credit Customers" )
                , React.createElement('div', { className: "relative w-72" }
                  , React.createElement(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"       } )
                  , React.createElement(Input, {
                    placeholder: "Search by name or phone..."    ,
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value),
                    className: "pl-9"}
                  )
                )
              )
            )
            , React.createElement(CardContent, {}
              , isLoading ? (
                React.createElement('div', { className: "space-y-3"}
                  , [1, 2, 3, 4, 5].map((i) => (
                    React.createElement(Skeleton, { key: i, className: "h-12 w-full" } )
                  ))
                )
              ) : (
              React.createElement(Table, {}
                , React.createElement(TableHeader, {}
                  , React.createElement(TableRow, {}
                    , React.createElement(TableHead, {}, "Customer")
                    , React.createElement(TableHead, {}, "Contact")
                    , React.createElement(TableHead, { className: "text-right"}, "Credit Limit" )
                    , React.createElement(TableHead, { className: "text-right"}, "Balance")
                    , React.createElement(TableHead, {}, "Status")
                    , React.createElement(TableHead, { className: "text-right"}, "Actions")
                  )
                )
                , React.createElement(TableBody, {}
                  , filteredCustomers.length === 0 ? (
                    React.createElement(TableRow, {}
                      , React.createElement(TableCell, { colSpan: 6, className: "text-center py-8" }
                        , React.createElement(User, { className: "h-8 w-8 mx-auto text-muted-foreground mb-2"    } )
                        , React.createElement('p', { className: "text-muted-foreground"}, "No customers found"

                        )
                      )
                    )
                  ) : (
                    filteredCustomers.map((customer) => (
                      React.createElement(TableRow, { key: customer._id}
                        , React.createElement(TableCell, {}
                          , React.createElement('div', {}
                            , React.createElement('p', { className: "font-medium"}, customer.name)
                            , React.createElement('p', { className: "text-xs text-muted-foreground" }
                              , _optionalChain([customer, 'access', _ => _.creditOrders, 'optionalAccess', _2 => _2.length]) || 0, " credit orders"
                            )
                          )
                        )
                        , React.createElement(TableCell, {}
                          , React.createElement('div', { className: "flex items-center text-sm"  }
                            , React.createElement(Phone, { className: "h-3 w-3 mr-1 text-muted-foreground"   } )
                            , customer.phone
                          )
                        )
                        , React.createElement(TableCell, { className: "text-right"}, "Rs. "
                           , (customer.creditLimit || 0).toLocaleString()
                        )
                        , React.createElement(TableCell, { className: "text-right"}
                          , React.createElement('span', {
                            className: 
                              (customer.currentCredit || 0) > (customer.creditLimit || 0)
                                ? "text-red-600 font-bold"
                                : (customer.currentCredit || 0) > 0
                                ? "text-orange-600 font-medium"
                                : "text-green-600"
                            }
, "Rs. "
                             , (customer.currentCredit || 0).toLocaleString()
                          )
                        )
                        , React.createElement(TableCell, {}, getStatusBadge(customer))
                        , React.createElement(TableCell, { className: "text-right"}
                          , React.createElement('div', { className: "flex items-center justify-end gap-2"   }
                            , React.createElement(Button, { variant: "ghost", size: "icon"}
                              , React.createElement(Eye, { className: "h-4 w-4" } )
                            )
                            , (customer.currentCredit || 0) > 0 && (
                              React.createElement(Dialog, {
                                open: 
                                  isPaymentDialogOpen &&
                                  _optionalChain([selectedCustomer, 'optionalAccess', _3 => _3._id]) === customer._id
                                ,
                                onOpenChange: (open) => {
                                  setIsPaymentDialogOpen(open);
                                  if (!open) setSelectedCustomer(null);
                                }}

                                , React.createElement(DialogTrigger, { asChild: true}
                                  , React.createElement(Button, {
                                    variant: "outline",
                                    size: "sm",
                                    onClick: () => setSelectedCustomer(customer)}

                                    , React.createElement(CreditCard, { className: "h-3 w-3 mr-1"  } ), "Receive"

                                  )
                                )
                                , React.createElement(DialogContent, {}
                                  , React.createElement(DialogHeader, {}
                                    , React.createElement(DialogTitle, {}, "Record Payment" )
                                    , React.createElement(DialogDescription, {}, "Record payment from "
                                         , customer.name
                                    )
                                  )

                                  , React.createElement('div', { className: "space-y-4"}
                                    , React.createElement('div', { className: "p-4 bg-muted rounded-lg"  }
                                      , React.createElement('div', { className: "flex justify-between" }
                                        , React.createElement('span', { className: "text-muted-foreground"}, "Current Balance"

                                        )
                                        , React.createElement('span', { className: "font-bold text-orange-600" }, "Rs."
                                          , " "
                                          , (customer.currentCredit || 0).toLocaleString()
                                        )
                                      )
                                    )

                                    , React.createElement('div', { className: "space-y-2"}
                                      , React.createElement(Label, {}, "Payment Amount *"  )
                                      , React.createElement(Input, {
                                        type: "number",
                                        value: paymentAmount,
                                        onChange: (e) =>
                                          setPaymentAmount(
                                            parseFloat(e.target.value) || 0
                                          )
                                        ,
                                        placeholder: "0"}
                                      )
                                      , React.createElement('div', { className: "flex gap-2" }
                                        , React.createElement(Button, {
                                          type: "button",
                                          variant: "outline",
                                          size: "sm",
                                          onClick: () =>
                                            setPaymentAmount(
                                              customer.currentCredit || 0
                                            )
                                          }
, "Full Amount"

                                        )
                                        , React.createElement(Button, {
                                          type: "button",
                                          variant: "outline",
                                          size: "sm",
                                          onClick: () =>
                                            setPaymentAmount(
                                              Math.floor(
                                                (customer.currentCredit || 0) / 2
                                              )
                                            )
                                          }
, "Half"

                                        )
                                      )
                                    )

                                    , React.createElement('div', { className: "space-y-2"}
                                      , React.createElement(Label, {}, "Payment Method" )
                                      , React.createElement(Select, {
                                        value: paymentMethod,
                                        onValueChange: setPaymentMethod}

                                        , React.createElement(SelectTrigger, {}
                                          , React.createElement(SelectValue, {} )
                                        )
                                        , React.createElement(SelectContent, {}
                                          , React.createElement(SelectItem, { value: "cash"}, "Cash"

                                          )
                                          , React.createElement(SelectItem, { value: "bank"}, "Bank Transfer"

                                          )
                                          , React.createElement(SelectItem, { value: "cheque"}, "Cheque"

                                          )
                                          , React.createElement(SelectItem, { value: "qr"}, "QR Payment"

                                          )
                                        )
                                      )
                                    )

                                    , React.createElement('div', { className: "space-y-2"}
                                      , React.createElement(Label, {}, "Note (Optional)" )
                                      , React.createElement(Input, {
                                        value: paymentNote,
                                        onChange: (e) =>
                                          setPaymentNote(e.target.value)
                                        ,
                                        placeholder: "Payment reference or note"   }
                                      )
                                    )

                                    , paymentAmount > 0 && (
                                      React.createElement('div', { className: "p-4 bg-green-500/10 rounded-lg"  }
                                        , React.createElement('div', { className: "flex justify-between" }
                                          , React.createElement('span', { className: "text-muted-foreground"}, "Remaining Balance"

                                          )
                                          , React.createElement('span', { className: "font-bold text-green-600" }, "Rs."
                                            , " "
                                            , Math.max(
                                              0,
                                              (customer.currentCredit || 0) -
                                                paymentAmount
                                            ).toLocaleString()
                                          )
                                        )
                                      )
                                    )
                                  )

                                  , React.createElement(DialogFooter, {}
                                    , React.createElement(Button, {
                                      variant: "outline",
                                      onClick: () =>
                                        setIsPaymentDialogOpen(false)
                                      }
, "Cancel"

                                    )
                                    , React.createElement(Button, { onClick: handleRecordPayment}, "Record Payment"

                                    )
                                  )
                                )
                              )
                            )
                          )
                        )
                      )
                    ))
                  )
                )
              )
              )
            )
          )
        )

        , React.createElement(TabsContent, { value: "transactions", className: "mt-4"}
          , React.createElement(Card, {}
            , React.createElement(CardHeader, {}
              , React.createElement(CardTitle, {}, "Recent Credit Transactions"  )
              , React.createElement(CardDescription, {}, "All credit sales and payment collections"

              )
            )
            , React.createElement(CardContent, {}
              , transactions === undefined ? (
                React.createElement('div', { className: "space-y-3"}
                  , [1, 2, 3, 4, 5].map((i) => (
                    React.createElement(Skeleton, { key: i, className: "h-12 w-full" } )
                  ))
                )
              ) : transactions.length === 0 ? (
                React.createElement('div', { className: "text-center py-8" }
                  , React.createElement(Receipt, { className: "h-8 w-8 mx-auto text-muted-foreground mb-2"    } )
                  , React.createElement('p', { className: "text-muted-foreground"}, "No transactions found"  )
                )
              ) : (
              React.createElement(Table, {}
                , React.createElement(TableHeader, {}
                  , React.createElement(TableRow, {}
                    , React.createElement(TableHead, {}, "Date")
                    , React.createElement(TableHead, {}, "Customer")
                    , React.createElement(TableHead, {}, "Type")
                    , React.createElement(TableHead, {}, "Reference")
                    , React.createElement(TableHead, { className: "text-right"}, "Amount")
                  )
                )
                , React.createElement(TableBody, {}
                  , transactions.map((tx) => (
                    React.createElement(TableRow, { key: tx.id}
                      , React.createElement(TableCell, {}
                        , React.createElement('div', { className: "flex items-center text-sm text-muted-foreground"   }
                          , React.createElement(Calendar, { className: "h-3 w-3 mr-1"  } )
                          , new Date(tx.date).toLocaleDateString()
                        )
                      )
                      , React.createElement(TableCell, { className: "font-medium"}
                        , "customerName" in tx ? String(tx.customerName) : "Unknown"
                      )
                      , React.createElement(TableCell, {}
                        , React.createElement(Badge, { className: "bg-blue-500/10 text-blue-600" }
                          , React.createElement(Receipt, { className: "h-3 w-3 mr-1"  } ), "Credit"

                        )
                      )
                      , React.createElement(TableCell, {}
                        , React.createElement(Badge, { variant: "outline", className: "font-mono text-xs" }
                          , tx.orderNumber
                        )
                      )
                      , React.createElement(TableCell, { className: "text-right"}
                        , React.createElement('span', { className: "text-red-600"}, "+ Rs. "
                            , tx.amount.toLocaleString()
                        )
                      )
                    )
                  ))
                )
              )
              )
            )
          )
        )

        , React.createElement(TabsContent, { value: "aging", className: "mt-4"}
          , React.createElement(Card, {}
            , React.createElement(CardHeader, {}
              , React.createElement(CardTitle, {}, "Aging Report" )
              , React.createElement(CardDescription, {}, "Receivables summary by customer"

              )
            )
            , React.createElement(CardContent, {}
              , isLoading ? (
                React.createElement('div', { className: "space-y-3"}
                  , [1, 2, 3, 4, 5].map((i) => (
                    React.createElement(Skeleton, { key: i, className: "h-12 w-full" } )
                  ))
                )
              ) : (customersWithCredit || []).length === 0 ? (
                React.createElement('div', { className: "text-center py-8" }
                  , React.createElement(User, { className: "h-8 w-8 mx-auto text-muted-foreground mb-2"    } )
                  , React.createElement('p', { className: "text-muted-foreground"}, "No receivables" )
                )
              ) : (
              React.createElement(Table, {}
                , React.createElement(TableHeader, {}
                  , React.createElement(TableRow, {}
                    , React.createElement(TableHead, {}, "Customer")
                    , React.createElement(TableHead, { className: "text-right"}, "Credit Limit" )
                    , React.createElement(TableHead, { className: "text-right"}, "Outstanding")
                    , React.createElement(TableHead, { className: "text-right"}, "Available Credit" )
                    , React.createElement(TableHead, {}, "Status")
                  )
                )
                , React.createElement(TableBody, {}
                  , (customersWithCredit || []).map((customer) => {
                    const outstanding = customer.currentCredit || 0;
                    const limit = customer.creditLimit || 0;
                    const available = Math.max(0, limit - outstanding);
                    return (
                      React.createElement(TableRow, { key: customer._id}
                        , React.createElement(TableCell, { className: "font-medium"}
                          , customer.name
                        )
                        , React.createElement(TableCell, { className: "text-right"}, "Rs. "
                           , limit.toLocaleString()
                        )
                        , React.createElement(TableCell, { className: "text-right font-medium text-orange-600"  }, "Rs. "
                           , outstanding.toLocaleString()
                        )
                        , React.createElement(TableCell, { className: "text-right text-green-600" }, "Rs. "
                           , available.toLocaleString()
                        )
                        , React.createElement(TableCell, {}, getStatusBadge(customer))
                      )
                    );
                  })
                  , React.createElement(TableRow, { className: "bg-muted/50 font-bold" }
                    , React.createElement(TableCell, {}, "Total")
                    , React.createElement(TableCell, { className: "text-right"}, "Rs. "
                       , (customersWithCredit || []).reduce((sum, c) => sum + (c.creditLimit || 0), 0).toLocaleString()
                    )
                    , React.createElement(TableCell, { className: "text-right text-orange-600" }, "Rs. "
                       , totalOutstanding.toLocaleString()
                    )
                    , React.createElement(TableCell, { className: "text-right text-green-600" }, "Rs. "
                       , (customersWithCredit || []).reduce((sum, c) => sum + Math.max(0, (c.creditLimit || 0) - (c.currentCredit || 0)), 0).toLocaleString()
                    )
                    , React.createElement(TableCell, {})
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
