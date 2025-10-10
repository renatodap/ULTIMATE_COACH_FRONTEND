"use client";

import React from "react";
import { TrendingUp, Award, Target, Lightbulb, BarChart3 } from "lucide-react";

interface Pattern {
  pattern_type: string;
  avg_score: number;
  usage_count: number;
  recommendation: string;
}

interface LearningInsightsProps {
  totalCarouselsCreated: number;
  totalVariantsScored: number;
  avgUserScore?: number;
  avgEngagementScore?: number;
  hookPatterns?: Pattern[];
  copywritingPatterns?: Pattern[];
  outlinePatterns?: Pattern[];
  recommendations?: string[];
  successfulCarousels?: number;
  successRate?: number;
}

export function LearningInsights({
  totalCarouselsCreated,
  totalVariantsScored,
  avgUserScore,
  avgEngagementScore,
  hookPatterns = [],
  copywritingPatterns = [],
  outlinePatterns = [],
  recommendations = [],
  successfulCarousels = 0,
  successRate = 0,
}: LearningInsightsProps) {
  // Check if we have enough data
  const hasEnoughData = totalCarouselsCreated >= 3;

  if (!hasEnoughData) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Start building your insights
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              Create at least 3 carousels and rate your variants to unlock personalized insights
              and recommendations.
            </p>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Progress: {totalCarouselsCreated}/3 carousels •{" "}
              {totalVariantsScored} variants rated
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Your Learning Insights
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Based on {totalCarouselsCreated} carousels and {totalVariantsScored} rated variants
        </p>
      </div>

      {/* Success Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Success Rate
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {(successRate * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {successfulCarousels} successful carousels
          </div>
        </div>

        {avgUserScore !== undefined && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Avg Rating
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {avgUserScore.toFixed(1)}/5
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Quality you approve
            </div>
          </div>
        )}

        {avgEngagementScore !== undefined && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Engagement
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {avgEngagementScore.toFixed(1)}/5
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Instagram performance
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Total Variants
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {totalVariantsScored}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Ratings provided
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Recommendations for Better Results
              </h3>
              <ul className="space-y-2">
                {recommendations.map((rec, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">
                      •
                    </span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Learned Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hook Patterns */}
        {hookPatterns.length > 0 && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              Hook Patterns
            </h3>
            <div className="space-y-3">
              {hookPatterns.slice(0, 3).map((pattern, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                      {pattern.pattern_type.replace(/_/g, " ")}
                    </span>
                    <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                      {pattern.avg_score.toFixed(1)}★
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {pattern.recommendation}
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Used {pattern.usage_count} times
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Copywriting Patterns */}
        {copywritingPatterns.length > 0 && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Copywriting Patterns
            </h3>
            <div className="space-y-3">
              {copywritingPatterns.slice(0, 3).map((pattern, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                      {pattern.pattern_type.replace(/_/g, " ")}
                    </span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      {pattern.avg_score.toFixed(1)}★
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {pattern.recommendation}
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Used {pattern.usage_count} times
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outline Patterns */}
        {outlinePatterns.length > 0 && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Outline Patterns
            </h3>
            <div className="space-y-3">
              {outlinePatterns.slice(0, 3).map((pattern, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                      {pattern.pattern_type.replace(/_/g, " ")}
                    </span>
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      {pattern.avg_score.toFixed(1)}★
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {pattern.recommendation}
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Used {pattern.usage_count} times
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Empty State for Patterns */}
      {hookPatterns.length === 0 &&
        copywritingPatterns.length === 0 &&
        outlinePatterns.length === 0 && (
          <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
            <Award className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Building your pattern library
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Keep rating variants to help us identify what works best for you. We'll show your
              top-performing patterns here.
            </p>
          </div>
        )}
    </div>
  );
}

export default LearningInsights;
