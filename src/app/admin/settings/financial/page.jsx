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
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function FinancialYearSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [financialYear, setFinancialYear] = useState({
    startMonth: "7",
    currentYear: "2081/82",
    isClosed: false,
  });

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Financial year settings saved successfully");
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
          , React.createElement(Calendar, { className: "h-6 w-6" } ), "Financial Year Settings"

        )
        , React.createElement('p', { className: "text-muted-foreground"}, "Manage your financial year settings"

        )
      )

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

          , React.createElement(Button, { onClick: handleSaveSettings, disabled: isLoading}
            , isLoading && React.createElement(Loader2, { className: "h-4 w-4 mr-2 animate-spin"   } )
            , React.createElement(Save, { className: "h-4 w-4 mr-2"  } ), "Save Changes"

          )
        )
      )
    )
  );
}
