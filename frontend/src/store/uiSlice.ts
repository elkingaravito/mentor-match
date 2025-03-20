import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
    sidebarOpen: boolean;
    darkMode: boolean;
    notifications: {
        showBadge: boolean;
        count: number;
    };
}

const initialState: UiState = {
    sidebarOpen: false,
    darkMode: false,
    notifications: {
        showBadge: true,
        count: 0
    }
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setSidebarOpen: (state, action: PayloadAction<boolean>) => {
            state.sidebarOpen = action.payload;
        },
        toggleDarkMode: (state) => {
            state.darkMode = !state.darkMode;
        },
        setDarkMode: (state, action: PayloadAction<boolean>) => {
            state.darkMode = action.payload;
        },
        setNotificationCount: (state, action: PayloadAction<number>) => {
            state.notifications.count = action.payload;
        },
        toggleNotificationBadge: (state) => {
            state.notifications.showBadge = !state.notifications.showBadge;
        }
    }
});

export const {
    toggleSidebar,
    setSidebarOpen,
    toggleDarkMode,
    setDarkMode,
    setNotificationCount,
    toggleNotificationBadge
} = uiSlice.actions;

export default uiSlice.reducer;