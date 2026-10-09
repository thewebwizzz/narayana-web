/* =========================================
   GULZAR NIGHTS
   ADMIN DASHBOARD SCRIPT
========================================= */

const totalRegistrations =
    document.getElementById("totalRegistrations");

const searchInput =
    document.getElementById("searchInput");

const registrationTable =
    document.getElementById("registrationTable");

const detailsModal =
    document.getElementById("detailsModal");

const closeModal =
    document.getElementById("closeModal");

const detailsContent =
    document.getElementById("detailsContent");

const logoutButton =
    document.getElementById("logoutButton");

let registrations = [];


/* =========================================
   CHECK ADMIN LOGIN
========================================= */

async function checkAdminLogin() {

    try {

        const response =
            await fetch("/api/admin/status", {
                credentials: "same-origin",
                cache: "no-store"
            });

        if (!response.ok) {
            window.location.href =
                "admin-login.html";
            return false;
        }

        const result =
            await response.json();

        if (!result.loggedIn) {
            window.location.href =
                "admin-login.html";
            return false;
        }

        return true;

    } catch (error) {

        console.error(
            "Login check error:",
            error
        );

        window.location.href =
            "admin-login.html";

        return false;
    }
}


/* =========================================
   LOAD REGISTRATIONS
========================================= */

async function loadRegistrations() {

    try {

        const response =
            await fetch(
                "/api/admin/registrations",
                {
                    credentials: "same-origin",
                    cache: "no-store"
                }
            );

        if (response.status === 401) {
            window.location.href =
                "admin-login.html";
            return;
        }

        const result =
            await response.json();

        registrations =
            Array.isArray(result)
                ? result
                : [];

        totalRegistrations.textContent =
            registrations.length;

        displayRegistrations(
            registrations
        );

    } catch (error) {

        console.error(
            "Could not load registrations:",
            error
        );
    }
}


/* =========================================
   DISPLAY REGISTRATIONS
========================================= */

