sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/m/MessageToast",
	"sap/m/Dialog",
	"sap/m/DialogType",
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/Label",
	"sap/m/Text"
], function (BaseController, MessageBox, Utilities, History, JSONModel, Filter, FilterOperator, FilterType, MessageToast, Dialog,
	DialogType, Button, ButtonType, Label, Text) {
	"use strict";

	return BaseController.extend("AL.ReleaseStrategy.controller.Editstrategy", {
		ReleaseStrategtyData: {},
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
		_onButtonPress: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("ReleaseStrategy", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

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
			// this.oRouter.getTarget("Editstrategy").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("Editstrategy").attachPatternMatched(this._onObjectMatched, this);

			var sUrl = "/sap/opu/odata/sap/ZHCM_WF_ENGINE_SRV/";
			this.oModel = new sap.ui.model.odata.ODataModel(sUrl, true);

			this.loadEmployees();

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

		loadEmployees: function () {
			var oDialog = this.byId("BusyDialog");
			oDialog.open();
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
		},
		_onObjectMatched: function (oEvent) {
			// this.getView().bindElement({
			// 	path: decodeURIComponent("/" + oEvent.getParameter("arguments").rsPath),
			// 	model: "ReleaseStrategy"
			// });

			// var accEbeln = this.getView().byId("Ebeln").getValue();
			// //var accEbelp = this.getView().byId("Ebelp").getValue();
			// var oFilter = new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.EQ, accEbeln);
			// this.getView().byId("listItems").getBinding("items").filter(oFilter);

			var selectedData = sap.ui.getCore().getModel("passSelectedData");
			this.getView().setModel(selectedData, "selectedReleaseStrategy");

			var oModel = sap.ui.getCore().getModel("passSelectedData");
			this.ReleaseStrategtyData = {
				"Rscode": oModel.oData.Rscode, //Release Strategy Code
				"Rstxt": oModel.oData.Rstxt, //Release Strategy Description
				"Limit": oModel.oData.Limit, //Time Limit
				"Massg": oModel.oData.Massg, //Document Type
				"Busns": oModel.oData.Busns, //Business Category
				"Unit": oModel.oData.Unit, //Unit
				"Div": oModel.oData.Div, //Division
				"Dept": oModel.oData.Dept, //Division
				"Sctn": oModel.oData.Sctn, //Section
				"Perskfr": oModel.oData.Perskfr, //Goloingan From
				"Perskto": oModel.oData.Perskto, //Golongan to
				"Fromto": oModel.oData.Fromto, // FRom To
				"Deleted": oModel.oData.Deleted // Delted
			};
			if (this.ReleaseStrategtyData.Div == "All") {
				this.getView().byId("ckDivision").setSelected(true);
				this.getView().byId("cbDivision").setEditable(false);
			} else {
				this.getView().byId("ckDivision").setSelected(false);
				this.getView().byId("cbDivision").setEditable(true);
			}
			if (this.ReleaseStrategtyData.Dept == "All") {
				this.getView().byId("ckDepartment").setSelected(true);
				this.getView().byId("cbDepartment").setEditable(false);
			} else {
				this.getView().byId("ckDepartment").setSelected(false);
				this.getView().byId("cbDepartment").setEditable(true);
			}
			if (this.ReleaseStrategtyData.Sctn == "All") {
				this.getView().byId("ckSection").setSelected(true);
				this.getView().byId("cbSection").setEditable(false);
			} else {
				this.getView().byId("ckSection").setSelected(false);
				this.getView().byId("cbSection").setEditable(true);
			}
			if (this.ReleaseStrategtyData.Fromto != "") {
				this.byId("elFromTo").setVisible(true);
			} else {
				this.byId("elFromTo").setVisible(false);
			}

			if (this.ReleaseStrategtyData.Deleted == "X") {
				this.getView().byId("ckDelete").setSelected(true);
				this.getView().byId("fdeleted").setVisible(true);
			} else {
				this.getView().byId("ckDelete").setSelected(false);
				this.getView().byId("fdeleted").setVisible(false);
			}
			//ISI PARTAMETER
			var oFilterBusiness = new sap.ui.model.Filter("Busns", sap.ui.model.FilterOperator.EQ, this.ReleaseStrategtyData.Busns);
			var oFilterUnit = new sap.ui.model.Filter("Z12abbr", sap.ui.model.FilterOperator.EQ, this.ReleaseStrategtyData.Unit);
			var oFilterDiv = new Filter("Z34abbr", FilterOperator.EQ, this.ReleaseStrategtyData.Div);
			var oFilterDept = new Filter("Z56abbr", FilterOperator.EQ, this.ReleaseStrategtyData.Dept);
			var oFilterRscode = new Filter("Rscode", FilterOperator.EQ, this.ReleaseStrategtyData.Rscode);

			this.getView().byId("cbUnit").getBinding("items").filter(oFilterBusiness, FilterType.Application);
			this.getView().byId("cbDivision").getBinding("items").filter(oFilterUnit, FilterType.Application);
			var oFilterDepartment = new Filter({
				filters: [
					oFilterUnit,
					oFilterDiv
				],
				and: true
			});
			this.getView().byId("cbDepartment").getBinding("items").filter(oFilterDepartment);

			var oFilterSection = new Filter({
				filters: [
					oFilterUnit,
					oFilterDiv,
					oFilterDept
				],
				and: true
			});

			this.getView().byId("cbSection").getBinding("items").filter(oFilterSection);

			//Call Odata Master data
			var sUrlApproval = "/sap/opu/odata/sap/ZHCM_WF_ENGINE_SRV/";
			var oModelApproval = new sap.ui.model.odata.ODataModel(sUrlApproval, true);
			var jModelApproval = new sap.ui.model.json.JSONModel();
			var that = this;
			oModelApproval.read("/ReleaseStrategyApprovalSet", {
				filters: [oFilterRscode],
				success: function (oData, response) {
					var oResults = oData.results;
					oResults.forEach(function (oValue, i) {
						// console.log("Value" + oValue);
						// console.log("i" + i);
						var j = i + 1;
						var cbLvl = [];
						cbLvl.push(oResults[i].Apprv1, oResults[i].Apprv2, oResults[i].Apprv3);
						that.getView().byId("cbLvl" + j).setSelectedKeys(cbLvl);

						//ntf
						var cbNtf = [];
						cbNtf.push(oResults[i].Notif1, oResults[i].Notif2, oResults[i].Notif3, oResults[i].Notif4, oResults[i].Notif5);
						that.getView().byId("cbNtf" + j).setSelectedKeys(cbNtf);
					});

					// jModelApproval.setData(oData.results);
					// sap.ui.getCore().setModel(jModelApproval, "jModelApproval");
				}
			});
			var Requester = [];
			Requester.push(oModel.oData.Req1, oModel.oData.Req2, oModel.oData.Req3);
			that.getView().byId("cbRequester").setSelectedKeys(Requester);

			//Call STATUS RS

			oModelApproval.read("/ReleaseStrategySet('" + this.ReleaseStrategtyData.Rscode + "')", {
				success: function (oData, response) {
					// var oResults = oData;
					var oModelSt = new sap.ui.model.json.JSONModel(oData);
					that.getView().setModel(oModelSt, "oStatus");
					if (oData.Deleted !== "X") {
						if (oData.Status !== "02" || oData.Status !== "01") {
							that.byId("bStatus").setVisible(true);
						}
					}else{
						that.byId("bStatus").setVisible(false);
					}

				}
			});
		},

		onChange: function (oEvent) {
			var selectedText = this.byId("cbCode").getSelectedItem().getAdditionalText();
			this.byId("cbGroup").setValue(selectedText);
			this.byId("elRgroup").setVisible(true);

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
				this.getView().byId("cbDivision").setSelectedKey("");
				this.getView().byId("cbDivision").setEditable(false);
				this.getView().byId("cbDepartment").setSelectedKey("");
				this.getView().byId("cbDepartment").setEditable(false);
				this.getView().byId("cbSection").setSelectedKey("");
				this.getView().byId("cbSection").setEditable(false);

				this.getView().byId("ckDepartment").setEditable(false);
				this.getView().byId("ckDepartment").setSelected(true);
				this.getView().byId("ckSection").setSelected(true);
			} else {
				this.getView().byId("cbDivision").setEditable(true);
				this.getView().byId("ckDepartment").setEditable(false);
				this.getView().byId("ckDepartment").setSelected(false);
				this.getView().byId("ckSection").setEditable(false);
				this.getView().byId("ckSection").setSelected(false);
			}
		},
		onAllDepartment: function (oEvent) {
			//This code was generated by the layout editor.
			var chk = this.getView().byId("ckDepartment").getSelected();
			if (chk === true) {
				this.getView().byId("cbDepartment").setSelectedKey("");
				this.getView().byId("cbDepartment").setEditable(false);
				this.getView().byId("cbSection").setSelectedKey("");
				this.getView().byId("cbSection").setEditable(false);
				this.getView().byId("ckSection").setSelected(true);
				this.getView().byId("ckSection").setSelected(false);
			} else {
				this.getView().byId("cbDepartment").setEditable(true);
				this.getView().byId("ckDepartment").setSelected(false);
				this.getView().byId("ckSection").setEditable(false);
				this.getView().byId("ckSection").setSelected(false);
			}
		},
		onAllSection: function (oEvent) {
			//This code was generated by the layout editor.
			var chk = this.getView().byId("ckSection").getSelected();
			if (chk === true) {
				this.getView().byId("cbSection").setSelectedKey("");
				this.getView().byId("cbSection").setEditable(false);
			} else {
				this.getView().byId("cbSection").setEditable(true);
				this.getView().byId("cbSection").setEnabled(true);
				// this.getSection();
			}
		},
		onChangeDocType: function (oEvent) {
			var selectedDocType = this.byId("cbDocType").getSelectedItem().getKey();
			//MessageToast.show(selectedDocType);

			if (selectedDocType == "23" || selectedDocType == "22" || selectedDocType == "24") {
				this.byId("elFromTo").setVisible(true);
			} else {
				this.byId("elFromTo").setVisible(false);
				this.byId("cbFromTo").setSelectedKey("");
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
			// this.byId("cbDivision").setEnabled(true);
			this.byId("cbDivision").setEditable(true);
			this.byId("ckDivision").setEditable(true);
			this.byId("ckDivision").setSelected(false);
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
			this.byId("cbDepartment").setEditable(true);
			// this.byId("cbDepartment").setEnabled(true);
			this.byId("ckDepartment").setEditable(true);
			this.byId("ckDepartment").setSelected(false);

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
			this.byId("cbSection").setEditable(true);
			// this.byId("cbSection").setEnabled(true);
			this.byId("ckSection").setEditable(true);
			this.byId("ckSection").setSelected(false);

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
		clearData: function () {
			this.getView().byId("iRscode").setValue("");
			this.getView().byId("iRstxt").setValue("");
			this.getView().byId("iLimit").setValue("");
			this.getView().byId("cbCode").setValue("");
			this.getView().byId("cbRequester").setValue("");
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
			this.getView().byId("ckDivision").setSelected(false);
			this.getView().byId("ckDepartment").setSelected(false);
			this.getView().byId("ckSection").setSelected(false);
			this.getView().byId("ckDelete").setSelected(false);
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

			//checkbox value
			var ckDivision = this.getView().byId("ckDivision").getSelected();
			var ckDepartment = this.getView().byId("ckDepartment").getSelected();
			var ckSection = this.getView().byId("ckSection").getSelected();
			var ckDelete = this.getView().byId("ckDelete").getSelected();
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
			if (ckSection) {
				ckDelete = "X";
			}else{
				ckDelete ="";
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
				"ChangeInd": "U",
				"Doctype": cbDocType,
				"Deleted": ckDelete,
				"Rctxt": "",
				"Status": "",
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
			var oThis = this;
			this.getView().setModel(this.oModel);
			this.oModel.create("/ReleaseStrategySet", releaseStrategy, {
				success: function (oData, oResponse) {
					// Success
					oDialog.close();
					MessageBox.success("Release Strategy " + iRscode + " Successfully Updated.", {
						onClose: function () {
							// 	// oThis.naviBack();
							oThis.clearData();
							oThis.navBack();
						}
					});
					// MessageToast.show("Change Successfully");
					// this.clearData();
					// this.navBack();
				}.bind(this),
				error: function (oError) {
					oDialog.close();
					//MESSAGE ODATA
					var message = JSON.parse(oError.response.body);
					//Log.info(message.error.message.value);
					MessageToast.show(message.error.message.value);
				}
			});
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

		navBack: function () {
			this.oRouter.navTo("ReleaseStrategy", true);

		},
		onApproveDialogPress: function () {
			var that = this;
			if (!this.oApproveDialog) {
				this.oApproveDialog = new Dialog({
					type: DialogType.Message,
					title: "Confirm",
					content: new Text({
						text: "Are you sure you  want  to delete Strategy " + this.ReleaseStrategtyData.Rscode + "?"
					}),
					beginButton: new Button({
						type: ButtonType.Reject,
						text: "Delete",
						press: function () {
							// MessageToast.show("Submit pressed!");
							that.onDelete(this.ReleaseStrategtyData.Rscode);
							this.oApproveDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: "Cancel",
						press: function () {
							this.oApproveDialog.close();
						}.bind(this)
					})
				});
			}

			this.oApproveDialog.open();
		},

		onDelete: function (oCode) {
			var that = this;
			var sUrl = "/sap/opu/odata/sap/ZHCM_WF_ENGINE_SRV/";
			this.oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
			this.oModel.remove("/ReleaseStrategySet('" + oCode + "')", {
				method: "DELETE",
				success: function (data) {
					MessageToast.show(oCode + " is Deleted");
					that.clearData();
					that.navBack();
				},
				error: function (e) {
					var message = JSON.parse(e.response.body);
					//Log.info(message.error.message.value);
					MessageToast.show(message.error.message.value);
				}
			});
		}

	});
}, /* bExport= */ true);