import { TIMER } from "helper/constants";
import {
  formatDateChart,
  formatDisplayUsdt,
  formatNumberKMB,
  formatUTCDateString,
} from "helper/format";
import useTheme from "hooks/useTheme";
import {
  ChartOptions,
  ColorType,
  DeepPartial,
  LineStyle,
  PriceScaleMode,
  TickMarkType,
  Time,
  createChart,
} from "lightweight-charts";
import { useEffect, useRef } from "react";
import styles from "./Chart.module.scss";
import { TimeSlotData } from "pages/BitcoinDashboard/@types/Analytics.types";

export interface TooltipConfigurator {
  title: string;
  formatTimeFunc: (time: number) => string;
  formatValueFunc: (value: number) => string;
}

export const Chart = ({
  height = 150,
  data,
  title,
  tooltipConfig,
  priceFormatter = (price) => {
    return formatNumberKMB(Number(price));
  },
}: {
  height?: number;
  title: string;
  tooltipConfig: TooltipConfigurator;
  data: TimeSlotData[];
  priceFormatter?: (value: any) => any;
}) => {
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const serieRef = useRef(null);
  const resizeObserver = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    resizeObserver.current = new ResizeObserver((entries, b) => {
      window.requestAnimationFrame((): void | undefined => {
        if (!Array.isArray(entries) || !entries.length) {
          return;
        }

        const { width, height } = entries[0].contentRect;
        chartRef.current.applyOptions({ width, height });
        setTimeout(() => {
          chartRef.current.timeScale().fitContent();
        }, 0);
      });
    });

    resizeObserver.current.observe(containerRef.current, {
      box: "content-box",
    });
    return () => {
      resizeObserver.current.disconnect();
    };
  }, []);

  const defaultOption: DeepPartial<ChartOptions> = {
    rightPriceScale: {
      borderColor: theme === "light" ? "#EFEFEF" : "#232521",
      borderVisible: false,
      scaleMargins: {
        top: 0.1,
        bottom: 0.05,
      },
    },
    leftPriceScale: {
      visible: false,
      borderColor: theme === "light" ? "#EFEFEF" : "#232521",
    },
    layout: {
      background: {
        type: ColorType.Solid,
        color: "transparent",
      },

      textColor: theme === "light" ? "#686A66" : "#979995",
    },
    localization: {
      locale: "en-US",
      dateFormat: "dd MMM, yyyy",
      priceFormatter,
    },
    grid: {
      horzLines: {
        color: theme === "light" ? "#EFEFEF" : "#494949",
      },
      vertLines: {
        visible: false,
      },
    },
    crosshair: {
      horzLine: {
        visible: false,
        labelVisible: false,
        style: LineStyle.Dotted,
        width: 1,
        color: theme === "light" ? "#A6BE93" : "#A6BE93",
        labelBackgroundColor: "#aee67f",
      },
      vertLine: {
        visible: true,
        labelVisible: false,
        style: LineStyle.Solid,
        width: 1,
        color: theme === "light" ? "#DFE0DE" : "#494949",
        labelBackgroundColor: "#aee67f",
      },
    },
    timeScale: {
      rightOffset: 1,
      barSpacing: 28,

      borderColor: theme === "light" ? "#EFEFEF" : "#232521",
      timeVisible: true,
      secondsVisible: false,

      rightBarStaysOnScroll: true,
      lockVisibleTimeRangeOnResize: true,
      ticksVisible: false,

      tickMarkFormatter: (
        time: Time,
        tickMarkType: TickMarkType,
        locale: string
      ) => {
        // formatTime Feb 1, Mar 2,....
        const timestamp = Number(time) * TIMER.MILLISECOND;
        return formatDateChart(timestamp);
      },
    },
  };

  useEffect(() => {
    // Initialization
    if (chartRef.current === null) {
      chartRef.current = createChart(containerRef.current, defaultOption);
      serieRef.current = chartRef.current.addAreaSeries({
        priceLineVisible: false,
        lineColor: "#A6BE93",
        lineWidth: 3,
        topColor: "transparent",
        bottomColor: "transparent",
      });
    }

    const toolTipWidth = 96;
    const toolTipHeight = 80;
    const toolTipMargin = 15;
    // Create and style the tooltip html element
    const toolTip = document.createElement("div");
    // @ts-ignore
    toolTip.style = `width: 286px; height: 100px; position: absolute; display: none; box-sizing: border-box; text-align: left; z-index: 1000; top: 12px; left: 12px; pointer-events: none;`;
    toolTip.style.background = theme === "light" ? "#FFF" : "#31332E";
    toolTip.style.fontWeight = "500";
    toolTip.style.borderRadius = "8px";
    toolTip.style.overflow = "hidden";
    toolTip.style.padding = "12px";
    toolTip.style.boxShadow = "0px 5px 11px 0px rgba(95, 104, 123, 0.12);";
    toolTip.style.border = "1px solid rgba(255, 82, 82, 1)";
    containerRef.current.appendChild(toolTip);

    // update tooltip
    chartRef.current.subscribeCrosshairMove((param) => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > containerRef.current.clientWidth ||
        param.point.y < 0 ||
        param.point.y > containerRef.current.clientHeight
      ) {
        toolTip.style.display = "none";
      } else {
        toolTip.style.display = "block";
        const data = param.seriesData.get(serieRef.current);
        const price = data.value !== undefined ? data.value : 0;
        toolTip.innerHTML = `
                  <div style="color: ${
                    theme === "light" ? "#686A66" : "#979995"
                  }">
                    ${tooltipConfig.formatTimeFunc(param.time * 1000)}
                  </div>
                  <div style="font-size: 14px; margin: 4px 0px; color: ${"#5EA402"}">
                    ${tooltipConfig.formatValueFunc(price)}
                  </div>
                  <div style="color: ${
                    theme === "light" ? "#686A66" : "#979995"
                  }">
                    ${tooltipConfig.title}
                  </div>`;

        const y = param.point.y;
        let left = param.point.x + toolTipMargin;
        if (left > containerRef.current.clientWidth - toolTipWidth) {
          left = param.point.x - toolTipMargin - toolTipWidth;
        }

        let top = y + toolTipMargin;
        if (top > containerRef.current.clientHeight - toolTipHeight) {
          top = y - toolTipHeight - toolTipMargin;
        }
        toolTip.style.left = left + "px";
        toolTip.style.top = top + "px";
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // update theme color chart
  useEffect(() => {
    if (!chartRef?.current) return;

    chartRef.current.applyOptions(defaultOption);

    // remove current series
    chartRef.current.removeSeries(serieRef.current);

    serieRef.current = chartRef.current.addAreaSeries({
      priceLineVisible: true,
      lineColor: theme === "light" ? "#A6BE93" : "#A6BE93",
      lineWidth: 3,
      topColor: "transparent",
      bottomColor: "transparent",
    });

    // update new theme series with current data
    let newData = data?.map((val) => {
      return {
        ...val,
      };
    });

    serieRef?.current?.setData(newData);
    chartRef.current.timeScale()?.fitContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  // set data from api to chart
  useEffect(() => {
    let newData = data?.map((val) => {
      return {
        ...val,
      };
    });
    serieRef?.current?.setData(newData);
    chartRef?.current?.timeScale()?.fitContent();
  }, [data]);

  return (
    <div className={styles.chart}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
      </div>
      <div className={styles.chartContainer} style={{ height }}>
        <div className={styles.chartRoot} ref={containerRef} />
      </div>
    </div>
  );
};
