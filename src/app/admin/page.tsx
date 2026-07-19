"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DocumentTextIcon,
  FolderIcon,
  ChatBubbleLeftRightIcon,
  UsersIcon,
  EyeIcon,
  HeartIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DashboardStats {
  blogs: {
    total: number;
    published: number;
    drafts: number;
    totalViews: number;
    totalLikes: number;
  };
  projects: {
    total: number;
    completed: number;
    inProgress: number;
  };
  contacts: {
    total: number;
    unread: number;
    replied: number;
  };
  testimonials: {
    total: number;
    pending: number;
    approved: number;
  };
  analytics: {
    totalPageViews: number;
    uniqueVisitors: number;
    bounceRate: number;
  };
}

interface RecentActivity {
  id: string;
  type: "blog" | "project" | "contact" | "testimonial";
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/dashboard");

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      setStats(data.data.stats);
      setRecentActivity(data.data.recentActivity);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
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
        <p className="text-destructive">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-2 text-destructive underline hover:text-destructive/80"
        >
          Try again
        </button>
      </div>
    );
  }

  const statCards = [
    {
      name: "Blog Posts",
      value: stats?.blogs.total || 0,
      subtext: `${stats?.blogs.published || 0} published, ${stats?.blogs.drafts || 0} drafts`,
      icon: DocumentTextIcon,
      color: "bg-blue-500",
      href: "/admin/blog",
    },
    {
      name: "Projects",
      value: stats?.projects.total || 0,
      subtext: `${stats?.projects.completed || 0} completed, ${stats?.projects.inProgress || 0} in progress`,
      icon: FolderIcon,
      color: "bg-green-500",
      href: "/admin/projects",
    },
    {
      name: "Contact Messages",
      value: stats?.contacts.total || 0,
      subtext: `${stats?.contacts.unread || 0} unread`,
      icon: ChatBubbleLeftRightIcon,
      color: "bg-amber-500",
      href: "/admin/contact",
    },
    {
      name: "Testimonials",
      value: stats?.testimonials.total || 0,
      subtext: `${stats?.testimonials.pending || 0} pending approval`,
      icon: UsersIcon,
      color: "bg-purple-500",
      href: "/admin/testimonials",
    },
  ];

  const analyticsCards = [
    {
      name: "Total Views",
      value: stats?.blogs.totalViews || 0,
      icon: EyeIcon,
      color: "text-blue-500",
    },
    {
      name: "Total Likes",
      value: stats?.blogs.totalLikes || 0,
      icon: HeartIcon,
      color: "text-red-500",
    },
    {
      name: "Page Views",
      value: stats?.analytics.totalPageViews || 0,
      icon: ArrowTrendingUpIcon,
      color: "text-green-500",
    },
    {
      name: "Unique Visitors",
      value: stats?.analytics.uniqueVisitors || 0,
      icon: UsersIcon,
      color: "text-purple-500",
    },
  ];

  const quickActions = [
    {
      label: "New Blog Post",
      href: "/admin/blog/new",
      icon: DocumentTextIcon,
    },
    {
      label: "New Project",
      href: "/admin/projects",
      icon: FolderIcon,
    },
    {
      label: "View Messages",
      href: "/admin/contact",
      icon: ChatBubbleLeftRightIcon,
    },
    {
      label: "View Analytics",
      href: "/admin/analytics",
      icon: ArrowTrendingUpIcon,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardContent>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Welcome to Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your portfolio content, view analytics, and handle user
            interactions.
          </p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Link key={card.name} href={card.href}>
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent>
                <div className="flex items-center">
                  <div className={`shrink-0 rounded-md p-3 ${card.color}`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <p className="truncate text-sm font-medium text-muted-foreground">
                      {card.name}
                    </p>
                    <p className="text-lg font-medium text-foreground">
                      {card.value}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {card.subtext}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Analytics Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {analyticsCards.map((card) => (
              <div key={card.name} className="text-center">
                <div className="flex justify-center">
                  <card.icon className={`h-8 w-8 ${card.color}`} />
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-semibold text-foreground">
                    {card.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{card.name}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivity.slice(0, 5).map((activity, index) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {index !== recentActivity.length - 1 && index !== 4 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary ring-8 ring-card">
                          <ClockIcon className="h-4 w-4 text-primary-foreground" />
                        </span>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-foreground">
                              {activity.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="py-4 text-center text-muted-foreground">
              No recent activity
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                render={<Link href={action.href} />}
              >
                <action.icon className="h-4 w-4" />
                {action.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
