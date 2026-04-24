import { useEffect, useRef } from 'react'
import Canvas from '@/components/Canvas/Canvas'
import Toolbar from './components/Toolbar/Toobar'
import { useEditorStore } from '@/store/useEditorStore'

export default function App() {
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const { undo, redo } = useEditorStore()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey
      if (ctrl && e.key === 'z') { e.preventDefault(); undo() }
      if (ctrl && e.key === 'y') { e.preventDefault(); redo() }
      if (ctrl && e.shiftKey && e.key === 'z') { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [undo, redo])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f0' }}>
      <Toolbar canvasRef={canvasRef} />
      <main style={{
        flex: 1, display: 'flex',
        alignItems: 'flex-start', justifyContent: 'center',
        padding: '32px 24px', overflowY: 'auto',
      }}>
        <Canvas canvasRef={canvasRef} />
      </main>
    </div>
  )
}