
const jobContainer = document.getElementById("jobContainer");

async function loadJobs() {

    try {
        const response = await fetch("http://127.0.0.1:5000/api/opportunities");

        if (!response.ok) {
            throw new Error("Failed to fetch opportunities");
        }

        const result = await response.json();

        // Show only opportunities of type Job
        const jobs = result.opportunities.filter(
            opportunity => opportunity[3].toLowerCase() === "job"
        );

        jobContainer.innerHTML = "";

        if (jobs.length === 0) {
            jobContainer.textContent =
                "No job opportunities available right now.";
            return;
        }

        jobs.forEach(job => {

            const card = document.createElement("div");
            card.className = "job-card";

            const title = document.createElement("h2");
            title.textContent = job[2];

            const company = document.createElement("p");
            company.textContent = "Company: " + job[1];

            const location = document.createElement("p");
            location.textContent = "Location: " + job[6];

            const skills = document.createElement("p");
            skills.textContent = "Required Skills: " + job[4];

            const cgpa = document.createElement("p");
            cgpa.textContent = "Minimum CGPA: " + job[5];

            const applyButton = document.createElement("button");
            applyButton.textContent = "Apply Now";

            applyButton.addEventListener("click", function() {
                applyForJob(job[0]);
            });

            card.append(
                title,
                company,
                location,
                skills,
                cgpa,
                applyButton
            );

            jobContainer.appendChild(card);

        });

    } catch (error) {
        console.error(error);
        jobContainer.textContent =
            "Unable to load jobs. Please try again.";
    }
}


async function applyForJob(opportunityId) {

    const studentId = localStorage.getItem("student_id");

    if (!studentId) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    try {

        const response = await fetch("http://127.0.0.1:5000/api/applications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                student_id: Number(studentId),
                opportunity_id: opportunityId,
                application_date: new Date().toISOString().split("T")[0],
                status: "Applied"
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert("Job application submitted successfully!");
        } else {
            alert(result.message || "Unable to submit job application.");
        }

    } catch (error) {
        console.error(error);
        alert("Unable to connect to the server.");
    }
}

loadJobs();
