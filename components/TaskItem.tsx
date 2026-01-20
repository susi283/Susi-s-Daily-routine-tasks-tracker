
import React, { useState } from 'react';
import { Task, TaskCategory, TaskStatus } from '../types';
import { audioService } from '../services/audioService';

interface TaskItemProps {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string, category: TaskCategory) => void;
}

const categoryStyles: Record<TaskCategory, string> = {
  [TaskCategory.WORK]: 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-500/10',
  [TaskCategory.PERSONAL]: 'border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-500/10',
  [TaskCategory.HEALTH]: 'border-green-500 text-green-600 dark:text-green-400 bg-green-500/10',
  [TaskCategory.LEARNING]: 'border-yellow-600 text-yellow-700 dark:text-yellow-400 bg-yellow-500/10',
  [TaskCategory.OTHER]: 'border-slate-500 text-slate-600 dark:text-slate-400 bg-slate-500/10',
};

const TaskItem: React.FC<TaskItemProps> = ({ task, onStatusChange, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editCategory, setEditCategory] = useState(task.category);
  const [showIncompleteConfirm, setShowIncompleteConfirm] = useState(false);
  const [sonicPulse, setSonicPulse] = useState<'success' | 'error' | null>(null);

  const triggerSonic = (type: 'success' | 'error') => {
    setSonicPulse(type);
    setTimeout(() => setSonicPulse(null), 600);
  };

  const handleSave = () => {
    if (editText.trim()) {
      audioService.playClick();
      onEdit(task.id, editText.trim(), editCategory);
      setIsEditing(false);
    }
  };

  const handleStatusToggle = (newStatus: TaskStatus) => {
    if (newStatus === 'incomplete' && task.status !== 'incomplete') {
      setShowIncompleteConfirm(true);
      audioService.playClick();
    } else {
      if (newStatus === 'completed') {
        audioService.playSuccess();
        triggerSonic('success');
      } else if (newStatus === 'active') {
        audioService.playClick();
      }
      onStatusChange(task.id, newStatus);
      setShowIncompleteConfirm(false);
    }
  };

  const confirmIncomplete = () => {
    audioService.playError();
    triggerSonic('error');
    onStatusChange(task.id, 'incomplete');
    setShowIncompleteConfirm(false);
  };

  if (isEditing) {
    return (
      <div className="p-5 rounded-xl border-2 border-neon-cyan bg-white dark:bg-black/60 shadow-[0_0_15px_rgba(0,255,255,0.3)] animate-[slideIn_0.2s_ease-out]">
        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full px-4 py-2 bg-slate-100 dark:bg-white/10 border-2 border-neon-cyan/30 rounded font-mono text-sm text-slate-900 dark:text-white outline-none focus:border-neon-cyan"
            autoFocus
          />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-1.5 flex-wrap">
              {Object.values(TaskCategory).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setEditCategory(cat)}
                  className={`px-2 py-1 border-2 font-mono text-[8px] tracking-tighter rounded transition-all ${
                    editCategory === cat 
                      ? 'bg-neon-cyan text-black border-neon-cyan' 
                      : 'border-slate-300 dark:border-white/10 text-slate-500'
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsEditing(false)} className="px-4 py-1.5 font-mono text-[10px] text-slate-500 hover:text-red-500">CANCEL</button>
              <button onClick={handleSave} className="px-4 py-1.5 bg-neon-cyan text-black font-header text-[10px] rounded hover:scale-105 transition-transform">UPDATE</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isCompleted = task.status === 'completed';
  const isIncomplete = task.status === 'incomplete';

  return (
    <div className={`relative group flex items-center justify-between p-5 rounded-xl border-l-4 transition-all duration-500 ease-out overflow-hidden ${
      isCompleted 
        ? 'opacity-30 border-slate-400 bg-slate-50/50 grayscale scale-[0.98]' 
        : isIncomplete
        ? 'opacity-50 border-red-500 bg-red-500/5 scale-[0.98]'
        : 'bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/15 border-neon-cyan shadow-sm hover:shadow-xl hover:-translate-y-1'
    }`}>
      {/* Sonic Pulse Animation */}
      {sonicPulse && (
        <div className={`absolute left-10 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full animate-sonic pointer-events-none ${
          sonicPulse === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`} />
      )}

      <div className="flex items-center space-x-4 flex-1">
        <button
          onClick={() => handleStatusToggle(isCompleted ? 'active' : 'completed')}
          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 transform ${
            isCompleted 
              ? 'bg-green-500 border-green-500 text-white rotate-[360deg] scale-110' 
              : 'border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-white hover:scale-110 active:scale-90 shadow-sm'
          }`}
        >
          {isCompleted ? <span className="animate-wiggle text-xl">⭐</span> : ''}
        </button>

        {!isCompleted && (
          <button
            onClick={() => handleStatusToggle(isIncomplete ? 'active' : 'incomplete')}
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 transform ${
              isIncomplete 
                ? 'bg-red-500 border-red-500 text-white scale-110' 
                : 'border-red-500/30 text-red-500/30 hover:border-red-500 hover:text-red-500 hover:scale-110 active:scale-90 shadow-sm'
            }`}
          >
            <span className={isIncomplete ? "animate-wiggle text-xl" : "text-xl"}>❌</span>
          </button>
        )}
        
        <div className="flex flex-col flex-1 cursor-pointer" onClick={() => !isCompleted && !isIncomplete && setIsEditing(true)}>
          <span className={`font-mono text-base font-bold tracking-tight transition-all relative inline-block ${
            isCompleted ? 'line-through text-slate-400' : 
            isIncomplete ? 'text-red-400 italic' : 
            'text-slate-800 dark:text-white group-hover:text-neon-pink'
          }`}>
            {task.text}
          </span>
          <div className="flex items-center gap-3 mt-1">
             <span className={`text-[9px] font-header uppercase px-2 py-0.5 rounded border-2 shadow-[2px_2px_0px_rgba(0,0,0,0.1)] transition-all ${categoryStyles[task.category]}`}>
               {task.category}
             </span>
          </div>
        </div>
      </div>
      
      {showIncompleteConfirm && (
        <div className="absolute inset-0 bg-white dark:bg-black/90 flex items-center justify-center gap-4 z-20 animate-[fadeIn_0.2s_ease-out]">
          <span className="font-header text-[10px] text-red-500 tracking-widest animate-pulse">ABORT MISSION?</span>
          <div className="flex gap-2">
            <button onClick={() => setShowIncompleteConfirm(false)} className="px-3 py-1 font-mono text-[10px] border border-slate-300 dark:border-white/20 text-slate-500 rounded">CANCEL</button>
            <button onClick={confirmIncomplete} className="px-3 py-1 font-header text-[10px] bg-red-500 text-white rounded shadow-[2px_2px_0px_rgba(255,0,0,0.3)]">CONFIRM</button>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          audioService.playError();
          onDelete(task.id);
        }}
        className="p-3 opacity-0 group-hover:opacity-100 transition-all text-slate-400 hover:text-red-500 hover:scale-125 transform"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
};

export default TaskItem;
