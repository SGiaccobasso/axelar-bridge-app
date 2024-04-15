import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { useAccount, useChainId, useSendTransaction } from "wagmi";
import * as React from "react";
import { parseEther } from "viem";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";

import { getDepositAddress } from "../utils/axelar";
import LoadingButton from "../components/LoadingButton";
import Dropdown from "../components/Dropdown";
import { DropdownItem } from "../types/types";
import { getChain, getEnv } from "../utils/utils";
import Header from "../components/Header";
import Starfield from "../components/StarsBackground";
import localFont from "next/font/local";
import Image from "next/image";
import { CustomConnectBtn } from "../components/CustomConnectBtn";

const petitinhoFont = localFont({ src: "./fonts/Petitinho.ttf" });

const Home: NextPage = () => {
  const chain = useChainId();
  const [isLoadingTx, setIsLoadingTx] = useState(false);
  const {
    data: hash,
    error: errorSendTransaction,
    isPending,
    reset: resetTx,
    sendTransaction,
  } = useSendTransaction();
  const [error, setError] = useState("");
  const [selectedToChain, setSelectedToChain] = useState<DropdownItem | null>(
    null
  );
  const [selectedAsset, setSelectedAsset] = useState<DropdownItem | null>(null);
  const { isConnected } = useAccount();
  const [amountInputValue, setAmountInputValue] = useState<string>("0.1");
  const [destinationAddressValue, setDestinationAddressValue] =
    useState<string>("");

  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (/^\d*\.?\d*$/.test(inputValue) || inputValue === "") {
      setAmountInputValue(inputValue);
    }
  };

  const handleDestinationAddressChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDestinationAddressValue(e.target.value);
  };

  useEffect(() => {
    if (errorSendTransaction) {
      setIsLoadingTx(false);
      setError(errorSendTransaction?.message.split("\n")[0]);
    }
    if (hash) setIsLoadingTx(false);
  }, [errorSendTransaction, isPending]);

  const onClickFinish = () => {
    setError("");
    resetTx();
  };

  const onClickProceed = async () => {
    setIsLoadingTx(true);
    const fromChain = getChain(chain);
    const symbol = selectedAsset?.id;
    const env = getEnv(chain);
    if (
      amountInputValue &&
      selectedToChain?.id &&
      destinationAddressValue &&
      symbol
    )
      try {
        let amount = parseFloat(amountInputValue);
        const data = await getDepositAddress(
          fromChain,
          selectedToChain.id,
          destinationAddressValue,
          symbol,
          env
        );
        sendTransaction({
          to: `0x${data.depositAddress.substring(2)}`,
          value: parseEther(amountInputValue),
        });
      } catch (e: any) {
        setIsLoadingTx(false);
        setError(e?.message);
      }
  };

  return (
    <main
      className={`${petitinhoFont.className} min-h-screen flex items-center justify-center bg-black text-white flex-col`}
    >
      <Starfield
        starCount={1000}
        starColor={[255, 255, 255]}
        speedFactor={0.05}
        backgroundColor="black"
      />
      <Head>
        <title>Token Bridge</title>
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <Header />
      <LayoutGroup>
        <motion.div
          layout
          className="p-6 bg-gray-900 rounded-lg shadow-md w-full max-w-sm border border-blue-600"
        >
          <motion.div className="justify-center w-full flex text-xl text-blue-500">
            {isConnected
              ? !hash &&
                (!isLoadingTx ? (
                  error ? (
                    <motion.div className="text-red-700">
                      ERROR WITH TX
                    </motion.div>
                  ) : (
                    "CREATE TX"
                  )
                ) : (
                  "LOADING TRANSACTION..."
                ))
              : "AXELAR TOKEN BRIDGE"}
          </motion.div>
          {isConnected && !isLoadingTx ? (
            hash ? (
              <AnimatePresence>
                <motion.div className="w-full flex flex-col text-green-400 pt-4 break-all items-center">
                  <motion.img
                    height={100}
                    width={100}
                    src="/assets/icons/check.svg"
                  />
                  <motion.div className="my-5">
                    Transaction submitted!
                  </motion.div>
                  <motion.div className="mt-4 flex w-full justify-end">
                    <LoadingButton onClick={onClickFinish}>ok</LoadingButton>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            ) : error ? (
              <AnimatePresence>
                <motion.div className="w-full my-8 text-red-700">
                  {error}
                </motion.div>
                <div className="mt-4 flex w-full justify-end">
                  <LoadingButton onClick={onClickFinish}>ok</LoadingButton>
                </div>
              </AnimatePresence>
            ) : (
              <>
                <label
                  htmlFor="amount"
                  className="mt-5 block font-medium text-white"
                >
                  Send:
                </label>
                <motion.div className="mt-2 flex md:flex-row gap-4 items-center">
                  <motion.div className="relative flex flex-grow">
                    <input
                      inputMode="decimal"
                      disabled={isLoadingTx}
                      type="text"
                      value={amountInputValue}
                      onChange={handleAmountInputChange}
                      id="amount"
                      placeholder="Enter amount"
                      className="text-right font-medium w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-4 focus:outline-none focus:border-blue-500"
                    />
                    <motion.div className="ml-4 mt-1">
                      <Dropdown
                        option="assets"
                        onSelectValue={setSelectedAsset}
                        value={selectedAsset}
                      />
                    </motion.div>
                  </motion.div>
                </motion.div>
                <label
                  htmlFor="destinationAddress"
                  className="mt-4 block font-medium text-white"
                >
                  To:
                </label>
                <motion.div className="mt-2 flex md:flex-row gap-4 items-center">
                  <motion.div className="relative flex flex-grow">
                    <textarea
                      disabled={isLoadingTx}
                      value={destinationAddressValue}
                      onChange={handleDestinationAddressChange}
                      id="destinationAddress"
                      placeholder="Enter destination address"
                      autoCorrect="off"
                      spellCheck="false"
                      className="h-24 text-right font-medium text-md text-white w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-4 focus:outline-none focus:border-blue-500"
                      style={{ resize: "none" }}
                    />
                    <motion.div className="ml-4 mt-1">
                      <Dropdown
                        option="chains"
                        onSelectValue={setSelectedToChain}
                        value={selectedToChain}
                      />
                    </motion.div>
                  </motion.div>
                </motion.div>

                <motion.div className="mt-10 flex w-full justify-end">
                  <LoadingButton
                    onClick={onClickProceed}
                    disabled={
                      !destinationAddressValue ||
                      !amountInputValue ||
                      parseFloat(amountInputValue) <= 0
                    }
                  >
                    Send
                  </LoadingButton>
                </motion.div>
              </>
            )
          ) : isConnected ? (
            <motion.div className="flex w-full items-center justify-center">
              <Image
                height={100}
                width={100}
                className="m-5"
                alt="axelar logo loading animation"
                src="/assets/animations/logo.svg"
              />
            </motion.div>
          ) : (
            <motion.div className="flex w-full items-center justify-center flex-col">
              <Image
                height={100}
                width={100}
                className="m-5 my-10"
                alt="axelar logo loading animation"
                src="/assets/animations/logo.svg"
              />
              <CustomConnectBtn />
            </motion.div>
          )}
        </motion.div>
      </LayoutGroup>
    </main>
  );
};

export default Home;
