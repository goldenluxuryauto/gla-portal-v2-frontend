/**
 * Centralized API error handling with toast notifications.
 * Import { toast } from use-toast and call handleApiError for consistent error UX.
 */
import { toast } from "@/hooks/use-toast";

interface ApiErrorOptions {
  /** Custom title for the toast (default: "Error") */
  title?: string;
  /** Whether to show a toast (default: true) */
  showToast?: boolean;
  /** Custom fallback message if error has no message */
  fallbackMessage?: string;
}

/**
 * Extract a user-friendly message from an API error.
 */
function extractErrorMessage(error: unknown): string {
  if (error instanceof Response) {
    if (error.status === 401) return "Session expired. Please log in again.";
    if (error.status === 403) return "You don't have permission to perform this action.";
    if (error.status === 404) return "The requested resource was not found.";
    if (error.status === 429) return "Too many requests. Please try again later.";
    if (error.status >= 500) return "Server error. Please try again later.";
    return `Request failed (${error.status})`;
  }

  if (error instanceof Error) {
    if (error.name === "AbortError") return "Request timed out. Please check your connection.";
    if (error.message === "Failed to fetch") return "Network error. Please check your connection.";
    // Parse "status: message" format from throwIfResNotOk
    const match = error.message.match(/^(\d{3}):\s*(.+)$/);
    if (match) {
      const status = parseInt(match[1]);
      const body = match[2];
      // Try to parse JSON body
      try {
        const parsed = JSON.parse(body);
        if (parsed.message) return parsed.message;
        if (parsed.error) return parsed.error;
      } catch {
        // Not JSON
      }
      if (status === 401) return "Session expired. Please log in again.";
      if (status === 403) return "You don't have permission to perform this action.";
      if (status === 404) return "The requested resource was not found.";
      return body;
    }
    return error.message;
  }

  if (typeof error === "string") return error;
  return "An unexpected error occurred.";
}

/**
 * Handle an API error: log it and optionally show a toast.
 */
export function handleApiError(error: unknown, options: ApiErrorOptions = {}): string {
  const {
    title = "Error",
    showToast: shouldShowToast = true,
    fallbackMessage = "An unexpected error occurred.",
  } = options;

  const message = extractErrorMessage(error) || fallbackMessage;

  // Always log
  console.error(`[API Error] ${title}:`, error);

  if (shouldShowToast) {
    toast({
      title,
      description: message,
      variant: "destructive",
    });
  }

  return message;
}

/**
 * Show a success toast.
 */
export function showSuccess(title: string, description?: string) {
  toast({ title, description });
}

/**
 * Show a warning toast.
 */
export function showWarning(title: string, description?: string) {
  toast({
    title,
    description,
    variant: "destructive", // Using destructive as there's no "warning" variant
  });
}
