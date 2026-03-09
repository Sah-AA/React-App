import React from "react";
"use client";

import { useState } from "react";

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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {

  Building,
  Receipt,
  Percent,

  DollarSign,
  Loader2,
  Save,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);

  // Restaurant Settings
  const [restaurantSettings, setRestaurantSettings] = useState({
    name: "My Restaurant",
    address: "Kathmandu, Nepal",
    phone: "01-4123456",
    email: "info@restaurant.com",
    panNumber: "123456789",
    logo: "",
  });

  // Tax Settings
  const [taxSettings, setTaxSettings] = useState({
    vatEnabled: true,
    vatRate: "13",
    serviceChargeEnabled: true,
    serviceChargeRate: "10",
    includeTaxInPrice: false,
  });

  // Receipt Settings
  const [receiptSettings, setReceiptSettings] = useState({
    showLogo: true,
    showAddress: true,
    showPhone: true,
    showPan: true,
    footerText: "Thank you for dining with us!",
    paperWidth: "80",
  });

  // Currency Settings
  const [currencySettings, setCurrencySettings] = useState({
    currency: "NPR",
    currencySymbol: "Rs.",
    decimalPlaces: "2",
    thousandSeparator: ",",
  });

  // Financial Year
  const [financialYear, setFinancialYear] = useState({
    startMonth: "7",
    currentYear: "2081/82",
    isClosed: false,
  });

  const handleSaveSettings = async (section) => {
    setIsLoading(true);
    try {
      // This will call Convex mutation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(`${section} settings saved successfully`);
    } catch (error) {
      toast.error(`Failed to save ${section} settings`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    React.createElement('div', { className: "space-y-6"}
      , React.createElement('div', {}
        , React.createElement('h1', { className: "text-2xl font-bold" }, "Settings")
        , React.createElement('p', { className: "text-muted-foreground"}, "Configure your restaurant system settings"

        )
      )

      , React.createElement(Tabs, { defaultValue: "restaurant", className: "space-y-4"}
        , React.createElement(TabsList, { className: "grid w-full grid-cols-5"  }
          , React.createElement(TabsTrigger, { value: "restaurant", className: "flex items-center gap-2"  }
            , React.createElement(Building, { className: "h-4 w-4" } ), "Restaurant"

          )
          , React.createElement(TabsTrigger, { value: "tax", className: "flex items-center gap-2"  }
            , React.createElement(Percent, { className: "h-4 w-4" } ), "Tax"

          )
          , React.createElement(TabsTrigger, { value: "receipt", className: "flex items-center gap-2"  }
            , React.createElement(Receipt, { className: "h-4 w-4" } ), "Receipt"

          )
          , React.createElement(TabsTrigger, { value: "currency", className: "flex items-center gap-2"  }
            , React.createElement(DollarSign, { className: "h-4 w-4" } ), "Currency"

          )
          , React.createElement(TabsTrigger, { value: "financial", className: "flex items-center gap-2"  }
            , React.createElement(Calendar, { className: "h-4 w-4" } ), "Financial Year"

          )
        )

        /* Restaurant Settings */
        , React.createElement(TabsContent, { value: "restaurant"}
          , React.createElement(Card, {}
            , React.createElement(CardHeader, {}
              , React.createElement(CardTitle, {}, "Restaurant Information" )
              , React.createElement(CardDescription, {}, "Basic details about your restaurant"

              )
            )
            , React.createElement(CardContent, { className: "space-y-6"}
              , React.createElement('div', { className: "grid grid-cols-2 gap-4"  }
                , React.createElement('div', { className: "space-y-2"}
                  , React.createElement(Label, { htmlFor: "restaurantName"}, "Restaurant Name" )
                  , React.createElement(Input, {
                    id: "restaurantName",
                    value: restaurantSettings.name,
                    onChange: (e) =>
                      setRestaurantSettings({
                        ...restaurantSettings,
                        name: e.target.value,
                      })
                    }
                  )
                )
                , React.createElement('div', { className: "space-y-2"}
                  , React.createElement(Label, { htmlFor: "restaurantPhone"}, "Phone")
                  , React.createElement(Input, {
                    id: "restaurantPhone",
                    value: restaurantSettings.phone,
                    onChange: (e) =>
                      setRestaurantSettings({
                        ...restaurantSettings,
                        phone: e.target.value,
                      })
                    }
                  )
                )
              )

              , React.createElement('div', { className: "space-y-2"}
                , React.createElement(Label, { htmlFor: "restaurantAddress"}, "Address")
                , React.createElement(Input, {
                  id: "restaurantAddress",
                  value: restaurantSettings.address,
                  onChange: (e) =>
                    setRestaurantSettings({
                      ...restaurantSettings,
                      address: e.target.value,
                    })
                  }
                )
              )

              , React.createElement('div', { className: "grid grid-cols-2 gap-4"  }
                , React.createElement('div', { className: "space-y-2"}
                  , React.createElement(Label, { htmlFor: "restaurantEmail"}, "Email")
                  , React.createElement(Input, {
                    id: "restaurantEmail",
                    type: "email",
                    value: restaurantSettings.email,
                    onChange: (e) =>
                      setRestaurantSettings({
                        ...restaurantSettings,
                        email: e.target.value,
                      })
                    }
                  )
                )
                , React.createElement('div', { className: "space-y-2"}
                  , React.createElement(Label, { htmlFor: "restaurantPan"}, "PAN Number" )
                  , React.createElement(Input, {
                    id: "restaurantPan",
                    value: restaurantSettings.panNumber,
                    onChange: (e) =>
                      setRestaurantSettings({
                        ...restaurantSettings,
                        panNumber: e.target.value,
                      })
                    }
                  )
                )
              )

              , React.createElement(Button, {
                onClick: () => handleSaveSettings("Restaurant"),
                disabled: isLoading}

                , isLoading && React.createElement(Loader2, { className: "h-4 w-4 mr-2 animate-spin"   } )
                , React.createElement(Save, { className: "h-4 w-4 mr-2"  } ), "Save Changes"

              )
            )
          )
        )

        /* Tax Settings */
        , React.createElement(TabsContent, { value: "tax"}
          , React.createElement(Card, {}
            , React.createElement(CardHeader, {}
              , React.createElement(CardTitle, {}, "Tax Configuration" )
              , React.createElement(CardDescription, {}, "Configure VAT and service charge settings"

              )
            )
            , React.createElement(CardContent, { className: "space-y-6"}
              , React.createElement('div', { className: "flex items-center justify-between"  }
                , React.createElement('div', {}
                  , React.createElement(Label, {}, "Enable VAT" )
                  , React.createElement('p', { className: "text-sm text-muted-foreground" }, "Apply VAT to all orders"

                  )
                )
                , React.createElement(Switch, {
                  checked: taxSettings.vatEnabled,
                  onCheckedChange: (checked) =>
                    setTaxSettings({ ...taxSettings, vatEnabled: checked })
                  }
                )
              )

              , taxSettings.vatEnabled && (
                React.createElement('div', { className: "space-y-2"}
                  , React.createElement(Label, { htmlFor: "vatRate"}, "VAT Rate (%)"  )
                  , React.createElement(Input, {
                    id: "vatRate",
                    type: "number",
                    value: taxSettings.vatRate,
                    onChange: (e) =>
                      setTaxSettings({ ...taxSettings, vatRate: e.target.value })
                    ,
                    className: "w-32"}
                  )
                )
              )

              , React.createElement(Separator, {} )

              , React.createElement('div', { className: "flex items-center justify-between"  }
                , React.createElement('div', {}
                  , React.createElement(Label, {}, "Enable Service Charge"  )
                  , React.createElement('p', { className: "text-sm text-muted-foreground" }, "Apply service charge to orders"

                  )
                )
                , React.createElement(Switch, {
                  checked: taxSettings.serviceChargeEnabled,
                  onCheckedChange: (checked) =>
                    setTaxSettings({
                      ...taxSettings,
                      serviceChargeEnabled: checked,
                    })
                  }
                )
              )

              , taxSettings.serviceChargeEnabled && (
                React.createElement('div', { className: "space-y-2"}
                  , React.createElement(Label, { htmlFor: "serviceChargeRate"}, "Service Charge Rate (%)"   )
                  , React.createElement(Input, {
                    id: "serviceChargeRate",
                    type: "number",
                    value: taxSettings.serviceChargeRate,
                    onChange: (e) =>
                      setTaxSettings({
                        ...taxSettings,
                        serviceChargeRate: e.target.value,
                      })
                    ,
                    className: "w-32"}
                  )
                )
              )

              , React.createElement(Separator, {} )

              , React.createElement('div', { className: "flex items-center justify-between"  }
                , React.createElement('div', {}
                  , React.createElement(Label, {}, "Tax Inclusive Pricing"  )
                  , React.createElement('p', { className: "text-sm text-muted-foreground" }, "Menu prices already include tax"

                  )
                )
                , React.createElement(Switch, {
                  checked: taxSettings.includeTaxInPrice,
                  onCheckedChange: (checked) =>
                    setTaxSettings({
                      ...taxSettings,
                      includeTaxInPrice: checked,
                    })
                  }
                )
              )

              , React.createElement(Button, {
                onClick: () => handleSaveSettings("Tax"),
                disabled: isLoading}

                , isLoading && React.createElement(Loader2, { className: "h-4 w-4 mr-2 animate-spin"   } )
                , React.createElement(Save, { className: "h-4 w-4 mr-2"  } ), "Save Changes"

              )
            )
          )
        )

        /* Receipt Settings */
        , React.createElement(TabsContent, { value: "receipt"}
          , React.createElement(Card, {}
            , React.createElement(CardHeader, {}
              , React.createElement(CardTitle, {}, "Receipt Settings" )
              , React.createElement(CardDescription, {}, "Configure how receipts are printed"

              )
            )
            , React.createElement(CardContent, { className: "space-y-6"}
              , React.createElement('div', { className: "space-y-2"}
                , React.createElement(Label, { htmlFor: "paperWidth"}, "Paper Width (mm)"  )
                , React.createElement(Select, {
                  value: receiptSettings.paperWidth,
                  onValueChange: (value) =>
                    setReceiptSettings({ ...receiptSettings, paperWidth: value })
                  }

                  , React.createElement(SelectTrigger, { className: "w-32"}
                    , React.createElement(SelectValue, {} )
                  )
                  , React.createElement(SelectContent, {}
                    , React.createElement(SelectItem, { value: "58"}, "58mm")
                    , React.createElement(SelectItem, { value: "80"}, "80mm")
                  )
                )
              )

              , React.createElement(Separator, {} )

              , React.createElement('div', { className: "space-y-4"}
                , React.createElement('h4', { className: "font-medium"}, "Show on Receipt"  )

                , React.createElement('div', { className: "flex items-center justify-between"  }
                  , React.createElement(Label, {}, "Show Logo" )
                  , React.createElement(Switch, {
                    checked: receiptSettings.showLogo,
                    onCheckedChange: (checked) =>
                      setReceiptSettings({ ...receiptSettings, showLogo: checked })
                    }
                  )
                )

                , React.createElement('div', { className: "flex items-center justify-between"  }
                  , React.createElement(Label, {}, "Show Address" )
                  , React.createElement(Switch, {
                    checked: receiptSettings.showAddress,
                    onCheckedChange: (checked) =>
                      setReceiptSettings({
                        ...receiptSettings,
                        showAddress: checked,
                      })
                    }
                  )
                )

                , React.createElement('div', { className: "flex items-center justify-between"  }
                  , React.createElement(Label, {}, "Show Phone" )
                  , React.createElement(Switch, {
                    checked: receiptSettings.showPhone,
                    onCheckedChange: (checked) =>
                      setReceiptSettings({ ...receiptSettings, showPhone: checked })
                    }
                  )
                )

                , React.createElement('div', { className: "flex items-center justify-between"  }
                  , React.createElement(Label, {}, "Show PAN Number"  )
                  , React.createElement(Switch, {
                    checked: receiptSettings.showPan,
                    onCheckedChange: (checked) =>
                      setReceiptSettings({ ...receiptSettings, showPan: checked })
                    }
                  )
                )
              )

              , React.createElement(Separator, {} )

              , React.createElement('div', { className: "space-y-2"}
                , React.createElement(Label, { htmlFor: "footerText"}, "Footer Text" )
                , React.createElement(Input, {
                  id: "footerText",
                  value: receiptSettings.footerText,
                  onChange: (e) =>
                    setReceiptSettings({
                      ...receiptSettings,
                      footerText: e.target.value,
                    })
                  }
                )
              )

              , React.createElement(Button, {
                onClick: () => handleSaveSettings("Receipt"),
                disabled: isLoading}

                , isLoading && React.createElement(Loader2, { className: "h-4 w-4 mr-2 animate-spin"   } )
                , React.createElement(Save, { className: "h-4 w-4 mr-2"  } ), "Save Changes"

              )
            )
          )
        )

        /* Currency Settings */
        , React.createElement(TabsContent, { value: "currency"}
          , React.createElement(Card, {}
            , React.createElement(CardHeader, {}
              , React.createElement(CardTitle, {}, "Currency Settings" )
              , React.createElement(CardDescription, {}, "Configure currency display format"

              )
            )
            , React.createElement(CardContent, { className: "space-y-6"}
              , React.createElement('div', { className: "grid grid-cols-2 gap-4"  }
                , React.createElement('div', { className: "space-y-2"}
                  , React.createElement(Label, { htmlFor: "currency"}, "Currency")
                  , React.createElement(Select, {
                    value: currencySettings.currency,
                    onValueChange: (value) =>
                      setCurrencySettings({ ...currencySettings, currency: value })
                    }

                    , React.createElement(SelectTrigger, {}
                      , React.createElement(SelectValue, {} )
                    )
                    , React.createElement(SelectContent, {}
                      , React.createElement(SelectItem, { value: "NPR"}, "Nepali Rupee (NPR)"  )
                      , React.createElement(SelectItem, { value: "INR"}, "Indian Rupee (INR)"  )
                      , React.createElement(SelectItem, { value: "USD"}, "US Dollar (USD)"  )
                    )
                  )
                )
                , React.createElement('div', { className: "space-y-2"}
                  , React.createElement(Label, { htmlFor: "currencySymbol"}, "Currency Symbol" )
                  , React.createElement(Input, {
                    id: "currencySymbol",
                    value: currencySettings.currencySymbol,
                    onChange: (e) =>
                      setCurrencySettings({
                        ...currencySettings,
                        currencySymbol: e.target.value,
                      })
                    }
                  )
                )
              )

              , React.createElement('div', { className: "grid grid-cols-2 gap-4"  }
                , React.createElement('div', { className: "space-y-2"}
                  , React.createElement(Label, { htmlFor: "decimalPlaces"}, "Decimal Places" )
                  , React.createElement(Select, {
                    value: currencySettings.decimalPlaces,
                    onValueChange: (value) =>
                      setCurrencySettings({
                        ...currencySettings,
                        decimalPlaces: value,
                      })
                    }

                    , React.createElement(SelectTrigger, {}
                      , React.createElement(SelectValue, {} )
                    )
                    , React.createElement(SelectContent, {}
                      , React.createElement(SelectItem, { value: "0"}, "0")
                      , React.createElement(SelectItem, { value: "2"}, "2")
                    )
                  )
                )
                , React.createElement('div', { className: "space-y-2"}
                  , React.createElement(Label, { htmlFor: "thousandSeparator"}, "Thousand Separator" )
                  , React.createElement(Select, {
                    value: currencySettings.thousandSeparator,
                    onValueChange: (value) =>
                      setCurrencySettings({
                        ...currencySettings,
                        thousandSeparator: value,
                      })
                    }

                    , React.createElement(SelectTrigger, {}
                      , React.createElement(SelectValue, {} )
                    )
                    , React.createElement(SelectContent, {}
                      , React.createElement(SelectItem, { value: ","}, "Comma (,)" )
                      , React.createElement(SelectItem, { value: "."}, "Period (.)" )
                      , React.createElement(SelectItem, { value: " " }, "Space")
                    )
                  )
                )
              )

              , React.createElement('div', { className: "p-4 bg-muted/50 rounded-lg"  }
                , React.createElement('p', { className: "text-sm text-muted-foreground mb-2"  }, "Preview")
                , React.createElement('p', { className: "text-2xl font-bold" }
                  , currencySettings.currencySymbol, " 1" , currencySettings.thousandSeparator, "234"
                  , currencySettings.decimalPlaces === "2" ? ".56" : ""
                )
              )

              , React.createElement(Button, {
                onClick: () => handleSaveSettings("Currency"),
                disabled: isLoading}

                , isLoading && React.createElement(Loader2, { className: "h-4 w-4 mr-2 animate-spin"   } )
                , React.createElement(Save, { className: "h-4 w-4 mr-2"  } ), "Save Changes"

              )
            )
          )
        )

        /* Financial Year Settings */
        , React.createElement(TabsContent, { value: "financial"}
          , React.createElement(Card, {}
            , React.createElement(CardHeader, {}
              , React.createElement(CardTitle, {}, "Financial Year" )
              , React.createElement(CardDescription, {}, "Manage your financial year settings"

              )
            )
            , React.createElement(CardContent, { className: "space-y-6"}
              , React.createElement('div', { className: "grid grid-cols-2 gap-4"  }
                , React.createElement('div', { className: "space-y-2"}
                  , React.createElement(Label, { htmlFor: "startMonth"}, "Financial Year Starts"  )
                  , React.createElement(Select, {
                    value: financialYear.startMonth,
                    onValueChange: (value) =>
                      setFinancialYear({ ...financialYear, startMonth: value })
                    }

                    , React.createElement(SelectTrigger, {}
                      , React.createElement(SelectValue, {} )
                    )
                    , React.createElement(SelectContent, {}
                      , React.createElement(SelectItem, { value: "1"}, "Baisakh (Mid-April)" )
                      , React.createElement(SelectItem, { value: "4"}, "Shrawan (Mid-July)" )
                      , React.createElement(SelectItem, { value: "7"}, "Kartik (Mid-October)" )
                      , React.createElement(SelectItem, { value: "10"}, "Magh (Mid-January)" )
                    )
                  )
                )
                , React.createElement('div', { className: "space-y-2"}
                  , React.createElement(Label, { htmlFor: "currentYear"}, "Current Financial Year"  )
                  , React.createElement(Input, {
                    id: "currentYear",
                    value: financialYear.currentYear,
                    onChange: (e) =>
                      setFinancialYear({
                        ...financialYear,
                        currentYear: e.target.value,
                      })
                    }
                  )
                )
              )

              , React.createElement('div', { className: "p-4 bg-muted/50 rounded-lg space-y-2"   }
                , React.createElement('div', { className: "flex justify-between" }
                  , React.createElement('span', { className: "text-sm text-muted-foreground" }, "Current Year" )
                  , React.createElement('span', { className: "font-medium"}, financialYear.currentYear)
                )
                , React.createElement('div', { className: "flex justify-between" }
                  , React.createElement('span', { className: "text-sm text-muted-foreground" }, "Status")
                  , React.createElement('span', {
                    className: `font-medium ${
                      financialYear.isClosed ? "text-red-600" : "text-green-600"
                    }`}

                    , financialYear.isClosed ? "Closed" : "Active"
                  )
                )
              )

              , React.createElement(Separator, {} )

              , React.createElement('div', { className: "space-y-4"}
                , React.createElement('h4', { className: "font-medium"}, "Year End Actions"  )
                , React.createElement('p', { className: "text-sm text-muted-foreground" }, "Closing the financial year will:"

                )
                , React.createElement('ul', { className: "list-disc list-inside text-sm text-muted-foreground space-y-1"    }
                  , React.createElement('li', {}, "Lock all transactions for the current year"      )
                  , React.createElement('li', {}, "Generate year-end reports"  )
                  , React.createElement('li', {}, "Carry forward balances to the new year"      )
                )

                , React.createElement(Button, { variant: "destructive", disabled: true}, "Close Financial Year"

                )
              )

              , React.createElement(Button, {
                onClick: () => handleSaveSettings("Financial Year"),
                disabled: isLoading}

                , isLoading && React.createElement(Loader2, { className: "h-4 w-4 mr-2 animate-spin"   } )
                , React.createElement(Save, { className: "h-4 w-4 mr-2"  } ), "Save Changes"

              )
            )
          )
        )
      )
    )
  );
}
