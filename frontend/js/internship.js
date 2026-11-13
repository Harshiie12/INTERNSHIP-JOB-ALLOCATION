
const internshipContainer = document.getElementById("internshipContainer");

async function loadInternships() {

    try {
        const response = await fetch("http://127.0.0.1:5000/api/opportunities");

        if (!response.ok) {
            throw new Error("Failed to fetch opportunities");
        }

        const result = await response.json();

        const internships = result.opportunities.filter(
            opportunity => opportunity[3].toLowerCase() === "internship"
        );

        internshipContainer.innerHTML = "";

        if (internships.length === 0) {
            internshipContainer.textContent =
                "No internship opportunities available right now.";
            return;
        }

        internships.forEach(internship => {

            const card = document.createElement("div");
            card.className = "job-card";

            const title = document.createElement("h2");
            title.textContent = internship[2];

            const company = document.createElement("p");
            company.textContent = "Company: " + internship[1];

            const location = document.createElement("p");
            location.textContent = "Location: " + internship[6];

            const skills = document.createElement("p");
            skills.textContent = "Required Skills: " + internship[4];

            const cgpa = document.createElement("p");
            cgpa.textContent = "Minimum CGPA: " + internship[5];

            const applyButton = document.createElement("button");
            applyButton.textContent = "Apply Now";

            applyButton.addEventListener("click", function() {
                applyForInternship(internship[0]);
            });

            card.append(
                title,
                company,
                location,
                skills,
                cgpa,
                applyButton
            );

            internshipContainer.appendChild(card);

        });

    } catch (error) {
        console.error(error);
        internshipContainer.textContent =
            "Unable to load internships. Please try again.";
    }
}


async function applyForInternship(opportunityId) {

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
            alert("Application submitted successfully!");
        } else {
            alert(result.message || "Unable to submit application.");
        }

    } catch (error) {
        console.error(error);
        alert("Unable to connect to the server.");
    }
}

loadInternships();
