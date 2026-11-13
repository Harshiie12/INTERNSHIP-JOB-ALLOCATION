
const studentId = localStorage.getItem("student_id");

// Check whether a student is logged in
if (!studentId) {
    window.location.href = "login.html";
}

// Load existing student details
async function loadProfile() {

    try {
        const response = await fetch(
            `http://127.0.0.1:5000/api/students/${studentId}`
        );

        const result = await response.json();

        if (!response.ok) {
            alert(result.message);
            return;
        }

        const student = result.student;

        document.getElementById("name").value = student[1];
        document.getElementById("email").value = student[2];
        document.getElementById("qualification").value = student[3];
        document.getElementById("cgpa").value = student[4];
        document.getElementById("skills").value = student[5];
        document.getElementById("preferred_type").value = student[6];

    } catch (error) {
        console.error(error);
        alert("Unable to load profile.");
    }
}

// Update student details
document.getElementById("profileForm").addEventListener("submit", async function(event) {

    event.preventDefault();

    const studentData = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        qualification: document.getElementById("qualification").value.trim(),
        cgpa: Number(document.getElementById("cgpa").value),
        skills: document.getElementById("skills").value.trim(),
        preferred_type: document.getElementById("preferred_type").value
    };

    try {
        const response = await fetch(
            `http://127.0.0.1:5000/api/students/${studentId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(studentData)
            }
        );

        const result = await response.json();

        if (response.ok) {
            alert("Profile updated successfully!");
        } else {
            alert(result.message);
        }

    } catch (error) {
        console.error(error);
        alert("Unable to update profile.");
    }

});

// Load profile when page opens
loadProfile();
