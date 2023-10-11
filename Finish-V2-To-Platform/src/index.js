import { initializeFlatfile } from "@flatfile/javascript";
import { schemas } from "./schemas";
import { listener } from "../listeners/listener";
import { configToBlueprint } from "@flatfile/v2-shims";

//create a new space in modal
window.openFlatfile = ({publishableKey, environmentId}) => {
    if (!publishableKey && !environmentId) {
        throw new Error(
            "You must provide a publishable key and an environment ID - pass through in index.html"
        );
    }

    const flatfileOptions = {
        publishableKey,
        environmentId,
        name: 'Contact Space',
        workbook: configToBlueprint(schemas.contactSchema),
        listener,
        sidebarConfig: {
            showSidebar: false,
        },
        // Additional props...
    };

    initializeFlatfile(flatfileOptions);
};
