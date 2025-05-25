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

      // Refresh the blog list
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

      // Refresh the blog list
      await fetchBlogs();
    } catch (error) {
      console.error("Error updating blog status:", error);
      alert("Failed to update blog status");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      published: "bg-green-100 text-green-800",
      draft: "bg-yellow-100 text-yellow-800",
      archived: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          statusStyles[status as keyof typeof statusStyles] ||
          "bg-gray-100 text-gray-800"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading && blogs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create, edit, and manage your blog posts
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Blog Post
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700"
            >
              Search
            </label>
            <div className="mt-1 relative">
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search blog posts..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700"
            >
              Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchBlogs}
            className="mt-2 text-red-600 hover:text-red-500 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Blog List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {blogs.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {blogs.map((blog) => (
              <li key={blog._id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {blog.title}
                        </h3>
                        {getStatusBadge(blog.status)}
                      </div>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {blog.excerpt}
                      </p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          {blog.views} views
                        </div>
                        <div className="flex items-center">
                          <HeartIcon className="h-4 w-4 mr-1" />
                          {blog.likes} likes
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {blog.readTime} min read
                        </div>
                        <span>
                          {blog.publishedAt
                            ? `Published ${new Date(
                                blog.publishedAt
                              ).toLocaleDateString()}`
                            : `Created ${new Date(
                                blog.createdAt
                              ).toLocaleDateString()}`}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {blog.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={blog.status}
                        onChange={(e) =>
                          handleStatusChange(blog._id, e.target.value)
                        }
                        className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                      <Link
                        href={`/admin/blog/${blog._id}`}
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(blog._id, blog.title)}
                        disabled={deleteLoading === blog._id}
                        className="inline-flex items-center p-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        {deleteLoading === blog._id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full" />
                        ) : (
                          <TrashIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No blog posts
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new blog post.
            </p>
            <div className="mt-6">
              <Link
                href="/admin/blog/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Blog Post
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * pagination.limit + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * pagination.limit, pagination.total)}
                </span>{" "}
                of <span className="font-medium">{pagination.total}</span>{" "}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
