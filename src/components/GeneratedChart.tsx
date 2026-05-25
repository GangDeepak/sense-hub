import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface GeneratedChartProps {
  type: string;
  data: any;
  options?: any;
}

const GeneratedChart: React.FC<GeneratedChartProps> = ({ type, data, options }) => {
  // If no data or labels, don't render (as requested)
  if (!data || !data.labels || !data.labels.length) {
    return null;
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    ...options,
    plugins: {
      ...options?.plugins,
      legend: {
        position: 'top' as const,
        labels: {
          color: 'hsl(var(--foreground))',
          font: {
            size: 11,
            family: "'Inter', sans-serif",
          }
        },
        ...options?.plugins?.legend,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 13,
        },
        bodyFont: {
          size: 12,
        },
        padding: 10,
        cornerRadius: 8,
        displayColors: true,
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          font: { size: 10 }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        }
      },
      y: {
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          font: { size: 10 }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        }
      }
    }
  };

  // Add some default colors if datasets don't have them
  const enrichedData = {
    ...data,
    datasets: data.datasets.map((dataset: any, index: number) => {
      const colors = [
        'rgba(59, 130, 246, 0.8)',   // Blue
        'rgba(16, 185, 129, 0.8)',   // Emerald
        'rgba(245, 158, 11, 0.8)',   // Amber
        'rgba(239, 68, 68, 0.8)',    // Red
        'rgba(139, 92, 246, 0.8)',   // Violet
        'rgba(236, 72, 153, 0.8)',   // Pink
      ];
      const borderColors = [
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(245, 158, 11)',
        'rgb(239, 68, 68)',
        'rgb(139, 92, 246)',
        'rgb(236, 72, 153)',
      ];
      
      return {
        ...dataset,
        backgroundColor: dataset.backgroundColor || colors[index % colors.length],
        borderColor: dataset.borderColor || borderColors[index % borderColors.length],
        borderWidth: dataset.borderWidth || 1,
      };
    }),
  };

  const renderChart = () => {
    switch (type.toLowerCase()) {
      case 'bar':
        return <Bar data={enrichedData} options={chartOptions} />;
      case 'line':
        return <Line data={enrichedData} options={chartOptions} />;
      case 'pie':
        // Pie/Doughnut don't use scales
        const { scales, ...pieOptions } = chartOptions;
        return <Pie data={enrichedData} options={pieOptions} />;
      case 'doughnut':
        const { scales: scalesD, ...doughnutOptions } = chartOptions;
        return <Doughnut data={enrichedData} options={doughnutOptions} />;
      default:
        return <Bar data={enrichedData} options={chartOptions} />;
    }
  };

  return (
    <div className="w-full h-[320px] my-5 p-5 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm shadow-sm animate-fade-in group hover:border-border/80 transition-all duration-300">
      <div className="w-full h-full">
        {renderChart()}
      </div>
    </div>
  );
};

export default GeneratedChart;
