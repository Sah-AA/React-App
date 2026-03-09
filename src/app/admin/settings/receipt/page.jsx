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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Receipt, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function ReceiptSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [receiptSettings, setReceiptSettings] = useState({
    showLogo: true,
    showAddress: true,
    showPhone: true,
    showPan: true,
    footerText: "Thank you for dining with us!",
    paperWidth: "80",
  });

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Receipt settings saved successfully");
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
          , React.createElement(Receipt, { className: "h-6 w-6" } ), "Receipt Settings"

        )
        , React.createElement('p', { className: "text-muted-foreground"}, "Configure how receipts are printed"

        )
      )

      , React.createElement(Card, {}
        , React.createElement(CardHeader, {}
          , React.createElement(CardTitle, {}, "Receipt Configuration" )
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

          , React.createElement(Button, { onClick: handleSaveSettings, disabled: isLoading}
            , isLoading && React.createElement(Loader2, { className: "h-4 w-4 mr-2 animate-spin"   } )
            , React.createElement(Save, { className: "h-4 w-4 mr-2"  } ), "Save Changes"

          )
        )
      )
    )
  );
}
