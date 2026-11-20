import { Github, Mail, Command } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from '../../utils/axiosConfig';
import { useI18n } from '../../i18n/i18nContext';
import { useAppStore } from '../../store/useAppStore';

// ---- Site profile (GET /api/users/1), shared by Hero, Contact and Footer ----
// Email = user.email, GitHub = the socialMedia row whose platform matches /github/i,
// location = user.location (only once the DB content has been synced, since the
// pre-sync value differs from the copy on the page). Hardcoded values are the fallbacks.
export interface SiteProfile {
  name: string;
  email: string;
  githubUrl: string;
  githubHandle: string;
  location: string;
  locationEn: string;
}

const DEFAULT_PROFILE: SiteProfile = {
  name: '',
  email: 'hyxhhh1013@gmail.com',
  githubUrl: 'https://github.com/hyxhhh1013',
  githubHandle: '@hyxhhh1013',
  location: '',
  locationEn: '',
};

type ApiRow = Record<string, unknown>;

const text = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

const rows = (v: unknown): ApiRow[] =>
  Array.isArray(v) ? v.filter((x): x is ApiRow => !!x && typeof x === 'object') : [];

const hasList = (v: unknown): boolean => {
  if (Array.isArray(v)) return v.length > 0;
  const raw = text(v);
  if (!raw.startsWith('[')) return raw.length > 0;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
};

// Same markers as the Projects / Experience / Skills sections' synced gates.
const isProfileSynced = (user: ApiRow): boolean =>
  rows(user.projects).some((p) => text(p.badge) || text(p.titleEn)) ||
  rows(user.experience).some((e) => text(e.positionEn) || hasList(e.tags)) ||
  rows(user.skills).some((s) => s.category === 'capability');

const toGithubUrl = (raw: string): string => {
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/github\.com\//i.test(raw)) return `https://${raw.replace(/^\/+/, '')}`;
  return `https://github.com/${raw.replace(/^@/, '')}`;
};

const toSiteProfile = (user: ApiRow): SiteProfile => {
  const email = text(user.email);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !/@example\.(com|org|net)$/i.test(email);
  const githubRow = rows(user.socialMedia).find((r) => /github/i.test(text(r.platform)) && text(r.url));
  const githubUrl = githubRow ? toGithubUrl(text(githubRow.url)) : DEFAULT_PROFILE.githubUrl;
  const handle = githubUrl.match(/github\.com\/([^/?#]+)/i)?.[1];
  const location = isProfileSynced(user) ? text(user.location) : '';
  return {
    name: text(user.name),
    email: validEmail ? email : DEFAULT_PROFILE.email,
    githubUrl,
    githubHandle: handle ? `@${handle}` : DEFAULT_PROFILE.githubHandle,
    location,
    // No English column: reuse the value only when it is not written in CJK.
    locationEn: location && !/[\u3000-\u9fff\uff00-\uffef]/.test(location) ? location : '',
  };
};

// One request for all three consumers (they mount together); refreshed after 30 s.
let profileCache: { at: number; request: Promise<SiteProfile | null> } | null = null;

const loadSiteProfile = (): Promise<SiteProfile | null> => {
  if (!profileCache || Date.now() - profileCache.at > 30_000) {
    profileCache = {
      at: Date.now(),
      request: axios
        .get('/api/users/1')
        .then((res) => {
          const user = res.data?.data || res.data;
          return user && typeof user === 'object' ? toSiteProfile(user as ApiRow) : null;
        })
        .catch(() => {
          profileCache = null;
          return null;
        }),
    };
  }
  return profileCache.request;
};

export const useSiteProfile = (): SiteProfile => {
  const [profile, setProfile] = useState<SiteProfile>(DEFAULT_PROFILE);
  useEffect(() => {
    let alive = true;
    loadSiteProfile().then((loaded) => {
      if (alive && loaded) setProfile(loaded);
    });
    return () => {
      alive = false;
    };
  }, []);
  return profile;
};

export const Footer = () => {
  const [icpCode, setIcpCode] = useState<string>('湘ICP备2025152056号');
  const { td } = useI18n();
  const { setCommandOpen } = useAppStore();
  const profile = useSiteProfile();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get('/api/siteConfig');
        const data = response.data?.data || response.data;
        if (data && data.icpCode) {
          setIcpCode(data.icpCode);
        }
      } catch {
        // Keep default ICP code
      }
    };
    fetchConfig();
  }, []);

  return (
    <footer className="bg-[#FAF9F5] dark:bg-[#0D0D0C] border-t designer-hairline pt-10 sm:pt-12 pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:pb-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6">
        <div className="text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2.5 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#8A6F48] dark:bg-[#C9A87C]" />
            <span className="font-serif-editorial text-base sm:text-lg text-[#141413] dark:text-[#F0EFEA]">
              {td('黄奕轩 · Huang Yixuan', 'Huang Yixuan · Portfolio')}
            </span>
          </div>
          <p className="font-mono-tech text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.16em] text-[#6E6C66] dark:text-[#9E9C94]">
            &copy; {new Date().getFullYear()} {td('黄奕轩 (Huang Yixuan)', 'Huang Yixuan')} · CRAFTED WITH SWISS EDITORIAL GRIDS
          </p>
          {icpCode && (
            <p className="font-mono-tech text-[11px] tracking-[0.14em] text-[#6E6C66]/80 dark:text-[#9E9C94]/80 mt-1">
              <a
                href="https://beian.miit.gov.cn/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#8A6F48] dark:hover:text-[#C9A87C] transition-colors"
              >
                {icpCode}
              </a>
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <a
            href={profile.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`GitHub ${profile.githubHandle}`}
            className="p-2.5 rounded-full bg-[#F3F1EC] dark:bg-[#141413] border designer-hairline text-[#141413] dark:text-[#F0EFEA] hover:border-[#8A6F48] hover:text-[#8A6F48] dark:hover:text-[#C9A87C] transition-all"
          >
            <Github className="w-4 h-4" />
          </a>
          <a
            href={`mailto:${profile.email}`}
            aria-label={`Email ${profile.email}`}
            className="p-2.5 rounded-full bg-[#F3F1EC] dark:bg-[#141413] border designer-hairline text-[#141413] dark:text-[#F0EFEA] hover:border-[#8A6F48] hover:text-[#8A6F48] dark:hover:text-[#C9A87C] transition-all"
          >
            <Mail className="w-4 h-4" />
          </a>
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            aria-label="Open Command Palette"
            className="px-3.5 py-2 rounded-full bg-[#F3F1EC] dark:bg-[#141413] border designer-hairline text-[#141413] dark:text-[#F0EFEA] hover:border-[#8A6F48] hover:text-[#8A6F48] dark:hover:text-[#C9A87C] transition-all flex items-center gap-1.5 font-mono-tech text-[11px]"
            title={td('打开命令面板 (⌘K)', 'Open Command Palette (⌘K)')}
          >
            <Command className="w-3.5 h-3.5" />
            <span>⌘K</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
