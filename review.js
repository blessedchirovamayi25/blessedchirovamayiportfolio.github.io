// ============================================================
// BLESSED CHIROVAMAYI PORTFOLIO
// SUPABASE REVIEW SYSTEM
// review.js
// ============================================================

(function () {
    "use strict";

    // ---------------------------------------------------------
    // 1. LOAD SUPABASE
    // ---------------------------------------------------------

    const supabaseScript = document.createElement("script");

    supabaseScript.src =
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

    supabaseScript.onload = startReviewSystem;

    supabaseScript.onerror = function () {
        console.error("Could not load Supabase.");
    };

    document.head.appendChild(supabaseScript);


    // ---------------------------------------------------------
    // 2. START SYSTEM
    // ---------------------------------------------------------

    function startReviewSystem() {

        if (
            typeof SUPABASE_URL === "undefined" ||
            typeof SUPABASE_PUBLISHABLE_KEY === "undefined"
        ) {
            console.error(
                "Supabase configuration is missing."
            );
            return;
        }

        const supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_PUBLISHABLE_KEY
            );


        // -----------------------------------------------------
        // 3. FIND REVIEW FORM
        // -----------------------------------------------------

        const reviewForm =
            document.getElementById("reviewForm");

        if (!reviewForm) {
            console.error(
                'Could not find <form id="reviewForm">'
            );
            return;
        }


        // -----------------------------------------------------
        // 4. SUBMIT REVIEW
        // -----------------------------------------------------

        reviewForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                // ---------------------------------------------
                // BASIC INFORMATION
                // ---------------------------------------------

                const reviewerName =
                    getFieldValue(
                        reviewForm,
                        [
                            "reviewer_name",
                            "Reviewer Name",
                            "name"
                        ]
                    );

                const email =
                    getFieldValue(
                        reviewForm,
                        [
                            "email",
                            "Email Address",
                            "email_address"
                        ]
                    );

                const howMet =
                    getFieldValue(
                        reviewForm,
                        [
                            "how_met",
                            "How did you meet Blessed",
                            "How did you meet Mr. Blessed Chirovamayi?"
                        ]
                    );

                const relationship =
                    getFieldValue(
                        reviewForm,
                        [
                            "relationship",
                            "Relationship"
                        ]
                    );

             const howLongKnown =
               getFieldValue(
        reviewForm,
        [
            "how_long_known",
            "How Long Known",
            "How long have you known Blessed?",
            "How long have you known Blessed? *"
        ]
    );


                // ---------------------------------------------
                // VALIDATE BASIC INFORMATION
                // ---------------------------------------------

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


                // ---------------------------------------------
                // GET 7 RATINGS
                // ---------------------------------------------

                const overallJourney =
                    getRating(
                        reviewForm,
                        [
                            "overall_journey",
                            "Overall Journey",
                            "overallJourney"
                        ]
                    );

                const education =
                    getRating(
                        reviewForm,
                        [
                            "education",
                            "Educational Background",
                            "educational_background"
                        ]
                    );

                const workExperience =
                    getRating(
                        reviewForm,
                        [
                            "work_experience",
                            "Work Experience",
                            "workExperience"
                        ]
                    );

                const technicalSkills =
                    getRating(
                        reviewForm,
                        [
                            "technical_skills",
                            "Technical Skills",
                            "technicalSkills"
                        ]
                    );

                const leadership =
                    getRating(
                        reviewForm,
                        [
                            "leadership",
                            "Leadership",
                            "leadership_teamwork"
                        ]
                    );

                const development =
                    getRating(
                        reviewForm,
                        [
                            "development",
                            "Continuous Development",
                            "continuous_development"
                        ]
                    );

                const recommendation =
                    getRating(
                        reviewForm,
                        [
                            "recommendation",
                            "Recommendation",
                            "likelihood_recommend"
                        ]
                    );


                // ---------------------------------------------
                // CHECK ALL RATINGS
                // ---------------------------------------------

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
                        rating => rating === null
                    )
                ) {
                    showMessage(
                        "Please complete all 7 rating questions.",
                        "error"
                    );
                    return;
                }


                // ---------------------------------------------
                // CALCULATE OVERALL RATING
                // ---------------------------------------------

                const total =
                    ratings.reduce(
                        (sum, rating) => sum + rating,
                        0
                    );

                const overallRating =
                    Math.round(
                        (total / ratings.length) * 100
                    ) / 100;


                // ---------------------------------------------
                // WRITTEN REVIEW
                // ---------------------------------------------

                const reviewText =
                    getFieldValue(
                        reviewForm,
                        [
                            "review_text",
                            "Review / Comments",
                            "review",
                            "comments"
                        ]
                    );


                // ---------------------------------------------
                // SUBMIT BUTTON
                // ---------------------------------------------

                const submitButton =
                    reviewForm.querySelector(
                        'button[type="submit"], input[type="submit"]'
                    );

                let originalButtonText = "Submit Review";

                if (submitButton) {

                    originalButtonText =
                        submitButton.tagName === "INPUT"
                            ? submitButton.value
                            : submitButton.innerText;

                    submitButton.disabled = true;

                    if (submitButton.tagName === "INPUT") {
                        submitButton.value =
                            "Submitting...";
                    } else {
                        submitButton.innerText =
                            "Submitting...";
                    }
                }


                // ---------------------------------------------
                // INSERT INTO SUPABASE
                // ---------------------------------------------

                const { error } =
                    await supabaseClient
                        .from("reviews")
                        .insert([
                            {
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
                                    reviewText || null,

                                status:
                                    "pending"
                            }
                        ]);


                // ---------------------------------------------
                // HANDLE SUPABASE ERROR
                // ---------------------------------------------

                if (error) {

                    console.error(
                        "Supabase error:",
                        error
                    );

                    showMessage(
                        "Your review could not be submitted. Please try again.",
                        "error"
                    );

                    restoreButton(
                        submitButton,
                        originalButtonText
                    );

                    return;
                }


                // ---------------------------------------------
                // SUCCESS
                // ---------------------------------------------

                console.log(
                    "Review submitted successfully."
                );

                reviewForm.reset();

                showMessage(
                    "Thank you! Your review has been submitted successfully and is now waiting for approval.",
                    "success"
                );

                restoreButton(
                    submitButton,
                    originalButtonText
                );
            }
        );


        // =====================================================
        // HELPER: GET FIELD VALUE
        // =====================================================

        function getFieldValue(form, names) {

            for (const name of names) {

                const field =
                    form.elements[name];

                if (field) {

                    if (
                        field instanceof RadioNodeList
                    ) {

                        const checked =
                            form.querySelector(
                                `input[name="${CSS.escape(name)}"]:checked`
                            );

                        if (checked) {
                            return checked.value.trim();
                        }

                    } else {

                        return String(
                            field.value || ""
                        ).trim();
                    }
                }


                // Try searching directly by name
                const element =
                    form.querySelector(
                        `[name="${CSS.escape(name)}"]`
                    );

                if (element) {

                    return String(
                        element.value || ""
                    ).trim();
                }
            }

            return "";
        }


        // =====================================================
        // HELPER: GET RATING
        // =====================================================

        function getRating(form, names) {

            for (const name of names) {

                // Radio buttons
                const checked =
                    form.querySelector(
                        `input[name="${CSS.escape(name)}"]:checked`
                    );

                if (checked) {

                    const value =
                        Number(checked.value);

                    if (
                        value >= 1 &&
                        value <= 5
                    ) {
                        return value;
                    }
                }


                // Select
                const select =
                    form.querySelector(
                        `select[name="${CSS.escape(name)}"]`
                    );

                if (select && select.value) {

                    const value =
                        Number(select.value);

                    if (
                        value >= 1 &&
                        value <= 5
                    ) {
                        return value;
                    }
                }
            }

            return null;
        }


        // =====================================================
        // HELPER: DISPLAY MESSAGE
        // =====================================================

        function showMessage(message, type) {

            let messageBox =
                document.getElementById(
                    "reviewMessage"
                );

            if (!messageBox) {

                messageBox =
                    document.createElement("div");

                messageBox.id =
                    "reviewMessage";

                reviewForm.appendChild(
                    messageBox
                );
            }


            messageBox.textContent =
                message;

            messageBox.style.marginTop =
                "15px";

            messageBox.style.padding =
                "14px 18px";

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

            } else {

                messageBox.style.background =
                    "#feecec";

                messageBox.style.color =
                    "#991b1b";

                messageBox.style.border =
                    "1px solid #fca5a5";
            }
        }


        // =====================================================
        // HELPER: RESTORE BUTTON
        // =====================================================

        function restoreButton(
            button,
            originalText
        ) {

            if (!button) {
                return;
            }

            button.disabled = false;

            if (
                button.tagName === "INPUT"
            ) {
                button.value =
                    originalText;
            } else {
                button.innerText =
                    originalText;
            }
        }
    }

})();
