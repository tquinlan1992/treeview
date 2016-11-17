const app = angular.module('treeview', [ //jshint ignore:line

]);

app.component("treeviewComponentBase", require("./treeviewComponent/component"));

app.directive("treeviewComponent", () => {
    return {
        restrict: "E",
        scope: {
            data: '='
        },
        template: '<div ng-if="data"><treeview-component-base data="data"></treeview-component-base></div>',
        controller: function () {
            "ngInject";
        }
    };
});


module.exports = "treeview";
