import * as React from "react"

import { cn } from "@/lib/utils"
import InputMask, { ReactInputMask } from 'react-input-mask'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  isMask?: boolean
  mask?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, isMask, mask, ...props }, ref) => {
    return (
      <>
        {
          !isMask ? (
            <input
              type={type}
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
              )}
              ref={ref}
              {...props}
            />
          ) : (
            <InputMask mask={mask as string} className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
              ref={ref as React.LegacyRef<InputMask>}
              {...props}
            />
          )
        }
      </>

    )
  }
)
Input.displayName = "Input"

export { Input }
