"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "already">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = async () => {
      const subscriberId = searchParams.get("id");
      const email = searchParams.get("email");

      if (!subscriberId && !email) {
        setStatus("error");
        setMessage("Invalid unsubscribe link. Missing required parameters.");
        return;
      }

      try {
        const params = new URLSearchParams();
        if (subscriberId) params.append("id", subscriberId);
        if (email) params.append("email", email);

        const response = await fetch(`/api/newsletter/unsubscribe?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          if (data.data?.status === "unsubscribed") {
            if (data.message?.includes("already")) {
              setStatus("already");
            } else {
              setStatus("success");
            }
            setMessage(data.data.message || data.message);
          }
        } else {
          setStatus("error");
          setMessage(data.message || "Failed to unsubscribe. Please try again.");
        }
      } catch (error) {
        console.error("Unsubscribe error:", error);
        setStatus("error");
        setMessage("An unexpected error occurred. Please try again later.");
      }
    };

    unsubscribe();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === "loading" && (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Processing...
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Please wait while we unsubscribe you from our newsletter.
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                  <svg
                    className="h-6 w-6 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Successfully Unsubscribed
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {message || "You have been successfully unsubscribed from our newsletter."}
                </p>
              </>
            )}

            {status === "already" && (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-4">
                  <svg
                    className="h-6 w-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Already Unsubscribed
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {message || "You are already unsubscribed from our newsletter."}
                </p>
              </>
            )}

            {status === "error" && (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                  <svg
                    className="h-6 w-6 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Unsubscribe Failed
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {message || "We couldn't process your unsubscribe request. Please try again."}
                </p>
              </>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                href="/"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Return to Homepage
              </Link>

              {status === "error" && (
                <button
                  onClick={() => window.location.reload()}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Try Again
                </button>
              )}
            </div>

            {/* Contact Support */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Having trouble? Contact me at{" "}
                <a
                  href="mailto:yashdeep@yashdeeptandon.me"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  yashdeep@yashdeeptandon.me
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Loading...
                </h2>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
