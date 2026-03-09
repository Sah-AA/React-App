"use client";
import React from "react";


import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import {
  AlertDialog,

  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";









export function DeleteDialog({
  open,
  onOpenChange,
  title = "Are you sure?",
  description = "This action cannot be undone. This will permanently delete this item.",
  onConfirm,
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    React.createElement(AlertDialog, { open: open, onOpenChange: onOpenChange}
      , React.createElement(AlertDialogContent, {}
        , React.createElement(AlertDialogHeader, {}
          , React.createElement('div', { className: "flex items-center gap-3"  }
            , React.createElement('div', { className: "p-2 bg-destructive/10 rounded-full"  }
              , React.createElement(AlertTriangle, { className: "h-5 w-5 text-destructive"  } )
            )
            , React.createElement(AlertDialogTitle, {}, title)
          )
          , React.createElement(AlertDialogDescription, { className: "pt-2"}
            , description
          )
        )
        , React.createElement(AlertDialogFooter, {}
          , React.createElement(AlertDialogCancel, { disabled: isDeleting}, "Cancel")
          , React.createElement(Button, {
            variant: "destructive",
            onClick: handleConfirm,
            disabled: isDeleting}

            , isDeleting ? (
              React.createElement(React.Fragment, null
                , React.createElement(Loader2, { className: "mr-2 h-4 w-4 animate-spin"   } ), "Deleting..."

              )
            ) : (
              "Delete"
            )
          )
        )
      )
    )
  );
}
