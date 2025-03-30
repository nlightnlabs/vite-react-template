import { createSlice } from '@reduxjs/toolkit';
import { PURGE } from 'redux-persist';
import { config } from '../../config.ts';

interface PropTypes {
  appName: string,
  creator: string,
  userAuthenticated: boolean,
  currentUser: any,
  theme: string,
  logo: string,
  pages: string[],
  currentPage: string,
  currentModule: any,
  currentView: any,
  currentPath: string,
  appData: object,
  history: object[]
}

const initialState:PropTypes = {
  appName: config.appName,
  creator: config.creator,
  userAuthenticated: false,
  currentUser: null,
  theme: config.theme,
  logo: config.logo,
  pages: [],
  currentPage: "home",
  currentModule: config.currentModule,
  currentView: config.currentView,
  currentPath: config.currentPath,
  appData: {},
  history: []
};

const mainSlice = createSlice({
  name: 'main',
  initialState,
  reducers: {
    setAppName: (state, action) => {
      state.appName = action.payload;
    },
    setCreator: (state, action) => {
      state.creator = action.payload;
    },
    setUserAuthenticated: (state, action) => {
      state.userAuthenticated = action.payload;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setLogo: (state, action) => {
      state.logo = action.payload;
    },
    setPages: (state, action) => {
      state.pages = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setCurrentModule: (state, action) => {
      state.currentModule = action.payload;
    },
    setCurrentView: (state, action) => {
      state.currentView = action.payload;
    },
    setCurrentPath: (state, action) => {
      state.currentPath = action.payload;
    },
    setAppData: (state, action) => {
      state.appData = action.payload;
    },
    setHistory: (state, action) => {
      state.history = action.payload;
    },
    resetState: () => initialState, // Explicit reset action
  },
  extraReducers: (builder) => {
    builder.addCase(PURGE, () => initialState); // Ensure state resets on PURGE
  },
});

export const {
  setAppName,
  setCreator,
  setUserAuthenticated,
  setCurrentUser,
  setTheme,
  setLogo,
  setPages,
  setCurrentPage,
  setCurrentModule,
  setCurrentView,
  setCurrentPath,
  setAppData,
  setHistory,
  resetState,
} = mainSlice.actions;

export default mainSlice.reducer;
