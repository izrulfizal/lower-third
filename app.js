// =========================================================
// SUPABASE CONFIG
// =========================================================

const SUPABASE_URL =
    "https://cocgtueqcrtluaeaenal.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_BU0IAgjBzqRUt-vpOw8z7A_hZGVIxRv";


const client =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


// =========================================================
// ELEMENTS
// =========================================================

const lowerThird =
    document.getElementById(
        "lowerThird"
    );

const nameEl =
    document.getElementById(
        "studentName"
    );

const programmeEl =
    document.getElementById(
        "programme"
    );

const countryEl =
    document.getElementById(
        "country"
    );

const awardEl =
    document.getElementById(
        "award"
    );


// =========================================================
// STATE
// =========================================================

let animationTimer = null;


// =========================================================
// SET DATA
// =========================================================

function setStudentData(student) {

    nameEl.textContent =
        student.student_name || "";

    programmeEl.textContent =
        student.programme || "";

    countryEl.textContent =
        student.country || "";


    // Distinction only

    if (
        student.award_class &&
        student.award_class
            .toLowerCase()
            .trim()
            === "distinction"
    ) {

        awardEl.classList.remove(
            "hidden-element"
        );

    } else {

        awardEl.classList.add(
            "hidden-element"
        );

    }

}


// =========================================================
// SHOW
// =========================================================

function showLowerThird(student) {

    // Cancel previous timer

    if (animationTimer) {

        clearTimeout(
            animationTimer
        );

    }


    // If another graduate is already showing,
    // animate them out first.

    if (
        lowerThird.classList.contains(
            "visible"
        )
    ) {

        lowerThird.classList.remove(
            "visible"
        );

        lowerThird.classList.add(
            "hidden"
        );


        setTimeout(
            () => {

                setStudentData(
                    student
                );

                showAnimation();

            },
            500
        );

    } else {

        setStudentData(
            student
        );

        showAnimation();

    }


}


// =========================================================
// SHOW ANIMATION
// =========================================================

function showAnimation() {

    requestAnimationFrame(
        () => {

            lowerThird.classList.remove(
                "hidden"
            );

            lowerThird.classList.add(
                "visible"
            );

        }
    );

}


// =========================================================
// HIDE
// =========================================================

function hideLowerThird() {

    lowerThird.classList.remove(
        "visible"
    );

    lowerThird.classList.add(
        "hidden"
    );

}


// =========================================================
// PROCESS SUPABASE RECORD
// =========================================================

function processRecord(record) {

    console.log(
        "Display record:",
        record
    );


    if (!record) {

        hideLowerThird();

        return;

    }


    if (record.is_visible) {

        showLowerThird(
            record
        );

    } else {

        hideLowerThird();

    }

}


// =========================================================
// LOAD CURRENT STATE
// =========================================================

async function loadInitialState() {

    console.log(
        "Loading current display..."
    );


    const {
        data,
        error
    } = await client

        .from(
            "convocation_display"
        )

        .select("*")

        .eq(
            "id",
            1
        )

        .single();


    if (error) {

        console.error(
            "Initial load error:",
            error
        );

        return;

    }


    processRecord(
        data
    );

}


// =========================================================
// REALTIME
// =========================================================

function subscribeRealtime() {

    console.log(
        "Connecting to Supabase Realtime..."
    );


    client

        .channel(
            "convocation-display"
        )

        .on(

            "postgres_changes",

            {

                event:
                    "UPDATE",

                schema:
                    "public",

                table:
                    "convocation_display",

                filter:
                    "id=eq.1"

            },

            payload => {

                console.log(
                    "Realtime update:",
                    payload.new
                );


                processRecord(
                    payload.new
                );

            }

        )

        .subscribe(
            status => {

                console.log(
                    "Realtime:",
                    status
                );

            }
        );

}


// =========================================================
// START
// =========================================================

loadInitialState();

subscribeRealtime();