/* =========================================================
   REVIEW SYSTEM
   Supabase Submission + Approved Reviews
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("REVIEW.JS LOADED");

    startReviewSystem();

});


async function startReviewSystem() {

    console.log("Starting review system...");


    /* -----------------------------------------------------
       CHECK SUPABASE
    ----------------------------------------------------- */

    if (!window.supabase) {

        console.error("Supabase library NOT loaded.");

        showMessage(
            "Review system error: Supabase library could not be loaded.",
            "error"
        );

        return;
    }


    /* -----------------------------------------------------
       CHECK CONFIGURATION
    ----------------------------------------------------- */

    if (
        typeof SUPABASE_URL === "undefined" ||
        typeof SUPABASE_PUBLISHABLE_KEY === "undefined"
    ) {

        console.error("Supabase configuration is missing.");

        showMessage(
            "Review system error: Supabase configuration is missing.",
            "error"
        );

        return;
    }


    console.log("Supabase URL:", SUPABASE_URL);
    console.log("Supabase configuration detected.");


    /* -----------------------------------------------------
       CREATE SUPABASE CLIENT
    ----------------------------------------------------- */

    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
        );


    console.log("Supabase client created.");


    /* -----------------------------------------------------
       FIND FORM
    ----------------------------------------------------- */

    const reviewForm =
        document.getElementById("reviewForm");


    if (!reviewForm) {

        console.error("reviewForm NOT found.");

        return;
    }


    console.log("Review form found.");


    /* -----------------------------------------------------
       SUBMIT EVENT
    ----------------------------------------------------- */

    reviewForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            console.log("SUBMIT BUTTON CLICKED");

            clearMessage();


            const submitButton =
                reviewForm.querySelector(
                    'button[type="submit"]'
                );


            const originalButtonText =
                submitButton
                    ? submitButton.textContent
                    : "Submit Review";


            /* -------------------------------------------------
               GET FORM VALUES
            ------------------------------------------------- */

            const reviewerName =
                getValue("reviewer_name");

            const email =
                getValue("email");

            const howMet =
                getValue("how_met");

            const relationship =
                getValue("relationship");

            const howLongKnown =
                getValue("how_long_known");


            const overallJourney =
                getRating("overall_journey");

            const education =
                getRating("education");

            const workExperience =
                getRating("work_experience");

            const technicalSkills =
                getRating("technical_skills");

            const leadership =
                getRating("leadership");

            const development =
                getRating("development");

            const recommendation =
                getRating("recommendation");


            const reviewText =
                getValue("review_text");


            const consent =
                document.getElementById(
                    "publication_consent"
                );


            /* -------------------------------------------------
               VALIDATION
            ------------------------------------------------- */

            if (!reviewerName) {

                showMessage(
                    "Please enter your name.",
                    "error"
                );

                return;
            }


            if (!email) {

                showMessage(
                    "Please enter your email address.",
                    "error"
                );

                return;
            }


            if (!isValidEmail(email)) {

                showMessage(
                    "Please enter a valid email address.",
                    "error"
                );

                return;
            }


            if (!howMet) {

                showMessage(
                    "Please select how you met Blessed.",
                    "error"
                );

                return;
            }


            if (!relationship) {

                showMessage(
                    "Please select your relationship with Blessed.",
                    "error"
                );

                return;
            }


            if (!howLongKnown) {

                showMessage(
                    "Please select how long you have known Blessed.",
                    "error"
                );

                return;
            }


            const ratings = [

                overallJourney,
                education,
                workExperience,
                technicalSkills,
                leadership,
                development,
                recommendation

            ];


            if (
                ratings.some(
                    function (rating) {
                        return rating === null;
                    }
                )
            ) {

                showMessage(
                    "Please complete all 7 rating questions.",
                    "error"
                );

                return;
            }


            if (!reviewText) {

                showMessage(
                    "Please write your review or comments.",
                    "error"
                );

                return;
            }


            if (!consent || !consent.checked) {

                showMessage(
                    "Please confirm the publication consent.",
                    "error"
                );

                return;
            }


            /* -------------------------------------------------
               CALCULATE OVERALL RATING
            ------------------------------------------------- */

            const total =
                ratings.reduce(
                    function (sum, rating) {

                        return sum + rating;

                    },
                    0
                );


            const overallRating =
                Math.round(
                    (total / ratings.length) * 100
                ) / 100;


            console.log(
                "Calculated rating:",
                overallRating
            );


            /* -------------------------------------------------
               DISABLE BUTTON
            ------------------------------------------------- */

            if (submitButton) {

                submitButton.disabled = true;

                submitButton.textContent =
                    "Submitting...";

            }


            /* -------------------------------------------------
               INSERT INTO SUPABASE
            ------------------------------------------------- */

            console.log(
                "Sending review to Supabase..."
            );


            try {

                const result =
                    await supabaseClient
                        .from("reviews")
                        .insert({

                            reviewer_name:
                                reviewerName,

                            email:
                                email,

                            how_met:
                                howMet,

                            relationship:
                                relationship,

                            how_long_known:
                                howLongKnown,

                            overall_journey:
                                overallJourney,

                            education:
                                education,

                            work_experience:
                                workExperience,

                            technical_skills:
                                technicalSkills,

                            leadership:
                                leadership,

                            development:
                                development,

                            recommendation:
                                recommendation,

                            overall_rating:
                                overallRating,

                            review_text:
                                reviewText,

                            status:
                                "pending"

                        });


                console.log(
                    "Supabase response:",
                    result
                );


                /* -------------------------------------------------
                   HANDLE ERROR
                ------------------------------------------------- */

                if (result.error) {

                    console.error(
                        "SUPABASE ERROR:",
                        result.error
                    );


                    console.error(
                        "Message:",
                        result.error.message
                    );


                    console.error(
                        "Details:",
                        result.error.details
                    );


                    console.error(
                        "Hint:",
                        result.error.hint
                    );


                    showMessage(
                        "Your review could not be submitted. Please check the error details.",
                        "error"
                    );


                    if (submitButton) {

                        submitButton.disabled =
                            false;

                        submitButton.textContent =
                            originalButtonText;

                    }

                    return;
                }


                /* -------------------------------------------------
                   SUCCESS
                ------------------------------------------------- */

                console.log(
                    "REVIEW SUCCESSFULLY SUBMITTED"
                );


                reviewForm.reset();


                showMessage(

                    "Review submitted successfully! Thank you. Your review is now waiting for approval.",

                    "success"

                );


                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        originalButtonText;

                }


            }

            catch (error) {

                console.error(
                    "UNEXPECTED ERROR:",
                    error
                );


                showMessage(

                    "Something went wrong while submitting your review.",

                    "error"

                );


                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        originalButtonText;

                }

            }

        }
    );


    /* -----------------------------------------------------
       LOAD APPROVED REVIEWS
    ----------------------------------------------------- */

    loadApprovedReviews(
        supabaseClient
    );

}


