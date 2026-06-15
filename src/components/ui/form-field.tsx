import { useField } from "formik";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Input } from "./input";
import { Label } from "./label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
  required?: boolean;
}

/**
 * Formik-aware input with Yup error rendering.
 * Password fields get a show/hide toggle like the reference design.
 */
export function FormField({
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
  className,
  required = false,
}: FormFieldProps) {
  const [field, meta] = useField(name);
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const hasError = Boolean(meta.touched && meta.error);

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={name}
          type={isPassword ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          error={hasError}
          {...field}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <FiEyeOff size={17} /> : <FiEye size={17} />}
          </button>
        )}
      </div>
      {hasError && (
        <p className="text-xs font-medium text-red-500">{meta.error}</p>
      )}
    </div>
  );
}



