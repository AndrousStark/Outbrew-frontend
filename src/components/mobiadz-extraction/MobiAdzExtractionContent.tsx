"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Smartphone,
  Gamepad2,
  ShoppingCart,
  Globe,
  Building2,
  Users,
  Mail,
  ExternalLink,
  Play,
  Pause,
  RotateCcw,
  Download,
  Filter,
  Search,
  ChevronRight,
  ChevronDown,
  Check,
  Loader2,
  Sparkles,
  Zap,
  Crown,
  MapPin,
  Briefcase,
  TrendingUp,
  Store,
  Megaphone,
  GraduationCap,
  Heart,
  DollarSign,
  MessageCircle,
  Tv,
  Layout,
  Building,
  Table,
  LayoutGrid,
  Eye,
  Copy,
  CheckCircle,
  AlertCircle,
  Info,
  Brain,
  Network,
  Database,
  Layers,
  Target,
  Activity,
  Clock,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Terminal,
  Code,
  Cpu,
  Server,
  Wifi,
  Shield,
  FileSearch,
  UserSearch,
  Link,
  Github,
  Linkedin,
  Twitter,
  Phone,
  Minimize2,
  Maximize2,
  PanelRightClose,
  PanelRight,
  ChevronUp,
  ChevronLeft,
  Minus,
  Plus,
  Menu,
  X,
  ArrowLeft,
  History,
  PlayCircle,
  SkipForward,
  Trash2,
  ChevronsRight,
  Repeat,
  FolderOpen
} from "lucide-react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Toast } from "@/lib/toast"
import { mobeAdzAPI, type MobiAdzJob, type MobiAdzResult } from "@/lib/api"
import { CampaignRecipient } from "@/types"

// Types
interface Demographic {
  value: string
  label: string
  icon: React.ReactNode
  countries: string[]
}

interface Category {
  value: string
  label: string
  icon: React.ReactNode
  description: string
}

interface PersonData {
  name: string
  title?: string
  role?: string
  emails?: string[]
  email?: string
  phone?: string
  linkedin?: string
}

interface ExtractionResult {
  company_name: string
  app_or_product: string | null
  product_category: string | null
  demographic: string | null
  company_website: string | null
  company_domain: string | null
  company_description: string | null
  company_linkedin: string | null
  company_size?: string | null
  company_industry?: string | null
  company_location?: string | null
  company_founded?: string | null
  company_phones?: string[]
  contact_email: string | null
  marketing_email: string | null
  sales_email: string | null
  support_email: string | null
  press_email: string | null
  playstore_url: string | null
  appstore_url: string | null
  people: PersonData[]
  confidence_score: number
  data_sources: string[]
  // Layer 6: Email verification
  email_verification_status?: string
  email_verification_confidence?: number
  email_mx_valid?: boolean
  email_is_disposable?: boolean
  email_is_role_based?: boolean
  // Layer 9: Enhanced scoring
  email_sources?: Record<string, string[]>
  role_engagement_score?: number
  domain_reputation_score?: number
  email_freshness_score?: number
  last_verified_at?: string | null
  // Layer 15: Warmth and catch-all
  email_warmth_score?: number
  domain_is_catchall?: boolean
}

interface ExtractionStats {
  apps_found: number
  companies_found: number
  emails_found: number
  emails_verified: number
  pages_scraped: number
  api_calls: number
  bloom_filter_hits: number
  cache_hits: number
  nlp_entities_extracted: number
  email_permutations_generated: number
  osint_leadership_found: number
  osint_employees_found: number
  osint_phones_found: number
  osint_social_profiles_found: number
}

interface APILiveContact {
  id: string
  timestamp: string
  company_name: string
  app_or_product?: string
  email?: string
  phone?: string
  person_name?: string
  type: "company" | "email" | "person" | "leadership" | "app"
  source: string
  confidence: number
  playstore_url?: string
  website?: string
}

interface ExtractionJob {
  job_id: string
  status: "pending" | "running" | "completed" | "failed" | "cancelled"
  progress: {
    stage: string
    stage_progress: number
    total_progress: number
    message: string
  }
  stats: ExtractionStats
  results_count: number
  live_contacts?: APILiveContact[]
  created_at?: string
  completed_at?: string
}

interface JobHistoryItem {
  job_id: string
  status: string
  progress: number
  results_count: number
  emails_found: number
  created_at: string
  completed_at?: string
  demographics?: string[]
  categories?: string[]
  config?: Record<string, any>
  stats?: Record<string, any>
}

interface LiveContact {
  id: string
  timestamp: Date
  company_name: string
  app_or_product?: string
  email?: string
  phone?: string
  person_name?: string
  type: "company" | "email" | "person" | "leadership" | "app"
  source: string
  confidence: number
  playstore_url?: string
  website?: string
}

interface ExtractionError {
  id: string
  timestamp: Date
  message: string
  type: "warning" | "error"
  source?: string
}

interface ExtractionLayer {
  id: string
  name: string
  icon: React.ReactNode
  status: "idle" | "active" | "completed" | "error"
  description: string
  progress: number
}

// Demographics data
const DEMOGRAPHICS: Demographic[] = [
  { value: "usa", label: "USA", icon: <Globe className="w-4 h-4 sm:w-5 sm:h-5" />, countries: ["us"] },
  { value: "europe", label: "Europe", icon: <Globe className="w-4 h-4 sm:w-5 sm:h-5" />, countries: ["de", "fr", "es", "it", "nl"] },
  { value: "uk", label: "United Kingdom", icon: <Globe className="w-4 h-4 sm:w-5 sm:h-5" />, countries: ["gb"] },
  { value: "australia", label: "Australia & NZ", icon: <Globe className="w-4 h-4 sm:w-5 sm:h-5" />, countries: ["au", "nz"] },
  { value: "singapore", label: "Singapore", icon: <Globe className="w-4 h-4 sm:w-5 sm:h-5" />, countries: ["sg"] },
  { value: "east_asia", label: "East Asia", icon: <Globe className="w-4 h-4 sm:w-5 sm:h-5" />, countries: ["jp", "kr", "cn", "tw"] },
  { value: "south_asia", label: "South Asia", icon: <Globe className="w-4 h-4 sm:w-5 sm:h-5" />, countries: ["in", "pk", "bd"] },
  { value: "middle_east", label: "Middle East", icon: <Globe className="w-4 h-4 sm:w-5 sm:h-5" />, countries: ["ae", "sa", "il"] },
  { value: "russia", label: "Russia", icon: <Globe className="w-4 h-4 sm:w-5 sm:h-5" />, countries: ["ru"] },
  { value: "latin_america", label: "Latin America", icon: <Globe className="w-4 h-4 sm:w-5 sm:h-5" />, countries: ["br", "mx", "ar"] },
  { value: "africa", label: "Africa", icon: <Globe className="w-4 h-4 sm:w-5 sm:h-5" />, countries: ["za", "ng", "ke"] },
  { value: "southeast_asia", label: "Southeast Asia", icon: <Globe className="w-4 h-4 sm:w-5 sm:h-5" />, countries: ["th", "vn", "id", "ph"] },
]

