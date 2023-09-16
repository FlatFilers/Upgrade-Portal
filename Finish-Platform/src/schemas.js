const workbook = {
    name: "Contacts",
    labels: ["pinned"],
    sheets: [
        {
            name: "Contacts",
            slug: "contacts",
            fields: [
                {
                    key: "firstName",
                    type: "string",
                    description: "First or full name",
                    label: "First Name",
                    constraints: [{ type: "required" }]
                },
                {
                    key: "lastName",
                    type: "string",
                    label: "Last Name",
                },
                {
                    key: "email",
                    type: "string",
                    label: "Email address",
                    description: "Please please enter your email",
                    constraints: [{ type: "unique" }]
                },
                {
                    key: "phone",
                    type: "string",
                    label: "Phone Number",
                },
                {
                    key: "date",
                    type: "string",
                    label: "Date",
                },
                {
                    key: "country",
                    type: "string",
                    label: "Country",
                },
                {
                    key: "zipCode",
                    type: "string",
                    label: "Zip Code",
                },
                {
                    key: "subscriber",
                    type: "boolean",
                    label: "Subscriber?",
                    config: {
                        allow_indeterminate: false
                    }
                },
                {
                    key: "type",
                    type: "enum",
                    label: "Deal Status",
                    constraints: [{ type: "required" }],
                    config: {
                        options: [
                            { label: "New", value: "new" },
                            { label: "Interested", value: "interested" },
                            { label: "Meeting", value: "meeting" },
                            { label: "Opportunity", value: "opportunity" },
                            { label: "Not a fit", value: "unqualified" }
                        ]
                    }
                },
            ],
        },
    ],
    actions: [
        {
            operation: "submitActionFg",
            mode: "foreground",
            label: "Submit foreground",
            description: "Submit data to webhook.site",
            primary: true,
        },
    ],
};
