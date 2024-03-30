import { EVM_CHAIN_ID_COMMON, WalletType, cosmosTokens, flattenTokens } from '@oraichain/oraidex-common';
import { btcTokens } from 'config/bridgeTokens';
import { useDispatch } from 'react-redux';
import { updateAmounts } from 'reducer/token';

export type Wallet = WalletType | 'bitcoin';
export const useResetBalance = () => {
  const dispatch = useDispatch();

  const handleResetBalance = (wallets: Wallet[]) => {
    let amounts: AmountDetails = {};
    for (const wallet of wallets) {
      amounts = {
        ...amounts,
        ...getResetedBalanceByWallet(wallet)
      };
    }
    dispatch(updateAmounts(amounts));
  };

  const getResetedBalanceByWallet = (walletType: Wallet) => {
    let updatedAmounts: AmountDetails = {};
    switch (walletType) {
      case 'keplr':
        updatedAmounts = resetBalanceCosmos();
        break;
      case 'owallet':
        updatedAmounts = resetBalanceCosmos();
        break;
      case 'bitcoin':
        updatedAmounts = resetBalanceBtc();
        break;
      default:
        break;
    }
    return updatedAmounts;
  };

  const resetBalanceCosmos = () => {
    return Object.fromEntries(cosmosTokens.map((t) => [t.denom, '0']));
  };
  const resetBalanceBtc = () => {
    return Object.fromEntries(btcTokens.map((t) => [t.denom, '0']));
  };

  return { handleResetBalance };
};
