import { useRef, useEffect, useCallback } from 'react'
import { useEditorStore, CANVAS_W, distributeRow } from '@/store/useEditorStore'
import TextBoxComponent from './TextBox'
import type { DragState, ResizeHandle } from '../../types/types'

const MIN_W = 80
const MIN_H = 40
const CANVAS_H = 1123

interface Props {
    canvasRef: React.RefObject<HTMLDivElement | null>
}

export default function Canvas({ canvasRef }: Props) {
    const {
        boxes, selectedId, editingId,
        updateBox, commitMove,
        setSelected, setEditing, pushHistory,
    } = useEditorStore()

    const drag = useRef<DragState | null>(null)

    const onMouseDownCanvas = useCallback((e: React.MouseEvent) => {
        if (e.target === canvasRef.current) {
            setSelected(null)
            setEditing(null)
        }
    }, [canvasRef, setSelected, setEditing])

    const onBoxMouseDown = useCallback((e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        if (editingId === id) return
        setSelected(id)
        const box = boxes.find((b) => b.id === id)!
        pushHistory()
        drag.current = {
            type: 'move',
            id,
            startX: e.clientX,
            startY: e.clientY,
            origX: box.x,
            origY: box.y,
        }
    }, [editingId, boxes, setSelected, pushHistory])

    const onResizeMouseDown = useCallback((e: React.MouseEvent, id: string, handle: ResizeHandle) => {
        e.stopPropagation()
        e.preventDefault()
        const box = boxes.find((b) => b.id === id)!
        pushHistory()
        drag.current = {
            type: 'resize',
            id,
            handle,
            startX: e.clientX,
            startY: e.clientY,
            origX: box.x,
            origY: box.y,
            origW: box.w,
            origH: box.h,
        }
    }, [boxes, pushHistory])

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            const d = drag.current
            if (!d) return

            if (d.type === 'move') {
                const dx = e.clientX - d.startX
                const dy = e.clientY - d.startY
                const nx = Math.max(0, Math.min(CANVAS_W - MIN_W, d.origX + dx))
                const ny = Math.max(0, Math.min(CANVAS_H - MIN_H, d.origY + dy))
                updateBox(d.id, { x: nx, y: ny })
            }

            if (d.type === 'resize') {
                console.log('resize', { dx: e.clientX - d.startX, handle: d.handle, origW: d.origW })
                const dx = e.clientX - d.startX
                const dy = e.clientY - d.startY
                let nx = d.origX, ny = d.origY, nw = d.origW, nh = d.origH

                if (d.handle.includes('e')) nw = Math.max(MIN_W, d.origW + dx)
                if (d.handle.includes('s')) nh = Math.max(MIN_H, d.origH + dy)
                if (d.handle.includes('w')) {
                    nw = Math.max(MIN_W, d.origW - dx)
                    nx = d.origX + (d.origW - nw)
                }
                if (d.handle.includes('n')) {
                    nh = Math.max(MIN_H, d.origH - dy)
                    ny = d.origY + (d.origH - nh)
                }

                nw = Math.min(nw, CANVAS_W - nx)
                nh = Math.min(nh, CANVAS_H - ny)

                if (d.handle.includes('e') || d.handle.includes('w')) {
                    const allBoxes = useEditorStore.getState().boxes
                    console.log('before distribute', allBoxes.find(b => b.id === d.id)?.w, 'nw:', nw)
                    const distributed = distributeRow(allBoxes, d.id, nw)
                    console.log('after distribute', distributed.find(b => b.id === d.id)?.w)
                    useEditorStore.setState({
                        boxes: distributed.map((b) =>
                            b.id === d.id ? { ...b, x: nx, y: ny, h: nh } : b
                        ),
                    })

                } else {
                    updateBox(d.id, { x: nx, y: ny, h: nh })
                }
            }
        }

        const onMouseUp = () => {
            const d = drag.current
            if (d?.type === 'move') commitMove(d.id)
            drag.current = null
        }

        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)
        return () => {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
        }
    }, [updateBox, commitMove])

    return (
        <div
            ref={canvasRef}
            onMouseDown={onMouseDownCanvas}
            style={{
                width: CANVAS_W,
                height: CANVAS_H,
                background: '#ffffff',
                boxShadow: '0 2px 24px rgba(0,0,0,0.10)',
                position: 'relative',
                flexShrink: 0,
                userSelect: 'none',
            }}
        >
            {boxes.length === 0 && (
                <div style={{
                    position: 'absolute', inset: 0, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', gap: 8, pointerEvents: 'none',
                }}>
                    <div style={{ fontSize: 14, color: '#bbb' }}>Canvas tyhjä</div>
                    <div style={{ fontSize: 12, color: '#ccc' }}>Lisää tekstilaatikko työkaluriviltä</div>
                </div>
            )}

            {boxes.map((box) => (
                <TextBoxComponent
                    key={box.id}
                    box={box}
                    isSelected={selectedId === box.id}
                    isEditing={editingId === box.id}
                    onMouseDown={(e) => onBoxMouseDown(e, box.id)}
                    onDoubleClick={() => { setSelected(box.id); setEditing(box.id) }}
                    onBlur={() => setEditing(null)}
                    onChange={(content) => updateBox(box.id, { content })}
                    onResizeMouseDown={(e, handle) => onResizeMouseDown(e, box.id, handle)}
                />
            ))}
        </div>
    )
}