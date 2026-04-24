import { useEffect, useRef } from 'react'
import type { TextBox as TextBoxType, ResizeHandle } from '../../types/types'

const HANDLES: { id: ResizeHandle; style: React.CSSProperties }[] = [
    { id: 'n',  style: { top: -5, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' } },
    { id: 's',  style: { bottom: -5, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' } },
    { id: 'e',  style: { right: -5, top: '50%', transform: 'translateY(-50%)', cursor: 'e-resize' } },
    { id: 'w',  style: { left: -5, top: '50%', transform: 'translateY(-50%)', cursor: 'w-resize' } },
    { id: 'ne', style: { top: -5, right: -5, cursor: 'ne-resize' } },
    { id: 'nw', style: { top: -5, left: -5, cursor: 'nw-resize' } },
    { id: 'se', style: { bottom: -5, right: -5, cursor: 'se-resize' } },
    { id: 'sw', style: { bottom: -5, left: -5, cursor: 'sw-resize' } },
]

interface Props {
    box: TextBoxType
    isSelected: boolean
    isEditing: boolean
    onMouseDown: (e: React.MouseEvent) => void
    onDoubleClick: () => void
    onBlur: () => void
    onChange: (content: string) => void
    onResizeMouseDown: (e: React.MouseEvent, handle: ResizeHandle) => void
}

export default function TextBox({
    box,
    isSelected,
    isEditing,
    onMouseDown,
    onDoubleClick,
    onBlur,
    onChange,
    onResizeMouseDown,
}: Props) {
    const editableRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isEditing && editableRef.current) {
            editableRef.current.focus()
            const range = document.createRange()
            range.selectNodeContents(editableRef.current)
            range.collapse(false)
            const sel = window.getSelection()
            sel?.removeAllRanges()
            sel?.addRange(range)
        }
    }, [isEditing])

    useEffect(() => {
        if (!isEditing && editableRef.current) {
            const current = editableRef.current.innerHTML
            if (current !== box.content) {
                editableRef.current.innerHTML = box.content
            }
        }
    }, [box.content, isEditing])

    useEffect(() => {
        if (editableRef.current && !isEditing) {
            editableRef.current.innerHTML = box.content
        }
    }, [])

    const handleInput = () => {
        if (editableRef.current) {
            onChange(editableRef.current.innerHTML)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        e.stopPropagation()
        if (e.key === 'Escape') {
            editableRef.current?.blur()
        }
    }

    return (
        <div
            onMouseDown={onMouseDown}
            onDoubleClick={onDoubleClick}
            style={{
                position: 'absolute',
                left: box.x,
                top: box.y,
                width: box.w,
                height: box.h,
                border: isSelected ? '1.5px solid #378ADD' : '1px dashed #d0d0c8',
                cursor: isEditing ? 'text' : 'move',
                overflow: 'hidden',
                background: 'transparent',
                boxSizing: 'border-box',
            }}
        >
            <div
                ref={editableRef}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onInput={handleInput}
                onBlur={onBlur}
                onKeyDown={handleKeyDown}
                onMouseDown={(e) => { if (isEditing) e.stopPropagation() }}
                style={{
                    width: '100%',
                    height: '100%',
                    padding: '6px 8px',
                    fontSize: box.fontSize,
                    fontWeight: box.bold ? 700 : 400,
                    fontStyle: box.italic ? 'italic' : 'normal',
                    fontFamily: 'inherit',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'break-word',
                    overflow: 'hidden',
                    outline: 'none',
                    boxSizing: 'border-box',
                    cursor: isEditing ? 'text' : 'inherit',
                    color: box.content || isEditing ? box.color : '#bbb',
                }}
                data-placeholder="Kaksoisklikkaa muokataksesi..."
            />

            {!box.content && !isEditing && (
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '100%', height: '100%',
                    padding: '6px 8px',
                    fontSize: box.fontSize,
                    color: '#bbb',
                    pointerEvents: 'none',
                    boxSizing: 'border-box',
                    lineHeight: 1.5,
                }}>
                    Kaksoisklikkaa muokataksesi...
                </div>
            )}

            {isSelected && HANDLES.map((h) => (
                <div
                    key={h.id}
                    onMouseDown={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        onResizeMouseDown(e, h.id)
                    }}
                    style={{
                        position: 'absolute',
                        width: 10,
                        height: 10,
                        background: '#fff',
                        border: '1.5px solid #378ADD',
                        borderRadius: 2,
                        zIndex: 10,
                        ...h.style,
                    }}
                />
            ))}
        </div>
    )
}