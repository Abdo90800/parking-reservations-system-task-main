import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Gate, Zone } from '@/types';

interface GateState {
  gates: Gate[];
  currentGate: Gate | null;
  zones: Zone[];
  selectedZone: Zone | null;
  wsConnected: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: GateState = {
  gates: [],
  currentGate: null,
  zones: [],
  selectedZone: null,
  wsConnected: false,
  loading: false,
  error: null,
};

const gateSlice = createSlice({
  name: 'gate',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setGates: (state, action: PayloadAction<Gate[]>) => {
      state.gates = action.payload;
    },
    setCurrentGate: (state, action: PayloadAction<Gate | null>) => {
      state.currentGate = action.payload;
    },
    setZones: (state, action: PayloadAction<Zone[]>) => {
      state.zones = action.payload;
    },
    updateZone: (state, action: PayloadAction<Zone>) => {
      const index = state.zones.findIndex(z => z.id === action.payload.id);
      if (index !== -1) {
        state.zones[index] = action.payload;
      }
    },
    setSelectedZone: (state, action: PayloadAction<Zone | null>) => {
      state.selectedZone = action.payload;
    },
    setWsConnected: (state, action: PayloadAction<boolean>) => {
      state.wsConnected = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  setGates,
  setCurrentGate,
  setZones,
  updateZone,
  setSelectedZone,
  setWsConnected,
} = gateSlice.actions;

export default gateSlice.reducer;