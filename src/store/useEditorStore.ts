import { create } from 'zustand'
import type { TextBox } from '../types/types'

export const CANVAS_W = 794
const ROW_THRESHOLD = 20
const MIN_W = 80

export function getRowmates(boxes: TextBox[], box: TextBox): TextBox[] {
  return boxes.filter(
    (b) => b.id !== box.id && Math.abs(b.y - box.y) <= ROW_THRESHOLD
  )
}

export function distributeRow(
  boxes: TextBox[],
  changedId: string,
  newW: number
): TextBox[] {
  const changed = boxes.find((b) => b.id === changedId)!
  const rowmates = getRowmates(boxes, changed)

  if (rowmates.length === 0) {
    return boxes.map((b) => (b.id === changedId ? { ...b, w: newW } : b))
  }

  const remaining = CANVAS_W - newW
  const share = Math.max(MIN_W, Math.floor(remaining / rowmates.length))

  return boxes.map((b) => {
    if (b.id === changedId) return { ...b, w: newW }
    if (rowmates.some((r) => r.id === b.id)) return { ...b, w: share }
    return b
  })
}

export function alignRow(boxes: TextBox[], movedId: string): TextBox[] {
  const moved = boxes.find((b) => b.id === movedId)!
  const rowmates = getRowmates(boxes, moved)

  if (rowmates.length === 0) return boxes

  const targetY = rowmates[0].y

  return boxes.map((b) => (b.id === movedId ? { ...b, y: targetY } : b))
}

export function layoutRow(boxes: TextBox[], rowY: number): TextBox[] {
  const row = boxes
    .filter((b) => b.y === rowY)
    .sort((a, b) => a.x - b.x)

  if (row.length === 0) return boxes

  const share = Math.floor(CANVAS_W / row.length)
  let cursor = 0

  const updated = row.map((b) => {
    const box = { ...b, x: cursor, w: share }
    cursor += share
    return box
  })

  return boxes.map((b) => updated.find((u) => u.id === b.id) ?? b)
}

interface EditorStore {
  boxes: TextBox[]
  selectedId: string | null
  editingId: string | null
  history: TextBox[][]
  future: TextBox[][]
  addBox: () => void
  updateBox: (id: string, patch: Partial<TextBox>) => void
  updateBoxWithRowResize: (id: string, newW: number) => void
  commitMove: (id: string) => void
  deleteBox: (id: string) => void
  setSelected: (id: string | null) => void
  setEditing: (id: string | null) => void
  pushHistory: () => void
  undo: () => void
  redo: () => void
}

let counter = 1

function createBox(): TextBox {
  return {
    id: `box-${counter++}`,
    x: 40,
    y: 40,
    w: 300,
    h: 80,
    content: '',
    fontSize: 16,
    bold: false,
    italic: false,
    color: '#111111',
  }
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  boxes: [],
  selectedId: null,
  editingId: null,
  history: [],
  future: [],

  pushHistory: () =>
    set((state) => ({
      history: [...state.history.slice(-50), [...state.boxes]],
      future: [],
    })),

  undo: () =>
    set((state) => {
      if (state.history.length === 0) return state
      const prev = state.history[state.history.length - 1]
      return {
        boxes: prev,
        history: state.history.slice(0, -1),
        future: [state.boxes, ...state.future],
      }
    }),

  redo: () =>
    set((state) => {
      if (state.future.length === 0) return state
      const next = state.future[0]
      return {
        boxes: next,
        history: [...state.history, state.boxes],
        future: state.future.slice(1),
      }
    }),

  addBox: () => {
    get().pushHistory()
    set((state) => ({ boxes: [...state.boxes, createBox()] }))
  },

  updateBox: (id, patch) =>
    set((state) => ({
      boxes: state.boxes.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    })),

  updateBoxWithRowResize: (id, newW) =>
    set((state) => ({
      boxes: distributeRow(state.boxes, id, newW),
    })),

  commitMove: (id) =>
    set((state) => {
      const aligned = alignRow(state.boxes, id)
      const moved = aligned.find((b) => b.id === id)!
      const rowmates = getRowmates(aligned, moved)
      if (rowmates.length === 0) return { boxes: aligned }
      return { boxes: layoutRow(aligned, moved.y) }
    }),

  deleteBox: (id) => {
    get().pushHistory()
    set((state) => ({
      boxes: state.boxes.filter((b) => b.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
      editingId: state.editingId === id ? null : state.editingId,
    }))
  },

  setSelected: (id) => set({ selectedId: id }),
  setEditing: (id) => set({ editingId: id }),
}))