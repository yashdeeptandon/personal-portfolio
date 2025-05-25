import { NextRequest } from "next/server";
import { put, del, list } from "@vercel/blob";
import { withAdminAuth } from "@/middleware/adminAuth";
import {
  successResponse,
  errorResponse,
  badRequestResponse,
  withErrorHandling,
} from "@/lib/utils/response";
import { API_MESSAGES, FILE_UPLOAD } from "@/lib/utils/constants";
import { logAuthEvent } from "@/lib/utils/logger";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

// GET /api/media - List all uploaded media files
export const GET = withAdminAuth(
  withErrorHandling(async (request: NextRequest | Request) => {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "20");
    const prefix = searchParams.get("prefix") || "";

    try {
      const { blobs, cursor: nextCursor } = await list({
        cursor: cursor || undefined,
        limit,
        prefix,
      });

      // Organize files by type
      const organizedFiles = {
        images: blobs.filter((blob) =>
          FILE_UPLOAD.ALLOWED_IMAGE_TYPES.some((type) =>
            blob.pathname.toLowerCase().includes(type.split("/")[1])
          )
        ),
        documents: blobs.filter((blob) =>
          FILE_UPLOAD.ALLOWED_DOCUMENT_TYPES.some(
            (type) =>
              blob.pathname.toLowerCase().includes(type.split("/")[1]) ||
              blob.pathname.toLowerCase().endsWith(".pdf") ||
              blob.pathname.toLowerCase().endsWith(".doc") ||
              blob.pathname.toLowerCase().endsWith(".docx")
          )
        ),
        others: blobs.filter(
          (blob) =>
            !FILE_UPLOAD.ALLOWED_IMAGE_TYPES.some((type) =>
              blob.pathname.toLowerCase().includes(type.split("/")[1])
            ) &&
            !FILE_UPLOAD.ALLOWED_DOCUMENT_TYPES.some(
              (type) =>
                blob.pathname.toLowerCase().includes(type.split("/")[1]) ||
                blob.pathname.toLowerCase().endsWith(".pdf") ||
                blob.pathname.toLowerCase().endsWith(".doc") ||
                blob.pathname.toLowerCase().endsWith(".docx")
            )
        ),
      };

      return successResponse("Media files retrieved successfully", {
        files: organizedFiles,
        allFiles: blobs,
        pagination: {
          cursor: nextCursor,
          hasMore: !!nextCursor,
          limit,
        },
        stats: {
          total: blobs.length,
          images: organizedFiles.images.length,
          documents: organizedFiles.documents.length,
          others: organizedFiles.others.length,
        },
      });
    } catch (error) {
      throw error;
    }
  })
);

// POST /api/media - Upload new media file
export const POST = withAdminAuth(
  withErrorHandling(async (request: NextRequest | Request) => {
    const session = await getServerSession(authOptions);

    try {
      const formData = await request.formData();
      const file = formData.get("file") as File;
      const folder = (formData.get("folder") as string) || "uploads";
      const description = (formData.get("description") as string) || "";

      if (!file) {
        return badRequestResponse("No file provided");
      }

      // Validate file size
      if (file.size > FILE_UPLOAD.MAX_SIZE) {
        return badRequestResponse(API_MESSAGES.FILE_TOO_LARGE);
      }

      // Validate file type
      const allowedTypes = [
        ...FILE_UPLOAD.ALLOWED_IMAGE_TYPES,
        ...FILE_UPLOAD.ALLOWED_DOCUMENT_TYPES,
      ];

      if (!allowedTypes.includes(file.type as any)) {
        return badRequestResponse(API_MESSAGES.FILE_TYPE_NOT_SUPPORTED);
      }

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filename = `${folder}/${timestamp}_${sanitizedName}`;

      // Upload to Vercel Blob
      const blob = await put(filename, file, {
        access: "public",
        addRandomSuffix: false,
      });

      logAuthEvent(
        "admin_access",
        session?.user?.id || "unknown",
        session?.user?.email,
        {
          action: "upload_media",
          resource: "media",
          resourceId: blob.url,
          filename: file.name,
          size: file.size,
          type: file.type,
          folder,
          description,
        }
      );

      return successResponse(
        API_MESSAGES.FILE_UPLOADED,
        {
          file: {
            url: blob.url,
            pathname: blob.pathname,
            size: file.size,
            type: file.type,
            name: file.name,
            folder,
            description,
            uploadedAt: new Date().toISOString(),
          },
        },
        201
      );
    } catch (error) {
      console.error("File upload error:", error);
      return errorResponse(API_MESSAGES.FILE_UPLOAD_ERROR);
    }
  })
);

// DELETE /api/media - Delete media file
export const DELETE = withAdminAuth(
  withErrorHandling(async (request: NextRequest | Request) => {
    const nextRequest = request as NextRequest;
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(nextRequest.url);
    const url = searchParams.get("url");

    if (!url) {
      return badRequestResponse("File URL is required");
    }

    try {
      await del(url);

      logAuthEvent(
        "admin_access",
        session?.user?.id || "unknown",
        session?.user?.email,
        {
          action: "delete_media",
          resource: "media",
          resourceId: url,
          deletedUrl: url,
        }
      );

      return successResponse("File deleted successfully", null);
    } catch (error) {
      console.error("File deletion error:", error);
      return errorResponse("Failed to delete file");
    }
  })
);
