import { useState, useEffect, useCallback } from "react";
import { appConfigAPI, AppConfig } from "@/lib/api";

/** Default fallback values used while the config is loading or if the fetch fails. */
const DEFAULT_CONFIG: AppConfig = {
  max_file_size_mb: 10,
  max_storage_quota_mb: 500,
  max_page_size: 100,
  default_page_size: 20,
  allowed_resume_extensions: [".pdf", ".doc", ".docx"],
  allowed_attachment_extensions: [".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg", ".txt", ".zip"],
  health_score_thresholds: { excellent: 90, good: 75, fair: 60, poor: 40 },
  max_daily_emails_recommended: 50,
  max_followup_days: 30,
  rate_limit_presets: ["conservative", "moderate", "aggressive", "gmail_free", "gmail_workspace", "outlook", "custom"],
};

// Module-level cache so we only fetch once across all component instances.
let cachedConfig: AppConfig | null = null;
let fetchPromise: Promise<AppConfig> | null = null;

function fetchConfig(): Promise<AppConfig> {
  if (cachedConfig) return Promise.resolve(cachedConfig);
  if (fetchPromise) return fetchPromise;

  fetchPromise = appConfigAPI
    .getPublic()
    .then((res) => {
      cachedConfig = res.data;
      return cachedConfig;
    })
    .catch(() => {
      // On failure, use defaults so the app still works.
      cachedConfig = DEFAULT_CONFIG;
      return cachedConfig;
    })
    .finally(() => {
      fetchPromise = null;
    });

  return fetchPromise;
}

/**
 * Hook that provides the public application configuration from the backend.
 *
 * - Fetches once and caches at module level (shared across components).
 * - Returns sensible defaults immediately while loading.
 * - Falls back to defaults if the backend is unreachable.
 */
export function useAppConfig() {
  const [config, setConfig] = useState<AppConfig>(cachedConfig ?? DEFAULT_CONFIG);
  const [loading, setLoading] = useState(!cachedConfig);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedConfig) {
      setConfig(cachedConfig);
      setLoading(false);
      return;
    }

    let cancelled = false;

    fetchConfig()
      .then((cfg) => {
        if (!cancelled) {
          setConfig(cfg);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message ?? "Failed to load config");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /** Force re-fetch (e.g. after admin changes settings). */
  const refresh = useCallback(async () => {
    cachedConfig = null;
    setLoading(true);
    const cfg = await fetchConfig();
    setConfig(cfg);
    setLoading(false);
  }, []);

  return { config, loading, error, refresh };
}
