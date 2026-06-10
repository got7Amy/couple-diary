// @ts-nocheck
import { useEffect, useState } from "react";
import type { CSSProperties, Dispatch, SetStateAction } from "react";

// ─── Palette & helpers ────────────────────────────────────────────────────────
const COLORS = {
  bg: "#F7F1E5",
  card: "#FFFDF7",
  primary: "#6FA66A",
  secondary: "#EBAAC0",
  accent: "#C76C84",
  soft: "#F6E7EC",
  muted: "#7F7667",
  text: "#2F2A20",
  light: "#FFF8EA",
  green: "#76A96F",
  blue: "#79A9A4",
  yellow: "#DDB65F",
  purple: "#A58ABF",
  danger: "#C95E5E",
};

// Gradient presets for buttons (keyed by flat color)
const BTN_GRADIENTS: Record<string, string> = {
  [COLORS.primary]:   "linear-gradient(140deg, #8DBD82 0%, #5F965E 100%)",
  [COLORS.secondary]: "linear-gradient(140deg, #F2BFD0 0%, #E59CAF 100%)",
  [COLORS.green]:     "linear-gradient(140deg, #90C884 0%, #67A461 100%)",
  [COLORS.blue]:      "linear-gradient(140deg, #8EC3BE 0%, #679F99 100%)",
  [COLORS.yellow]:    "linear-gradient(140deg, #EFD081 0%, #D5A84B 100%)",
  [COLORS.purple]:    "linear-gradient(140deg, #BCA7D2 0%, #987DB6 100%)",
  [COLORS.danger]:    "linear-gradient(140deg, #D87474 0%, #B94A4A 100%)",
  [COLORS.muted]:     "linear-gradient(140deg, #9B907F 0%, #746C5F 100%)",
  [COLORS.accent]:    "linear-gradient(140deg, #D8899D 0%, #BD6178 100%)",
};

type TabId =
  | "diary"
  | "moodLog"
  | "success"
  | "fiveYear"
  | "lifeScroll"
  | "reading"
  | "games"
  | "crochet"
  | "checkin"
  | "schedule"
  | "shopping"
  | "whisper"
  | "jokes"
  | "calendar"
  | "wishes"
  | "backup";

const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: "diary",    icon: "🌸", label: "心情花笺" },
  { id: "moodLog",  icon: "🌦️", label: "情绪天气" },
  { id: "schedule", icon: "🪴", label: "本周花径" },
  { id: "success",  icon: "🌱", label: "小成功" },
  { id: "backup",   icon: "🛟", label: "备份保险箱" },
  { id: "fiveYear", icon: "🌳", label: "五年花历" },
  { id: "checkin",  icon: "💧", label: "打卡浇水" },
  { id: "shopping", icon: "🧺", label: "采购花篮" },
  { id: "whisper",  icon: "🕊️", label: "秘密花语" },
  { id: "jokes",    icon: "🌼", label: "笑声花丛" },
  { id: "crochet",  icon: "🧶", label: "钩织花篮" },
  { id: "reading",  icon: "📚", label: "阅读花架" },
  { id: "games",    icon: "🎮", label: "游戏角落" },
  { id: "calendar", icon: "🍃", label: "花园日历" },
  { id: "wishes",   icon: "🌟", label: "愿望种子" },
  { id: "lifeScroll", icon: "📜", label: "岁月花卷" },
];

const today = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const currentLocalDateTime = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

const toLocalDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y || 2000, (m || 1) - 1, d || 1);
};

const fmtDate = (d: string) =>
  toLocalDate(d).toLocaleDateString("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

const fmtDateWithYear = (d: string) =>
  toLocalDate(d).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

const fmtDateTime = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => Date.now();

const confirmDelete = () => window.confirm("确定要删除吗？删除后不能恢复。");

type Setter<T> = Dispatch<SetStateAction<T>>;

type BaseItem = {
  id: string;
  createdAt: number;
  updatedAt?: number;
};

type DiaryEntry = BaseItem & {
  date: string;
  mood: string;
  title: string;
  content: string;
  source?: "diary" | "fiveYear";
};

type SuccessEntry = BaseItem & {
  date: string;
  content: string;
  category: string;
  evidence: string;
  energy: string;
};

type MoodLogEntry = BaseItem & {
  datetime: string;
  mood: string;
  note: string;
};

type FiveYearDiaryEntry = BaseItem & {
  date: string;
  content: string;
};

type FiveYearDiaryData = Record<string, FiveYearDiaryEntry | FiveYearDiaryEntry[]>;

type JokeEntry = BaseItem & {
  date: string;
  setup: string;
  punchline: string;
  tags: string;
};

type CalendarNote = BaseItem & {
  text: string;
};

type CalendarData = Record<string, CalendarNote[]>;

type WhisperEntry = BaseItem & {
  date: string;
  to: string;
  content: string;
  emoji: string;
};

type WishEntry = BaseItem & {
  date: string;
  wish: string;
  deadline: string;
  priority: string;
  done: boolean;
};

type ScheduleEntry = BaseItem & {
  day: string;
  period?: string;
  time: string;
  event: string;
  who: string;
  sortOrder?: number;
};


type ShoppingEntry = BaseItem & {
  name: string;
  quantity: string;
  category: string;
  note: string;
  bought: boolean;
};

type CheckinRewardType = "streak" | "total";

type CheckinReward = BaseItem & {
  title: string;
  type: CheckinRewardType;
  target: number;
  claimed?: boolean;
  claimedAt?: number;
};

type CheckinEntry = BaseItem & {
  name: string;
  lastCheckinDate?: string;
  currentStreak: number;
  longestStreak: number;
  totalCheckins: number;
  history: string[];
  rewards?: CheckinReward[];
};

type FiveYearPhoto = BaseItem & {
  date: string;
  src: string;
  name?: string;
};

type FiveYearPhotosData = Record<string, FiveYearPhoto[]>;

type LongWritingKind = "fiveYearPlan" | "fiveYearReview" | "yearPlan" | "yearReview" | "monthPlan" | "letterSelf" | "letterOther";
type LongWritingStatus = "draft" | "done";
type LongPlanModuleKey = "familyLife" | "parentingLife" | "careerDevelopment" | "wealthFreedom" | "personalGrowth";
type LongPlanModules = Partial<Record<LongPlanModuleKey, string>>;

type LongWritingEntry = BaseItem & {
  kind: LongWritingKind;
  date: string;
  year: string;
  month?: string;
  periodStart?: number;
  periodEnd?: number;
  to: string;
  title: string;
  content: string;
  reviewContent?: string;
  modules?: LongPlanModules;
  status: LongWritingStatus;
};

type LongWritingForm = Omit<LongWritingEntry, keyof BaseItem>;

type ReadingBookStatus = "reading" | "want" | "done";

type ReadingProgressEntry = BaseItem & {
  date: string;
  progress: string;
  note: string;
};

type ReadingBookEntry = BaseItem & {
  title: string;
  author: string;
  note: string;
  status: ReadingBookStatus;
  startDate: string;
  finishDate: string;
  progress: string;
  history?: ReadingProgressEntry[];
};

type GamePreference = "like" | "neutral" | "dislike";

type GameScreenshot = BaseItem & {
  src: string;
  name?: string;
};

type GameEntry = BaseItem & {
  title: string;
  platform: string;
  playTime: string;
  preference: GamePreference;
  note: string;
  finished: boolean;
  finishDate: string;
  screenshots: GameScreenshot[];
};

type CrochetProjectStatus = "doing" | "done";

type CrochetProjectEntry = BaseItem & {
  name: string;
  imageUrl: string;
  pattern: string;
  status: CrochetProjectStatus;
};

type CrochetProjectForm = Omit<CrochetProjectEntry, keyof BaseItem>;

// ─── Backup helpers ───────────────────────────────────────────────────────────
type BackupStorageItem = {
  key: string;
  label: string;
};

type BackupMeta = {
  lastBackupAt?: string;
  lastAutoBackupAt?: string;
  lastExportAt?: string;
  lastImportAt?: string;
  lastBackupType?: "auto" | "export" | "import" | "manual-local";
  lastImportedFileName?: string;
  lastBackupError?: string;
};

type BackupPayload = {
  schema: string;
  app: string;
  version: number;
  exportedAt: string;
  storage: Record<string, unknown>;
};

const BACKUP_SCHEMA = "xinshi-garden-backup-v1";
const BACKUP_META_KEY = "couple-diary-backup-meta-v1";
const BACKUP_SNAPSHOT_KEY = "couple-diary-auto-backup-v1";

const BACKUP_STORAGE_ITEMS: BackupStorageItem[] = [
  { key: "couple-diary-diary-v2", label: "心情花笺" },
  { key: "couple-diary-mood-log-v1", label: "情绪天气" },
  { key: "couple-diary-success-v1", label: "小成功" },
  { key: "couple-diary-five-year-v1", label: "五年花历" },
  { key: "couple-diary-fiveyear-photos-v1", label: "五年花历照片" },
  { key: "couple-diary-long-writings-v1", label: "岁月花卷" },
  { key: "couple-diary-reading-v1", label: "阅读花架" },
  { key: "couple-diary-games-v1", label: "游戏角落" },
  { key: "couple-diary-crochet-v1", label: "钩织花篮" },
  { key: "couple-diary-checkins-v1", label: "打卡浇水" },
  { key: "couple-diary-schedule-v2", label: "本周花径" },
  { key: "couple-diary-shopping-v1", label: "采购花篮" },
  { key: "couple-diary-whispers-v2", label: "秘密花语" },
  { key: "couple-diary-jokes-v2", label: "笑声花丛" },
  { key: "couple-diary-calendar-v2", label: "花园日历" },
  { key: "couple-diary-wishes-v2", label: "愿望种子" },
];

const backupEvent = () => {
  try {
    window.dispatchEvent(new Event("xinshi-garden-backup-updated"));
  } catch {
    // noop
  }
};

const safeJsonParse = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const readBackupMeta = (): BackupMeta => safeJsonParse<BackupMeta>(localStorage.getItem(BACKUP_META_KEY), {});

const writeBackupMeta = (patch: Partial<BackupMeta>) => {
  const next: BackupMeta = { ...readBackupMeta(), ...patch };
  try {
    localStorage.setItem(BACKUP_META_KEY, JSON.stringify(next));
    backupEvent();
  } catch {
    // localStorage may be full; avoid crashing the app.
  }
  return next;
};

const readStorageValue = (key: string) => {
  const raw = localStorage.getItem(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};

const buildBackupPayload = (): BackupPayload => {
  const storage = BACKUP_STORAGE_ITEMS.reduce<Record<string, unknown>>((acc, item) => {
    acc[item.key] = readStorageValue(item.key);
    return acc;
  }, {});

  return {
    schema: BACKUP_SCHEMA,
    app: "心事花园",
    version: 1,
    exportedAt: new Date().toISOString(),
    storage,
  };
};

const formatBackupDateTime = (value?: string) => {
  if (!value) return "还没有备份";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const backupFileName = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `xinshi-garden-backup-${yyyy}${mm}${dd}-${hh}${min}.json`;
};

const downloadBackupPayload = (payload: BackupPayload) => {
  const text = JSON.stringify(payload, null, 2);
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = backupFileName();
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 800);
  return blob.size;
};

const bytesToSize = (bytes: number) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const countBackupItems = (value: unknown): number => {
  if (!value) return 0;
  if (Array.isArray(value)) return value.length;
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).reduce((sum, item) => {
      if (Array.isArray(item)) return sum + item.length;
      if (item && typeof item === "object") return sum + 1;
      return sum;
    }, 0);
  }
  return 1;
};

const getBackupStorageStats = () => {
  const payload = buildBackupPayload();
  const rows = BACKUP_STORAGE_ITEMS.map((item) => ({
    ...item,
    count: countBackupItems(payload.storage[item.key]),
  }));
  const total = rows.reduce((sum, item) => sum + item.count, 0);
  const size = new Blob([JSON.stringify(payload)]).size;
  return { rows, total, size };
};

const extractBackupStorage = (parsed: any): Record<string, unknown> | null => {
  if (parsed?.schema === BACKUP_SCHEMA && parsed.storage && typeof parsed.storage === "object") {
    return parsed.storage;
  }

  // Tolerate older/handmade files that wrap data differently.
  if (parsed?.storage && typeof parsed.storage === "object") return parsed.storage;
  if (parsed?.data && typeof parsed.data === "object") return parsed.data;

  // Tolerate a raw object containing couple-diary-* keys.
  if (parsed && typeof parsed === "object" && Object.keys(parsed).some((key) => key.startsWith("couple-diary-"))) {
    return parsed as Record<string, unknown>;
  }

  return null;
};

const saveLocalBackupSnapshot = (type: BackupMeta["lastBackupType"] = "auto") => {
  const payload = buildBackupPayload();
  localStorage.setItem(BACKUP_SNAPSHOT_KEY, JSON.stringify(payload));
  const iso = new Date().toISOString();
  writeBackupMeta({
    lastBackupAt: iso,
    lastAutoBackupAt: type === "auto" ? iso : readBackupMeta().lastAutoBackupAt,
    lastBackupType: type,
    lastBackupError: "",
  });
  return payload;
};

