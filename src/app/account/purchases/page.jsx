"use client";
import React from "react";
function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";

import {
  Card,
  CardContent,

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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Search,
  Trash2,

  FileText,
  Calendar,
  CheckCircle,
  Clock,
  X,
  Package,
  Ban,
} from "lucide-react";
import { toast } from "sonner";
































export default function PurchasesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convex queries
  const purchases = useQuery(api.purchases.list, {
    status: statusFilter !== "all" ? statusFilter  : undefined,
  });
  const suppliers = useQuery(api.suppliers.getActive);
  const ingredients = useQuery(api.ingredients.getActive);
  const units = useQuery(api.units.getActive);

  // Convex mutations
  const createPurchase = useMutation(api.purchases.create);
  const receivePurchase = useMutation(api.purchases.receive);
  const cancelPurchase = useMutation(api.purchases.cancel);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!purchases) return { totalAmount: 0, receivedCount: 0, draftCount: 0, purchaseCount: 0 };
    
    const totalAmount = purchases.reduce((sum, p) => sum + p.netAmount, 0);
    const receivedCount = purchases.filter(p => p.status === "received").length;
    const draftCount = purchases.filter(p => p.status === "draft").length;
    
    return {
      totalAmount,
      receivedCount,
      draftCount,
      purchaseCount: purchases.length,
    };
  }, [purchases]);

  const handleAddItem = () => {
    setPurchaseItems([
      ...purchaseItems,
      {
        ingredientId: "",
        ingredientName: "",
        quantity: 0,
        unitId: "",
        unitName: "",
        unitPrice: 0,
        totalPrice: 0,
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index,
    field,
    value
  ) => {
    const updatedItems = [...purchaseItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Calculate total price when quantity or unit price changes
    if (field === "quantity" || field === "unitPrice") {
      updatedItems[index].totalPrice =
        updatedItems[index].quantity * updatedItems[index].unitPrice;
    }

    // Update ingredient name when ingredient is selected
    if (field === "ingredientId" && ingredients) {
      const ingredient = ingredients.find((i) => i._id === value);
      if (ingredient) {
        updatedItems[index].ingredientName = ingredient.name;
      }
    }

    // Update unit name when unit is selected
    if (field === "unitId" && units) {
      const unit = units.find((u) => u._id === value);
      if (unit) {
        updatedItems[index].unitName = unit.name;
      }
    }

    setPurchaseItems(updatedItems);
  };

  const calculateTotal = () => {
    return purchaseItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleSubmit = async () => {
    if (!selectedSupplier) {
      toast.error("Please select a supplier");
      return;
    }
    if (!invoiceNumber) {
      toast.error("Please enter invoice number");
      return;
    }
    if (purchaseItems.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    // Validate all items have required fields
    for (const item of purchaseItems) {
      if (!item.ingredientId || !item.unitId || item.quantity <= 0 || item.unitPrice <= 0) {
        toast.error("Please fill in all item details (ingredient, quantity, unit, and price)");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await createPurchase({
        supplierId: selectedSupplier ,
        invoiceNo: invoiceNumber,
        purchaseDate: new Date(purchaseDate).getTime(),
        items: purchaseItems.map((item) => ({
          ingredientId: item.ingredientId ,
          quantity: item.quantity,
          unitId: item.unitId ,
          unitPrice: item.unitPrice,
        })),
      });
      toast.success("Purchase recorded successfully");
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create purchase");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReceive = async (purchaseId) => {
    try {
      await receivePurchase({ id: purchaseId });
      toast.success("Purchase received and stock updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to receive purchase");
    }
  };

  const handleCancel = async (purchaseId) => {
    try {
      await cancelPurchase({ id: purchaseId });
      toast.success("Purchase cancelled");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel purchase");
    }
  };

  const resetForm = () => {
    setSelectedSupplier(null);
    setInvoiceNumber("");
    setPurchaseDate(new Date().toISOString().split("T")[0]);
    setPurchaseItems([]);
    setPaidAmount(0);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "received":
        return (
          React.createElement(Badge, { className: "bg-green-500/10 text-green-600" }
            , React.createElement(CheckCircle, { className: "h-3 w-3 mr-1"  } ), "Received"

          )
        );
      case "draft":
        return (
          React.createElement(Badge, { className: "bg-orange-500/10 text-orange-600" }
            , React.createElement(Clock, { className: "h-3 w-3 mr-1"  } ), "Draft"

          )
        );
      case "cancelled":
        return (
          React.createElement(Badge, { className: "bg-red-500/10 text-red-600" }
            , React.createElement(X, { className: "h-3 w-3 mr-1"  } ), "Cancelled"

          )
        );
      default:
        return React.createElement(Badge, { variant: "outline"}, status);
    }
  };

  // Filter purchases based on search query
  const filteredPurchases = useMemo(() => {
    if (!purchases) return [];
    return purchases.filter(
      (purchase) =>
        purchase.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        purchase.supplierName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [purchases, searchQuery]);

  const isLoading = purchases === undefined || suppliers === undefined || ingredients === undefined || units === undefined;

  return (
    React.createElement('div', { className: "space-y-6"}
      , React.createElement('div', { className: "flex items-center justify-between"  }
        , React.createElement('div', {}
          , React.createElement('h1', { className: "text-2xl font-bold" }, "Purchases")
          , React.createElement('p', { className: "text-muted-foreground"}, "Manage supplier purchases and inventory entries"

          )
        )
        , React.createElement(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen}
          , React.createElement(DialogTrigger, { asChild: true}
            , React.createElement(Button, {}
              , React.createElement(Plus, { className: "h-4 w-4 mr-2"  } ), "New Purchase"

            )
          )
          , React.createElement(DialogContent, { className: "min-w-4xl max-h-[90vh]" }
            , React.createElement(DialogHeader, {}
              , React.createElement(DialogTitle, {}, "Record New Purchase"  )
              , React.createElement(DialogDescription, {}, "Enter purchase details and items from supplier"

              )
            )

            , React.createElement(ScrollArea, { className: "max-h-[60vh] pr-4" }
              , React.createElement('div', { className: "space-y-6"}
                /* Purchase Header */
                , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-4"   }
                  , React.createElement('div', { className: "space-y-2"}
                    , React.createElement(Label, {}, "Supplier *" )
                    , React.createElement(Select, {
                      value: selectedSupplier || "",
                      onValueChange: setSelectedSupplier}

                      , React.createElement(SelectTrigger, {}
                        , React.createElement(SelectValue, { placeholder: "Select supplier" } )
                      )
                      , React.createElement(SelectContent, {}
                        , _optionalChain([suppliers, 'optionalAccess', _2 => _2.map, 'call', _3 => _3((supplier) => (
                          React.createElement(SelectItem, { key: supplier._id, value: supplier._id}
                            , supplier.name
                          )
                        ))])
                      )
                    )
                  )
                  , React.createElement('div', { className: "space-y-2"}
                    , React.createElement(Label, {}, "Invoice Number *"  )
                    , React.createElement(Input, {
                      value: invoiceNumber,
                      onChange: (e) => setInvoiceNumber(e.target.value),
                      placeholder: "e.g., INV-2025-001" }
                    )
                  )
                  , React.createElement('div', { className: "space-y-2"}
                    , React.createElement(Label, {}, "Purchase Date *"  )
                    , React.createElement(Input, {
                      type: "date",
                      value: purchaseDate,
                      onChange: (e) => setPurchaseDate(e.target.value)}
                    )
                  )
                )

                /* Purchase Items */
                , React.createElement('div', { className: "space-y-4"}
                  , React.createElement('div', { className: "flex items-center justify-between"  }
                    , React.createElement(Label, {}, "Items")
                    , React.createElement(Button, {
                      type: "button",
                      variant: "outline",
                      size: "sm",
                      onClick: handleAddItem}

                      , React.createElement(Plus, { className: "h-4 w-4 mr-1"  } ), "Add Item"

                    )
                  )

                  , purchaseItems.length === 0 ? (
                    React.createElement('div', { className: "text-center py-8 text-muted-foreground border rounded-lg border-dashed"     }, "No items added. Click \"Add Item\" to start."

                    )
                  ) : (
                    React.createElement('div', { className: "border rounded-lg" }
                      , React.createElement(Table, {}
                        , React.createElement(TableHeader, {}
                          , React.createElement(TableRow, {}
                            , React.createElement(TableHead, {}, "Ingredient")
                            , React.createElement(TableHead, {}, "Quantity")
                            , React.createElement(TableHead, {}, "Unit")
                            , React.createElement(TableHead, {}, "Unit Price" )
                            , React.createElement(TableHead, {}, "Total")
                            , React.createElement(TableHead, {})
                          )
                        )
                        , React.createElement(TableBody, {}
                          , purchaseItems.map((item, index) => (
                            React.createElement(TableRow, { key: index}
                              , React.createElement(TableCell, {}
                                , React.createElement(Select, {
                                  value: item.ingredientId,
                                  onValueChange: (value) =>
                                    handleItemChange(index, "ingredientId", value)
                                  }

                                  , React.createElement(SelectTrigger, { className: "w-[180px]"}
                                    , React.createElement(SelectValue, { placeholder: "Select"} )
                                  )
                                  , React.createElement(SelectContent, {}
                                    , _optionalChain([ingredients, 'optionalAccess', _4 => _4.map, 'call', _5 => _5((ing) => (
                                      React.createElement(SelectItem, { key: ing._id, value: ing._id}
                                        , ing.name
                                      )
                                    ))])
                                  )
                                )
                              )
                              , React.createElement(TableCell, {}
                                , React.createElement(Input, {
                                  type: "number",
                                  value: item.quantity,
                                  onChange: (e) =>
                                    handleItemChange(
                                      index,
                                      "quantity",
                                      parseFloat(e.target.value) || 0
                                    )
                                  ,
                                  className: "w-24"}
                                )
                              )
                              , React.createElement(TableCell, {}
                                , React.createElement(Select, {
                                  value: item.unitId,
                                  onValueChange: (value) =>
                                    handleItemChange(index, "unitId", value)
                                  }

                                  , React.createElement(SelectTrigger, { className: "w-[120px]"}
                                    , React.createElement(SelectValue, { placeholder: "Unit"} )
                                  )
                                  , React.createElement(SelectContent, {}
                                    , _optionalChain([units, 'optionalAccess', _6 => _6.map, 'call', _7 => _7((unit) => (
                                      React.createElement(SelectItem, { key: unit._id, value: unit._id}
                                        , unit.symbol
                                      )
                                    ))])
                                  )
                                )
                              )
                              , React.createElement(TableCell, {}
                                , React.createElement(Input, {
                                  type: "number",
                                  value: item.unitPrice,
                                  onChange: (e) =>
                                    handleItemChange(
                                      index,
                                      "unitPrice",
                                      parseFloat(e.target.value) || 0
                                    )
                                  ,
                                  className: "w-28"}
                                )
                              )
                              , React.createElement(TableCell, { className: "font-medium"}, "Rs. "
                                 , item.totalPrice.toLocaleString()
                              )
                              , React.createElement(TableCell, {}
                                , React.createElement(Button, {
                                  type: "button",
                                  variant: "ghost",
                                  size: "icon",
                                  onClick: () => handleRemoveItem(index)}

                                  , React.createElement(Trash2, { className: "h-4 w-4 text-red-600"  } )
                                )
                              )
                            )
                          ))
                        )
                      )
                    )
                  )
                )

                /* Payment Section */
                , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t"     }
                  , React.createElement('div', { className: "space-y-2"}
                    , React.createElement(Label, {}, "Amount Paid" )
                    , React.createElement(Input, {
                      type: "number",
                      value: paidAmount,
                      onChange: (e) =>
                        setPaidAmount(parseFloat(e.target.value) || 0)
                      ,
                      placeholder: "0"}
                    )
                    , React.createElement('p', { className: "text-sm text-muted-foreground" }, "Due: Rs. "
                        , (calculateTotal() - paidAmount).toLocaleString()
                    )
                  )
                  , React.createElement('div', { className: "flex items-end justify-end"  }
                    , React.createElement('div', { className: "text-right"}
                      , React.createElement('p', { className: "text-sm text-muted-foreground" }, "Total Amount" )
                      , React.createElement('p', { className: "text-2xl font-bold" }, "Rs. "
                         , calculateTotal().toLocaleString()
                      )
                    )
                  )
                )
              )
            )

            , React.createElement(DialogFooter, {}
              , React.createElement(Button, { variant: "outline", onClick: () => setIsDialogOpen(false), disabled: isSubmitting}, "Cancel"

              )
              , React.createElement(Button, { onClick: handleSubmit, disabled: isSubmitting}
                , isSubmitting ? "Recording..." : "Record Purchase"
              )
            )
          )
        )
      )

      /* Summary Cards */
      , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-4 gap-4"   }
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground"  }, "Total Purchases"

            )
          )
          , React.createElement(CardContent, {}
            , isLoading ? (
              React.createElement(Skeleton, { className: "h-8 w-24" } )
            ) : (
              React.createElement(React.Fragment, null
                , React.createElement('p', { className: "text-2xl font-bold" }, "Rs. " , summaryStats.totalAmount.toLocaleString())
                , React.createElement('p', { className: "text-sm text-muted-foreground" }, "All time" )
              )
            )
          )
        )
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground"  }, "Received"

            )
          )
          , React.createElement(CardContent, {}
            , isLoading ? (
              React.createElement(Skeleton, { className: "h-8 w-16" } )
            ) : (
              React.createElement(React.Fragment, null
                , React.createElement('p', { className: "text-2xl font-bold text-green-600"  }, summaryStats.receivedCount)
                , React.createElement('p', { className: "text-sm text-muted-foreground" }, "Completed")
              )
            )
          )
        )
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground"  }, "Draft"

            )
          )
          , React.createElement(CardContent, {}
            , isLoading ? (
              React.createElement(Skeleton, { className: "h-8 w-16" } )
            ) : (
              React.createElement(React.Fragment, null
                , React.createElement('p', { className: "text-2xl font-bold text-orange-600"  }, summaryStats.draftCount)
                , React.createElement('p', { className: "text-sm text-muted-foreground" }, "Pending receipt" )
              )
            )
          )
        )
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground"  }, "Purchase Count"

            )
          )
          , React.createElement(CardContent, {}
            , isLoading ? (
              React.createElement(Skeleton, { className: "h-8 w-16" } )
            ) : (
              React.createElement(React.Fragment, null
                , React.createElement('p', { className: "text-2xl font-bold" }, summaryStats.purchaseCount)
                , React.createElement('p', { className: "text-sm text-muted-foreground" }, "Transactions")
              )
            )
          )
        )
      )

      /* Purchases List */
      , React.createElement(Card, {}
        , React.createElement(CardHeader, {}
          , React.createElement('div', { className: "flex items-center justify-between flex-wrap gap-4"    }
            , React.createElement(CardTitle, {}, "Purchase History" )
            , React.createElement('div', { className: "flex items-center gap-4"  }
              , React.createElement(Select, { value: statusFilter, onValueChange: setStatusFilter}
                , React.createElement(SelectTrigger, { className: "w-[150px]"}
                  , React.createElement(SelectValue, { placeholder: "Filter by status"  } )
                )
                , React.createElement(SelectContent, {}
                  , React.createElement(SelectItem, { value: "all"}, "All Status" )
                  , React.createElement(SelectItem, { value: "draft"}, "Draft")
                  , React.createElement(SelectItem, { value: "received"}, "Received")
                  , React.createElement(SelectItem, { value: "cancelled"}, "Cancelled")
                )
              )
              , React.createElement('div', { className: "relative w-72" }
                , React.createElement(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"       } )
                , React.createElement(Input, {
                  placeholder: "Search by invoice or supplier..."    ,
                  value: searchQuery,
                  onChange: (e) => setSearchQuery(e.target.value),
                  className: "pl-9"}
                )
              )
            )
          )
        )
        , React.createElement(CardContent, {}
          , isLoading ? (
            React.createElement('div', { className: "space-y-4"}
              , [...Array(5)].map((_, i) => (
                React.createElement('div', { key: i, className: "flex items-center space-x-4"  }
                  , React.createElement(Skeleton, { className: "h-12 w-full" } )
                )
              ))
            )
          ) : (
            React.createElement(Table, {}
              , React.createElement(TableHeader, {}
                , React.createElement(TableRow, {}
                  , React.createElement(TableHead, {}, "Invoice #" )
                  , React.createElement(TableHead, {}, "Supplier")
                  , React.createElement(TableHead, {}, "Date")
                  , React.createElement(TableHead, { className: "text-right"}, "Net Amount" )
                  , React.createElement(TableHead, {}, "Status")
                  , React.createElement(TableHead, { className: "text-right"}, "Actions")
                )
              )
              , React.createElement(TableBody, {}
                , filteredPurchases.length === 0 ? (
                  React.createElement(TableRow, {}
                    , React.createElement(TableCell, { colSpan: 6, className: "text-center py-8" }
                      , React.createElement(FileText, { className: "h-8 w-8 mx-auto text-muted-foreground mb-2"    } )
                      , React.createElement('p', { className: "text-muted-foreground"}, "No purchases found"  )
                    )
                  )
                ) : (
                  filteredPurchases.map((purchase) => (
                    React.createElement(TableRow, { key: purchase._id}
                      , React.createElement(TableCell, { className: "font-medium"}
                        , purchase.invoiceNo
                      )
                      , React.createElement(TableCell, {}, purchase.supplierName)
                      , React.createElement(TableCell, {}
                        , React.createElement('div', { className: "flex items-center text-muted-foreground"  }
                          , React.createElement(Calendar, { className: "h-3 w-3 mr-1"  } )
                          , new Date(purchase.purchaseDate).toLocaleDateString()
                        )
                      )
                      , React.createElement(TableCell, { className: "text-right font-medium" }, "Rs. "
                         , purchase.netAmount.toLocaleString()
                      )
                      , React.createElement(TableCell, {}, getStatusBadge(purchase.status))
                      , React.createElement(TableCell, { className: "text-right"}
                        , React.createElement('div', { className: "flex items-center justify-end gap-2"   }
                          , purchase.status === "draft" && (
                            React.createElement(React.Fragment, null
                              , React.createElement(Button, {
                                variant: "outline",
                                size: "sm",
                                onClick: () => handleReceive(purchase._id)}

                                , React.createElement(Package, { className: "h-4 w-4 mr-1"  } ), "Receive"

                              )
                              , React.createElement(Button, {
                                variant: "ghost",
                                size: "sm",
                                className: "text-red-600 hover:text-red-700" ,
                                onClick: () => handleCancel(purchase._id)}

                                , React.createElement(Ban, { className: "h-4 w-4 mr-1"  } ), "Cancel"

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
  );
}
