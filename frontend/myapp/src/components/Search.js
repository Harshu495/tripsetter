import { Component, useState } from "react"

import { LoadScript, Autocomplete } from "@react-google-maps/api"
export default function PlaceAutocomplete() {
	const [autocomplete, setAutocomplet] = useState(null)
	const [selectedPlace, setSelectedPlace] = useState('')
	const [city, setCity] = useState("")
	const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;

	const handlePlaceChanged = () => {
		if (autocomplete) {
			const place = autocomplete.getPlace()
			const addressComponents = place.address_components;
			if (addressComponents) {
				// Extract city name
				const cityComponent = addressComponents.find((component) =>
					component.types.includes("locality")
				)
				console.log(cityComponent.long_name)
				// 	// Fallback to administrative_area_level_1 if locality is not present
				const fallbackComponent = addressComponents.find((component) =>
					component.types.includes("administrative_area_level_1")
				);
				console.log("FallBack", fallbackComponent.long_name)
				setCity(cityComponent?.long_name || fallbackComponent?.long_name || "City not found")
			}

			console.log(place)
			console.log(city)
			if (place.geometry) {
				const lat = autocomplete.getPlace().geometry.location.lat() || 0
				const lng = autocomplete.getPlace().geometry.location.lng() || 0
				console.log("lat,lng ", lat, lng)
				console.log(autocomplete.getPlace().place_id)
			} else {
				console.log("No details available for the selected place.")
			}
		}
	}

	return (<LoadScript googleMapsApiKey={apiKey} libraries={['places']}>
		<div style={{ padding: '20px' }}>
			<Autocomplete
				onLoad={(autoC) => setAutocomplet(autoC)}
				onPlaceChanged={handlePlaceChanged}
			>
				<input
					type="text"
					placeholder="type place here..."
					style={{
						width: "300px",
						padding: "10px",
						borderRadius: "4px",
						border: "1px solid #ccc",
					}}
				/>
			</Autocomplete>
			{selectedPlace && (
				<p><strong>Selected Place:</strong>{selectedPlace}</p>
			)}
		</div>

	</LoadScript>)


}