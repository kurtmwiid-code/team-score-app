import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const toastVariants = cva(
  "fixed bottom-4 right-4 w-full max-w-sm bg-white dark:bg-gray-900 shadow-lg rounded-lg p-4 flex items-center justify-between gap-4 border",
  {
    variants: {
      variant: {
        default: "border-gray-200 text-gray-900 dark:border-gray-700 dark:text-gray-100",
        destructive: "border-red-500 text-red-700 dark:border-red-600 dark:text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ToastProps extends VariantProps<typeof toastVariants> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function Toast({ title, description, action, variant }: ToastProps) {
  return (
    <div className={cn(toastVariants({ variant }))}>
      <div className="flex-1">
        {title && <div className="font-semibold">{title}</div>}
        {description && <div className="text-sm text-gray-600 dark:text-gray-400">{description}</div>}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

// ✅ export this so `use-toast.ts` compiles
export type ToastActionElement = React.ReactElement;
