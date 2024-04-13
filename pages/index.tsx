import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { useChainId } from "wagmi";
import * as React from "react";
import { useSendTransaction } from "wagmi";
import { parseEther } from "viem";

import { getDepositAddress } from "../utils/axelar";
import LoadingButton from "../components/LoadingButton";
import Dropdown from "../components/Dropdown";
import { DropdownItem } from "../types/types";
import { getChain, getEnv } from "../utils/utils";
import TxAnimation from "../components/TxAnimation";

const Home: NextPage = () => {
  const chain = useChainId();
  const amountInputRef = useRef<HTMLInputElement>(null);
  const destinationAddressRef = useRef<HTMLInputElement>(null);
  const [isLoadingTxData, setIsLoadingTxData] = useState(false);
  const {
    data: hash,
    error: errorSendTransaction,
    isPending,
    sendTransaction,
  } = useSendTransaction();
  const [error, setError] = useState("");
  const [selectedToChain, setSelectedToChain] = useState<DropdownItem | null>(
    null
  );
  const [selectedAsset, setSelectedAsset] = useState<DropdownItem | null>(null);

  useEffect(() => {
    if (errorSendTransaction)
      setError(errorSendTransaction?.message.split("\n")[0]);
  }, [errorSendTransaction, isPending]);

  const onClickProceed = async () => {
    setError("");
    setIsLoadingTxData(true);
    const fromChain = getChain(chain);
    const amount = amountInputRef.current?.value;
    const symbol = selectedAsset?.id;
    const env = getEnv(chain);
    if (
      amount &&
      selectedToChain?.id &&
      destinationAddressRef.current?.value &&
      symbol
    )
      try {
        const data = await getDepositAddress(
          fromChain,
          selectedToChain.id,
          destinationAddressRef.current?.value,
          symbol,
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
    <div className="min-h-screen flex items-center justify-center bg-gray-800 text-white">
      <Head>
        <title>Token Bridge</title>
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <main className="p-6 bg-gray-900 rounded-lg shadow-md w-full max-w-lg">
        <div className="flex justify-between">
          <div className="h-8 flex gap-4 text-xl font-bold text-center justify-center">
            <img className="w-10 h-10" src="/logos/chains/axelar.png" />
            <div className="mt-1">TOKEN BRIDGE</div>
          </div>
          <ConnectButton />
        </div>

        <label htmlFor="amount" className="mt-8 block font-medium text-white">
          Send:
        </label>
        <div className="mt-2 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex flex-grow">
            <input
              inputMode="decimal"
              disabled={isLoadingTxData}
              type="text"
              ref={amountInputRef}
              id="amount"
              defaultValue={0.00001}
              placeholder="Enter amount"
              className="text-right font-medium w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-4 focus:outline-none focus:border-blue-500"
            />
            <div className="ml-4 mt-1">
              <Dropdown
                option="assets"
                onSelectValue={setSelectedAsset}
                value={selectedAsset}
              />
            </div>
          </div>
        </div>
        <label
          htmlFor="destinationAddress"
          className="mt-4 block font-medium text-white"
        >
          To:
        </label>
        <div className="mt-2 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex flex-grow">
            <input
              disabled={isLoadingTxData}
              type="text"
              ref={destinationAddressRef}
              id="destinationAddress"
              defaultValue="0xb4d04eC2e773A39Ae1C20643EcC2b0b7D094f48a"
              placeholder="Enter destination address"
              className="text-right font-medium text-sm text-white w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-4 focus:outline-none focus:border-blue-500"
            />
            <div className="ml-4 mt-1">
              <Dropdown
                option="chains"
                onSelectValue={setSelectedToChain}
                value={selectedToChain}
              />
            </div>
          </div>
        </div>

        <div className="flex w-full h-10">
          {error && (
            <div className="w-full text-red-700 pt-4">⚠️&nbsp;{error}</div>
          )}
          {hash && (
            <div className="w-full text-green-400 pt-4 break-all">
              Transaction submitted! Hash:&nbsp;{hash}
            </div>
          )}
        </div>
        {/* <TxAnimation
          leftImageUrl="/logos/chains/ethereum.svg "
          movingImageUrl="/logos/assets/usdt.svg "
          rightImageUrl="/logos/chains/polygon.svg "
        /> */}
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
