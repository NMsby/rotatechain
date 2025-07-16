import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LiquidityDataPoint {
  time: string;
  liquidity: number;
  volume: number;
}

const MetapoolLiquidityGraph: React.FC = () => {
  const [liquidityData, setLiquidityData] = useState<LiquidityDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate real-time data updates
  useEffect(() => {
    // Initial data load
    const generateInitialData = () => {
      const now = new Date();
      const data: LiquidityDataPoint[] = [];
      
      for (let i = 12; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 5 * 60000);
        data.push({
          time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          liquidity: Math.random() * 100 + 50,
          volume: Math.random() * 20 + 5
        });
      }
      return data;
    };

    setLiquidityData(generateInitialData());
    setIsLoading(false);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setLiquidityData(prev => {
        const now = new Date();
        const newData = [...prev.slice(1)];
        newData.push({
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          liquidity: prev[prev.length - 1].liquidity + (Math.random() - 0.5) * 5,
          volume: prev[prev.length - 1].volume + (Math.random() - 0.5) * 2
        });
        return newData;
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Chart configuration
  const chartData = {
    labels: liquidityData.map(d => d.time),
    datasets: [
      {
        label: 'Liquidity (ETH)',
        data: liquidityData.map(d => d.liquidity),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 5
      },
      {
        label: 'Volume (ETH)',
        data: liquidityData.map(d => d.volume),
        borderColor: 'rgb(14, 165, 233)',
        backgroundColor: 'rgba(14, 165, 233, 0.2)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 5,
        yAxisID: 'y1'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Liquidity (ETH)',
          color: 'rgb(156, 163, 175)'
        },
        grid: {
          color: 'rgba(55, 65, 81, 0.1)'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Volume (ETH)',
          color: 'rgb(156, 163, 175)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(156, 163, 175)',
          usePointStyle: true,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: 'rgb(209, 213, 219)',
        bodyColor: 'rgb(209, 213, 219)',
        borderColor: 'rgba(55, 65, 81, 0.5)',
        borderWidth: 1,
        padding: 12,
        usePointStyle: true,
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-100">Metapool Liquidity Analytics</h2>
        <div className="flex space-x-2">
          <button className="text-xs bg-indigo-800 text-indigo-100 px-2 py-1 rounded">
            5m
          </button>
          <button className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
            1h
          </button>
          <button className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
            24h
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse">
            <div className="bg-gray-700 rounded-xl h-64 w-full" />
          </div>
        </div>
      ) : (
        <div className="flex-1">
          <Line data={chartData} options={options} />
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-gray-400 text-sm">Current Liquidity</p>
          <p className="text-lg font-bold text-indigo-400">
            {liquidityData.length ? `${liquidityData[liquidityData.length - 1].liquidity.toFixed(2)} ETH` : '0.00 ETH'}
          </p>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-gray-400 text-sm">24h Volume</p>
          <p className="text-lg font-bold text-sky-400">
            {liquidityData.length ? `${liquidityData.reduce((sum, d) => sum + d.volume, 0).toFixed(2)} ETH` : '0.00 ETH'}
          </p>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-gray-400 text-sm">Active Pools</p>
          <p className="text-lg font-bold text-emerald-400">12</p>
        </div>
      </div>
    </div>
  );
};

export default MetapoolLiquidityGraph;