sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"sap/m/MessageToast"
], function (BaseController, MessageBox, Utilities, History, MessageToast) {
	"use strict";

	return BaseController.extend("AL.ReleaseStrategy.controller.Editcode", {
		handleRouteMatched: function (oEvent) {
			var sAppId = "App602a187c72e86f7d458628c3";

			var oParams = {};

			/*if (oEvent.mParameters.data.context) {
				this.sContext = oEvent.mParameters.data.context;

			} else {
				if (this.getOwnerComponent().getComponentData()) {
					var patternConvert = function(oParam) {
						if (Object.keys(oParam).length !== 0) {
							for (var prop in oParam) {
								if (prop !== "sourcePrototype" && prop.includes("Set")) {
									return prop + "(" + oParam[prop][0] + ")";
								}
							}
						}
					};

					this.sContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);

				}
			}
			*/
			var oPath;

			if (this.sContext) {
				oPath = {
					path: "/" + this.sContext,
					parameters: oParams
				};
				this.getView().bindObject(oPath);
			}

		},

		doNavigate: function (sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oModel = (oBindingContext) ? oBindingContext.getModel() : null;

			var sEntityNameSet;
			if (sPath !== null && sPath !== "") {
				if (sPath.substring(0, 1) === "/") {
					sPath = sPath.substring(1);
				}
				sEntityNameSet = sPath.split("(")[0];
			}
			var sNavigationPropertyName;
			var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;

			if (sEntityNameSet !== null) {
				sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet,
					sRouteName);
			}
			if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
				if (sNavigationPropertyName === "") {
					this.oRouter.navTo(sRouteName, {
						context: sPath,
						masterContext: sMasterContext
					}, false);
				} else {
					oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function (bindingContext) {
						if (bindingContext) {
							sPath = bindingContext.getPath();
							if (sPath.substring(0, 1) === "/") {
								sPath = sPath.substring(1);
							}
						} else {
							sPath = "undefined";
						}

						// If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
						if (sPath === "undefined") {
							this.oRouter.navTo(sRouteName);
						} else {
							this.oRouter.navTo(sRouteName, {
								context: sPath,
								masterContext: sMasterContext
							}, false);
						}
					}.bind(this));
				}
			} else {
				this.oRouter.navTo(sRouteName);
			}

			if (typeof fnPromiseResolve === "function") {
				fnPromiseResolve();
			}

		},
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// this.oRouter.getTarget("Editcode").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("Editcode").attachPatternMatched(this._onObjectMatched, this);

			//call odata
			this.sUrl = "/sap/opu/odata/sap/ZHCM_WF_ENGINE_SRV/";
			this.oModel = new sap.ui.model.odata.ODataModel(this.sUrl, true);

		},
		_onObjectMatched: function (oEvent) {
			this.getView().bindElement({
				path: decodeURIComponent("/" + oEvent.getParameter("arguments").rcPath),
				model: "ReleaseStrategy"
			});

			// var accEbeln = this.getView().byId("Ebeln").getValue();
			// //var accEbelp = this.getView().byId("Ebelp").getValue();
			// var oFilter = new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.EQ, accEbeln);
			// this.getView().byId("listItems").getBinding("items").filter(oFilter);
		},
		_onButtonPress: function (oEvent) {
			var oDialog = this.byId("BusyDialog");
			oDialog.open();

			var irgcode = this.getView().byId("cbGroup").getSelectedKey();
			var irccode = this.getView().byId("irccode").getValue();
			var irctxt = this.getView().byId("irctxt").getValue();

			var oObject = {};
			oObject = {
				"Rccode": irccode,
				"Rctxt": irctxt,
				"Rgcode": irgcode
			};

			this.oModel.setHeaders({
				"X-Requested-With": "X",
				"Content-Type": "application/json"
			});

			//set model to this view
			this.getView().setModel(this.oModel);
			this.oModel.update("/ReleaseCodeSet('" + irccode + "')", oObject, {
				success: function (oData, oResponse) {
					// Success
					oDialog.close();
					MessageToast.show("Release Code " + irccode + " change successfully");
					this.refresh();
					this.navBack();

				}.bind(this),
				error: function (oError) {
					oDialog.close();
					// var message = JSON.parse(oError.response.body);
					// var message1 = JSON.parse(oError.response.body.innererror.errordetails);
					// Log.info(message.error.message.value);
					// Log.info(message1.errordetail);
					MessageToast.show("There is some error");
					//MessageToast.show(message);
				}
			});

		},

		navBack: function () {
			//sap.ui.getCore().byId("trgroup").setModel(this.oModel, "ReleaseStrategy");
			// Set the oDATA model to the core and refresh
			sap.ui.getCore().setModel(this.oModel, "ReleaseStrategy");
			sap.ui.getCore().getModel("ReleaseStrategy").refresh(true);

			this.oRouter.navTo("ReleaseStrategy");

		},
		refresh: function () {

		}

	});
}, /* bExport= */ true);