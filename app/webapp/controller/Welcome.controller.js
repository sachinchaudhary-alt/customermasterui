// Welcome.controller.js
// Welcome screen ka controller
// Sirf ek kaam karta hai — Go button click hone par Main screen pe jaao

sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function(Controller) {
    "use strict";

    return Controller.extend("customerapp.controller.Welcome", {

        // Go button click hone par yeh function chalta hai
        // Router se Main screen pe navigate karo
        onGoPress: function() {
            this.getOwnerComponent().getRouter().navTo("main");
        }

    });
});