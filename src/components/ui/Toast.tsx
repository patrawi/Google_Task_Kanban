import { useEffect } from "react";
import { X } from "lucide-react";
interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
        ? "bg-red-500"
        : "bg-blue-500";

  return (
    <div
      className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2`}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 hover:bg-white hover:bg-opacity-20 rounded p-1 cursor-pointer"
      >
        <X size={16} />
      </button>
    </div>
  );
};
