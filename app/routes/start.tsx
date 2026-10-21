import { useState, useEffect } from "react";
import type { Route } from "./+types/start";
import { Link } from "react-router";
import { TileGrid } from "../components/TileGrid";
import { TileReveal } from "../components/TileReveal";
import { ReadyPopup } from "../components/ReadyPopup";

type Round = 1 | 2;
type Team = "team1" | "team2";

interface SelectedTile {
  id: number;
  symbol: string;
  round: Round;
  team: Team;
  isCorrect?: boolean; // Host can mark as correct/incorrect
}

interface PuzzleData {
  tileId: number;
  round1: {
    hints: string[];
    puzzleName: string;
    hintTypes: ("text" | "image" | "audio")[];
    hintFiles: (string | null)[];
  };
  round2: {
    hints: string[];
    sequenceName: string;
    hintTypes: ("text" | "image" | "audio")[];
    hintFiles: (string | null)[];
  };
}

const STORAGE_KEY = "onlyconnect_puzzles";
const GAME_STATE_KEY = "onlyconnect_game_state";
const TEAM_NAMES_KEY = "onlyconnect_team_names";
const SFX_VOLUME_KEY = "onlyconnect_sfx_volume";
const STARTING_TEAMS_KEY = "onlyconnect_starting_teams";

type Scores = Record<Team, number>;

interface GameState {
  currentRound: Round;
  currentTeam: Team;
  selectedTiles: SelectedTile[];
  scores?: Scores;
}

interface TeamNames {
  team1: string;
  team2: string;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "OnlyKonnect - Start" },
    { name: "description", content: "Select a category to begin the Only Connect game" },
  ];
}

