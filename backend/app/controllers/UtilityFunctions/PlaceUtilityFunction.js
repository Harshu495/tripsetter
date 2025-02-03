// Utility function to determine category

const getCategory = (types) => {
	const categoryMap = {
		park: "nature",
		museum: "historical",
		landmark: "cultural",
		amusement_park: "adventure",
		beach: "beach",
		mountain: "mountain",
	};
	for (const type of types) {
		if (categoryMap[type]) {
			return categoryMap[type]
		}
	}
	return "cultural"; // Default category
}

//Utility function to determine price range
const getPlaceRange = (pricelevel) => {
	if (pricelevel === 0 || pricelevel === 1) return "cheap"
	if (pricelevel === 2) return "moderate"
	if (pricelevel === 3 || pricelevel === 4) return "expensive"
	return "moderate"// Default price range
}

// Utility function to determine best time to visit
const getBestTimeToVisite = (placeName) => {
	// Convert place name to lowercase for case-insensitive matching
	const name = placeName.toLowerCase();

	// Check for keywords in place name and map them to the season
	if (name.includes("beach") || name.includes("coast") || name.includes("ocean") || name.includes("sea")) {
		return "Summer"; // Beaches are typically best in summer
	}

	if (name.includes("mountain") || name.includes("hill") || name.includes("alps") || name.includes("peak")) {
		return "Winter"; // Mountains are typically best in winter
	}

	if (name.includes("park") || name.includes("garden") || name.includes("forest") || name.includes("reserve")) {
		return "Spring"; // Parks and gardens are great in spring
	}

	if (name.includes("waterfall") || name.includes("falls")) {
		return "Rainy"; // Waterfalls are typically best in the rainy season when they are full
	}

	return "All year round"; // Default if no specific season matches
};


const inferActivities = (placeDetails) => {
	const possibleActivities = [];
	const types = placeDetails.types || [];
	const description = placeDetails.editorial_summary?.overview || "";
	const reviews = placeDetails.reviews || [];

	// Infer from types
	if (types.includes("natural_feature") || types.includes("park")) {
		possibleActivities.push("hiking", "bird watching");
	}
	if (types.includes("waterfall")) {
		possibleActivities.push("photography", "trekking", "swimming");
	}
	if (types.includes("beach")) {
		possibleActivities.push("surfing", "swimming", "sunbathing");
	}

	// Infer from description
	if (/trekking|trail|hike/.test(description)) {
		possibleActivities.push("trekking", "hiking");
	}
	if (/photography|view/.test(description)) {
		possibleActivities.push("photography");
	}

	// Infer from reviews
	reviews.forEach((review) => {
		if (/swim|swimming/.test(review.text)) {
			possibleActivities.push("swimming");
		}
		if (/hike|trail/.test(review.text)) {
			possibleActivities.push("hiking");
		}
		if (/photo|pictures/.test(review.text)) {
			possibleActivities.push("photography");
		}
	});

	// Deduplicate activities
	return [...new Set(possibleActivities)];
};
const getCurrentSeason = () => {
	const month = new Date().getMonth(); // Get current month (0 - 11)

	if (month >= 3 && month <= 5) { // March to May -> Spring
		return "Spring";
	} else if (month >= 6 && month <= 8) { // June to August -> Summer
		return "Summer";
	} else if (month >= 9 && month <= 11) { // September to November -> Fall / Autumn
		return "Fall";
	} else { // December to February -> Winter
		return "Winter";
	}
};


module.exports = { getCategory, getPlaceRange, getBestTimeToVisite, inferActivities, getCurrentSeason }