/* =========================================================
   GET NORMAL FIELD
========================================================= */

function getValue(name) {

    const field =
        document.querySelector(
            '#reviewForm [name="' +
            name +
            '"]'
        );


    if (!field) {

        console.error(
            "Field not found:",
            name
        );

        return "";
    }


    return String(
        field.value || ""
    ).trim();

}


/* =========================================================
   GET RATING
========================================================= */

function getRating(name) {

    const selected =
        document.querySelector(
            '#reviewForm input[name="' +
            name +
            '"]:checked'
        );


    if (!selected) {

        return null;

    }


    const rating =
        Number(
            selected.value
        );


    if (
        rating >= 1 &&
        rating <= 5
    ) {

        return rating;

    }


    return null;

}


/* =========================================================
   EMAIL VALIDATION
========================================================= */

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
    );

}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    message,
    type
) {

    let messageBox =
        document.getElementById(
            "reviewMessage"
        );


    if (!messageBox) {

        messageBox =
            document.createElement(
                "div"
            );

        messageBox.id =
            "reviewMessage";


        const form =
            document.getElementById(
                "reviewForm"
            );


        if (form) {

            form.appendChild(
                messageBox
            );

        }

    }


    if (!messageBox) {

        return;

    }


    messageBox.textContent =
        message;


    messageBox.style.display =
        "block";


    messageBox.style.marginTop =
        "18px";


    messageBox.style.padding =
        "15px 18px";


    messageBox.style.borderRadius =
        "8px";


    messageBox.style.fontWeight =
        "600";


    if (type === "success") {

        messageBox.style.background =
            "#e8f7ee";

        messageBox.style.color =
            "#166534";

        messageBox.style.border =
            "1px solid #86efac";

    }

    else {

        messageBox.style.background =
            "#feecec";

        messageBox.style.color =
            "#991b1b";

        messageBox.style.border =
            "1px solid #fca5a5";

    }


    messageBox.scrollIntoView({

        behavior:
            "smooth",

        block:
            "center"

    });

}


