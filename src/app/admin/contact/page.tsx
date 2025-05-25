"use client";

import { useEffect, useState, useCallback } from "react";

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

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      new: "bg-blue-100 text-blue-800",
      read: "bg-yellow-100 text-yellow-800",
      replied: "bg-green-100 text-green-800",
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

  const getPriorityBadge = (priority: string) => {
    const priorityStyles = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          priorityStyles[priority as keyof typeof priorityStyles] ||
          "bg-gray-100 text-gray-800"
        }`}
      >
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const handleContactClick = async (contact: ContactMessage) => {
    setSelectedContact(contact);

    // Mark as read if it's new
    if (contact.status === "new") {
      await handleStatusChange(contact._id, "read");
    }
  };

  if (loading && contacts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and respond to contact form submissions
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700"
            >
              Priority
            </label>
            <select
              id="priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setStatusFilter("all");
                setPriorityFilter("all");
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
            onClick={fetchContacts}
            className="mt-2 text-red-600 hover:text-red-500 underline"
          >
            Try again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Messages ({pagination?.total || 0})
            </h3>

            {contacts.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <li
                    key={contact._id}
                    onClick={() => handleContactClick(contact)}
                    className={`py-4 cursor-pointer hover:bg-gray-50 ${
                      selectedContact?._id === contact._id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {contact.name}
                          </p>
                          {getStatusBadge(contact.status)}
                          {getPriorityBadge(contact.priority)}
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {contact.subject}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(contact.createdAt).toLocaleDateString()} •{" "}
                          {contact.email}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.476L3 21l2.476-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No messages
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  No contact messages match your current filters.
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Contact Detail */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {selectedContact ? (
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Message Details
                </h3>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">From</h4>
                  <p className="mt-1 text-sm text-gray-600">
                    {selectedContact.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedContact.email}
                  </p>
                  {selectedContact.phone && (
                    <p className="text-sm text-gray-500">
                      {selectedContact.phone}
                    </p>
                  )}
                  {selectedContact.company && (
                    <p className="text-sm text-gray-500">
                      {selectedContact.company}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900">Subject</h4>
                  <p className="mt-1 text-sm text-gray-600">
                    {selectedContact.subject}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900">Message</h4>
                  <div className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">
                    {selectedContact.message}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Status
                    </h4>
                    <select
                      value={selectedContact.status}
                      onChange={(e) =>
                        handleStatusChange(selectedContact._id, e.target.value)
                      }
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Priority
                    </h4>
                    <select
                      value={selectedContact.priority}
                      onChange={(e) =>
                        handlePriorityChange(
                          selectedContact._id,
                          e.target.value
                        )
                      }
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  <p>
                    Received:{" "}
                    {new Date(selectedContact.createdAt).toLocaleString()}
                  </p>
                  <p>Source: {selectedContact.source}</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <a
                    href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Reply via Email
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.476L3 21l2.476-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Select a message
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a contact message from the list to view details.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
