"use client";

import { useState, useEffect, useCallback } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { ITestimonial } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";

interface TestimonialsResponse {
  success: boolean;
  message: string;
  data: ITestimonial[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
}

const STATUS_BADGE: Record<string, BadgeVariant> = {
  pending: "warning",
  approved: "success",
  rejected: "neutral",
};

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<ITestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const response = await fetch(`/api/testimonials?${params}`);
      if (!response.ok) throw new Error("Failed to fetch testimonials");

      const data: TestimonialsResponse = await response.json();
      setTestimonials(data.data || []);
      setPagination({
        page: data.pagination?.page || 1,
        limit: data.pagination?.limit || 10,
        total: data.pagination?.total || 0,
        pages: data.pagination?.totalPages || 0,
        hasNext: data.pagination?.hasNextPage || false,
        hasPrev: data.pagination?.hasPrevPage || false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete testimonial");

      await fetchTestimonials();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete testimonial"
      );
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update testimonial status");

      await fetchTestimonials();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update testimonial"
      );
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-current text-amber-400"
                : "text-muted-foreground/40"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading && testimonials.length === 0) {
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
            Testimonials
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage client testimonials and reviews for your portfolio.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            onClick={() => alert("Add testimonial form would open here")}
          >
            <PlusIcon className="h-4 w-4" />
            Add Testimonial
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="search" className="sr-only">
                Search testimonials
              </Label>
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  id="search"
                  className="pl-8"
                  placeholder="Search testimonials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="sr-only">
                Filter by status
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {testimonials.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            {searchTerm || statusFilter !== "all"
              ? "No testimonials found matching your criteria."
              : "No testimonials yet. Add your first testimonial!"}
          </div>
        ) : (
          testimonials.map((testimonial) => (
            <Card key={testimonial._id}>
              <CardContent className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {testimonial.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        className="h-12 w-12 rounded-full object-cover"
                        src={testimonial.avatar}
                        alt={testimonial.name}
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <span className="text-lg font-medium text-foreground">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-medium text-foreground">
                        {testimonial.name}
                      </h3>
                      {testimonial.position && testimonial.company && (
                        <p className="text-sm text-muted-foreground">
                          {testimonial.position} at {testimonial.company}
                        </p>
                      )}
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>
                  <Badge variant={STATUS_BADGE[testimonial.status] ?? "neutral"}>
                    {testimonial.status.charAt(0).toUpperCase() +
                      testimonial.status.slice(1)}
                  </Badge>
                </div>

                {/* Content */}
                <p className="text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div className="text-xs text-muted-foreground">
                    {new Date(testimonial.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    {testimonial.status === "pending" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:bg-green-500/10 hover:text-green-600 dark:text-green-400"
                          onClick={() =>
                            handleStatusUpdate(testimonial._id, "approved")
                          }
                        >
                          <CheckIcon className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() =>
                            handleStatusUpdate(testimonial._id, "rejected")
                          }
                        >
                          <XMarkIcon className="h-4 w-4" />
                          Reject
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => alert("Edit testimonial form would open here")}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDelete(testimonial._id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
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
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrev}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNext}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
