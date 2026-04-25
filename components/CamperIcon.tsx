import { Car } from "lucide-react";

interface CamperIconProps {
  className?: string;
  size?: number;
}

export function CamperIcon({ className = "", size = 32 }: CamperIconProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Glow effect */}
      <div className="absolute inset-0 bg-[var(--mario-red)] rounded-full blur-md opacity-50 animate-pulse"></div>
      
      {/* Icon Container */}
      <div className="relative bg-[var(--mario-red)] text-white p-2 rounded-full border-2 border-white shadow-lg transform hover:scale-110 transition-transform duration-200">
        <Car size={size - 12} fill="currentColor" />
      </div>
    </div>
  );
}
