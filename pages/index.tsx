import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import { Environment, importChains } from "@axelar-network/axelarjs-sdk";

import { getEstimatedFee, transfer } from "../axelar";
import { useEffect, useRef } from "react";
import { useChainId } from "wagmi";
import { useQuery } from "@tanstack/react-query";

const Home: NextPage = () => {
  const toChainsDropdownRef = useRef<HTMLSelectElement>(null);
  const chain = useChainId();
  const amountInputRef = useRef<HTMLInputElement>(null);
  const symbolInputRef = useRef<HTMLInputElement>(null);
  const destinationAddressRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      return await importChains({
        environment: chain === 1 ? Environment.MAINNET : Environment.TESTNET,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const {
    data: chainsList,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["chains"],
    queryFn: fetchData,
  });

  useEffect(() => {
    refetch();
  }, [chain]);

  const handleEstimateGasButtonClick = async () => {
    const fromChain = chain === 1 ? "ethereum" : "base-sepolia";
    const amount = amountInputRef.current?.value;
    const symbol = symbolInputRef.current?.value;

    try {
      const fee = getEstimatedFee(
        fromChain,
        toChainsDropdownRef.current?.value,
        symbol,
        amount,
        chain === 1 ? Environment.MAINNET : Environment.TESTNET
      );
      console.log("fee", await fee);
    } catch (error) {
      console.error(error);
    }
  };

  const handleGetDepositAddressButtonClick = () => {
    const fromChain = chain === 1 ? "ethereum" : "base-sepolia";
    const env = chain === 1 ? Environment.MAINNET : Environment.TESTNET;

    const symbol = symbolInputRef.current?.value;
    try {
      const depAdd = transfer(
        symbol,
        fromChain,
        toChainsDropdownRef.current?.value,
        destinationAddressRef.current?.value,
        env
      );
      console.log("depAdd", depAdd);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <Head>
        <title>Token Bridge</title>
        {/* <link href="/favicon.ico" rel="icon" /> */}
      </Head>

      <main>
        <ConnectButton />
        <div className="bg-slate-100">
          <select ref={toChainsDropdownRef}>
            {chainsList &&
              chainsList.map((item) => (
                <option
                  key={item?.chainName}
                  value={
                    item?.chainIdentifier[
                      chain === 1 ? Environment.MAINNET : Environment.TESTNET
                    ]
                  }
                >
                  {item?.chainName}
                </option>
              ))}
          </select>
        </div>
        <input
          type="number"
          ref={amountInputRef}
          defaultValue={1}
          placeholder="Enter amount"
        />
        <input
          type="text"
          ref={symbolInputRef}
          defaultValue="matic"
          placeholder="Enter text"
        />
        <input
          type="text"
          ref={destinationAddressRef}
          defaultValue="0xb4d04eC2e773A39Ae1C20643EcC2b0b7D094f48a"
          placeholder="Enter destination address"
        />
        <button onClick={handleGetDepositAddressButtonClick}>
          GET DEPOSIT ADDRESS
        </button>
        <button onClick={handleEstimateGasButtonClick}>ESTIMATE GAS FEE</button>
      </main>
    </div>
  );
};

export default Home;
