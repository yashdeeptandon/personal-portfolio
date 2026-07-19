"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  company?: string;
  status: "new" | "read" | "replied" | "archived";
  priority: "low" | "medium" | "high";
  source: string;
  createdAt: string;
  updatedAt: string;
}

interface ContactListResponse {
  success: boolean;
  data: ContactMessage[];
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
  new: "info",
  read: "warning",
  replied: "success",
  archived: "neutral",
};

const PRIORITY_BADGE: Record<string, BadgeVariant> = {
  low: "success",
  medium: "warning",
};

export default function ContactManagement() {
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<
    ContactListResponse["pagination"] | null
  >(null);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(priorityFilter !== "all" && { priority: priorityFilter }),
      });

      const response = await fetch(`/api/contact?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch contacts");
      }

      const data: ContactListResponse = await response.json();
      setContacts(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      setError("Failed to load contact messages");
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleStatusChange = async (contactId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/contact/${contactId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update contact status");
      }

      // Update local state
      setContacts((prev) =>
        prev.map((contact) =>
          contact._id === contactId
            ? { ...contact, status: newStatus as ContactMessage["status"] }
            : contact
        )
      );

      if (selectedContact && selectedContact._id === contactId) {
        setSelectedContact((prev) =>
          prev
            ? { ...prev, status: newStatus as ContactMessage["status"] }
            : null
        );
      }
    } catch (error) {
      console.error("Error updating contact status:", error);
      alert("Failed to update contact status");
    }
  };

  const handlePriorityChange = async (
    contactId: string,
    newPriority: string
  ) => {
    try {
      const response = await fetch(`/api/contact/${contactId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priority: newPriority }),
      });

      if (!response.ok) {
        throw new Error("Failed to update contact priority");
      }

      // Update local state
      setContacts((prev) =>
        prev.map((contact) =>
          contact._id === contactId
            ? {
                ...contact,
                priority: newPriority as ContactMessage["priority"],
              }
            : contact
        )
      );

      if (selectedContact && selectedContact._id === contactId) {
        setSelectedContact((prev) =>
          prev
            ? { ...prev, priority: newPriority as ContactMessage["priority"] }
            : null
        );
      }
    } catch (error) {
      console.error("Error updating contact priority:", error);
      alert("Failed to update contact priority");
    }
  };

  const PriorityPill = ({ priority }: { priority: string }) =>
    priority === "high" ? (
      <span className="inline-flex items-center gap-1 rounded-md border border-destructive/20 bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
        High
      </span>
    ) : (
      <Badge variant={PRIORITY_BADGE[priority] ?? "neutral"}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );

  const handleContactClick = async (contact: ContactMessage) => {
    setSelectedContact(contact);

    // Mark as read if it's new
    if (contact.status === "new") {
      await handleStatusChange(contact._id, "read");
    }
  };

  if (loading && contacts.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Contact Messages
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage and respond to contact form submissions
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Status
              </label>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter((value as string) ?? "all")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Priority
              </label>
              <Select
                value={priorityFilter}
                onValueChange={(value) => setPriorityFilter((value as string) ?? "all")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setStatusFilter("all");
                  setPriorityFilter("all");
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
            onClick={fetchContacts}
            className="mt-2 text-destructive underline hover:text-destructive/80"
          >
            Try again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Contact List */}
        <Card>
          <CardContent>
            <h3 className="mb-4 text-lg font-medium text-foreground">
              Messages ({pagination?.total || 0})
            </h3>

            {contacts.length > 0 ? (
              <ul className="divide-y divide-border">
                {contacts.map((contact) => (
                  <li
                    key={contact._id}
                    onClick={() => handleContactClick(contact)}
                    className={cn(
                      "cursor-pointer rounded-md px-2 py-4 hover:bg-accent",
                      selectedContact?._id === contact._id && "bg-primary/10"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-foreground">
                          {contact.name}
                        </p>
                        <Badge variant={STATUS_BADGE[contact.status] ?? "neutral"}>
                          {contact.status.charAt(0).toUpperCase() +
                            contact.status.slice(1)}
                        </Badge>
                        <PriorityPill priority={contact.priority} />
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {contact.subject}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        {new Date(contact.createdAt).toLocaleDateString()} •{" "}
                        {contact.email}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-12 text-center">
                <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-foreground">
                  No messages
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  No contact messages match your current filters.
                </p>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Detail */}
        <Card>
          <CardContent>
            {selectedContact ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-foreground">
                    Message Details
                  </h3>
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">From</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedContact.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedContact.email}
                    </p>
                    {selectedContact.phone && (
                      <p className="text-sm text-muted-foreground">
                        {selectedContact.phone}
                      </p>
                    )}
                    {selectedContact.company && (
                      <p className="text-sm text-muted-foreground">
                        {selectedContact.company}
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-foreground">
                      Subject
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedContact.subject}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-foreground">
                      Message
                    </h4>
                    <div className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">
                      {selectedContact.message}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-foreground">
                        Status
                      </h4>
                      <Select
                        value={selectedContact.status}
                        onValueChange={(value) =>
                          handleStatusChange(
                            selectedContact._id,
                            (value as string) ?? selectedContact.status
                          )
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="read">Read</SelectItem>
                          <SelectItem value="replied">Replied</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-foreground">
                        Priority
                      </h4>
                      <Select
                        value={selectedContact.priority}
                        onValueChange={(value) =>
                          handlePriorityChange(
                            selectedContact._id,
                            (value as string) ?? selectedContact.priority
                          )
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <p>
                      Received:{" "}
                      {new Date(selectedContact.createdAt).toLocaleString()}
                    </p>
                    <p>Source: {selectedContact.source}</p>
                  </div>

                  <div className="border-t border-border pt-4">
                    <Button
                      render={
                        <a
                          href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                        />
                      }
                    >
                      Reply via Email
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-12 text-center">
                <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-foreground">
                  Select a message
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose a contact message from the list to view details.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
