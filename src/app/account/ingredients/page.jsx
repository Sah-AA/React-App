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
  Package,
  Loader2,
  Search,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { DeleteDialog } from "@/components/ui/delete-dialog";












export default function IngredientsPage() {
  const ingredients = useQuery(api.ingredients.getAll);
  const units = useQuery(api.units.getActive);
  const createIngredient = useMutation(api.ingredients.create);
  const updateIngredient = useMutation(api.ingredients.update);
  const deleteIngredient = useMutation(api.ingredients.remove);

  const [showDialog, setShowDialog] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    unitId: "",
    currentStock: "0",
    reorderLevel: "0",
    costPerUnit: "0",
  });

  const handleOpenDialog = (ingredient) => {
    if (ingredient) {
      setEditingIngredient(ingredient);
      setFormData({
        name: ingredient.name,
        unitId: ingredient.unitId,
        currentStock: ingredient.currentStock.toString(),
        reorderLevel: ingredient.reorderLevel.toString(),
        costPerUnit: ingredient.costPerUnit.toString(),
      });
    } else {
      setEditingIngredient(null);
      setFormData({
        name: "",
        unitId: "",
        currentStock: "0",
        reorderLevel: "0",
        costPerUnit: "0",
      });
    }
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.unitId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      if (editingIngredient) {
        await updateIngredient({
          id: editingIngredient._id,
          name: formData.name,
          unitId: formData.unitId ,
          currentStock: parseFloat(formData.currentStock) || 0,
          reorderLevel: parseFloat(formData.reorderLevel) || 0,
          costPerUnit: parseFloat(formData.costPerUnit) || 0,
        });
        toast.success("Ingredient updated successfully");
      } else {
        await createIngredient({
          name: formData.name,
          unitId: formData.unitId ,
          currentStock: parseFloat(formData.currentStock) || 0,
          reorderLevel: parseFloat(formData.reorderLevel) || 0,
          costPerUnit: parseFloat(formData.costPerUnit) || 0,
          isActive: true,
        });
        toast.success("Ingredient created successfully");
      }
      setShowDialog(false);
    } catch (error) {
      toast.error(
        editingIngredient ? "Failed to update ingredient" : "Failed to create ingredient"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setIngredientToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!ingredientToDelete) return;
    try {
      await deleteIngredient({ id: ingredientToDelete });
      toast.success("Ingredient deleted successfully");
      setIngredientToDelete(null);
    } catch (error) {
      toast.error("Failed to delete ingredient");
    }
  };

  const handleToggleActive = async (ingredient) => {
    try {
      await updateIngredient({
        id: ingredient._id,
        isActive: !ingredient.isActive,
      });
      toast.success(`Ingredient ${ingredient.isActive ? "deactivated" : "activated"}`);
    } catch (error) {
      toast.error("Failed to update ingredient status");
    }
  };

  // Filter ingredients
  const filteredIngredients = _optionalChain([ingredients, 'optionalAccess', _ => _.filter, 'call', _2 => _2((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  )]);

  // Low stock count
  const lowStockCount = _optionalChain([ingredients, 'optionalAccess', _3 => _3.filter, 'call', _4 => _4(
    (i) => i.currentStock <= i.reorderLevel && i.isActive
  ), 'access', _5 => _5.length]);

  return (
    React.createElement('div', { className: "space-y-6"}
      , React.createElement('div', { className: "flex items-center justify-between"  }
        , React.createElement('div', {}
          , React.createElement('h1', { className: "text-2xl font-bold" }, "Ingredients")
          , React.createElement('p', { className: "text-muted-foreground"}, "Manage ingredients for menu items and stock tracking"

          )
        )
        , React.createElement(Button, { onClick: () => handleOpenDialog()}
          , React.createElement(Plus, { className: "h-4 w-4 mr-2"  } ), "Add Ingredient"

        )
      )

      /* Stats Cards */
      , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-4"   }
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground"  }, "Total Ingredients"

            )
          )
          , React.createElement(CardContent, {}
            , React.createElement('p', { className: "text-2xl font-bold" }, _optionalChain([ingredients, 'optionalAccess', _6 => _6.length]) || 0)
          )
        )
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground"  }, "Active Ingredients"

            )
          )
          , React.createElement(CardContent, {}
            , React.createElement('p', { className: "text-2xl font-bold" }
              , _optionalChain([ingredients, 'optionalAccess', _7 => _7.filter, 'call', _8 => _8((i) => i.isActive), 'access', _9 => _9.length]) || 0
            )
          )
        )
        , React.createElement(Card, { className: lowStockCount && lowStockCount > 0 ? "border-orange-500" : ""}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground flex items-center gap-2"     }
              , lowStockCount && lowStockCount > 0 && (
                React.createElement(AlertTriangle, { className: "h-4 w-4 text-orange-500"  } )
              ), "Low Stock Items"

            )
          )
          , React.createElement(CardContent, {}
            , React.createElement('p', { className: `text-2xl font-bold ${lowStockCount && lowStockCount > 0 ? "text-orange-500" : ""}`}
              , lowStockCount || 0
            )
          )
        )
      )

      , React.createElement(Card, {}
        , React.createElement(CardHeader, {}
          , React.createElement('div', { className: "flex items-center justify-between"  }
            , React.createElement('div', {}
              , React.createElement(CardTitle, {}, "All Ingredients" )
              , React.createElement(CardDescription, {}, "Manage your ingredient inventory and stock levels"

              )
            )
            , React.createElement('div', { className: "relative w-64" }
              , React.createElement(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"      } )
              , React.createElement(Input, {
                placeholder: "Search ingredients..." ,
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value),
                className: "pl-9"}
              )
            )
          )
        )
        , React.createElement(CardContent, {}
          , ingredients === undefined ? (
            React.createElement('div', { className: "flex items-center justify-center py-8"   }
              , React.createElement(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground"   } )
            )
          ) : _optionalChain([filteredIngredients, 'optionalAccess', _10 => _10.length]) === 0 ? (
            React.createElement('div', { className: "text-center py-8 text-muted-foreground"  }
              , React.createElement(Package, { className: "h-12 w-12 mx-auto mb-4 opacity-50"    } )
              , React.createElement('p', {}, "No ingredients found"  )
              , React.createElement('p', { className: "text-sm"}, "Click \"Add Ingredient\" to add your first ingredient"       )
            )
          ) : (
            React.createElement(Table, {}
              , React.createElement(TableHeader, {}
                , React.createElement(TableRow, {}
                  , React.createElement(TableHead, {}, "Name")
                  , React.createElement(TableHead, {}, "Unit")
                  , React.createElement(TableHead, { className: "text-right"}, "Current Stock" )
                  , React.createElement(TableHead, { className: "text-right"}, "Reorder Level" )
                  , React.createElement(TableHead, { className: "text-right"}, "Cost/Unit")
                  , React.createElement(TableHead, {}, "Status")
                  , React.createElement(TableHead, { className: "w-[70px]"})
                )
              )
              , React.createElement(TableBody, {}
                , _optionalChain([filteredIngredients, 'optionalAccess', _11 => _11.map, 'call', _12 => _12((ingredient) => (
                  React.createElement(TableRow, { key: ingredient._id}
                    , React.createElement(TableCell, { className: "font-medium"}, ingredient.name)
                    , React.createElement(TableCell, {}
                      , React.createElement(Badge, { variant: "secondary"}, _optionalChain([ingredient, 'access', _13 => _13.unit, 'optionalAccess', _14 => _14.symbol]) || "-")
                    )
                    , React.createElement(TableCell, { className: "text-right"}
                      , React.createElement('span', {
                        className: 
                          ingredient.currentStock <= ingredient.reorderLevel
                            ? "text-orange-500 font-medium"
                            : ""
                        }

                        , ingredient.currentStock
                      )
                    )
                    , React.createElement(TableCell, { className: "text-right"}, ingredient.reorderLevel)
                    , React.createElement(TableCell, { className: "text-right"}, "Rs. "
                       , ingredient.costPerUnit.toFixed(2)
                    )
                    , React.createElement(TableCell, {}
                      , React.createElement('div', { className: "flex items-center gap-2"  }
                        , ingredient.currentStock <= ingredient.reorderLevel && ingredient.isActive && (
                          React.createElement(Badge, { variant: "outline", className: "bg-orange-500/10 text-orange-600" }
                            , React.createElement(AlertTriangle, { className: "h-3 w-3 mr-1"  } ), "Low"

                          )
                        )
                        , React.createElement(Badge, {
                          variant: ingredient.isActive ? "default" : "secondary",
                          className: 
                            ingredient.isActive
                              ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                              : ""
                          }

                          , ingredient.isActive ? "Active" : "Inactive"
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
                          , React.createElement(DropdownMenuItem, { onClick: () => handleOpenDialog(ingredient)}
                            , React.createElement(Pencil, { className: "h-4 w-4 mr-2"  } ), "Edit"

                          )
                          , React.createElement(DropdownMenuItem, {
                            onClick: () => handleToggleActive(ingredient)}

                            , ingredient.isActive ? "Deactivate" : "Activate"
                          )
                          , React.createElement(DropdownMenuItem, {
                            className: "text-destructive",
                            onClick: () => handleDelete(ingredient._id)}

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
              , editingIngredient ? "Edit Ingredient" : "Add New Ingredient"
            )
            , React.createElement(DialogDescription, {}
              , editingIngredient
                ? "Update the ingredient details"
                : "Create a new ingredient for inventory tracking"
            )
          )
          , React.createElement('div', { className: "space-y-4 py-4" }
            , React.createElement('div', { className: "space-y-2"}
              , React.createElement(Label, { htmlFor: "name"}, "Name *" )
              , React.createElement(Input, {
                id: "name",
                placeholder: "e.g., Chicken Breast"  ,
                value: formData.name,
                onChange: (e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              )
            )

            , React.createElement('div', { className: "space-y-2"}
              , React.createElement(Label, { htmlFor: "unitId"}, "Unit *" )
              , React.createElement(Select, {
                value: formData.unitId,
                onValueChange: (value) =>
                  setFormData({ ...formData, unitId: value })
                }

                , React.createElement(SelectTrigger, {}
                  , React.createElement(SelectValue, { placeholder: "Select unit" } )
                )
                , React.createElement(SelectContent, {}
                  , _optionalChain([units, 'optionalAccess', _15 => _15.map, 'call', _16 => _16((unit) => (
                    React.createElement(SelectItem, { key: unit._id, value: unit._id}
                      , unit.name, " (" , unit.symbol, ")"
                    )
                  ))])
                )
              )
            )

            , React.createElement('div', { className: "grid grid-cols-2 gap-4"  }
              , React.createElement('div', { className: "space-y-2"}
                , React.createElement(Label, { htmlFor: "currentStock"}, "Current Stock" )
                , React.createElement(Input, {
                  id: "currentStock",
                  type: "number",
                  step: "0.01",
                  value: formData.currentStock,
                  onChange: (e) =>
                    setFormData({ ...formData, currentStock: e.target.value })
                  }
                )
              )
              , React.createElement('div', { className: "space-y-2"}
                , React.createElement(Label, { htmlFor: "reorderLevel"}, "Reorder Level" )
                , React.createElement(Input, {
                  id: "reorderLevel",
                  type: "number",
                  step: "0.01",
                  value: formData.reorderLevel,
                  onChange: (e) =>
                    setFormData({ ...formData, reorderLevel: e.target.value })
                  }
                )
                , React.createElement('p', { className: "text-xs text-muted-foreground" }, "Alert when stock falls below this level"

                )
              )
            )

            , React.createElement('div', { className: "space-y-2"}
              , React.createElement(Label, { htmlFor: "costPerUnit"}, "Cost per Unit (Rs.)"   )
              , React.createElement(Input, {
                id: "costPerUnit",
                type: "number",
                step: "0.01",
                value: formData.costPerUnit,
                onChange: (e) =>
                  setFormData({ ...formData, costPerUnit: e.target.value })
                }
              )
            )
          )
          , React.createElement(DialogFooter, {}
            , React.createElement(Button, { variant: "outline", onClick: () => setShowDialog(false)}, "Cancel"

            )
            , React.createElement(Button, { onClick: handleSubmit, disabled: isLoading}
              , isLoading && React.createElement(Loader2, { className: "h-4 w-4 mr-2 animate-spin"   } )
              , editingIngredient ? "Update" : "Create"
            )
          )
        )
      )

      , React.createElement(DeleteDialog, {
        open: deleteDialogOpen,
        onOpenChange: setDeleteDialogOpen,
        title: "Delete Ingredient" ,
        description: "Are you sure you want to delete this ingredient? This action cannot be undone."             ,
        onConfirm: confirmDelete}
      )
    )
  );
}
