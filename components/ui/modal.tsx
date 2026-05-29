"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  showCloseButton?: boolean;
  footer?: ReactNode;
}

const hospitalColors = {
  primary: "#1a73e8",
  secondary: "#0ea5e9",
  accent: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  footer,
}: ModalProps) {
  if (!isOpen) return null;

  const getSizeClass = (size: string) => {
    const sizeMap: Record<string, string> = {
      sm: "max-w-md",
      md: "max-w-lg",
      lg: "max-w-2xl",
      xl: "max-w-4xl",
      "2xl": "max-w-5xl",
      "3xl": "max-w-6xl",
      "4xl": "max-w-7xl",
      "5xl": "max-w-8xl", // For future expansion
      full: "max-w-full", // If you want to support full width
    };

    return sizeMap[size] || "max-w-lg"; // Default to md if size not found
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative ${getSizeClass(size)} w-full mx-4 animate-in fade-in zoom-in-95 duration-200`}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
          style={{
            border: `2px solid ${hospitalColors.primary}`,
            background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          }}
        >
          {/* Header */}
          <div
            className="px-6 py-4 border-b flex items-center justify-between"
            style={{ borderColor: `${hospitalColors.primary}20` }}
          >
            <h3
              className="text-xl font-bold"
              style={{ color: hospitalColors.primary }}
            >
              {title}
            </h3>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                style={{ color: hospitalColors.primary }}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div
              className="px-6 py-4 border-t flex justify-end gap-3"
              style={{ borderColor: `${hospitalColors.primary}20` }}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
