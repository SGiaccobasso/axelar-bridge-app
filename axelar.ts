import {
  AxelarAssetTransfer,
  AxelarQueryAPI,
} from "@axelar-network/axelarjs-sdk";

export async function getEstimatedFee(fromChain, toChain, asset, amount, env) {
  const axelarQuery = new AxelarQueryAPI({
    environment: env,
  });

  const fee = await axelarQuery.getTransferFee(
    fromChain,
    toChain,
    asset,
    amount
  );
  return fee;
  // returns  { fee: { denom: 'uausdc', amount: '150000' } }
}

export async function transfer(
  asset,
  fromChain,
  toChain,
  destinationAddress,
  env
) {
  console.log(
    "asset,fromChain,toChain,  destinationAddress,env",
    asset,
    fromChain,
    toChain,
    destinationAddress,
    env
  );
  const axelarAssetTransfer = new AxelarAssetTransfer({
    environment: env,
  });
  return axelarAssetTransfer.getDepositAddress({
    fromChain,
    toChain,
    destinationAddress,
    asset,
  });
}
