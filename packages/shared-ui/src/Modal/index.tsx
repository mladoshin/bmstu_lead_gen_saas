import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ModalProps {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  onClose,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-lg shadow-lg max-w-2xl w-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto p-5 sm:p-6 relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
          aria-label="Close"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {title && (
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 pr-8">
            {title}
          </h2>
        )}

        {children}
      </div>
    </div>
  );
};
