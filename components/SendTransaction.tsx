import * as React from "react";
import {
  type BaseError,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";

interface TransactionData {
  destinationAddress: `0x${string}`;
  value: string;
}

interface Props {
  data: TransactionData;
}

export function SendTransaction({ data }: Props) {
  const {
    data: hash,
    error,
    isPending,
    sendTransaction,
  } = useSendTransaction();

  sendTransaction({ to: data.destinationAddress, value: parseEther(data.value) });

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  return (
    <div>
      <button disabled={isPending} type="submit">
        {isPending ? "Confirming..." : "Send"}
      </button>
      {hash && <div>Transaction Hash: {hash}</div>}
      {isConfirming && <div>Waiting for confirmation...</div>}
      {isConfirmed && <div>Transaction confirmed.</div>}
      {error && (
        <div>Error: {(error as BaseError).shortMessage || error.message}</div>
      )}
    </div>
  );
}
