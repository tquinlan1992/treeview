const angular = require('angular');
const locations = require("./locations");



const app = angular.module('sample', [
    require("angular-material"),
    require("../app/app")
]);

app.controller("sampleController", function($scope, $timeout) {
    "ngInject";
    $scope.scopeTestVariable = "scopeTestVariable";

    $timeout(function() {
        $scope.treeviewData = {
            nodes: locations,
            expandChildren: false,
            expandChildrenToLowestChecked: true,
            expandToHighestPossibleScopeId: true,
            highestPossibleScopeId: "1",
            highestAvailableCheckboxId: "1",
            hideUnavailableChecbkoxNodes: true,
            disableCheckboxToggle: false,
            disableCheckboxToggleIfHighestPossibleScopeLowerThanScopeId: true,
            disableScopeToggle: false,
            disableScopeToggleIfHighestPossibleScopeLowerThanScopeId: true,
            selectedScope: "11",
            checkedLeavesArray: [],
            uncheckedLeavesArray: ["17", "23"],
            getAllUncheckedLeavesBasedOnScope: true,
            alwaysHaveScopeSelected: true,
            alertFunctions: {
                toggleAsScope: valid => {
                    console.log('valid sample toggleAsScope', valid);
                },
                scopeNowInvalid: true

            },
            functionOnJSONChange: newValue => {
                console.log("newJSONValue");
                console.log('newValue', newValue);
            },
            selectScopeColor: "#F5B041",
            selectedScopeColor: "#52BE80 ",
            onlyShowIndeterminateOrCheckedNodes: true,
            hideAllNodesCheckBoxes: true,
            disableToggleScopeOnAllNodes: true,
            enableSelectNodes: true
        };
    }, 50);

    $scope.logCheckedLeaves = function() {
        console.log('$scope.treeviewData.toJSON()', $scope.treeviewData.toJSON());
    };
});
