"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";

interface VariantRatingProps {
  variantId: string;
  carouselId: string;
  stage: string;
  onScoreSubmit: (score: number, feedback?: string) => Promise<void>;
  initialScore?: number;
  initialFeedback?: string;
  disabled?: boolean;
}

export function VariantRating({
  variantId,
  carouselId,
  stage,
  onScoreSubmit,
  initialScore = 0,
  initialFeedback = "",
  disabled = false,
}: VariantRatingProps) {
  const [rating, setRating] = useState<number>(initialScore);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>(initialFeedback);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(initialScore > 0);

  const handleStarClick = async (score: number) => {
    if (disabled || isSubmitting) return;

    setRating(score);
    setShowFeedback(true);

    // Auto-submit if user doesn't want to add feedback
    if (!showFeedback) {
      setTimeout(async () => {
        if (!feedback) {
          await handleSubmit(score);
        }
      }, 500);
    }
  };

  const handleSubmit = async (scoreToSubmit?: number) => {
    const finalScore = scoreToSubmit || rating;
    if (finalScore === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onScoreSubmit(finalScore, feedback || undefined);
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit rating:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-3">
      {/* Star Rating */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Rate this variant:
        </span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              disabled={disabled || isSubmitting}
              className="transition-all hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  star <= (hoverRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300 dark:text-gray-600"
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {rating}/5
            {submitted && (
              <span className="ml-2 text-green-600 dark:text-green-400">
                ✓ Saved
              </span>
            )}
          </span>
        )}
      </div>

      {/* Feedback Input (optional) */}
      {showFeedback && rating > 0 && !submitted && (
        <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
          <label
            htmlFor={`feedback-${variantId}`}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Optional: Why did you rate it this way? (helps us learn)
          </label>
          <textarea
            id={`feedback-${variantId}`}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., 'Great hook but too long' or 'Perfect tone for my audience'"
            rows={2}
            maxLength={500}
            disabled={disabled || isSubmitting}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
              disabled:opacity-50 disabled:cursor-not-allowed
              placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {feedback.length}/500 characters
            </span>
            <button
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg
                hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors"
            >
              {isSubmitting ? "Saving..." : "Submit Rating"}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Press Ctrl+Enter (⌘+Enter on Mac) to submit quickly
          </p>
        </div>
      )}

      {/* Rating Guide */}
      {!submitted && rating === 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p className="font-medium">Rating Guide:</p>
          <ul className="space-y-0.5 pl-4">
            <li>★★★★★ Excellent - Exactly what you wanted</li>
            <li>★★★★☆ Good - Minor tweaks needed</li>
            <li>★★★☆☆ Acceptable - Could be improved</li>
            <li>★★☆☆☆ Below average - Significant issues</li>
            <li>★☆☆☆☆ Poor - Completely unusable</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default VariantRating;