/* =========================================================
   CLEAR MESSAGE
========================================================= */

function clearMessage() {

    const messageBox =
        document.getElementById(
            "reviewMessage"
        );


    if (messageBox) {

        messageBox.remove();

    }

}


/* =========================================================
   LOAD APPROVED REVIEWS
========================================================= */

async function loadApprovedReviews(
    supabaseClient
) {

    const carousel =
        document.getElementById(
            "reviewCarousel"
        );


    if (!carousel) {

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from(
                "approved_reviews_public"
            )
            .select(
                "reviewer_name, relationship, overall_rating, review_text, approved_at, created_at"
            )
            .order(
                "approved_at",
                {
                    ascending:
                        true
                }
            );


    if (error) {

        console.error(
            "Could not load approved reviews:",
            error
        );

        return;

    }


    const countElement =
        document.getElementById(
            "reviewCount"
        );


    const ratingElement =
        document.getElementById(
            "reviewRating"
        );


    if (!data || data.length === 0) {

        if (countElement) {

            countElement.textContent =
                "0";

        }


        if (ratingElement) {

            ratingElement.textContent =
                "0.00 / 5.00";

        }


        carousel.innerHTML =
            "<p style='text-align:center;color:#6b7280;'>No approved reviews yet. Be the first to leave a review.</p>";

        return;

    }


    const ratings =
        data
            .map(
                function (review) {

                    return Number(
                        review.overall_rating
                    );

                }
            )
            .filter(
                function (rating) {

                    return (
                        rating >= 1 &&
                        rating <= 5
                    );

                }
            );


    const average =
        ratings.length
            ? ratings.reduce(
                function (
                    sum,
                    rating
                ) {

                    return sum + rating;

                },
                0
            ) / ratings.length
            : 0;


    if (countElement) {

        countElement.textContent =
            data.length;

    }


    if (ratingElement) {

        ratingElement.textContent =
            average.toFixed(2) +
            " / 5.00";

    }


    carousel.innerHTML =
        "";


    data.forEach(
        function (review) {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "approved-review-card";


            const name =
                document.createElement(
                    "h4"
                );


            name.textContent =
                review.reviewer_name ||
                "Anonymous Reviewer";


            const relationship =
                document.createElement(
                    "p"
                );


            relationship.textContent =
                review.relationship ||
                "";


            const rating =
                document.createElement(
                    "div"
                );


            rating.className =
                "review-rating";


            const numericRating =
                Number(
                    review.overall_rating
                ) || 0;


            rating.textContent =
                "★".repeat(
                    Math.round(
                        numericRating
                    )
                ) +
                " " +
                numericRating.toFixed(
                    2
                ) +
                " / 5";


            const text =
                document.createElement(
                    "p"
                );


            text.textContent =
                review.review_text ||
                "";


            card.appendChild(
                name
            );

            card.appendChild(
                relationship
            );

            card.appendChild(
                rating
            );

            card.appendChild(
                text
            );


            carousel.appendChild(
                card
            );

        }
    );

}
