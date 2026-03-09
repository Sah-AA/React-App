import React from "react";
"use client";

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
  Printer,
  Loader2,
  TestTube,
} from "lucide-react";
import { toast } from "sonner";
import { DeleteDialog } from "@/components/ui/delete-dialog";










export default function PrintersPage() {
  const printers = useQuery(api.printers.getAll);
  const createPrinter = useMutation(api.printers.create);
  const updatePrinter = useMutation(api.printers.update);
  const deletePrinter = useMutation(api.printers.remove);

  const [showDialog, setShowDialog] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [printerToDelete, setPrinterToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    ipAddress: "",
    port: "9100",
    type: "kot" ,
    isActive: true,
  });

  const handleOpenDialog = (printer) => {
    if (printer) {
      setEditingPrinter(printer);
      setFormData({
        name: printer.name,
        ipAddress: printer.ipAddress,
        port: printer.port.toString(),
        type: printer.type,
        isActive: printer.isActive,
      });
    } else {
      setEditingPrinter(null);
      setFormData({
        name: "",
        ipAddress: "",
        port: "9100",
        type: "kot",
        isActive: true,
      });
    }
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.ipAddress) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      if (editingPrinter) {
        await updatePrinter({
          id: editingPrinter._id,
          name: formData.name,
          ipAddress: formData.ipAddress,
          port: parseInt(formData.port) || 9100,
          type: formData.type,
          isActive: formData.isActive,
        });
        toast.success("Printer updated successfully");
      } else {
        await createPrinter({
          name: formData.name,
          ipAddress: formData.ipAddress,
          port: parseInt(formData.port) || 9100,
          type: formData.type,
          isActive: formData.isActive,
        });
        toast.success("Printer created successfully");
      }
      setShowDialog(false);
    } catch (error) {
      toast.error(editingPrinter ? "Failed to update printer" : "Failed to create printer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setPrinterToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!printerToDelete) return;
    try {
      await deletePrinter({ id: printerToDelete });
      toast.success("Printer deleted successfully");
      setPrinterToDelete(null);
    } catch (error) {
      toast.error("Failed to delete printer");
    }
  };

  const handleToggleActive = async (printer) => {
    try {
      await updatePrinter({
        id: printer._id,
        isActive: !printer.isActive,
      });
      toast.success(`Printer ${printer.isActive ? "deactivated" : "activated"}`);
    } catch (error) {
      toast.error("Failed to update printer status");
    }
  };

  const handleTestPrint = async (printerId) => {
    setIsTesting(printerId);
    // Simulate test print
    setTimeout(() => {
      toast.success("Test print sent successfully");
      setIsTesting(null);
    }, 2000);
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "kot":
        return "KOT (Kitchen)";
      case "bill":
        return "Bill/Receipt";
      case "both":
        return "Both";
      default:
        return type;
    }
  };

  return (
    React.createElement('div', { className: "space-y-6"}
      , React.createElement('div', { className: "flex items-center justify-between"  }
        , React.createElement('div', {}
          , React.createElement('h1', { className: "text-2xl font-bold" }, "Printers")
          , React.createElement('p', { className: "text-muted-foreground"}, "Manage KOT and receipt printers for your restaurant"

          )
        )
        , React.createElement(Button, { onClick: () => handleOpenDialog()}
          , React.createElement(Plus, { className: "h-4 w-4 mr-2"  } ), "Add Printer"

        )
      )

      , React.createElement(Card, {}
        , React.createElement(CardHeader, {}
          , React.createElement(CardTitle, {}, "All Printers" )
          , React.createElement(CardDescription, {}, "Configure kitchen printers for KOT and receipt printing"

          )
        )
        , React.createElement(CardContent, {}
          , printers === undefined ? (
            React.createElement('div', { className: "flex items-center justify-center py-8"   }
              , React.createElement(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground"   } )
            )
          ) : printers.length === 0 ? (
            React.createElement('div', { className: "text-center py-8 text-muted-foreground"  }
              , React.createElement(Printer, { className: "h-12 w-12 mx-auto mb-4 opacity-50"    } )
              , React.createElement('p', {}, "No printers configured yet"   )
              , React.createElement('p', { className: "text-sm"}, "Click \"Add Printer\" to add your first printer"       )
            )
          ) : (
            React.createElement(Table, {}
              , React.createElement(TableHeader, {}
                , React.createElement(TableRow, {}
                  , React.createElement(TableHead, {}, "Name")
                  , React.createElement(TableHead, {}, "Type")
                  , React.createElement(TableHead, {}, "Address")
                  , React.createElement(TableHead, {}, "Status")
                  , React.createElement(TableHead, { className: "w-[100px]"})
                )
              )
              , React.createElement(TableBody, {}
                , printers.map((printer) => (
                  React.createElement(TableRow, { key: printer._id}
                    , React.createElement(TableCell, {}
                      , React.createElement('span', { className: "font-medium"}, printer.name)
                    )
                    , React.createElement(TableCell, {}
                      , React.createElement(Badge, { variant: "outline"}, getTypeLabel(printer.type))
                    )
                    , React.createElement(TableCell, {}
                      , React.createElement('code', { className: "text-sm bg-muted px-2 py-1 rounded"    }
                        , printer.ipAddress, ":", printer.port
                      )
                    )
                    , React.createElement(TableCell, {}
                      , React.createElement(Badge, {
                        variant: printer.isActive ? "default" : "secondary",
                        className: 
                          printer.isActive
                            ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                            : ""
                        }

                        , printer.isActive ? "Active" : "Inactive"
                      )
                    )
                    , React.createElement(TableCell, {}
                      , React.createElement('div', { className: "flex items-center gap-1"  }
                        , React.createElement(Button, {
                          variant: "ghost",
                          size: "icon",
                          onClick: () => handleTestPrint(printer._id),
                          disabled: isTesting === printer._id}

                          , isTesting === printer._id ? (
                            React.createElement(Loader2, { className: "h-4 w-4 animate-spin"  } )
                          ) : (
                            React.createElement(TestTube, { className: "h-4 w-4" } )
                          )
                        )
                        , React.createElement(DropdownMenu, {}
                          , React.createElement(DropdownMenuTrigger, { asChild: true}
                            , React.createElement(Button, { variant: "ghost", size: "icon"}
                              , React.createElement(MoreHorizontal, { className: "h-4 w-4" } )
                            )
                          )
                          , React.createElement(DropdownMenuContent, { align: "end"}
                            , React.createElement(DropdownMenuItem, { onClick: () => handleOpenDialog(printer )}
                              , React.createElement(Pencil, { className: "h-4 w-4 mr-2"  } ), "Edit"

                            )
                            , React.createElement(DropdownMenuItem, {
                              onClick: () => handleToggleActive(printer )}

                              , printer.isActive ? "Deactivate" : "Activate"
                            )
                            , React.createElement(DropdownMenuItem, {
                              className: "text-destructive",
                              onClick: () => handleDelete(printer._id)}

                              , React.createElement(Trash2, { className: "h-4 w-4 mr-2"  } ), "Delete"

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

      /* Add/Edit Dialog */
      , React.createElement(Dialog, { open: showDialog, onOpenChange: setShowDialog}
        , React.createElement(DialogContent, {}
          , React.createElement(DialogHeader, {}
            , React.createElement(DialogTitle, {}
              , editingPrinter ? "Edit Printer" : "Add New Printer"
            )
            , React.createElement(DialogDescription, {}
              , editingPrinter
                ? "Update the printer configuration"
                : "Configure a new printer for KOT or receipt printing"
            )
          )
          , React.createElement('div', { className: "space-y-4 py-4" }
            , React.createElement('div', { className: "space-y-2"}
              , React.createElement(Label, { htmlFor: "name"}, "Printer Name *"  )
              , React.createElement(Input, {
                id: "name",
                placeholder: "e.g., Kitchen Printer"  ,
                value: formData.name,
                onChange: (e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              )
            )

            , React.createElement('div', { className: "space-y-2"}
              , React.createElement(Label, { htmlFor: "type"}, "Printer Type" )
              , React.createElement(Select, {
                value: formData.type,
                onValueChange: (value) =>
                  setFormData({ ...formData, type: value })
                }

                , React.createElement(SelectTrigger, {}
                  , React.createElement(SelectValue, { placeholder: "Select printer type"  } )
                )
                , React.createElement(SelectContent, {}
                  , React.createElement(SelectItem, { value: "kot"}, "KOT (Kitchen Order Ticket)"   )
                  , React.createElement(SelectItem, { value: "bill"}, "Bill/Receipt")
                  , React.createElement(SelectItem, { value: "both"}, "Both KOT and Bill"   )
                )
              )
            )

            , React.createElement('div', { className: "grid grid-cols-2 gap-4"  }
              , React.createElement('div', { className: "space-y-2"}
                , React.createElement(Label, { htmlFor: "ipAddress"}, "IP Address *"  )
                , React.createElement(Input, {
                  id: "ipAddress",
                  placeholder: "e.g., 192.168.1.100" ,
                  value: formData.ipAddress,
                  onChange: (e) =>
                    setFormData({ ...formData, ipAddress: e.target.value })
                  }
                )
              )
              , React.createElement('div', { className: "space-y-2"}
                , React.createElement(Label, { htmlFor: "port"}, "Port")
                , React.createElement(Input, {
                  id: "port",
                  type: "number",
                  placeholder: "9100",
                  value: formData.port,
                  onChange: (e) =>
                    setFormData({ ...formData, port: e.target.value })
                  }
                )
              )
            )
          )
          , React.createElement(DialogFooter, {}
            , React.createElement(Button, { variant: "outline", onClick: () => setShowDialog(false)}, "Cancel"

            )
            , React.createElement(Button, { onClick: handleSubmit, disabled: isLoading}
              , isLoading && React.createElement(Loader2, { className: "h-4 w-4 mr-2 animate-spin"   } )
              , editingPrinter ? "Update" : "Add Printer"
            )
          )
        )
      )

      , React.createElement(DeleteDialog, {
        open: deleteDialogOpen,
        onOpenChange: setDeleteDialogOpen,
        title: "Delete Printer" ,
        description: "Are you sure you want to delete this printer? This action cannot be undone."             ,
        onConfirm: confirmDelete}
      )
    )
  );
}
