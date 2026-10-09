/* =========================================
   GULZAR NIGHTS
   MAIN SERVER
========================================= */

require("dotenv").config();

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const path = require("path");
const fs = require("fs");


/* =========================================
   APP
========================================= */

const app = express();

const PORT = process.env.PORT || 3000;

const databaseFolder =
    path.join(__dirname, "database");

const sessionFolder =
    path.join(__dirname, "sessions");

const databasePath =
    path.join(databaseFolder, "gulzar.db");


/* =========================================
   CREATE FOLDERS
========================================= */

if (!fs.existsSync(databaseFolder)) {
    fs.mkdirSync(databaseFolder, {
        recursive: true
    });
}

if (!fs.existsSync(sessionFolder)) {
    fs.mkdirSync(sessionFolder, {
        recursive: true
    });
}


/* =========================================
   MIDDLEWARE
========================================= */

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


/* =========================================
   SESSION
========================================= */

app.use(
    session({
        store: new SQLiteStore({
            db: "sessions.db",
            dir: sessionFolder
        }),

        secret:
            process.env.SESSION_SECRET ||
            "change-this-secret",

        resave: false,

        saveUninitialized: false,

        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: 1000 * 60 * 60 * 8
        }
    })
);


/* =========================================
   DATABASE
========================================= */

const db =
    new sqlite3.Database(
        databasePath,
        function(error) {
            if (error) {
                console.error(
                    "Database connection error:",
                    error
                );
            } else {
                console.log(
                    "Database connected."
                );
            }
        }
    );


/* =========================================
   CREATE REGISTRATION TABLE
========================================= */

db.run(`
    CREATE TABLE IF NOT EXISTS registrations_v2 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        school_name TEXT NOT NULL,
        school_email TEXT NOT NULL,

        representative1_name TEXT NOT NULL,
        representative1_phone TEXT NOT NULL,
        representative1_email TEXT NOT NULL,

        representative2_name TEXT NOT NULL,
        representative2_phone TEXT NOT NULL,
        representative2_email TEXT NOT NULL,

        number_of_events INTEGER NOT NULL,
        events TEXT NOT NULL,

        rules_agreement INTEGER NOT NULL,

        registration_time DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`, function(error) {
    if (error) {
        console.error(
            "Registration table error:",
            error
        );
    } else {
        console.log(
            "Registration table ready."
        );
    }
});


/* =========================================
   CREATE ADMIN TABLE
========================================= */

db.run(`
    CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
    )
`, function(error) {
    if (error) {
        console.error(
            "Admin table error:",
            error
        );
    } else {
        console.log(
            "Admin table ready."
        );

        createFirstAdmin();
    }
});


/* =========================================
   CREATE FIRST ADMIN
========================================= */

function createFirstAdmin() {

    const username =
        String(
            process.env.ADMIN_USERNAME || ""
        ).trim();

    const password =
        String(
            process.env.ADMIN_PASSWORD || ""
        );

    if (!username || !password) {
        console.log(
            "ADMIN_USERNAME or ADMIN_PASSWORD missing in .env"
        );

        return;
    }

    db.get(
        `
        SELECT id
        FROM admins
        WHERE username = ?
        `,
        [username],
        function(error, admin) {

            if (error) {
                console.error(
                    "Admin lookup error:",
                    error
                );

                return;
            }

            if (admin) {
                console.log(
                    "Admin account already exists."
                );

                return;
            }

            const passwordHash =
                bcrypt.hashSync(
                    password,
                    10
                );

            db.run(
                `
                INSERT INTO admins
                (
                    username,
                    password_hash
                )
                VALUES (?, ?)
                `,
                [
                    username,
                    passwordHash
                ],
                function(error) {

                    if (error) {
                        console.error(
                            "Admin creation error:",
                            error
                        );

                        return;
                    }

                    console.log(
                        "Admin account created."
                    );
                }
            );
        }
    );
}


/* =========================================
   ADMIN AUTH MIDDLEWARE
========================================= */

function requireAdmin(
    request,
    response,
    next
) {

    if (
        request.session &&
        request.session.adminId
    ) {
        next();
        return;
    }

    response.status(401).json({
        message: "Unauthorized."
    });
}


/* =========================================
   REGISTER
========================================= */

