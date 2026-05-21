import React from "react";
import { Link, useParams } from "wouter";
import { useGetGameResults, getGetGameResultsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Loader2, Home, Trophy, Target, ArrowRight, MapPin } from "lucide-react";
import ResultsMap from "@/components/results-map";

export default function Results() {
  const params = useParams();
  const id = Number(params.id);

  const { data: results, isLoading } = useGetGameResults(id, {
    query: {
      enabled: !!id,
      queryKey: getGetGameResultsQueryKey(id)
    }
  });

  if (isLoading || !results) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-mono text-muted-foreground uppercase tracking-widest">Retrieving Mission Logs...</h2>
      </div>
    );
  }

  // Max score is typically 5000 per round
  const maxPossibleScore = results.rounds * 5000;
  const grade = 
    results.totalScore > maxPossibleScore * 0.9 ? 'S' :
    results.totalScore > maxPossibleScore * 0.75 ? 'A' :
    results.totalScore > maxPossibleScore * 0.5 ? 'B' :
    results.totalScore > maxPossibleScore * 0.25 ? 'C' : 'D';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="w-full p-4 md:p-6 border-b border-border bg-card flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-2 text-primary font-display font-bold text-xl md:text-2xl tracking-wider">
          <Trophy className="w-6 h-6 md:w-8 md:h-8" />
          <span>MISSION <span className="text-foreground">REPORT</span></span>
        </div>
        <Link href="/">
          <Button variant="ghost" className="font-mono uppercase text-xs tracking-widest">
            <Home className="w-4 h-4 mr-2" />
            Return to HQ
          </Button>
        </Link>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Summary & Scoreboard */}
        <div className="w-full md:w-[450px] lg:w-[500px] h-full flex flex-col bg-sidebar border-r border-border shrink-0 overflow-y-auto">
          <div className="p-8 border-b border-border text-center bg-card">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">Final Evaluation</h2>
            <div className="flex justify-center items-center gap-4 mb-4">
              <span className="text-7xl font-display font-black text-primary drop-shadow-md">{results.totalScore}</span>
              <span className="text-2xl font-display text-muted-foreground self-end mb-2">pts</span>
            </div>
            
            <div className="inline-flex items-center justify-center p-2 bg-secondary/10 text-secondary border border-secondary/20 rounded-md">
              <Target className="w-4 h-4 mr-2" />
              <span className="font-mono text-sm uppercase font-bold pr-1">Grade: {grade}</span>
            </div>
          </div>

          <div className="p-6 flex-1">
            <h3 className="font-display font-bold uppercase tracking-wider text-lg mb-4 text-foreground">Round Breakdown</h3>
            
            <div className="space-y-4">
              {results.roundResults.map((round) => (
                <div key={round.round} className="bg-background border border-border p-4 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-xs text-primary font-bold uppercase tracking-widest">Round {round.round}</span>
                    <span className="font-display text-lg font-bold text-foreground">{round.score} pts</span>
                  </div>
                  
                  <div className="flex items-start gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="font-mono text-sm text-foreground">{round.locationName}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs font-mono text-muted-foreground border-t border-border pt-2 mt-2">
                    <span>Distance Off</span>
                    <span className="text-secondary font-bold">{round.distanceKm.toFixed(1)} km</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 border-t border-border bg-card shrink-0">
            <Link href="/play" className="block w-full">
              <Button size="lg" className="w-full h-14 text-lg font-display uppercase tracking-widest">
                New Operation
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Side: Map */}
        <div className="flex-1 h-[50vh] md:h-full relative border-t md:border-t-0 border-border">
          <ResultsMap results={results.roundResults} />
          <div className="absolute top-4 right-4 bg-background/90 backdrop-blur border border-border p-3 rounded-md shadow-lg pointer-events-none z-[1000] hidden md:block">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-secondary rounded-full"></div>
              <span className="text-xs font-mono uppercase">Actual Location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
              <span className="text-xs font-mono uppercase">Your Guess</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
