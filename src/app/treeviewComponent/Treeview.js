const _ = require("./modularLodash");
const util = require("./util");

class Treeview {

    // parameters
    // nodes: [{id, text, children, checked, indeterminate}]
    constructor(data) {
        data = _.clone(data);

        if (data.mapNodeIdText) {
            util.mapNodesIdText(data.nodes, data.mapNodeIdText);
        }

        _.assign(this, {
            checkedLeavesArray: data.checkedLeavesArray || [],
            selectedScope: !_.isNil(data.selectedScope) ? data.selectedScope : null,
            nodes: util.initNodes(data.nodes, data.expandChildren, data.checkedLeavesArray, data.uncheckedLeavesArray, data.selectedScope),
            alertFunctions: data.alertFunctions,
            highestPossibleScopeId: !_.isNil(data.highestPossibleScopeId) ? data.highestPossibleScopeId : null,
            functionOnJSONChange: data.functionOnJSONChange,
            alwaysHaveScopeSelected: data.alwaysHaveScopeSelected,
            selectedNode: data.selectedNode
        });

        util.checkAllParents(this.nodes);
        if (data.disableCheckboxToggle) {
            util.setAbleToToggleCheckbox(this.nodes, false);
        }
        if (!data.disableCheckboxToggle && data.disableCheckboxToggleIfHighestPossibleScopeLowerThanScopeId) {
            util.disableCheckboxToggleIfHighestPossibleScopeLowerThanScopeId(this.nodes, data.highestPossibleScopeId, data.selectedScope);
        }
        if (data.disableScopeToggle) {
            util.setAbleToToggleScope(this.nodes, false);
        }
        if (!data.disableScopeToggle && data.disableScopeToggleIfHighestPossibleScopeLowerThanScopeId) {
            util.disableScopeToggleIfHighestPossibleScopeLowerThanScopeId(this.nodes, data.highestPossibleScopeId, data.selectedScope);
        }
        this.disableScopeToggle = data.disableScopeToggle;

        util.determineSelectedScope(this.nodes, data.selectedScope);
        util.determineIndeterminates(this.nodes, data.selectedScope);
        util.validateAvailabeCheckboxes(this.nodes, data.highestAvailableCheckboxId ? data.highestAvailableCheckboxId : this.nodes[0].id);
        if (data.hideUnavailableChecbkoxNodes) {
            util.hideUnavailableChecbkoxNodes(this.nodes);
        }
        util.validatePossibleScopeIds(this.nodes, this.highestPossibleScopeId);
        if (data.expandToHighestPossibleScopeId) {
            util.expandToHighestPossibleScopeId(this.nodes);
        }
        if (data.expandChildrenToLowestChecked) {
            util.expandChildrenToLowestChecked(this.nodes);
        }
        if (data.onlyShowIndeterminateOrCheckedNodes) {
            util.hideNonInderterminateOrNotCheckedNodes(this.nodes);
        }

        if (data.hideAllNodesCheckBoxes) {
            util.hideAllNodesCheckBoxes(this.nodes);
        }

        if (data.disableToggleScopeOnAllNodes) {
            util.disableToggleScopeOnAllNodes(this.nodes);
        }

        if (data.enableSelectNodes) {
            util.enableSelectNodes(this.nodes, data.selectedNodeId || data.selectedScope);
        }

        util.callPassedInFunction(this, "functionOnJSONChange", this.toJSON());
    }
    ToggleCheckbox(nodeId) {
        util.findNodeAndEdit(this.nodes, {
            id: nodeId
        }, _.bind(node => {
            if (node.ableToToggleCheckbox) {
                const checkBoolean = !node.checked;
                node.checked = checkBoolean;
                util.checkAllChildren(node.children, checkBoolean);
                if (checkBoolean) {
                    util.checkAllParents(this.nodes);
                }
                if (!checkBoolean) {
                    util.uncheckAllParents(this.nodes);
                }
                util.determineIndeterminates(this.nodes);
                util.validatePossibleScopeIds(this.nodes, this.highestPossibleScopeId);
                if (!_.isNil(this.selectedScope)) {
                    util.findNodeAndEdit(this.nodes, {
                        id: this.selectedScope
                    }, node => {
                        if (!node.possibleToBeSelectedScope) {
                            node.selectedScope = false;
                            this.selectedScope = null;
                            if (this.alwaysHaveScopeSelected) {
                                this.toggleAsScope(util.getLowestPossibleScopeId(this.nodes));
                            } else {
                                util.callPassedInFunction(this, "alertFunctions.scopeNowInvalid");
                            }
                        }
                    });
                } else {
                    this.toggleAsScope(util.getLowestPossibleScopeId(this.nodes));
                }
                util.callPassedInFunction(this, "functionOnJSONChange", this.toJSON());
            }
        }, this));
    }

    // toggle node show children property
    toggleShowChildren(nodeId) {
        util.findNodeAndEdit(this.nodes, {
            id: nodeId
        }, node => {
            node.showChildren = !node.showChildren;
        });
        util.callPassedInFunction(this, "functionOnJSONChange", this.toJSON());
    }
    toggleAsScope(nodeId) {
        util.findNodeAndEdit(this.nodes, {
            id: nodeId
        }, node => {
            if (this.alwaysHaveScopeSelected && node.id === this.selectedScope) {
                return;
            }
            if (node.ableToToggleCheckbox) {
                if (node.possibleToBeSelectedScope) {
                    util.performFunctionOnAllNodes(this.nodes, node => {
                        if (node.id !== nodeId) {
                            node.selectedScope = false;
                        }
                    });
                    node.selectedScope = !node.selectedScope;
                    this.selectedScope = node.selectedScope ? node.id : null;
                    util.callPassedInFunction(this, "alertFunctions.toggleAsScope", true);
                } else {
                    util.callPassedInFunction(this, "alertFunctions.toggleAsScope", false);
                }
                util.callPassedInFunction(this, "functionOnJSONChange", this.toJSON());
            }
        });
    }

    toggleExpandAllChildren(expandOrCollapse) {
        util.performFunctionOnAllNodes(this.nodes, node => {
            node.showChildren = expandOrCollapse;
        });
        util.callPassedInFunction(this, "functionOnJSONChange", this.toJSON());
    }

    selectNode(node) {
        this.selectedNode = _.pick(node, ["id", "text"]);
        util.enableSelectNodes(this.nodes, this.selectedNode.id);
        util.callPassedInFunction(this, "functionOnJSONChange", this.toJSON());
    }

    toJSON(...pick) {
        function inPick(pickString) {
            return !pick.length || _.includes(pick, pickString);
        }
        let json = inPick("nodes") ? _.pick(this, ["nodes"]) : null;
        _.assign(json, {
            checkedLeavesArray: inPick("checkedLeavesArray") ? util.getAllCheckedLeaves(this.nodes) : null,
            uncheckedLeavesArray: inPick("uncheckedLeavesArray") ? util.getAllUncheckedLeaves(this.nodes, this.selectedScope) : null,
            selectedScope: inPick("selectedScope") ? this.selectedScope : null,
            areAllChildrenExpanded: inPick("allChildrenChecked") ? util.areAllChildrenExpanded(this.nodes) : null,
            selectedNode: inPick("selectedNode") ? this.selectedNode || null : null
        });

        return json;
    }
}

module.exports = Treeview;
