import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Page, Section, SectionType } from '@/types'
import { sectionRegistry } from '@/lib/registry/sectionRegistry'

// We use the browser's crypto.randomUUID where available, falling back to a simple ID.
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Math.random().toString(36).slice(2, 11)
}

type DraftPageState = {
  page: Page | null
  isDirty: boolean
}

const initialState: DraftPageState = {
  page: null,
  isDirty: false,
}

export const draftPageSlice = createSlice({
  name: 'draftPage',
  initialState,
  reducers: {
    // Load a page from Contentful (or any external source) into the draft slot
    loadPage(state, action: PayloadAction<Page>) {
      state.page = action.payload
      state.isDirty = false
    },

    // Restore a previously persisted draft (e.g. from localStorage)
    hydrateDraft(state, action: PayloadAction<Page>) {
      state.page = action.payload
      state.isDirty = true
    },

    updateTitle(state, action: PayloadAction<string>) {
      if (!state.page) return
      state.page.title = action.payload
      state.isDirty = true
    },

    addSection(state, action: PayloadAction<SectionType>) {
      if (!state.page) return
      const type = action.payload
      const entry = sectionRegistry[type]
      const newSection: Section = {
        id: generateId(),
        type,
        props: entry.defaultProps as Record<string, unknown>,
      }
      state.page.sections.push(newSection)
      state.isDirty = true
    },

    removeSection(state, action: PayloadAction<string>) {
      if (!state.page) return
      state.page.sections = state.page.sections.filter((s) => s.id !== action.payload)
      state.isDirty = true
    },

    // Reorder via source and destination indices (from dnd-kit drag events)
    reorderSections(
      state,
      action: PayloadAction<{ fromIndex: number; toIndex: number }>
    ) {
      if (!state.page) return
      const { fromIndex, toIndex } = action.payload
      const sections = state.page.sections
      if (fromIndex < 0 || toIndex < 0 || fromIndex >= sections.length || toIndex >= sections.length)
        return
      const [moved] = sections.splice(fromIndex, 1)
      sections.splice(toIndex, 0, moved)
      state.isDirty = true
    },

    updateSectionProps(
      state,
      action: PayloadAction<{ sectionId: string; props: Record<string, unknown> }>
    ) {
      if (!state.page) return
      const section = state.page.sections.find((s) => s.id === action.payload.sectionId)
      if (section) {
        section.props = action.payload.props
        state.isDirty = true
      }
    },

    markClean(state) {
      state.isDirty = false
    },

    clearDraft(state) {
      state.page = null
      state.isDirty = false
    },
  },
})

export const {
  loadPage,
  hydrateDraft,
  updateTitle,
  addSection,
  removeSection,
  reorderSections,
  updateSectionProps,
  markClean,
  clearDraft,
} = draftPageSlice.actions

// Selectors
export const selectDraftPage = (state: { draftPage: DraftPageState }) => state.draftPage.page
export const selectIsDirty = (state: { draftPage: DraftPageState }) => state.draftPage.isDirty

export default draftPageSlice.reducer
