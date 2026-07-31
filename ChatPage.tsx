import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MessageCircle,
  Send,
  Users,
  Loader2,
  Trash2,
  ArrowLeft,
  Search,
  Circle,
} from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToasts } from '@/hooks/useToasts';
import { ToastContainer } from '@/components/Toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { api } from '@/lib/apiClient';
import { supabase } from '@/lib/supabase';

type ChatUser = {
  id: string;
  username: string;
  role: string;
  teacher_name: string | null;
  teacher_photo: string | null;
  is_online: boolean;
  last_seen: string | null;
};

type GroupMessage = {
  id: string;
  user_id: string;
  message: string | null;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
};

type DirectMessage = {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string | null;
  is_read: boolean;
  is_deleted: boolean;
  created_at: string;
};

type ChatMode = 'list' | 'group' | 'dm';

export function ChatPage() {
  const { lang } = useI18n();
  const { user } = useAuth();
  const { toasts, notify, dismiss } = useToasts();
  const [mode, setMode] = useState<ChatMode>('list');
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ChatUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [dmMessages, setDmMessages] = useState<DirectMessage[]>([]);
  const [dmTarget, setDmTarget] = useState<ChatUser | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'group' | 'dm' } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = (en: string, km: string) => lang === 'km' ? km : en;

  const loadUsers = useCallback(async () => {
    try {
      const [allUsers, onlineData] = await Promise.all([
        api.getAllUsers(),
        api.getOnlineUsers(),
      ]);
      const merged = allUsers.map((u) => {
        const onlineInfo = onlineData.find((o) => o.user_id === u.id);
        return {
          ...u,
          is_online: onlineInfo?.is_online ?? false,
          last_seen: onlineInfo?.last_seen ?? null,
        };
      });
      const sorted = merged.sort((a, b) => {
        if (a.is_online && !b.is_online) return -1;
        if (!a.is_online && b.is_online) return 1;
        const aName = a.teacher_name ?? a.username;
        const bName = b.teacher_name ?? b.username;
        return aName.localeCompare(bName);
      });
      setUsers(sorted);
      setFilteredUsers(sorted);
    } catch {
      // ignore
    }
  }, []);

  const loadGroupMessages = useCallback(async () => {
    try {
      const msgs = await api.getGroupMessages();
      setGroupMessages(msgs);
    } catch {
      // ignore
    }
  }, []);

  const loadDmMessages = useCallback(async (otherUserId: string) => {
    try {
      const msgs = await api.getDirectMessages(otherUserId);
      setDmMessages(msgs);
      await api.markDirectMessagesRead(otherUserId);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadUsers().finally(() => setLoading(false));
    loadGroupMessages();
  }, [loadUsers, loadGroupMessages]);

  // Realtime subscriptions
  useEffect(() => {
    const groupChannel = supabase
      .channel('group-chat')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: 'room_id=eq.00000000-0000-0000-0000-000000000001' },
        (payload) => {
          const newMsg = payload.new as GroupMessage;
          setGroupMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        })
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const updated = payload.new as GroupMessage;
          if (updated.is_deleted) {
            setGroupMessages((prev) => prev.filter((m) => m.id !== updated.id));
          }
        })
      .subscribe();

    const dmChannel = supabase
      .channel('dm-chat')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages' },
        (payload) => {
          const newMsg = payload.new as DirectMessage;
          if (mode === 'dm' && dmTarget) {
            if (newMsg.sender_id === dmTarget.id || newMsg.receiver_id === dmTarget.id) {
              setDmMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });
              if (newMsg.sender_id === dmTarget.id) {
                api.markDirectMessagesRead(dmTarget.id).catch(() => {});
              }
            }
          }
        })
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'direct_messages' },
        (payload) => {
          const updated = payload.new as DirectMessage;
          if (updated.is_deleted) {
            setDmMessages((prev) => prev.filter((m) => m.id !== updated.id));
          }
        })
      .subscribe();

    const presenceChannel = supabase
      .channel('presence')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        () => { loadUsers(); })
      .subscribe();

    return () => {
      supabase.removeChannel(groupChannel);
      supabase.removeChannel(dmChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [mode, dmTarget, loadUsers]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [groupMessages, dmMessages, mode]);

  // Search filter
  useEffect(() => {
    const q = searchQuery.toLowerCase();
    setFilteredUsers(users.filter((u) =>
      (u.teacher_name ?? u.username).toLowerCase().includes(q)
    ));
  }, [searchQuery, users]);

  // Periodic refresh of online status
  useEffect(() => {
    const interval = setInterval(() => { loadUsers(); }, 30000);
    return () => clearInterval(interval);
  }, [loadUsers]);

  const sendGroupMessage = useCallback(async () => {
    if (!input.trim()) return;
    setSending(true);
    try {
      await api.sendGroupMessage(input.trim());
      setInput('');
    } catch {
      notify('error', t('Failed to send', 'បរាជ័យក្នុងការផ្ញើ'));
    }
    setSending(false);
  }, [input, notify, lang]);

  const sendDmMessage = useCallback(async () => {
    if (!input.trim() || !dmTarget) return;
    setSending(true);
    try {
      await api.sendDirectMessage(dmTarget.id, input.trim());
      setInput('');
    } catch {
      notify('error', t('Failed to send', 'បរាជ័យក្នុងការផ្ញើ'));
    }
    setSending(false);
  }, [input, dmTarget, notify, lang]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === 'group') {
        await api.deleteGroupMessage(deleteTarget.id);
        setGroupMessages((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      } else {
        await api.deleteDirectMessage(deleteTarget.id);
        setDmMessages((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      }
      setDeleteTarget(null);
    } catch {
      notify('error', t('Failed to delete', 'បរាជ័យក្នុងការលុប'));
    }
    setDeleting(false);
  }, [deleteTarget, notify, lang]);

  const openDm = (target: ChatUser) => {
    setDmTarget(target);
    setMode('dm');
    loadDmMessages(target.id);
  };

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString(lang === 'km' ? 'km-KH' : 'en-GB', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const getDisplayName = (msg: GroupMessage) => {
    const u = users.find((usr) => usr.id === msg.user_id);
    return u?.teacher_name ?? u?.username ?? msg.user_id.slice(0, 8);
  };

  const getAvatar = (userId: string) => {
    const u = users.find((usr) => usr.id === userId);
    return u?.teacher_photo ?? null;
  };

  const isMyMessage = (userId: string) => user?.id === userId;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  // ─── Chat List View ───
  if (mode === 'list') {
    return (
      <div className="mx-auto max-w-2xl px-4 pb-10 pt-4">
        <ToastContainer toasts={toasts} onClose={dismiss} />

        {/* Group chat button */}
        <button
          onClick={() => setMode('group')}
          className="mb-4 flex w-full items-center gap-3 rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50 to-purple-50 p-4 text-left transition-all hover:shadow-md dark:border-brand-800 dark:from-brand-900/20 dark:to-purple-900/20"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
            <Users className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900 dark:text-white">{t('School Group', 'ក្រុមសាលា')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('All teachers', 'គ្រូទាំងអស់')} · {groupMessages.length} {t('messages', 'សារ')}</p>
          </div>
          <MessageCircle className="h-5 w-5 text-brand-400" />
        </button>

        {/* Search */}
        <div className="mb-3 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search teachers...', 'ស្វែងរកគ្រូ...')}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Direct message list */}
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">{t('Direct Messages', 'សារផ្ទាល់ខ្លួន')}</p>
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Users className="mb-2 h-10 w-10" />
            <p className="text-sm">{t('No users found', 'មិនមានអ្នកប្រើ')}</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filteredUsers.map((u) => (
              <li key={u.id}>
                <button
                  onClick={() => openDm(u)}
                  className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left transition-all hover:border-brand-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="relative flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-brand-100 dark:bg-brand-800">
                      {u.teacher_photo ? (
                        <img src={u.teacher_photo} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-brand-700 dark:text-brand-200">
                          {(u.teacher_name ?? u.username).charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-white dark:bg-gray-900 ring-1 ring-white dark:ring-gray-900`}>
                      <Circle className={`h-2 w-2 ${u.is_online ? 'text-green-500 fill-green-500' : 'text-gray-400 fill-gray-400'}`} />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {u.teacher_name ?? u.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {u.is_online
                        ? t('Active now', 'កំពុងប្រើ')
                        : t('Offline', 'ក្រៅបណ្តាញ')}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // ─── Chat View (Group or DM) ───
  const messages = mode === 'group' ? groupMessages : dmMessages;
  const chatTitle = mode === 'group'
    ? t('School Group', 'ក្រុមសាលា')
    : dmTarget?.teacher_name ?? dmTarget?.username ?? '';
  const chatSubtitle = mode === 'group'
    ? `${users.length + 1} ${t('members', 'សមាជិក')}`
    : dmTarget?.is_online
      ? t('Active now', 'កំពុងប្រើ')
      : t('Offline', 'ក្រៅបណ្តាញ');

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-2xl flex-col px-4 pb-4 pt-4">
      <ToastContainer toasts={toasts} onClose={dismiss} />

      {/* Chat header */}
      <div className="mb-3 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <button
          onClick={() => { setMode('list'); setDmMessages([]); setDmTarget(null); }}
          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="relative flex-shrink-0">
          {mode === 'group' ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white">
              <Users className="h-5 w-5" />
            </div>
          ) : (
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-brand-100 dark:bg-brand-800">
                {dmTarget?.teacher_photo ? (
                  <img src={dmTarget.teacher_photo} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-brand-700 dark:text-brand-200">
                    {chatTitle.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-white dark:bg-gray-900 ring-1 ring-white dark:ring-gray-900">
                <Circle className={`h-2 w-2 ${dmTarget?.is_online ? 'text-green-500 fill-green-500' : 'text-gray-400 fill-gray-400'}`} />
              </span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900 dark:text-white">{chatTitle}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{chatSubtitle}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-400">
            <MessageCircle className="mb-2 h-10 w-10" />
            <p className="text-sm">{t('No messages yet. Say hello!', 'មិនមានសារទេ។ ផ្ញើសារមួយ!')}</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {messages.map((msg) => {
              const isMine = isMyMessage(mode === 'group' ? (msg as GroupMessage).user_id : (msg as DirectMessage).sender_id);
              const senderName = mode === 'group' ? getDisplayName(msg as GroupMessage) : '';
              const avatar = getAvatar(mode === 'group' ? (msg as GroupMessage).user_id : (msg as DirectMessage).sender_id);
              const msgText = (msg as { message: string | null }).message;
              return (
                <li
                  key={msg.id}
                  className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : ''}`}
                >
                  <div className="flex-shrink-0">
                    <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-brand-100 dark:bg-brand-800">
                      {avatar ? (
                        <img src={avatar} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-brand-700 dark:text-brand-200">
                          {(senderName || (dmTarget?.teacher_name ?? '?')).charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`group relative max-w-[75%] rounded-2xl px-3 py-2 ${
                    isMine
                      ? 'bg-brand-600 text-white'
                      : 'bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  }`}>
                    {mode === 'group' && !isMine && (
                      <p className="mb-0.5 text-[10px] font-semibold text-brand-600 dark:text-brand-400">{senderName}</p>
                    )}
                    <p className="text-sm break-words whitespace-pre-wrap">{msgText}</p>
                    <p className={`mt-0.5 text-[10px] ${isMine ? 'text-white/60' : 'text-gray-400'}`}>
                      {formatTime(msg.created_at)}
                    </p>
                    {isMine && (
                      <button
                        onClick={() => setDeleteTarget({ id: msg.id, type: mode === 'group' ? 'group' : 'dm' })}
                        className="absolute -top-2 right-2 hidden rounded-full bg-red-100 p-1 text-red-500 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-red-900/40"
                        aria-label={t('Delete', 'លុប')}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="mt-3 flex items-center gap-2 rounded-2xl border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-800">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); mode === 'group' ? sendGroupMessage() : sendDmMessage(); } }}
          placeholder={t('Type a message...', 'វាយសារ...')}
          className="flex-1 rounded-xl border-0 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:bg-gray-900 dark:text-white"
        />
        <button
          onClick={mode === 'group' ? sendGroupMessage : sendDmMessage}
          disabled={!input.trim() || sending}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('Delete Message', 'លុបសារ')}
        message={t('Are you sure you want to delete this message?', 'តើអ្នកពិតជាចង់លុបសារនេះមែនទេ?')}
        confirmLabel={t('Delete', 'លុប')}
        cancelLabel={t('Cancel', 'បោះបង់')}
        variant="danger"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  );
}
