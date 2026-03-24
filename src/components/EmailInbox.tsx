"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Inbox, Star, Send, Archive, Trash2, Search, Filter,
  RefreshCw, Settings, Plus, Check, X, Cloud, AlertCircle,
  ChevronLeft, ChevronRight, Clock, Paperclip, Eye, EyeOff,
  Database, Loader2, CheckCircle2
} from 'lucide-react';
import { emailInboxApi, EmailThread, EmailMessage, EmailMessageDetail, EmailAccount, EmailAccountCreate, StorageQuota } from '@/lib/api';
import { toast } from 'sonner';

// ============================================
// Main Email Inbox Component
// ============================================

export default function EmailInbox() {
  const [selectedView, setSelectedView] = useState<'inbox' | 'sent' | 'starred' | 'archive'>('inbox');
  const [threads, setThreads] = useState<EmailThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<EmailThread | null>(null);
  const [threadMessages, setThreadMessages] = useState<EmailMessageDetail[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<EmailMessageDetail | null>(null);
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [storageQuota, setStorageQuota] = useState<StorageQuota | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Load initial data
  useEffect(() => {
    loadInboxData();
  }, []);

  const loadInboxData = async () => {
    setLoading(true);
    try {
      const [accountsRes, threadsRes, quotaRes] = await Promise.all([
        emailInboxApi.listEmailAccounts(),
        emailInboxApi.listThreads({ skip: 0, limit: 50 }),
        emailInboxApi.getStorageQuota()
      ]);

      setAccounts(accountsRes.data);
      setThreads(threadsRes.data);
      setStorageQuota(quotaRes.data);
    } catch (error) {
      toast.error('Failed to load inbox data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleThreadClick = async (thread: EmailThread) => {
    setSelectedThread(thread);
    try {
      const res = await emailInboxApi.getThreadMessages(thread.thread_id);
      setThreadMessages(res.data);
      if (res.data.length > 0) {
        setSelectedMessage(res.data[0]);
        // Mark as read
        if (!res.data[0].is_read) {
          await emailInboxApi.markAsRead(res.data[0].id);
        }
      }
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const handleSyncInbox = async () => {
    if (accounts.length === 0) {
      toast.error('Please connect an email account first');
      return;
    }

    setSyncing(true);
    try {
      const res = await emailInboxApi.syncInbox(accounts[0].id, 50);
      toast.success(`Synced ${res.data.emails_saved} new emails`);
      await loadInboxData();
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const toggleStar = async (message: EmailMessageDetail) => {
    try {
      await emailInboxApi.toggleStar(message.id);
      setThreadMessages(prev =>
        prev.map(m => m.id === message.id ? { ...m, is_starred: !m.is_starred } : m)
      );
      toast.success(message.is_starred ? 'Removed from starred' : 'Added to starred');
    } catch (error) {
      toast.error('Failed to update star status');
    }
  };

  const filteredThreads = threads.filter(thread => {
    if (searchQuery) {
      return thread.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             thread.latest_snippet?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="flex h-screen bg-gradient-to-br from-neutral-50 via-orange-50/30 to-amber-50/30">
      {/* Sidebar */}
      <EmailSidebar
        selectedView={selectedView}
        onViewChange={setSelectedView}
        onComposeClick={() => toast.info('Compose feature coming soon!')}
        onSettingsClick={() => setShowSettings(true)}
        storageQuota={storageQuota}
      />

      {/* Thread List */}
      <div className="flex-1 flex flex-col border-r border-neutral-200 bg-white/50 backdrop-blur-sm">
        {/* Header */}
        <div className="h-16 border-b border-neutral-200 flex items-center justify-between px-4 bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              {selectedView.charAt(0).toUpperCase() + selectedView.slice(1)}
            </h2>
            <span className="text-sm text-neutral-500">({filteredThreads.length})</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-neutral-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-orange-500 transition-all w-64"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSyncInbox}
              disabled={syncing || accounts.length === 0}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-neutral-500 ${syncing ? 'animate-spin' : ''}`} />
            </motion.button>

            {accounts.length === 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAccountDialog(true)}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Connect Email
              </motion.button>
            )}
          </div>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-400">
              <Mail className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">No emails yet</p>
              <p className="text-sm">Connect an email account to get started</p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredThreads.map((thread, index) => (
                <ThreadListItem
                  key={thread.id}
                  thread={thread}
                  isSelected={selectedThread?.id === thread.id}
                  onClick={() => handleThreadClick(thread)}
                  index={index}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Message View */}
      <MessageViewer
        thread={selectedThread}
        messages={threadMessages}
        selectedMessage={selectedMessage}
        onMessageSelect={setSelectedMessage}
        onToggleStar={toggleStar}
        onClose={() => {
          setSelectedThread(null);
          setThreadMessages([]);
          setSelectedMessage(null);
        }}
      />

      {/* Connect Account Dialog */}
      <AnimatePresence>
        {showAccountDialog && (
          <ConnectAccountDialog
            onClose={() => setShowAccountDialog(false)}
            onSuccess={() => {
              setShowAccountDialog(false);
              loadInboxData();
            }}
          />
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <SettingsPanel
            accounts={accounts}
            storageQuota={storageQuota}
            onClose={() => setShowSettings(false)}
            onAccountDisconnect={loadInboxData}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// Sidebar Component
// ============================================

interface EmailSidebarProps {
  selectedView: string;
  onViewChange: (view: 'inbox' | 'sent' | 'starred' | 'archive') => void;
  onComposeClick: () => void;
  onSettingsClick: () => void;
  storageQuota: StorageQuota | null;
}

function EmailSidebar({ selectedView, onViewChange, onComposeClick, onSettingsClick, storageQuota }: EmailSidebarProps) {
  const menuItems = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, badge: null },
    { id: 'sent', label: 'Sent', icon: Send, badge: null },
    { id: 'starred', label: 'Starred', icon: Star, badge: null },
    { id: 'archive', label: 'Archive', icon: Archive, badge: null },
  ];

  const usagePercentage = storageQuota?.usage_percentage || 0;

  return (
    <div className="w-64 bg-white border-r border-neutral-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 border-b border-neutral-200 flex items-center px-4">
        <Mail className="w-6 h-6 text-orange-500 mr-2" />
        <span className="font-bold text-lg bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
          Email Inbox
        </span>
      </div>

      {/* Compose Button */}
      <div className="p-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onComposeClick}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Compose
        </motion.button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedView === item.id;

          return (
            <motion.button
              key={item.id}
              whileHover={{ x: 4 }}
              onClick={() => onViewChange(item.id as any)}
              className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 mb-1 transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-orange-50/5 to-amber-50/5 text-orange-500 font-medium'
                  : 'text-neutral-500 hover:bg-neutral-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="px-2 py-0.5 bg-orange-500/20 text-white text-xs rounded-full">
                  {item.badge}
                </span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Storage Quota */}
      {storageQuota && (
        <div className="p-4 border-t border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-500">Storage</span>
            <span className="text-xs font-medium text-neutral-600">
              {usagePercentage.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usagePercentage}%` }}
              className={`h-full rounded-full ${
                usagePercentage > 90 ? 'bg-red-500' : 'bg-gradient-to-r from-orange-500 to-indigo-500'
              }`}
            />
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            {(storageQuota.used_bytes / 1024 / 1024).toFixed(1)} MB of{' '}
            {(storageQuota.quota_limit / 1024 / 1024).toFixed(0)} MB used
          </p>
        </div>
      )}

      {/* Settings */}
      <button
        onClick={onSettingsClick}
        className="p-4 border-t border-neutral-200 flex items-center gap-3 text-neutral-500 hover:bg-neutral-50 transition-colors"
      >
        <Settings className="w-5 h-5" />
        <span>Settings</span>
      </button>
    </div>
  );
}

// ============================================
// Thread List Item Component
// ============================================

interface ThreadListItemProps {
  thread: EmailThread;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

function ThreadListItem({ thread, isSelected, onClick, index }: ThreadListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={`p-4 border-b border-slate-800 cursor-pointer transition-all ${
        isSelected
          ? 'bg-gradient-to-r from-orange-50/5 to-amber-50/5 border-l-4 border-l-orange-600'
          : 'hover:bg-neutral-50'
      } ${thread.unread_count > 0 ? 'bg-orange-50/30/30' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1">
          {thread.is_starred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
          <h3 className={`text-sm font-medium ${thread.unread_count > 0 ? 'text-neutral-900' : 'text-neutral-500'}`}>
            {thread.subject || '(No subject)'}
          </h3>
          {thread.unread_count > 0 && (
            <span className="px-2 py-0.5 bg-orange-500/20 text-white text-xs rounded-full">
              {thread.unread_count}
            </span>
          )}
        </div>
        <span className="text-xs text-neutral-400">
          {new Date(thread.latest_message_at).toLocaleDateString()}
        </span>
      </div>

      <p className="text-sm text-neutral-500 line-clamp-2">
        {thread.latest_snippet || 'No preview available'}
      </p>

      <div className="flex items-center gap-4 mt-2 text-xs text-neutral-400">
        <span className="flex items-center gap-1">
          <Mail className="w-3 h-3" />
          {thread.message_count} {thread.message_count === 1 ? 'message' : 'messages'}
        </span>
      </div>
    </motion.div>
  );
}

// ============================================
// Message Viewer Component
// ============================================

interface MessageViewerProps {
  thread: EmailThread | null;
  messages: EmailMessageDetail[];
  selectedMessage: EmailMessageDetail | null;
  onMessageSelect: (message: EmailMessageDetail) => void;
  onToggleStar: (message: EmailMessageDetail) => void;
  onClose: () => void;
}

function MessageViewer({ thread, messages, selectedMessage, onMessageSelect, onToggleStar, onClose }: MessageViewerProps) {
  if (!thread || !selectedMessage) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center text-neutral-400">
          <Mail className="w-24 h-24 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Select an email to view</p>
          <p className="text-sm">Choose a conversation from the list</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-900">
      {/* Header */}
      <div className="h-16 border-b border-neutral-200 flex items-center justify-between px-6 bg-gradient-to-r from-white to-neutral-50">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors lg:hidden"
          >
            <ChevronLeft className="w-5 h-5 text-slate-300" />
          </button>
          <h2 className="text-lg font-semibold text-neutral-800 line-clamp-1">
            {thread.subject || '(No subject)'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onToggleStar(selectedMessage)}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Star className={`w-5 h-5 ${selectedMessage.is_starred ? 'text-yellow-500 fill-yellow-500' : 'text-neutral-400'}`} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Archive className="w-5 h-5 text-neutral-500" />
          </motion.button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence>
          {messages.map((message, index) => (
            <MessageCard
              key={message.id}
              message={message}
              isSelected={selectedMessage.id === message.id}
              onClick={() => onMessageSelect(message)}
              index={index}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================
// Message Card Component
// ============================================

interface MessageCardProps {
  message: EmailMessageDetail;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

function MessageCard({ message, isSelected, onClick, index }: MessageCardProps) {
  const [showFullContent, setShowFullContent] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`mb-6 p-6 rounded-xl border-2 transition-all cursor-pointer ${
        isSelected
          ? 'border-orange-300 bg-gradient-to-br from-orange-50/5 to-amber-50/5 shadow-lg'
          : 'border-neutral-200 bg-white hover:border-orange-200 hover:shadow-md'
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-semibold">
            {(message.from_name || message.from_email).charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-neutral-800">
              {message.from_name || message.from_email}
            </p>
            <p className="text-sm text-neutral-500">{message.from_email}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-neutral-500">
            {new Date(message.sent_at || message.received_at || '').toLocaleString()}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {message.direction === 'sent' && (
              <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full flex items-center gap-1">
                <Send className="w-3 h-3" />
                Sent
              </span>
            )}
            {message.is_read && (
              <CheckCircle2 className="w-4 h-4 text-orange-500" />
            )}
          </div>
        </div>
      </div>

      {/* Subject */}
      {message.subject && (
        <h3 className="text-lg font-semibold text-neutral-800 mb-3">
          {message.subject}
        </h3>
      )}

      {/* Content */}
      <div className={`text-neutral-600 leading-relaxed ${!showFullContent ? 'line-clamp-3' : ''}`}>
        {message.body_text || message.snippet || 'No content'}
      </div>

      {message.body_text && message.body_text.length > 200 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowFullContent(!showFullContent);
          }}
          className="text-sm text-orange-500 hover:text-orange-600 font-medium mt-2 flex items-center gap-1"
        >
          {showFullContent ? (
            <>
              <EyeOff className="w-4 h-4" />
              Show less
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Show more
            </>
          )}
        </button>
      )}

      {/* Footer */}
      {message.size_bytes && (
        <div className="mt-4 pt-4 border-t border-neutral-200 text-xs text-neutral-500">
          Size: {(message.size_bytes / 1024).toFixed(1)} KB
        </div>
      )}
    </motion.div>
  );
}

// ============================================
// Connect Account Dialog
// ============================================

interface ConnectAccountDialogProps {
  onClose: () => void;
  onSuccess: () => void;
}

function ConnectAccountDialog({ onClose, onSuccess }: ConnectAccountDialogProps) {
  const [accountType, setAccountType] = useState<'gmail' | 'outlook' | 'yahoo' | 'imap'>('gmail');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [imapHost, setImapHost] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data: EmailAccountCreate = {
        email_address: email,
        account_type: accountType,
        imap_password: password,
      };

      if (accountType === 'imap') {
        data.imap_host = imapHost;
      }

      await emailInboxApi.connectEmailAccount(data);
      toast.success('Email account connected successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to connect email account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 rounded-2xl shadow-2xl shadow-black/40 max-w-md w-full p-6 border border-slate-700"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
            Connect Email Account
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleConnect} className="space-y-4">
          {/* Account Type */}
          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-2">
              Email Provider
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'gmail', label: 'Gmail' },
                { value: 'outlook', label: 'Outlook' },
                { value: 'yahoo', label: 'Yahoo' },
                { value: 'imap', label: 'Other (IMAP)' },
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setAccountType(type.value as any)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    accountType === type.value
                      ? 'border-orange-600 bg-orange-50/30 text-orange-500 font-medium'
                      : 'border-neutral-200 hover:border-slate-300'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="your.email@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-2">
              {accountType === 'gmail' ? 'App Password' : 'Password'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder={accountType === 'gmail' ? 'App password (not your regular password)' : 'Your password'}
            />
            {accountType === 'gmail' && (
              <p className="text-xs text-neutral-500 mt-1">
                Create an app password in your Google Account settings
              </p>
            )}
          </div>

          {/* IMAP Host */}
          {accountType === 'imap' && (
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">
                IMAP Server
              </label>
              <input
                type="text"
                value={imapHost}
                onChange={(e) => setImapHost(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="imap.example.com"
              />
            </div>
          )}

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Connect Account
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// Settings Panel
// ============================================

interface SettingsPanelProps {
  accounts: EmailAccount[];
  storageQuota: StorageQuota | null;
  onClose: () => void;
  onAccountDisconnect: () => void;
}

function SettingsPanel({ accounts, storageQuota, onClose, onAccountDisconnect }: SettingsPanelProps) {
  const handleDisconnect = async (accountId: number) => {
    if (!confirm('Are you sure you want to disconnect this account?')) return;

    try {
      await emailInboxApi.disconnectEmailAccount(accountId);
      toast.success('Account disconnected');
      onAccountDisconnect();
    } catch (error) {
      toast.error('Failed to disconnect account');
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25 }}
      className="fixed right-0 top-0 h-full w-96 bg-white border-l border-neutral-200 shadow-2xl z-50 overflow-y-auto"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Connected Accounts */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Connected Accounts</h3>
          {accounts.length === 0 ? (
            <p className="text-neutral-500 text-sm">No accounts connected</p>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="p-4 border border-neutral-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">{account.email_address}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      account.sync_status === 'synced' ? 'bg-green-100 text-green-700' :
                      account.sync_status === 'syncing' ? 'bg-orange-100 text-orange-600' :
                      account.sync_status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-neutral-100 text-neutral-600'
                    }`}>
                      {account.sync_status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-neutral-500">
                    <span>{account.total_emails_synced} emails synced</span>
                    <button
                      onClick={() => handleDisconnect(account.id)}
                      className="text-red-400 hover:text-red-300 font-medium"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Storage Info */}
        {storageQuota && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Storage Usage</h3>
            <div className="p-4 bg-gradient-to-br from-orange-50/5 to-amber-50/5 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">Total Usage</span>
                <span className="text-lg font-bold text-orange-500">
                  {storageQuota.usage_percentage.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-indigo-500 rounded-full transition-all"
                  style={{ width: `${storageQuota.usage_percentage}%` }}
                />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Emails</span>
                  <span className="font-medium">
                    {(storageQuota.emails_bytes / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Documents</span>
                  <span className="font-medium">
                    {(storageQuota.documents_bytes / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Resumes</span>
                  <span className="font-medium">
                    {(storageQuota.resumes_bytes / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
