import { useState, useEffect, useRef } from 'react'
import Layout from '../components/Layout'
import { StickyNote, TodoItem } from '../types'

export default function Notes() {
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([])
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [todoInput, setTodoInput] = useState('')
  const [isEditTask, setIsEditTask] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')

  useEffect(() => {
    const notes = JSON.parse(localStorage.getItem('sticky-notes') || '[]') as StickyNote[]
    setStickyNotes(notes)
    const t = JSON.parse(localStorage.getItem('todo-list') || '[]') as TodoItem[]
    setTodos(t)
  }, [])

  function saveNotes(notes: StickyNote[]) {
    setStickyNotes(notes)
    localStorage.setItem('sticky-notes', JSON.stringify(notes))
  }

  function saveTodos(t: TodoItem[]) {
    setTodos(t)
    localStorage.setItem('todo-list', JSON.stringify(t))
  }

  function createNote() {
    const newNote: StickyNote = { id: Date.now(), content: 'Write your note here...' }
    saveNotes([...stickyNotes, newNote])
  }

  function updateNoteContent(id: number, content: string) {
    saveNotes(stickyNotes.map(n => n.id === id ? { ...n, content } : n))
  }

  function deleteNote(id: number) {
    saveNotes(stickyNotes.filter(n => n.id !== id))
  }

  function handleTodoKeyUp(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && todoInput.trim()) {
      if (!isEditTask) {
        saveTodos([...todos, { name: todoInput.trim(), status: 'pending' }])
      } else if (editId !== null) {
        saveTodos(todos.map((t, i) => i === editId ? { ...t, name: todoInput.trim() } : t))
        setIsEditTask(false)
        setEditId(null)
      }
      setTodoInput('')
    }
  }

  function toggleStatus(idx: number) {
    saveTodos(todos.map((t, i) => i === idx ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t))
  }

  function editTodo(idx: number) {
    setEditId(idx)
    setIsEditTask(true)
    setTodoInput(todos[idx].name)
  }

  function deleteTodo(idx: number) {
    saveTodos(todos.filter((_, i) => i !== idx))
    setIsEditTask(false)
  }

  function clearAll() {
    saveTodos([])
    setIsEditTask(false)
  }

  const filteredTodos = todos.filter(t => filter === 'all' ? true : t.status === filter)

  return (
    <Layout>
      <div>
        {/* Navbar */}
        <nav className="flex items-center justify-between px-4 py-3 border-b border-white/20 mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <i className="fas fa-sticky-note" /> Notes & Tasks
          </h2>
        </nav>

        <div className="flex flex-wrap gap-6 px-1">
          {/* Sticky Notes Section */}
          <div className="flex-1 min-w-[300px]">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <i className="fas fa-thumbtack text-yellow-400" /> Sticky Notes
              </h3>
              <button
                onClick={createNote}
                className="w-10 h-10 bg-white text-brand-bg rounded-xl flex items-center justify-center text-2xl font-bold hover:scale-105 transition-transform shadow-md"
                title="New Note"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-4">
              {stickyNotes.length === 0 && (
                <p className="text-white/40 text-sm">No sticky notes yet. Click + to add one!</p>
              )}
              {stickyNotes.map(note => (
                <div key={note.id} className="note-container">
                  <textarea
                    className="note-content"
                    value={note.content}
                    onChange={e => updateNoteContent(note.id, e.target.value)}
                    rows={7}
                  />
                  <div className="absolute bottom-2 right-2">
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-xs px-3 py-1.5 rounded-md text-white transition-colors"
                      style={{ background: 'linear-gradient(to right, #503b76, #3a2561)' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* To-Do List Section */}
          <div className="w-full sm:w-auto min-w-[300px] max-w-[420px]">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <i className="fas fa-tasks text-green-400" /> Quick To-Do List
            </h3>
            <div className="glass-card overflow-hidden">
              {/* Input */}
              <div className="px-5 pt-5 pb-3 relative">
                <i className="fas fa-plus-circle absolute left-8 top-1/2 -translate-y-1/2 text-purple-400 text-lg" style={{ top: '55%' }} />
                <input
                  type="text"
                  placeholder={isEditTask ? 'Edit task & press Enter...' : 'Add a new task & press Enter...'}
                  value={todoInput}
                  onChange={e => setTodoInput(e.target.value)}
                  onKeyUp={handleTodoKeyUp}
                  className={`w-full h-12 pl-10 pr-4 rounded-lg border text-sm outline-none ${isEditTask ? 'border-purple-500 bg-purple-900/30 text-white' : 'border-white/20 bg-white/10 text-white placeholder-white/40'}`}
                />
              </div>

              {/* Filter & Clear */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                <div className="flex gap-4">
                  {(['all', 'pending', 'completed'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`text-sm capitalize transition-colors ${filter === f ? 'text-purple-300 font-bold' : 'text-white/50 hover:text-white'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <button
                  onClick={clearAll}
                  disabled={todos.length === 0}
                  className={`text-xs px-3 py-1 rounded text-white transition-all ${todos.length > 0 ? 'opacity-90 cursor-pointer hover:opacity-100' : 'opacity-30 cursor-not-allowed'}`}
                  style={{ background: 'linear-gradient(to right, #503b76, #3a2561)' }}
                >
                  Clear All
                </button>
              </div>

              {/* Task List */}
              <ul className={`px-5 py-3 space-y-3 ${filteredTodos.length >= 5 ? 'max-h-72 overflow-y-auto' : ''}`}>
                {filteredTodos.length === 0 && (
                  <li className="text-white/40 text-sm text-center py-3">No tasks here</li>
                )}
                {filteredTodos.map((todo, idx) => {
                  const realIdx = todos.indexOf(todo)
                  return (
                    <li key={idx} className="flex items-start justify-between gap-2 text-sm pb-3 border-b border-white/10 last:border-0 last:pb-0 group">
                      <label className="flex items-start gap-2 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={todo.status === 'completed'}
                          onChange={() => toggleStatus(realIdx)}
                          className="mt-1 accent-purple-500 w-4 h-4 cursor-pointer"
                        />
                        <p className={`break-words text-white/90 ${todo.status === 'completed' ? 'line-through opacity-50' : ''}`}>
                          {todo.name}
                        </p>
                      </label>
                      <div className="flex-shrink-0 relative group">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => editTodo(realIdx)} className="text-purple-300 hover:text-purple-100 text-xs p-1">
                            <i className="fas fa-pen" />
                          </button>
                          <button onClick={() => deleteTodo(realIdx)} className="text-red-400 hover:text-red-300 text-xs p-1">
                            <i className="fas fa-trash" />
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
