import { useEffect, useState } from "react"
import axios from "../config/axios"
export default function SubscriptionPlan() {
	const [plans, setPlans] = useState(null)
	useEffect(() => {
		(async () => {
			try {
				const response = await axios.get("/api/subscription-plan")
				console.log(response.data)
				setPlans(response.data)
			} catch (err) {
				console.log(err)
			}
		})()
	}, [])
	const makePayment = async () => {

	}
	return (<div>
		Subscription Plan
		{plans && plans.map(plan => {
			return (<div key={plan._id}>
				<p>Name:{plan.name}</p>
				<p>Price:{plan.price}</p>
				<button onClick={() => {
					makePayment()
				}}>Buy Now</button>
			</div>)
		})}
	</div>)
}