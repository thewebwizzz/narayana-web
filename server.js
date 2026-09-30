require("dotenv").config();


const express =
    require("express");

const sqlite3 =
    require("sqlite3").verbose();

const bcrypt =
    require("bcryptjs");

const session =
    require("express-session");

const SQLiteStore =
    require("connect-sqlite3")(session);

const path =
    require("path");

const fs =
    require("fs");


/* ================================
   APP
================================ */

const app =
    express();


const PORT =
    process.env.PORT
    ||
    3000;


/* ================================
   CREATE REQUIRED FOLDERS
================================ */

const databaseFolder =
    path.join(
        __dirname,
        "database"
    );

const sessionFolder =
    path.join(
        __dirname,
        "sessions"
    );


if (
    !fs.existsSync(databaseFolder)
) {

    fs.mkdirSync(
        databaseFolder,
        { recursive: true }
    );

}


if (
    !fs.existsSync(sessionFolder)
) {

    fs.mkdirSync(
        sessionFolder,
        { recursive: true }
    );

}


/* ================================
   MIDDLEWARE
================================ */

app.use(

    express.json({

        limit:
            "2mb"

    })

);


/* ================================
   SESSION
================================ */

app.use(

    session({

        store:

            new SQLiteStore({

                db:
                    "sessions.db",

                dir:
                    sessionFolder

            }),


        secret:

            process.env.SESSION_SECRET
            ||
            "change-this-secret",


        resave:
            false,


        saveUninitialized:
            false,


        cookie: {

            httpOnly:
                true,

            sameSite:
                "lax",

            secure:
                false,

            maxAge:
                1000
                *
                60
                *
                60
                *
                8

        }

    })

);


/* ================================
   DATABASE
================================ */

const databasePath =
    path.join(

        databaseFolder,

        "gulzar.db"

    );


const db =
    new sqlite3.Database(
        databasePath
    );


/* ================================
   CREATE TABLES
================================ */

db.serialize(

    function () {


        db.run(

            `

            CREATE TABLE IF NOT EXISTS registrations (

                id INTEGER
                    PRIMARY KEY AUTOINCREMENT,

                name TEXT
                    NOT NULL,

                email TEXT
                    NOT NULL,

                mobile TEXT
                    NOT NULL,

                whatsapp TEXT
                    NOT NULL,

                dob TEXT
                    NOT NULL,

                guardian_number TEXT
                    NOT NULL,

                guardian_consent INTEGER
                    NOT NULL,

                rules_agreement INTEGER
                    NOT NULL,

                signature TEXT
                    NOT NULL,

                registration_time DATETIME
                    DEFAULT CURRENT_TIMESTAMP

            )

            `

        );


        db.run(

            `

            CREATE TABLE IF NOT EXISTS admins (

                id INTEGER
                    PRIMARY KEY AUTOINCREMENT,

                username TEXT
                    UNIQUE NOT NULL,

                password_hash TEXT
                    NOT NULL

            )

            `

        );


        /* CREATE FIRST ADMIN */

        const username =
            process.env.ADMIN_USERNAME;

        const password =
            process.env.ADMIN_PASSWORD;


        if (
            username
            &&
            password
        ) {

            db.get(

                `

                SELECT id

                FROM admins

                WHERE username = ?

                `,

                [username],

                function (
                    error,
                    row
                ) {

                    if (
                        error
                    ) {

                        console.error(
                            error
                        );

                        return;

                    }


                    if (
                        !row
                    ) {

                        const passwordHash =
                            bcrypt.hashSync(
                                password,
                                12
                            );


                        db.run(

                            `

                            INSERT INTO admins
                            (
                                username,
                                password_hash
                            )

                            VALUES
                            (
                                ?,
                                ?
                            )

                            `,

                            [

                                username,

                                passwordHash

                            ],

                            function (
                                error
                            ) {

                                if (
                                    error
                                ) {

                                    console.error(
                                        error
                                    );

                                }

                                else {

                                    console.log(
                                        "Admin account created."
                                    );

                                }

                            }

                        );

                    }

                }

            );

        }

    }

);


/* ================================
   HELPERS
================================ */

function calculateAge(
    dob
) {

    const birthDate =
        new Date(dob);

    const today =
        new Date();


    let age =
        today.getFullYear()
        -
        birthDate.getFullYear();


    const monthDifference =
        today.getMonth()
        -
        birthDate.getMonth();


    if (

        monthDifference < 0

        ||

        (

            monthDifference === 0

            &&

            today.getDate()
            <
            birthDate.getDate()

        )

    ) {

        age--;

    }


    return age;

}


function cleanPhone(
    number
) {

    return String(number)

        .replace(
            /[^0-9+]/g,
            ""
        );

}


