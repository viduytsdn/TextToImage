import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export type ThemeMode = 'light' | 'dark'

export interface AppState {
  themeMode: ThemeMode
}

const initialState: AppState = {
  themeMode: 'light',
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.themeMode = action.payload
    },
    toggleThemeMode(state) {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light'
    },
  },
})

export const { setThemeMode, toggleThemeMode } = appSlice.actions
export const appReducer = appSlice.reducer
