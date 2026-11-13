
// Get the logged-in student's name
const studentName = localStorage.getItem("student_name");

// Display the student's name
if (studentName) {
    document.getElementById("welcomeMessage").textContent =
        "Welcome, " + studentName + "!";
} else {
    // If no student is logged in, return to login page
    window.location.href = "login.html";
}

// Handle logout
document.getElementById("logout").addEventListener("click", function() {
    localStorage.removeItem("student_id");
    localStorage.removeItem("student_name");
});