export default function Start() {
  const [currentRound, setCurrentRound] = useState<Round>(1);
  const [currentTeam, setCurrentTeam] = useState<Team>("team1");
  const [selectedTiles, setSelectedTiles] = useState<SelectedTile[]>([]);
  const [scores, setScores] = useState<Scores>({ team1: 0, team2: 0 });
  const [revealingTileId, setRevealingTileId] = useState<number | null>(null);
  const [showReveal, setShowReveal] = useState(false);
  const [puzzles, setPuzzles] = useState<Record<number, PuzzleData>>({});
  const [teamNames, setTeamNames] = useState<TeamNames>({ team1: "1", team2: "2" });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showReady, setShowReady] = useState(false);
  const [sfxVolume, setSfxVolume] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(SFX_VOLUME_KEY);
      return stored ? parseFloat(stored) : 0.7;
    }
    return 0.7;
  });

  useEffect(() => {
    // Load puzzles from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setPuzzles(JSON.parse(stored));
    }

    // Load team names from localStorage
    const storedTeamNames = localStorage.getItem(TEAM_NAMES_KEY);
    if (storedTeamNames) {
      setTeamNames(JSON.parse(storedTeamNames));
    }

    // Load game state from localStorage
    const storedGameState = localStorage.getItem(GAME_STATE_KEY);
    if (storedGameState) {
      const gameState: GameState = JSON.parse(storedGameState);
      setCurrentRound(gameState.currentRound);
      setCurrentTeam(gameState.currentTeam);
      setSelectedTiles(gameState.selectedTiles);
      setScores(gameState.scores ?? { team1: 0, team2: 0 });
    } else {
      // Use configured starting team for Round 1 if no saved game
      const storedTeams = localStorage.getItem(STARTING_TEAMS_KEY);
      if (storedTeams) {
        setCurrentTeam(JSON.parse(storedTeams).round1);
      }
    }
    
    // Mark initial load as complete
    setIsInitialLoad(false);
  }, []);

  // Save game state to localStorage whenever it changes (but not on initial load)
  useEffect(() => {
    if (!isInitialLoad) {
      const gameState: GameState = {
        currentRound,
        currentTeam,
        selectedTiles,
        scores,
      };
      localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));
    }
  }, [currentRound, currentTeam, selectedTiles, scores, isInitialLoad]);

  const handleAward = (team: Team, points: number) => {
    setScores(prev => ({ ...prev, [team]: Math.max(0, prev[team] + points) }));
  };

  const handleTileClick = (tileId: number, symbol: string) => {
    // Check if tile already selected in current round
    const alreadySelected = selectedTiles.some(
      t => t.id === tileId && t.round === currentRound
    );
    
    if (alreadySelected || showReveal || showReady) return;

    // Show ready popup first
    setRevealingTileId(tileId);
    setShowReady(true);
  };

  const handleReady = () => {
    setShowReady(false);
    // Now show the reveal screen
    setShowReveal(true);
  };

  const handleRevealClose = () => {
    // Add tile to selected list when reveal closes
    if (revealingTileId) {
      setSelectedTiles(prev => [
        ...prev,
        { 
          id: revealingTileId, 
          symbol: "", // Will be filled from tile data
          round: currentRound,
          team: currentTeam
        }
      ]);
      
      // Automatically switch to next team
      setCurrentTeam(prev => prev === "team1" ? "team2" : "team1");
    }
    setShowReveal(false);
    setRevealingTileId(null);
  };

  const handleNextRound = () => {
    if (currentRound === 1) {
      setCurrentRound(2);
      
      const storedTeams = localStorage.getItem(STARTING_TEAMS_KEY);
      if (storedTeams) {
        setCurrentTeam(JSON.parse(storedTeams).round2);
      } else {
        setCurrentTeam("team1");
      }
      
      // Reset selected tiles for round 2 (keep round 1 tiles for reference)
      setSelectedTiles(prev => prev.filter(t => t.round === 1));
    }
  };

  const handleNewGame = () => {
    // Clear game state
    setCurrentRound(1);
    const storedTeams = localStorage.getItem(STARTING_TEAMS_KEY);
    setCurrentTeam(storedTeams ? JSON.parse(storedTeams).round1 : "team1");
    setSelectedTiles([]);
    setScores({ team1: 0, team2: 0 });
    localStorage.removeItem(GAME_STATE_KEY);
  };

  // Listen for volume changes from GlobalSoundControls
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SFX_VOLUME_KEY && e.newValue) {
        setSfxVolume(parseFloat(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event for same-tab updates
    const handleVolumeChange = () => {
      const stored = localStorage.getItem(SFX_VOLUME_KEY);
      if (stored) {
        setSfxVolume(parseFloat(stored));
      }
    };
    
    // Custom event for same-tab updates (since storage event only fires in other tabs)
    window.addEventListener('sfxVolumeChanged', handleVolumeChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sfxVolumeChanged', handleVolumeChange);
    };
  }, []);

  const currentRoundTiles = selectedTiles.filter(t => t.round === currentRound);
  const tilesSelectedThisRound = currentRoundTiles.length;

  return (
    <div className="ok-page h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="max-w-6xl w-full h-full flex flex-col">
        {/* Top bar: back link + host status (left clear for the global sound controls) */}
        <div className="flex-shrink-0 flex flex-wrap items-center justify-end gap-3 pl-56">
          <div className="ok-panel flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 sm:gap-4">
            <span className="text-sky-600">Round {currentRound}</span>
            <span className="h-4 w-px bg-sky-200" />
            <span>{6 - tilesSelectedThisRound}/6 left</span>
            {currentRound === 1 && tilesSelectedThisRound === 6 && (
              <button
                onClick={handleNextRound}
                className="ok-btn ok-btn-green ok-btn-sm ml-1"
              >
                Start Round 2
              </button>
            )}
          </div>
          <Link to="/" className="ok-btn ok-btn-light ok-btn-sm">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Home
          </Link>
        </div>

        {/* Game Title */}
        <div className="flex-shrink-0 text-center mt-6">
          <p className="ok-kicker">Round {currentRound}</p>
          <h1 className="ok-title-3d mt-2 text-2xl md:text-4xl lg:text-5xl">
            {currentRound === 1 ? "Connections" : "Sequences"}
          </h1>
        </div>

        {/* Scoreboard: the team to play glows; small +/- for host corrections */}
        <div className="flex-shrink-0 mt-5 flex items-stretch justify-center gap-4 md:gap-8">
          {(["team1", "team2"] as Team[]).map((team) => {
            const isTurn = currentTeam === team;
            return (
              <div
                key={team}
                className={`ok-panel flex min-w-[10rem] items-center gap-4 px-4 py-2 transition ${isTurn ? "ring-4 ring-sky-300" : "opacity-80"}`}
              >
                <div className="flex-1">
                  <p className="ok-label mb-0">{isTurn ? "To play" : "Team"}</p>
                  <p className="text-base font-black text-slate-800 md:text-lg">
                    {teamNames[team] || (team === "team1" ? "1" : "2")}
                  </p>
                </div>
                <span className="ok-heading-3d text-3xl tabular-nums md:text-4xl">{scores[team]}</span>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleAward(team, 1)}
                    className="h-5 w-5 rounded-md bg-sky-50 text-xs font-black leading-none text-sky-600 hover:bg-sky-100"
                    aria-label={`Add a point for ${teamNames[team]}`}
                    title="Add a point"
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleAward(team, -1)}
                    className="h-5 w-5 rounded-md bg-sky-50 text-xs font-black leading-none text-sky-600 hover:bg-sky-100"
                    aria-label={`Remove a point from ${teamNames[team]}`}
                    title="Remove a point"
                  >
                    −
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tile Grid - Takes remaining space */}
        <div className="flex-1 flex items-center justify-center min-h-0 mb-2">
          <TileGrid
            onTileClick={handleTileClick}
            selectedTileIds={currentRoundTiles.map(t => t.id)}
            disabled={showReveal}
            sfxVolume={sfxVolume}
          />
        </div>

        {/* Bottom Text - Smaller */}
        <div className="flex-shrink-0 text-center">
          <p className="ok-kicker text-sky-600/70">
            Select a hieroglyph
          </p>
        </div>

        {/* Reveal Modal */}
        {showReveal && revealingTileId && (() => {
          const puzzle = puzzles[revealingTileId];
          const hints = currentRound === 1 
            ? (puzzle?.round1.hints || [])
            : (puzzle?.round2.hints || []);
          const hintTypes = currentRound === 1
            ? (puzzle?.round1.hintTypes || [])
            : (puzzle?.round2.hintTypes || []);
          const hintFiles = currentRound === 1
            ? (puzzle?.round1.hintFiles || [])
            : (puzzle?.round2.hintFiles || []);
          const puzzleName = currentRound === 1 ? puzzle?.round1.puzzleName : undefined;
          const sequenceName = currentRound === 2 ? puzzle?.round2.sequenceName : undefined;
          
          return (
            <TileReveal
              tileId={revealingTileId}
              round={currentRound}
              onClose={handleRevealClose}
              onAward={handleAward}
              currentTeam={currentTeam}
              teamNames={teamNames}
              hints={hints}
              hintTypes={hintTypes}
              hintFiles={hintFiles}
              puzzleName={puzzleName}
              sequenceName={sequenceName}
              sfxVolume={sfxVolume}
            />
          );
        })()}
        
        {/* Ready Popup */}
        {showReady && revealingTileId && (
          <ReadyPopup onReady={handleReady} sfxVolume={sfxVolume} />
        )}
        
      </div>
    </div>
  );
}
