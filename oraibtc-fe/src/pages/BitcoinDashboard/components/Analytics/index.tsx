import React from "react";
import { useGetAllCharts } from "pages/BitcoinDashboard/hooks/backend.hook";
import useConfigReducer from "hooks/useConfigReducer";
import { Chart } from "./Chart";
import { formatUTCDateString } from "helper/format";
import { toDisplay } from "@oraichain/oraidex-common";
import styles from "./index.module.scss";

const Analytics: React.FC<{}> = () => {
  const btcAddress = useConfigReducer("btcAddress");
  const data = useGetAllCharts({
    startTime: 0,
    endTime: Math.floor(new Date().getTime() / 1000),
    address: btcAddress[0],
  });
  console.log("Word", data);
  return (
    <div>
      <div className={styles.grid}>
        <Chart
          height={300}
          title="Fee Rate"
          data={data?.feeRate || []}
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
          data={data?.valueLocked || []}
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
          data={data?.deposit || []}
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
          data={data?.withdraw || []}
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
    </div>
  );
};

export default Analytics;
