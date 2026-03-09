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
import { Percent, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function TaxSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [taxSettings, setTaxSettings] = useState({
    vatEnabled: true,
    vatRate: "13",
    serviceChargeEnabled: true,
    serviceChargeRate: "10",
    includeTaxInPrice: false,
  });

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Tax settings saved successfully");
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
          , React.createElement(Percent, { className: "h-6 w-6" } ), "Tax Settings"

        )
        , React.createElement('p', { className: "text-muted-foreground"}, "Configure VAT and service charge settings"

        )
      )

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

          , React.createElement(Button, { onClick: handleSaveSettings, disabled: isLoading}
            , isLoading && React.createElement(Loader2, { className: "h-4 w-4 mr-2 animate-spin"   } )
            , React.createElement(Save, { className: "h-4 w-4 mr-2"  } ), "Save Changes"

          )
        )
      )
    )
  );
}