function displayRegistrations(list) {

    registrationTable.innerHTML = "";

    list.forEach(function(registration) {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>
                ${registration.id}
            </td>

            <td>
                ${escapeHTML(
                    registration.schoolName || ""
                )}
            </td>

            <td>
                ${escapeHTML(
                    registration.schoolEmail || ""
                )}
            </td>

            <td>
                ${formatDate(
                    registration.registrationTime
                )}
            </td>

            <td>

                <button
                    class="view-button"
                    onclick="viewRegistration(${registration.id})"
                >
                    VIEW
                </button>

                <button
                    class="delete-button"
                    onclick="deleteRegistration(${registration.id})"
                >
                    DELETE
                </button>

            </td>
        `;

        registrationTable.appendChild(row);
    });
}


/* =========================================
   VIEW REGISTRATION
========================================= */

async function viewRegistration(id) {

    try {

        const response =
            await fetch(
                `/api/admin/registrations/${id}`,
                {
                    credentials: "same-origin",
                    cache: "no-store"
                }
            );

        if (response.status === 401) {
            window.location.href =
                "admin-login.html";
            return;
        }

        const registration =
            await response.json();


        /* =====================================
           EVENTS
        ===================================== */

        let events =
            Array.isArray(
                registration.events
            )
                ? registration.events
                : [];


        let eventsHTML = "";


        events.forEach(
            function(event, eventIndex) {

                let participantsHTML =
                    "";


                if (
                    Array.isArray(
                        event.participants
                    ) &&
                    event.participants.length > 0
                ) {

                    participantsHTML =
                        event.participants
                            .map(
                                function(participant) {

                                    return `
                                        <div class="participant">

                                            <strong>
                                                ${escapeHTML(
                                                    participant.name || ""
                                                )}
                                            </strong>

                                            <span>
                                                Class:
                                                ${escapeHTML(
                                                    participant.class || ""
                                                )}
                                            </span>

                                        </div>
                                    `;
                                }
                            )
                            .join("");
                }


                eventsHTML += `

                    <div class="event-box">

                        <h3>
                            ${escapeHTML(
                                event.event ||
                                `Event ${eventIndex + 1}`
                            )}
                        </h3>

                        <p>
                            Participants:
                            ${
                                event.participantCount ||
                                0
                            }
                        </p>

                        <div>
                            ${participantsHTML}
                        </div>

                    </div>

                `;
            }
        );


        /* =====================================
           REPRESENTATIVE 1
        ===================================== */

        const representative1 =
            registration.representative1 || {};


        /* =====================================
           REPRESENTATIVE 2
        ===================================== */

        const representative2 =
            registration.representative2 || {};


        /* =====================================
           DETAILS
        ===================================== */

        detailsContent.innerHTML = `

            <h2>
                Registration ID
            </h2>

            <p>
                ${registration.id}
            </p>


            <h2>
                School Name
            </h2>

            <p>
                ${escapeHTML(
                    registration.schoolName || "—"
                )}
            </p>


            <h2>
                School Email
            </h2>

            <p>
                ${escapeHTML(
                    registration.schoolEmail || "—"
                )}
            </p>


            <h2>
                Representative 1
            </h2>

            <p>
                <strong>Name:</strong>
                ${escapeHTML(
                    representative1.name || "—"
                )}
            </p>

            <p>
                <strong>Phone:</strong>
                ${escapeHTML(
                    representative1.phone || "—"
                )}
            </p>

            <p>
                <strong>Email:</strong>
                ${escapeHTML(
                    representative1.email || "—"
                )}
            </p>


            <h2>
                Representative 2
            </h2>

            <p>
                <strong>Name:</strong>
                ${escapeHTML(
                    representative2.name || "—"
                )}
            </p>

            <p>
                <strong>Phone:</strong>
                ${escapeHTML(
                    representative2.phone || "—"
                )}
            </p>

            <p>
                <strong>Email:</strong>
                ${escapeHTML(
                    representative2.email || "—"
                )}
            </p>


            <h2>
                Number of Events
            </h2>

            <p>
                ${registration.numberOfEvents || 0}
            </p>


            <h2>
                Registered
            </h2>

            <p>
                ${formatDate(
                    registration.registrationTime
                )}
            </p>


            <h2>
                Events & Participants
            </h2>

            <div class="events-section">

                ${
                    eventsHTML ||
                    "<p>No events found.</p>"
                }

            </div>

        `;


        detailsModal.style.display =
            "flex";

    } catch (error) {

        console.error(
            "Registration details error:",
            error
        );

        alert(
            "Could not load registration details."
        );
    }
}


/* =========================================
   DELETE REGISTRATION
========================================= */

async function deleteRegistration(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this registration?"
        );

    if (!confirmed) {
        return;
    }


    const response =
        await fetch(
            `/api/admin/registrations/${id}`,
            {
                method: "DELETE",
                credentials: "same-origin"
            }
        );


    if (response.status === 401) {
        window.location.href =
            "admin-login.html";
        return;
    }


    if (!response.ok) {

        alert(
            "Could not delete registration."
        );

        return;
    }


    await loadRegistrations();
}


/* =========================================
   SEARCH
========================================= */

searchInput.addEventListener(
    "input",
    function() {

        const search =
            searchInput.value
                .toLowerCase()
                .trim();


        const filtered =
            registrations.filter(
                function(registration) {

                    return (

                        String(
                            registration.id || ""
                        )
                        .toLowerCase()
                        .includes(search)

                        ||

                        String(
                            registration.schoolName || ""
                        )
                        .toLowerCase()
                        .includes(search)

                        ||

                        String(
                            registration.schoolEmail || ""
                        )
                        .toLowerCase()
                        .includes(search)

                    );
                }
            );


        displayRegistrations(
            filtered
        );
    }
);


/* =========================================
   CLOSE MODAL
========================================= */

closeModal.addEventListener(
    "click",
    function() {

        detailsModal.style.display =
            "none";

    }
);


detailsModal.addEventListener(
    "click",
    function(event) {

        if (
            event.target === detailsModal
        ) {

            detailsModal.style.display =
                "none";

        }

    }
);


/* =========================================
   LOGOUT
========================================= */

logoutButton.addEventListener(
    "click",
    async function() {

        await fetch(
            "/api/admin/logout",
            {
                method: "POST",
                credentials: "same-origin"
            }
        );

        window.location.href =
            "admin-login.html";
    }
);


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================
   FORMAT DATE
========================================= */

function formatDate(value) {

    if (!value) {
        return "—";
    }

    const date =
        new Date(value);

    if (isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* =========================================
   START
========================================= */

(async function() {

    const loggedIn =
        await checkAdminLogin();

    if (!loggedIn) {
        return;
    }

    await loadRegistrations();

})();