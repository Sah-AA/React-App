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
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Scale,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { DeleteDialog } from "@/components/ui/delete-dialog";










export default function UnitsPage() {
  const units = useQuery(api.units.getAll);
  const createUnit = useMutation(api.units.create);
  const updateUnit = useMutation(api.units.update);
  const deleteUnit = useMutation(api.units.remove);

  const [showDialog, setShowDialog] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    baseUnit: "",
    conversionFactor: "1",
  });

  const handleOpenDialog = (unit) => {
    if (unit) {
      setEditingUnit(unit);
      setFormData({
        name: unit.name,
        symbol: unit.symbol,
        baseUnit: unit.baseUnit || "",
        conversionFactor: unit.conversionFactor.toString(),
      });
    } else {
      setEditingUnit(null);
      setFormData({
        name: "",
        symbol: "",
        baseUnit: "",
        conversionFactor: "1",
      });
    }
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.symbol) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const baseUnitValue = formData.baseUnit && formData.baseUnit !== "none" 
        ? formData.baseUnit  
        : undefined;
        
      if (editingUnit) {
        await updateUnit({
          id: editingUnit._id,
          name: formData.name,
          symbol: formData.symbol,
          baseUnit: baseUnitValue,
          conversionFactor: parseFloat(formData.conversionFactor) || 1,
        });
        toast.success("Unit updated successfully");
      } else {
        await createUnit({
          name: formData.name,
          symbol: formData.symbol,
          baseUnit: baseUnitValue,
          conversionFactor: parseFloat(formData.conversionFactor) || 1,
          isActive: true,
        });
        toast.success("Unit created successfully");
      }
      setShowDialog(false);
    } catch (error) {
      toast.error(editingUnit ? "Failed to update unit" : "Failed to create unit");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setUnitToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!unitToDelete) return;
    try {
      await deleteUnit({ id: unitToDelete });
      toast.success("Unit deleted successfully");
      setUnitToDelete(null);
    } catch (error) {
      toast.error("Failed to delete unit");
    }
  };

  const handleToggleActive = async (unit) => {
    try {
      await updateUnit({
        id: unit._id,
        isActive: !unit.isActive,
      });
      toast.success(`Unit ${unit.isActive ? "deactivated" : "activated"}`);
    } catch (error) {
      toast.error("Failed to update unit status");
    }
  };

  return (
    React.createElement('div', { className: "space-y-6"}
      , React.createElement('div', { className: "flex items-center justify-between"  }
        , React.createElement('div', {}
          , React.createElement('h1', { className: "text-2xl font-bold" }, "Units of Measurement"  )
          , React.createElement('p', { className: "text-muted-foreground"}, "Manage units for ingredients and stock management"

          )
        )
        , React.createElement(Button, { onClick: () => handleOpenDialog()}
          , React.createElement(Plus, { className: "h-4 w-4 mr-2"  } ), "Add Unit"

        )
      )

      , React.createElement(Card, {}
        , React.createElement(CardHeader, {}
          , React.createElement(CardTitle, {}, "All Units" )
          , React.createElement(CardDescription, {}, "Define base units and their conversions for inventory management"

          )
        )
        , React.createElement(CardContent, {}
          , units === undefined ? (
            React.createElement('div', { className: "flex items-center justify-center py-8"   }
              , React.createElement(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground"   } )
            )
          ) : units.length === 0 ? (
            React.createElement('div', { className: "text-center py-8 text-muted-foreground"  }
              , React.createElement(Scale, { className: "h-12 w-12 mx-auto mb-4 opacity-50"    } )
              , React.createElement('p', {}, "No units created yet"   )
              , React.createElement('p', { className: "text-sm"}, "Click \"Add Unit\" to create your first unit"       )
            )
          ) : (
            React.createElement(Table, {}
              , React.createElement(TableHeader, {}
                , React.createElement(TableRow, {}
                  , React.createElement(TableHead, {}, "Name")
                  , React.createElement(TableHead, {}, "Symbol")
                  , React.createElement(TableHead, {}, "Base Unit" )
                  , React.createElement(TableHead, {}, "Conversion")
                  , React.createElement(TableHead, {}, "Status")
                  , React.createElement(TableHead, { className: "w-[70px]"})
                )
              )
              , React.createElement(TableBody, {}
                , units.map((unit) => (
                  React.createElement(TableRow, { key: unit._id}
                    , React.createElement(TableCell, { className: "font-medium"}, unit.name)
                    , React.createElement(TableCell, {}
                      , React.createElement(Badge, { variant: "secondary"}, unit.symbol)
                    )
                    , React.createElement(TableCell, {}
                      , unit.baseUnit ? (
                        React.createElement('span', {}, _optionalChain([units, 'optionalAccess', _ => _.find, 'call', _2 => _2(u => u._id === unit.baseUnit), 'optionalAccess', _3 => _3.symbol]) || unit.baseUnit)
                      ) : (
                        React.createElement('span', { className: "text-muted-foreground"}, "Base unit" )
                      )
                    )
                    , React.createElement(TableCell, {}
                      , unit.baseUnit ? (
                        React.createElement('span', {}, "1 "
                           , unit.symbol, " = "  , unit.conversionFactor, " " , _optionalChain([units, 'optionalAccess', _4 => _4.find, 'call', _5 => _5(u => u._id === unit.baseUnit), 'optionalAccess', _6 => _6.symbol]) || ""
                        )
                      ) : (
                        React.createElement('span', { className: "text-muted-foreground"}, "-")
                      )
                    )
                    , React.createElement(TableCell, {}
                      , React.createElement(Badge, {
                        variant: unit.isActive ? "default" : "secondary",
                        className: 
                          unit.isActive
                            ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                            : ""
                        }

                        , unit.isActive ? "Active" : "Inactive"
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
                          , React.createElement(DropdownMenuItem, { onClick: () => handleOpenDialog(unit)}
                            , React.createElement(Pencil, { className: "h-4 w-4 mr-2"  } ), "Edit"

                          )
                          , React.createElement(DropdownMenuItem, {
                            onClick: () => handleToggleActive(unit)}

                            , unit.isActive ? "Deactivate" : "Activate"
                          )
                          , React.createElement(DropdownMenuItem, {
                            className: "text-destructive",
                            onClick: () => handleDelete(unit._id)}

                            , React.createElement(Trash2, { className: "h-4 w-4 mr-2"  } ), "Delete"

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

      /* Add/Edit Dialog */
      , React.createElement(Dialog, { open: showDialog, onOpenChange: setShowDialog}
        , React.createElement(DialogContent, {}
          , React.createElement(DialogHeader, {}
            , React.createElement(DialogTitle, {}
              , editingUnit ? "Edit Unit" : "Add New Unit"
            )
            , React.createElement(DialogDescription, {}
              , editingUnit
                ? "Update the unit details"
                : "Create a new unit of measurement"
            )
          )
          , React.createElement('div', { className: "space-y-4 py-4" }
            , React.createElement('div', { className: "grid grid-cols-2 gap-4"  }
              , React.createElement('div', { className: "space-y-2"}
                , React.createElement(Label, { htmlFor: "name"}, "Name *" )
                , React.createElement(Input, {
                  id: "name",
                  placeholder: "e.g., Kilogram" ,
                  value: formData.name,
                  onChange: (e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                )
              )
              , React.createElement('div', { className: "space-y-2"}
                , React.createElement(Label, { htmlFor: "symbol"}, "Symbol *" )
                , React.createElement(Input, {
                  id: "symbol",
                  placeholder: "e.g., kg" ,
                  value: formData.symbol,
                  onChange: (e) =>
                    setFormData({ ...formData, symbol: e.target.value })
                  }
                )
              )
            )
            , React.createElement('div', { className: "space-y-2"}
              , React.createElement(Label, { htmlFor: "baseUnit"}, "Base Unit (for conversion)"   )
              , React.createElement(Select, {
                value: formData.baseUnit,
                onValueChange: (value) =>
                  setFormData({ ...formData, baseUnit: value })
                }

                , React.createElement(SelectTrigger, {}
                  , React.createElement(SelectValue, { placeholder: "Select base unit (optional)"   } )
                )
                , React.createElement(SelectContent, {}
                  , React.createElement(SelectItem, { value: "none"}, "None (this is a base unit)"     )
                  , _optionalChain([units, 'optionalAccess', _7 => _7.filter, 'call', _8 => _8(u => u._id !== _optionalChain([editingUnit, 'optionalAccess', _9 => _9._id])), 'access', _10 => _10.map, 'call', _11 => _11((unit) => (
                    React.createElement(SelectItem, { key: unit._id, value: unit._id}
                      , unit.name, " (" , unit.symbol, ")"
                    )
                  ))])
                )
              )
              , React.createElement('p', { className: "text-xs text-muted-foreground" }, "Leave empty if this unit is a base unit (like kg, pcs)"

              )
            )
            , formData.baseUnit && formData.baseUnit !== "none" && (
              React.createElement('div', { className: "space-y-2"}
                , React.createElement(Label, { htmlFor: "conversionFactor"}, "Conversion Factor" )
                , React.createElement('div', { className: "flex items-center gap-2"  }
                  , React.createElement('span', { className: "text-sm text-muted-foreground" }, "1 " , formData.symbol || "unit", " =" )
                  , React.createElement(Input, {
                    id: "conversionFactor",
                    type: "number",
                    step: "0.001",
                    className: "w-24",
                    value: formData.conversionFactor,
                    onChange: (e) =>
                      setFormData({ ...formData, conversionFactor: e.target.value })
                    }
                  )
                  , React.createElement('span', { className: "text-sm text-muted-foreground" }, _optionalChain([units, 'optionalAccess', _12 => _12.find, 'call', _13 => _13(u => u._id === formData.baseUnit), 'optionalAccess', _14 => _14.symbol]) || "")
                )
                , React.createElement('p', { className: "text-xs text-muted-foreground" }, "Example: 1 dozen = 12 pcs, 1 kg = 1000 g"

                )
              )
            )
          )
          , React.createElement(DialogFooter, {}
            , React.createElement(Button, { variant: "outline", onClick: () => setShowDialog(false)}, "Cancel"

            )
            , React.createElement(Button, { onClick: handleSubmit, disabled: isLoading}
              , isLoading && React.createElement(Loader2, { className: "h-4 w-4 mr-2 animate-spin"   } )
              , editingUnit ? "Update" : "Create"
            )
          )
        )
      )

      , React.createElement(DeleteDialog, {
        open: deleteDialogOpen,
        onOpenChange: setDeleteDialogOpen,
        title: "Delete Unit" ,
        description: "Are you sure you want to delete this unit? This action cannot be undone."             ,
        onConfirm: confirmDelete}
      )
    )
  );
}
