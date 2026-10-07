// ============================================================
// BLESSED CHIROVAMAYI PORTFOLIO
// SUPABASE REVIEW SYSTEM
// review.js
// ============================================================

(function () {
    "use strict";

    // --------------------------------------------------------
    // 1. LOAD SUPABASE LIBRARY
    // --------------------------------------------------------

    const script = document.createElement("script");

    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

    script.onload = function () {
        initializeReviewSystem();
    };

    script.onerror = function () {
        console.error("Unable to load Supabase.");
    };

    document.head.appendChild(script);


    // --------------------------------------------------------
    // 2. INITIALIZE SUPABASE
    // --------------------------------------------------------

    function initializeReviewSystem() {

        if (
            typeof SUPABASE_URL === "undefined" ||
            typeof SUPABASE_PUBLISHABLE_KEY === "undefined"
        ) {
            console.error(
                "Supabase configuration not found. " +
                "Make sure supabase-config.js is loaded before review.js."
            );
            return;
        }

        const supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_PUBLISHABLE_KEY
            );


        // ----------------------------------------------------
        // 3. FIND REVIEW FORM
        // ----------------------------------------------------

        const reviewForm = document.getElementById("reviewForm");

        if (!reviewForm) {
            console.warn(
                "Review form not found. " +
                'Add id="reviewForm" to your review form.'
            );
            return;
        }


        // ----------------------------------------------------
        // 4. SUBMIT REVIEW
        // ----------------------------------------------------

        reviewForm.addEventListener("submit", async function (event) {

            event.preventDefault();


            // ------------------------------------------------
            // GET FORM VALUES
            // ------------------------------------------------

            const reviewerName =
                getValue(reviewForm, "reviewer_name");

            const email =
                getValue(reviewForm, "email");

            const howMet =
                getValue(reviewForm, "how_met");

            const relationship =
                getValue(reviewForm, "relationship");

            const howLongKnown =
                getValue(reviewForm, "how_long_known");


            // ------------------------------------------------
            // GET THE 7 RATINGS
            // ------------------------------------------------

            const overallJourney =
                getRating(reviewForm, "overall_journey");

            const education =
                getRating(reviewForm, "education");

            const workExperience =
                getRating(reviewForm, "work_experience");

            const technicalSkills =
                getRating(reviewForm, "technical_skills");

            const leadership =
                getRating(reviewForm, "leadership");

            const development =
                getRating(reviewForm, "development");

            const recommendation =
                getRating(reviewForm, "recommendation");


            // ------------------------------------------------
            // WRITTEN REVIEW
            // ------------------------------------------------

            const reviewText =
                getValue(reviewForm, "review_text");


            // ------------------------------------------------
            // VALIDATION
            // ------------------------------------------------

            if (!reviewerName) {
                showMessage(
                    "Please enter your name.",
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
                    "Please select your relationship.",
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


            if (ratings.some(rating => rating === null)) {
                showMessage(
                    "Please complete all 7 rating questions.",
                    "error"
                );
                return;
            }


            // ------------------------------------------------
            // CALCULATE OVERALL RATING
            // ------------------------------------------------

            const ratingTotal =
                ratings.reduce(
                    (total, rating) => total + rating,
                    0
                );

            const overallRating =
                Math.round(
                    (ratingTotal / ratings.length) * 100
                ) / 100;


            // ------------------------------------------------
            // DISABLE BUTTON
            // ------------------------------------------------

            const submitButton =
                reviewForm.querySelector(
                    'button[type="submit"], input[type="submit"]'
                );

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.dataset.originalText =
                    submitButton.innerText || submitButton.value;

                if (submitButton.tagName === "INPUT") {
                    submitButton.value = "Submitting...";
                } else {
                    submitButton.innerText = "Submitting...";
                }
            }


            // ------------------------------------------------
            // SEND TO SUPABASE
            // ------------------------------------------------

            const { data, error } =
                await supabaseClient
                    .from("reviews")
                    .insert([
                        {
                            reviewer_name: reviewerName,
                            email: email || null,

                            how_met: howMet,
                            relationship: relationship,
                            how_long_known: howLongKnown,

                            overall_journey: overallJourney,
                            education: education,
                            work_experience: workExperience,
                            technical_skills: technicalSkills,
                            leadership: leadership,
                            development: development,
                            recommendation: recommendation,

                            overall_rating: overallRating,

                            review_text: reviewText || null,

                            status: "pending"
                        }
                    ])
                    .select();


            // ------------------------------------------------
            // HANDLE ERROR
            // ------------------------------------------------

            if (error) {

                console.error(
                    "Supabase review submission error:",
                    error
                );

                showMessage(
                    "Sorry, your review could not be submitted. Please try again.",
                    "error"
                );

                restoreSubmitButton(submitButton);

                return;
            }


            // ------------------------------------------------
            // SUCCESS
            // ------------------------------------------------

            console.log(
                "Review successfully submitted:",
                data
            );


            reviewForm.reset();


            showMessage(
                "Thank you! Your review has been submitted successfully and is waiting for approval.",
                "success"
            );


            restoreSubmitButton(submitButton);

        });


        // ----------------------------------------------------
        // 5. HELPER FUNCTIONS
        // ----------------------------------------------------

        function getValue(form, fieldName) {

            const field = form.elements[fieldName];

            if (!field) {
                return "";
            }

            return field.value.trim();
        }


        // ----------------------------------------------------
        // GET STAR RATING
        // ----------------------------------------------------

        function getRating(form, fieldName) {

            const field = form.elements[fieldName];

            if (!field) {
                return null;
            }


            // Radio buttons
            if (field instanceof RadioNodeList) {

                const selected =
                    form.querySelector(
                        `input[name="${fieldName}"]:checked`
                    );

                if (!selected) {
                    return null;
                }

                const rating =
                    Number(selected.value);

                return (
                    rating >= 1 &&
                    rating <= 5
                )
                    ? rating
                    : null;
            }


            // Select/dropdown
            const rating =
                Number(field.value);

            if (
                !field.value ||
                Number.isNaN(rating) ||
                rating < 1 ||
                rating > 5
            ) {
                return null;
            }

            return rating;
        }


        // ----------------------------------------------------
        // DISPLAY MESSAGE
        // ----------------------------------------------------

        function showMessage(message, type) {

            let messageBox =
                document.getElementById("reviewMessage");

            if (!messageBox) {

                messageBox =
                    document.createElement("div");

                messageBox.id =
                    "reviewMessage";

                messageBox.style.marginTop =
                    "15px";

                messageBox.style.padding =
                    "14px";

                messageBox.style.borderRadius =
                    "8px";

                reviewForm.appendChild(messageBox);
            }


            messageBox.textContent =
                message;

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


        // ----------------------------------------------------
        // RESTORE SUBMIT BUTTON
        // ----------------------------------------------------

        function restoreSubmitButton(button) {

            if (!button) {
                return;
            }

            button.disabled = false;

            const originalText =
                button.dataset.originalText ||
                "Submit Review";

            if (button.tagName === "INPUT") {
                button.value = originalText;
            } else {
                button.innerText = originalText;
            }
        }

    }

})();
