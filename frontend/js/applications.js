
const applicationsContainer = document.getElementById("applicationsContainer");

async function loadApplications() {

    const studentId = localStorage.getItem("student_id");

    if (!studentId) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    try {

        const response = await fetch("http://127.0.0.1:5000/api/applications");

        if (!response.ok) {
            throw new Error("Failed to fetch applications");
        }

        const result = await response.json();

        // Filter applications of the logged-in student
        const myApplications = result.applications.filter(
            application => Number(application[1]) === Number(studentId)
        );

        applicationsContainer.innerHTML = "";

        if (myApplications.length === 0) {
            applicationsContainer.textContent =
                "You have not applied for any opportunities yet.";
            return;
        }

        myApplications.forEach(application => {

            const card = document.createElement("div");
            card.className = "job-card";

            const title = document.createElement("h2");
            title.textContent = application[6];

            const company = document.createElement("p");
            company.textContent = "Company: " + application[5];

            const type = document.createElement("p");
            type.textContent = "Type: " + application[7];

            const date = document.createElement("p");
            date.textContent = "Application Date: " +
                new Date(application[3]).toLocaleDateString();

            // Application status with different colors
            const status = document.createElement("p");

            const statusColors = {
                "Applied": "#2563eb",
                "Shortlisted": "#f59e0b",
                "Selected": "#16a34a",
                "Rejected": "#dc2626"
            };

            status.textContent = "Status: " + application[4];

            status.style.color = statusColors[application[4]] || "#6b7280";
            status.style.fontWeight = "700";
            status.style.fontSize = "16px";

            card.append(title, company, type, date, status);

            applicationsContainer.appendChild(card);

        });

    } catch (error) {
        console.error(error);
        applicationsContainer.textContent =
            "Unable to load applications. Please try again.";
    }
}

loadApplications();
