import { useEffect, useMemo, useRef, useState } from 'react'
import { Play, Pause, RotateCcw, Timer } from 'lucide-react'
import { useFocus } from '../stores/focus'
import { useGami } from '../stores/gamification'
import { motion } from 'framer-motion'

type Preset = { focus: number; brk: number; label: string }
const PRESETS: Preset[] = [
  { focus: 25, brk: 5, label: '25 / 5' },
  { focus: 50, brk: 10, label: '50 / 10' },
]

export default function Focus() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0])
  const [custom, setCustom] = useState<{ focus: number; brk: number }>({ focus: 45, brk: 15 })
  const [phase, setPhase] = useState<'focus' | 'break'>('focus')
  const [remaining, setRemaining] = useState(PRESETS[0].focus * 60)
  const [running, setRunning] = useState(false)
  const startedAtRef = useRef<string | null>(null)
  const { sessions, logSession } = useFocus()
  const addXP = useGami(s => s.addXP)

  const active = useMemo(() => (preset.label === 'custom' ? custom : preset), [preset, custom])

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          // phase completed
          const wasFocus = phase === 'focus'
          if (wasFocus) {
            addXP(15)
            logSession({
              startedAt: startedAtRef.current ?? new Date().toISOString(),
              endedAt: new Date().toISOString(),
              focusMinutes: active.focus,
              breakMinutes: 0,
            })
          }
          const nextPhase: 'focus' | 'break' = wasFocus ? 'break' : 'focus'
          setPhase(nextPhase)
          startedAtRef.current = new Date().toISOString()
          return (nextPhase === 'focus' ? active.focus : active.brk) * 60
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running, phase, active, logSession, addXP])

  function start() { if (!startedAtRef.current) startedAtRef.current = new Date().toISOString(); setRunning(true) }
  function pause() { setRunning(false) }
  function reset() {
    setRunning(false); setPhase('focus'); setRemaining(active.focus * 60); startedAtRef.current = null
  }

  useEffect(() => { setRemaining(active.focus * 60); setPhase('focus') }, [active.focus, active.brk])

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  const total = (phase === 'focus' ? active.focus : active.brk) * 60
  const progress = 1 - remaining / total

  const totalFocus = sessions.reduce((a, s) => a + s.focusMinutes, 0)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Timer /> Focus</h1>
        <p className="text-slate-500 text-sm">Pomodoro timer with focus/break tracking.</p>
      </div>

      <div className="card p-6 flex flex-col items-center gap-4">
        <div className="flex gap-2 flex-wrap justify-center">
          {PRESETS.map(p => (
            <button key={p.label} className={`btn-outline ${preset === p ? 'ring-2 ring-brand-500' : ''}`} onClick={() => setPreset(p)}>{p.label}</button>
          ))}
          <div className="flex items-center gap-1 text-sm">
            <span>Custom:</span>
            <input type="number" className="input w-16" value={custom.focus} onChange={e => setCustom(c => ({ ...c, focus: Number(e.target.value) || 1 }))} />
            <span>/</span>
            <input type="number" className="input w-16" value={custom.brk} onChange={e => setCustom(c => ({ ...c, brk: Number(e.target.value) || 1 }))} />
            <button className={`btn-outline ${preset.label === 'custom' ? 'ring-2 ring-brand-500' : ''}`} onClick={() => setPreset({ ...custom, label: 'custom' })}>Use</button>
          </div>
        </div>

        <div className="relative w-64 h-64">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="6" />
            <motion.circle
              cx="50" cy="50" r="46" fill="none"
              stroke={phase === 'focus' ? '#3b63f5' : '#10b981'}
              strokeWidth="6" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 46}
              strokeDashoffset={2 * Math.PI * 46 * (1 - progress)}
              transition={{ ease: 'linear' }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center flex-col text-center">
            <div className="text-5xl font-extrabold tabular-nums">{mm}:{ss}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">{phase}</div>
          </div>
        </div>

        <div className="flex gap-2">
          {!running ? (
            <button className="btn-primary" onClick={start}><Play size={16} /> Start</button>
          ) : (
            <button className="btn-outline" onClick={pause}><Pause size={16} /> Pause</button>
          )}
          <button className="btn-ghost" onClick={reset}><RotateCcw size={16} /> Reset</button>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Session log</h3>
          <span className="text-sm text-slate-500">{totalFocus}m total focus</span>
        </div>
        <ul className="mt-2 text-sm divide-y divide-slate-200 dark:divide-slate-800">
          {sessions.slice(0, 8).map(s => (
            <li key={s.id} className="py-2 flex justify-between">
              <span>{new Date(s.startedAt).toLocaleString()}</span>
              <span className="text-slate-500">{s.focusMinutes} min</span>
            </li>
          ))}
          {sessions.length === 0 && <li className="py-4 text-center text-slate-500">No sessions yet.</li>}
        </ul>
      </div>
    </div>
  )
}
