import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring/40 focus-visible:shadow-[0_0_0_3px_oklch(0.5_0.2_265/0.08)] disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:shadow-[0_0_0_3px_oklch(0.577_0.245_27.325/0.1)] md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:focus-visible:border-ring/50 dark:focus-visible:shadow-[0_0_0_3px_oklch(0.6_0.2_265/0.12)] dark:aria-invalid:border-destructive/50 dark:aria-invalid:shadow-[0_0_0_3px_oklch(0.704_0.191_22.216/0.15)]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
