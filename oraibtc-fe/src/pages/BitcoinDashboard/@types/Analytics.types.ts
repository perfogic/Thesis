export interface TimeSlotData {
  time: number;
  value: number;
}

export interface AllCheckpointChartsData {
  deposit: TimeSlotData[];
  withdraw: TimeSlotData[];
  feeRate: TimeSlotData[];
  valueLocked: TimeSlotData[];
}

export interface AllBlockChartsData {
  blockTime: TimeSlotData[];
}
