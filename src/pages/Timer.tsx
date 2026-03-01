import { useState, useEffect, useRef, useCallback } from 'react'
import Layout from '../components/Layout'

type TimerMode = 'pomodoro' | 'short' | 'long' | 'custom'

const TIMER_DEFAULTS = {
  pomodoro: { label: 'Pomodoro', minutes: 25, seconds: 0 },
  short: { label: 'Short Break', minutes: 5, seconds: 0 },
  long: { label: 'Long Break', minutes: 10, seconds: 0 },
}

export default function Timer() {
  const [mode, setMode] = useState<TimerMode>('pomodoro')
  const [timeLeft, setTimeLeft] = useState(25 * 60) // seconds
  const [isRunning, setIsRunning] = useState(false)
  const [message, setMessage] = useState('Select a timer and press START.')
  const [customMin, setCustomMin] = useState(0)
  const [customSec, setCustomSec] = useState(0)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const endTimeRef = useRef<number | null>(null)

  function formatTime(totalSec: number) {
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  function stop() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
    endTimeRef.current = null
    setIsRunning(false)
  }

  function reset() {
    stop()
    if (mode === 'custom') {
      setTimeLeft(customMin * 60 + customSec)
    } else {
      const def = TIMER_DEFAULTS[mode as keyof typeof TIMER_DEFAULTS]
      setTimeLeft(def.minutes * 60 + def.seconds)
    }
    setMessage('')
  }

  function selectMode(newMode: TimerMode) {
    stop()
    setMode(newMode)
    setShowCustomInput(newMode === 'custom')
    if (newMode !== 'custom') {
      const def = TIMER_DEFAULTS[newMode as keyof typeof TIMER_DEFAULTS]
      setTimeLeft(def.minutes * 60 + def.seconds)
    }
    setMessage('')
  }

  function startCustom() {
    const total = customMin * 60 + customSec
    if (total <= 0) { setMessage('Please enter a valid time.'); return }
    setTimeLeft(total)
    setShowCustomInput(false)
    // start immediately
    startTimer(total)
  }

  function startTimer(totalSec?: number) {
    const seconds = totalSec !== undefined ? totalSec : timeLeft
    if (seconds <= 0) { setMessage('Please reset or select a timer.'); return }
    stop()
    const endTime = Date.now() + seconds * 1000
    endTimeRef.current = endTime
    setIsRunning(true)
    setMessage('')

    intervalRef.current = window.setInterval(() => {
      const remaining = Math.round((endTimeRef.current! - Date.now()) / 1000)
      if (remaining <= 0) {
        stop()
        setTimeLeft(0)
        setMessage("⏰ Time's up!")
        try { new Audio('/alarm_clock.mp3').play() } catch {}
        // Save study time
        const today = new Date().toISOString().split('T')[0]
        const key = `studyTime_${today}`
        const prev = parseInt(localStorage.getItem(key) || '0')
        localStorage.setItem(key, String(prev + seconds))
      } else {
        setTimeLeft(remaining)
      }
    }, 500)
  }

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const currentLabel = mode === 'custom' ? 'Custom Timer' : TIMER_DEFAULTS[mode as keyof typeof TIMER_DEFAULTS].label

  // Percentage for circular progress
  const totalDefault = mode === 'custom'
    ? (customMin * 60 + customSec) || 1
    : TIMER_DEFAULTS[mode as keyof typeof TIMER_DEFAULTS].minutes * 60
  const progress = mode === 'custom' && (customMin === 0 && customSec === 0)
    ? 0
    : ((totalDefault - timeLeft) / totalDefault) * 100

  const radius = 110
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <Layout>
      <div>
        {/* Navbar */}
        <nav className="flex items-center justify-between px-4 py-3 border-b border-white/20 mb-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <i className="fas fa-clock text-green-400" /> Pomodoro Timer
          </h2>
        </nav>

        <div className="flex flex-col items-center gap-6 px-2">
          {/* Mode Buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            {(['pomodoro', 'short', 'long', 'custom'] as TimerMode[]).map(m => (
              <button
                key={m}
                onClick={() => selectMode(m)}
                className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${mode === m
                  ? 'text-black shadow-lg'
                  : 'bg-[#2e325a] text-white hover:bg-[#3e4268]'
                }`}
                style={mode === m ? { background: 'linear-gradient(to right, #24f4b2, #52e5b6)' } : {}}
              >
                {m === 'pomodoro' ? 'Pomodoro' : m === 'short' ? 'Short Break' : m === 'long' ? 'Long Break' : 'Custom'}
              </button>
            ))}
          </div>

          {/* Mode Label */}
          <p className="text-white/70 text-sm uppercase tracking-widest font-semibold">{currentLabel}</p>

          {/* Custom Input */}
          {showCustomInput && (
            <div className="flex items-center gap-3 animate-fade-in">
              <input
                type="number"
                min={0}
                max={999}
                value={customMin || ''}
                onChange={e => setCustomMin(parseInt(e.target.value) || 0)}
                placeholder="Min"
                className="w-20 p-2 rounded-lg text-center border-none outline-none text-gray-800 font-bold text-sm"
              />
              <span className="text-white font-bold text-xl">:</span>
              <input
                type="number"
                min={0}
                max={59}
                value={customSec || ''}
                onChange={e => setCustomSec(parseInt(e.target.value) || 0)}
                placeholder="Sec"
                className="w-20 p-2 rounded-lg text-center border-none outline-none text-gray-800 font-bold text-sm"
              />
              <button
                onClick={startCustom}
                className="px-4 py-2 rounded-lg font-bold text-black text-sm"
                style={{ background: 'linear-gradient(to right, #24f4b2, #52e5b6)' }}
              >
                Start Custom
              </button>
            </div>
          )}

          {/* Circular Timer */}
          <div className="relative flex items-center justify-center w-64 h-64">
            <svg className="absolute" width="260" height="260" viewBox="0 0 260 260">
              {/* Background circle */}
              <circle
                cx="130" cy="130" r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="12"
              />
              {/* Progress circle */}
              <circle
                cx="130" cy="130" r={radius}
                fill="none"
                stroke={isRunning ? '#2ebf91' : '#8360c3'}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 130 130)"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div className="relative text-center">
              <div className="timer-display" style={{ fontSize: '3.5rem' }}>{formatTime(timeLeft)}</div>
              {isRunning && (
                <p className="text-green-400 text-xs font-semibold animate-pulse mt-1">● RUNNING</p>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={() => startTimer()}
              disabled={isRunning}
              className={`px-6 py-3 rounded-lg font-bold text-sm transition-all ${isRunning ? 'opacity-40 cursor-not-allowed bg-[#2e325a] text-white' : 'bg-[#2e325a] text-white hover:bg-red-500'}`}
            >
              <i className="fas fa-play mr-2" />START
            </button>
            <button
              onClick={stop}
              disabled={!isRunning}
              className={`px-6 py-3 rounded-lg font-bold text-sm transition-all ${!isRunning ? 'opacity-40 cursor-not-allowed bg-[#2e325a] text-white' : 'bg-[#2e325a] text-white hover:bg-orange-500'}`}
            >
              <i className="fas fa-pause mr-2" />STOP
            </button>
            <button
              onClick={reset}
              className="px-6 py-3 rounded-lg font-bold text-sm bg-[#2e325a] text-white hover:bg-[#4a4f78] transition-all"
            >
              <i className="fas fa-redo mr-2" />RESET
            </button>
          </div>

          {/* Message */}
          {message && (
            <p className="text-white font-bold text-lg text-center animate-bounce">{message}</p>
          )}

          {/* Session Stats */}
          <div className="glass-card p-4 w-full max-w-md text-center mt-2">
            <h4 className="text-white font-semibold mb-2 text-sm">📊 Today's Study Time</h4>
            {(() => {
              const today = new Date().toISOString().split('T')[0]
              const total = parseInt(localStorage.getItem(`studyTime_${today}`) || '0')
              const mins = Math.floor(total / 60)
              const hrs = (mins / 60).toFixed(1)
              return (
                <p className="text-green-400 font-bold text-2xl">
                  {mins < 60 ? `${mins} min` : `${hrs} hrs`}
                </p>
              )
            })()}
            <p className="text-white/50 text-xs mt-1">Total study time recorded today</p>
          </div>

          {/* Tips */}
          <div className="glass-card p-4 w-full max-w-md">
            <h4 className="text-purple-300 font-semibold mb-2 text-sm">💡 Pomodoro Tips</h4>
            <ul className="text-white/70 text-xs space-y-1 list-disc list-inside">
              <li>Work for 25 minutes, then take a 5-minute short break</li>
              <li>After 4 pomodoros, take a longer 15-30 minute break</li>
              <li>During breaks, step away from your screen</li>
              <li>Turn off notifications during focus sessions</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  )
}
