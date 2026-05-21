import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPin, Globe, Trophy } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background relative overflow-hidden">
      {/* Decorative background map lines pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{
             backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
             backgroundSize: '40px 40px'
           }} 
      />
      
      <header className="w-full p-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2 text-primary font-display font-bold text-2xl tracking-wider">
          <Globe className="w-8 h-8" />
          <span>TERRA<span className="text-foreground">SIGHT</span></span>
        </div>
        <Link href="/admin">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground font-mono uppercase text-xs tracking-widest">
            Field Office
          </Button>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 max-w-4xl mx-auto text-center w-full">
        <div className="inline-flex items-center justify-center p-2 bg-secondary/10 text-secondary border border-secondary/20 rounded-full mb-8">
          <MapPin className="w-4 h-4 mr-2" />
          <span className="font-mono text-xs uppercase tracking-widest font-bold pr-1">Global Reconnaissance Division</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-6 uppercase tracking-tight shadow-black drop-shadow-md">
          Where in the <br className="md:hidden" />
          <span className="text-primary">world</span> are you?
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 font-mono leading-relaxed">
          You will be dropped into an undisclosed location via photograph. Your objective: pinpoint the exact coordinates on the map before time runs out. Precision is rewarded.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Link href="/play" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto h-16 px-12 text-lg font-display uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] transition-all duration-300">
              Commence Operation
            </Button>
          </Link>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          <div className="flex flex-col items-center text-center p-6 bg-card border border-card-border rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-display uppercase font-bold text-lg mb-2">Observe</h3>
            <p className="text-sm text-muted-foreground font-mono">Study the environment. Architecture, flora, language—every detail is a clue.</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 bg-card border border-card-border rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4 text-secondary">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="font-display uppercase font-bold text-lg mb-2">Locate</h3>
            <p className="text-sm text-muted-foreground font-mono">Navigate the map and drop your pin where you think the photo was taken.</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 bg-card border border-card-border rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-4 text-primary">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="font-display uppercase font-bold text-lg mb-2">Score</h3>
            <p className="text-sm text-muted-foreground font-mono">The closer you are to the actual location, the higher your operational score.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
