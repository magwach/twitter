import { useEffect } from "react";

export default function ShowImage({ src, onClose }) {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm bg-opacity-80"
      onClick={handleBackdropClick}
    >
      <img
        src={src}
        alt="Full view"
        className="w-auto h-auto max-h-[60vh] object-contain rounded-lg"
      />
    </div>
  );
}
