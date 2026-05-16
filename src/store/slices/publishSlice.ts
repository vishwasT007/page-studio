import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { Release } from '@/types'

type PublishStatus = 'idle' | 'publishing' | 'success' | 'error'

type PublishState = {
  status: PublishStatus
  latestRelease: Release | null
  error: string | null
}

const initialState: PublishState = {
  status: 'idle',
  latestRelease: null,
  error: null,
}

export const publishPage = createAsyncThunk<Release, { slug: string }>(
  'publish/publishPage',
  async ({ slug }, { getState, rejectWithValue }) => {
    const state = getState() as { draftPage: { page: unknown } }
    const draft = state.draftPage.page

    if (!draft) return rejectWithValue('No draft page loaded')

    const response = await fetch('/api/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, page: draft }),
    })

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string }
      return rejectWithValue(body.error ?? 'Publish failed')
    }

    return (await response.json()) as Release
  }
)

export const publishSlice = createSlice({
  name: 'publish',
  initialState,
  reducers: {
    setLatestRelease(state, action: PayloadAction<Release>) {
      state.latestRelease = action.payload
    },
    resetPublishStatus(state) {
      state.status = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(publishPage.pending, (state) => {
        state.status = 'publishing'
        state.error = null
      })
      .addCase(publishPage.fulfilled, (state, action) => {
        state.status = 'success'
        state.latestRelease = action.payload
      })
      .addCase(publishPage.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.payload as string
      })
  },
})

export const { setLatestRelease, resetPublishStatus } = publishSlice.actions

export const selectPublishStatus = (state: { publish: PublishState }) => state.publish.status
export const selectLatestRelease = (state: { publish: PublishState }) => state.publish.latestRelease
export const selectPublishError = (state: { publish: PublishState }) => state.publish.error

export default publishSlice.reducer
