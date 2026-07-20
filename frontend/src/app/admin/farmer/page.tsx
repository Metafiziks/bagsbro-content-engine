//src/app/admin/farmer/page.tsx

'use client';
import { ReactNode } from 'react';
import { useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LingoEntry {
  _id: string;
  term: string;
  definition: string;
  examples: string[];
  usageContext: string[];
  weight: number;
  active: boolean;
}

interface Target {
  _id: string;
  handle: string;
  displayName?: string;
  tier: 'S' | 'A' | 'B' | 'C';
  followerCount?: number;
  lastReplied?: string;
  totalReplies: number;
  active: boolean;
  tags: string[];
}

interface MediaItem {
  _id: string;
  name: string;
  type: 'gif' | 'ipfs_image' | 'mp4';
  url: string;
  tags: string[];
  sentiment: string;
  usageCount: number;
  lastUsed?: string;
  cooldownHours: number;
  active: boolean;
  cloudinaryMetadata?: { duration?: number; bytes?: number };
}

interface QueuedPost {
  _id: string;
  type: string;
  content: string;
  scheduledFor: string;
  status: 'scheduled' | 'posted' | 'skipped';
  imageBase64?: string;
  imageDescription?: string;
  imageMimeType?: string;
  imageCloudinaryUrl?: string;
  videoBase64?: string;
  videoUrl?: string;
  animated?: boolean;
  trendName?: string;
  trendCategory?: string;
  topicUsed?: string;
  gifMediaUrl?: string;
}

interface PendingReply {
  _id: string;
  targetHandle: string;
  targetTweetText: string;
  content: string;
  relevanceScore: number;
}

interface Stats {
  postsToday: number;
  repliesToday: number;
  pendingReplies: number;
  totalTargets: number;
  activeTargets: number;
  totalLingo: number;
  totalMedia: number;
  nextPostMinutes: number | null;
}

type Tab = 'overview' | 'queue' | 'lingo' | 'targets' | 'media' | 'replies' | 'bag_tech';

// ─── Constants ────────────────────────────────────────────────────────────────
const TIER_COLORS: Record<string, string> = {
  S: '#FFD700', A: '#FF6B35', B: '#00F5FF', C: '#9B59B6'
};

const SENTIMENT_COLORS: Record<string, string> = {
  bullish: '#00FF88', bearish: '#FF4444', neutral: '#888', chaotic: '#FF6B35'
};

// ─── Pixel border component (matches Bags Bro card style) ─────────────────────
function PixelCard({ children, className, glow, color, style }: { 
  children: ReactNode; 
  className?: string; 
  glow?: boolean; 
  color?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        background: '#0D0D1A',
        border: `2px solid ${color}`,
        borderRadius: 0,
        boxShadow: glow ? `0 0 20px ${color}66, inset 0 0 20px ${color}11` : `2px 2px 0 ${color}44`,
        position: 'relative',
        // Pixel corner notches
        clipPath: 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)',
      }}
    >
      {children}
    </div>
  );
}

