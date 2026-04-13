import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const UnpaidBillsByCategory = ({ categories = [], historicalData = [] }) => {
  const getPercentageColor = (pct) => {
    if (pct < 40) return 'text-red-400 bg-red-500/10';
    if (pct < 80) return 'text-amber-400 bg-amber-500/10';
    return 'text-emerald-400 bg-emerald-500/10';
  };

  // Generate month labels based on the data length (dynamic based on actual data)
  const monthLabels = [];
  const now = new Date();
  const dataLength = historicalData.length > 0 && historicalData[0].data ? historicalData[0].data.length : 12;
  
  for (let i = dataLength - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(date.toLocaleString('default', { month: 'short' }));
  }

  // Generate datasets from historical data (REAL DATA ONLY - sorted by most used)
  const datasets = historicalData.map((item) => ({
    label: item.category_name,
    data: item.data,
    borderColor: item.color || '#6366f1',
    borderWidth: 3,
    pointRadius: 0,
    pointHoverRadius: 5,
    pointHoverBackgroundColor: item.color || '#6366f1',
    pointHoverBorderColor: '#ffffff',
    pointHoverBorderWidth: 2,
    fill: true,
    backgroundColor: (ctx) => {
      const color = item.color || '#6366f1';
      const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 220);
      const r = parseInt(color.slice(1, 3), 16);
      const gr = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      g.addColorStop(0, `rgba(${r},${gr},${b},0.15)`);
      g.addColorStop(0.5, `rgba(${r},${gr},${b},0.08)`);
      g.addColorStop(1, `rgba(${r},${gr},${b},0)`);
      return g;
    },
    tension: 0.45,
  }));

  const chartData = {
    labels: monthLabels,
    datasets: datasets,
  };

  // Calculate max value for Y-axis from real historical data
  const maxBillCount = historicalData.length > 0
    ? Math.max(...historicalData.flatMap(item => item.data), 5)
    : 10;
  const yAxisMax = Math.max(Math.ceil(maxBillCount / 5) * 5, 5);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: { 
        enabled: true,
        mode: 'index', 
        intersect: false,
        backgroundColor: '#ffffff',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 16,
        cornerRadius: 12,
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
        boxPadding: 6,
        usePointStyle: true,
        titleFont: {
          size: 13,
          weight: '600',
          family: 'system-ui, -apple-system, sans-serif',
        },
        bodyFont: {
          size: 13,
          weight: '500',
          family: 'system-ui, -apple-system, sans-serif',
        },
        titleMarginBottom: 10,
        bodySpacing: 6,
        callbacks: {
          title: function(context) {
            return context[0].label;
          },
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return ` ${label}: ${value} ${value === 1 ? 'bill' : 'bills'}`;
          },
          labelColor: function(context) {
            return {
              borderColor: context.dataset.borderColor,
              backgroundColor: context.dataset.borderColor,
              borderWidth: 2,
              borderRadius: 4,
            };
          }
        }
      },
    },
    scales: {
      x: {
        grid: { 
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: { 
          color: '#64748b', 
          font: { size: 11, weight: '500' },
          padding: 8,
        },
      },
      y: {
        min: 0,
        max: yAxisMax,
        grid: { 
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: '#64748b',
          font: { size: 11, weight: '500' },
          stepSize: 1,
          padding: 8,
          callback: (v) => Math.floor(v),
        },
      },
    },
  };

  const totalBills = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="space-y-6">
      {/* Historical Chart - Most Used Categories (REAL DATA) */}
      {historicalData.length > 0 && (
        <div
          className="relative rounded-2xl overflow-hidden flex flex-col bg-white border shadow-sm w-full"
          style={{ 
            borderColor: '#e5e7eb', 
            padding: '16px',
          }}
        >

          {/* Header */}
          <div className="mb-5 mt-1">
            <h3 className="text-lg font-bold text-gray-900">
              Most Used Categories
            </h3>
            <p className="text-xs font-semibold text-gray-500">
              Historical overview
            </p>
          </div>

          {/* Area Chart with modern background */}
          <div 
            className="rounded-xl p-3 sm:p-4 w-full" 
            style={{ 
              position: 'relative', 
              height: '200px',
              minHeight: '200px',
              marginBottom: '10px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            }}
          >
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Legend showing top categories */}
          <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-100">
            {historicalData.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: item.color }}
                />
                <span className="text-xs font-medium text-gray-600">
                  {item.category_name}
                </span>
                <span className="text-xs font-bold text-gray-900">
                  ({item.total_bills})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Bars - Current Unpaid Bills */}
      <div
        className="relative rounded-2xl overflow-hidden flex flex-col bg-white border shadow-sm w-full"
        style={{ borderColor: '#e5e7eb', padding: '16px' }}
      >

        {/* Header */}
        <div className="mb-5 mt-1">
          <h3 className="text-lg font-bold text-gray-900">
            Unpaid Bills by Category
          </h3>
          <p className="text-xs font-semibold text-orange-500">
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Category Bars */}
        <div className="space-y-3 flex-1">
          {categories.length > 0 ? (
            categories.map((cat, i) => {
              const catPct = totalBills > 0 ? Math.round((cat.count / totalBills) * 100) : 0;
              return (
                <div key={cat.id || i} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ background: cat.color || '#22c55e' }}
                      />
                      <span className="text-sm font-semibold text-gray-700">
                        {cat.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">
                        {cat.count}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        bills
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getPercentageColor(catPct)}`}>
                        {catPct}%
                      </span>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out group-hover:opacity-80"
                      style={{
                        width: `${catPct}%`,
                        background: cat.color || '#22c55e',
                      }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-10 opacity-60">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 text-orange-300">
                <TrendingUp size={32} />
              </div>
              <p className="text-sm font-bold text-orange-900/40 uppercase tracking-widest">
                No Unpaid Bills
              </p>
              <p className="text-xs text-orange-900/30 mt-1">
                All bills are settled!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
          <span className="text-sm font-semibold text-gray-500">
            Total Unpaid Bills
          </span>
          <span className="text-lg font-black text-gray-900">
            {totalBills}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UnpaidBillsByCategory;
