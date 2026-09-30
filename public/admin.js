let registrations = [];


/* ================================
   CHECK LOGIN
================================ */

async function checkLogin() {

    const response =
        await fetch(
            "/api/admin/status"
        );

    const result =
        await response.json();


    if (
        !result.loggedIn
    ) {

        window.location.href =
            "admin-login.html";

    }

}


/* ================================
   LOAD REGISTRATIONS
================================ */

async function loadRegistrations() {

    const response =
        await fetch(

            "/api/admin/registrations"

        );


    if (
        response.status === 401
    ) {

        window.location.href =
            "admin-login.html";

        return;

    }


    registrations =
        await response.json();


    document
        .getElementById(
            "totalRegistrations"
        )
        .textContent =
        registrations.length;


    displayRegistrations(
        registrations
    );

}


/* ================================
   DISPLAY TABLE
================================ */

function displayRegistrations(
    data
) {

    const table =
        document.getElementById(
            "registrationTable"
        );


    table.innerHTML = "";


    data.forEach(

        function (
            registration
        ) {


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${registration.id}
                </td>

                <td>
                    ${escapeHtml(
                        registration.name
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        registration.email
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        registration.mobile
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        registration.dob
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        registration.registration_time
                    )}
                </td>

                <td>

                    <button

                        class="action-button"

                        onclick="viewRegistration(
                            ${registration.id}
                        )">

                        VIEW

                    </button>


                    <button

                        class="action-button"

                        onclick="deleteRegistration(
                            ${registration.id}
                        )">

                        DELETE

                    </button>

                </td>

            `;


            table.appendChild(
                row
            );

        }

    );

}


/* ================================
   ESCAPE HTML
================================ */

function escapeHtml(
    value
) {

    return String(
        value
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* ================================
   VIEW DETAILS
================================ */

async function viewRegistration(
    id
) {

    const response =
        await fetch(

            "/api/admin/registrations/"
            +
            id

        );


    if (
        !response.ok
    ) {

        alert(
            "Could not load registration."
        );

        return;

    }


    const data =
        await response.json();


    const details =
        document.getElementById(
            "detailsContent"
        );


    details.innerHTML = `

        <div class="detail-row">

            <strong>ID:</strong>

            ${data.id}

        </div>


        <div class="detail-row">

            <strong>Name:</strong>

            ${escapeHtml(data.name)}

        </div>


        <div class="detail-row">

            <strong>Email:</strong>

            ${escapeHtml(data.email)}

        </div>


        <div class="detail-row">

            <strong>Mobile:</strong>

            ${escapeHtml(data.mobile)}

        </div>


        <div class="detail-row">

            <strong>WhatsApp:</strong>

            ${escapeHtml(data.whatsapp)}

        </div>


        <div class="detail-row">

            <strong>Date of Birth:</strong>

            ${escapeHtml(data.dob)}

        </div>


        <div class="detail-row">

            <strong>Guardian Number:</strong>

            ${escapeHtml(
                data.guardian_number
            )}

        </div>


        <div class="detail-row">

            <strong>Guardian Consent:</strong>

            ${data.guardian_consent
                ?
                "YES"
                :
                "NO"}

        </div>


        <div class="detail-row">

            <strong>Rules Accepted:</strong>

            ${data.rules_agreement
                ?
                "YES"
                :
                "NO"}

        </div>


        <div class="detail-row">

            <strong>Registration Time:</strong>

            ${escapeHtml(
                data.registration_time
            )}

        </div>


        <h3
            style="
                margin-top:25px;
                color:#C7A15A;
            ">

            Guardian Signature

        </h3>


        <img

            class="signature-image"

            src="${data.signature}"

            alt="Guardian signature">

    `;


    document
        .getElementById(
            "detailsModal"
        )
        .classList.add(
            "active"
        );

}


/* ================================
   DELETE
================================ */

async function deleteRegistration(
    id
) {

    const confirmation =
        confirm(

            "Are you sure you want to permanently delete this registration?"

        );


    if (
        !confirmation
    ) {

        return;

    }


    const response =
        await fetch(

            "/api/admin/registrations/"
            +
            id,

            {

                method:
                    "DELETE"

            }

        );


    if (
        response.ok
    ) {

        loadRegistrations();

    }

    else {

        alert(
            "Could not delete registration."
        );

    }

}


/* ================================
   SEARCH
================================ */

document
    .getElementById(
        "searchInput"
    )
    .addEventListener(

        "input",

        function () {


            const search =
                this.value
                    .toLowerCase();


            const filtered =
                registrations.filter(

                    function (
                        registration
                    ) {


                        return (

                            registration.name
                                .toLowerCase()
                                .includes(
                                    search
                                )

                            ||

                            registration.email
                                .toLowerCase()
                                .includes(
                                    search
                                )

                            ||

                            registration.mobile
                                .includes(
                                    search
                                )

                            ||

                            registration.whatsapp
                                .includes(
                                    search
                                )

                        );

                    }

                );


            displayRegistrations(
                filtered
            );

        }

    );


/* ================================
   CLOSE MODAL
================================ */

document
    .getElementById(
        "closeModal"
    )
    .addEventListener(

        "click",

        function () {

            document
                .getElementById(
                    "detailsModal"
                )
                .classList.remove(
                    "active"
                );

        }

    );


/* ================================
   LOGOUT
================================ */

document
    .getElementById(
        "logoutButton"
    )
    .addEventListener(

        "click",

        async function () {

            await fetch(

                "/api/admin/logout",

                {

                    method:
                        "POST"

                }

            );


            window.location.href =
                "admin-login.html";

        }

    );


/* ================================
   START
================================ */

checkLogin();

loadRegistrations();