// Categories data
const CATEGORIES: Category[] = [
  { value: "mobile_apps", label: "Mobile Apps", icon: <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />, description: "All mobile applications" },
  { value: "android_apps", label: "Android Apps", icon: <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />, description: "Google Play Store apps" },
  { value: "ios_apps", label: "iOS Apps", icon: <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />, description: "Apple App Store apps" },
  { value: "games", label: "Games", icon: <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5" />, description: "Mobile & PC games" },
  { value: "ecommerce", label: "E-commerce", icon: <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />, description: "Online stores & marketplaces" },
  { value: "product_based", label: "Product Companies", icon: <Store className="w-4 h-4 sm:w-5 sm:h-5" />, description: "Consumer product companies" },
  { value: "ads_based", label: "Ads/AdTech", icon: <Megaphone className="w-4 h-4 sm:w-5 sm:h-5" />, description: "Advertising platforms" },
  { value: "saas", label: "SaaS", icon: <Building className="w-4 h-4 sm:w-5 sm:h-5" />, description: "Software as a Service" },
  { value: "fintech", label: "Fintech", icon: <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />, description: "Financial technology" },
  { value: "health_tech", label: "Health Tech", icon: <Heart className="w-4 h-4 sm:w-5 sm:h-5" />, description: "Healthcare & fitness apps" },
  { value: "ed_tech", label: "EdTech", icon: <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />, description: "Education technology" },
  { value: "social_media", label: "Social Media", icon: <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />, description: "Social networks" },
  { value: "streaming", label: "Streaming", icon: <Tv className="w-4 h-4 sm:w-5 sm:h-5" />, description: "Video & music streaming" },
  { value: "productivity", label: "Productivity", icon: <Layout className="w-4 h-4 sm:w-5 sm:h-5" />, description: "Productivity tools" },
  { value: "enterprise", label: "Enterprise", icon: <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />, description: "B2B enterprise software" },
  { value: "jobs", label: "Jobs / HR Tech", icon: <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />, description: "Job boards & HR platforms" },
  { value: "recruitment", label: "Recruitment", icon: <UserSearch className="w-4 h-4 sm:w-5 sm:h-5" />, description: "ATS & talent acquisition" },
  { value: "startups", label: "Startups", icon: <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />, description: "Early-stage & funded startups" },
]

// Initial extraction layers
const INITIAL_LAYERS: ExtractionLayer[] = [
  { id: "discovery", name: "Multi-Source Discovery", icon: <Search className="w-3 h-3 sm:w-4 sm:h-4" />, status: "idle", description: "App stores, web search, job boards, directories...", progress: 0 },
  { id: "web_scraping", name: "Web Scraping", icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />, status: "idle", description: "Deep website crawling", progress: 0 },
  { id: "ml_nlp", name: "ML/NLP", icon: <Brain className="w-3 h-3 sm:w-4 sm:h-4" />, status: "idle", description: "Entity extraction", progress: 0 },
  { id: "data_structures", name: "Data Structures", icon: <Database className="w-3 h-3 sm:w-4 sm:h-4" />, status: "idle", description: "Bloom Filter, Cache", progress: 0 },
  { id: "osint", name: "Full-Spectrum OSINT", icon: <Shield className="w-3 h-3 sm:w-4 sm:h-4" />, status: "idle", description: "All depts: HR, Marketing, Sales, Engineering, Legal, Podcasts, Job Boards", progress: 0 },
  { id: "web_search", name: "Web Search", icon: <Search className="w-3 h-3 sm:w-4 sm:h-4" />, status: "idle", description: "DuckDuckGo, Bing, SearX", progress: 0 },
  { id: "email_intel", name: "Email Intel", icon: <Mail className="w-3 h-3 sm:w-4 sm:h-4" />, status: "idle", description: "Verification, MX check", progress: 0 },
  { id: "social", name: "Social Media", icon: <Users className="w-3 h-3 sm:w-4 sm:h-4" />, status: "idle", description: "Twitter, Facebook", progress: 0 },
  { id: "enrichment", name: "Enrichment", icon: <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />, status: "idle", description: "API enrichment", progress: 0 },
]

// Selection Card Component - Responsive
function SelectionCard({
  item,
  selected,
  onToggle,
  type
}: {
  item: Demographic | Category
  selected: boolean
  onToggle: () => void
  type: "demographic" | "category"
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className={`
        relative p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 text-left w-full
        ${selected
          ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
          : "border-orange-500/15 bg-[#080808] hover:border-primary/50 hover:bg-primary/5"
        }
      `}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <div className={`
          p-1.5 sm:p-2 rounded-md sm:rounded-lg flex-shrink-0
          ${selected ? "bg-primary text-primary-foreground" : "bg-[#111] text-neutral-400"}
        `}>
          {item.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium sm:font-semibold text-white text-xs sm:text-sm truncate">{item.label}</h3>
          {type === "category" && (item as Category).description && (
            <p className="text-[10px] sm:text-xs text-neutral-400 mt-0.5 hidden sm:block truncate">
              {(item as Category).description}
            </p>
          )}
          {type === "demographic" && (item as Demographic).countries && (
            <p className="text-[10px] sm:text-xs text-neutral-400 mt-0.5 hidden xs:block">
              {(item as Demographic).countries.slice(0, 2).map(c => c.toUpperCase()).join(", ")}
              {(item as Demographic).countries.length > 2 && ` +${(item as Demographic).countries.length - 2}`}
            </p>
          )}
        </div>
        {selected && (
          <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
        )}
      </div>
    </motion.button>
  )
}

// Live Contact Feed Item - Enhanced with app details
function LiveContactItem({ contact, compact = false }: { contact: LiveContact; compact?: boolean }) {
  const getIcon = () => {
    const size = compact ? "w-3 h-3" : "w-4 h-4"
    switch (contact.type) {
      case "app": return <Smartphone className={`${size} text-cyan-500`} />
      case "company": return <Building2 className={`${size} text-orange-500`} />
      case "email": return <Mail className={`${size} text-green-500`} />
      case "person": return <Users className={`${size} text-purple-500`} />
      case "leadership": return <Crown className={`${size} text-amber-500`} />
      default: return <Info className={`${size} text-neutral-400`} />
    }
  }

  const getBg = () => {
    switch (contact.type) {
      case "app": return "bg-cyan-500/10 border-cyan-500/20"
      case "company": return "bg-orange-500/10 border-orange-500/15"
      case "email": return "bg-green-500/10 border-green-500/20"
      case "person": return "bg-purple-500/10 border-purple-500/20"
      case "leadership": return "bg-amber-500/10 border-amber-500/20"
      default: return "bg-white/[0.04] border-orange-500/15"
    }
  }

  const getTypeLabel = () => {
    switch (contact.type) {
      case "app": return "APP"
      case "company": return "COMPANY"
      case "email": return "EMAIL"
      case "person": return "PERSON"
      case "leadership": return "LEADER"
      default: return "INFO"
    }
  }

  return (
    <div className={`${compact ? "p-2" : "p-2.5 sm:p-3"} rounded-lg border ${getBg()} transition-all duration-200`}>
      <div className="flex items-start gap-2">
        <div className="mt-0.5 flex-shrink-0">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          {/* Header row with company/app name and badges */}
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            <span className={`font-semibold ${compact ? "text-xs" : "text-xs sm:text-sm"} text-white truncate max-w-[150px] sm:max-w-none`}>
              {contact.company_name}
            </span>
            <span className={`${compact ? "text-[8px]" : "text-[9px] sm:text-[10px]"} px-1.5 py-0.5 rounded-full font-bold ${
              contact.type === "app" ? "bg-cyan-500/30 text-orange-400" :
              contact.type === "email" ? "bg-green-500/30 text-green-400" :
              contact.type === "company" ? "bg-orange-500/30 text-orange-400" :
              contact.type === "leadership" ? "bg-amber-500/30 text-amber-400" :
              "bg-purple-500/30 text-amber-400"
            }`}>
              {getTypeLabel()}
            </span>
            <span className={`${compact ? "text-[8px]" : "text-[9px] sm:text-[10px]"} px-1 py-0.5 rounded ${
              contact.confidence >= 80 ? "bg-green-500/20 text-green-500" :
              contact.confidence >= 50 ? "bg-amber-500/20 text-amber-500" :
              "bg-[#111] text-neutral-400"
            }`}>
              {contact.confidence}%
            </span>
          </div>

          {/* App/Product name if different from company */}
          {contact.app_or_product && contact.app_or_product !== contact.company_name && (
            <p className={`${compact ? "text-[10px]" : "text-[10px] sm:text-xs"} text-orange-400 truncate flex items-center gap-1`}>
              <Smartphone className="w-2.5 h-2.5 inline" />
              {contact.app_or_product}
            </p>
          )}

          {/* Email - highlighted prominently */}
          {contact.email && (
            <p className={`${compact ? "text-[10px]" : "text-[11px] sm:text-xs"} text-green-400 font-medium truncate flex items-center gap-1`}>
              <Mail className="w-2.5 h-2.5 inline flex-shrink-0" />
              {contact.email}
            </p>
          )}

          {/* Phone */}
          {contact.phone && (
            <a href={`tel:${contact.phone}`} className={`${compact ? "text-[10px]" : "text-[11px] sm:text-xs"} text-orange-400 font-medium truncate flex items-center gap-1`}>
              <Phone className="w-2.5 h-2.5 inline flex-shrink-0" />
              {contact.phone}
            </a>
          )}

          {/* Person name */}
          {contact.person_name && !compact && (
            <p className="text-[10px] sm:text-xs text-amber-400 truncate flex items-center gap-1">
              <Users className="w-2.5 h-2.5 inline" />
              {contact.person_name}
            </p>
          )}

          {/* Source info - where we found this */}
          {contact.source && !compact && (
            <p className="text-[9px] sm:text-[10px] text-neutral-400 truncate flex items-center gap-1 mt-1">
              <Search className="w-2 h-2 inline flex-shrink-0" />
              Found from: <span className="text-orange-400">{contact.source}</span>
            </p>
          )}

          {/* Links row */}
          {!compact && (contact.playstore_url || contact.website) && (
            <div className="flex items-center gap-2 mt-1">
              {contact.playstore_url && (
                <a
                  href={contact.playstore_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] text-orange-400 hover:text-cyan-300 flex items-center gap-0.5"
                >
                  <ExternalLink className="w-2 h-2" /> Play Store
                </a>
              )}
              {contact.website && (
                <a
                  href={contact.website.startsWith("http") ? contact.website : `https://${contact.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] text-orange-400 hover:text-orange-300 flex items-center gap-0.5"
                >
                  <ExternalLink className="w-2 h-2" /> Website
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Error Item Component
function ErrorItem({ error }: { error: ExtractionError }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-2 rounded-lg text-xs sm:text-sm flex items-start gap-2 ${
        error.type === "error" ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"
      }`}
    >
      {error.type === "error" ? (
        <XCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
      ) : (
        <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
      )}
      <div className="flex-1 min-w-0">
        <p className="truncate">{error.message}</p>
      </div>
    </motion.div>
  )
}

// Layer Status Component - Responsive
function LayerStatus({ layer, compact = false }: { layer: ExtractionLayer; compact?: boolean }) {
  const getStatusColor = () => {
    switch (layer.status) {
      case "active": return "text-primary bg-primary/20 border-primary/30"
      case "completed": return "text-green-500 bg-green-500/20 border-green-500/30"
      case "error": return "text-red-500 bg-red-500/20 border-red-500/30"
      default: return "text-neutral-400 bg-white/[0.04] border-orange-500/15"
    }
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 p-2 rounded-lg border ${getStatusColor()}`}>
        <div className="flex-shrink-0">
          {layer.status === "active" ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              {layer.icon}
            </motion.div>
          ) : layer.status === "completed" ? (
            <Check className="w-3 h-3" />
          ) : (
            layer.icon
          )}
        </div>
        <span className="text-[10px] sm:text-xs font-medium truncate">{layer.name}</span>
        {layer.status === "active" && (
          <span className="text-[10px] ml-auto">{layer.progress}%</span>
        )}
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border ${getStatusColor()}`}>
      <div className="flex-shrink-0">
        {layer.status === "active" ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          >
            {layer.icon}
          </motion.div>
        ) : layer.status === "completed" ? (
          <Check className="w-3 h-3 sm:w-4 sm:h-4" />
        ) : layer.status === "error" ? (
          <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
        ) : (
          layer.icon
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-medium truncate">{layer.name}</span>
          {layer.status === "active" && (
            <span className="text-[10px] sm:text-xs ml-2">{layer.progress}%</span>
          )}
        </div>
        <p className="text-[10px] sm:text-xs opacity-70 truncate hidden sm:block">{layer.description}</p>
        {layer.status === "active" && (
          <div className="h-1 bg-black/10 rounded-full mt-1 overflow-hidden">
            <motion.div
              className="h-full bg-current rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${layer.progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Result Card Component - Responsive
function ResultCard({
  result,
  onCopyEmail,
  index,
  compact = false,
  selected = false,
  onToggleSelect
}: {
  result: ExtractionResult
  onCopyEmail: (email: string) => void
  index: number
  compact?: boolean
  selected?: boolean
  onToggleSelect?: (index: number) => void
}) {
  const [expanded, setExpanded] = useState(false)

  const hasEmails = !!(result.contact_email || result.marketing_email || result.sales_email)
  const hasLeadership = result.people?.some(p => p.role === "leadership")

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="bg-[#080808] border border-orange-500/15 rounded-lg p-2 sm:p-3"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-xs sm:text-sm text-white truncate">{result.company_name}</h3>
            {result.app_or_product && (
              <p className="text-[10px] sm:text-xs text-neutral-400 truncate">{result.app_or_product}</p>
            )}
          </div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${
            result.confidence_score >= 80 ? "bg-green-500/20 text-green-500" :
            result.confidence_score >= 50 ? "bg-amber-500/20 text-amber-500" :
            "bg-[#111] text-neutral-400"
          }`}>
            {result.confidence_score}%
          </span>
        </div>
        {(result.marketing_email || result.sales_email) && (
          <button
            onClick={() => onCopyEmail(result.marketing_email || result.sales_email!)}
            className="mt-2 text-[10px] sm:text-xs text-primary truncate w-full text-left hover:underline flex items-center gap-1"
          >
            <Mail className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{result.marketing_email || result.sales_email}</span>
          </button>
        )}
        {result.company_phones && result.company_phones[0] && (
          <a href={`tel:${result.company_phones[0]}`} className="mt-1 text-[10px] sm:text-xs text-orange-400 truncate w-full text-left flex items-center gap-1">
            <Phone className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{result.company_phones[0]}</span>
          </a>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={`bg-[#080808] border rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-lg transition-all relative ${selected ? "border-primary/60 bg-primary/5" : "border-orange-500/15 hover:border-primary/30"}`}
    >
      {/* Selection Checkbox */}
      {onToggleSelect && (
        <div className="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(index)}
            className="w-4 h-4 rounded border-orange-500/20 bg-[#111] text-primary focus:ring-primary cursor-pointer accent-current"
          />
        </div>
      )}
      {/* Header */}
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium sm:font-semibold text-sm sm:text-base text-white truncate">{result.company_name}</h3>
          {result.app_or_product && (
            <p className="text-xs sm:text-sm text-neutral-400 truncate mt-0.5">
              <Smartphone className="w-3 h-3 inline mr-1" />
              {result.app_or_product}
            </p>
          )}
        </div>
        <div className={`
          px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium flex-shrink-0
          ${result.confidence_score >= 80 ? "bg-green-500/20 text-green-500" :
            result.confidence_score >= 50 ? "bg-amber-500/20 text-amber-500" :
            "bg-[#111] text-neutral-400"}
        `}>
          {result.confidence_score}%
        </div>
      </div>

      {/* Category & Location */}
      <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 sm:mt-3">
        {result.product_category && (
          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-primary/10 text-primary text-[10px] sm:text-xs rounded-full">
            {result.product_category}
          </span>
        )}
        {result.demographic && (
          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[#111] text-neutral-400 text-[10px] sm:text-xs rounded-full flex items-center gap-1">
            <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            {result.demographic.toUpperCase()}
          </span>
        )}
        {result.company_industry && (
          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-500/10 text-amber-400 text-[10px] sm:text-xs rounded-full flex items-center gap-1">
            <Briefcase className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            {result.company_industry}
          </span>
        )}
        {result.company_size && (
          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-cyan-500/10 text-orange-400 text-[10px] sm:text-xs rounded-full flex items-center gap-1">
            <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            {result.company_size}
          </span>
        )}
        {result.company_location && (
          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[#111] text-neutral-400 text-[10px] sm:text-xs rounded-full flex items-center gap-1">
            <Building className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            {result.company_location}
          </span>
        )}
      </div>

      {/* Description - Hidden on mobile */}
      {result.company_description && (
        <p className="text-xs text-neutral-400 mt-2 sm:mt-3 line-clamp-2 hidden sm:block">
          {result.company_description}
        </p>
      )}

      {/* Emails with Verification Status */}
      {hasEmails && (
        <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
          {/* Verification Status Badge */}
          {result.email_verification_status && (
            <div className={`flex items-center gap-1.5 text-[10px] sm:text-xs px-2 py-1 rounded-full w-fit ${
              result.email_verification_status === "verified"
                ? "bg-green-500/20 text-green-500"
                : result.email_verification_status === "maybe"
                  ? "bg-amber-500/20 text-amber-500"
                  : "bg-red-500/20 text-red-500"
            }`}>
              {result.email_verification_status === "verified" ? (
                <><CheckCircle className="w-3 h-3" /> Verified</>
              ) : result.email_verification_status === "maybe" ? (
                <><AlertCircle className="w-3 h-3" /> Maybe</>
              ) : (
                <><XCircle className="w-3 h-3" /> Not Verified</>
              )}
              {result.email_verification_confidence !== undefined && (
                <span className="ml-1 opacity-70">({result.email_verification_confidence}%)</span>
              )}
            </div>
          )}
          {result.marketing_email && (
            <div className="flex items-center justify-between gap-2 p-1.5 sm:p-2 bg-primary/5 rounded-lg group">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                <Megaphone className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                <span className="text-xs sm:text-sm truncate">{result.marketing_email}</span>
              </div>
              <button
                onClick={() => onCopyEmail(result.marketing_email!)}
                className="p-1 hover:bg-primary/20 rounded transition-colors"
              >
                <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-400" />
              </button>
            </div>
          )}
          {result.sales_email && (
            <div className="flex items-center justify-between gap-2 p-1.5 sm:p-2 bg-green-500/5 rounded-lg group">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm truncate">{result.sales_email}</span>
              </div>
              <button
                onClick={() => onCopyEmail(result.sales_email!)}
                className="p-1 hover:bg-green-500/20 rounded transition-colors"
              >
                <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-400" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Phones */}
      {result.company_phones && result.company_phones.length > 0 && (
        <div className="mt-3 sm:mt-4 space-y-1.5">
          {result.company_phones.map((phone, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2 p-1.5 sm:p-2 bg-orange-500/5 rounded-lg">
              <a href={`tel:${phone}`} className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 hover:underline">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-orange-400 truncate">{phone}</span>
              </a>
              <button
                onClick={() => { navigator.clipboard.writeText(phone); Toast.success("Phone copied!") }}
                className="p-1 hover:bg-orange-500/20 rounded transition-colors"
              >
                <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Links - Responsive */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4">
        {result.company_website && (
          <a
            href={result.company_website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[#111] text-[10px] sm:text-xs rounded-full hover:bg-[#111]/80 transition-colors"
          >
            <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="hidden xs:inline">Website</span>
          </a>
        )}
        {result.playstore_url && (
          <a
            href={result.playstore_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-500/10 text-green-500 text-[10px] sm:text-xs rounded-full hover:bg-green-500/20 transition-colors"
          >
            <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="hidden xs:inline">Play</span>
          </a>
        )}
        {result.company_linkedin && (
          <a
            href={result.company_linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-orange-500/20/10 text-orange-500 text-[10px] sm:text-xs rounded-full hover:bg-orange-500/20/20 transition-colors"
          >
            <Linkedin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="hidden xs:inline">LinkedIn</span>
          </a>
        )}
      </div>

      {/* People (Expandable) */}
      {result.people && result.people.length > 0 && (
        <div className="mt-3 sm:mt-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-xs sm:text-sm text-neutral-400 hover:text-white transition-colors w-full"
          >
            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>
              {hasLeadership && <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 inline text-amber-500 mr-1" />}
              {result.people.length} contact{result.people.length > 1 ? "s" : ""}
            </span>
            <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 ml-auto transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-1.5 sm:space-y-2">
                  {result.people.slice(0, 5).map((person, idx) => (
                    <div key={idx} className={`p-1.5 sm:p-2 rounded-lg ${
                      person.role === "leadership" ? "bg-amber-500/10" : "bg-[#111]/30"
                    }`}>
                      <div className="flex items-center gap-2">
                        {person.role === "leadership" ? (
                          <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />
                        ) : (
                          <Users className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-400" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-medium truncate">{person.name}</p>
                          {person.title && (
                            <p className="text-[10px] sm:text-xs text-neutral-400 truncate">{person.title}</p>
                          )}
                        </div>
                      </div>
                      {person.emails && person.emails.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {person.emails.slice(0, 2).map((email, eidx) => (
                            <button
                              key={eidx}
                              onClick={() => onCopyEmail(email)}
                              className="text-[10px] sm:text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              <Mail className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              <span className="truncate max-w-[150px]">{email}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {person.phone && (
                        <a href={`tel:${person.phone}`} className="text-[10px] text-orange-400 flex items-center gap-1 mt-1">
                          <Phone className="w-2.5 h-2.5" /> {person.phone}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Data Sources */}
      <div className="flex flex-wrap items-center gap-1 mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-orange-500/15">
        <span className="text-[10px] sm:text-xs text-neutral-400 mr-1">Sources:</span>
        {result.data_sources.slice(0, 3).map((source, idx) => (
          <span key={idx} className="text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 bg-[#111] rounded">
            {source.replace(/_/g, " ").replace("osint ", "").slice(0, 12)}
          </span>
        ))}
        {result.data_sources.length > 3 && (
          <span className="text-[8px] sm:text-[10px] text-neutral-400">+{result.data_sources.length - 3}</span>
        )}
      </div>
    </motion.div>
  )
}

// Props interface for embedded use
export interface MobiAdzExtractionContentProps {
  onRecipientsSelected?: (recipients: CampaignRecipient[], count: number) => void
  initialJobId?: string
  onJobCreated?: (jobId: string) => void
}

// Normalize results: ensure person.emails is always an array (backend sends email or emails)
function normalizeResults(raw: unknown[]): ExtractionResult[] {
  return (raw as ExtractionResult[]).map(r => ({
    ...r,
    people: (r.people || []).map((p: PersonData) => ({
      ...p,
      emails: p.emails ?? (p.email ? [p.email] : []),
    })),
  }))
}

// Main Content Component - can be used embedded or standalone
export function MobiAdzExtractionContent(props?: MobiAdzExtractionContentProps) {
  const onRecipientsSelected = props?.onRecipientsSelected
  const initialJobId = props?.initialJobId
  const onJobCreated = props?.onJobCreated
  // State
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [selectedDemographics, setSelectedDemographics] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [extractionMode, setExtractionMode] = useState<"free" | "paid">("free")
  const [currentJob, setCurrentJob] = useState<ExtractionJob | null>(null)
  const [results, setResults] = useState<ExtractionResult[]>([])
  const recipientsPushedRef = useRef(false)
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")
  const [searchQuery, setSearchQuery] = useState("")
  const [isExtracting, setIsExtracting] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Live feed state
  const [liveContacts, setLiveContacts] = useState<LiveContact[]>([])
  const [errors, setErrors] = useState<ExtractionError[]>([])
  const [layers, setLayers] = useState<ExtractionLayer[]>(INITIAL_LAYERS)
  const [feedSize, setFeedSize] = useState<"collapsed" | "small" | "medium" | "large">("medium")
  const [showMobileFeed, setShowMobileFeed] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const liveContactsRef = useRef<HTMLDivElement>(null)
  const pollAbortRef = useRef<boolean>(false)
  const pollTimerRef = useRef<number | null>(null)

  // Job history state
  const [jobHistory, setJobHistory] = useState<JobHistoryItem[]>([])
  const [showJobHistory, setShowJobHistory] = useState(false)
  const [selectedHistoryJob, setSelectedHistoryJob] = useState<string | null>(null)
  const [loadingRerun, setLoadingRerun] = useState<string | null>(null)
  const [exportingToRecipients, setExportingToRecipients] = useState(false)
  const [exportingFormat, setExportingFormat] = useState<string | null>(null)
  const [selectedContacts, setSelectedContacts] = useState<Set<number>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    verificationStatus: "" as "" | "verified" | "maybe" | "not_verified",
    minConfidence: 0,
    maxConfidence: 100,
    hasEmail: false,
    hasPhone: false,
    demographic: "",
    category: "",
  })
  const [sortField, setSortField] = useState<"default" | "confidence_score" | "company_name" | "email_count">("default")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Configuration - now with configurable target
  const [config, setConfig] = useState({
    maxCompanies: 200,
    maxAppsPerCategory: 100,
    websiteScrapeDepth: 7,
    hunterApiKey: "",
    clearbitApiKey: "",
    apolloApiKey: "",
    targetContacts: 1000,  // Configurable from 100 to 5000
    maxPerProduct: 5,
    enableDeepOsint: true,
    enableEmailVerification: true,
    enableSocialScraping: true
  })

  useEffect(() => {
    if (!onRecipientsSelected) return

    if (results.length === 0) {
      recipientsPushedRef.current = false
      return
    }

    if (recipientsPushedRef.current) return

    const mappedRecipients: CampaignRecipient[] = results
      .map((r) => ({
        email: r.marketing_email || r.sales_email || r.contact_email || "",
        name: r.people?.[0]?.name || r.company_name,
        company: r.company_name,
        position: r.people?.[0]?.title || r.people?.[0]?.role,
        linkedinUrl: r.company_linkedin || r.people?.[0]?.linkedin,
        website: r.company_website || r.playstore_url || r.appstore_url || undefined,
      }))

    if (mappedRecipients.length === 0) return

    recipientsPushedRef.current = true
    onRecipientsSelected(mappedRecipients, mappedRecipients.length)
  }, [results, onRecipientsSelected])

  // Toggle demographic selection
  const toggleDemographic = (value: string) => {
    setSelectedDemographics(prev =>
      prev.includes(value)
        ? prev.filter(d => d !== value)
        : [...prev, value]
    )
  }

  // Toggle category selection
  const toggleCategory = (value: string) => {
    setSelectedCategories(prev =>
      prev.includes(value)
        ? prev.filter(c => c !== value)
        : [...prev, value]
    )
  }

  // Add live contact
  const addLiveContact = useCallback((contact: Omit<LiveContact, "id" | "timestamp">) => {
    const newContact: LiveContact = {
      ...contact,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    }
    setLiveContacts(prev => [newContact, ...prev].slice(0, 100))
  }, [])

  // Add error
  const addError = useCallback((message: string, type: "warning" | "error", source?: string) => {
    const newError: ExtractionError = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      message,
      type,
      source
    }
    setErrors(prev => [newError, ...prev].slice(0, 50))
  }, [])

  // Update layer status
  const updateLayer = useCallback((layerId: string, updates: Partial<ExtractionLayer>) => {
    setLayers(prev => prev.map(l => l.id === layerId ? { ...l, ...updates } : l))
  }, [])

  // Simulate extraction progress with live updates
  const simulateLiveUpdates = useCallback((job: ExtractionJob) => {
    const stage = job.progress.stage
    const progress = job.progress.stage_progress

    if (stage === "discovery") {
      updateLayer("discovery", { status: "active", progress })
    } else if (stage === "app_scraping" || stage === "company_scraping") {
      updateLayer("discovery", { status: "completed", progress: 100 })
      updateLayer("web_scraping", { status: "active", progress })
    } else if (stage === "contact_finding") {
      updateLayer("web_scraping", { status: "completed", progress: 100 })
      updateLayer("ml_nlp", { status: "active", progress: Math.min(progress, 50) })
      updateLayer("data_structures", { status: "active", progress: Math.min(progress, 60) })
      updateLayer("osint", { status: "active", progress: Math.min(progress - 50, 100) })
    } else if (stage === "web_search") {
      // Web search stage after OSINT
      updateLayer("web_scraping", { status: "completed", progress: 100 })
      updateLayer("ml_nlp", { status: "completed", progress: 100 })
      updateLayer("data_structures", { status: "completed", progress: 100 })
      updateLayer("osint", { status: "completed", progress: 100 })
      updateLayer("web_search", { status: "active", progress, description: "DuckDuckGo, Bing, SearX" })
    } else if (stage === "enrichment") {
      updateLayer("ml_nlp", { status: "completed", progress: 100 })
      updateLayer("data_structures", { status: "completed", progress: 100 })
      updateLayer("osint", { status: "completed", progress: 100 })
      updateLayer("web_search", { status: "completed", progress: 100 })
      updateLayer("email_intel", { status: "active", progress })
      updateLayer("social", { status: "active", progress: Math.max(progress - 20, 0) })
      updateLayer("enrichment", { status: "active", progress })
    } else if (stage === "complete") {
      setLayers(prev => prev.map(l => ({ ...l, status: "completed", progress: 100 })))
    }
  }, [updateLayer])

  // Cancel extraction
  const cancelExtraction = async () => {
    if (!currentJob) return

    if (!window.confirm("Are you sure you want to cancel this extraction? This cannot be undone.")) return

    setIsCancelling(true)
    pollAbortRef.current = true
    // Clear any pending poll timer
    if (pollTimerRef.current !== null) {
      clearTimeout(pollTimerRef.current)
      pollTimerRef.current = null
    }

    try {
      await mobeAdzAPI.cancelJob(currentJob.job_id)
      Toast.success("Extraction cancelled")
    } catch (error) {
      Toast.error("Failed to cancel extraction")
    } finally {
      setIsExtracting(false)
      setIsCancelling(false)
      pollAbortRef.current = false
    }
  }

  // Fetch job history
  const fetchJobHistory = async () => {
    try {
      const { data } = await mobeAdzAPI.getJobs()
      setJobHistory(data.jobs || [])
    } catch (error) {
      console.error("Failed to fetch job history:", error)
    }
  }

  // Rerun job with same settings
  const rerunJob = async (jobId: string, mode: "same" | "same_exclude_found" | "new") => {
    setLoadingRerun(`${jobId}-${mode}`)
    try {
      const { data } = await mobeAdzAPI.rerunJob(jobId, { mode })
      setCurrentJob(data as ExtractionJob)
      onJobCreated?.(data.job_id)
      setStep(4)
      setIsExtracting(true)
      setShowJobHistory(false)
      setLiveContacts([])
      setResults([])
      setLayers(INITIAL_LAYERS)
      pollAbortRef.current = false
      pollJobStatus(data.job_id)
      Toast.success(mode === "same_exclude_found"
        ? "Rerunning extraction (excluding previous contacts)"
        : mode === "new"
        ? "Starting new extraction with fresh settings"
        : "Rerunning extraction with same settings")
    } catch (error: any) {
      Toast.error(error?.response?.data?.detail || "Failed to rerun job")
    } finally {
      setLoadingRerun(null)
    }
  }

  // Load a completed job's results
  const loadJobResults = async (jobId: string) => {
    try {
      // Fetch job details
      const { data: job } = await mobeAdzAPI.getJobStatus(jobId)
      setCurrentJob(job as ExtractionJob)

      // Fetch results
      // TODO: implement pagination for large result sets
      const { data: jobResults } = await mobeAdzAPI.getJobResults(jobId, { limit: 100 })
      setResults(normalizeResults(jobResults as unknown[]))

      setStep(4)
      setIsExtracting(false)
      setShowJobHistory(false)
      Toast.success(`Loaded ${job.results_count} results from previous extraction`)
    } catch (error) {
      Toast.error("Failed to load job results")
    }
  }

  // Delete a job from history (permanently removes from database)
  const deleteJob = async (jobId: string) => {
    if (!window.confirm("Delete this job permanently? All results will be lost.")) return
    try {
      await mobeAdzAPI.deleteJob(jobId)
      setJobHistory(prev => prev.filter(j => j.job_id !== jobId))
      Toast.success("Job deleted")
    } catch (error) {
      Toast.error("Failed to delete job")
    }
  }

  // Load job history on mount
  useEffect(() => {
    fetchJobHistory()
  }, [])

  // Resume a specific job passed in via props
  useEffect(() => {
    const jobId = initialJobId
    if (!jobId) return

    const loadJob = async () => {
      try {
        const { data: job } = await mobeAdzAPI.getJobStatus(jobId)
        setCurrentJob(job as ExtractionJob)
        setStep(4)
        setShowJobHistory(false)

        if (job.results_count > 0) {
          // TODO: implement pagination for large result sets
          const { data: jobResults } = await mobeAdzAPI.getJobResults(jobId, { limit: 100 })
          setResults(normalizeResults(jobResults as unknown[]))
        }

        if (job.status === "running" || job.status === "pending") {
          setIsExtracting(true)
          pollAbortRef.current = false
          pollJobStatus(jobId)
        } else {
          setIsExtracting(false)
        }
      } catch (error) {
        console.error("[MobiAdz] Failed to resume job", error)
      }
    }

    loadJob()
  }, [initialJobId])

  // Cleanup on unmount - stop polling and clear timers
  useEffect(() => {
    return () => {
      pollAbortRef.current = true
      if (pollTimerRef.current !== null) {
        clearTimeout(pollTimerRef.current)
        pollTimerRef.current = null
      }
    }
  }, [])

  // Check for existing running jobs on mount
  useEffect(() => {
    if (initialJobId) return

    const checkExistingJobs = async () => {
      try {
        const { data } = await mobeAdzAPI.getJobs()
        const runningJob = data.jobs?.find((j) => j.status === "running")

        if (runningJob) {
          console.log("[MobiAdz] Found running job, resuming:", runningJob.job_id)

          // Fetch full job details
          const { data: job } = await mobeAdzAPI.getJobStatus(runningJob.job_id)
          setCurrentJob(job as ExtractionJob)
          setStep(4)
          setIsExtracting(true)

          // Fetch existing results
          if (runningJob.results_count > 0) {
            const { data: jobResults } = await mobeAdzAPI.getJobResults(runningJob.job_id, { page: 1, limit: 500 })
            setResults(normalizeResults(jobResults as unknown[]))
          }

          // Resume polling
          pollAbortRef.current = false
          pollJobStatus(runningJob.job_id)

          Toast.info(`Resuming extraction job at ${runningJob.progress}%`)
        }
      } catch (error) {
        console.error("[MobiAdz] Error checking existing jobs:", error)
      }
    }

    checkExistingJobs()
  }, [initialJobId])

  // Start extraction
  const startExtraction = async () => {
    if (selectedDemographics.length === 0 || selectedCategories.length === 0) {
      Toast.error("Please select at least one demographic and one category")
      return
    }

    pollAbortRef.current = false
    setIsExtracting(true)
    setIsCancelling(false)
    setStep(4)
    setLiveContacts([])
    setErrors([])
    setLayers(INITIAL_LAYERS)
    setResults([])

    try {
      const { data: job } = await mobeAdzAPI.startExtraction({
        demographics: selectedDemographics,
        categories: selectedCategories,
        use_paid_apis: extractionMode === "paid",
        max_companies: config.maxCompanies,
        max_apps_per_category: config.maxAppsPerCategory,
        website_scrape_depth: config.websiteScrapeDepth,
        target_contacts: config.targetContacts,
        hunter_api_key: extractionMode === "paid" ? config.hunterApiKey : undefined,
        clearbit_api_key: extractionMode === "paid" ? config.clearbitApiKey : undefined,
        apollo_api_key: extractionMode === "paid" ? config.apolloApiKey : undefined
      })

      setCurrentJob(job as ExtractionJob)
      onJobCreated?.(job.job_id)

      // Poll for updates
      pollJobStatus(job.job_id)

    } catch (error) {
      Toast.error("Failed to start extraction. Make sure the backend is running.")
      addError("Failed to start extraction job", "error", "API")
      setIsExtracting(false)
    }
  }

  // Poll job status
  const pollJobStatus = async (jobId: string) => {
    // Clear any existing poll timer before starting new poll cycle
    if (pollTimerRef.current !== null) {
      clearTimeout(pollTimerRef.current)
      pollTimerRef.current = null
    }
    pollAbortRef.current = false

    let lastResultsCount = 0
    let continuousSearchMode = false

    const poll = async () => {
      // Check if polling should be aborted
      if (pollAbortRef.current) {
        return
      }

      try {
        const { data: job } = await mobeAdzAPI.getJobStatus(jobId)
        // Re-check abort after async - component may have unmounted during await
        if (pollAbortRef.current) return
        const typedJob = job as ExtractionJob
        setCurrentJob(typedJob)
        simulateLiveUpdates(typedJob)

        // Update live contacts from API response
        if (typedJob.live_contacts && typedJob.live_contacts.length > 0) {
          const apiContacts: LiveContact[] = typedJob.live_contacts.map(lc => ({
            id: lc.id,
            timestamp: new Date(lc.timestamp),
            company_name: lc.company_name,
            app_or_product: lc.app_or_product,
            email: lc.email,
            phone: lc.phone,
            person_name: lc.person_name,
            type: lc.type,
            source: lc.source,
            confidence: lc.confidence,
            playstore_url: lc.playstore_url,
            website: lc.website
          }))
          // Reverse so newest are first
          setLiveContacts(apiContacts.reverse())
        }

        // Fetch new results incrementally
        if (typedJob.results_count > lastResultsCount) {
          try {
            const { data: resultsData } = await mobeAdzAPI.getJobResults(jobId, { page: 1, limit: 500 })
            if (pollAbortRef.current) return
            setResults(normalizeResults(resultsData as unknown[]))
            lastResultsCount = typedJob.results_count
          } catch (e) {
            // Ignore results fetch errors
          }
        }

        if (typedJob.status === "completed") {
          const totalContacts = typedJob.results_count

          if (totalContacts < config.targetContacts && !continuousSearchMode) {
            continuousSearchMode = true
            addError(`Found ${totalContacts} contacts, target is ${config.targetContacts}. Consider running another extraction.`, "warning", "Target")
          }

          setIsExtracting(false)
          Toast.success(`Extraction complete! Found ${typedJob.results_count} companies`)

          try {
            // TODO: implement pagination for large result sets
            const { data: finalData } = await mobeAdzAPI.getJobResults(jobId, { limit: 100 })
            if (!pollAbortRef.current) {
              setResults(normalizeResults(finalData as unknown[]))
            }
          } catch (e) {
            // Final results fetch failed, keep existing results
          }

        } else if (typedJob.status === "failed") {
          setIsExtracting(false)
          // Try to fetch partial results from failed job
          try {
            // TODO: implement pagination for large result sets
            const { data: partialData } = await mobeAdzAPI.getJobResults(jobId, { limit: 100 })
            if (partialData && partialData.length > 0 && !pollAbortRef.current) {
              setResults(normalizeResults(partialData as unknown[]))
              Toast.error(`Extraction failed but recovered ${partialData.length} partial results`)
            } else {
              Toast.error("Extraction failed")
            }
          } catch {
            Toast.error("Extraction failed")
          }
          addError("Extraction failed", "error", "System")
        } else if (typedJob.status === "running" || typedJob.status === "pending") {
          if (!pollAbortRef.current) {
            pollTimerRef.current = window.setTimeout(poll, 1500)
          }
        } else if (typedJob.status === "cancelled") {
          setIsExtracting(false)
          Toast.success("Extraction was cancelled")
        }
      } catch (error) {
        if (!pollAbortRef.current) {
          addError("Lost connection to extraction service", "warning", "Network")
          pollTimerRef.current = window.setTimeout(poll, 3000)
        }
      }
    }

    poll()
  }

  // Copy email
  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email)
    Toast.success("Email copied!")
  }

  const toggleContactSelection = useCallback((index: number) => {
    setSelectedContacts(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }, [])

  useEffect(() => { setSelectedContacts(new Set()) }, [results])

  // Filter results (memoized to avoid re-computation on every render)
  const filteredResults = useMemo(() => results.filter(r => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!(
        r.company_name?.toLowerCase().includes(query) ||
        r.app_or_product?.toLowerCase().includes(query) ||
        r.contact_email?.toLowerCase().includes(query) ||
        r.marketing_email?.toLowerCase().includes(query) ||
        r.sales_email?.toLowerCase().includes(query) ||
        r.people?.some(p => p.name?.toLowerCase().includes(query))
      )) return false
    }
    // Advanced filters
    if (filters.verificationStatus && r.email_verification_status !== filters.verificationStatus) return false
    if (r.confidence_score < filters.minConfidence || r.confidence_score > filters.maxConfidence) return false
    if (filters.hasEmail && !(r.contact_email || r.marketing_email || r.sales_email)) return false
    if (filters.hasPhone && !(r.company_phones?.length)) return false
    if (filters.demographic && r.demographic !== filters.demographic) return false
    if (filters.category && r.product_category !== filters.category) return false
    return true
  }), [results, searchQuery, filters])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.verificationStatus) count++
    if (filters.minConfidence > 0 || filters.maxConfidence < 100) count++
    if (filters.hasEmail) count++
    if (filters.hasPhone) count++
    if (filters.demographic) count++
    if (filters.category) count++
    return count
  }, [filters])

  const sortedResults = useMemo(() => {
    if (sortField === "default") return filteredResults
    return [...filteredResults].sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case "confidence_score": cmp = (a.confidence_score || 0) - (b.confidence_score || 0); break
        case "company_name": cmp = (a.company_name || "").localeCompare(b.company_name || ""); break
        case "email_count": {
          const countEmails = (r: ExtractionResult) => [r.contact_email, r.marketing_email, r.sales_email, r.support_email, r.press_email].filter(Boolean).length
          cmp = countEmails(a) - countEmails(b); break
        }
      }
      return sortDirection === "desc" ? -cmp : cmp
    })
  }, [filteredResults, sortField, sortDirection])

  const toggleSelectAll = useCallback(() => {
    setSelectedContacts(prev => {
      if (prev.size === sortedResults.length) return new Set()
      return new Set(sortedResults.map((_: ExtractionResult, i: number) => i))
    })
  }, [sortedResults])

  // Virtual scrolling for large result sets
  const tableParentRef = useRef<HTMLDivElement>(null)
  const gridParentRef = useRef<HTMLDivElement>(null)

  const tableVirtualizer = useVirtualizer({
    count: sortedResults.length,
    getScrollElement: () => tableParentRef.current,
    estimateSize: () => 56,
    overscan: 10,
  })

  const gridVirtualizer = useVirtualizer({
    count: sortedResults.length,
    getScrollElement: () => gridParentRef.current,
    estimateSize: () => 220,
    overscan: 6,
  })

  // Export results
  const exportResults = async (format: "csv" | "json") => {
    setExportingFormat(format)
    try {
      const dataToExport = selectedContacts.size > 0
        ? Array.from(selectedContacts).sort((a, b) => a - b).map(i => sortedResults[i]).filter(Boolean)
        : null

      if (dataToExport) {
        // Client-side export of selected contacts
        let blob: Blob
        if (format === "csv") {
          const headers = Object.keys(dataToExport[0] || {})
          const csvContent = [
            headers.join(","),
            ...dataToExport.map(r => headers.map(h => {
              const val = (r as any)[h]
              if (Array.isArray(val)) return JSON.stringify(val.join("; "))
              if (typeof val === "object" && val !== null) return JSON.stringify(JSON.stringify(val))
              return JSON.stringify(val ?? "")
            }).join(","))
          ].join("\n")
          blob = new Blob([csvContent], { type: "text/csv" })
        } else {
          blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" })
        }
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `extraction-selected-${dataToExport.length}.${format}`
        a.click()
        URL.revokeObjectURL(url)
        Toast.success(`Exported ${dataToExport.length} selected as ${format.toUpperCase()}`)
      } else {
        // Full API export
        if (!currentJob) return
        const { data } = await mobeAdzAPI.exportResults(currentJob.job_id, format)
        if (format === "csv") {
          const blob = new Blob([data.content || ""], { type: "text/csv" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `extraction-${currentJob.job_id}.csv`
          a.click()
          URL.revokeObjectURL(url)
        } else {
          const blob = new Blob([JSON.stringify(data.results, null, 2)], { type: "application/json" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `extraction-${currentJob.job_id}.json`
          a.click()
          URL.revokeObjectURL(url)
        }
        Toast.success(`Exported as ${format.toUpperCase()}`)
      }
    } catch (error) {
      Toast.error("Export failed")
    } finally {
      setExportingFormat(null)
    }
  }

  // Export results to Recipients
  const exportToRecipients = async () => {
    const sourceResults = selectedContacts.size > 0
      ? Array.from(selectedContacts).sort((a, b) => a - b).map(i => sortedResults[i]).filter(Boolean)
      : results
    if (!sourceResults || sourceResults.length === 0) {
      Toast.error("No results to export")
      return
    }

    setExportingToRecipients(true)
    try {
      // Transform results to recipient format
      const recipientData = sourceResults
        .filter(r => r.marketing_email || r.sales_email || r.contact_email)
        .map(r => ({
          email: (r.marketing_email || r.sales_email || r.contact_email) as string,
          name: r.people?.[0]?.name || r.company_name,
          company: r.company_name,
          position: r.people?.[0]?.title || r.people?.[0]?.role || undefined,
          country: r.demographic || undefined,
          source: "themobiadz",
          tags: [r.product_category, "mobiadz"].filter(Boolean).join(","),
          custom_fields: {
            app_or_product: r.app_or_product,
            company_website: r.company_website,
            company_linkedin: r.company_linkedin,
            playstore_url: r.playstore_url,
            appstore_url: r.appstore_url,
            confidence_score: r.confidence_score,
            data_sources: r.data_sources
          }
        }))

      if (recipientData.length === 0) {
        Toast.error("No contacts with emails found")
        return
      }

      // Call bulk import API (auth token added automatically by apiClient interceptor)
      const { data } = await mobeAdzAPI.exportToRecipients(recipientData, {
        skip_duplicates: true,
        create_group: true,
        group_name: `Extraction Import - ${new Date().toLocaleDateString()}`
      })

      Toast.success(`Exported ${data.created} contacts to Recipients! (${data.skipped} duplicates skipped)`)

      // If a group was created, fetch its recipients and return to Step 1
      if (data.group_id && onRecipientsSelected) {
        try {
          const { data: groupData } = await mobeAdzAPI.getRecipientGroupMembers(data.group_id, { page: 1, page_size: 500 })
          const items = groupData.items || groupData.recipients || []
          const mapped = items.map((r: any) => ({
            id: r.id,
            email: r.email,
            name: r.name || undefined,
            company: r.company || undefined,
            position: r.position || undefined,
            linkedinUrl: r.custom_fields?.linkedin_url,
          })) as CampaignRecipient[]
          if (mapped.length > 0) {
            onRecipientsSelected(mapped, mapped.length)
          }
        } catch (e) {
          console.error('Failed to fetch imported group recipients', e)
        }
      }
    } catch (error: any) {
      console.error("Export to recipients error:", error)
      Toast.error(error?.response?.data?.detail || "Failed to export to recipients")
    } finally {
      setExportingToRecipients(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Header - Responsive */}
      <div className="border-b border-orange-500/10 bg-[#080808]/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-3 sm:px-4 py-2 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Logo & Title */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-primary via-accent to-amber-500 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                <Smartphone className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-xl font-bold text-white flex items-center gap-1 sm:gap-2 truncate">
                  <span className="hidden xs:inline">Extraction Engine</span>
                  <span className="xs:hidden">Extract</span>
                  <span className="text-[8px] sm:text-xs px-1 sm:px-2 py-0.5 bg-gradient-to-r from-primary to-accent text-white rounded-full">
                    ULTRA
                  </span>
                </h1>
                <p className="text-[10px] sm:text-sm text-neutral-400 hidden sm:block">AI-Powered Company Discovery</p>
              </div>
            </div>

            {/* Step Indicator - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              {[
                { num: 1, label: "Region" },
                { num: 2, label: "Category" },
                { num: 3, label: "Mode" },
                { num: 4, label: "Extract" }
              ].map((s) => (
                <div key={s.num} className="flex items-center gap-1">
                  <div
                    className={`
                      flex items-center justify-center w-6 h-6 lg:w-8 lg:h-8 rounded-full text-xs lg:text-sm font-medium transition-all
                      ${step >= s.num
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                        : "bg-[#111] text-neutral-400"
                      }
                    `}
                  >
                    {step > s.num ? <Check className="w-3 h-3 lg:w-4 lg:h-4" /> : s.num}
                  </div>
                  <span className={`text-xs hidden lg:block ${step >= s.num ? "text-white" : "text-neutral-400"}`}>
                    {s.label}
                  </span>
                  {s.num < 4 && <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4 text-neutral-400" />}
                </div>
              ))}
            </div>

            {/* Step Indicator - Mobile */}
            <div className="flex md:hidden items-center gap-1">
              {[1, 2, 3, 4].map((num) => (
                <div
                  key={num}
                  className={`w-2 h-2 rounded-full transition-all ${
                    step >= num ? "bg-primary" : "bg-[#111]"
                  }`}
                />
              ))}
              <span className="text-xs text-neutral-400 ml-1">Step {step}/4</span>
            </div>

            {/* History Button */}
            <button
              onClick={() => {
                fetchJobHistory()
                setShowJobHistory(true)
              }}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-[#111] hover:bg-[#111]/80 rounded-lg text-xs sm:text-sm font-medium transition-colors"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
              {jobHistory.length > 0 && (
                <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[10px] rounded-full">
                  {jobHistory.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Job History Sidebar/Modal */}
      <AnimatePresence>
        {showJobHistory && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowJobHistory(false)}
            />
            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] lg:w-[500px] bg-[#080808] border-l border-orange-500/15 z-50 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-orange-500/15 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    Extraction History
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    {jobHistory.length} previous extraction{jobHistory.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => setShowJobHistory(false)}
                  className="p-2 hover:bg-[#111] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Job List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {jobHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <FolderOpen className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                    <p className="text-neutral-400">No extraction history yet</p>
                    <p className="text-xs text-neutral-400 mt-1">Start an extraction to see it here</p>
                  </div>
                ) : (
                  jobHistory.map((job) => (
                    <motion.div
                      key={job.job_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-[#111]/30 border border-orange-500/15 rounded-xl hover:border-primary/30 transition-all"
                    >
                      {/* Job Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`
                              px-2 py-0.5 rounded-full text-[10px] font-bold uppercase
                              ${job.status === "completed" ? "bg-green-500/20 text-green-500" :
                                job.status === "running" ? "bg-orange-500/20 text-orange-500" :
                                job.status === "failed" ? "bg-red-500/20 text-red-500" :
                                job.status === "cancelled" ? "bg-amber-500/20 text-amber-500" :
                                "bg-[#111] text-neutral-400"}
                            `}>
                              {job.status}
                            </span>
                            <span className="text-xs text-neutral-400">
                              {new Date(job.created_at).toLocaleDateString()} {new Date(job.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-white mt-1 truncate">
                            Job {job.job_id.slice(0, 8)}...
                          </p>
                        </div>
                        <button
                          onClick={() => deleteJob(job.job_id)}
                          className="p-1.5 hover:bg-red-500/10 text-neutral-400 hover:text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Job Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="p-2 bg-[#080808] rounded-lg text-center">
                          <p className="text-lg font-bold text-white">{job.results_count || 0}</p>
                          <p className="text-[10px] text-neutral-400">Results</p>
                        </div>
                        <div className="p-2 bg-[#080808] rounded-lg text-center">
                          <p className="text-lg font-bold text-green-500">{job.emails_found || 0}</p>
                          <p className="text-[10px] text-neutral-400">Emails</p>
                        </div>
                        <div className="p-2 bg-[#080808] rounded-lg text-center">
                          <p className="text-lg font-bold text-primary">{job.progress || 0}%</p>
                          <p className="text-[10px] text-neutral-400">Progress</p>
                        </div>
                      </div>

                      {/* Demographics & Categories Tags */}
                      {(job.demographics || job.categories) && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {job.demographics?.slice(0, 2).map((d: string) => (
                            <span key={d} className="px-1.5 py-0.5 bg-orange-500/10 text-orange-500 text-[10px] rounded">
                              {d}
                            </span>
                          ))}
                          {job.categories?.slice(0, 2).map((c: string) => (
                            <span key={c} className="px-1.5 py-0.5 bg-purple-500/10 text-purple-500 text-[10px] rounded">
                              {c}
                            </span>
                          ))}
                          {((job.demographics?.length || 0) + (job.categories?.length || 0)) > 4 && (
                            <span className="px-1.5 py-0.5 bg-[#111] text-neutral-400 text-[10px] rounded">
                              +{(job.demographics?.length || 0) + (job.categories?.length || 0) - 4} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Session Details */}
                      <details className="mb-3">
                        <summary className="text-xs text-neutral-400 cursor-pointer hover:text-white">
                          Session Details
                        </summary>
                        <div className="mt-2 p-2 bg-[#080808] rounded-lg text-xs space-y-1 text-neutral-300">
                          {job.config?.max_companies && <p>Max companies: {job.config.max_companies}</p>}
                          {job.config?.website_scrape_depth && <p>Scrape depth: {job.config.website_scrape_depth}</p>}
                          {job.config?.target_contacts && <p>Target: {job.config.target_contacts}</p>}
                          {job.config?.enable_deep_osint !== undefined && <p>Deep OSINT: {job.config.enable_deep_osint ? "Yes" : "No"}</p>}
                          {job.stats?.pages_scraped != null && <p>Pages scraped: {job.stats.pages_scraped}</p>}
                          {job.stats?.osint_leadership_found != null && <p>Leaders found: {job.stats.osint_leadership_found}</p>}
                          {job.stats?.osint_phones_found != null && <p>Phones found: {job.stats.osint_phones_found}</p>}
                          {job.completed_at && <p>Duration: {Math.round((new Date(job.completed_at).getTime() - new Date(job.created_at).getTime()) / 1000)}s</p>}
                        </div>
                      </details>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {/* View Results */}
                        {job.status === "completed" && job.results_count > 0 && (
                          <button
                            onClick={() => loadJobResults(job.job_id)}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-medium transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Results
                          </button>
                        )}

                        {/* Rerun Same Settings */}
                        <button
                          onClick={() => rerunJob(job.job_id, "same")}
                          disabled={loadingRerun === `${job.job_id}-same`}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#111] hover:bg-[#111]/80 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          {loadingRerun === `${job.job_id}-same` ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Repeat className="w-3.5 h-3.5" />
                          )}
                          Rerun
                        </button>

                        {/* Rerun + Exclude Found */}
                        {job.status === "completed" && job.results_count > 0 && (
                          <button
                            onClick={() => rerunJob(job.job_id, "same_exclude_found")}
                            disabled={loadingRerun === `${job.job_id}-same_exclude_found`}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                            title="Rerun with same settings but exclude already found contacts"
                          >
                            {loadingRerun === `${job.job_id}-same_exclude_found` ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <SkipForward className="w-3.5 h-3.5" />
                            )}
                            +New
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-orange-500/15">
                <button
                  onClick={() => {
                    setShowJobHistory(false)
                    setStep(1)
                    setResults([])
                    setCurrentJob(null)
                    setLiveContacts([])
                    setErrors([])
                    setLayers(INITIAL_LAYERS)
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  <Sparkles className="w-5 h-5" />
                  Start New Extraction
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Select Demographics */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-4 sm:mb-8">
                <h2 className="text-lg sm:text-2xl font-bold text-white">Select Target Demographics</h2>
                <p className="text-xs sm:text-base text-neutral-400 mt-1 sm:mt-2">Choose the regions where you want to find app companies</p>
              </div>

              {/* Selection count badge */}
              {selectedDemographics.length > 0 && (
                <div className="flex justify-center mb-4">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                    {selectedDemographics.length} region{selectedDemographics.length > 1 ? "s" : ""} selected
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
                {DEMOGRAPHICS.map((demo) => (
                  <SelectionCard
                    key={demo.value}
                    item={demo}
                    selected={selectedDemographics.includes(demo.value)}
                    onToggle={() => toggleDemographic(demo.value)}
                    type="demographic"
                  />
                ))}
              </div>

              <div className="flex justify-end mt-6 sm:mt-8">
                <button
                  onClick={() => setStep(2)}
                  disabled={selectedDemographics.length === 0}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-primary text-primary-foreground rounded-lg sm:rounded-xl text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Select Categories */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-4 sm:mb-8">
                <h2 className="text-lg sm:text-2xl font-bold text-white">Select Product Categories</h2>
                <p className="text-xs sm:text-base text-neutral-400 mt-1 sm:mt-2">What types of apps/companies are you looking for?</p>
              </div>

              {selectedCategories.length > 0 && (
                <div className="flex justify-center mb-4">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                    {selectedCategories.length} categor{selectedCategories.length > 1 ? "ies" : "y"} selected
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                {CATEGORIES.map((cat) => (
                  <SelectionCard
                    key={cat.value}
                    item={cat}
                    selected={selectedCategories.includes(cat.value)}
                    onToggle={() => toggleCategory(cat.value)}
                    type="category"
                  />
                ))}
              </div>

              <div className="flex justify-between mt-6 sm:mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[#111] text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-medium hover:bg-[#111]/80 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={selectedCategories.length === 0}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-primary text-primary-foreground rounded-lg sm:rounded-xl text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Choose Mode */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-4 sm:mb-8">
                <h2 className="text-lg sm:text-2xl font-bold text-white">Choose Extraction Mode</h2>
                <p className="text-xs sm:text-base text-neutral-400 mt-1 sm:mt-2">Select between FREE or PAID extraction</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
                {/* FREE Mode */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setExtractionMode("free")}
                  className={`
                    relative p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 text-left transition-all
                    ${extractionMode === "free"
                      ? "border-primary bg-primary/10"
                      : "border-orange-500/15 bg-[#080808] hover:border-primary/50"
                    }
                  `}
                >
                  {extractionMode === "free" && (
                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                  )}

                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-green-500/20 rounded-lg sm:rounded-xl">
                      <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-xl font-bold text-white">FREE Mode</h3>
                      <p className="text-xs sm:text-sm text-green-500 font-medium">$0 / No API Keys</p>
                    </div>
                  </div>

                  <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-neutral-400">
                    <li className="flex items-center gap-2">
                      <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" />
                      AI/ML NLP Extraction
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
                      Deep OSINT
                    </li>
                    <li className="flex items-center gap-2">
                      <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                      7-Level Deep Scraping
                    </li>
                    <li className="flex items-center gap-2">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0" />
                      50+ Email Patterns
                    </li>
                  </ul>
                </motion.button>

                {/* PAID Mode */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setExtractionMode("paid")}
                  className={`
                    relative p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 text-left transition-all
                    ${extractionMode === "paid"
                      ? "border-primary bg-primary/10"
                      : "border-orange-500/15 bg-[#080808] hover:border-primary/50"
                    }
                  `}
                >
                  {extractionMode === "paid" && (
                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                  )}

                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg sm:rounded-xl">
                      <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-xl font-bold text-white">PAID Mode</h3>
                      <p className="text-xs sm:text-sm text-amber-500 font-medium">Enhanced with APIs</p>
                    </div>
                  </div>

                  <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-neutral-400">
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0" />
                      Everything in FREE +
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0" />
                      Hunter.io Verification
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0" />
                      Clearbit Enrichment
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0" />
                      Apollo.io Contacts
                    </li>
                  </ul>
                </motion.button>
              </div>

              {/* API Keys for paid mode */}
              {extractionMode === "paid" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 sm:mt-6 p-4 sm:p-6 bg-[#080808] border border-orange-500/15 rounded-xl max-w-4xl mx-auto"
                >
                  <h4 className="font-semibold text-sm sm:text-base text-white mb-3 sm:mb-4">API Keys (Optional)</h4>
                  <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-white mb-1">Hunter.io</label>
                      <input
                        type="password"
                        value={config.hunterApiKey}
                        onChange={(e) => setConfig({ ...config, hunterApiKey: e.target.value })}
                        placeholder="API key..."
                        className="w-full px-3 py-2 bg-[#111] border border-orange-500/15 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-white mb-1">Clearbit</label>
                      <input
                        type="password"
                        value={config.clearbitApiKey}
                        onChange={(e) => setConfig({ ...config, clearbitApiKey: e.target.value })}
                        placeholder="API key..."
                        className="w-full px-3 py-2 bg-[#111] border border-orange-500/15 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-white mb-1">Apollo.io</label>
                      <input
                        type="password"
                        value={config.apolloApiKey}
                        onChange={(e) => setConfig({ ...config, apolloApiKey: e.target.value })}
                        placeholder="API key..."
                        className="w-full px-3 py-2 bg-[#111] border border-orange-500/15 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Configuration */}
              <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-[#080808] border border-orange-500/15 rounded-xl max-w-4xl mx-auto">
                <h4 className="font-semibold text-sm sm:text-base text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Extraction Settings
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-white mb-1">Max Companies</label>
                    <input
                      type="number"
                      value={config.maxCompanies}
                      onChange={(e) => setConfig({ ...config, maxCompanies: parseInt(e.target.value) || 200 })}
                      min={50}
                      max={1000}
                      className="w-full px-3 py-2 bg-[#111] border border-orange-500/15 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-white mb-1">Apps/Category</label>
                    <input
                      type="number"
                      value={config.maxAppsPerCategory}
                      onChange={(e) => setConfig({ ...config, maxAppsPerCategory: parseInt(e.target.value) || 100 })}
                      min={20}
                      max={500}
                      className="w-full px-3 py-2 bg-[#111] border border-orange-500/15 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-white mb-1">Scrape Depth</label>
                    <input
                      type="number"
                      value={config.websiteScrapeDepth}
                      onChange={(e) => setConfig({ ...config, websiteScrapeDepth: parseInt(e.target.value) || 7 })}
                      min={1}
                      max={10}
                      className="w-full px-3 py-2 bg-[#111] border border-orange-500/15 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-white mb-1">Target Contacts</label>
                    <input
                      type="number"
                      value={config.targetContacts}
                      onChange={(e) => setConfig({ ...config, targetContacts: Math.min(5000, Math.max(100, parseInt(e.target.value) || 1000)) })}
                      min={100}
                      max={5000}
                      className="w-full px-3 py-2 bg-[#111] border border-orange-500/15 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Target Contacts Slider - Prominent */}
                <div className="mt-4 p-4 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-white flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Extraction Target
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary">{config.targetContacts.toLocaleString()}</span>
                      <span className="text-xs text-neutral-400">contacts</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={5000}
                    step={100}
                    value={config.targetContacts}
                    onChange={(e) => setConfig({ ...config, targetContacts: parseInt(e.target.value) })}
                    className="w-full h-2 bg-[#111] rounded-full appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between mt-2 text-[10px] text-neutral-400">
                    <span>100</span>
                    <span>1,000</span>
                    <span>2,500</span>
                    <span>5,000</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-2">
                    The extraction will attempt to find this many contacts. Higher targets may take longer.
                  </p>
                </div>
              </div>

              <div className="flex justify-between mt-6 sm:mt-8 max-w-4xl mx-auto">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[#111] text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-medium hover:bg-[#111]/80 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={startExtraction}
                  disabled={isExtracting}
                  className="flex items-center gap-2 px-4 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-primary via-accent to-amber-500 text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shadow-lg shadow-primary/30"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">Start ULTRA Extraction</span>
                      <span className="sm:hidden">Start</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Extraction & Results */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Mobile Live Feed Toggle */}
              {isExtracting && (
                <div className="lg:hidden flex justify-end">
                  <button
                    onClick={() => setShowMobileFeed(!showMobileFeed)}
                    className="flex items-center gap-2 px-3 py-2 bg-[#080808] border border-orange-500/15 rounded-lg text-sm"
                  >
                    <Terminal className="w-4 h-4 text-green-500" />
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Live Feed ({liveContacts.length})
                    <ChevronDown className={`w-4 h-4 transition-transform ${showMobileFeed ? "rotate-180" : ""}`} />
                  </button>
                </div>
              )}

              {/* Mobile Live Feed Panel */}
              <AnimatePresence>
                {isExtracting && showMobileFeed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="lg:hidden overflow-hidden"
                  >
                    <div className="bg-[#080808] border border-orange-500/15 rounded-xl p-3 max-h-60 overflow-y-auto space-y-2">
                      {liveContacts.slice(0, 10).map((contact) => (
                        <LiveContactItem key={contact.id} contact={contact} compact />
                      ))}
                      {liveContacts.length === 0 && (
                        <div className="text-center text-neutral-400 py-4">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                          <p className="text-xs">Waiting for contacts...</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Status Dashboard + Live Feed */}
              {isExtracting && (
                <div className={`grid gap-4 sm:gap-6 ${
                  feedSize === "collapsed" ? "lg:grid-cols-1" :
                  feedSize === "small" ? "lg:grid-cols-4" :
                  feedSize === "large" ? "lg:grid-cols-2" :
                  "lg:grid-cols-3"
                }`}>
                  {/* Status Dashboard */}
                  <div className={`space-y-4 sm:space-y-6 ${
                    feedSize === "collapsed" ? "lg:col-span-1" :
                    feedSize === "small" ? "lg:col-span-3" :
                    feedSize === "large" ? "lg:col-span-1" :
                    "lg:col-span-2"
                  }`}>
                    {/* Main Progress */}
                    <div className="p-4 sm:p-6 bg-[#080808] border border-orange-500/15 rounded-xl">
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm sm:text-base text-white flex items-center gap-2">
                            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary animate-pulse" />
                            <span className="hidden sm:inline">ULTRA+OSINT Extraction</span>
                            <span className="sm:hidden">Extracting</span>
                          </h3>
                          <p className="text-xs sm:text-sm text-neutral-400 mt-1 truncate">{currentJob?.progress.message}</p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <span className="text-xl sm:text-3xl font-bold text-primary">{currentJob?.progress.total_progress || 0}%</span>
                        </div>
                      </div>

                      <div className="w-full h-2 sm:h-4 bg-[#111] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary via-accent to-amber-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${currentJob?.progress.total_progress || 0}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>

                      {/* Target Progress + Cancel Button */}
                      <div className="flex items-center justify-between mt-3 sm:mt-4">
                        <div className="text-xs sm:text-sm">
                          <span className="text-neutral-400">Target: {config.targetContacts}</span>
                          <span className={`ml-2 font-medium ${
                            results.length >= config.targetContacts ? "text-green-500" :
                            results.length >= config.targetContacts * 0.5 ? "text-amber-500" :
                            "text-neutral-400"
                          }`}>
                            ({results.length} found)
                          </span>
                        </div>
                        <button
                          onClick={cancelExtraction}
                          disabled={isCancelling}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-xs sm:text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          {isCancelling ? (
                            <>
                              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                              Cancel
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Stats Grid - Responsive */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4">
                      <div className="p-3 sm:p-4 bg-[#080808] border border-orange-500/15 rounded-xl text-center">
                        <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 mx-auto mb-1 sm:mb-2" />
                        <p className="text-lg sm:text-2xl font-bold text-white">{currentJob?.stats?.apps_found || 0}</p>
                        <p className="text-[10px] sm:text-xs text-neutral-400">Apps</p>
                      </div>
                      <div className="p-3 sm:p-4 bg-[#080808] border border-orange-500/15 rounded-xl text-center">
                        <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 mx-auto mb-1 sm:mb-2" />
                        <p className="text-lg sm:text-2xl font-bold text-white">{currentJob?.stats?.companies_found || 0}</p>
                        <p className="text-[10px] sm:text-xs text-neutral-400">Companies</p>
                      </div>
                      <div className="p-3 sm:p-4 bg-[#080808] border border-orange-500/15 rounded-xl text-center">
                        <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mx-auto mb-1 sm:mb-2" />
                        <p className="text-lg sm:text-2xl font-bold text-white">{currentJob?.stats?.emails_found || 0}</p>
                        <p className="text-[10px] sm:text-xs text-neutral-400">Emails</p>
                      </div>
                      <div className="p-3 sm:p-4 bg-[#080808] border border-orange-500/15 rounded-xl text-center">
                        <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-500 mx-auto mb-1 sm:mb-2" />
                        <p className="text-lg sm:text-2xl font-bold text-white">{currentJob?.stats?.emails_verified || 0}</p>
                        <p className="text-[10px] sm:text-xs text-neutral-400">Verified</p>
                      </div>
                      <div className="p-3 sm:p-4 bg-[#080808] border border-orange-500/15 rounded-xl text-center">
                        <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 mx-auto mb-1 sm:mb-2" />
                        <p className="text-lg sm:text-2xl font-bold text-white">{currentJob?.stats?.osint_leadership_found || 0}</p>
                        <p className="text-[10px] sm:text-xs text-neutral-400">Leaders</p>
                      </div>
                    </div>

                    {/* Extraction Layers - Responsive Grid */}
                    <div className="p-3 sm:p-4 bg-[#080808] border border-orange-500/15 rounded-xl">
                      <h4 className="font-semibold text-sm sm:text-base text-white mb-3 sm:mb-4 flex items-center gap-2">
                        <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        Extraction Layers
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                        {layers.map(layer => (
                          <LayerStatus key={layer.id} layer={layer} compact />
                        ))}
                      </div>
                    </div>

                    {/* Errors */}
                    {errors.length > 0 && (
                      <div className="p-3 sm:p-4 bg-[#080808] border border-orange-500/15 rounded-xl">
                        <h4 className="font-semibold text-sm text-white mb-2 sm:mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          Warnings ({errors.length})
                        </h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {errors.slice(0, 5).map(error => (
                            <ErrorItem key={error.id} error={error} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Live Feed Panel - Desktop Only */}
                  {feedSize === "collapsed" ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="hidden lg:block fixed bottom-6 right-6 z-50"
                    >
                      <button
                        onClick={() => setFeedSize("medium")}
                        className="flex items-center gap-3 px-4 py-3 bg-[#080808] border border-orange-500/15 rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                      >
                        <div className="relative">
                          <Terminal className="w-5 h-5 text-green-500" />
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-white">{liveContacts.length} Found</p>
                          <p className="text-xs text-neutral-400">{currentJob?.progress.stage || "Running..."}</p>
                        </div>
                        <PanelRight className="w-4 h-4 text-neutral-400 ml-2" />
                      </button>
                    </motion.div>
                  ) : (
                    <div className="hidden lg:block lg:col-span-1">
                      <motion.div
                        layout
                        className={`p-4 bg-[#080808] border border-orange-500/15 rounded-xl sticky top-24 flex flex-col transition-all ${
                          feedSize === "small" ? "max-h-[300px]" :
                          feedSize === "large" ? "max-h-[calc(100vh-8rem)]" :
                          "max-h-[500px]"
                        }`}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-white flex items-center gap-2">
                            <Terminal className="w-5 h-5 text-green-500" />
                            Live Feed
                            <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full">
                              {liveContacts.length}
                            </span>
                          </h4>
                          <div className="flex items-center gap-1">
                            <span className="flex items-center gap-1 text-xs text-green-500 mr-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                              Live
                            </span>
                            <div className="flex items-center gap-0.5 p-1 bg-[#111] rounded-lg">
                              <button
                                onClick={() => setFeedSize("small")}
                                className={`p-1.5 rounded ${feedSize === "small" ? "bg-[#080808] shadow" : ""}`}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setFeedSize("medium")}
                                className={`p-1.5 rounded ${feedSize === "medium" ? "bg-[#080808] shadow" : ""}`}
                              >
                                <Minimize2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setFeedSize("large")}
                                className={`p-1.5 rounded ${feedSize === "large" ? "bg-[#080808] shadow" : ""}`}
                              >
                                <Maximize2 className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => setFeedSize("collapsed")}
                              className="p-1.5 hover:bg-[#111] rounded-lg ml-1"
                            >
                              <PanelRightClose className="w-4 h-4 text-neutral-400" />
                            </button>
                          </div>
                        </div>

                        {/* Feed Content */}
                        <div ref={liveContactsRef} className="flex-1 overflow-y-auto space-y-2 pr-2">
                          <AnimatePresence mode="popLayout">
                            {liveContacts.map((contact, idx) => (
                              <motion.div
                                key={contact.id}
                                initial={{ opacity: 0, x: 50, scale: 0.8 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -20 }}
                              >
                                <LiveContactItem contact={contact} />
                              </motion.div>
                            ))}
                          </AnimatePresence>
                          {liveContacts.length === 0 && (
                            <div className="text-center text-neutral-400 py-8">
                              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                              <p className="text-sm">Waiting for contacts...</p>
                            </div>
                          )}
                        </div>

                        {/* Quick Stats */}
                        <div className="mt-3 pt-3 border-t border-orange-500/15 grid grid-cols-5 gap-1 text-center">
                          <div>
                            <p className="text-sm font-bold text-cyan-500">{liveContacts.filter(c => c.type === "app").length}</p>
                            <p className="text-[9px] text-neutral-400">Apps</p>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-orange-500">{liveContacts.filter(c => c.type === "company").length}</p>
                            <p className="text-[9px] text-neutral-400">Co.</p>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-green-500">{liveContacts.filter(c => c.type === "email").length}</p>
                            <p className="text-[9px] text-neutral-400">Email</p>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-purple-500">{liveContacts.filter(c => c.type === "person").length}</p>
                            <p className="text-[9px] text-neutral-400">People</p>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-amber-500">{liveContacts.filter(c => c.type === "leadership").length}</p>
                            <p className="text-[9px] text-neutral-400">Lead</p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </div>
              )}

              {/* Live Results Preview */}
              {isExtracting && results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 sm:space-y-4"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="font-semibold text-sm sm:text-base text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary animate-pulse" />
                      Live Results
                      <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">
                        +{results.length}
                      </span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    <AnimatePresence mode="popLayout">
                      {results.slice(0, 8).map((result, idx) => (
                        <motion.div
                          key={`live-${result.company_name}-${idx}`}
                          initial={{ opacity: 0, scale: 0.8, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0, transition: { delay: idx * 0.05 } }}
                          className="relative"
                        >
                          {idx < 2 && (
                            <span className="absolute -top-1 -right-1 z-10 px-1.5 py-0.5 bg-green-500 text-white text-[8px] sm:text-[10px] font-bold rounded-full">
                              NEW
                            </span>
                          )}
                          <ResultCard result={result} onCopyEmail={copyEmail} index={idx} compact />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {/* Results Section */}
              {(currentJob?.status === "completed" || results.length > 0) && !isExtracting && (
                <>
                  {/* Completion Summary */}
                  {currentJob?.status === "completed" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 sm:p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="p-2 sm:p-3 bg-green-500/20 rounded-full">
                          <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg sm:text-xl font-bold text-white">Extraction Complete!</h3>
                          <p className="text-xs sm:text-sm text-neutral-400">
                            Found {results.length} companies with {currentJob?.stats?.emails_found || 0} emails
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-2xl sm:text-3xl font-bold text-green-500">{results.length}</p>
                          <p className="text-xs sm:text-sm text-neutral-400">Total</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Results Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedContacts.size === sortedResults.length && sortedResults.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-orange-500/20 bg-[#111] text-primary accent-current cursor-pointer"
                      />
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-white">Results</h2>
                        <p className="text-xs sm:text-sm text-neutral-400">
                          {sortedResults.length} of {results.length}
                          {selectedContacts.size > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-primary/20 text-primary rounded-full text-[10px]">
                              {selectedContacts.size} selected
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      {/* Search */}
                      <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search..."
                          className="w-full sm:w-48 lg:w-64 pl-9 pr-3 py-2 bg-[#111] border border-orange-500/15 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      {/* Filter Toggle */}
                      <button
                        onClick={() => setShowFilters(f => !f)}
                        className={`relative p-1.5 sm:p-2 rounded-lg transition-colors ${showFilters ? "bg-primary/20 text-primary" : "bg-[#111] hover:bg-[#111]/80"}`}
                      >
                        <Filter className="w-4 h-4" />
                        {activeFilterCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                            {activeFilterCount}
                          </span>
                        )}
                      </button>

                      {/* Sort */}
                      <div className="flex items-center gap-1">
                        <select
                          value={sortField}
                          onChange={(e) => setSortField(e.target.value as typeof sortField)}
                          className="px-2 py-1.5 bg-[#111] border border-orange-500/15 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="default">Default</option>
                          <option value="confidence_score">Confidence</option>
                          <option value="company_name">Company</option>
                          <option value="email_count">Emails</option>
                        </select>
                        <button
                          onClick={() => setSortDirection(d => d === "asc" ? "desc" : "asc")}
                          className="p-1.5 bg-[#111] rounded-lg hover:bg-[#111]/80"
                        >
                          {sortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* View Toggle */}
                      <div className="flex items-center gap-1 p-1 bg-[#111] rounded-lg">
                        <button
                          onClick={() => setViewMode("cards")}
                          className={`p-1.5 sm:p-2 rounded-md ${viewMode === "cards" ? "bg-[#080808] shadow" : ""}`}
                        >
                          <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewMode("table")}
                          className={`p-1.5 sm:p-2 rounded-md ${viewMode === "table" ? "bg-[#080808] shadow" : ""}`}
                        >
                          <Table className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Export */}
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button
                          onClick={() => exportResults("csv")}
                          disabled={exportingFormat !== null}
                          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-[#111] hover:bg-[#111]/80 rounded-lg text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Download className={`w-3 h-3 sm:w-4 sm:h-4 ${exportingFormat === "csv" ? "animate-spin" : ""}`} />
                          <span className="hidden xs:inline">{exportingFormat === "csv" ? "Exporting..." : selectedContacts.size > 0 ? `CSV (${selectedContacts.size})` : "CSV"}</span>
                        </button>
                        <button
                          onClick={() => exportResults("json")}
                          disabled={exportingFormat !== null}
                          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-[#111] hover:bg-[#111]/80 rounded-lg text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Download className={`w-3 h-3 sm:w-4 sm:h-4 ${exportingFormat === "json" ? "animate-spin" : ""}`} />
                          <span className="hidden xs:inline">{exportingFormat === "json" ? "Exporting..." : selectedContacts.size > 0 ? `JSON (${selectedContacts.size})` : "JSON"}</span>
                        </button>
                        <button
                          onClick={exportToRecipients}
                          disabled={exportingToRecipients}
                          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs sm:text-sm font-medium shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Users className={`w-3 h-3 sm:w-4 sm:h-4 ${exportingToRecipients ? "animate-spin" : ""}`} />
                          <span className="hidden xs:inline">{exportingToRecipients ? "Exporting..." : selectedContacts.size > 0 ? `Recipients (${selectedContacts.size})` : "Recipients"}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Filters Row */}
                  {showFilters && (
                    <div className="p-3 bg-white/[0.04] border border-orange-500/15 rounded-xl space-y-3">
                      <div className="flex flex-wrap gap-3 items-end">
                        <div>
                          <label className="text-[10px] text-neutral-400 block mb-1">Verification</label>
                          <select
                            value={filters.verificationStatus}
                            onChange={(e) => setFilters(f => ({ ...f, verificationStatus: e.target.value as any }))}
                            className="px-2 py-1.5 bg-[#080808] border border-orange-500/15 rounded-lg text-xs text-white"
                          >
                            <option value="">All</option>
                            <option value="verified">Verified</option>
                            <option value="maybe">Maybe</option>
                            <option value="not_verified">Not Verified</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-neutral-400 block mb-1">Min Confidence</label>
                          <input
                            type="number"
                            min={0} max={100}
                            value={filters.minConfidence}
                            onChange={(e) => setFilters(f => ({ ...f, minConfidence: Number(e.target.value) }))}
                            className="w-16 px-2 py-1.5 bg-[#080808] border border-orange-500/15 rounded-lg text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-neutral-400 block mb-1">Max Confidence</label>
                          <input
                            type="number"
                            min={0} max={100}
                            value={filters.maxConfidence}
                            onChange={(e) => setFilters(f => ({ ...f, maxConfidence: Number(e.target.value) }))}
                            className="w-16 px-2 py-1.5 bg-[#080808] border border-orange-500/15 rounded-lg text-xs text-white"
                          />
                        </div>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.hasEmail}
                            onChange={(e) => setFilters(f => ({ ...f, hasEmail: e.target.checked }))}
                            className="w-3.5 h-3.5 rounded border-orange-500/20 bg-[#080808] accent-current"
                          />
                          <span className="text-xs text-neutral-300">Has Email</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.hasPhone}
                            onChange={(e) => setFilters(f => ({ ...f, hasPhone: e.target.checked }))}
                            className="w-3.5 h-3.5 rounded border-orange-500/20 bg-[#080808] accent-current"
                          />
                          <span className="text-xs text-neutral-300">Has Phone</span>
                        </label>
                        <div>
                          <label className="text-[10px] text-neutral-400 block mb-1">Demographic</label>
                          <input
                            type="text"
                            value={filters.demographic}
                            onChange={(e) => setFilters(f => ({ ...f, demographic: e.target.value }))}
                            placeholder="e.g. usa"
                            className="w-24 px-2 py-1.5 bg-[#080808] border border-orange-500/15 rounded-lg text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-neutral-400 block mb-1">Category</label>
                          <input
                            type="text"
                            value={filters.category}
                            onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}
                            placeholder="e.g. mobile_apps"
                            className="w-28 px-2 py-1.5 bg-[#080808] border border-orange-500/15 rounded-lg text-xs text-white"
                          />
                        </div>
                        {activeFilterCount > 0 && (
                          <button
                            onClick={() => setFilters({ verificationStatus: "", minConfidence: 0, maxConfidence: 100, hasEmail: false, hasPhone: false, demographic: "", category: "" })}
                            className="px-2 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Results Grid/Table */}
                  {viewMode === "cards" ? (
                    <div className="max-h-[70vh] overflow-y-auto">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                        {sortedResults.map((result, index) => (
                          <ResultCard
                            key={index}
                            result={result}
                            onCopyEmail={copyEmail}
                            index={index}
                            selected={selectedContacts.has(index)}
                            onToggleSelect={toggleContactSelection}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#080808] border border-orange-500/15 rounded-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                          <thead>
                            <tr className="border-b border-orange-500/15 bg-white/[0.04]">
                              <th className="px-2 py-2 sm:py-3 w-8">
                                <input
                                  type="checkbox"
                                  checked={selectedContacts.size === sortedResults.length && sortedResults.length > 0}
                                  onChange={toggleSelectAll}
                                  className="w-4 h-4 rounded border-orange-500/20 bg-[#111] accent-current cursor-pointer"
                                />
                              </th>
                              <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-white">Company</th>
                              <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-white">App</th>
                              <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-white hidden lg:table-cell">Category</th>
                              <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-white">Email</th>
                              <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-white">Verified</th>
                              <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-white hidden lg:table-cell">Phone</th>
                              <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-white hidden md:table-cell">People</th>
                              <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-white">Score</th>
                            </tr>
                          </thead>
                        </table>
                        <div
                          ref={tableParentRef}
                          className="max-h-[65vh] overflow-y-auto"
                        >
                          <div style={{ height: `${tableVirtualizer.getTotalSize()}px`, position: 'relative' }}>
                            <table className="w-full min-w-[900px]">
                              <tbody>
                                {tableVirtualizer.getVirtualItems().map((virtualRow) => {
                                  const result = sortedResults[virtualRow.index]
                                  return (
                                    <tr
                                      key={virtualRow.index}
                                      className="border-b border-orange-500/15 hover:bg-[#111]/30"
                                      style={{
                                        height: `${virtualRow.size}px`,
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        transform: `translateY(${virtualRow.start}px)`,
                                        display: 'table-row',
                                      }}
                                    >
                                      <td className="px-2 py-2 sm:py-3 w-8">
                                        <input
                                          type="checkbox"
                                          checked={selectedContacts.has(virtualRow.index)}
                                          onChange={() => toggleContactSelection(virtualRow.index)}
                                          className="w-4 h-4 rounded border-orange-500/20 bg-[#111] accent-current cursor-pointer"
                                        />
                                      </td>
                                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white max-w-[120px] sm:max-w-[150px] truncate">{result.company_name}</td>
                                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-neutral-400 max-w-[100px] sm:max-w-[150px] truncate">{result.app_or_product || "-"}</td>
                                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-neutral-400 hidden lg:table-cell">{result.product_category || "-"}</td>
                                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                                        {(result.marketing_email || result.sales_email) ? (
                                          <button
                                            onClick={() => copyEmail(result.marketing_email || result.sales_email!)}
                                            className="text-xs sm:text-sm text-primary hover:underline max-w-[150px] sm:max-w-[180px] truncate block"
                                          >
                                            {result.marketing_email || result.sales_email}
                                          </button>
                                        ) : (
                                          <span className="text-xs sm:text-sm text-neutral-400">-</span>
                                        )}
                                      </td>
                                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                                        {result.email_verification_status ? (
                                          <span className={`
                                            inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium
                                            ${result.email_verification_status === "verified" ? "bg-green-500/20 text-green-500" :
                                              result.email_verification_status === "maybe" ? "bg-amber-500/20 text-amber-500" :
                                              "bg-red-500/20 text-red-500"}
                                          `}>
                                            {result.email_verification_status === "verified" ? (
                                              <><CheckCircle className="w-3 h-3" /></>
                                            ) : result.email_verification_status === "maybe" ? (
                                              <><AlertCircle className="w-3 h-3" /></>
                                            ) : (
                                              <><XCircle className="w-3 h-3" /></>
                                            )}
                                            <span className="hidden sm:inline">
                                              {result.email_verification_status === "verified" ? "Yes" :
                                                result.email_verification_status === "maybe" ? "Maybe" : "No"}
                                            </span>
                                          </span>
                                        ) : (
                                          <span className="text-xs text-neutral-400">-</span>
                                        )}
                                      </td>
                                      <td className="px-3 sm:px-4 py-2 sm:py-3 hidden lg:table-cell">
                                        {result.company_phones && result.company_phones[0] ? (
                                          <a href={`tel:${result.company_phones[0]}`} className="text-xs text-orange-400 hover:underline flex items-center gap-1 truncate max-w-[130px]">
                                            <Phone className="w-3 h-3 flex-shrink-0" />
                                            <span className="truncate">{result.company_phones[0]}</span>
                                          </a>
                                        ) : <span className="text-xs text-neutral-400">-</span>}
                                      </td>
                                      <td className="px-3 sm:px-4 py-2 sm:py-3 hidden md:table-cell">
                                        {result.people && result.people.length > 0 ? (
                                          <span className="flex items-center gap-1 text-xs sm:text-sm">
                                            {result.people.some(p => p.role === "leadership") && <Crown className="w-3 h-3 text-amber-500" />}
                                            {result.people.length}
                                          </span>
                                        ) : "-"}
                                      </td>
                                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                                        <span className={`
                                          px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium
                                          ${result.confidence_score >= 80 ? "bg-green-500/20 text-green-500" :
                                            result.confidence_score >= 50 ? "bg-amber-500/20 text-amber-500" :
                                            "bg-[#111] text-neutral-400"}
                                        `}>
                                          {result.confidence_score}%
                                        </span>
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rerun Options & New Extraction */}
                  <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-[#080808] border border-orange-500/15 rounded-xl">
                    <h3 className="text-sm sm:text-base font-semibold text-white mb-4 flex items-center gap-2">
                      <ChevronsRight className="w-5 h-5 text-primary" />
                      What's Next?
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
                      {/* Rerun Same Settings */}
                      {currentJob && (
                        <button
                          onClick={() => rerunJob(currentJob.job_id, "same")}
                          disabled={loadingRerun === `${currentJob.job_id}-same`}
                          className="flex flex-col items-center gap-2 p-4 bg-white/[0.04] hover:bg-[#111] rounded-xl text-center transition-colors disabled:opacity-50"
                        >
                          {loadingRerun === `${currentJob.job_id}-same` ? (
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                          ) : (
                            <Repeat className="w-6 h-6 text-primary" />
                          )}
                          <div>
                            <p className="font-medium text-sm text-white">Rerun Same</p>
                            <p className="text-[10px] text-neutral-400">Same demographics & categories</p>
                          </div>
                        </button>
                      )}

                      {/* Rerun + Exclude Found */}
                      {currentJob && results.length > 0 && (
                        <button
                          onClick={() => rerunJob(currentJob.job_id, "same_exclude_found")}
                          disabled={loadingRerun === `${currentJob.job_id}-same_exclude_found`}
                          className="flex flex-col items-center gap-2 p-4 bg-amber-500/10 hover:bg-amber-500/20 rounded-xl text-center transition-colors disabled:opacity-50"
                        >
                          {loadingRerun === `${currentJob.job_id}-same_exclude_found` ? (
                            <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                          ) : (
                            <SkipForward className="w-6 h-6 text-amber-500" />
                          )}
                          <div>
                            <p className="font-medium text-sm text-amber-500">Find More New</p>
                            <p className="text-[10px] text-neutral-400">Exclude {results.length} already found</p>
                          </div>
                        </button>
                      )}

                      {/* New Extraction */}
                      <button
                        onClick={() => {
                          setStep(1)
                          setResults([])
                          setCurrentJob(null)
                          setLiveContacts([])
                          setErrors([])
                          setLayers(INITIAL_LAYERS)
                        }}
                        className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 rounded-xl text-center transition-colors"
                      >
                        <Sparkles className="w-6 h-6 text-primary" />
                        <div>
                          <p className="font-medium text-sm text-white">New Search</p>
                          <p className="text-[10px] text-neutral-400">Different settings</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

