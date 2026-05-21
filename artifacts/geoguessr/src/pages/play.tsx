import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useCreateGame, useGetGame, useSubmitGuess, getGetGameQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, MapPin, Target, Crosshair, Map as MapIcon, ArrowRight } from "lucide-react";
import GameMap from "@/components/game-map";

export default function Play() {
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  // Game state
  const [gameId, setGameId] = useState<number | null>(null);
  const [guessCoords, setGuessCoords] = useState<{lat: number, lng: number} | null>(null);
  const [guessResult, setGuessResult] = useState<any>(null); // To store the result of the current round
  
  // Mutations & Queries
  const createGame = useCreateGame();
  const submitGuess = useSubmitGuess();
  
  const { data: game, isLoading: isGameLoading, refetch: refetchGame } = useGetGame(gameId as number, { 
    query: { 
      enabled: !!gameId,
      queryKey: getGetGameQueryKey(gameId as number)
    } 
  });

  // Start game on mount
  useEffect(() => {
    createGame.mutate({ data: { rounds: 5 } }, {
      onSuccess: (newGame) => {
        setGameId(newGame.id);
      }
    });
  }, []);

  // Handle guess submission
  const handleGuessSubmit = () => {
    if (!gameId || !guessCoords) return;
    
    submitGuess.mutate({
      id: gameId,
      data: { lat: guessCoords.lat, lng: guessCoords.lng }
    }, {
      onSuccess: (result) => {
        setGuessResult(result);
        // Refresh game state slightly after to update score
        refetchGame();
      }
    });
  };

  // Handle next round
  const handleNextRound = () => {
    if (!game || !guessResult) return;
    
    if (game.status === 'finished' || guessResult.gameComplete) {
      setLocation(`/results/${game.id}`);
      return;
    }
    
    // Reset local round state and fetch next photo
    setGuessCoords(null);
    setGuessResult(null);
    refetchGame();
  };

  if (!gameId || isGameLoading && !game) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-mono text-muted-foreground uppercase tracking-widest">Initializing Uplink...</h2>
      </div>
    );
  }

  const isRoundOver = !!guessResult;

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-background overflow-hidden">
      {/* LEFT PANEL: The Photo */}
      <div className="flex-1 relative bg-black flex flex-col">
        {game?.currentPhotoUrl ? (
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${game.currentPhotoUrl})` }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground font-mono">
            No image data available.
          </div>
        )}
        
        {/* Top HUD */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-none">
          <div className="bg-background/80 backdrop-blur-md border border-border px-4 py-2 rounded-md shadow-lg pointer-events-auto flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Round</span>
              <span className="font-display text-xl leading-none font-bold text-primary">{game?.currentRound} / {game?.rounds}</span>
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Score</span>
              <span className="font-display text-xl leading-none font-bold text-foreground">{game?.totalScore || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Map & Controls */}
      <div className="w-full md:w-[400px] lg:w-[500px] h-[50vh] md:h-full flex flex-col border-t md:border-t-0 md:border-l border-border bg-card relative z-10 shadow-2xl">
        <div className="p-4 border-b border-border bg-sidebar shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2 font-display uppercase font-bold text-lg tracking-wider">
            <Target className="w-5 h-5 text-primary" />
            <span>Target Acquisition</span>
          </div>
        </div>

        <div className="flex-1 relative bg-muted/20">
          <GameMap 
            onGuessSelect={setGuessCoords} 
            guessCoords={guessCoords}
            guessResult={guessResult}
            isRoundOver={isRoundOver}
          />
        </div>

        <div className="p-4 bg-sidebar border-t border-border shrink-0">
          {!isRoundOver ? (
            <Button 
              className="w-full h-14 text-lg font-display uppercase tracking-widest" 
              size="lg"
              disabled={!guessCoords || submitGuess.isPending}
              onClick={handleGuessSubmit}
            >
              {submitGuess.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Crosshair className="w-5 h-5 mr-2" />
                  Lock Coordinates
                </>
              )}
            </Button>
          ) : (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-background border border-border p-4 rounded-md">
                <div className="flex justify-between items-end mb-2">
                  <span className="font-mono text-xs text-muted-foreground uppercase">Distance from target</span>
                  <span className="font-display text-2xl font-bold text-primary">{guessResult.distanceKm.toFixed(1)} km</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="font-mono text-xs text-muted-foreground uppercase">Points Awarded</span>
                  <span className="font-display text-2xl font-bold text-secondary">+{guessResult.score} pts</span>
                </div>
                {guessResult.correctName && (
                  <div className="mt-4 pt-3 border-t border-border flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="font-mono text-sm text-foreground">{guessResult.correctName}</span>
                  </div>
                )}
              </div>
              
              <Button 
                className="w-full h-14 text-lg font-display uppercase tracking-widest" 
                size="lg"
                onClick={handleNextRound}
              >
                {guessResult.gameComplete ? 'View Final Report' : 'Next Target'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
