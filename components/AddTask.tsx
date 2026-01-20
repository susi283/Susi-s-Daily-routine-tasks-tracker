
import React, { useState } from 'react';
import { TaskCategory } from '../types';

interface AddTaskProps {
  onAdd: (text: string, category: TaskCategory) => void;
}

const AddTask: React.FC<AddTaskProps> = ({ onAdd }) => {
  const [text, setText] = useState('');
  const [category, setCategory] = useState<TaskCategory>(TaskCategory.WORK);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim(), category);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-12 relative">
      <div className={`absolute -top-12 right-4 transition-all duration-500 hidden md:block ${isFocused ? 'scale-125 -translate-y-2' : 'scale-100'}`}>
        <div className="flex flex-col items-center">
          <div className="bg-white dark:bg-black p-2 border-2 border-neon-cyan rounded-lg text-[10px] font-mono mb-1 animate-bounce-slow shadow-[3px_3px_0px_rgba(0,255,255,0.3)]">
            {text.length > 0 ? "OOH! A NEW QUEST!" : "WAITING FOR COMMANDS..."}
          </div>
          <div className="text-3xl animate-float">🤖</div>
        </div>
      </div>

      <div className={`flex flex-col gap-6 p-1 rounded-xl transition-all ${isFocused ? 'shadow-[0_0_20px_rgba(255,0,255,0.2)]' : ''}`}>
        <div className="relative group">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="ENTER_NEW_COMMAND..."
            className="w-full px-6 py-5 bg-white/70 dark:bg-black/60 border-2 border-slate-200 dark:border-white/10 rounded-lg font-mono text-sm focus:outline-none focus:border-neon-pink focus:ring-4 focus:ring-neon-pink/10 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 shadow-xl"
          />
          <div className="absolute left-0 bottom-0 h-1 bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-purple w-0 group-focus-within:w-full transition-all duration-500 rounded-b-lg"></div>
        </div>
        
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex gap-2 flex-wrap">
            {Object.values(TaskCategory).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 border-2 font-header text-[10px] tracking-widest transition-all rounded-lg transform active:scale-95 ${
                  category === cat 
                    ? 'bg-neon-pink text-white border-neon-pink shadow-[4px_4px_0px_rgba(255,0,255,0.2)]' 
                    : 'bg-white/50 dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/30 hover:text-slate-900 dark:hover:text-white hover:border-neon-pink/50'
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            type="submit"
            disabled={!text.trim()}
            className="group px-12 py-4 bg-gradient-to-br from-neon-pink to-neon-purple text-white font-header text-sm tracking-widest rounded-lg shadow-[6px_6px_0px_rgba(0,0,0,0.1)] hover:shadow-[0_0_20px_rgba(255,0,255,0.4)] hover:scale-105 active:scale-95 disabled:opacity-20 disabled:pointer-events-none transition-all relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2 uppercase">
              ENGAGE <span className="group-hover:animate-wiggle">🚀</span>
            </span>
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>
        </div>
      </div>
    </form>
  );
};

export default AddTask;
