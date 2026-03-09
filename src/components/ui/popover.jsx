"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

function Popover({
  ...props
}) {
  return React.createElement(PopoverPrimitive.Root, { 'data-slot': "popover", ...props} )
}

function PopoverTrigger({
  ...props
}) {
  return React.createElement(PopoverPrimitive.Trigger, { 'data-slot': "popover-trigger", ...props} )
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}) {
  return (
    React.createElement(PopoverPrimitive.Portal, {}
      , React.createElement(PopoverPrimitive.Content, {
        'data-slot': "popover-content",
        align: align,
        sideOffset: sideOffset,
        className: cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className
        ),
        ...props}
      )
    )
  )
}

function PopoverAnchor({
  ...props
}) {
  return React.createElement(PopoverPrimitive.Anchor, { 'data-slot': "popover-anchor", ...props} )
}

function PopoverHeader({ className, ...props }) {
  return (
    React.createElement('div', {
      'data-slot': "popover-header",
      className: cn("flex flex-col gap-1 text-sm", className),
      ...props}
    )
  )
}

function PopoverTitle({ className, ...props }) {
  return (
    React.createElement('div', {
      'data-slot': "popover-title",
      className: cn("font-medium", className),
      ...props}
    )
  )
}

function PopoverDescription({
  className,
  ...props
}) {
  return (
    React.createElement('p', {
      'data-slot': "popover-description",
      className: cn("text-muted-foreground", className),
      ...props}
    )
  )
}

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
}
