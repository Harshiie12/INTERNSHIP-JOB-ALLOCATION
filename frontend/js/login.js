
document.getElementById("loginForm").addEventListener("submit", async function(event) {

    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://127.0.0.1:5000/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert("Login successful! Welcome " + result.student.name);

            localStorage.setItem("student_id", result.student.student_id);
            localStorage.setItem("student_name", result.student.name);

            window.location.href = "dashboard.html";
        } else {
            alert(result.message);
        }

    } catch (error) {
        alert("Unable to connect to the server.");
        console.error(error);
    }

});
