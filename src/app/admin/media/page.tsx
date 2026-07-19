"use client";

import { useState, useEffect, useRef } from "react";
import {
  CloudArrowUpIcon,
  TrashIcon,
  DocumentIcon,
  PhotoIcon,
  EyeIcon,
  ClipboardDocumentIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import { validateFiles, formatFileSize } from "@/lib/utils/fileValidation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MediaFile {
  url: string;
  pathname: string;
  size: number;
  type?: string;
  name?: string;
  folder?: string;
  description?: string;
  uploadedAt?: string;
}

interface MediaResponse {
  files: {
    images: MediaFile[];
    documents: MediaFile[];
    others: MediaFile[];
  };
  allFiles: MediaFile[];
  pagination: {
    cursor: string | null;
    hasMore: boolean;
    limit: number;
  };
  stats: {
    total: number;
    images: number;
    documents: number;
    others: number;
  };
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<
    "all" | "images" | "documents" | "others"
  >("all");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/media");
      if (!response.ok) throw new Error("Failed to fetch media");

      const data = await response.json();
      setMedia(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;

    // Client-side validation using utility function
    const validation = validateFiles(files, {
      maxFiles: 10, // Allow up to 10 files at once
      allowMultiple: true,
    });

    if (validation.errors.length > 0) {
      setError(`Validation failed:\n${validation.errors.join("\n")}`);
      return;
    }

    if (validation.valid.length === 0) {
      setError("No valid files to upload");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadPromises = validation.valid.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "uploads");

        const response = await fetch("/api/media", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `${file.name}: ${errorData.message || "Failed to upload"}`
          );
        }

        return response.json();
      });

      await Promise.all(uploadPromises);
      await fetchMedia();

      // Show success message with upload summary
      if (validation.valid.length > 1) {
        console.log(
          `Successfully uploaded ${
            validation.valid.length
          } files (${formatFileSize(validation.totalSize)} total)`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload files");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (url: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      const response = await fetch(
        `/api/media?url=${encodeURIComponent(url)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete file");

      await fetchMedia();
      setSelectedFiles(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete file");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return;
    if (
      !confirm(`Are you sure you want to delete ${selectedFiles.size} files?`)
    )
      return;

    try {
      await Promise.all(
        Array.from(selectedFiles).map(async (url) => {
          const response = await fetch(
            `/api/media?url=${encodeURIComponent(url)}`,
            {
              method: "DELETE",
            }
          );
          if (!response.ok) throw new Error(`Failed to delete ${url}`);
        })
      );

      await fetchMedia();
      setSelectedFiles(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete files");
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const getFileIcon = (file: MediaFile) => {
    if (file.pathname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return <PhotoIcon className="h-6 w-6 text-blue-500" />;
    }
    return <DocumentIcon className="h-6 w-6 text-muted-foreground" />;
  };

  const getDisplayFiles = () => {
    if (!media) return [];

    switch (selectedTab) {
      case "images":
        return media.files.images;
      case "documents":
        return media.files.documents;
      case "others":
        return media.files.others;
      default:
        return media.allFiles;
    }
  };

  const tabs = [
    { id: "all", name: "All Files", count: media?.stats.total || 0 },
    { id: "images", name: "Images", count: media?.stats.images || 0 },
    { id: "documents", name: "Documents", count: media?.stats.documents || 0 },
    { id: "others", name: "Others", count: media?.stats.others || 0 },
  ];

  if (loading) {
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
            Media Library
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload, organize, and manage your media files.
          </p>
        </div>
        <div className="mt-4 flex gap-3 sm:mt-0">
          {selectedFiles.size > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              <TrashIcon className="h-4 w-4" />
              Delete Selected ({selectedFiles.size})
            </Button>
          )}
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <CloudArrowUpIcon className="h-4 w-4" />
            {uploading ? "Uploading..." : "Upload Files"}
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx"
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        className="hidden"
      />

      {/* Error Message */}
      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4">
          <p className="text-sm whitespace-pre-line text-destructive">{error}</p>
        </div>
      )}

      {/* Upload Area */}
      <div
        className="cursor-pointer rounded-lg border-2 border-dashed border-border p-6 text-center transition-colors hover:border-muted-foreground"
        onClick={() => fileInputRef.current?.click()}
        onDrop={(e) => {
          e.preventDefault();
          const files = e.dataTransfer.files;
          if (files) {
            const validation = validateFiles(files, {
              maxFiles: 10,
              allowMultiple: true,
            });
            if (validation.errors.length > 0) {
              setError(`Validation failed:\n${validation.errors.join("\n")}`);
              return;
            }
            handleFileUpload(files);
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={(e) => e.preventDefault()}
      >
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-muted-foreground" />
        <div className="mt-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-primary hover:text-primary/80">
              Click to upload
            </span>{" "}
            or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, GIF, PDF, DOC up to 10MB each
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Files are validated before upload to save time
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={selectedTab}
        onValueChange={(value) =>
          setSelectedTab(value as typeof selectedTab)
        }
      >
        <TabsList variant="line">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.name} ({tab.count})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Files Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {getDisplayFiles().map((file) => (
          <Card key={file.url} className="overflow-hidden py-0">
            {/* File Preview */}
            <div className="bg-muted">
              {file.pathname.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={file.url}
                  alt={file.name || "Image"}
                  className="h-32 w-full object-cover"
                />
              ) : (
                <div className="flex h-32 w-full items-center justify-center">
                  {getFileIcon(file)}
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-medium text-foreground">
                    {file.name || file.pathname.split("/").pop()}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={selectedFiles.has(file.url)}
                  onChange={(e) => {
                    const newSelected = new Set(selectedFiles);
                    if (e.target.checked) {
                      newSelected.add(file.url);
                    } else {
                      newSelected.delete(file.url);
                    }
                    setSelectedFiles(newSelected);
                  }}
                  className="h-4 w-4 shrink-0 rounded border-input text-primary accent-primary focus:ring-ring"
                />
              </div>

              {/* Actions */}
              <div className="mt-3 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => copyToClipboard(file.url)}
                >
                  <ClipboardDocumentIcon className="h-3 w-3" />
                  Copy URL
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  render={
                    <a href={file.url} target="_blank" rel="noopener noreferrer" />
                  }
                >
                  <EyeIcon className="h-3 w-3" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon-sm"
                  onClick={() => handleDelete(file.url)}
                >
                  <TrashIcon className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {getDisplayFiles().length === 0 && (
        <div className="py-12 text-center">
          <FolderIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-foreground">No files</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started by uploading your first file.
          </p>
        </div>
      )}
    </div>
  );
}
