import { useState, useEffect, useCallback } from 'react'
import Layout from '../components/Layout'
import { PlannerData, Task } from '../types'

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES = ['SUN','MON','TUE','WED','THU','FRI','SAT']
const TIME_SLOTS_MORNING = ['6:00 AM','7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM']
const TIME_SLOTS_AFTERNOON = ['12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM']
const TIME_SLOTS_EVENING = ['6:00 PM','7:00 PM','8:00 PM','9:00 PM','10:00 PM','11:00 PM']
const ALL_TIME_SLOTS = [...TIME_SLOTS_MORNING, ...TIME_SLOTS_AFTERNOON, ...TIME_SLOTS_EVENING]

const DEFAULT_DATA: PlannerData = {
  tasks: [],
  timeBlocks: {},
  habits: ['Study 60 min', 'Drink 8 glasses water'],
  habitLog: {},
  goals: { daily: '', weekly: '' },
  brainDump: '',
  reminder: '',
}

function uuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36) }

export default function Planner() {
  const today = new Date().toISOString().split('T')[0]
  const [data, setData] = useState<PlannerData>(DEFAULT_DATA)
  const [selectedDate, setSelectedDate] = useState(today)
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth())
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear())
  const [todoInput, setTodoInput] = useState('')
  const [habitModalOpen, setHabitModalOpen] = useState(false)
  const [newHabitInput, setNewHabitInput] = useState('')
  const [clock, setClock] = useState(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all')

  // Load data
  useEffect(() => {
    const stored = localStorage.getItem('studyPlannerData')
    if (stored) {
      const parsed = JSON.parse(stored) as PlannerData
      if (!parsed.habitLog[today]) parsed.habitLog[today] = {}
      setData(parsed)
    } else {
      const init = { ...DEFAULT_DATA, habitLog: { [today]: {} } }
      localStorage.setItem('studyPlannerData', JSON.stringify(init))
      setData(init)
    }
  }, [today])

  // Clock
  useEffect(() => {
    const interval = setInterval(() => {
      setClock(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const save = useCallback((updated: PlannerData) => {
    setData(updated)
    localStorage.setItem('studyPlannerData', JSON.stringify(updated))
  }, [])

  // Calendar
  function renderCalendarDays() {
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay()
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate()
    const cells: JSX.Element[] = []
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`e${i}`} />)
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
      const isToday = dateStr === today
      const isSelected = dateStr === selectedDate
      cells.push(
        <div
          key={d}
          className={`day-cell ${isToday ? 'current-day' : ''} ${isSelected && !isToday ? 'is-selected' : ''}`}
          onClick={() => setSelectedDate(dateStr)}
        >
          {d}
        </div>
      )
    }
    return cells
  }

  function changeMonth(delta: number) {
    let m = calendarMonth + delta
    let y = calendarYear
    if (m > 11) { m = 0; y++ }
    if (m < 0) { m = 11; y-- }
    setCalendarMonth(m)
    setCalendarYear(y)
  }

  // Tasks
  function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!todoInput.trim()) return
    const newTask: Task = { id: uuid(), name: todoInput.trim(), completed: false, date: selectedDate }
    const updated = { ...data, tasks: [...data.tasks, newTask] }
    save(updated)
    setTodoInput('')
  }

  function toggleTask(id: string) {
    const updated = { ...data, tasks: data.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t) }
    save(updated)
  }

  function deleteTask(id: string) {
    const updated = { ...data, tasks: data.tasks.filter(t => t.id !== id) }
    save(updated)
  }

  const filteredTasks = data.tasks.filter(t => {
    if (filterStatus === 'all') return true
    if (filterStatus === 'completed') return t.completed
    return !t.completed
  })

  // Time blocks
  function updateTimeBlock(slot: string, value: string) {
    const blocks = { ...(data.timeBlocks[selectedDate] || {}), [slot]: value }
    const updated = { ...data, timeBlocks: { ...data.timeBlocks, [selectedDate]: blocks } }
    save(updated)
  }

  // Habits
  function toggleHabit(habit: string) {
    const dayLog = { ...(data.habitLog[today] || {}) }
    dayLog[habit] = !dayLog[habit]
    const updated = { ...data, habitLog: { ...data.habitLog, [today]: dayLog } }
    save(updated)
  }

  function addHabit(e: React.FormEvent) {
    e.preventDefault()
    if (!newHabitInput.trim()) return
    const updated = { ...data, habits: [...data.habits, newHabitInput.trim()] }
    save(updated)
    setNewHabitInput('')
  }

  function removeHabit(habit: string) {
    const updated = { ...data, habits: data.habits.filter(h => h !== habit) }
    save(updated)
  }

  // Streak
  function calculateStreak() {
    let streak = 0
    let d = new Date()
    while (true) {
      const ds = d.toISOString().split('T')[0]
      const log = data.habitLog[ds]
      if (!log || Object.values(log).every(v => !v)) break
      streak++
      d.setDate(d.getDate() - 1)
    }
    return streak
  }

  const todayHabitLog = data.habitLog[today] || {}
  const doneCount = data.habits.filter(h => todayHabitLog[h]).length

  const todayBlocks = (data.timeBlocks[selectedDate] || {})

  return (
    <Layout>
      <div>
        {/* Navbar */}
        <nav className="flex items-center justify-between px-4 py-3 border-b border-white/20 mb-6 flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <i className="fas fa-chart-line text-green-400" /> Study Command Center
          </h1>
          <span className="text-xl font-mono text-green-400">{clock}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 px-1">
          {/* Column 1: Calendar + To-Do */}
          <div className="space-y-5">
            {/* Calendar */}
            <div className="glass-card p-4">
              <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="text-purple-300 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10">
                  <i className="fas fa-chevron-left" />
                </button>
                <h2 className="text-lg font-semibold text-white">{MONTH_NAMES[calendarMonth]} {calendarYear}</h2>
                <button onClick={() => changeMonth(1)} className="text-purple-300 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10">
                  <i className="fas fa-chevron-right" />
                </button>
              </div>
              <div className="calendar-grid text-xs font-semibold text-gray-400 mb-2">
                {DAY_NAMES.map(d => <span key={d} className="text-center">{d}</span>)}
              </div>
              <div className="calendar-grid">{renderCalendarDays()}</div>
              <p className="mt-3 text-center text-xs text-purple-300">
                Selected: <span className="text-white font-semibold">{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </p>
            </div>

            {/* To-Do List */}
            <div className="glass-card p-4">
              <h3 className="text-lg font-bold text-purple-300 mb-3 flex items-center gap-2">
                <i className="fas fa-list-check" /> Project Submission
              </h3>
              <form onSubmit={addTask} className="flex gap-2 mb-3">
                <input
    value={todoInput}
    onChange={e => setTodoInput(e.target.value)}
    placeholder="New project..."
    
    className="w-[80%] p-2 rounded-md bg-gray-700 text-white border-none outline-none focus:ring-2 focus:ring-purple-500 text-sm min-w-0"
  />
  <button 
    type="submit" 
    
    className="flex-1 flex-shrink-0 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-md transition-colors flex items-center justify-center min-w-[40px]"
  >
    <i className="fas fa-plus" />
  </button>
              </form>
              {/* Filter tabs */}
              <div className="flex gap-3 mb-3 text-sm">
                {(['all','pending','completed'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilterStatus(f)}
                    className={`capitalize px-2 py-0.5 rounded transition-colors ${filterStatus === f ? 'text-purple-300 font-bold' : 'text-white/50 hover:text-white'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {filteredTasks.length === 0 && <li className="text-white/40 text-sm text-center py-2">No tasks here</li>}
                {filteredTasks.map(task => (
                  <li key={task.id} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 group">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="accent-purple-500 w-4 h-4 cursor-pointer"
                    />
                    <span className={`flex-1 text-sm ${task.completed ? 'line-through text-white/40' : 'text-white/90'}`}>{task.name}</span>
                    <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all text-xs">
                      <i className="fas fa-trash" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 2: Time Blocks */}
          <div className="lg:col-span-2">
            <div className="glass-card p-5">
              <h2 className="text-xl font-bold text-purple-300 mb-4 flex items-center gap-2">
                <i className="fas fa-hourglass-half" /> Daily Time Block Schedule
              </h2>
              <div className="max-h-[70vh] overflow-y-auto pr-1 space-y-5">
                {[
                  { label: '🌅 Morning', slots: TIME_SLOTS_MORNING },
                  { label: '☀️ Afternoon', slots: TIME_SLOTS_AFTERNOON },
                  { label: '🌙 Evening', slots: TIME_SLOTS_EVENING },
                ].map(section => (
                  <div key={section.label}>
                    <h3 className="text-sm font-bold text-green-400 border-b border-green-400/30 pb-1 mb-2">{section.label}</h3>
                    <div className="space-y-1">
                      {section.slots.map(slot => (
                        <div key={slot} className="flex items-center gap-3 py-1.5 border-b border-white/5 hover:bg-white/5 rounded px-1">
                          <span className="text-purple-300 font-mono text-xs w-20 min-w-[80px]">{slot}</span>
                          <input
                            type="text"
                            className="time-block-input"
                            placeholder="Add task..."
                            value={todayBlocks[slot] || ''}
                            onChange={e => updateTimeBlock(slot, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3: Habits + Goals + Brain Dump */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Habit Tracker */}
            <div className="glass-card p-4">
              <h3 className="text-lg font-bold text-purple-300 mb-3 flex items-center gap-2">
                <i className="fas fa-fire-alt" /> Habit Tracker
              </h3>
              <div className="space-y-2 mb-3">
                {data.habits.map(habit => {
                  const done = !!(todayHabitLog[habit])
                  return (
                    <div
                      key={habit}
                      onClick={() => toggleHabit(habit)}
                      className={`habit-item ${done ? 'is-done' : 'is-pending'}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs ${done ? 'bg-green-400 border-green-400' : 'border-purple-400'}`}>
                          {done && <i className="fas fa-check text-white text-[10px]" />}
                        </span>
                        <span className={`text-sm font-medium ${done ? 'line-through text-white/50' : 'text-white/90'}`}>{habit}</span>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: done ? '100%' : '0%', background: '#6ee7b7', boxShadow: '0 0 6px #6ee7b7' }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              <button
                onClick={() => setHabitModalOpen(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl text-sm transition-colors"
              >
                Manage Habits
              </button>
              <p className="text-center mt-2 text-lg font-semibold text-yellow-400">
                🔥 Streak: {calculateStreak()} Day{calculateStreak() !== 1 ? 's' : ''}
              </p>
              <p className="text-center text-xs text-white/50 mt-1">
                {doneCount}/{data.habits.length} habits today
              </p>
            </div>

            {/* Goals & Reminders */}
            <div className="glass-card p-4 space-y-4">
              <h3 className="text-lg font-bold text-purple-300 flex items-center gap-2">
                <i className="fas fa-bullseye" /> Goals
              </h3>
              <div>
                <h4 className="font-semibold text-white text-sm mb-1">Daily Goal</h4>
                <input
                  type="text"
                  placeholder="e.g., Complete 3 pomodoros"
                  className="w-full p-2 rounded-xl bg-gray-700/80 text-white text-sm outline-none focus:ring-2 focus:ring-purple-400"
                  value={data.goals.daily}
                  onChange={e => save({ ...data, goals: { ...data.goals, daily: e.target.value } })}
                />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm mb-1">Weekly Goal</h4>
                <input
                  type="text"
                  placeholder="e.g., Write 5000 words"
                  className="w-full p-2 rounded-xl bg-gray-700/80 text-white text-sm outline-none focus:ring-2 focus:ring-purple-400"
                  value={data.goals.weekly}
                  onChange={e => save({ ...data, goals: { ...data.goals, weekly: e.target.value } })}
                />
              </div>
              <div className="border-t border-gray-700 pt-3 reminder-card rounded-xl p-3">
                <h3 className="text-lg font-bold text-red-400 mb-2 flex items-center gap-2">
                  <i className="fas fa-bell" /> Urgent Reminder
                </h3>
                <input
                  type="text"
                  placeholder="e.g., Call Tutor before 5 PM"
                  className="w-full p-2 rounded-xl bg-gray-700/80 text-red-300 border-2 border-red-500/50 text-sm outline-none"
                  value={data.reminder}
                  onChange={e => save({ ...data, reminder: e.target.value })}
                />
              </div>
            </div>

            {/* Brain Dump */}
            <div className="glass-card p-4">
              <h3 className="text-lg font-bold text-purple-300 mb-3 flex items-center gap-2">
                <i className="fas fa-brain" /> Brain Dump
              </h3>
              <textarea
                rows={10}
                placeholder="Quickly capture random thoughts, ideas, or things to follow up on later..."
                className="w-full p-3 rounded-xl bg-gray-700/80 text-white border-none outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm"
                value={data.brainDump}
                onChange={e => save({ ...data, brainDump: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Habit Modal */}
      {habitModalOpen && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="glass-card w-full max-w-lg p-6 space-y-4">
            <h3 className="text-xl font-bold text-purple-300">Manage Habits</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {data.habits.map(habit => (
                <div key={habit} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                  <span className="text-white/90 text-sm">{habit}</span>
                  <button
                    onClick={() => removeHabit(habit)}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    <i className="fas fa-trash" />
                  </button>
                </div>
              ))}
            </div>
            <form onSubmit={addHabit} className="flex items-center gap-2 w-full">
  <input
    value={newHabitInput}
    onChange={e => setNewHabitInput(e.target.value)}
    type="text"
    placeholder="New habit..."
    required
    
    className="w-[70%] p-2 rounded-xl bg-gray-700 text-white outline-none focus:ring-2 focus:ring-purple-500 text-sm min-w-0"
  />
  <button 
    type="submit" 
    
    className="flex-1 flex-shrink-0 whitespace-nowrap bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-xl transition-colors text-sm flex items-center justify-center gap-1"
  >
    <i className="fas fa-plus" /> 
    <span>Add</span>
  </button>
</form>
            <button
              onClick={() => setHabitModalOpen(false)}
              className="w-full bg-gray-600 hover:bg-gray-500 text-white py-2 rounded-xl transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Layout>
  )
}
