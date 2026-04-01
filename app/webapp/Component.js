sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/m/App"
], function(UIComponent, App) {
    "use strict";
    return UIComponent.extend("customerapp", {
        metadata: { manifest: "json" },
        init: function() {
            UIComponent.prototype.init.apply(this, arguments);
            this.getRouter().initialize();
        },
        createContent: function() {
            return new App({ id: "rootApp" });
        }
    });
});