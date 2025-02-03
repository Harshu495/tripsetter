import { useState } from "react"
import { useDispatch } from "react-redux"
import { useNavigate, useLocation } from "react-router-dom"
import { signIn } from "../slices/userSlice.js"
import {
	TextField, Button,
	InputAdornment,
	IconButton
} from "@mui/material"
import axios from "../config/axios"
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"


export default function PasswordLogin({ emailOrphone, handleLinkToOtpPage, handleChangeLine, isEmail, handleServerError }) {
	const location = useLocation()
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const [password, setPassword] = useState("")
	const [showPas, setShowPass] = useState(false)
	const [clientErros, setClientErros] = useState({})
	const errors = {}
	const btnTitle = `Get an OTP on your ${isEmail ? "Email" : "Phone"}`
	const ClientValidation = () => {
		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,12}$/;

		if (password.trim().length === 0) {
			errors.password = "please enter password"
		} else if (!passwordRegex.test(password)) {
			errors.password = "Password must include at least one uppercase letter, one lowercase letter, one number, one special character, and be 6 to 12 characters long."
		}
	}
	const handlePassSignin = async (e) => {
		e.preventDefault()
		ClientValidation()
		if (Object.keys(errors).length === 0) {
			try {
				console.log(password)
				const response = await axios.post("/api/Passwordlogin", {
					identifier: emailOrphone,
					type: isEmail ? "email" : "phone",
					password
				})
				console.log(response.data)
				localStorage.setItem("token", response.data.token)
				await dispatch(signIn())
				const { from } = location.state || { from: { pathname: '/' } };
				navigate(from)
				setClientErros({})
				handleServerError("")
			} catch (err) {
				console.log(err)
				handleServerError(err.response.data.errors)
			}
		} else {
			setClientErros(errors)
		}
	}
	return (<div>
		<span style={{ fontSize: "18px", marginTop: "10px" }}>In {emailOrphone}</span>
		<span style={{
			color: "purple",
			cursor: "pointer",
			fontSize: "16px",
			marginTop: "10px"
		}}
			onClick={() => {
				setPassword("")
				handleServerError("")
				handleChangeLine()
			}}
		> Change</span>
		<TextField
			label="Password"
			type={showPas ? "text" : "password"}
			value={password}
			onChange={(e) => setPassword(e.target.value)}
			fullWidth
			margin="normal"
			required
			error={!!clientErros.password}
			helperText={clientErros.password}
			InputProps={{
				endAdornment: (
					<InputAdornment position="end">
						<IconButton
							onClick={() => setShowPass(!showPas)}
							onMouseDown={(e) => e.preventDefault()}
						>
							{showPas ? <Visibility /> : <VisibilityOff />}
						</IconButton>
					</InputAdornment>
				)
			}}

		/>
		<Button
			variant="contained"
			onClick={handlePassSignin}
			fullWidth
			color="primary"
			sx={{ mt: 2 }}
		>Sign in</Button>
		<div className="line-with-text">
			<span>OR</span>
		</div>
		<Button
			variant="outlined"
			onClick={() => {
				setPassword("")
				handleServerError("")
				handleLinkToOtpPage()
			}}
			fullWidth
		>{btnTitle}</Button>
	</div >)
}