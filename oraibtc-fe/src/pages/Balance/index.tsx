import {
  DeliverTxResponse,
  GasPrice,
  isDeliverTxFailure,
  SigningStargateClient,
} from "@cosmjs/stargate";
import {
  KWT_SCAN,
  NetworkChainId,
  TokenItemType,
  toAmount,
  CosmosChainId,
  flattenTokens,
  getTokenOnOraichain,
  calculateTimeoutTimestamp,
} from "@oraichain/oraidex-common";
import {
  UniversalSwapHandler,
  isSupportedNoPoolSwapEvm,
} from "@oraichain/oraidex-universal-swap";
import { ReactComponent as ArrowDownIcon } from "assets/icons/arrow.svg";
import { ReactComponent as ArrowDownIconLight } from "assets/icons/arrow_light.svg";
import { ReactComponent as RefreshIcon } from "assets/icons/reload.svg";
import classNames from "classnames";
import CheckBox from "components/CheckBox";
import LoadingBox from "components/LoadingBox";
import SearchInput from "components/SearchInput";
import { TToastType, displayToast } from "components/Toasts/Toast";
import TokenBalance from "components/TokenBalance";
import { tokens } from "config/bridgeTokens";
import { makeStdTx } from "@cosmjs/amino";
import {
  getTransactionUrl,
  handleCheckWallet,
  handleErrorTransaction,
  networks,
  handleCheckAddress,
  getSpecialCoingecko,
  getNetworkGasPrice,
} from "helper";
import { useCoinGeckoPrices } from "hooks/useCoingecko";
import useConfigReducer from "hooks/useConfigReducer";
import useLoadTokens from "hooks/useLoadTokens";
import Content from "layouts/Content";
import {
  generateError,
  getTotalUsd,
  getUsd,
  toSumDisplay,
  toTotalDisplay,
} from "libs/utils";
import isEqual from "lodash/isEqual";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { useNavigate, useNavigation, useSearchParams } from "react-router-dom";
import { getSubAmountDetails } from "rest/api";
import { RootState } from "store/configure";
import styles from "./Balance.module.scss";
import TokenItem, { TokenItemProps } from "./TokenItem";
import { Tendermint37Client } from "@cosmjs/tendermint-rpc";
import {
  convertTransferIBCErc20Kwt,
  findDefaultToToken,
  getUtxos,
  mapUtxos,
  transferIBCKwt,
  getFeeRate,
  calculatorTotalFeeBtc,
} from "./helpers";
import { useGetFeeConfig } from "hooks/useTokenFee";
import useOnClickOutside from "hooks/useOnClickOutside";
import { SelectTokenModal } from "components/Modals/SelectTokenModal";
import { ReactComponent as TooltipIcon } from "assets/icons/icon_tooltip.svg";
import { NomicContext } from "context/nomic-context";
import { Decimal } from "@cosmjs/math";
import {
  OBTCContractAddress,
  OraiBtcSubnetChain,
  OraichainChain,
} from "libs/nomic/models/ibc-chain";
import { BitcoinUnit } from "bitcoin-units";
import { toBinary } from "@cosmjs/cosmwasm-stargate";
import { TokenItemBtc } from "./TokenItem/TokenItemBtc";
import DepositBtcModal from "./DepositBtcModal";
import { bitcoinChainId } from "helper/constants";
import { config } from "libs/nomic/config";
import useWalletReducer from "hooks/useWalletReducer";
import { isMobile } from "@walletconnect/browser-utils";
import { collectWallet } from "libs/cosmjs";
import { deriveNomicAddress } from "@oraichain/orai-bitcoin";
import { OraiToken } from "config/chainInfos";
import { ethers } from "ethers";
import Long from "long";

interface BalanceProps {}

