import { StoredCheckpointDataInterface } from "@types";

export const calcDepositFee = (
  checkpointData: StoredCheckpointDataInterface
): number => {
  const witnessVsize = checkpointData.sigset.signatories.length * 79 + 39;
  const inputVsize = witnessVsize + 40;
  return (
    (inputVsize *
      checkpointData.feeRate *
      checkpointData.config.userFeeFactor) /
    10000
  );
};

export const calcWithdrawFees = (
  scriptPubkey: string,
  checkpointData: StoredCheckpointDataInterface
): number => {
  return (
    ((9 + Buffer.from(scriptPubkey, "base64").length) *
      checkpointData.feeRate *
      checkpointData.config.userFeeFactor) /
    10000
  );
};
