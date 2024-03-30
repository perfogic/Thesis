import { FC, useEffect, useState } from "react";
import cn from "classnames/bind";
import { Button } from "components/Button";
import TooltipContainer from "components/ConnectWallet/TooltipContainer";
import useConfigReducer from "hooks/useConfigReducer";
import styles from "./index.module.scss";
import MyWallets from "./MyWallet";
import QRGeneratorModal, { QRGeneratorInfo } from "./QRGenerator";
import Connected from "./Connected";
import ChooseWalletModal from "./ChooseWallet";
import useLoadTokens from "hooks/useLoadTokens";
import { CustomChainInfo, WalletType } from "@oraichain/oraidex-common";
import { displayToast, TToastType } from "components/Toasts/Toast";
import { connectSnap } from "@leapwallet/cosmos-snap-provider";
import {
  cosmosNetworks,
  isEmptyObject,
  getStorageKey,
  keplrCheck,
  owalletCheck,
  sleep,
  getListAddressCosmos,
  bitcoinNetworks,
} from "helper";
import OwalletImage from "assets/images/owallet-logo.png";
import BitcoinWallet from "assets/images/image-btc.png";

import KeplrImage from "assets/images/keplr.png";
import TronWalletImage from "assets/images/tronlink.jpg";
import DisconnectModal from "./Disconnect";
import LoadingBox from "components/LoadingBox";
import { isMobile } from "@walletconnect/browser-utils";
import { useResetBalance, Wallet } from "./useResetBalance";
import { initClient } from "libs/utils";

const cx = cn.bind(styles);

interface ModalProps {}
export enum WALLET_TYPES {
  KEPLR = "KEPLR",
  OWALLET = "OWALLET",
  BITCOIN = "BITCOIN",
  PHANTOM = "PHANTOM",
  LEDGER = "LEDGER",
  GOOGLE = "GOOGLE",
  APPLE = "APPLE",
  PHONE = "PHONE",
}

interface NetworkItem extends CustomChainInfo {
  address: string;
}

export interface WalletItem {
  id: number;
  name: string;
  code: WALLET_TYPES;
  icon: string;
  totalUsd: number;
  isOpen: boolean;
  isConnect: boolean;
  networks: NetworkItem[];
  address?: string;
}

