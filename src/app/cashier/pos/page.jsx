"use client";
import React from "react";
function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRightLeft,
  Package,
  Truck,
  Users,
  DollarSign,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useMutation } from "convex/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
















export default function POSPage() {
  const router = useRouter();
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [transferToTable, setTransferToTable] = useState("");
  const [showWaiterDialog, setShowWaiterDialog] = useState(false);
  const [selectedWaiterTable, setSelectedWaiterTable] = useState(null);
  const [selectedWaiter, setSelectedWaiter] = useState("");

  const rooms = useQuery(api.rooms.getActive);
  const tableSummary = useQuery(api.tables.getSummary);
  const activeOrders = useQuery(api.orders.getActive);
  const staff = useQuery(api.staff.getActive);
  const { data: authSession } = authClient.useSession();
  const activeCashierSession = _optionalChain([authSession, 'optionalAccess', _ => _.user, 'optionalAccess', _2 => _2.id])
    ? useQuery(api.cashierSessions.getActive, { cashierId: authSession.user.id })
    : null;

  const openSessionMutation = useMutation(api.cashierSessions.open);
  const [showOpenSessionDialog, setShowOpenSessionDialog] = useState(false);
  const [openingCash, setOpeningCash] = useState(0);

  // Running tables - tables with active orders
  const runningTables = useMemo(() => {
    if (!rooms) return [];
    return rooms.flatMap((room) =>
      room.tables
        .filter((t) => t.status === "occupied")
        .map((t) => ({
          ...t,
          roomName: room.name,
          orderTotal: _optionalChain([activeOrders, 'optionalAccess', _3 => _3.find, 'call', _4 => _4((o) => o.tableId === t._id), 'optionalAccess', _5 => _5.grandTotal]) || 0,
        }))
    );
  }, [rooms, activeOrders]);

  // Available tables
  const availableTables = useMemo(() => {
    if (!rooms) return [];
    return rooms.flatMap((room) =>
      room.tables
        .filter((t) => t.status === "available")
        .map((t) => ({ ...t, roomName: room.name, roomId: room._id }))
    );
  }, [rooms]);

  // Waiters list (filter staff by position)
  const waiters = useMemo(() => {
    if (!staff) return [];
    return staff.filter((s) => 
      s.position.toLowerCase().includes("waiter") || 
      s.position.toLowerCase().includes("server")
    );
  }, [staff]);

  // Calculate today's summary
  const todaysSummary = useMemo(() => {
    const totalOrders = _optionalChain([activeOrders, 'optionalAccess', _6 => _6.length]) || 0;
    const totalRevenue = runningTables.reduce((sum, t) => sum + (t.orderTotal || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    return { totalOrders, totalRevenue, avgOrderValue };
  }, [activeOrders, runningTables]);

  const handleTableClick = (tableId, status) => {
    if (status === "available") {
      router.push(`/cashier/pos/table/${tableId}?type=new`);
    } else if (status === "occupied") {
      router.push(`/cashier/pos/table/${tableId}?type=existing`);
    }
  };

  const handleTransfer = async () => {
    if (!selectedTable || !transferToTable) {
      toast.error("Please select both tables");
      return;
    }
    toast.success("Table transferred successfully");
    setShowTransferDialog(false);
    setSelectedTable(null);
    setTransferToTable("");
  };

  const handleAssignWaiter = async () => {
    if (!selectedWaiterTable || !selectedWaiter) {
      toast.error("Please select both table and waiter");
      return;
    }
    toast.success("Waiter assigned successfully");
    setShowWaiterDialog(false);
    setSelectedWaiterTable(null);
    setSelectedWaiter("");
  };

  return (
    React.createElement('div', { className: "h-screen flex flex-col bg-background overflow-hidden p-6"     }
      , React.createElement('div', { className: "flex-1 flex gap-6 overflow-hidden"   }
        /* Left Column - Tables */
        , React.createElement('div', { className: "flex-1 flex flex-col gap-6 overflow-hidden"    }
          /* Running Tables Section */
          , React.createElement('section', { className: "bg-card border border-border rounded-2xl p-5 flex-1 overflow-hidden flex flex-col"        }
            , React.createElement('div', { className: "flex items-center gap-2 mb-4"   }
              , React.createElement('h2', { className: "text-lg font-semibold text-foreground"  }, "Running Tables" )
              , React.createElement('span', { className: "text-sm text-muted-foreground" }, "(", runningTables.length, ")")
            )
            , React.createElement('div', { className: "flex-1 overflow-auto" }
              , runningTables.length === 0 ? (
                React.createElement('div', { className: "flex items-center justify-center h-full text-muted-foreground"    }
                  , React.createElement('p', {}, "No active orders"  )
                )
              ) : (
                React.createElement('div', { className: "grid grid-cols-4 gap-3"  }
                  , runningTables.map((table) => (
                    React.createElement('button', {
                      key: table._id,
                      onClick: () => handleTableClick(table._id, "occupied"),
                      className: "bg-secondary/10 border-2 border-secondary rounded-xl p-4 hover:bg-secondary/20 transition-all text-left"       }

                      , React.createElement('p', { className: "text-xl font-bold text-foreground"  }, table.tableNumber)
                      , React.createElement('p', { className: "text-xs text-muted-foreground mt-1"  }, table.roomName)
                      , React.createElement('p', { className: "text-sm font-semibold text-secondary mt-2"   }, "Rs. " , table.orderTotal.toLocaleString())
                    )
                  ))
                )
              )
            )
          )

          /* Available Tables Section */
          , React.createElement('section', { className: "bg-card border border-border rounded-2xl p-5 flex-1 overflow-hidden flex flex-col"        }
            , React.createElement('div', { className: "flex items-center gap-2 mb-4"   }
              , React.createElement('h2', { className: "text-lg font-semibold text-foreground"  }, "Available Tables" )
              , React.createElement('span', { className: "text-sm text-muted-foreground" }, "(", availableTables.length, ")")
            )
            , React.createElement('div', { className: "flex-1 overflow-auto" }
              , availableTables.length === 0 ? (
                React.createElement('div', { className: "flex items-center justify-center h-full text-muted-foreground"    }
                  , React.createElement('p', {}, "No available tables"  )
                )
              ) : (
                React.createElement('div', { className: "grid grid-cols-4 gap-3"  }
                  , availableTables.map((table) => (
                    React.createElement('button', {
                      key: table._id,
                      onClick: () => handleTableClick(table._id, "available"),
                      className: "bg-background border-2 border-border rounded-xl p-4 hover:border-primary hover:bg-primary/5 transition-all text-left"        }

                      , React.createElement('p', { className: "text-xl font-bold text-foreground"  }, table.tableNumber)
                      , React.createElement('p', { className: "text-xs text-muted-foreground mt-1"  }, table.roomName)
                    )
                  ))
                )
              )
            )
          )
        )

        /* Right Column - Summary & Actions */
        , React.createElement('div', { className: "w-80 flex flex-col gap-6"   }
          /* Open Session Button */
          , React.createElement('div', {}
            , activeCashierSession ? (
              React.createElement('div', { className: "text-sm text-muted-foreground" }, "Session Open" )
            ) : (
              React.createElement(Button, {
                variant: "outline",
                className: "w-full justify-center gap-3 h-10"   ,
                onClick: () => setShowOpenSessionDialog(true)}
, "Open Cashier Session"

              )
            )
          )
          /* Today's Summary */
          , React.createElement('section', { className: "bg-card border border-border rounded-2xl p-5"    }
            , React.createElement('h2', { className: "text-lg font-semibold text-foreground mb-4"   }, "Today's Summary" )
            , React.createElement('div', { className: "space-y-4"}
              , React.createElement('div', { className: "flex items-center justify-between"  }
                , React.createElement('div', { className: "flex items-center gap-3"  }
                  , React.createElement('div', { className: "w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center"      }
                    , React.createElement(TrendingUp, { className: "w-5 h-5 text-secondary"  } )
                  )
                  , React.createElement('div', {}
                    , React.createElement('p', { className: "text-sm text-muted-foreground" }, "Total Orders" )
                    , React.createElement('p', { className: "text-xl font-bold text-foreground"  }, todaysSummary.totalOrders)
                  )
                )
              )
              , React.createElement('div', { className: "flex items-center justify-between"  }
                , React.createElement('div', { className: "flex items-center gap-3"  }
                  , React.createElement('div', { className: "w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center"      }
                    , React.createElement(DollarSign, { className: "w-5 h-5 text-accent"  } )
                  )
                  , React.createElement('div', {}
                    , React.createElement('p', { className: "text-sm text-muted-foreground" }, "Revenue")
                    , React.createElement('p', { className: "text-xl font-bold text-foreground"  }, "Rs. " , todaysSummary.totalRevenue.toLocaleString())
                  )
                )
              )
              , React.createElement('div', { className: "flex items-center justify-between"  }
                , React.createElement('div', { className: "flex items-center gap-3"  }
                  , React.createElement('div', { className: "w-10 h-10 rounded-full bg-copper/10 flex items-center justify-center"      }
                    , React.createElement(Users, { className: "w-5 h-5 text-copper"  } )
                  )
                  , React.createElement('div', {}
                    , React.createElement('p', { className: "text-sm text-muted-foreground" }, "Active Tables" )
                    , React.createElement('p', { className: "text-xl font-bold text-foreground"  }, runningTables.length)
                  )
                )
              )
            )
          )

          /* Open Session Dialog */
          , React.createElement(Dialog, { open: showOpenSessionDialog, onOpenChange: setShowOpenSessionDialog}
            , React.createElement(DialogContent, {}
              , React.createElement(DialogHeader, {}
                , React.createElement(DialogTitle, {}, "Open Cashier Session"  )
                , React.createElement(DialogDescription, {}, "Enter opening cash to start a cashier session."       )
              )
              , React.createElement('div', { className: "py-4"}
                , React.createElement(Label, {}, "Opening Cash" )
                , React.createElement(Input, {
                  type: "number",
                  value: openingCash,
                  onChange: (e) => setOpeningCash(Number(e.target.value)),
                  className: "mt-2"}
                )
              )
              , React.createElement(DialogFooter, {}
                , React.createElement(Button, { variant: "outline", onClick: () => setShowOpenSessionDialog(false)}, "Cancel")
                , React.createElement(Button, {
                  onClick: async () => {
                    if (!authSession || !authSession.user) {
                      toast.error("Not signed in");
                      return;
                    }
                    try {
                      await openSessionMutation({ cashierId: authSession.user.id, openingCash: openingCash || 0 });
                      toast.success("Session opened");
                      setShowOpenSessionDialog(false);
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Failed to open session");
                    }
                  }}
, "Open"

                )
              )
            )
          )

          /* Table Swap & Waiter Assignment */
          , React.createElement('section', { className: "bg-card border border-border rounded-2xl p-5"    }
            , React.createElement('h2', { className: "text-lg font-semibold text-foreground mb-4"   }, "Table Swap & Waiter Assignment"    )
            , React.createElement('div', { className: "space-y-3"}
              , React.createElement(Button, { 
                variant: "outline", 
                className: "w-full justify-start gap-3 h-12"   ,
                onClick: () => setShowTransferDialog(true)}

                , React.createElement(ArrowRightLeft, { className: "w-5 h-5 text-secondary"  } )
                , React.createElement('span', {}, "Transfer Table" )
              )
              , React.createElement(Button, { 
                variant: "outline", 
                className: "w-full justify-start gap-3 h-12"   ,
                onClick: () => setShowWaiterDialog(true)}

                , React.createElement(UserCheck, { className: "w-5 h-5 text-accent"  } )
                , React.createElement('span', {}, "Assign Waiter" )
              )
            )
          )

          /* Home Delivery / Take Away */
          , React.createElement('section', { className: "bg-card border border-border rounded-2xl p-5 flex-1 overflow-hidden flex flex-col"        }
            , React.createElement(Tabs, { defaultValue: "delivery", className: "flex-1 flex flex-col"  }
              , React.createElement(TabsList, { className: "grid w-full grid-cols-2 mb-4"   }
                , React.createElement(TabsTrigger, { value: "delivery"}, "Home Delivery" )
                , React.createElement(TabsTrigger, { value: "takeaway"}, "Take Away" )
              )
              , React.createElement(TabsContent, { value: "delivery", className: "flex-1 overflow-auto m-0"  }
                , React.createElement('div', { className: "space-y-3"}
                  , React.createElement(Button, {
                    variant: "outline",
                    className: "w-full h-16 justify-start gap-3"   ,
                    onClick: () => router.push("/cashier/pos/table/delivery?type=new")}

                    , React.createElement(Truck, { className: "w-6 h-6 text-copper"  } )
                    , React.createElement('div', { className: "text-left"}
                      , React.createElement('p', { className: "font-semibold"}, "New Delivery" )
                      , React.createElement('p', { className: "text-xs text-muted-foreground" }, "Create new delivery order"   )
                    )
                  )
                )
              )
              , React.createElement(TabsContent, { value: "takeaway", className: "flex-1 overflow-auto m-0"  }
                , React.createElement('div', { className: "space-y-3"}
                  , React.createElement(Button, {
                    variant: "outline",
                    className: "w-full h-16 justify-start gap-3"   ,
                    onClick: () => router.push("/cashier/pos/table/takeaway?type=new")}

                    , React.createElement(Package, { className: "w-6 h-6 text-accent"  } )
                    , React.createElement('div', { className: "text-left"}
                      , React.createElement('p', { className: "font-semibold"}, "New Takeaway" )
                      , React.createElement('p', { className: "text-xs text-muted-foreground" }, "Create new takeaway order"   )
                    )
                  )
                )
              )
            )
          )
        )
      )

      /* Transfer Table Dialog */
      , React.createElement(Dialog, { open: showTransferDialog, onOpenChange: setShowTransferDialog}
        , React.createElement(DialogContent, {}
          , React.createElement(DialogHeader, {}
            , React.createElement(DialogTitle, {}, "Transfer Table" )
            , React.createElement(DialogDescription, {}, "Move an order from one table to another."

            )
          )
          , React.createElement('div', { className: "space-y-4 py-4" }
            , React.createElement('div', { className: "space-y-2"}
              , React.createElement(Label, {}, "From Table" )
              , React.createElement(Select, { value: selectedTable || "", onValueChange: setSelectedTable}
                , React.createElement(SelectTrigger, {}
                  , React.createElement(SelectValue, { placeholder: "Select occupied table"  } )
                )
                , React.createElement(SelectContent, {}
                  , runningTables.map((table) => (
                    React.createElement(SelectItem, { key: table._id, value: table._id}
                      , table.roomName, " - "  , table.tableNumber
                    )
                  ))
                )
              )
            )
            , React.createElement('div', { className: "flex justify-center" }
              , React.createElement(ArrowRightLeft, { className: "w-5 h-5 text-muted-foreground"  } )
            )
            , React.createElement('div', { className: "space-y-2"}
              , React.createElement(Label, {}, "To Table" )
              , React.createElement(Select, { value: transferToTable, onValueChange: setTransferToTable}
                , React.createElement(SelectTrigger, {}
                  , React.createElement(SelectValue, { placeholder: "Select available table"  } )
                )
                , React.createElement(SelectContent, {}
                  , availableTables.map((table) => (
                    React.createElement(SelectItem, { key: table._id, value: table._id}
                      , table.roomName, " - "  , table.tableNumber
                    )
                  ))
                )
              )
            )
          )
          , React.createElement(DialogFooter, {}
            , React.createElement(Button, { variant: "outline", onClick: () => setShowTransferDialog(false)}, "Cancel"

            )
            , React.createElement(Button, { 
              onClick: handleTransfer, 
              className: "bg-secondary hover:bg-secondary/90 text-secondary-foreground"  ,
              disabled: !selectedTable || !transferToTable}
, "Transfer"

            )
          )
        )
      )

      /* Assign Waiter Dialog */
      , React.createElement(Dialog, { open: showWaiterDialog, onOpenChange: setShowWaiterDialog}
        , React.createElement(DialogContent, {}
          , React.createElement(DialogHeader, {}
            , React.createElement(DialogTitle, {}, "Assign Waiter" )
            , React.createElement(DialogDescription, {}, "Assign a waiter to a table."

            )
          )
          , React.createElement('div', { className: "space-y-4 py-4" }
            , React.createElement('div', { className: "space-y-2"}
              , React.createElement(Label, {}, "Select Table" )
              , React.createElement(Select, { value: selectedWaiterTable || "", onValueChange: setSelectedWaiterTable}
                , React.createElement(SelectTrigger, {}
                  , React.createElement(SelectValue, { placeholder: "Select table" } )
                )
                , React.createElement(SelectContent, {}
                  , runningTables.map((table) => (
                    React.createElement(SelectItem, { key: table._id, value: table._id}
                      , table.roomName, " - "  , table.tableNumber
                    )
                  ))
                )
              )
            )
            , React.createElement('div', { className: "space-y-2"}
              , React.createElement(Label, {}, "Select Waiter" )
              , React.createElement(Select, { value: selectedWaiter, onValueChange: setSelectedWaiter}
                , React.createElement(SelectTrigger, {}
                  , React.createElement(SelectValue, { placeholder: "Select waiter" } )
                )
                , React.createElement(SelectContent, {}
                  , waiters.length === 0 ? (
                    React.createElement(SelectItem, { value: "none", disabled: true}, "No waiters available"  )
                  ) : (
                    waiters.map((waiter) => (
                      React.createElement(SelectItem, { key: waiter._id, value: waiter._id}
                        , waiter.name
                      )
                    ))
                  )
                )
              )
            )
          )
          , React.createElement(DialogFooter, {}
            , React.createElement(Button, { variant: "outline", onClick: () => setShowWaiterDialog(false)}, "Cancel"

            )
            , React.createElement(Button, { 
              onClick: handleAssignWaiter, 
              className: "bg-secondary hover:bg-secondary/90 text-secondary-foreground"  ,
              disabled: !selectedWaiterTable || !selectedWaiter}
, "Assign"

            )
          )
        )
      )
    )
  );
}
