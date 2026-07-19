"use client";

import { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  TrashIcon,
  EnvelopeIcon,
  UserGroupIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Newsletter {
  _id: string;
  email: string;
  name?: string;
  status: "active" | "unsubscribed" | "bounced";
  source: "website" | "blog" | "social" | "referral";
  preferences: {
    blogUpdates: boolean;
    projectUpdates: boolean;
    newsletter: boolean;
  };
  subscribedAt: string;
  unsubscribedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const STATUS_BADGE: Record<string, BadgeVariant> = {
  active: "success",
  unsubscribed: "neutral",
  bounced: "warning",
};

const SOURCE_BADGE: Record<string, BadgeVariant> = {
  website: "info",
  blog: "info",
  social: "info",
  referral: "info",
};

const NewsletterManagement = () => {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const fetchNewsletters = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(sourceFilter !== "all" && { source: sourceFilter }),
      });

      const response = await fetch(`/api/newsletter?${params}`);
      const data = await response.json();

      if (response.ok) {
        setNewsletters(data.data);
        setPagination(data.pagination);
      } else {
        setError(data.message || "Failed to fetch newsletter subscribers");
      }
    } catch (error) {
      console.error("Error fetching newsletters:", error);
      setError("Failed to fetch newsletter subscribers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsletters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, sourceFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscriber?")) {
      return;
    }

    try {
      const response = await fetch(`/api/newsletter/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchNewsletters(pagination.page);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to delete subscriber");
      }
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      setError("Failed to delete subscriber");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const stats = {
    total: newsletters.length,
    active: newsletters.filter((n) => n.status === "active").length,
    unsubscribed: newsletters.filter((n) => n.status === "unsubscribed").length,
    bounced: newsletters.filter((n) => n.status === "bounced").length,
  };

  const statCards = [
    { label: "Total Subscribers", value: pagination.total, icon: UserGroupIcon, color: "text-muted-foreground" },
    { label: "Active", value: stats.active, icon: ChartBarIcon, color: "text-green-500" },
    { label: "Unsubscribed", value: stats.unsubscribed, icon: EnvelopeIcon, color: "text-muted-foreground" },
    { label: "Bounced", value: stats.bounced, icon: ChartBarIcon, color: "text-red-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Newsletter Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage newsletter subscribers and send updates
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardContent>
              <div className="flex items-center">
                <card.icon className={`h-6 w-6 shrink-0 ${card.color}`} />
                <div className="ml-5 w-0 flex-1">
                  <p className="truncate text-sm font-medium text-muted-foreground">
                    {card.label}
                  </p>
                  <p className="text-lg font-medium text-foreground">
                    {card.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="search" className="sr-only">
                Search
              </Label>
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  id="search"
                  className="pl-8"
                  placeholder="Search subscribers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="sr-only">
                Status
              </Label>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter((value as string) ?? "all")}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                  <SelectItem value="bounced">Bounced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source" className="sr-only">
                Source
              </Label>
              <Select
                value={sourceFilter}
                onValueChange={(value) => setSourceFilter((value as string) ?? "all")}
              >
                <SelectTrigger id="source" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="blog">Blog</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {/* Newsletter List */}
      <Card className="overflow-hidden py-0">
        <CardHeader className="border-b border-border py-5">
          <CardTitle>Newsletter Subscribers</CardTitle>
          <CardDescription>Manage your newsletter subscriber list</CardDescription>
        </CardHeader>

        {loading ? (
          <div className="p-6 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
            <p className="mt-2 text-sm text-muted-foreground">
              Loading subscribers...
            </p>
          </div>
        ) : newsletters.length === 0 ? (
          <div className="p-6 text-center">
            <EnvelopeIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-foreground">
              No subscribers found
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              No newsletter subscribers match your current filters.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {newsletters.map((newsletter) => (
              <li key={newsletter._id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {newsletter.name || newsletter.email}
                        </p>
                        {newsletter.name && (
                          <p className="truncate text-sm text-muted-foreground">
                            {newsletter.email}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Badge variant={STATUS_BADGE[newsletter.status] ?? "neutral"}>
                          {newsletter.status}
                        </Badge>
                        <Badge variant={SOURCE_BADGE[newsletter.source] ?? "neutral"}>
                          {newsletter.source}
                        </Badge>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Subscribed: {formatDate(newsletter.subscribedAt)}
                      {newsletter.unsubscribedAt && (
                        <span className="ml-2">
                          • Unsubscribed: {formatDate(newsletter.unsubscribedAt)}
                        </span>
                      )}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        Blog: {newsletter.preferences.blogUpdates ? "✓" : "✗"}
                      </span>
                      <span>
                        Projects: {newsletter.preferences.projectUpdates ? "✓" : "✗"}
                      </span>
                      <span>
                        Newsletter: {newsletter.preferences.newsletter ? "✓" : "✗"}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon-sm"
                    onClick={() => handleDelete(newsletter._id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 sm:px-6">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-foreground">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {pagination.total}
              </span>{" "}
              results
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNewsletters(pagination.page - 1)}
                disabled={!pagination.hasPrev}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNewsletters(pagination.page + 1)}
                disabled={!pagination.hasNext}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default NewsletterManagement;
