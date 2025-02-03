//email validation without package
	const part = formData.email.split('@')//["user1","gamil.com"]
		const domainPart = part[1].split(".")//["gmail","com"]
if (formData.email.trim().length === 0) {
			errors.email = "Email cannot be blank"
		} else if (!formData.email.includes("@") || !formData.email.includes(".")) {
			errors.email = "Email must contain '@' and '.'"
		} else if (part.length !== 2 || part[0].trim() === "" || part[1].trim() === "") {
			errors.email = "Email must have valid characters before and after '@'"
		} else if (domainPart.length < 2 || domainPart.some(part => part.trim() === "")) {
			errors.email = "Email domain must have a valid structure e.g., 'domain.com'"
		}
		

		////Search Functionality/////
		import React, { useState } from "react";
import { Autocomplete, LoadScript } from "@react-google-maps/api";

const PlaceAutocomplete = () => {
	const [autocomplete, setAutocomplete] = useState(null);
	const [placeName, setPlaceName] = useState("");
	const [boudndries, setBoudndries] = useState("")

	const handleLoad = (autoC) => {
		setAutocomplete(autoC);
	};

	const handlePlaceChanged = () => {
		if (autocomplete !== null) {
			const place = autocomplete.getPlace();
			if (place.geometry) {
				const lat = autocomplete.getPlace().geometry.location.lat()
				const lng = autocomplete.getPlace().geometry.location.lng()
				console.log("lat,lng ", lat, lng)
				console.log(autocomplete.getPlace().place_id)

			} else {
				console.log("No details available for the selected place.");
			}

		}
	};

	return (
		<LoadScript googleMapsApiKey="AIzaSyCr0SBHxJQyNcXqp_EchJJKhCmyyY6HLAE" libraries={["places"]}>
			<div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "50px" }}>
				<Autocomplete onLoad={handleLoad} onPlaceChanged={handlePlaceChanged}>
					<input
						type="text"
						placeholder="Search for a place"
						style={{
							width: "300px",
							height: "40px",
							padding: "10px",
							fontSize: "16px",
							border: "1px solid #ccc",
							borderRadius: "4px",
						}}
					/>
				</Autocomplete>
				{placeName && (
					<div style={{ marginTop: "20px", fontSize: "18px", color: "#555" }}>
						Selected Place: <strong>{placeName}</strong>
					</div>
				)}
			</div>
		</LoadScript>
	);
};

export default PlaceAutocomplete;

https://maps.googleapis.com/maps/api/place/nearbysearch/json
