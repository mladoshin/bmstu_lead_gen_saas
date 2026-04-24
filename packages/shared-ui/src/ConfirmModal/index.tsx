import React from "react";
import { Button } from "../Button";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 text-center">
          {title}
        </h2>

        <div className="flex gap-3">
          <Button
            onClick={onCancel}
            className="bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            No
          </Button>
          <Button onClick={onConfirm}>Yes</Button>
        </div>
      </div>
    </div>
  );
};
