
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Task, TaskCategory, WeeklyTarget, CheatActivity, TaskStatus, AppTheme } from './types';
import TaskItem from './components/TaskItem';
import AddTask from './components/AddTask';
import { getDailyQuote } from './services/geminiService';
import { audioService } from './services/audioService';

type Page = 'HOME' | 'COMPLETED' | 'INCOMPLETE' | 'CHEAT_DAY';

const NeuralCoreLogo = ({ emoji, theme }: { emoji: string, theme: AppTheme }) => (
  <div className="relative group cursor-pointer" onClick={() => audioService.playClick()}>
    <div className={`absolute inset-0 rounded-xl blur-md opacity-40 group-hover:opacity-100 transition-opacity animate-pulse ${
      theme === 'VAPORWAVE' ? 'bg-gradient-to-tr from-neon-pink to-neon-cyan' :
      theme === 'CYBERPUNK' ? 'bg-neon-cyber_red' : 'bg-neon-fantasy_gold'
    }`}></div>
    
    <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]">
        <path 
          d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="4" 
          className={theme === 'VAPORWAVE' ? 'text-neon-cyan' : theme === 'CYBERPUNK' ? 'text-neon-cyber_yellow' : 'text-neon-fantasy_green'}
        />
      </svg>
      <div className="relative z-10 text-3xl md:text-4xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
        <span className="drop-shadow-[0_0_10px_white]">{emoji}</span>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('daily_tasks');
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return parsed.map((t: any) => ({ ...t, status: t.status || (t.completed ? 'completed' : 'active') }));
  });

  const [weeklyTargets, setWeeklyTargets] = useState<WeeklyTarget[]>(() => {
    const saved = localStorage.getItem('weekly_targets');
    return saved ? JSON.parse(saved) : [
      { id: 'w1', text: 'Daily Meditation', completed: false },
      { id: 'w2', text: 'Workout Session', completed: false }
    ];
  });

  const [theme, setTheme] = useState<AppTheme>(() => (localStorage.getItem('app_theme') as AppTheme) || 'VAPORWAVE');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [currentPage, setCurrentPage] = useState<Page>('HOME');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'ALL'>('ALL');
  const [quote, setQuote] = useState<string>('LEVEL UP YOUR REALITY.');
  const [newWeeklyText, setNewWeeklyText] = useState('');

  // Leisure states
  const [movies, setMovies] = useState<CheatActivity[]>(() => JSON.parse(localStorage.getItem('cheat_movies') || '[]'));
  const [games, setGames] = useState<CheatActivity[]>(() => JSON.parse(localStorage.getItem('cheat_games') || '[]'));
  const [tvShows, setTvShows] = useState<CheatActivity[]>(() => JSON.parse(localStorage.getItem('cheat_tv') || '[]'));
  const [movieInput, setMovieInput] = useState('');
  const [gameInput, setGameInput] = useState({ title: '', hours: '' });
  const [tvInput, setTvInput] = useState({ title: '', hours: '' });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('theme-vaporwave', 'theme-cyberpunk', 'theme-fantasy');
    root.classList.add(`theme-${theme.toLowerCase()}`);
    localStorage.setItem('app_theme', theme);
    
    if (darkMode) root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [theme, darkMode]);

  useEffect(() => {
    localStorage.setItem('daily_tasks', JSON.stringify(tasks));
    localStorage.setItem('weekly_targets', JSON.stringify(weeklyTargets));
    localStorage.setItem('cheat_movies', JSON.stringify(movies));
    localStorage.setItem('cheat_games', JSON.stringify(games));
    localStorage.setItem('cheat_tv', JSON.stringify(tvShows));
  }, [tasks, weeklyTargets, movies, games, tvShows]);

  useEffect(() => {
    getDailyQuote().then(setQuote);
  }, []);

  const addTask = useCallback((text: string, category: TaskCategory) => {
    audioService.playClick();
    const newTask: Task = { id: Math.random().toString(36).substr(2, 9), text, status: 'active', category, createdAt: Date.now() };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const editTask = useCallback((id: string, text: string, category: TaskCategory) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, text, category } : t));
  }, []);

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const cycleTheme = () => {
    audioService.playClick();
    const themes: AppTheme[] = ['VAPORWAVE', 'CYBERPUNK', 'FANTASY'];
    const nextIndex = (themes.indexOf(theme) + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const addWeeklyTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWeeklyText.trim()) {
      audioService.playClick();
      const newTarget: WeeklyTarget = {
        id: Math.random().toString(36).substr(2, 9),
        text: newWeeklyText.trim(),
        completed: false
      };
      setWeeklyTargets(prev => [...prev, newTarget]);
      setNewWeeklyText('');
    }
  };

  // Cheat day handlers
  const handleAddMovie = (e: React.FormEvent) => {
    e.preventDefault();
    if (movieInput.trim()) {
      audioService.playClick();
      setMovies(prev => [...prev, { id: Date.now().toString(), title: movieInput.trim() }]);
      setMovieInput('');
    }
  };

  const handleAddGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameInput.title.trim() && gameInput.hours) {
      audioService.playClick();
      setGames(prev => [...prev, { id: Date.now().toString(), title: gameInput.title.trim(), metric: parseFloat(gameInput.hours) }]);
      setGameInput({ title: '', hours: '' });
    }
  };

  const handleAddTV = (e: React.FormEvent) => {
    e.preventDefault();
    if (tvInput.title.trim() && tvInput.hours) {
      audioService.playClick();
      setTvShows(prev => [...prev, { id: Date.now().toString(), title: tvInput.title.trim(), metric: parseFloat(tvInput.hours) }]);
      setTvInput({ title: '', hours: '' });
    }
  };

  const filteredTasks = useMemo(() => {
    let base = tasks;
    if (currentPage === 'HOME') base = tasks.filter(t => t.status === 'active');
    else if (currentPage === 'COMPLETED') base = tasks.filter(t => t.status === 'completed');
    else if (currentPage === 'INCOMPLETE') base = tasks.filter(t => t.status === 'incomplete');
    
    if (selectedCategory === 'ALL') return base;
    return base.filter(t => t.category === selectedCategory);
  }, [tasks, selectedCategory, currentPage]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    return { 
      total, 
      completed, 
      remaining: tasks.filter(t => t.status === 'active').length,
      percentage: total === 0 ? 0 : Math.round((completed / total) * 100) 
    };
  }, [tasks]);

  const mascotEmoji = useMemo(() => {
    if (theme === 'FANTASY') return '🧙‍♂️';
    if (theme === 'CYBERPUNK') return '🤖';
    return stats.percentage >= 90 ? '👑' : stats.percentage >= 50 ? '🔥' : '⚡';
  }, [stats.percentage, theme]);

  return (
    <div className="min-h-screen relative z-10 px-4 py-8 md:px-12 text-slate-900 dark:text-white transition-colors duration-500">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 p-6 md:p-8 neon-border rounded-2xl bg-white/60 dark:bg-black/40">
        <div className="flex items-center gap-6">
          <NeuralCoreLogo emoji={mascotEmoji} theme={theme} />
          <div>
            <h1 className="font-header text-2xl md:text-4xl tracking-tighter neon-text-pink italic drop-shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
              {theme === 'FANTASY' ? "Susind's Quest Log" : theme === 'CYBERPUNK' ? "Neuro-Grid HUD" : "Susind's Daily Tasks"}
            </h1>
            <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] text-slate-500 dark:text-white dark:opacity-70 mt-2">
              ENV::{theme} // DATE::{new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <button 
             onClick={cycleTheme}
             className="px-6 py-3 font-header text-[10px] neon-border rounded-xl hover:scale-105 active:scale-95 transition-all bg-white/80 dark:bg-black/40 shadow-lg"
           >
             CHANGE_ENV
           </button>
           <button 
             onClick={() => { audioService.playClick(); setDarkMode(!darkMode); }}
             className="w-14 h-14 flex items-center justify-center neon-border rounded-xl hover:scale-110 active:scale-95 transition-all bg-white/80 dark:bg-black/40 text-2xl shadow-xl"
           >
             {darkMode ? '🌙' : '☀️'}
           </button>
        </div>
      </header>

      <nav className="flex flex-wrap justify-center gap-4 mb-10">
        {[
          { id: 'HOME', label: 'ACTIVE', color: 'bg-neon-pink', icon: '📡' },
          { id: 'COMPLETED', label: 'HISTORY', color: 'bg-neon-cyan', icon: '🏆' },
          { id: 'INCOMPLETE', label: 'FAILED', color: 'bg-red-500', icon: '⚠️' },
          { id: 'CHEAT_DAY', label: 'LEISURE', color: 'bg-neon-gold', icon: '🍬' }
        ].map((p) => (
          <button 
            key={p.id}
            onClick={() => { audioService.playClick(); setCurrentPage(p.id as Page); }}
            className={`px-6 py-3 font-header text-[10px] sm:text-xs tracking-[0.2em] rounded-xl border-2 transition-all flex items-center gap-3 ${
              currentPage === p.id 
                ? `${p.color} text-white border-transparent shadow-lg scale-105` 
                : 'border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 hover:border-neon-pink'
            }`}
          >
            <span>{p.icon}</span> {p.label}
          </button>
        ))}
      </nav>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          {currentPage === 'HOME' && (
            <section className="neon-border p-8 rounded-2xl bg-white/80 dark:bg-black/50 animate-[fadeIn_0.5s_ease-out] relative">
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-header text-xl neon-text-cyan tracking-wide">MISSIONS</h2>
                <div className="font-mono text-xs text-slate-500 dark:text-white/50 px-4 py-1.5 bg-slate-100 dark:bg-black/40 border-2 rounded-lg">
                  SYNC: {stats.percentage}%
                </div>
              </div>

              <div className="relative mb-12 h-6 bg-slate-100 dark:bg-black/60 rounded-full border-2 p-[2px]">
                <div 
                  className={`h-full transition-all duration-1000 rounded-full ${darkMode ? 'bg-neon-cyan' : 'bg-neon-pink'}`}
                  style={{ width: `${stats.percentage}%` }}
                />
              </div>

              <AddTask onAdd={addTask} />

              <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar">
                {(['ALL', ...Object.values(TaskCategory)] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => { audioService.playClick(); setSelectedCategory(cat); }}
                    className={`px-4 py-2 font-header text-[9px] transition-all rounded-lg border-2 ${
                      selectedCategory === cat ? 'bg-neon-pink text-white border-neon-pink shadow-md' : 'text-slate-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                {filteredTasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    onStatusChange={updateTaskStatus} 
                    onDelete={(id) => { audioService.playError(); setTasks(prev => prev.filter(t => t.id !== id)); }}
                    onEdit={editTask}
                  />
                ))}
                {filteredTasks.length === 0 && (
                  <div className="py-20 text-center font-mono text-slate-400 dark:text-white/20 italic tracking-widest">NO_ACTIVE_TASKS_IN_BUFFER</div>
                )}
              </div>
            </section>
          )}

          {(currentPage === 'COMPLETED' || currentPage === 'INCOMPLETE') && (
             <section className="neon-border p-8 rounded-2xl bg-white/80 dark:bg-black/50 animate-[fadeIn_0.5s_ease-out] relative">
               <h2 className={`font-header text-xl tracking-wide mb-8 ${currentPage === 'COMPLETED' ? 'neon-text-cyan' : 'text-red-500'}`}>
                 {currentPage === 'COMPLETED' ? 'HISTORY_LOG' : 'FAILURE_LOG'}
               </h2>
               <div className="space-y-6">
                 {filteredTasks.map(task => (
                   <TaskItem 
                     key={task.id} 
                     task={task} 
                     onStatusChange={updateTaskStatus} 
                     onDelete={(id) => setTasks(prev => prev.filter(t => t.id !== id))}
                     onEdit={editTask}
                   />
                 ))}
                 {filteredTasks.length === 0 && (
                   <div className="py-20 text-center font-mono text-slate-400 dark:text-white/20 italic tracking-widest uppercase">EMPTY_LOG_FILE</div>
                 )}
               </div>
             </section>
          )}

          {currentPage === 'CHEAT_DAY' && (
            <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
               <section className="neon-border p-8 rounded-2xl bg-white/80 dark:bg-black/50">
                  <h3 className="font-header text-lg mb-6 text-neon-pink">LEISURE_PROTOCOL</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Gaming Logs */}
                    <div className="space-y-4">
                       <h4 className="font-header text-[10px] text-neon-cyan tracking-widest">ARCADE_LOGS</h4>
                       <form onSubmit={handleAddGame} className="flex gap-2">
                         <input type="text" placeholder="Title" value={gameInput.title} onChange={e => setGameInput(p => ({...p, title: e.target.value}))} className="flex-1 bg-black/10 dark:bg-black/40 rounded px-3 py-2 text-xs font-mono outline-none border border-white/10" />
                         <input type="number" placeholder="Hrs" value={gameInput.hours} onChange={e => setGameInput(p => ({...p, hours: e.target.value}))} className="w-16 bg-black/10 dark:bg-black/40 rounded px-3 py-2 text-xs font-mono outline-none border border-white/10" />
                         <button className="bg-neon-cyan text-black font-header text-[10px] px-3 rounded">LOG</button>
                       </form>
                       <div className="space-y-2">
                         {games.map(g => <div key={g.id} className="p-3 bg-white/10 rounded-lg flex justify-between font-mono text-xs"><span>{g.title}</span><span className="text-neon-cyan">{g.metric}H</span></div>)}
                       </div>
                    </div>

                    {/* Movie Archive */}
                    <div className="space-y-4">
                       <h4 className="font-header text-[10px] text-neon-pink tracking-widest">CINEMA_ARCHIVE</h4>
                       <form onSubmit={handleAddMovie} className="flex gap-2">
                         <input type="text" placeholder="Movie Title" value={movieInput} onChange={e => setMovieInput(e.target.value)} className="flex-1 bg-black/10 dark:bg-black/40 rounded px-3 py-2 text-xs font-mono outline-none border border-white/10" />
                         <button className="bg-neon-pink text-white font-header text-[10px] px-3 rounded">ADD</button>
                       </form>
                       <div className="space-y-2">
                         {movies.map(m => <div key={m.id} className="p-3 bg-white/10 rounded-lg flex justify-between font-mono text-xs"><span>{m.title}</span><span className="text-neon-pink">WATCHED</span></div>)}
                       </div>
                    </div>
                  </div>

                  {/* TV Screen Time */}
                  <div className="mt-10 space-y-4">
                     <h4 className="font-header text-[10px] text-neon-purple tracking-widest">SCREEN_TIME_PROTOCOL</h4>
                     <form onSubmit={handleAddTV} className="flex gap-2 max-w-md">
                        <input type="text" placeholder="Series" value={tvInput.title} onChange={e => setTvInput(p => ({...p, title: e.target.value}))} className="flex-1 bg-black/10 dark:bg-black/40 rounded px-3 py-2 text-xs font-mono outline-none border border-white/10" />
                        <input type="number" placeholder="Hrs" value={tvInput.hours} onChange={e => setTvInput(p => ({...p, hours: e.target.value}))} className="w-16 bg-black/10 dark:bg-black/40 rounded px-3 py-2 text-xs font-mono outline-none border border-white/10" />
                        <button className="bg-neon-purple text-white font-header text-[10px] px-3 rounded">LOG</button>
                     </form>
                     <div className="space-y-2">
                       {tvShows.map(t => <div key={t.id} className="p-3 bg-white/10 rounded-lg flex justify-between font-mono text-xs"><span>{t.title}</span><span className="text-neon-purple">{t.metric}H</span></div>)}
                     </div>
                  </div>
               </section>
            </div>
          )}
        </div>

        <aside className="lg:col-span-4 space-y-10">
          <section className="neon-border p-6 rounded-2xl bg-white/80 dark:bg-black/60">
            <h3 className="font-header text-[11px] text-neon-purple mb-8 flex items-center gap-2">
               <span className="w-3 h-3 bg-neon-purple rounded-full animate-ping"></span>
               SIDE_QUESTS
            </h3>
            <div className="space-y-4 mb-6">
              {weeklyTargets.map(target => (
                <div key={target.id} className="flex items-center gap-4 group">
                  <input 
                    type="checkbox" 
                    checked={target.completed} 
                    onChange={() => { audioService.playSuccess(); setWeeklyTargets(prev => prev.map(t => t.id === target.id ? { ...t, completed: !t.completed } : t)); }} 
                    className="w-5 h-5 accent-neon-purple cursor-pointer rounded" 
                  />
                  <span className={`font-mono text-sm ${target.completed ? 'line-through opacity-50' : ''}`}>{target.text}</span>
                  <button onClick={() => setWeeklyTargets(p => p.filter(t => t.id !== target.id))} className="ml-auto opacity-0 group-hover:opacity-100 text-red-500 text-xs">×</button>
                </div>
              ))}
            </div>
            <form onSubmit={addWeeklyTarget} className="flex gap-2 border-t border-white/10 pt-4">
              <input 
                type="text" 
                value={newWeeklyText} 
                onChange={e => setNewWeeklyText(e.target.value)} 
                placeholder="New Quest..." 
                className="flex-1 bg-black/5 dark:bg-black/20 rounded px-3 py-2 text-[10px] font-mono outline-none"
              />
              <button className="bg-neon-purple text-white px-3 py-1 rounded text-[9px] font-header">ADD</button>
            </form>
          </section>

          <section className="neon-border p-8 rounded-2xl bg-white/60 dark:bg-black/40 group">
             <div className="font-mono text-[10px] text-neon-cyan mb-4">NEURAL_STREAM</div>
             <p className="font-mono text-sm italic border-l-4 border-neon-pink pl-4 leading-relaxed italic">"{quote}"</p>
          </section>
        </aside>
      </main>

      <footer className="mt-20 text-center pb-12 opacity-40">
         <div className="inline-block py-3 px-8 neon-border bg-white/90 dark:bg-black/90 rounded-xl">
           <p className="font-mono text-[9px] tracking-[0.6em] uppercase">Sector Established // Protocol 198X</p>
         </div>
      </footer>
    </div>
  );
};

export default App;
