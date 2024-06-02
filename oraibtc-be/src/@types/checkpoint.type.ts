export enum CheckpointStatus {
  Complete = "Complete",
  Building = "Building",
  Signing = "Signing",
}

export interface SigsetInterface {
  createTime: number;
  index: number;
  possibleVp: number;
  presentVp: number;
  signatories: any[]; // we will not use this, so i put any here
}

export interface TransactionInput {
  previousOutput: String;
  scriptSig: String;
  sequence: number;
  witness: String[];
}

export interface TransactionOutput {
  scriptPubkey: String;
  value: number;
}

export interface TransactionData {
  input: TransactionInput[];
  lockTime: number;
  output: TransactionOutput[];
}

export interface CheckpointDataInterface {
  feeRate: number;
  feesCollected: number;
  signedAtBtcHeight: number;
  sigset: SigsetInterface;
  transaction: {
    hash: String;
    data: TransactionData;
  };
  config: CheckpointConfig;
  valueLocked: number;
  status: CheckpointStatus;
}

export interface AdditionalCheckpointDataInterface {
  valueLocked: number;
  checkpointIndex: number;
  createTime: number;
  feeCollected: number;
}

interface CheckpointConfig {
  emergencyDisbursalLockTimeInterval: number;
  emergencyDisbursalMaxTxSize: number;
  emergencyDisbursalMinTxAmt: number;
  maxAge: number;
  maxCheckpointInterval: number;
  maxFeeRate: number;
  maxInputs: number;
  maxOutputs: number;
  maxUnconfirmedCheckpoints: number;
  minCheckpointInterval: number;
  minFeeRate: number;
  sigsetThreshold: number[];
  targetCheckpointInclusion: number;
  userFeeFactor: number;
}

export interface StoredCheckpointDataInterface
  extends Omit<CheckpointDataInterface, "feesCollected">,
    AdditionalCheckpointDataInterface {}

export interface CheckpointQueueInterface {
  index: number;
  first_unhandled_confirmed_cp_index: number;
  confirmed_index: number;
}

export interface DepositFeeChartItem {
  time: number;
  value: string;
}
