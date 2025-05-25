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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-2 text-red-600 hover:text-red-500 underline"
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
      color: "bg-yellow-500",
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
      color: "text-blue-600",
    },
    {
      name: "Total Likes",
      value: stats?.blogs.totalLikes || 0,
      icon: HeartIcon,
      color: "text-red-600",
    },
    {
      name: "Page Views",
      value: stats?.analytics.totalPageViews || 0,
      icon: ArrowTrendingUpIcon,
      color: "text-green-600",
    },
    {
      name: "Unique Visitors",
      value: stats?.analytics.uniqueVisitors || 0,
      icon: UsersIcon,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome to Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your portfolio content, view analytics, and handle user interactions.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Link key={card.name} href={card.href}>
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${card.color} rounded-md p-3`}>
                      <card.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {card.name}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">{card.value}</dd>
                      <dd className="text-sm text-gray-500">{card.subtext}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Analytics Cards */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Analytics Overview
          </h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {analyticsCards.map((card) => (
              <div key={card.name} className="text-center">
                <div className="flex justify-center">
                  <card.icon className={`h-8 w-8 ${card.color}`} />
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                  <p className="text-sm text-gray-500">{card.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>
          {recentActivity.length > 0 ? (
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivity.slice(0, 5).map((activity, index) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {index !== recentActivity.length - 1 && index !== 4 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                            <ClockIcon className="h-4 w-4 text-white" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-900">
                              {activity.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {activity.description}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
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
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/admin/blog/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              New Blog Post
            </Link>
            <Link
              href="/admin/projects/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FolderIcon className="h-4 w-4 mr-2" />
              New Project
            </Link>
            <Link
              href="/admin/contact"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
              View Messages
            </Link>
            <Link
              href="/admin/analytics"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <ArrowTrendingUpIcon className="h-4 w-4 mr-2" />
              View Analytics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
