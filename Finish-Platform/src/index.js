//create a new space in modal
window.openFlatfile = ({publishableKey, environmentId}) => {
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