// ─── localStorage hook (unchanged) ───────────────────────────────────────────
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? (JSON.parse(saved) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      alert("本地存储空间可能满了。建议删除一些不再需要的旧记录。");
    }
  }, [key, value]);

  return [value, setValue] as const;
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    * {
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }

    html, body, #root {
      margin: 0;
      min-height: 100%;
      width: 100%;
      max-width: 100%;
      overflow-x: hidden;
      background: radial-gradient(circle at 12% 8%, rgba(235,170,192,.28) 0, transparent 26%), radial-gradient(circle at 88% 0%, rgba(118,169,111,.22) 0, transparent 24%), ${COLORS.bg};
    }

    body {
      font-size: 17px;
      -webkit-text-size-adjust: 100%;
      touch-action: manipulation;
    }

    button, input, textarea {
      font: inherit;
    }

    ::selection {
      background: rgba(111, 166, 106, .22);
      color: #2F2A20;
    }

    img {
      max-width: 100%;
      display: block;
    }

    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { scrollbar-width: none; }

    /* Input focus glow */
    .diary-input:focus {
      border-color: ${COLORS.primary} !important;
      box-shadow: 0 0 0 3.5px rgba(111, 166, 106, .18) !important;
      background: #fff !important;
      outline: none;
    }

    /* Button press feedback */
    .diary-btn {
      transition: opacity .15s ease, transform .12s ease, box-shadow .18s ease !important;
    }
    .diary-btn:active {
      transform: scale(.94) !important;
      opacity: .86;
    }
    .diary-btn:hover {
      opacity: .93;
      filter: brightness(1.04);
    }

    /* Card hover lift */
    .diary-card-lift {
      transition: box-shadow .22s ease, transform .22s ease !important;
    }
    .diary-card-lift:hover {
      box-shadow: 0 8px 34px rgba(63,83,47,.14), 0 1px 4px rgba(63,83,47,.07), 0 0 0 1px rgba(235,170,192,.22) !important;
      transform: translateY(-2px);
    }

    /* Tab button */
    .diary-tab {
      transition: background .2s ease, color .2s ease, box-shadow .2s ease !important;
    }
    .diary-tab:active {
      transform: scale(.91);
    }

    /* Active tab underline pip */
    .diary-tab-active::after {
      content: '';
      display: block;
      height: 3px;
      width: 70%;
      margin: 3px auto 0;
      border-radius: 99px;
      background: ${COLORS.primary};
      opacity: 0.8;
    }

    /* Empty state float */
    @keyframes diary-float {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-10px); }
    }
    .diary-float {
      animation: diary-float 3.2s ease-in-out infinite;
      display: inline-block;
    }

    /* Tab content fade-in */
    @keyframes diary-fadein {
      from { opacity: 0; transform: translateY(9px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .diary-fadein {
      animation: diary-fadein .3s ease forwards;
    }

    /* Checkin streak pulse */
    @keyframes diary-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(104, 174, 126, .5); }
      55%       { box-shadow: 0 0 0 10px rgba(104, 174, 126, 0); }
    }
    .diary-pulse {
      animation: diary-pulse 2.2s ease-in-out infinite;
    }

    /* Header shimmer */
    @keyframes diary-shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }

    /* Stat card glow */
    @keyframes diary-glow {
      0%, 100% { opacity: .7; }
      50%       { opacity: 1; }
    }
  `}</style>
);

const Card = ({
  children,
  style = {},
  lift = true,
}: {
  children: React.ReactNode;
  style?: CSSProperties;
  lift?: boolean;
}) => (
  <div
    className={lift ? "diary-card-lift" : ""}
    style={{
      background: "linear-gradient(175deg, #FFFDF7 0%, #FFF8EA 100%)",
      borderRadius: 22,
      padding: "18px 20px",
      boxShadow:
        "0 1px 2px rgba(47,42,32,.04), 0 4px 22px rgba(63,83,47,.09), 0 0 0 1px rgba(235,170,192,.18)",
      marginBottom: 14,
      width: "100%",
      maxWidth: "100%",
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

const Btn = ({
  onClick,
  children,
  color = COLORS.primary,
  small = false,
  outline = false,
  style = {},
  type = "button",
  className = "",
}: {
  onClick?: () => void;
  children: React.ReactNode;
  color?: string;
  small?: boolean;
  outline?: boolean;
  style?: CSSProperties;
  type?: "button" | "submit";
  className?: string;
}) => (
  <button
    type={type}
    onClick={onClick}
    className={`diary-btn${className ? ` ${className}` : ""}`}
    style={{
      background: outline ? "transparent" : (BTN_GRADIENTS[color] ?? color),
      color: outline ? color : "#fff",
      border: outline ? `1.5px solid ${color}` : "none",
      borderRadius: 999,
      padding: small ? "8px 18px" : "11px 26px",
      fontSize: small ? 14 : 16,
      fontWeight: 700,
      cursor: "pointer",
      fontFamily: "inherit",
      whiteSpace: "nowrap",
      maxWidth: "100%",
      letterSpacing: 0.4,
      boxShadow: outline ? "none" : `0 2px 12px rgba(0,0,0,.13), 0 1px 3px rgba(0,0,0,.08)`,
      ...style,
    }}
  >
    {children}
  </button>
);

const Input = ({
  value,
  onChange,
  placeholder,
  multiline = false,
  rows = 3,
  style = {},
  type = "text",
}: {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  style?: CSSProperties;
  type?: string;
}) => {
  const base: CSSProperties = {
    width: "100%",
    maxWidth: "100%",
    borderRadius: 14,
    border: `1.5px solid rgba(161, 183, 132, .55)`,
    padding: "12px 16px",
    fontSize: 16,
    fontFamily: "inherit",
    background: "rgba(255, 252, 244, .78)",
    color: COLORS.text,
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
    transition: "border-color .2s, box-shadow .2s, background .2s",
    ...style,
  };

  return multiline ? (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="diary-input"
      style={base}
    />
  ) : (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="diary-input"
      style={{ ...base, resize: undefined }}
    />
  );
};

const Tag = ({
  color = COLORS.soft,
  children,
  textColor,
}: {
  color?: string;
  children: React.ReactNode;
  textColor?: string;
}) => (
  <span
    style={{
      background: color,
      color: textColor ?? COLORS.accent,
      borderRadius: 999,
      padding: "3px 12px",
      fontSize: 12,
      fontWeight: 800,
      display: "inline-flex",
      alignItems: "center",
      maxWidth: "100%",
      letterSpacing: 0.3,
      border: "1px solid rgba(255,255,255,.7)",
      boxShadow: "0 1px 4px rgba(61,34,24,.07)",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
);

const EmptyState = ({ emoji, text }: { emoji: string; text: string }) => (
  <div style={{
    textAlign: "center",
    padding: "52px 18px",
    color: COLORS.muted,
    background: "linear-gradient(160deg, rgba(255,248,234,.92) 0%, rgba(255,253,247,.74) 100%)",
    borderRadius: 22,
    border: "1.5px dashed rgba(111,166,106,.22)",
    marginBottom: 14,
  }}>
    <div className="diary-float" style={{ fontSize: 52, marginBottom: 16, filter: "drop-shadow(0 4px 12px rgba(111,166,106,.22))" }}>{emoji}</div>
    <div style={{ fontSize: 15, lineHeight: 1.9, maxWidth: 240, margin: "0 auto", fontWeight: 500 }}>{text}</div>
  </div>
);

const ActionButtons = ({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
    <Btn small outline color={COLORS.blue} onClick={onEdit}>编辑</Btn>
    <Btn small outline color={COLORS.danger} onClick={onDelete}>删除</Btn>
  </div>
);

const MiniIconButton = ({
  onClick,
  children,
  color = COLORS.muted,
  disabled = false,
  label,
  style = {},
}: {
  onClick?: () => void;
  children: React.ReactNode;
  color?: string;
  disabled?: boolean;
  label?: string;
  style?: CSSProperties;
}) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    disabled={disabled}
    onClick={disabled ? undefined : onClick}
    className="diary-btn"
    style={{
      width: 30,
      height: 30,
      minWidth: 30,
      borderRadius: 999,
      border: `1px solid ${color}33`,
      background: disabled ? "rgba(155,123,114,.08)" : "rgba(255,255,255,.9)",
      color: disabled ? "rgba(155,123,114,.35)" : color,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
      fontSize: 16,
      fontWeight: 900,
      lineHeight: 1,
      cursor: disabled ? "not-allowed" : "pointer",
      boxShadow: disabled ? "none" : "0 2px 8px rgba(61,34,24,.08)",
      ...style,
    }}
  >
    {children}
  </button>
);

const FormActions = ({
  onSave,
  onCancel,
  saveText = "保存",
  color = COLORS.primary,
}: {
  onSave: () => void;
  onCancel: () => void;
  saveText?: string;
  color?: string;
}) => (
  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
    <Btn onClick={onSave} color={color}>{saveText}</Btn>
    <Btn onClick={onCancel} outline color={COLORS.muted}>取消</Btn>
  </div>
);

// ─── Mood Diary ───────────────────────────────────────────────────────────────
const MOODS = ["😊", "😍", "🥰", "😂", "😢", "😤", "😌", "🥳", "😴", "😰", "🤯", "😭", "😎", "🤒"];

type DiaryForm = Omit<DiaryEntry, keyof BaseItem>;

const isFiveYearDiaryEntry = (entry: DiaryEntry) =>
  entry.source === "fiveYear" || entry.title === "五年日记";

function DiaryFields({
  form,
  setForm,
}: {
  form: DiaryForm;
  setForm: Setter<DiaryForm>;
}) {
  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <Input
          type="date"
          value={form.date}
          onChange={(v) => setForm((p) => ({ ...p, date: v }))}
          style={{ width: 170 }}
        />
        <div
          className="hide-scrollbar"
          style={{
            display: "flex",
            gap: 7,
            alignItems: "center",
            flexWrap: "nowrap",
            overflowX: "auto",
            maxWidth: "100%",
            minWidth: 0,
            flex: "1 1 0",
            padding: "2px 2px 6px",
          }}
        >
          {MOODS.map((m) => (
            <span
              key={m}
              onClick={() => setForm((p) => ({ ...p, mood: m }))}
              style={{
                fontSize: 25,
                cursor: "pointer",
                opacity: form.mood === m ? 1 : 0.35,
                transition: "opacity .15s, transform .15s",
                transform: form.mood === m ? "scale(1.18)" : "scale(1)",
                display: "inline-block",
              }}
            >
              {m}
            </span>
          ))}
        </div>
      </div>
      <Input
        value={form.title}
        onChange={(v) => setForm((p) => ({ ...p, title: v }))}
        placeholder="花笺标题（今天发生了什么？）"
        style={{ marginBottom: 10 }}
      />
      <Input
        value={form.content}
        onChange={(v) => setForm((p) => ({ ...p, content: v }))}
        placeholder="把这朵心情展开说说～"
        multiline
        rows={4}
        style={{ marginBottom: 12 }}
      />
    </>
  );
}

function DiaryTab({ data, setData }: { data: DiaryEntry[]; setData: Setter<DiaryEntry[]> }) {
  const blank: DiaryForm = { date: today(), mood: "😊", title: "", content: "" };
  const [form, setForm] = useState<DiaryForm>(blank);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<DiaryForm>(blank);

  const sorted = [...data]
    .filter((entry) => !isFiveYearDiaryEntry(entry))
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);

  const save = () => {
    const cleanedTitle = form.title.trim();
    const cleanedContent = form.content.trim();
    if (!cleanedTitle && !cleanedContent) return;
    setData((prev) => [
      {
        id: uid(),
        createdAt: now(),
        ...form,
        title: cleanedTitle || "心情花笺",
        content: cleanedContent,
        source: "diary",
      },
      ...prev,
    ]);
    setForm(blank);
    setAdding(false);
  };

  const saveEdit = () => {
    const cleanedTitle = editForm.title.trim();
    const cleanedContent = editForm.content.trim();
    if ((!cleanedTitle && !cleanedContent) || !editId) return;
    setData((prev) =>
      prev.map((entry) =>
        entry.id === editId
          ? {
              ...entry,
              ...editForm,
              title: cleanedTitle || "心情花笺",
              content: cleanedContent,
              source: entry.source || "diary",
              updatedAt: now(),
            }
          : entry
      )
    );
    setEditId(null);
  };

  const currentYear = new Date().getFullYear();
  const firstEntryYear = sorted.length > 0 ? toLocalDate(sorted[0].date).getFullYear() : null;
  const showCurrentYearDivider = sorted.length > 0 && firstEntryYear !== currentYear;

  const YearDivider = ({ year, first = false }: { year: number; first?: boolean }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        margin: first ? "2px 0 12px" : "22px 0 12px",
        color: COLORS.accent,
        fontSize: 18,
        fontWeight: 900,
      }}
    >
      <span style={{ height: 1, flex: 1, background: "rgba(111,166,106,.22)" }} />
      <span>{year}</span>
      <span style={{ height: 1, flex: 1, background: "rgba(111,166,106,.22)" }} />
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 18 }}>
        <h2 style={{ margin: 0, color: COLORS.text, fontSize: 22, fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-flex", width: 4, height: 22, borderRadius: 4, background: COLORS.primary, flexShrink: 0 }} />
          心情花笺 🌸
        </h2>
        <Btn onClick={() => setAdding(!adding)} small>
          {adding ? "取消" : "+ 种下一朵心情"}
        </Btn>
      </div>

      {adding && (
        <Card style={{ border: `2px solid ${COLORS.secondary}` }}>
          <DiaryFields form={form} setForm={setForm} />
          <FormActions onSave={save} onCancel={() => setAdding(false)} saveText="种进花园 🌸" />
        </Card>
      )}

      {sorted.length === 0 && !adding && <EmptyState emoji="🌸" text="花园里还没有心情花笺。先种下第一朵吧～" />}

      {showCurrentYearDivider && <YearDivider year={currentYear} first />}

      {sorted.map((entry, index) => {
        const entryYear = toLocalDate(entry.date).getFullYear();
        const prevYear = index > 0 ? toLocalDate(sorted[index - 1].date).getFullYear() : null;

        return (
          <div key={entry.id}>
            {entryYear !== prevYear && <YearDivider year={entryYear} first={!showCurrentYearDivider && index === 0} />}
            <Card>
              {editId === entry.id ? (
            <>
              <DiaryFields form={editForm} setForm={setEditForm} />
              <FormActions onSave={saveEdit} onCancel={() => setEditId(null)} saveText="保存修改" />
            </>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: 30, marginRight: 8 }}>{entry.mood}</span>
                  <strong style={{ color: COLORS.text, fontSize: 18, wordBreak: "break-word" }}>{entry.title}</strong>
                </div>
                <Tag>{fmtDate(entry.date)}</Tag>
              </div>
              {entry.content && (
                <p style={{ margin: "12px 0", color: COLORS.muted, fontSize: 16, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                  {entry.content}
                </p>
              )}
              <ActionButtons
                onEdit={() => {
                  setEditId(entry.id);
                  setEditForm({ date: entry.date, mood: entry.mood, title: entry.title, content: entry.content });
                }}
                onDelete={() => {
                  if (confirmDelete()) setData((prev) => prev.filter((x) => x.id !== entry.id));
                }}
              />
            </>
          )}
            </Card>
          </div>
        );
      })}
    </div>
  );
}


// ─── Mood Log ─────────────────────────────────────────────────────────────────
type MoodLogForm = Omit<MoodLogEntry, keyof BaseItem>;

const MOOD_LOG_OPTIONS = [
  { label: "高兴", emoji: "😊", color: COLORS.green },
  { label: "兴奋", emoji: "🥳", color: COLORS.yellow },
  { label: "感激", emoji: "🙏", color: COLORS.purple },
  { label: "放松", emoji: "😌", color: COLORS.blue },
  { label: "满意", emoji: "☺️", color: COLORS.green },
  { label: "疲劳", emoji: "😴", color: COLORS.muted },
  { label: "没信心", emoji: "🥺", color: COLORS.muted },
  { label: "无聊", emoji: "😐", color: COLORS.muted },
  { label: "焦虑", emoji: "😰", color: COLORS.yellow },
  { label: "生气", emoji: "😤", color: COLORS.danger },
  { label: "压力", emoji: "😵‍💫", color: COLORS.accent },
  { label: "悲伤", emoji: "😢", color: COLORS.blue },
  { label: "绝望", emoji: "😭", color: COLORS.purple },
  { label: "不公平", emoji: "⚖️", color: COLORS.danger },
  { label: "期待", emoji: "🤩", color: COLORS.yellow },
  { label: "幸运", emoji: "🍀", color: COLORS.green },
  { label: "平静", emoji: "🌿", color: COLORS.green },
  { label: "有信心", emoji: "😎", color: COLORS.blue },
  { label: "兴致勃勃", emoji: "🔥", color: COLORS.primary },
];

const getMoodLogMeta = (mood?: string) =>
  MOOD_LOG_OPTIONS.find((item) => item.label === mood) || MOOD_LOG_OPTIONS[0];

const getMoodLogDateKey = (entry: Pick<MoodLogEntry, "datetime">) =>
  (entry.datetime || currentLocalDateTime()).slice(0, 10);

function MoodLogTab({ data, setData }: { data: MoodLogEntry[]; setData: Setter<MoodLogEntry[]> }) {
  const blank = (): MoodLogForm => ({
    datetime: currentLocalDateTime(),
    mood: "平静",
    note: "",
  });

  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<MoodLogForm>(blank());
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<MoodLogForm>(blank());

  const sorted = [...data].sort((a, b) =>
    (b.datetime || "").localeCompare(a.datetime || "") || b.createdAt - a.createdAt
  );

  const todayEntries = sorted.filter((entry) => getMoodLogDateKey(entry) === today());
  const totalDays = new Set(sorted.map(getMoodLogDateKey)).size;
  const recentMood = sorted[0]?.mood;
  const groupedByDate = sorted.reduce<Record<string, MoodLogEntry[]>>((acc, entry) => {
    const key = getMoodLogDateKey(entry);
    acc[key] = acc[key] || [];
    acc[key].push(entry);
    return acc;
  }, {});

  const resetAddForm = () => {
    setForm(blank());
    setAdding(false);
  };

  const save = () => {
    const mood = form.mood || "平静";
    const note = form.note.trim();
    setData((prev) => [
      {
        id: uid(),
        createdAt: now(),
        datetime: form.datetime || currentLocalDateTime(),
        mood,
        note,
      },
      ...prev,
    ]);
    resetAddForm();
  };

  const saveEdit = () => {
    if (!editId) return;
    setData((prev) =>
      prev.map((entry) =>
        entry.id === editId
          ? {
              ...entry,
              datetime: editForm.datetime || currentLocalDateTime(),
              mood: editForm.mood || "平静",
              note: editForm.note.trim(),
              updatedAt: now(),
            }
          : entry
      )
    );
    setEditId(null);
  };

  const Fields = ({ value, setValue }: { value: MoodLogForm; setValue: Setter<MoodLogForm> }) => (
    <>
      <Input
        type="datetime-local"
        value={value.datetime}
        onChange={(v) => setValue((p) => ({ ...p, datetime: v || currentLocalDateTime() }))}
        style={{ marginBottom: 12, width: 220 }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(92px, 1fr))", gap: 8, marginBottom: 12 }}>
        {MOOD_LOG_OPTIONS.map((item) => {
          const active = value.mood === item.label;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => setValue((p) => ({ ...p, mood: item.label }))}
              className="diary-btn"
              style={{
                border: active ? `2px solid ${item.color}` : "1.5px solid rgba(232,185,165,.5)",
                background: active ? `${item.color}22` : "rgba(255,248,244,.72)",
                color: active ? COLORS.text : COLORS.muted,
                borderRadius: 16,
                padding: "9px 8px",
                cursor: "pointer",
                fontWeight: active ? 900 : 700,
                boxShadow: active ? "0 2px 12px rgba(61,34,24,.10)" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                minHeight: 42,
              }}
            >
              <span>{item.emoji}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <Input
        value={value.note}
        onChange={(v) => setValue((p) => ({ ...p, note: v }))}
        placeholder="一句快速笔记：发生了什么 / 身体感觉 / 想记住什么（可选）"
        multiline
        rows={2}
        style={{ marginBottom: 12 }}
      />
    </>
  );

  const MoodCard = ({ entry }: { entry: MoodLogEntry }) => {
    const meta = getMoodLogMeta(entry.mood);
    return (
      <Card style={{ borderLeft: `4px solid ${meta.color}` }}>
        {editId === entry.id ? (
          <>
            {Fields({ value: editForm, setValue: setEditForm })}
            <FormActions onSave={saveEdit} onCancel={() => setEditId(null)} saveText="保存修改" color={meta.color} />
          </>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                <span style={{ fontSize: 30 }}>{meta.emoji}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: COLORS.text, fontSize: 18, fontWeight: 900 }}>{entry.mood || meta.label}</div>
                  <div style={{ color: COLORS.muted, fontSize: 13, fontWeight: 700 }}>{fmtDateTime(entry.datetime)}</div>
                </div>
              </div>
              <Tag color={`${meta.color}22`} textColor={meta.color}>{meta.label}</Tag>
            </div>

            {entry.note && (
              <div style={{ background: COLORS.light, borderRadius: 14, padding: "10px 12px", color: COLORS.muted, fontSize: 15, lineHeight: 1.75, whiteSpace: "pre-wrap", wordBreak: "break-word", marginBottom: 12 }}>
                {entry.note}
              </div>
            )}

            <ActionButtons
              onEdit={() => {
                setAdding(false);
                setEditId(entry.id);
                setEditForm({
                  datetime: entry.datetime || currentLocalDateTime(),
                  mood: entry.mood || "平静",
                  note: entry.note || "",
                });
              }}
              onDelete={() => {
                if (confirmDelete()) setData((prev) => prev.filter((item) => item.id !== entry.id));
              }}
            />
          </>
        )}
      </Card>
    );
  };

  const recentMeta = getMoodLogMeta(recentMood);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, color: COLORS.text, fontSize: 22, fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "inline-flex", width: 4, height: 22, borderRadius: 4, background: COLORS.purple, flexShrink: 0 }} />
            情绪天气 🌦️
          </h2>
          <div style={{ marginTop: 5, color: COLORS.muted, fontSize: 13, lineHeight: 1.6, paddingLeft: 12 }}>
            像给花园记天气：选时间、选一个情绪、留一句话。不是审判自己，是给心事留坐标。
          </div>
        </div>
        <Btn
          onClick={() => {
            if (adding) {
              resetAddForm();
            } else {
              setForm(blank());
              setAdding(true);
            }
          }}
          small
          color={COLORS.purple}
        >
          {adding ? "取消" : "+ 记一阵天气"}
        </Btn>
      </div>

      <Card style={{ border: `2px solid ${COLORS.purple}`, background: "linear-gradient(160deg, #FFFFFF 0%, #F8F4FF 100%)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10 }}>
          <div style={{ background: "rgba(164,143,192,.12)", borderRadius: 18, padding: "12px", textAlign: "center" }}>
            <div style={{ color: COLORS.purple, fontSize: 26, fontWeight: 900 }}>{todayEntries.length}</div>
            <div style={{ color: COLORS.muted, fontSize: 13, fontWeight: 800 }}>今天记录</div>
          </div>
          <div style={{ background: "rgba(235,170,192,.16)", borderRadius: 18, padding: "12px", textAlign: "center" }}>
            <div style={{ color: COLORS.primary, fontSize: 26, fontWeight: 900 }}>{data.length}</div>
            <div style={{ color: COLORS.muted, fontSize: 13, fontWeight: 800 }}>总情绪点</div>
          </div>
          <div style={{ background: "rgba(104,152,184,.12)", borderRadius: 18, padding: "12px", textAlign: "center" }}>
            <div style={{ color: COLORS.blue, fontSize: 26, fontWeight: 900 }}>{totalDays}</div>
            <div style={{ color: COLORS.muted, fontSize: 13, fontWeight: 800 }}>有记录的日子</div>
          </div>
          <div style={{ background: `${recentMeta.color}18`, borderRadius: 18, padding: "12px", textAlign: "center" }}>
            <div style={{ color: recentMeta.color, fontSize: 26, fontWeight: 900 }}>{sorted.length ? recentMeta.emoji : "—"}</div>
            <div style={{ color: COLORS.muted, fontSize: 13, fontWeight: 800 }}>最近情绪</div>
          </div>
        </div>
      </Card>

      {adding && (
        <Card style={{ border: `2px solid ${COLORS.purple}` }}>
          {Fields({ value: form, setValue: setForm })}
          <FormActions onSave={save} onCancel={resetAddForm} saveText="保存情绪天气 🌦️" color={COLORS.purple} />
        </Card>
      )}

      {sorted.length === 0 && !adding && <EmptyState emoji="🌦️" text="还没有情绪天气。先不用写长篇，选一个情绪，加一句话就够了。" />}

      {Object.entries(groupedByDate).map(([date, entries]) => (
        <div key={date}>
          <div style={{ margin: "18px 0 10px", color: COLORS.purple, fontWeight: 900, fontSize: 16 }}>
            {fmtDateWithYear(date)} · {entries.length} 条
          </div>
          {entries.map((entry) => <div key={entry.id}>{MoodCard({ entry })}</div>)}
        </div>
      ))}
    </div>
  );
}


// ─── Success Diary ────────────────────────────────────────────────────────────
type SuccessForm = Omit<SuccessEntry, keyof BaseItem>;

const SUCCESS_CATEGORIES = [
  { label: "完成了", emoji: "✅", color: COLORS.green },
  { label: "推进了一点", emoji: "🌱", color: COLORS.blue },
  { label: "照顾了自己", emoji: "🫶", color: COLORS.purple },
  { label: "勇敢了一下", emoji: "🦁", color: COLORS.yellow },
  { label: "扛住了", emoji: "🪨", color: COLORS.muted },
];

const SUCCESS_ENERGY = ["✨", "⭐", "🌟", "🔥", "💪", "🌈"];

const getSuccessCategoryMeta = (category?: string) =>
  SUCCESS_CATEGORIES.find((item) => item.label === category) || SUCCESS_CATEGORIES[0];

const countSuccessDays = (entries: SuccessEntry[]) =>
  new Set(entries.filter((entry) => entry.date).map((entry) => entry.date)).size;

function SuccessDiaryTab({ data, setData }: { data: SuccessEntry[]; setData: Setter<SuccessEntry[]> }) {
  const blank: SuccessForm = {
    date: today(),
    content: "",
    category: "完成了",
    evidence: "",
    energy: "✨",
  };

  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<SuccessForm>(blank);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<SuccessForm>(blank);

  const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
  const todayEntries = data.filter((entry) => entry.date === today());
  const totalDays = countSuccessDays(data);
  const latestDate = sorted[0]?.date;
  const latestDayEntries = latestDate ? sorted.filter((entry) => entry.date === latestDate) : [];

  const groupedByDate = sorted.reduce<Record<string, SuccessEntry[]>>((acc, entry) => {
    const key = entry.date || today();
    acc[key] = acc[key] || [];
    acc[key].push(entry);
    return acc;
  }, {});

  const save = () => {
    const content = form.content.trim();
    const evidence = form.evidence.trim();
    if (!content) return;
    setData((prev) => [
      {
        id: uid(),
        createdAt: now(),
        ...form,
        content,
        evidence,
        category: form.category || "完成了",
        energy: form.energy || "✨",
      },
      ...prev,
    ]);
    setForm(blank);
    setAdding(false);
  };

  const saveEdit = () => {
    const content = editForm.content.trim();
    const evidence = editForm.evidence.trim();
    if (!editId || !content) return;
    setData((prev) =>
      prev.map((entry) =>
        entry.id === editId
          ? {
              ...entry,
              ...editForm,
              content,
              evidence,
              category: editForm.category || "完成了",
              energy: editForm.energy || "✨",
              updatedAt: now(),
            }
          : entry
      )
    );
    setEditId(null);
  };

  const startEdit = (entry: SuccessEntry) => {
    setAdding(false);
    setEditId(entry.id);
    setEditForm({
      date: entry.date || today(),
      content: entry.content || "",
      category: entry.category || "完成了",
      evidence: entry.evidence || "",
      energy: entry.energy || "✨",
    });
  };

  const Fields = ({
    value,
    setValue,
  }: {
    value: SuccessForm;
    setValue: Setter<SuccessForm>;
  }) => (
    <>
      <Input
        type="date"
        value={value.date}
        onChange={(v) => setValue((p) => ({ ...p, date: v || today() }))}
        style={{ marginBottom: 10, width: 180 }}
      />

      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 10 }}>
        {SUCCESS_CATEGORIES.map((item) => (
          <span
            key={item.label}
            onClick={() => setValue((p) => ({ ...p, category: item.label }))}
            style={{
              padding: "7px 12px",
              borderRadius: 999,
              background: value.category === item.label ? item.color : COLORS.light,
              color: value.category === item.label ? "#fff" : COLORS.muted,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 900,
              boxShadow: value.category === item.label ? "0 2px 10px rgba(61,34,24,.12)" : "none",
              transition: "background .15s, transform .15s",
            }}
          >
            {item.emoji} {item.label}
          </span>
        ))}
      </div>

      <div
        style={{
          background: "rgba(253,232,224,.5)",
          borderRadius: 16,
          padding: "10px 12px",
          color: COLORS.muted,
          fontSize: 13,
          lineHeight: 1.7,
          marginBottom: 10,
        }}
      >
        可以写很小的事：洗了杯子、修了一个 bug、带娃出了门、按时吃饭、没有崩掉、终于问清楚一件事。它不是 KPI，是给自己留证据。
      </div>

      <Input
        value={value.content}
        onChange={(v) => setValue((p) => ({ ...p, content: v }))}
        placeholder="今天我完成了什么？再小都算。"
        multiline
        rows={3}
        style={{ marginBottom: 10 }}
      />

      <Input
        value={value.evidence}
        onChange={(v) => setValue((p) => ({ ...p, evidence: v }))}
        placeholder="这说明我……（可选，比如：我不是一事无成 / 我有在推进）"
        multiline
        rows={2}
        style={{ marginBottom: 10 }}
      />

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
        <span style={{ color: COLORS.muted, fontSize: 14, fontWeight: 800 }}>给它一个小印章</span>
        {SUCCESS_ENERGY.map((emoji) => (
          <span
            key={emoji}
            onClick={() => setValue((p) => ({ ...p, energy: emoji }))}
            style={{
              fontSize: 24,
              cursor: "pointer",
              opacity: value.energy === emoji ? 1 : 0.35,
              transform: value.energy === emoji ? "scale(1.18)" : "scale(1)",
              transition: "opacity .15s, transform .15s",
              display: "inline-block",
            }}
          >
            {emoji}
          </span>
        ))}
      </div>
    </>
  );

  const SuccessCard = ({ entry }: { entry: SuccessEntry }) => {
    const meta = getSuccessCategoryMeta(entry.category);
    return (
      <Card style={{ borderLeft: `4px solid ${meta.color}` }}>
        {editId === entry.id ? (
          <>
            {Fields({ value: editForm, setValue: setEditForm })}
            <FormActions onSave={saveEdit} onCancel={() => setEditId(null)} saveText="保存修改" color={COLORS.green} />
          </>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", minWidth: 0 }}>
                <span style={{ fontSize: 24 }}>{entry.energy || meta.emoji}</span>
                <Tag color={`${meta.color}22`} textColor={meta.color}>{meta.emoji} {entry.category || meta.label}</Tag>
              </div>
              <Tag>{fmtDate(entry.date)}</Tag>
            </div>

            <div style={{ color: COLORS.text, fontSize: 17, fontWeight: 800, lineHeight: 1.75, whiteSpace: "pre-wrap", wordBreak: "break-word", marginBottom: entry.evidence ? 8 : 12 }}>
              {entry.content}
            </div>

            {entry.evidence && (
              <div style={{ background: COLORS.light, borderRadius: 14, padding: "10px 12px", color: COLORS.muted, fontSize: 15, lineHeight: 1.75, whiteSpace: "pre-wrap", wordBreak: "break-word", marginBottom: 12 }}>
                <strong style={{ color: COLORS.accent }}>证据：</strong>{entry.evidence}
              </div>
            )}

            <ActionButtons
              onEdit={() => startEdit(entry)}
              onDelete={() => {
                if (confirmDelete()) setData((prev) => prev.filter((item) => item.id !== entry.id));
              }}
            />
          </>
        )}
      </Card>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, color: COLORS.text, fontSize: 22, fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "inline-flex", width: 4, height: 22, borderRadius: 4, background: COLORS.green, flexShrink: 0 }} />
            小成功苗圃 🌱
          </h2>
          <div style={{ marginTop: 5, color: COLORS.muted, fontSize: 13, lineHeight: 1.6, paddingLeft: 12 }}>
            只记录事实：我做了，它存在。再小也是一棵苗。
          </div>
        </div>
        <Btn onClick={() => setAdding(!adding)} small color={COLORS.green}>
          {adding ? "取消" : "+ 种一棵小成功"}
        </Btn>
      </div>

      <Card style={{ border: `2px solid ${COLORS.green}`, background: "linear-gradient(160deg, #FFFFFF 0%, #F4FFF6 100%)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10 }}>
          <div style={{ background: "rgba(104,174,126,.1)", borderRadius: 18, padding: "12px", textAlign: "center" }}>
            <div style={{ color: COLORS.green, fontSize: 26, fontWeight: 900 }}>{todayEntries.length}</div>
            <div style={{ color: COLORS.muted, fontSize: 13, fontWeight: 800 }}>今天的小成功</div>
          </div>
          <div style={{ background: "rgba(235,170,192,.16)", borderRadius: 18, padding: "12px", textAlign: "center" }}>
            <div style={{ color: COLORS.primary, fontSize: 26, fontWeight: 900 }}>{data.length}</div>
            <div style={{ color: COLORS.muted, fontSize: 13, fontWeight: 800 }}>总证据数</div>
          </div>
          <div style={{ background: "rgba(104,152,184,.12)", borderRadius: 18, padding: "12px", textAlign: "center" }}>
            <div style={{ color: COLORS.blue, fontSize: 26, fontWeight: 900 }}>{totalDays}</div>
            <div style={{ color: COLORS.muted, fontSize: 13, fontWeight: 800 }}>有记录的日子</div>
          </div>
        </div>

        <div style={{ marginTop: 12, color: COLORS.muted, fontSize: 14, lineHeight: 1.7 }}>
          今天先写 1 件就够了；状态好的时候写 3 件。重点不是“多优秀”，而是让大脑看见：你确实在活、在做、在撑、在推进。
        </div>
      </Card>

      {adding && (
        <Card style={{ border: `2px solid ${COLORS.green}` }}>
          {Fields({ value: form, setValue: setForm })}
          <FormActions onSave={save} onCancel={() => setAdding(false)} saveText="种进苗圃 🌱" color={COLORS.green} />
        </Card>
      )}

      {data.length === 0 && !adding && <EmptyState emoji="🌱" text="苗圃还空着。先写一件小到不能再小的事：你做了，它就算。" />}

      {latestDayEntries.length > 0 && (
        <div style={{ margin: "16px 0 10px", color: COLORS.green, fontWeight: 900, fontSize: 16 }}>
          最近一次：{fmtDateWithYear(latestDate!)}
        </div>
      )}

      {Object.entries(groupedByDate).map(([date, entries], groupIndex) => (
        <div key={date}>
          {groupIndex > 0 && (
            <div style={{ margin: "20px 0 10px", color: COLORS.accent, fontWeight: 900, fontSize: 16 }}>
              {fmtDateWithYear(date)}
            </div>
          )}
          {entries.map((entry) => <div key={entry.id}>{SuccessCard({ entry })}</div>)}
        </div>
      ))}
    </div>
  );
}


// ─── Jokes ────────────────────────────────────────────────────────────────────
type JokeForm = Omit<JokeEntry, keyof BaseItem>;

function JokesTab({ data, setData }: { data: JokeEntry[]; setData: Setter<JokeEntry[]> }) {
  const blank: JokeForm = { date: today(), setup: "", punchline: "", tags: "" };
  const [form, setForm] = useState<JokeForm>(blank);
  const [adding, setAdding] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<JokeForm>(blank);

  const save = () => {
    if (!form.setup.trim()) return;
    setData((prev) => [{ id: uid(), createdAt: now(), ...form }, ...prev]);
    setForm(blank);
    setAdding(false);
  };

  const saveEdit = () => {
    if (!editId || !editForm.setup.trim()) return;
    setData((prev) =>
      prev.map((j) => (j.id === editId ? { ...j, ...editForm, updatedAt: now() } : j))
    );
    setEditId(null);
  };

  const Fields = ({ value, setValue }: { value: JokeForm; setValue: Setter<JokeForm> }) => (
    <>
      <Input type="date" value={value.date} onChange={(v) => setValue((p) => ({ ...p, date: v }))} style={{ marginBottom: 10, width: 170 }} />
      <Input value={value.setup} onChange={(v) => setValue((p) => ({ ...p, setup: v }))} placeholder="笑话梗/起因" style={{ marginBottom: 10 }} />
      <Input value={value.punchline} onChange={(v) => setValue((p) => ({ ...p, punchline: v }))} placeholder="笑点/结果（可选）" style={{ marginBottom: 10 }} />
      <Input value={value.tags} onChange={(v) => setValue((p) => ({ ...p, tags: v }))} placeholder="标签，如：冷笑话, 睡前笑话" style={{ marginBottom: 12 }} />
    </>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 18 }}>
        <h2 style={{ margin: 0, color: COLORS.text, fontSize: 22, fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-flex", width: 4, height: 22, borderRadius: 4, background: COLORS.yellow, flexShrink: 0 }} />
          笑声花丛 🌼
        </h2>
        <Btn onClick={() => setAdding(!adding)} small>
          {adding ? "取消" : "+ 收一朵笑声"}
        </Btn>
      </div>

      {adding && (
        <Card style={{ border: `2px solid ${COLORS.yellow}` }}>
          {Fields({ value: form, setValue: setForm })}
          <FormActions onSave={save} onCancel={() => setAdding(false)} saveText="放进笑声花丛 🌼" color={COLORS.yellow} />
        </Card>
      )}

      {data.length === 0 && !adding && <EmptyState emoji="🌼" text="笑声花丛还空着，先记下一个专属笑点吧！" />}

      {data.map((joke) => (
        <Card key={joke.id} style={{ borderLeft: `4px solid ${COLORS.yellow}` }}>
          {editId === joke.id ? (
            <>
              {Fields({ value: editForm, setValue: setEditForm })}
              <FormActions onSave={saveEdit} onCancel={() => setEditId(null)} saveText="保存修改" color={COLORS.yellow} />
            </>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                <Tag color="#FFF8DC">{fmtDate(joke.date)}</Tag>
                {joke.tags && <span style={{ fontSize: 13, color: COLORS.muted }}>#{joke.tags.split(",").map((t) => t.trim()).filter(Boolean).join(" #")}</span>}
              </div>
              <p style={{ margin: "0 0 10px", color: COLORS.text, fontSize: 17, fontWeight: 700, wordBreak: "break-word" }}>{joke.setup}</p>
              {joke.punchline &&
                (revealed[joke.id] ? (
                  <p style={{ margin: "0 0 12px", color: COLORS.accent, fontSize: 16, fontStyle: "italic" }}>👉 {joke.punchline}</p>
                ) : (
                  <div style={{ marginBottom: 12 }}>
                    <Btn onClick={() => setRevealed((p) => ({ ...p, [joke.id]: true }))} small outline color={COLORS.yellow} style={{ color: COLORS.text }}>
                      揭晓笑点 🎉
                    </Btn>
                  </div>
                ))}
              <ActionButtons
                onEdit={() => {
                  setEditId(joke.id);
                  setEditForm({ date: joke.date, setup: joke.setup, punchline: joke.punchline, tags: joke.tags });
                }}
                onDelete={() => {
                  if (confirmDelete()) setData((prev) => prev.filter((x) => x.id !== joke.id));
                }}
              />
            </>
          )}
        </Card>
      ))}
    </div>
  );
}

// ─── Calendar ─────────────────────────────────────────────────────────────────
function CalendarTab({ data, setData }: { data: CalendarData; setData: Setter<CalendarData> }) {
  const [selected, setSelected] = useState(today());
  const [note, setNote] = useState("");
  const [viewDate, setViewDate] = useState(new Date());
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

  const dateKey = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const saveNote = () => {
    if (!note.trim()) return;
    setData((prev) => ({
      ...prev,
      [selected]: [{ id: uid(), text: note.trim(), createdAt: now() }, ...(prev[selected] || [])],
    }));
    setNote("");
  };

  const saveEdit = () => {
    if (!editId || !editText.trim()) return;
    setData((prev) => ({
      ...prev,
      [selected]: (prev[selected] || []).map((n) =>
        n.id === editId ? { ...n, text: editText.trim(), updatedAt: now() } : n
      ),
    }));
    setEditId(null);
  };

  const deleteNote = (id: string) => {
    if (!confirmDelete()) return;
    setData((prev) => ({
      ...prev,
      [selected]: (prev[selected] || []).filter((n) => n.id !== id),
    }));
  };

  const selectedNotes = data[selected] || [];

  return (
    <div>
      <h2 style={{ margin: "0 0 18px", color: COLORS.text, fontSize: 22, fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ display: "inline-flex", width: 4, height: 22, borderRadius: 4, background: COLORS.blue, flexShrink: 0 }} />
        花园日历 🍃
      </h2>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <button
            onClick={() => setViewDate(new Date(year, month - 1))}
            style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: COLORS.muted, padding: "0 6px" }}
          >‹</button>
          <strong style={{ color: COLORS.text, fontSize: 18 }}>{year}年 {monthNames[month]}</strong>
          <button
            onClick={() => setViewDate(new Date(year, month + 1))}
            style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: COLORS.muted, padding: "0 6px" }}
          >›</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 3, textAlign: "center" }}>
          {["日","一","二","三","四","五","六"].map((d) => (
            <div key={d} style={{ fontSize: 12, color: COLORS.muted, fontWeight: 800, paddingBottom: 8, letterSpacing: 0.5 }}>{d}</div>
          ))}

          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1;
            const key = dateKey(year, month, d);
            const hasNote = data[key]?.length > 0;
            const isSelected = key === selected;
            const isToday = key === today();

            return (
              <div
                key={d}
                onClick={() => setSelected(key)}
                style={{
                  padding: "9px 2px",
                  borderRadius: 12,
                  cursor: "pointer",
                  background: isSelected
                    ? BTN_GRADIENTS[COLORS.primary]
                    : isToday
                    ? COLORS.soft
                    : "transparent",
                  color: isSelected ? "#fff" : COLORS.text,
                  fontWeight: isToday ? 900 : 500,
                  position: "relative",
                  minWidth: 0,
                  transition: "background .15s",
                  boxShadow: isSelected ? "0 2px 8px rgba(111,166,106,.28)" : "none",
                }}
              >
                {d}
                {hasNote && (
                  <div style={{
                    position: "absolute",
                    bottom: 3,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: isSelected ? "rgba(255,255,255,.85)" : COLORS.secondary,
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <div style={{ fontWeight: 900, color: COLORS.text, marginBottom: 12 }}>{fmtDate(selected)} 的记录</div>
        <Input value={note} onChange={setNote} placeholder="记下今天发生的事…" style={{ marginBottom: 10 }} />
        <Btn onClick={saveNote} small>添加记录</Btn>

        {selectedNotes.length > 0 && (
          <div style={{ marginTop: 14 }}>
            {selectedNotes.map((n) => (
              <div key={n.id} style={{ padding: "10px 12px", background: COLORS.light, borderRadius: 12, marginBottom: 8, fontSize: 15, color: COLORS.text }}>
                {editId === n.id ? (
                  <>
                    <Input value={editText} onChange={setEditText} placeholder="修改记录" style={{ marginBottom: 10 }} />
                    <FormActions onSave={saveEdit} onCancel={() => setEditId(null)} saveText="保存" />
                  </>
                ) : (
                  <>
                    <div style={{ marginBottom: 10, wordBreak: "break-word" }}>• {n.text}</div>
                    <ActionButtons
                      onEdit={() => { setEditId(n.id); setEditText(n.text); }}
                      onDelete={() => deleteNote(n.id)}
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Whisper ──────────────────────────────────────────────────────────────────
function WhisperTab({ data, setData }: { data: WhisperEntry[]; setData: Setter<WhisperEntry[]> }) {
  const blank = { to: "TA", content: "", emoji: "💌" };
  const [form, setForm] = useState(blank);
  const [adding, setAdding] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(blank);

  const EMOJIS = ["💌", "😘", "🫶", "💕", "🥺", "😳", "💋", "🤫"];

  const save = () => {
    if (!form.content.trim()) return;
    setData((prev) => [{ id: uid(), createdAt: now(), date: today(), ...form }, ...prev]);
    setForm(blank);
    setAdding(false);
  };

  const saveEdit = () => {
    if (!editId || !editForm.content.trim()) return;
    setData((prev) =>
      prev.map((m) => (m.id === editId ? { ...m, ...editForm, updatedAt: now() } : m))
    );
    setEditId(null);
  };

  const Fields = ({ value, setValue }: { value: typeof blank; setValue: Setter<typeof blank> }) => (
    <>
      <div style={{ display: "flex", gap: 7, marginBottom: 12, flexWrap: "wrap" }}>
        {EMOJIS.map((e) => (
          <span
            key={e}
            onClick={() => setValue((p) => ({ ...p, emoji: e }))}
            style={{
              fontSize: 25,
              cursor: "pointer",
              opacity: value.emoji === e ? 1 : 0.35,
              transform: value.emoji === e ? "scale(1.18)" : "scale(1)",
              transition: "opacity .15s, transform .15s",
              display: "inline-block",
            }}
          >
            {e}
          </span>
        ))}
      </div>
      <Input
        value={value.content}
        onChange={(v) => setValue((p) => ({ ...p, content: v }))}
        placeholder="想藏进花园的话…"
        multiline
        rows={4}
        style={{ marginBottom: 12 }}
      />
    </>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 18 }}>
        <h2 style={{ margin: 0, color: COLORS.text, fontSize: 22, fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-flex", width: 4, height: 22, borderRadius: 4, background: COLORS.purple, flexShrink: 0 }} />
          秘密花语 🕊️
        </h2>
        <Btn onClick={() => setAdding(!adding)} small color={COLORS.purple}>
          {adding ? "取消" : "+ 写一束花语"}
        </Btn>
      </div>

      {adding && (
        <Card style={{ border: `2px solid ${COLORS.purple}` }}>
          {Fields({ value: form, setValue: setForm })}
          <FormActions onSave={save} onCancel={() => setAdding(false)} saveText="藏进秘密花语 🕊️" color={COLORS.purple} />
        </Card>
      )}

      {data.length === 0 && !adding && <EmptyState emoji="🕊️" text="秘密花语还空着，写下一句只属于你们的话吧～" />}

      {data.map((msg) => (
        <Card key={msg.id} style={{ borderLeft: `4px solid ${COLORS.purple}` }}>
          {editId === msg.id ? (
            <>
              {Fields({ value: editForm, setValue: setEditForm })}
              <FormActions onSave={saveEdit} onCancel={() => setEditId(null)} saveText="保存修改" color={COLORS.purple} />
            </>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 26 }}>{msg.emoji}</span>
                <Tag color="#F3EEFF">{fmtDate(msg.date)}</Tag>
              </div>

              {revealed[msg.id] ? (
                <p style={{ margin: "0 0 12px", color: COLORS.text, fontSize: 16, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{msg.content}</p>
              ) : (
                <div style={{ textAlign: "center", marginBottom: 12 }}>
                  <div style={{ filter: "blur(8px)", color: COLORS.muted, fontSize: 16, marginBottom: 8, pointerEvents: "none", userSelect: "none" }}>
                    这是一束秘密花语…
                  </div>
                  <Btn onClick={() => setRevealed((p) => ({ ...p, [msg.id]: true }))} small color={COLORS.purple}>
                    轻轻打开 💫
                  </Btn>
                </div>
              )}

              <ActionButtons
                onEdit={() => {
                  setEditId(msg.id);
                  setEditForm({ to: msg.to, content: msg.content, emoji: msg.emoji });
                }}
                onDelete={() => {
                  if (confirmDelete()) setData((prev) => prev.filter((x) => x.id !== msg.id));
                }}
              />
            </>
          )}
        </Card>
      ))}
    </div>
  );
}

// ─── Wishes ───────────────────────────────────────────────────────────────────
function WishesTab({ data, setData }: { data: WishEntry[]; setData: Setter<WishEntry[]> }) {
  const blank = { wish: "", deadline: "", priority: "💫" };
  const [form, setForm] = useState(blank);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(blank);

  const PRIORITY = ["💫", "🌟", "⭐", "✨"];

  const save = () => {
    if (!form.wish.trim()) return;
    setData((prev) => [{ id: uid(), createdAt: now(), date: today(), done: false, ...form }, ...prev]);
    setForm(blank);
    setAdding(false);
  };

  const saveEdit = () => {
    if (!editId || !editForm.wish.trim()) return;
    setData((prev) =>
      prev.map((w) => (w.id === editId ? { ...w, ...editForm, updatedAt: now() } : w))
    );
    setEditId(null);
  };

  const toggle = (id: string) =>
    setData((prev) => prev.map((w) => (w.id === id ? { ...w, done: !w.done, updatedAt: now() } : w)));

  const Fields = ({ value, setValue }: { value: typeof blank; setValue: Setter<typeof blank> }) => (
    <>
      <Input value={value.wish} onChange={(v) => setValue((p) => ({ ...p, wish: v }))} placeholder="你们的愿望是什么？" style={{ marginBottom: 10 }} />
      <Input value={value.deadline} onChange={(v) => setValue((p) => ({ ...p, deadline: v }))} placeholder="希望什么时候实现？（可选）" style={{ marginBottom: 10 }} />
      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 15, color: COLORS.muted }}>优先级</span>
        {PRIORITY.map((p) => (
          <span
            key={p}
            onClick={() => setValue((old) => ({ ...old, priority: p }))}
            style={{
              fontSize: 24, cursor: "pointer",
              opacity: value.priority === p ? 1 : 0.35,
              transform: value.priority === p ? "scale(1.18)" : "scale(1)",
              transition: "opacity .15s, transform .15s",
              display: "inline-block",
            }}
          >
            {p}
          </span>
        ))}
      </div>
    </>
  );

  const pending = data.filter((w) => !w.done);
  const done = data.filter((w) => w.done);

  const WishCard = ({ w }: { w: WishEntry }) => (
    <Card style={w.done ? { opacity: 0.75 } : {}}>
      {editId === w.id ? (
        <>
          {Fields({ value: editForm, setValue: setEditForm })}
          <FormActions onSave={saveEdit} onCancel={() => setEditId(null)} saveText="保存修改" color={COLORS.yellow} />
        </>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div
              onClick={() => toggle(w.id)}
              style={{
                width: 24, height: 24, borderRadius: "50%",
                border: w.done ? "none" : `2px solid ${COLORS.yellow}`,
                background: w.done ? COLORS.green : "transparent",
                cursor: "pointer", flexShrink: 0, marginTop: 2,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background .2s",
              }}
            >
              {w.done && <span style={{ color: "#fff", fontSize: 13 }}>✓</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, color: w.done ? COLORS.muted : COLORS.text, textDecoration: w.done ? "line-through" : "none", wordBreak: "break-word" }}>
                {w.priority} {w.wish}
              </div>
              {w.deadline && <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>🗓 {w.deadline}前实现</div>}
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <ActionButtons
              onEdit={() => {
                setEditId(w.id);
                setEditForm({ wish: w.wish, deadline: w.deadline, priority: w.priority });
              }}
              onDelete={() => {
                if (confirmDelete()) setData((prev) => prev.filter((x) => x.id !== w.id));
              }}
            />
          </div>
        </>
      )}
    </Card>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 18 }}>
        <h2 style={{ margin: 0, color: COLORS.text, fontSize: 22, fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-flex", width: 4, height: 22, borderRadius: 4, background: COLORS.yellow, flexShrink: 0 }} />
          愿望种子 🌟
        </h2>
        <Btn onClick={() => setAdding(!adding)} small color={COLORS.yellow} style={{ color: COLORS.text }}>
          {adding ? "取消" : "+ 种一颗愿望"}
        </Btn>
      </div>

      {adding && (
        <Card style={{ border: `2px solid ${COLORS.yellow}` }}>
          {Fields({ value: form, setValue: setForm })}
          <FormActions onSave={save} onCancel={() => setAdding(false)} saveText="种下愿望种子 🌟" color={COLORS.yellow} />
        </Card>
      )}

      {data.length === 0 && !adding && <EmptyState emoji="🌟" text="还没有愿望种子，先种下一颗小小心愿吧！" />}

      {pending.map((w) => <div key={w.id}>{WishCard({ w })}</div>)}

      {done.length > 0 && (
        <div>
          <div style={{ fontWeight: 900, color: COLORS.green, fontSize: 16, margin: "16px 0 8px" }}>🎉 已实现的愿望</div>
          {done.map((w) => <div key={w.id}>{WishCard({ w })}</div>)}
        </div>
      )}
    </div>
  );
}

// ─── Schedule ─────────────────────────────────────────────────────────────────
const DAYS_ZH = ["周一","周二","周三","周四","周五","周六","周日"];
const TIME_BLOCKS = ["上午","中午","下午","傍晚","晚上"];
const TIME_BLOCK_ORDER: Record<string, number> = { 上午: 0, 中午: 1, 下午: 2, 傍晚: 3, 晚上: 4 };

const inferSchedulePeriod = (item: Pick<ScheduleEntry, "time"> & { period?: string }) => {
  if (item.period && TIME_BLOCKS.includes(item.period)) return item.period;
  const raw = String(item.time || "");
  const textMatch = TIME_BLOCKS.find((block) => raw.includes(block));
  if (textMatch) return textMatch;
  const hourMatch = raw.match(/(\d{1,2})(?::|点)?/);
  if (!hourMatch) return "";
  const hour = Number(hourMatch[1]);
  if (Number.isNaN(hour)) return "";
  if (hour >= 5 && hour < 11) return "上午";
  if (hour >= 11 && hour < 14) return "中午";
  if (hour >= 14 && hour < 17) return "下午";
  if (hour >= 17 && hour < 20) return "傍晚";
  return "晚上";
};

const getSchedulePeriodOrder = (item: Pick<ScheduleEntry, "time"> & { period?: string }) => {
  const period = inferSchedulePeriod(item);
  return period ? TIME_BLOCK_ORDER[period] : 99;
};

const sortScheduleItems = (items: ScheduleEntry[]) => {
  return [...items].sort((a, b) => {
    const periodDiff = getSchedulePeriodOrder(a) - getSchedulePeriodOrder(b);
    if (periodDiff !== 0) return periodDiff;
    return (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER) || a.createdAt - b.createdAt;
  });
};

const getScheduleMoveTargetIndex = (items: ScheduleEntry[], id: string, direction: "up" | "down") => {
  const currentIndex = items.findIndex((item) => item.id === id);
  if (currentIndex < 0) return -1;
  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= items.length) return -1;
  return inferSchedulePeriod(items[currentIndex]) === inferSchedulePeriod(items[targetIndex]) ? targetIndex : -1;
};

const canMoveScheduleItem = (items: ScheduleEntry[], id: string, direction: "up" | "down") =>
  getScheduleMoveTargetIndex(items, id, direction) >= 0;

function ScheduleTab({ data, setData }: { data: ScheduleEntry[]; setData: Setter<ScheduleEntry[]> }) {
  const blank = { day: "周一", period: "上午", time: "", event: "", who: "一起" };
  const [form, setForm] = useState(blank);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(blank);

  const WHO = ["一起","我","TA"];

  const save = () => {
    if (!form.event.trim()) return;
    setData((prev) => {
      const sameDay = prev.filter((i) => i.day === form.day);
      const newItem: ScheduleEntry = { id: uid(), createdAt: now(), ...form };
      if (sameDay.some((i) => typeof i.sortOrder === "number")) {
        newItem.sortOrder = Math.max(-1, ...sameDay.map((i) => i.sortOrder ?? -1)) + 1;
      }
      return [newItem, ...prev];
    });
    setForm(blank);
    setAdding(false);
  };

  const saveEdit = () => {
    if (!editId || !editForm.event.trim()) return;
    setData((prev) =>
      prev.map((i) => {
        if (i.id !== editId) return i;
        const movedToAnotherGroup =
          i.day !== editForm.day || inferSchedulePeriod(i) !== editForm.period;
        if (!movedToAnotherGroup) return { ...i, ...editForm, updatedAt: now() };
        const sameGroup = prev.filter(
          (item) =>
            item.id !== editId &&
            item.day === editForm.day &&
            inferSchedulePeriod(item) === editForm.period
        );
        const nextOrder = Math.max(-1, ...sameGroup.map((item) => item.sortOrder ?? -1)) + 1;
        return { ...i, ...editForm, sortOrder: nextOrder, updatedAt: now() };
      })
    );
    setEditId(null);
  };

  const moveScheduleItem = (day: string, id: string, direction: "up" | "down") => {
    setData((prev) => {
      const sortedDayItems = sortScheduleItems(prev.filter((item) => item.day === day));
      const currentIndex = sortedDayItems.findIndex((item) => item.id === id);
      const targetIndex = getScheduleMoveTargetIndex(sortedDayItems, id, direction);
      if (currentIndex < 0 || targetIndex < 0) return prev;
      const reordered = sortedDayItems.map((item) => ({ ...item }));
      [reordered[currentIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[currentIndex]];
      const changedIds = new Set([id, sortedDayItems[targetIndex].id]);
      const updatedById = new Map(
        reordered.map((item, index) => [
          item.id,
          { ...item, sortOrder: index, updatedAt: changedIds.has(item.id) ? now() : item.updatedAt },
        ])
      );
      return prev.map((item) => updatedById.get(item.id) || item);
    });
  };

  const grouped = DAYS_ZH.reduce<Record<string, ScheduleEntry[]>>((acc, d) => {
    acc[d] = sortScheduleItems(data.filter((i) => i.day === d));
    return acc;
  }, {});

  const Fields = ({ value, setValue }: { value: typeof blank; setValue: Setter<typeof blank> }) => (
    <>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {DAYS_ZH.map((d) => (
          <span key={d} onClick={() => setValue((p) => ({ ...p, day: d }))}
            style={{ padding: "6px 12px", borderRadius: 999, background: value.day === d ? COLORS.blue : COLORS.light, color: value.day === d ? "#fff" : COLORS.muted, cursor: "pointer", fontSize: 14, fontWeight: 800, transition: "background .15s" }}>
            {d}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {TIME_BLOCKS.map((block) => (
          <span key={block} onClick={() => setValue((p) => ({ ...p, period: block }))}
            style={{ padding: "6px 12px", borderRadius: 999, background: value.period === block ? COLORS.primary : COLORS.light, color: value.period === block ? "#fff" : COLORS.muted, cursor: "pointer", fontSize: 14, fontWeight: 800, transition: "background .15s" }}>
            {block}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <Input value={value.time} onChange={(v) => setValue((p) => ({ ...p, time: v }))} placeholder="具体时间（可选，如 2:30）" style={{ width: 190 }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {WHO.map((w) => (
            <span key={w} onClick={() => setValue((p) => ({ ...p, who: w }))}
              style={{ padding: "6px 12px", borderRadius: 999, background: value.who === w ? COLORS.primary : COLORS.light, color: value.who === w ? "#fff" : COLORS.muted, cursor: "pointer", fontSize: 14, fontWeight: 800, transition: "background .15s" }}>
              {w}
            </span>
          ))}
        </div>
      </div>
      <Input value={value.event} onChange={(v) => setValue((p) => ({ ...p, event: v }))} placeholder="活动内容" style={{ marginBottom: 12 }} />
    </>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 18 }}>
        <h2 style={{ margin: 0, color: COLORS.text, fontSize: 22, fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-flex", width: 4, height: 22, borderRadius: 4, background: COLORS.blue, flexShrink: 0 }} />
          本周花径 🪴
        </h2>
        <Btn onClick={() => setAdding(!adding)} small color={COLORS.blue}>
          {adding ? "取消" : "+ 铺一段花径"}
        </Btn>
      </div>

      {adding && (
        <Card style={{ border: `2px solid ${COLORS.blue}` }}>
          {Fields({ value: form, setValue: setForm })}
          <FormActions onSave={save} onCancel={() => setAdding(false)} saveText="铺到本周花径 🪴" color={COLORS.blue} />
        </Card>
      )}

      {data.length === 0 && !adding && <EmptyState emoji="🪴" text="本周花径还空着，先铺一小段要走的路吧。" />}

      <div style={{ display: "grid", gap: 10 }}>
        {DAYS_ZH.map((day) =>
          grouped[day].length === 0 ? null : (
            <Card key={day} style={{ padding: "16px" }}>
              <div style={{ fontWeight: 900, color: COLORS.blue, marginBottom: 8 }}>{day}</div>
              {grouped[day].map((item, index) => (
                <div key={item.id} style={{ padding: "8px 0", borderBottom: `1px solid ${COLORS.light}` }}>
                  {editId === item.id ? (
                    <>
                      {Fields({ value: editForm, setValue: setEditForm })}
                      <FormActions onSave={saveEdit} onCancel={() => setEditId(null)} saveText="保存修改" color={COLORS.blue} />
                    </>
                  ) : (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        {inferSchedulePeriod(item) && <Tag color="#E0F0FF">{inferSchedulePeriod(item)}</Tag>}
                        {item.time && <span style={{ fontSize: 14, color: COLORS.muted }}>{item.time}</span>}
                        <span style={{ flex: 1, minWidth: 140, color: COLORS.text, fontSize: 16, wordBreak: "break-word" }}>{item.event}</span>
                        <Tag color={item.who === "一起" ? COLORS.soft : item.who === "我" ? "#E0F0FF" : "#FFE8F5"}>{item.who}</Tag>
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 7, flexWrap: "wrap", marginTop: 10 }}>
                        <MiniIconButton
                          label="上移"
                          color={COLORS.muted}
                          disabled={!canMoveScheduleItem(grouped[day], item.id, "up")}
                          onClick={() => moveScheduleItem(day, item.id, "up")}
                        >
                          ↑
                        </MiniIconButton>
                        <MiniIconButton
                          label="下移"
                          color={COLORS.muted}
                          disabled={!canMoveScheduleItem(grouped[day], item.id, "down")}
                          onClick={() => moveScheduleItem(day, item.id, "down")}
                        >
                          ↓
                        </MiniIconButton>
                        <MiniIconButton
                          label="编辑"
                          color={COLORS.blue}
                          onClick={() => {
                            setEditId(item.id);
                            setEditForm({ day: item.day, period: inferSchedulePeriod(item) || "上午", time: item.time, event: item.event, who: item.who });
                          }}
                        >
                          /
                        </MiniIconButton>
                        <MiniIconButton
                          label="删除"
                          color={COLORS.danger}
                          onClick={() => {
                            if (confirmDelete()) setData((prev) => prev.filter((x) => x.id !== item.id));
                          }}
                        >
                          -
                        </MiniIconButton>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </Card>
          )
        )}
      </div>
    </div>
  );
}

// ─── Check-in ─────────────────────────────────────────────────────────────────
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const daysBetween = (fromDate: string, toDate = today()) => {
  const from = toLocalDate(fromDate);
  const to = toLocalDate(toDate);
  return Math.max(0, Math.floor((to.getTime() - from.getTime()) / MS_PER_DAY));
};

const displayCurrentStreak = (item: CheckinEntry) => {
  if (!item.lastCheckinDate) return 0;
  const gap = daysBetween(item.lastCheckinDate);
  if (gap <= 1) return item.currentStreak || 0;
  return 0;
};

const CHECKIN_REWARD_TYPES: {
  value: CheckinRewardType;
  label: string;
  shortLabel: string;
  unit: string;
  color: string;
  bg: string;
}[] = [
  { value: "streak", label: "连续打卡奖励", shortLabel: "连续", unit: "天", color: COLORS.green, bg: "#E8F5E8" },
  { value: "total", label: "累计打卡奖励", shortLabel: "累计", unit: "次", color: COLORS.yellow, bg: "#FFF8DC" },
];

const getCheckinRewardMeta = (type: CheckinRewardType) =>
  CHECKIN_REWARD_TYPES.find((item) => item.value === type) || CHECKIN_REWARD_TYPES[0];

const parseRewardTarget = (value: string | number) => {
  const target = Math.floor(Number(value));
  return Number.isFinite(target) && target > 0 ? target : 0;
};

type CheckinRewardForm = {
  title: string;
  type: CheckinRewardType;
  target: string;
};

const blankCheckinRewardForm = (): CheckinRewardForm => ({
  title: "",
  type: "streak",
  target: "7",
});

function CheckinTab({ data, setData }: { data: CheckinEntry[]; setData: Setter<CheckinEntry[]> }) {
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [addingRewardFor, setAddingRewardFor] = useState<string | null>(null);
  const [rewardForm, setRewardForm] = useState<CheckinRewardForm>(blankCheckinRewardForm());
  const [editReward, setEditReward] = useState<{ projectId: string; rewardId: string } | null>(null);
  const [editRewardForm, setEditRewardForm] = useState<CheckinRewardForm>(blankCheckinRewardForm());

  const addProject = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setData((prev) => [
      { id: uid(), createdAt: now(), name: trimmed, currentStreak: 0, longestStreak: 0, totalCheckins: 0, history: [], rewards: [] },
      ...prev,
    ]);
    setName("");
    setAdding(false);
  };

  const getRewardProgress = (item: CheckinEntry, reward: CheckinReward) => {
    const current = reward.type === "streak" ? displayCurrentStreak(item) : item.totalCheckins || 0;
    const target = Math.max(1, Number(reward.target || 1));
    return {
      current,
      target,
      percent: Math.min(100, Math.round((current / target) * 100)),
      reached: current >= target,
    };
  };

  const saveReward = (projectId: string) => {
    const title = rewardForm.title.trim();
    const target = parseRewardTarget(rewardForm.target);
    if (!title || !target) return;
    setData((prev) =>
      prev.map((item) =>
        item.id === projectId
          ? {
              ...item,
              rewards: [
                { id: uid(), createdAt: now(), title, type: rewardForm.type, target, claimed: false },
                ...(item.rewards || []),
              ],
              updatedAt: now(),
            }
          : item
      )
    );
    setRewardForm(blankCheckinRewardForm());
    setAddingRewardFor(null);
  };

  const saveRewardEdit = () => {
    if (!editReward) return;
    const title = editRewardForm.title.trim();
    const target = parseRewardTarget(editRewardForm.target);
    if (!title || !target) return;
    setData((prev) =>
      prev.map((item) =>
        item.id === editReward.projectId
          ? {
              ...item,
              rewards: (item.rewards || []).map((reward) =>
                reward.id === editReward.rewardId
                  ? { ...reward, title, type: editRewardForm.type, target, updatedAt: now() }
                  : reward
              ),
              updatedAt: now(),
            }
          : item
      )
    );
    setEditReward(null);
  };

  const deleteReward = (projectId: string, rewardId: string) => {
    if (!confirmDelete()) return;
    setData((prev) =>
      prev.map((item) =>
        item.id === projectId
          ? { ...item, rewards: (item.rewards || []).filter((reward) => reward.id !== rewardId), updatedAt: now() }
          : item
      )
    );
    if (editReward?.rewardId === rewardId) setEditReward(null);
  };

  const toggleRewardClaimed = (projectId: string, rewardId: string) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === projectId
          ? {
              ...item,
              rewards: (item.rewards || []).map((reward) =>
                reward.id === rewardId
                  ? {
                      ...reward,
                      claimed: !reward.claimed,
                      claimedAt: !reward.claimed ? now() : undefined,
                      updatedAt: now(),
                    }
                  : reward
              ),
              updatedAt: now(),
            }
          : item
      )
    );
  };

  const checkIn = (id: string) => {
    const todayKey = today();
    setData((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (item.lastCheckinDate === todayKey) {
          alert("今天已经打过卡啦，明天再来～");
          return item;
        }
        const gap = item.lastCheckinDate ? daysBetween(item.lastCheckinDate, todayKey) : null;
        const baseStreak = displayCurrentStreak(item);
        const nextStreak = gap === 1 ? baseStreak + 1 : 1;
        const history = Array.from(new Set([...(item.history || []), todayKey])).sort();
        return {
          ...item,
          lastCheckinDate: todayKey,
          currentStreak: nextStreak,
          longestStreak: Math.max(item.longestStreak || 0, nextStreak),
          totalCheckins: (item.totalCheckins || 0) + 1,
          history,
          updatedAt: now(),
        };
      })
    );
  };

  const deleteProject = (id: string) => {
    if (!confirmDelete()) return;
    setData((prev) => prev.filter((item) => item.id !== id));
  };

  const RewardFields = ({
    value,
    setValue,
  }: {
    value: CheckinRewardForm;
    setValue: Setter<CheckinRewardForm>;
  }) => {
    const meta = getCheckinRewardMeta(value.type);
    return (
      <>
        <Input
          value={value.title}
          onChange={(v) => setValue((p) => ({ ...p, title: v }))}
          placeholder="奖励内容，比如：买一杯奶茶、看一场电影、买一束花"
          style={{ marginBottom: 10 }}
        />
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 10 }}>
          {CHECKIN_REWARD_TYPES.map((option) => (
            <span
              key={option.value}
              onClick={() => setValue((p) => ({ ...p, type: option.value }))}
              style={{
                padding: "7px 13px",
                borderRadius: 999,
                background: value.type === option.value ? option.color : COLORS.light,
                color: value.type === option.value ? "#fff" : COLORS.muted,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 900,
                transition: "background .15s",
              }}
            >
              {option.label}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <Input
            type="number"
            value={value.target}
            onChange={(v) => setValue((p) => ({ ...p, target: v }))}
            placeholder={`目标${meta.unit}数`}
            style={{ width: 150 }}
          />
          <span style={{ color: COLORS.muted, fontSize: 14, fontWeight: 700 }}>
            达到 {parseRewardTarget(value.target) || "?"}{meta.unit} 解锁
          </span>
        </div>
      </>
    );
  };

  const sorted = [...data].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 18 }}>
        <h2 style={{ margin: 0, color: COLORS.text, fontSize: 22, fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-flex", width: 4, height: 22, borderRadius: 4, background: COLORS.green, flexShrink: 0 }} />
          打卡浇水 💧
        </h2>
        <Btn onClick={() => setAdding(!adding)} small color={COLORS.green}>
          {adding ? "取消" : "+ 加一株要浇水的事"}
        </Btn>
      </div>

      {adding && (
        <Card style={{ border: `2px solid ${COLORS.green}` }}>
          <Input value={name} onChange={setName} placeholder="要浇水的事，比如：早睡、运动、读书" style={{ marginBottom: 12 }} />
          <FormActions onSave={addProject} onCancel={() => setAdding(false)} saveText="种下项目" color={COLORS.green} />
        </Card>
      )}

      {sorted.length === 0 && !adding && <EmptyState emoji="💧" text="还没有要浇水的项目，先种下一件想坚持的小事吧～" />}

      {sorted.map((item) => {
        const current = displayCurrentStreak(item);
        const checkedToday = item.lastCheckinDate === today();
        const rewards = [...(item.rewards || [])].sort((a, b) => {
          const aProgress = getRewardProgress(item, a);
          const bProgress = getRewardProgress(item, b);
          if (Number(a.claimed) !== Number(b.claimed)) return Number(a.claimed) - Number(b.claimed);
          if (Number(aProgress.reached) !== Number(bProgress.reached)) return Number(bProgress.reached) - Number(aProgress.reached);
          return a.target - b.target || b.createdAt - a.createdAt;
        });
        const reachedCount = rewards.filter((reward) => getRewardProgress(item, reward).reached).length;
        const claimedCount = rewards.filter((reward) => reward.claimed).length;

        return (
          <Card key={item.id} style={{ borderLeft: `4px solid ${COLORS.green}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 19, fontWeight: 900, color: COLORS.text, wordBreak: "break-word" }}>{item.name}</div>
                <div style={{ color: COLORS.muted, fontSize: 13, marginTop: 4 }}>
                  {item.lastCheckinDate ? `上次打卡：${fmtDate(item.lastCheckinDate)}` : "还没有开始打卡"}
                </div>
              </div>
              <Tag color={checkedToday ? "#E8F5E8" : COLORS.soft}>{checkedToday ? "今日已打卡" : "今日待打卡"}</Tag>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginBottom: 14 }}>
              <div style={{ background: current > 0 ? "linear-gradient(135deg, #E8F8EE 0%, #D4F0DC 100%)" : "linear-gradient(135deg, #FFF5F0 0%, #FFEDE4 100%)", borderRadius: 16, padding: "12px 12px", border: `1px solid ${current > 0 ? "rgba(104,174,126,.25)" : "rgba(240,190,170,.3)"}` }}>
                <div style={{ color: current > 0 ? COLORS.green : COLORS.muted, fontSize: 11, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase" }}>已坚持</div>
                <div style={{ color: current > 0 ? COLORS.green : COLORS.text, fontSize: 24, fontWeight: 900, marginTop: 4 }}>{current}天</div>
              </div>
              <div style={{ background: "linear-gradient(135deg, #EEF4FF 0%, #E0ECFF 100%)", borderRadius: 16, padding: "12px 12px", border: "1px solid rgba(104,152,184,.2)" }}>
                <div style={{ color: COLORS.blue, fontSize: 11, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase" }}>最长坚持</div>
                <div style={{ color: COLORS.text, fontSize: 24, fontWeight: 900, marginTop: 4 }}>{item.longestStreak || 0}天</div>
              </div>
              <div style={{ background: "linear-gradient(135deg, #FFF8ED 0%, #FFF0D0 100%)", borderRadius: 16, padding: "12px 12px", border: "1px solid rgba(238,184,72,.2)" }}>
                <div style={{ color: COLORS.yellow, fontSize: 11, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase" }}>累计打卡</div>
                <div style={{ color: COLORS.text, fontSize: 24, fontWeight: 900, marginTop: 4 }}>{item.totalCheckins || 0}次</div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
              <Btn
                onClick={() => checkIn(item.id)}
                color={checkedToday ? COLORS.muted : COLORS.green}
                small
                className={!checkedToday ? "diary-pulse" : ""}
              >
                {checkedToday ? "今天已完成 ✓" : "打卡浇水 💧"}
              </Btn>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Btn
                  small
                  outline
                  color={COLORS.yellow}
                  onClick={() => {
                    setAddingRewardFor(addingRewardFor === item.id ? null : item.id);
                    setRewardForm(blankCheckinRewardForm());
                    setEditReward(null);
                  }}
                  style={{ color: COLORS.text }}
                >
                  {addingRewardFor === item.id ? "取消奖励" : "+ 添加奖励"}
                </Btn>
                <Btn small outline color={COLORS.danger} onClick={() => deleteProject(item.id)}>
                  删除项目
                </Btn>
              </div>
            </div>

            {addingRewardFor === item.id && (
              <div style={{ background: "rgba(255,248,244,.85)", border: `1.5px dashed ${COLORS.yellow}`, borderRadius: 18, padding: "14px 14px", marginBottom: 14 }}>
                <div style={{ fontWeight: 900, color: COLORS.text, marginBottom: 10 }}>添加奖励 🎁</div>
                {RewardFields({ value: rewardForm, setValue: setRewardForm })}
                <FormActions onSave={() => saveReward(item.id)} onCancel={() => setAddingRewardFor(null)} saveText="保存奖励" color={COLORS.yellow} />
              </div>
            )}

            <div style={{ borderTop: `1px solid ${COLORS.light}`, paddingTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 900, color: COLORS.text, display: "flex", alignItems: "center", gap: 7 }}>
                  <span>🎁</span>
                  奖励追踪
                </div>
                <div style={{ color: COLORS.muted, fontSize: 13, fontWeight: 700 }}>
                  {rewards.length > 0 ? `${claimedCount}/${rewards.length} 已领取 · ${reachedCount} 个已达成` : "还没有奖励"}
                </div>
              </div>

              {rewards.length === 0 ? (
                <div style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.7, background: COLORS.light, borderRadius: 14, padding: "10px 12px" }}>
                  给这个目标设一个小奖励，会更容易坚持。比如连续 7 天早睡奖励一杯奶茶，累计 30 次运动奖励一件新装备。
                </div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {rewards.map((reward) => {
                    const meta = getCheckinRewardMeta(reward.type);
                    const progress = getRewardProgress(item, reward);
                    const editingThisReward = editReward?.projectId === item.id && editReward.rewardId === reward.id;

                    return (
                      <div key={reward.id} style={{ background: reward.claimed ? "rgba(232,245,232,.72)" : "rgba(255,255,255,.9)", border: `1px solid ${progress.reached ? "rgba(104,174,126,.28)" : "rgba(240,190,170,.32)"}`, borderRadius: 16, padding: "12px 12px" }}>
                        {editingThisReward ? (
                          <>
                            {RewardFields({ value: editRewardForm, setValue: setEditRewardForm })}
                            <FormActions onSave={saveRewardEdit} onCancel={() => setEditReward(null)} saveText="保存修改" color={COLORS.yellow} />
                          </>
                        ) : (
                          <>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 8 }}>
                              <div style={{ minWidth: 0, flex: "1 1 160px" }}>
                                <div style={{ fontWeight: 900, color: COLORS.text, fontSize: 16, wordBreak: "break-word" }}>{reward.title}</div>
                                <div style={{ color: COLORS.muted, fontSize: 13, marginTop: 3 }}>
                                  当前 {progress.current}/{progress.target}{meta.unit}
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                                <Tag color={meta.bg} textColor={meta.color}>{meta.shortLabel}</Tag>
                                <Tag color={reward.claimed ? "#E8F5E8" : progress.reached ? "#FFF8DC" : COLORS.light} textColor={reward.claimed ? COLORS.green : progress.reached ? COLORS.yellow : COLORS.muted}>
                                  {reward.claimed ? "已领取" : progress.reached ? "已达成" : "进行中"}
                                </Tag>
                              </div>
                            </div>

                            <div style={{ height: 9, background: COLORS.light, borderRadius: 999, overflow: "hidden", marginBottom: 10 }}>
                              <div style={{ height: "100%", width: `${progress.percent}%`, background: progress.reached ? BTN_GRADIENTS[COLORS.green] : BTN_GRADIENTS[meta.color] || meta.color, borderRadius: 999, transition: "width .25s ease" }} />
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <div style={{ color: COLORS.muted, fontSize: 12, fontWeight: 700 }}>
                                {progress.reached ? "可以兑现奖励啦" : `还差 ${Math.max(0, progress.target - progress.current)}${meta.unit}`}
                              </div>
                              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                                {progress.reached && (
                                  <Btn small outline color={reward.claimed ? COLORS.muted : COLORS.green} onClick={() => toggleRewardClaimed(item.id, reward.id)}>
                                    {reward.claimed ? "取消领取" : "标记已领取"}
                                  </Btn>
                                )}
                                <MiniIconButton
                                  label="编辑奖励"
                                  color={COLORS.blue}
                                  onClick={() => {
                                    setEditReward({ projectId: item.id, rewardId: reward.id });
                                    setEditRewardForm({ title: reward.title, type: reward.type, target: String(reward.target || "") });
                                    setAddingRewardFor(null);
                                  }}
                                >
                                  /
                                </MiniIconButton>
                                <MiniIconButton
                                  label="删除奖励"
                                  color={COLORS.danger}
                                  onClick={() => deleteReward(item.id, reward.id)}
                                >
                                  -
                                </MiniIconButton>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Shopping List ────────────────────────────────────────────────────────────
function ShoppingTab({ data, setData }: { data: ShoppingEntry[]; setData: Setter<ShoppingEntry[]> }) {
  const blank = { name: "", quantity: "", category: "日用品", note: "" };
  const [form, setForm] = useState(blank);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(blank);

  const CATEGORIES = ["日用品","食物","宝宝","家里","其他"];
  const CATEGORY_COLOR: Record<string, string> = {
    日用品: COLORS.soft,
    食物: "#E8F5E8",
    宝宝: "#FFE8F5",
    家里: "#E0F0FF",
    其他: COLORS.light,
  };

  const save = () => {
    if (!form.name.trim()) return;
    setData((prev) => [{ id: uid(), createdAt: now(), bought: false, ...form }, ...prev]);
    setForm(blank);
    setAdding(false);
  };

  const saveEdit = () => {
    if (!editId || !editForm.name.trim()) return;
    setData((prev) =>
      prev.map((item) => (item.id === editId ? { ...item, ...editForm, updatedAt: now() } : item))
    );
    setEditId(null);
  };

  const toggleBought = (id: string) =>
    setData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, bought: !item.bought, updatedAt: now() } : item))
    );

  const clearBought = () => {
    const boughtCount = data.filter((item) => item.bought).length;
    if (boughtCount === 0) return;
    if (!window.confirm(`确定清空 ${boughtCount} 个已买项目吗？`)) return;
    setData((prev) => prev.filter((item) => !item.bought));
  };

  const Fields = ({ value, setValue }: { value: typeof blank; setValue: Setter<typeof blank> }) => (
    <>
      <Input value={value.name} onChange={(v) => setValue((p) => ({ ...p, name: v }))} placeholder="要买什么？比如：牛奶、纸巾、洗衣液" style={{ marginBottom: 10 }} />
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <Input value={value.quantity} onChange={(v) => setValue((p) => ({ ...p, quantity: v }))} placeholder="数量（可选，如 2盒）" style={{ width: 190 }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {CATEGORIES.map((c) => (
            <span key={c} onClick={() => setValue((p) => ({ ...p, category: c }))}
              style={{ padding: "6px 12px", borderRadius: 999, background: value.category === c ? COLORS.green : COLORS.light, color: value.category === c ? "#fff" : COLORS.muted, cursor: "pointer", fontSize: 14, fontWeight: 800, transition: "background .15s" }}>
              {c}
            </span>
          ))}
        </div>
      </div>
      <Input value={value.note} onChange={(v) => setValue((p) => ({ ...p, note: v }))} placeholder="备注（可选，如 Costco / Target / 要打折再买）" style={{ marginBottom: 12 }} />
    </>
  );

  const todo = data.filter((item) => !item.bought).sort((a, b) => b.createdAt - a.createdAt);
  const bought = data.filter((item) => item.bought).sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0) || b.createdAt - a.createdAt);

  const ShoppingCard = ({ item }: { item: ShoppingEntry }) => (
    <Card style={{ borderLeft: `4px solid ${item.bought ? COLORS.green : COLORS.secondary}`, opacity: item.bought ? 0.65 : 1 }}>
      {editId === item.id ? (
        <>
          {Fields({ value: editForm, setValue: setEditForm })}
          <FormActions onSave={saveEdit} onCancel={() => setEditId(null)} saveText="保存修改" color={COLORS.green} />
        </>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div
              onClick={() => toggleBought(item.id)}
              style={{
                width: 25, height: 25, borderRadius: "50%",
                border: item.bought ? "none" : `2px solid ${COLORS.green}`,
                background: item.bought ? COLORS.green : "transparent",
                cursor: "pointer", flexShrink: 0, marginTop: 2,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background .2s",
              }}
            >
              {item.bought && <span style={{ color: "#fff", fontSize: 13 }}>✓</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                <span style={{ fontWeight: 900, color: item.bought ? COLORS.muted : COLORS.text, textDecoration: item.bought ? "line-through" : "none", wordBreak: "break-word" }}>
                  {item.name}
                </span>
                {item.quantity && <span style={{ fontSize: 14, color: COLORS.muted }}>× {item.quantity}</span>}
                <Tag color={CATEGORY_COLOR[item.category] || COLORS.light}>{item.category}</Tag>
              </div>
              {item.note && <div style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.6, wordBreak: "break-word" }}>📝 {item.note}</div>}
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <ActionButtons
              onEdit={() => {
                setEditId(item.id);
                setEditForm({ name: item.name, quantity: item.quantity, category: item.category, note: item.note });
              }}
              onDelete={() => {
                if (confirmDelete()) setData((prev) => prev.filter((x) => x.id !== item.id));
              }}
            />
          </div>
        </>
      )}
    </Card>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 18 }}>
        <h2 style={{ margin: 0, color: COLORS.text, fontSize: 22, fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-flex", width: 4, height: 22, borderRadius: 4, background: COLORS.green, flexShrink: 0 }} />
          采购花篮 🧺
        </h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {bought.length > 0 && (
            <Btn onClick={clearBought} small outline color={COLORS.danger}>清空已买</Btn>
          )}
          <Btn onClick={() => setAdding(!adding)} small color={COLORS.green}>
            {adding ? "取消" : "+ 加物品"}
          </Btn>
        </div>
      </div>

      {adding && (
        <Card style={{ border: `2px solid ${COLORS.green}` }}>
          {Fields({ value: form, setValue: setForm })}
          <FormActions onSave={save} onCancel={() => setAdding(false)} saveText="放进采购花篮 🧺" color={COLORS.green} />
        </Card>
      )}

      {data.length === 0 && !adding && <EmptyState emoji="🧺" text="采购花篮还是空的，先放一个要买的东西吧～" />}

      {todo.length > 0 && (
        <div>
          <div style={{ fontWeight: 900, color: COLORS.green, fontSize: 15, margin: "0 0 8px" }}>待买</div>
          {todo.map((item) => <div key={item.id}>{ShoppingCard({ item })}</div>)}
        </div>
      )}

      {bought.length > 0 && (
        <div>
          <div style={{ fontWeight: 900, color: COLORS.muted, fontSize: 15, margin: "16px 0 8px" }}>已买</div>
          {bought.map((item) => <div key={item.id}>{ShoppingCard({ item })}</div>)}
        </div>
      )}
    </div>
  );
}


// ─── Crochet Basket ───────────────────────────────────────────────────────────
const CROCHET_STATUS_META: Record<CrochetProjectStatus, {
  label: string;
  emoji: string;
  color: string;
  empty: string;
}> = {
  doing: {
    label: "进行中",
    emoji: "🧶",
    color: COLORS.purple,
    empty: "还没有进行中的钩织项目。先放一个正在钩的小东西吧～",
  },
  done: {
    label: "已完成",
    emoji: "🌷",
    color: COLORS.green,
    empty: "完成区还空着。等第一件作品收尾，就把它放到这里。",
  },
};

function CrochetBasketTab({ data, setData }: { data: CrochetProjectEntry[]; setData: Setter<CrochetProjectEntry[]> }) {
  const blank: CrochetProjectForm = { name: "", imageUrl: "", pattern: "", status: "doing" };
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<CrochetProjectForm>(blank);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CrochetProjectForm>(blank);
  const [collapsed, setCollapsed] = useState<Record<CrochetProjectStatus, boolean>>({ doing: false, done: false });

  const doing = data.filter((item) => (item.status || "doing") === "doing").sort((a, b) => b.createdAt - a.createdAt);
  const done = data.filter((item) => item.status === "done").sort((a, b) => (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt));

  const cleanForm = (value: CrochetProjectForm): CrochetProjectForm => ({
    name: value.name.trim(),
    imageUrl: value.imageUrl.trim(),
    pattern: value.pattern.trim(),
    status: value.status || "doing",
  });

  const resetAdd = () => {
    setForm(blank);
    setAdding(false);
  };

  const save = () => {
    const cleaned = cleanForm(form);
    if (!cleaned.name) return;
    setData((prev) => [{ id: uid(), createdAt: now(), ...cleaned }, ...prev]);
    resetAdd();
  };

  const saveEdit = () => {
    if (!editId) return;
    const cleaned = cleanForm(editForm);
    if (!cleaned.name) return;
    setData((prev) =>
      prev.map((item) => (item.id === editId ? { ...item, ...cleaned, updatedAt: now() } : item))
    );
    setEditId(null);
  };

  const startEdit = (item: CrochetProjectEntry) => {
    setAdding(false);
    setEditId(item.id);
    setEditForm({
      name: item.name || "",
      imageUrl: item.imageUrl || "",
      pattern: item.pattern || "",
      status: item.status || "doing",
    });
  };

  const toggleStatus = (id: string) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: (item.status || "doing") === "doing" ? "done" : "doing", updatedAt: now() }
          : item
      )
    );
  };

  const deleteProject = (id: string) => {
    if (confirmDelete()) setData((prev) => prev.filter((item) => item.id !== id));
  };

  const handleProjectImageUpload = async (fileList: FileList | null, setValue: Setter<CrochetProjectForm>) => {
    const file = Array.from(fileList || []).find((item) => item.type.startsWith("image/"));
    if (!file) return;
    try {
      const raw = await readFileAsDataUrl(file);
      const src = await shrinkPhoto(raw, 900, 0.72);
      setValue((prev) => ({ ...prev, imageUrl: src }));
    } catch {
      alert("图片导入失败。可以换一张小一点的图片试试。");
    }
  };

  const Fields = ({ value, setValue }: { value: CrochetProjectForm; setValue: Setter<CrochetProjectForm> }) => (
    <>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {(Object.keys(CROCHET_STATUS_META) as CrochetProjectStatus[]).map((status) => {
          const meta = CROCHET_STATUS_META[status];
          const active = value.status === status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => setValue((p) => ({ ...p, status }))}
              className="diary-btn"
              style={{
                border: active ? `2px solid ${meta.color}` : "1.5px solid rgba(232,185,165,.5)",
                background: active ? `${meta.color}22` : "rgba(255,248,244,.72)",
                color: active ? COLORS.text : COLORS.muted,
                borderRadius: 999,
                padding: "8px 14px",
                cursor: "pointer",
                fontWeight: active ? 900 : 700,
                boxShadow: active ? "0 2px 12px rgba(61,34,24,.10)" : "none",
              }}
            >
              {meta.emoji} {meta.label}
            </button>
          );
        })}
      </div>

      <Input
        value={value.name}
        onChange={(v) => setValue((p) => ({ ...p, name: v }))}
        placeholder="项目名称：比如小花篮、杯垫、发夹、安安的小包"
        style={{ marginBottom: 10 }}
      />

      <div style={{ marginBottom: 10 }}>
        <label
          className="diary-btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            borderRadius: 999,
            padding: "8px 18px",
            fontSize: 14,
            fontWeight: 800,
            cursor: "pointer",
            color: COLORS.purple,
            border: `1.5px solid ${COLORS.purple}`,
            background: "transparent",
          }}
        >
          {value.imageUrl ? "重新上传图片" : "上传项目图片"}
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              handleProjectImageUpload(e.currentTarget.files, setValue);
              e.currentTarget.value = "";
            }}
          />
        </label>
        <span style={{ color: COLORS.muted, fontSize: 13, marginLeft: 8 }}>会自动压缩后保存在本地，不再依赖外链。</span>
      </div>

      {value.imageUrl.trim() && (
        <div style={{ marginBottom: 10, borderRadius: 18, overflow: "hidden", border: "1px solid rgba(161,183,132,.34)", background: COLORS.light }}>
          <img
            src={value.imageUrl.trim()}
            alt="钩织项目预览"
            style={{ width: "100%", maxHeight: 240, objectFit: "contain" }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <div style={{ padding: "8px 10px", display: "flex", justifyContent: "flex-end" }}>
            <Btn small outline color={COLORS.danger} onClick={() => setValue((p) => ({ ...p, imageUrl: "" }))}>移除图片</Btn>
          </div>
        </div>
      )}

      <Input
        value={value.pattern}
        onChange={(v) => setValue((p) => ({ ...p, pattern: v }))}
        placeholder="图解描述：针法、圈数、材料、链接、容易忘的步骤都可以写这里"
        multiline
        rows={5}
        style={{ marginBottom: 12 }}
      />
    </>
  );

  const Stat = ({ count, label, color }: { count: number; label: string; color: string }) => (
    <div style={{ background: `${color}18`, borderRadius: 18, padding: "12px", textAlign: "center" }}>
      <div style={{ color, fontSize: 26, fontWeight: 900 }}>{count}</div>
      <div style={{ color: COLORS.muted, fontSize: 13, fontWeight: 800 }}>{label}</div>
    </div>
  );

  const ProjectCard = ({ item }: { item: CrochetProjectEntry }) => {
    const status = item.status || "doing";
    const meta = CROCHET_STATUS_META[status];
    return (
      <Card style={{ borderLeft: `4px solid ${meta.color}`, opacity: status === "done" ? 0.82 : 1 }}>
        {editId === item.id ? (
          <>
            {Fields({ value: editForm, setValue: setEditForm })}
            <FormActions onSave={saveEdit} onCancel={() => setEditId(null)} saveText="保存修改" color={meta.color} />
          </>
        ) : (
          <>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  style={{
                    width: 96,
                    height: 96,
                    objectFit: "cover",
                    borderRadius: 18,
                    flexShrink: 0,
                    border: "1px solid rgba(161,183,132,.34)",
                    background: COLORS.light,
                  }}
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              ) : (
                <div style={{
                  width: 96,
                  height: 96,
                  borderRadius: 18,
                  flexShrink: 0,
                  background: "linear-gradient(145deg, rgba(165,138,191,.18), rgba(235,170,192,.18))",
                  border: "1px dashed rgba(165,138,191,.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 34,
                }}>
                  🧶
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 7 }}>
                  <strong style={{ color: COLORS.text, fontSize: 18, lineHeight: 1.45, wordBreak: "break-word" }}>{item.name}</strong>
                  <Tag color={`${meta.color}22`} textColor={meta.color}>{meta.emoji} {meta.label}</Tag>
                </div>

                {item.imageUrl && (
                  <div style={{ color: COLORS.muted, fontSize: 12, lineHeight: 1.5, marginBottom: 6 }}>
                    已保存本地压缩图片
                  </div>
                )}
              </div>
            </div>

            {item.pattern && (
              <div style={{ background: COLORS.light, borderRadius: 16, padding: "11px 13px", color: COLORS.muted, fontSize: 15, lineHeight: 1.75, whiteSpace: "pre-wrap", wordBreak: "break-word", marginBottom: 12 }}>
                <strong style={{ color: COLORS.accent }}>图解描述：</strong>{item.pattern}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
              <Btn small outline color={status === "done" ? COLORS.purple : COLORS.green} onClick={() => toggleStatus(item.id)}>
                {status === "done" ? "移回进行中" : "标记完成"}
              </Btn>
              <ActionButtons onEdit={() => startEdit(item)} onDelete={() => deleteProject(item.id)} />
            </div>
          </>
        )}
      </Card>
    );
  };

  const Section = ({ status, items }: { status: CrochetProjectStatus; items: CrochetProjectEntry[] }) => {
    const meta = CROCHET_STATUS_META[status];
    const isCollapsed = collapsed[status];
    return (
      <div>
        <button
          type="button"
          onClick={() => setCollapsed((p) => ({ ...p, [status]: !p[status] }))}
          style={{
            width: "100%",
            border: "none",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            padding: "4px 2px 10px",
            color: meta.color,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <span style={{ fontWeight: 900, fontSize: 16 }}>{meta.emoji} {meta.label} · {items.length}</span>
          <span style={{ color: COLORS.muted, fontSize: 18 }}>{isCollapsed ? "＋" : "－"}</span>
        </button>
        {!isCollapsed && (
          <div>
            {items.length === 0 ? (
              <EmptyState emoji={meta.emoji} text={meta.empty} />
            ) : (
              items.map((item) => <ProjectCard key={item.id} item={item} />)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, color: COLORS.text, fontSize: 22, fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "inline-flex", width: 4, height: 22, borderRadius: 4, background: COLORS.purple, flexShrink: 0 }} />
            钩织花篮 🧶
          </h2>
          <div style={{ marginTop: 5, color: COLORS.muted, fontSize: 13, lineHeight: 1.6, paddingLeft: 12 }}>
            收纳正在钩和已经收尾的项目：名字、本地上传图片、图解描述都放在一张卡片里。
          </div>
        </div>
        <Btn
          onClick={() => {
            if (adding) resetAdd();
            else {
              setEditId(null);
              setForm(blank);
              setAdding(true);
            }
          }}
          small
          color={COLORS.purple}
        >
          {adding ? "取消" : "+ 加钩织项目"}
        </Btn>
      </div>

      <Card style={{ border: `2px solid ${COLORS.purple}`, background: "linear-gradient(160deg, #FFFFFF 0%, #FAF5FF 100%)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10 }}>
          <Stat count={doing.length} label="进行中" color={COLORS.purple} />
          <Stat count={done.length} label="已完成" color={COLORS.green} />
          <Stat count={data.length} label="全部项目" color={COLORS.accent} />
        </div>
      </Card>

      {adding && (
        <Card style={{ border: `2px solid ${COLORS.purple}` }}>
          {Fields({ value: form, setValue: setForm })}
          <FormActions onSave={save} onCancel={resetAdd} saveText="放进钩织花篮 🧶" color={COLORS.purple} />
        </Card>
      )}

      {data.length === 0 && !adding && <EmptyState emoji="🧶" text="钩织花篮还是空的。先加一个正在进行的小项目，哪怕只有名字也可以。" />}

      {(data.length > 0 || adding) && (
        <>
          <Section status="doing" items={doing} />
          <Section status="done" items={done} />
        </>
      )}
    </div>
  );
}


// ─── Five-year Diary ─────────────────────────────────────────────────────────
const dateKey = (year: number, month: number, day: number) =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const addDays = (dateStr: string, amount: number) => {
  const d = toLocalDate(dateStr);
  d.setDate(d.getDate() + amount);
  return dateKey(d.getFullYear(), d.getMonth() + 1, d.getDate());
};

const sameMonthDayInYear = (baseDate: string, year: number) => {
  const base = toLocalDate(baseDate);
  const month = base.getMonth();
  const day = base.getDate();
  const lastDay = new Date(year, month + 1, 0).getDate();
  return dateKey(year, month + 1, Math.min(day, lastDay));
};

const fmtFullDate = (dateStr: string) =>
  toLocalDate(dateStr).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

const getEntryYearLabel = (date: string, baseYear: number) => {
  const year = toLocalDate(date).getFullYear();
  if (year === baseYear) return "今年";
  return `${baseYear - year}年前`;
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const shrinkPhoto = (dataUrl: string, maxWidth = 900, quality = 0.72) =>
  new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * ratio));
      canvas.height = Math.max(1, Math.round(img.height * ratio));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });


// ─── Life scroll: five-year plans, yearly/monthly plans & letters ───────────
const PLAN_MODULES: { key: LongPlanModuleKey; label: string; placeholder: string }[] = [
  { key: "familyLife", label: "家庭生活", placeholder: "家怎么运转、关系怎么修复、家里想创造什么样的氛围……" },
  { key: "parentingLife", label: "育儿生活", placeholder: "陪伴、作息、教育、亲子关系、我希望孩子感受到什么……" },
  { key: "careerDevelopment", label: "职业发展", placeholder: "工作方向、技能栈、项目、跳槽/晋升、想减少的消耗……" },
  { key: "wealthFreedom", label: "财富自由", placeholder: "收入、储蓄、投资、房子、风险垫、花钱优先级……" },
  { key: "personalGrowth", label: "个人发展", placeholder: "身体、情绪、兴趣、学习、边界、我想成为怎样的大人……" },
];

const LONG_WRITING_META: Record<LongWritingKind, {
  label: string;
  emoji: string;
  color: string;
  help: string;
  placeholder: string;
}> = {
  fiveYearPlan: {
    label: "五年计划",
    emoji: "🌳",
    color: COLORS.purple,
    help: "先写 5 年的大方向：不要写成 KPI，写成你真正想把生活带去的地方。",
    placeholder: "这 5 年我想把生活带向哪里？\n我想建立什么？\n我想停止消耗什么？\n到这 5 年结束时，我希望看到哪些证据？",
  },
  fiveYearReview: {
    label: "5年总结",
    emoji: "🏵️",
    color: COLORS.yellow,
    help: "给一个五年周期收尾：发生了什么、改变了什么、失去了什么、长出了什么。",
    placeholder: "这 5 年最重要的变化：\n我完成了：\n我扛住了：\n我终于明白了：\n下一个 5 年我想带走 / 放下的是：",
  },
  yearPlan: {
    label: "每年计划",
    emoji: "🗓️",
    color: COLORS.blue,
    help: "每年计划按五个模块写：家庭生活、育儿生活、职业发展、财富自由、个人发展。",
    placeholder: "这一年的主题、底线、取舍、补充说明……",
  },
  yearReview: {
    label: "年终总结",
    emoji: "🏆",
    color: COLORS.green,
    help: "年底写给自己看的复盘：发生了什么、撑过了什么、学到了什么、下一年不要再怎样。",
    placeholder: "这一年最重要的事：\n我完成了：\n我扛住了：\n我失望/遗憾的是：\n我感谢自己的地方：\n下一年我想带走什么、放下什么：",
  },
  monthPlan: {
    label: "每月计划",
    emoji: "🌙",
    color: COLORS.accent,
    help: "月计划不用宏大，写这个月最想推进的几件事和不想被什么拖走。",
    placeholder: "这个月的重点：\n家庭/育儿：\n工作/钱：\n我自己：\n月底希望看到的证据：",
  },
  letterSelf: {
    label: "写给自己",
    emoji: "💌",
    color: COLORS.accent,
    help: "这是完整的信，不是短句记录。可以写给现在的自己、未来的自己、小时候的自己。",
    placeholder: "亲爱的我：\n\n我想认真跟你说……\n\n这段时间你经历了……\n\n我希望你记得……\n\n爱你的，\n我",
  },
  letterOther: {
    label: "写给别人",
    emoji: "✉️",
    color: COLORS.primary,
    help: "可以写真正要发的信，也可以写永远不发的信。重点是完整表达，不压缩成几句。",
    placeholder: "亲爱的……：\n\n我一直想告诉你……\n\n当时我感受到……\n\n我希望我们……\n\n祝好，\n……",
  },
};

const LONG_WRITING_ORDER: LongWritingKind[] = ["fiveYearPlan", "fiveYearReview", "yearPlan", "yearReview", "monthPlan", "letterSelf", "letterOther"];
const LETTER_KINDS: LongWritingKind[] = ["letterSelf", "letterOther"];

const currentPlanningYear = () => new Date().getFullYear();
const getFiveYearPeriodStart = (year: number) => Math.floor((year - 1) / 5) * 5 + 1;
const getCurrentFiveYearPeriodStart = () => getFiveYearPeriodStart(currentPlanningYear());
const fiveYearPeriodLabel = (start: number) => `${start}-${start + 4}`;

const coercePlanningYear = (value?: string | number, fallback = currentPlanningYear()) => {
  const match = String(value || "").match(/\d{4}/);
  const year = match ? Number(match[0]) : Number(value);
  return Number.isFinite(year) && year > 1900 ? year : fallback;
};

const blankPlanModules = (): LongPlanModules => ({
  familyLife: "",
  parentingLife: "",
  careerDevelopment: "",
  wealthFreedom: "",
  personalGrowth: "",
});

const normalizePlanModules = (modules?: LongPlanModules): LongPlanModules => ({
  ...blankPlanModules(),
  ...(modules || {}),
});

const getLongWritingMeta = (kind?: LongWritingKind) =>
  LONG_WRITING_META[kind || "fiveYearPlan"] || LONG_WRITING_META.fiveYearPlan;

const getLongWritingPeriodStart = (entry: Partial<LongWritingEntry>) => {
  if (entry.periodStart && Number.isFinite(Number(entry.periodStart))) return Number(entry.periodStart);
  const year = coercePlanningYear(entry.year || entry.date || currentPlanningYear());
  return getFiveYearPeriodStart(year);
};

const blankLongWritingForm = (kind: LongWritingKind = "fiveYearPlan", defaults: Partial<LongWritingForm> = {}): LongWritingForm => {
  const defaultYear = coercePlanningYear(defaults.year, currentPlanningYear());
  const periodStart = defaults.periodStart || getFiveYearPeriodStart(defaultYear);
  const periodEnd = defaults.periodEnd || periodStart + 4;
  const year = kind === "fiveYearPlan" || kind === "fiveYearReview"
    ? fiveYearPeriodLabel(periodStart)
    : String(defaultYear);
  const month = defaults.month || `${String(defaultYear)}-01`;

  return {
    kind,
    date: defaults.date || today(),
    year,
    month,
    periodStart,
    periodEnd,
    to: defaults.to || (kind === "letterSelf" ? "未来的自己" : ""),
    title: defaults.title || "",
    content: defaults.content || "",
    reviewContent: defaults.reviewContent || "",
    modules: normalizePlanModules(defaults.modules),
    status: defaults.status || "draft",
  };
};

function LongTermWritingTab({ data, setData }: { data: LongWritingEntry[]; setData: Setter<LongWritingEntry[]> }) {
  const [selectedPeriodStart, setSelectedPeriodStart] = useState(getCurrentFiveYearPeriodStart());
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<LongWritingForm>(blankLongWritingForm("fiveYearPlan", { periodStart: getCurrentFiveYearPeriodStart() }));
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<LongWritingForm>(blankLongWritingForm());
  const [collapsedYears, setCollapsedYears] = useState<Record<string, boolean>>({});
  const [collapsedMonths, setCollapsedMonths] = useState<Record<string, boolean>>({});
  const [fiveYearCollapsed, setFiveYearCollapsed] = useState(false);

  const normalized = data.map((item) => {
    const kind = (LONG_WRITING_ORDER.includes(item.kind) ? item.kind : "fiveYearPlan") as LongWritingKind;
    const periodStart = getLongWritingPeriodStart(item);
    const periodEnd = Number(item.periodEnd) || periodStart + 4;
    const year = kind === "fiveYearPlan" || kind === "fiveYearReview"
      ? (item.year && item.year.includes("-") ? item.year : fiveYearPeriodLabel(periodStart))
      : String(coercePlanningYear(item.year || item.date));

    return {
      ...item,
      kind,
      date: item.date || today(),
      year,
      month: item.month || `${String(coercePlanningYear(year))}-01`,
      periodStart,
      periodEnd,
      to: item.to || "",
      title: item.title || "",
      content: item.content || "",
      reviewContent: item.reviewContent || "",
      modules: normalizePlanModules(item.modules),
      status: item.status === "done" ? "done" : "draft",
    } as LongWritingEntry;
  });

  const periodStarts = Array.from(new Set([
    2021,
    2026,
    2031,
    2036,
    getCurrentFiveYearPeriodStart(),
    ...normalized.filter((item) => !LETTER_KINDS.includes(item.kind)).map(getLongWritingPeriodStart),
  ]))
    .filter((year) => Number.isFinite(year))
    .sort((a, b) => a - b);

  const selectedPeriodEnd = selectedPeriodStart + 4;
  const selectedYears = Array.from({ length: 5 }, (_, index) => selectedPeriodStart + index);

  const periodItems = normalized
    .filter((item) => !LETTER_KINDS.includes(item.kind) && getLongWritingPeriodStart(item) === selectedPeriodStart)
    .sort((a, b) => b.createdAt - a.createdAt);

  const fiveYearPlans = periodItems.filter((item) => item.kind === "fiveYearPlan");
  const legacyFiveYearReviews = periodItems.filter((item) => item.kind === "fiveYearReview");
  const letters = normalized
    .filter((item) => LETTER_KINDS.includes(item.kind))
    .sort((a, b) => b.createdAt - a.createdAt);

  const resetAdd = () => {
    setAdding(false);
    setForm(blankLongWritingForm("fiveYearPlan", { periodStart: selectedPeriodStart }));
  };

  const openForm = (kind: LongWritingKind, defaults: Partial<LongWritingForm> = {}) => {
    const targetYear = coercePlanningYear(defaults.year, selectedPeriodStart);
    const periodStart = defaults.periodStart || (LETTER_KINDS.includes(kind) ? selectedPeriodStart : getFiveYearPeriodStart(targetYear));
    setEditId(null);
    setForm(blankLongWritingForm(kind, { periodStart, periodEnd: periodStart + 4, year: String(targetYear), ...defaults }));
    setAdding(true);
  };

  const cleanForm = (value: LongWritingForm): LongWritingForm => {
    const kind = value.kind || "fiveYearPlan";
    const firstYear = coercePlanningYear(value.year || value.month, selectedPeriodStart);
    const periodStart = value.periodStart || getFiveYearPeriodStart(firstYear);
    const isFiveYear = kind === "fiveYearPlan" || kind === "fiveYearReview";
    return {
      ...value,
      kind,
      date: value.date || today(),
      year: isFiveYear ? fiveYearPeriodLabel(periodStart) : String(firstYear),
      month: value.month || `${String(firstYear)}-01`,
      periodStart,
      periodEnd: value.periodEnd || periodStart + 4,
      to: (value.to || "").trim(),
      title: (value.title || "").trim(),
      content: (value.content || "").trim(),
      reviewContent: (value.reviewContent || "").trim(),
      modules: normalizePlanModules(value.modules),
      status: value.status === "done" ? "done" : "draft",
    };
  };

  const hasUsefulContent = (value: LongWritingForm) => {
    if ((value.title || "").trim() || (value.content || "").trim() || (value.reviewContent || "").trim()) return true;
    return PLAN_MODULES.some((module) => (value.modules?.[module.key] || "").trim());
  };

  const save = () => {
    const cleaned = cleanForm(form);
    if (!hasUsefulContent(cleaned)) return;
    setData((prev) => [
      {
        id: uid(),
        createdAt: now(),
        ...cleaned,
        title: cleaned.title || getLongWritingMeta(cleaned.kind).label,
      },
      ...prev,
    ]);
    setSelectedPeriodStart(cleaned.periodStart || selectedPeriodStart);
    resetAdd();
  };

  const saveEdit = () => {
    if (!editId) return;
    const cleaned = cleanForm(editForm);
    if (!hasUsefulContent(cleaned)) return;
    setData((prev) =>
      prev.map((item) => item.id === editId
        ? { ...item, ...cleaned, title: cleaned.title || getLongWritingMeta(cleaned.kind).label, updatedAt: now() }
        : item
      )
    );
    setSelectedPeriodStart(cleaned.periodStart || selectedPeriodStart);
    setEditId(null);
  };

  const deleteEntry = (id: string) => {
    if (!confirmDelete()) return;
    setData((prev) => prev.filter((item) => item.id !== id));
    if (editId === id) setEditId(null);
  };

  const toggleDone = (id: string) => {
    setData((prev) => prev.map((item) => item.id === id ? { ...item, status: item.status === "done" ? "draft" : "done", updatedAt: now() } : item));
  };

  const copyContent = async (entry: LongWritingEntry, inheritedReview = "") => {
    const moduleText = entry.kind === "yearPlan"
      ? PLAN_MODULES.map((module) => {
          const value = entry.modules?.[module.key]?.trim();
          return value ? `${module.label}\n${value}` : "";
        }).filter(Boolean).join("\n\n")
      : "";
    const reviewText = (entry.reviewContent || inheritedReview || "").trim()
      ? `${entry.kind === "fiveYearPlan" ? "五年总结" : "年终总结"}\n${(entry.reviewContent || inheritedReview || "").trim()}`
      : "";
    const text = [entry.title, moduleText, entry.content, reviewText].filter(Boolean).join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      alert("已复制正文。");
    } catch {
      alert("复制失败。可以长按正文手动复制。");
    }
  };

  const Fields = ({ value, setValue }: { value: LongWritingForm; setValue: Setter<LongWritingForm> }) => {
    const meta = getLongWritingMeta(value.kind);
    const isLetter = value.kind === "letterSelf" || value.kind === "letterOther";
    const isFiveYearPlan = value.kind === "fiveYearPlan";
    const isFiveYearDoc = value.kind === "fiveYearPlan" || value.kind === "fiveYearReview";
    const isYearPlan = value.kind === "yearPlan";
    const isMonthPlan = value.kind === "monthPlan";
    const yearNumber = coercePlanningYear(value.year || value.month, selectedPeriodStart);

    return (
      <>
        <div style={{ background: `${meta.color}14`, borderRadius: 16, padding: "10px 12px", color: COLORS.muted, fontSize: 13, lineHeight: 1.75, marginBottom: 10 }}>
          {isFiveYearPlan
            ? "五年计划是一张大图，五年总结也放在这张图的最下面，周期结束时回来补。"
            : isYearPlan
              ? "每年计划按五个模块写，年终总结放在最下面；不是另开一份文档，避免散掉。"
              : meta.help}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10, alignItems: "center" }}>
          <Tag color={`${meta.color}22`} textColor={meta.color}>{meta.emoji} {meta.label}</Tag>
          {isFiveYearDoc && <Tag>{fiveYearPeriodLabel(value.periodStart || selectedPeriodStart)}</Tag>}
          {!isFiveYearDoc && !isLetter && <Tag>{yearNumber}</Tag>}
          {isLetter && <Tag>信件</Tag>}
        </div>

        <Input
          type="date"
          value={value.date}
          onChange={(v) => setValue((p) => ({ ...p, date: v || today() }))}
          style={{ marginBottom: 10, width: 180 }}
        />

        {isMonthPlan && (
          <Input
            type="month"
            value={value.month || `${String(yearNumber)}-01`}
            onChange={(v) => setValue((p) => ({ ...p, month: v, year: String(coercePlanningYear(v, yearNumber)) }))}
            style={{ marginBottom: 10, width: 180 }}
          />
        )}

        {isLetter && (
          <Input
            value={value.to}
            onChange={(v) => setValue((p) => ({ ...p, to: v }))}
            placeholder={value.kind === "letterSelf" ? "写给谁：现在的我 / 未来的我 / 小时候的我" : "写给谁：妈妈 / 朋友 / 老公 / 某个不会寄出的人"}
            style={{ marginBottom: 10 }}
          />
        )}

        <Input
          value={value.title}
          onChange={(v) => setValue((p) => ({ ...p, title: v }))}
          placeholder={isFiveYearPlan ? `标题：比如 ${fiveYearPeriodLabel(value.periodStart || selectedPeriodStart)} 五年计划` : isMonthPlan ? "标题：比如 一月计划 / 春节前计划" : isLetter ? "标题：比如 写给五年后的我" : `标题：比如 ${yearNumber} 年计划`}
          style={{ marginBottom: 10 }}
        />

        {isYearPlan && (
          <div style={{ display: "grid", gap: 10, marginBottom: 10 }}>
            {PLAN_MODULES.map((module) => (
              <div key={module.key} style={{ background: "rgba(255,248,234,.72)", borderRadius: 16, padding: "10px 12px", border: "1px solid rgba(161,183,132,.22)" }}>
                <div style={{ color: COLORS.text, fontSize: 15, fontWeight: 900, marginBottom: 7 }}>{module.label}</div>
                <Input
                  value={value.modules?.[module.key] || ""}
                  onChange={(v) => setValue((p) => ({ ...p, modules: { ...normalizePlanModules(p.modules), [module.key]: v } }))}
                  placeholder={module.placeholder}
                  multiline
                  rows={3}
                />
              </div>
            ))}
          </div>
        )}

        <Input
          value={value.content}
          onChange={(v) => setValue((p) => ({ ...p, content: v }))}
          placeholder={isYearPlan ? "补充说明：这一年的主题、底线、取舍、提醒自己的话……（可选）" : isFiveYearPlan ? LONG_WRITING_META.fiveYearPlan.placeholder : meta.placeholder}
          multiline
          rows={isYearPlan ? 5 : 10}
          style={{ marginBottom: 10, lineHeight: 1.75 }}
        />

        {isFiveYearPlan && (
          <div style={{ background: "rgba(255,248,234,.72)", borderRadius: 16, padding: "10px 12px", border: "1px solid rgba(221,182,95,.28)", marginBottom: 10 }}>
            <div style={{ color: COLORS.yellow, fontSize: 15, fontWeight: 900, marginBottom: 7 }}>五年总结（放在五年计划最下面）</div>
            <Input
              value={value.reviewContent || ""}
              onChange={(v) => setValue((p) => ({ ...p, reviewContent: v }))}
              placeholder={LONG_WRITING_META.fiveYearReview.placeholder}
              multiline
              rows={6}
            />
          </div>
        )}

        {isYearPlan && (
          <div style={{ background: "rgba(244,255,246,.78)", borderRadius: 16, padding: "10px 12px", border: "1px solid rgba(118,169,111,.25)", marginBottom: 10 }}>
            <div style={{ color: COLORS.green, fontSize: 15, fontWeight: 900, marginBottom: 7 }}>年终总结（放在每年计划最下面）</div>
            <Input
              value={value.reviewContent || ""}
              onChange={(v) => setValue((p) => ({ ...p, reviewContent: v }))}
              placeholder={LONG_WRITING_META.yearReview.placeholder}
              multiline
              rows={6}
            />
          </div>
        )}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {(["draft", "done"] as LongWritingStatus[]).map((status) => (
            <span
              key={status}
              onClick={() => setValue((p) => ({ ...p, status }))}
              style={{
                padding: "7px 12px",
                borderRadius: 999,
                background: value.status === status ? meta.color : COLORS.light,
                color: value.status === status ? "#fff" : COLORS.muted,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 900,
              }}
            >
              {status === "draft" ? "草稿" : "完成"}
            </span>
          ))}
        </div>
      </>
    );
  };

  const renderWritingCard = (entry: LongWritingEntry, options: {
    inheritedReview?: string;
    collapsible?: boolean;
    collapsed?: boolean;
    onToggle?: () => void;
  } = {}) => {
    const meta = getLongWritingMeta(entry.kind);
    const editing = editId === entry.id;
    const isLetter = entry.kind === "letterSelf" || entry.kind === "letterOther";
    const monthLabel = entry.kind === "monthPlan" && entry.month ? entry.month : "";
    const hasModules = entry.kind === "yearPlan" && PLAN_MODULES.some((module) => entry.modules?.[module.key]?.trim());
    const reviewContent = (entry.reviewContent || options.inheritedReview || "").trim();
    const showPlanReview = (entry.kind === "fiveYearPlan" || entry.kind === "yearPlan");
    const collapsed = !!options.collapsed && !editing;

    return (
      <Card style={{ borderLeft: `4px solid ${meta.color}` }}>
        {editing ? (
          <>
            {Fields({ value: editForm, setValue: setEditForm })}
            <FormActions onSave={saveEdit} onCancel={() => setEditId(null)} saveText="保存修改" color={meta.color} />
          </>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap", marginBottom: collapsed ? 0 : 8 }}>
              <div style={{ minWidth: 0, flex: "1 1 220px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 5 }}>
                  <Tag color={`${meta.color}22`} textColor={meta.color}>{meta.emoji} {meta.label}</Tag>
                  <Tag color={entry.status === "done" ? "#E8F5E8" : COLORS.light} textColor={entry.status === "done" ? COLORS.green : COLORS.muted}>{entry.status === "done" ? "完成" : "草稿"}</Tag>
                  {entry.kind === "fiveYearPlan" ? <Tag>{fiveYearPeriodLabel(entry.periodStart || selectedPeriodStart)}</Tag> : null}
                  {entry.kind === "yearPlan" ? <Tag>{entry.year}</Tag> : null}
                  {monthLabel && <Tag>{monthLabel}</Tag>}
                </div>
                <strong style={{ color: COLORS.text, fontSize: 18, lineHeight: 1.45, wordBreak: "break-word" }}>{entry.title || meta.label}</strong>
                {isLetter && entry.to && (
                  <div style={{ color: COLORS.muted, fontSize: 13, fontWeight: 700, marginTop: 4 }}>写给：{entry.to}</div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <div style={{ color: COLORS.muted, fontSize: 12, fontWeight: 700 }}>{fmtFullDate(entry.date)}</div>
                {options.collapsible && (
                  <Btn small outline color={meta.color} onClick={options.onToggle}>{collapsed ? "展开" : "收起"}</Btn>
                )}
              </div>
            </div>

            {!collapsed && (
              <>
                {hasModules && (
                  <div style={{ display: "grid", gap: 9, marginBottom: 12 }}>
                    {PLAN_MODULES.map((module) => {
                      const value = entry.modules?.[module.key]?.trim();
                      if (!value) return null;
                      return (
                        <div key={module.key} style={{ background: COLORS.light, borderRadius: 14, padding: "10px 12px" }}>
                          <div style={{ color: COLORS.accent, fontSize: 13, fontWeight: 900, marginBottom: 4 }}>{module.label}</div>
                          <div style={{ color: COLORS.text, fontSize: 15, lineHeight: 1.8, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{value}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {entry.content && (
                  <div style={{ background: COLORS.light, borderRadius: 16, padding: "12px 14px", color: COLORS.text, fontSize: 15, lineHeight: 1.85, whiteSpace: "pre-wrap", wordBreak: "break-word", marginBottom: 12 }}>
                    {entry.content}
                  </div>
                )}

                {showPlanReview && (
                  <div style={{ background: entry.kind === "fiveYearPlan" ? "rgba(255,248,220,.68)" : "rgba(244,255,246,.75)", borderRadius: 16, padding: "12px 14px", border: `1px solid ${entry.kind === "fiveYearPlan" ? "rgba(221,182,95,.28)" : "rgba(118,169,111,.24)"}`, color: COLORS.text, fontSize: 15, lineHeight: 1.85, whiteSpace: "pre-wrap", wordBreak: "break-word", marginBottom: 12 }}>
                    <div style={{ color: entry.kind === "fiveYearPlan" ? COLORS.yellow : COLORS.green, fontSize: 13, fontWeight: 900, marginBottom: reviewContent ? 5 : 0 }}>
                      {entry.kind === "fiveYearPlan" ? "五年总结" : "年终总结"}
                    </div>
                    {reviewContent || <span style={{ color: COLORS.muted }}>还没写。点“编辑”，在计划最下面补上。</span>}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Btn small outline color={entry.status === "done" ? COLORS.muted : COLORS.green} onClick={() => toggleDone(entry.id)}>
                      {entry.status === "done" ? "改回草稿" : "标记完成"}
                    </Btn>
                    {(entry.content || hasModules || reviewContent) && <Btn small outline color={COLORS.blue} onClick={() => copyContent(entry, options.inheritedReview)}>复制正文</Btn>}
                  </div>
                  <ActionButtons
                    onEdit={() => {
                      setAdding(false);
                      setEditId(entry.id);
                      setEditForm(blankLongWritingForm(entry.kind, {
                        date: entry.date || today(),
                        year: entry.year || String(currentPlanningYear()),
                        month: entry.month,
                        periodStart: entry.periodStart || selectedPeriodStart,
                        periodEnd: entry.periodEnd || selectedPeriodStart + 4,
                        to: entry.to || "",
                        title: entry.title || "",
                        content: entry.content || "",
                        reviewContent: entry.reviewContent || options.inheritedReview || "",
                        modules: normalizePlanModules(entry.modules),
                        status: entry.status === "done" ? "done" : "draft",
                      }));
                    }}
                    onDelete={() => deleteEntry(entry.id)}
                  />
                </div>
              </>
            )}
          </>
        )}
      </Card>
    );
  };

  const SmallEmpty = ({ text }: { text: string }) => (
    <div style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.7, padding: "8px 2px 14px" }}>{text}</div>
  );

  const renderYearSection = (year: number) => {
    const yearKey = String(year);
    const collapsed = collapsedYears[yearKey] === true;
    const yearPlans = periodItems
      .filter((item) => coercePlanningYear(item.year || item.month) === year && item.kind === "yearPlan")
      .sort((a, b) => b.createdAt - a.createdAt);
    const legacyYearReviews = periodItems
      .filter((item) => coercePlanningYear(item.year || item.month) === year && item.kind === "yearReview")
      .sort((a, b) => b.createdAt - a.createdAt);
    const monthPlans = periodItems
      .filter((item) => coercePlanningYear(item.year || item.month) === year && item.kind === "monthPlan")
      .sort((a, b) => (a.month || "").localeCompare(b.month || "") || b.createdAt - a.createdAt);
    const inheritedReview = legacyYearReviews.map((item) => item.content || item.reviewContent || "").filter(Boolean).join("\n\n");
    const hasContent = yearPlans.length > 0 || legacyYearReviews.length > 0 || monthPlans.length > 0;

    return (
      <Card style={{ borderLeft: `4px solid ${COLORS.blue}`, background: "linear-gradient(175deg, #FFFFFF 0%, #F7FBFF 100%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: collapsed ? 0 : 10 }}>
          <h3 style={{ margin: 0, color: COLORS.text, fontSize: 19, fontWeight: 900 }}>{year} 年计划</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn small outline color={COLORS.blue} onClick={() => setCollapsedYears((prev) => ({ ...prev, [yearKey]: !collapsed }))}>{collapsed ? "展开" : "收起"}</Btn>
            <Btn small outline color={COLORS.blue} onClick={() => openForm("yearPlan", { year: String(year), periodStart: selectedPeriodStart, reviewContent: inheritedReview })}>+ 年计划</Btn>
            <Btn small outline color={COLORS.accent} onClick={() => openForm("monthPlan", { year: String(year), month: `${year}-01`, periodStart: selectedPeriodStart })}>+ 月计划</Btn>
          </div>
        </div>

        {!collapsed && (
          <>
            {!hasContent && <SmallEmpty text="这一年还没有计划。先写一个年计划；月计划会放在它下面，年终总结也在年计划最下面补。" />}

            {yearPlans.length === 0 && hasContent && (
              <SmallEmpty text="这一年还没有年计划主体。已有的年终总结/月计划先挂在这里；建议补一个年计划，之后总结就会收进年计划最下面。" />
            )}

            {yearPlans.map((entry, index) => (
              <div key={entry.id}>
                {renderWritingCard(entry, { inheritedReview: index === 0 ? inheritedReview : "" })}
              </div>
            ))}

            {monthPlans.length > 0 && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed rgba(121,169,164,.32)" }}>
                <div style={{ color: COLORS.accent, fontSize: 16, fontWeight: 900, marginBottom: 10 }}>每月计划</div>
                {monthPlans.map((entry) => {
                  const monthCollapsed = collapsedMonths[entry.id] === true;
                  return (
                    <div key={entry.id} style={{ marginLeft: 0 }}>
                      {renderWritingCard(entry, {
                        collapsible: true,
                        collapsed: monthCollapsed,
                        onToggle: () => setCollapsedMonths((prev) => ({ ...prev, [entry.id]: !monthCollapsed })),
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </Card>
    );
  };

  const inheritedFiveYearReview = legacyFiveYearReviews.map((item) => item.content || item.reviewContent || "").filter(Boolean).join("\n\n");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, color: COLORS.text, fontSize: 22, fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "inline-flex", width: 4, height: 22, borderRadius: 4, background: COLORS.accent, flexShrink: 0 }} />
            岁月花卷 📜
          </h2>
          <div style={{ marginTop: 5, color: COLORS.muted, fontSize: 13, lineHeight: 1.6, paddingLeft: 12 }}>
            五年总结收在五年计划下面；年终总结收在每年计划下面；月计划挂在对应年份下面，可折叠不占地方。
          </div>
        </div>
      </div>

      <Card style={{ border: `2px solid ${COLORS.accent}`, background: "linear-gradient(160deg, #FFFFFF 0%, #FFF3F7 100%)" }}>
        <div style={{ color: COLORS.text, fontSize: 17, fontWeight: 900, marginBottom: 8 }}>五年周期</div>
        <div className="hide-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }}>
          {periodStarts.map((start) => {
            const active = selectedPeriodStart === start;
            return (
              <button
                key={start}
                type="button"
                onClick={() => setSelectedPeriodStart(start)}
                className="diary-btn"
                style={{
                  border: active ? `2px solid ${COLORS.accent}` : "1.5px solid rgba(232,185,165,.55)",
                  background: active ? "rgba(199,108,132,.14)" : "rgba(255,248,244,.72)",
                  color: active ? COLORS.text : COLORS.muted,
                  borderRadius: 999,
                  padding: "9px 14px",
                  cursor: "pointer",
                  fontWeight: active ? 900 : 700,
                  whiteSpace: "nowrap",
                }}
              >
                {fiveYearPeriodLabel(start)}
              </button>
            );
          })}
        </div>
      </Card>

      {adding && (
        <Card style={{ border: `2px solid ${getLongWritingMeta(form.kind).color}` }}>
          {Fields({ value: form, setValue: setForm })}
          <FormActions onSave={save} onCancel={resetAdd} saveText="保存到花卷 📜" color={getLongWritingMeta(form.kind).color} />
        </Card>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", margin: "18px 0 10px" }}>
        <h3 style={{ margin: 0, color: COLORS.purple, fontSize: 18, fontWeight: 900 }}>{fiveYearPeriodLabel(selectedPeriodStart)} · 五年计划</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Btn small outline color={COLORS.purple} onClick={() => setFiveYearCollapsed((prev) => !prev)}>{fiveYearCollapsed ? "展开" : "收起"}</Btn>
          <Btn small color={COLORS.purple} onClick={() => openForm("fiveYearPlan", { periodStart: selectedPeriodStart, periodEnd: selectedPeriodEnd, year: fiveYearPeriodLabel(selectedPeriodStart), reviewContent: inheritedFiveYearReview })}>+ 五年计划</Btn>
        </div>
      </div>

      {!fiveYearCollapsed && (
        <>
          {fiveYearPlans.length === 0 && !inheritedFiveYearReview && <SmallEmpty text="这个 5 年还没有大图。写一个五年计划；五年总结以后直接在这份计划最下面补。" />}
          {fiveYearPlans.length === 0 && inheritedFiveYearReview && <SmallEmpty text="已有旧版五年总结，但还没有五年计划主体。建议补一个五年计划，旧总结会自动带到计划底部。" />}
          {fiveYearPlans.map((entry, index) => (
            <div key={entry.id}>
              {renderWritingCard(entry, { inheritedReview: index === 0 ? inheritedFiveYearReview : "" })}
            </div>
          ))}
        </>
      )}

      <div style={{ margin: "22px 0 10px", color: COLORS.blue, fontSize: 18, fontWeight: 900 }}>每年计划</div>
      {selectedYears.map((year) => <div key={year}>{renderYearSection(year)}</div>)}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", margin: "24px 0 10px" }}>
        <h3 style={{ margin: 0, color: COLORS.accent, fontSize: 18, fontWeight: 900 }}>信件匣</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Btn small outline color={COLORS.accent} onClick={() => openForm("letterSelf")}>+ 写给自己</Btn>
          <Btn small outline color={COLORS.primary} onClick={() => openForm("letterOther")}>+ 写给别人</Btn>
        </div>
      </div>
      {letters.length === 0 && <SmallEmpty text="还没有信。可以写给未来的自己，也可以写一封不必发出去的信。" />}
      {letters.map((entry) => <div key={entry.id}>{renderWritingCard(entry)}</div>)}
    </div>
  );
}

function FiveYearDiaryTab({
  data,
  setData,
  diary,
  setDiary,
  successEntries,
  photos,
  setPhotos,
}: {
  data: FiveYearDiaryData;
  setData: Setter<FiveYearDiaryData>;
  diary: DiaryEntry[];
  setDiary: Setter<DiaryEntry[]>;
  successEntries: SuccessEntry[];
  photos: FiveYearPhotosData;
  setPhotos: Setter<FiveYearPhotosData>;
}) {
  const [selectedDate, setSelectedDate] = useState(today());
  const baseYear = new Date().getFullYear();
  const currentDate = sameMonthDayInYear(selectedDate, baseYear);
  const blankFiveYearForm = (date = currentDate) => ({ date, content: "" });
  const [adding, setAdding] = useState(false);
  const [addingHostDate, setAddingHostDate] = useState<string | null>(null);
  const [form, setForm] = useState(blankFiveYearForm(currentDate));
  const [editTarget, setEditTarget] = useState<{ source: "own" | "legacy"; id: string } | null>(null);
  const [editForm, setEditForm] = useState(blankFiveYearForm(currentDate));

  const displayDates = Array.from({ length: 6 }, (_, index) =>
    sameMonthDayInYear(currentDate, baseYear - index)
  );

  const getFiveYearEntries = (value?: FiveYearDiaryEntry | FiveYearDiaryEntry[]) =>
    (Array.isArray(value) ? value : value ? [value] : []).filter(Boolean);

  const getEntriesForDate = (date: string) =>
    getFiveYearEntries(data[date])
      .filter((entry) => Boolean(entry.content?.trim()))
      .sort((a, b) => b.createdAt - a.createdAt);

  const moodEntriesByDate = diary.reduce<Record<string, DiaryEntry[]>>((acc, entry) => {
    if (!entry.date || isFiveYearDiaryEntry(entry)) return acc;
    acc[entry.date] = acc[entry.date] || [];
    acc[entry.date].push(entry);
    return acc;
  }, {});

  const successEntriesByDate = successEntries.reduce<Record<string, SuccessEntry[]>>((acc, entry) => {
    if (!entry.date || !entry.content?.trim()) return acc;
    acc[entry.date] = acc[entry.date] || [];
    acc[entry.date].push(entry);
    return acc;
  }, {});

  const legacyFiveYearEntriesByDate = diary.reduce<Record<string, DiaryEntry[]>>((acc, entry) => {
    if (!entry.date || !isFiveYearDiaryEntry(entry)) return acc;
    acc[entry.date] = acc[entry.date] || [];
    acc[entry.date].push(entry);
    return acc;
  }, {});

  const openNewEntryForm = (date = currentDate) => {
    const targetDate = date || currentDate;
    if (adding && addingHostDate === targetDate) {
      setAdding(false);
      setAddingHostDate(null);
      setForm(blankFiveYearForm(currentDate));
      return;
    }
    setEditTarget(null);
    setForm(blankFiveYearForm(targetDate));
    setAddingHostDate(targetDate);
    setAdding(true);
    setSelectedDate(sameMonthDayInYear(targetDate, baseYear));
  };

  const saveNewEntry = () => {
    const entryDate = form.date || currentDate;
    const content = form.content.trim();
    if (!content) return;
    const newEntry: FiveYearDiaryEntry = {
      id: uid(),
      createdAt: now(),
      date: entryDate,
      content,
    };
    setData((prev) => ({
      ...prev,
      [entryDate]: [newEntry, ...getFiveYearEntries(prev[entryDate])],
    }));
    setForm(blankFiveYearForm(currentDate));
    setAdding(false);
    setAddingHostDate(null);
    setSelectedDate(sameMonthDayInYear(entryDate, baseYear));
  };

  const deleteOwnEntry = (entry: FiveYearDiaryEntry) => {
    if (!confirmDelete()) return;
    setData((prev) => {
      const next = { ...prev };
      const list = getFiveYearEntries(next[entry.date]).filter((item) => item.id !== entry.id);
      if (list.length > 0) next[entry.date] = list;
      else delete next[entry.date];
      return next;
    });
    if (editTarget?.source === "own" && editTarget.id === entry.id) setEditTarget(null);
  };

  const deleteLegacyEntry = (entry: DiaryEntry) => {
    if (!confirmDelete()) return;
    setDiary((prev) => prev.filter((item) => item.id !== entry.id));
    if (editTarget?.source === "legacy" && editTarget.id === entry.id) setEditTarget(null);
  };

  const startEditOwnEntry = (entry: FiveYearDiaryEntry) => {
    setAdding(false);
    setAddingHostDate(null);
    setEditTarget({ source: "own", id: entry.id });
    setEditForm({ date: entry.date, content: entry.content });
  };

  const startEditLegacyEntry = (entry: DiaryEntry) => {
    setAdding(false);
    setAddingHostDate(null);
    setEditTarget({ source: "legacy", id: entry.id });
    setEditForm({ date: entry.date, content: entry.content || entry.title || "" });
  };

  const saveEdit = () => {
    if (!editTarget) return;
    const entryDate = editForm.date || currentDate;
    const content = editForm.content.trim();
    if (!content) return;

    if (editTarget.source === "own") {
      setData((prev) => {
        const next = { ...prev };
        let updatedEntry: FiveYearDiaryEntry | null = null;

        Object.keys(next).forEach((date) => {
          const list = getFiveYearEntries(next[date]);
          const found = list.find((entry) => entry.id === editTarget.id);
          const filtered = list.filter((entry) => entry.id !== editTarget.id);
          if (found) updatedEntry = { ...found, date: entryDate, content, updatedAt: now() };
          if (filtered.length > 0) next[date] = filtered;
          else delete next[date];
        });

        if (!updatedEntry) return prev;
        next[entryDate] = [updatedEntry, ...getFiveYearEntries(next[entryDate])];
        return next;
      });
    } else {
      setDiary((prev) =>
        prev.map((entry) =>
          entry.id === editTarget.id
            ? {
                ...entry,
                date: entryDate,
                title: entry.title || "五年日记",
                content,
                source: "fiveYear",
                updatedAt: now(),
              }
            : entry
        )
      );
    }

    setEditTarget(null);
    setEditForm(blankFiveYearForm(currentDate));
    setSelectedDate(sameMonthDayInYear(entryDate, baseYear));
  };

  const handlePhotoUpload = async (date: string, fileList: FileList | null) => {
    const files = Array.from(fileList || []).filter((file) => file.type.startsWith("image/"));
    if (files.length === 0) return;
    try {
      const newPhotos = await Promise.all(
        files.slice(0, 8).map(async (file) => {
          const raw = await readFileAsDataUrl(file);
          const src = await shrinkPhoto(raw);
          return {
            id: uid(),
            createdAt: now(),
            date,
            src,
            name: file.name,
          } as FiveYearPhoto;
        })
      );
      setPhotos((prev) => ({
        ...prev,
        [date]: [...(prev[date] || []), ...newPhotos],
      }));
    } catch {
      alert("照片导入失败。可以少选几张，或者换一张体积小一点的照片试试。");
    }
  };

  const deletePhoto = (date: string, id: string) => {
    if (!confirmDelete()) return;
    setPhotos((prev) => {
      const nextList = (prev[date] || []).filter((p) => p.id !== id);
      const next = { ...prev };
      if (nextList.length > 0) next[date] = nextList;
      else delete next[date];
      return next;
    });
  };

  const FiveYearFields = ({
    value,
    setValue,
  }: {
    value: { date: string; content: string };
    setValue: Setter<{ date: string; content: string }>;
  }) => (
    <>
      <Input
        type="date"
        value={value.date}
        onChange={(v) => setValue((p) => ({ ...p, date: v || currentDate }))}
        style={{ marginBottom: 10, width: 180 }}
      />
      <Input
        value={value.content}
        onChange={(v) => setValue((p) => ({ ...p, content: v }))}
        placeholder="今天一句话也可以：发生了什么、心情怎样、想记住什么…"
        multiline
        rows={5}
        style={{ marginBottom: 12 }}
      />
    </>
  );

  const PhotoBlock = ({ date }: { date: string }) => {
    const photoList = photos[date] || [];

    return (
      <div style={{ marginBottom: photoList.length > 0 ? 12 : 8 }}>
        {photoList.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 10 }}>
            {photoList.map((photo) => (
              <div key={photo.id} style={{ borderRadius: 18, overflow: "hidden", background: COLORS.light, boxShadow: "0 2px 10px rgba(61,34,24,.08)" }}>
                <img
                  src={photo.src}
                  alt="五年日记照片"
                  style={{ width: "100%", height: "auto", objectFit: "contain" }}
                />
                <div style={{ padding: "8px 10px", display: "flex", justifyContent: "flex-end" }}>
                  <Btn small outline color={COLORS.danger} onClick={() => deletePhoto(date, photo.id)}>删除照片</Btn>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: photoList.length > 0 ? 2 : 0 }}>
          <label
            className="diary-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              borderRadius: 999,
              padding: "7px 16px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              color: COLORS.blue,
              border: `1.5px solid ${COLORS.blue}`,
              background: "transparent",
            }}
          >
            添加照片
            <input
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => {
                handlePhotoUpload(date, e.currentTarget.files);
                e.currentTarget.value = "";
              }}
            />
          </label>
          <Btn small outline color={COLORS.purple} onClick={() => openNewEntryForm(date)}>
            {adding && addingHostDate === date ? "取消记录" : "写记录"}
          </Btn>
        </div>
      </div>
    );
  };

  const FiveYearEntryBlock = ({
    entry,
    source,
  }: {
    entry: FiveYearDiaryEntry | DiaryEntry;
    source: "own" | "legacy";
  }) => {
    const editing = editTarget?.source === source && editTarget.id === entry.id;
    return (
      <div style={{ background: COLORS.light, borderRadius: 16, padding: "12px 14px", marginBottom: 10 }}>
        {editing ? (
          <>
            {FiveYearFields({ value: editForm, setValue: setEditForm })}
            <FormActions onSave={saveEdit} onCancel={() => setEditTarget(null)} saveText="保存修改" color={COLORS.purple} />
          </>
        ) : (
          <>
            <div style={{ color: COLORS.text, fontSize: 16, lineHeight: 1.8, whiteSpace: "pre-wrap", wordBreak: "break-word", marginBottom: 10 }}>
              {entry.content || ("title" in entry ? entry.title : "")}
            </div>
            <ActionButtons
              onEdit={() => source === "own" ? startEditOwnEntry(entry as FiveYearDiaryEntry) : startEditLegacyEntry(entry as DiaryEntry)}
              onDelete={() => source === "own" ? deleteOwnEntry(entry as FiveYearDiaryEntry) : deleteLegacyEntry(entry as DiaryEntry)}
            />
          </>
        )}
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, color: COLORS.text, fontSize: 22, fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "inline-flex", width: 4, height: 22, borderRadius: 4, background: COLORS.purple, flexShrink: 0 }} />
            五年花历 🌳
          </h2>
          <div style={{ marginTop: 5, color: COLORS.muted, fontSize: 13, lineHeight: 1.6, paddingLeft: 12 }}>
            同一天，看看今年和过去五年的自己。
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Btn onClick={() => setSelectedDate(today())} small outline color={COLORS.primary}>回到今天</Btn>
        </div>
      </div>

      <Card style={{ border: `2px solid ${COLORS.secondary}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <MiniIconButton label="前一天" color={COLORS.primary} onClick={() => setSelectedDate(addDays(currentDate, -1))}>‹</MiniIconButton>
          <Input
            type="date"
            value={currentDate}
            onChange={(v) => setSelectedDate(v || today())}
            style={{ width: 180, flex: "1 1 180px" }}
          />
          <MiniIconButton label="后一天" color={COLORS.primary} onClick={() => setSelectedDate(addDays(currentDate, 1))}>›</MiniIconButton>
        </div>
      </Card>

      {displayDates.map((date) => {
        const ownEntries = getEntriesForDate(date);
        const legacyEntries = (legacyFiveYearEntriesByDate[date] || []).sort((a, b) => b.createdAt - a.createdAt);
        const moodEntries = (moodEntriesByDate[date] || []).sort((a, b) => b.createdAt - a.createdAt);
        const successEntriesForDate = (successEntriesByDate[date] || []).sort((a, b) => b.createdAt - a.createdAt);
        const photoList = photos[date] || [];
        const hasAnything = ownEntries.length > 0 || legacyEntries.length > 0 || moodEntries.length > 0 || successEntriesForDate.length > 0 || photoList.length > 0;

        return (
          <Card key={date} style={{ borderLeft: `4px solid ${date === currentDate ? COLORS.purple : COLORS.secondary}` }}>
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-start", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
              <Tag color={date === currentDate ? "#F3EEFF" : COLORS.soft}>{date}</Tag>
            </div>

            <PhotoBlock date={date} />

            {adding && addingHostDate === date && (
              <div style={{ background: "rgba(243,238,255,.65)", borderRadius: 18, padding: "14px", marginBottom: 12, border: `1.5px solid rgba(164,143,192,.25)` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                  <Tag color="#F3EEFF">新增记录</Tag>
                  <span style={{ color: COLORS.muted, fontSize: 13 }}>只保存在五年花历，不会出现在心情花笺列表里。</span>
                </div>
                {FiveYearFields({ value: form, setValue: setForm })}
                <FormActions
                  onSave={saveNewEntry}
                  onCancel={() => {
                    setAdding(false);
                    setAddingHostDate(null);
                    setForm(blankFiveYearForm(currentDate));
                  }}
                  saveText="保存记录 📚"
                  color={COLORS.purple}
                />
              </div>
            )}

            {ownEntries.map((entry) => (
              <div key={entry.id}>{FiveYearEntryBlock({ entry, source: "own" })}</div>
            ))}

            {legacyEntries.map((entry) => (
              <div key={entry.id}>{FiveYearEntryBlock({ entry, source: "legacy" })}</div>
            ))}

            {successEntriesForDate.map((entry) => {
              const meta = getSuccessCategoryMeta(entry.category);
              return (
                <div key={entry.id} style={{ background: "rgba(232,248,235,.7)", borderRadius: 16, padding: "12px 14px", marginBottom: 10, borderLeft: `4px solid ${meta.color}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 22 }}>{entry.energy || meta.emoji}</span>
                    <strong style={{ color: COLORS.text, fontSize: 16, wordBreak: "break-word" }}>小成功苗圃</strong>
                    <Tag color={`${meta.color}22`} textColor={meta.color}>{meta.emoji} {entry.category || meta.label}</Tag>
                  </div>
                  <div style={{ color: COLORS.text, fontSize: 15, lineHeight: 1.8, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {entry.content}
                  </div>
                  {entry.evidence && (
                    <div style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-wrap", wordBreak: "break-word", marginTop: 6 }}>
                      <strong style={{ color: COLORS.green }}>证据：</strong>{entry.evidence}
                    </div>
                  )}
                </div>
              );
            })}

            {moodEntries.map((entry) => (
              <div key={entry.id} style={{ background: "rgba(253,232,224,.55)", borderRadius: 16, padding: "12px 14px", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 22 }}>{entry.mood}</span>
                  <strong style={{ color: COLORS.text, fontSize: 16, wordBreak: "break-word" }}>{entry.title || "心情花笺"}</strong>
                </div>
                {entry.content && (
                  <div style={{ color: COLORS.muted, fontSize: 15, lineHeight: 1.8, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {entry.content}
                  </div>
                )}
              </div>
            ))}

            {!hasAnything && (
              <div style={{ color: COLORS.muted, fontSize: 15, lineHeight: 1.7, padding: "4px 0" }}>
                这一天还没有记录。以后再回头看，会很有意思。
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ─── Reading Tracker ─────────────────────────────────────────────────────────
const READING_STATUS_META: Record<ReadingBookStatus, { title: string; emoji: string; empty: string; color: string }> = {
  reading: {
    title: "正在读的书",
    emoji: "📖",
    empty: "还没有正在读的书。把正在追的书放这里，每天轻轻打个卡。",
    color: COLORS.green,
  },
  want: {
    title: "想要读的书",
    emoji: "🌱",
    empty: "还没有想读的书。看到心动书名就先扔进来，别靠脑子硬记。",
    color: COLORS.blue,
  },
  done: {
    title: "已读完的书",
    emoji: "🏁",
    empty: "还没有读完的书。以后这里会变成你的年度阅读战绩墙。",
    color: COLORS.purple,
  },
};

const READING_STATUS_ORDER: ReadingBookStatus[] = ["reading", "want", "done"];
const MONTH_LABELS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

const normalizeReadingStatus = (status?: string): ReadingBookStatus =>
  status === "want" || status === "done" || status === "reading" ? status : "reading";

const sortReadingBooks = (books: ReadingBookEntry[], status: ReadingBookStatus) =>
  [...books].sort((a, b) => {
    if (status === "done") {
      return (b.finishDate || "").localeCompare(a.finishDate || "") || b.createdAt - a.createdAt;
    }
    return (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt);
  });

const getReadingYear = (book: ReadingBookEntry) =>
  String(toLocalDate(book.finishDate || today()).getFullYear());

const getReadingMonth = (book: ReadingBookEntry) =>
  String(toLocalDate(book.finishDate || today()).getMonth());

function ReadingTab({ data, setData }: { data: ReadingBookEntry[]; setData: Setter<ReadingBookEntry[]> }) {
  const blank = {
    title: "",
    author: "",
    note: "",
    status: "reading" as ReadingBookStatus,
    startDate: today(),
    finishDate: "",
    progress: "",
  };

  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(blank);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(blank);
  const [collapsed, setCollapsed] = useState<Record<ReadingBookStatus, boolean>>({
    reading: false,
    want: false,
    done: false,
  });
  const [trackingBookId, setTrackingBookId] = useState<string | null>(null);
  const [trackForm, setTrackForm] = useState({ date: today(), progress: "", note: "" });

  const cleanedData = data.map((book) => ({
    ...book,
    status: normalizeReadingStatus(book.status),
    history: book.history || [],
  }));

  const groupedByStatus = READING_STATUS_ORDER.reduce<Record<ReadingBookStatus, ReadingBookEntry[]>>((acc, status) => {
    acc[status] = sortReadingBooks(cleanedData.filter((book) => normalizeReadingStatus(book.status) === status), status);
    return acc;
  }, { reading: [], want: [], done: [] });

  const yearlyDoneCounts = groupedByStatus.done.reduce<Record<string, number>>((acc, book) => {
    const year = getReadingYear(book);
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {});

  const doneByYearMonth = groupedByStatus.done.reduce<Record<string, Record<string, ReadingBookEntry[]>>>((acc, book) => {
    const year = getReadingYear(book);
    const month = getReadingMonth(book);
    if (!acc[year]) acc[year] = {};
    if (!acc[year][month]) acc[year][month] = [];
    acc[year][month].push(book);
    return acc;
  }, {});

  const resetAddForm = () => {
    setForm(blank);
    setAdding(false);
  };

  const save = () => {
    const title = form.title.trim();
    if (!title) return;
    const status = normalizeReadingStatus(form.status);
    setData((prev) => [
      {
        id: uid(),
        createdAt: now(),
        ...form,
        title,
        author: form.author.trim(),
        note: form.note.trim(),
        progress: form.progress.trim(),
        status,
        startDate: form.startDate || today(),
        finishDate: status === "done" ? form.finishDate || today() : form.finishDate,
        history: [],
      },
      ...prev,
    ]);
    resetAddForm();
  };

  const saveEdit = () => {
    const title = editForm.title.trim();
    if (!editId || !title) return;
    const status = normalizeReadingStatus(editForm.status);
    setData((prev) =>
      prev.map((book) =>
        book.id === editId
          ? {
              ...book,
              ...editForm,
              title,
              author: editForm.author.trim(),
              note: editForm.note.trim(),
              progress: editForm.progress.trim(),
              status,
              startDate: editForm.startDate || book.startDate || today(),
              finishDate: status === "done" ? editForm.finishDate || today() : editForm.finishDate,
              history: book.history || [],
              updatedAt: now(),
            }
          : book
      )
    );
    setEditId(null);
  };

  const deleteBook = (id: string) => {
    if (!confirmDelete()) return;
    setData((prev) => prev.filter((book) => book.id !== id));
  };

  const markAsDone = (book: ReadingBookEntry) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === book.id
          ? { ...item, status: "done", finishDate: today(), updatedAt: now() }
          : item
      )
    );
  };

  const moveToReading = (book: ReadingBookEntry) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === book.id
          ? { ...item, status: "reading", startDate: item.startDate || today(), updatedAt: now() }
          : item
      )
    );
  };

  const saveTrack = (book: ReadingBookEntry) => {
    const progress = trackForm.progress.trim();
    const note = trackForm.note.trim();
    if (!progress && !note) return;
    const entry: ReadingProgressEntry = {
      id: uid(),
      createdAt: now(),
      date: trackForm.date || today(),
      progress,
      note,
    };
    setData((prev) =>
      prev.map((item) =>
        item.id === book.id
          ? {
              ...item,
              progress: progress || item.progress,
              history: [entry, ...(item.history || [])],
              updatedAt: now(),
            }
          : item
      )
    );
    setTrackForm({ date: today(), progress: "", note: "" });
    setTrackingBookId(null);
  };

  const deleteTrack = (bookId: string, trackId: string) => {
    if (!confirmDelete()) return;
    setData((prev) =>
      prev.map((book) =>
        book.id === bookId
          ? { ...book, history: (book.history || []).filter((item) => item.id !== trackId), updatedAt: now() }
          : book
      )
    );
  };

  const Fields = ({ value, setValue }: { value: typeof blank; setValue: Setter<typeof blank> }) => {
    const status = normalizeReadingStatus(value.status);
    return (
      <>
        <div style={{ display: "flex", gap: 7, marginBottom: 12, flexWrap: "wrap" }}>
          {READING_STATUS_ORDER.map((s) => (
            <span
              key={s}
              onClick={() => setValue((p) => ({ ...p, status: s }))}
              style={{
                padding: "7px 13px",
                borderRadius: 999,
                background: status === s ? READING_STATUS_META[s].color : COLORS.light,
                color: status === s ? "#fff" : COLORS.muted,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 900,
                transition: "background .15s",
              }}
            >
              {READING_STATUS_META[s].emoji} {READING_STATUS_META[s].title}
            </span>
          ))}
        </div>

        <Input
          value={value.title}
          onChange={(v) => setValue((p) => ({ ...p, title: v }))}
          placeholder="书名"
          style={{ marginBottom: 10 }}
        />
        <Input
          value={value.author}
          onChange={(v) => setValue((p) => ({ ...p, author: v }))}
          placeholder="作者（可选）"
          style={{ marginBottom: 10 }}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          {status !== "want" && (
            <Input
              type="date"
              value={status === "done" ? value.finishDate : value.startDate}
              onChange={(v) =>
                setValue((p) =>
                  status === "done" ? { ...p, finishDate: v } : { ...p, startDate: v }
                )
              }
              style={{ width: 180 }}
            />
          )}
          {status === "reading" && (
            <Input
              value={value.progress}
              onChange={(v) => setValue((p) => ({ ...p, progress: v }))}
              placeholder="当前进度，如 第35页 / 20%"
              style={{ flex: "1 1 220px" }}
            />
          )}
        </div>

        <Input
          value={value.note}
          onChange={(v) => setValue((p) => ({ ...p, note: v }))}
          placeholder="备注/为什么想读/读后感一句话（可选）"
          multiline
          rows={3}
          style={{ marginBottom: 12 }}
        />
      </>
    );
  };

  const SectionHeader = ({ status, count }: { status: ReadingBookStatus; count: number }) => {
    const meta = READING_STATUS_META[status];
    return (
      <button
        type="button"
        onClick={() => setCollapsed((prev) => ({ ...prev, [status]: !prev[status] }))}
        style={{
          width: "100%",
          border: "none",
          background: "transparent",
          padding: 0,
          margin: "18px 0 10px",
          cursor: "pointer",
          fontFamily: "inherit",
          textAlign: "left",
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          background: "rgba(255,255,255,.72)",
          border: `1.5px solid ${meta.color}33`,
          borderRadius: 18,
          padding: "12px 14px",
          boxShadow: "0 2px 12px rgba(61,34,24,.05)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
            <span style={{ fontSize: 22 }}>{meta.emoji}</span>
            <strong style={{ color: COLORS.text, fontSize: 17, fontWeight: 900 }}>{meta.title}</strong>
            <Tag color={COLORS.light} textColor={meta.color}>{count}本</Tag>
          </div>
          <span style={{ color: meta.color, fontSize: 18, fontWeight: 900 }}>
            {collapsed[status] ? "⌄" : "⌃"}
          </span>
        </div>
      </button>
    );
  };

  const BookCard = ({ book }: { book: ReadingBookEntry }) => {
    const status = normalizeReadingStatus(book.status);
    const meta = READING_STATUS_META[status];
    const history = [...(book.history || [])].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);

    return (
      <Card style={{ borderLeft: `4px solid ${meta.color}` }}>
        {editId === book.id ? (
          <>
            {Fields({ value: editForm, setValue: setEditForm })}
            <FormActions onSave={saveEdit} onCancel={() => setEditId(null)} saveText="保存修改" color={meta.color} />
          </>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ minWidth: 0, flex: "1 1 220px" }}>
                <div style={{ color: COLORS.text, fontSize: 18, fontWeight: 900, lineHeight: 1.45, wordBreak: "break-word" }}>
                  {book.title}
                </div>
                {book.author && <div style={{ color: COLORS.muted, fontSize: 14, marginTop: 3 }}>作者：{book.author}</div>}
              </div>
              <Tag color={status === "reading" ? "#E8F5E8" : status === "want" ? "#E0F0FF" : "#F3EEFF"} textColor={meta.color}>
                {meta.title}
              </Tag>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              {status === "reading" && book.startDate && <Tag color="#E8F5E8" textColor={COLORS.green}>开始：{fmtDateWithYear(book.startDate)}</Tag>}
              {status === "reading" && book.progress && <Tag color={COLORS.soft}>进度：{book.progress}</Tag>}
              {status === "done" && book.finishDate && <Tag color="#F3EEFF" textColor={COLORS.purple}>读完：{fmtDateWithYear(book.finishDate)}</Tag>}
            </div>

            {book.note && (
              <p style={{ margin: "12px 0 0", color: COLORS.muted, fontSize: 15, lineHeight: 1.8, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {book.note}
              </p>
            )}

            {status === "reading" && (
              <div style={{ marginTop: 14, background: "rgba(232,245,232,.5)", borderRadius: 16, padding: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: trackingBookId === book.id ? 10 : 0 }}>
                  <strong style={{ color: COLORS.green, fontSize: 15 }}>每日阅读追踪</strong>
                  <Btn
                    small
                    outline
                    color={COLORS.green}
                    onClick={() => {
                      setTrackingBookId(trackingBookId === book.id ? null : book.id);
                      setTrackForm({ date: today(), progress: book.progress || "", note: "" });
                    }}
                  >
                    {trackingBookId === book.id ? "收起" : "+ 记今日"}
                  </Btn>
                </div>

                {trackingBookId === book.id && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                      <Input
                        type="date"
                        value={trackForm.date}
                        onChange={(v) => setTrackForm((p) => ({ ...p, date: v }))}
                        style={{ width: 170 }}
                      />
                      <Input
                        value={trackForm.progress}
                        onChange={(v) => setTrackForm((p) => ({ ...p, progress: v }))}
                        placeholder="今天读到哪了"
                        style={{ flex: "1 1 180px" }}
                      />
                    </div>
                    <Input
                      value={trackForm.note}
                      onChange={(v) => setTrackForm((p) => ({ ...p, note: v }))}
                      placeholder="今天读书感受/摘一句话（可选）"
                      multiline
                      rows={2}
                      style={{ marginBottom: 10 }}
                    />
                    <FormActions onSave={() => saveTrack(book)} onCancel={() => setTrackingBookId(null)} saveText="保存今日阅读" color={COLORS.green} />
                  </div>
                )}

                {history.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    {history.slice(0, 5).map((item) => (
                      <div key={item.id} style={{ background: "rgba(255,255,255,.75)", borderRadius: 12, padding: "8px 10px", marginBottom: 7 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
                          <div style={{ color: COLORS.text, fontSize: 14, lineHeight: 1.7, minWidth: 0, flex: 1 }}>
                            <strong>{fmtDate(item.date)}</strong>
                            {item.progress && <span> · {item.progress}</span>}
                            {item.note && <div style={{ color: COLORS.muted, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{item.note}</div>}
                          </div>
                          <Btn small outline color={COLORS.danger} onClick={() => deleteTrack(book.id, item.id)}>删</Btn>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {status !== "done" && <Btn small color={COLORS.purple} onClick={() => markAsDone(book)}>标记读完</Btn>}
                {status === "want" && <Btn small outline color={COLORS.green} onClick={() => moveToReading(book)}>开始读</Btn>}
                {status === "done" && <Btn small outline color={COLORS.green} onClick={() => moveToReading(book)}>重新开始读</Btn>}
              </div>
              <ActionButtons
                onEdit={() => {
                  setEditId(book.id);
                  setEditForm({
                    title: book.title,
                    author: book.author || "",
                    note: book.note || "",
                    status,
                    startDate: book.startDate || today(),
                    finishDate: book.finishDate || "",
                    progress: book.progress || "",
                  });
                }}
                onDelete={() => deleteBook(book.id)}
              />
            </div>
          </>
        )}
      </Card>
    );
  };

  const DoneSection = () => {
    const years = Object.keys(doneByYearMonth).sort((a, b) => Number(b) - Number(a));
    if (years.length === 0) return <EmptyState emoji={READING_STATUS_META.done.emoji} text={READING_STATUS_META.done.empty} />;

    return (
      <div>
        {years.map((year) => {
          const months = Object.keys(doneByYearMonth[year]).sort((a, b) => Number(b) - Number(a));
          return (
            <div key={year}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                margin: "10px 0 12px",
                color: COLORS.purple,
                fontSize: 18,
                fontWeight: 900,
              }}>
                <span style={{ height: 1, flex: 1, background: "rgba(164,143,192,.28)" }} />
                <span>{year} 年 · 读完 {yearlyDoneCounts[year]} 本</span>
                <span style={{ height: 1, flex: 1, background: "rgba(164,143,192,.28)" }} />
              </div>

              {months.map((month) => (
                <div key={`${year}-${month}`}>
                  <div style={{ fontWeight: 900, color: COLORS.muted, fontSize: 15, margin: "8px 0" }}>
                    {MONTH_LABELS[Number(month)]} · {doneByYearMonth[year][month].length} 本
                  </div>
                  {doneByYearMonth[year][month].map((book) => <BookCard key={book.id} book={book} />)}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, color: COLORS.text, fontSize: 22, fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "inline-flex", width: 4, height: 22, borderRadius: 4, background: COLORS.green, flexShrink: 0 }} />
            阅读花架 📚
          </h2>
          <div style={{ marginTop: 5, color: COLORS.muted, fontSize: 13, lineHeight: 1.6, paddingLeft: 12 }}>
            正在读、想读、已读完分开收纳；像给花架分层，已读完会自动按年月归档。
          </div>
        </div>
        <Btn onClick={() => setAdding(!adding)} small color={COLORS.green}>
          {adding ? "取消" : "+ 加一本书"}
        </Btn>
      </div>

      {adding && (
        <Card style={{ border: `2px solid ${COLORS.green}` }}>
          {Fields({ value: form, setValue: setForm })}
          <FormActions onSave={save} onCancel={resetAddForm} saveText="放上阅读花架" color={COLORS.green} />
        </Card>
      )}

      {READING_STATUS_ORDER.map((status) => (
        <div key={status}>
          <SectionHeader status={status} count={groupedByStatus[status].length} />
          {!collapsed[status] && (
            <div>
              {status === "done" ? (
                <DoneSection />
              ) : groupedByStatus[status].length === 0 ? (
                <EmptyState emoji={READING_STATUS_META[status].emoji} text={READING_STATUS_META[status].empty} />
              ) : (
                groupedByStatus[status].map((book) => <BookCard key={book.id} book={book} />)
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Game Tracker ────────────────────────────────────────────────────────────
const GAME_PREFERENCE_META: Record<GamePreference, { label: string; emoji: string; color: string }> = {
  like: { label: "喜欢", emoji: "💖", color: COLORS.green },
  neutral: { label: "一般", emoji: "🤔", color: COLORS.muted },
  dislike: { label: "不喜欢", emoji: "💔", color: COLORS.danger },
};

const GAME_SECTION_META: Record<"playing" | "finished", { title: string; emoji: string; empty: string; color: string }> = {
  playing: {
    title: "正在玩 / 还没玩完",
    emoji: "🕹️",
    empty: "还没有正在玩的游戏。把想记录的游戏放进来，截图和感受都可以慢慢补。",
    color: COLORS.blue,
  },
  finished: {
    title: "已玩完",
    emoji: "🏁",
    empty: "还没有玩完的游戏。以后这里就是你的通关收藏柜。",
    color: COLORS.purple,
  },
};

const GAME_SECTION_ORDER: ("playing" | "finished")[] = ["playing", "finished"];

const normalizeGamePreference = (preference?: string): GamePreference =>
  preference === "like" || preference === "dislike" || preference === "neutral" ? preference : "neutral";

const readGameScreenshots = (files: FileList | null): Promise<GameScreenshot[]> => {
  const imageFiles = Array.from(files || []).filter((file) => file.type.startsWith("image/"));
  return Promise.all(
    imageFiles.map(
      (file) =>
        new Promise<GameScreenshot>((resolve) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve({
              id: uid(),
              createdAt: now(),
              src: String(reader.result || ""),
              name: file.name,
            });
          reader.onerror = () =>
            resolve({
              id: uid(),
              createdAt: now(),
              src: "",
              name: file.name,
            });
          reader.readAsDataURL(file);
        })
    )
  );
};

const sortGames = (games: GameEntry[]) =>
  [...games].sort((a, b) => {
    if (a.finished !== b.finished) return Number(a.finished) - Number(b.finished);
    return (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt);
  });

function GameTrackerTab({ data, setData }: { data: GameEntry[]; setData: Setter<GameEntry[]> }) {
  type GameForm = Omit<GameEntry, keyof BaseItem>;

  const blankGameForm = (): GameForm => ({
    title: "",
    platform: "",
    playTime: "",
    preference: "neutral",
    note: "",
    finished: false,
    finishDate: "",
    screenshots: [],
  });

  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<GameForm>(blankGameForm());
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<GameForm>(blankGameForm());
  const [collapsed, setCollapsed] = useState<Record<"playing" | "finished", boolean>>({
    playing: false,
    finished: false,
  });

  const cleanedData: GameEntry[] = data.map((game) => ({
    ...game,
    title: game.title || "未命名游戏",
    platform: game.platform || "",
    playTime: game.playTime || "",
    preference: normalizeGamePreference(game.preference),
    note: game.note || "",
    finished: Boolean(game.finished),
    finishDate: game.finishDate || "",
    screenshots: game.screenshots || [],
  }));

  const sorted = sortGames(cleanedData);
  const grouped = {
    playing: sorted.filter((game) => !game.finished),
    finished: sorted.filter((game) => game.finished),
  };

  const likedCount = cleanedData.filter((game) => normalizeGamePreference(game.preference) === "like").length;
  const finishedCount = cleanedData.filter((game) => game.finished).length;
  const screenshotCount = cleanedData.reduce((sum, game) => sum + (game.screenshots || []).length, 0);

  const resetAddForm = () => {
    setForm(blankGameForm());
    setAdding(false);
  };

  const cleanForm = (value: GameForm): GameForm => {
    const finished = Boolean(value.finished);
    return {
      title: value.title.trim(),
      platform: value.platform.trim(),
      playTime: value.playTime.trim(),
      preference: normalizeGamePreference(value.preference),
      note: value.note.trim(),
      finished,
      finishDate: finished ? value.finishDate || today() : "",
      screenshots: (value.screenshots || []).filter((shot) => shot.src),
    };
  };

  const save = () => {
    const cleaned = cleanForm(form);
    if (!cleaned.title) return;
    setData((prev) => [{ id: uid(), createdAt: now(), ...cleaned }, ...prev]);
    resetAddForm();
  };

  const saveEdit = () => {
    if (!editId) return;
    const cleaned = cleanForm(editForm);
    if (!cleaned.title) return;
    setData((prev) => prev.map((game) => (game.id === editId ? { ...game, ...cleaned, updatedAt: now() } : game)));
    setEditId(null);
  };

  const deleteGame = (id: string) => {
    if (confirmDelete()) setData((prev) => prev.filter((game) => game.id !== id));
  };

  const toggleFinished = (game: GameEntry) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === game.id
          ? {
              ...item,
              finished: !game.finished,
              finishDate: !game.finished ? today() : "",
              updatedAt: now(),
            }
          : item
      )
    );
  };

  const addScreenshotsToForm = async (files: FileList | null, setValue: Setter<GameForm>) => {
    const shots = (await readGameScreenshots(files)).filter((shot) => shot.src);
    if (shots.length === 0) return;
    setValue((prev) => ({ ...prev, screenshots: [...(prev.screenshots || []), ...shots] }));
  };

  const addScreenshotsToGame = async (gameId: string, files: FileList | null) => {
    const shots = (await readGameScreenshots(files)).filter((shot) => shot.src);
    if (shots.length === 0) return;
    setData((prev) =>
      prev.map((game) =>
        game.id === gameId
          ? { ...game, screenshots: [...(game.screenshots || []), ...shots], updatedAt: now() }
          : game
      )
    );
  };

  const deleteScreenshotFromGame = (gameId: string, screenshotId: string) => {
    if (!confirmDelete()) return;
    setData((prev) =>
      prev.map((game) =>
        game.id === gameId
          ? {
              ...game,
              screenshots: (game.screenshots || []).filter((shot) => shot.id !== screenshotId),
              updatedAt: now(),
            }
          : game
      )
    );
  };

  const deleteScreenshotFromForm = (screenshotId: string, setValue: Setter<GameForm>) => {
    setValue((prev) => ({ ...prev, screenshots: (prev.screenshots || []).filter((shot) => shot.id !== screenshotId) }));
  };

  const ScreenshotPicker = ({
    onFiles,
    label = "+ 添加截图",
    color = COLORS.blue,
  }: {
    onFiles: (files: FileList | null) => void;
    label?: string;
    color?: string;
  }) => (
    <label
      className="diary-btn"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: BTN_GRADIENTS[color] ?? color,
        color: "#fff",
        borderRadius: 999,
        padding: "8px 18px",
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
        boxShadow: "0 2px 12px rgba(0,0,0,.13), 0 1px 3px rgba(0,0,0,.08)",
        whiteSpace: "nowrap",
      }}
    >
      {label}
      <input
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={(e) => {
          onFiles(e.currentTarget.files);
          e.currentTarget.value = "";
        }}
      />
    </label>
  );

  const ScreenshotGrid = ({
    screenshots,
    onDelete,
  }: {
    screenshots: GameScreenshot[];
    onDelete?: (id: string) => void;
  }) => {
    if (!screenshots || screenshots.length === 0) return null;
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10, marginTop: 12 }}>
        {screenshots.map((shot) => (
          <div key={shot.id} style={{ position: "relative", borderRadius: 16, overflow: "hidden", background: COLORS.light, minHeight: 90 }}>
            <img
              src={shot.src}
              alt={shot.name || "游戏截图"}
              style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 16 }}
            />
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(shot.id)}
                aria-label="删除截图"
                title="删除截图"
                className="diary-btn"
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  border: "none",
                  background: "rgba(61,34,24,.72)",
                  color: "#fff",
                  fontWeight: 900,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    );
  };

  const Fields = ({ value, setValue }: { value: GameForm; setValue: Setter<GameForm> }) => {
    const preference = normalizeGamePreference(value.preference);
    return (
      <>
        <Input
          value={value.title}
          onChange={(v) => setValue((p) => ({ ...p, title: v }))}
          placeholder="游戏名"
          style={{ marginBottom: 10 }}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <Input
            value={value.platform}
            onChange={(v) => setValue((p) => ({ ...p, platform: v }))}
            placeholder="平台/设备，如 Switch / Steam / 手机（可选）"
            style={{ flex: "1 1 230px" }}
          />
          <Input
            value={value.playTime}
            onChange={(v) => setValue((p) => ({ ...p, playTime: v }))}
            placeholder="游玩时长，如 12h / 3晚"
            style={{ flex: "1 1 160px" }}
          />
        </div>

        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 10 }}>
          {(Object.keys(GAME_PREFERENCE_META) as GamePreference[]).map((key) => {
            const meta = GAME_PREFERENCE_META[key];
            return (
              <span
                key={key}
                onClick={() => setValue((p) => ({ ...p, preference: key }))}
                style={{
                  padding: "7px 12px",
                  borderRadius: 999,
                  background: preference === key ? meta.color : COLORS.light,
                  color: preference === key ? "#fff" : COLORS.muted,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 900,
                  boxShadow: preference === key ? "0 2px 10px rgba(61,34,24,.12)" : "none",
                  transition: "background .15s, transform .15s",
                }}
              >
                {meta.emoji} {meta.label}
              </span>
            );
          })}
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 9, color: COLORS.text, fontWeight: 800, marginBottom: 10, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={Boolean(value.finished)}
            onChange={(e) =>
              setValue((p) => ({
                ...p,
                finished: e.target.checked,
                finishDate: e.target.checked ? p.finishDate || today() : "",
              }))
            }
            style={{ width: 18, height: 18, accentColor: COLORS.purple }}
          />
          已玩完 / 通关了
        </label>

        {value.finished && (
          <Input
            type="date"
            value={value.finishDate || today()}
            onChange={(v) => setValue((p) => ({ ...p, finishDate: v }))}
            style={{ marginBottom: 10, width: 180 }}
          />
        )}

        <Input
          value={value.note}
          onChange={(v) => setValue((p) => ({ ...p, note: v }))}
          placeholder="文字感受：哪里好玩、哪里打动你、为什么喜欢/不喜欢……"
          multiline
          rows={4}
          style={{ marginBottom: 12 }}
        />

        <div style={{ background: "rgba(224,240,255,.5)", borderRadius: 16, padding: "12px", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div style={{ color: COLORS.blue, fontWeight: 900, fontSize: 15 }}>截图墙</div>
            <ScreenshotPicker onFiles={(files) => addScreenshotsToForm(files, setValue)} />
          </div>
          <div style={{ color: COLORS.muted, fontSize: 13, lineHeight: 1.7, marginTop: 7 }}>
            截图会保存在浏览器本地。图片太多时，本地存储可能会满，可以只留最有代表性的几张。
          </div>
          <ScreenshotGrid screenshots={value.screenshots || []} onDelete={(id) => deleteScreenshotFromForm(id, setValue)} />
        </div>
      </>
    );
  };

  const SectionHeader = ({ section, count }: { section: "playing" | "finished"; count: number }) => {
    const meta = GAME_SECTION_META[section];
    return (
      <button
        type="button"
        onClick={() => setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }))}
        style={{
          width: "100%",
          border: "none",
          background: "transparent",
          padding: 0,
          margin: "18px 0 10px",
          cursor: "pointer",
          fontFamily: "inherit",
          textAlign: "left",
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          background: "rgba(255,255,255,.72)",
          border: `1.5px solid ${meta.color}33`,
          borderRadius: 18,
          padding: "12px 14px",
          boxShadow: "0 2px 12px rgba(61,34,24,.05)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0, flexWrap: "wrap" }}>
            <span style={{ fontSize: 22 }}>{meta.emoji}</span>
            <strong style={{ color: COLORS.text, fontSize: 17, fontWeight: 900 }}>{meta.title}</strong>
            <Tag color={COLORS.light} textColor={meta.color}>{count}个</Tag>
          </div>
          <span style={{ color: meta.color, fontSize: 18, fontWeight: 900 }}>
            {collapsed[section] ? "⌄" : "⌃"}
          </span>
        </div>
      </button>
    );
  };

  const GameCard = ({ game }: { game: GameEntry }) => {
    const preference = normalizeGamePreference(game.preference);
    const preferenceMeta = GAME_PREFERENCE_META[preference];
    const statusMeta = game.finished ? GAME_SECTION_META.finished : GAME_SECTION_META.playing;
    const screenshots = game.screenshots || [];

    return (
      <Card style={{ borderLeft: `4px solid ${statusMeta.color}` }}>
        {editId === game.id ? (
          <>
            {Fields({ value: editForm, setValue: setEditForm })}
            <FormActions onSave={saveEdit} onCancel={() => setEditId(null)} saveText="保存修改" color={statusMeta.color} />
          </>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ minWidth: 0, flex: "1 1 220px" }}>
                <div style={{ color: COLORS.text, fontSize: 18, fontWeight: 900, lineHeight: 1.45, wordBreak: "break-word" }}>
                  {game.title}
                </div>
                {game.platform && <div style={{ color: COLORS.muted, fontSize: 14, marginTop: 3 }}>平台：{game.platform}</div>}
              </div>
              <Tag color={game.finished ? "#F3EEFF" : "#E0F0FF"} textColor={statusMeta.color}>
                {game.finished ? "已玩完" : "游玩中"}
              </Tag>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              <Tag color={`${preferenceMeta.color}22`} textColor={preferenceMeta.color}>{preferenceMeta.emoji} {preferenceMeta.label}</Tag>
              {game.playTime && <Tag color={COLORS.soft}>⏱ {game.playTime}</Tag>}
              {game.finished && game.finishDate && <Tag color="#F3EEFF" textColor={COLORS.purple}>完成：{fmtDateWithYear(game.finishDate)}</Tag>}
              {screenshots.length > 0 && <Tag color="#E0F0FF" textColor={COLORS.blue}>📷 {screenshots.length} 张截图</Tag>}
            </div>

            {game.note && (
              <p style={{ margin: "12px 0 0", color: COLORS.muted, fontSize: 15, lineHeight: 1.8, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {game.note}
              </p>
            )}

            <ScreenshotGrid screenshots={screenshots} onDelete={(id) => deleteScreenshotFromGame(game.id, id)} />

            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Btn small color={game.finished ? COLORS.blue : COLORS.purple} onClick={() => toggleFinished(game)}>
                  {game.finished ? "改成未玩完" : "标记已玩完"}
                </Btn>
                <ScreenshotPicker label="+ 加截图" color={COLORS.blue} onFiles={(files) => addScreenshotsToGame(game.id, files)} />
              </div>
              <ActionButtons
                onEdit={() => {
                  setAdding(false);
                  setEditId(game.id);
                  setEditForm({
                    title: game.title || "",
                    platform: game.platform || "",
                    playTime: game.playTime || "",
                    preference,
                    note: game.note || "",
                    finished: Boolean(game.finished),
                    finishDate: game.finishDate || "",
                    screenshots: screenshots || [],
                  });
                }}
                onDelete={() => deleteGame(game.id)}
              />
            </div>
          </>
        )}
      </Card>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, color: COLORS.text, fontSize: 22, fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "inline-flex", width: 4, height: 22, borderRadius: 4, background: COLORS.blue, flexShrink: 0 }} />
            游戏角落 🎮
          </h2>
          <div style={{ marginTop: 5, color: COLORS.muted, fontSize: 13, lineHeight: 1.6, paddingLeft: 12 }}>
            记录玩过什么、截图、感受、时长、喜欢还是不喜欢；这里是花园里可以撒野的游戏角落。
          </div>
        </div>
        <Btn onClick={() => setAdding(!adding)} small color={COLORS.blue}>
          {adding ? "取消" : "+ 加一个游戏"}
        </Btn>
      </div>

      <Card style={{ border: `2px solid ${COLORS.blue}`, background: "linear-gradient(160deg, #FFFFFF 0%, #F4FAFF 100%)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10 }}>
          <div style={{ background: "rgba(104,152,184,.12)", borderRadius: 18, padding: "12px", textAlign: "center" }}>
            <div style={{ color: COLORS.blue, fontSize: 26, fontWeight: 900 }}>{cleanedData.length}</div>
            <div style={{ color: COLORS.muted, fontSize: 13, fontWeight: 800 }}>记录的游戏</div>
          </div>
          <div style={{ background: "rgba(164,143,192,.12)", borderRadius: 18, padding: "12px", textAlign: "center" }}>
            <div style={{ color: COLORS.purple, fontSize: 26, fontWeight: 900 }}>{finishedCount}</div>
            <div style={{ color: COLORS.muted, fontSize: 13, fontWeight: 800 }}>已玩完</div>
          </div>
          <div style={{ background: "rgba(104,174,126,.12)", borderRadius: 18, padding: "12px", textAlign: "center" }}>
            <div style={{ color: COLORS.green, fontSize: 26, fontWeight: 900 }}>{likedCount}</div>
            <div style={{ color: COLORS.muted, fontSize: 13, fontWeight: 800 }}>喜欢</div>
          </div>
          <div style={{ background: "rgba(235,170,192,.16)", borderRadius: 18, padding: "12px", textAlign: "center" }}>
            <div style={{ color: COLORS.primary, fontSize: 26, fontWeight: 900 }}>{screenshotCount}</div>
            <div style={{ color: COLORS.muted, fontSize: 13, fontWeight: 800 }}>截图</div>
          </div>
        </div>
      </Card>

      {adding && (
        <Card style={{ border: `2px solid ${COLORS.blue}` }}>
          {Fields({ value: form, setValue: setForm })}
          <FormActions onSave={save} onCancel={resetAddForm} saveText="保存这个游戏 🎮" color={COLORS.blue} />
        </Card>
      )}

      {cleanedData.length === 0 && !adding && <EmptyState emoji="🎮" text="还没有游戏记录。先加一个最近玩过的，哪怕只写一句感受也很值。" />}

      {GAME_SECTION_ORDER.map((section) => (
        <div key={section}>
          <SectionHeader section={section} count={grouped[section].length} />
          {!collapsed[section] && (
            <div>
              {grouped[section].length === 0 ? (
                <EmptyState emoji={GAME_SECTION_META[section].emoji} text={GAME_SECTION_META[section].empty} />
              ) : (
                grouped[section].map((game) => <GameCard key={game.id} game={game} />)
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}



// ─── Backup ──────────────────────────────────────────────────────────────────
function BackupTab() {
  const [meta, setMeta] = useState<BackupMeta>(() => readBackupMeta());
  const [stats, setStats] = useState(() => getBackupStorageStats());
  const [message, setMessage] = useState("");

  const refresh = () => {
    setMeta(readBackupMeta());
    setStats(getBackupStorageStats());
  };

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("xinshi-garden-backup-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("xinshi-garden-backup-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const exportBackup = () => {
    try {
      const payload = saveLocalBackupSnapshot("export");
      const size = downloadBackupPayload(payload);
      const iso = new Date().toISOString();
      writeBackupMeta({
        lastBackupAt: iso,
        lastExportAt: iso,
        lastBackupType: "export",
        lastBackupError: "",
      });
      refresh();
      setMessage(`已导出备份文件（${bytesToSize(size)}）。请把它保存到 iCloud Drive / Files / Google Drive，别只留在浏览器里。`);
    } catch (err) {
      console.error(err);
      writeBackupMeta({ lastBackupError: "导出失败：可能是浏览器阻止下载，或本地空间不足。" });
      refresh();
      setMessage("导出失败。可以先清理一点浏览器空间，再试一次。截图、照片多的时候 JSON 会比较大。");
    }
  };

  const saveSnapshotNow = () => {
    try {
      const payload = saveLocalBackupSnapshot("manual-local");
      const size = new Blob([JSON.stringify(payload)]).size;
      refresh();
      setMessage(`已在浏览器本地保存一份快照（${bytesToSize(size)}）。但它仍然怕卸载/清 Safari 数据，真正保险还是导出到云盘。`);
    } catch (err) {
      console.error(err);
      writeBackupMeta({ lastBackupError: "本地快照失败：空间可能满了，请立刻导出 JSON。" });
      refresh();
      setMessage("本地快照失败：本地空间可能满了。请尽快导出备份文件，或者删掉一些大图片记录。 ");
    }
  };

  const restoreLocalSnapshot = () => {
    try {
      const raw = localStorage.getItem(BACKUP_SNAPSHOT_KEY);
      if (!raw) {
        alert("还没有本地快照可以恢复。请使用你导出的 JSON 文件导入。");
        return;
      }

      const parsed = JSON.parse(raw);
      const snapshot = extractBackupStorage(parsed);
      if (!snapshot) {
        alert("本地快照已损坏，无法恢复。请改用导出的 JSON 文件。");
        return;
      }

      const ok = window.confirm("将用最近一次本地快照覆盖当前数据。确定恢复吗？");
      if (!ok) return;

      BACKUP_STORAGE_ITEMS.forEach((item) => {
        const value = snapshot[item.key];
        if (value === null || typeof value === "undefined") {
          localStorage.removeItem(item.key);
        } else {
          localStorage.setItem(item.key, JSON.stringify(value));
        }
      });

      const iso = new Date().toISOString();
      writeBackupMeta({
        lastBackupAt: iso,
        lastImportAt: iso,
        lastBackupType: "import",
        lastImportedFileName: "浏览器本地快照",
        lastBackupError: "",
      });

      alert("已从本地快照恢复，页面会刷新。");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("恢复失败：本地快照无法读取，或浏览器空间异常。");
    }
  };

  const importBackup = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const incoming = extractBackupStorage(parsed);
        if (!incoming) {
          alert("这个文件看起来不是心事花园备份 JSON。请确认你选择的是导出的备份文件。");
          return;
        }

        const keysToImport = BACKUP_STORAGE_ITEMS.filter((item) => Object.prototype.hasOwnProperty.call(incoming, item.key));
        if (keysToImport.length === 0) {
          alert("这个备份里没有找到可导入的数据。导入已取消。");
          return;
        }

        const ok = window.confirm(
          `将导入 ${keysToImport.length} 类数据，并覆盖当前本地数据。\n\n导入前会先在本机保存一份当前数据快照，但如果你已经删过 App/清过数据，它也救不回来。确定继续吗？`
        );
        if (!ok) return;

        try {
          saveLocalBackupSnapshot("manual-local");
        } catch {
          // If local snapshot fails, continue only with user confirmation.
          const stillImport = window.confirm("导入前的本地快照保存失败，可能是空间不足。仍然继续导入吗？");
          if (!stillImport) return;
        }

        keysToImport.forEach((item) => {
          const value = incoming[item.key];
          if (value === null || typeof value === "undefined") {
            localStorage.removeItem(item.key);
          } else {
            localStorage.setItem(item.key, JSON.stringify(value));
          }
        });

        const iso = new Date().toISOString();
        writeBackupMeta({
          lastBackupAt: iso,
          lastImportAt: iso,
          lastBackupType: "import",
          lastImportedFileName: file.name,
          lastBackupError: "",
        });

        alert("导入成功，页面会刷新来读取新数据。");
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert("导入失败：文件格式不对，或备份文件太大/已损坏。");
      }
    };
    input.click();
  };

  const lastBackupLabel = formatBackupDateTime(meta.lastBackupAt || meta.lastAutoBackupAt || meta.lastExportAt || meta.lastImportAt);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, color: COLORS.text, fontSize: 22, fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "inline-flex", width: 4, height: 22, borderRadius: 4, background: COLORS.accent, flexShrink: 0 }} />
            备份保险箱 🛟
          </h2>
          <div style={{ marginTop: 5, color: COLORS.muted, fontSize: 13, lineHeight: 1.6, paddingLeft: 12 }}>
            本地记录很脆：删主屏幕书签、清 Safari 网站数据、换浏览器，都可能清空。备份文件才是保命绳。
          </div>
        </div>
      </div>

      <Card style={{ border: `2px solid ${COLORS.accent}`, background: "linear-gradient(160deg, #FFFFFF 0%, #FFF3F7 100%)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
          <div style={{ background: "rgba(199,108,132,.12)", borderRadius: 18, padding: "13px", textAlign: "center" }}>
            <div style={{ color: COLORS.accent, fontSize: 20, fontWeight: 950, lineHeight: 1.35 }}>{lastBackupLabel}</div>
            <div style={{ color: COLORS.muted, fontSize: 13, fontWeight: 800, marginTop: 4 }}>上一次备份时间</div>
          </div>
          <div style={{ background: "rgba(111,166,106,.12)", borderRadius: 18, padding: "13px", textAlign: "center" }}>
            <div style={{ color: COLORS.green, fontSize: 28, fontWeight: 950 }}>{stats.total}</div>
            <div style={{ color: COLORS.muted, fontSize: 13, fontWeight: 800 }}>当前可备份记录</div>
          </div>
          <div style={{ background: "rgba(121,169,164,.12)", borderRadius: 18, padding: "13px", textAlign: "center" }}>
            <div style={{ color: COLORS.blue, fontSize: 28, fontWeight: 950 }}>{bytesToSize(stats.size)}</div>
            <div style={{ color: COLORS.muted, fontSize: 13, fontWeight: 800 }}>备份文件大小</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <Btn onClick={exportBackup} color={COLORS.accent}>导出备份 JSON</Btn>
          <Btn onClick={importBackup} outline color={COLORS.primary}>导入备份 JSON</Btn>
          <Btn onClick={saveSnapshotNow} outline color={COLORS.blue}>立即保存本地快照</Btn>
          <Btn onClick={restoreLocalSnapshot} outline color={COLORS.purple}>从本地快照恢复</Btn>
        </div>

        <div style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.8 }}>
          自动备份：每次记录变化后，App 会自动保存一份最新快照到浏览器本地。<strong style={{ color: COLORS.danger }}>但这份快照也属于本地数据</strong>，卸载/清数据可能一起没。最安全做法：每隔一阵点击“导出备份 JSON”，保存到 iCloud Drive 或 Google Drive。
        </div>

        {meta.lastExportAt && (
          <div style={{ marginTop: 8, color: COLORS.muted, fontSize: 13, lineHeight: 1.7 }}>
            上一次导出：{formatBackupDateTime(meta.lastExportAt)}
          </div>
        )}
        {meta.lastImportAt && (
          <div style={{ marginTop: 4, color: COLORS.muted, fontSize: 13, lineHeight: 1.7 }}>
            上一次导入：{formatBackupDateTime(meta.lastImportAt)}{meta.lastImportedFileName ? `（${meta.lastImportedFileName}）` : ""}
          </div>
        )}
      </Card>

      {(message || meta.lastBackupError) && (
        <Card style={{ borderLeft: `4px solid ${meta.lastBackupError ? COLORS.danger : COLORS.primary}` }}>
          <div style={{ color: meta.lastBackupError ? COLORS.danger : COLORS.primary, fontWeight: 900, marginBottom: 6 }}>
            {meta.lastBackupError ? "备份提醒" : "备份结果"}
          </div>
          <div style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.8 }}>
            {meta.lastBackupError || message}
          </div>
        </Card>
      )}

      <Card>
        <div style={{ color: COLORS.text, fontSize: 17, fontWeight: 900, marginBottom: 10 }}>这次备份会包含</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))", gap: 8 }}>
          {stats.rows.map((row) => (
            <div key={row.key} style={{ background: COLORS.light, borderRadius: 14, padding: "9px 11px", display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
              <span style={{ color: COLORS.muted, fontSize: 13, fontWeight: 800 }}>{row.label}</span>
              <Tag color={row.count > 0 ? COLORS.soft : "rgba(127,118,103,.12)"} textColor={row.count > 0 ? COLORS.accent : COLORS.muted}>{row.count}</Tag>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ background: "linear-gradient(160deg, #FFFDF7 0%, #FFF8EA 100%)" }}>
        <div style={{ color: COLORS.text, fontSize: 17, fontWeight: 900, marginBottom: 8 }}>恢复数据怎么做</div>
        <div style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.85 }}>
          新手机 / 重新添加主屏幕 / 本地数据空了：先打开这个 Tab，点“导入备份 JSON”，选择你之前保存到 Files 或云盘里的备份文件。导入会覆盖当前本地数据，所以空白新环境最适合直接导入。
        </div>
      </Card>
    </div>
  );
}


// ─── App Shell ────────────────────────────────────────────────────────────────
export default function CoupleDiary() {
  const [activeTab, setActiveTab] = useState<TabId>("diary");

  // ── Data (localStorage keys are UNCHANGED) ────────────────────────────────
  const [diary,     setDiary]     = useLocalStorage<DiaryEntry[]>   ("couple-diary-diary-v2",     []);
  const [jokes,     setJokes]     = useLocalStorage<JokeEntry[]>    ("couple-diary-jokes-v2",     []);
  const [checkins,  setCheckins]  = useLocalStorage<CheckinEntry[]> ("couple-diary-checkins-v1",  []);
  const [calendarData, setCalendarData] = useLocalStorage<CalendarData>("couple-diary-calendar-v2", {});
  const [whispers,  setWhispers]  = useLocalStorage<WhisperEntry[]> ("couple-diary-whispers-v2",  []);
  const [wishes,    setWishes]    = useLocalStorage<WishEntry[]>    ("couple-diary-wishes-v2",    []);
  const [schedule,  setSchedule]  = useLocalStorage<ScheduleEntry[]>("couple-diary-schedule-v2",  []);
  const [shopping,  setShopping]  = useLocalStorage<ShoppingEntry[]>("couple-diary-shopping-v1",  []);
  const [fiveYearDiary, setFiveYearDiary] = useLocalStorage<FiveYearDiaryData>("couple-diary-five-year-v1", {});
  const [fiveYearPhotos, setFiveYearPhotos] = useLocalStorage<FiveYearPhotosData>("couple-diary-fiveyear-photos-v1", {});
  const [longWritings, setLongWritings] = useLocalStorage<LongWritingEntry[]>("couple-diary-long-writings-v1", []);
  const [readingBooks, setReadingBooks] = useLocalStorage<ReadingBookEntry[]>("couple-diary-reading-v1", []);
  const [gameEntries, setGameEntries] = useLocalStorage<GameEntry[]>("couple-diary-games-v1", []);
  const [crochetProjects, setCrochetProjects] = useLocalStorage<CrochetProjectEntry[]>("couple-diary-crochet-v1", []);
  const [successEntries, setSuccessEntries] = useLocalStorage<SuccessEntry[]>("couple-diary-success-v1", []);
  const [moodLogEntries, setMoodLogEntries] = useLocalStorage<MoodLogEntry[]>("couple-diary-mood-log-v1", []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        saveLocalBackupSnapshot("auto");
      } catch (err) {
        console.error(err);
        writeBackupMeta({
          lastBackupError: "自动备份失败：本地空间可能满了。请尽快导出备份 JSON 到 iCloud Drive / Files。",
        });
      }
    }, 900);

    return () => window.clearTimeout(timer);
  }, [
    diary,
    jokes,
    checkins,
    calendarData,
    whispers,
    wishes,
    schedule,
    shopping,
    fiveYearDiary,
    fiveYearPhotos,
    longWritings,
    readingBooks,
    gameEntries,
    crochetProjects,
    successEntries,
    moodLogEntries,
  ]);

  const renderTab = () => {
    switch (activeTab) {
      case "diary":    return <DiaryTab    data={diary}        setData={setDiary} />;
      case "moodLog":  return <MoodLogTab data={moodLogEntries} setData={setMoodLogEntries} />;
      case "success":  return <SuccessDiaryTab data={successEntries} setData={setSuccessEntries} />;
      case "fiveYear": return <FiveYearDiaryTab data={fiveYearDiary} setData={setFiveYearDiary} diary={diary} setDiary={setDiary} successEntries={successEntries} photos={fiveYearPhotos} setPhotos={setFiveYearPhotos} />;
      case "lifeScroll": return <LongTermWritingTab data={longWritings} setData={setLongWritings} />;
      case "backup":   return <BackupTab />;
      case "reading":  return <ReadingTab  data={readingBooks} setData={setReadingBooks} />;
      case "games":    return <GameTrackerTab data={gameEntries} setData={setGameEntries} />;
      case "crochet":  return <CrochetBasketTab data={crochetProjects} setData={setCrochetProjects} />;
      case "checkin":  return <CheckinTab  data={checkins}     setData={setCheckins} />;
      case "schedule": return <ScheduleTab data={schedule}     setData={setSchedule} />;
      case "shopping": return <ShoppingTab data={shopping}     setData={setShopping} />;
      case "whisper":  return <WhisperTab  data={whispers}     setData={setWhispers} />;
      case "jokes":    return <JokesTab    data={jokes}        setData={setJokes} />;
      case "calendar": return <CalendarTab data={calendarData} setData={setCalendarData} />;
      case "wishes":   return <WishesTab   data={wishes}       setData={setWishes} />;
      default: return null;
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        background: "radial-gradient(circle at 10% 0%, rgba(235,170,192,.23) 0, transparent 28%), radial-gradient(circle at 90% 8%, rgba(118,169,111,.22) 0, transparent 26%), radial-gradient(circle at 50% 100%, rgba(221,182,95,.12) 0, transparent 34%), " + COLORS.bg,
        fontFamily: "'PingFang SC', 'Noto Serif SC', 'STSong', 'Georgia', 'Microsoft YaHei', serif",
        fontSize: 17,
        color: COLORS.text,
      }}
    >
      <GlobalStyle />

      {/* ── Header ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #527D4E 0%, #6FA66A 32%, #D997AD 72%, #F3C8D6 100%)",
          padding: "18px 20px 16px",
          textAlign: "center",
          position: "sticky",
          top: 0,
          zIndex: 100,
          width: "100%",
          maxWidth: "100%",
          boxShadow: "0 6px 30px rgba(82, 125, 78, .28)",
          overflow: "hidden",
          borderBottom: "1px solid rgba(255,255,255,.35)",
        }}
      >
        <div style={{ position: "absolute", left: 18, top: 12, fontSize: 30, opacity: .25, transform: "rotate(-12deg)" }}>🌿</div>
        <div style={{ position: "absolute", right: 22, top: 16, fontSize: 28, opacity: .28, transform: "rotate(10deg)" }}>🌷</div>
        <div style={{ position: "absolute", left: "12%", bottom: -16, width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,.13)" }} />
        <div style={{ position: "absolute", right: "10%", top: -26, width: 92, height: 92, borderRadius: "50%", background: "rgba(255,255,255,.12)" }} />
        <div style={{ position: "relative" }}>
          <div style={{
            fontSize: 10,
            color: "rgba(255,255,255,.74)",
            letterSpacing: 4.5,
            marginBottom: 3,
            textTransform: "uppercase",
            fontWeight: 800,
          }}>
            SECRET GARDEN FOR EVERYDAY THOUGHTS
          </div>
          <h1 style={{
            margin: 0,
            color: "#fff",
            fontSize: 28,
            fontWeight: 950,
            letterSpacing: 1.2,
            textShadow: "0 2px 16px rgba(47,42,32,.24)",
            lineHeight: 1.25,
          }}>
            🌸 心事花园
          </h1>
          <div style={{
            marginTop: 5,
            fontSize: 12,
            color: "rgba(255,255,255,.82)",
            letterSpacing: 0.8,
            fontWeight: 700,
          }}>
            把每天的心事种下，让它慢慢长成自己的花
          </div>
          <div style={{
            marginTop: 3,
            fontSize: 11,
            color: "rgba(255,255,255,.62)",
            letterSpacing: 1,
            fontWeight: 500,
          }}>
            {new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
          </div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div
        className="hide-scrollbar"
        style={{
          display: "flex",
          overflowX: "auto",
          overflowY: "hidden",
          gap: 6,
          background: "rgba(255,253,247,.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(161,183,132,.28)",
          position: "sticky",
          top: 116,
          zIndex: 99,
          WebkitOverflowScrolling: "touch",
          width: "100%",
          maxWidth: "100%",
          padding: "7px 8px 5px",
        }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`diary-tab${active ? " diary-tab-active" : ""}`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "7px 13px 6px",
                border: "none",
                background: active
                  ? "linear-gradient(145deg, rgba(111,166,106,.18), rgba(235,170,192,.15))"
                  : "rgba(255,255,255,.25)",
                borderRadius: 16,
                cursor: "pointer",
                color: active ? COLORS.primary : COLORS.muted,
                fontFamily: "inherit",
                flex: "0 0 auto",
                boxShadow: active ? "0 1px 10px rgba(111,166,106,.16), 0 0 0 1.5px rgba(235,170,192,.24)" : "none",
              }}
            >
              <span style={{ fontSize: 20, lineHeight: 1 }}>{tab.icon}</span>
              <span style={{
                fontSize: 11,
                fontWeight: active ? 800 : 500,
                marginTop: 4,
                whiteSpace: "nowrap",
                letterSpacing: 0.3,
                transition: "font-weight .2s",
              }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      <main
        key={activeTab}
        className="diary-fadein"
        style={{
          width: "100%",
          maxWidth: 680,
          margin: "0 auto",
          padding: "20px 14px 96px",
          overflowX: "hidden",
        }}
      >
        {renderTab()}
      </main>
    </div>
  );
}
