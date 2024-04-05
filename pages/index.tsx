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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Head>
        <title>Token Bridge</title>
        {/* <link href="/favicon.ico" rel="icon" /> */}
      </Head>

      <main className="p-6 bg-white rounded-lg shadow-md w-full max-w-lg">
        <div className="flex justify-center">
          <ConnectButton />
        </div>
        <div className="mt-4">
          <label
            htmlFor="chains"
            className="block text-sm font-medium text-gray-700"
          >
            Select Chain
          </label>
          <select
            ref={toChainsDropdownRef}
            id="chains"
            className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:border-blue-500"
          >
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
        <div className="mt-4">
          <label
            htmlFor="destinationAddress"
            className="block text-sm font-medium text-gray-700"
          >
            Destination Address
          </label>
          <input
            type="text"
            ref={destinationAddressRef}
            id="destinationAddress"
            defaultValue="0xb4d04eC2e773A39Ae1C20643EcC2b0b7D094f48a"
            placeholder="Enter destination address"
            className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mt-4 flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2">
            <label
              htmlFor="symbol"
              className="block text-sm font-medium text-gray-700"
            >
              Symbol
            </label>
            <input
              type="text"
              ref={symbolInputRef}
              id="symbol"
              defaultValue="matic"
              placeholder="Enter text"
              className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="w-full md:w-1/2">
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700"
            >
              Amount
            </label>
            <input
              type="number"
              ref={amountInputRef}
              id="amount"
              defaultValue={1}
              placeholder="Enter amount"
              className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div className="mt-4 flex w-full justify-between">
          <button
            onClick={handleGetDepositAddressButtonClick}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
          >
            GET DEPOSIT ADDRESS
          </button>
          <button
            onClick={handleEstimateGasButtonClick}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
          >
            ESTIMATE GAS FEE
          </button>
        </div>
      </main>
    </div>
  );
};

export default Home;
