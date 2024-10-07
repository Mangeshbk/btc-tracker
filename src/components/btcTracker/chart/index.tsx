import { useEffect, useRef } from "react";
import { createChart, UTCTimestamp } from "lightweight-charts";
import "./index.scss";
import { CompareIcon, ExpandIcon } from "../../../icons";

interface IPriceData {
  time: UTCTimestamp;
  value: number;
}

interface IVolumeData {
  time: UTCTimestamp;
  value: number;
}

interface IProps {
  priceData: IPriceData[];
  volumeData: IVolumeData[];
  chartRange: string;
  setChartRange: (range: string) => void;
}

export default function TradingViewChart({
  priceData,
  volumeData,
  chartRange,
  setChartRange,
}: IProps) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<any>(null);
  const timeRanges: string[] = ["1d", "3d", "1w", "1m", "6m", "1y", "max"];

  useEffect(() => {
    if (!chartContainerRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove();
    }

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth || 800,
      height: 400,
      layout: {
        textColor: "#d1d4dc",
      },
      grid: {
        vertLines: {
          color: "#f0f3fa",
          visible: true,
        },
        horzLines: {
          visible: false,
        },
      },
      timeScale: {
        borderVisible: true,
        borderColor: "#e9eaed",
        ticksVisible: false,
        tickMarkFormatter: () => "",
        timeVisible: false,
      },

      rightPriceScale: {
        visible: true,
        borderColor: "#e9eaed",
        textColor: "transparent",
      },
      crosshair: {
        mode: 1,
        vertLine: {
          labelVisible: false,
        },
        horzLine: {
          labelVisible: true,
        },
      },
      handleScroll: false,
      handleScale: false,
    });

    chartInstanceRef.current = chart;

    const priceSeries = chart.addAreaSeries({
      lineColor: "#4B40EE",
      topColor: "#e8e7ff",
      bottomColor: "#ffffff",
      lineWidth: 1,
    });
    priceSeries.setData(priceData);

    const volumeSeries = chart.addHistogramSeries({
      color: "#e8e7ff",
      priceLineVisible: false,
    });
    // volumeSeries.setData(volumeData);

    chart.timeScale().fitContent();

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
      }
    };
  }, [priceData, volumeData]);

  return (
    <main className='chartContainer'>
      <section className='controls'>
        <div>
          <button disabled>
            <ExpandIcon /> &nbsp; <span>Fullscreen</span>
          </button>
          <button disabled>
            {" "}
            <CompareIcon /> &nbsp; <span>Compare</span>
          </button>
        </div>
        <div>
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setChartRange(range)}
              className={chartRange === range ? "active" : ""}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </section>
      <div ref={chartContainerRef} className='chart'></div>
    </main>
  );
}
