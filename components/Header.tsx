import { ConnectButton } from "@rainbow-me/rainbowkit";
import React from "react";

const Header = () => {
  return (
    <header className="bg-gray-900 flex text-white py-4 w-full fixed top-0 z-50">
      <div className="flex justify-between w-full px-8">
        <div className="h-8 flex gap-4 text-xl font-bold text-center justify-center">
          <img className="w-10 h-10" src="/logos/chains/axelar.png" />
          <div className="mt-1.5">TOKEN BRIDGE</div>
        </div>

        <ConnectButton
          accountStatus={{
            smallScreen: "avatar",
            largeScreen: "full",
          }}
        />
      </div>
    </header>
  );
};

export default Header;
