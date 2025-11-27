import { TileButton } from "./TileButton";
import { TwoReeds, Lion, TwistedFlax, HornedViper, Water, EyeOfHorus } from "./Hieroglyphs";

const tiles = [
  { id: 1, symbol: "Two Reeds", icon: TwoReeds },
  { id: 2, symbol: "Lion", icon: Lion },
  { id: 3, symbol: "Twisted Flax", icon: TwistedFlax },
  { id: 4, symbol: "Horned Viper", icon: HornedViper },
  { id: 5, symbol: "Water", icon: Water },
  { id: 6, symbol: "Eye of Horus", icon: EyeOfHorus },
];

interface TileGridProps {
  onTileClick: (tileId: number, symbol: string) => void;
  selectedTileIds: number[];
  disabled?: boolean;
}

export function TileGrid({ onTileClick, selectedTileIds, disabled = false }: TileGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-16 w-full max-w-6xl mx-auto px-4">
      {tiles.map((tile) => {
        const isSelected = selectedTileIds.includes(tile.id);
        
        if (isSelected) {
          // Show empty placeholder for selected/removed tiles - maintain rectangular aspect
          return <div key={tile.id} className="aspect-[5/4]" />;
        }
        
        // Show actual tile button for available tiles
        return (
          <TileButton
            key={tile.id}
            symbol={tile.symbol}
            Icon={tile.icon}
            onClick={() => onTileClick(tile.id, tile.symbol)}
            disabled={disabled}
          />
        );
      })}
    </div>
  );
}

