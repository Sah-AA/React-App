import React from "react";
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";

import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { toast } from "sonner";









export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sortOrder: 0,
    isActive: true,
  });

  // Connect to Convex
  const categories = useQuery(api.categories.getAll) || [];
  const createCategory = useMutation(api.categories.create);
  const updateCategory = useMutation(api.categories.update);
  const deleteCategory = useMutation(api.categories.remove);
  
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      sortOrder: 0,
      isActive: true,
    });
    setEditingCategory(null);
  };

  const handleOpenDialog = (category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || "",
        sortOrder: category.sortOrder,
        isActive: category.isActive,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingCategory) {
        await updateCategory({
          id: editingCategory._id,
          name: formData.name,
          description: formData.description || undefined,
          sortOrder: formData.sortOrder,
          isActive: formData.isActive,
        });
        toast.success("Category updated successfully");
      } else {
        await createCategory({
          name: formData.name,
          description: formData.description || undefined,
          sortOrder: formData.sortOrder,
          isActive: formData.isActive,
        });
        toast.success("Category created successfully");
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setCategoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory({ id: categoryToDelete });
      toast.success("Category deleted successfully");
      setCategoryToDelete(null);
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    React.createElement('div', { className: "space-y-6"}
      , React.createElement('div', { className: "flex items-center justify-between"  }
        , React.createElement('div', {}
          , React.createElement('h1', { className: "text-3xl font-bold" }, "Categories")
          , React.createElement('p', { className: "text-muted-foreground"}, "Manage menu categories for your restaurant"

          )
        )
        , React.createElement(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen}
          , React.createElement(DialogTrigger, { asChild: true}
            , React.createElement(Button, { onClick: () => handleOpenDialog()}
              , React.createElement(Plus, { className: "h-4 w-4 mr-2"  } ), "Add Category"

            )
          )
          , React.createElement(DialogContent, {}
            , React.createElement('form', { onSubmit: handleSubmit}
              , React.createElement(DialogHeader, {}
                , React.createElement(DialogTitle, {}
                  , editingCategory ? "Edit Category" : "Add New Category"
                )
                , React.createElement(DialogDescription, {}
                  , editingCategory
                    ? "Update the category details below."
                    : "Fill in the details to create a new category."
                )
              )
              , React.createElement('div', { className: "space-y-4 py-4" }
                , React.createElement('div', { className: "space-y-2"}
                  , React.createElement(Label, { htmlFor: "name"}, "Category Name" )
                  , React.createElement(Input, {
                    id: "name",
                    value: formData.name,
                    onChange: (e) =>
                      setFormData({ ...formData, name: e.target.value })
                    ,
                    placeholder: "e.g., Appetizers" ,
                    required: true}
                  )
                )
                , React.createElement('div', { className: "space-y-2"}
                  , React.createElement(Label, { htmlFor: "description"}, "Description")
                  , React.createElement(Input, {
                    id: "description",
                    value: formData.description,
                    onChange: (e) =>
                      setFormData({ ...formData, description: e.target.value })
                    ,
                    placeholder: "Optional description" }
                  )
                )
                , React.createElement('div', { className: "space-y-2"}
                  , React.createElement(Label, { htmlFor: "sortOrder"}, "Sort Order" )
                  , React.createElement(Input, {
                    id: "sortOrder",
                    type: "number",
                    value: formData.sortOrder,
                    onChange: (e) =>
                      setFormData({
                        ...formData,
                        sortOrder: parseInt(e.target.value) || 0,
                      })
                    ,
                    placeholder: "0"}
                  )
                )
                , React.createElement('div', { className: "flex items-center justify-between"  }
                  , React.createElement(Label, { htmlFor: "isActive"}, "Active")
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
                , React.createElement(Button, {
                  type: "button",
                  variant: "outline",
                  onClick: () => setIsDialogOpen(false)}
, "Cancel"

                )
                , React.createElement(Button, { type: "submit", disabled: isLoading}
                  , isLoading && React.createElement(Loader2, { className: "h-4 w-4 mr-2 animate-spin"   } )
                  , editingCategory ? "Update" : "Create"
                )
              )
            )
          )
        )
      )

      /* Search */
      , React.createElement('div', { className: "flex items-center gap-4"  }
        , React.createElement('div', { className: "relative flex-1 max-w-sm"  }
          , React.createElement(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"      } )
          , React.createElement(Input, {
            placeholder: "Search categories..." ,
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            className: "pl-9"}
          )
        )
      )

      /* Table */
      , React.createElement('div', { className: "border rounded-lg" }
        , React.createElement(Table, {}
          , React.createElement(TableHeader, {}
            , React.createElement(TableRow, {}
              , React.createElement(TableHead, {}, "Name")
              , React.createElement(TableHead, {}, "Description")
              , React.createElement(TableHead, {}, "Sort Order" )
              , React.createElement(TableHead, {}, "Status")
              , React.createElement(TableHead, { className: "text-right"}, "Actions")
            )
          )
          , React.createElement(TableBody, {}
            , filteredCategories.length === 0 ? (
              React.createElement(TableRow, {}
                , React.createElement(TableCell, { colSpan: 5, className: "text-center py-8" }
                  , React.createElement('p', { className: "text-muted-foreground"}, "No categories found. Create your first category to get started."

                  )
                )
              )
            ) : (
              filteredCategories.map((category) => (
                React.createElement(TableRow, { key: category._id}
                  , React.createElement(TableCell, { className: "font-medium"}, category.name)
                  , React.createElement(TableCell, {}, category.description || "-")
                  , React.createElement(TableCell, {}, category.sortOrder)
                  , React.createElement(TableCell, {}
                    , React.createElement(Badge, { variant: category.isActive ? "default" : "secondary"}
                      , category.isActive ? "Active" : "Inactive"
                    )
                  )
                  , React.createElement(TableCell, { className: "text-right"}
                    , React.createElement('div', { className: "flex justify-end gap-2"  }
                      , React.createElement(Button, {
                        variant: "ghost",
                        size: "icon",
                        onClick: () => handleOpenDialog(category)}

                        , React.createElement(Pencil, { className: "h-4 w-4" } )
                      )
                      , React.createElement(Button, {
                        variant: "ghost",
                        size: "icon",
                        onClick: () => handleDelete(category._id)}

                        , React.createElement(Trash2, { className: "h-4 w-4 text-destructive"  } )
                      )
                    )
                  )
                )
              ))
            )
          )
        )
      )

      , React.createElement(DeleteDialog, {
        open: deleteDialogOpen,
        onOpenChange: setDeleteDialogOpen,
        title: "Delete Category" ,
        description: "Are you sure you want to delete this category? This action cannot be undone."             ,
        onConfirm: confirmDelete}
      )
    )
  );
}
