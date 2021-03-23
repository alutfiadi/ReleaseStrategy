/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"AL/ReleaseStrategy/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});