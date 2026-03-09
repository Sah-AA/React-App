"use client";
import React from "react";
function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";

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
import { DeleteDialog } from "@/components/ui/delete-dialog";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "convex/_generated/api";














function AccountRow({
  account,
  level = 0,
  expandedIds,
  toggleExpand,
  onEdit,
  onDelete,
}






) {
  const isExpanded = expandedIds.has(account._id);
  const hasChildren = account.children && account.children.length > 0;
  const isGroup = hasChildren;

  const getTypeColor = (type) => {
    switch (type) {
      case "asset":
        return "bg-blue-500/10 text-blue-600";
      case "liability":
        return "bg-red-500/10 text-red-600";
      case "equity":
        return "bg-purple-500/10 text-purple-600";
      case "income":
        return "bg-green-500/10 text-green-600";
      case "expense":
        return "bg-orange-500/10 text-orange-600";
      default:
        return "";
    }
  };

  return (
    React.createElement(React.Fragment, null
      , React.createElement(TableRow, { className: isGroup ? "bg-muted/30" : ""}
        , React.createElement(TableCell, {}
          , React.createElement('div', {
            className: "flex items-center gap-2"  ,
            style: { paddingLeft: `${level * 24}px` }}

            , hasChildren ? (
              React.createElement('button', {
                onClick: () => toggleExpand(account._id),
                className: "p-0.5 hover:bg-muted rounded"  }

                , isExpanded ? (
                  React.createElement(ChevronDown, { className: "h-4 w-4" } )
                ) : (
                  React.createElement(ChevronRight, { className: "h-4 w-4" } )
                )
              )
            ) : (
              React.createElement('span', { className: "w-5"} )
            )
            , isGroup ? (
              isExpanded ? (
                React.createElement(FolderOpen, { className: "h-4 w-4 text-muted-foreground"  } )
              ) : (
                React.createElement(Folder, { className: "h-4 w-4 text-muted-foreground"  } )
              )
            ) : (
              React.createElement('span', { className: "w-4"} )
            )
            , React.createElement(Badge, { variant: "outline", className: "font-mono text-xs" }
              , account.code
            )
          )
        )
        , React.createElement(TableCell, {}
          , React.createElement('span', { className: isGroup ? "font-semibold" : ""}
            , account.name
          )
        )
        , React.createElement(TableCell, {}
          , React.createElement(Badge, { className: getTypeColor(account.type)}
            , account.type.charAt(0).toUpperCase() + account.type.slice(1)
          )
        )
        , React.createElement(TableCell, {}
          , isGroup ? (
            React.createElement(Badge, { variant: "outline"}, "Group")
          ) : (
            React.createElement(Badge, { variant: "secondary"}, "Ledger")
          )
        )
        , React.createElement(TableCell, { className: "text-right font-medium" }, "Rs. "
           , (account.currentBalance || 0).toLocaleString()
        )
        , React.createElement(TableCell, { className: "text-right"}
          , React.createElement('div', { className: "flex items-center justify-end gap-2"   }
            , React.createElement(Button, {
              variant: "ghost",
              size: "icon",
              onClick: () => onEdit(account)}

              , React.createElement(Edit2, { className: "h-4 w-4" } )
            )
            , !isGroup && (
              React.createElement(Button, {
                variant: "ghost",
                size: "icon",
                onClick: () => onDelete(account._id)}

                , React.createElement(Trash2, { className: "h-4 w-4 text-red-600"  } )
              )
            )
          )
        )
      )
      , isExpanded &&
        _optionalChain([account, 'access', _ => _.children, 'optionalAccess', _2 => _2.map, 'call', _3 => _3((child) => (
          React.createElement(AccountRow, {
            key: child._id,
            account: child,
            level: level + 1,
            expandedIds: expandedIds,
            toggleExpand: toggleExpand,
            onEdit: onEdit,
            onDelete: onDelete}
          )
        ))])
    )
  );
}

