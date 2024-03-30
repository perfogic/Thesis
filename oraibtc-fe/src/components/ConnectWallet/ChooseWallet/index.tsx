import cn from 'classnames/bind';
import { FunctionComponent, useMemo, useState } from 'react';

import Modal from 'components/Modal';
import useConfigReducer from 'hooks/useConfigReducer';
import { ReactComponent as CloseIcon } from 'assets/icons/close-icon.svg';
import { ReactComponent as OwalletIcon } from 'assets/icons/owallet-icon.svg';
import { ReactComponent as BitcoinIcon } from 'assets/icons/btc-icon.svg';
import { ReactComponent as KeplrIcon } from 'assets/icons/keplr-icon.svg';
import { ReactComponent as PhantomIcon } from 'assets/icons/phantom.svg';
import { ReactComponent as GoogleIcon } from 'assets/icons/google_icon.svg';
import { ReactComponent as AppleIcon } from 'assets/icons/apple_wallet.svg';

import ConnectProcessing from './ConnectProcessing';
import ConnectError from './ConnectError';
import styles from './index.module.scss';

import { CONNECT_STATUS, WALLET_TYPES } from '../';
import { ConnectProgressDone } from './ConnectDone';
import { keplrCheck, owalletCheck } from 'helper';

const cx = cn.bind(styles);

export interface WalletItem {
  name: any;
  icon: FunctionComponent;
  walletType: WALLET_TYPES;
  isActive?: boolean;
}

const ChooseWalletModal: React.FC<{
  close: () => void;
  cancel: () => void;
  connectToWallet: (walletType: WALLET_TYPES) => void;
  connectStatus: CONNECT_STATUS;
  tryAgain: (walletType: WALLET_TYPES) => void;
  address: string;
}> = ({ close, connectToWallet, connectStatus, cancel, tryAgain, address }) => {
  const [theme] = useConfigReducer('theme');
  const [walletSelected, setWalletSelected] = useState<WalletItem>();
  const vs = window?.keplr?.version;
  const isCheckKeplr = !!vs && keplrCheck('keplr');
  const isCheckOwallet = !!vs && owalletCheck('owallet');
  const WALLETS: WalletItem[] = [
    { name: 'Owallet', icon: OwalletIcon, isActive: isCheckOwallet, walletType: WALLET_TYPES.OWALLET },
    { name: 'Bitcoin', icon: BitcoinIcon, isActive: isCheckOwallet, walletType: WALLET_TYPES.BITCOIN },
    { name: 'Keplr', icon: KeplrIcon, isActive: isCheckKeplr, walletType: WALLET_TYPES.KEPLR },
    { name: 'Phantom', icon: PhantomIcon, walletType: WALLET_TYPES.PHANTOM },

    { name: 'Connect with Google', icon: GoogleIcon, walletType: WALLET_TYPES.GOOGLE },
    { name: 'Connect with Apple', icon: AppleIcon, walletType: WALLET_TYPES.APPLE },
    // { name: 'Use phone number', icon: PhoneIcon, walletType: WALLET_TYPES.PHONE }
  ];

  const content = useMemo(() => {
    if (connectStatus === CONNECT_STATUS.SELECTING) {
      return (
        <div className={cx('wallets_wrapper')}>
          {WALLETS.map((wallet, index) => {
            return (
              <div
                key={index}
                className={cx('wallet_item', `${!wallet.isActive && 'not-active'}`)}
                onClick={async () => {
                  if (wallet.isActive) {
                    setWalletSelected(wallet);
                    connectToWallet(wallet.walletType);
                  }
                }}
              >
                <div className={cx('wallet_icon')}>
                  <wallet.icon />
                </div>
              </div>
            );
          })}
        </div>
      );
    } else if (connectStatus === CONNECT_STATUS.PROCESSING) {
      return <ConnectProcessing cancel={cancel} walletName={walletSelected.name} />;
    } else if (connectStatus === CONNECT_STATUS.DONE) {
      return <ConnectProgressDone cancel={cancel} address={address} />;
    } else {
      return <ConnectError cancel={cancel} handleTryAgain={() => tryAgain(walletSelected.walletType)} />;
    }
  }, [connectStatus]);

  return (
    <Modal
      isOpen={true}
      close={close}
      open={() => { }}
      isCloseBtn={false}
      className={cx('choose_wallet_modal_container', theme)}
    >
      <div className={cx('choose_wallet_modal_wrapper')}>
        <div className={cx('header')}>
          <div>Connect to OraiDEX</div>
          <div onClick={close} className={cx('close_icon')}>
            <CloseIcon />
          </div>
        </div>
        {content}
      </div>
    </Modal>
  );
};

export default ChooseWalletModal;
