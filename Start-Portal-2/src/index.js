import FlatfileImporter from "@flatfile/adapter";
import $ from "jquery";
import { format, isDate, isFuture, parseISO } from "date-fns";
import countries from "./countries";
import { schemas } from "./schemas";

const { contactSchema } = schemas;

const importer = new FlatfileImporter(
    "5fdae7f9-84ca-43bd-b178-2c401871be38",
    contactSchema
);

importer.setCustomer({
    userId: "19234",
    name: "Foo Bar"
});

// Allows the optional +1 international code
function formatPhoneNumber(phoneNumberString) {
    var cleaned = ("" + phoneNumberString).replace(/\D/g, "");
    var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        var intlCode = match[1] ? "+1 " : "";
        return [intlCode, "(", match[2], ") ", match[3], "-", match[4]].join("");
    }
    return "Invalid phone number";
}

importer.registerStepHook("review", ({ headers_matched }) => {
    // review stephook happens right before the data goes to the review page
    if (
        headers_matched.find((v) => v.matched_key === "firstName") &&
        headers_matched.find((v) => v.matched_key === "lastName")
    ) {
        importer.addVirtualField(
            {
                label: "Full Name",
                key: "fullName",
                description:
                    'Only create this field when columns "First Name" and "Last Name" are matched'
            },
            {
                order: 2
                //hideFields: ["firstName", "lastName"]
            }
        );
    }
});

importer.registerFieldHook("email", async (values) => {
    try {
        let serverEmails;
        await fetch(
            "https://v1.nocodeapi.com/brentkwebdev/google_sheets/KcPvLNxbwsYSIbZK?tabId=Sheet1"
        )
            .then((response) => response.json())
            .then((json) => {
                serverEmails = json.data.map((x) => {
                    return x.email;
                });
            });
        let newValues = [];
        values.map((y) => {
            if (serverEmails.includes(y[0])) {
                newValues.push([
                    {
                        info: [
                            {
                                message: "Email already on the server",
                                level: "error" // should be 'info', 'warning' or 'error'
                            }
                        ]
                    },
                    y[1]
                ]);
            }
            return y;
        });
        return newValues;
    } catch (err) {
        console.log("FieldHook failure: ", err);
    }
});

importer.registerRecordHook(async (record, index, mode) => {
    let out = {};

    // if virtual field has been added, insert values into it
    if (record.hasOwnProperty("fullName") && !record.fullName) {
        out.fullName = {
            value: record.firstName + " " + record.lastName
        };
    }

    //errors for emails that already exist
    if (record.email && mode === "change") {
        try {
            await fetch(
                `https://v1.nocodeapi.com/brentkwebdev/google_sheets/KcPvLNxbwsYSIbZK/search?tabId=Sheet1&searchKey=email&searchValue=${record.email}`
            )
                .then((response) => response.json())
                .then((json) => {
                    if (json.length > 0) {
                        out.email = {
                            info: [
                                {
                                    message: "Email address already exists.",
                                    level: "error"
                                }
                            ]
                        };
                    }
                });
        } catch (err) {
            console.log("RecordHook NocodeAPI failure: ", err);
        }
    }

    // name splitting example: splits full names in the first name field
    if (record.firstName && !record.lastName) {
        if (record.firstName.includes(" ")) {
            const components = record.firstName.split(" ");
            out.firstName = { value: components.shift() };
            out.lastName = { value: components.join(" ") };
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

    //date normalization + validation
    if (record.date) {
        //reformat the date to ISO format
        let thisDate = format(new Date(record.date), "yyyy-MM-dd");
        //create var that holds the date value of the reformatted date as
        //thisDate is only a string
        let realDate = parseISO(thisDate);
        if (isDate(realDate)) {
            out.date = {
                value: thisDate,
                info: isFuture(realDate)
                    ? [
                        {
                            message: "Date cannot be in the future.",
                            level: "error"
                        }
                    ]
                    : []
            };
        } else {
            out.date = {
                info: [
                    {
                        message: "Please check that the date is formatted YYYY-MM-DD.",
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
        } else {
            out.country = {
                value: record.country
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
});

$("#launch").click(function () {
    importer
        .requestDataFromUser()

        .then(function (results) {
            importer.displaySuccess("Thanks for your data.");
            $("#raw_output").text(JSON.stringify(results.data, " ", 2));
        })

        .catch(function (error) {
            console.info(error || "window close");
        });
});
