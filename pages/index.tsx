import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import { Environment, importChains } from "@axelar-network/axelarjs-sdk";
import { useEffect, useRef, useState } from "react";
import { useChainId } from "wagmi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useSendTransaction } from "wagmi";
import { parseEther } from "viem";

import { getDepositAddress } from "../axelar";
import LoadingButton from "../components/LoadingButton";

const getEnv = (chainId: Number) =>
  chainId === 1 ? Environment.MAINNET : Environment.TESTNET;

const getChain = (chainId: Number) =>
  chainId === 1 ? "ethereum" : "base-sepolia";

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

  const fetchData = async () => {
    try {
      return await importChains({
        environment: getEnv(chain),
      });
    } catch (e: any) {
      setError(e?.message);
    }
  };

  const { data: chainsList, isLoading } = useQuery({
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
    const fromChain = getChain(chain);
    const amount = amountInputRef.current?.value;
    const symbol = symbolInputRef.current?.value;
    const env = getEnv(chain);
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
      } catch (e: any) {
        setIsLoadingTxData(false);
        setError(e?.message);
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Head>
        <title>Token Bridge</title>
      </Head>

      <main className="p-6 bg-white rounded-lg shadow-md w-full max-w-lg">
        <div className="flex">
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
                  value={item?.chainIdentifier[getEnv(chain)]}
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
              defaultValue="eth"
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
              defaultValue={0.00001}
              placeholder="Enter amount"
              className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {error && (
          <div className="w-full text-red-700 pt-4">⚠️&nbsp;{error}</div>
        )}
        {hash && (
          <div className="w-full text-green-700 pt-4 break-all">
            Transaction submited! Hash:&nbsp;{hash}
          </div>
        )}
        <div className="mt-4 flex w-full justify-end">
          <LoadingButton onClick={onClickProceed} isLoading={isLoadingTxData}>
            Send
          </LoadingButton>
        </div>
      </main>
    </div>
  );
};

export default Home;
