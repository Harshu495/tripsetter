import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../config/axios";
export const signIn = createAsyncThunk("User/signIn", async () => {
	try {
		const response = await axios.get("/api/profile", { headers: { Authorization: localStorage.getItem("token") } })
		return response.data
	} catch (err) {
		console.log(err)
	}
})
const UserSlice = createSlice({
	name: "User",
	initialState: { data: null, isSignedIn: false, serverErrors: null, editId: null },
	reducers: {
		"LOGOUT": (state) => {
			state.data = null
			state.isSignedIn = false
		}
	},
	extraReducers: (builder) => {
		builder.addCase(signIn.fulfilled, (state, action) => {
			state.data = action.payload
			state.isSignedIn = true
			state.serverErrors = null
		});

	}

})
export const { LOGOUT } = UserSlice.actions
export default UserSlice.reducer