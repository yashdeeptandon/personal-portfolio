"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("seo.")) {
      const seoField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        seo: {
          ...prev.seo,
          [seoField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
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
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && keywordInput.trim()) {
      e.preventDefault();
      const newKeyword = keywordInput.trim().toLowerCase();
      if (!formData.seo.keywords.includes(newKeyword)) {
        setFormData((prev) => ({
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
    setFormData((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords: prev.seo.keywords.filter(
          (keyword) => keyword !== keywordToRemove
        ),
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
      setError(
        error instanceof Error ? error.message : "Failed to create blog post"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsDraft = () => {
    setFormData((prev) => ({ ...prev, status: "draft" }));
    handleSubmit(new Event("submit") as unknown as React.FormEvent);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Create New Blog Post
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Write and publish a new blog post for your portfolio
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-md border border-destructive/20 bg-destructive/10 p-4">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter blog post title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt *</Label>
              <Textarea
                id="excerpt"
                name="excerpt"
                required
                rows={3}
                value={formData.excerpt}
                onChange={handleInputChange}
                placeholder="Brief description of the blog post"
              />
              <p className="text-sm text-muted-foreground">
                {formData.excerpt.length}/500 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                name="content"
                required
                rows={15}
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Write your blog post content here..."
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                  type="text"
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Technology, Tutorial, Opinion"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="featuredImage">Featured Image URL</Label>
                <Input
                  type="url"
                  id="featuredImage"
                  name="featuredImage"
                  value={formData.featuredImage}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type a tag and press Enter"
              />
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-primary hover:text-primary/70"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEO Settings */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="seo.metaTitle">Meta Title</Label>
              <Input
                type="text"
                id="seo.metaTitle"
                name="seo.metaTitle"
                value={formData.seo.metaTitle}
                onChange={handleInputChange}
                placeholder="SEO title (leave empty to use post title)"
              />
              <p className="text-sm text-muted-foreground">
                {formData.seo.metaTitle.length}/60 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo.metaDescription">Meta Description</Label>
              <Textarea
                id="seo.metaDescription"
                name="seo.metaDescription"
                rows={3}
                value={formData.seo.metaDescription}
                onChange={handleInputChange}
                placeholder="SEO description (leave empty to use excerpt)"
              />
              <p className="text-sm text-muted-foreground">
                {formData.seo.metaDescription.length}/160 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">SEO Keywords</Label>
              <Input
                type="text"
                id="keywords"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleAddKeyword}
                placeholder="Type a keyword and press Enter"
              />
              <div className="flex flex-wrap gap-2">
                {formData.seo.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600 dark:text-green-400"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="text-green-600 hover:text-green-500 dark:text-green-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="w-full space-y-2 sm:w-48">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: (value as BlogFormData["status"]) ?? "draft",
                    }))
                  }
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveAsDraft}
                  disabled={loading}
                >
                  Save as Draft
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading
                    ? "Saving..."
                    : formData.status === "published"
                      ? "Publish"
                      : "Save"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
