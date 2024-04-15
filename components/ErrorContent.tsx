import { AnimatePresence, motion } from "framer-motion";

import LoadingButton from "./LoadingButton";

interface ErrorContentProps {
  error: string;
  onClickAction: () => void;
}
const ErrorContent: React.FC<ErrorContentProps> = ({
  error,
  onClickAction,
}) => (
  <AnimatePresence>
    <motion.div className="justify-center w-full flex text-xl">
      <motion.div className="text-red-500">SOMETHING WENT WRONG</motion.div>
    </motion.div>
    <motion.div className="w-full my-8 text-red-500">{error}</motion.div>
    <div className="mt-4 flex w-full justify-end">
      <LoadingButton onClick={onClickAction}>ok</LoadingButton>
    </div>
  </AnimatePresence>
);

export default ErrorContent;
