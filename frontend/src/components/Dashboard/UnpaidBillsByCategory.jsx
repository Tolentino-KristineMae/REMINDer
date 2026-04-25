import React, { useState } from 'react';
import { LayoutGrid, TrendingUp, CheckCircle2 } from 'lucide-react';
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

// ─── Helpers ────────────────────────────────────────────────────────────────
const hexToRgb = (hex = '#6366f1') => {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
};

// ─── Chart Card ─────────────────────────────────────────────────────────────
const ChartCard = ({ historicalData, monthLabels }) => {
  const [activeIdx, setActiveIdx] = useState(null);

  const datasets = historicalData.map((item, i) => {
    const [r, g, b] = hexToRgb(item.color);
    const isActive = activeIdx === null || activeIdx === i;
    return {
      label: item.category_name,
      data: item.data,
      borderColor: item.color || '#6366f1',
      borderWidth: isActive ? 2.5 : 1.5,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: item.color || '#6366f1',
      pointHoverBorderColor: '#ffffff',
      pointHoverBorderWidth: 2,
      fill: true,
      backgroundColor: (ctx) => {
        const grad = ctx.chart.ctx.createLinearGradient(0, 0, 0, 220);
        const alpha = isActive ? 0.14 : 0.04;
        grad.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        return grad;
      },
      tension: 0.45,
      borderDash: isActive ? [] : [4, 3],
    };
  });

  const maxVal = historicalData.length > 0
    ? Math.max(...historicalData.flatMap(d => d.data), 5)
    : 10;
  const yMax = Math.max(Math.ceil(maxVal / 5) * 5, 5);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: '#ffffff',
        titleColor: '#111827',
        bodyColor: '#6b7280',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 14,
        cornerRadius: 14,
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
        boxPadding: 5,
        usePointStyle: true,
        titleFont: { size: 12, weight: '700', family: 'system-ui, sans-serif' },
        bodyFont: { size: 12, weight: '500', family: 'system-ui, sans-serif' },
        titleMarginBottom: 8,
        bodySpacing: 5,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y} ${ctx.parsed.y === 1 ? 'bill' : 'bills'}`,
          labelColor: (ctx) => ({
            borderColor: ctx.dataset.borderColor,
            backgroundColor: ctx.dataset.borderColor,
            borderWidth: 2,
            borderRadius: 3,
          }),
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
        ticks: { color: '#94a3b8', font: { size: 11, weight: '500' }, padding: 6 },
        border: { display: false },
      },
      y: {
        min: 0,
        max: yMax,
        grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
        ticks: {
          color: '#94a3b8',
          font: { size: 11, weight: '500' },
          stepSize: 1,
          padding: 6,
          callback: (v) => Math.floor(v),
        },
        border: { display: false },
      },
    },
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-start justify-between border-b border-gray-50">
        <div>
          <h3 className="text-base font-bold text-gray-900 tracking-tight">Most Used Categories</h3>
          <p className="text-[11px] text-gray-400 font-medium mt-0.5">Bill frequency over time</p>
        </div>
        <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center">
          <TrendingUp size={15} className="text-indigo-500" />
        </div>
      </div>

      {/* Chart */}
      <div className="px-4 pt-4 pb-2" style={{ height: 210 }}>
        <Line data={{ labels: monthLabels, datasets }} options={options} />
      </div>

      {/* Legend */}
      <div className="px-5 pb-5 pt-3 border-t border-gray-50 flex flex-wrap gap-x-4 gap-y-2">
        {historicalData.slice(0, 6).map((item, i) => (
          <button
            key={i}
            onMouseEnter={() => setActiveIdx(i)}
            onMouseLeave={() => setActiveIdx(null)}
            className={`flex items-center gap-1.5 transition-opacity duration-150 ${
              activeIdx !== null && activeIdx !== i ? 'opacity-40' : 'opacity-100'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: item.color }}
            />
            <span className="text-[11px] font-semibold text-gray-600">{item.category_name}</span>
            <span className="text-[11px] font-bold text-gray-400">({item.total_bills})</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Category Bars Card ──────────────────────────────────────────────────────
const CategoryBarsCard = ({ categories }) => {
  const totalBills = categories.reduce((sum, c) => sum + c.count, 0);
  const maxCount = categories.length > 0 ? Math.max(...categories.map(c => c.count)) : 1;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-start justify-between border-b border-gray-50">
        <div>
          <h3 className="text-base font-bold text-gray-900 tracking-tight">Unpaid Bills by Category</h3>
          <p className="text-[11px] text-gray-400 font-medium mt-0.5">
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center">
          <LayoutGrid size={15} className="text-orange-400" />
        </div>
      </div>

      <div className="px-5 py-4">
        {categories.length > 0 ? (
          <div className="space-y-3">
            {categories.map((cat, i) => {
              const pct = totalBills > 0 ? Math.round((cat.count / totalBills) * 100) : 0;
              const barWidth = maxCount > 0 ? (cat.count / maxCount) * 100 : 0;
              const [r, g, b] = hexToRgb(cat.color);
              return (
                <div key={cat.id || i} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: cat.color || '#22c55e' }}
                      />
                      <span className="text-[13px] font-semibold text-gray-700 truncate">
                        {cat.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          color: cat.color || '#22c55e',
                          background: `rgba(${r},${g},${b},0.1)`,
                        }}
                      >
                        {pct}%
                      </span>
                      <span className="text-[13px] font-black text-gray-800 w-5 text-right">
                        {cat.count}
                      </span>
                    </div>
                  </div>
                  {/* Bar track */}
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${barWidth}%`,
                        background: `linear-gradient(90deg, rgba(${r},${g},${b},0.7), ${cat.color})`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-3">
              <CheckCircle2 size={26} className="text-emerald-400" />
            </div>
            <p className="text-sm font-bold text-gray-400">All bills are settled!</p>
            <p className="text-[11px] text-gray-300 mt-1">No unpaid bills this month</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {categories.length > 0 && (
        <div className="px-5 py-3.5 border-t border-gray-50 flex items-center justify-between">
          <span className="text-[12px] font-semibold text-gray-400">Total unpaid</span>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-black text-gray-900">{totalBills}</span>
            <span className="text-[11px] text-gray-400 font-medium">bills</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Export ─────────────────────────────────────────────────────────────
const UnpaidBillsByCategory = ({ categories = [], historicalData = [] }) => {
  const monthLabels = [];
  const now = new Date();
  const dataLength = historicalData.length > 0 && historicalData[0].data
    ? historicalData[0].data.length
    : 12;
  for (let i = dataLength - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(d.toLocaleString('default', { month: 'short' }));
  }

  return (
    <div className="space-y-5">
      {historicalData.length > 0 && (
        <ChartCard historicalData={historicalData} monthLabels={monthLabels} />
      )}
      <CategoryBarsCard categories={categories} />
    </div>
  );
};

export default UnpaidBillsByCategory;