app.post(
    "/api/register",
    function(request, response) {

        const body =
            request.body || {};

        const schoolName =
            String(
                body.schoolName || ""
            ).trim();

        const schoolEmail =
            String(
                body.schoolEmail || ""
            ).trim();

        const representative1 =
            body.representative1 || {};

        const representative2 =
            body.representative2 || {};

        const representative1Name =
            String(
                representative1.name || ""
            ).trim();

        const representative1Phone =
            String(
                representative1.phone || ""
            ).trim();

        const representative1Email =
            String(
                representative1.email || ""
            ).trim();

        const representative2Name =
            String(
                representative2.name || ""
            ).trim();

        const representative2Phone =
            String(
                representative2.phone || ""
            ).trim();

        const representative2Email =
            String(
                representative2.email || ""
            ).trim();

        const numberOfEvents =
            Number(
                body.numberOfEvents
            );

        const events =
            Array.isArray(body.events)
                ? body.events
                : [];

        const rulesAgreement =
            body.rulesAgreement === true;


        /* -------------------------
           BASIC VALIDATION
        ------------------------- */

        if (!schoolName) {
            return response.status(400).json({
                message:
                    "School name is required."
            });
        }

        if (!schoolEmail) {
            return response.status(400).json({
                message:
                    "School email is required."
            });
        }

        if (
            !representative1Name ||
            !representative1Phone ||
            !representative1Email
        ) {
            return response.status(400).json({
                message:
                    "Representative 1 details are required."
            });
        }

        if (
            !representative2Name ||
            !representative2Phone ||
            !representative2Email
        ) {
            return response.status(400).json({
                message:
                    "Representative 2 details are required."
            });
        }

        if (
            !Number.isInteger(
                numberOfEvents
            ) ||
            numberOfEvents < 1
        ) {
            return response.status(400).json({
                message:
                    "Invalid number of events."
            });
        }

        if (
            events.length !==
            numberOfEvents
        ) {
            return response.status(400).json({
                message:
                    "Event information does not match the number of events."
            });
        }

        if (!rulesAgreement) {
            return response.status(400).json({
                message:
                    "You must agree to the rules."
            });
        }


        /* -------------------------
           SAVE REGISTRATION
        ------------------------- */

        db.run(
            `
            INSERT INTO registrations_v2
            (
                school_name,
                school_email,

                representative1_name,
                representative1_phone,
                representative1_email,

                representative2_name,
                representative2_phone,
                representative2_email,

                number_of_events,
                events,

                rules_agreement
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                schoolName,
                schoolEmail,

                representative1Name,
                representative1Phone,
                representative1Email,

                representative2Name,
                representative2Phone,
                representative2Email,

                numberOfEvents,
                JSON.stringify(events),

                1
            ],
            function(error) {

                if (error) {

                    console.error(
                        "Registration save error:",
                        error
                    );

                    return response.status(500).json({
                        message:
                            "Could not save registration."
                    });
                }

                response.json({
                    success: true,
                    registrationId: this.lastID
                });
            }
        );
    }
);


/* =========================================
   ADMIN LOGIN
========================================= */

app.post(
    "/api/admin/login",
    function(request, response) {

        const body =
            request.body || {};

        const username =
            String(
                body.username || ""
            ).trim();

        const password =
            String(
                body.password || ""
            );


        if (!username || !password) {
            return response.status(400).json({
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
            [username],
            function(error, admin) {

                if (error) {

                    console.error(
                        "Admin login database error:",
                        error
                    );

                    return response.status(500).json({
                        message:
                            "Server error."
                    });
                }


                if (!admin) {
                    return response.status(401).json({
                        message:
                            "Incorrect username or password."
                    });
                }


                let correct = false;

                try {

                    correct =
                        bcrypt.compareSync(
                            password,
                            admin.password_hash
                        );

                } catch (error) {

                    console.error(
                        "Password comparison error:",
                        error
                    );

                    return response.status(500).json({
                        message:
                            "Server error."
                    });
                }


                if (!correct) {
                    return response.status(401).json({
                        message:
                            "Incorrect username or password."
                    });
                }


                request.session.adminId =
                    admin.id;

                request.session.username =
                    admin.username;


                request.session.save(
                    function(error) {

                        if (error) {

                            console.error(
                                "Session save error:",
                                error
                            );

                            return response.status(500).json({
                                message:
                                    "Could not create login session."
                            });
                        }


                        console.log(
                            "Admin login successful:",
                            admin.username
                        );

                        response.json({
                            success: true,
                            username:
                                admin.username
                        });
                    }
                );
            }
        );
    }
);


/* =========================================
   ADMIN STATUS
========================================= */

app.get(
    "/api/admin/status",
    function(request, response) {

        response.set(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, proxy-revalidate"
        );

        response.set(
            "Pragma",
            "no-cache"
        );

        const loggedIn =
            Boolean(
                request.session &&
                request.session.adminId
            );


        response.json({
            loggedIn:
                loggedIn,

            username:
                loggedIn
                    ? request.session.username
                    : null
        });
    }
);


/* =========================================
   ADMIN LOGOUT
========================================= */

app.post(
    "/api/admin/logout",
    function(request, response) {

        request.session.destroy(
            function(error) {

                if (error) {

                    console.error(
                        "Logout error:",
                        error
                    );

                    return response.status(500).json({
                        message:
                            "Could not log out."
                    });
                }


                response.clearCookie(
                    "connect.sid"
                );

                response.json({
                    success: true
                });
            }
        );
    }
);


/* =========================================
   GET ALL REGISTRATIONS
========================================= */

app.get(
    "/api/admin/registrations",
    requireAdmin,
    function(request, response) {

        db.all(
            `
            SELECT *
            FROM registrations_v2
            ORDER BY registration_time DESC
            `,
            [],
            function(error, rows) {

                if (error) {

                    console.error(
                        "Registration fetch error:",
                        error
                    );

                    return response.status(500).json({
                        message:
                            "Could not load registrations."
                    });
                }


                const registrations =
                    rows.map(function(row) {

                        let events = [];

                        try {
                            events =
                                JSON.parse(
                                    row.events || "[]"
                                );
                        } catch (error) {
                            events = [];
                        }


                        return {
                            id: row.id,

                            schoolName:
                                row.school_name,

                            schoolEmail:
                                row.school_email,

                            representative1: {
                                name:
                                    row.representative1_name,

                                phone:
                                    row.representative1_phone,

                                email:
                                    row.representative1_email
                            },

                            representative2: {
                                name:
                                    row.representative2_name,

                                phone:
                                    row.representative2_phone,

                                email:
                                    row.representative2_email
                            },

                            numberOfEvents:
                                row.number_of_events,

                            events:
                                events,

                            rulesAgreement:
                                Boolean(
                                    row.rules_agreement
                                ),

                            registrationTime:
                                row.registration_time
                        };
                    });


                response.json(
                    registrations
                );
            }
        );
    }
);


/* =========================================
   GET ONE REGISTRATION
========================================= */

app.get(
    "/api/admin/registrations/:id",
    requireAdmin,
    function(request, response) {

        const id =
            Number(
                request.params.id
            );


        if (!Number.isInteger(id)) {
            return response.status(400).json({
                message:
                    "Invalid registration ID."
            });
        }


        db.get(
            `
            SELECT *
            FROM registrations_v2
            WHERE id = ?
            `,
            [id],
            function(error, row) {

                if (error) {

                    console.error(
                        "Registration details error:",
                        error
                    );

                    return response.status(500).json({
                        message:
                            "Could not load registration."
                    });
                }


                if (!row) {
                    return response.status(404).json({
                        message:
                            "Registration not found."
                    });
                }


                let events = [];

                try {
                    events =
                        JSON.parse(
                            row.events || "[]"
                        );
                } catch (error) {
                    events = [];
                }


                response.json({
                    id: row.id,

                    schoolName:
                        row.school_name,

                    schoolEmail:
                        row.school_email,

                    representative1: {
                        name:
                            row.representative1_name,

                        phone:
                            row.representative1_phone,

                        email:
                            row.representative1_email
                    },

                    representative2: {
                        name:
                            row.representative2_name,

                        phone:
                            row.representative2_phone,

                        email:
                            row.representative2_email
                    },

                    numberOfEvents:
                        row.number_of_events,

                    events:
                        events,

                    rulesAgreement:
                        Boolean(
                            row.rules_agreement
                        ),

                    registrationTime:
                        row.registration_time
                });
            }
        );
    }
);


/* =========================================
   DELETE REGISTRATION
========================================= */

app.delete(
    "/api/admin/registrations/:id",
    requireAdmin,
    function(request, response) {

        const id =
            Number(
                request.params.id
            );


        if (!Number.isInteger(id)) {
            return response.status(400).json({
                message:
                    "Invalid registration ID."
            });
        }


        db.run(
            `
            DELETE FROM registrations_v2
            WHERE id = ?
            `,
            [id],
            function(error) {

                if (error) {

                    console.error(
                        "Delete registration error:",
                        error
                    );

                    return response.status(500).json({
                        message:
                            "Could not delete registration."
                    });
                }


                if (this.changes === 0) {
                    return response.status(404).json({
                        message:
                            "Registration not found."
                    });
                }


                response.json({
                    success: true
                });
            }
        );
    }
);


/* =========================================
   EXPORT CSV
========================================= */

app.get(
    "/api/admin/export",
    requireAdmin,
    function(request, response) {

        db.all(
            `
            SELECT *
            FROM registrations_v2
            ORDER BY registration_time DESC
            `,
            [],
            function(error, rows) {

                if (error) {

                    console.error(
                        "CSV export error:",
                        error
                    );

                    return response.status(500).send(
                        "Could not export registrations."
                    );
                }


                function csvEscape(value) {

                    const text =
                        String(
                            value ?? ""
                        );

                    return `"${text.replace(
                        /"/g,
                        '""'
                    )}"`;
                }


                const headers = [
                    "ID",
                    "School Name",
                    "School Email",

                    "Representative 1 Name",
                    "Representative 1 Phone",
                    "Representative 1 Email",

                    "Representative 2 Name",
                    "Representative 2 Phone",
                    "Representative 2 Email",

                    "Number Of Events",
                    "Events",
                    "Rules Agreement",
                    "Registration Time"
                ];


                const csvRows = [
                    headers.map(
                        csvEscape
                    ).join(",")
                ];


                rows.forEach(function(row) {

                    csvRows.push(
                        [
                            row.id,
                            row.school_name,
                            row.school_email,

                            row.representative1_name,
                            row.representative1_phone,
                            row.representative1_email,

                            row.representative2_name,
                            row.representative2_phone,
                            row.representative2_email,

                            row.number_of_events,
                            row.events,
                            row.rules_agreement
                                ? "Yes"
                                : "No",

                            row.registration_time
                        ]
                            .map(csvEscape)
                            .join(",")
                    );
                });


                const csv =
                    csvRows.join("\n");


                response.setHeader(
                    "Content-Type",
                    "text/csv; charset=utf-8"
                );

                response.setHeader(
                    "Content-Disposition",
                    "attachment; filename=Gulzar-Nights-Registrations.csv"
                );


                response.send(csv);
            }
        );
    }
);


/* =========================================
   ADMIN PAGE PROTECTION
========================================= */

app.get("/admin.html", function (req, res) {
    if (!req.session || !req.session.adminId) {
        return res.redirect("/admin-login.html");
    }

    res.sendFile(
        path.join(__dirname, "public", "admin.html")
    );
});


/* =========================================
   PUBLIC STATIC FILES
========================================= */

app.use(
    express.static(
        path.join(__dirname, "public"),
        {
            index: false
        }
    )
);
/* =========================================
   HOME PAGE
========================================= */

app.get(
    "/",
    function(request, response) {

        response.sendFile(
            path.join(
                __dirname,
                "public",
                "index.html"
            )
        );
    }
);


/* =========================================
   ERROR HANDLER
========================================= */

app.use(
    function(error, request, response, next) {

        console.error(
            "Server error:",
            error
        );

        response.status(500).json({
            message:
                "Internal server error."
        });
    }
);


/* =========================================
   START SERVER
========================================= */

app.listen(
    PORT,
    function() {

        console.log(
            "================================="
        );

        console.log(
            "GULZAR NIGHTS SERVER RUNNING"
        );

        console.log(
            "http://localhost:" + PORT
        );

        console.log(
            "================================="
        );
    }
);