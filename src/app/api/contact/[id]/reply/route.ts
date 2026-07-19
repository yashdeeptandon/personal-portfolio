import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/db/connection";
import Contact from "@/models/Contact";
import { authOptions } from "@/lib/auth/config";
import { contactReplySchema } from "@/lib/validation/schemas";
import { sendContactReply } from "@/services/email/service";
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  errorResponse,
  withErrorHandling,
} from "@/lib/utils/response";
import { withAdminAuth } from "@/middleware/adminAuth";
import { logDatabaseOperation, logAuthEvent } from "@/lib/utils/logger";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/contact/[id]/reply - Send an email reply to a contact message (admin only)
export const POST = withAdminAuth(
  withErrorHandling(
    async (request: NextRequest | Request, { params }: RouteParams) => {
      await dbConnect();

      const { id } = await params;
      const session = await getServerSession(authOptions);

      const body = await request.json();

      const { error, value } = contactReplySchema.validate(body);
      if (error) {
        return validationErrorResponse(
          "Validation error",
          error.details[0].message
        );
      }

      const contact = await Contact.findById(id);
      if (!contact) {
        return notFoundResponse("Contact message not found");
      }

      const emailResult = await sendContactReply({
        to: contact.email,
        name: contact.name,
        originalSubject: contact.subject,
        originalMessage: contact.message,
        replyMessage: value.message,
      });

      if (!emailResult.success) {
        return errorResponse(
          emailResult.error || "Failed to send reply email",
          502
        );
      }

      const startTime = Date.now();
      contact.replies.push({
        message: value.message,
        sentAt: new Date(),
        sentBy: session?.user?.email || undefined,
      });
      contact.status = "replied";
      await contact.save();

      logDatabaseOperation(
        "reply_to_contact",
        "contacts",
        Date.now() - startTime,
        {
          contactId: id,
          adminId: session?.user?.id,
        }
      );

      logAuthEvent(
        "contact_replied",
        session?.user?.id,
        session?.user?.email,
        {
          contactId: id,
          contactEmail: contact.email,
        }
      );

      return successResponse("Reply sent successfully", contact);
    }
  )
);
