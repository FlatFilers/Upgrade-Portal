export const schemas = {
    contactSchema: {
        fields: [
            {
                label: "First Name",
                key: "firstName",
                description: "First or full name",
                validators: [{ validate: "required" }]
            },
            {
                label: "Last Name",
                key: "lastName",
            },
            {
                label: "Email Address",
                key: "email",
                description: "Please please enter your email",
                sizeHint: 1.5,
                validators: [
                    { validate: "unique" },
                    {
                        validate: "regex_matches",
                        regex:
                            "(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])",
                        error: "Must be a valid email address."
                    }
                ]
            },

            {
                label: "Phone Number",
                key: "phone"
            },
            {
                label: "Date",
                key: "date"
            },
            {
                label: "Country",
                key: "country"
            },
            {
                label: "Zip Code",
                key: "zipCode"
            },
            {
                label: "Subscriber?",
                key: "subscriber",
                sizeHint: 0.5,
                type: "checkbox",
                validators: [
                    {
                        validate: "regex_matches",
                        regex: "^$|^(1|0|yes|no|true|false|on|off)$",
                        regexFlags: { ignoreCase: true }
                    }
                ]
            },
            {
                label: "Deal Status",
                key: "type",
                type: "select",
                options: [
                    { label: "New", value: "new" },
                    { label: "Interested", value: "interested" },
                    { label: "Meeting", value: "meeting" },
                    { label: "Opportunity", value: "opportunity" },
                    { label: "Not a fit", value: "unqualified" }
                ],
                validators: [{ validate: "required" }]
            }
        ],
        type: "Contacts",
        managed: true
    }
};
