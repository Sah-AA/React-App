"use client";
import React from "react";
function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

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
import { Switch } from "@/components/ui/switch";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  Percent,
  Ticket,
  Calendar,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { DeleteDialog } from "@/components/ui/delete-dialog";

















export default function DiscountsPage() {
  const discounts = useQuery(api.discounts.getAll);
  const createDiscount = useMutation(api.discounts.create);
  const updateDiscount = useMutation(api.discounts.update);
  const deleteDiscount = useMutation(api.discounts.remove);

  const [showDialog, setShowDialog] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "percentage" ,
    value: "",
    minOrderAmount: "",
    maxDiscountAmount: "",
    validFrom: "",
    validTo: "",
    usageLimit: "",
    applicableTo: "all" ,
    isActive: true,
  });

  const handleOpenDialog = (discount) => {
    if (discount) {
      setEditingDiscount(discount);
      setFormData({
        name: discount.name,
        code: discount.code || "",
        type: discount.type,
        value: discount.value.toString(),
        minOrderAmount: _optionalChain([discount, 'access', _ => _.minOrderAmount, 'optionalAccess', _2 => _2.toString, 'call', _3 => _3()]) || "",
        maxDiscountAmount: _optionalChain([discount, 'access', _4 => _4.maxDiscountAmount, 'optionalAccess', _5 => _5.toString, 'call', _6 => _6()]) || "",
        validFrom: new Date(discount.validFrom).toISOString().split("T")[0],
        validTo: new Date(discount.validTo).toISOString().split("T")[0],
        usageLimit: _optionalChain([discount, 'access', _7 => _7.usageLimit, 'optionalAccess', _8 => _8.toString, 'call', _9 => _9()]) || "",
        applicableTo: discount.applicableTo,
        isActive: discount.isActive,
      });
    } else {
      setEditingDiscount(null);
      setFormData({
        name: "",
        code: "",
        type: "percentage",
        value: "",
        minOrderAmount: "",
        maxDiscountAmount: "",
        validFrom: "",
        validTo: "",
        usageLimit: "",
        applicableTo: "all",
        isActive: true,
      });
    }
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.value || !formData.validFrom || !formData.validTo) {
      toast.error("Please fill in all required fields (name, value, valid from, valid to)");
      return;
    }

    setIsLoading(true);
    try {
      const data = {
        name: formData.name,
        code: formData.code || undefined,
        type: formData.type,
        value: parseFloat(formData.value),
        minOrderAmount: formData.minOrderAmount
          ? parseFloat(formData.minOrderAmount)
          : undefined,
        maxDiscountAmount: formData.maxDiscountAmount
          ? parseFloat(formData.maxDiscountAmount)
          : undefined,
        validFrom: new Date(formData.validFrom).getTime(),
        validTo: new Date(formData.validTo).getTime(),
        usageLimit: formData.usageLimit
          ? parseInt(formData.usageLimit)
          : undefined,
        applicableTo: formData.applicableTo,
        isActive: formData.isActive,
      };

      if (editingDiscount) {
        await updateDiscount({
          id: editingDiscount._id ,
          ...data,
        });
        toast.success("Discount updated successfully");
      } else {
        await createDiscount(data);
        toast.success("Discount created successfully");
      }
      setShowDialog(false);
    } catch (error) {
      toast.error(
        editingDiscount ? "Failed to update discount" : "Failed to create discount"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDiscountToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!discountToDelete) return;
    try {
      await deleteDiscount({ id: discountToDelete  });
      toast.success("Discount deleted successfully");
      setDiscountToDelete(null);
    } catch (error) {
      toast.error("Failed to delete discount");
    }
  };

  const handleToggleActive = async (discount) => {
    try {
      await updateDiscount({
        id: discount._id ,
        isActive: !discount.isActive,
      });
      toast.success(`Discount ${discount.isActive ? "deactivated" : "activated"}`);
    } catch (error) {
      toast.error("Failed to update discount status");
    }
  };

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData({ ...formData, code });
  };

  // Filter discounts
  const filteredDiscounts = _optionalChain([discounts, 'optionalAccess', _10 => _10.filter, 'call', _11 => _11((d) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return d.isActive;
    if (activeTab === "coupon") return d.code;
    return true;
  })]);

  const isExpired = (discount) => {
    if (!discount.validTo) return false;
    return discount.validTo < Date.now();
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    React.createElement('div', { className: "space-y-6"}
      , React.createElement('div', { className: "flex items-center justify-between"  }
        , React.createElement('div', {}
          , React.createElement('h1', { className: "text-2xl font-bold" }, "Discounts & Coupons"  )
          , React.createElement('p', { className: "text-muted-foreground"}, "Manage discounts and coupon codes for your orders"

          )
        )
        , React.createElement(Button, { onClick: () => handleOpenDialog()}
          , React.createElement(Plus, { className: "h-4 w-4 mr-2"  } ), "Add Discount"

        )
      )

      /* Stats */
      , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-4 gap-4"   }
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground flex items-center gap-2"     }
              , React.createElement(Tag, { className: "h-4 w-4" } ), "Total Discounts"

            )
          )
          , React.createElement(CardContent, {}
            , React.createElement('p', { className: "text-2xl font-bold" }, _optionalChain([discounts, 'optionalAccess', _12 => _12.length]) || 0)
          )
        )
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground flex items-center gap-2"     }
              , React.createElement(Ticket, { className: "h-4 w-4" } ), "Coupon Codes"

            )
          )
          , React.createElement(CardContent, {}
            , React.createElement('p', { className: "text-2xl font-bold" }
              , _optionalChain([discounts, 'optionalAccess', _13 => _13.filter, 'call', _14 => _14((d) => d.code), 'access', _15 => _15.length]) || 0
            )
          )
        )
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-green-600 flex items-center gap-2"     }, "Active"

            )
          )
          , React.createElement(CardContent, {}
            , React.createElement('p', { className: "text-2xl font-bold text-green-600"  }
              , _optionalChain([discounts, 'optionalAccess', _16 => _16.filter, 'call', _17 => _17((d) => d.isActive), 'access', _18 => _18.length]) || 0
            )
          )
        )
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground"  }, "Total Used"

            )
          )
          , React.createElement(CardContent, {}
            , React.createElement('p', { className: "text-2xl font-bold" }
              , _optionalChain([discounts, 'optionalAccess', _19 => _19.reduce, 'call', _20 => _20((sum, d) => sum + d.usedCount, 0)]) || 0
            )
          )
        )
      )

      , React.createElement(Tabs, { value: activeTab, onValueChange: setActiveTab}
        , React.createElement(TabsList, {}
          , React.createElement(TabsTrigger, { value: "all"}, "All")
          , React.createElement(TabsTrigger, { value: "active"}, "Active")
          , React.createElement(TabsTrigger, { value: "coupon"}, "Coupon Codes" )
        )

        , React.createElement(TabsContent, { value: activeTab, className: "mt-4"}
          , React.createElement(Card, {}
            , React.createElement(CardHeader, {}
              , React.createElement(CardTitle, {}, "Discounts")
              , React.createElement(CardDescription, {}
                , _optionalChain([filteredDiscounts, 'optionalAccess', _21 => _21.length]) || 0, " discounts found"
              )
            )
            , React.createElement(CardContent, {}
              , discounts === undefined ? (
                React.createElement('div', { className: "flex items-center justify-center py-8"   }
                  , React.createElement(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground"   } )
                )
              ) : _optionalChain([filteredDiscounts, 'optionalAccess', _22 => _22.length]) === 0 ? (
                React.createElement('div', { className: "text-center py-8 text-muted-foreground"  }
                  , React.createElement(Percent, { className: "h-12 w-12 mx-auto mb-4 opacity-50"    } )
                  , React.createElement('p', {}, "No discounts found"  )
                  , React.createElement('p', { className: "text-sm"}, "Click \"Add Discount\" to create your first discount"

                  )
                )
              ) : (
                React.createElement(Table, {}
                  , React.createElement(TableHeader, {}
                    , React.createElement(TableRow, {}
                      , React.createElement(TableHead, {}, "Name")
                      , React.createElement(TableHead, {}, "Code")
                      , React.createElement(TableHead, {}, "Discount")
                      , React.createElement(TableHead, {}, "Validity")
                      , React.createElement(TableHead, {}, "Usage")
                      , React.createElement(TableHead, {}, "Status")
                      , React.createElement(TableHead, { className: "w-[70px]"})
                    )
                  )
                  , React.createElement(TableBody, {}
                    , _optionalChain([filteredDiscounts, 'optionalAccess', _23 => _23.map, 'call', _24 => _24((discount) => (
                      React.createElement(TableRow, { key: discount._id}
                        , React.createElement(TableCell, { className: "font-medium"}, discount.name)
                        , React.createElement(TableCell, {}
                          , discount.code ? (
                            React.createElement('code', { className: "px-2 py-1 bg-muted rounded text-sm"    }
                              , discount.code
                            )
                          ) : (
                            React.createElement('span', { className: "text-muted-foreground"}, "-")
                          )
                        )
                        , React.createElement(TableCell, {}
                          , React.createElement('div', { className: "flex items-center gap-1"  }
                            , discount.type === "percentage" ? (
                              React.createElement(React.Fragment, null
                                , React.createElement(Percent, { className: "h-4 w-4 text-muted-foreground"  } )
                                , discount.value, "%"
                              )
                            ) : (
                              React.createElement(React.Fragment, null, "Rs. " , discount.value)
                            )
                          )
                          , discount.maxDiscountAmount && (
                            React.createElement('p', { className: "text-xs text-muted-foreground" }, "Max: Rs. "
                                , discount.maxDiscountAmount
                            )
                          )
                        )
                        , React.createElement(TableCell, {}
                          , React.createElement('div', { className: "text-sm"}
                            , React.createElement('div', { className: "flex items-center gap-1"  }
                              , React.createElement(Calendar, { className: "h-3 w-3 text-muted-foreground"  } )
                              , formatDate(discount.validFrom), " - "  , formatDate(discount.validTo)
                            )
                          )
                        )
                        , React.createElement(TableCell, {}
                          , React.createElement('div', { className: "text-sm"}
                            , discount.usedCount
                            , discount.usageLimit && ` / ${discount.usageLimit}`
                          )
                        )
                        , React.createElement(TableCell, {}
                          , React.createElement('div', { className: "flex items-center gap-2"  }
                            , isExpired(discount) && (
                              React.createElement(Badge, { variant: "outline", className: "bg-red-500/10 text-red-600" }, "Expired"

                              )
                            )
                            , React.createElement(Badge, {
                              variant: discount.isActive ? "default" : "secondary",
                              className: 
                                discount.isActive
                                  ? "bg-green-500/10 text-green-600"
                                  : ""
                              }

                              , discount.isActive ? "Active" : "Inactive"
                            )
                          )
                        )
                        , React.createElement(TableCell, {}
                          , React.createElement(DropdownMenu, {}
                            , React.createElement(DropdownMenuTrigger, { asChild: true}
                              , React.createElement(Button, { variant: "ghost", size: "icon"}
                                , React.createElement(MoreHorizontal, { className: "h-4 w-4" } )
                              )
                            )
                            , React.createElement(DropdownMenuContent, { align: "end"}
                              , React.createElement(DropdownMenuItem, {
                                onClick: () => handleOpenDialog(discount)}

                                , React.createElement(Pencil, { className: "h-4 w-4 mr-2"  } ), "Edit"

                              )
                              , React.createElement(DropdownMenuItem, {
                                onClick: () => handleToggleActive(discount)}

                                , discount.isActive ? "Deactivate" : "Activate"
                              )
                              , React.createElement(DropdownMenuItem, {
                                className: "text-destructive",
                                onClick: () => handleDelete(discount._id)}

                                , React.createElement(Trash2, { className: "h-4 w-4 mr-2"  } ), "Delete"

                              )
                            )
                          )
                        )
                      )
                    ))])
                  )
                )
              )
            )
          )
        )
      )

      /* Add/Edit Dialog */
      , React.createElement(Dialog, { open: showDialog, onOpenChange: setShowDialog}
        , React.createElement(DialogContent, { className: "max-w-lg"}
          , React.createElement(DialogHeader, {}
            , React.createElement(DialogTitle, {}
              , editingDiscount ? "Edit Discount" : "Add New Discount"
            )
            , React.createElement(DialogDescription, {}
              , editingDiscount
                ? "Update discount details"
                : "Create a new discount or coupon code"
            )
          )
          , React.createElement('div', { className: "space-y-4 py-4 max-h-[60vh] overflow-y-auto"   }
            , React.createElement('div', { className: "space-y-2"}
              , React.createElement(Label, { htmlFor: "name"}, "Name *" )
              , React.createElement(Input, {
                id: "name",
                placeholder: "e.g., Summer Sale, New Year Offer"     ,
                value: formData.name,
                onChange: (e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              )
            )

            , React.createElement('div', { className: "space-y-2"}
              , React.createElement(Label, { htmlFor: "code"}, "Coupon Code (optional)"  )
              , React.createElement('div', { className: "flex gap-2" }
                , React.createElement(Input, {
                  id: "code",
                  placeholder: "e.g., SUMMER20" ,
                  value: formData.code,
                  onChange: (e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                )
                , React.createElement(Button, { type: "button", variant: "outline", onClick: generateCode}, "Generate"

                )
              )
              , React.createElement('p', { className: "text-xs text-muted-foreground" }, "Leave empty for automatic discounts"

              )
            )

            , React.createElement('div', { className: "grid grid-cols-2 gap-4"  }
              , React.createElement('div', { className: "space-y-2"}
                , React.createElement(Label, { htmlFor: "type"}, "Discount Type" )
                , React.createElement(Select, {
                  value: formData.type,
                  onValueChange: (value) =>
                    setFormData({ ...formData, type: value })
                  }

                  , React.createElement(SelectTrigger, {}
                    , React.createElement(SelectValue, {} )
                  )
                  , React.createElement(SelectContent, {}
                    , React.createElement(SelectItem, { value: "percentage"}, "Percentage (%)" )
                    , React.createElement(SelectItem, { value: "flat"}, "Fixed Amount (Rs.)"  )
                  )
                )
              )
              , React.createElement('div', { className: "space-y-2"}
                , React.createElement(Label, { htmlFor: "value"}, "Value * "
                    , formData.type === "percentage" ? "(%)" : "(Rs.)"
                )
                , React.createElement(Input, {
                  id: "value",
                  type: "number",
                  placeholder: "0",
                  value: formData.value,
                  onChange: (e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                )
              )
            )

            , React.createElement('div', { className: "grid grid-cols-2 gap-4"  }
              , React.createElement('div', { className: "space-y-2"}
                , React.createElement(Label, { htmlFor: "minOrderAmount"}, "Min Order Amount"  )
                , React.createElement(Input, {
                  id: "minOrderAmount",
                  type: "number",
                  placeholder: "0",
                  value: formData.minOrderAmount,
                  onChange: (e) =>
                    setFormData({ ...formData, minOrderAmount: e.target.value })
                  }
                )
              )
              , React.createElement('div', { className: "space-y-2"}
                , React.createElement(Label, { htmlFor: "maxDiscountAmount"}, "Max Discount" )
                , React.createElement(Input, {
                  id: "maxDiscountAmount",
                  type: "number",
                  placeholder: "No limit" ,
                  value: formData.maxDiscountAmount,
                  onChange: (e) =>
                    setFormData({ ...formData, maxDiscountAmount: e.target.value })
                  }
                )
              )
            )

            , React.createElement('div', { className: "grid grid-cols-2 gap-4"  }
              , React.createElement('div', { className: "space-y-2"}
                , React.createElement(Label, { htmlFor: "validFrom"}, "Valid From *"  )
                , React.createElement(Input, {
                  id: "validFrom",
                  type: "date",
                  value: formData.validFrom,
                  onChange: (e) =>
                    setFormData({ ...formData, validFrom: e.target.value })
                  }
                )
              )
              , React.createElement('div', { className: "space-y-2"}
                , React.createElement(Label, { htmlFor: "validTo"}, "Valid To *"  )
                , React.createElement(Input, {
                  id: "validTo",
                  type: "date",
                  value: formData.validTo,
                  onChange: (e) =>
                    setFormData({ ...formData, validTo: e.target.value })
                  }
                )
              )
            )

            , React.createElement('div', { className: "space-y-2"}
              , React.createElement(Label, { htmlFor: "applicableTo"}, "Applicable To *"  )
              , React.createElement(Select, {
                value: formData.applicableTo,
                onValueChange: (value) =>
                  setFormData({ ...formData, applicableTo: value })
                }

                , React.createElement(SelectTrigger, {}
                  , React.createElement(SelectValue, {} )
                )
                , React.createElement(SelectContent, {}
                  , React.createElement(SelectItem, { value: "all"}, "All Orders" )
                  , React.createElement(SelectItem, { value: "dine_in"}, "Dine-in Only" )
                  , React.createElement(SelectItem, { value: "takeaway"}, "Takeaway Only" )
                  , React.createElement(SelectItem, { value: "delivery"}, "Delivery Only" )
                )
              )
            )

            , React.createElement('div', { className: "space-y-2"}
              , React.createElement(Label, { htmlFor: "usageLimit"}, "Usage Limit" )
              , React.createElement(Input, {
                id: "usageLimit",
                type: "number",
                placeholder: "Unlimited",
                value: formData.usageLimit,
                onChange: (e) =>
                  setFormData({ ...formData, usageLimit: e.target.value })
                }
              )
            )

            , React.createElement('div', { className: "flex items-center justify-between py-2"   }
              , React.createElement('div', {}
                , React.createElement(Label, { htmlFor: "isActive"}, "Active")
                , React.createElement('p', { className: "text-sm text-muted-foreground" }, "Enable this discount"

                )
              )
              , React.createElement(Switch, {
                id: "isActive",
                checked: formData.isActive,
                onCheckedChange: (checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              )
            )
          )
          , React.createElement(DialogFooter, {}
            , React.createElement(Button, { variant: "outline", onClick: () => setShowDialog(false)}, "Cancel"

            )
            , React.createElement(Button, { onClick: handleSubmit, disabled: isLoading}
              , isLoading && React.createElement(Loader2, { className: "h-4 w-4 mr-2 animate-spin"   } )
              , editingDiscount ? "Update" : "Create"
            )
          )
        )
      )

      , React.createElement(DeleteDialog, {
        open: deleteDialogOpen,
        onOpenChange: setDeleteDialogOpen,
        title: "Delete Discount" ,
        description: "Are you sure you want to delete this discount? This action cannot be undone."             ,
        onConfirm: confirmDelete}
      )
    )
  );
}
