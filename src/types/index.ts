// Types for the Study Dashboard app

export interface User {
  name: string
  email: string
  password: string
}

export interface Task {
  id: string
  name: string
  completed: boolean
  date?: string
}

export interface StickyNote {
  id: number
  content: string
}

export interface TodoItem {
  name: string
  status: 'pending' | 'completed'
}

export interface PlannerData {
  tasks: Task[]
  timeBlocks: Record<string, Record<string, string>>
  habits: string[]
  habitLog: Record<string, Record<string, boolean>>
  goals: { daily: string; weekly: string }
  brainDump: string
  reminder: string
}
