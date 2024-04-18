export interface TimeSlotData {
  time: number;
  value: number;
}

export interface AllChartsData {
  deposit: TimeSlotData[];
  withdraw: TimeSlotData[];
  feeRate: TimeSlotData[];
  valueLocked: TimeSlotData[];
}
