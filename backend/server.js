const http = require("http");
const express = require("express");
const morgan = require("morgan");
require("dotenv").config();
const Port = process.env.PORT || 4000;
const cors = require("cors");
const socketIo = require("socket.io");
const Notification = require("./app/models/Notification.js");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });
const socketHandler = require("./socketHandler.js")
app.set("io", io); // Set io instance on app for later use
// Initialize Socket.io events
socketHandler(io);
const ConfigDb = require("./config/db.js");
const userRouter = require("./app/routes/user-Routes.js");
const placesRouter = require("./app/routes/TouristPlace-Router.js");
const reviewRouter = require("./app/routes/review-router.js");
const GuidDetailRouter = require("./app/routes/GuidDetail-router.js");
const TripRouter = require("./app/routes/Trip-router.js");
const SubscriberPlanRouter = require("./app/routes/SubscriptionPlan-router.js")

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));
ConfigDb();



// Export io instance for use in controllers
app.use("/api/users", userRouter);
app.use("/api", placesRouter);
app.use("/api", reviewRouter);
app.use("/api", GuidDetailRouter);
app.use("/api", TripRouter);
app.use("/api", SubscriberPlanRouter)

server.listen(Port, () => console.log("Server is connected to PORT", Port));


