import { configureStore } from '@reduxjs/toolkit'
import draftPageReducer from './slices/draftPageSlice'
import uiReducer from './slices/uiSlice'
import publishReducer from './slices/publishSlice'

export function makeStore() {
  return configureStore({
    reducer: {
      draftPage: draftPageReducer,
      ui: uiReducer,
      publish: publishReducer,
    },
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
