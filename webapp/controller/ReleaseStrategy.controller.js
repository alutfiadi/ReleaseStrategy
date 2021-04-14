sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, MessageBox, Utilities, History, JSONModel, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("AL.ReleaseStrategy.controller.ReleaseStrategy", {
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
		_onOverflowToolbarButtonPress: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("Addstrategy", oBindingContext, fnResolve, "");
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
		_onRowPress: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("Editstrategy", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onOverflowToolbarButtonPress1: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("Addcode_1", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},

		_onOverflowToolbarButtonPress2: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("Addgroup_1", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onRowPress2: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("EditGroup", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		rsText: function (code) {
			var text = "";
			if (code == "21") {
				text = "Internal 1 PT";
			} else if (code == "22") {
				text = "Internal Antar PT";
			} else if (code == "23") {
				text = "Eksternal 1 PT";
			} else if (code == "24") {
				text = "Eksternal Antar PT";
			} else if (code == "B1") {
				text = "Antar Section";
			} else if (code == "Z6") {
				text = "Pengunduran Diri Normal";
			} else if (code == "62") {
				text = "Pensiun";
			} else if (code == "C1") {
				text = "Kelengkapan Data Unit";
			} else if (code == "C2") {
				text = "Kelengkapan Data HO";
			} else if (code == "Z1") {
				text = "Promosi";
			} else if (code == "41") {
				text = "Demosi";
			} else if (code == "E1") {
				text = "Change Personal Data";
			} else if (code == "E2") {
				text = "Change Data Agama";
			}
			return text;
		},
		onInit: function () {

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("ReleaseStrategy").attachDisplay(jQuery.proxy(this._onObjectMatched, this));

			//callodata
			// var that = this;
			// var sUrl = "/sap/opu/odata/sap/ZHCM_WF_ENGINE_SRV/";
			// var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
			// this.getView().setModel(oModel);
			// oModel.read("/ReleaseGroupSet",
			// 	null, null, true,
			// 	function (oData, oReponse) {
			// 		var arrayData = oData.results;
			// 		var jsondata = {
			// 			items: arrayData
			// 		};
			// 		var jsonModel = new sap.ui.model.json.JSONModel();
			// 		//jsonModel.setSizeLimit(1000);
			// 		jsonModel.setData(jsondata);

			// 		//Level
			// 		var tableGroup = that.byId("tRgroup");
			// 		tableGroup.setModel(jsonModel, "jReleaseGroup");
			// 	},
			// 	function (error) {
			// 		//if the call to odata fails, handle the error here
			// 	}
			// );

		},
		_onObjectMatched: function (oEvent) {
			var oModel = this.getView().getModel("ReleaseStrategy");

			//----
			oModel.refresh();
			// oModelText.refresh();
			
			var aFilter =[];
			this.loadTableData("oModelText", aFilter, "tab1");

			//Define Model Table2
			// var oThis = this;
			// var oModelText = new sap.ui.model.json.JSONModel();
			// // this.getView().setModel(oModelEdu);
			// // this.getView().setModel(oModelText, "Text");
			// this.getView().setModel(oModelText, "oModelText");
			// //read education data 
			// oModel.read("/ReleaseStrategySet", {
			// 	success: function (oData, response) {
			// 		var odataResults = oData.results;
			// 		for (var i = 0; i < odataResults.length; i++) {
			// 			//get rctext
			// 			var text = oThis.rsText(odataResults[i].Doctype);
			// 			odataResults[i].DTDesc = text;

			// 			//get from to text
			// 			var fromto = odataResults[i].Fromto;
			// 			if (fromto == "01" || fromto == "1") {
			// 				odataResults[i].Fromto = "[From]";
			// 			} else if (fromto == "02" || fromto == "2") {
			// 				odataResults[i].Fromto = "[To]";
			// 			}

			// 		}
			// 		oModelText.setData(odataResults);
			// 		// oThis.getView().setModel(oModelText, "oModelText");
			// 		// console.log(odataResults);
			// 		// oModelText.setData(odataResults);
			// 	},
			// 	error: function (oError) {

			// 	}

			// });

			// console.log(oThis.getView().getModel("oModelText"));
		},

		onExit: function () {

			// to destroy templates for bound aggregations when templateShareable is true on exit to prevent duplicateId issue
			var aControls = [{
				"controlId": "sap_Worklist_Page_0-content-sap_m_IconTabBar-1-items-sap_m_IconTabFilter-1613374626206-content-build_simple_Table-1",
				"groups": ["items"]
			}, {
				"controlId": "sap_Worklist_Page_0-content-sap_m_IconTabBar-1-items-sap_m_IconTabFilter-2-content-build_simple_Table-1613374517185",
				"groups": ["items"]
			}, {
				"controlId": "sap_Worklist_Page_0-content-sap_m_IconTabBar-1-items-sap_m_IconTabFilter-3-content-build_simple_Table-1",
				"groups": ["items"]
			}];
			for (var i = 0; i < aControls.length; i++) {
				var oControl = this.getView().byId(aControls[i].controlId);
				if (oControl) {
					for (var j = 0; j < aControls[i].groups.length; j++) {
						var sAggregationName = aControls[i].groups[j];
						var oBindingInfo = oControl.getBindingInfo(sAggregationName);
						if (oBindingInfo) {
							var oTemplate = oBindingInfo.template;
							oTemplate.destroy();
						}
					}
				}
			}

		},

		navigateGroupDetails: function (oEvent) {
			var context = oEvent.getSource();
			var contextdetail = context.getBindingContext("ReleaseStrategy").getPath().substr(1);
			//	var data = contextdetail.getProperty("PONO");
			//	MessageToast.show(data);
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("EditGroup", {
				rgPath: encodeURIComponent(contextdetail)
			});
		},

		navigateCodeDetails: function (oEvent) {

			var context = oEvent.getSource();
			var contextdetail = context.getBindingContext("ReleaseStrategy").getPath().substr(1);
			//	var data = contextdetail.getProperty("PONO");
			//	MessageToast.show(data);
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Editcode", {
				rcPath: encodeURIComponent(contextdetail)
			});

		},
		navigateReleaseDetails: function (oEvent) {

			var context = oEvent.getSource();
			var contextdetail = context.getBindingContext("ReleaseStrategy").getPath().substr(1);
			//	var data = contextdetail.getProperty("PONO");
			//	MessageToast.show(data);
			var selectedObject = oEvent.getSource().getBindingContext("ReleaseStrategy").getObject();
			var oModel = new sap.ui.model.json.JSONModel(selectedObject);
			sap.ui.getCore().setModel(oModel, "passSelectedData");

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Editstrategy", {
				rsPath: encodeURIComponent(contextdetail)
			});

		},
		navigateReleaseDetails2: function (oEvent) {

			var context = oEvent.getSource();
			var contextdetail = context.getBindingContext("oModelText").getPath().substr(1);
			//	var data = contextdetail.getProperty("PONO");
			//	MessageToast.show(data);
			var selectedObject = oEvent.getSource().getBindingContext("oModelText").getObject();
			var oModel = new sap.ui.model.json.JSONModel(selectedObject);
			sap.ui.getCore().setModel(oModel, "passSelectedData");

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Editstrategy", {
				rsPath: encodeURIComponent(contextdetail)
			});

		},
		Change: function (oEvent) {

			var oTable = this.getView().byId("tRgroup");
			var searchText = oEvent.getParameter("query");
			var filters = [];
			if (searchText != "") {
				var filter1 = new sap.ui.model.Filter({
					path: "Rgcode",
					operator: sap.ui.model.FilterOperator.Contains,
					value1: searchText
				});
				var filter2 = new sap.ui.model.Filter({
					path: "Rgtxt",
					operator: sap.ui.model.FilterOperator.Contains,
					value1: searchText
				});
				filters = [filter1, filter2];
				var finalFilter = new sap.ui.model.Filter({
					filters: filters,
					and: false
				});
				oTable.getBinding("items").filter(finalFilter, sap.ui.model.FilterType.Application);
			} else {
				oTable.getBinding("items").filter([], sap.ui.model.FilterType.Application);
			}

		},
		onFilterGroups: function (oEvent) {

			// build filter array
			var aFilter = [];
			var sQuery = oEvent.getParameter("query");
			if (sQuery) {
				aFilter.push(new Filter("Rgcode", FilterOperator.Contains, sQuery));
				aFilter.push(new Filter("Rgtxt", FilterOperator.Contains, sQuery));
			}

			// filter binding
			var oList = this.getView().byId("tRgroup");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);

		},
		onFilterCodes: function (oEvent) {

			// build filter array
			var aFilter = [];
			var sQuery = oEvent.getParameter("query");
			if (sQuery) {
				aFilter.push(new Filter("Rccode", FilterOperator.Contains, sQuery));
				aFilter.push(new Filter("Rctxt", FilterOperator.Contains, sQuery));
			}

			// filter binding
			var oList = this.getView().byId("tRcode");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);

		},
		onFilterStrategy: function (oEvent) {

			// build filter array
			var aFilter = [];
			var sQuery = oEvent.getParameter("query");
			if (sQuery) {
				aFilter.push(new Filter("Rscode", FilterOperator.Contains, sQuery));
				aFilter.push(new Filter("Rstxt", FilterOperator.Contains, sQuery));
			}

			// filter binding
			var oList = this.getView().byId("tReleaseStrategy");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);

		},
		onFilterStrategy2: function (oEvent) {

			// build filter array
			var aFilter = [];
			var sQuery = oEvent.getParameter("query");
			if (sQuery) {
				aFilter.push(new Filter("Rscode", FilterOperator.Contains, sQuery));
				aFilter.push(new Filter("Rstxt", FilterOperator.Contains, sQuery));
			}

			// filter binding
			// var oList = this.getView().byId("t2ReleaseStrategy");
			// var oBinding = oList.getBinding("items");
			// oBinding.filter(aFilter);

			//--------------------------
			// var sQuery = oEvent.getSource().getValue();
			// var aFilter1 = [];
			// aFilter1.push(this.getInitialFiltertab1());
			// aFilter1.push(this.getSearchFilters(sQuery));
			this.loadTableData("oModelText", aFilter, "tab1");

		},
		loadTableData: function (oModelName, filter, tabId) {
			//console.log("Load Table Data..");
			var oDialog = this.byId("BusyDialog");
			oDialog.open();
			var oModelName = oModelName;
			var aFilter = [];
			var oTab = tabId;
			aFilter = filter;
			//console.log("Load Table "+oModelName);
			//Read Section	
			// var oThis = sap.ui.getCore();
			var oThis = this;
			var sUrl = "/sap/opu/odata/sap/ZHCM_WF_ENGINE_SRV/";
			var oModel = new sap.ui.model.odata.ODataModel(sUrl);
			oModel.read("/ReleaseStrategySet", {
				success: function (oData) { /* do something */
					// console.log("oData result : ");
					// console.log(oData.results[0]);
					var odataResults = oData.results;
					// console.log("odata results : ");
					// console.log(odataResults);
					// oThis.getView().byId(oTab).setCount(odataResults.length);
					if (oTab == "tab1") {
						for (var i = 0; i < odataResults.length; i++) {
							//get rctext
							var text = oThis.rsText(odataResults[i].Doctype);
							odataResults[i].DTDesc = text;

							//get from to text
							var fromto = odataResults[i].Fromto;
							if (fromto == "01" || fromto == "1") {
								odataResults[i].Fromto = "[From]";
							} else if (fromto == "02" || fromto == "2") {
								odataResults[i].Fromto = "[To]";
							}

						}
					}

					// oModelText.setData(odataResults);
					var oModel = new sap.ui.model.json.JSONModel(odataResults);
					oThis.getView().setModel(oModel, oModelName);
					oDialog.close();
					// console.log("oModel : ");
					// console.log(oModel);
				},
				error: function (oError) { /* do something */
					oDialog.close();
					MessageBox.error("No data found, check your connection and refresh the browser.");
					//console.log("Cannot load "+oModelName+", check your connection and refresh the browser.");
				},
				filters: aFilter
			});
		},

	});
}, /* bExport= */ true);