// ─── Pixel Button ─────────────────────────────────────────────────────────────
function PixelBtn({ children, onClick, color = '#FF3366', small = false, disabled = false }: {
  children: React.ReactNode;
  onClick?: () => void;
  color?: string;
  small?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: small ? 8 : 10,
        padding: small ? '6px 10px' : '10px 16px',
        background: disabled ? '#1a1a2e' : `${color}22`,
        border: `2px solid ${disabled ? '#333' : color}`,
        color: disabled ? '#444' : color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        letterSpacing: 1,
        clipPath: 'polygon(4px 0%, calc(100% - 4px) 0%, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0% calc(100% - 4px), 0% 4px)',
        transition: 'all 0.15s',
        boxShadow: disabled ? 'none' : `0 0 8px ${color}44`,
      }}
      onMouseEnter={e => { if (!disabled) (e.target as HTMLElement).style.background = `${color}44`; }}
      onMouseLeave={e => { if (!disabled) (e.target as HTMLElement).style.background = `${color}22`; }}
    >
      {children}
    </button>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, sub }: {
  label: string; value: string | number; color: string; sub?: string;
}) {
  return (
    <PixelCard color={color} style={{ padding: '16px 20px' }}>
      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#666', letterSpacing: 1, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 22, color, lineHeight: 1.2 }}>
        {value}
      </div>
      {sub && <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#555', marginTop: 4 }}>{sub}</div>}
    </PixelCard>
  );
}

// ─── Tag Badge ────────────────────────────────────────────────────────────────
function Tag({ label, color = '#333' }: { label: string; color?: string }) {
  return (
    <span style={{
      fontSize: 9,
      fontFamily: 'monospace',
      padding: '2px 6px',
      background: `${color}22`,
      border: `1px solid ${color}66`,
      color: color === '#333' ? '#888' : color,
      letterSpacing: 1,
      clipPath: 'polygon(3px 0, calc(100% - 3px) 0, 100% 3px, 100% calc(100% - 3px), calc(100% - 3px) 100%, 3px 100%, 0 calc(100% - 3px), 0 3px)',
    }}>{label}</span>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, color = '#FF3366' }: {
  title: string; onClose: () => void; children: React.ReactNode; color?: string;
}) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 560 }}>
        <PixelCard color={color} glow>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${color}44`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 12, color }}>{title}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
          <div style={{ padding: 24 }}>{children}</div>
        </PixelCard>
      </div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontFamily: 'monospace', fontSize: 10, color: '#888', letterSpacing: 2, marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  background: '#080810',
  border: '1px solid #2a2a4a',
  color: '#e0e0ff',
  padding: '8px 12px',
  fontFamily: 'monospace',
  fontSize: 12,
  outline: 'none',
  boxSizing: 'border-box' as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
export default function FarmerDashboard() {
  const [authStatus, setAuthStatus] = useState<'loading' | 'authed' | 'unauthed'>('loading');
  const [tab, setTab] = useState<Tab>('overview');
  const [botActive, setBotActive] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [lingo, setLingo] = useState<LingoEntry[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [replies, setReplies] = useState<PendingReply[]>([]);
  const [queue, setQueue] = useState<QueuedPost[]>([]);
  const [videoPolling, setVideoPolling] = useState(false); // true while waiting for Seedance
  const [selectedQueuePost, setSelectedQueuePost] = useState<QueuedPost | null>(null);
  const [queueEditContent, setQueueEditContent] = useState('');
  const [queueWorking, setQueueWorking] = useState<string | null>(null); // id of post being acted on
  const [promoteModal, setPromoteModal] = useState<QueuedPost | null>(null);
  const [promoteForm, setPromoteForm] = useState({ name: '', tags: '', sentiment: 'neutral' });
  const [trendStatus, setTrendStatus] = useState<{
    diagnostics: { error?: string; rawCount?: number; qualifiedCount?: number; qualified?: Array<{name: string; score: number; category: string; volume: number}>; rejected?: Array<{name: string; score: number; skip: boolean; volume: number}>; fetchedAt?: string } | null;
    cachedTrends: Array<{ name: string; score: number; category: string; tweetVolume: number }> | null;
  } | null>(null);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [testPosting, setTestPosting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Modals
  const [addLingoModal, setAddLingoModal] = useState(false);
  const [editLingo, setEditLingo] = useState<LingoEntry | null>(null);
  const [addTargetModal, setAddTargetModal] = useState(false);
  const [addMediaModal, setAddMediaModal] = useState(false);
  const [editMedia, setEditMedia] = useState<MediaItem | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [bagTechPreview, setBagTechPreview] = useState<{
    tweetText: string; imageDescription: string; topicUsed: string; imageBase64: string;
  } | null>(null);
  const [bagTechLoading, setBagTechLoading] = useState(false);

  // Forms
  const [lingoForm, setLingoForm] = useState({ term: '', definition: '', examples: '', weight: 5, usageContext: 'both', active: true });
  const [targetForm, setTargetForm] = useState({ handle: '', tier: 'B', followerCount: '', tags: '' });
  const [mediaForm, setMediaForm] = useState({ name: '', type: 'gif', url: '', tags: '', sentiment: 'neutral', file: null as File | null });

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setAuthStatus('unauthed');
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setAuthStatus(data.authenticated && data.user?.isAdmin ? 'authed' : 'unauthed');
      })
      .catch(() => setAuthStatus('unauthed'));
  }, []);

  // Redirect if unauthed
  useEffect(() => {
    if (authStatus === 'unauthed') {
      window.location.href = '/admin/login';
    }
  }, [authStatus]);

  // Glitch effect on tab change
  useEffect(() => {
    setGlitch(true);
    const t = setTimeout(() => setGlitch(false), 300);
    return () => clearTimeout(t);
  }, [tab]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'overview') {
        const r = await fetch('/api/farmer/stats');
        setStats(await r.json());
      } else if (tab === 'lingo') {
        const r = await fetch('/api/farmer/lingo');
        setLingo(await r.json());
      } else if (tab === 'targets') {
        const r = await fetch('/api/farmer/targets');
        setTargets(await r.json());
      } else if (tab === 'queue') {
        const r = await fetch('/api/farmer/queue');
        setQueue(await r.json());
      } else if (tab === 'media') {
        const r = await fetch('/api/farmer/media');
        setMedia(await r.json());
      } else if (tab === 'replies') {
        const r = await fetch('/api/farmer/replies?status=pending_approval');
        setReplies(await r.json());
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [tab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Poll for video completion when a trending/bag_tech post is selected and not yet animated
  useEffect(() => {
    if (!selectedQueuePost) { setVideoPolling(false); return; }
    const needsVideo = (selectedQueuePost.type === 'trending' || selectedQueuePost.type === 'bag_tech')
      && selectedQueuePost.imageBase64
      && selectedQueuePost.imageBase64 !== '[image]'
      && !selectedQueuePost.animated;
    if (!needsVideo) { setVideoPolling(false); return; }

    setVideoPolling(true);
    let cancelled = false;

    const poll = async () => {
      while (!cancelled) {
        await new Promise(r => setTimeout(r, 8000)); // check every 8s
        if (cancelled) break;
        try {
          const r = await fetch(`/api/farmer/queue/${selectedQueuePost._id}`);
          if (!r.ok) break;
          const post: QueuedPost = await r.json();
          if (post.animated && post.videoBase64) {
            setSelectedQueuePost(prev => prev?._id === post._id ? {
              ...prev,
              videoBase64: post.videoBase64,
              videoUrl: post.videoUrl,
              animated: true,
            } : prev);
            setVideoPolling(false);
            break;
          }
        } catch { break; }
      }
    };

    poll();
    return () => { cancelled = true; setVideoPolling(false); };
  }, [selectedQueuePost?._id, selectedQueuePost?.animated]);


  if (authStatus === 'loading') {
    return (
      <div style={{
        minHeight: '100vh', background: '#0a0a0a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Press Start 2P', monospace", color: '#FF3366', fontSize: 10,
      }}>
        LOADING...
      </div>
    );
  }

  if (authStatus === 'unauthed') return null;

  // ── Lingo CRUD ───────────────────────────────────────────────────────────
  const saveLingo = async () => {
    const payload = {
      term: lingoForm.term,
      definition: lingoForm.definition,
      examples: lingoForm.examples.split('\n').filter(Boolean),
      usageContext: lingoForm.usageContext === 'both' ? ['post', 'reply'] : [lingoForm.usageContext],
      weight: lingoForm.weight,
      active: lingoForm.active,
    };
    if (editLingo) {
      await fetch(`/api/farmer/lingo/${editLingo._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    } else {
      await fetch('/api/farmer/lingo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    }
    setAddLingoModal(false);
    setEditLingo(null);
    setLingoForm({ term: '', definition: '', examples: '', weight: 5, usageContext: 'both', active: true });
    fetchData();
  };

  const toggleLingo = async (entry: LingoEntry) => {
    await fetch(`/api/farmer/lingo/${entry._id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !entry.active }),
    });
    fetchData();
  };

  const deleteLingo = async (id: string) => {
    if (!confirm('Delete this lingo entry?')) return;
    await fetch(`/api/farmer/lingo/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const openEditLingo = (entry: LingoEntry) => {
    setEditLingo(entry);
    setLingoForm({
      term: entry.term,
      definition: entry.definition,
      examples: entry.examples.join('\n'),
      weight: entry.weight,
      usageContext: entry.usageContext.includes('post') && entry.usageContext.includes('reply') ? 'both' : entry.usageContext[0],
      active: entry.active,
    });
    setAddLingoModal(true);
  };

  // ── Target CRUD ──────────────────────────────────────────────────────────
  const saveTarget = async () => {
    const payload = {
      handle: targetForm.handle.startsWith('@') ? targetForm.handle : `@${targetForm.handle}`,
      tier: targetForm.tier,
      followerCount: targetForm.followerCount ? parseInt(targetForm.followerCount) : undefined,
      tags: targetForm.tags.split(',').map(t => t.trim()).filter(Boolean),
    };
    await fetch('/api/farmer/targets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setAddTargetModal(false);
    setTargetForm({ handle: '', tier: 'B', followerCount: '', tags: '' });
    fetchData();
  };

  const toggleTarget = async (t: Target) => {
    await fetch(`/api/farmer/targets/${t._id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !t.active }),
    });
    fetchData();
  };

  const deleteTarget = async (id: string) => {
    if (!confirm('Remove this target?')) return;
    await fetch(`/api/farmer/targets/${id}`, { method: 'DELETE' });
    fetchData();
  };

  // ── Media ────────────────────────────────────────────────────────────────
  const saveMedia = async () => {
    const needsUpload = (mediaForm.type === 'mp4' || mediaForm.type === 'ipfs_image') && mediaForm.file;

    if (needsUpload) {
      setUploadProgress('Uploading to Cloudinary...');
      const fd = new FormData();
      fd.append('file', mediaForm.file!);
      fd.append('name', mediaForm.name);
      fd.append('tags', mediaForm.tags);
      fd.append('sentiment', mediaForm.sentiment);
      if (editMedia) fd.append('replaceId', editMedia._id);
      await fetch('/api/farmer/media/upload', { method: 'POST', body: fd });
      setUploadProgress(null);
    } else if (editMedia) {
      const payload = {
        name: mediaForm.name,
        tags: mediaForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        sentiment: mediaForm.sentiment,
      };
      await fetch(`/api/farmer/media/${editMedia._id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
    } else {
      const payload = {
        name: mediaForm.name,
        type: mediaForm.type,
        url: mediaForm.url,
        tags: mediaForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        sentiment: mediaForm.sentiment,
      };
      await fetch('/api/farmer/media', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    }
    setAddMediaModal(false);
    setEditMedia(null);
    setMediaForm({ name: '', type: 'gif', url: '', tags: '', sentiment: 'neutral', file: null });
    fetchData();
  };

  const deleteMedia = async (id: string) => {
    if (!confirm('Remove this media item?')) return;
    await fetch(`/api/farmer/media/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const openEditMedia = (item: MediaItem) => {
    setEditMedia(item);
    setMediaForm({
      name: item.name,
      type: item.type,
      url: item.url,
      tags: (item.tags ?? []).join(', '),
      sentiment: item.sentiment || 'neutral',
      file: null,
    });
    setAddMediaModal(true);
  };

  // ── Reply actions ────────────────────────────────────────────────────────
  const handleReply = async (id: string, status: 'approved' | 'skipped') => {
    await fetch(`/api/farmer/replies/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setReplies(prev => prev.filter(r => r._id !== id));
  };

  // ── Queue actions ────────────────────────────────────────────────────────
  const loadQueuePost = async (post: QueuedPost) => {
    if (selectedQueuePost?._id === post._id) { setSelectedQueuePost(null); return; }
    setQueueWorking(post._id);
    try {
      const r = await fetch(`/api/farmer/queue/${post._id}`);
      const full = await r.json();
      setSelectedQueuePost(full);
      setQueueEditContent(full.content);
    } catch (e) { console.error(e); }
    setQueueWorking(null);
  };

  const saveQueueContent = async () => {
    if (!selectedQueuePost) return;
    setQueueWorking(selectedQueuePost._id);
    await fetch(`/api/farmer/queue/${selectedQueuePost._id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: queueEditContent }),
    });
    setSelectedQueuePost(p => p ? { ...p, content: queueEditContent } : null);
    setQueueWorking(null);
    fetchData();
  };

  const pushNow = async (id: string) => {
    if (!confirm('Post this immediately to X?')) return;
    setQueueWorking('push-now');
    try {
      const r = await fetch(`/api/farmer/queue/${id}/publish-now`, { method: 'POST' });
      const text = await r.text();
      const data = text ? JSON.parse(text) : {};
      if (r.ok && data.success) {
        setSelectedQueuePost(null);
        fetchData();
      } else {
        alert(`Failed to post: ${data.error ?? `HTTP ${r.status}`}`);
      }
    } catch (e: any) {
      console.error(e);
      alert(`Error: ${e.message}`);
    }
    setQueueWorking(null);
  };

  const regenContent = async () => {
    if (!selectedQueuePost) return;
    setQueueWorking('regen-content');
    try {
      const r = await fetch(`/api/farmer/queue/${selectedQueuePost._id}/regenerate-content`, { method: 'POST' });
      const data = await r.json();
      if (data.success) {
        setQueueEditContent(data.content);
        setSelectedQueuePost(p => p ? { ...p, content: data.content } : null);
        fetchData();
      }
    } catch (e) { console.error(e); }
    setQueueWorking(null);
  };

  const regenImage = async () => {
    if (!selectedQueuePost) return;
    setQueueWorking('regen-image');
    try {
      const r = await fetch(`/api/farmer/queue/${selectedQueuePost._id}/regenerate-image`, { method: 'POST' });
      const data = await r.json();
      if (data.success) {
        setSelectedQueuePost(p => p ? {
          ...p,
          imageBase64: data.imageBase64,
          videoBase64: data.videoBase64,
          videoUrl: data.videoUrl,
          animated: !!data.videoBase64,
        } : null);
      }
    } catch (e) { console.error(e); }
    setQueueWorking(null);
  };

  const skipQueuePost = async (id: string) => {
    if (!confirm('Skip this post? It will not be published.')) return;
    await fetch(`/api/farmer/queue/${id}`, { method: 'DELETE' });
    setSelectedQueuePost(null);
    fetchData();
  };

  const promoteImage = async () => {
    if (!promoteModal) return;
    setQueueWorking('promote');
    try {
      await fetch(`/api/farmer/queue/${promoteModal._id}/promote-image`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: promoteForm.name,
          tags: promoteForm.tags.split(',').map(t => t.trim()).filter(Boolean),
          sentiment: promoteForm.sentiment,
        }),
      });
      setPromoteModal(null);
      setPromoteForm({ name: '', tags: '', sentiment: 'neutral' });
    } catch (e) { console.error(e); }
    setQueueWorking(null);
  };

  // ── Test actions ─────────────────────────────────────────────────────────
  const publishNow = async (forceTrending = false) => {
    if (testPosting) return;
    setTestPosting(true);
    setTestResult(null);
    try {
      const url = forceTrending
        ? '/api/farmer/posts/publish-now?type=trending'
        : '/api/farmer/posts/publish-now';
      const r = await fetch(url, { method: 'POST' });
      const data = await r.json();
      if (data.success === true) {
        setTestResult({ success: true, message: `✓ Posted successfully${forceTrending ? ' (trending)' : ''}` });
        fetchData();
      } else if (data.success === null) {
        setTestResult({ success: true, message: '⚠ Timed out — check X to confirm post went through' });
      } else {
        setTestResult({ success: false, message: `✗ Failed: ${data.error ?? 'unknown error'}` });
      }
    } catch (e: any) {
      setTestResult({ success: false, message: `✗ Request failed: ${e.message}` });
    }
    setTestPosting(false);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      background: '#080810',
      minHeight: '100vh',
      color: '#e0e0ff',
      fontFamily: 'monospace',
    }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      {/* Scanline overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
      }} />

      {/* ── Header ── */}
      <div style={{
        borderBottom: '2px solid #FF336644',
        padding: '16px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(90deg, #0D0D1A 0%, #080810 100%)',
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 22,
            filter: 'drop-shadow(0 0 12px rgba(255,51,102,0.9))',
          }}>🛍️</span>
          <div>
            <div style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 14,
              color: '#FF3366',
              textShadow: '0 0 20px rgba(255,51,102,0.8), 0 0 40px rgba(0,245,255,0.4)',
              letterSpacing: 2,
            }}>
              BAGS BRO!
            </div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: '#444', letterSpacing: 3, marginTop: 4 }}>
              ENGAGEMENT FARMER
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: '#444' }}>
            {stats?.nextPostMinutes != null
              ? `NEXT POST: ${stats.nextPostMinutes}m`
              : 'NEXT POST: —'}
          </div>
          <PixelBtn
            color={botActive ? '#00FF88' : '#FF4444'}
            onClick={() => setBotActive(!botActive)}
          >
            {botActive ? '● ACTIVE' : '○ PAUSED'}
          </PixelBtn>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #1a1a2e',
        background: '#0a0a14',
        paddingLeft: 32,
        overflowX: 'auto',
      }}>
        {(['overview', 'queue', 'lingo', 'targets', 'media', 'replies', 'bag_tech'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '14px 20px',
              background: 'none',
              border: 'none',
              borderBottom: tab === t ? '3px solid #FF3366' : '3px solid transparent',
              color: tab === t ? '#FF3366' : '#444',
              cursor: 'pointer',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 9,
              letterSpacing: 2,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              textShadow: tab === t ? '0 0 10px rgba(255,51,102,0.6)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {t}
            {t === 'replies' && replies.length > 0 && (
              <span style={{
                marginLeft: 6,
                background: '#FF3366',
                color: '#fff',
                fontSize: 8,
                padding: '1px 5px',
                fontFamily: 'monospace',
              }}>{replies.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div style={{
        padding: '32px',
        opacity: glitch ? 0.7 : 1,
        transform: glitch ? 'translateX(2px)' : 'none',
        transition: 'all 0.1s',
        maxWidth: 1400,
        margin: '0 auto',
      }}>

        {/* ────────────── OVERVIEW ────────────── */}
        {tab === 'overview' && (
          <div>
            <div style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 10,
              color: '#FF3366', letterSpacing: 3, marginBottom: 24,
              textShadow: '0 0 10px rgba(255,51,102,0.6)',
            }}>
              // BAGAVERSE COMMAND CENTER
            </div>

            {/* Test Controls */}
            <PixelCard color="#FF3366" style={{ padding: 24, marginBottom: 24 }}>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#FF3366', marginBottom: 16 }}>
                // TEST CONTROLS
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <PixelBtn color="#00FF88" onClick={() => publishNow(false)} disabled={testPosting}>
                  {testPosting ? 'POSTING...' : '▶ PUBLISH NOW'}
                </PixelBtn>
                <PixelBtn color="#00F5FF" onClick={() => publishNow(true)} disabled={testPosting}>
                  {testPosting ? 'POSTING...' : '📈 FORCE TRENDING POST'}
                </PixelBtn>
                <PixelBtn color="#9B59B6" onClick={async () => {
                  setTestResult(null);
                  try {
                    const r = await fetch('/api/farmer/queue/generate-now', { method: 'POST' });
                    const data = await r.json();
                    setTestResult({ success: true, message: `🎲 ${data.message ?? 'Queue generation started'}` });
                  } catch (e: any) {
                    setTestResult({ success: false, message: `✗ ${e.message}` });
                  }
                }} disabled={testPosting}>
                  🎲 GENERATE QUEUE NOW
                </PixelBtn>
                {testResult && (
                  <div style={{
                    fontFamily: 'monospace', fontSize: 12,
                    color: testResult.success ? '#00FF88' : '#FF4444',
                    padding: '8px 12px',
                    background: testResult.success ? '#00FF8811' : '#FF444411',
                    border: `1px solid ${testResult.success ? '#00FF8844' : '#FF444444'}`,
                  }}>
                    {testResult.message}
                  </div>
                )}
              </div>
            </PixelCard>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
              <StatCard label="POSTS TODAY" value={`${stats?.postsToday ?? '—'}/5`} color="#FF6B35" />
              <StatCard label="REPLIES TODAY" value={`${stats?.repliesToday ?? '—'}/20`} color="#00F5FF" />
              <StatCard label="PENDING REPLIES" value={stats?.pendingReplies ?? '—'} color="#FF3366" sub="awaiting approval" />
              <StatCard label="ACTIVE TARGETS" value={stats?.activeTargets ?? '—'} color="#FFD700" sub={`of ${stats?.totalTargets ?? '—'} total`} />
              <StatCard label="LINGO ENTRIES" value={stats?.totalLingo ?? '—'} color="#9B59B6" />
              <StatCard label="MEDIA ASSETS" value={stats?.totalMedia ?? '—'} color="#00FF88" />
            </div>

            {/* Bagaverse status */}
            <PixelCard color="#FF6B35" style={{ padding: 24 }}>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#FF6B35', marginBottom: 16 }}>
                // BAG THEORY STATUS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {[
                  { label: 'BAGGISH LEVEL', value: '███████░░░', color: '#00FF88' },
                  { label: 'BOT DETECTION RISK', value: '██░░░░░░░░', color: '#FFD700' },
                  { label: 'BAG ENERGY', value: '████████░░', color: '#FF6B35' },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#555', letterSpacing: 2, marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: s.color, letterSpacing: 2 }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </PixelCard>

            {/* Trends Diagnostics */}
            <PixelCard color="#9B59B6" style={{ padding: 24, marginTop: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#9B59B6' }}>
                  // TREND ENGINE STATUS
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <PixelBtn small color="#9B59B6" disabled={trendsLoading} onClick={async () => {
                    setTrendsLoading(true);
                    try {
                      const r = await fetch('/api/farmer/trends/status');
                      setTrendStatus(await r.json());
                    } catch (e) { console.error(e); }
                    setTrendsLoading(false);
                  }}>
                    {trendsLoading ? 'LOADING...' : '↺ CHECK STATUS'}
                  </PixelBtn>
                  <PixelBtn small color="#FF6B35" disabled={trendsLoading} onClick={async () => {
                    setTrendsLoading(true);
                    try {
                      const r = await fetch('/api/farmer/trends/refresh', { method: 'POST' });
                      const data = await r.json();
                      // Reload status after refresh
                      const r2 = await fetch('/api/farmer/trends/status');
                      setTrendStatus(await r2.json());
                      setTestResult({ success: true, message: `Fetched ${data.count} qualifying trends` });
                    } catch (e) { console.error(e); }
                    setTrendsLoading(false);
                  }}>
                    ⚡ FORCE REFRESH
                  </PixelBtn>
                </div>
              </div>

              {!trendStatus ? (
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#444' }}>Click CHECK STATUS to see trend engine diagnostics</div>
              ) : (
                <div>
                  {trendStatus.diagnostics?.error && (
                    <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#FF4444', marginBottom: 12, padding: 8, background: '#FF444411', border: '1px solid #FF444433' }}>
                      ✗ FETCH ERROR: {trendStatus.diagnostics.error}
                    </div>
                  )}

                  {trendStatus.diagnostics && !trendStatus.diagnostics.error && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                      <div style={{ padding: 10, background: '#080810', border: '1px solid #1a1a2e' }}>
                        <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#555', marginBottom: 4 }}>RAW TRENDS</div>
                        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, color: '#9B59B6' }}>{trendStatus.diagnostics.rawCount ?? '—'}</div>
                      </div>
                      <div style={{ padding: 10, background: '#080810', border: '1px solid #1a1a2e' }}>
                        <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#555', marginBottom: 4 }}>QUALIFIED</div>
                        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, color: trendStatus.diagnostics.qualifiedCount ? '#00FF88' : '#FF4444' }}>
                          {trendStatus.diagnostics.qualifiedCount ?? '—'}
                        </div>
                      </div>
                      <div style={{ padding: 10, background: '#080810', border: '1px solid #1a1a2e' }}>
                        <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#555', marginBottom: 4 }}>LAST FETCH</div>
                        <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#888' }}>
                          {trendStatus.diagnostics.fetchedAt ? new Date(trendStatus.diagnostics.fetchedAt).toLocaleTimeString() : '—'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Qualified trends */}
                  {(trendStatus.cachedTrends ?? []).length > 0 ? (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#00FF88', letterSpacing: 2, marginBottom: 8 }}>✓ QUALIFIED TRENDS</div>
                      {(trendStatus.cachedTrends ?? []).map((t, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#080810', border: '1px solid #00FF8822', marginBottom: 4 }}>
                          <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#ccc' }}>{t.name}</span>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <Tag label={t.category} color="#9B59B6" />
                            <Tag label={`score: ${t.score}`} color="#00FF88" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#555', marginBottom: 12, padding: '8px 10px', border: '1px solid #333' }}>
                      No qualifying trends — supplement will pull from AI/tech/music feeds
                    </div>
                  )}

                  {/* Rejected trends sample */}
                  {(trendStatus.diagnostics?.rejected ?? []).length > 0 && (
                    <div>
                      <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#555', letterSpacing: 2, marginBottom: 8 }}>✗ FILTERED OUT (top 10)</div>
                      {(trendStatus.diagnostics?.rejected ?? []).slice(0, 10).map((t, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 10px', marginBottom: 2 }}>
                          <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#444' }}>{t.name}</span>
                          <span style={{ fontFamily: 'monospace', fontSize: 9, color: t.skip ? '#FF4444' : '#555' }}>
                            {t.skip ? 'SKIPPED' : `score: ${t.score}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </PixelCard>
          </div>
        )}

        {/* ────────────── QUEUE ────────────── */}
        {tab === 'queue' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: '#FF3366', letterSpacing: 2 }}>
                // POST QUEUE ({queue.filter(q => q.status === 'scheduled').length} scheduled)
              </div>
              <PixelBtn color="#FF3366" small onClick={fetchData}>↺ REFRESH</PixelBtn>
            </div>

            {loading ? (
              <div style={{ color: '#444', fontFamily: "'Press Start 2P', monospace", fontSize: 9 }}>LOADING QUEUE...</div>
            ) : queue.length === 0 ? (
              <PixelCard color="#2a2a4a" style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: '#444', marginBottom: 12 }}>
                  NO POSTS QUEUED
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#333' }}>
                  Queue generates each morning at wakeup (~8am ET)
                </div>
              </PixelCard>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: selectedQueuePost ? '1fr 1.4fr' : '1fr', gap: 24 }}>

                {/* Left — post list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {queue.map(post => {
                    const isSelected = selectedQueuePost?._id === post._id;
                    const statusColor = post.status === 'scheduled' ? '#00F5FF' : post.status === 'posted' ? '#00FF88' : '#555';
                    return (
                      <div
                        key={post._id}
                        onClick={() => post.status === 'scheduled' && loadQueuePost(post)}
                        style={{ cursor: post.status === 'scheduled' ? 'pointer' : 'default', opacity: post.status === 'skipped' ? 0.4 : 1 }}
                      >
                      <PixelCard
                        color={isSelected ? '#FF3366' : statusColor}
                        glow={isSelected}
                        style={{ padding: 14 }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <Tag label={post.type.toUpperCase()} color="#FF6B35" />
                            {post.trendName && <Tag label={`📈 ${post.trendName.slice(0, 18)}`} color="#9B59B6" />}
                            {!post.trendName && post.topicUsed && <Tag label={post.topicUsed.slice(0, 24)} color="#444" />}
                            {post.animated && <Tag label="🎬 VIDEO" color="#00FF88" />}
                            {!post.animated && post.imageBase64 === '[image]' && <Tag label="🎨 IMG" color="#FFD700" />}
                            {post.gifMediaUrl && <Tag label="GIF" color="#00F5FF" />}
                          </div>
                          <div style={{ fontFamily: 'monospace', fontSize: 10, color: statusColor, whiteSpace: 'nowrap', marginLeft: 8 }}>
                            {post.status === 'scheduled'
                              ? new Date(post.scheduledFor).toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit' })
                              : post.status.toUpperCase()}
                          </div>
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#aaa', lineHeight: 1.5 }}>
                          {post.content.slice(0, 100)}{post.content.length > 100 ? '...' : ''}
                        </div>
                        {queueWorking === post._id && (
                          <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#FF3366', marginTop: 6 }}>loading...</div>
                        )}
                      </PixelCard>
                      </div>
                    );
                  })}
                </div>

                {/* Right — post editor */}
                {selectedQueuePost && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <PixelCard color="#FF3366" glow style={{ padding: 20 }}>
                      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#FF3366', letterSpacing: 2, marginBottom: 6 }}>
                        // EDIT POST — {new Date(selectedQueuePost.scheduledFor).toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit' })} ET
                      </div>
                      {(selectedQueuePost.trendName || selectedQueuePost.topicUsed) && (
                        <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#555', marginBottom: 14, padding: '6px 10px', background: '#0a0a14', border: '1px solid #1a1a2e' }}>
                          {selectedQueuePost.trendName ? `📈 Trending: ${selectedQueuePost.trendName}` : `💡 Topic: ${selectedQueuePost.topicUsed}`}
                        </div>
                      )}

                      {/* Content editor */}
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ display: 'block', fontFamily: 'monospace', fontSize: 10, color: '#888', marginBottom: 6 }}>TWEET TEXT</label>
                        <textarea
                          style={{ ...inputStyle, height: 100, resize: 'vertical', lineHeight: 1.6, opacity: queueWorking ? 0.5 : 1 }}
                          value={queueEditContent}
                          onChange={e => setQueueEditContent(e.target.value)}
                          disabled={!!queueWorking}
                          placeholder="Edit tweet text..."
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                          <span style={{ fontFamily: 'monospace', fontSize: 10, color: queueEditContent.length > 240 ? '#FF4444' : '#555' }}>
                            {queueEditContent.length}/240
                          </span>
                        </div>
                      </div>

                      {/* Content action buttons */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                        <PixelBtn small color="#00FF88" onClick={saveQueueContent} disabled={!!queueWorking}>
                          {queueWorking === selectedQueuePost._id ? 'SAVING...' : queueEditContent !== selectedQueuePost.content ? '● SAVE TEXT' : 'SAVE TEXT'}
                        </PixelBtn>
                        <PixelBtn small color="#FFD700" onClick={regenContent} disabled={!!queueWorking}>
                          {queueWorking === 'regen-content' ? 'GENERATING...' : '↺ REGEN TEXT'}
                        </PixelBtn>
                        <PixelBtn small color="#FF6B35" onClick={() => pushNow(selectedQueuePost._id)} disabled={!!queueWorking}>
                          {queueWorking === 'push-now' ? 'POSTING...' : '🚀 POST NOW'}
                        </PixelBtn>
                        <PixelBtn small color="#FF4444" onClick={() => skipQueuePost(selectedQueuePost._id)} disabled={!!queueWorking}>
                          ✕ SKIP POST
                        </PixelBtn>
                      </div>

                      {/* GIF preview for hot_take posts */}
                      {selectedQueuePost.gifMediaUrl && (
                        <div style={{ marginBottom: 16 }}>
                          <label style={{ display: 'block', fontFamily: 'monospace', fontSize: 10, color: '#888', marginBottom: 8 }}>
                            🎞 GIF ATTACHED
                          </label>
                          <img
                            src={selectedQueuePost.gifMediaUrl}
                            alt="attached gif"
                            style={{ width: '100%', maxWidth: 280, border: '2px solid #00F5FF44', marginBottom: 8 }}
                          />
                          <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#555' }}>
                            This GIF will post alongside the tweet. To use a different one, regen the text — a new GIF will be selected.
                          </div>
                        </div>
                      )}

                      {/* Image section */}
                      {(selectedQueuePost.imageBase64 || selectedQueuePost.type === 'trending' || selectedQueuePost.type === 'bag_tech') && (
                        <div>
                          <label style={{ display: 'block', fontFamily: 'monospace', fontSize: 10, color: '#888', marginBottom: 8 }}>
                            {selectedQueuePost.animated ? '🎬 ANIMATED VIDEO' : '🎨 PIXEL ART'}
                          </label>

                          {/* Video generating indicator */}
                          {videoPolling && (
                            <div style={{
                              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
                              padding: '8px 12px', background: '#00FF8811', border: '1px solid #00FF8844',
                              fontFamily: 'monospace', fontSize: 9, color: '#00FF88',
                            }}>
                              <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                              SEEDANCE ANIMATING... check back in ~2 min
                            </div>
                          )}

                          {/* Video preview */}
                          {selectedQueuePost.videoBase64 && selectedQueuePost.videoBase64 !== '[video]' ? (
                            <div>
                              <video
                                src={`data:video/mp4;base64,${selectedQueuePost.videoBase64}`}
                                autoPlay loop muted playsInline
                                style={{ width: '100%', maxWidth: 280, border: '2px solid #00FF8844', marginBottom: 10 }}
                              />
                              {selectedQueuePost.imageDescription && (
                                <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#555', fontStyle: 'italic', marginBottom: 10 }}>
                                  "{selectedQueuePost.imageDescription}"
                                </div>
                              )}
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <PixelBtn small color="#9B59B6" onClick={regenImage} disabled={!!queueWorking}>
                                  {queueWorking === 'regen-image' ? 'GENERATING...' : '↺ REGEN VIDEO'}
                                </PixelBtn>
                              </div>
                            </div>

                          /* Static image preview */
                          ) : selectedQueuePost.imageBase64 && selectedQueuePost.imageBase64 !== '[image]' ? (
                            <div>
                              <img
                                src={`data:${selectedQueuePost.imageMimeType ?? 'image/png'};base64,${selectedQueuePost.imageBase64}`}
                                alt="Generated pixel art"
                                style={{ width: '100%', maxWidth: 280, imageRendering: 'pixelated', border: '2px solid #FF336644', marginBottom: 10 }}
                              />
                              {selectedQueuePost.imageDescription && (
                                <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#555', fontStyle: 'italic', marginBottom: 10 }}>
                                  "{selectedQueuePost.imageDescription}"
                                </div>
                              )}
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <PixelBtn small color="#9B59B6" onClick={regenImage} disabled={!!queueWorking}>
                                  {queueWorking === 'regen-image' ? 'GENERATING...' : '↺ REGEN IMAGE'}
                                </PixelBtn>
                                {!selectedQueuePost.imageCloudinaryUrl && (
                                  <PixelBtn small color="#FFD700" onClick={() => {
                                    setPromoteModal(selectedQueuePost);
                                    setPromoteForm({ name: `ai-${selectedQueuePost.type}-${Date.now()}`, tags: selectedQueuePost.trendCategory ?? '', sentiment: 'neutral' });
                                  }} disabled={!!queueWorking}>
                                    ★ SAVE TO LIBRARY
                                  </PixelBtn>
                                )}
                                {selectedQueuePost.imageCloudinaryUrl && (
                                  <Tag label="✓ IN LIBRARY" color="#00FF88" />
                                )}
                              </div>
                            </div>

                          /* No media yet */
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#555' }}>No media generated yet</div>
                              <PixelBtn small color="#9B59B6" onClick={regenImage} disabled={!!queueWorking}>
                                {queueWorking === 'regen-image' ? 'GENERATING...' : '🎬 GENERATE VIDEO'}
                              </PixelBtn>
                            </div>
                          )}
                        </div>
                      )}
                    </PixelCard>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ────────────── LINGO ────────────── */}
        {tab === 'lingo' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: '#FF3366', letterSpacing: 2 }}>
                // BAGAVERSE LEXICON ({lingo.length})
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <PixelBtn color="#00FF88" onClick={() => { setEditLingo(null); setLingoForm({ term: '', definition: '', examples: '', weight: 5, usageContext: 'both', active: true }); setAddLingoModal(true); }}>
                  + ADD TERM
                </PixelBtn>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}>
              {loading ? (
                <div style={{ color: '#444', fontFamily: "'Press Start 2P', monospace", fontSize: 9 }}>LOADING BAGAVERSE DATA...</div>
              ) : lingo.map(entry => (
                <PixelCard key={entry._id} color={entry.active ? '#00F5FF' : '#2a2a4a'} style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: entry.active ? '#00F5FF' : '#444', flex: 1, marginRight: 8 }}>
                      {entry.term}
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <Tag label={`W:${entry.weight}`} color="#FFD700" />
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#888', lineHeight: 1.6, marginBottom: 10 }}>
                    {entry.definition}
                  </div>
                  {entry.examples.length > 0 && (
                    <div style={{ fontSize: 10, color: '#555', fontStyle: 'italic', marginBottom: 10, borderLeft: '2px solid #2a2a4a', paddingLeft: 8 }}>
                      "{entry.examples[0]}"
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    {entry.usageContext.map(ctx => <Tag key={ctx} label={ctx} color="#9B59B6" />)}
                  </div>
                  <div style={{ display: 'flex', gap: 6, borderTop: '1px solid #1a1a2e', paddingTop: 10 }}>
                    <PixelBtn small color="#00F5FF" onClick={() => openEditLingo(entry)}>EDIT</PixelBtn>
                    <PixelBtn small color={entry.active ? '#FFD700' : '#00FF88'} onClick={() => toggleLingo(entry)}>
                      {entry.active ? 'DISABLE' : 'ENABLE'}
                    </PixelBtn>
                    <PixelBtn small color="#FF4444" onClick={() => deleteLingo(entry._id)}>DEL</PixelBtn>
                  </div>
                </PixelCard>
              ))}
            </div>
          </div>
        )}

        {/* ────────────── TARGETS ────────────── */}
        {tab === 'targets' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: '#FF3366', letterSpacing: 2 }}>
                // TARGET ACCOUNTS ({targets.length})
              </div>
              <PixelBtn color="#FFD700" onClick={() => setAddTargetModal(true)}>+ ADD TARGET</PixelBtn>
            </div>

            {/* Tier legend */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              {Object.entries(TIER_COLORS).map(([tier, color]) => (
                <div key={tier} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'monospace', fontSize: 10, color }}>
                  <span style={{ width: 8, height: 8, background: color, display: 'inline-block' }} />
                  TIER {tier}
                </div>
              ))}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' }}>
                <thead>
                  <tr>
                    {['HANDLE', 'TIER', 'FOLLOWERS', 'LAST REPLY', 'TOTAL REPLIES', 'TAGS', 'STATUS', 'ACTIONS'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: '#444', letterSpacing: 1, borderBottom: '1px solid #1a1a2e', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={8} style={{ padding: 20, fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#444' }}>LOADING...</td></tr>
                  ) : targets.map(t => (
                    <tr key={t._id} style={{
                      background: t.active ? '#0d0d1a' : '#09090f',
                      borderLeft: `3px solid ${TIER_COLORS[t.tier]}`,
                    }}>
                      <td style={{ padding: '14px 12px', color: '#00F5FF', fontFamily: 'monospace', fontSize: 13, fontWeight: 'bold' }}>{t.handle}</td>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{
                          fontFamily: "'Press Start 2P', monospace", fontSize: 10,
                          color: TIER_COLORS[t.tier],
                          textShadow: `0 0 8px ${TIER_COLORS[t.tier]}88`,
                        }}>{t.tier}</span>
                      </td>
                      <td style={{ padding: '14px 12px', color: '#888', fontFamily: 'monospace', fontSize: 12 }}>
                        {t.followerCount ? `${(t.followerCount / 1000).toFixed(0)}K` : '—'}
                      </td>
                      <td style={{ padding: '14px 12px', color: '#555', fontFamily: 'monospace', fontSize: 11 }}>
                        {t.lastReplied ? new Date(t.lastReplied).toLocaleDateString() : 'never'}
                      </td>
                      <td style={{ padding: '14px 12px', color: '#888', fontFamily: 'monospace', fontSize: 12 }}>{t.totalReplies}</td>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {(t.tags ?? []).slice(0, 3).map(tag => <Tag key={tag} label={tag} />)}
                        </div>
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 10, color: t.active ? '#00FF88' : '#555', letterSpacing: 1 }}>
                          {t.active ? '● ACTIVE' : '○ PAUSED'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <PixelBtn small color={t.active ? '#FFD700' : '#00FF88'} onClick={() => toggleTarget(t)}>
                            {t.active ? 'PAUSE' : 'RESUME'}
                          </PixelBtn>
                          <PixelBtn small color="#FF4444" onClick={() => deleteTarget(t._id)}>✕</PixelBtn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ────────────── MEDIA ────────────── */}
        {tab === 'media' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: '#FF3366', letterSpacing: 2 }}>
                // MEDIA LIBRARY ({media.length})
              </div>
              <PixelBtn color="#FF6B35" onClick={() => setAddMediaModal(true)}>+ ADD MEDIA</PixelBtn>
            </div>

            {/* Type filter pills */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'ALL', count: media.length },
                { label: 'GIF', count: media.filter(m => m.type === 'gif').length },
                { label: 'IPFS', count: media.filter(m => m.type === 'ipfs_image').length },
                { label: 'MP4', count: media.filter(m => m.type === 'mp4').length },
              ].map(f => (
                <div key={f.label} style={{ fontFamily: 'monospace', fontSize: 11, color: '#888' }}>
                  {f.label} <span style={{ color: '#FF6B35' }}>({f.count})</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {loading ? (
                <div style={{ color: '#444', fontFamily: "'Press Start 2P', monospace", fontSize: 9 }}>LOADING...</div>
              ) : media.map(item => {
                const onCooldown = item.lastUsed
                  ? (Date.now() - new Date(item.lastUsed).getTime()) < item.cooldownHours * 3600000
                  : false;
                return (
                  <PixelCard key={item._id} color={onCooldown ? '#2a1a1a' : '#FF6B35'} style={{ padding: 14, opacity: onCooldown ? 0.6 : 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Tag label={item.type.toUpperCase()} color={item.type === 'gif' ? '#9B59B6' : item.type === 'ipfs_image' ? '#FF6B35' : '#00FF88'} />
                      <Tag label={item.sentiment} color={SENTIMENT_COLORS[item.sentiment]} />
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#ccc', marginBottom: 8, wordBreak: 'break-all' }}>{item.name}</div>
                    <div style={{ fontSize: 10, color: '#444', fontFamily: 'monospace', marginBottom: 8, wordBreak: 'break-all' }}>
                      {item.url.substring(0, 40)}...
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                      {(item.tags ?? []).map(tag => <Tag key={tag} label={tag} />)}
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#555', marginBottom: 8 }}>
                      USED {item.usageCount}x
                      {onCooldown && <span style={{ color: '#FF4444', marginLeft: 8 }}>ON COOLDOWN</span>}
                    </div>
                    {item.type === 'mp4' && item.cloudinaryMetadata?.duration && (
                      <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#555', marginBottom: 8 }}>
                        {item.cloudinaryMetadata.duration.toFixed(1)}s
                        {item.cloudinaryMetadata.bytes && ` · ${(item.cloudinaryMetadata.bytes / 1024 / 1024).toFixed(1)}MB`}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <PixelBtn small color="#FF6B35" onClick={() => openEditMedia(item)}>✎ EDIT</PixelBtn>
                      <PixelBtn small color="#FF4444" onClick={() => deleteMedia(item._id)}>✕ DEL</PixelBtn>
                    </div>
                  </PixelCard>
                );
              })}

              {/* Add slot */}
              <div
                onClick={() => setAddMediaModal(true)}
                style={{
                  padding: 20,
                  border: '2px dashed #2a2a4a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', minHeight: 140,
                  fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#2a2a4a',
                  clipPath: 'polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)',
                }}
              >
                + ADD
              </div>
            </div>
          </div>
        )}

        {/* ────────────── REPLIES ────────────── */}
        {tab === 'replies' && (
          <div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: '#FF3366', letterSpacing: 2, marginBottom: 24 }}>
              // PENDING REPLY APPROVAL ({replies.length})
            </div>
            {loading ? (
              <div style={{ color: '#444', fontFamily: "'Press Start 2P', monospace", fontSize: 9 }}>LOADING...</div>
            ) : replies.length === 0 ? (
              <PixelCard color="#2a2a4a" style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: '#444' }}>
                  NO PENDING REPLIES
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#333', marginTop: 12 }}>
                  the bagaverse is at peace 🛍️
                </div>
              </PixelCard>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 16 }}>
                {replies.map(reply => (
                  <PixelCard key={reply._id} color="#00F5FF" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 14, color: '#00F5FF', fontWeight: 'bold' }}>
                        {reply.targetHandle}
                      </span>
                      <Tag label={`${Math.round(reply.relevanceScore * 100)}% RELEVANT`} color="#00FF88" />
                    </div>
                    <div style={{
                      fontSize: 11, color: '#555', fontStyle: 'italic',
                      marginBottom: 12, padding: '8px 12px',
                      background: '#080810', borderLeft: '2px solid #2a2a4a',
                      lineHeight: 1.6,
                    }}>
                      "{reply.targetTweetText}"
                    </div>
                    <div style={{
                      fontSize: 13, color: '#e0e0ff',
                      marginBottom: 16, padding: '10px 14px',
                      background: '#0d1520',
                      border: '1px solid #00F5FF44',
                      lineHeight: 1.6,
                    }}>
                      → "{reply.content}"
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <PixelBtn color="#00FF88" onClick={() => handleReply(reply._id, 'approved')}>✓ APPROVE</PixelBtn>
                      <PixelBtn color="#FF4444" onClick={() => handleReply(reply._id, 'skipped')}>✕ SKIP</PixelBtn>
                    </div>
                  </PixelCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ────────────── BAG TECH ────────────── */}
        {tab === 'bag_tech' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: '#FF3366', letterSpacing: 2 }}>
                  // BAG TECH GENERATOR
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#444', marginTop: 6 }}>
                  Weekly absurd tech announcement + pixel art image
                </div>
              </div>
              <PixelBtn
                color="#FF3366"
                onClick={async () => {
                  setBagTechLoading(true);
                  setBagTechPreview(null);
                  try {
                    const r = await fetch('/api/farmer/bag-tech/preview', { method: 'POST' });
                    setBagTechPreview(await r.json());
                  } catch (e) { console.error(e); }
                  setBagTechLoading(false);
                }}
                disabled={bagTechLoading}
              >
                {bagTechLoading ? 'GENERATING...' : '⚡ GENERATE'}
              </PixelBtn>
            </div>

            {!bagTechPreview && !bagTechLoading && (
              <PixelCard color="#2a2a4a" style={{ padding: 32 }}>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#444', marginBottom: 20 }}>HOW IT WORKS</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                  {[
                    { step: '01', label: 'Claude Haiku', desc: 'Writes absurd fake tech copy in Bags Bro voice' },
                    { step: '02', label: 'Scene Extract', desc: 'Claude pulls the key visual from the copy' },
                    { step: '03', label: 'GPT-Image-1', desc: 'Generates 8-bit pixel art from the scene' },
                    { step: '04', label: 'You Approve', desc: 'Preview, regenerate or queue for posting' },
                  ].map(s => (
                    <div key={s.step} style={{ padding: 16, background: '#080810', border: '1px solid #1a1a2e' }}>
                      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 18, color: '#FF3366', marginBottom: 8 }}>{s.step}</div>
                      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#888', marginBottom: 6 }}>{s.label}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#555', lineHeight: 1.5 }}>{s.desc}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20, fontFamily: 'monospace', fontSize: 10, color: '#333', borderTop: '1px solid #1a1a2e', paddingTop: 16 }}>
                  Cost per generation: ~$0.002 (Claude) + $0.17 (GPT-Image-1 high) = <span style={{ color: '#00FF88' }}>~$0.17 total</span>
                </div>
              </PixelCard>
            )}

            {bagTechLoading && (
              <PixelCard color="#FF3366" glow style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: '#FF3366', marginBottom: 12 }}>GENERATING BAG TECH...</div>
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#555' }}>Claude is cooking. GPT-Image-1 is pixelating. ~15 seconds.</div>
              </PixelCard>
            )}

            {bagTechPreview && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <PixelCard color="#FF6B35" style={{ padding: 16 }}>
                  <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#FF6B35', letterSpacing: 2, marginBottom: 12 }}>GENERATED IMAGE</div>
                  <img
                    src={`data:image/png;base64,${bagTechPreview.imageBase64}`}
                    alt="Generated pixel art"
                    style={{ width: '100%', imageRendering: 'pixelated', border: '2px solid #FF6B3544' }}
                  />
                  <div style={{ marginTop: 10, fontFamily: 'monospace', fontSize: 10, color: '#555', fontStyle: 'italic' }}>
                    Scene: "{bagTechPreview.imageDescription}"
                  </div>
                </PixelCard>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <PixelCard color="#00F5FF" style={{ padding: 20, flex: 1 }}>
                    <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#00F5FF', letterSpacing: 2, marginBottom: 12 }}>TWEET COPY</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#e0e0ff', lineHeight: 1.8, whiteSpace: 'pre-wrap', padding: 14, background: '#080810', border: '1px solid #00F5FF22' }}>
                      {bagTechPreview.tweetText}
                    </div>
                    <div style={{ marginTop: 8, fontFamily: 'monospace', fontSize: 10, color: bagTechPreview.tweetText.length > 260 ? '#FF4444' : '#555' }}>
                      {bagTechPreview.tweetText.length}/280 chars
                    </div>
                  </PixelCard>
                  <PixelCard color="#9B59B6" style={{ padding: 14 }}>
                    <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#666', marginBottom: 6 }}>TOPIC SEED</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#888', fontStyle: 'italic' }}>{bagTechPreview.topicUsed}</div>
                  </PixelCard>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <PixelBtn color="#00FF88" onClick={() => alert('Queue to post (wire up to /api/farmer/posts)')}>✓ QUEUE POST</PixelBtn>
                    <PixelBtn color="#FFD700" onClick={async () => {
                      setBagTechLoading(true); setBagTechPreview(null);
                      try { const r = await fetch('/api/farmer/bag-tech/preview', { method: 'POST' }); setBagTechPreview(await r.json()); }
                      catch (e) { console.error(e); }
                      setBagTechLoading(false);
                    }}>↺ REGEN</PixelBtn>
                    <PixelBtn color="#FF4444" onClick={() => setBagTechPreview(null)}>✕ DISCARD</PixelBtn>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── ADD/EDIT LINGO MODAL ── */}
      {addLingoModal && (
        <Modal title={editLingo ? 'EDIT LINGO' : 'ADD LINGO'} onClose={() => { setAddLingoModal(false); setEditLingo(null); }} color="#00F5FF">
          <Field label="TERM">
            <input style={inputStyle} value={lingoForm.term} onChange={e => setLingoForm(f => ({ ...f, term: e.target.value }))} placeholder="e.g. Baggadocious" />
          </Field>
          <Field label="DEFINITION">
            <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }} value={lingoForm.definition} onChange={e => setLingoForm(f => ({ ...f, definition: e.target.value }))} placeholder="Define it like a bagaverse scholar..." />
          </Field>
          <Field label="EXAMPLES (one per line)">
            <textarea style={{ ...inputStyle, height: 60, resize: 'vertical' }} value={lingoForm.examples} onChange={e => setLingoForm(f => ({ ...f, examples: e.target.value }))} placeholder='"this is baggadocious ngl"' />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="USAGE CONTEXT">
              <select style={{ ...inputStyle }} value={lingoForm.usageContext} onChange={e => setLingoForm(f => ({ ...f, usageContext: e.target.value }))}>
                <option value="both">BOTH</option>
                <option value="post">POST ONLY</option>
                <option value="reply">REPLY ONLY</option>
              </select>
            </Field>
            <Field label="WEIGHT (1-10)">
              <input type="number" min={1} max={10} style={inputStyle} value={lingoForm.weight} onChange={e => setLingoForm(f => ({ ...f, weight: parseInt(e.target.value) }))} />
            </Field>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <PixelBtn color="#00F5FF" onClick={saveLingo}>{editLingo ? 'SAVE CHANGES' : 'ADD TO LEXICON'}</PixelBtn>
            <PixelBtn color="#FF4444" onClick={() => { setAddLingoModal(false); setEditLingo(null); }}>CANCEL</PixelBtn>
          </div>
        </Modal>
      )}

      {/* ── ADD TARGET MODAL ── */}
      {addTargetModal && (
        <Modal title="ADD TARGET" onClose={() => setAddTargetModal(false)} color="#FFD700">
          <Field label="HANDLE">
            <input style={inputStyle} value={targetForm.handle} onChange={e => setTargetForm(f => ({ ...f, handle: e.target.value }))} placeholder="@cobie" />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="TIER">
              <select style={inputStyle} value={targetForm.tier} onChange={e => setTargetForm(f => ({ ...f, tier: e.target.value }))}>
                <option value="S">S — MEGA CT</option>
                <option value="A">A — MID CT</option>
                <option value="B">B — COMMUNITY</option>
                <option value="C">C — DISCOVERED</option>
              </select>
            </Field>
            <Field label="FOLLOWERS (approx)">
              <input type="number" style={inputStyle} value={targetForm.followerCount} onChange={e => setTargetForm(f => ({ ...f, followerCount: e.target.value }))} placeholder="420000" />
            </Field>
          </div>
          <Field label="TAGS (comma-separated)">
            <input style={inputStyle} value={targetForm.tags} onChange={e => setTargetForm(f => ({ ...f, tags: e.target.value }))} placeholder="nft, degen, crypto, trader" />
          </Field>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <PixelBtn color="#FFD700" onClick={saveTarget}>ADD TARGET</PixelBtn>
            <PixelBtn color="#FF4444" onClick={() => setAddTargetModal(false)}>CANCEL</PixelBtn>
          </div>
        </Modal>
      )}

      {/* ── ADD / EDIT MEDIA MODAL ── */}
      {addMediaModal && (
        <Modal title={editMedia ? 'EDIT MEDIA' : 'ADD MEDIA'} onClose={() => { setAddMediaModal(false); setEditMedia(null); }} color="#FF6B35">
          <Field label="TYPE">
            <select style={inputStyle} value={mediaForm.type} onChange={e => setMediaForm(f => ({ ...f, type: e.target.value, file: null, url: '' }))} disabled={!!editMedia}>
              <option value="gif">GIF (Tenor)</option>
              <option value="ipfs_image">NFT IMAGE (Cloudinary Upload)</option>
              <option value="mp4">MP4 (Cloudinary Upload)</option>
            </select>
          </Field>
          <Field label="NAME">
            <input style={inputStyle} value={mediaForm.name} onChange={e => setMediaForm(f => ({ ...f, name: e.target.value }))} placeholder="bags-bullish-01" />
          </Field>

          {mediaForm.type === 'mp4' || mediaForm.type === 'ipfs_image' ? (
            <Field label={`UPLOAD ${mediaForm.type === 'mp4' ? 'MP4' : 'IMAGE'} FILE`}>
              <input
                type="file"
                accept={mediaForm.type === 'mp4' ? 'video/mp4' : 'image/png,image/jpeg,image/webp,image/gif'}
                style={{ ...inputStyle, padding: '6px 8px' }}
                onChange={e => setMediaForm(f => ({ ...f, file: e.target.files?.[0] || null }))}
              />
              {mediaForm.file && (
                <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#00FF88', marginTop: 4 }}>
                  ✓ {mediaForm.file.name} ({(mediaForm.file.size / 1024 / 1024).toFixed(1)}MB)
                </div>
              )}
              {editMedia && !mediaForm.file && (
                <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#555', marginTop: 4 }}>
                  Leave empty to keep existing file
                </div>
              )}
            </Field>
          ) : (
            <Field label="TENOR URL">
              <input style={inputStyle} value={mediaForm.url} onChange={e => setMediaForm(f => ({ ...f, url: e.target.value }))} placeholder="https://media.tenor.com/..." />
            </Field>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="SENTIMENT">
              <select style={inputStyle} value={mediaForm.sentiment} onChange={e => setMediaForm(f => ({ ...f, sentiment: e.target.value }))}>
                <option value="bullish">BULLISH</option>
                <option value="bearish">BEARISH</option>
                <option value="neutral">NEUTRAL</option>
                <option value="chaotic">CHAOTIC</option>
              </select>
            </Field>
            <Field label="TAGS (comma-separated)">
              <input style={inputStyle} value={mediaForm.tags} onChange={e => setMediaForm(f => ({ ...f, tags: e.target.value }))} placeholder="moon, flex, rekt" />
            </Field>
          </div>

          {uploadProgress && (
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#FF6B35', marginBottom: 12, padding: 10, background: '#FF6B3511', border: '1px solid #FF6B3544' }}>
              {uploadProgress}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <PixelBtn
              color="#FF6B35"
              onClick={saveMedia}
              disabled={!editMedia && (mediaForm.type === 'mp4' || mediaForm.type === 'ipfs_image') && !mediaForm.file}
            >
              {uploadProgress ? 'UPLOADING...' : editMedia ? 'SAVE CHANGES' : 'ADD TO LIBRARY'}
            </PixelBtn>
            <PixelBtn color="#FF4444" onClick={() => { setAddMediaModal(false); setEditMedia(null); }}>CANCEL</PixelBtn>
          </div>
        </Modal>
      )}

      {/* ── PROMOTE IMAGE MODAL ── */}
      {promoteModal && (
        <Modal title="SAVE IMAGE TO LIBRARY" onClose={() => setPromoteModal(null)} color="#FFD700">
          {promoteModal.imageBase64 && promoteModal.imageBase64 !== '[image]' && (
            <img
              src={`data:${promoteModal.imageMimeType ?? 'image/png'};base64,${promoteModal.imageBase64}`}
              alt="Generated pixel art"
              style={{ width: '100%', maxWidth: 240, imageRendering: 'pixelated', border: '2px solid #FFD70044', marginBottom: 16 }}
            />
          )}
          <Field label="NAME">
            <input style={inputStyle} value={promoteForm.name} onChange={e => setPromoteForm(f => ({ ...f, name: e.target.value }))} placeholder="ai-trending-bags-01" />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="SENTIMENT">
              <select style={inputStyle} value={promoteForm.sentiment} onChange={e => setPromoteForm(f => ({ ...f, sentiment: e.target.value }))}>
                <option value="bullish">BULLISH</option>
                <option value="bearish">BEARISH</option>
                <option value="neutral">NEUTRAL</option>
                <option value="chaotic">CHAOTIC</option>
              </select>
            </Field>
            <Field label="TAGS (comma-separated)">
              <input style={inputStyle} value={promoteForm.tags} onChange={e => setPromoteForm(f => ({ ...f, tags: e.target.value }))} placeholder="ai, pixel, trending" />
            </Field>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <PixelBtn color="#FFD700" onClick={promoteImage} disabled={!promoteForm.name || queueWorking === 'promote'}>
              {queueWorking === 'promote' ? 'SAVING...' : '★ SAVE TO LIBRARY'}
            </PixelBtn>
            <PixelBtn color="#FF4444" onClick={() => setPromoteModal(null)}>CANCEL</PixelBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}
