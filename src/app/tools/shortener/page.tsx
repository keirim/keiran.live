"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";
import { AnalyticsData } from "@/types/analytics";

export default function URLShortener() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  const fetchAnalytics = async (code: string) => {
    try {
      setIsLoadingAnalytics(true);
      const response = await fetch(`/api/analytics/${code}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch analytics");
      }

      setAnalytics(data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setShortUrl("");
    setShortCode("");
    setAnalytics(null);

    const payload = { url };

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to shorten URL");
      }

      setShortUrl(data.shortUrl);
      setShortCode(data.code);
      
      await fetchAnalytics(data.code);
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!shortCode) return;

    const interval = setInterval(() => {
      fetchAnalytics(shortCode);
    }, 30000);

    return () => clearInterval(interval);
  }, [shortCode]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/tools"
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors"
          >
            <IconArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">URL Shortener</h1>
            <p className="text-zinc-400 mt-1">Create short links for your long URLs</p>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-zinc-400 mb-2">
                Enter your URL
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/very/long/url"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-600 text-zinc-100"
                required
              />
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Shortening..." : "Shorten URL"}
            </motion.button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-800 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {shortUrl && (
            <div className="mt-6 p-4 bg-zinc-800 rounded-lg">
              <p className="text-sm text-zinc-400 mb-2">Your shortened URL:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shortUrl}
                  readOnly
                  className="w-full px-4 py-2 bg-zinc-700 rounded-lg text-zinc-100"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(shortUrl)}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm font-medium transition-colors"
                >
                  Copy
                </button>
              </div>
              <Link
                href={`/tools/analytics?code=${shortCode}`}
                className="mt-4 text-sm text-zinc-400 hover:text-zinc-300 transition-colors flex items-center gap-1"
              >
                View Analytics
                <IconArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
