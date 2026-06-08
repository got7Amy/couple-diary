// @ts-nocheck
import { useEffect, useState } from "react";
import type { CSSProperties, Dispatch, SetStateAction } from "react";

// ─── Palette & helpers ────────────────────────────────────────────────────────
const COLORS = {
  bg: "#FFF6F2",
  card: "#FFFFFF",
  primary: "#E8735A",
  secondary: "#F4A88A",
  accent: "#D45B42",
  soft: "#FDE8E0",
  muted: "#9B7B72",
  text: "#3D2218",
  light: "#FFF0EA",
  green: "#68AE7E",
  blue: "#6898B8",
  yellow: "#EEB848",
  purple: "#A48FC0",
  danger: "#D9534F",
};

// Gradient presets for buttons (keyed by flat color)
const BTN_GRADIENTS: Record<string, string> = {
  [COLORS.primary]:   "linear-gradient(140deg, #EE8068 0%, #DF6A50 100%)",
  [COLORS.secondary]: "linear-gradient(140deg, #F8B898 0%, #EFA070 100%)",
  [COLORS.green]:     "linear-gradient(140deg, #7AC28E 0%, #58A070 100%)",
  [COLORS.blue]:      "linear-gradient(140deg, #7AAAC8 0%, #5888B0 100%)",
  [COLORS.yellow]:    "linear-gradient(140deg, #F8CC68 0%, #E4A830 100%)",
  [COLORS.purple]:    "linear-gradient(140deg, #BCA8D8 0%, #9880B8 100%)",
  [COLORS.danger]:    "linear-gradient(140deg, #E86868 0%, #C84040 100%)",
  [COLORS.muted]:     "linear-gradient(140deg, #B09088 0%, #9B7B72 100%)",
  [COLORS.accent]:    "linear-gradient(140deg, #DC7060 0%, #C85040 100%)",
};

type TabId =
  | "diary"
  | "success"
  | "fiveYear"
  | "reading"
  | "checkin"
  | "schedule"
  | "shopping"
  | "reminder"
  | "whisper"
  | "jokes"
  | "calendar"
  | "wishes";

const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: "diary",    icon: "📖", label: "心情日记" },
  { id: "success",  icon: "🏆", label: "成功日记" },
  { id: "fiveYear", icon: "📚", label: "五年日记" },
  { id: "reading",  icon: "📕", label: "读书" },
  { id: "checkin",  icon: "✅", label: "打卡" },
  { id: "schedule", icon: "🗓", label: "本周计划" },
  { id: "shopping", icon: "🛒", label: "购物清单" },
  { id: "reminder", icon: "🔔", label: "提醒他" },
  { id: "whisper",  icon: "💌", label: "悄悄话" },
  { id: "jokes",    icon: "😂", label: "笑话库" },
  { id: "calendar", icon: "📅", label: "日历" },
  { id: "wishes",   icon: "✨", label: "愿望清单" },
];

const today = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
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

