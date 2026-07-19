"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  HeartIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: "draft" | "published" | "archived";
  author: string;
  views: number;
  likes: number;
  readTime: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  category: string;
}

interface BlogListResponse {
  success: boolean;
  data: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const STATUS_BADGE: Record<string, BadgeVariant> = {
  published: "success",
  draft: "warning",
  archived: "neutral",
};

export default function BlogManagement() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<
    BlogListResponse["pagination"] | null
  >(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/blog?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch blogs");
      }

      const data: BlogListResponse = await response.json();
      setBlogs(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setError("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleDelete = async (blogId: string, title: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeleteLoading(blogId);
      const response = await fetch(`/api/blog/${blogId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete blog post");
      }

      await fetchBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
      alert("Failed to delete blog post");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleStatusChange = async (blogId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/blog/${blogId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update blog status");
      }

      await fetchBlogs();
    } catch (error) {
      console.error("Error updating blog status:", error);
      alert("Failed to update blog status");
    }
  };

  if (loading && blogs.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Blog Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, edit, and manage your blog posts
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button render={<Link href="/admin/blog/new" />}>
            <PlusIcon className="h-4 w-4" />
            New Blog Post
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium text-foreground">
                Search
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search blog posts..."
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium text-foreground">
                Status
              </label>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter((value as string) ?? "all")}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setCurrentPage(1);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4">
          <p className="text-destructive">{error}</p>
          <button
            onClick={fetchBlogs}
            className="mt-2 text-destructive underline hover:text-destructive/80"
          >
            Try again
          </button>
        </div>
      )}

      {/* Blog List */}
      <Card className="overflow-hidden py-0">
        {blogs.length > 0 ? (
          <ul className="divide-y divide-border">
            {blogs.map((blog) => (
              <li key={blog._id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="truncate text-lg font-medium text-foreground">
                        {blog.title}
                      </h3>
                      <Badge variant={STATUS_BADGE[blog.status] ?? "neutral"}>
                        {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {blog.excerpt}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <EyeIcon className="h-4 w-4" />
                        {blog.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <HeartIcon className="h-4 w-4" />
                        {blog.likes} likes
                      </span>
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        {blog.readTime} min read
                      </span>
                      <span>
                        {blog.publishedAt
                          ? `Published ${new Date(blog.publishedAt).toLocaleDateString()}`
                          : `Created ${new Date(blog.createdAt).toLocaleDateString()}`}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {blog.tags.map((tag) => (
                        <Badge key={tag} variant="info">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={blog.status}
                      onValueChange={(value) =>
                        handleStatusChange(blog._id, value as string)
                      }
                    >
                      <SelectTrigger size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      render={<Link href={`/admin/blog/${blog._id}`} />}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon-sm"
                      onClick={() => handleDelete(blog._id, blog.title)}
                      disabled={deleteLoading === blog._id}
                    >
                      {deleteLoading === blog._id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                      ) : (
                        <TrashIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-12 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-foreground">
              No blog posts
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by creating a new blog post.
            </p>
            <div className="mt-6">
              <Button render={<Link href="/admin/blog/new" />}>
                <PlusIcon className="h-4 w-4" />
                New Blog Post
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {(currentPage - 1) * pagination.limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-foreground">
              {Math.min(currentPage * pagination.limit, pagination.total)}
            </span>{" "}
            of <span className="font-medium text-foreground">{pagination.total}</span> results
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
