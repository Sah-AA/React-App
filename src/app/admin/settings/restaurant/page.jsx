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
import { Building, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function RestaurantSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [restaurantSettings, setRestaurantSettings] = useState({
    name: "My Restaurant",
    address: "Kathmandu, Nepal",
    phone: "01-4123456",
    email: "info@restaurant.com",
    panNumber: "123456789",
    logo: "",
  });

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Restaurant settings saved successfully");
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
          , React.createElement(Building, { className: "h-6 w-6" } ), "Restaurant Settings"

        )
        , React.createElement('p', { className: "text-muted-foreground"}, "Configure your restaurant information"

        )
      )

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

          , React.createElement(Button, { onClick: handleSaveSettings, disabled: isLoading}
            , isLoading && React.createElement(Loader2, { className: "h-4 w-4 mr-2 animate-spin"   } )
            , React.createElement(Save, { className: "h-4 w-4 mr-2"  } ), "Save Changes"

          )
        )
      )
    )
  );
}
