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
    // You could add a toast notification here
  };

  const getFileIcon = (file: MediaFile) => {
    if (file.pathname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return <PhotoIcon className="h-6 w-6 text-blue-500" />;
    }
    return <DocumentIcon className="h-6 w-6 text-gray-500" />;
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="mt-2 text-sm text-gray-700">
            Upload, organize, and manage your media files.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {selectedFiles.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <TrashIcon className="-ml-1 mr-2 h-5 w-5" />
              Delete Selected ({selectedFiles.size})
            </button>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <CloudArrowUpIcon className="-ml-1 mr-2 h-5 w-5" />
            {uploading ? "Uploading..." : "Upload Files"}
          </button>
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
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        onDrop={(e) => {
          e.preventDefault();
          const files = e.dataTransfer.files;
          if (files) {
            // Show immediate feedback for drag and drop
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
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-2">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-blue-600 hover:text-blue-500">
              Click to upload
            </span>{" "}
            or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPG, GIF, PDF, DOC up to 10MB each
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Files are validated before upload to save time
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.name} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {getDisplayFiles().map((file) => (
          <div
            key={file.url}
            className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden"
          >
            {/* File Preview */}
            <div className="aspect-w-16 aspect-h-9 bg-gray-100">
              {file.pathname.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img
                  src={file.url}
                  alt={file.name || "Image"}
                  className="w-full h-32 object-cover"
                />
              ) : (
                <div className="w-full h-32 flex items-center justify-center">
                  {getFileIcon(file)}
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {file.name || file.pathname.split("/").pop()}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
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
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              {/* Actions */}
              <div className="mt-3 flex items-center space-x-2">
                <button
                  onClick={() => copyToClipboard(file.url)}
                  className="flex-1 inline-flex items-center justify-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ClipboardDocumentIcon className="h-3 w-3 mr-1" />
                  Copy URL
                </button>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center p-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <EyeIcon className="h-3 w-3" />
                </a>
                <button
                  onClick={() => handleDelete(file.url)}
                  className="inline-flex items-center p-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <TrashIcon className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {getDisplayFiles().length === 0 && (
        <div className="text-center py-12">
          <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No files</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by uploading your first file.
          </p>
        </div>
      )}
    </div>
  );
}
