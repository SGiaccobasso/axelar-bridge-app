import {
  AxelarAssetTransfer,
  AxelarQueryAPI,
  Environment,
} from "@axelar-network/axelarjs-sdk";

export async function getDestinationAddressAndFee(
  fromChain: string,
  toChain: string,
  destinationAddress: string,
  asset: string,
  amount: number,
  env: Environment
) {
  const axelarQuery = new AxelarQueryAPI({
    environment: env,
  });
  const axelarAssetTransfer = new AxelarAssetTransfer({
    environment: env,
  });

  const { fee } = await axelarQuery.getTransferFee(
    fromChain,
    toChain,
    asset,
    amount
  );

  const depositAddress = await axelarAssetTransfer.getDepositAddress({
    fromChain,
    toChain,
    destinationAddress,
    asset,
  });

  return { fee, depositAddress };
}
