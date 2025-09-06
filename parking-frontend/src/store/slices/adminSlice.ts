import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ParkingStateReport, AdminUpdate } from '@/types';

interface AdminState {
  parkingState: ParkingStateReport[];
  auditLog: AdminUpdate[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  parkingState: [],
  auditLog: [],
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setParkingState: (state, action: PayloadAction<ParkingStateReport[]>) => {
      state.parkingState = action.payload;
    },
    addAuditLogEntry: (state, action: PayloadAction<AdminUpdate>) => {
      state.auditLog.unshift(action.payload);
      // Keep only last 50 entries
      if (state.auditLog.length > 50) {
        state.auditLog = state.auditLog.slice(0, 50);
      }
    },
    clearAuditLog: (state) => {
      state.auditLog = [];
    },
  },
});

export const {
  setLoading,
  setError,
  setParkingState,
  addAuditLogEntry,
  clearAuditLog,
} = adminSlice.actions;

export default adminSlice.reducer;