type ReminderEntry = BaseItem & {
  content: string;
  urgency: string;
  date: string;
  done: boolean;
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
      background: ${COLORS.bg};
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
      background: rgba(232, 115, 90, .22);
      color: #3D2218;
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
      box-shadow: 0 0 0 3.5px rgba(232, 115, 90, .18) !important;
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
      box-shadow: 0 4px 32px rgba(61,34,24,.13), 0 1px 4px rgba(61,34,24,.07), 0 0 0 1px rgba(240,190,170,.22) !important;
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
      background: "linear-gradient(175deg, #ffffff 0%, #fffaf8 100%)",
      borderRadius: 22,
      padding: "18px 20px",
      boxShadow:
        "0 1px 2px rgba(61,34,24,.04), 0 4px 20px rgba(61,34,24,.08), 0 0 0 1px rgba(240,190,170,.16)",
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
    border: `1.5px solid rgba(232, 185, 165, .65)`,
    padding: "12px 16px",
    fontSize: 16,
    fontFamily: "inherit",
    background: "rgba(255, 248, 244, .7)",
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
    background: "linear-gradient(160deg, rgba(255,246,242,.9) 0%, rgba(255,255,255,.7) 100%)",
    borderRadius: 22,
    border: "1.5px dashed rgba(232,115,90,.2)",
    marginBottom: 14,
  }}>
    <div className="diary-float" style={{ fontSize: 52, marginBottom: 16, filter: "drop-shadow(0 4px 12px rgba(232,115,90,.2))" }}>{emoji}</div>
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
        placeholder="标题（今天发生了什么？）"
        style={{ marginBottom: 10 }}
      />
      <Input
        value={form.content}
        onChange={(v) => setForm((p) => ({ ...p, content: v }))}
        placeholder="详细说说～"
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
        title: cleanedTitle || "心情日记",
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
              title: cleanedTitle || "心情日记",
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
      <span style={{ height: 1, flex: 1, background: "rgba(232,115,90,.22)" }} />
      <span>{year}</span>
      <span style={{ height: 1, flex: 1, background: "rgba(232,115,90,.22)" }} />
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 18 }}>
        <h2 style={{ margin: 0, color: COLORS.text, fontSize: 22, fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-flex", width: 4, height: 22, borderRadius: 4, background: COLORS.primary, flexShrink: 0 }} />
          心情日记 📖
        </h2>
        <Btn onClick={() => setAdding(!adding)} small>
          {adding ? "取消" : "+ 写日记"}
        </Btn>
      </div>

      {adding && (
        <Card style={{ border: `2px solid ${COLORS.secondary}` }}>
          <DiaryFields form={form} setForm={setForm} />
          <FormActions onSave={save} onCancel={() => setAdding(false)} saveText="保存这篇日记 💕" />
        </Card>
      )}

      {sorted.length === 0 && !adding && <EmptyState emoji="📖" text="还没有日记，快记录第一篇吧～" />}

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
            成功日记 🏆
          </h2>
          <div style={{ marginTop: 5, color: COLORS.muted, fontSize: 13, lineHeight: 1.6, paddingLeft: 12 }}>
            只记录事实：我做了，它存在。再小也算数。
          </div>
        </div>
        <Btn onClick={() => setAdding(!adding)} small color={COLORS.green}>
          {adding ? "取消" : "+ 记一件小成功"}
        </Btn>
      </div>

      <Card style={{ border: `2px solid ${COLORS.green}`, background: "linear-gradient(160deg, #FFFFFF 0%, #F4FFF6 100%)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10 }}>
          <div style={{ background: "rgba(104,174,126,.1)", borderRadius: 18, padding: "12px", textAlign: "center" }}>
            <div style={{ color: COLORS.green, fontSize: 26, fontWeight: 900 }}>{todayEntries.length}</div>
            <div style={{ color: COLORS.muted, fontSize: 13, fontWeight: 800 }}>今天的小成功</div>
          </div>
          <div style={{ background: "rgba(232,115,90,.1)", borderRadius: 18, padding: "12px", textAlign: "center" }}>
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
          <FormActions onSave={save} onCancel={() => setAdding(false)} saveText="收进证据库 🏆" color={COLORS.green} />
        </Card>
      )}

      {data.length === 0 && !adding && <EmptyState emoji="🏆" text="还没有成功日记。先写一件小到不能再小的事：你做了，它就算。" />}

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
          笑话库 😂
        </h2>
        <Btn onClick={() => setAdding(!adding)} small>
          {adding ? "取消" : "+ 记笑话"}
        </Btn>
      </div>

      {adding && (
        <Card style={{ border: `2px solid ${COLORS.yellow}` }}>
          {Fields({ value: form, setValue: setForm })}
          <FormActions onSave={save} onCancel={() => setAdding(false)} saveText="收进笑话库 😄" color={COLORS.yellow} />
        </Card>
      )}

      {data.length === 0 && !adding && <EmptyState emoji="😂" text="还没有笑话，赶紧记下你们的专属笑点吧！" />}

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
        日历记录 📅
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
                  boxShadow: isSelected ? "0 2px 8px rgba(232,112,86,.28)" : "none",
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
        placeholder="想对TA说的悄悄话…"
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
          悄悄话 💌
        </h2>
        <Btn onClick={() => setAdding(!adding)} small color={COLORS.purple}>
          {adding ? "取消" : "+ 写悄悄话"}
        </Btn>
      </div>

      {adding && (
        <Card style={{ border: `2px solid ${COLORS.purple}` }}>
          {Fields({ value: form, setValue: setForm })}
          <FormActions onSave={save} onCancel={() => setAdding(false)} saveText="偷偷放进信箱 🤫" color={COLORS.purple} />
        </Card>
      )}

      {data.length === 0 && !adding && <EmptyState emoji="💌" text="还没有悄悄话，写下只属于你们的秘密吧～" />}

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
                    这是一条悄悄话…
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
          愿望清单 ✨
        </h2>
        <Btn onClick={() => setAdding(!adding)} small color={COLORS.yellow} style={{ color: COLORS.text }}>
          {adding ? "取消" : "+ 许愿"}
        </Btn>
      </div>

      {adding && (
        <Card style={{ border: `2px solid ${COLORS.yellow}` }}>
          {Fields({ value: form, setValue: setForm })}
          <FormActions onSave={save} onCancel={() => setAdding(false)} saveText="许下这个愿望 🌙" color={COLORS.yellow} />
        </Card>
      )}

      {data.length === 0 && !adding && <EmptyState emoji="✨" text="还没有愿望，快写下你们的心愿吧！" />}

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
          本周计划 🗓
        </h2>
        <Btn onClick={() => setAdding(!adding)} small color={COLORS.blue}>
          {adding ? "取消" : "+ 加计划"}
        </Btn>
      </div>

      {adding && (
        <Card style={{ border: `2px solid ${COLORS.blue}` }}>
          {Fields({ value: form, setValue: setForm })}
          <FormActions onSave={save} onCancel={() => setAdding(false)} saveText="加入本周 📅" color={COLORS.blue} />
        </Card>
      )}

      {data.length === 0 && !adding && <EmptyState emoji="🗓" text="本周还没有计划，安排起来吧！" />}

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

// ─── Reminder ─────────────────────────────────────────────────────────────────
function ReminderTab({ data, setData }: { data: ReminderEntry[]; setData: Setter<ReminderEntry[]> }) {
  const blank = { content: "", urgency: "普通", date: "" };
  const [form, setForm] = useState(blank);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(blank);

  const URGENCY = ["紧急","普通","随时"];
  const URGENCY_COLOR: Record<string, string> = { 紧急: "#FFE0E0", 普通: COLORS.light, 随时: "#E8F5E8" };
  const URGENCY_DOT: Record<string, string> = { 紧急: "#FF6B6B", 普通: COLORS.primary, 随时: COLORS.green };

  const save = () => {
    if (!form.content.trim()) return;
    setData((prev) => [{ id: uid(), createdAt: now(), done: false, ...form }, ...prev]);
    setForm(blank);
    setAdding(false);
  };

  const saveEdit = () => {
    if (!editId || !editForm.content.trim()) return;
    setData((prev) =>
      prev.map((r) => (r.id === editId ? { ...r, ...editForm, updatedAt: now() } : r))
    );
    setEditId(null);
  };

  const toggle = (id: string) =>
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, done: !r.done, updatedAt: now() } : r)));

  const Fields = ({ value, setValue }: { value: typeof blank; setValue: Setter<typeof blank> }) => (
    <>
      <Input value={value.content} onChange={(v) => setValue((p) => ({ ...p, content: v }))} placeholder="要提醒他的事…" style={{ marginBottom: 10 }} />
      <Input value={value.date} onChange={(v) => setValue((p) => ({ ...p, date: v }))} placeholder="提醒时间（可选）" style={{ marginBottom: 10 }} />
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {URGENCY.map((u) => (
          <span key={u} onClick={() => setValue((p) => ({ ...p, urgency: u }))}
            style={{ padding: "6px 14px", borderRadius: 999, background: value.urgency === u ? COLORS.primary : COLORS.light, color: value.urgency === u ? "#fff" : COLORS.muted, cursor: "pointer", fontSize: 14, fontWeight: 800, transition: "background .15s" }}>
            {u}
          </span>
        ))}
      </div>
    </>
  );

  const ReminderCard = ({ r }: { r: ReminderEntry }) => (
    <Card style={{ background: URGENCY_COLOR[r.urgency], borderLeft: `4px solid ${URGENCY_DOT[r.urgency]}`, opacity: r.done ? 0.65 : 1 }}>
      {editId === r.id ? (
        <>
          {Fields({ value: editForm, setValue: setEditForm })}
          <FormActions onSave={saveEdit} onCancel={() => setEditId(null)} saveText="保存修改" />
        </>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div
              onClick={() => toggle(r.id)}
              style={{
                width: 24, height: 24, borderRadius: "50%",
                border: r.done ? "none" : `2px solid ${URGENCY_DOT[r.urgency]}`,
                background: r.done ? COLORS.green : "transparent",
                cursor: "pointer", flexShrink: 0, marginTop: 2,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background .2s",
              }}
            >
              {r.done && <span style={{ color: "#fff", fontSize: 13 }}>✓</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, color: COLORS.text, marginBottom: 4, textDecoration: r.done ? "line-through" : "none", wordBreak: "break-word" }}>{r.content}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Tag color={URGENCY_COLOR[r.urgency]}>{r.urgency}</Tag>
                {r.date && <span style={{ fontSize: 13, color: COLORS.muted }}>{r.date}</span>}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <ActionButtons
              onEdit={() => {
                setEditId(r.id);
                setEditForm({ content: r.content, urgency: r.urgency, date: r.date });
              }}
              onDelete={() => {
                if (confirmDelete()) setData((prev) => prev.filter((x) => x.id !== r.id));
              }}
            />
          </div>
        </>
      )}
    </Card>
  );

  const todo = data.filter((r) => !r.done);
  const done = data.filter((r) => r.done);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 18 }}>
        <h2 style={{ margin: 0, color: COLORS.text, fontSize: 22, fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-flex", width: 4, height: 22, borderRadius: 4, background: COLORS.primary, flexShrink: 0 }} />
          提醒他 🔔
        </h2>
        <Btn onClick={() => setAdding(!adding)} small>
          {adding ? "取消" : "+ 加提醒"}
        </Btn>
      </div>

      {adding && (
        <Card style={{ border: `2px solid ${COLORS.secondary}` }}>
          {Fields({ value: form, setValue: setForm })}
          <FormActions onSave={save} onCancel={() => setAdding(false)} saveText="保存提醒 🔔" />
        </Card>
      )}

      {data.length === 0 && !adding && <EmptyState emoji="🔔" text="还没有提醒，记下要告诉TA的重要事项吧～" />}

      {todo.map((r) => <div key={r.id}>{ReminderCard({ r })}</div>)}

      {done.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 15, color: COLORS.muted, fontWeight: 900, marginBottom: 8 }}>已完成</div>
          {done.map((r) => <div key={r.id}>{ReminderCard({ r })}</div>)}
        </div>
      )}
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
          打卡 ✅
        </h2>
        <Btn onClick={() => setAdding(!adding)} small color={COLORS.green}>
          {adding ? "取消" : "+ 添加项目"}
        </Btn>
      </div>

      {adding && (
        <Card style={{ border: `2px solid ${COLORS.green}` }}>
          <Input value={name} onChange={setName} placeholder="项目名称，比如：早睡、运动、读书" style={{ marginBottom: 12 }} />
          <FormActions onSave={addProject} onCancel={() => setAdding(false)} saveText="添加项目" color={COLORS.green} />
        </Card>
      )}

      {sorted.length === 0 && !adding && <EmptyState emoji="✅" text="还没有打卡项目，先添加一个想坚持的小目标吧～" />}

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
                {checkedToday ? "今天已完成 ✓" : "打卡 ✅"}
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
                <RewardFields value={rewardForm} setValue={setRewardForm} />
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
                            <RewardFields value={editRewardForm} setValue={setEditRewardForm} />
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
          购物清单 🛒
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
          <FormActions onSave={save} onCancel={() => setAdding(false)} saveText="加入清单 🛒" color={COLORS.green} />
        </Card>
      )}

      {data.length === 0 && !adding && <EmptyState emoji="🛒" text="购物清单还是空的，先加一个要买的东西吧～" />}

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
            五年日记 📚
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
                  <span style={{ color: COLORS.muted, fontSize: 13 }}>只保存在五年日记，不会出现在心情日记列表里。</span>
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
                    <strong style={{ color: COLORS.text, fontSize: 16, wordBreak: "break-word" }}>成功日记</strong>
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
                  <strong style={{ color: COLORS.text, fontSize: 16, wordBreak: "break-word" }}>{entry.title || "心情日记"}</strong>
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
            读书记录 📕
          </h2>
          <div style={{ marginTop: 5, color: COLORS.muted, fontSize: 13, lineHeight: 1.6, paddingLeft: 12 }}>
            正在读、想读、已读完分开收纳；已读完会自动按年月归档。
          </div>
        </div>
        <Btn onClick={() => setAdding(!adding)} small color={COLORS.green}>
          {adding ? "取消" : "+ 加一本书"}
        </Btn>
      </div>

      {adding && (
        <Card style={{ border: `2px solid ${COLORS.green}` }}>
          {Fields({ value: form, setValue: setForm })}
          <FormActions onSave={save} onCancel={resetAddForm} saveText="保存这本书" color={COLORS.green} />
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
  const [reminders, setReminders] = useLocalStorage<ReminderEntry[]>("couple-diary-reminders-v2", []);
  const [fiveYearDiary, setFiveYearDiary] = useLocalStorage<FiveYearDiaryData>("couple-diary-five-year-v1", {});
  const [fiveYearPhotos, setFiveYearPhotos] = useLocalStorage<FiveYearPhotosData>("couple-diary-fiveyear-photos-v1", {});
  const [readingBooks, setReadingBooks] = useLocalStorage<ReadingBookEntry[]>("couple-diary-reading-v1", []);
  const [successEntries, setSuccessEntries] = useLocalStorage<SuccessEntry[]>("couple-diary-success-v1", []);

  const renderTab = () => {
    switch (activeTab) {
      case "diary":    return <DiaryTab    data={diary}        setData={setDiary} />;
      case "success":  return <SuccessDiaryTab data={successEntries} setData={setSuccessEntries} />;
      case "fiveYear": return <FiveYearDiaryTab data={fiveYearDiary} setData={setFiveYearDiary} diary={diary} setDiary={setDiary} successEntries={successEntries} photos={fiveYearPhotos} setPhotos={setFiveYearPhotos} />;
      case "reading":  return <ReadingTab  data={readingBooks} setData={setReadingBooks} />;
      case "checkin":  return <CheckinTab  data={checkins}     setData={setCheckins} />;
      case "schedule": return <ScheduleTab data={schedule}     setData={setSchedule} />;
      case "shopping": return <ShoppingTab data={shopping}     setData={setShopping} />;
      case "reminder": return <ReminderTab data={reminders}    setData={setReminders} />;
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
        background: COLORS.bg,
        fontFamily: "'PingFang SC', 'Noto Serif SC', 'STSong', 'Georgia', 'Microsoft YaHei', serif",
        fontSize: 17,
        color: COLORS.text,
      }}
    >
      <GlobalStyle />

      {/* ── Header ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #B84830 0%, #D96045 25%, #E87858 55%, #F09870 80%, #F8B890 100%)",
          padding: "20px 20px 18px",
          textAlign: "center",
          position: "sticky",
          top: 0,
          zIndex: 100,
          width: "100%",
          maxWidth: "100%",
          boxShadow: "0 2px 28px rgba(184, 72, 48, .35)",
        }}
      >
        <div style={{
          fontSize: 10,
          color: "rgba(255,255,255,.65)",
          letterSpacing: 5,
          marginBottom: 3,
          textTransform: "uppercase",
          fontWeight: 700,
        }}>
          OUR LITTLE WORLD
        </div>
        <h1 style={{
          margin: 0,
          color: "#fff",
          fontSize: 26,
          fontWeight: 900,
          letterSpacing: 0.5,
          textShadow: "0 2px 14px rgba(0,0,0,.2)",
          lineHeight: 1.3,
        }}>
          ❤️ 我的日记本
        </h1>
        <div style={{
          marginTop: 4,
          fontSize: 11,
          color: "rgba(255,255,255,.55)",
          letterSpacing: 1,
          fontWeight: 500,
        }}>
          {new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div
        className="hide-scrollbar"
        style={{
          display: "flex",
          overflowX: "auto",
          overflowY: "hidden",
          gap: 2,
          background: "rgba(255,252,250,.97)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(240,195,175,.4)",
          position: "sticky",
          top: 88,
          zIndex: 99,
          WebkitOverflowScrolling: "touch",
          width: "100%",
          maxWidth: "100%",
          padding: "6px 6px 4px",
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
                padding: "6px 13px 5px",
                border: "none",
                background: active
                  ? "linear-gradient(145deg, rgba(232,112,86,.18), rgba(244,168,138,.11))"
                  : "transparent",
                borderRadius: 14,
                cursor: "pointer",
                color: active ? COLORS.primary : COLORS.muted,
                fontFamily: "inherit",
                flex: "0 0 auto",
                boxShadow: active ? "0 1px 10px rgba(232,112,86,.16), 0 0 0 1.5px rgba(232,112,86,.15)" : "none",
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
