import React, { useState, useEffect, useRef } from "react";
import { DropdownItem } from "../types/types";
import useAxelarData from "../hooks/useAxelarData";

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
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className=" transition duration-100 hover:cursor-pointer opacity-100 hover:opacity-40 active:scale-105"
      >
        {!isLoading && !error && value && (
          <div className="flex py-2 font-semibold" ref={dropdownBtnRef}>
            <img
              className="w-6 h-6 me-2 rounded-full"
              src={value.image}
              alt="Selected user image"
            />
            {value.name}
            <svg
              viewBox="0 0 24 24"
              width="24"
              fill="#ffffff"
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
            >
              <path d="M8.71005 11.71L11.3001 14.3C11.6901 14.69 12.3201 14.69 12.7101 14.3L15.3001 11.71C15.9301 11.08 15.4801 10 14.5901 10H9.41005C8.52005 10 8.08005 11.08 8.71005 11.71Z"></path>
            </svg>
          </div>
        )}
      </button>

      {isOpen && (
        <div
          id="dropdownUsers"
          className="absolute z-10 bg-white rounded-lg shadow w-60 dark:bg-gray-700"
          ref={dropdownRef}
        >
          <ul
            className="h-48 py-2 overflow-y-auto text-gray-700 dark:text-gray-200"
            aria-labelledby="dropdownUsersButton"
          >
            {list &&
              list.map((item) => (
                <li key={item.name}>
                  <div
                    className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer font-semibold"
                    onClick={() => handleItemClick(item)}
                  >
                    <img
                      className="w-6 h-6 me-2 rounded-full"
                      src={item.image}
                      alt={item.name}
                    />
                    {item.name}
                  </div>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
