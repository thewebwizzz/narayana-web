/* =================================
   ELEMENTS
================================= */

const form = document.getElementById("registrationForm");

const formMessage =
    document.getElementById("formMessage");

const submitButton =
    document.querySelector(".submit-button");

const eventCounter =
    document.getElementById("eventCounter");

const eventCheckboxes =
    document.querySelectorAll(".event-select");


/* =================================
   EVENT MAXIMUMS
================================= */

const eventLimits = {

    "Solo Vocals": 1,
    "Western Band": 8,
    "Slam Poetry": 1,
    "Short Film": 8,
    "Solo Dance": 1,
    "Group Dance": 8,
    "Shark Tank": 2,
    "Fashion Show": 8,
    "Non-Fire Cooking": 2,
    "Quiz": 2,
    "Just a Min Jam": 1,
    "Debate": 1,
    "Painting": 2,
    "Caricature": 2

};


/* =================================
   ADD MAXIMUM TEXT TO EVERY EVENT
================================= */

document.querySelectorAll(".event-card").forEach(function (card) {

    const checkbox =
        card.querySelector(".event-select");

    const countInput =
        card.querySelector(".participant-count");

    if (!checkbox || !countInput) {
        return;
    }

    const eventName =
        checkbox.value;

    const maximum =
        eventLimits[eventName];

    if (!maximum) {
        return;
    }

    /* Set actual maximum */

    countInput.max = maximum;

    countInput.min = 1;


    /* Find the label containing count input */

    const label =
        countInput.closest("label");

    if (!label) {
        return;
    }


    /* Remove old maximum text if it exists */

    const oldLimit =
        label.querySelector(".participant-limit");

    if (oldLimit) {
        oldLimit.remove();
    }


    /* Create maximum text */

    const limitText =
        document.createElement("span");

    limitText.className =
        "participant-limit";

    limitText.textContent =
        "Maximum participants: " + maximum;


    /* Put it directly before input */

    label.insertBefore(
        limitText,
        countInput
    );

});


/* =================================
   UPDATE EVENT COUNTER
================================= */

function updateEventCounter() {

    if (!eventCounter) {
        return;
    }

    const selected =
        document.querySelectorAll(
            ".event-select:checked"
        ).length;

    eventCounter.textContent =
        "Events selected: " + selected;

}


/* =================================
   CREATE PARTICIPANT FIELDS
================================= */

