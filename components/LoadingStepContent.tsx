import { motion } from "framer-motion";
import Image from "next/image";

const LoadingStepContent: React.FC = () => (
  <>
    <motion.div className="justify-center w-full flex text-xl text-blue-500">
      LOADING TRANSACTION...
    </motion.div>
    <motion.div className="flex w-full items-center justify-center">
      <Image
        height={100}
        width={100}
        className="m-5"
        alt="axelar logo loading animation"
        src="/assets/animations/logo.svg"
      />
    </motion.div>
  </>
);

export default LoadingStepContent;
