import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import { Environment, importChains } from "@axelar-network/axelarjs-sdk";
import { useEffect, useRef, useState } from "react";
import { useChainId } from "wagmi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";

import { getDepositAddress } from "../axelar";

const Home: NextPage = () => {
  const toChainsDropdownRef = useRef<HTMLSelectElement>(null);
  const chain = useChainId();
  const amountInputRef = useRef<HTMLInputElement>(null);
  const symbolInputRef = useRef<HTMLInputElement>(null);
  const destinationAddressRef = useRef<HTMLInputElement>(null);
  const [isLoadingTxData, setIsLoadingTxData] = useState(false);
  const {
    data: hash,
    error: errorSendTransaction,
    isPending,
    sendTransaction,
  } = useSendTransaction();
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const txReceipt = useWaitForTransactionReceipt({
    hash,
  });

  const fetchData = async () => {
    try {
      return await importChains({
        environment: chain === 1 ? Environment.MAINNET : Environment.TESTNET,
      });
    } catch (e) {
      setError(e.message);
    }
  };

  const {
    data: chainsList,
    isLoading,
    error: e,
  } = useQuery({
    queryKey: ["chains"],
    queryFn: fetchData,
  });

  useEffect(() => {
    if (!isLoading) queryClient.invalidateQueries({ queryKey: ["chains"] });
  }, [chain, isLoading]);

  useEffect(() => {
    if (errorSendTransaction)
      setError(errorSendTransaction?.message.split("\n")[0]);
  }, [errorSendTransaction, isPending]);

  const onClickProceed = async () => {
    setError("");
    setIsLoadingTxData(true);
    const fromChain = chain === 1 ? "ethereum" : "base-sepolia";
    const amount = amountInputRef.current?.value;
    const symbol = symbolInputRef.current?.value;
    const env = chain === 1 ? Environment.MAINNET : Environment.TESTNET;
    if (
      amount &&
      toChainsDropdownRef.current?.value &&
      destinationAddressRef.current?.value &&
      symbol
    )
      try {
        const data = await getDepositAddress(
          fromChain,
          toChainsDropdownRef.current?.value,
          destinationAddressRef.current?.value,
          symbol,
          parseFloat(amount),
          env
        );
        setIsLoadingTxData(false);
        sendTransaction({
          to: `0x${data.depositAddress.substring(2)}`,
          value: parseEther(amount),
        });
      } catch (e) {
        setIsLoadingTxData(false);
        setError(e.message);
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Head>
        <title>Token Bridge</title>
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
            Select Destination Chain
          </label>
          <select
            disabled={isLoadingTxData}
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
            disabled={isLoadingTxData}
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
              Token Symbol
            </label>
            <input
              disabled={isLoadingTxData}
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
              disabled={isLoadingTxData}
              type="number"
              ref={amountInputRef}
              id="amount"
              defaultValue={1}
              placeholder="Enter amount"
              className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {error && (
          <div className="w-full text-red-700 pt-4">⚠️&nbsp;{error}</div>
        )}
        <div className="mt-4 flex w-full justify-end">
          <button
            disabled={isLoadingTxData}
            onClick={onClickProceed}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600 w-40"
          >
            {isLoadingTxData ? (
              <>
                <svg
                  aria-hidden="true"
                  role="status"
                  className="inline mr-2 w-4 h-4 text-gray-200 animate-spin dark:text-gray-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  ></path>
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="#FFFFFF"
                  ></path>
                </svg>
                Loading...
              </>
            ) : (
              "Send"
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

export default Home;
