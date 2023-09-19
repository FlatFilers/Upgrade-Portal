const { contactSchema } = schemas;

const importer = new FlatfileImporter(
    "YOUR_LICENSE_KEY",
    contactSchema
);

importer.setCustomer({
    userId: "19234",
    name: "Foo Bar"
});

// Allows the optional +1 international code - moved to /Finish-Platform/helpers/formatPhoneNumber.js in the finished solution
function formatPhoneNumber(phoneNumberString) {
    let cleaned = ("" + phoneNumberString).replace(/\D/g, "");
    let match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        let intlCode = match[1] ? "+1 " : "";
        return [intlCode, "(", match[2], ") ", match[3], "-", match[4]].join("");
    }
    return "Invalid phone number";
}

// Record hooks move into the listener in Platform. Check out /Finish-Platform/listners/listner.js to see where this moved
importer.registerRecordHook(async (record, index, mode) => {
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
