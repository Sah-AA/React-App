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
  Loader2,
  Users,
  UserCheck,
  Phone,
  Mail,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { DeleteDialog } from "@/components/ui/delete-dialog";





















const DEPARTMENTS = [
  { value: "service", label: "Service", color: "bg-green-500/10 text-green-600" },
  { value: "kitchen", label: "Kitchen", color: "bg-orange-500/10 text-orange-600" },
  { value: "admin", label: "Admin", color: "bg-purple-500/10 text-purple-600" },
  { value: "accounts", label: "Accounts", color: "bg-indigo-500/10 text-indigo-600" },
];

export default function StaffPage() {
  const staff = useQuery(api.staff.getAll);
  const createStaff = useMutation(api.staff.create);
  const updateStaff = useMutation(api.staff.update);
  const deleteStaff = useMutation(api.staff.remove);

  const [showDialog, setShowDialog] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    department: "service",
    salary: "",
    joinDate: new Date().toISOString().split("T")[0],
  });

  const handleOpenDialog = (member) => {
    if (member) {
      setEditingStaff(member);
      setFormData({
        name: member.name,
        email: member.email || "",
        phone: member.phone,
        position: member.position,
        department: member.department,
        salary: member.salary.toString(),
        joinDate: new Date(member.joinDate).toISOString().split("T")[0],
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        position: "",
        department: "service",
        salary: "",
        joinDate: new Date().toISOString().split("T")[0],
      });
    }
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.salary || !formData.position) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      if (editingStaff) {
        await updateStaff({
          id: editingStaff._id ,
          name: formData.name,
          email: formData.email || undefined,
          phone: formData.phone,
          position: formData.position,
          department: formData.department,
          salary: parseFloat(formData.salary),
        });
        toast.success("Staff member updated successfully");
      } else {
        await createStaff({
          name: formData.name,
          email: formData.email || undefined,
          phone: formData.phone,
          position: formData.position,
          department: formData.department,
          salary: parseFloat(formData.salary),
          joinDate: new Date(formData.joinDate).getTime(),
          status: "active",
        });
        toast.success("Staff member created successfully");
      }
      setShowDialog(false);
    } catch (error) {
      toast.error(
        editingStaff ? "Failed to update staff member" : "Failed to create staff member"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setStaffToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!staffToDelete) return;
    try {
      await deleteStaff({ id: staffToDelete  });
      toast.success("Staff member deleted successfully");
      setStaffToDelete(null);
    } catch (error) {
      toast.error("Failed to delete staff member");
    }
  };

  const handleToggleActive = async (member) => {
    try {
      const newStatus = member.status === "active" ? "inactive" : "active";
      await updateStaff({
        id: member._id ,
        status: newStatus,
      });
      toast.success(`Staff ${member.status === "active" ? "deactivated" : "activated"}`);
    } catch (error) {
      toast.error("Failed to update staff status");
    }
  };

  // Filter staff
  const filteredStaff = _optionalChain([staff, 'optionalAccess', _ => _.filter, 'call', _2 => _2((s) => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery) ||
      _optionalChain([s, 'access', _3 => _3.email, 'optionalAccess', _4 => _4.toLowerCase, 'call', _5 => _5(), 'access', _6 => _6.includes, 'call', _7 => _7(searchQuery.toLowerCase())]);
    const matchesDepartment = departmentFilter === "all" || s.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  })]);

  const getDepartmentInfo = (department) => {
    return DEPARTMENTS.find((d) => d.value === department) || DEPARTMENTS[0];
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Stats
  const activeStaff = _optionalChain([staff, 'optionalAccess', _8 => _8.filter, 'call', _9 => _9((s) => s.status === "active"), 'access', _10 => _10.length]) || 0;
  const totalSalary = _optionalChain([staff, 'optionalAccess', _11 => _11.reduce, 'call', _12 => _12((sum, s) => sum + (s.status === "active" ? s.salary : 0), 0)]) || 0;

  return (
    React.createElement('div', { className: "space-y-6"}
      , React.createElement('div', { className: "flex items-center justify-between"  }
        , React.createElement('div', {}
          , React.createElement('h1', { className: "text-2xl font-bold" }, "Staff Management" )
          , React.createElement('p', { className: "text-muted-foreground"}, "Manage your restaurant staff members"

          )
        )
        , React.createElement(Button, { onClick: () => handleOpenDialog()}
          , React.createElement(Plus, { className: "h-4 w-4 mr-2"  } ), "Add Staff"

        )
      )

      /* Stats */
      , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-4 gap-4"   }
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground flex items-center gap-2"     }
              , React.createElement(Users, { className: "h-4 w-4" } ), "Total Staff"

            )
          )
          , React.createElement(CardContent, {}
            , React.createElement('p', { className: "text-2xl font-bold" }, _optionalChain([staff, 'optionalAccess', _13 => _13.length]) || 0)
          )
        )
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-green-600 flex items-center gap-2"     }
              , React.createElement(UserCheck, { className: "h-4 w-4" } ), "Active Staff"

            )
          )
          , React.createElement(CardContent, {}
            , React.createElement('p', { className: "text-2xl font-bold text-green-600"  }, activeStaff)
          )
        )
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground"  }, "Service Staff"

            )
          )
          , React.createElement(CardContent, {}
            , React.createElement('p', { className: "text-2xl font-bold" }
              , _optionalChain([staff, 'optionalAccess', _14 => _14.filter, 'call', _15 => _15((s) => s.department === "service" && s.status === "active"), 'access', _16 => _16.length]) || 0
            )
          )
        )
        , React.createElement(Card, {}
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground"  }, "Monthly Salary"

            )
          )
          , React.createElement(CardContent, {}
            , React.createElement('p', { className: "text-2xl font-bold" }, "Rs. "
               , totalSalary.toLocaleString()
            )
          )
        )
      )

      /* Filters */
      , React.createElement(Card, {}
        , React.createElement(CardContent, { className: "pt-6"}
          , React.createElement('div', { className: "flex items-center gap-4"  }
            , React.createElement('div', { className: "relative flex-1" }
              , React.createElement(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"      } )
              , React.createElement(Input, {
                placeholder: "Search by name, phone or email..."     ,
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value),
                className: "pl-9"}
              )
            )
            , React.createElement(Select, { value: departmentFilter, onValueChange: setDepartmentFilter}
              , React.createElement(SelectTrigger, { className: "w-[180px]"}
                , React.createElement(SelectValue, { placeholder: "All Departments" } )
              )
              , React.createElement(SelectContent, {}
                , React.createElement(SelectItem, { value: "all"}, "All Departments" )
                , DEPARTMENTS.map((dept) => (
                  React.createElement(SelectItem, { key: dept.value, value: dept.value}
                    , dept.label
                  )
                ))
              )
            )
          )
        )
      )

      /* Staff Table */
      , React.createElement(Card, {}
        , React.createElement(CardHeader, {}
          , React.createElement(CardTitle, {}, "All Staff Members"  )
          , React.createElement(CardDescription, {}
            , _optionalChain([filteredStaff, 'optionalAccess', _17 => _17.length]) || 0, " staff members found"
          )
        )
        , React.createElement(CardContent, {}
          , staff === undefined ? (
            React.createElement('div', { className: "flex items-center justify-center py-8"   }
              , React.createElement(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground"   } )
            )
          ) : _optionalChain([filteredStaff, 'optionalAccess', _18 => _18.length]) === 0 ? (
            React.createElement('div', { className: "text-center py-8 text-muted-foreground"  }
              , React.createElement(Users, { className: "h-12 w-12 mx-auto mb-4 opacity-50"    } )
              , React.createElement('p', {}, "No staff members found"   )
              , React.createElement('p', { className: "text-sm"}, "Click \"Add Staff\" to add your first member"       )
            )
          ) : (
            React.createElement(Table, {}
              , React.createElement(TableHeader, {}
                , React.createElement(TableRow, {}
                  , React.createElement(TableHead, {}, "Name")
                  , React.createElement(TableHead, {}, "Contact")
                  , React.createElement(TableHead, {}, "Position")
                  , React.createElement(TableHead, {}, "Salary")
                  , React.createElement(TableHead, {}, "Joined")
                  , React.createElement(TableHead, {}, "Status")
                  , React.createElement(TableHead, { className: "w-[70px]"})
                )
              )
              , React.createElement(TableBody, {}
                , _optionalChain([filteredStaff, 'optionalAccess', _19 => _19.map, 'call', _20 => _20((member) => (
                  React.createElement(TableRow, { key: member._id}
                    , React.createElement(TableCell, {}
                      , React.createElement('div', { className: "flex items-center gap-3"  }
                        , React.createElement(Avatar, {}
                          , React.createElement(AvatarFallback, {}, getInitials(member.name))
                        )
                        , React.createElement('span', { className: "font-medium"}, member.name)
                      )
                    )
                    , React.createElement(TableCell, {}
                      , React.createElement('div', { className: "space-y-1"}
                        , React.createElement('div', { className: "flex items-center gap-1 text-sm"   }
                          , React.createElement(Phone, { className: "h-3 w-3 text-muted-foreground"  } )
                          , member.phone
                        )
                        , member.email && (
                          React.createElement('div', { className: "flex items-center gap-1 text-sm text-muted-foreground"    }
                            , React.createElement(Mail, { className: "h-3 w-3" } )
                            , member.email
                          )
                        )
                      )
                    )
                    , React.createElement(TableCell, {}
                      , React.createElement('div', { className: "space-y-1"}
                        , React.createElement('span', { className: "font-medium"}, member.position)
                        , React.createElement(Badge, { className: getDepartmentInfo(member.department).color}
                          , getDepartmentInfo(member.department).label
                        )
                      )
                    )
                    , React.createElement(TableCell, { className: "font-medium"}, "Rs. "
                       , member.salary.toLocaleString()
                    )
                    , React.createElement(TableCell, { className: "text-muted-foreground"}
                      , new Date(member.joinDate).toLocaleDateString()
                    )
                    , React.createElement(TableCell, {}
                      , React.createElement(Badge, {
                        variant: member.status === "active" ? "default" : "secondary",
                        className: 
                          member.status === "active"
                            ? "bg-green-500/10 text-green-600"
                            : member.status === "terminated"
                            ? "bg-red-500/10 text-red-600"
                            : ""
                        }

                        , member.status === "active" ? "Active" : member.status === "terminated" ? "Terminated" : "Inactive"
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
                          , React.createElement(DropdownMenuItem, { onClick: () => handleOpenDialog(member)}
                            , React.createElement(Pencil, { className: "h-4 w-4 mr-2"  } ), "Edit"

                          )
                          , React.createElement(DropdownMenuItem, {
                            onClick: () => handleToggleActive(member)}

                            , member.status === "active" ? "Deactivate" : "Activate"
                          )
                          , React.createElement(DropdownMenuItem, {
                            className: "text-destructive",
                            onClick: () => handleDelete(member._id)}

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
              , editingStaff ? "Edit Staff Member" : "Add New Staff Member"
            )
            , React.createElement(DialogDescription, {}
              , editingStaff
                ? "Update staff member details"
                : "Add a new staff member to your team"
            )
          )
          , React.createElement('div', { className: "space-y-4 py-4" }
            , React.createElement('div', { className: "space-y-2"}
              , React.createElement(Label, { htmlFor: "name"}, "Full Name *"  )
              , React.createElement(Input, {
                id: "name",
                placeholder: "e.g., Ram Prasad"  ,
                value: formData.name,
                onChange: (e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              )
            )

            , React.createElement('div', { className: "grid grid-cols-2 gap-4"  }
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
            )

            , React.createElement('div', { className: "grid grid-cols-2 gap-4"  }
              , React.createElement('div', { className: "space-y-2"}
                , React.createElement(Label, { htmlFor: "position"}, "Position *" )
                , React.createElement(Input, {
                  id: "position",
                  placeholder: "e.g., Head Waiter"  ,
                  value: formData.position,
                  onChange: (e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                )
              )
              , React.createElement('div', { className: "space-y-2"}
                , React.createElement(Label, { htmlFor: "department"}, "Department *" )
                , React.createElement(Select, {
                  value: formData.department,
                  onValueChange: (value) =>
                    setFormData({ ...formData, department: value })
                  }

                  , React.createElement(SelectTrigger, {}
                    , React.createElement(SelectValue, { placeholder: "Select department" } )
                  )
                  , React.createElement(SelectContent, {}
                    , DEPARTMENTS.map((dept) => (
                      React.createElement(SelectItem, { key: dept.value, value: dept.value}
                        , dept.label
                      )
                    ))
                  )
                )
              )
            )

            , React.createElement('div', { className: "space-y-2"}
              , React.createElement(Label, { htmlFor: "salary"}, "Monthly Salary (Rs.) *"   )
              , React.createElement(Input, {
                id: "salary",
                type: "number",
                placeholder: "0",
                value: formData.salary,
                onChange: (e) =>
                  setFormData({ ...formData, salary: e.target.value })
                }
              )
            )

            , React.createElement('div', { className: "space-y-2"}
              , React.createElement(Label, { htmlFor: "joinDate"}, "Join Date" )
              , React.createElement(Input, {
                id: "joinDate",
                type: "date",
                value: formData.joinDate,
                onChange: (e) =>
                  setFormData({ ...formData, joinDate: e.target.value })
                }
              )
            )
          )
          , React.createElement(DialogFooter, {}
            , React.createElement(Button, { variant: "outline", onClick: () => setShowDialog(false)}, "Cancel"

            )
            , React.createElement(Button, { onClick: handleSubmit, disabled: isLoading}
              , isLoading && React.createElement(Loader2, { className: "h-4 w-4 mr-2 animate-spin"   } )
              , editingStaff ? "Update" : "Add Staff"
            )
          )
        )
      )

      , React.createElement(DeleteDialog, {
        open: deleteDialogOpen,
        onOpenChange: setDeleteDialogOpen,
        title: "Delete Staff Member"  ,
        description: "Are you sure you want to delete this staff member? This action cannot be undone."              ,
        onConfirm: confirmDelete}
      )
    )
  );
}
