import React from "react";
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

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
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Calendar,
  Lock,

  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export default function FinancialYearPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);

  // New financial year form
  const [fyName, setFyName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [openingBalance, setOpeningBalance] = useState(0);

  // Fetch financial years from Convex
  const financialYears = useQuery(api.financialYears.list);
  const currentYear = useQuery(api.financialYears.getCurrent);
  
  // Mutations
  const createYear = useMutation(api.financialYears.create);
  const closeYear = useMutation(api.financialYears.close);
  const setAsCurrent = useMutation(api.financialYears.setAsCurrent);

  const isLoading = financialYears === undefined;

  const handleCreateYear = async () => {
    if (!fyName || !startDate || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createYear({
        name: fyName,
        startDate: new Date(startDate).getTime(),
        endDate: new Date(endDate).getTime(),
        setAsCurrent: true,
      });
      toast.success("Financial year created successfully");
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create financial year");
    }
  };

  const handleCloseYear = async () => {
    if (!selectedYear) return;
    
    try {
      await closeYear({ 
        id: selectedYear ,
        carryForwardAccounts: true 
      });
      toast.success("Financial year closed successfully");
      setIsCloseDialogOpen(false);
      setSelectedYear(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to close financial year");
    }
  };

  const handleSetAsCurrent = async (id) => {
    try {
      await setAsCurrent({ id: id  });
      toast.success("Financial year set as current");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to set as current");
    }
  };

  const resetForm = () => {
    setFyName("");
    setStartDate("");
    setEndDate("");
    setOpeningBalance(0);
  };

  const getStatusBadge = (status, isCurrent) => {
    if (isCurrent) {
      return (
        React.createElement(Badge, { className: "bg-green-500/10 text-green-600" }
          , React.createElement(CheckCircle, { className: "h-3 w-3 mr-1"  } ), "Current"

        )
      );
    }
    switch (status) {
      case "active":
        return (
          React.createElement(Badge, { className: "bg-blue-500/10 text-blue-600" }
            , React.createElement(Clock, { className: "h-3 w-3 mr-1"  } ), "Active"

          )
        );
      case "closed":
        return (
          React.createElement(Badge, { className: "bg-gray-500/10 text-gray-600" }
            , React.createElement(Lock, { className: "h-3 w-3 mr-1"  } ), "Closed"

          )
        );
      default:
        return React.createElement(Badge, { variant: "outline"}, status);
    }
  };

  return (
    React.createElement('div', { className: "space-y-6"}
      , React.createElement('div', { className: "flex items-center justify-between"  }
        , React.createElement('div', {}
          , React.createElement('h1', { className: "text-2xl font-bold" }, "Financial Year" )
          , React.createElement('p', { className: "text-muted-foreground"}, "Manage accounting periods and year-end closing"

          )
        )
        , React.createElement(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen}
          , React.createElement(DialogTrigger, { asChild: true}
            , React.createElement(Button, {}
              , React.createElement(Plus, { className: "h-4 w-4 mr-2"  } ), "New Financial Year"

            )
          )
          , React.createElement(DialogContent, {}
            , React.createElement(DialogHeader, {}
              , React.createElement(DialogTitle, {}, "Create New Financial Year"   )
              , React.createElement(DialogDescription, {}, "Set up a new accounting period"

              )
            )

            , React.createElement('div', { className: "space-y-4"}
              , React.createElement('div', { className: "space-y-2"}
                , React.createElement(Label, {}, "Financial Year Name *"   )
                , React.createElement(Input, {
                  value: fyName,
                  onChange: (e) => setFyName(e.target.value),
                  placeholder: "e.g., FY 2025-26"  }
                )
              )

              , React.createElement('div', { className: "grid grid-cols-2 gap-4"  }
                , React.createElement('div', { className: "space-y-2"}
                  , React.createElement(Label, {}, "Start Date *"  )
                  , React.createElement(Input, {
                    type: "date",
                    value: startDate,
                    onChange: (e) => setStartDate(e.target.value)}
                  )
                )
                , React.createElement('div', { className: "space-y-2"}
                  , React.createElement(Label, {}, "End Date *"  )
                  , React.createElement(Input, {
                    type: "date",
                    value: endDate,
                    onChange: (e) => setEndDate(e.target.value)}
                  )
                )
              )

              , React.createElement('div', { className: "space-y-2"}
                , React.createElement(Label, {}, "Opening Balance" )
                , React.createElement(Input, {
                  type: "number",
                  value: openingBalance,
                  onChange: (e) =>
                    setOpeningBalance(parseFloat(e.target.value) || 0)
                  ,
                  placeholder: "0"}
                )
                , React.createElement('p', { className: "text-xs text-muted-foreground" }, "This will be auto-populated from the previous year's closing balance if available."


                )
              )
            )

            , React.createElement(DialogFooter, {}
              , React.createElement(Button, { variant: "outline", onClick: () => setIsDialogOpen(false)}, "Cancel"

              )
              , React.createElement(Button, { onClick: handleCreateYear}, "Create")
            )
          )
        )
      )

      /* Current Financial Year Card */
      , isLoading ? (
        React.createElement(Card, { className: "border-green-500/50 bg-green-500/5" }
          , React.createElement(CardHeader, {}
            , React.createElement(Skeleton, { className: "h-6 w-64" } )
            , React.createElement(Skeleton, { className: "h-4 w-48 mt-2"  } )
          )
          , React.createElement(CardContent, {}
            , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-4"   }
              , [...Array(3)].map((_, i) => (
                React.createElement(Skeleton, { key: i, className: "h-20 w-full" } )
              ))
            )
          )
        )
      ) : currentYear ? (
        React.createElement(Card, { className: "border-green-500/50 bg-green-500/5" }
          , React.createElement(CardHeader, {}
            , React.createElement('div', { className: "flex items-center justify-between"  }
              , React.createElement('div', {}
                , React.createElement(CardTitle, { className: "flex items-center gap-2"  }
                  , React.createElement(Calendar, { className: "h-5 w-5 text-green-600"  } ), "Current Financial Year: "
                     , currentYear.name
                )
                , React.createElement(CardDescription, {}
                  , new Date(currentYear.startDate).toLocaleDateString(), " -" , " "
                  , new Date(currentYear.endDate).toLocaleDateString()
                )
              )
              , React.createElement(Badge, { className: "bg-green-500/20 text-green-700 text-lg px-4 py-2"    }, "Active"

              )
            )
          )
          , React.createElement(CardContent, {}
            , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-4"   }
              , React.createElement('div', { className: "p-4 bg-background rounded-lg border"   }
                , React.createElement('p', { className: "text-sm text-muted-foreground" }, "Opening Balance" )
                , React.createElement('p', { className: "text-xl font-bold" }, "Rs. "
                   , (0).toLocaleString()
                )
              )
              , React.createElement('div', { className: "p-4 bg-background rounded-lg border"   }
                , React.createElement('p', { className: "text-sm text-muted-foreground" }, "Days Remaining" )
                , React.createElement('p', { className: "text-xl font-bold" }
                  , Math.max(0, Math.ceil(
                    (currentYear.endDate - Date.now()) / (1000 * 60 * 60 * 24)
                  )), " ", "days"

                )
              )
              , React.createElement('div', { className: "p-4 bg-background rounded-lg border"   }
                , React.createElement('p', { className: "text-sm text-muted-foreground" }, "Progress")
                , React.createElement('div', { className: "flex items-center gap-2"  }
                  , React.createElement('div', { className: "flex-1 h-2 bg-muted rounded-full overflow-hidden"    }
                    , React.createElement('div', {
                      className: "h-full bg-green-600 rounded-full"  ,
                      style: {
                        width: `${Math.min(
                          100,
                          ((Date.now() - currentYear.startDate) /
                            (currentYear.endDate - currentYear.startDate)) *
                            100
                        )}%`,
                      }}
                    )
                  )
                  , React.createElement('span', { className: "text-sm font-medium" }
                    , Math.round(
                      ((Date.now() - currentYear.startDate) /
                        (currentYear.endDate - currentYear.startDate)) *
                        100
                    ), "%"

                  )
                )
              )
            )
          )
        )
      ) : (
        React.createElement(Card, { className: "border-orange-500/50 bg-orange-500/5" }
          , React.createElement(CardContent, { className: "p-6 text-center" }
            , React.createElement('p', { className: "text-muted-foreground"}, "No current financial year set. Create one to get started."         )
          )
        )
      )

      /* Financial Years List */
      , React.createElement(Card, {}
        , React.createElement(CardHeader, {}
          , React.createElement(CardTitle, {}, "All Financial Years"  )
          , React.createElement(CardDescription, {}, "History of all accounting periods"

          )
        )
        , React.createElement(CardContent, {}
          , isLoading ? (
            React.createElement('div', { className: "space-y-4"}
              , [...Array(3)].map((_, i) => (
                React.createElement(Skeleton, { key: i, className: "h-16 w-full" } )
              ))
            )
          ) : !financialYears || financialYears.length === 0 ? (
            React.createElement('div', { className: "text-center py-8 text-muted-foreground"  }
              , React.createElement(Calendar, { className: "h-12 w-12 mx-auto mb-4 opacity-50"    } )
              , React.createElement('p', {}, "No financial years found. Create one to get started."        )
            )
          ) : (
            React.createElement(Table, {}
              , React.createElement(TableHeader, {}
                , React.createElement(TableRow, {}
                  , React.createElement(TableHead, {}, "Financial Year" )
                  , React.createElement(TableHead, {}, "Period")
                  , React.createElement(TableHead, { className: "text-right"}, "Opening Balance" )
                  , React.createElement(TableHead, { className: "text-right"}, "Closing Balance" )
                  , React.createElement(TableHead, {}, "Status")
                  , React.createElement(TableHead, { className: "text-right"}, "Actions")
                )
              )
              , React.createElement(TableBody, {}
                , financialYears.map((fy) => (
                  React.createElement(TableRow, { key: fy._id}
                    , React.createElement(TableCell, { className: "font-medium"}, fy.name)
                    , React.createElement(TableCell, {}
                      , React.createElement('div', { className: "flex items-center text-sm text-muted-foreground"   }
                        , React.createElement(Calendar, { className: "h-3 w-3 mr-1"  } )
                        , new Date(fy.startDate).toLocaleDateString(), " -" , " "
                        , new Date(fy.endDate).toLocaleDateString()
                      )
                    )
                    , React.createElement(TableCell, { className: "text-right"}, "Rs. "
                       , (0).toLocaleString()
                    )
                    , React.createElement(TableCell, { className: "text-right"}
                      , fy.status === "closed" ? "Rs. 0" : "-"
                    )
                    , React.createElement(TableCell, {}
                      , getStatusBadge(fy.status, fy.isCurrent)
                    )
                    , React.createElement(TableCell, { className: "text-right"}
                      , fy.status === "active" && !fy.isCurrent && (
                        React.createElement(Button, { 
                          variant: "outline", 
                          size: "sm",
                          onClick: () => handleSetAsCurrent(fy._id)}
, "Set as Current"

                        )
                      )
                      , fy.isCurrent && (
                        React.createElement(Dialog, {
                          open: isCloseDialogOpen && selectedYear === fy._id,
                          onOpenChange: (open) => {
                            setIsCloseDialogOpen(open);
                            if (!open) setSelectedYear(null);
                          }}

                          , React.createElement(DialogTrigger, { asChild: true}
                            , React.createElement(Button, {
                              variant: "outline",
                              size: "sm",
                              onClick: () => setSelectedYear(fy._id)}

                              , React.createElement(Lock, { className: "h-3 w-3 mr-1"  } ), "Close Year"

                            )
                          )
                          , React.createElement(DialogContent, {}
                            , React.createElement(DialogHeader, {}
                              , React.createElement(DialogTitle, { className: "flex items-center gap-2"  }
                                , React.createElement(AlertTriangle, { className: "h-5 w-5 text-orange-600"  } ), "Close Financial Year"

                              )
                              , React.createElement(DialogDescription, {}, "Are you sure you want to close "
                                       , fy.name, "?"
                              )
                            )

                            , React.createElement('div', { className: "space-y-4"}
                              , React.createElement('div', { className: "p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg"    }
                                , React.createElement('p', { className: "text-sm text-orange-700 font-medium"  }, "Warning: This action cannot be undone!"

                                )
                                , React.createElement('ul', { className: "text-sm text-orange-600 mt-2 space-y-1 list-disc list-inside"     }
                                  , React.createElement('li', {}, "All transactions will be locked for this period"


                                  )
                                  , React.createElement('li', {}, "Closing entries will be automatically generated"


                                  )
                                  , React.createElement('li', {}, "Opening balance for next year will be calculated"


                                  )
                                )
                              )

                              , React.createElement('div', { className: "p-4 border rounded-lg"  }
                                , React.createElement('p', { className: "text-sm text-muted-foreground" }, "Estimated Closing Balance"

                                )
                                , React.createElement('p', { className: "text-2xl font-bold text-green-600"  }, "Rs. 0"

                                )
                              )
                            )

                            , React.createElement(DialogFooter, {}
                              , React.createElement(Button, {
                                variant: "outline",
                                onClick: () => setIsCloseDialogOpen(false)}
, "Cancel"

                              )
                              , React.createElement(Button, {
                                variant: "destructive",
                                onClick: handleCloseYear}

                                , React.createElement(Lock, { className: "h-4 w-4 mr-2"  } ), "Close Year"

                              )
                            )
                          )
                        )
                      )
                      , fy.status === "closed" && (
                        React.createElement(Button, { variant: "ghost", size: "sm", disabled: true}
                          , React.createElement(Lock, { className: "h-3 w-3 mr-1"  } ), "Closed"

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

      /* Year End Checklist */
      , React.createElement(Card, {}
        , React.createElement(CardHeader, {}
          , React.createElement(CardTitle, {}, "Year-End Closing Checklist"  )
          , React.createElement(CardDescription, {}, "Ensure all tasks are completed before closing the financial year"

          )
        )
        , React.createElement(CardContent, {}
          , React.createElement('div', { className: "space-y-4"}
            , [
              {
                task: "Reconcile all bank accounts",
                completed: true,
              },
              {
                task: "Verify all accounts receivable",
                completed: true,
              },
              {
                task: "Confirm all accounts payable",
                completed: true,
              },
              {
                task: "Complete inventory count and valuation",
                completed: false,
              },
              {
                task: "Process all depreciation entries",
                completed: false,
              },
              {
                task: "Review and adjust accruals",
                completed: false,
              },
              {
                task: "Generate trial balance and verify",
                completed: false,
              },
            ].map((item, index) => (
              React.createElement('div', {
                key: index,
                className: "flex items-center justify-between p-3 border rounded-lg"     }

                , React.createElement('div', { className: "flex items-center gap-3"  }
                  , item.completed ? (
                    React.createElement(CheckCircle, { className: "h-5 w-5 text-green-600"  } )
                  ) : (
                    React.createElement('div', { className: "h-5 w-5 rounded-full border-2 border-muted-foreground"    } )
                  )
                  , React.createElement('span', {
                    className: 
                      item.completed
                        ? "text-muted-foreground line-through"
                        : ""
                    }

                    , item.task
                  )
                )
                , React.createElement(Switch, { checked: item.completed} )
              )
            ))
          )
        )
      )
    )
  );
}
