import { FlatfileListener } from "@flatfile/listener";
import api, { FlatfileClient } from "@flatfile/api";
import { recordHook } from "@flatfile/plugin-record-hook";

const flatfile = new FlatfileClient({
    token: process.env.FLATFILE_API_KEY,
    environment: process.env.BASE_URL + "/v1",
});

export default (listener) => {
    listener.on("**", (event) => {
        console.log("Event =>", event);
    });
    // This record hook was all a part of the /Start-Portal-2/src/index.js
    listener.use(
        recordHook("contacts", (record) => {
            const email = record.get("email");
            const phone = record.get("phone");
            const date = record.get("date");
            const country = record.get("country");
            const zipCode = record.get("zipCode");
            if (email.includes('flatfile.io')) {
                record.addError("email", "Flatfile emails should use flatfile.com ending only")
            }
            if (!email && !phone) {
                record.addWarning(["email", "phone"], "Please include one of either Phone or Email.")
            }
            if (phone) {
                let validPhone = formatPhoneNumber(phone)
                if (validPhone !== "Invalid phone number") {
                    record.set("phone", validPhone)
                } else {
                    record.addError("phone", "This does not appear to be a valid phone number")
                }
            }
            if (date) {
                let thisDate = format(new Date(record.date), "yyyy-MM-dd");
                let realDate = parseISO(thisDate);
                if (isDate(realDate)) {
                    record.set("date", thisDate)
                    isFuture(realDate) && record.addError("date", "Date cannot be in the future.");
                } else {
                    record.addError("date", "Please check that the date is formatted YYYY-MM-DD.")
                }
            }
            if (country) {
                if (!countries.find((c) => c.code === country)) {
                    const suggestion = countries.find(
                        (c) => c.name.toLowerCase().indexOf(country.toLowerCase()) !== -1
                    );
                    record.set("country", suggestion ? suggestion.code : country);
                    !suggestion && record.addError("country", "Country code is not valid")
                }
            }
            if (zipCode && zipCode.length < 5 && country === "US") {
                record.set("zipCode", zipCode.padStart(5, "0"))
                record.addInfo("zipCode", "Zipcode was padded with zeroes")
            }
            return record;
        })
    );

    listener.filter({ job: "workbook:submitActionFg" }, (configure) => {
        configure.on("job:ready", async ({ context: { jobId } }) => {
            try {
                await flatfile.jobs.ack(jobId, {
                    info: "Getting started.",
                    progress: 10,
                });

                // Make changes after cells in a Sheet have been updated
                console.log("Make changes here when an action is clicked");

                await flatfile.jobs.complete(jobId, {
                    outcome: {
                        message: "This job is now complete.",
                    },
                });
            } catch (error) {
                console.error("Error:", error.stack);

                await flatfile.jobs.fail(jobId, {
                    outcome: {
                        message: "This job encountered an error.",
                    },
                });
            }
        });
    });
};