export enum METHOD_WALLET_TYPES {
  START = "START",
  CONNECT = "CONNECT",
  DISCONNECT = "DISCONNECT",
  PROCESSING = "PROCESSING",
}
export enum CONNECT_STATUS {
  SELECTING = "SELECTING",
  PROCESSING = "PROCESSING",
  DONE = "DONE",
  ERROR = "ERROR",
}
const ConnectWallet: FC<ModalProps> = ({}) => {
  const [theme] = useConfigReducer("theme");
  const [isShowMyWallet, setIsShowMyWallet] = useState(false);
  const [isShowChooseWallet, setIsShowChooseWallet] = useState(false);
  const [isShowDisconnect, setIsShowDisconnect] = useState(false);
  const [cosmosAddress, setCosmosAddress] = useConfigReducer("cosmosAddress");
  const [btcAddress, setBtcAddress] = useConfigReducer("btcAddress");
  const [oraiAddress, setOraiAddress] = useConfigReducer("address");
  const walletType = getStorageKey() as WalletType;
  const [walletTypeStore, setWalletTypeStore] =
    useConfigReducer("walletTypeStore");
  const { handleResetBalance } = useResetBalance();
  const checkWallet = (type: "name" | "icon" | "walletType" = "name"): any => {
    if (isMobile() || walletTypeStore === "owallet") {
      if (type === "icon") return OwalletImage;
      if (type === "walletType") return WALLET_TYPES.OWALLET;
      return "Owallet";
    }
    if (walletTypeStore === "keplr") {
      if (type === "icon") return KeplrImage;
      if (type === "walletType") return WALLET_TYPES.KEPLR;
      return "Keplr";
    }
  };

  const OwalletInfo = {
    id: 2,
    name: checkWallet(),
    code: checkWallet("walletType"),
    icon: checkWallet("icon"),
    totalUsd: 0,
    isOpen: false,
    isConnect: !isEmptyObject(cosmosAddress),
    networks: cosmosNetworks.map((item: any, index) => {
      if (!isEmptyObject(cosmosAddress)) {
        item.address = cosmosAddress[item.chainId];
        return item;
      } else {
        item.address = undefined;
        return item;
      }
    }),
  };

  useEffect(() => {
    if (!oraiAddress || !btcAddress) {
      let arrResetBalance: Wallet[] = [];
      if (!oraiAddress) arrResetBalance.push("keplr");
      if (!btcAddress) arrResetBalance.push("bitcoin");
      arrResetBalance.length && handleResetBalance(arrResetBalance);
    }
  }, [oraiAddress, btcAddress]);

  let walletInit = [
    OwalletInfo,
    {
      id: 4,
      name: "Bitcoin",
      code: WALLET_TYPES.BITCOIN,
      icon: BitcoinWallet,
      totalUsd: 0,
      isOpen: false,
      isConnect: !!btcAddress,
      networks: bitcoinNetworks.map((item: any) => {
        item.address = btcAddress;
        return item;
      }),
    },
  ];

  if (isMobile()) {
    walletInit = [
      {
        ...OwalletInfo,
        networks: [
          ...OwalletInfo.networks,
          ...bitcoinNetworks.map((item: any) => {
            item.address = btcAddress;
            return item;
          }),
        ],
      },
    ];
  }

  const [wallets, setWallets] = useState<WalletItem[]>(walletInit);
  const [connectStatus, setConnectStatus] = useState(CONNECT_STATUS.SELECTING);
  const loadTokenAmounts = useLoadTokens();
  const [QRUrlInfo, setQRUrlInfo] = useState<QRGeneratorInfo>({
    url: "",
    icon: null,
    name: "",
    address: "",
  });
  const [walletTypeActive, setWalletTypeActive] = useState(null);
  const isCheckKeplr = !isEmptyObject(cosmosAddress) && keplrCheck("keplr");
  const isCheckOwallet =
    !isEmptyObject(cosmosAddress) && owalletCheck("owallet");

  const connectBitcoin = async () => {
    try {
      const btcAddress = await window.Bitcoin.getAddress();
      if (!btcAddress) {
        displayToast(TToastType.WALLET_FAILED, {
          message: "Please install Owallet to get address bitcoin!",
        });
        throw Error("Please install Owallet to get address bitcoin!");
      }

      setBtcAddress(btcAddress);
      loadTokenAmounts({ btcAddress });
    } catch (ex) {
      throw new Error("Connect Bitcoin failed");
    }
  };

  const isConnected = !!btcAddress || !isEmptyObject(cosmosAddress);

  useEffect(() => {
    (async () => {
      if (oraiAddress) {
        const { listAddressCosmos } = await getListAddressCosmos(oraiAddress);

        setCosmosAddress(listAddressCosmos);
      }
    })();
    setWalletTypeStore(walletType);
  }, []);

  useEffect(() => {
    if (!!oraiAddress) {
      (async () => {
        if (walletTypeStore === "owallet") {
          await connectDetectOwallet();
        } else if (walletTypeStore === "keplr") {
          await connectDetectKeplr();
        }
      })();
    }

    return () => {};
  }, [oraiAddress]);
  useEffect(() => {
    const walletData = walletInit.map((item) => {
      if (item.code === walletTypeActive) {
        item.isOpen = true;
        return item;
      }
      return item;
    });
    console.log(
      "🚀 ~ file: index.tsx:265 ~ walletData ~ walletData:",
      walletData
    );
    setWallets(walletData);
    return () => {};
  }, [cosmosAddress, btcAddress, walletTypeActive]);

  const connectKeplr = async (type: any) => {
    try {
      setWalletTypeStore(type);
      await initClient();

      const oraiAddr = await window.Keplr.getKeplrAddr();
      if (!oraiAddr) return;
      loadTokenAmounts({ oraiAddress: oraiAddr });
      setOraiAddress(oraiAddr);
      const { listAddressCosmos } = await getListAddressCosmos(oraiAddr);
      setCosmosAddress(listAddressCosmos);
    } catch (error) {
      console.log(
        "🚀 ~ file: index.tsx:193 ~ connectKeplr ~ error: 222",
        error
      );
      throw new Error(error);
    }
  };
  const disconnectKeplr = async () => {
    try {
      window.Keplr.disconnect();
      handleResetBalance(["keplr"]);
      setCosmosAddress({});
      setOraiAddress(undefined);
    } catch (ex) {
      console.log(ex);
    }
  };
  const disconnectBitcoin = async () => {
    try {
      // window.Bitcoin.disconnect();
      handleResetBalance(["bitcoin"]);
      setBtcAddress("");
    } catch (ex) {
      console.log(ex);
    }
  };

  const startKeplr = async () => {
    if (
      !isEmptyObject(cosmosAddress) &&
      walletTypeActive === WALLET_TYPES.KEPLR &&
      isCheckKeplr
    ) {
      setConnectStatus(CONNECT_STATUS.DONE);
      return;
    }
    await requestMethod(WALLET_TYPES.KEPLR, METHOD_WALLET_TYPES.CONNECT);
    return;
  };

  const startOwallet = async () => {
    if (
      !isEmptyObject(cosmosAddress) &&
      walletTypeActive === WALLET_TYPES.OWALLET &&
      isCheckOwallet
    ) {
      setConnectStatus(CONNECT_STATUS.DONE);
      return;
    }
    await requestMethod(WALLET_TYPES.OWALLET, METHOD_WALLET_TYPES.CONNECT);
    return;
  };
  const startBitcoin = async () => {
    if (!btcAddress && walletTypeActive === WALLET_TYPES.BITCOIN) {
      setConnectStatus(CONNECT_STATUS.DONE);
      return;
    }
    await requestMethod(WALLET_TYPES.BITCOIN, METHOD_WALLET_TYPES.CONNECT);
    return;
  };

  const handleConnectWallet = async (cb) => {
    try {
      setConnectStatus(CONNECT_STATUS.PROCESSING);
      await sleep(2000);
      await cb();
      setConnectStatus(CONNECT_STATUS.DONE);
      return;
    } catch (error) {
      console.log(
        "🚀 ~ file: index.tsx:350 ~ handleConnectWal ~ error:",
        error
      );
      setConnectStatus(CONNECT_STATUS.ERROR);
    }
  };

  const connectDetectOwallet = async () => {
    await connectKeplr("owallet");
  };
  const connectDetectKeplr = async () => {
    await connectKeplr("keplr");
  };

  const requestMethod = async (
    walletType: WALLET_TYPES,
    method: METHOD_WALLET_TYPES
  ) => {
    setWalletTypeActive(walletType);
    switch (walletType) {
      case WALLET_TYPES.OWALLET:
        if (method === METHOD_WALLET_TYPES.START) {
          await startOwallet();
        } else if (method === METHOD_WALLET_TYPES.CONNECT) {
          await handleConnectWallet(connectDetectOwallet);
        } else if (method === METHOD_WALLET_TYPES.DISCONNECT) {
          await disconnectKeplr();
        }
        break;
      case WALLET_TYPES.BITCOIN:
        if (method === METHOD_WALLET_TYPES.START) {
          await startBitcoin();
        } else if (method === METHOD_WALLET_TYPES.CONNECT) {
          await handleConnectWallet(connectBitcoin);
        } else if (method === METHOD_WALLET_TYPES.DISCONNECT) {
          await disconnectBitcoin();
        }
        break;

      case WALLET_TYPES.KEPLR:
        if (method === METHOD_WALLET_TYPES.START) {
          await startKeplr();
        } else if (method === METHOD_WALLET_TYPES.CONNECT) {
          await handleConnectWallet(connectDetectKeplr);
        } else if (method === METHOD_WALLET_TYPES.DISCONNECT) {
          await disconnectKeplr();
        }
        break;
      default:
        break;
    }
  };
  const toggleShowNetworks = (id: number) => {
    const walletsModified = wallets.map((w) => {
      if (w.id === id) w.isOpen = !w.isOpen;
      return w;
    });
    setWallets(walletsModified);
  };
  const checkAddressByWalletType = (walletType: WALLET_TYPES) => {
    if (
      walletType === WALLET_TYPES.KEPLR ||
      walletType === WALLET_TYPES.OWALLET
    ) {
      return oraiAddress;
    } else if (walletType === WALLET_TYPES.BITCOIN) {
      return btcAddress;
    }
  };
  const handleDisconnectWallet = (walletType) => {
    setIsShowDisconnect(true);
    setIsShowMyWallet(false);
    setWalletTypeActive(walletType);
  };
  const approveDisconnectWallet = async (walletType) => {
    await requestMethod(walletType, METHOD_WALLET_TYPES.DISCONNECT);
    setIsShowDisconnect(false);
    setIsShowMyWallet(true);
  };
  return (
    <div className={cx("connect-wallet-container", theme)}>
      {!isConnected ? (
        <Button
          type="primary"
          onClick={() => {
            setConnectStatus(CONNECT_STATUS.SELECTING);
            setIsShowChooseWallet(true);
          }}
        >
          Connect Wallet
        </Button>
      ) : (
        <TooltipContainer
          placement="bottom-end"
          visible={isShowMyWallet}
          setVisible={setIsShowMyWallet}
          content={
            <LoadingBox loading={connectStatus === CONNECT_STATUS.PROCESSING}>
              <MyWallets
                handleAddWallet={() => {
                  setConnectStatus(CONNECT_STATUS.SELECTING);
                  setIsShowChooseWallet(true);
                  setIsShowMyWallet(false);
                  setWalletTypeActive(null);
                }}
                toggleShowNetworks={toggleShowNetworks}
                handleLogoutWallets={handleDisconnectWallet}
                handleLoginWallets={(walletType) =>
                  requestMethod(walletType, METHOD_WALLET_TYPES.CONNECT)
                }
                setQRUrlInfo={setQRUrlInfo}
                setIsShowMyWallet={setIsShowMyWallet}
                wallets={wallets}
              />
            </LoadingBox>
          }
        >
          <Connected
            setIsShowMyWallet={() => {
              setWalletTypeActive(null);
              setIsShowMyWallet(true);
            }}
          />
        </TooltipContainer>
      )}
      {isShowChooseWallet && !isMobile() ? (
        <ChooseWalletModal
          connectStatus={connectStatus}
          connectToWallet={(walletType) =>
            requestMethod(walletType, METHOD_WALLET_TYPES.START)
          }
          close={() => {
            setIsShowChooseWallet(false);
          }}
          cancel={() => {
            setConnectStatus(CONNECT_STATUS.SELECTING);
          }}
          tryAgain={async (walletType) => {
            await requestMethod(walletType, METHOD_WALLET_TYPES.CONNECT);
          }}
          address={checkAddressByWalletType(walletTypeActive)}
        />
      ) : null}
      {isShowDisconnect && !isMobile() && (
        <DisconnectModal
          close={() => {
            setIsShowDisconnect(false);
            setIsShowMyWallet(true);
          }}
          approve={approveDisconnectWallet}
          walletActive={wallets.find(
            (item, index) => item.code === walletTypeActive
          )}
          address={checkAddressByWalletType(walletTypeActive)}
        />
      )}
      {QRUrlInfo.url ? (
        <QRGeneratorModal
          url={QRUrlInfo.url}
          name={QRUrlInfo.name}
          icon={QRUrlInfo.icon}
          address={QRUrlInfo.address}
          close={() => setQRUrlInfo({ ...QRUrlInfo, url: "" })}
        />
      ) : null}
    </div>
  );
};

export default ConnectWallet;
