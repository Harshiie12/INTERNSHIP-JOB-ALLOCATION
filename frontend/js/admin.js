
const adminContent = document.getElementById("adminContent");
const adminModal = document.getElementById("adminModal");

// ================= VIEW REGISTERED STUDENTS =================

async function viewStudents() {
    adminModal.style.display = "flex";
    adminContent.innerHTML = "<p>Loading students...</p>";

    try {
        const response = await fetch("http://127.0.0.1:5000/api/students");
        const result = await response.json();

        if (!response.ok) {
            adminContent.innerHTML = "<p>Unable to load students.</p>";
            return;
        }

        if (!result.students || result.students.length === 0) {
            adminContent.innerHTML = "<p>No students registered yet.</p>";
            return;
        }

        let html = `
            <table>
                <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Qualification</th>
                        <th>10th Percentage</th>
                        <th>12th Percentage</th>
                        <th>CGPA</th>
                        <th>Skills</th>
                    </tr>
                </thead>
                <tbody>
        `;

        result.students.forEach(student => {
            html += `
                <tr>
                    <td>${student[0]}</td>
                    <td>${student[1]}</td>
                    <td>${student[2]}</td>
                    <td>${student[3]}</td>
                    <td>${student[6] ?? "Not Provided"}${student[6] != null ? "%" : ""}</td>
                    <td>${student[7] ?? "Not Provided"}${student[7] != null ? "%" : ""}</td>
                    <td>${student[4]}</td>
                    <td>${student[5]}</td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        adminContent.innerHTML = html;

    } catch (error) {
        console.error(error);
        adminContent.innerHTML = "<p>Unable to connect to server.</p>";
    }
}


// ================= CLOSE ADMIN MODAL =================

function closeAdminModal() {
    adminModal.style.display = "none";
}

adminModal.addEventListener("click", function(event) {
    if (event.target === adminModal) {
        closeAdminModal();
    }
});

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        closeAdminModal();
    }
});


// ================= ADD OPPORTUNITY FORM =================

function showOpportunityForm() {
    document.getElementById("adminModalTitle").textContent =
        "Add New Opportunity";

    adminContent.innerHTML = `
        <form id="opportunityForm">

            <label>Company Name</label>
            <input type="text" id="company_name" required>

            <label>Opportunity Title</label>
            <input type="text" id="opportunity_title" required>

            <label>Opportunity Type</label>
            <select id="opportunity_type" required>
                <option value="Internship">Internship</option>
                <option value="Job">Job</option>
            </select>

            <label>Required Skills</label>
            <input type="text" id="required_skills" required>

            <label>Minimum CGPA</label>
            <input type="number" id="minimum_cgpa"
                   min="0" max="10" step="0.01" required>

            <label>Location</label>
            <input type="text" id="location" required>

            <button type="submit">Save Opportunity</button>
        </form>
    `;

    adminModal.style.display = "flex";

    document.getElementById("opportunityForm")
        .addEventListener("submit", async function(event) {

            event.preventDefault();

            const opportunityData = {
                company_name: document.getElementById("company_name").value.trim(),
                opportunity_title: document.getElementById("opportunity_title").value.trim(),
                opportunity_type: document.getElementById("opportunity_type").value,
                required_skills: document.getElementById("required_skills").value.trim(),
                minimum_cgpa: Number(document.getElementById("minimum_cgpa").value),
                location: document.getElementById("location").value.trim()
            };

            try {
                const response = await fetch(
                    "http://127.0.0.1:5000/api/opportunities",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(opportunityData)
                    }
                );

                const result = await response.json();

                if (response.ok) {
                    alert("Opportunity added successfully!");
                    closeAdminModal();
                } else {
                    alert(result.message || "Unable to add opportunity.");
                }

            } catch (error) {
                console.error(error);
                alert("Unable to connect to server.");
            }
        });
}


// ================= VIEW APPLICATION QUEUE =================

async function viewApplications() {
    try {
        const response = await fetch(
            "http://127.0.0.1:5000/api/applications"
        );

        if (!response.ok) {
            throw new Error("Failed to fetch applications");
        }

        const data = await response.json();

        document.getElementById("adminModalTitle").textContent =
            "Application Queue";

        let html = `
            <table>
                <thead>
                    <tr>
                        <th>Queue Position</th>
                        <th>Application ID</th>
                        <th>Student ID</th>
                        <th>Opportunity ID</th>
                        <th>Company</th>
                        <th>Opportunity</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // Each opportunity has its own queue
        const queuePositions = {};
        const queueHasPending = {};

        data.applications.forEach(app => {
            const opportunityId = app[2];
            const applicationStatus = app[4];

            if (queuePositions[opportunityId] === undefined) {
                queuePositions[opportunityId] = 1;
            }

            if (queueHasPending[opportunityId] === undefined) {
                queueHasPending[opportunityId] = false;
            }

            let position = "Processed";
            let canUpdate = false;

            // Applied and Shortlisted both remain pending
            if (
                applicationStatus === "Applied" ||
                applicationStatus === "Shortlisted"
            ) {
                position = queuePositions[opportunityId];
                queuePositions[opportunityId]++;

                // Only the first pending application can be updated
                if (!queueHasPending[opportunityId]) {
                    canUpdate = true;
                    queueHasPending[opportunityId] = true;
                }
            }

            html += `
                <tr>
                    <td>${position}</td>
                    <td>${app[0]}</td>
                    <td>${app[1]}</td>
                    <td>${app[2]}</td>
                    <td>${app[5]}</td>
                    <td>${app[6]}</td>
                    <td>${app[7]}</td>
                    <td>${applicationStatus}</td>
                    <td>
                        ${
                            (
                                applicationStatus === "Applied" ||
                                applicationStatus === "Shortlisted"
                            )
                            ? `
                                <select id="status-${app[0]}"
                                    ${!canUpdate ? "disabled" : ""}>

                                    <option value="Shortlisted"
                                        ${applicationStatus === "Shortlisted" ? "selected" : ""}>
                                        Shortlisted
                                    </option>

                                    <option value="Rejected">Rejected</option>
                                    <option value="Selected">Selected</option>
                                </select>

                                <button
                                    onclick="updateApplicationStatus(${app[0]})"
                                    ${!canUpdate ? "disabled" : ""}>
                                    Update
                                </button>

                                ${
                                    !canUpdate
                                    ? "<small>Waiting for previous application</small>"
                                    : ""
                                }
                            `
                            : applicationStatus
                        }
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;

        adminContent.innerHTML = html;
        adminModal.style.display = "flex";

    } catch (error) {
        console.error("Application Queue Error:", error);
        alert("Unable to load applications.");
    }
}


// ================= UPDATE APPLICATION STATUS =================

async function updateApplicationStatus(applicationId) {
    const statusElement = document.getElementById(`status-${applicationId}`);

    if (!statusElement) {
        alert("Status selection not found.");
        return;
    }

    const status = statusElement.value;

    try {
        const response = await fetch(
            `http://127.0.0.1:5000/api/applications/${applicationId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: status })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Unable to update application.");
            return;
        }

        alert(result.message || "Application status updated successfully!");

        // Reload the queue after updating
        await viewApplications();

    } catch (error) {
        console.error(error);
        alert("Unable to update application status.");
    }
}


// ================= VIEW STUDENT ALLOCATIONS =================

async function viewAllocations() {
    document.getElementById("adminModalTitle").textContent =
        "Student Allocations";

    adminModal.style.display = "flex";
    adminContent.innerHTML = "<p>Loading allocations...</p>";

    try {
        const response = await fetch(
            "http://127.0.0.1:5000/api/allocations"
        );

        const result = await response.json();

        if (!response.ok) {
            adminContent.innerHTML = "<p>Unable to load allocations.</p>";
            return;
        }

        if (!result.allocations || result.allocations.length === 0) {
            adminContent.innerHTML = "<p>No allocations found.</p>";
            return;
        }

        let html = `
            <table>
                <thead>
                    <tr>
                        <th>Allocation ID</th>
                        <th>Student ID</th>
                        <th>Opportunity ID</th>
                        <th>Allocation Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
        `;

        result.allocations.forEach(allocation => {
            html += `
                <tr>
                    <td>${allocation[0]}</td>
                    <td>${allocation[1]}</td>
                    <td>${allocation[2]}</td>
                    <td>${allocation[3]}</td>
                    <td>${allocation[4]}</td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        adminContent.innerHTML = html;

    } catch (error) {
        console.error(error);
        adminContent.innerHTML = "<p>Unable to connect to server.</p>";
    }
}


// ================= VIEW ALL OPPORTUNITIES =================

async function viewOpportunities() {
    document.getElementById("adminModalTitle").textContent =
        "Manage Opportunities";

    adminModal.style.display = "flex";
    adminContent.innerHTML = "<p>Loading opportunities...</p>";

    try {
        const response = await fetch(
            "http://127.0.0.1:5000/api/opportunities"
        );

        const result = await response.json();

        if (!response.ok) {
            adminContent.innerHTML = "<p>Unable to load opportunities.</p>";
            return;
        }

        if (!result.opportunities || result.opportunities.length === 0) {
            adminContent.innerHTML = "<p>No opportunities found.</p>";
            return;
        }

        let html = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Company</th>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Required Skills</th>
                        <th>Minimum CGPA</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
        `;

        result.opportunities.forEach(opportunity => {
            html += `
                <tr>
                    <td>${opportunity[0]}</td>
                    <td>${opportunity[1]}</td>
                    <td>${opportunity[2]}</td>
                    <td>${opportunity[3]}</td>
                    <td>${opportunity[4]}</td>
                    <td>${opportunity[5]}</td>
                    <td>${opportunity[6]}</td>
                    <td>${opportunity[7]}</td>
                    <td>
                        ${
                            opportunity[7] === "Active"
                            ? `<button onclick="closeOpportunity(${opportunity[0]})">
                                   Close Opportunity
                               </button>`
                            : "Closed"
                        }

                        <button onclick="deleteOpportunity(${opportunity[0]})">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        adminContent.innerHTML = html;

    } catch (error) {
        console.error(error);
        adminContent.innerHTML = "<p>Unable to connect to server.</p>";
    }
}


// ================= DELETE OPPORTUNITY =================

async function deleteOpportunity(opportunityId) {
    const confirmDelete = confirm(
        "Are you sure you want to delete this opportunity?"
    );

    if (!confirmDelete) return;

    try {
        const response = await fetch(
            `http://127.0.0.1:5000/api/opportunities/${opportunityId}`,
            {
                method: "DELETE"
            }
        );

        const result = await response.json();

        if (response.ok) {
            alert("Opportunity deleted successfully!");
            await viewOpportunities();
        } else {
            alert(result.message || "Unable to delete opportunity.");
        }

    } catch (error) {
        console.error(error);
        alert("Unable to connect to server.");
    }
}


// ================= CLOSE OPPORTUNITY =================

async function closeOpportunity(opportunityId) {
    const confirmClose = confirm(
        "Are you sure you want to close this opportunity?"
    );

    if (!confirmClose) return;

    try {
        const response = await fetch(
            `http://127.0.0.1:5000/api/opportunities/${opportunityId}/close`,
            {
                method: "PUT"
            }
        );

        const result = await response.json();

        if (response.ok) {
            alert("Opportunity closed successfully!");
            await viewOpportunities();
        } else {
            alert(result.message || "Unable to close opportunity.");
        }

    } catch (error) {
        console.error(error);
        alert("Unable to connect to server.");
    }
}
