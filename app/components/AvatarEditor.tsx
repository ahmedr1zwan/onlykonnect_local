import { useEffect, useState } from "react";
import {
  Avatar,
  BROW_STYLES,
  EYE_COLORS,
  EYE_STYLES,
  FACE_SHAPES,
  FACIAL_HAIR_STYLES,
  GLASSES_STYLES,
  HAIR_COLORS,
  HAIR_STYLES,
  MOUTH_STYLES,
  NOSE_STYLES,
  SHIRT_COLORS,
  SKIN_TONES,
  randomAvatar,
  type AvatarConfig,
} from "./Avatar";
import type { Person } from "../utils/lineup";

type Row =
  | { part: keyof AvatarConfig; label: string; options: string[] }
  | { part: keyof AvatarConfig; label: string; colors: string[] };

const TABS: { id: string; label: string; rows: Row[] }[] = [
  {
    id: "face",
    label: "Face",
    rows: [
      { part: "face", label: "Shape", options: FACE_SHAPES },
      { part: "skin", label: "Skin tone", colors: SKIN_TONES },
    ],
  },
  {
    id: "hair",
    label: "Hair",
    rows: [
      { part: "hair", label: "Style", options: HAIR_STYLES },
      { part: "hairColor", label: "Colour", colors: HAIR_COLORS },
    ],
  },
  {
    id: "eyes",
    label: "Eyes",
    rows: [
      { part: "eyes", label: "Eyes", options: EYE_STYLES },
      { part: "eyeColor", label: "Eye colour", colors: EYE_COLORS },
      { part: "brows", label: "Eyebrows", options: BROW_STYLES },
    ],
  },
  {
    id: "mouth",
    label: "Nose & mouth",
    rows: [
      { part: "nose", label: "Nose", options: NOSE_STYLES },
      { part: "mouth", label: "Mouth", options: MOUTH_STYLES },
    ],
  },
  {
    id: "extras",
    label: "Extras",
    rows: [
      { part: "facialHair", label: "Facial hair", options: FACIAL_HAIR_STYLES },
      { part: "glasses", label: "Glasses", options: GLASSES_STYLES },
    ],
  },
  {
    id: "shirt",
    label: "Shirt",
    rows: [{ part: "shirt", label: "Shirt colour", colors: SHIRT_COLORS }],
  },
];

interface AvatarEditorProps {
  person: Person;
  heading: string;
  onSave: (person: Person) => void;
  onClose: () => void;
}

// Mii-style editor: tabs of parts, each choice shown as a mini preview of the avatar itself
export function AvatarEditor({ person, heading, onSave, onClose }: AvatarEditorProps) {
  const [draft, setDraft] = useState<Person>(person);
  const [tab, setTab] = useState(TABS[0].id);
  const activeTab = TABS.find((t) => t.id === tab) ?? TABS[0];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const setPart = (part: keyof AvatarConfig, value: number) =>
    setDraft((d) => ({ ...d, avatar: { ...d.avatar, [part]: value } }));

  return (
    <div
      className="ok-modal-backdrop fixed inset-0 z-[10001] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Edit avatar: ${heading}`}
    >
      <div
        className="ok-panel flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-sky-100 px-5 py-3">
          <div>
            <p className="ok-kicker">Avatar</p>
            <h2 className="ok-heading-3d text-xl">{heading}</h2>
          </div>
          <button onClick={onClose} className="ok-btn ok-btn-light ok-btn-sm" aria-label="Close without saving">
            ✕
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-5 md:grid-cols-[220px_1fr]">
          {/* Live preview */}
          <div className="flex flex-col items-center gap-3">
            <div className="ok-avatar-disc h-48 w-48">
              <Avatar config={draft.avatar} className="h-full w-full" title={draft.name} />
            </div>
            <label className="w-full">
              <span className="ok-label">Name</span>
              <input
                type="text"
                value={draft.name}
                maxLength={40}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                className="ok-input"
                placeholder="Name"
              />
            </label>
            <button
              onClick={() => setDraft((d) => ({ ...d, avatar: randomAvatar() }))}
              className="ok-btn ok-btn-light ok-btn-sm w-full"
            >
              🎲 Randomise
            </button>
          </div>

          {/* Part pickers */}
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2" role="tablist">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={t.id === tab}
                  onClick={() => setTab(t.id)}
                  className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider transition ${t.id === tab ? "bg-sky-500 text-white shadow" : "bg-sky-50 text-sky-700 hover:bg-sky-100"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-5">
              {activeTab.rows.map((row) => (
                <div key={row.part}>
                  <p className="ok-label">{row.label}</p>
                  {"colors" in row ? (
                    <div className="flex flex-wrap gap-2">
                      {row.colors.map((color, i) => (
                        <button
                          key={color}
                          onClick={() => setPart(row.part, i)}
                          className={`h-9 w-9 rounded-full border-2 shadow-sm transition hover:scale-110 ${draft.avatar[row.part] === i ? "border-sky-500 ring-4 ring-sky-200" : "border-white"}`}
                          style={{ background: color }}
                          aria-label={`${row.label} ${i + 1}`}
                          aria-pressed={draft.avatar[row.part] === i}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {row.options.map((name, i) => (
                        <button
                          key={name}
                          onClick={() => setPart(row.part, i)}
                          title={name}
                          aria-label={name}
                          aria-pressed={draft.avatar[row.part] === i}
                          className={`ok-avatar-disc h-14 w-14 transition hover:-translate-y-0.5 ${draft.avatar[row.part] === i ? "ring-4 ring-sky-300" : ""}`}
                        >
                          <Avatar config={{ ...draft.avatar, [row.part]: i }} crop="head" className="h-full w-full" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-sky-100 px-5 py-3">
          <button onClick={onClose} className="ok-btn ok-btn-light ok-btn-sm">
            Cancel
          </button>
          <button onClick={() => onSave(draft)} className="ok-btn ok-btn-sm">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
