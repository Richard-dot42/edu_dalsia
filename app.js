const express = require("express");
const bodyParser = require("body-parser");
const { Edupage } = require("edupage-api");

const app = express();

// Middleware
app.use(bodyParser.json());

// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;

    // Authenticate with Edupage API
    const edupage = new Edupage();
    try {
        await edupage.login(username, password);
        res.status(200).json({ message: "Authentication successful", edupage });
    } catch (error) {
        res.status(401).json({ error: "Authentication failed" });
    }
});

// GET /api/edupage/next-classroom
app.get("/api/edupage/next-classroom", async (req, res) => {
    const { username, password } = req.query;

    // Authenticate with Edupage API
    const edupage = new Edupage();
    try {
        await edupage.login(username, password);

        // Get today's date
        const today = new Date();
        
        // Get timetable for today
        const timetable = await edupage.getTimetableForDate(today);
        
        // Find the next classroom
        let nextClassroom = null;
        for (const lesson of timetable.lessons) {
            const currentTime = new Date();
            const lessonStartTime = new Date(lesson.date);
            if (lessonStartTime > currentTime) {
                nextClassroom = lesson.classrooms[0].name; // Assuming only one classroom per lesson
                break;
            }
        }

        // Return next classroom
        if (nextClassroom) {
            res.status(200).json({ nextClassroom });
        } else {
            res.status(404).json({ error: "No upcoming lessons found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Internal Server Error");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
