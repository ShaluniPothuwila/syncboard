const VARIANT_CLASSES = {
  primary:
    "bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm",
  secondary:
    "bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-300",
  ghost:
    "bg-transparent hover:bg-slate-100 text-slate-500 hover:text-slate-700 font-medium",
  danger:
    "bg-red-50 hover:bg-red-100 text-red-600 font-semibold",
};

const SIZE_CLASSES = {
  sm: "text-xs px-2.5 py-1.5 gap-1.5",
  md: "text-sm px-3.5 py-2 gap-2",
};

export default function Button({
  variant = "secondary",
  size = "md",
  icon,
  children,
  className = "",
  ...rest
}) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}