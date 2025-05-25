"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface BlogFormData {
  title: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  tags: string[];
  category: string;
  status: "draft" | "published" | "archived";
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

export default function NewBlogPost() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    content: "",
    excerpt: "",
    featuredImage: "",
    tags: [],
    category: "",
    status: "draft",
    seo: {
      metaTitle: "",
      metaDescription: "",
      keywords: [],
    },
  });

  const [tagInput, setTagInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name.startsWith("seo.")) {
      const seoField = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          [seoField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && keywordInput.trim()) {
      e.preventDefault();
      const newKeyword = keywordInput.trim().toLowerCase();
      if (!formData.seo.keywords.includes(newKeyword)) {
        setFormData(prev => ({
          ...prev,
          seo: {
            ...prev.seo,
            keywords: [...prev.seo.keywords, newKeyword],
          },
        }));
      }
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords: prev.seo.keywords.filter(keyword => keyword !== keywordToRemove),
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create blog post");
      }

      const result = await response.json();
      router.push(`/admin/blog/${result.data._id}`);
    } catch (error) {
      console.error("Error creating blog post:", error);
      setError(error instanceof Error ? error.message : "Failed to create blog post");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsDraft = () => {
    setFormData(prev => ({ ...prev, status: "draft" }));
    handleSubmit(new Event("submit") as any);
  };

  const handlePublish = () => {
    setFormData(prev => ({ ...prev, status: "published" }));
    handleSubmit(new Event("submit") as any);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Blog Post</h1>
        <p className="mt-1 text-sm text-gray-500">
          Write and publish a new blog post for your portfolio
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter blog post title"
              />
            </div>

            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                Excerpt *
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                required
                rows={3}
                value={formData.excerpt}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Brief description of the blog post"
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.excerpt.length}/500 characters
              </p>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content *
              </label>
              <textarea
                id="content"
                name="content"
                required
                rows={15}
                value={formData.content}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Write your blog post content here..."
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., Technology, Tutorial, Opinion"
                />
              </div>

              <div>
                <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700">
                  Featured Image URL
                </label>
                <input
                  type="url"
                  id="featuredImage"
                  name="featuredImage"
                  value={formData.featuredImage}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Type a tag and press Enter"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SEO Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="seo.metaTitle" className="block text-sm font-medium text-gray-700">
                Meta Title
              </label>
              <input
                type="text"
                id="seo.metaTitle"
                name="seo.metaTitle"
                value={formData.seo.metaTitle}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="SEO title (leave empty to use post title)"
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.seo.metaTitle.length}/60 characters
              </p>
            </div>

            <div>
              <label htmlFor="seo.metaDescription" className="block text-sm font-medium text-gray-700">
                Meta Description
              </label>
              <textarea
                id="seo.metaDescription"
                name="seo.metaDescription"
                rows={3}
                value={formData.seo.metaDescription}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="SEO description (leave empty to use excerpt)"
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.seo.metaDescription.length}/160 characters
              </p>
            </div>

            <div>
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">
                SEO Keywords
              </label>
              <input
                type="text"
                id="keywords"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleAddKeyword}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Type a keyword and press Enter"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.seo.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="ml-1 text-green-600 hover:text-green-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAsDraft}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Save as Draft
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? "Saving..." : formData.status === "published" ? "Publish" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
