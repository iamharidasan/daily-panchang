import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
};

const variants = {
  default: "bg-[#741b20] text-white hover:bg-[#5e1217]",
  outline: "border border-[#d9b987] bg-white text-[#6e2a20] hover:bg-[#fff8e8]",
  secondary: "bg-[#f3dfb7] text-[#641c20] hover:bg-[#ead09d]",
  ghost: "bg-transparent text-[#6e2a20] hover:bg-[#fff0d1]",
};

const sizes = {
  default: "h-9 px-4",
  sm: "h-8 px-3 text-sm",
  lg: "h-10 px-6",
};

export function Button({
  className = "",
  variant = "default",
  size = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-[#c36f22]/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
