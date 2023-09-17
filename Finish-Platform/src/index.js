import { initializeFlatfile } from "@flatfile/javascript";
import { workbook } from "./schemas";
import { listener } from "../listeners/listener";

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
        workbook,
        listener,
        sidebarConfig: {
            showSidebar: false,
        },
        // Additional props...
    };

    initializeFlatfile(flatfileOptions);
};
