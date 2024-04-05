import {
  AxelarAssetTransfer,
  AxelarQueryAPI,
} from "@axelar-network/axelarjs-sdk";

export async function getDestinationAddressAndFee(
  fromChain,
  toChain,
  destinationAddress,
  asset,
  amount,
  env
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
  // { fee: { denom: 'uausdc', amount: '150000' } }
}
