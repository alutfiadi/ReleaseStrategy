sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"sap/ui/comp/library",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/String",
	"sap/m/ColumnListItem",
	"sap/m/Label",
	"sap/m/SearchField",
	"sap/m/Token",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/base/Log",
	"sap/m/MessageToast"
], function (BaseController, MessageBox, Utilities, History, compLibrary, Controller, JSONModel, typeString, ColumnListItem, Label,
	SearchField, Token, Filter, FilterOperator, Log, MessageToast) {
	"use strict";

	return BaseController.extend("AL.ReleaseStrategy.controller.Addgroup_1", {
		handleRouteMatched: function (oEvent) {
			var sAppId = "App602a187c72e86f7d458628c3";

			var oParams = {};

			// if (oEvent.mParameters.data.context) {
			// 	this.sContext = oEvent.mParameters.data.context;

			// } else {
			// 	if (this.getOwnerComponent().getComponentData()) {
			// 		var patternConvert = function(oParam) {
			// 			if (Object.keys(oParam).length !== 0) {
			// 				for (var prop in oParam) {
			// 					if (prop !== "sourcePrototype" && prop.includes("Set")) {
			// 						return prop + "(" + oParam[prop][0] + ")";
			// 					}
			// 				}
			// 			}
			// 		};

			// 		this.sContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);

			// 	}
			// }

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
			this.oRouter.getTarget("Addgroup_1").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			//call odata
			this.sUrl = "/sap/opu/odata/sap/ZHCM_WF_ENGINE_SRV/";
			this.oModel = new sap.ui.model.odata.ODataModel(this.sUrl, true);
			
		},
		CheckData: function(){
			var bValidationError = false;
			var irgcode = this.getView().byId("irgcode").getValue();
			var irgtext = this.getView().byId("irgtxt").getValue();

			if (irgcode === null || irgcode == "") {
				bValidationError = true;
				this.getView().byId("irgcode").setValueState("Error");
			}else if (irgtext === null || irgtext == "") {
				bValidationError = true;
				this.getView().byId("irgtxt").setValueState("Error");
			}else {
				bValidationError = false;
				this.getView().byId("irgcode").setValueState("None");
				this.getView().byId("irgtxt").setValueState("None");
			}
			
			
			return bValidationError;
		},

		//-------SAVE BUTTON ----------
		_onButtonPress: function (oEvent) {

			//----------------------------NAVIGATION TO LIST
			// var oBindingContext = oEvent.getSource().getBindingContext();

			// return new Promise(function(fnResolve) {

			// 	this.doNavigate("ReleaseStrategy", oBindingContext, fnResolve, "");
			// }.bind(this)).catch(function(err) {
			// 	if (err !== undefined) {
			// 		MessageBox.error(err.message);
			// 	}
			// });
			
			var oDialog = this.byId("BusyDialog");
			oDialog.open();
			var irgcode = this.getView().byId("irgcode").getValue();
			var irgtext = this.getView().byId("irgtxt").getValue();
			
			
			if (!this.CheckData()) {
				var oObject = {};
				oObject = {
					"Rgcode": irgcode,
					"Rgtxt": irgtext
				};

				this.oModel.setHeaders({
					"X-Requested-With": "X",
					"Content-Type": "application/json"
				});

				//set model to this view
				this.getView().setModel(this.oModel);
				var oThis = this;
				this.oModel.create("/ReleaseGroupSet", oObject, {
					success: function (oData, oResponse) {
						// Success
						oDialog.close();
						MessageToast.show("Submit successfully");
						this.clearData();
						this.refresh();
						this.navBack();

					}.bind(this),
					error: function (oError) {
						oDialog.close();
						var message = JSON.parse(oError.response.body);
						Log.info(message.error.message.value);
						MessageToast.show(message.error.message.value);
						//MessageToast.show(message);
					}
				});
			} else {
				oDialog.close();
				MessageToast.show("A validation error has occurred. Complete your input first.");
			}

		},
		clearData: function () {
			this.getView().byId("irgcode").setValue(null);
			this.getView().byId("irgtxt").setValue(null);
		},

		navBack: function () {
			// Set the oDATA model to the core and refresh
			//sap.ui.getCore().setModel(this.oModel, "ReleaseStrategy");
			//sap.ui.getCore().getModel("ReleaseStrategy").refresh(true);

			//sap.ui.getCore().byId("tRgroup").getBinding("items").refresh(true);
			this.oRouter.navTo("ReleaseStrategy", true);

		},
		refresh: function () {
			sap.ui.getCore().setModel(this.oModel, "ReleaseStrategy");
			sap.ui.getCore().getModel("ReleaseStrategy").refresh(true);
			//sap.ui.getCore().byId("tRgroup").getBinding("items").refresh(true);
		}
	});
}, /* bExport= */ true);