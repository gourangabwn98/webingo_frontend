import { createSlice } from '@reduxjs/toolkit'

const socketSlice = createSlice({
  name: 'socket',
  initialState: { connected: false, instance: null },
  reducers: {
    setConnected(state, { payload }) { state.connected = payload },
    setSocket(state, { payload })    { state.instance  = payload },
  },
})

export const { setConnected, setSocket } = socketSlice.actions
export default socketSlice.reducer