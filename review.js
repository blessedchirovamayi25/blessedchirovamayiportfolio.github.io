/* =========================================================
   REVIEW SYSTEM
   Supabase Submission + Approved Reviews
========================================================= */

(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        startReviewSystem();
    });


    /* =====================================================
       START REVIEW SYSTEM
    ===================================================== */

    async function startReviewSystem() {

        /* Check Supabase library */
        if (!window.supabase) {
            console.error("Supabase JavaScript library is not loaded.");

            showMessage(
                "The review system could not start. Please refresh the page.",
                "error"
            );

            return;
        }


        /* Check Supabase configuration */
        if (
            typeof SUPABASE_URL === "undefined" ||
            typeof SUPABASE_PUBLISHABLE_KEY === "undefined"
        ) {
            console.error("Supabase configuration is missing.");

            showMessage(
                "The review system is not configured correctly.",
                "error"
            );

            return;
        }


        /* Create Supabase client */
        const supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_PUBLISHABLE_KEY
            );


        /* Find review form */
        const reviewForm =
            document.getElementById("reviewForm");


        if (!reviewForm) {
            console.error("reviewForm was not found.");
            return;
        }


        /* =================================================
           SUBMIT REVIEW
        ================================================= */

        reviewForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                clearMessage();


                /* Submit button */
                const submitButton =
                    reviewForm.querySelector(
                        'button[type="submit"]'
                    );


                const originalButtonText =
                    submitButton
                        ? submitButton.textContent
                        : "Submit Review";


                /* =========================================
                   BASIC INFORMATION
                ========================================= */

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


                /* =========================================
                   SEVEN RATINGS
                ========================================= */

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


                const ratings = [
                    overallJourney,
                    education,
                    workExperience,
                    technicalSkills,
                    leadership,
                    development,
                    recommendation
                ];


                /* =========================================
                   VALIDATION
                ========================================= */

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


                /* =========================================
                   CHECK ALL 7 RATINGS
                ========================================= */

                if (
                    ratings.some(function (rating) {
                        return rating === null;
                    })
                ) {

                    showMessage(
                        "Please complete all 7 rating questions.",
                        "error"
                    );

                    return;
                }


                /* =========================================
                   REVIEW COMMENTS
                ========================================= */

                const reviewText =
                    getValue("review_text");


                if (!reviewText) {

                    showMessage(
                        "Please write your review or comments.",
                        "error"
                    );

                    return;
                }


                /* =========================================
                   CONSENT
                ========================================= */

                const consent =
                    document.getElementById(
                        "publication_consent"
                    );


                if (
                    !consent ||
                    !consent.checked
                ) {

                    showMessage(
                        "Please confirm the publication consent before submitting.",
                        "error"
                    );

                    return;
                }


                /* =========================================
                   CALCULATE OVERALL RATING
                ========================================= */

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
                    "Calculated overall rating:",
                    overallRating
                );


                /* =========================================
                   DISABLE SUBMIT BUTTON
                ========================================= */

                if (submitButton) {

                    submitButton.disabled = true;

                    submitButton.textContent =
                        "Submitting...";
                }


                /* =========================================
                   SEND TO SUPABASE
                ========================================= */

                try {

                    const { error } =
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


                                /* Seven ratings */

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


                                /* Calculated rating */

                                overall_rating:
                                    overallRating,


                                /* Written review */

                                review_text:
                                    reviewText,


                                /* Waiting for approval */

                                status:
                                    "pending"
                            });


                    /* =====================================
                       SUPABASE ERROR
                    ===================================== */

                    if (error) {

                        console.error(
                            "SUPABASE ERROR:",
                            error
                        );

                        console.error(
                            "Error message:",
                            error.message
                        );

                        console.error(
                            "Error details:",
                            error.details
                        );

                        console.error(
                            "Error hint:",
                            error.hint
                        );


                        let message =
                            "Your review could not be submitted. Please try again.";


                        if (
                            error.message &&
                            error.message
                                .toLowerCase()
                                .includes(
                                    "row-level security"
                                )
                        ) {

                            message =
                                "Your review could not be submitted because the Supabase security policy is blocking the submission.";
                        }


                        showMessage(
                            message,
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


                    /* =====================================
                       SUCCESS
                    ===================================== */

                    console.log(
                        "Review submitted successfully."
                    );


                    /* Clear form */

                    reviewForm.reset();


                    /* Show success message */

                    showMessage(
                        "Review sent successfully! Thank you for your feedback. Your review is now waiting for approval.",
                        "success"
                    );


                    /* Restore button */

                    if (submitButton) {

                        submitButton.disabled =
                            false;

                        submitButton.textContent =
                            originalButtonText;
                    }

                } catch (error) {

                    console.error(
                        "Unexpected review error:",
                        error
                    );


                    showMessage(
                        "Something went wrong while sending your review. Please try again.",
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


        /* =================================================
           LOAD APPROVED REVIEWS
        ================================================= */

        loadApprovedReviews(
            supabaseClient
        );
    }


    /* =====================================================
       GET FORM VALUE
    ===================================================== */

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


    /* =====================================================
       GET RATING
    ===================================================== */

    function getRating(name) {

        const selected =
            document.querySelector(
                '#reviewForm input[name="' +
                name +
                '"]:checked'
            );


        if (!selected) {

            console.warn(
                "Rating not selected:",
                name
            );

            return null;
        }


        const rating =
            Number(selected.value);


        if (
            rating >= 1 &&
            rating <= 5
        ) {

            return rating;
        }


        return null;
    }


    /* =====================================================
       EMAIL VALIDATION
    ===================================================== */

    function isValidEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(email);
    }


    /* =====================================================
       SHOW MESSAGE
    ===================================================== */

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


        messageBox.style.lineHeight =
            "1.5";


        if (type === "success") {

            messageBox.style.background =
                "#e8f7ee";

            messageBox.style.color =
                "#166534";

            messageBox.style.border =
                "1px solid #86efac";

        } else {

            messageBox.style.background =
                "#feecec";

            messageBox.style.color =
                "#991b1b";

            messageBox.style.border =
                "1px solid #fca5a5";
        }


        messageBox.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }


    /* =====================================================
       CLEAR MESSAGE
    ===================================================== */

    function clearMessage() {

        const messageBox =
            document.getElementById(
                "reviewMessage"
            );


        if (messageBox) {

            messageBox.remove();
        }
    }


    /* =====================================================
       LOAD APPROVED REVIEWS
    ===================================================== */

    async function loadApprovedReviews(
        supabaseClient
    ) {

        const carousel =
            document.getElementById(
                "reviewCarousel"
            );


        const countElement =
            document.getElementById(
                "reviewCount"
            );


        const ratingElement =
            document.getElementById(
                "reviewRating"
            );


        if (!carousel) {
            return;
        }


        const {
            data,
            error
        } =
            await supabaseClient
                .from("reviews")
                .select(
                    "reviewer_name, relationship, overall_rating, review_text, approved_at, created_at"
                )
                .eq(
                    "status",
                    "approved"
                )
                .order(
                    "approved_at",
                    {
                        ascending: true
                    }
                );


        /* ================================================
           ERROR LOADING REVIEWS
        ================================================ */

        if (error) {

            console.error(
                "Could not load approved reviews:",
                error
            );


            carousel.innerHTML =
                "<p style='text-align:center;color:#6b7280;'>Approved reviews will appear here.</p>";

            return;
        }


        /* ================================================
           NO APPROVED REVIEWS
        ================================================ */

        if (
            !data ||
            data.length === 0
        ) {

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


        /* ================================================
           CUMULATIVE RATING
        ================================================ */

        const validRatings =
            data
                .map(function (review) {

                    return Number(
                        review.overall_rating
                    );
                })
                .filter(function (rating) {

                    return (
                        rating >= 1 &&
                        rating <= 5
                    );
                });


        const cumulativeRating =
            validRatings.length > 0

                ? validRatings.reduce(
                    function (
                        sum,
                        rating
                    ) {

                        return sum + rating;
                    },
                    0
                ) /
                validRatings.length

                : 0;


        /* ================================================
           UPDATE REVIEW STATISTICS
        ================================================ */

        if (countElement) {

            countElement.textContent =
                data.length;
        }


        if (ratingElement) {

            ratingElement.textContent =
                cumulativeRating.toFixed(2) +
                " / 5.00";
        }


        /* Clear carousel */

        carousel.innerHTML = "";


        /* ================================================
           CREATE APPROVED REVIEW CARDS
        ================================================ */

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

})();
