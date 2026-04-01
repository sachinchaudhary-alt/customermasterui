// ═══════════════════════════════════════════════════════════
// FILE: app/webapp/controller/Main.controller.js
// PURPOSE: Customer Master ka main controller
//
// Yeh file saare user interactions handle karti hai:
// - Create: Naya customer add karna
// - View: Customer dhundna ya sab dekhna
// - Edit: Customer ki city, address, phone update karna
// - Delete: Customer hatana
// - Search: Case insensitive search
//
// SAP UI5 MVC pattern follow karta hai:
// Model (OData) → View (XML) → Controller (JS)
// ═══════════════════════════════════════════════════════════

sap.ui.define([
    "sap/ui/core/mvc/Controller",  // Base controller class — har controller isse extend karta hai
    "sap/m/Dialog",                // Popup window banane ke liye
    "sap/m/Button",                // Dialog ke andar buttons banane ke liye
    "sap/m/Input",                 // Form mein text input fields ke liye
    "sap/m/Label",                 // Input fields ke upar labels dikhane ke liye
    "sap/m/VBox",                  // Vertical layout — items upar se neeche arrange karne ke liye
    "sap/m/MessageToast",          // Screen pe chhota sa success/error message dikhane ke liye
    "sap/m/MessageBox",            // Confirm/Warning popup dikhane ke liye
    "sap/ui/model/Filter",         // OData data filter karne ke liye
    "sap/ui/model/FilterOperator"  // Filter ka type define karne ke liye (Contains, EQ, etc.)
], function(Controller, Dialog, Button, Input, Label, VBox, MessageToast, MessageBox, Filter, FilterOperator) {
    "use strict"; // JavaScript strict mode — common mistakes pakadne ke liye

    // Controller extend karo — "customerapp.controller.Main" naam se register karo
    // Yeh naam Main.view.xml mein controllerName se match karta hai
    return Controller.extend("customerapp.controller.Main", {

        // ═══════════════════════════════════════════════════════════
        // ON INIT — App start hone par yeh sabse pehle chalta hai
        // Router event listen karo — jab "main" route match ho
        // ═══════════════════════════════════════════════════════════
        onInit: function() {
            // Router se "main" route ka event attach karo
            // Jab bhi user Main screen pe aaye — _onRouteMatched chale
            this.getOwnerComponent().getRouter()
                .getRoute("main")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        // ─── ROUTE MATCHED ───
        // Jab "main" route match hota hai yeh function chalta hai
        // Table ka data refresh karta hai — latest data dikhane ke liye
        _onRouteMatched: function() {
            var oTable = this.byId("customerTable");
            if (oTable && oTable.getBinding("rows")) {
                oTable.getBinding("rows").refresh(); // Latest data server se lo
            }
        },

        // ═══════════════════════════════════════════════════════════
        // CAPITALIZE HELPER FUNCTION
        // Har word ka pehla letter capital karta hai
        // Example: "rahul sharma" → "Rahul Sharma"
        // Yeh function Create aur Edit dono mein use hota hai
        // ═══════════════════════════════════════════════════════════
        _capitalize: function(str) {
            if (!str) return str;
            // \b = word boundary, \w = first character of word
            // Har word ka pehla letter uppercase karo
            return str.replace(/\b\w/g, function(l) {
                return l.toUpperCase();
            });
        },

        // ═══════════════════════════════════════════════════════════
        // ON SEARCH — Search bar mein type karne par chalta hai
        // Case insensitive search — "rahul" ya "Rahul" dono kaam karenge
        // City, Name, Phone teeno mein search hogi
        // ═══════════════════════════════════════════════════════════
        onSearch: function(oEvent) {
            // "query" = Search button click se, "newValue" = live typing se
            var sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue");
            var oTable = this.byId("customerTable");
            var oBinding = oTable.getBinding("rows"); // Table ka OData binding

            if (sQuery && sQuery.trim()) {
                // Teen filters banao — naam, city, phone ke liye
                var aFilters = [
                    new Filter({
                        path: "customerName",       // Kaunse field mein search karo
                        operator: FilterOperator.Contains, // Contains = partial match
                        value1: sQuery,
                        caseSensitive: false        // Case insensitive — yahi main setting hai!
                    }),
                    new Filter({
                        path: "city",
                        operator: FilterOperator.Contains,
                        value1: sQuery,
                        caseSensitive: false
                    }),
                    new Filter({
                        path: "phone",
                        operator: FilterOperator.Contains,
                        value1: sQuery,
                        caseSensitive: false
                    })
                ];
                // false = OR condition — kisi bhi ek field mein mile toh show karo
                oBinding.filter(new Filter(aFilters, false));
            } else {
                // Search box khali hai — sab customers dikhao (filter hatao)
                oBinding.filter([]);
            }
        },

        // ═══════════════════════════════════════════════════════════
        // ON CREATE PRESS — Create button click hone par chalta hai
        // Dialog popup khulta hai form ke saath
        // Auto ID feature — database mein sabse bada ID + 1
        // ═══════════════════════════════════════════════════════════
        onCreatePress: function() {
            var that = this; // 'this' ko save karo — callbacks mein use hoga

            // Dialog pehli baar hi banao — dobara banane ki zaroorat nahi
            if (!this._oCreateDialog) {

                // ─── Customer ID Input ───
                // Auto fill hoga but user change bhi kar sakta hai
                this._oIdInput = new Input({
                    placeholder: "Auto-filled Customer ID",
                    type: "Number" // Sirf number allowed
                });

                // ─── Customer Name Input ───
                // liveChange = user type karte waqt automatically capitalize hoga
                this._oNameInput = new Input({
                    placeholder: "Enter Customer Name",
                    liveChange: function(oEvent) {
                        var sVal = oEvent.getSource().getValue();
                        var sCap = that._capitalize(sVal);
                        // Sirf tab setValue karo jab value actually change hui ho
                        if (sVal !== sCap) oEvent.getSource().setValue(sCap);
                    }
                });

                // ─── City Input ───
                // Same capitalize logic
                this._oCityInput = new Input({
                    placeholder: "Enter City",
                    liveChange: function(oEvent) {
                        var sVal = oEvent.getSource().getValue();
                        var sCap = that._capitalize(sVal);
                        if (sVal !== sCap) oEvent.getSource().setValue(sCap);
                    }
                });

                // ─── Address Input ───
                // Same capitalize logic
                this._oAddressInput = new Input({
                    placeholder: "Enter Address Number",
                    liveChange: function(oEvent) {
                        var sVal = oEvent.getSource().getValue();
                        var sCap = that._capitalize(sVal);
                        if (sVal !== sCap) oEvent.getSource().setValue(sCap);
                    }
                });

                // ─── Phone Input ───
                // Validation: sirf 10 digits, sirf numbers
                this._oPhoneInput = new Input({
                    placeholder: "Enter Phone Number (10 digits)",
                    type: "Tel",      // Mobile keyboard dikhane ke liye
                    maxLength: 10,    // HTML level pe bhi 10 limit
                    liveChange: function(oEvent) {
                        var sVal = oEvent.getSource().getValue();
                        // \D = non-digit characters — inhe hatao
                        var sClean = sVal.replace(/\D/g, '');
                        // 10 se zyada digits cut karo
                        if (sClean.length > 10) sClean = sClean.substring(0, 10);
                        if (sVal !== sClean) oEvent.getSource().setValue(sClean);
                    }
                });

                // ─── Create Dialog ───
                // Upar banaye saare inputs ko ek dialog mein wrap karo
                this._oCreateDialog = new Dialog({
                    title: "Create New Customer",
                    content: new VBox({
                        // VBox = items upar se neeche arrange karta hai
                        items: [
                            new Label({ text: "Customer ID (Auto-filled, Editable)", required: true }),
                            this._oIdInput,
                            new Label({ text: "Customer Name", required: true }),
                            this._oNameInput,
                            new Label({ text: "City", required: true }),
                            this._oCityInput,
                            new Label({ text: "Address Number", required: true }),
                            this._oAddressInput,
                            new Label({ text: "Phone Number (10 digits)", required: true }),
                            this._oPhoneInput
                        ]
                    }).addStyleClass("sapUiSmallMargin"), // SAP ka built-in margin class

                    // Save button — _saveCustomer function chalata hai
                    beginButton: new Button({
                        text: "Save",
                        type: "Emphasized", // Blue color
                        press: function() { that._saveCustomer(); }
                    }),
                    // Cancel button — dialog band karta hai
                    endButton: new Button({
                        text: "Cancel",
                        press: function() { that._oCreateDialog.close(); }
                    })
                });

                // Dialog ko View ka dependent banao — View ke saath destroy ho
                this.getView().addDependent(this._oCreateDialog);
            }

            // ─── AUTO ID GENERATE ───
            // Server se saare customers fetch karo
            // Sabse bada CustomerID dhundo aur +1 karo
            // Yeh next available ID hogi
            var oModel = this.getView().getModel();
            var oListBinding = oModel.bindList("/Customers");

            oListBinding.requestContexts().then(function(aContexts) {
                var iMaxId = 0;
                // Har customer ka ID check karo
                aContexts.forEach(function(oCtx) {
                    var iId = oCtx.getProperty("CustomerID");
                    if (iId > iMaxId) iMaxId = iId; // Sabse bada ID track karo
                });
                // Next available ID = max + 1
                that._oIdInput.setValue(String(iMaxId + 1));
            }).catch(function() {
                // Agar server se data na aaye toh default 1 set karo
                that._oIdInput.setValue("1");
            });

            // Dialog kholo
            this._oCreateDialog.open();
        },

        // ═══════════════════════════════════════════════════════════
        // SAVE CUSTOMER — Create dialog ka Save button press hone par
        // Validation karo phir OData POST request se database mein save karo
        // ═══════════════════════════════════════════════════════════
        _saveCustomer: function() {
            var oModel = this.getView().getModel();
            var sPhone = this._oPhoneInput.getValue();

            // ─── Phone Validation ───
            // Exactly 10 digits hone chahiye
            if (sPhone.length !== 10) {
                MessageToast.show("Phone number must be exactly 10 digits!");
                return; // Aage mat jao
            }

            // Form ka data collect karo — capitalize bhi karo
            var oData = {
                CustomerID:   parseInt(this._oIdInput.getValue()),   // String to number
                customerName: this._capitalize(this._oNameInput.getValue()),
                city:         this._capitalize(this._oCityInput.getValue()),
                addressNo:    this._capitalize(this._oAddressInput.getValue()),
                phone:        sPhone
            };

            // ─── Required Fields Validation ───
            if (!oData.CustomerID || !oData.customerName || !oData.city || !oData.addressNo || !oData.phone) {
                MessageToast.show("Please fill all fields!");
                return;
            }

            // ─── OData Create ───
            // bindList se /Customers endpoint pe POST request jaati hai
            var oListBinding = oModel.bindList("/Customers");
            var oContext = oListBinding.create(oData); // Naya record create karo

            // Promise — async operation complete hone ka wait karo
            oContext.created().then(function() {
                MessageToast.show("Customer created successfully!");
            }).catch(function(oError) {
                MessageToast.show("Error: " + oError.message);
            });

            // Dialog band karo aur fields khali karo
            this._oCreateDialog.close();
            this._oIdInput.setValue("");
            this._oNameInput.setValue("");
            this._oCityInput.setValue("");
            this._oAddressInput.setValue("");
            this._oPhoneInput.setValue("");
        },

        // ═══════════════════════════════════════════════════════════
        // ON VIEW PRESS — View button click hone par chalta hai
        // Customer ID se specific customer ya sab customers dekho
        // ═══════════════════════════════════════════════════════════
        onViewPress: function() {
            var that = this;

            if (!this._oViewDialog) {
                // Customer ID input — optional hai
                this._oViewIdInput = new Input({
                    placeholder: "Enter Customer ID (leave empty for all)",
                    type: "Number"
                });

                this._oViewDialog = new Dialog({
                    title: "View Customer",
                    content: new VBox({
                        items: [
                            new Label({ text: "Customer ID (optional)" }),
                            this._oViewIdInput,
                            new Label({ text: "Leave empty to view all customers" })
                        ]
                    }).addStyleClass("sapUiSmallMargin"),

                    beginButton: new Button({
                        text: "View",
                        type: "Emphasized",
                        press: function() { that._viewCustomer(); }
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: function() { that._oViewDialog.close(); }
                    })
                });

                this.getView().addDependent(this._oViewDialog);
            }

            this._oViewDialog.open();
        },

        // ─── VIEW CUSTOMER ───
        // ID diya toh sirf us customer ko filter karo
        // ID nahi diya toh sab customers dikhao
        _viewCustomer: function() {
            var sId = this._oViewIdInput.getValue().trim();
            var oTable = this.byId("customerTable");
            var oBinding = oTable.getBinding("rows");

            if (sId) {
                // EQ = Equal — exact ID match karo
                var oFilter = new Filter("CustomerID", FilterOperator.EQ, parseInt(sId));
                oBinding.filter([oFilter]); // Sirf yeh customer dikhao
                MessageToast.show("Showing customer: " + sId);
            } else {
                oBinding.filter([]); // Saare filters hatao — sab dikhao
                MessageToast.show("Showing all customers");
            }

            this._oViewDialog.close();
            this._oViewIdInput.setValue(""); // Input khali karo
        },

        // ═══════════════════════════════════════════════════════════
        // ON EDIT PRESS — Edit button click hone par chalta hai
        // Table mein ek row select karke Edit karo
        // CustomerID aur customerName EDIT NAHI HONGE — read only hain
        // Sirf city, addressNo, phone edit ho sakta hai
        // ═══════════════════════════════════════════════════════════
        onEditPress: function() {
            var that = this;
            var oTable = this.byId("customerTable");
            var aSelectedIndices = oTable.getSelectedIndices(); // Selected rows ke indices

            // ─── Validation ───
            if (aSelectedIndices.length === 0) {
                MessageBox.warning("Please select a customer to edit!");
                return;
            }
            if (aSelectedIndices.length > 1) {
                MessageBox.warning("Please select only one customer to edit!");
                return;
            }

            // Selected row ka OData context lo — isse actual data milega
            var oContext = oTable.getBinding("rows").getContexts()[aSelectedIndices[0]];
            var oData = oContext.getObject(); // Customer ka actual data

            if (!this._oEditDialog) {
                // ─── Edit ke liye sirf 3 fields ───
                // City, Address, Phone — yahi edit ho sakte hain
                this._oEditCityInput = new Input({
                    placeholder: "Enter City",
                    liveChange: function(oEvent) {
                        var sVal = oEvent.getSource().getValue();
                        var sCap = that._capitalize(sVal);
                        if (sVal !== sCap) oEvent.getSource().setValue(sCap);
                    }
                });

                this._oEditAddressInput = new Input({
                    placeholder: "Enter Address Number",
                    liveChange: function(oEvent) {
                        var sVal = oEvent.getSource().getValue();
                        var sCap = that._capitalize(sVal);
                        if (sVal !== sCap) oEvent.getSource().setValue(sCap);
                    }
                });

                // Phone — same 10 digit validation
                this._oEditPhoneInput = new Input({
                    placeholder: "Enter Phone Number (10 digits)",
                    type: "Tel",
                    maxLength: 10,
                    liveChange: function(oEvent) {
                        var sVal = oEvent.getSource().getValue();
                        var sClean = sVal.replace(/\D/g, '').substring(0, 10);
                        if (sVal !== sClean) oEvent.getSource().setValue(sClean);
                    }
                });

                // Edit Dialog
                this._oEditDialog = new Dialog({
                    title: "Edit Customer",
                    content: new VBox({
                        items: [
                            // ─── Read Only Fields ───
                            // CustomerID aur Name sirf dikhenge — edit nahi honge
                            new Label({ text: "Customer ID (Read Only)" }),
                            new Input({ id: "editIdDisplay", enabled: false }), // enabled:false = read only

                            new Label({ text: "Customer Name (Read Only)" }),
                            new Input({ id: "editNameDisplay", enabled: false }), // read only

                            // ─── Editable Fields ───
                            new Label({ text: "City", required: true }),
                            this._oEditCityInput,

                            new Label({ text: "Address Number", required: true }),
                            this._oEditAddressInput,

                            new Label({ text: "Phone Number (10 digits)", required: true }),
                            this._oEditPhoneInput
                        ]
                    }).addStyleClass("sapUiSmallMargin"),

                    // Update button — _updateCustomer function chalata hai
                    beginButton: new Button({
                        text: "Update",
                        type: "Emphasized",
                        press: function() { that._updateCustomer(); }
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: function() { that._oEditDialog.close(); }
                    })
                });

                this.getView().addDependent(this._oEditDialog);
            }

            // ─── Purana data fill karo ───
            // Read only fields mein current values dikhao
            sap.ui.getCore().byId("editIdDisplay").setValue(String(oData.CustomerID));
            sap.ui.getCore().byId("editNameDisplay").setValue(oData.customerName);

            // Editable fields mein current values pre-fill karo
            this._oEditCityInput.setValue(oData.city);
            this._oEditAddressInput.setValue(oData.addressNo);
            this._oEditPhoneInput.setValue(oData.phone);

            // Current context save karo — update ke waqt use hoga
            this._oCurrentEditContext = oContext;

            this._oEditDialog.open();
        },

        // ─── UPDATE CUSTOMER ───
        // Edit dialog ka Update button press hone par chalta hai
        // OData PATCH request se sirf changed fields update hote hain
        _updateCustomer: function() {
            var sPhone = this._oEditPhoneInput.getValue();

            // Phone validation
            if (sPhone.length !== 10) {
                MessageToast.show("Phone number must be exactly 10 digits!");
                return;
            }

            var sCity    = this._capitalize(this._oEditCityInput.getValue());
            var sAddress = this._capitalize(this._oEditAddressInput.getValue());

            if (!sCity || !sAddress || !sPhone) {
                MessageToast.show("Please fill all fields!");
                return;
            }

            // ─── OData PATCH ───
            // setProperty se sirf yeh 3 fields update honge
            // CustomerID aur customerName untouched rahenge
            this._oCurrentEditContext.setProperty("city", sCity);
            this._oCurrentEditContext.setProperty("addressNo", sAddress);
            this._oCurrentEditContext.setProperty("phone", sPhone);

            // submitBatch — pending changes server pe bhejo
            this._oCurrentEditContext.getModel().submitBatch("$auto").then(function() {
                MessageToast.show("Customer updated successfully!");
            }).catch(function(oError) {
                MessageToast.show("Error: " + oError.message);
            });

            this._oEditDialog.close();
            this.byId("customerTable").clearSelection(); // Selection clear karo
        },

        // ═══════════════════════════════════════════════════════════
        // ON DELETE PRESS — Delete button click hone par chalta hai
        // Table mein selected rows delete karo
        // Pehle confirm dialog dikhata hai — accidental delete se bachao
        // ═══════════════════════════════════════════════════════════
        onDeletePress: function() {
            var oTable = this.byId("customerTable");
            var aSelectedIndices = oTable.getSelectedIndices();

            // Koi row select nahi ki
            if (aSelectedIndices.length === 0) {
                MessageBox.warning("Please select at least one customer to delete!");
                return;
            }

            // Confirm dialog — accidentally delete na ho
            MessageBox.confirm(
                "Are you sure you want to delete " + aSelectedIndices.length + " customer(s)?",
                {
                    onClose: function(sAction) {
                        // Sirf OK dabane par delete karo
                        if (sAction === MessageBox.Action.OK) {
                            this._deleteSelectedCustomers(oTable, aSelectedIndices);
                        }
                    }.bind(this)
                }
            );
        },

        // ─── DELETE SELECTED CUSTOMERS ───
        // Selected customers ko OData DELETE request se hatao
        _deleteSelectedCustomers: function(oTable, aSelectedIndices) {
            var oBinding = oTable.getBinding("rows");

            // ─── Reverse order mein delete karo ───
            // Agar seedha order mein delete karein toh index shift ho jaata hai
            // Example: [0,1,2] mein 0 delete kiya toh 1 ban jaata hai 0
            // Reverse se yeh problem nahi hoti
            aSelectedIndices.reverse().forEach(function(iIndex) {
                var oContext = oBinding.getContexts()[iIndex];
                if (oContext) oContext.delete(); // OData DELETE request
            });

            oTable.clearSelection(); // Table selection clear karo
            MessageToast.show("Customer(s) deleted successfully!");
        }

    });
});