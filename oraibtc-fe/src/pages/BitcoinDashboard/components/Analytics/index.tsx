import React from "react";
import {
  useGetAllCheckpointCharts,
  useGetAllBlockCharts,
} from "pages/BitcoinDashboard/hooks/backend.hook";
import useConfigReducer from "hooks/useConfigReducer";
import { Chart } from "./Chart";
import { formatUTCDateString } from "helper/format";
import { toDisplay } from "@oraichain/oraidex-common";
import styles from "./index.module.scss";

const Analytics: React.FC<{}> = () => {
  const btcAddress = useConfigReducer("btcAddress");
  const checkpointData = useGetAllCheckpointCharts({
    startTime: 0,
    endTime: Math.floor(new Date().getTime() / 1000),
    address: btcAddress[0],
  });
  const blockData = useGetAllBlockCharts({});
  return (
    <div>
      <div className={styles.grid}>
        <Chart
          height={300}
          title="Fee Rate"
          data={checkpointData?.feeRate || []}
          tooltipConfig={{
            title: "Fee Rate",
            formatTimeFunc: formatUTCDateString,
            formatValueFunc: (price) => `${price.toString()} unit`,
          }}
          priceFormatter={(price) => {
            return price.toString();
          }}
        />
        <Chart
          height={300}
          title="Total BTC Locked"
          data={checkpointData?.valueLocked || []}
          tooltipConfig={{
            title: "BTC Locked",
            formatTimeFunc: formatUTCDateString,
            formatValueFunc: (price) =>
              toDisplay(BigInt(Math.floor(price) || 0), 8) + " BTC",
          }}
          priceFormatter={(price) => {
            return toDisplay(BigInt(Math.floor(price) || 0), 8);
          }}
        />
      </div>

      <div>
        <Chart
          height={300}
          title="Deposit Fee"
          data={checkpointData?.deposit || []}
          tooltipConfig={{
            title: "Deposit Fee",
            formatTimeFunc: formatUTCDateString,
            formatValueFunc: (price) =>
              toDisplay(BigInt(Math.floor(price) || 0), 14, 8) + " BTC",
          }}
          priceFormatter={(price) => {
            return toDisplay(BigInt(Math.floor(price) || 0), 14, 8);
          }}
        />
        <Chart
          height={300}
          title="Withdrawal Fee"
          data={checkpointData?.withdraw || []}
          tooltipConfig={{
            title: "Withdrawal Fee",
            formatTimeFunc: formatUTCDateString,
            formatValueFunc: (price) =>
              toDisplay(BigInt(Math.floor(price) || 0), 14, 8) + " BTC",
          }}
          priceFormatter={(price) => {
            return toDisplay(BigInt(Math.floor(price) || 0), 14, 8);
          }}
        />
      </div>

      <div>
        <Chart
          height={300}
          title="Block Time"
          data={blockData?.blockTime || []}
          tooltipConfig={{
            title: "Block Time",
            formatTimeFunc: formatUTCDateString,
            formatValueFunc: (price) => price + " minutes",
          }}
          priceFormatter={(price) => {
            return toDisplay(BigInt(Math.floor(price) || 0), 14, 8);
          }}
        />
      </div>
    </div>
  );
};

export default Analytics;
