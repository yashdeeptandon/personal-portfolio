"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { IProject } from "@/types";
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

interface ProjectsResponse {
  success: boolean;
  message: string;
  data: IProject[];
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
  planning: "warning",
  "in-progress": "info",
  completed: "success",
  archived: "neutral",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<IProject[]>([]);
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

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const response = await fetch(`/api/projects?${params}`);
      if (!response.ok) throw new Error("Failed to fetch projects");

      const data: ProjectsResponse = await response.json();
      setProjects(data.data || []);
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
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, statusFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete project");

      await fetchProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project");
    }
  };

  if (loading && projects.length === 0) {
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
            Projects
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your portfolio projects and showcase your work.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button render={<Link href="/admin/projects/new" />}>
            <PlusIcon className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="search" className="sr-only">
                Search projects
              </Label>
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  id="search"
                  className="pl-8"
                  placeholder="Search projects..."
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
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
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

      {/* Projects List */}
      <Card className="overflow-hidden py-0">
        <ul className="divide-y divide-border">
          {projects.length === 0 ? (
            <li className="px-6 py-12 text-center text-muted-foreground">
              {searchTerm || statusFilter !== "all"
                ? "No projects found matching your criteria."
                : "No projects yet. Create your first project!"}
            </li>
          ) : (
            projects.map((project) => (
              <li key={project._id} className="px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      {project.featuredImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={project.featuredImage}
                          alt={project.title}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-lg font-medium text-foreground">
                          {project.title}
                        </h3>
                        <p className="truncate text-sm text-muted-foreground">
                          {project.shortDescription}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                          <Badge variant={STATUS_BADGE[project.status] ?? "neutral"}>
                            {project.status.charAt(0).toUpperCase() +
                              project.status.slice(1).replace("-", " ")}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {project.technologies?.slice(0, 3).join(", ") ||
                              "No technologies"}
                            {(project.technologies?.length || 0) > 3 && "..."}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {project.liveUrl && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        render={
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        }
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon-sm"
                      render={<Link href={`/admin/projects/${project._id}/edit`} />}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon-sm"
                      onClick={() => handleDelete(project._id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </Card>

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
