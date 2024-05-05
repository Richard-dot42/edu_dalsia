const express = require("express");
const { Edupage } = require("edupage-api");

const app = express();
const port = process.env.PORT || 3000;

app.get("/", async (req, res) => {
    try {
        // Extract username and password from query parameters
        const { username, password } = req.query;

        // Check if both username and password are provided
        if (!username || !password) {
            return res.status(400).send({ message: "Username and password are required" });
        }

        // Initialize Edupage instance
        const edupage = new Edupage();

        try {
            // Attempt to login with provided credentials
            await edupage.login('IvanMarianek', 'RXWEJBHTC9');
        } catch (error) {
            // If login fails, return an error response
            console.error("Login failed:", error);
            return res.status(401).send({ message: "Invalid username or password" });
        }

        // Get today's date
        const today = new Date();

        // Get timetable for today
        const timetable = await edupage.getTimetableForDate(today);
        const lessons = timetable.lessons;

        // Find the next classroom
        let nextClassroom = null;
        for (const lesson of lessons) {
            if (lesson.classrooms.length > 0) {
                nextClassroom = lesson.classrooms[0].name;
                break;
            }
        }

        // Close Edupage instance
        edupage.exit();

        if (nextClassroom) {
            res.send({ nextClassroom });
        } else {
            res.send({ message: "No classrooms found for today" });
        }
    } catch (error) {
        console.error("Error:", error); // Log the error message
        res.status(500).send({ message: "Internal Server Error", error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});