import { useState } from "react"
import "../App.css"
import axios from "../config/axios"
import { useNavigate } from "react-router-dom"
import validator from "validator"
import "../css-files/form-style.css"

import {
	Box, Typography, TextField, Button,
} from "@mui/material"
import PasswordLogin from "./password"
import OtpSignIn from "./Otp"

const initialalue = {
	emailOrphone: "",
	isEmail: false,
	step: 1
}
export default function SignIn() {
	const navigate = useNavigate()
	const [data, setData] = useState(initialalue)
	const [ClientError, setClientError] = useState({})
	const [serverError, setServerError] = useState(null)
	const errors = {}

	const ClinetValidation = () => {
		const phoneRegex = /^\+\d{1,4}\d{7,15}$/;
		if (data.emailOrphone.trim().length === 0) {
			errors.emailOrphone = "Enter your email or phone"
		} else if (validator.isEmail(data.emailOrphone)) {
			return true
		} else if (phoneRegex.test(data.emailOrphone)) {
			return false
		} else {
			errors.emailOrphone = "Please enter a valid email or phone number with country code"
		}
		return null
	}

	const handleEmailOrPhone = async (e) => {
		e.preventDefault()
		const IsEmail = ClinetValidation()

		if (Object.keys(errors).length === 0 || IsEmail !== null) {
			setData({ ...data, isEmail: IsEmail })
			try {
				const response = await axios.post("/api/findUser", {
					identifier: data.emailOrphone,
					type: IsEmail ? "email" : "phone"
				})
				console.log(data.isEmail)
				console.log(response.data)
				setData((prev) => ({ ...prev, step: 2 }))
				setServerError("")
			} catch (err) {
				console.log(err)
				setServerError(err.response.data.errors)
			}
			setClientError({})
		} else {
			setClientError(errors)
		}

	}


	const handleLinkToOtpPage = async () => {
		try {
			const response = await axios.post("/api/generateOtp", {
				identifier: data.emailOrphone,
				type: data.isEmail ? "email" : "phone"
			})
			console.log(response.data)
			setData((prev) => ({ ...prev, step: 3 }))
			setServerError("")
		} catch (err) {
			console.log(err)
			setServerError(err.response.data.errors)
		}
	}
	const handleChangeLine = () => {
		setData((prev) => ({ ...prev, step: 1 }))
	}
	const handleGoToPass = () => {
		setData((prev) => ({ ...prev, step: 2 }))
	}
	const handleServerError = (msg) => {
		setServerError(msg)
	}
	return (<div>
		{serverError && (<Box className="server-error-container">
			<Box className="error-box">
				<Typography className="error-title">
					There was a problem
				</Typography>
				<Typography className="error-message">
					{serverError}
				</Typography>

			</Box>
		</Box>)}
		<Box
			sx={{
				maxWidth: 400,
				mx: "auto",
				mt: 5,
				p: 3,
				border: "1px solid #ccc",
				borderRadius: 2,
				boxShadow: 3,
			}}
		>
			{data.step <= 2 &&
				<Typography variant="h4" align="center" gutterBottom>
					Sign in
				</Typography>
			}
			{data.step === 1 && (<>
				<form onSubmit={handleEmailOrPhone}>
					<TextField
						name="emailOrphone"
						label="Email or mobile phone number"
						value={data.emailOrphone}
						onChange={(e) => setData({ ...data, emailOrphone: e.target.value })}
						fullWidth
						required
						error={!!ClientError.emailOrphone}
						helperText={ClientError.emailOrphone}
					/>
					<div className="example">
						<p>Example:</p>
						<p>example@gmail.com</p>
						<p>+countryCode+phoneNumber</p>
					</div>
					<Button
						type="submit"
						variant="contained"
						fullWidth
						color="primary"
						sx={{ mt: 2 }}
					>Continue</Button>
				</form>
				<div className="line-with-text">
					<span>New to TripSetter</span>
				</div>
				<Button
					variant="outlined"
					color="primary"
					fullWidth
					onClick={() => {
						setData({ ...data, emailOrphone: "", step: 1 })
						navigate("/signup")
					}}
				>Create your TripSetter Account</Button>
			</>
			)}
			{data.step === 2 && (<>
				<PasswordLogin emailOrphone={data.emailOrphone} handleLinkToOtpPage={handleLinkToOtpPage}
					handleChangeLine={handleChangeLine}
					isEmail={data.isEmail} handleServerError={handleServerError}
				/>
			</>)}
			{data.step === 3 && (
				<OtpSignIn emailOrphone={data.emailOrphone} handleChangeLine={handleChangeLine} handleGoToPass={handleGoToPass} isEmail={data.isEmail} handleLinkToOtpPage={handleLinkToOtpPage}
					handleServerError={handleServerError}
				/>
			)}

		</Box>

	</div>)
}