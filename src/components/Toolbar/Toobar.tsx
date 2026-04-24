import { useEditorStore } from '@/store/useEditorStore'
import { exportToPdf } from '@/utils/exportPdf'
import type { RefObject } from 'react'

interface Props {
    canvasRef: RefObject<HTMLDivElement | null>
}

export default function Toolbar({ canvasRef }: Props) {
  const { boxes, selectedId, addBox, updateBox, deleteBox } = useEditorStore()
  const selBox = boxes.find((b) => b.id === selectedId)

  const handleExport = async () => {
    if (canvasRef.current) await exportToPdf(canvasRef.current)
  }

  return (
    <aside style={{
      width: 220, flexShrink: 0,
      background: '#fff',
      borderRight: '0.5px solid #e0e0d8',
      padding: '20px 16px',
      display: 'flex', flexDirection: 'column', gap: 16,
      position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
    }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#888', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        CV Builder
      </div>

      <button onClick={addBox} style={btnStyle}>
        + Lisää tekstilaatikko
      </button>

 {selBox && (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={sectionLabel}>Muotoilu</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={labelStyle}>Fonttikoko</label>
            <input type="range" min="10" max="72" value={selBox.fontSize}
                onChange={(e) => updateBox(selBox.id, { fontSize: +e.target.value })} />
            <span style={labelStyle}>{selBox.fontSize}px</span>
        </div>

        <div style={sectionLabel}>Tekstimuotoilu</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {[
                { cmd: 'bold', label: 'B', style: { fontWeight: 700 } },
                { cmd: 'italic', label: 'I', style: { fontStyle: 'italic' } },
                { cmd: 'underline', label: 'U', style: { textDecoration: 'underline' } },
                { cmd: 'strikeThrough', label: 'S', style: { textDecoration: 'line-through' } },
            ].map(({ cmd, label, style }) => (
                <button
                    key={cmd}
                    onMouseDown={(e) => {
                        e.preventDefault()
                        document.execCommand(cmd)
                    }}
                    style={{ ...iconBtn, ...style }}
                >
                    {label}
                </button>
            ))}
        </div>

        <div style={sectionLabel}>Tasaus</div>
        <div style={{ display: 'flex', gap: 4 }}>
            {[
                { cmd: 'justifyLeft', label: '⬤⬤⬤' },
                { cmd: 'justifyCenter', label: '◯◯◯' },
                { cmd: 'justifyRight', label: '▷▷▷' },
            ].map(({ cmd, label }) => (
                <button
                    key={cmd}
                    onMouseDown={(e) => {
                        e.preventDefault()
                        document.execCommand(cmd)
                    }}
                    style={{ ...iconBtn, fontSize: 10, letterSpacing: -1 }}
                >
                    {label}
                </button>
            ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={labelStyle}>Tekstin väri</label>
            <input type="color" value={selBox.color}
                onChange={(e) => {
                    updateBox(selBox.id, { color: e.target.value })
                    document.execCommand('foreColor', false, e.target.value)
                }}
                style={{ width: '100%', height: 32, border: '0.5px solid #e0e0d8', borderRadius: 6, cursor: 'pointer', padding: 2 }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={labelStyle}>Sijainti & koko</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                {(['x', 'y', 'w', 'h'] as const).map((key) => (
                    <div key={key}>
                        <div style={{ fontSize: 10, color: '#aaa', marginBottom: 2 }}>{key.toUpperCase()}</div>
                        <input type="number" value={Math.round(selBox[key])}
                            onChange={(e) => updateBox(selBox.id, { [key]: +e.target.value })}
                            style={numInput} />
                    </div>
                ))}
            </div>
        </div>

        <button onClick={() => deleteBox(selBox.id)}
            style={{ ...btnStyle, color: '#a32d2d', borderColor: '#f09595' }}>
            Poista
        </button>
    </div>
)} 

      <div style={{ marginTop: 'auto' }}>
        <button onClick={handleExport} style={btnStyle}>
          Tallenna PDF
        </button>
      </div>
    </aside>
  )
}

const btnStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: '0.5px solid #ccc',
  borderRadius: 8,
  background: 'transparent',
  cursor: 'pointer',
  fontSize: 13,
  color: '#111',
  textAlign: 'left',
}

const iconBtn: React.CSSProperties = {
  flex: 1,
  padding: '6px',
  border: '0.5px solid #ccc',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 14,
  color: '#111',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#888',
}

const sectionLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: '#888',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  marginTop: 4,
}

const numInput: React.CSSProperties = {
  width: '100%',
  padding: '4px 6px',
  border: '0.5px solid #e0e0d8',
  borderRadius: 6,
  fontSize: 12,
  background: '#fff',
  color: '#111',
}