import { Navigate, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
export default function PrivateRouter(props) {
	const user = useSelector((state) => state.user);
	const location = useLocation();

	// Ensure user and user.data are safely accessed
	const isAuthenticated = localStorage.getItem("token") && user && user.data;
	const userRole = user?.data?.role; // Safe access with optional chaining

	// Unauthorized conditions
	if (!isAuthenticated) {
		return <Navigate to="/signin" state={{ from: location }} />;
	}

	if (props.primmitedRole) {
		// Check if role is permitted
		if (props.primmitedRole.includes(userRole)) {
			return props.children;
		} else {
			return <p>Unauthorized</p>;
		}
	}

	// Default behavior if authenticated
	return props.children;
}