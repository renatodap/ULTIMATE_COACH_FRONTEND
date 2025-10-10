"use client";

import React, { useState, useEffect } from "react";
import { LearningInsights } from "@/components/learning-insights";
import { AlertCircle, Loader2 } from "lucide-react";

interface Pattern {
  pattern_type: string;
  avg_score: number;
  usage_count: number;
  recommendation: string;
}

interface LearningInsightsData {
  total_carousels_created: number;
  total_variants_scored: number;
  avg_user_score?: number;
  avg_engagement_score?: number;
  hook_patterns: Pattern[];
  copywriting_patterns: Pattern[];
  outline_patterns: Pattern[];
  recommendations: string[];
  successful_carousels?: number;
  success_rate?: number;
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<LearningInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all carousels to fetch insights from each
      const carouselsResponse = await fetch("/api/v1/carousels");
      if (!carouselsResponse.ok) {
        throw new Error("Failed to fetch carousels");
      }

      const carousels = await carouselsResponse.json();

      // Aggregate insights from all carousels
      let aggregatedInsights: LearningInsightsData = {
        total_carousels_created: carousels.length,
        total_variants_scored: 0,
        hook_patterns: [],
        copywriting_patterns: [],
        outline_patterns: [],
        recommendations: [],
      };

      // Fetch insights for each carousel that has variants
      for (const carousel of carousels) {
        if (carousel.id) {
          try {
            const response = await fetch(
              `/api/v1/carousels/${carousel.id}/learning-insights`
            );
            if (response.ok) {
              const carouselInsights: LearningInsightsData =
                await response.json();

              // Aggregate data
              aggregatedInsights.total_variants_scored +=
                carouselInsights.total_variants_scored || 0;

              // Merge patterns (you might want more sophisticated aggregation)
              if (carouselInsights.hook_patterns) {
                aggregatedInsights.hook_patterns.push(
                  ...carouselInsights.hook_patterns
                );
              }
              if (carouselInsights.copywriting_patterns) {
                aggregatedInsights.copywriting_patterns.push(
                  ...carouselInsights.copywriting_patterns
                );
              }
              if (carouselInsights.outline_patterns) {
                aggregatedInsights.outline_patterns.push(
                  ...carouselInsights.outline_patterns
                );
              }

              // Collect unique recommendations
              if (carouselInsights.recommendations) {
                carouselInsights.recommendations.forEach((rec) => {
                  if (!aggregatedInsights.recommendations.includes(rec)) {
                    aggregatedInsights.recommendations.push(rec);
                  }
                });
              }

              // Update averages (simple approach - could be weighted)
              if (carouselInsights.avg_user_score !== undefined) {
                aggregatedInsights.avg_user_score =
                  (aggregatedInsights.avg_user_score || 0) +
                  carouselInsights.avg_user_score;
              }
              if (carouselInsights.avg_engagement_score !== undefined) {
                aggregatedInsights.avg_engagement_score =
                  (aggregatedInsights.avg_engagement_score || 0) +
                  carouselInsights.avg_engagement_score;
              }
            }
          } catch (err) {
            console.error(
              `Failed to fetch insights for carousel ${carousel.id}:`,
              err
            );
          }
        }
      }

      // Calculate final averages
      if (
        aggregatedInsights.avg_user_score !== undefined &&
        carousels.length > 0
      ) {
        aggregatedInsights.avg_user_score /= carousels.length;
      }
      if (
        aggregatedInsights.avg_engagement_score !== undefined &&
        carousels.length > 0
      ) {
        aggregatedInsights.avg_engagement_score /= carousels.length;
      }

      // Deduplicate and sort patterns by avg_score
      aggregatedInsights.hook_patterns = deduplicatePatterns(
        aggregatedInsights.hook_patterns
      );
      aggregatedInsights.copywriting_patterns = deduplicatePatterns(
        aggregatedInsights.copywriting_patterns
      );
      aggregatedInsights.outline_patterns = deduplicatePatterns(
        aggregatedInsights.outline_patterns
      );

      // Calculate success metrics
      const scoredCarousels = carousels.filter(
        (c: any) => c.variants && c.variants.some((v: any) => v.user_score)
      );
      const successfulCarousels = scoredCarousels.filter(
        (c: any) =>
          c.variants.some((v: any) => v.user_score && v.user_score >= 4)
      );
      aggregatedInsights.successful_carousels = successfulCarousels.length;
      aggregatedInsights.success_rate =
        scoredCarousels.length > 0
          ? successfulCarousels.length / scoredCarousels.length
          : 0;

      setInsights(aggregatedInsights);
    } catch (err) {
      console.error("Error fetching insights:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load insights"
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper to deduplicate patterns and sort by score
  const deduplicatePatterns = (patterns: Pattern[]): Pattern[] => {
    const patternMap = new Map<string, Pattern>();

    patterns.forEach((pattern) => {
      const existing = patternMap.get(pattern.pattern_type);
      if (!existing) {
        patternMap.set(pattern.pattern_type, pattern);
      } else {
        // Merge: average the scores and sum usage counts
        const totalUsage = existing.usage_count + pattern.usage_count;
        const weightedScore =
          (existing.avg_score * existing.usage_count +
            pattern.avg_score * pattern.usage_count) /
          totalUsage;
        patternMap.set(pattern.pattern_type, {
          ...existing,
          avg_score: weightedScore,
          usage_count: totalUsage,
        });
      }
    });

    return Array.from(patternMap.values()).sort(
      (a, b) => b.avg_score - a.avg_score
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Loading your learning insights...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                  Error Loading Insights
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
                <button
                  onClick={fetchInsights}
                  className="mt-3 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <LearningInsights
          totalCarouselsCreated={insights.total_carousels_created}
          totalVariantsScored={insights.total_variants_scored}
          avgUserScore={insights.avg_user_score}
          avgEngagementScore={insights.avg_engagement_score}
          hookPatterns={insights.hook_patterns}
          copywritingPatterns={insights.copywriting_patterns}
          outlinePatterns={insights.outline_patterns}
          recommendations={insights.recommendations}
          successfulCarousels={insights.successful_carousels}
          successRate={insights.success_rate}
        />
      </div>
    </div>
  );
}
