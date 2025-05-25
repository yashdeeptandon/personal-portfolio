import { useState } from "react";
import {
  validateContactForm,
  sanitizeContactForm,
  type ContactFormData,
  type ValidationResult,
} from "@/lib/utils/formValidation";

interface UseContactFormReturn {
  formData: ContactFormData;
  isSubmitting: boolean;
  submitStatus: "idle" | "success" | "error";
  errorMessage: string;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  validateForm: () => ValidationResult;
  resetForm: () => void;
}

const initialFormData: ContactFormData = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export const useContactForm = (): UseContactFormReturn => {
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = (): ValidationResult => {
    return validateContactForm(formData);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setSubmitStatus("idle");
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    // Client-side validation
    const validation = validateForm();
    if (!validation.isValid) {
      setSubmitStatus("error");
      setErrorMessage(validation.errors[0]);
      setIsSubmitting(false);

      // Auto-clear error after 5 seconds
      setTimeout(() => {
        setSubmitStatus("idle");
        setErrorMessage("");
      }, 5000);
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sanitizeContactForm(formData)),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 429) {
          throw new Error("Too many requests. Please try again later.");
        } else if (response.status === 422) {
          throw new Error(
            data.error || "Please check your input and try again."
          );
        } else {
          throw new Error(data.message || "Failed to send message");
        }
      }

      setSubmitStatus("success");
      resetForm();
    } catch (error) {
      console.error("Contact form error:", error);
      setSubmitStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);

      // Auto-clear status after 5 seconds
      setTimeout(() => {
        setSubmitStatus("idle");
        setErrorMessage("");
      }, 5000);
    }
  };

  return {
    formData,
    isSubmitting,
    submitStatus,
    errorMessage,
    handleChange,
    handleSubmit,
    validateForm,
    resetForm,
  };
};
