import { FlatfileListener } from "@flatfile/listener";
import api, { FlatfileClient } from "@flatfile/api";
import { recordHook } from "@flatfile/plugin-record-hook";
import { convertHook } from "@flatfile/v2-shims";

import { formatPhoneNumber } from "../helpers/formatPhoneNumber";
import { countries } from "../helpers/countries"

// moved from Start-Portal-2/index.js record hook
const v2RecordHookFunc = (record) => {
    let out = {};

    //errors for emails that already exist
    if (record.email) {
        if (record.email.includes('flatfile.io')) {
            out.email = {
                info: [
                    {
                        message: "Flatfile emails should use flatfile.com ending only",
                        level: "error"
                    }
                ]
            }
        }
    }

    //warning if no email and no phone
    if (!record.phone && !record.email) {
        out.phone = out.email = {
            info: [
                {
                    message: "Please include one of either Phone or Email.",
                    level: "warning"
                }
            ]
        };
    }

    //Phone normalization + validation
    if (record.phone) {
        let validPhone = formatPhoneNumber(record.phone);
        if (validPhone !== "Invalid phone number") {
            out.phone = {
                value: validPhone,
                info: []
            };
        } else {
            out.phone = {
                info: [
                    {
                        message: "This does not appear to be a valid phone number",
                        level: "error"
                    }
                ]
            };
        }
    }

    //country name lookup, replace with country code
    if (record.country) {
        if (!countries.find((c) => c.code === record.country)) {
            const suggestion = countries.find(
                (c) => c.name.toLowerCase().indexOf(record.country.toLowerCase()) !== -1
            );
            out.country = {
                value: suggestion ? suggestion.code : record.country,
                info: !suggestion
                    ? [
                        {
                            message: "Country code is not valid",
                            level: "error"
                        }
                    ]
                    : []
            };
        }
    }
    if (
        record.zipCode &&
        record.zipCode.length < 5 &&
        (record.country === "US" || out.country.value === "US")
    ) {
        out.zipCode = {
            value: record.zipCode.padStart(5, "0"),
            info: [{ message: "Zipcode was padded with zeroes", level: "info" }]
        };
    }

    return out;
}

const flatfile = new FlatfileClient({
    token: process.env.FLATFILE_API_KEY,
    environment: process.env.BASE_URL + "/v1",
});

export default (listener) => {
    listener.on("**", (event) => {
        console.log("Event =>", event);
    });
    // This record hook was all a part of the /Start-Portal-2/src/index.js
    // this "Contacts" sheet slug needs to match your "type" property from your v2 schema
    listener.use(
        recordHook("Contacts", (record) => {
            return convertHook(v2RecordHookFunc)(record)
        })
    );

    listener.filter({ job: "workbook:submitAction" }, (configure) => {
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