function requireAdmin(
    request,
    response,
    next
) {

    if (

        request.session

        &&

        request.session.adminId

    ) {

        return next();

    }


    response.status(401).json({

        message:
            "Unauthorized."

    });

}


/* ================================
   REGISTRATION API
================================ */

app.post(

    "/api/register",

    function (
        request,
        response
    ) {


        const {

            name,

            email,

            mobile,

            whatsapp,

            dob,

            guardianNumber,

            guardianConsent,

            rulesAgreement,

            signature

        }

            =
            request.body;


        /* NAME */

        if (

            !name

            ||

            name.trim().length < 2

            ||

            name.length > 100

        ) {

            return response
                .status(400)
                .json({

                    message:
                        "Please enter a valid name."

                });

        }


        /* EMAIL */

        const emailPattern =

            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (

            !email

            ||

            !emailPattern.test(
                email
            )

        ) {

            return response
                .status(400)
                .json({

                    message:
                        "Please enter a valid email."

                });

        }


        /* PHONE */

        const cleanMobile =
            cleanPhone(
                mobile
            );


        const cleanWhatsapp =
            cleanPhone(
                whatsapp
            );


        const cleanGuardian =
            cleanPhone(
                guardianNumber
            );


        if (

            cleanMobile.length < 7

            ||

            cleanMobile.length > 16

            ||

            cleanWhatsapp.length < 7

            ||

            cleanWhatsapp.length > 16

            ||

            cleanGuardian.length < 7

            ||

            cleanGuardian.length > 16

        ) {

            return response
                .status(400)
                .json({

                    message:
                        "Please enter valid contact numbers."

                });

        }


        /* DOB */

        if (
            !dob
        ) {

            return response
                .status(400)
                .json({

                    message:
                        "Date of birth is required."

                });

        }


        const age =
            calculateAge(
                dob
            );


        if (

            !Number.isFinite(age)

            ||

            age < 15

            ||

            age > 18

        ) {

            return response
                .status(400)
                .json({

                    message:
                        "Registration is only available for ages 15 to 18."

                });

        }


        /* CONSENT */

        if (
            guardianConsent !== true
        ) {

            return response
                .status(400)
                .json({

                    message:
                        "Guardian consent is required."

                });

        }


        if (
            rulesAgreement !== true
        ) {

            return response
                .status(400)
                .json({

                    message:
                        "You must agree to the rules and policies."

                });

        }


        /* SIGNATURE */

        if (

            !signature

            ||

            typeof signature
            !==
            "string"

            ||

            !signature.startsWith(
                "data:image/png;base64,"
            )

            ||

            signature.length
            >
            1500000

        ) {

            return response
                .status(400)
                .json({

                    message:
                        "Please provide a valid guardian signature."

                });

        }


        /* SAVE */

        db.run(

            `

            INSERT INTO registrations
            (

                name,

                email,

                mobile,

                whatsapp,

                dob,

                guardian_number,

                guardian_consent,

                rules_agreement,

                signature

            )

            VALUES
            (
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?
            )

            `,

            [

                name.trim(),

                email
                    .trim()
                    .toLowerCase(),

                cleanMobile,

                cleanWhatsapp,

                dob,

                cleanGuardian,

                1,

                1,

                signature

            ],

            function (
                error
            ) {

                if (
                    error
                ) {

                    console.error(
                        error
                    );


                    return response
                        .status(500)
                        .json({

                            message:
                                "Could not save registration."

                        });

                }


                response.json({

                    success:
                        true,

                    registrationId:
                        this.lastID

                });

            }

        );

    }

);


/* ================================
   ADMIN LOGIN
================================ */

app.post(

    "/api/admin/login",

    function (
        request,
        response
    ) {


        const {

            username,

            password

        }

            =
            request.body;


        if (

            !username

            ||

            !password

        ) {

            return response
                .status(400)
                .json({

                    message:
                        "Username and password are required."

                });

        }


        db.get(

            `

            SELECT *

            FROM admins

            WHERE username = ?

            `,

            [

                username

            ],

            function (
                error,
                admin
            ) {


                if (
                    error
                ) {

                    return response
                        .status(500)
                        .json({

                            message:
                                "Server error."

                        });

                }


                if (
                    !admin
                ) {

                    return response
                        .status(401)
                        .json({

                            message:
                                "Incorrect username or password."

                        });

                }


                const passwordCorrect =
                    bcrypt.compareSync(

                        password,

                        admin.password_hash

                    );


                if (
                    !passwordCorrect
                ) {

                    return response
                        .status(401)
                        .json({

                            message:
                                "Incorrect username or password."

                        });

                }


                request.session.adminId =
                    admin.id;


                request.session.username =
                    admin.username;


                response.json({

                    success:
                        true

                });

            }

        );

    }

);


