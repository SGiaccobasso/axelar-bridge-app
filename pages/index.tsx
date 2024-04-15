import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useAccount, useChainId, useSendTransaction } from "wagmi";
import * as React from "react";
import { parseEther } from "viem";
import { LayoutGroup, motion } from "framer-motion";
import localFont from "next/font/local";

import { getDepositAddress } from "../utils/axelar";
import LoadingButton from "../components/LoadingButton";
import Dropdown from "../components/Dropdown";
import { DropdownItem } from "../types/types";
import { getChain, getEnv, isNumericInput } from "../utils/utils";
import Header from "../components/Header";
import Starfield from "../components/StarsBackground";
import LoadingStepContent from "../components/LoadingStepContent";
import DisconnectedContent from "../components/DisconnectedContent";
import SuccessContent from "../components/SuccessContent";
import ErrorContent from "../components/ErrorContent";

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

  const isButtonDisabled =
    !destinationAddressValue ||
    !amountInputValue ||
    parseFloat(amountInputValue) <= 0 ||
    !selectedToChain?.id ||
    !selectedAsset?.id;

  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (isNumericInput(inputValue) || inputValue === "") {
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
    const env = getEnv(chain);
    try {
      const data = await getDepositAddress(
        fromChain,
        selectedToChain?.id,
        destinationAddressValue,
        selectedAsset?.id,
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

  const disconnectedStep = !isConnected;
  const createTxStep = isConnected && !isLoadingTx && !hash && !error;
  const successStep = isConnected && !isLoadingTx && hash && !error;
  const errorStateStep = isConnected && !!error;
  const loadingStep = isConnected && isLoadingTx && !hash && !error;

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
          {successStep && <SuccessContent onClickAction={onClickFinish} />}
          {errorStateStep && (
            <ErrorContent error={error} onClickAction={onClickFinish} />
          )}
          {createTxStep && (
            <>
              <motion.div className="justify-center w-full flex text-xl text-blue-500">
                CREATE TX
              </motion.div>
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
                  disabled={isButtonDisabled}
                >
                  Send
                </LoadingButton>
              </motion.div>
            </>
          )}
          {loadingStep && <LoadingStepContent />}
          {disconnectedStep && <DisconnectedContent />}
        </motion.div>
      </LayoutGroup>
    </main>
  );
};

export default Home;
