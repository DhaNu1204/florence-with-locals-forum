"use client";

import {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  forwardRef,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils/cn";

interface InputBaseProps {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

type InputFieldProps = InputBaseProps &
  InputHTMLAttributes<HTMLInputElement> & {
    as?: "input";
  };

type TextareaFieldProps = InputBaseProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    as: "textarea";
  };

type InputProps = InputFieldProps | TextareaFieldProps;

const baseStyles =
  "w-full rounded-lg border bg-white px-3.5 py-2.5 text-base text-dark-text placeholder:text-dark-text/40 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed font-body";

const stateStyles = {
  default:
    "border-light-stone focus:border-terracotta focus:ring-terracotta/30",
  error: "border-red-400 focus:border-red-500 focus:ring-red-500/30",
};

export const Input = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputProps
>((props, ref) => {
  const { label, error, leftIcon, rightIcon, className, as, ...rest } = props;
  const isTextarea = as === "textarea";
  const hasError = !!error;

  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-base font-medium text-dark-text">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && !isTextarea && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dark-text/40">
            {leftIcon}
          </div>
        )}
        {isTextarea ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className={cn(
              baseStyles,
              hasError ? stateStyles.error : stateStyles.default,
              "min-h-[80px] resize-y",
              className
            )}
            {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            className={cn(
              baseStyles,
              hasError ? stateStyles.error : stateStyles.default,
              !!leftIcon && "pl-10",
              !!rightIcon && "pr-10",
              className
            )}
            {...(rest as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        {rightIcon && !isTextarea && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-text/40">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
});
Input.displayName = "Input";
