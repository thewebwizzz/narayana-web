/* ===================================
   GULZAAR NIGHTS
   MAIN WEBSITE SCRIPT
=================================== */


/* -----------------------------------
   GET ELEMENTS
----------------------------------- */

const gatePage =
    document.getElementById("gatePage");

const hallwayPage =
    document.getElementById("hallwayPage");

const knockButton =
    document.getElementById("knockButton");


/* -----------------------------------
   KNOCK KNOCK BUTTON
----------------------------------- */

knockButton.addEventListener(
    "click",

    function () {

        knockButton.style.opacity = "0";

        gatePage.classList.add("opening");


        /* SHOW HALLWAY */

        setTimeout(function () {

            hallwayPage.classList.add("active");

        }, 900);


        /* REMOVE GATE */

        setTimeout(function () {

            gatePage.style.display = "none";

        }, 2200);

    }

);


/* ===================================
   PROFILE DATA
=================================== */


const profiles = [

    /* ------------------------------
       1 - narayana
    ------------------------------ */

    {

        type: "person",

        image:
            "images/aniketh.jpg",

        role:
            " ",

        name:
            "Narayana Newtown",

        description:
            "Established in 2014–2015, Narayana Newtown is part of Asia’s largest educational conglomerate. It follows a structured CBSE curriculum integrated with advanced competitive foundation programs, focusing on academic excellence and holistic student development.",

        social:
            ""

    },


    
    /* ------------------------------
       7 - SPONSORS
    ------------------------------ */

    {

        type:
            "sponsors",

        role:
            "OUR SPONSORS",

        name:
            "Thank You",

        description:
            "We are grateful to everyone supporting.",

        social:
            ""

    },


    /* ------------------------------
       8 - COPYRIGHT
    ------------------------------ */

    {

        type:
            "copyright",

        role:
            "Narayana",

        name:
            "All Rights Reserved",

        description:
            "© 2026 HULLOR",

        social:
            ""

    }

];


/* ===================================
   GET PROFILE ELEMENTS
=================================== */


const profileImage =
    document.getElementById("profileImage");

const profileRole =
    document.getElementById("profileRole");

const profileName =
    document.getElementById("profileName");

const profileDescription =
    document.getElementById(
        "profileDescription"
    );

const profileSocial =
    document.getElementById(
        "profileSocial"
    );

const sponsorArea =
    document.getElementById(
        "sponsorArea"
    );


const prevButton =
    document.getElementById(
        "prevButton"
    );

const nextButton =
    document.getElementById(
        "nextButton"
    );

const dotsContainer =
    document.getElementById("dots");


/* ===================================
   CURRENT PROFILE
=================================== */

let currentProfile = 0;


/* ===================================
   CREATE DOTS
=================================== */

function createDots() {

    dotsContainer.innerHTML = "";

    profiles.forEach(

        function (profile, index) {

            const dot =
                document.createElement("div");

            dot.classList.add("dot");

            if (
                index === currentProfile
            ) {

                dot.classList.add(
                    "active"
                );

            }

            dotsContainer.appendChild(dot);

        }

    );

}


/* ===================================
   SHOW PROFILE
=================================== */

function showProfile() {


    const profile =
        profiles[currentProfile];


    /* SMALL FADE OUT */

    document.querySelector(
        ".profile-content"
    ).style.opacity = "0";


    setTimeout(function () {


        /* --------------------------
           NORMAL PERSON
        -------------------------- */

        if (
            profile.type === "person"
        ) {


            profileImage.style.display =
                "block";


            profileImage.src =
                profile.image;


            profileRole.textContent =
                profile.role;


            profileName.textContent =
                profile.name;


            profileDescription.textContent =
                profile.description;


            profileSocial.textContent =
                profile.social;


            sponsorArea.style.display =
                "none";

        }


        /* --------------------------
           SPONSORS
        -------------------------- */

        else if (
            profile.type === "sponsors"
        ) {


            profileImage.style.display =
                "none";


            profileRole.textContent =
                profile.role;


            profileName.textContent =
                profile.name;


            profileDescription.textContent =
                profile.description;


            profileSocial.textContent =
                "";


            sponsorArea.style.display =
                "flex";


            sponsorArea.innerHTML = `

                <img
                    src="sponsors/sponsor1.png"
                    class="sponsor-logo"
                    alt="Sponsor">

                <img
                    src="sponsors/sponsor2.png"
                    class="sponsor-logo"
                    alt="Sponsor">

                <img
                    src="sponsors/sponsor3.png"
                    class="sponsor-logo"
                    alt="Sponsor">

            `;

        }


        /* --------------------------
           COPYRIGHT
        -------------------------- */

        else if (
            profile.type === "copyright"
        ) {


            profileImage.style.display =
                "none";


            sponsorArea.style.display =
                "none";


            profileRole.textContent =
                profile.role;


            profileName.textContent =
                profile.name;


            profileDescription.textContent =
                profile.description;


            profileSocial.textContent =
                profile.social;

        }


        /* CREATE DOTS */

        createDots();


        /* FADE IN */

        document.querySelector(
            ".profile-content"
        ).style.opacity = "1";


    }, 250);

}


/* ===================================
   NEXT BUTTON
=================================== */

nextButton.addEventListener(

    "click",

    function () {


        currentProfile++;


        if (
            currentProfile >= profiles.length
        ) {

            currentProfile = 0;

        }


        showProfile();

    }

);


/* ===================================
   PREVIOUS BUTTON
=================================== */

prevButton.addEventListener(

    "click",

    function () {


        currentProfile--;


        if (
            currentProfile < 0
        ) {

            currentProfile =
                profiles.length - 1;

        }


        showProfile();

    }

);


/* ===================================
   INITIAL DOTS
=================================== */

createDots();