const Balance: React.FC<BalanceProps> = () => {
  // hook
  const [searchParams] = useSearchParams();
  let tokenUrl = searchParams.get("token");
  const navigate = useNavigate();
  const amounts = useSelector((state: RootState) => state.token.amounts);
  const nomic = useContext(NomicContext);
  // state internal
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [isSelectNetwork, setIsSelectNetwork] = useState(false);
  const [isDepositBtcModal, setIsDepositBtcModal] = useState(false);
  const [, setTxHash] = useState("");
  const [[from, to], setTokenBridge] = useState<TokenItemType[]>([]);
  const [[otherChainTokens, oraichainTokens], setTokens] = useState<
    TokenItemType[][]
  >([[], []]);
  const [walletByNetworks] = useWalletReducer("walletsByNetwork");

  const [theme] = useConfigReducer("theme");
  const [oraiAddress] = useConfigReducer("address");
  const [hideOtherSmallAmount, setHideOtherSmallAmount] = useConfigReducer(
    "hideOtherSmallAmount"
  );
  const [filterNetworkUI, setFilterNetworkUI] =
    useConfigReducer("filterNetwork");
  const [btcAddress, setBtcAddress] = useConfigReducer("btcAddress");
  const [addressRecovery, setAddressRecovery] = useState("");

  const ref = useRef(null);
  //@ts-ignore
  const isOwallet = window.owallet?.isOwallet;
  const getAddress = async () => {
    try {
      await nomic.generateAddress();
      const addressRecovered = await nomic.getRecoveryAddress();
      setAddressRecovery(addressRecovered);
    } catch (error) {
      console.log("🚀 ~ getAddress ~ error:", error);
    }
  };
  useEffect(() => {
    if (isOwallet) {
      getAddress();
    }
  }, [oraiAddress, isOwallet]);
  useOnClickOutside(ref, () => {
    setTokenBridge([undefined, undefined]);
  });

  // custom hooks
  const loadTokenAmounts = useLoadTokens();
  const { data: prices } = useCoinGeckoPrices();
  useGetFeeConfig();

  useEffect(() => {
    if (!tokenUrl) return setTokens(tokens);
    const _tokenUrl = tokenUrl.toUpperCase();
    setTokens(
      tokens.map((childTokens) =>
        childTokens.filter((t) => t.name.includes(_tokenUrl))
      )
    );
  }, [tokenUrl]);

  useEffect(() => {
    setTokenBridge([undefined, undefined]);
  }, [filterNetworkUI]);

  const processTxResult = (
    rpc: string,
    result: DeliverTxResponse,
    customLink?: string
  ) => {
    if (isDeliverTxFailure(result)) {
      displayToast(TToastType.TX_FAILED, {
        message: result.rawLog,
      });
    } else {
      displayToast(TToastType.TX_SUCCESSFUL, {
        customLink: customLink ?? `${rpc}/tx?hash=0x${result.transactionHash}`,
      });
    }
    setTxHash(result.transactionHash);
  };

  const handleRecoveryAddress = async () => {
    try {
      const btcAddr = await window.Bitcoin.getAddress();
      if (!btcAddr) throw Error("Not found your bitcoin address!");
      // @ts-ignore-check
      const oraiBtcAddress = await window.Keplr.getKeplrAddr(
        OraiBtcSubnetChain.chainId as any
      );
      if (btcAddr && addressRecovery !== btcAddr && oraiBtcAddress) {
        const accountInfo = await nomic.getAccountInfo(oraiBtcAddress);
        const signDoc = {
          account_number: accountInfo?.account?.account_number,
          chain_id: OraiBtcSubnetChain.chainId,
          fee: { amount: [{ amount: "0", denom: "uoraibtc" }], gas: "10000" },
          memo: "",
          msgs: [
            {
              type: "nomic/MsgSetRecoveryAddress",
              value: {
                recovery_address: btcAddr,
              },
            },
          ],
          sequence: accountInfo?.account?.sequence,
        };

        const signature = await window.owallet.signAmino(
          config.chainId,
          oraiBtcAddress,
          signDoc
        );
        const tx = makeStdTx(signDoc, signature.signature);
        const tmClient = await Tendermint37Client.connect(config.rpcUrl);

        const result = await tmClient.broadcastTxSync({
          tx: Uint8Array.from(Buffer.from(JSON.stringify(tx))),
        });
        await getAddress();
        //@ts-ignore
        displayToast(
          result.code === 0
            ? TToastType.TX_SUCCESSFUL
            : (TToastType.TX_FAILED as any),
          {
            message: result?.log,
          }
        );
      }
    } catch (error) {
      handleErrorTransaction(error);
    }
  };

  const onClickToken = useCallback(
    (token: TokenItemType) => {
      if (isEqual(from, token)) {
        setTokenBridge([undefined, undefined]);
        return;
      }
      const toToken = findDefaultToToken(token);
      setTokenBridge([token, toToken]);
    },
    [otherChainTokens, oraichainTokens, from, to]
  );

  const refreshBalances = async () => {
    try {
      if (loadingRefresh) return;
      setLoadingRefresh(true);
      await loadTokenAmounts({ oraiAddress, btcAddress });
    } catch (err) {
      console.log({ err });
    } finally {
      setTimeout(() => {
        setLoadingRefresh(false);
      }, 2000);
    }
  };

  const handleTransferBTCToOraichain = async (
    fromToken: TokenItemType,
    transferAmount: number,
    btcAddr: string
  ) => {
    const utxos = await getUtxos(btcAddr, fromToken.rpc);
    const feeRate = await getFeeRate({
      url: from.rpc,
    });

    const utxosMapped = mapUtxos({
      utxos,
      address: btcAddr,
    });
    const totalFee = calculatorTotalFeeBtc({
      utxos: utxosMapped.utxos,
      message: "",
      transactionFee: feeRate,
    });
    console.log(totalFee, "totalFee");
    const { bitcoinAddress: address } = nomic.depositAddress;
    if (!address) throw Error("Not found address OraiBtc");
    const amount = new BitcoinUnit(transferAmount, "BTC")
      .to("satoshi")
      .getValue();
    const dataRequest = {
      memo: "",
      fee: {
        gas: "200000",
        amount: [
          {
            denom: "btc",
            amount: `${totalFee}`,
          },
        ],
      },
      address: btcAddr,
      msgs: {
        address: address,
        changeAddress: btcAddr,
        amount: amount,
        message: "",
        totalFee: totalFee,
        selectedCrypto: fromToken.chainId,
        confirmedBalance: utxosMapped.balance,
        feeRate: feeRate,
      },
      confirmedBalance: utxosMapped.balance,
      utxos: utxosMapped.utxos,
      blacklistedUtxos: [],
      amount: amount,
      feeRate: feeRate,
    };

    try {
      // @ts-ignore-check
      const rs = await window.Bitcoin.signAndBroadCast(
        fromToken.chainId as any,
        dataRequest
      );

      if (rs?.rawTxHex) {
        setTxHash(rs.rawTxHex);
        displayToast(TToastType.TX_SUCCESSFUL, {
          customLink: `/bitcoin-dashboard?tab=pending_deposits`,
        });
        setTimeout(async () => {
          await loadTokenAmounts({ oraiAddress, btcAddress: btcAddr });
        }, 5000);
        return;
      }
      displayToast(TToastType.TX_FAILED, {
        message: "Transaction failed",
      });
    } catch (error) {
      console.log("🚀 ~ handleTransferBTCToOraichain ~ error:", error);
      displayToast(TToastType.TX_FAILED, {
        message: JSON.stringify(error),
      });
    }
  };

  const handleTransferOraichainToBTC = async (
    fromToken: TokenItemType,
    transferAmount: number,
    btcAddr: string
  ) => {
    const { bitcoinAddress: address } = nomic.depositAddress;

    if (!address) throw Error("Not found Orai BTC Address");
    // @ts-ignore-check
    const destinationAddress = await window.Keplr.getKeplrAddr(
      OraiBtcSubnetChain.chainId as any
    );

    const DEFAULT_TIMEOUT = 60 * 60;
    const amountInput = BigInt(
      Decimal.fromUserInput(
        toAmount(transferAmount, 6).toString(),
        8
      ).atomics.toString()
    );
    const amount = Decimal.fromAtomics(amountInput.toString(), 8).toString();
    if (!destinationAddress)
      throw Error("Not found your oraibtc-subnet address!");
    try {
      const timeoutTimestampSeconds = Math.floor(
        (Date.now() + 60 * 60 * 1000) / 1000
      );
      const timeoutTimestampNanoseconds = Long.fromNumber(
        timeoutTimestampSeconds
      ).multiply(1000000000);

      const transferMsg = {
        typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
        value: {
          sourcePort: "transfer",
          sourceChannel: "channel-238",
          sender: oraiAddress,
          receiver: deriveNomicAddress(oraiAddress),
          token: {
            amount: ethers.utils.parseUnits(amount.toString(), 8).toString(),
            denom: OraichainChain.source.nBtcIbcDenom,
          },
          timeoutTimestamp: timeoutTimestampNanoseconds,
          memo: `withdraw:${btcAddr}`,
        },
      };

      const result = await window.client.signAndBroadcast(
        oraiAddress,
        [transferMsg],
        "auto"
      );

      processTxResult(
        fromToken.rpc,
        // @ts-ignore-check
        result,
        "/bitcoin-dashboard?tab=pending_withdraws"
      );
    } catch (ex) {
      handleErrorTransaction(ex, {
        tokenName: from.name,
        chainName: from.chainId,
      });
    }
  };

  const handleTransferBTC = async ({
    isBTCToOraichain,
    fromToken,
    transferAmount,
  }) => {
    const btcAddr = await window.Bitcoin.getAddress();
    if (!btcAddr) throw Error("Not found your bitcoin address!");
    if (isBTCToOraichain) {
      await handleRecoveryAddress();
      return handleTransferBTCToOraichain(fromToken, transferAmount, btcAddr);
    }
    return handleTransferOraichainToBTC(fromToken, transferAmount, btcAddr);
  };

  const onClickTransfer = async (
    fromAmount: number,
    from: TokenItemType,
    to: TokenItemType,
    toNetworkChainId?: NetworkChainId
  ) => {
    await handleCheckWallet();

    // await handleCheckChainEvmWallet(from.chainId);
    // disable send amount < 0
    if (!from || !to) {
      displayToast(TToastType.TX_FAILED, {
        message: "Please choose both from and to tokens",
      });
      return;
    }

    // get & check balance
    const initFromBalance = amounts[from.denom];

    const subAmounts = getSubAmountDetails(amounts, from);
    const subAmount = toAmount(toSumDisplay(subAmounts), from.decimals);

    const fromBalance =
      from && initFromBalance ? subAmount + BigInt(initFromBalance) : BigInt(0);

    if (fromAmount <= 0 || toAmount(fromAmount, from.decimals) > fromBalance) {
      displayToast(TToastType.TX_FAILED, {
        message: "Your balance is insufficient to make this transfer",
      });
      return;
    }

    displayToast(TToastType.TX_BROADCASTING);
    try {
      let result: DeliverTxResponse | string | any;

      // TODO: hardcode check bitcoinTestnet need update later
      // [BTC Native] <==> ORAICHAIN
      const isBTCtoOraichain =
        from.chainId === bitcoinChainId && to.chainId === "Oraichain";
      const isOraichainToBTC =
        from.chainId === "Oraichain" && to.chainId === bitcoinChainId;
      if (isBTCtoOraichain || isOraichainToBTC)
        return handleTransferBTC({
          isBTCToOraichain: isBTCtoOraichain,
          fromToken: from,
          transferAmount: fromAmount,
        });

      let newToToken = to;
      if (toNetworkChainId) {
        // ORAICHAIN -> EVM (BSC/ETH/TRON) ( TO: TOKEN ORAIBRIDGE)
        // newToToken = findToTokenOnOraiBridge(from.coinGeckoId, toNetworkChainId);
        newToToken = flattenTokens.find(
          (flat) =>
            flat.chainId == toNetworkChainId &&
            flat.coinGeckoId === from.coinGeckoId
        );

        // const isBridgeToCosmosNetwork = !EVM_CHAIN_ID.includes(toNetworkChainId);
        // if (isBridgeToCosmosNetwork) {
        //   newToToken = cosmosTokens.find((t) => t.chainId === toNetworkChainId && t.coinGeckoId === from.coinGeckoId);
        // }
        if (!newToToken)
          throw generateError(
            "Cannot find newToToken token that matches from token to bridge!"
          );
      }

      if (newToToken.coinGeckoId !== from.coinGeckoId)
        throw generateError(
          `From token ${from.coinGeckoId} is different from to token ${newToToken.coinGeckoId}`
        );

      // remaining tokens, we override from & to of onClickTransfer on index.tsx of Balance based on the user's token destination choice
      // to is Oraibridge tokens
      // or other token that have same coingeckoId that show in at least 2 chain.
      const cosmosAddress = await handleCheckAddress(
        from.cosmosBased ? (from.chainId as CosmosChainId) : "Oraichain"
      );

      let amountsBalance = amounts;
      let simulateAmount = toAmount(fromAmount).toString();

      const { isSpecialFromCoingecko } = getSpecialCoingecko(
        from.coinGeckoId,
        newToToken.coinGeckoId
      );

      if (isSpecialFromCoingecko && from.chainId === "Oraichain") {
        const tokenInfo = getTokenOnOraichain(from.coinGeckoId);
        const IBC_DECIMALS = 18;
        const fromTokenInOrai = getTokenOnOraichain(
          tokenInfo.coinGeckoId,
          IBC_DECIMALS
        );
        const [nativeAmount, cw20Amount] = await Promise.all([
          window.client.getBalance(oraiAddress, fromTokenInOrai.denom),
          window.client.queryContractSmart(tokenInfo.contractAddress, {
            balance: {
              address: oraiAddress,
            },
          }),
        ]);

        amountsBalance = {
          [fromTokenInOrai.denom]: nativeAmount?.amount,
          [from.denom]: cw20Amount.balance,
        };
      }

      if (
        (newToToken.chainId === "injective-1" &&
          newToToken.coinGeckoId === "injective-protocol") ||
        newToToken.chainId === "kawaii_6886-1"
      ) {
        simulateAmount = toAmount(fromAmount, newToToken.decimals).toString();
      }

      const universalSwapHandler = new UniversalSwapHandler(
        {
          sender: { cosmos: cosmosAddress },
          originalFromToken: from,
          originalToToken: newToToken,
          fromAmount,
          amounts: amountsBalance,
          simulateAmount,
        },
        { cosmosWallet: window.Keplr }
      );

      result = await universalSwapHandler.processUniversalSwap();
      processTxResult(
        from.rpc,
        result,
        getTransactionUrl(from.chainId, result.transactionHash)
      );
    } catch (ex) {
      handleErrorTransaction(ex, {
        tokenName: from.name,
        chainName: toNetworkChainId,
      });
    }
  };

  const getFilterTokens = (chainId: string | number): TokenItemType[] => {
    return [...otherChainTokens, ...oraichainTokens]
      .filter((token) => {
        // not display because it is evm map and no bridge to option, also no smart contract and is ibc native
        if (!token.bridgeTo && !token.contractAddress) return false;
        if (hideOtherSmallAmount && !toTotalDisplay(amounts, token)) {
          return false;
        }
        if (isSupportedNoPoolSwapEvm(token.coinGeckoId)) return false;
        return token.chainId === chainId;
      })
      .sort((a, b) => {
        return (
          toTotalDisplay(amounts, b) * prices[b.coinGeckoId] -
          toTotalDisplay(amounts, a) * prices[a.coinGeckoId]
        );
      });
  };

  const totalUsd = getTotalUsd(amounts, prices);

  const network =
    networks.find((n) => n.chainId === filterNetworkUI) ?? networks[0];

  return (
    <Content nonBackground>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div className={styles.asset}>
            <span className={styles.totalAssets}>Total Assets</span>
            <TokenBalance
              balance={totalUsd}
              className={classNames(styles.balance, styles[theme])}
              decimalScale={2}
            />
          </div>
        </div>
        <div className={classNames(styles.divider, styles[theme])} />
        <div className={styles.action}>
          <div className={styles.search}>
            <div
              className={classNames(styles.search_filter, styles[theme])}
              onClick={() => setIsSelectNetwork(true)}
            >
              <div className={styles.search_box}>
                {network && (
                  <div className={styles.search_flex}>
                    <div className={styles.search_logo}>
                      {theme === "light" ? (
                        network.IconLight ? (
                          <network.IconLight />
                        ) : (
                          <network.Icon />
                        )
                      ) : (
                        <network.Icon />
                      )}
                    </div>
                    <span
                      className={classNames(styles.search_text, styles[theme])}
                    >
                      {network.chainName}
                    </span>
                  </div>
                )}
                <div>
                  {theme === "light" ? (
                    <ArrowDownIconLight />
                  ) : (
                    <ArrowDownIcon />
                  )}
                </div>
              </div>
            </div>

            <SearchInput
              placeholder="Search Token"
              onSearch={(text) => {
                if (!text) return navigate("");
                navigate(`?token=${text}`);
              }}
              theme={theme}
            />
          </div>
        </div>
        <div className={styles.balances}>
          <div className={classNames(styles.box, styles[theme])}>
            <div>
              <CheckBox
                label="Hide small balances"
                checked={hideOtherSmallAmount}
                onCheck={setHideOtherSmallAmount}
              />
            </div>
            <div className={styles.refresh} onClick={refreshBalances}>
              <span>Refresh balances</span>
              <RefreshIcon />
            </div>
          </div>
        </div>
        <br />
        <LoadingBox loading={loadingRefresh}>
          <div className={styles.tokens}>
            <div className={styles.tokens_form} ref={ref}>
              {getFilterTokens(filterNetworkUI).map((t: TokenItemType) => {
                // check balance cw20
                let amount = BigInt(amounts[t.denom] ?? 0);
                let usd = getUsd(amount, t, prices);
                let subAmounts: AmountDetails;
                if (t.contractAddress && t.evmDenoms) {
                  subAmounts = getSubAmountDetails(amounts, t);
                  const subAmount = toAmount(
                    toSumDisplay(subAmounts),
                    t.decimals
                  );
                  amount += subAmount;
                  usd += getUsd(subAmount, t, prices);
                }
                // TODO: hardcode check bitcoinTestnet need update later
                const isOwallet =
                  walletByNetworks.cosmos &&
                  walletByNetworks.cosmos === "owallet" &&
                  window.owallet &&
                  //@ts-ignore
                  window.owallet?.isOwallet;

                const isBtcToken =
                  t.chainId === bitcoinChainId && t?.coinGeckoId === "bitcoin";
                const TokenItemELement: React.FC<TokenItemProps> = isBtcToken
                  ? TokenItemBtc
                  : TokenItem;
                return (
                  <div key={t.denom}>
                    {!isOwallet && !isMobile() && isBtcToken && (
                      <div className={styles.info}>
                        <div>
                          <TooltipIcon width={20} height={20} />
                        </div>
                        <span>
                          Feature only supported on Owallet. Please connect
                          Cosmos with Owallet
                        </span>
                      </div>
                    )}
                    <TokenItemELement
                      onDepositBtc={async () => {
                        setIsDepositBtcModal(true);
                      }}
                      isBtcOfOwallet={isOwallet || isMobile()}
                      isBtcToken={isBtcToken}
                      className={classNames(
                        styles.tokens_element,
                        styles[theme]
                      )}
                      key={t.denom}
                      amountDetail={{ amount: amount.toString(), usd }}
                      subAmounts={subAmounts}
                      active={from?.denom === t.denom}
                      token={t}
                      theme={theme}
                      onClick={() => {
                        if (t.denom !== from?.denom) {
                          onClickToken(t);
                        }
                      }}
                      onClickTransfer={async (
                        fromAmount: number,
                        filterNetwork?: NetworkChainId
                      ) => {
                        await onClickTransfer(
                          fromAmount,
                          from,
                          to,
                          filterNetwork
                        );
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </LoadingBox>
        <SelectTokenModal
          isOpen={isSelectNetwork}
          open={() => setIsSelectNetwork(true)}
          close={() => setIsSelectNetwork(false)}
          prices={prices}
          amounts={amounts}
          type="network"
          items={networks}
          setToken={(chainId) => {
            setFilterNetworkUI(chainId);
          }}
        />
        <DepositBtcModal
          prices={prices}
          isOpen={isDepositBtcModal}
          addressRecovery={addressRecovery}
          handleRecoveryAddress={handleRecoveryAddress}
          open={() => setIsDepositBtcModal(true)}
          close={() => setIsDepositBtcModal(false)}
        />
      </div>
    </Content>
  );
};

export default Balance;
