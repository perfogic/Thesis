import { isMobile } from '@walletconnect/browser-utils';
import cn from 'classnames/bind';
import { Button } from 'components/Button';
import type { Wallet as WalletResetType } from 'components/ConnectWallet/useResetBalance';
import { useResetBalance } from 'components/ConnectWallet/useResetBalance';
import { keplrCheck } from 'helper';
import useConfigReducer from 'hooks/useConfigReducer';
import useLoadTokens from 'hooks/useLoadTokens';
import useWalletReducer from 'hooks/useWalletReducer';
import { FC, useEffect, useState } from 'react';
import Connected from './Connected';
import { ConnectedMobile } from './ConnectedMobile';
import { ModalChooseWallet } from './ModalChooseWallet';
import { MyWallet } from './MyWallet';
import { MyWalletMobile } from './MyWalletMobile';
import styles from './WalletManagement.module.scss';
import { WalletProvider, walletProvider } from './walletConfig';
const cx = cn.bind(styles);

export const WalletManagement: FC<{}> = () => {
  const [theme] = useConfigReducer('theme');
  const [oraiAddress] = useConfigReducer('address');
  const [btcAddress] = useConfigReducer('btcAddress');
  const [walletByNetworks] = useWalletReducer('walletsByNetwork');
  const { handleResetBalance } = useResetBalance();
  const loadTokenAmounts = useLoadTokens();
  const mobileMode = isMobile();

  const [walletProviderWithStatus, setWalletProviderWithStatus] = useState<WalletProvider[]>(walletProvider);
  const [isShowChooseWallet, setIsShowChooseWallet] = useState(false);
  const [isShowMyWallet, setIsShowMyWallet] = useState(false);

  // @ts-ignore
  const isCheckOwallet = window.owallet?.isOwallet;
  const version = window?.keplr?.version;
  const isCheckKeplr = !!version && keplrCheck('keplr');

  // update wallet provider with status is active or not
  useEffect(() => {
    async function updateWalletProvider() {
      const updatedWalletProvider = walletProviderWithStatus.map((item) => {
        const updatedWallets = item.wallets.map((wallet) => {
          let isActive = true;
          switch (wallet.nameRegistry) {
            case 'keplr':
              isActive = isCheckKeplr;
              break;
            case 'owallet':
              isActive = isCheckOwallet;
              break;
            case 'bitcoin':
              isActive = isCheckOwallet;
              break;
          }
          return { ...wallet, isActive };
        });
        return {
          ...item,
          wallets: updatedWallets
        };
      });
      setWalletProviderWithStatus(updatedWalletProvider);
    }
    updateWalletProvider();
  }, [isCheckOwallet, isCheckKeplr]);

  // load balance every time change address
  useEffect(() => {
    const addresses = { oraiAddress, btcAddress };
    const filteredAddresses = {};

    for (const key in addresses) {
      if (addresses[key]) {
        filteredAddresses[key] = addresses[key];
      }
    }
    if (Object.keys(filteredAddresses).length > 0) {
      loadTokenAmounts(filteredAddresses);
    }
  }, [oraiAddress, btcAddress]);

  // reset balance when disconnect
  useEffect(() => {
    if (!oraiAddress || !btcAddress) {
      let arrResetBalance: WalletResetType[] = [];
      if (!oraiAddress) arrResetBalance.push('keplr');
      if (!btcAddress) arrResetBalance.push('bitcoin');
      arrResetBalance.length && handleResetBalance(arrResetBalance);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oraiAddress, btcAddress]);

  const isAnyWalletConnected = Object.values(walletByNetworks).some((wallet) => wallet !== null);
  useEffect(() => {
    // close my wallet info when not connect to any wallet
    if (!isAnyWalletConnected) setIsShowMyWallet(false);
  }, [isAnyWalletConnected]);

  return (
    <div className={cx('connect-wallet-container', theme)}>
      {!isAnyWalletConnected && !mobileMode ? (
        <Button
          type="primary"
          onClick={() => {
            setIsShowChooseWallet(true);
          }}
        >
          Connect Wallet
        </Button>
      ) : mobileMode ? (
        <ConnectedMobile setIsShowMyWallet={setIsShowMyWallet} />
      ) : (
        <Connected setIsShowMyWallet={setIsShowMyWallet} />
      )}

      {mobileMode ? (
        <MyWalletMobile
          setIsShowChooseWallet={setIsShowChooseWallet}
          isShowMyWallet={isShowMyWallet}
          setIsShowMyWallet={setIsShowMyWallet}
          isShowChooseWallet={isShowChooseWallet}
        />
      ) : (
        <MyWallet
          setIsShowChooseWallet={setIsShowChooseWallet}
          isShowMyWallet={isShowMyWallet}
          setIsShowMyWallet={setIsShowMyWallet}
          isShowChooseWallet={isShowChooseWallet}
        />
      )}
      {isShowChooseWallet && !isMobile() ? (
        <ModalChooseWallet
          close={() => {
            setIsShowChooseWallet(false);
          }}
          walletProviderWithStatus={walletProviderWithStatus}
        />
      ) : null}
    </div>
  );
};
