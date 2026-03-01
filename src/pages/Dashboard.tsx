import { useEffect, useState, useRef } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import Layout from '../components/Layout'
import { PlannerData } from '../types'

ChartJS.register(ArcElement, Tooltip, Legend)

const DEFAULT_PLANNER: PlannerData = {
  tasks: [],
  timeBlocks: {},
  habits: [],
  habitLog: {},
  goals: { daily: '', weekly: '' },
  brainDump: '',
  reminder: '',
}

export default function Dashboard() {
  const [quote, setQuote] = useState({ text: '', author: '' })
  const [quoteLoading, setQuoteLoading] = useState(true)
  const [hoursStudied, setHoursStudied] = useState(0)
  const [hoursUnit, setHoursUnit] = useState('MINUTES')
  const [plannerData, setPlannerData] = useState<PlannerData>(DEFAULT_PLANNER)
  const [dueTodayTasks, setDueTodayTasks] = useState<{ time: string; task: string }[]>([])
  const chartRef = useRef(null)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    fetchQuote()
    loadStudyTime()
    loadPlannerData()
    // eslint-disable-next-line
  }, [])

  async function fetchQuote() {
    setQuoteLoading(true)
    try {
      const targetUrl = encodeURIComponent('https://zenquotes.io/api/random')
      const response = await fetch(`https://api.allorigins.win/get?url=${targetUrl}`)
      if (!response.ok) throw new Error('Network error')
      const wrapped = await response.json()
      const data = JSON.parse(wrapped.contents)
      setQuote({ text: data[0].q, author: data[0].a || 'Unknown' })
    } catch {
      setQuote({ text: 'The best view comes after the hardest climb.', author: 'Unknown' })
    } finally {
      setQuoteLoading(false)
    }
  }

  function loadStudyTime() {
    const totalSeconds = parseInt(localStorage.getItem(`studyTime_${today}`) || '0')
    updateHoursDisplay(totalSeconds)
  }

  function updateHoursDisplay(totalSeconds: number) {
    const totalMinutes = totalSeconds / 60
    if (totalMinutes < 60) {
      setHoursStudied(Math.round(totalMinutes))
      setHoursUnit('MINUTES')
    } else {
      setHoursStudied(parseFloat((totalMinutes / 60).toFixed(1)))
      setHoursUnit('HOURS')
    }
  }

  function loadPlannerData() {
    const stored = localStorage.getItem('studyPlannerData')
    if (stored) {
      const data = JSON.parse(stored) as PlannerData
      setPlannerData(data)
      // Load time blocks for today
      const blocks = (data.timeBlocks || {})[today] || {}
      const tasks = Object.entries(blocks)
        .filter(([, task]) => task && task.trim() !== '')
        .map(([time, task]) => ({ time, task }))
      setDueTodayTasks(tasks)
    }
  }

  const total = plannerData.tasks.length
  const completed = plannerData.tasks.filter(t => t.completed).length
  const pending = total - completed

  const chartData = {
    labels: ['Completed', 'Pending'],
    datasets: [{
      data: total === 0 ? [1, 0] : [completed, pending],
      backgroundColor: ['#2ebf91', '#8360c3'],
      borderWidth: 0,
    }],
  }

  const chartOptions = {
    cutout: '70%' as const,
    plugins: {
      legend: { labels: { color: 'white' }, position: 'bottom' as const },
      tooltip: { backgroundColor: 'rgba(0,0,0,0.7)', titleColor: 'white', bodyColor: 'white' },
    },
  }

  return (
    <Layout>
      <div>
        {/* Navbar */}
        <nav className="flex items-center justify-between px-4 py-3 border-b border-white/20 backdrop-blur-sm mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <i className="fas fa-home" /> My Dashboard
          </h2>
          <span className="text-white/80 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </nav>

        <div className="px-2">
          {/* Row 1: Quote + Hours */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Quote Card */}
            <div className="glass-card flex-1 min-w-[260px] p-5 border-2 border-white/20">
              <blockquote>
                <p className="text-lg font-bold italic text-white leading-relaxed">
                  {quoteLoading ? 'Loading quote...' : `"${quote.text}"`}
                </p>
                {!quoteLoading && (
                  <footer className="text-right text-white/60 mt-3 text-sm">— {quote.author}</footer>
                )}
              </blockquote>
              <button
                onClick={fetchQuote}
                className="mt-3 text-xs text-green-300 hover:text-green-100 transition-colors"
              >
                <i className="fas fa-sync-alt mr-1" /> New Quote
              </button>
            </div>

            {/* Hours Studied */}
            <div className="glass-card w-full sm:w-64 p-4 flex flex-col items-center justify-center border-2 border-green-400/40">
              <div
                className="w-36 h-36 rounded-full flex flex-col items-center justify-center text-white shadow-lg mb-3"
                style={{ background: 'radial-gradient(circle, #2ebf91 0%, #8360c3 100%)', boxShadow: '0 0 20px rgba(46,191,145,0.5)' }}
              >
                <span className="text-4xl font-extrabold">{hoursStudied}</span>
                <span className="text-xs font-bold">{hoursUnit}</span>
              </div>
              <p className="text-white font-medium text-sm">Hours Studied Today</p>
            </div>
          </div>

          {/* Row 2: Tasks + Chart */}
          <div className="flex flex-wrap gap-4">
            {/* Tasks for Today */}
            <div className="glass-card flex-1 min-w-[260px] p-4">
              <h4 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                <i className="fas fa-clock text-green-400" /> Task for Today
              </h4>
              {dueTodayTasks.length === 0 ? (
                <p className="text-white/50 text-sm px-2">No time blocks scheduled for today 🕒</p>
              ) : (
                <ul className="space-y-2">
                  {dueTodayTasks.map(({ time, task }) => (
                    <li key={time} className="flex items-center gap-3 py-2 border-b border-white/10">
                      <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-mono min-w-[80px] text-center">{time}</span>
                      <span className="text-white/90 text-sm">{task}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Chart */}
            <div className="glass-card flex-1 min-w-[260px] p-4 border-2 border-white/20 text-center">
              <h4 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                <i className="fas fa-chart-pie text-purple-400" /> Project Completion Overview
              </h4>
              <div className="max-w-[260px] mx-auto">
                <Doughnut ref={chartRef} data={chartData} options={chartOptions} />
              </div>
              <div className="text-white mt-3 text-sm font-semibold">
                {total === 0 ? (
                  <span className="text-white/60">No projects yet. Add some in Planner!</span>
                ) : (
                  <>
                    <span className="font-bold">Total Projects:</span> {total}<br />
                    <span className="text-green-400">✅ Completed: {completed}</span><br />
                    <span className="text-purple-300">⏳ Pending: {pending}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