/* ================================
   ADMIN STATUS
================================ */

app.get(

    "/api/admin/status",

    function (
        request,
        response
    ) {

        response.json({

            loggedIn:

                Boolean(
                    request.session.adminId
                ),

            username:

                request.session.username
                ||
                null

        });

    }

);


/* ================================
   ADMIN LOGOUT
================================ */

app.post(

    "/api/admin/logout",

    function (
        request,
        response
    ) {

        request.session.destroy(

            function (
                error
            ) {

                if (
                    error
                ) {

                    return response
                        .status(500)
                        .json({

                            message:
                                "Logout failed."

                        });

                }


                response.clearCookie(
                    "connect.sid"
                );


                response.json({

                    success:
                        true

                });

            }

        );

    }

);


/* ================================
   GET REGISTRATIONS
================================ */

app.get(

    "/api/admin/registrations",

    requireAdmin,

    function (
        request,
        response
    ) {


        db.all(

            `

            SELECT

                id,

                name,

                email,

                mobile,

                whatsapp,

                dob,

                guardian_number,

                guardian_consent,

                rules_agreement,

                registration_time

            FROM registrations

            ORDER BY

                registration_time DESC

            `,

            [],

            function (
                error,
                rows
            ) {

                if (
                    error
                ) {

                    return response
                        .status(500)
                        .json({

                            message:
                                "Could not load registrations."

                        });

                }


                response.json(
                    rows
                );

            }

        );

    }

);


/* ================================
   GET ONE REGISTRATION
================================ */

app.get(

    "/api/admin/registrations/:id",

    requireAdmin,

    function (
        request,
        response
    ) {


        db.get(

            `

            SELECT *

            FROM registrations

            WHERE id = ?

            `,

            [

                request.params.id

            ],

            function (
                error,
                row
            ) {

                if (
                    error
                ) {

                    return response
                        .status(500)
                        .json({

                            message:
                                "Could not load registration."

                        });

                }


                if (
                    !row
                ) {

                    return response
                        .status(404)
                        .json({

                            message:
                                "Registration not found."

                        });

                }


                response.json(
                    row
                );

            }

        );

    }

);


/* ================================
   DELETE REGISTRATION
================================ */

app.delete(

    "/api/admin/registrations/:id",

    requireAdmin,

    function (
        request,
        response
    ) {


        db.run(

            `

            DELETE FROM registrations

            WHERE id = ?

            `,

            [

                request.params.id

            ],

            function (
                error
            ) {

                if (
                    error
                ) {

                    return response
                        .status(500)
                        .json({

                            message:
                                "Delete failed."

                        });

                }


                if (
                    this.changes === 0
                ) {

                    return response
                        .status(404)
                        .json({

                            message:
                                "Registration not found."

                        });

                }


                response.json({

                    success:
                        true

                });

            }

        );

    }

);


/* ================================
   EXPORT CSV
================================ */

app.get(

    "/api/admin/export",

    requireAdmin,

    function (
        request,
        response
    ) {


        db.all(

            `

            SELECT

                id,

                name,

                email,

                mobile,

                whatsapp,

                dob,

                guardian_number,

                registration_time

            FROM registrations

            ORDER BY

                registration_time DESC

            `,

            [],

            function (
                error,
                rows
            ) {

                if (
                    error
                ) {

                    return response
                        .status(500)
                        .send(
                            "Export failed."
                        );

                }


                let csv =
                    "ID,Name,Email,Mobile,WhatsApp,DOB,Guardian Number,Registration Time\n";


                rows.forEach(

                    function (
                        row
                    ) {


                        const values = [

                            row.id,

                            row.name,

                            row.email,

                            row.mobile,

                            row.whatsapp,

                            row.dob,

                            row.guardian_number,

                            row.registration_time

                        ];


                        csv +=

                            values

                                .map(

                                    function (
                                        value
                                    ) {

                                        const safeValue =
                                            String(
                                                value
                                            )

                                            .replace(
                                                /"/g,
                                                '""'
                                            );

                                        return `"${safeValue}"`;

                                    }

                                )

                                .join(",")

                            +

                            "\n";

                    }

                );


                response.setHeader(

                    "Content-Type",

                    "text/csv"

                );


                response.setHeader(

                    "Content-Disposition",

                    'attachment; filename="gulzar-nights-registrations.csv"'

                );


                response.send(
                    csv
                );

            }

        );

    }

);


/* ================================
   STATIC WEBSITE
================================ */

app.use(

    express.static(

        path.join(
            __dirname,
            "public"
        )

    )

);


/* ================================
   START SERVER
================================ */

app.listen(

    PORT,

    function () {

        console.log(

            `

Gulzar Nights server running.

Open:

http://localhost:${PORT}

            `

        );

    }

);