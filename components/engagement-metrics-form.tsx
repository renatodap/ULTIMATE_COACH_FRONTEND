"use client";

import React, { useState } from "react";
import { TrendingUp, Heart, MessageCircle, Share2, Eye, Bookmark, AlertCircle } from "lucide-react";

interface EngagementMetricsFormProps {
  carouselId: string;
  onSubmit: (metrics: EngagementMetrics) => Promise<void>;
  onCancel?: () => void;
}

interface EngagementMetrics {
  save_rate: number;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
  reach?: number;
  impressions?: number;
}

export function EngagementMetricsForm({
  carouselId,
  onSubmit,
  onCancel,
}: EngagementMetricsFormProps) {
  const [formData, setFormData] = useState<EngagementMetrics>({
    save_rate: 0,
    like_count: undefined,
    comment_count: undefined,
    share_count: undefined,
    reach: undefined,
    impressions: undefined,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Calculate save rate automatically if saves and impressions are provided
  const handleImpressionChange = (impressions: number) => {
    setFormData((prev) => {
      const newData = { ...prev, impressions };
      // Auto-calculate save_rate if we have both saves and impressions
      if (prev.like_count && impressions > 0) {
        // Estimate saves as a portion of likes (typically saves are 20-30% of likes)
        const estimatedSaves = prev.like_count * 0.25;
        newData.save_rate = (estimatedSaves / impressions) * 100;
      }
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.save_rate <= 0 || formData.save_rate > 100) {
      setError("Save rate must be between 0.1% and 100%");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit metrics");
      setIsSubmitting(false);
    }
  };

  const handleNumberInput = (field: keyof EngagementMetrics, value: string) => {
    const numValue = value === "" ? undefined : parseFloat(value);
    setFormData((prev) => ({ ...prev, [field]: numValue }));
  };

  // Helper to calculate engagement rate
  const calculateEngagementRate = () => {
    if (!formData.impressions || formData.impressions === 0) return null;
    const { like_count = 0, comment_count = 0, share_count = 0, impressions } = formData;
    const estimatedSaves = like_count * 0.25; // Estimate saves from likes
    const totalEngagements = like_count + comment_count + share_count + estimatedSaves;
    return ((totalEngagements / impressions) * 100).toFixed(2);
  };

  const engagementRate = calculateEngagementRate();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Record Instagram Performance
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Add your carousel's Instagram metrics to help the system learn what works
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Critical Metric: Save Rate */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <label htmlFor="save_rate" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Save Rate (%) <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              id="save_rate"
              value={formData.save_rate || ""}
              onChange={(e) => handleNumberInput("save_rate", e.target.value)}
              step="0.01"
              min="0"
              max="100"
              required
              className="flex-1 px-4 py-2 text-lg font-semibold border border-gray-300 dark:border-gray-600 rounded-lg 
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="e.g., 3.2"
            />
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">%</span>
          </div>
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            <p className="font-medium mb-1">Benchmark:</p>
            <ul className="space-y-0.5">
              <li>• &lt;1%: Below average</li>
              <li>• 1-2%: Average</li>
              <li>• 2-3%: Good</li>
              <li>• 3%+: Excellent ⭐</li>
            </ul>
          </div>
        </div>

        {/* Basic Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="like_count" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Heart className="w-4 h-4 inline mr-1 text-red-500" />
              Likes
            </label>
            <input
              type="number"
              id="like_count"
              value={formData.like_count || ""}
              onChange={(e) => handleNumberInput("like_count", e.target.value)}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="e.g., 150"
            />
          </div>

          <div>
            <label htmlFor="comment_count" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MessageCircle className="w-4 h-4 inline mr-1 text-blue-500" />
              Comments
            </label>
            <input
              type="number"
              id="comment_count"
              value={formData.comment_count || ""}
              onChange={(e) => handleNumberInput("comment_count", e.target.value)}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="e.g., 12"
            />
          </div>

          <div>
            <label htmlFor="share_count" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Share2 className="w-4 h-4 inline mr-1 text-green-500" />
              Shares
            </label>
            <input
              type="number"
              id="share_count"
              value={formData.share_count || ""}
              onChange={(e) => handleNumberInput("share_count", e.target.value)}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="e.g., 8"
            />
          </div>

          <div>
            <label htmlFor="impressions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Eye className="w-4 h-4 inline mr-1 text-purple-500" />
              Impressions
            </label>
            <input
              type="number"
              id="impressions"
              value={formData.impressions || ""}
              onChange={(e) => handleImpressionChange(parseInt(e.target.value) || 0)}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="e.g., 5000"
            />
          </div>
        </div>

        {/* Advanced Metrics (Optional) */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {showAdvanced ? "Hide" : "Show"} advanced metrics (optional)
          </button>

          {showAdvanced && (
            <div className="mt-4">
              <label htmlFor="reach" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Bookmark className="w-4 h-4 inline mr-1 text-orange-500" />
                Reach (unique accounts)
              </label>
              <input
                type="number"
                id="reach"
                value={formData.reach || ""}
                onChange={(e) => handleNumberInput("reach", e.target.value)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="e.g., 4200"
              />
            </div>
          )}
        </div>

        {/* Calculated Engagement Rate */}
        {engagementRate && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-900 dark:text-green-100">
                Estimated Engagement Rate
              </span>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {engagementRate}%
            </div>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              Based on likes, comments, shares, and estimated saves
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900 dark:text-red-100">Error</p>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg
                hover:bg-gray-50 dark:hover:bg-gray-700
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !formData.save_rate}
            className="px-6 py-2 text-sm font-medium text-white 
              bg-blue-600 rounded-lg hover:bg-blue-700
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors"
          >
            {isSubmitting ? "Submitting..." : "Submit Metrics"}
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          <strong>Tip:</strong> Wait 24-48 hours after publishing before submitting metrics. This ensures
          your data is stable and the system learns from accurate performance.
        </p>
      </div>
    </div>
  );
}

export default EngagementMetricsForm;
