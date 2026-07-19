"use client";

import { useState, useEffect } from "react";
import {
  Cog6ToothIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  ChartBarIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { ISettings } from "@/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SettingsSectionProps {
  settings: ISettings;
  onSave: (data: Partial<ISettings>) => void;
  saving: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<ISettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("general");

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");

      const data = await response.json();
      setSettings(data.data.settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (sectionData: Partial<ISettings>) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sectionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save settings");
      }

      const data = await response.json();
      setSettings(data.data.settings);
      setSuccess("Settings saved successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "general", name: "General", icon: GlobeAltIcon },
    { id: "contact", name: "Contact", icon: EnvelopeIcon },
    { id: "analytics", name: "Analytics", icon: ChartBarIcon },
    { id: "appearance", name: "Appearance", icon: PaintBrushIcon },
    { id: "features", name: "Features", icon: Cog6ToothIcon },
    { id: "security", name: "Security", icon: ShieldCheckIcon },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Failed to load settings.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure your portfolio website settings and preferences.
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="rounded-md border border-green-500/20 bg-green-500/10 p-4">
          <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
        </div>
      )}
      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:space-x-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 lg:shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <tab.icon className="mr-3 h-5 w-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="mt-6 flex-1 lg:mt-0">
          <Card className="py-0">
            {activeTab === "general" && (
              <GeneralSettings settings={settings} onSave={handleSave} saving={saving} />
            )}
            {activeTab === "contact" && (
              <ContactSettings settings={settings} onSave={handleSave} saving={saving} />
            )}
            {activeTab === "analytics" && (
              <AnalyticsSettings settings={settings} onSave={handleSave} saving={saving} />
            )}
            {activeTab === "appearance" && (
              <AppearanceSettings settings={settings} onSave={handleSave} saving={saving} />
            )}
            {activeTab === "features" && (
              <FeaturesSettings settings={settings} onSave={handleSave} saving={saving} />
            )}
            {activeTab === "security" && (
              <SecuritySettings settings={settings} onSave={handleSave} saving={saving} />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

// Component for General Settings
function GeneralSettings({ settings, onSave, saving }: SettingsSectionProps) {
  const [formData, setFormData] = useState({
    siteName: settings.siteName || "",
    siteDescription: settings.siteDescription || "",
    siteUrl: settings.siteUrl || "",
    siteLogo: settings.siteLogo || "",
    favicon: settings.favicon || "",
    resumeUrl: settings.resumeUrl || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <div>
        <h3 className="text-lg font-medium text-foreground">General Information</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Basic information about your website.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <Label htmlFor="siteName">Site Name</Label>
          <Input
            type="text"
            id="siteName"
            value={formData.siteName}
            onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="siteDescription">Site Description</Label>
          <Textarea
            id="siteDescription"
            rows={3}
            value={formData.siteDescription}
            onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="siteUrl">Site URL</Label>
          <Input
            type="url"
            id="siteUrl"
            value={formData.siteUrl}
            onChange={(e) => setFormData({ ...formData, siteUrl: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="siteLogo">Site Logo URL</Label>
          <Input
            type="url"
            id="siteLogo"
            value={formData.siteLogo}
            onChange={(e) => setFormData({ ...formData, siteLogo: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="favicon">Favicon URL</Label>
          <Input
            type="url"
            id="favicon"
            value={formData.favicon}
            onChange={(e) => setFormData({ ...formData, favicon: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="resumeUrl">Resume URL</Label>
          <Input
            type="url"
            id="resumeUrl"
            value={formData.resumeUrl}
            onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
            placeholder="https://...blob.vercel-storage.com/.../resume.pdf"
          />
          <p className="text-xs text-muted-foreground">
            Upload the PDF in Media Library, then paste its URL here. Powers the
            &quot;Download Resume&quot; button on the About section.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

// Placeholder components for other settings sections
function ContactSettings({}: SettingsSectionProps) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-foreground">Contact Settings</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Contact information and social media links.
      </p>
      <div className="mt-6 text-sm text-muted-foreground">
        Contact settings form would go here...
      </div>
    </div>
  );
}

function AnalyticsSettings({}: SettingsSectionProps) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-foreground">Analytics Settings</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Configure analytics and tracking.
      </p>
      <div className="mt-6 text-sm text-muted-foreground">
        Analytics settings form would go here...
      </div>
    </div>
  );
}

function AppearanceSettings({}: SettingsSectionProps) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-foreground">Appearance Settings</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Customize the look and feel of your site.
      </p>
      <div className="mt-6 text-sm text-muted-foreground">
        Appearance settings form would go here...
      </div>
    </div>
  );
}

function FeaturesSettings({}: SettingsSectionProps) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-foreground">Feature Settings</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Enable or disable site features.
      </p>
      <div className="mt-6 text-sm text-muted-foreground">
        Feature settings form would go here...
      </div>
    </div>
  );
}

function SecuritySettings({}: SettingsSectionProps) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-foreground">Security Settings</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage security and maintenance settings.
      </p>
      <div className="mt-6 text-sm text-muted-foreground">
        Security settings form would go here...
      </div>
    </div>
  );
}
