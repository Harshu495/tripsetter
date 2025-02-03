import { configureStore } from "@reduxjs/toolkit"
import UserReducer from "./slices/userSlice"
const Store = configureStore({
	reducer: {
		user: UserReducer
	}
})
export default Store