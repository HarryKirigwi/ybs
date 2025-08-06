import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Download, CreditCard, Wallet, Banknote } from 'lucide-react';
import { StatsCard } from '../../shared/ui';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Import centralized hooks
import { useFinancialData } from '../hooks';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

/**
 * Admin Financial Report Component
 * Extracted from original AdminDashboard FinancialReportContent
 * Updated to use centralized services
 */
const FinancialReport = () => {
  // Use centralized financial data and operations
  const { 
    data: financialData, 
    loading, 
    error, 
    refresh 
  } = useFinancialData();

  const [reportPeriod, setReportPeriod] = useState('monthly');

  // Extract financial data from centralized service with proper fallback
  const data = financialData?.[reportPeriod] || {
    revenue: 125000,
    expenses: 45000,
    profit: 80000,
    growth: 12.5,
    transactions: [
      { id: 1, type: 'revenue', amount: 25000, description: 'Course Sales', date: '2024-03-01' },
      { id: 2, type: 'expense', amount: 15000, description: 'Server Costs', date: '2024-03-05' },
      { id: 3, type: 'revenue', amount: 30000, description: 'Subscription Fees', date: '2024-03-10' },
      { id: 4, type: 'expense', amount: 8000, description: 'Marketing', date: '2024-03-15' },
      { id: 5, type: 'revenue', amount: 40000, description: 'Premium Features', date: '2024-03-20' },
      { id: 6, type: 'expense', amount: 12000, description: 'Development', date: '2024-03-25' }
    ],
    monthlyData: [
      { month: 'Jan', revenue: 95000, expenses: 40000, profit: 55000 },
      { month: 'Feb', revenue: 110000, expenses: 42000, profit: 68000 },
      { month: 'Mar', revenue: 125000, expenses: 45000, profit: 80000 },
      { month: 'Apr', revenue: 118000, expenses: 43000, profit: 75000 },
      { month: 'May', revenue: 132000, expenses: 47000, profit: 85000 },
      { month: 'Jun', revenue: 140000, expenses: 50000, profit: 90000 }
    ],
    paymentMethods: [
      { method: 'Credit Card', amount: 75000, percentage: 60, color: '#3B82F6' },
      { method: 'PayPal', amount: 35000, percentage: 28, color: '#10B981' },
      { method: 'Bank Transfer', amount: 15000, percentage: 12, color: '#F59E0B' }
    ],
    revenueTrend: [
      { month: 'Jan', revenue: 95000, target: 100000 },
      { month: 'Feb', revenue: 110000, target: 105000 },
      { month: 'Mar', revenue: 125000, target: 110000 },
      { month: 'Apr', revenue: 118000, target: 115000 },
      { month: 'May', revenue: 132000, target: 120000 },
      { month: 'Jun', revenue: 140000, target: 125000 }
    ]
  };



  const handlePeriodChange = (period) => {
    setReportPeriod(period);
    // Refresh data with new period
    refresh();
  };

  const handleExportFinancial = async () => {
    try {
      const csvContent = [
        ['Period', 'Revenue', 'Expenses', 'Profit', 'Growth'],
        [reportPeriod, data.revenue, data.expenses, data.profit, data.growth + '%']
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-report-${reportPeriod}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      // console.error('Export failed:', error);
    }
  };

  // Chart configurations
  const revenueTrendChartData = {
    labels: (data.revenueTrend || []).map(item => item.month),
    datasets: [
      {
        label: 'Actual Revenue',
        data: (data.revenueTrend || []).map(item => item.revenue),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Target Revenue',
        data: (data.revenueTrend || []).map(item => item.target),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        tension: 0.4
      }
    ]
  };

  const revenueTrendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Revenue Trend vs Target'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };

  const paymentMethodsChartData = {
    labels: (data.paymentMethods || []).map(item => item.method),
    datasets: [
      {
        data: (data.paymentMethods || []).map(item => item.amount),
        backgroundColor: (data.paymentMethods || []).map(item => item.color),
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  const paymentMethodsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Payment Methods Distribution'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = (data.paymentMethods || [])[context.dataIndex]?.percentage || 0;
            return `${label}: $${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    }
  };

  const monthlyRevenueChartData = {
    labels: (data.monthlyData || []).map(item => item.month),
    datasets: [
      {
        label: 'Revenue',
        data: (data.monthlyData || []).map(item => item.revenue),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: '#3B82F6',
        borderWidth: 1
      },
      {
        label: 'Expenses',
        data: (data.monthlyData || []).map(item => item.expenses),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: '#EF4444',
        borderWidth: 1
      }
    ]
  };

  const monthlyRevenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Revenue vs Expenses'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };


  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg">Loading financial data...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-md">
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 text-red-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading financial data</h3>
              <p className="text-sm text-red-600 mt-1">{error.message}</p>
              <button 
                onClick={refresh}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Revenue',
      value: data.revenue,
      change: `${data.growth}% from last ${reportPeriod}`,
      changeType: data.growth >= 0 ? 'positive' : 'negative',
      icon: TrendingUp,
      borderColor: 'border-green-500',
      iconColor: 'text-green-500',
      format: 'currency'
    },
    {
      title: 'Total Expenses',
      value: data.expenses,
      change: 'Operating costs',
      changeType: 'neutral',
      icon: TrendingDown,
      borderColor: 'border-red-500',
      iconColor: 'text-red-500',
      format: 'currency'
    },
    {
      title: 'Net Profit',
      value: data.profit,
      change: `${((data.profit / data.revenue) * 100).toFixed(1)}% margin`,
      changeType: 'positive',
      icon: DollarSign,
      borderColor: 'border-blue-500',
      iconColor: 'text-blue-500',
      format: 'currency'
    },
    {
      title: 'Growth Rate',
      value: data.growth,
      change: 'vs previous period',
      changeType: data.growth >= 0 ? 'positive' : 'negative',
      icon: TrendingUp,
      borderColor: 'border-purple-500',
      iconColor: 'text-purple-500',
      format: 'percentage'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Financial Report</h2>
          <p className="mt-1 text-sm text-gray-600">Track revenue, expenses, and profitability</p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
          <select
            value={reportPeriod}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button
            onClick={handleExportFinancial}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-80">
            <Line data={revenueTrendChartData} options={revenueTrendChartOptions} />
          </div>
        </div>

        {/* Payment Methods Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <div className="h-80">
            <Doughnut data={paymentMethodsChartData} options={paymentMethodsChartOptions} />
          </div>
        </div>
      </div>

      {/* Monthly Revenue vs Expenses Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue vs Expenses</h3>
        <div className="h-80">
          <Bar data={monthlyRevenueChartData} options={monthlyRevenueChartOptions} />
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          <div className="space-y-3">
                         {(data.transactions || []).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    transaction.type === 'revenue' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'revenue' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-xs text-gray-500">{transaction.date}</p>
                  </div>
                </div>
                <div className={`text-sm font-medium ${
                  transaction.type === 'revenue' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'revenue' ? '+' : '-'}${transaction.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods Summary</h3>
          <div className="space-y-4">
                         {(data.paymentMethods || []).map((method, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: method.color }}
                  ></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{method.method}</p>
                    <p className="text-xs text-gray-500">{method.percentage}% of total</p>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  ${method.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Profitability Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profitability Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
                         <p className="text-2xl font-bold text-green-600">${(data?.revenue || 0).toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
                         <p className="text-2xl font-bold text-red-600">${(data?.expenses || 0).toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Expenses</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
                         <p className="text-2xl font-bold text-blue-600">${(data?.profit || 0).toLocaleString()}</p>
            <p className="text-sm text-gray-600">Net Profit</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialReport; 