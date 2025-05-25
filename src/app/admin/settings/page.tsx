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
      setSettings(data.settings);
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
      setSettings(data.settings);
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Failed to load settings.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-700">
          Configure your portfolio website settings and preferences.
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="text-sm text-green-600">{success}</div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:space-x-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 lg:flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <tab.icon className="mr-3 h-5 w-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 mt-6 lg:mt-0">
          <div className="bg-white shadow rounded-lg">
            {/* General Settings */}
            {activeTab === "general" && (
              <GeneralSettings
                settings={settings}
                onSave={handleSave}
                saving={saving}
              />
            )}

            {/* Contact Settings */}
            {activeTab === "contact" && (
              <ContactSettings
                settings={settings}
                onSave={handleSave}
                saving={saving}
              />
            )}

            {/* Analytics Settings */}
            {activeTab === "analytics" && (
              <AnalyticsSettings
                settings={settings}
                onSave={handleSave}
                saving={saving}
              />
            )}

            {/* Appearance Settings */}
            {activeTab === "appearance" && (
              <AppearanceSettings
                settings={settings}
                onSave={handleSave}
                saving={saving}
              />
            )}

            {/* Features Settings */}
            {activeTab === "features" && (
              <FeaturesSettings
                settings={settings}
                onSave={handleSave}
                saving={saving}
              />
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <SecuritySettings
                settings={settings}
                onSave={handleSave}
                saving={saving}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Component for General Settings
function GeneralSettings({
  settings,
  onSave,
  saving,
}: {
  settings: ISettings;
  onSave: (data: Partial<ISettings>) => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState({
    siteName: settings.siteName || "",
    siteDescription: settings.siteDescription || "",
    siteUrl: settings.siteUrl || "",
    siteLogo: settings.siteLogo || "",
    favicon: settings.favicon || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">General Information</h3>
        <p className="mt-1 text-sm text-gray-500">
          Basic information about your website.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">
            Site Name
          </label>
          <input
            type="text"
            id="siteName"
            value={formData.siteName}
            onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">
            Site Description
          </label>
          <textarea
            id="siteDescription"
            rows={3}
            value={formData.siteDescription}
            onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="siteUrl" className="block text-sm font-medium text-gray-700">
            Site URL
          </label>
          <input
            type="url"
            id="siteUrl"
            value={formData.siteUrl}
            onChange={(e) => setFormData({ ...formData, siteUrl: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="siteLogo" className="block text-sm font-medium text-gray-700">
            Site Logo URL
          </label>
          <input
            type="url"
            id="siteLogo"
            value={formData.siteLogo}
            onChange={(e) => setFormData({ ...formData, siteLogo: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="favicon" className="block text-sm font-medium text-gray-700">
            Favicon URL
          </label>
          <input
            type="url"
            id="favicon"
            value={formData.favicon}
            onChange={(e) => setFormData({ ...formData, favicon: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

// Placeholder components for other settings sections
function ContactSettings({ settings, onSave, saving }: any) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900">Contact Settings</h3>
      <p className="mt-1 text-sm text-gray-500">Contact information and social media links.</p>
      <div className="mt-6 text-sm text-gray-500">Contact settings form would go here...</div>
    </div>
  );
}

function AnalyticsSettings({ settings, onSave, saving }: any) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900">Analytics Settings</h3>
      <p className="mt-1 text-sm text-gray-500">Configure analytics and tracking.</p>
      <div className="mt-6 text-sm text-gray-500">Analytics settings form would go here...</div>
    </div>
  );
}

function AppearanceSettings({ settings, onSave, saving }: any) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900">Appearance Settings</h3>
      <p className="mt-1 text-sm text-gray-500">Customize the look and feel of your site.</p>
      <div className="mt-6 text-sm text-gray-500">Appearance settings form would go here...</div>
    </div>
  );
}

function FeaturesSettings({ settings, onSave, saving }: any) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900">Feature Settings</h3>
      <p className="mt-1 text-sm text-gray-500">Enable or disable site features.</p>
      <div className="mt-6 text-sm text-gray-500">Feature settings form would go here...</div>
    </div>
  );
}

function SecuritySettings({ settings, onSave, saving }: any) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
      <p className="mt-1 text-sm text-gray-500">Manage security and maintenance settings.</p>
      <div className="mt-6 text-sm text-gray-500">Security settings form would go here...</div>
    </div>
  );
}
