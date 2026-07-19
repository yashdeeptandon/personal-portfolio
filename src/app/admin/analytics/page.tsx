"use client";

import { useState, useEffect, useCallback } from "react";
import {
  EyeIcon,
  UsersIcon,
  CursorArrowRaysIcon,
  ChartBarIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No analytics data available.
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

  const statTables = [
    {
      title: "Top Pages",
      items: analytics.topPages.slice(0, 5).map((p) => ({
        label: p.page,
        value: p.views,
      })),
    },
    {
      title: "Top Referrers",
      items: analytics.topReferrers.slice(0, 5).map((r) => ({
        label: r.referrer || "Direct",
        value: r.visits,
      })),
    },
    {
      title: "Devices",
      items: analytics.deviceStats.slice(0, 5).map((d) => ({
        label: d.device || "Unknown",
        value: d.count,
      })),
    },
    {
      title: "Browsers",
      items: analytics.browserStats.slice(0, 5).map((b) => ({
        label: b.browser || "Unknown",
        value: b.count,
      })),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Analytics
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track your website performance and visitor behavior.
          </p>
        </div>
        <div className="mt-4 flex items-center gap-2 sm:mt-0">
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          <Select
            value={period}
            onValueChange={(value) => setPeriod((value as string) ?? "30d")}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent>
              <div className="flex items-center">
                <stat.icon className="h-6 w-6 shrink-0 text-muted-foreground" />
                <div className="ml-5 w-0 flex-1">
                  <p className="truncate text-sm font-medium text-muted-foreground">
                    {stat.name}
                  </p>
                  <div className="flex items-baseline">
                    <div className="text-2xl font-semibold text-foreground">
                      {stat.value}
                    </div>
                    <div
                      className={`ml-2 text-sm font-semibold ${
                        stat.changeType === "positive"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {stat.change}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {statTables.map((table) => (
          <Card key={table.title} className="overflow-hidden py-0">
            <CardHeader className="border-b border-border py-4">
              <CardTitle>{table.title}</CardTitle>
            </CardHeader>
            <CardContent className="py-4">
              <div className="space-y-4">
                {table.items.map((item, index) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        {index + 1}
                      </span>
                      <span className="max-w-xs truncate text-sm text-foreground">
                        {item.label}
                      </span>
                    </div>
                    <span className="shrink-0 text-sm font-medium text-foreground">
                      {formatNumber(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Daily Stats Chart Placeholder */}
      <Card className="overflow-hidden py-0">
        <CardHeader className="border-b border-border py-4">
          <CardTitle>Daily Activity</CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          <div className="flex h-64 items-center justify-center rounded-lg bg-muted">
            <div className="text-center">
              <ChartBarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-foreground">
                Chart visualization
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Daily analytics chart would be displayed here with a charting
                library like Chart.js or Recharts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
