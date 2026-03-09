"use client";
import React from "react";
function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Search,
  Phone,
  User,
  Banknote,
  CreditCard,
  QrCode,
  Loader2,
  History,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";























export default function CreditPaymentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch customers with credit using Convex
  const customersWithCredit = useQuery(api.customers.getWithCredit);
  const recordPayment = useMutation(api.customers.recordCreditPayment);

  // Filter customers based on search
  const filteredCustomers = (_nullishCoalesce(customersWithCredit, () => ( []))).filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const handlePayment = async () => {
    if (!selectedCustomer) {
      toast.error("No customer selected");
      return;
    }

    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (amount > selectedCustomer.currentCredit) {
      toast.error("Payment amount exceeds outstanding balance");
      return;
    }

    setIsLoading(true);
    try {
      await recordPayment({
        customerId: selectedCustomer._id,
        amount: amount,
      });

      toast.success("Payment recorded successfully");
      setShowPaymentDialog(false);
      setPaymentAmount("");
      setSelectedCustomer(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to record payment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPay = (amount) => {
    setPaymentAmount(amount.toString());
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
  };

  // Loading state
  if (customersWithCredit === undefined) {
    return (
      React.createElement('div', { className: "container mx-auto py-6 px-4 max-w-7xl"    }
        , React.createElement('div', { className: "mb-6"}
          , React.createElement('h1', { className: "text-2xl font-bold" }, "Credit Payment" )
          , React.createElement('p', { className: "text-muted-foreground"}, "Collect credit payments from customers"

          )
        )

        , React.createElement('div', { className: "grid lg:grid-cols-3 gap-6"  }
          , React.createElement(Card, { className: "lg:col-span-1"}
            , React.createElement(CardHeader, {}
              , React.createElement(Skeleton, { className: "h-6 w-32" } )
              , React.createElement(Skeleton, { className: "h-4 w-48 mt-2"  } )
            )
            , React.createElement(CardContent, { className: "space-y-4"}
              , React.createElement(Skeleton, { className: "h-10 w-full" } )
              , React.createElement('div', { className: "space-y-2"}
                , [1, 2, 3].map((i) => (
                  React.createElement(Skeleton, { key: i, className: "h-16 w-full" } )
                ))
              )
            )
          )
          , React.createElement(Card, { className: "lg:col-span-2"}
            , React.createElement(CardContent, { className: "flex flex-col items-center justify-center h-[500px]"    }
              , React.createElement(Skeleton, { className: "h-16 w-16 rounded-full mb-4"   } )
              , React.createElement(Skeleton, { className: "h-6 w-40" } )
              , React.createElement(Skeleton, { className: "h-4 w-64 mt-2"  } )
            )
          )
        )
      )
    );
  }

  return (
    React.createElement('div', { className: "container mx-auto py-6 px-4 max-w-7xl"    }
      , React.createElement('div', { className: "mb-6"}
        , React.createElement('h1', { className: "text-2xl font-bold" }, "Credit Payment" )
        , React.createElement('p', { className: "text-muted-foreground"}, "Collect credit payments from customers"

        )
      )

      , React.createElement('div', { className: "grid lg:grid-cols-3 gap-6"  }
        /* Customer Search */
        , React.createElement(Card, { className: "lg:col-span-1"}
          , React.createElement(CardHeader, {}
            , React.createElement(CardTitle, { className: "text-lg"}, "Find Customer" )
            , React.createElement(CardDescription, {}, "Search by name or phone number"

            )
          )
          , React.createElement(CardContent, { className: "space-y-4"}
            , React.createElement('div', { className: "relative"}
              , React.createElement(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"      } )
              , React.createElement(Input, {
                placeholder: "Search customers..." ,
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value),
                className: "pl-9"}
              )
            )

            , React.createElement(ScrollArea, { className: "h-[400px]"}
              , React.createElement('div', { className: "space-y-2"}
                , filteredCustomers.map((customer) => (
                  React.createElement('button', {
                    key: customer._id,
                    onClick: () => handleSelectCustomer(customer ),
                    className: `w-full p-3 rounded-lg text-left transition-colors ${
                      _optionalChain([selectedCustomer, 'optionalAccess', _ => _._id]) === customer._id
                        ? "bg-primary/10 border-primary border"
                        : "bg-muted/50 hover:bg-muted"
                    }`}

                    , React.createElement('div', { className: "flex items-center gap-3"  }
                      , React.createElement('div', { className: "h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center"      }
                        , React.createElement(User, { className: "h-5 w-5 text-primary"  } )
                      )
                      , React.createElement('div', { className: "flex-1"}
                        , React.createElement('p', { className: "font-medium"}, customer.name)
                        , React.createElement('p', { className: "text-sm text-muted-foreground" }
                          , customer.phone
                        )
                      )
                      , React.createElement('div', { className: "text-right"}
                        , React.createElement('p', {
                          className: `font-semibold ${
                            customer.currentCredit > 0
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
, "Rs. "
                           , customer.currentCredit.toLocaleString()
                        )
                        , React.createElement('p', { className: "text-xs text-muted-foreground" }, "Due")
                      )
                    )
                  )
                ))

                , filteredCustomers.length === 0 && (
                  React.createElement('div', { className: "text-center py-8 text-muted-foreground"  }
                    , React.createElement(User, { className: "h-12 w-12 mx-auto mb-4 opacity-50"    } )
                    , React.createElement('p', {}, "No customers with credit found"    )
                  )
                )
              )
            )
          )
        )

        /* Customer Details & Credit History */
        , React.createElement(Card, { className: "lg:col-span-2"}
          , selectedCustomer ? (
            React.createElement(React.Fragment, null
              , React.createElement(CardHeader, {}
                , React.createElement('div', { className: "flex items-center justify-between"  }
                  , React.createElement('div', {}
                    , React.createElement(CardTitle, {}, selectedCustomer.name)
                    , React.createElement(CardDescription, { className: "flex items-center gap-2 mt-1"   }
                      , React.createElement(Phone, { className: "h-4 w-4" } )
                      , selectedCustomer.phone
                    )
                  )
                  , React.createElement(Button, { onClick: () => setShowPaymentDialog(true)}
                    , React.createElement(Banknote, { className: "h-4 w-4 mr-2"  } ), "Record Payment"

                  )
                )
              )
              , React.createElement(CardContent, { className: "space-y-6"}
                /* Credit Summary */
                , React.createElement('div', { className: "grid grid-cols-3 gap-4"  }
                  , React.createElement('div', { className: "p-4 bg-red-500/10 rounded-lg"  }
                    , React.createElement('p', { className: "text-sm text-muted-foreground" }, "Outstanding")
                    , React.createElement('p', { className: "text-2xl font-bold text-red-600"  }, "Rs. "
                       , selectedCustomer.currentCredit.toLocaleString()
                    )
                  )
                  , React.createElement('div', { className: "p-4 bg-muted/50 rounded-lg"  }
                    , React.createElement('p', { className: "text-sm text-muted-foreground" }, "Credit Limit" )
                    , React.createElement('p', { className: "text-2xl font-bold" }, "Rs. "
                       , selectedCustomer.creditLimit.toLocaleString()
                    )
                  )
                  , React.createElement('div', { className: "p-4 bg-green-500/10 rounded-lg"  }
                    , React.createElement('p', { className: "text-sm text-muted-foreground" }, "Available")
                    , React.createElement('p', { className: "text-2xl font-bold text-green-600"  }, "Rs."
                      , " "
                      , (
                        selectedCustomer.creditLimit - selectedCustomer.currentCredit
                      ).toLocaleString()
                    )
                  )
                )

                /* Credit Utilization Bar */
                , React.createElement('div', { className: "space-y-2"}
                  , React.createElement('div', { className: "flex justify-between text-sm"  }
                    , React.createElement('span', {}, "Credit Utilization" )
                    , React.createElement('span', {}
                      , selectedCustomer.creditLimit > 0
                        ? Math.round(
                            (selectedCustomer.currentCredit /
                              selectedCustomer.creditLimit) *
                              100
                          )
                        : 0, "%"

                    )
                  )
                  , React.createElement('div', { className: "h-2 bg-muted rounded-full overflow-hidden"   }
                    , React.createElement('div', {
                      className: `h-full ${
                        selectedCustomer.creditLimit > 0 &&
                        selectedCustomer.currentCredit /
                          selectedCustomer.creditLimit >
                          0.8
                          ? "bg-red-500"
                          : selectedCustomer.creditLimit > 0 &&
                            selectedCustomer.currentCredit /
                              selectedCustomer.creditLimit >
                              0.5
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`,
                      style: {
                        width: `${
                          selectedCustomer.creditLimit > 0
                            ? Math.min(
                                (selectedCustomer.currentCredit /
                                  selectedCustomer.creditLimit) *
                                  100,
                                100
                              )
                            : 0
                        }%`,
                      }}
                    )
                  )
                )

                , React.createElement(Separator, {} )

                /* Credit Orders */
                , React.createElement('div', {}
                  , React.createElement('div', { className: "flex items-center justify-between mb-4"   }
                    , React.createElement('h3', { className: "font-semibold flex items-center gap-2"   }
                      , React.createElement(History, { className: "h-4 w-4" } ), "Pending Credit Orders"

                    )
                  )

                  , React.createElement(Table, {}
                    , React.createElement(TableHeader, {}
                      , React.createElement(TableRow, {}
                        , React.createElement(TableHead, {}, "Order #" )
                        , React.createElement(TableHead, {}, "Date")
                        , React.createElement(TableHead, { className: "text-right"}, "Amount")
                        , React.createElement(TableHead, {}, "Status")
                      )
                    )
                    , React.createElement(TableBody, {}
                      , selectedCustomer.creditOrders.length > 0 ? (
                        selectedCustomer.creditOrders.map((order) => (
                          React.createElement(TableRow, { key: order._id}
                            , React.createElement(TableCell, { className: "font-medium"}
                              , order.orderNumber
                            )
                            , React.createElement(TableCell, {}
                              , new Date(order.createdAt).toLocaleDateString()
                            )
                            , React.createElement(TableCell, { className: "text-right font-medium" }, "Rs. "
                               , order.grandTotal.toLocaleString()
                            )
                            , React.createElement(TableCell, {}
                              , order.paymentStatus === "paid" ? (
                                React.createElement(Badge, { variant: "outline", className: "bg-green-500/10 text-green-600" }
                                  , React.createElement(CheckCircle, { className: "h-3 w-3 mr-1"  } ), "Paid"

                                )
                              ) : order.paymentStatus === "partial" ? (
                                React.createElement(Badge, { variant: "outline", className: "bg-yellow-500/10 text-yellow-600" }, "Partial"

                                )
                              ) : (
                                React.createElement(Badge, { variant: "outline", className: "bg-red-500/10 text-red-600" }
                                  , React.createElement(AlertCircle, { className: "h-3 w-3 mr-1"  } ), "Pending"

                                )
                              )
                            )
                          )
                        ))
                      ) : (
                        React.createElement(TableRow, {}
                          , React.createElement(TableCell, { colSpan: 4, className: "text-center text-muted-foreground py-8"  }, "No pending credit orders"

                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          ) : (
            React.createElement(CardContent, { className: "flex flex-col items-center justify-center h-[500px] text-muted-foreground"     }
              , React.createElement(User, { className: "h-16 w-16 mb-4 opacity-50"   } )
              , React.createElement('p', { className: "text-lg font-medium" }, "Select a Customer"  )
              , React.createElement('p', { className: "text-sm"}, "Search and select a customer to view their credit details"

              )
            )
          )
        )
      )

      /* Payment Dialog */
      , React.createElement(Dialog, { open: showPaymentDialog, onOpenChange: setShowPaymentDialog}
        , React.createElement(DialogContent, { className: "max-w-md"}
          , React.createElement(DialogHeader, {}
            , React.createElement(DialogTitle, {}, "Record Credit Payment"  )
            , React.createElement(DialogDescription, {}
              , _optionalChain([selectedCustomer, 'optionalAccess', _2 => _2.name]), " - Outstanding: Rs."   , " "
              , _optionalChain([selectedCustomer, 'optionalAccess', _3 => _3.currentCredit, 'access', _4 => _4.toLocaleString, 'call', _5 => _5()])
            )
          )
          , React.createElement('div', { className: "space-y-4 py-4" }
            /* Quick Pay Buttons */
            , React.createElement('div', { className: "grid grid-cols-3 gap-2"  }
              , React.createElement(Button, {
                variant: "outline",
                onClick: () => handleQuickPay(1000)}
, "Rs. 1,000"

              )
              , React.createElement(Button, {
                variant: "outline",
                onClick: () => handleQuickPay(2000)}
, "Rs. 2,000"

              )
              , React.createElement(Button, {
                variant: "outline",
                onClick: () => handleQuickPay(5000)}
, "Rs. 5,000"

              )
            )
            , React.createElement(Button, {
              variant: "outline",
              className: "w-full",
              onClick: () =>
                handleQuickPay(_optionalChain([selectedCustomer, 'optionalAccess', _6 => _6.currentCredit]) || 0)
              }
, "Full Amount: Rs."
                , " "
              , _optionalChain([selectedCustomer, 'optionalAccess', _7 => _7.currentCredit, 'access', _8 => _8.toLocaleString, 'call', _9 => _9()])
            )

            , React.createElement(Separator, {} )

            , React.createElement('div', { className: "space-y-2"}
              , React.createElement(Label, {}, "Payment Amount" )
              , React.createElement(Input, {
                type: "number",
                placeholder: "Enter amount" ,
                value: paymentAmount,
                onChange: (e) => setPaymentAmount(e.target.value)}
              )
            )

            , React.createElement('div', { className: "space-y-2"}
              , React.createElement(Label, {}, "Payment Method" )
              , React.createElement('div', { className: "grid grid-cols-3 gap-2"  }
                , React.createElement(Button, {
                  variant: paymentMethod === "cash" ? "default" : "outline",
                  onClick: () => setPaymentMethod("cash"),
                  className: "flex flex-col gap-1 h-auto py-3"    }

                  , React.createElement(Banknote, { className: "h-5 w-5" } )
                  , React.createElement('span', { className: "text-xs"}, "Cash")
                )
                , React.createElement(Button, {
                  variant: paymentMethod === "card" ? "default" : "outline",
                  onClick: () => setPaymentMethod("card"),
                  className: "flex flex-col gap-1 h-auto py-3"    }

                  , React.createElement(CreditCard, { className: "h-5 w-5" } )
                  , React.createElement('span', { className: "text-xs"}, "Card")
                )
                , React.createElement(Button, {
                  variant: paymentMethod === "qr" ? "default" : "outline",
                  onClick: () => setPaymentMethod("qr"),
                  className: "flex flex-col gap-1 h-auto py-3"    }

                  , React.createElement(QrCode, { className: "h-5 w-5" } )
                  , React.createElement('span', { className: "text-xs"}, "QR")
                )
              )
            )

            , paymentAmount && (
              React.createElement('div', { className: "p-3 bg-muted/50 rounded-lg"  }
                , React.createElement('div', { className: "flex justify-between text-sm"  }
                  , React.createElement('span', {}, "Current Outstanding" )
                  , React.createElement('span', {}, "Rs. " , _optionalChain([selectedCustomer, 'optionalAccess', _10 => _10.currentCredit, 'access', _11 => _11.toLocaleString, 'call', _12 => _12()]))
                )
                , React.createElement('div', { className: "flex justify-between text-sm text-green-600"   }
                  , React.createElement('span', {}, "Payment")
                  , React.createElement('span', {}, "- Rs. "  , parseFloat(paymentAmount || "0").toLocaleString())
                )
                , React.createElement(Separator, { className: "my-2"} )
                , React.createElement('div', { className: "flex justify-between font-medium"  }
                  , React.createElement('span', {}, "New Balance" )
                  , React.createElement('span', {}, "Rs."
                    , " "
                    , Math.max(
                      (_optionalChain([selectedCustomer, 'optionalAccess', _13 => _13.currentCredit]) || 0) -
                        parseFloat(paymentAmount || "0"),
                      0
                    ).toLocaleString()
                  )
                )
              )
            )
          )
          , React.createElement(DialogFooter, {}
            , React.createElement(Button, { variant: "outline", onClick: () => setShowPaymentDialog(false)}, "Cancel"

            )
            , React.createElement(Button, { onClick: handlePayment, disabled: isLoading}
              , isLoading && React.createElement(Loader2, { className: "h-4 w-4 mr-2 animate-spin"   } ), "Record Payment"

            )
          )
        )
      )
    )
  );
}
