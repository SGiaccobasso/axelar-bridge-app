import LoadingSpinner from "./LoadingSpinner";

interface LoadingButtonProps {
  isLoading?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant?: string;
}

const variants: Record<string, string> = {
  primary:
    "border border-blue-600 text-white px-10 py-2 rounded-md focus:outline-none transform hover:scale-105 transition-transform duration-100 font-semibold text-black",
};

const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading = false,
  onClick,
  children,
  variant = "primary",
}) => {
  return (
    <button
      disabled={isLoading}
      onClick={onClick}
      className={variants[variant]}
    >
      {isLoading ? (
        <div className="px-2">
          <LoadingSpinner w={24} h={24} />
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default LoadingButton;
