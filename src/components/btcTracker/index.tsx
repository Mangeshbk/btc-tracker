import { useEffect, useMemo, useState } from "react";
import "./index.scss";
import { Tabs } from "antd";
import Chart from "./chart";
import axios from "axios";
import { amountWrapper } from "../../utils/helpers";

interface TabItem {
  key: string;
  label: string;
  children: React.ReactNode;
}

export default function BtcTracker() {
  const [activeType, setActiveType] = useState("2");
  const [priceData, setPriceData] = useState([]);
  const [volumeData, setVolumeData] = useState([]); // Volume data state
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number | null>(null);
  const [percentageChange, setPercentageChange] = useState<number | null>(null);
  const [chartRange, setChartRange] = useState("1w");
  const [labels, setLabels] = useState<string[]>([]);

  const handleTabChange = (key: string) => {
    setActiveType(key);
  };

  const tabsList: TabItem[] = useMemo(() => {
    return [
      { key: "1", label: "Summary", children: <div>Summary</div> },
      {
        key: "2",
        label: "Chart",
        children:
          priceData.length && volumeData.length ? (
            <Chart
              priceData={priceData}
              volumeData={volumeData}
              chartRange={chartRange}
              setChartRange={setChartRange}
            />
          ) : (
            <div className='chartContainerLoader skeleton'></div>
          ),
      },
      { key: "3", label: "Statistics", children: <div>Statistics</div> },
      { key: "4", label: "Analysis", children: <div>Analysis</div> },
      { key: "5", label: "Settings", children: <div>Settings</div> },
    ];
  }, [priceData, volumeData, labels, chartRange]);

  useEffect(() => {
    fetchData(chartRange);
  }, [chartRange]);

  const fetchData = async (selectedRange: string) => {
    let days;
    switch (selectedRange) {
      case "1d":
        days = 1;
        break;
      case "3d":
        days = 3;
        break;
      case "1w":
        days = 7;
        break;
      case "1m":
        days = 30;
        break;
      case "6m":
        days = 180;
        break;
      case "1y":
        days = 365;
        break;
      case "max":
        days = "max";
        break;
      default:
        days = 7;
    }

    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart`,
        {
          params: { vs_currency: "usd", days },
        }
      );
      const prices = response.data.prices;
      const volumes = response.data.total_volumes;
      setPriceData(prices.map((p: any) => ({ time: p[0], value: p[1] })));
      setVolumeData(volumes.map((v: any) => ({ time: v[0], value: v[1] })));
      setLabels(prices.map((p: any) => new Date(p[0]).toLocaleDateString()));
      const latestPrice = prices[prices.length - 1][1];
      const initialPrice = prices[0][1];
      setCurrentPrice(latestPrice);
      setPriceChange(latestPrice - initialPrice);
      setPercentageChange(((latestPrice - initialPrice) / initialPrice) * 100);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <main className='btcTrackerContainer'>
      <div className='latestPrice'>
        {currentPrice ? (
          <div className='currentPrice'>
            <h1>{`${amountWrapper(currentPrice || 0)}`}</h1>
            <p>USD</p>
          </div>
        ) : (
          <div className='currentPriceLoader skeleton'></div>
        )}
        {currentPrice ? (
          <h3
            className={`priceChanges ${
              priceChange && priceChange < 0 ? "negative" : "positive"
            }`}
          >
            {priceChange &&
              `${priceChange >= 0 ? "+" : ""} ${amountWrapper(
                priceChange
              )}`}{" "}
            (
            {percentageChange !== null ? `${percentageChange.toFixed(2)}%` : ""}
            )
          </h3>
        ) : (
          <div className='priceChangesLoader skeleton'></div>
        )}
      </div>
      <Tabs
        defaultActiveKey={"2"}
        activeKey={activeType}
        items={tabsList}
        onChange={handleTabChange}
      />
    </main>
  );
}
