import { useState } from 'react'
import { Sparkles, Mic, Image as ImageIcon } from 'lucide-react'
import { ai } from '../ai'
import { useTasks } from '../stores/tasks'
import { useGami } from '../stores/gamification'

/** Natural-language quick-add. Uses the pluggable AI service to parse input. */
export function QuickAdd() {
  const addMany = useTasks(s => s.addMany)
  const addXP = useGami(s => s.addXP)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e?: React.FormEvent) {
    e?.preventDefault()
    const v = text.trim()
    if (!v) return
    setBusy(true)
    const parsed = await ai.parseNaturalLanguage(v)
    addMany(parsed.map(p => ({
      title: p.title,
      priority: p.priority,
      tags: p.tags,
      dueDate: p.dueDate,
      category: p.category,
      estimatedMinutes: p.estimatedMinutes,
    })))
    addXP(5 * parsed.length)
    setText(''); setBusy(false)
  }

  function startVoice() {
    const SR = (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition; SpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition
      ?? (window as unknown as { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition
    if (!SR) { alert('Voice input not supported in this browser'); return }
    const rec = new SR()
    rec.lang = 'en-US'; rec.interimResults = false
    rec.onresult = (ev: SpeechRecognitionEvent) => setText(prev => (prev ? prev + ' ' : '') + ev.results[0][0].transcript)
    rec.start()
  }

  async function handleImage(f: File) {
    // Stubbed OCR: In production wire to Tesseract.js or a serverless OCR endpoint.
    const name = f.name.replace(/\.[^.]+$/, '')
    addMany([{ title: `From image: ${name}`, tags: ['ocr'], priority: 'medium' }])
    addXP(5)
  }

  return (
    <form onSubmit={submit} className="card p-3 flex items-center gap-2">
      <Sparkles className="text-brand-500 ml-2" size={18} />
      <input
        className="flex-1 bg-transparent outline-none px-2 py-2 text-sm"
        placeholder='Try: "Tomorrow 5pm call John and buy milk #home"'
        value={text} onChange={e => setText(e.target.value)}
      />
      <button type="button" className="btn-ghost" onClick={startVoice} title="Voice input"><Mic size={18} /></button>
      <label className="btn-ghost cursor-pointer" title="Upload image (OCR)">
        <ImageIcon size={18} />
        <input hidden type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImage(e.target.files[0])} />
      </label>
      <button className="btn-primary" disabled={busy || !text.trim()}>{busy ? 'Parsing…' : 'Add'}</button>
    </form>
  )
}

// Minimal SpeechRecognition type so we avoid pulling in lib.dom.iterable extras.
interface SpeechRecognition extends EventTarget {
  lang: string
  interimResults: boolean
  start: () => void
  onresult: (e: SpeechRecognitionEvent) => void
}
interface SpeechRecognitionEvent { results: Array<Array<{ transcript: string }>> }
