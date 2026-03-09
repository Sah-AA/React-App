"use client";
import React from "react";
function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

import { useState, use, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Plus,
  Minus,
  Printer,
  Search,
  User,
  Phone,
  MapPin,
  MessageSquare,
  Check,
  CreditCard,
  ChefHat,
  ShoppingBag,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";























function TableOrderContent({ tableId }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderType = searchParams.get("type") || "new";
  
  const isSpecialOrder = tableId === "takeaway" || tableId === "delivery";
  const isExistingOrder = orderType === "existing";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [orderItems, setOrderItems] = useState([]);
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    phone: "",
    address: "",
    remarks: "",
  });
  const [discountPercent, setDiscountPercent] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashReceived, setCashReceived] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Queries
  const menuData = useQuery(api.menu.getForPOS);
  const table = !isSpecialOrder ? useQuery(api.tables.getById, { id: tableId  }) : null;
  const existingOrder = !isSpecialOrder && isExistingOrder 
    ? useQuery(api.orders.getActiveOrderWithItems, { tableId: tableId  }) 
    : null;

  // Auth + cashier session
  const { data: authSession } = authClient.useSession();
  const activeCashierSession = _optionalChain([authSession, 'optionalAccess', _ => _.user, 'optionalAccess', _2 => _2.id])
    ? useQuery(api.cashierSessions.getActive, { cashierId: authSession.user.id })
    : null;

  // Mutations
  const createOrder = useMutation(api.orders.create);
  const addOrderItem = useMutation(api.orders.addItem);
  const completePayment = useMutation(api.orders.completePayment);

  // Load existing order items when viewing a running table
  useEffect(() => {
    if (_optionalChain([existingOrder, 'optionalAccess', _3 => _3.items]) && existingOrder.items.length > 0) {
      const items = existingOrder.items.map((item) => ({
        _id: item._id,
        menuItemId: item.menuItemId,
        menuItemName: item.menuItemName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        notes: item.notes,
      }));
      setOrderItems(items);
      
      // Load customer details
      if (existingOrder.customerName) {
        setCustomerDetails({
          name: existingOrder.customerName || "",
          phone: existingOrder.customerPhone || "",
          address: existingOrder.customerAddress || "",
          remarks: existingOrder.remarks || "",
        });
      }
    }
  }, [existingOrder]);

  // Calculations
  const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const discountAmount = discountPercent ? (subtotal * parseFloat(discountPercent)) / 100 : 0;
  const total = subtotal - discountAmount;
  const cashReceivedNum = parseFloat(cashReceived) || 0;
  const changeAmount = cashReceivedNum > total ? cashReceivedNum - total : 0;

  const handleAddItem = (menuItem) => {
    const existingIndex = orderItems.findIndex((item) => item.menuItemId === menuItem._id);

    if (existingIndex >= 0) {
      const updated = [...orderItems];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].totalPrice = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      setOrderItems(updated);
    } else {
      setOrderItems([
        ...orderItems,
        {
          menuItemId: menuItem._id,
          menuItemName: menuItem.name,
          quantity: 1,
          unitPrice: menuItem.price,
          totalPrice: menuItem.price,
        },
      ]);
    }
    toast.success(`Added ${menuItem.name}`);
  };

  const handleUpdateQuantity = (index, delta) => {
    const updated = [...orderItems];
    updated[index].quantity += delta;

    if (updated[index].quantity <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index].totalPrice = updated[index].quantity * updated[index].unitPrice;
    }
    setOrderItems(updated);
  };

  const handleRemoveItem = (index) => {
    const updated = [...orderItems];
    updated.splice(index, 1);
    setOrderItems(updated);
  };

  const handlePrintBill = async () => {
    if (orderItems.length === 0) {
      toast.error("No items to print");
      return;
    }
    toast.success("Bill sent to printer");
  };

  const handleCreateOrder = async () => {
    if (orderItems.length === 0) {
      toast.error("No items in order");
      return;
    }

    // Require an open cashier session
    if (!authSession || !authSession.user || !activeCashierSession) {
      toast.error("No open cashier session. Please open a session before creating orders.");
      return;
    }

    setIsLoading(true);
    try {
      // Create the order - this will mark the table as occupied
      const orderId = await createOrder({
        orderType: isSpecialOrder ? (tableId === "takeaway" ? "takeaway" : "delivery") : "dine_in",
        tableId: isSpecialOrder ? undefined : tableId ,
        cashierId: authSession.user.id,
        sessionId: activeCashierSession._id ,
        customerName: customerDetails.name || undefined,
        customerPhone: customerDetails.phone || undefined,
        customerAddress: customerDetails.address || undefined,
        remarks: customerDetails.remarks || undefined,
      });

      // Add all items to the order
      for (const item of orderItems) {
        await addOrderItem({
          orderId,
          menuItemId: item.menuItemId ,
          quantity: item.quantity,
          notes: item.notes,
        });
      }

      toast.success("Order created successfully!");
      router.push("/cashier/pos");
    } catch (error) {
      toast.error("Failed to create order");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOrder = async () => {
    if (orderItems.length === 0) {
      toast.error("No items in order");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement order update logic
      toast.success("Order updated successfully!");
      router.push("/cashier/pos");
    } catch (e2) {
      toast.error("Failed to update order");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (orderItems.length === 0) {
      toast.error("No items in order");
      return;
    }
    if (paymentMethod === "cash" && cashReceivedNum < total) {
      toast.error("Insufficient cash received");
      return;
    }

    setIsLoading(true);
    try {
      if (_optionalChain([existingOrder, 'optionalAccess', _4 => _4._id])) {
        await completePayment({
          orderId: existingOrder._id,
          paymentMethod,
          amountPaid: paymentMethod === "cash" ? cashReceivedNum : total,
        });
      }
      toast.success("Payment completed successfully!");
      router.push("/cashier/pos");
    } catch (e3) {
      toast.error("Failed to process payment");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMenuData = _optionalChain([menuData
, 'optionalAccess', _5 => _5.map, 'call', _6 => _6((cat) => ({
      ...cat,
      items: cat.items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
, 'access', _7 => _7.filter, 'call', _8 => _8((cat) => 
      (selectedCategory === "all" || cat.category._id === selectedCategory) && cat.items.length > 0
    )]);

  const allMenuItems = _optionalChain([filteredMenuData, 'optionalAccess', _9 => _9.flatMap, 'call', _10 => _10((cat) => cat.items)]) || [];

  return (
    React.createElement('div', { className: "h-full flex bg-background overflow-hidden p-4 gap-4"     }
        /* Left Card - Customer Info, Order Items, Subtotal */
        , React.createElement('div', { className: "w-1/2 bg-card border border-border rounded-2xl flex flex-col overflow-hidden min-h-0"        }
          /* Customer Info */
          , React.createElement('div', { className: "p-4 border-b border-border"  }
            , React.createElement('h3', { className: "text-sm font-semibold text-foreground mb-3"   }, "Customer Info" )
            , React.createElement('div', { className: "grid grid-cols-2 gap-2"  }
              , React.createElement('div', { className: "flex items-center gap-2"  }
                , React.createElement(User, { className: "w-4 h-4 text-muted-foreground shrink-0"   } )
                , React.createElement(Input, {
                  placeholder: "Name",
                  value: customerDetails.name,
                  onChange: (e) => setCustomerDetails({ ...customerDetails, name: e.target.value }),
                  className: "h-8 text-sm" }
                )
              )
              , React.createElement('div', { className: "flex items-center gap-2"  }
                , React.createElement(Phone, { className: "w-4 h-4 text-muted-foreground shrink-0"   } )
                , React.createElement(Input, {
                  placeholder: "Phone",
                  value: customerDetails.phone,
                  onChange: (e) => setCustomerDetails({ ...customerDetails, phone: e.target.value }),
                  className: "h-8 text-sm" }
                )
              )
              , (isSpecialOrder && tableId === "delivery") && (
                React.createElement('div', { className: "flex items-center gap-2 col-span-2"   }
                  , React.createElement(MapPin, { className: "w-4 h-4 text-muted-foreground shrink-0"   } )
                  , React.createElement(Input, {
                    placeholder: "Delivery address" ,
                    value: customerDetails.address,
                    onChange: (e) => setCustomerDetails({ ...customerDetails, address: e.target.value }),
                    className: "h-8 text-sm" }
                  )
                )
              )
              , React.createElement('div', { className: "flex items-center gap-2 col-span-2"   }
                , React.createElement(MessageSquare, { className: "w-4 h-4 text-muted-foreground shrink-0"   } )
                , React.createElement(Input, {
                  placeholder: "Remarks",
                  value: customerDetails.remarks,
                  onChange: (e) => setCustomerDetails({ ...customerDetails, remarks: e.target.value }),
                  className: "h-8 text-sm" }
                )
              )
            )
          )

          /* Order Items Table */
          , React.createElement('div', { className: "flex-1 overflow-hidden flex flex-col min-h-0"    }
            /* Table Header */
            , React.createElement('div', { className: "bg-[#8B4513] text-white text-xs font-semibold grid grid-cols-[1fr_120px_60px_80px_80px] px-3 py-2 shrink-0"        }
              , React.createElement('span', {}, "Item Name" )
              , React.createElement('span', { className: "text-center"}, "Prev Qty | Qty | +Qty"     )
              , React.createElement('span', { className: "text-right"}, "Rate")
              , React.createElement('span', { className: "text-right"}, "Amount")
              , React.createElement('span', { className: "text-center"}, "Action")
            )

            , React.createElement('div', { className: "flex-1 overflow-y-auto scrollbar-hide"  }
              , orderItems.length === 0 ? (
                React.createElement('div', { className: "flex flex-col items-center justify-center py-8 text-muted-foreground"     }
                  , React.createElement(ChefHat, { className: "w-10 h-10 mb-2 opacity-30"   } )
                  , React.createElement('p', { className: "text-sm font-medium" }, "No items yet"  )
                  , React.createElement('p', { className: "text-xs"}, "Select from menu →"   )
                )
              ) : (
                React.createElement('div', {}
                  , orderItems.map((item, index) => (
                    React.createElement('div', { 
                      key: index, 
                      className: cn(
                        "grid grid-cols-[1fr_120px_60px_80px_80px] items-center px-3 py-2 text-sm border-b border-border",
                        index % 2 === 0 ? "bg-muted/20" : "bg-background"
                      )}

                      /* Item Name */
                      , React.createElement('span', { className: "font-medium text-foreground truncate pr-2"   }, item.menuItemName)

                      /* Qty Controls: Prev | Qty | Plus */
                      , React.createElement('div', { className: "flex items-center justify-center gap-1"   }
                        , React.createElement('span', { className: "w-6 text-center text-muted-foreground text-xs"   }, isExistingOrder ? item.quantity : "-")
                        , React.createElement('button', {
                          onClick: () => handleUpdateQuantity(index, -1),
                          className: "w-5 h-5 rounded bg-copper text-white hover:bg-copper-dark transition-colors flex items-center justify-center"         }

                          , React.createElement(Minus, { className: "w-3 h-3" } )
                        )
                        , React.createElement('span', { className: "w-6 text-center font-semibold"  }, item.quantity)
                        , React.createElement('button', {
                          onClick: () => handleUpdateQuantity(index, 1),
                          className: "w-5 h-5 rounded bg-secondary text-white hover:bg-secondary/80 transition-colors flex items-center justify-center"         }

                          , React.createElement(Plus, { className: "w-3 h-3" } )
                        )
                        , React.createElement('span', { className: "w-6 text-center text-muted-foreground text-xs"   }, "0")
                      )

                      /* Rate */
                      , React.createElement('span', { className: "text-right"}, item.unitPrice)

                      /* Amount */
                      , React.createElement('span', { className: "text-right font-medium" }, item.totalPrice)

                      /* Actions */
                      , React.createElement('div', { className: "flex items-center justify-center gap-1"   }
                        , React.createElement('button', { className: "w-5 h-5 rounded text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"        }
                          , React.createElement('svg', { className: "w-3.5 h-3.5" , fill: "none", viewBox: "0 0 24 24"   , stroke: "currentColor"}, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"        } ))
                        )
                        , React.createElement('button', {
                          onClick: () => handleRemoveItem(index),
                          className: "w-5 h-5 rounded text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center"        }

                          , React.createElement('svg', { className: "w-3.5 h-3.5" , fill: "none", viewBox: "0 0 24 24"   , stroke: "currentColor"}, React.createElement('circle', { cx: "12", cy: "12", r: "10", strokeWidth: 2} ), React.createElement('path', { strokeLinecap: "round", strokeWidth: 2, d: "M15 9l-6 6M9 9l6 6"    } ))
                        )
                        , React.createElement('button', { className: "w-5 h-5 rounded text-green-600 hover:bg-green-50 transition-colors flex items-center justify-center"        }
                          , React.createElement(Check, { className: "w-3.5 h-3.5" } )
                        )
                      )
                    )
                  ))
                )
              )
            )
          )

          /* Summary & Payment Section */
          , React.createElement('div', { className: "border-t-2 border-primary" }
            /* Info Notice */
            , isExistingOrder && (
              React.createElement('div', { className: "bg-amber-50 border-b border-amber-200 px-3 py-1.5 text-xs text-amber-700"      }, "⚠ No need to update the order until you add a new item."

              )
            )

            /* Summary Row */
            , React.createElement('div', { className: "grid grid-cols-5 gap-3 px-3 py-2 bg-muted/30 text-xs border-b border-border"        }
              , React.createElement('div', {}
                , React.createElement('span', { className: "text-primary font-semibold" }, "Total Qty:" )
                , React.createElement('span', { className: "ml-1 font-bold" }, orderItems.reduce((s, i) => s + i.quantity, 0))
              )
              , React.createElement('div', {}
                , React.createElement('span', { className: "font-semibold"}, "Gross Amount" )
                , React.createElement('div', { className: "text-primary font-bold" }, "Rs. " , subtotal.toLocaleString())
              )
              , React.createElement('div', {}
                , React.createElement('span', { className: "font-semibold"}, "Disc. Type" )
                , React.createElement('select', { className: "w-full h-6 text-xs border border-border rounded mt-0.5 bg-background"       }
                  , React.createElement('option', {}, "%")
                  , React.createElement('option', {}, "Flat")
                )
              )
              , React.createElement('div', {}
                , React.createElement('span', { className: "font-semibold"}, "Discount")
                , React.createElement(Input, {
                  type: "number",
                  placeholder: "0",
                  value: discountPercent,
                  onChange: (e) => setDiscountPercent(e.target.value),
                  className: "h-6 text-xs mt-0.5"  }
                )
              )
              , React.createElement('div', {}
                , React.createElement('span', { className: "font-semibold"}, "Net Amount" )
                , React.createElement('div', { className: "text-primary font-bold" }, "Rs. " , total.toLocaleString())
              )
            )

            /* Payment Row */
            , React.createElement('div', { className: "grid grid-cols-5 gap-3 px-3 py-2 bg-muted/20 text-xs border-b border-border"        }
              , React.createElement('div', {}
                , React.createElement('span', { className: "font-semibold"}, "Payment Method" )
                , React.createElement('select', { 
                  value: paymentMethod,
                  onChange: (e) => setPaymentMethod(e.target.value ),
                  className: "w-full h-6 text-xs border border-border rounded mt-0.5 bg-background"       }

                  , React.createElement('option', { value: "cash"}, "Cash")
                  , React.createElement('option', { value: "card"}, "Card")
                  , React.createElement('option', { value: "qr"}, "Fonepay")
                )
              )
              , React.createElement('div', {}
                , React.createElement('span', { className: "font-semibold text-muted-foreground" }, "Fonepay Amt" )
                , React.createElement(Input, {
                  disabled: paymentMethod !== "qr",
                  placeholder: "Fonepay",
                  className: "h-6 text-xs mt-0.5 disabled:bg-muted"   }
                )
              )
              , React.createElement('div', {}
                , React.createElement('span', { className: "font-semibold text-muted-foreground" }, "Cash Amount" )
                , React.createElement(Input, {
                  type: "number",
                  value: cashReceived,
                  onChange: (e) => setCashReceived(e.target.value),
                  placeholder: "Cash",
                  disabled: paymentMethod !== "cash",
                  className: "h-6 text-xs mt-0.5 disabled:bg-muted"   }
                )
              )
              , React.createElement('div', {}
                , React.createElement('span', { className: "font-semibold text-primary" }, "Total Paid" )
                , React.createElement('div', { className: "text-primary font-bold" }, "Rs. " , paymentMethod === "cash" ? (parseFloat(cashReceived) || 0) : total)
              )
              , React.createElement('div', {}
                , React.createElement('span', { className: "font-semibold text-primary" }, "Return Amount" )
                , React.createElement('div', { className: "text-primary font-bold" }, "Rs. " , changeAmount)
              )
            )

            /* Action Buttons */
            , React.createElement('div', { className: "grid grid-cols-4 gap-2 p-2"   }
              , React.createElement(Button, { 
                variant: "default", 
                size: "sm", 
                className: "bg-blue-500 hover:bg-blue-600 text-white h-9"   ,
                onClick: () => router.push("/cashier/pos")}

                , React.createElement(ArrowLeft, { className: "w-4 h-4 mr-1"  } ), " Back"
              )
              , React.createElement(Button, { 
                variant: "default", 
                size: "sm", 
                className: "bg-cyan-500 hover:bg-cyan-600 text-white h-9"   ,
                onClick: handlePrintBill, 
                disabled: orderItems.length === 0}

                , React.createElement(Printer, { className: "w-4 h-4 mr-1"  } ), " Print Bill"
              )
              , isExistingOrder ? (
                React.createElement(React.Fragment, null
                  , React.createElement(Button, { 
                    variant: "default", 
                    size: "sm", 
                    className: "bg-green-500 hover:bg-green-600 text-white h-9"   ,
                    onClick: handlePayNow, 
                    disabled: isLoading || orderItems.length === 0}

                    , isLoading ? React.createElement(Loader2, { className: "w-4 h-4 animate-spin mr-1"   } ) : React.createElement(CreditCard, { className: "w-4 h-4 mr-1"  } ), "Paid"

                  )
                  , React.createElement(Button, { 
                    variant: "default", 
                    size: "sm", 
                    className: "bg-orange-500 hover:bg-orange-600 text-white h-9"   ,
                    onClick: handleUpdateOrder, 
                    disabled: isLoading}

                    , isLoading ? React.createElement(Loader2, { className: "w-4 h-4 animate-spin mr-1"   } ) : React.createElement(RefreshCw, { className: "w-4 h-4 mr-1"  } ), "Update Order"

                  )
                )
              ) : (
                React.createElement(Button, { 
                  variant: "default", 
                  size: "sm", 
                  className: "bg-secondary hover:bg-secondary/90 text-white h-9 col-span-2"    ,
                  onClick: handleCreateOrder, 
                  disabled: isLoading || orderItems.length === 0}

                  , isLoading ? React.createElement(Loader2, { className: "w-4 h-4 animate-spin mr-1"   } ) : React.createElement(ShoppingBag, { className: "w-4 h-4 mr-1"  } ), "Create Order"

                )
              )
            )
          )
        )

        /* Right Card - Menu Items */
        , React.createElement('div', { className: "w-1/2 bg-card border border-border rounded-2xl flex flex-col overflow-hidden min-h-0"        }
          /* Search & Categories */
          , React.createElement('div', { className: "p-3 border-b border-border"  }
            , React.createElement('div', { className: "relative mb-2" }
              , React.createElement(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"      } )
              , React.createElement(Input, {
                placeholder: "Search menu..." ,
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value),
                className: "pl-9 h-8 text-sm"  }
              )
            )
            , React.createElement('div', { className: "flex gap-1 overflow-x-auto pb-1"   }
              , React.createElement('button', {
                onClick: () => setSelectedCategory("all"),
                className: cn(
                  "px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition-all",
                  selectedCategory === "all" ? "bg-secondary text-secondary-foreground" : "bg-muted hover:bg-muted/80"
                )}
, "All"

              )
              , _optionalChain([menuData, 'optionalAccess', _11 => _11.map, 'call', _12 => _12((cat) => (
                React.createElement('button', {
                  key: cat.category._id,
                  onClick: () => setSelectedCategory(cat.category._id),
                  className: cn(
                    "px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition-all",
                    selectedCategory === cat.category._id ? "bg-secondary text-secondary-foreground" : "bg-muted hover:bg-muted/80"
                  )}

                  , cat.category.name
                )
              ))])
            )
          )

          /* Menu Grid - 4 columns */
          , React.createElement('div', { className: "flex-1 overflow-y-auto scrollbar-hide p-3"   }
            , allMenuItems.length > 0 ? (
              React.createElement('div', { className: "grid grid-cols-4 gap-2"  }
                , allMenuItems.map((item) => (
                  React.createElement('button', {
                    key: item._id,
                    onClick: () => handleAddItem(item),
                    className: "group bg-background rounded-lg p-2 text-left hover:scale-[1.02] shadow-sm hover:shadow transition-all border border-border hover:border-accent"           }

                    , React.createElement('div', { className: "aspect-[4/3] rounded bg-muted mb-2 flex items-center justify-center overflow-hidden"       }
                      , item.image ? (
                        React.createElement('img', { src: item.image, alt: item.name, className: "w-full h-full object-cover"  } )
                      ) : (
                        React.createElement('span', { className: "text-2xl opacity-40" }, "🍽️")
                      )
                    )
                    , React.createElement('p', { className: "font-medium text-xs text-foreground line-clamp-1"   }, item.name)
                    , React.createElement('p', { className: "text-sm font-bold text-copper"  }, "Rs. " , item.price)
                  )
                ))
              )
            ) : (
              React.createElement('div', { className: "flex flex-col items-center justify-center py-12 text-muted-foreground"     }
                , React.createElement(Search, { className: "w-8 h-8 mb-2 opacity-30"   } )
                , React.createElement('p', { className: "text-sm"}, "No items found"  )
              )
            )
          )
        )
    )
  );
}

export default function TableOrderPage({ params }) {
  const { tableId } = use(params);
  
  return (
    React.createElement(Suspense, { fallback: 
      React.createElement('div', { className: "h-screen flex items-center justify-center bg-background"    }
        , React.createElement(Loader2, { className: "w-8 h-8 animate-spin text-muted-foreground"   } )
      )
    }
      , React.createElement(TableOrderContent, { tableId: tableId} )
    )
  );
}
