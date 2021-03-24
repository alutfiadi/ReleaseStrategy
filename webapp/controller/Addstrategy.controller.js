sap.ui.define([
		"sap/ui/core/mvc/Controller",
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
		"sap/ui/model/FilterType",
		"sap/base/Log",
		"sap/m/MessageToast"
	], function (BaseController, MessageBox, Utilities, History, compLibrary, Controller, JSONModel, typeString, ColumnListItem, Label,
		SearchField, Token, Filter, FilterOperator, FilterType, Log, MessageToast) {
		"use strict";
		return BaseController.extend("AL.ReleaseStrategy.controller.Addstrategy", {
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
				var sPath = oBindingContext ? oBindingContext.getPath() : null;
				var oModel = oBindingContext ? oBindingContext.getModel() : null;
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
				var oDialog = this.byId("BusyDialog");
				oDialog.open();
				this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				// this.oRouter.getTarget("Addstrategy").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
				//Call Odata Master data
				var sUrl = "/sap/opu/odata/sap/ZHCM_WF_ENGINE_SRV/";
				this.oModel = new sap.ui.model.odata.ODataModel(sUrl, true);

				// var oModelEpoloyee = this.getOwnerComponent().getModel("Employee");
				// oModelEpoloyee.setSizeLimit(1000);

				var that = this;
				var sUrlMutasi = "/sap/opu/odata/sap/ZHCM_MUTASI_SRV";
				var oModelMutasi = new sap.ui.model.odata.ODataModel(sUrlMutasi, true);
				var oFilterEmp = new Filter("Otorisasi", FilterOperator.EQ, 'X');
				this.getView().setModel(oModelMutasi);
				oModelMutasi.read("/GetListEmployeeMutasiSet", {
					filters: [oFilterEmp],
					success: function (oData, response) {
						var arrayData = oData.results;
						var jsondata = {
							items: arrayData
						};
						var jsonModel = new sap.ui.model.json.JSONModel();
						jsonModel.setSizeLimit(1000);
						jsonModel.setData(jsondata);

						//Level
						for (var i = 1; i <= 10; i++) {
							var cbLvl = that.byId("cbLvl" + i);
							cbLvl.setModel(jsonModel);
							cbLvl.bindAggregation("items", "/items", new sap.ui.core.ListItem({
								key: "{Pernr}",
								text: "{Pernr} - {Sname}"
							}));

						}

						//Notified
						for (var j = 1; j <= 10; j++) {
							var cbNtf = that.byId("cbNtf" + j);
							cbNtf.setModel(jsonModel);
							cbNtf.bindAggregation("items", "/items", new sap.ui.core.ListItem({
								key: "{Pernr}",
								text: "{Pernr} - {Sname}"
							}));

						}

						var cbRequester = that.byId("cbRequester");
						cbRequester.setModel(jsonModel);
						cbRequester.bindAggregation("items", "/items", new sap.ui.core.ListItem({
							key: "{Pernr}",
							text: "{Pernr} - {Sname}"
						}));
						oDialog.close();
					}
				});
				// oModelMutasi.read("/GetListEmployeeMutasiSet",
				// 	null, null, true,
				// 	function (oData, oReponse) {

				// 	},
				// 	function (error) {
				// 		//if the call to odata fails, handle the error here
				// 	});

				// //Company Combobox
				// this.getView().byId("cbCompany").setFilterFunction(function (sTerm, oItem) {
				// 	// A case-insensitive 'string contains' filter
				// 	return oItem.getText().match(new RegExp(sTerm, "i")) || oItem.getKey().match(new RegExp(sTerm, "i"));
				// });
				//Department Combobox
				this.getView().byId("cbDepartment").setFilterFunction(function (sTerm, oItem) {
					// A case-insensitive 'string contains' filter
					return oItem.getText().match(new RegExp(sTerm, "i")) || oItem.getKey().match(new RegExp(sTerm, "i"));
				});
				//ReleaseGroup Combobox
				// this.getView().byId("cbGroup").setFilterFunction(function (sTerm, oItem) {
				// 	// A case-insensitive 'string contains' filter
				// 	return oItem.getText().match(new RegExp(sTerm, "i")) || oItem.getKey().match(new RegExp(sTerm, "i"));
				// });

				//ReleaseCode Combobox
				this.getView().byId("cbCode").setFilterFunction(function (sTerm, oItem) {
					// A case-insensitive 'string contains' filter
					return oItem.getText().match(new RegExp(sTerm, "i")) || oItem.getKey().match(new RegExp(sTerm, "i")) || oItem.getAdditionalText()
						.match(new RegExp(sTerm, "i"));
				});

				//Combobx Search lvl1
				for (var i = 1; i <= 10; i++) {
					this.getView().byId("cbLvl" + i).setFilterFunction(function (sTerm, oItem) {
						// A case-insensitive 'string contains' filter
						var sItemText = oItem.getText().toLowerCase(),
							sSearchTerm = sTerm.toLowerCase();
						return sItemText.indexOf(sSearchTerm) > -1;
					});
				}

				//Combobx Search Notified
				for (var j = 1; j <= 10; j++) {
					this.getView().byId("cbNtf" + j).setFilterFunction(function (sTerm, oItem) {
						// A case-insensitive 'string contains' filter
						var sItemText = oItem.getText().toLowerCase(),
							sSearchTerm = sTerm.toLowerCase();
						return sItemText.indexOf(sSearchTerm) > -1;
					});
				}

				//combobox requester
				this.getView().byId("cbRequester").setFilterFunction(function (sTerm, oItem) {
					// A case-insensitive 'string contains' filter
					var sItemText = oItem.getText().toLowerCase(),
						sSearchTerm = sTerm.toLowerCase();
					return sItemText.indexOf(sSearchTerm) > -1;
				});

				//Combobox Doctype
				this.oDocTypeModel = new JSONModel(sap.ui.require.toUrl("AL/ReleaseStrategy/model") + "/Doctype.json");
				this.getView().byId("cbDocType").setModel(this.oDocTypeModel);
				this.getView().byId("cbDocType").setFilterFunction(function (sTerm, oItem) {
					// A case-insensitive 'string contains' filter
					return oItem.getText().match(new RegExp(sTerm, "i")) || oItem.getKey().match(new RegExp(sTerm, "i")) || oItem.getAdditionalText()
						.match(new RegExp(sTerm, "i"));
				});

				//Combobox Business
				this.oDocTypeModel = new JSONModel(sap.ui.require.toUrl("AL/ReleaseStrategy/model") + "/Business.json");
				this.getView().byId("cbBusiness").setModel(this.oDocTypeModel);
				this.getView().byId("cbBusiness").setFilterFunction(function (sTerm, oItem) {
					// A case-insensitive 'string contains' filter
					return oItem.getText().match(new RegExp(sTerm, "i")) || oItem.getKey().match(new RegExp(sTerm, "i")) || oItem.getAdditionalText()
						.match(new RegExp(sTerm, "i"));
				});

			},

			handleLoadItems: function (oEvent) {
				oEvent.getSource().getBinding("items").resume();
			},
			handleLoadItems2: function (oEvent) {
				oEvent.getSource().getBinding("items").resume();
			},
			validasiUser: function (oEvent) {
				var selKey = oEvent.getParameters();
				var countSelKey = selKey.selectedItems.length;
				//MessageToast.show(countSelKey);
				var idOfMyBox = oEvent.getSource().getId();
				var n = idOfMyBox.indexOf("cb");
				var myBox = idOfMyBox.substr(n, idOfMyBox.length);
				if (countSelKey > 3) {
					//MessageToast.show("KEBANYAKAN HEY");
					this.getView().byId(myBox).setValueState("Error");
					this.getView().byId(myBox).setValueStateText("Choose Maximal 3 User");
					//oEvent.getSource().getProperties("ValueState");
				} else {
					//MessageToast.show("OK");
					this.getView().byId(myBox).setValueState("None");
					this.getView().byId(myBox).setValueStateText("");
				}
			},
			validasiUserNotified: function (oEvent) {
				var selKey = oEvent.getParameters();
				var countSelKey = selKey.selectedItems.length;
				//MessageToast.show(countSelKey);
				var idOfMyBox = oEvent.getSource().getId();
				var n = idOfMyBox.indexOf("cb");
				var myBox = idOfMyBox.substr(n, idOfMyBox.length);
				if (countSelKey > 5) {
					//MessageToast.show("KEBANYAKAN HEY");
					this.getView().byId(myBox).setValueState("Error");
					this.getView().byId(myBox).setValueStateText("Choose Maximal 5 User");
					//oEvent.getSource().getProperties("ValueState");
				} else {
					//MessageToast.show("OK");
					this.getView().byId(myBox).setValueState("None");
					this.getView().byId(myBox).setValueStateText("");
				}
			},
			validasiHeader: function () {
				var bValidationError = false;
				var iRscode = this.getView().byId("iRscode").getValue();
				var iRstxt = this.getView().byId("iRstxt").getValue();
				var cbDocType = this.getView().byId("cbDocType").getSelectedKey();
				var cbBusiness = this.getView().byId("cbBusiness").getSelectedKey();
				var cbUnit = this.getView().byId("cbUnit").getSelectedKey();

				if (iRscode === null || iRscode == "") {
					bValidationError = true;
					this.getView().byId("iRscode").setValueState("Error");
					this.getView().byId("iRstxt").setValueState("None");
					this.getView().byId("cbDocType").setValueState("None");
					this.getView().byId("cbBusiness").setValueState("None");
					this.getView().byId("cbUnit").setValueState("None");
				} else if (iRstxt === null || iRstxt == "") {
					bValidationError = true;
					this.getView().byId("iRscode").setValueState("None");
					this.getView().byId("iRstxt").setValueState("Error");
					this.getView().byId("cbDocType").setValueState("None");
					this.getView().byId("cbBusiness").setValueState("None");
					this.getView().byId("cbUnit").setValueState("None");
				} else if (cbDocType === null || cbDocType == "") {
					bValidationError = true;
					this.getView().byId("iRscode").setValueState("None");
					this.getView().byId("iRstxt").setValueState("None");
					this.getView().byId("cbDocType").setValueState("Error");
					this.getView().byId("cbBusiness").setValueState("None");
					this.getView().byId("cbUnit").setValueState("None");
				} else if (cbBusiness === null || cbBusiness == "") {
					bValidationError = true;
					this.getView().byId("iRscode").setValueState("None");
					this.getView().byId("iRstxt").setValueState("None");
					this.getView().byId("cbDocType").setValueState("None");
					this.getView().byId("cbBusiness").setValueState("Error");
					this.getView().byId("cbUnit").setValueState("None");
				} else if (cbUnit === null || cbUnit == "") {
					bValidationError = true;
					this.getView().byId("iRscode").setValueState("None");
					this.getView().byId("iRstxt").setValueState("None");
					this.getView().byId("cbDocType").setValueState("None");
					this.getView().byId("cbBusiness").setValueState("None");
					this.getView().byId("cbUnit").setValueState("Error");
				} else {
					bValidationError = false;
					this.getView().byId("iRscode").setValueState("None");
					this.getView().byId("iRstxt").setValueState("None");
					this.getView().byId("cbDocType").setValueState("None");
					this.getView().byId("cbBusiness").setValueState("None");
					this.getView().byId("cbUnit").setValueState("None");
				}

				return bValidationError;
			},
			onChange: function (oEvent) {
				var selectedText = this.byId("cbCode").getSelectedItem().getAdditionalText();
				this.byId("cbGroup").setValue(selectedText);

			},
			checkLevelFrom: function (oEvent) {
				var selectedFrom = this.byId("cbLevelFrom").getSelectedItem().getKey();
				var selectedTo = this.byId("cbLevelTo").getSelectedItem().getKey();
				if (selectedFrom < selectedTo) {
					//MessageToast.show("OK");
					this.getView().byId("cbLevelFrom").setValueState("None");
					this.getView().byId("cbLevelFrom").setValueStateText("");
				} else {
					//MessageToast.show("GANTII");
					this.getView().byId("cbLevelFrom").setValueState("Error");
					this.getView().byId("cbLevelFrom").setValueStateText("Gol. From < Gol. To");
				}
			},
			/**
			 *@memberOf AL.ReleaseStrategy.controller.Addstrategy
			 */

			onAllDivision: function (oEvent) {
				//This code was generated by the layout editor.
				var chk = this.getView().byId("ckDivision").getSelected();
				if (chk === true) {
					this.getView().byId("cbDivision").setValue(null);
					this.getView().byId("cbDivision").setEditable(false);
				} else {
					this.getView().byId("cbDivision").setEditable(true);
				}
			},
			onAllDepartment: function (oEvent) {
				//This code was generated by the layout editor.
				var chk = this.getView().byId("ckDepartment").getSelected();
				if (chk === true) {
					this.getView().byId("cbDepartment").setValue(null);
					this.getView().byId("cbDepartment").setEditable(false);
				} else {
					this.getView().byId("cbDepartment").setEditable(true);
				}
			},
			onAllSection: function (oEvent) {
				//This code was generated by the layout editor.
				var chk = this.getView().byId("ckSection").getSelected();
				if (chk === true) {
					this.getView().byId("cbSection").setValue(null);
					this.getView().byId("cbSection").setEditable(false);
				} else {
					this.getView().byId("cbSection").setEditable(true);
				}
			},
			onChangeDocType: function (oEvent) {
				var selectedDocType = this.byId("cbDocType").getSelectedItem().getKey();
				//MessageToast.show(selectedDocType);

				if (selectedDocType == "23" || selectedDocType == "22" || selectedDocType == "24") {
					this.byId("elFromTo").setVisible(true);
				} else {
					this.byId("elFromTo").setVisible(false);
					this.byId("cbFromTo").setValue("");
				}
			},
			onChangeBusiness: function (oEvent) {
				var selectedBusiness = this.byId("cbBusiness").getSelectedItem().getKey();
				//MessageToast.show(selectedBusiness);
				this.byId("cbUnit").setEnabled(true);

				var oFilter = new sap.ui.model.Filter("Busns", sap.ui.model.FilterOperator.EQ, selectedBusiness);
				this.getView().byId("cbUnit").getBinding("items").filter(oFilter, FilterType.Application);

			},
			onChangeUnit: function (oEvent) {
				var selectedUnit = this.byId("cbUnit").getSelectedItem().getKey();
				//	MessageToast.show(selectedUnit);
				this.byId("cbDivision").setEnabled(true);
				this.byId("ckDivision").setEnabled(true);
				var oFilter = new sap.ui.model.Filter("Z12abbr", sap.ui.model.FilterOperator.EQ, selectedUnit);
				this.getView().byId("cbDivision").getBinding("items").filter(oFilter, FilterType.Application);

				//hapus existed value 
				this.byId("cbDivision").setValue("");
				this.byId("cbDepartment").setValue("");
				this.byId("cbSection").setValue("");
			},
			onChangeDivision: function (oEvent) {
				var selectedUnit = this.byId("cbUnit").getSelectedItem().getKey();
				var selectedDivision = this.byId("cbDivision").getSelectedItem().getKey();
				//MessageToast.show(selectedDivision + selectedUnit);
				this.byId("cbDepartment").setEnabled(true);
				this.byId("ckDepartment").setEnabled(true);

				var oFilter = new Filter({
					filters: [
						new Filter("Z12abbr", FilterOperator.EQ, selectedUnit),
						new Filter("Z34abbr", FilterOperator.EQ, selectedDivision)
					],
					and: true
				});

				this.getView().byId("cbDepartment").getBinding("items").filter(oFilter);
				this.byId("cbDepartment").setValue("");
				this.byId("cbSection").setValue("");
			},
			onChangeDepartment: function (oEvent) {
				var selectedDepartment = this.byId("cbDepartment").getSelectedItem().getKey();
				var selectedUnit = this.byId("cbUnit").getSelectedItem().getKey();
				var selectedDivision = this.byId("cbDivision").getSelectedItem().getKey();
				//MessageToast.show(selectedDivision + selectedUnit + selectedDepartment);
				this.byId("cbSection").setEnabled(true);
				this.byId("ckSection").setEnabled(true);

				var oFilter = new Filter({
					filters: [
						new Filter("Z12abbr", FilterOperator.EQ, selectedUnit),
						new Filter("Z34abbr", FilterOperator.EQ, selectedDivision),
						new Filter("Z56abbr", FilterOperator.EQ, selectedDepartment)
					],
					and: true
				});

				this.getView().byId("cbSection").getBinding("items").filter(oFilter);
				this.byId("cbSection").setValue("");
			},
			onSave: function (oEvent) {
				// var oBindingContext = oEvent.getSource().getBindingContext();
				// return new Promise(function (fnResolve) {
				// 	this.doNavigate("ReleaseStrategy", oBindingContext, fnResolve, "");
				// }.bind(this)).catch(function (err) {
				// 	if (err !== undefined) {
				// 		MessageBox.error(err.message);
				// 	}
				// });
				if (!this.validasiHeader()) {
					var oDialog = this.byId("BusyDialog");
					//oDialog.open();
					var iRscode = this.getView().byId("iRscode").getValue();
					var iRstxt = this.getView().byId("iRstxt").getValue();
					var cbCode = this.getView().byId("cbCode").getSelectedKey();
					var iLimit = this.getView().byId("iLimit").getValue();
					var cbRequester = this.getView().byId("cbRequester").getSelectedKeys();
					var cbDocType = this.getView().byId("cbDocType").getSelectedKey();
					var cbBusiness = this.getView().byId("cbBusiness").getSelectedKey();
					var cbUnit = this.getView().byId("cbUnit").getSelectedKey();
					var cbFromTo = this.getView().byId("cbFromTo").getSelectedKey();
					var cbDivision = this.getView().byId("cbDivision").getSelectedKey();
					var cbDepartment = this.getView().byId("cbDepartment").getSelectedKey();
					var cbSection = this.getView().byId("cbSection").getSelectedKey();
					var cbLevelFrom = this.getView().byId("cbLevelFrom").getSelectedKey();
					var cbLevelTo = this.getView().byId("cbLevelTo").getSelectedKey();
					var cbFromTo = this.getView().byId("cbFromTo").getSelectedKey();

					//checkbox value
					var ckDivision = this.getView().byId("ckDivision").getSelected();
					var ckDepartment = this.getView().byId("ckDepartment").getSelected();
					var ckSection = this.getView().byId("ckSection").getSelected();
					//if checkbox all
					if (ckDivision) {
						cbDivision = "All";
					}
					if (ckDepartment) {
						cbDepartment = "All";
					}
					if (ckSection) {
						cbSection = "All";
					}

					//assign value to items
					var Strategytoapprvalnav = [];
					for (var i = 1; i <= 10; i++) {
						var cbLvl = this.getView().byId("cbLvl" + i).getSelectedKeys();
						var cbNtf = this.getView().byId("cbNtf" + i).getSelectedKeys();
						var level = {
							"Rscode": iRscode,
							"Levl": i.toString(),
							"Apprv1": cbLvl[0],
							"Apprv2": cbLvl[1],
							"Apprv3": cbLvl[2],
							"Notif1": cbNtf[0],
							"Notif2": cbNtf[1],
							"Notif3": cbNtf[2],
							"Notif4": cbNtf[3],
							"Notif5": cbNtf[4]

						};
						Strategytoapprvalnav.push(level);
					}
					var releaseStrategy = {
						"Doctype": cbDocType,
						"ChangeInd": "I",
						"Rscode": iRscode,
						"Fromto": cbFromTo,
						"Rstxt": iRstxt,
						"Rccode": cbCode,
						"Req1": cbRequester[0],
						"Limit": iLimit,
						"Req2": cbRequester[1],
						"Req3": cbRequester[2],
						"Busns": cbBusiness,
						"Unit": cbUnit,
						"Div": cbDivision,
						"Dept": cbDepartment,
						"Sctn": cbSection,
						"Perskfr": cbLevelFrom,
						"Perskto": cbLevelTo,
						"Strategytoapprvalnav": Strategytoapprvalnav
					};

					this.oModel.setHeaders({
						"X-Requested-With": "X",
						"Content-Type": "application/json"
					});

					//set model to this view
					this.getView().setModel(this.oModel);
					this.oModel.create("/ReleaseStrategySet", releaseStrategy, {
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
				this.getView().byId("iRscode").setValue("");
				this.getView().byId("iRstxt").setValue("");
				this.getView().byId("iLimit").setValue("");
				this.getView().byId("cbCode").setValue("");
				this.getView().byId("cbRequester").setSelectedKeys(null);
				this.getView().byId("cbDocType").setValue("");
				this.getView().byId("cbBusiness").setValue("");
				this.getView().byId("cbUnit").setValue("");
				this.getView().byId("cbFromTo").setValue("");
				this.getView().byId("cbDivision").setValue("");
				this.getView().byId("cbDepartment").setValue("");
				this.getView().byId("cbSection").setValue("");
				this.getView().byId("cbLevelFrom").setValue("");
				this.getView().byId("cbLevelTo").setValue("");
				for (var i = 1; i <= 10; i++) {
					this.getView().byId("cbLvl" + i).setSelectedKeys(null);
					this.getView().byId("cbNtf" + i).setSelectedKeys(null);
				}

			},
			navBack: function () {
				this.oRouter.navTo("ReleaseStrategy", true);

			}
		});

	}, /* bExport= */
	true);