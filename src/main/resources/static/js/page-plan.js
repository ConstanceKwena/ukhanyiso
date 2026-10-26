    const saveMessage = document.getElementById("save-message");
    const planForm = document.getElementById("plan");

    function readNumber(id, required) {
        const input = document.getElementById(id);
        const raw = input.value.trim();

        if (raw === "") {
            if (required) {
                throw new Error((window.Site && window.Site.t) ? window.Site.t("Enter your monthly funding and the number of funded months.") : "Enter your monthly funding and the number of funded months.");
            }
            return 0;
        }

        const value = input.valueAsNumber;

        if (
            Number.isNaN(value) ||
            !Number.isInteger(value) ||
            value < Number(input.min) ||
            (input.max && value > Number(input.max))
        ) {
            throw new Error("Please enter valid whole numbers within the limits shown.");
        }

        return value;
    }

    function formatRand(value) {
        return new Intl.NumberFormat("en-ZA", {
            style: "currency",
            currency: "ZAR",
            maximumFractionDigits: 0
        }).format(Math.round(value));
    }

    function calculatePlan(event) {
        if (event) event.preventDefault();

        const box = document.getElementById("result");
        box.textContent = "";
        saveMessage.textContent = "";
        saveMessage.className = "form-note";

        if (event && event.type !== "submit"
                && (!document.getElementById("funding").value
                    || !document.getElementById("months").value)) {
            saveMessage.textContent = "Enter monthly funding and funded months to calculate your plan.";
            return;
        }
        let values;

        try {
            values = {
                funding: readNumber("funding", true),
                months: readNumber("months", true),
                required: readNumber("required", false),
                current: readNumber("current", false),
                worth: readNumber("worth", false),
                startup: readNumber("startup", false),
                weeks: readNumber("weeks", false),
                home: readNumber("c-home", false),
                food: readNumber("c-food", false),
                travel: readNumber("c-travel", false),
                data: readNumber("c-data", false),
                other: readNumber("c-other", false)
            };
        } catch (error) {
            saveMessage.textContent = error.message;
            saveMessage.className = "error";
            return;
        }

        if (values.months < 1 || values.months > 12) {
            saveMessage.textContent = "Enter a funded period between 1 and 12 months.";
            saveMessage.className = "error";
            return;
        }

        const costs =
            values.home +
            values.food +
            values.travel +
            values.data +
            values.other;

        const monthlyBalance = values.funding - costs;
        const totalFunding = values.funding * values.months;
        const totalCosts = costs * values.months;

        const lines = [
            `Your monthly funding is ${formatRand(values.funding)}.`,
            `Your total estimated funding over ${values.months} months is ${formatRand(totalFunding)}.`,
            `Your monthly living costs are ${formatRand(costs)}.`,
            `Your estimated living costs over ${values.months} months are ${formatRand(totalCosts)}.`
        ];

        if (monthlyBalance >= 0) {
            lines.push(
                `You have ${formatRand(monthlyBalance)} left each month, or ${formatRand(monthlyBalance * values.months)} over ${values.months} months.`
            );
        } else {
            lines.push(
                `You are short by ${formatRand(-monthlyBalance)} each month, or ${formatRand(-monthlyBalance * values.months)} over ${values.months} months. Consider reviewing your costs and speaking to your financial aid office about available support.`
            );
        }

        if (values.required > 0 || values.current > 0) {
            if (values.required === 0 && values.current > 0) {
                lines.push(
                    "You entered your current average but no renewal minimum. Confirm the minimum with your funder."
                );
            } else if (values.required > 0 && values.current === 0) {
                lines.push(
                    "You entered the renewal minimum but not your current average. Add your average to check the difference."
                );
            } else {
                const gap = values.current - values.required;

                if (gap >= 0) {
                    lines.push(
                        `Your current average is ${gap} percentage points above the renewal minimum.`
                    );
                } else {
                    lines.push(
                        `Your current average is ${-gap} percentage points below the renewal minimum. Consider asking your tutor or student support office for help.`
                    );
                }
            }
        }

        if (values.worth > 0) {
            lines.push(
                `Your bursary is worth ${formatRand(values.worth)} for the year. Confirm the renewal requirements with your funding provider.`
            );
        }

        if (values.startup > 0 || values.weeks > 0) {
            const weeksOfLivingCosts = values.weeks > 0 ? (costs * (values.weeks / 4.33)) : 0;
            const amountNeeded = Math.ceil(values.startup + weeksOfLivingCosts);

            if (values.weeks > 0 && values.startup > 0) {
                lines.push(
                    `Before your first payout, you may need approximately ${formatRand(amountNeeded)}: ${formatRand(values.startup)} for start-up costs and ${formatRand(weeksOfLivingCosts)} for estimated living costs over ${values.weeks} weeks.`
                );
            } else if (values.weeks > 0) {
                lines.push(
                    `Before your first payout, you may need approximately ${formatRand(amountNeeded)} for estimated living costs over ${values.weeks} weeks.`
                );
            } else {
                lines.push(
                    `Before your first payout, you may need approximately ${formatRand(amountNeeded)} for start-up costs.`
                );
            }
        }

        const card = document.createElement("article");
        card.className = "card";

        const heading = document.createElement("h2");
        heading.textContent = "Your Financial Plan";
        card.appendChild(heading);

        lines.forEach(line => {
            const paragraph = document.createElement("p");
            paragraph.textContent = line;
            card.appendChild(paragraph);
        });

        box.appendChild(card);
        saveMessage.textContent = "Plan recalculated from the figures entered. These estimates are a planning aid, not financial advice.";

        if (window.Site && typeof Site.say === "function") {
            Site.say("Financial plan updated.");
        }
    }

    planForm.addEventListener("submit", calculatePlan);
    planForm.addEventListener("input", calculatePlan);
    planForm.addEventListener("change", calculatePlan);
