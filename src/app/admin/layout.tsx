"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  HomeIcon,
  DocumentTextIcon,
  FolderIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  UsersIcon,
  ChartBarIcon,
  PhotoIcon,
  Cog6ToothIcon,
  HeartIcon,
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: HomeIcon },
  { name: "Blog Posts", href: "/admin/blog", icon: DocumentTextIcon },
  { name: "Projects", href: "/admin/projects", icon: FolderIcon },
  {
    name: "Contact Messages",
    href: "/admin/contact",
    icon: ChatBubbleLeftRightIcon,
  },
  { name: "Newsletter", href: "/admin/newsletter", icon: EnvelopeIcon },
  { name: "Testimonials", href: "/admin/testimonials", icon: UsersIcon },
  { name: "Analytics", href: "/admin/analytics", icon: ChartBarIcon },
  { name: "Media", href: "/admin/media", icon: PhotoIcon },
  { name: "Health Data", href: "/admin/health", icon: HeartIcon },
  { name: "Settings", href: "/admin/settings", icon: Cog6ToothIcon },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Skip authentication checks for login page
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) return; // Skip auth checks for login page
    if (status === "loading") return; // Still loading

    if (!session) {
      router.push("/admin/login");
      return;
    }

    if (session.user?.role !== "admin") {
      router.push("/admin/login");
      return;
    }
  }, [session, status, router, isLoginPage]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/admin/login" });
  };

  // For login page, just render the children without layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (!session || session.user?.role !== "admin") {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-40 flex md:hidden",
          sidebarOpen ? "" : "hidden"
        )}
      >
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="relative flex w-full max-w-xs flex-1 flex-col bg-card border-r border-border">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent />
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:shrink-0">
        <div className="flex w-64 flex-col">
          <SidebarContent />
        </div>
      </div>

      {/* Main content */}
      <div className="flex w-0 flex-1 flex-col overflow-hidden">
        {/* Top navigation */}
        <div className="relative z-10 flex h-16 shrink-0 border-b border-border bg-card">
          <button
            type="button"
            className="border-r border-border px-4 text-muted-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-display font-semibold text-foreground">
                {navigation.find((item) => item.href === pathname)?.name ||
                  "Admin Dashboard"}
              </h1>
            </div>
            <div className="ml-4 flex items-center gap-3 md:ml-6">
              <ThemeToggle />
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {session.user?.name}
              </span>
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-ring"
              >
                <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="relative flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );

  function SidebarContent() {
    return (
      <div className="flex h-0 flex-1 flex-col border-r border-border bg-card">
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <div className="flex shrink-0 items-center px-4">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Admin Panel
            </h2>
          </div>
          <nav className="mt-5 flex-1 space-y-1 px-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 shrink-0",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex shrink-0 border-t border-border p-4">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <span className="text-sm font-medium text-primary-foreground">
                {session?.user?.name?.charAt(0) || "A"}
              </span>
            </div>
            <div className="ml-3 min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {session?.user?.name}
              </p>
              <p className="text-xs font-medium text-muted-foreground">
                Administrator
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
