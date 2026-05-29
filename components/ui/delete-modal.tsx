"use client";

import { AlertCircle, Trash2, X } from "lucide-react";
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
}

const hospitalColors = {
  primary: "#1a73e8",
  danger: "#ef4444",
};

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  data,
  isLoading = false,
}: DeleteModalProps) {
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
              background: `linear-gradient(135deg, ${hospitalColors.danger}, #dc2626)`,
            }}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </div>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Permanently
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
            style={{ backgroundColor: `${hospitalColors.danger}15` }}
          >
            <AlertCircle 
              className="w-6 h-6" 
              style={{ color: hospitalColors.danger }}
            />
          </div>
          <div>
            <p className="text-slate-700 mb-4">{description}</p>
            <div 
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: `${hospitalColors.danger}05`,
                borderColor: `${hospitalColors.danger}20`
              }}
            >
              <h4 className="font-semibold mb-2" style={{ color: hospitalColors.danger }}>
                Item to be deleted:
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
        
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <p className="text-sm text-slate-600">
            ⚠️ <span className="font-semibold">Warning:</span> This action cannot be undone. All associated data will be permanently removed.
          </p>
        </div>
      </div>
    </Modal>
  );
}
