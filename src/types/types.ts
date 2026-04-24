export interface TextBox {
  id: string
  x: number
  y: number
  w: number
  h: number
  content: string
  fontSize: number
  bold: boolean
  italic: boolean
  color: string
}

export type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

export type DragState = {
  type: 'move'
  id: string
  startX: number
  startY: number
  origX: number
  origY: number
} | {
  type: 'resize'
  id: string
  handle: ResizeHandle
  startX: number
  startY: number
  origX: number
  origY: number
  origW: number
  origH: number
}