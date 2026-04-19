import { cn, attendanceStatusColor, attendanceStatusLabel, roleLabel } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const variantClasses = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
};

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span className={cn("badge", variantClasses[variant], className)}>
      {children}
    </span>
  );
}

export function AttendanceBadge({ status }: { status: string }) {
  return (
    <span className={cn("badge", attendanceStatusColor(status))}>
      {attendanceStatusLabel(status)}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const colorMap: Record<string, string> = {
    ADMIN: "bg-purple-100 text-purple-800",
    COORDINATOR: "bg-blue-100 text-blue-800",
    INSTRUCTOR: "bg-green-100 text-green-800",
  };
  return (
    <span className={cn("badge", colorMap[role] ?? "bg-gray-100 text-gray-700")}>
      {roleLabel(role)}
    </span>
  );
}
