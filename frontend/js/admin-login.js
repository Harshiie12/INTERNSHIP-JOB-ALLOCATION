
const adminLoginForm = document.getElementById("adminLoginForm");
const loginMessage = document.getElementById("loginMessage");

adminLoginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(
            "http://127.0.0.1:5000/api/admin/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            }
        );

        const result = await response.json();

        if (response.ok) {
            localStorage.setItem("admin_id", result.admin_id);
            localStorage.setItem("admin_username", result.username);

            window.location.href = "admin.html";
        } else {
            loginMessage.textContent = result.message || "Invalid admin credentials.";
            loginMessage.style.color = "red";
        }

    } catch (error) {
        console.error(error);
        loginMessage.textContent = "Unable to connect to server.";
        loginMessage.style.color = "red";
    }
});
