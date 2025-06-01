import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  currentPage: string;
  showWelcome: boolean;
}

const initialState: UIState = {
  theme: 'light',
  sidebarOpen: false,
  currentPage: 'login',
  showWelcome: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload;
    },
    setShowWelcome: (state, action: PayloadAction<boolean>) => {
      state.showWelcome = action.payload;
    },
  },
});

export const {
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  setCurrentPage,
  setShowWelcome,
} = uiSlice.actions;

export default uiSlice.reducer; 