import React, { useState, useEffect, useRef } from "react";
import { DropdownItem } from "../types/types";
import useAxelarData from "../hooks/useAxelarData";
import { motion, Variants } from "framer-motion";
import LoadingSpinner from "./LoadingSpinner";

type Option = "chains" | "assets";

interface DropdownProps {
  option: Option;
  onSelectValue: (value: DropdownItem) => void;
  value: DropdownItem | null;
}

const Dropdown: React.FC<DropdownProps> = ({
  option,
  onSelectValue,
  value,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownBtnRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: list, isLoading, error } = useAxelarData(option);

  const itemVariants: Variants = {
    open: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
    closed: { opacity: 0, y: 20, transition: { duration: 0.2 } },
  };

  useEffect(() => {
    if (!list?.length) {
      onSelectValue({ name: "Destination Chain", image: "", id: "" });
    } else {
      onSelectValue(list[0]);
    }
  }, [list]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleItemClick = (item: DropdownItem) => {
    onSelectValue(item);
    setIsOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      !dropdownRef.current?.contains(event.target as Node) &&
      !dropdownBtnRef.current?.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <motion.nav
      initial={false}
      animate={isOpen ? "open" : "closed"}
      className="relative flex justify-end"
    >
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={toggleDropdown}
        className="w-12"
      >
        {!isLoading && !error && value ? (
          <div className="flex font-semibold" ref={dropdownBtnRef}>
            <motion.img
              variants={{
                open: { rotate: 360 },
                closed: { rotate: 0 },
              }}
              transition={{ duration: 0.3 }}
              style={{ originY: 0.5, originX: 0.5 }}
              className="w-8 h-8 rounded-full"
              src={value.image}
              alt="Selected user image"
            />
            <motion.div className="mt-1">
              {/* {value.name} */}
              <motion.div
                variants={{
                  open: { rotate: 180 },
                  closed: { rotate: 0 },
                }}
                transition={{ duration: 0.2 }}
                style={{ originY: 0.58, originX: 0.6 }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="#fff">
                  <path d="M8.71005 11.71L11.3001 14.3C11.6901 14.69 12.3201 14.69 12.7101 14.3L15.3001 11.71C15.9301 11.08 15.4801 10 14.5901 10H9.41005C8.52005 10 8.08005 11.08 8.71005 11.71Z"></path>
                </svg>
              </motion.div>
            </motion.div>
          </div>
        ) : (
          <div className="mt-1 ml-2">
            <LoadingSpinner w={24} h={24} />
          </div>
        )}
      </motion.button>

      <motion.div
        id="dropdownUsers"
        className="absolute z-10 bg-white rounded-lg shadow w-60 dark:bg-gray-800 right-0 top-10"
        ref={dropdownRef}
        variants={{
          open: {
            clipPath: "inset(0% 0% 0% 0% round 10px)",
            transition: {
              type: "spring",
              bounce: 0,
              duration: 0.3,
              delayChildren: 0.1,
              staggerChildren: 0.05,
            },
          },
          closed: {
            clipPath: "inset(10% 50% 90% 50% round 10px)",
            transition: {
              type: "spring",
              bounce: 0,
              duration: 0.1,
            },
          },
        }}
      >
        <motion.ul
          className="h-48 py-2 overflow-y-auto text-gray-400 dark:text-gray-200 bg-gray-800"
          style={{ pointerEvents: isOpen ? "auto" : "none" }}
        >
          {list &&
            list.map((item) => (
              <motion.li key={item.name} variants={itemVariants}>
                <div
                  className="flex items-center px-4 py-2  hover:bg-black dark:hover:text-white cursor-pointer font-semibold"
                  onClick={() => handleItemClick(item)}
                >
                  <img
                    className="w-6 h-6 me-2 rounded-full"
                    src={item.image}
                    alt={item.name}
                  />
                  {item.name}
                </div>
              </motion.li>
            ))}
        </motion.ul>
      </motion.div>
    </motion.nav>
  );
};

export default Dropdown;
