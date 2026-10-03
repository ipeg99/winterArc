'use client';
import { useState, useEffect, useRef } from 'react';

function SnowBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const snowflakesCount = 70;
    const snowflakes: { x: number; y: number; radius: number; speedY: number; speedX: number; opacity: number }[] = [];

    for (let i = 0; i < snowflakesCount; i++) {
      snowflakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 0.5,
        speedY: Math.random() * 0.7 + 0.3,
        speedX: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.6 + 0.3,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      snowflakes.forEach((flake) => {
        ctx.fillStyle = `rgba(56, 189, 248, ${flake.opacity})`;
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fill();

        flake.y += flake.speedY;
        flake.x += flake.speedX;

        if (flake.y > height) {
          flake.y = 0;
          flake.x = Math.random() * width;
        }
        if (flake.x > width || flake.x < 0) {
          flake.x = Math.random() * width;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-10" />;
}

interface Habit {
  id: string;
  title: string;
  icon: string;
  completed: boolean;
}

const quotes = [
  "“Discipline is choosing between what you want now and what you want most.”",
  "“The winter arc is where legends are forged in silence.”",
  "“You don't rise to the level of your goals. You fall to the level of your systems.”",
  "“Embrace the cold, embrace the grind. No excuses.”",
  "“Pain of discipline is far less than the pain of regret.”"
];

const defaultHabits: Habit[] = [
  { id: '1', title: 'Gym / Workout (1 Hour)', icon: '🏋️‍♂️', completed: false },
  { id: '2', title: 'Deep Work / Coding (2 Hours)', icon: '💻', completed: false },
  { id: '3', title: 'Read 10 Pages', icon: '📖', completed: false },
  { id: '4', title: 'No Junk Food & Strict Diet', icon: '🥗', completed: false },
  { id: '5', title: 'Cold Shower / Meditation', icon: '❄', completed: false },
];

export default function WinterArcApp() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentDay, setCurrentDay] = useState(1);
  const [totalDays, setTotalDays] = useState(151);
  const [daysLeft, setDaysLeft] = useState(0);
  const [dailyQuote, setDailyQuote] = useState('');
  const [habits, setHabits] = useState<Habit[]>(defaultHabits);
  const [todayKey, setTodayKey] = useState<string>('');
  const [newHabitTitle, setNewHabitTitle] = useState<string>('');
  const [allDaysData, setAllDaysData] = useState<{ [date: string]: Habit[] }>({});

  const startDate = new Date('2026-10-01');
  const endDate = new Date('2027-02-28');

  useEffect(() => {
    setMounted(true);
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    setTodayKey(dateStr);

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setDailyQuote(randomQuote);

    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    setCurrentDay(Math.max(1, diffDays));

    const totalTime = endDate.getTime() - startDate.getTime();
    setTotalDays(Math.ceil(totalTime / (1000 * 60 * 60 * 24)) + 1);

    const leftTime = endDate.getTime() - today.getTime();
    setDaysLeft(Math.max(0, Math.ceil(leftTime / (1000 * 60 * 60 * 24))));

    if (typeof window !== 'undefined') {
      const loadedData: { [date: string]: Habit[] } = {};
      let curr = new Date(startDate);

      while (curr <= endDate) {
        const y = curr.getFullYear();
        const m = String(curr.getMonth() + 1).padStart(2, '0');
        const d = String(curr.getDate()).padStart(2, '0');
        const dStr = `${y}-${m}-${d}`;

        const saved = localStorage.getItem(`winter_arc_${dStr}`);
        if (saved) {
          try {
            loadedData[dStr] = JSON.parse(saved);
          } catch (e) {}
        }
        curr.setDate(curr.getDate() + 1);
      }
      setAllDaysData(loadedData);

      const savedToday = localStorage.getItem(`winter_arc_${dateStr}`);
      if (savedToday) {
        try {
          setHabits(JSON.parse(savedToday));
        } catch (e) {}
      }
    }
  }, []);

  if (!mounted) {
    return null;
  }

  const saveHabitsToStorage = (updatedHabits: Habit[]) => {
    setHabits(updatedHabits);
    if (typeof window !== 'undefined' && todayKey) {
      localStorage.setItem(`winter_arc_${todayKey}`, JSON.stringify(updatedHabits));
      setAllDaysData(prev => ({ ...prev, [todayKey]: updatedHabits }));
    }
  };

  const toggleHabit = (id: string) => {
    const updated = habits.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h));
    saveHabitsToStorage(updated);
  };

  const deleteHabit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = habits.filter((h) => h.id !== id);
    saveHabitsToStorage(updated);
  };

  const addCustomHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    const newHabit: Habit = {
      id: Date.now().toString(),
      title: newHabitTitle.trim(),
      icon: '🎯',
      completed: false,
    };

    const updated = [...habits, newHabit];
    saveHabitsToStorage(updated);
    setNewHabitTitle('');
  };

  const resetTodayProgress = () => {
    const resetHabits = habits.map((h) => ({ ...h, completed: false }));
    saveHabitsToStorage(resetHabits);
  };

  const completedCount = habits.filter((h) => h.completed).length;
  const remainingCount = habits.length - completedCount;
  const progressPercent = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;
  const isAllCompleted = habits.length > 0 && completedCount === habits.length;

  const generateCalendarDays = () => {
    const days = [];
    let curr = new Date(startDate);

    while (curr <= endDate) {
      const year = curr.getFullYear();
      const month = String(curr.getMonth() + 1).padStart(2, '0');
      const day = String(curr.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      let status = 'empty';
      const dayHabits = allDaysData[dateStr];

      if (dayHabits && dayHabits.length > 0) {
        const done = dayHabits.filter(p => p.completed).length;
        if (done === dayHabits.length) status = 'full';
        else if (done > 0) status = 'partial';
      }

      days.push({ dateStr, status, dayNum: curr.getDate(), monthName: curr.toLocaleString('default', { month: 'short' }) });
      curr.setDate(curr.getDate() + 1);
    }
    return days;
  };

  const calendarDays = generateCalendarDays();

  let totalDaysFull = 0;
  let totalDaysPartial = 0;
  let totalTasksCompletedAllTime = 0;
  let totalRecordedDays = 0;

  Object.values(allDaysData).forEach((dayHabits) => {
    if (Array.isArray(dayHabits) && dayHabits.length > 0) {
      totalRecordedDays++;
      const done = dayHabits.filter(p => p.completed).length;
      totalTasksCompletedAllTime += done;
      if (done === dayHabits.length) {
        totalDaysFull++;
      } else if (done > 0) {
        totalDaysPartial++;
      }
    }
  });

  const overallConsistencyRate = totalRecordedDays > 0 ? Math.round((totalDaysFull / totalRecordedDays) * 100) : 0;

  return (
    <main className="min-h-screen bg-[#07090E] text-[#F8FAFC] relative overflow-x-hidden font-sans flex flex-col md:flex-row selection:bg-[#38BDF8] selection:text-[#07090E]">
      <SnowBackground />

      <div className="absolute top-0 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#38BDF8]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#10B981]/10 rounded-full blur-[120px] pointer-events-none" />

      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#0B0F17]/95 md:bg-[#0B0F17]/90 backdrop-blur-2xl border-r border-[#1E293B] p-6 flex flex-col justify-between shadow-2xl transition-transform duration-300 transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-black tracking-widest bg-gradient-to-r from-[#F8FAFC] via-[#38BDF8] to-[#10B981] bg-clip-text text-transparent">
                WINTER ARC ❄️
              </h1>
              <p className="text-xs text-[#64748B] font-medium mt-1">1 Oct '26 – 28 Feb '27</p>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-[#94A3B8] hover:text-white p-2 rounded-lg bg-[#131B2E]"
            >
              ✕
            </button>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-[#38BDF8] to-[#2563EB] text-white shadow-lg shadow-[#38BDF8]/25 translate-x-1'
                  : 'text-[#94A3B8] hover:bg-[#131B2E] hover:text-[#F8FAFC]'
              }`}
            >
              <span>⚡</span> Dashboard
            </button>
            <button
              onClick={() => { setActiveTab('analytics'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-[#38BDF8] to-[#2563EB] text-white shadow-lg shadow-[#38BDF8]/25 translate-x-1'
                  : 'text-[#94A3B8] hover:bg-[#131B2E] hover:text-[#F8FAFC]'
              }`}
            >
              <span>📊</span> Analytics Heatmap
            </button>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-[#1E293B]">
          <div className="bg-[#111827] p-4 rounded-2xl border border-[#1F2937] text-center shadow-inner">
            <span className="block text-[#38BDF8] font-extrabold text-lg mb-0.5">{daysLeft}</span>
            <span className="text-xs text-[#94A3B8] font-medium uppercase tracking-wider">Days Left to Conquer</span>
          </div>
        </div>
      </aside>

      <div className="flex-1 p-4 md:p-10 relative z-20 overflow-y-auto max-w-5xl mx-auto w-full">
        <header className="flex justify-between items-center mb-8 border-b border-[#1E293B] pb-6 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden bg-[#0B0F17] border border-[#1E293B] p-2.5 rounded-xl text-[#38BDF8] shadow-lg hover:border-[#38BDF8] transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-[#F8FAFC]">
                {activeTab === 'dashboard' ? 'Command Center' : 'Execution Matrix'}
              </h2>
              <p className="text-xs text-[#94A3B8] mt-0.5 font-medium hidden sm:block">Build unstoppable momentum every single day.</p>
            </div>
          </div>

          <div className="bg-[#0B0F17] border border-[#1E293B] px-4 py-2 md:px-5 md:py-2.5 rounded-2xl text-center shadow-lg shrink-0">
            <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-[#94A3B8] block">Today's Progress</span>
            <span className="text-xs md:text-sm font-black text-[#38BDF8]">
              {completedCount} Done <span className="text-[#64748B] font-normal">({remainingCount} left)</span>
            </span>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <>
            <div className="bg-gradient-to-r from-[#0B0F17] via-[#111827] to-[#0B0F17] backdrop-blur-xl border border-[#38BDF8]/30 p-4 md:p-5 rounded-2xl shadow-2xl mb-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#38BDF8]" />
              <p className="text-xs md:text-base italic text-[#38BDF8] font-semibold tracking-wide">{dailyQuote}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-[#0B0F17]/90 backdrop-blur-xl border border-[#1E293B] p-4 md:p-5 rounded-2xl shadow-xl hover:border-[#38BDF8]/50 transition-all">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Current Journey</h3>
                <p className="text-xl md:text-2xl font-black mt-2 text-[#F8FAFC]">Day {currentDay} <span className="text-xs text-[#64748B] font-normal">/ {totalDays}</span></p>
              </div>
              <div className="bg-[#0B0F17]/90 backdrop-blur-xl border border-[#1E293B] p-4 md:p-5 rounded-2xl shadow-xl hover:border-[#10B981]/50 transition-all">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Total Tasks Completed</h3>
                <p className="text-xl md:text-2xl font-black mt-2 text-[#10B981]">{totalTasksCompletedAllTime} <span className="text-xs font-normal text-[#64748B]">Actions</span></p>
              </div>
              <div className="bg-[#0B0F17]/90 backdrop-blur-xl border border-[#1E293B] p-4 md:p-5 rounded-2xl shadow-xl hover:border-[#38BDF8]/50 transition-all">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Completion Rate</h3>
                <div className="w-full bg-[#030712] h-2.5 rounded-full mt-3 overflow-hidden border border-[#1E293B]">
                  <div 
                    className="bg-gradient-to-r from-[#38BDF8] to-[#10B981] h-full transition-all duration-700 shadow-lg" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <section className="bg-[#0B0F17]/90 backdrop-blur-xl border border-[#1E293B] rounded-2xl p-4 md:p-5 shadow-xl mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3">➕ Add Custom Daily Goal</h3>
              <form onSubmit={addCustomHabit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  placeholder="e.g., Solve 2 LeetCode problems..."
                  className="flex-1 bg-[#030712] border border-[#1E293B] rounded-xl px-4 py-3 text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#38BDF8] transition-all font-medium text-sm"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#38BDF8] to-[#2563EB] hover:opacity-90 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-[#38BDF8]/20 transition-all text-sm"
                >
                  Add Goal
                </button>
              </form>
            </section>

            <section className="bg-[#0B0F17]/90 backdrop-blur-xl border border-[#1E293B] rounded-2xl p-4 md:p-6 shadow-xl mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                <h3 className="text-base md:text-lg font-black flex items-center gap-2 text-[#F8FAFC]">
                  <span>🔥 Today's Discipline Checklist</span>
                </h3>
                <button
                  onClick={resetTodayProgress}
                  className="text-xs font-semibold bg-[#131B2E] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] px-3.5 py-2 rounded-xl border border-[#1E293B] transition-all"
                >
                  🔄 Reset Today's Progress
                </button>
              </div>

              {isAllCompleted && (
                <div className="mb-6 bg-gradient-to-r from-[#064E3B]/80 to-[#022C22]/80 border border-[#10B981] p-4 rounded-xl text-center shadow-2xl animate-bounce">
                  <p className="text-sm md:text-base font-extrabold text-[#34D399]">❄️ LEGENDARY! All Today's Goals Conquered! 🔥</p>
                </div>
              )}

              <div className="space-y-3">
                {habits.map((habit) => (
                  <div
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className={`flex items-center justify-between p-3.5 md:p-4 rounded-xl border cursor-pointer transition-all duration-300 group ${
                      habit.completed
                        ? 'bg-[#064E3B]/20 border-[#10B981]/50 text-[#34D399] shadow-md shadow-[#10B981]/10'
                        : 'bg-[#030712]/60 border-[#1E293B] hover:border-[#38BDF8]/40 text-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                      <span className="text-xl md:text-2xl shrink-0">{habit.icon}</span>
                      <span className={`font-semibold text-sm md:text-base truncate ${habit.completed ? 'line-through opacity-75' : ''}`}>
                        {habit.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        onClick={(e) => deleteHabit(habit.id, e)}
                        title="Delete Goal"
                        className="opacity-80 md:opacity-40 group-hover:opacity-100 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-all"
                      >
                        🗑️
                      </button>

                      <div className={`w-5 h-5 md:w-6 md:h-6 rounded-lg border flex items-center justify-center transition-all ${
                        habit.completed ? 'bg-[#10B981] border-[#10B981] text-black font-black text-xs' : 'border-[#475569]'
                      }`}>
                        {habit.completed && '✓'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-[#0B0F17]/90 backdrop-blur-xl border border-[#1E293B] p-4 md:p-5 rounded-2xl shadow-xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Total Perfect Days</h3>
                <p className="text-xl md:text-2xl font-black mt-2 text-[#38BDF8]">{totalDaysFull} <span className="text-xs text-[#64748B] font-normal">Days</span></p>
              </div>
              <div className="bg-[#0B0F17]/90 backdrop-blur-xl border border-[#1E293B] p-4 md:p-5 rounded-2xl shadow-xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Total Tasks Done</h3>
                <p className="text-xl md:text-2xl font-black mt-2 text-[#10B981]">{totalTasksCompletedAllTime} <span className="text-xs text-[#64748B] font-normal">Actions</span></p>
              </div>
              <div className="bg-[#0B0F17]/90 backdrop-blur-xl border border-[#1E293B] p-4 md:p-5 rounded-2xl shadow-xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Partial Days</h3>
                <p className="text-xl md:text-2xl font-black mt-2 text-[#F8FAFC]">{totalDaysPartial} <span className="text-xs text-[#64748B] font-normal">Days</span></p>
              </div>
              <div className="bg-[#0B0F17]/90 backdrop-blur-xl border border-[#1E293B] p-4 md:p-5 rounded-2xl shadow-xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Consistency Score</h3>
                <p className="text-xl md:text-2xl font-black mt-2 text-[#38BDF8]">{overallConsistencyRate}%</p>
              </div>
            </div>

            <section className="bg-[#0B0F17]/90 backdrop-blur-xl border border-[#1E293B] rounded-2xl p-4 md:p-6 shadow-xl mb-8">
              <h3 className="text-base md:text-lg font-black mb-1 text-[#F8FAFC]">❄️ Winter Arc Execution Heatmap</h3>
              <p className="text-xs text-[#94A3B8] mb-6 font-medium">Visual GitHub-style record from Oct 1, 2026 to Feb 28, 2027.</p>

              <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-12 gap-2">
                {calendarDays.map((item, index) => {
                  let bgColor = 'bg-[#030712] border-[#1E293B] text-[#64748B]';
                  if (item.status === 'full') bgColor = 'bg-gradient-to-br from-[#38BDF8] to-[#2563EB] border-[#38BDF8] text-white shadow-lg shadow-[#38BDF8]/30 font-black';
                  else if (item.status === 'partial') bgColor = 'bg-[#10B981] border-[#10B981] text-black font-black';

                  return (
                    <div
                      key={index}
                      title={`${item.dateStr}: ${item.status.toUpperCase()}`}
                      className={`h-12 rounded-xl border flex flex-col items-center justify-center text-xs transition-all ${bgColor}`}
                    >
                      <span>{item.dayNum}</span>
                      <span className="text-[9px] opacity-80">{item.monthName}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-8 pt-6 border-t border-[#1E293B] text-xs text-[#94A3B8] font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#38BDF8]" />
                  <span>All Goals Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#10B981]" />
                  <span>Partial Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#030712] border border-[#1E293B]" />
                  <span>Skipped / No Data</span>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
