import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/db/connection";
import Contact from "@/models/Contact";
import { authOptions } from "@/lib/auth/config";
import { contactUpdateSchema } from "@/lib/validation/schemas";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
  validationErrorResponse,
  noContentResponse,
  withErrorHandling,
} from "@/lib/utils/response";
import { API_MESSAGES } from "@/lib/utils/constants";
import { withAdminAuth } from "@/middleware/adminAuth";
import { logDatabaseOperation, logAuthEvent } from "@/lib/utils/logger";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/contact/[id] - Get single contact message (admin only)
export const GET = withAdminAuth(
  withErrorHandling(
    async (request: NextRequest | Request, { params }: RouteParams) => {
      await dbConnect();

      const { id } = await params;

      try {
        const startTime = Date.now();
        const contact = await Contact.findById(id);

        if (!contact) {
          return notFoundResponse("Contact message not found");
        }

        logDatabaseOperation(
          "find_contact_by_id",
          "contacts",
          Date.now() - startTime,
          {
            contactId: id,
            status: contact.status,
          }
        );

        return successResponse(
          "Contact message retrieved successfully",
          contact
        );
      } catch (error) {
        console.error("Error fetching contact:", error);
        throw error;
      }
    }
  )
);

// PUT /api/contact/[id] - Update contact message (admin only)
export const PUT = withAdminAuth(
  withErrorHandling(
    async (request: NextRequest | Request, { params }: RouteParams) => {
      await dbConnect();

      const { id } = await params;
      const session = await getServerSession(authOptions);

      try {
        const body = await request.json();

        // Validate request body
        const { error, value } = contactUpdateSchema.validate(body);
        if (error) {
          return validationErrorResponse(
            "Validation error",
            error.details[0].message
          );
        }

        const startTime = Date.now();
        const contact = await Contact.findByIdAndUpdate(
          id,
          { ...value, updatedAt: new Date() },
          { new: true, runValidators: true }
        );

        if (!contact) {
          return notFoundResponse("Contact message not found");
        }

        logDatabaseOperation(
          "update_contact",
          "contacts",
          Date.now() - startTime,
          {
            contactId: id,
            updatedFields: Object.keys(value),
            newStatus: contact.status,
            adminId: session?.user?.id,
          }
        );

        logAuthEvent(
          "contact_updated",
          session?.user?.id,
          session?.user?.email,
          {
            contactId: id,
            contactEmail: contact.email,
            updatedFields: Object.keys(value),
            newStatus: contact.status,
          }
        );

        return successResponse("Contact message updated successfully", contact);
      } catch (error) {
        console.error("Error updating contact:", error);
        throw error;
      }
    }
  )
);

// DELETE /api/contact/[id] - Delete contact message (admin only)
export const DELETE = withAdminAuth(
  withErrorHandling(
    async (request: NextRequest | Request, { params }: RouteParams) => {
      await dbConnect();

      const { id } = await params;
      const session = await getServerSession(authOptions);

      try {
        const startTime = Date.now();
        const contact = await Contact.findByIdAndDelete(id);

        if (!contact) {
          return notFoundResponse("Contact message not found");
        }

        logDatabaseOperation(
          "delete_contact",
          "contacts",
          Date.now() - startTime,
          {
            contactId: id,
            contactEmail: contact.email,
            adminId: session?.user?.id,
          }
        );

        logAuthEvent(
          "contact_deleted",
          session?.user?.id,
          session?.user?.email,
          {
            contactId: id,
            contactEmail: contact.email,
            contactName: contact.name,
          }
        );

        return noContentResponse();
      } catch (error) {
        console.error("Error deleting contact:", error);
        throw error;
      }
    }
  )
);