function createParticipantFields(
    eventCard,
    count
) {

    const container =
        eventCard.querySelector(
            ".participants"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";


    const checkbox =
        eventCard.querySelector(
            ".event-select"
        );

    const eventName =
        checkbox.value;

    const maximum =
        eventLimits[eventName];


    if (count > maximum) {
        count = maximum;
    }


    for (
        let i = 1;
        i <= count;
        i++
    ) {

        const row =
            document.createElement("div");

        row.className =
            "participant-row";


        row.innerHTML = `

            <div class="participant-title">
                Participant ${i}
            </div>

            <label>

                Name *

                <input
                    type="text"
                    class="participant-name"
                    maxlength="100"
                    required>

            </label>

            <label>

                Class *

                <input
                    type="text"
                    class="participant-class"
                    maxlength="20"
                    placeholder="e.g. 9, 10, 11 or 12"
                    required>

            </label>

        `;


        container.appendChild(row);

    }

}


/* =================================
   EVENT SELECTION
================================= */

eventCheckboxes.forEach(function (checkbox) {

    checkbox.addEventListener(
        "change",
        function () {

            const eventId =
                checkbox.dataset.event;

            const fields =
                document.getElementById(
                    eventId
                );

            const card =
                checkbox.closest(
                    ".event-card"
                );


            if (!card || !fields) {
                return;
            }


            if (checkbox.checked) {

                fields.classList.add(
                    "active"
                );


                const countInput =
                    card.querySelector(
                        ".participant-count"
                    );


                const maximum =
                    eventLimits[
                        checkbox.value
                    ];


                countInput.max =
                    maximum;


                let count =
                    parseInt(
                        countInput.value
                    );


                if (
                    isNaN(count)
                    ||
                    count < 1
                ) {
                    count = 1;
                }


                if (count > maximum) {
                    count = maximum;
                    countInput.value =
                        maximum;
                }


                createParticipantFields(
                    card,
                    count
                );

            }

            else {

                fields.classList.remove(
                    "active"
                );


                const participants =
                    card.querySelector(
                        ".participants"
                    );


                if (participants) {
                    participants.innerHTML = "";
                }

            }


            updateEventCounter();

        }
    );

});


/* =================================
   PARTICIPANT COUNT
================================= */

document.querySelectorAll(
    ".participant-count"
).forEach(function (input) {

    input.addEventListener(
        "input",
        function () {

            const card =
                input.closest(
                    ".event-card"
                );


            if (!card) {
                return;
            }


            const checkbox =
                card.querySelector(
                    ".event-select"
                );


            const maximum =
                eventLimits[
                    checkbox.value
                ];


            let count =
                parseInt(
                    input.value
                );


            if (
                isNaN(count)
                ||
                count < 1
            ) {

                count = 1;

            }


            if (count > maximum) {

                count = maximum;

                input.value =
                    maximum;

            }


            if (checkbox.checked) {

                createParticipantFields(
                    card,
                    count
                );

            }

        }
    );

});


/* =================================
   COLLECT EVENTS
================================= */

function collectEvents() {

    const selectedEvents = [];


    document.querySelectorAll(
        ".event-select:checked"
    ).forEach(function (checkbox) {

        const card =
            checkbox.closest(
                ".event-card"
            );


        const countInput =
            card.querySelector(
                ".participant-count"
            );


        const count =
            parseInt(
                countInput.value
            );


        const participants = [];


        card.querySelectorAll(
            ".participant-row"
        ).forEach(function (row) {

            const name =
                row.querySelector(
                    ".participant-name"
                ).value.trim();


            const participantClass =
                row.querySelector(
                    ".participant-class"
                ).value.trim();


            participants.push({

                name: name,

                class:
                    participantClass

            });

        });


        selectedEvents.push({

            event:
                checkbox.value,

            participantCount:
                count,

            participants:
                participants

        });

    });


    return selectedEvents;

}


/* =================================
   FORM SUBMIT
================================= */

form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        formMessage.textContent = "";


        const selectedEvents =
            collectEvents();


        if (
            selectedEvents.length === 0
        ) {

            formMessage.textContent =
                "Please select at least one event.";

            return;

        }


        for (
            const selectedEvent
            of selectedEvents
        ) {

            const maximum =
                eventLimits[
                    selectedEvent.event
                ];


            if (
                selectedEvent.participantCount < 1
                ||
                selectedEvent.participantCount > maximum
            ) {

                formMessage.textContent =
                    selectedEvent.event
                    +
                    " allows a maximum of "
                    +
                    maximum
                    +
                    " participant(s).";

                return;

            }


            for (
                const participant
                of selectedEvent.participants
            ) {

                if (
                    !participant.name
                    ||
                    !participant.class
                ) {

                    formMessage.textContent =
                        "Please enter the name and class of every participant.";

                    return;

                }

            }

        }


        /* =================================
           REGISTRATION DATA
        ================================= */

        const registrationData = {

            schoolName:
                document.getElementById(
                    "schoolName"
                ).value.trim(),

            schoolEmail:
                document.getElementById(
                    "schoolEmail"
                ).value.trim(),

            representative1: {

                name:
                    document.getElementById(
                        "representative1Name"
                    ).value.trim(),

                phone:
                    document.getElementById(
                        "representative1Phone"
                    ).value.trim(),

                email:
                    document.getElementById(
                        "representative1Email"
                    ).value.trim()

            },

            representative2: {

                name:
                    document.getElementById(
                        "representative2Name"
                    ).value.trim(),

                phone:
                    document.getElementById(
                        "representative2Phone"
                    ).value.trim(),

                email:
                    document.getElementById(
                        "representative2Email"
                    ).value.trim()

            },

            numberOfEvents:
                selectedEvents.length,

            events:
                selectedEvents,

            rulesAgreement:
                document.getElementById(
                    "rulesAgreement"
                ).checked

        };


        /* =================================
           SUBMIT
        ================================= */

        submitButton.disabled = true;

        submitButton.textContent =
            "SUBMITTING...";


        try {

            const response =
                await fetch(
                    "/api/register",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                registrationData
                            )

                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.message ||
                    "Registration failed."
                );

            }


            form.innerHTML = `

                <div
                    style="
                        text-align:center;
                        padding:40px;
                    "
                >

                    <h2
                        style="
                            font-family:
                            'Cormorant Garamond',
                            serif;
                            font-size:40px;
                            color:#C7A15A;
                            margin-bottom:20px;
                        "
                    >

                        Registration Received

                    </h2>


                    <p>
                        Thank you for registering.
                    </p>


                    <br>


                    <p>
                        The organizers will provide
                        further information regarding
                        your registration.
                    </p>

                </div>

            `;

        }


        catch (error) {

            formMessage.textContent =
                error.message;


            submitButton.disabled =
                false;


            submitButton.textContent =
                "SUBMIT REGISTRATION";

        }

    }
);


/* =================================
   INITIAL SETUP
================================= */

updateEventCounter();