"use client";
import React from "react";


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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function CurrencySettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [currencySettings, setCurrencySettings] = useState({
    currency: "NPR",
    currencySymbol: "Rs.",
    decimalPlaces: "2",
    thousandSeparator: ",",
  });

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Currency settings saved successfully");
    } catch (e2) {
      toast.error("Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    React.createElement('div', { className: "space-y-6"}
      , React.createElement('div', {}
        , React.createElement('h1', { className: "text-2xl font-bold flex items-center gap-2"    }
          , React.createElement(DollarSign, { className: "h-6 w-6" } ), "Currency Settings"

        )
        , React.createElement('p', { className: "text-muted-foreground"}, "Configure currency display format"

        )
      )

      , React.createElement(Card, {}
        , React.createElement(CardHeader, {}
          , React.createElement(CardTitle, {}, "Currency Configuration" )
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

          , React.createElement(Button, { onClick: handleSaveSettings, disabled: isLoading}
            , isLoading && React.createElement(Loader2, { className: "h-4 w-4 mr-2 animate-spin"   } )
            , React.createElement(Save, { className: "h-4 w-4 mr-2"  } ), "Save Changes"

          )
        )
      )
    )
  );
}
