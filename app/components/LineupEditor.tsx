import { useState } from "react";
import { Avatar, randomAvatar } from "./Avatar";
import { AvatarEditor } from "./AvatarEditor";
import { MAX_PLAYERS, MIN_PLAYERS, type Lineup, type Person } from "../utils/lineup";

type Team = "team1" | "team2";
type Slot = { kind: "host" } | { kind: "player"; team: Team; index: number };

interface LineupEditorProps {
  lineup: Lineup;
  teamNames: Record<Team, string>;
  onLineupChange: (lineup: Lineup) => void;
  onTeamNameChange: (team: Team, name: string) => void;
}

function AvatarButton({ person, onClick, size = "h-14 w-14" }: { person: Person; onClick: () => void; size?: string }) {
  return (
    <button
      onClick={onClick}
      className={`ok-avatar-disc group ${size} transition hover:-translate-y-0.5`}
      title="Edit avatar"
      aria-label={`Edit avatar for ${person.name || "this person"}`}
    >
      <Avatar config={person.avatar} crop="head" className="h-full w-full" />
      <span className="absolute inset-0 flex items-end justify-center bg-sky-900/0 pb-1 text-[0.55rem] font-black uppercase tracking-wider text-white opacity-0 transition group-hover:bg-sky-900/25 group-hover:opacity-100">
        Edit
      </span>
    </button>
  );
}

// "Host & Teams" section of the Game Creator: names, player counts and avatars
export function LineupEditor({ lineup, teamNames, onLineupChange, onTeamNameChange }: LineupEditorProps) {
  const [editing, setEditing] = useState<Slot | null>(null);

  const personAt = (slot: Slot): Person =>
    slot.kind === "host" ? lineup.host : lineup[slot.team][slot.index];

  const updatePerson = (slot: Slot, person: Person) => {
    if (slot.kind === "host") {
      onLineupChange({ ...lineup, host: person });
    } else {
      const players = lineup[slot.team].map((p, i) => (i === slot.index ? person : p));
      onLineupChange({ ...lineup, [slot.team]: players });
    }
  };

  const addPlayer = (team: Team) => {
    if (lineup[team].length >= MAX_PLAYERS) return;
    const players = [...lineup[team], { name: `Player ${lineup[team].length + 1}`, avatar: randomAvatar() }];
    onLineupChange({ ...lineup, [team]: players });
  };

  const removePlayer = (team: Team, index: number) => {
    if (lineup[team].length <= MIN_PLAYERS) return;
    onLineupChange({ ...lineup, [team]: lineup[team].filter((_, i) => i !== index) });
  };

  const editingHeading = editing
    ? editing.kind === "host"
      ? "Host"
      : `${teamNames[editing.team] || (editing.team === "team1" ? "Team 1" : "Team 2")} · ${editing.index === 0 ? "Captain" : `Player ${editing.index + 1}`}`
    : "";

  return (
    <section className="mb-8">
      <h2 className="ok-heading-3d mb-4 text-xl">Host & Teams</h2>
      <div className="grid gap-5 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)]">
        {/* Host */}
        <div className="ok-panel flex flex-col items-center gap-3 p-4 text-center">
          <span className="ok-label mb-0">Your host</span>
          <AvatarButton person={lineup.host} onClick={() => setEditing({ kind: "host" })} size="h-24 w-24" />
          <input
            type="text"
            value={lineup.host.name}
            maxLength={40}
            onChange={(e) => updatePerson({ kind: "host" }, { ...lineup.host, name: e.target.value })}
            className="ok-input py-1.5 text-center text-sm font-bold"
            placeholder="Host name"
            aria-label="Host name"
          />
        </div>

        {/* Teams */}
        {(["team1", "team2"] as Team[]).map((team, t) => (
          <div key={team} className="ok-panel p-4">
            <label>
              <span className="ok-label">Team {t + 1} name</span>
              <input
                type="text"
                value={teamNames[team]}
                onChange={(e) => onTeamNameChange(team, e.target.value)}
                className="ok-input py-1.5 text-sm font-bold"
                placeholder={`Team ${t + 1}`}
              />
            </label>

            <ul className="mt-3 space-y-2">
              {lineup[team].map((player, index) => (
                <li key={index} className="flex items-center gap-3">
                  <AvatarButton person={player} onClick={() => setEditing({ kind: "player", team, index })} />
                  <div className="min-w-0 flex-1">
                    <span className="ok-label mb-0.5">{index === 0 ? "Captain" : `Player ${index + 1}`}</span>
                    <input
                      type="text"
                      value={player.name}
                      maxLength={40}
                      onChange={(e) => updatePerson({ kind: "player", team, index }, { ...player, name: e.target.value })}
                      className="ok-input py-1 text-sm"
                      placeholder="Player name"
                      aria-label={`Team ${t + 1} player ${index + 1} name`}
                    />
                  </div>
                  <button
                    onClick={() => removePlayer(team, index)}
                    disabled={lineup[team].length <= MIN_PLAYERS}
                    className="h-7 w-7 rounded-lg text-sm font-black text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:invisible"
                    aria-label={`Remove ${player.name || "player"}`}
                    title="Remove player"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            {lineup[team].length < MAX_PLAYERS && (
              <button onClick={() => addPlayer(team)} className="ok-btn ok-btn-light ok-btn-sm mt-3 w-full">
                + Add player
              </button>
            )}
          </div>
        ))}
      </div>

      {editing && (
        <AvatarEditor
          person={personAt(editing)}
          heading={editingHeading}
          onClose={() => setEditing(null)}
          onSave={(person) => {
            updatePerson(editing, person);
            setEditing(null);
          }}
        />
      )}
    </section>
  );
}
