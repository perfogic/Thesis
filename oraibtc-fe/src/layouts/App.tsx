import {
  IBC_WASM_CONTRACT,
  WEBSOCKET_RECONNECT_ATTEMPTS,
  WEBSOCKET_RECONNECT_INTERVAL,
} from "@oraichain/oraidex-common";
import { isMobile } from "@walletconnect/browser-utils";
import { TToastType, displayToast } from "components/Toasts/Toast";
import { network } from "config/networks";
import { ThemeProvider } from "context/theme-context";
import { getListAddressCosmos, getNetworkGasPrice } from "helper";
import useConfigReducer from "hooks/useConfigReducer";
import useLoadTokens from "hooks/useLoadTokens";
import useWalletReducer from "hooks/useWalletReducer";
import Keplr from "libs/keplr";
import {
  buildUnsubscribeMessage,
  buildWebsocketSendMessage,
  processWsResponseMsg,
} from "libs/utils";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useWebSocket from "react-use-websocket";
import routes from "routes";
import { persistor } from "store/configure";
import { PERSIST_VER } from "store/constants";
import Menu from "./Menu";
import "./index.scss";
import { NoticeBanner } from "./NoticeBanner";
import Sidebar from "./Sidebar";

const App = () => {
  const [address, setOraiAddress] = useConfigReducer("address");
  const [btcAddress, setBtcAddress] = useConfigReducer("btcAddress");
  const [walletTypeStore] = useConfigReducer("walletTypeStore");
  const [, setStatusChangeAccount] = useConfigReducer("statusChangeAccount");
  const loadTokenAmounts = useLoadTokens();
  const [persistVersion, setPersistVersion] =
    useConfigReducer("persistVersion");
  const [theme] = useConfigReducer("theme");
  const [walletByNetworks] = useWalletReducer("walletsByNetwork");
  const [, setCosmosAddress] = useConfigReducer("cosmosAddress");
  const mobileMode = isMobile();
  const navigate = useNavigate();
  // useTronEventListener();

  //Public API that will echo messages sent to it back to the client
  const { sendJsonMessage, lastJsonMessage } = useWebSocket(
    `wss://${new URL(network.rpc).host}/websocket`, // only get rpc.orai.io
    {
      onOpen: () => {
        console.log("opened websocket, subscribing...");
        // subscribe to IBC Wasm case
        sendJsonMessage(
          buildWebsocketSendMessage(
            `wasm._contract_address = '${IBC_WASM_CONTRACT}' AND wasm.action = 'receive_native' AND wasm.receiver = '${address}'`
          ),
          true
        );
        // sendJsonMessage(buildWebsocketSendMessage(`coin_received.receiver = '${address}'`), true);
        // subscribe to MsgSend and MsgTransfer event case
        // sendJsonMessage(buildWebsocketSendMessage(`coin_spent.spender = '${address}'`, 2), true);
        // subscribe to cw20 contract transfer & send case
        // sendJsonMessage(buildWebsocketSendMessage(`wasm.to = '${address}'`, 3), true);
        // sendJsonMessage(buildWebsocketSendMessage(`wasm.from = '${address}'`, 4), true);
      },
      onClose: () => {
        console.log("unsubscribe all clients");
        sendJsonMessage(buildUnsubscribeMessage());
      },
      onReconnectStop(numAttempts) {
        // if cannot reconnect then we unsubscribe all
        if (numAttempts === WEBSOCKET_RECONNECT_ATTEMPTS) {
          console.log("reconnection reaches above limit. Unsubscribe to all!");
          sendJsonMessage(buildUnsubscribeMessage());
        }
      },
      shouldReconnect: (closeEvent) => true,
      reconnectAttempts: WEBSOCKET_RECONNECT_ATTEMPTS,
      reconnectInterval: WEBSOCKET_RECONNECT_INTERVAL,
    }
  );

  // this is used for debugging only
  useEffect(() => {
    const tokenDisplay = processWsResponseMsg(lastJsonMessage);
    if (tokenDisplay) {
      displayToast(TToastType.TX_INFO, {
        message: `You have received ${tokenDisplay}`,
      });
      loadTokenAmounts({ oraiAddress: address });
    }
  }, [lastJsonMessage]);

  // move to bitcoin-dashboard from start
  useEffect(() => {
    navigate("/bitcoin-dashboard?tab=pending_deposits");
  }, []);

  // clear persist storage when update version
  useEffect(() => {
    const isClearPersistStorage =
      persistVersion === undefined || persistVersion !== PERSIST_VER;
    const clearPersistStorage = () => {
      persistor.pause();
      persistor.flush().then(() => {
        return persistor.purge();
      });
      setPersistVersion(PERSIST_VER);
    };

    if (isClearPersistStorage) clearPersistStorage();

    // if (window.keplr && !isMobile()) {
    //   keplrGasPriceCheck();
    // }
  }, []);

  useEffect(() => {
    // just auto connect keplr in mobile mode
    mobileMode && keplrHandler();
  }, [mobileMode]);

  useEffect(() => {
    (async () => {
      if (isMobile()) {
        window.addEventListener("keplr_keystorechange", keplrHandler);
      }
    })();
    return () => {
      window.removeEventListener("keplr_keystorechange", keplrHandler);
    };
  }, [walletTypeStore]);

  const keplrHandler = async () => {
    try {
      let oraiAddress, btcAddress;

      if (mobileMode) {
        window.Keplr = new Keplr("owallet");
      }

      if (walletByNetworks.cosmos || mobileMode) {
        oraiAddress = await window.Keplr.getKeplrAddr();
        if (oraiAddress) {
          const { listAddressCosmos } = await getListAddressCosmos(oraiAddress);
          setCosmosAddress(listAddressCosmos);
          setOraiAddress(oraiAddress);
        }
      }

      if (walletByNetworks.bitcoin === "owallet" || mobileMode) {
        btcAddress = await window.Bitcoin.getAddress();
        if (btcAddress) setBtcAddress(btcAddress);
      }

      loadTokenAmounts({
        oraiAddress,
        btcAddress,
      });
    } catch (error) {
      console.log("Error: ", error.message);
      setStatusChangeAccount(false);
      displayToast(TToastType.TX_INFO, {
        message: `There is an unexpected error with Cosmos wallet. Please try again!`,
      });
    }
  };

  const [openBanner, setOpenBanner] = useState(false);

  return (
    <ThemeProvider>
      <div className={`app ${theme}`}>
        <Menu />
        <NoticeBanner openBanner={openBanner} setOpenBanner={setOpenBanner} />
        <div className="main">
          <Sidebar />
          <div
            className={openBanner ? `bannerWithContent appRight` : "appRight"}
          >
            {routes()}
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default App;
