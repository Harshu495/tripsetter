import { useState } from "react"
import { useNavigate } from "react-router-dom"
import validator from "validator"
import axios from "../config/axios"
import "../css-files/form-style.css"
import {
	Box, Typography, TextField, Button, Radio, RadioGroup, FormControlLabel,
	FormControl,
	FormLabel,
	FormHelperText,
	InputAdornment,
	IconButton
} from "@mui/material"
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import PersonIcon from "@mui/icons-material/Person"
import EmailIcon from "@mui/icons-material/Email"
import PhoneIcon from "@mui/icons-material/Phone";
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"
const intialValue = {
	name: "",
	email: "",
	phone: "",
	password: "",
	role: "",
}
export default function SignUp() {
	const naviagte = useNavigate()
	const [formData, setFormData] = useState(intialValue)
	const [showPassword, setShowPass] = useState(false)
	const [clientError, setClientError] = useState({})
	const [serverErrors, setServerError] = useState(null)
	const errors = {}

	const ClientValidation = () => {
		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,12}$/;
		if (formData.name.trim().length === 0) {
			errors.name = "Enter your name"
		}
		if (formData.email.trim().length === 0) {
			errors.email = "Enter your email"
		} else if (!validator.isEmail(formData.email)) {
			errors.email = "Invalid email address"
		}

		if (formData.password.trim().length === 0) {
			errors.password = "Please enter password"
		} else if (!passwordRegex.test(formData.password)) {
			errors.password = "Password must include at least one uppercase letter, one lowercase letter, one number, one special character, and be 6 to 12 characters long."
		}
		if (formData.role.trim().length === 0) {
			errors.role = "Please select a role."
		}
		if (formData.role.trim().length === 0) {
			errors.phone = "Please Enter Phone Number"
		} else if (formData.phone.length < 5 || formData.phone.startsWith('+')) {
			errors.phone = "Please enter a valid phone number with country code."
		}
	}

	// Handle input change
	const HandleChange = (e) => {
		const { name, value } = e.target
		setFormData({ ...formData, [name]: value })
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		ClientValidation()
		if (Object.keys(errors).length === 0) {
			try {
				console.log(formData)
				const response = await axios.post("/api/SignUp", formData)
				console.log(response.data)
				alert("SignUp Successfully")
				naviagte("/signin")
			} catch (err) {
				console.log(err)
				setServerError(err.response.data.errors)
			}
			setClientError({})
		} else {
			console.log(errors)
			setClientError(errors)
		}
	}
	return (<div>
		{serverErrors && (<Box className="server-error-container">
			<Box className="error-box">
				<Typography className="error-title">
					There was a problem
				</Typography>
				<Typography className="error-message">
					{serverErrors.map((ele, i) => {
						return <li key={i}>{ele.msg}</li>
					})}
				</Typography>

			</Box>
		</Box>)}
		<Box className="box-Container">
			< Typography variant="h5" align="center" gutterBottom>
				Sign Up
			</Typography>
			{/* {serverErrors && (<Typography color="error" sx={{ mt: 2 }}>{serverErrors}</Typography>)} */}

			<form onSubmit={handleSubmit}>
				{/* Name Feild */}
				<TextField
					label="Name"
					name="name"
					value={formData.name}
					onChange={HandleChange}
					fullWidth
					margin="normal"
					error={!!clientError.name}
					helperText={clientError.name}
					required
					InputProps={{
						endAdornment: (
							<InputAdornment position="end">
								<PersonIcon />
							</InputAdornment>
						)
					}}
				/>

				{/* Email Feild */}
				<TextField
					type="email"
					name="email"
					label="Email"
					value={formData.email}
					onChange={HandleChange}
					fullWidth
					margin="normal"
					required
					error={!!clientError.email}
					helperText={clientError.email}
					InputProps={{
						endAdornment: (
							<InputAdornment position="end">
								<EmailIcon />
							</InputAdornment>
						)
					}}
				/>
				{/* Phone Feild */}
				<PhoneInput
					country={"us"} // Default country
					value={formData.phone}
					onChange={(value) => { setFormData({ ...formData, phone: value }) }}
					inputStyle={{
						width: "100%",
						height: "40px",
						fontSize: "16px",
					}}
					containerStyle={{
						marginBottom: "10px",
					}}
					label="Phone"
					error={!!clientError.phone}
					helperText={clientError.phone}
					InputProps={{
						name: "phone",
						required: true,
						autoFocus: true,
						endAdornment: (<InputAdornment position="end">
							<PhoneIcon />
						</InputAdornment>)
					}}
				/>
				{/* Password Feild */}
				<TextField
					type={showPassword ? "text" : "password"}
					name="password"
					label="Password"
					value={formData.password}
					onChange={HandleChange}
					fullWidth
					margin="normal"
					required
					error={!!clientError.password}
					helperText={clientError.password}
					InputProps={{
						endAdornment: (
							<InputAdornment position="end">
								<IconButton
									onClick={() => setShowPass(!showPassword)}
									onMouseDown={(e) => e.preventDefault()}//// Prevent focus loss
									edge="end"
								>
									{showPassword ? <Visibility /> : <VisibilityOff />}
								</IconButton>
							</InputAdornment>
						)
					}}
				/>
				{/* Role Selection */}
				<FormControl component="fieldset" margin="normal"
					error={!!clientError.role}>
					<FormLabel component="legend">Role</FormLabel>
					<RadioGroup
						name="role"
						value={formData.role}
						onChange={HandleChange}
						row
					>
						<FormControlLabel
							value="Traveler"
							control={<Radio />}
							label="Traveler"
						/>
						<FormControlLabel
							value="Guid"
							control={<Radio />}
							label="Guid"
						/>

					</RadioGroup>
					{clientError.role && <FormHelperText>{clientError.role}</FormHelperText>}
				</FormControl>
				{/* Submit Button */}
				<Button
					type="submit"
					variant="contained"
					fullWidth
					color="primary"
					sx={{ mt: 2 }}
				>Sign Up</Button>
			</form><br />
			<p>Already have an account? <span style={{ color: "skyblue", cursor: "pointer" }}
				onClick={() => {
					setFormData(intialValue)
					naviagte("/signin")
				}}
			>Sign in</span></p>
		</Box >

	</div >)
}