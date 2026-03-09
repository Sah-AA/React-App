import React from "react";
"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

function Collapsible({
  ...props
}) {
  return React.createElement(CollapsiblePrimitive.Root, { 'data-slot': "collapsible", ...props} )
}

function CollapsibleTrigger({
  ...props
}) {
  return (
    React.createElement(CollapsiblePrimitive.CollapsibleTrigger, {
      'data-slot': "collapsible-trigger",
      ...props}
    )
  )
}

function CollapsibleContent({
  ...props
}) {
  return (
    React.createElement(CollapsiblePrimitive.CollapsibleContent, {
      'data-slot': "collapsible-content",
      ...props}
    )
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
