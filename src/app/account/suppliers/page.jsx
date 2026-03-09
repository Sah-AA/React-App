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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  Truck,
  Phone,
  Mail,
  Search,
  MapPin,

} from "lucide-react";
import { toast } from "sonner";
import { DeleteDialog } from "@/components/ui/delete-dialog";












export default function SuppliersPage() {
  const suppliers = useQuery(api.suppliers.getAll);
  const createSupplier = useMutation(api.suppliers.create);
  const updateSupplier = useMutation(api.suppliers.update);
  const deleteSupplier = useMutation(api.suppliers.remove);

  const [showDialog, setShowDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    panNumber: "",
  });

  const handleOpenDialog = (supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name,
        contactPerson: supplier.contactPerson || "",
        email: supplier.email || "",
        phone: supplier.phone,
        address: supplier.address || "",
        panNumber: supplier.panNumber || "",
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        panNumber: "",
      });
    }
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      if (editingSupplier) {
        await updateSupplier({
          id: editingSupplier._id ,
          name: formData.name,
          contactPerson: formData.contactPerson || undefined,
          email: formData.email || undefined,
          phone: formData.phone,
          address: formData.address || undefined,
          panNumber: formData.panNumber || undefined,
        });
        toast.success("Supplier updated successfully");
      } else {
        await createSupplier({
          name: formData.name,
          contactPerson: formData.contactPerson || undefined,
          email: formData.email || undefined,
          phone: formData.phone,
          address: formData.address || undefined,
          panNumber: formData.panNumber || undefined,
          isActive: true,
        });
        toast.success("Supplier created successfully");
      }
      setShowDialog(false);
    } catch (error) {
      toast.error(
        editingSupplier ? "Failed to update supplier" : "Failed to create supplier"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setSupplierToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!supplierToDelete) return;
    try {
      await deleteSupplier({ id: supplierToDelete  });
      toast.success("Supplier deleted successfully");
      setSupplierToDelete(null);
    } catch (error) {
      toast.error("Failed to delete supplier");
    }
  };

  const handleToggleActive = async (supplier) => {
    try {
      await updateSupplier({
        id: supplier._id ,
        isActive: !supplier.isActive,
      });
      toast.success(`Supplier ${supplier.isActive ? "deactivated" : "activated"}`);
    } catch (error) {
      toast.error("Failed to update supplier status");
    }
  };

  // Filter suppliers
  const filteredSuppliers = _optionalChain([suppliers, 'optionalAccess', _ => _.filter, 'call', _2 => _2((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phone.includes(searchQuery) ||
    _optionalChain([s, 'access', _3 => _3.contactPerson, 'optionalAccess', _4 => _4.toLowerCase, 'call', _5 => _5(), 'access', _6 => _6.includes, 'call', _7 => _7(searchQuery.toLowerCase())])
  )]);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    React.createElement('div', { className: "space-y-6"}
      , React.createElement('div', { className: "flex items-center justify-between"  }
        , React.createElement('div', {}
          , React.createElement('h1', { className: "text-2xl font-bold" }, "Suppliers")
          , React.createElement('p', { className: "text-muted-foreground"}, "Manage your ingredient and supply vendors"

          )
        )
        , React.createElement(Button, { onClick: () => handleOpenDialog()}
          , React.createElement(Plus, { className: "h-4 w-4 mr-2"  } ), "Add Supplier"

        )
      )

      /* Stats */
      , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-4"   }
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground flex items-center gap-2"     }
              , React.createElement(Truck, { className: "h-4 w-4" } ), "Total Suppliers"

            )
          )
          , React.createElement(CardContent, {}
            , React.createElement('p', { className: "text-2xl font-bold" }, _optionalChain([suppliers, 'optionalAccess', _8 => _8.length]) || 0)
          )
        )
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-green-600 flex items-center gap-2"     }, "Active Suppliers"

            )
          )
          , React.createElement(CardContent, {}
            , React.createElement('p', { className: "text-2xl font-bold text-green-600"  }
              , _optionalChain([suppliers, 'optionalAccess', _9 => _9.filter, 'call', _10 => _10((s) => s.isActive), 'access', _11 => _11.length]) || 0
            )
          )
        )
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground"  }, "With PAN"

            )
          )
          , React.createElement(CardContent, {}
            , React.createElement('p', { className: "text-2xl font-bold" }
              , _optionalChain([suppliers, 'optionalAccess', _12 => _12.filter, 'call', _13 => _13((s) => s.panNumber), 'access', _14 => _14.length]) || 0
            )
          )
        )
      )

      /* Search */
      , React.createElement(Card, {}
        , React.createElement(CardContent, { className: "pt-6"}
          , React.createElement('div', { className: "relative"}
            , React.createElement(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"      } )
            , React.createElement(Input, {
              placeholder: "Search suppliers by name, phone or contact person..."       ,
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              className: "pl-9"}
            )
          )
        )
      )

      /* Suppliers Table */
      , React.createElement(Card, {}
        , React.createElement(CardHeader, {}
          , React.createElement(CardTitle, {}, "All Suppliers" )
          , React.createElement(CardDescription, {}
            , _optionalChain([filteredSuppliers, 'optionalAccess', _15 => _15.length]) || 0, " suppliers found"
          )
        )
        , React.createElement(CardContent, {}
          , suppliers === undefined ? (
            React.createElement('div', { className: "flex items-center justify-center py-8"   }
              , React.createElement(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground"   } )
            )
          ) : _optionalChain([filteredSuppliers, 'optionalAccess', _16 => _16.length]) === 0 ? (
            React.createElement('div', { className: "text-center py-8 text-muted-foreground"  }
              , React.createElement(Truck, { className: "h-12 w-12 mx-auto mb-4 opacity-50"    } )
              , React.createElement('p', {}, "No suppliers found"  )
              , React.createElement('p', { className: "text-sm"}, "Click \"Add Supplier\" to add your first vendor"       )
            )
          ) : (
            React.createElement(Table, {}
              , React.createElement(TableHeader, {}
                , React.createElement(TableRow, {}
                  , React.createElement(TableHead, {}, "Supplier")
                  , React.createElement(TableHead, {}, "Contact")
                  , React.createElement(TableHead, {}, "Address")
                  , React.createElement(TableHead, {}, "PAN")
                  , React.createElement(TableHead, {}, "Status")
                  , React.createElement(TableHead, { className: "w-[70px]"})
                )
              )
              , React.createElement(TableBody, {}
                , _optionalChain([filteredSuppliers, 'optionalAccess', _17 => _17.map, 'call', _18 => _18((supplier) => (
                  React.createElement(TableRow, { key: supplier._id}
                    , React.createElement(TableCell, {}
                      , React.createElement('div', { className: "flex items-center gap-3"  }
                        , React.createElement(Avatar, {}
                          , React.createElement(AvatarFallback, { className: "bg-primary/10 text-primary" }
                            , getInitials(supplier.name)
                          )
                        )
                        , React.createElement('div', {}
                          , React.createElement('p', { className: "font-medium"}, supplier.name)
                          , supplier.contactPerson && (
                            React.createElement('p', { className: "text-sm text-muted-foreground" }
                              , supplier.contactPerson
                            )
                          )
                        )
                      )
                    )
                    , React.createElement(TableCell, {}
                      , React.createElement('div', { className: "space-y-1"}
                        , React.createElement('div', { className: "flex items-center gap-1 text-sm"   }
                          , React.createElement(Phone, { className: "h-3 w-3 text-muted-foreground"  } )
                          , supplier.phone
                        )
                        , supplier.email && (
                          React.createElement('div', { className: "flex items-center gap-1 text-sm text-muted-foreground"    }
                            , React.createElement(Mail, { className: "h-3 w-3" } )
                            , supplier.email
                          )
                        )
                      )
                    )
                    , React.createElement(TableCell, {}
                      , supplier.address ? (
                        React.createElement('div', { className: "flex items-start gap-1 text-sm text-muted-foreground max-w-[200px]"     }
                          , React.createElement(MapPin, { className: "h-3 w-3 mt-0.5 shrink-0"   } )
                          , React.createElement('span', { className: "line-clamp-2"}, supplier.address)
                        )
                      ) : (
                        React.createElement('span', { className: "text-muted-foreground"}, "-")
                      )
                    )
                    , React.createElement(TableCell, {}
                      , supplier.panNumber ? (
                        React.createElement('code', { className: "text-sm bg-muted px-2 py-1 rounded"    }
                          , supplier.panNumber
                        )
                      ) : (
                        React.createElement('span', { className: "text-muted-foreground"}, "-")
                      )
                    )
                    , React.createElement(TableCell, {}
                      , React.createElement(Badge, {
                        variant: supplier.isActive ? "default" : "secondary",
                        className: 
                          supplier.isActive
                            ? "bg-green-500/10 text-green-600"
                            : ""
                        }

                        , supplier.isActive ? "Active" : "Inactive"
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
                          , React.createElement(DropdownMenuItem, { onClick: () => handleOpenDialog(supplier)}
                            , React.createElement(Pencil, { className: "h-4 w-4 mr-2"  } ), "Edit"

                          )
                          , React.createElement(DropdownMenuItem, {
                            onClick: () => handleToggleActive(supplier)}

                            , supplier.isActive ? "Deactivate" : "Activate"
                          )
                          , React.createElement(DropdownMenuItem, {
                            className: "text-destructive",
                            onClick: () => handleDelete(supplier._id)}

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

      /* Add/Edit Dialog */
      , React.createElement(Dialog, { open: showDialog, onOpenChange: setShowDialog}
        , React.createElement(DialogContent, {}
          , React.createElement(DialogHeader, {}
            , React.createElement(DialogTitle, {}
              , editingSupplier ? "Edit Supplier" : "Add New Supplier"
            )
            , React.createElement(DialogDescription, {}
              , editingSupplier
                ? "Update supplier details"
                : "Add a new supplier to your list"
            )
          )
          , React.createElement('div', { className: "space-y-4 py-4" }
            , React.createElement('div', { className: "space-y-2"}
              , React.createElement(Label, { htmlFor: "name"}, "Company/Supplier Name *"  )
              , React.createElement(Input, {
                id: "name",
                placeholder: "e.g., ABC Suppliers Pvt. Ltd."    ,
                value: formData.name,
                onChange: (e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              )
            )

            , React.createElement('div', { className: "grid grid-cols-2 gap-4"  }
              , React.createElement('div', { className: "space-y-2"}
                , React.createElement(Label, { htmlFor: "contactPerson"}, "Contact Person" )
                , React.createElement(Input, {
                  id: "contactPerson",
                  placeholder: "e.g., Ram Kumar"  ,
                  value: formData.contactPerson,
                  onChange: (e) =>
                    setFormData({ ...formData, contactPerson: e.target.value })
                  }
                )
              )
              , React.createElement('div', { className: "space-y-2"}
                , React.createElement(Label, { htmlFor: "phone"}, "Phone Number *"  )
                , React.createElement(Input, {
                  id: "phone",
                  placeholder: "e.g., 9841234567" ,
                  value: formData.phone,
                  onChange: (e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                )
              )
            )

            , React.createElement('div', { className: "grid grid-cols-2 gap-4"  }
              , React.createElement('div', { className: "space-y-2"}
                , React.createElement(Label, { htmlFor: "email"}, "Email")
                , React.createElement(Input, {
                  id: "email",
                  type: "email",
                  placeholder: "email@example.com",
                  value: formData.email,
                  onChange: (e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                )
              )
              , React.createElement('div', { className: "space-y-2"}
                , React.createElement(Label, { htmlFor: "panNumber"}, "PAN Number" )
                , React.createElement(Input, {
                  id: "panNumber",
                  placeholder: "e.g., 123456789" ,
                  value: formData.panNumber,
                  onChange: (e) =>
                    setFormData({ ...formData, panNumber: e.target.value })
                  }
                )
              )
            )

            , React.createElement('div', { className: "space-y-2"}
              , React.createElement(Label, { htmlFor: "address"}, "Address")
              , React.createElement(Input, {
                id: "address",
                placeholder: "Full address" ,
                value: formData.address,
                onChange: (e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              )
            )
          )
          , React.createElement(DialogFooter, {}
            , React.createElement(Button, { variant: "outline", onClick: () => setShowDialog(false)}, "Cancel"

            )
            , React.createElement(Button, { onClick: handleSubmit, disabled: isLoading}
              , isLoading && React.createElement(Loader2, { className: "h-4 w-4 mr-2 animate-spin"   } )
              , editingSupplier ? "Update" : "Add Supplier"
            )
          )
        )
      )

      , React.createElement(DeleteDialog, {
        open: deleteDialogOpen,
        onOpenChange: setDeleteDialogOpen,
        title: "Delete Supplier" ,
        description: "Are you sure you want to delete this supplier? This action cannot be undone."             ,
        onConfirm: confirmDelete}
      )
    )
  );
}
