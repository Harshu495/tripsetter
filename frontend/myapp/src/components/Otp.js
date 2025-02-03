import { useState } from "react"
import { Typography, TextField, Button } from "@mui/material"
import axios from "../config/axios"
import { useDispatch } from "react-redux"
import { signIn } from "../slices/userSlice"
import { useNavigate, useLocation } from "react-router-dom"

export default function OtpSignIn({ emailOrphone, handleChangeLine, handleGoToPass, isEmail, handleLinkToOtpPage, handleServerError }) {
	const navigate = useNavigate()
	const location = useLocation()
	const dispatch = useDispatch()
	const [otp, setOtp] = useState("")
	const [clientError, setClientError] = useState({})
	const errors = {}

	const clientValidation = () => {
		if (otp.trim().length === 0) {
			errors.otp = "Please enter otp"
		} else if (!/^\d{0,6}$/.test(otp)) {
			errors.otp = "OTP must be exactly 6 digit"
		}
	}


	const handleSignin = async (e) => {
		e.preventDefault()
		clientValidation()
		if (Object.keys(errors).length === 0) {
			try {
				const response = await axios.post("/api/verifyOtp", {
					identifier: emailOrphone,
					type: isEmail ? "email" : "phone",
					otp
				})
				console.log(response.data)
				localStorage.setItem("token", response.data.token)
				await dispatch(signIn())
				setOtp("")
				const { from } = location.state || { from: { pathname: '/' } };
				navigate(from)
				handleServerError("")
			} catch (err) {
				console.log(err)
				handleServerError(err.response.data.errors)
			}
			setClientError({})
		} else {
			setClientError(errors)
		}

	}
	return (<div>
		<Typography variant="h5" align="center" gutterBottom>
			Authentication Required
		</Typography>
		<span style={{ fontSize: "18px", marginTop: "10px" }}>In {emailOrphone}</span>
		<span style={{
			color: "purple",
			cursor: "pointer",
			fontSize: "16px",
			marginTop: "10px"
		}}
			onClick={() => {
				setOtp("")
				handleChangeLine()
			}}
		> Change</span>
		<p>We've sent a One Time Password (OTP) to the {isEmail ? "Email" : "phone number"} above.Please enter it to complete verfication.</p>
		<TextField
			label="Enter OTP"
			value={otp}
			onChange={(e) => setOtp(e.target.value)}
			fullWidth
			required
			margin="normal"
			error={!!clientError.otp}
			helperText={clientError.otp}
		/>
		<Button
			variant="contained"
			onClick={handleSignin}
			fullWidth
			required
			sx={{ mt: 2 }}
			color="primary"
		>Continue</Button><br /><br />

		<span style={{ color: "purple" }}
			onClick={() => {
				setOtp("")
				handleServerError("")
				handleLinkToOtpPage()
			}}
		>Resend OTP</span>
		<div className="line-with-text">
			<span>OR</span>
		</div>
		<Button
			variant="outlined"
			color="primary"
			fullWidth
			onClick={() => {
				setOtp("")
				handleServerError("")
				handleGoToPass()

			}}
		>Sign in with your password</Button>
	</div>)
}