export default function ChartOfAccountsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [editingAccount, setEditingAccount] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  // Convex queries and mutations
  const accountsTree = useQuery(api.chartOfAccounts.getTree);
  const accounts = useQuery(api.chartOfAccounts.list);
  const createAccount = useMutation(api.chartOfAccounts.create);
  const updateAccount = useMutation(api.chartOfAccounts.update);
  const deleteAccount = useMutation(api.chartOfAccounts.remove);

  const isLoading = accountsTree === undefined;

  // Form state
  const [accountCode, setAccountCode] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState("asset");
  const [parentAccount, setParentAccount] = useState(null);

  const toggleExpand = (id) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const expandAll = () => {
    const allIds = new Set();
    const collectIds = (accs) => {
      accs.forEach((acc) => {
        if (acc.children && acc.children.length > 0) {
          allIds.add(acc._id);
          collectIds(acc.children);
        }
      });
    };
    if (accountsTree) collectIds(accountsTree );
    setExpandedIds(allIds);
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setAccountCode(account.code);
    setAccountName(account.name);
    setAccountType(account.type );
    setParentAccount(account.parentId || null);
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    setAccountToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!accountToDelete) return;
    try {
      await deleteAccount({ id: accountToDelete });
      toast.success("Account deleted successfully");
      setAccountToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete account");
    }
  };

  const handleSubmit = async () => {
    if (!accountCode || !accountName) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingAccount) {
        await updateAccount({
          id: editingAccount._id,
          code: accountCode,
          name: accountName,
          type: accountType,
          parentId: parentAccount || undefined,
        });
        toast.success("Account updated successfully");
      } else {
        await createAccount({
          code: accountCode,
          name: accountName,
          type: accountType,
          parentId: parentAccount || undefined,
        });
        toast.success("Account created successfully");
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save account");
    }
  };

  const resetForm = () => {
    setEditingAccount(null);
    setAccountCode("");
    setAccountName("");
    setAccountType("asset");
    setParentAccount(null);
  };

  // Calculate summary totals
  const getTotalByType = (type) => {
    if (!accounts) return 0;
    return accounts
      .filter((a) => a.type === type)
      .reduce((sum, a) => sum + (a.currentBalance || 0), 0);
  };

  return (
    React.createElement('div', { className: "space-y-6"}
      , React.createElement('div', { className: "flex items-center justify-between"  }
        , React.createElement('div', {}
          , React.createElement('h1', { className: "text-2xl font-bold" }, "Chart of Accounts"  )
          , React.createElement('p', { className: "text-muted-foreground"}, "Manage your account structure and hierarchy"

          )
        )
        , React.createElement(Dialog, {
          open: isDialogOpen,
          onOpenChange: (open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}

          , React.createElement(DialogTrigger, { asChild: true}
            , React.createElement(Button, {}
              , React.createElement(Plus, { className: "h-4 w-4 mr-2"  } ), "Add Account"

            )
          )
          , React.createElement(DialogContent, {}
            , React.createElement(DialogHeader, {}
              , React.createElement(DialogTitle, {}
                , editingAccount ? "Edit Account" : "Add New Account"
              )
              , React.createElement(DialogDescription, {}
                , editingAccount
                  ? "Update account details"
                  : "Create a new account in the chart of accounts"
              )
            )

            , React.createElement('div', { className: "space-y-4"}
              , React.createElement('div', { className: "grid grid-cols-2 gap-4"  }
                , React.createElement('div', { className: "space-y-2"}
                  , React.createElement(Label, {}, "Account Code *"  )
                  , React.createElement(Input, {
                    value: accountCode,
                    onChange: (e) => setAccountCode(e.target.value),
                    placeholder: "e.g., 1101" }
                  )
                )
                , React.createElement('div', { className: "space-y-2"}
                  , React.createElement(Label, {}, "Account Type *"  )
                  , React.createElement(Select, { value: accountType, onValueChange: (v) => setAccountType(v )}
                    , React.createElement(SelectTrigger, {}
                      , React.createElement(SelectValue, {} )
                    )
                    , React.createElement(SelectContent, {}
                      , React.createElement(SelectItem, { value: "asset"}, "Asset")
                      , React.createElement(SelectItem, { value: "liability"}, "Liability")
                      , React.createElement(SelectItem, { value: "equity"}, "Equity")
                      , React.createElement(SelectItem, { value: "income"}, "Income")
                      , React.createElement(SelectItem, { value: "expense"}, "Expense")
                    )
                  )
                )
              )

              , React.createElement('div', { className: "space-y-2"}
                , React.createElement(Label, {}, "Account Name *"  )
                , React.createElement(Input, {
                  value: accountName,
                  onChange: (e) => setAccountName(e.target.value),
                  placeholder: "e.g., Petty Cash"  }
                )
              )

              , React.createElement('div', { className: "space-y-2"}
                , React.createElement(Label, {}, "Parent Account" )
                , React.createElement(Select, {
                  value: parentAccount || "none",
                  onValueChange: (v) =>
                    setParentAccount(v === "none" ? null : v )
                  }

                  , React.createElement(SelectTrigger, {}
                    , React.createElement(SelectValue, { placeholder: "Select parent (optional)"  } )
                  )
                  , React.createElement(SelectContent, {}
                    , React.createElement(SelectItem, { value: "none"}, "No Parent (Root Level)"   )
                    , _optionalChain([accounts, 'optionalAccess', _4 => _4.map, 'call', _5 => _5((acc) => (
                      React.createElement(SelectItem, { key: acc._id, value: acc._id}
                        , acc.code, " - "  , acc.name
                      )
                    ))])
                  )
                )
              )
            )

            , React.createElement(DialogFooter, {}
              , React.createElement(Button, {
                variant: "outline",
                onClick: () => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
, "Cancel"

              )
              , React.createElement(Button, { onClick: handleSubmit}
                , editingAccount ? "Update" : "Create"
              )
            )
          )
        )
      )

      /* Toolbar */
      , React.createElement(Card, {}
        , React.createElement(CardContent, { className: "pt-6"}
          , React.createElement('div', { className: "flex items-center justify-between"  }
            , React.createElement('div', { className: "relative w-72" }
              , React.createElement(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"       } )
              , React.createElement(Input, {
                placeholder: "Search accounts..." ,
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value),
                className: "pl-9"}
              )
            )
            , React.createElement('div', { className: "flex items-center gap-2"  }
              , React.createElement(Button, { variant: "outline", size: "sm", onClick: expandAll}, "Expand All"

              )
              , React.createElement(Button, { variant: "outline", size: "sm", onClick: collapseAll}, "Collapse All"

              )
            )
          )
        )
      )

      /* Chart of Accounts Table */
      , React.createElement(Card, {}
        , React.createElement(CardContent, { className: "p-0"}
          , React.createElement(ScrollArea, { className: "h-[600px]"}
            , isLoading ? (
              React.createElement('div', { className: "p-4 space-y-3" }
                , [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  React.createElement(Skeleton, { key: i, className: "h-12 w-full" } )
                ))
              )
            ) : (accountsTree || []).length === 0 ? (
              React.createElement('div', { className: "flex flex-col items-center justify-center py-12"    }
                , React.createElement(Folder, { className: "h-12 w-12 text-muted-foreground mb-4"   } )
                , React.createElement('p', { className: "text-muted-foreground"}, "No accounts found"  )
                , React.createElement('p', { className: "text-sm text-muted-foreground" }, "Click \"Add Account\" to create your first account"       )
              )
            ) : (
            React.createElement(Table, {}
              , React.createElement(TableHeader, {}
                , React.createElement(TableRow, {}
                  , React.createElement(TableHead, { className: "w-[200px]"}, "Code")
                  , React.createElement(TableHead, {}, "Account Name" )
                  , React.createElement(TableHead, { className: "w-[120px]"}, "Type")
                  , React.createElement(TableHead, { className: "w-[100px]"}, "Category")
                  , React.createElement(TableHead, { className: "text-right w-[150px]" }, "Balance"

                  )
                  , React.createElement(TableHead, { className: "text-right w-[100px]" }, "Actions"

                  )
                )
              )
              , React.createElement(TableBody, {}
                , (accountsTree  || []).map((account) => (
                  React.createElement(AccountRow, {
                    key: account._id,
                    account: account,
                    expandedIds: expandedIds,
                    toggleExpand: toggleExpand,
                    onEdit: handleEdit,
                    onDelete: handleDelete}
                  )
                ))
              )
            )
            )
          )
        )
      )

      /* Summary */
      , React.createElement('div', { className: "grid grid-cols-2 md:grid-cols-5 gap-4"   }
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground"  }, "Assets"

            )
          )
          , React.createElement(CardContent, {}
            , isLoading ? (
              React.createElement(Skeleton, { className: "h-7 w-24" } )
            ) : (
              React.createElement('p', { className: "text-xl font-bold text-blue-600"  }, "Rs. "
                 , getTotalByType("asset").toLocaleString()
              )
            )
          )
        )
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground"  }, "Liabilities"

            )
          )
          , React.createElement(CardContent, {}
            , isLoading ? (
              React.createElement(Skeleton, { className: "h-7 w-24" } )
            ) : (
              React.createElement('p', { className: "text-xl font-bold text-red-600"  }, "Rs. "
                 , getTotalByType("liability").toLocaleString()
              )
            )
          )
        )
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground"  }, "Equity"

            )
          )
          , React.createElement(CardContent, {}
            , isLoading ? (
              React.createElement(Skeleton, { className: "h-7 w-24" } )
            ) : (
              React.createElement('p', { className: "text-xl font-bold text-purple-600"  }, "Rs. "
                 , getTotalByType("equity").toLocaleString()
              )
            )
          )
        )
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground"  }, "Income"

            )
          )
          , React.createElement(CardContent, {}
            , isLoading ? (
              React.createElement(Skeleton, { className: "h-7 w-24" } )
            ) : (
              React.createElement('p', { className: "text-xl font-bold text-green-600"  }, "Rs. "
                 , getTotalByType("income").toLocaleString()
              )
            )
          )
        )
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground"  }, "Expenses"

            )
          )
          , React.createElement(CardContent, {}
            , isLoading ? (
              React.createElement(Skeleton, { className: "h-7 w-24" } )
            ) : (
              React.createElement('p', { className: "text-xl font-bold text-orange-600"  }, "Rs. "
                 , getTotalByType("expense").toLocaleString()
              )
            )
          )
        )
      )

      , React.createElement(DeleteDialog, {
        open: deleteDialogOpen,
        onOpenChange: setDeleteDialogOpen,
        title: "Delete Account" ,
        description: "Are you sure you want to delete this account? This action cannot be undone and may affect related transactions."                  ,
        onConfirm: confirmDelete}
      )
    )
  );
}
