"use client";

import { useState, useEffect, useCallback } from "react";
import {
  EyeIcon,
  UsersIcon,
  CursorArrowRaysIcon,
  ChartBarIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

interface AnalyticsData {
  overview: {
    totalEvents: number;
    uniqueVisitors: number;
    pageViews: number;
    bounceRate: number;
  };
  topPages: Array<{ page: string; views: number }>;
  topReferrers: Array<{ referrer: string; visits: number }>;
  deviceStats: Array<{ device: string; count: number }>;
  browserStats: Array<{ browser: string; count: number }>;
  countryStats: Array<{ country: string; count: number }>;
  dailyStats: Array<{
    date: string;
    pageViews: number;
    uniqueVisitors: number;
    totalEvents: number;
  }>;
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState("30d");

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?period=${period}`);
      if (!response.ok) throw new Error("Failed to fetch analytics");

      const data = await response.json();
      setAnalytics(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-sm text-red-600">{error}</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">No analytics data available.</div>
      </div>
    );
  }

  const stats = [
    {
      name: "Total Page Views",
      value: formatNumber(analytics.overview.pageViews),
      icon: EyeIcon,
      change: "+12%",
      changeType: "positive",
    },
    {
      name: "Unique Visitors",
      value: formatNumber(analytics.overview.uniqueVisitors),
      icon: UsersIcon,
      change: "+8%",
      changeType: "positive",
    },
    {
      name: "Total Events",
      value: formatNumber(analytics.overview.totalEvents),
      icon: CursorArrowRaysIcon,
      change: "+15%",
      changeType: "positive",
    },
    {
      name: "Bounce Rate",
      value: `${analytics.overview.bounceRate.toFixed(1)}%`,
      icon: ChartBarIcon,
      change: "-3%",
      changeType: "negative",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-sm text-gray-700">
            Track your website performance and visitor behavior.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === "positive"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Top Pages</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.topPages.slice(0, 5).map((page, index) => (
                <div
                  key={page.page}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-900 truncate max-w-xs">
                      {page.page}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {formatNumber(page.views)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Referrers */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Top Referrers</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.topReferrers.slice(0, 5).map((referrer, index) => (
                <div
                  key={referrer.referrer}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-900 truncate max-w-xs">
                      {referrer.referrer || "Direct"}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {formatNumber(referrer.visits)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Device Stats */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Devices</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.deviceStats.slice(0, 5).map((device, index) => (
                <div
                  key={device.device}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-900">
                      {device.device || "Unknown"}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {formatNumber(device.count)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Browser Stats */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Browsers</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.browserStats.slice(0, 5).map((browser, index) => (
                <div
                  key={browser.browser}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-900">
                      {browser.browser || "Unknown"}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {formatNumber(browser.count)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Stats Chart Placeholder */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Daily Activity</h3>
        </div>
        <div className="p-6">
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Chart visualization
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Daily analytics chart would be displayed here with a charting
                library like Chart.js or Recharts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
