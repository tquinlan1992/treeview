const Treeview = require("./Treeview");
const _ = require("./modularLodash");

function createCSSFile(cssFileString) {
    return "<style>" + cssFileString + "</style>";
}

function createCSSHTMLString(cssString, htmlString) {
    return createCSSFile(cssString) + htmlString;
}

module.exports = {
    bindings: {
        data: "="
    },
    template: createCSSHTMLString(require("./templateCSS.js"), require("./templateHTML.js")),
    controller: function($timeout) {
        "ngInject";

        this.alerts = {};

        this.addAlertMessage = function(alertObject) {
            const alertObjectKey = _.keys(alertObject)[0];
            _.assign(this.alerts, alertObject);
            $timeout(() => {
                delete this.alerts[alertObjectKey];
            }, 5000);
        };

        this.setAlertFunctionFor = function(alertFunctionName, alertMessage) {
            const configuredAlertFunction = _.get(this.data, "alertFunctions." + alertFunctionName);
            if (configuredAlertFunction === true) {
                return _.bind(() => {
                    let alert = {};
                    alert[alertFunctionName] = alertMessage;
                    this.addAlertMessage(alert);
                }, this);
            }
            if (_.isFunction(configuredAlertFunction)) {
                return configuredAlertFunction;
            } else {
                return () => {

                };
            }
        };

        const alertFunctions = {
            toggleAsScope: this.setAlertFunctionFor("toggleAsScope", "selected as scope"),
            scopeNowInvalid: this.setAlertFunctionFor("scopeNowInvalid", "scope unselected because it's invalid now")
        };

        _.assign(this.data, {
            alertFunctions: alertFunctions
        });

        const clonedFunctionOnJSONChange = this.data.functionOnJSONChange;

        this.data.functionOnJSONChange = _.bind(function(newValue) {
                clonedFunctionOnJSONChange(newValue);
                this.toggleExpandAllChildrenText = newValue.areAllChildrenExpanded ? "collapseAllChildren" : "expandAllChildren";
                this.toggleExpandAllChildren = function() {
                    if (newValue.areAllChildrenExpanded) {
                        this.treeview.toggleExpandAllChildren(false);
                    } else {
                        this.treeview.toggleExpandAllChildren(true);
                    }
                };
        }, this);

        this.treeview = new Treeview(this.data);

        _.assign(this, {
            alwaysHaveScopeSelected: this.data.alwaysHaveScopeSelected,
            selectScopeColor: this.data.selectScopeColor || "blue",
            selectedScopeColor: this.data.selectedScopeColor || "green"
        });

        this.data.toJSON = this.treeview.toJSON;

        this.getResourceLabel = function(labelPath) {
                return _.get(this.data, "resourceLabels." + labelPath) || _.get(require("./resourceLabels.json"), labelPath);
        };
    }
};
