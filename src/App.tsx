import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDocFromServer } from 'firebase/firestore';
import { auth, db } from './firebase'; // Assuming this exists or I'll create it
import { Bot, Zap, Search, FileText, Settings, Plus, Camera } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import { motion, AnimatePresence } from 'motion/react';
import OCRScreen from './screens/OCRScreen';

// Pre-warm the neural engine
tf.ready().then(() => console.log("System: Tensor Core initialized"));

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<'home' | 'ocr' | 'settings'>('home');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Show splash for at least 3.5 seconds to feel "Pro"
    const splashTimer = setTimeout(() => {
      console.log("App: Splash timer finished");
      setShowSplash(false);
    }, 3500);

    // Fail-safe GLOBAL timeout: Absolute maximum of 12 seconds
    const absoluteTimeout = setTimeout(() => {
      console.error("App: CRITICAL - Absolute timeout triggered. Forcing app start.");
      setShowSplash(false);
      setAuthLoading(false);
    }, 12000);

    // Test Firestore connection (Non-blocking)
    const testConnection = async () => {
      try {
        console.log("App: DB Probe initiated...");
        await Promise.race([
          getDocFromServer(doc(db, "test", "connection")),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000))
        ]);
        console.log("App: DB handshaking verified");
      } catch (error) {
        console.log("App: DB restricted but bridge is stable");
      }
    };
    testConnection();

    // Handle Auth
    const authTimeout = setTimeout(() => {
      console.warn("App: Auth sync exceeded soft limit, proceeding...");
      setAuthLoading(false);
    }, 6000); 

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("App: Identity verified:", currentUser ? "Account found" : "Sandbox active");
      setUser(currentUser);
      setAuthLoading(false);
      clearTimeout(authTimeout);
    });

    return () => {
      clearTimeout(splashTimer);
      clearTimeout(authTimeout);
      clearTimeout(absoluteTimeout);
      unsubscribe();
    };
  }, []);

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-[1000] font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-4">
             <span className="text-3xl font-black italic text-white">AP</span>
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase flex items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            AP_NOTES
          </h1>
          <p className="text-sm font-black text-blue-500 uppercase tracking-[0.8em] opacity-80 pl-[0.8em] animate-in fade-in duration-1000 delay-300">NEURAL_ENGINE_CORE</p>
        </div>

        <div className="mt-10 flex flex-col items-center gap-8">
           <div className="w-64 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5 relative">
              <div className="absolute inset-0 bg-blue-500/10" />
              <div className="h-full bg-blue-600 rounded-full animate-[loading_4s_cubic-bezier(.4,0,.2,1)_infinite]" />
           </div>
           
           <div className="flex flex-col items-center gap-2">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] pl-[0.4em]">System v1.2.5_Stable_Release</span>
             <span className="text-[9px] font-bold text-slate-700 uppercase tracking-[0.2em] animate-pulse">Syncing Neural Context...</span>
           </div>
        </div>

        <button 
          onClick={() => {
            setShowSplash(false);
            setAuthLoading(false);
          }}
          className="absolute bottom-12 text-[10px] font-black text-slate-700 uppercase tracking-[0.3em] hover:text-blue-500 transition-colors py-2 px-6 border border-white/10 rounded-full bg-white/5"
        >
          BYPASS_INIT
        </button>

        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); width: 30%; }
            50% { transform: translateX(50%); width: 60%; }
            100% { transform: translateX(200%); width: 30%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Header with Search (Managed Position) */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 p-4">
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                 <span className="text-xs font-black italic text-white">AP</span>
              </div>
              <span className="font-black italic tracking-tight uppercase text-white">AP_NOTES_PRO</span>
            </div>
            <button onClick={() => setCurrentScreen('settings')} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <Settings className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Search Bar - Fixed/Managed Position */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search neural workspace..."
              className="w-full bg-slate-900 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
               <kbd className="text-[10px] font-bold text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded border border-white/5">⌘K</kbd>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto p-4 pb-32">
        <AnimatePresence mode="wait">
          {currentScreen === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Recent Notes</h2>
                <div className="flex gap-2">
                   <button className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:bg-blue-500/10 px-3 py-1 rounded-full transition-all">All Files</button>
                </div>
              </div>

              {/* Placeholder Empty State */}
              <div className="aspect-[4/3] rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-4 group hover:border-blue-500/20 transition-all cursor-pointer">
                 <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Plus className="w-6 h-6 text-slate-500 group-hover:text-blue-500" />
                 </div>
                 <div className="text-center">
                    <p className="text-sm font-bold text-slate-400">Initialize New Note</p>
                    <p className="text-[10px] font-medium text-slate-600 mt-1 capitalize">Capture data via OCR or Manual Input</p>
                 </div>
              </div>
            </motion.div>
          )}

          {currentScreen === 'ocr' && (
            <motion.div 
              key="ocr"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="h-[70vh]"
            >
              <OCRScreen />
              <button 
                onClick={() => setCurrentScreen('home')}
                className="mt-4 w-full py-3 rounded-2xl bg-slate-900 border border-white/5 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/5 transition-colors"
              >
                CLOSE_SCANNER
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation Dock */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-full p-2 flex items-center justify-around shadow-2xl shadow-black/50 z-50">
        <button 
          onClick={() => setCurrentScreen('home')}
          className={`p-4 rounded-full transition-all ${currentScreen === 'home' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <FileText className="w-6 h-6" />
        </button>
        
        <button 
          onClick={() => setCurrentScreen('ocr')}
          className="relative -top-4 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/40 hover:scale-110 active:scale-95 transition-all text-white group"
        >
          <Camera className="w-8 h-8" />
          <div className="absolute -inset-1 bg-blue-500 opacity-20 rounded-full blur-xl group-hover:opacity-40 transition-opacity animate-pulse" />
        </button>

        <button 
          className="p-4 rounded-full text-slate-500 hover:text-slate-300"
        >
          <Zap className="w-6 h-6" />
        </button>
      </nav>
    </div>
  );
}
