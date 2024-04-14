import { ConnectButton } from "@rainbow-me/rainbowkit";
import LoadingButton from "./LoadingButton";

export const CustomConnectBtn = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");
        return (
          <div
            {...(!ready && {
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <LoadingButton onClick={openConnectModal}>
                    Connect Wallet
                  </LoadingButton>
                );
              }
              if (chain.unsupported) {
                return (
                  <LoadingButton onClick={openChainModal}>
                    Wrong network
                  </LoadingButton>
                );
              }
              return (
                <div style={{ display: "flex", gap: 12 }}>
                  <LoadingButton onClick={openChainModal}>
                    <div className="flex justify-between items-center">
                      {chain.hasIcon && (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: 20,
                            height: 20,
                            borderRadius: 999,
                            overflow: "hidden",
                            marginRight: 14,
                          }}
                        >
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? "Chain icon"}
                              src={chain.iconUrl}
                              style={{ width: 20, height: 20 }}
                            />
                          )}
                        </div>
                      )}
                      {chain.name}
                    </div>
                  </LoadingButton>
                  <LoadingButton onClick={openAccountModal}>
                    {account.displayName}
                    {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ""}
                  </LoadingButton>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
