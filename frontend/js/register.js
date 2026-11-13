
document.getElementById("registerForm").addEventListener("submit", async function(event) {

    event.preventDefault();

    const studentData = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value,
        qualification: document.getElementById("qualification").value.trim(),
        cgpa: Number(document.getElementById("cgpa").value),
        skills: document.getElementById("skills").value.trim(),
        preferred_type: document.getElementById("preferred_type").value
    };

    try {
        const response = await fetch("http://127.0.0.1:5000/api/students", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(studentData)
        });

        const result = await response.json();

        if (response.ok) {
            alert("Registration successful! You can now login.");

            document.getElementById("registerForm").reset();

            window.location.href = "login.html";
        } else {
            alert(result.message || "Registration failed.");
        }

    } catch (error) {
        console.error(error);
        alert("Unable to connect to the server.");
    }

});
