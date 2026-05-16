import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type UIState = {
  selectedSectionId: string | null
  sidebarOpen: boolean
  previewMode: boolean
}

const initialState: UIState = {
  selectedSectionId: null,
  sidebarOpen: true,
  previewMode: false,
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    selectSection(state, action: PayloadAction<string | null>) {
      state.selectedSectionId = action.payload
    },

    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen
    },

    togglePreviewMode(state) {
      state.previewMode = !state.previewMode
    },

    setPreviewMode(state, action: PayloadAction<boolean>) {
      state.previewMode = action.payload
    },
  },
})

export const { selectSection, toggleSidebar, togglePreviewMode, setPreviewMode } = uiSlice.actions

export const selectSelectedSectionId = (state: { ui: UIState }) => state.ui.selectedSectionId
export const selectSidebarOpen = (state: { ui: UIState }) => state.ui.sidebarOpen
export const selectPreviewMode = (state: { ui: UIState }) => state.ui.previewMode

export default uiSlice.reducer
