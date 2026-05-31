"use client";

import { AlertCircle, CheckCircle, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Modal from "./modal";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  data: Record<string, unknown>;
  isLoading?: boolean;
  confirmLabel?: string;
  itemHeading?: string;
  destructive?: boolean;
}

const modalColors = {
  primary: "#1a73e8",
  danger: "#ef4444",
  success: "#16a34a",
};

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  data,
  isLoading = false,
  confirmLabel,
  itemHeading,
  destructive = true,
}: DeleteModalProps) {
  const buttonLabel = confirmLabel ?? (destructive ? "Disabled" : "Enable");
  const buttonColor = destructive ? modalColors.danger : modalColors.success;
  const headingText = itemHeading ?? "Item to be Disable:";
  const ActionIcon = destructive ? Trash2 : CheckCircle;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      footer={
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="hover:bg-slate-100"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="hover:scale-105 transition-transform"
            style={{
              background: `linear-gradient(135deg, ${buttonColor}, ${destructive ? "#dc2626" : "#15803d"})`,
            }}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {buttonLabel}...
              </div>
            ) : (
              <>
                <ActionIcon className="w-4 h-4 mr-2" />
                {buttonLabel}
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: `${buttonColor}15`,
            }}
          >
            <AlertCircle
              className="w-6 h-6"
              style={{ color: buttonColor }}
            />
          </div>
          <div>
            <p className="text-slate-700 mb-4">{description}</p>
            <div
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: `${buttonColor}05`,
                borderColor: `${buttonColor}20`,
              }}
            >
              <h4
                className="font-semibold mb-2"
                style={{ color: buttonColor }}
              >
                {headingText}
              </h4>
              <div className="space-y-1 text-sm text-slate-600">
                {Object.entries(data).map(([key, value]) => (
                  <div key={key} className="flex">
                    <span className="font-medium w-32">{key}:</span>
                    <span className="text-slate-800">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
