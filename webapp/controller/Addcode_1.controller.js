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
	"sap/m/MessageToast",
	"sap/base/Log",
], function (BaseController, MessageBox, Utilities, History, compLibrary, Controller, JSONModel, typeString, ColumnListItem, Label,
	SearchField, Token, Filter, FilterOperator, MessageToast, Log) {
	"use strict";

	return BaseController.extend("AL.ReleaseStrategy.controller.Addcode_1", {
		handleRouteMatched: function (oEvent) {
			var sAppId = "App602a187c72e86f7d458628c3";

			var oParams = {};

			// if (oEvent.mParameters.data.context) {
			// 	this.sContext = oEvent.mParameters.data.context;

			// } else {
			// 	if (this.getOwnerComponent().getComponentData()) {
			// 		var patternConvert = function (oParam) {
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
		validation: function () {

			var bValidationError = false;
			var irgcode = this.getView().byId("cbGroup").getSelectedKey();
			var irccode = this.getView().byId("irccode").getValue();
			var irctxt = this.getView().byId("irctxt").getValue();

			if (irgcode === null || irgcode == "") {
				bValidationError = true;
				this.getView().byId("cbGroup").setValueState("Error");
				this.getView().byId("irccode").setValueState("None");
				this.getView().byId("irctxt").setValueState("None");
			} else if (irccode === null || irccode == "") {
				bValidationError = true;
				this.getView().byId("irccode").setValueState("Error");
				this.getView().byId("cbGroup").setValueState("None");
				this.getView().byId("irctxt").setValueState("None");
			} else if (irctxt === null || irctxt == "") {
				bValidationError = true;
				this.getView().byId("irctxt").setValueState("Error");
				this.getView().byId("cbGroup").setValueState("None");
				this.getView().byId("irccode").setValueState("None");
			} else {
				bValidationError = false;
				this.getView().byId("cbGroup").setValueState("None");
				this.getView().byId("irccode").setValueState("None");
				this.getView().byId("irctxt").setValueState("None");
			}

			return bValidationError;
		},
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("Addcode_1").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			//callodata
			this.sUrl = "/sap/opu/odata/sap/ZHCM_WF_ENGINE_SRV/";
			this.oModel = new sap.ui.model.odata.ODataModel(this.sUrl, true);

			//ReleaseGroup Combobox
			this.getView().byId("cbGroup").setFilterFunction(function (sTerm, oItem) {
				// A case-insensitive 'string contains' filter
				return oItem.getText().match(new RegExp(sTerm, "i")) || oItem.getKey().match(new RegExp(sTerm, "i"));
			});

			//Value Help User
			/*
			this._oMultiInput = this.getView().byId("multiInput");
			this._oMultiInput.setTokens(this._getDefaultTokens());
			this._oMultiInput.addValidator(this._onMultiInputValidate);

			this.oColModel = new JSONModel(sap.ui.require.toUrl("com/sap/build/standard/releaseStrategy/mockdata") + "/columnsModel.json");
			this.oUsersModel = new JSONModel(sap.ui.require.toUrl("com/sap/build/standard/releaseStrategy/mockdata") + "/users.json");
			this.getView().setModel(this.oUsersModel); */
		},
		_onButtonPress: function (oEvent) {
			/* NAVIGATION
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("ReleaseStrategy", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});*/
			var oDialog = this.byId("BusyDialog");
			var irgcode = this.getView().byId("cbGroup").getSelectedKey();
			var irccode = this.getView().byId("irccode").getValue();
			var irctxt = this.getView().byId("irctxt").getValue();

			if (!this.validation()) {
				var oObject = {};
				oObject = {
					"Rgcode": irgcode,
					"Rccode": irccode,
					"Rctxt": irctxt
				};

				// Log.info(oObject.Rgcode);
				// Log.info(oObject.Rccode);
				// Log.info(oObject.Rctxt);

				this.oModel.setHeaders({
					"X-Requested-With": "X",
					"Content-Type": "application/json"
				});

				//set model to this view
				this.getView().setModel(this.oModel);
				this.oModel.create("/ReleaseCodeSet", oObject, {
					success: function (oData, oResponse) {
						// Success
						oDialog.close();
						MessageToast.show("Submit successfully");
						this.clearData();
						this.navBack();
					}.bind(this),
					error: function (oError) {
						oDialog.close();
						//MESSAGE ODATA
						var message = JSON.parse(oError.response.body);
						Log.info(message.error.message.value);
						MessageToast.show(message.error.message.value);
					}
				});
			} else {
				oDialog.close();
				MessageToast.show("A validation error has occurred. Complete your input first.");
			}

		},
		clearData: function () {
			this.getView().byId("irccode").setValue(null);
			this.getView().byId("cbGroup").setSelectedKey(null);
			this.getView().byId("irctxt").setValue(null);
		},
		navBack: function () {
				this.oRouter.navTo("ReleaseStrategy", true);

		}
			//Value Help
			/*
			onValueHelpRequested: function () {
				var aCols = this.oColModel.getData().cols;
				this._oBasicSearchField = new SearchField({
					showSearchButton: false
				});

				this._oValueHelpDialog = sap.ui.xmlfragment("AL.ReleaseStrategy.view.ValueHelpUserSugesstions", this);
				this.getView().addDependent(this._oValueHelpDialog);

				this._oValueHelpDialog.setRangeKeyFields([{
					label: "Employee",
					key: "NIK",
					type: "string",
					typeInstance: new typeString({}, {
						maxLength: 7
					})
				}]);

				this._oValueHelpDialog.getFilterBar().setBasicSearch(this._oBasicSearchField);

				this._oValueHelpDialog.getTableAsync().then(function (oTable) {
					oTable.setModel(this.oUsersModel);
					oTable.setModel(this.oColModel, "columns");

					if (oTable.bindRows) {
						oTable.bindAggregation("rows", "/UserCollection");
					}

					if (oTable.bindItems) {
						oTable.bindAggregation("employees", "/UserCollection", function () {
							return new ColumnListItem({
								cells: aCols.map(function (column) {
									return new Label({
										text: "{" + column.template + "}"
									});
								})
							});
						});
					}

					this._oValueHelpDialog.update();
				}.bind(this));

				this._oValueHelpDialog.setTokens(this._oMultiInput.getTokens());
				this._oValueHelpDialog.open();
			},

			onValueHelpOkPress: function (oEvent) {
				var aTokens = oEvent.getParameter("tokens");
				this._oMultiInput.setTokens(aTokens);
				this._oValueHelpDialog.close();
			},

			onValueHelpCancelPress: function () {
				this._oValueHelpDialog.close();
			},

			onValueHelpAfterClose: function () {
				this._oValueHelpDialog.destroy();
			},

			onFilterBarSearch: function (oEvent) {
				var sSearchQuery = this._oBasicSearchField.getValue(),
					aSelectionSet = oEvent.getParameter("selectionSet");
				var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
					if (oControl.getValue()) {
						aResult.push(new Filter({
							path: oControl.getName(),
							operator: FilterOperator.Contains,
							value1: oControl.getValue()
						}));
					}

					return aResult;
				}, []);

				aFilters.push(new Filter({
					filters: [
						new Filter({
							path: "NIK",
							operator: FilterOperator.Contains,
							value1: sSearchQuery
						}),
						new Filter({
							path: "Name",
							operator: FilterOperator.Contains,
							value1: sSearchQuery
						})
					],
					and: false
				}));

				this._filterTable(new Filter({
					filters: aFilters,
					and: true
				}));
			},

			_filterTable: function (oFilter) {
				var oValueHelpDialog = this._oValueHelpDialog;

				oValueHelpDialog.getTableAsync().then(function (oTable) {
					if (oTable.bindRows) {
						oTable.getBinding("rows").filter(oFilter);
					}

					if (oTable.bindItems) {
						oTable.getBinding("employees").filter(oFilter);
					}

					oValueHelpDialog.update();
				});
			},

			_onMultiInputValidate: function (oArgs) {
				if (oArgs.suggestionObject) {
					var oObject = oArgs.suggestionObject.getBindingContext().getObject(),
						oToken = new Token();

					oToken.setKey(oObject.NIK);
					oToken.setText(oObject.Name + " (" + oObject.NIK + ")");
					return oToken;
				}

				return null;
			},

			_getDefaultTokens: function () {
				var ValueHelpRangeOperation = compLibrary.valuehelpdialog.ValueHelpRangeOperation;
				var oToken1 = new Token({
					key: "90001",
					text: "User 9001"
				});

				var oToken2 = new Token({
					key: "range_0",
					text: "!(=User 9001)"
				}).data("range", {
					"exclude": true,
					"operation": ValueHelpRangeOperation.EQ,
					"keyField": "NIK",
					"value1": "User 9001",
					"value2": ""
				});

				return [oToken1, oToken2];
			}*/

	});
}, /* bExport= */ true);