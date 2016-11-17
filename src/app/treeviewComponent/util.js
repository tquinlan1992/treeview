const _ = require("./modularLodash");

class NodeUtil {

    constructor() {

    }

    initNodes(nodes, expandChildren, checkedLeavesArray, uncheckedLeavesArray, scopeId) {
        if (_.get(checkedLeavesArray, "length")) {
            this.performFuntionOnIds(nodes, checkedLeavesArray, node => {
                if (this.isNodeALeaf(node)) {
                    node.checked = true;
                }
            });
        }
        if (_.get(uncheckedLeavesArray, "length") || uncheckedLeavesArray === true) {
            this.performFunctionOnAllNodes(nodes, node => {
                if (this.isNodeALeaf(node)) {
                    node.checked = false;
                }
            });
            this.findNodeAndEdit(nodes, {
                id: scopeId
            }, node => {
                if (!this.isNodeALeaf(node)) {
                    this.performFunctionOnAllNodes(node.children, node => {
                        if (this.isNodeALeaf(node)) {
                            node.checked = _.includes(uncheckedLeavesArray, node.id) ? false : true;
                        }
                    });
                } else {
                    node.checked = true;
                }
            });
        }

        if (!_.get(checkedLeavesArray, "length") && !_.get(uncheckedLeavesArray, "length") && uncheckedLeavesArray !== true) {
            this.performFunctionOnAllNodes(nodes, node => {
                if (this.isNodeALeaf(node)) {
                    node.checked = true;
                }
            });
        }
        return this.initNodesRecursively(nodes, expandChildren);
    }

    // Mark nodes with necesarry properties
    initNodesRecursively(nodes, expandChildren) {
        _.forEach(nodes, node => {
            _.assign(node, {
                checked: !_.isNil(node.checked) ? node.checked : false,
                showChildren: !_.isNil(node.showChildren) ? node.showChildren : expandChildren,
                selectedScope: false,
                availableCheckbox: false,
                showNode: true,
                ableToToggleCheckbox: true,
                ableToToggleScope: true
            });

            if (node.children) {
                this.initNodesRecursively(node.children, expandChildren);
            }
        });
        return nodes;
    }

    isNodeALeaf(node) {
        return !_.get(node, "children.length");
    }

    // find node in tree and apply function to it
    findNodeAndEdit(nodes, objectToFind, callback) {
        if (objectToFind) {
            const foundNodeIndex = _.findIndex(nodes, objectToFind);
            if (foundNodeIndex > -1) {
                callback(nodes[foundNodeIndex], nodes);
            }
            return _.forEach(nodes, node => {
                if (node.children) {
                    this.findNodeAndEdit(node.children, objectToFind, callback);
                }
            });
        }
    }

    // Climp down nodes to check to if any children should be checked
    checkAllChildren(children, checkBoolean) {
        _.forEach(children, _.bind(child => {
            child.checked = checkBoolean;
            if (child.children) {
                this.checkAllChildren(child.children, checkBoolean);
            }
        }, this));
    }

    // Check if all of a node's children are checked
    allChildrenChecked(children) {
        return !!children && _.filter(children, {
            checked: true
        }).length === children.length;
    }

    // Climp up nodes to check to if any parents should be checked
    checkAllParents(nodes) {
        return _.forEach(nodes, node => {
            if (!node.checked) {
                if (this.allChildrenChecked(node.children)) {
                    node.checked = true;
                    return true;
                } else {
                    if (this.checkAllParents(node.children)) {
                        node.checked = !!this.allChildrenChecked(node.children);
                    }
                }
            }
        });
    }

    // Climp up nodes to check to if any parents should be unchecked
    uncheckAllParents(nodes) {
        return _.forEach(nodes, node => {
            if (node.checked) {
                if (node.children && !this.allChildrenChecked(node.children)) {
                    node.checked = false;
                    return true;
                } else {
                    if (this.uncheckAllParents(node.children)) {
                        node.checked = !!this.allChildrenChecked(node.children);
                    }
                }
            } else {
                if (node.children) {
                    return this.uncheckAllParents(node.children);
                }
            }
        });
    }

    // Mark nodes who have children with at least one child checked but not all children all checked
    determineIndeterminates(nodes) {
        return _.forEach(nodes, node => {
            if (node.children) {
                node.indeterminate = this.determineIndeterminates(node.children);
            }
            node.indeterminate = !!this.isIndeterminate(node.children);
        });
    }

    // Determine if a node has at least one child checked but not all of their children checked
    isIndeterminate(children) {
        if (children) {
            const numberOfChildrenChecked = _.filter(children, {
                checked: true
            }).length;
            return !!(_.find(children, {
                indeterminate: true
            }) || (numberOfChildrenChecked && (numberOfChildrenChecked !== children.length)));
        }
    }

    performFuntionOnIds(nodes, nodeIds, functionToPerform) {
        _.forEach(nodeIds, nodeId => {
            this.findNodeAndEdit(nodes, {
                id: nodeId
            }, node => {
                functionToPerform(node);
            });
        });
    }

    getAllNodesBasedOnCondition(nodes, condition, matchingNodes) {
        matchingNodes = matchingNodes || [];
        _.forEach(nodes, node => {
            if (condition(node)) {
                matchingNodes.push(node);
            }
            if (node.children) {
                this.getAllNodesBasedOnCondition(node.children, condition, matchingNodes);
            }
        });
        return matchingNodes;
    }

    getAllPossibleScopeIds(nodes) {
        return _.map(this.getAllNodesBasedOnCondition(nodes, node => {
            return node.possibleToBeSelectedScope;
        }), "id");
    }

    getLowestPossibleScopeId(nodes) {
        return _.last(this.getAllPossibleScopeIds(nodes));
    }

    getAllCheckedLeaves(nodes) {
        return _.map(this.getAllNodesBasedOnCondition(nodes, node => {
            return this.isNodeALeaf(node) && node.checked;
        }), leaf => {
            return _.pick(leaf, ["id", "text"]);
        });
    }

    getAllUncheckedLeaves(nodes, scopeId) {
        let uncheckedLeaves = [];
        this.findNodeAndEdit(nodes, {
            id: scopeId
        }, node => {
            if (node.children) {
                uncheckedLeaves = this.getAllNodesBasedOnCondition(node.children, node => {
                    return this.isNodeALeaf(node) && !node.checked;
                });
            }
        });
        return _.map(uncheckedLeaves, leaf => {
            return _.pick(leaf, ["id", "text"]);
        });
    }

    selectSelectedScope(nodes, selectedScopeId) {
        this.findNodeAndEdit(nodes, {
            id: selectedScopeId
        }, node => {
            node.selectedScope = true;
        });
    }

    determineSelectedScope(nodes, selectedScopeId) {
        if (!_.isNil(selectedScopeId)) {
            this.selectSelectedScope(nodes, selectedScopeId);
        }
    }

    performFunctionOnAllNodes(nodes, functionToPerform) {
        _.forEach(nodes, node => {
            const stopIteration = functionToPerform(node);
            if (!stopIteration && node.children) {
                this.performFunctionOnAllNodes(node.children, functionToPerform);
            }
        });
    }

    recursiveValidateScopeIds(nodes) {
        const otherSiblingsCheckedOrHaveGrandChildrenChecked = (_.concat(_.filter(nodes, {
            indeterminate: true
        }), _.filter(nodes, {
            checked: true
        })).length < 2);
        if (!otherSiblingsCheckedOrHaveGrandChildrenChecked) {
            return;
        }
        _.forEach(nodes, node => {
            if (node.indeterminate || node.checked) {
                if (otherSiblingsCheckedOrHaveGrandChildrenChecked) {
                    node.possibleToBeSelectedScope = true;
                    if (node.children) {
                        this.recursiveValidateScopeIds(node.children);
                    }
                }
            }
        });
    }

    validatePossibleScopeIds(nodes, highestPossibleScopeId) {
        this.performFunctionOnAllNodes(nodes, node => {
            node.possibleToBeSelectedScope = false;
        });
        this.findNodeAndEdit(nodes, {
            id: highestPossibleScopeId
        }, (node, siblings) => {
            this.recursiveValidateScopeIds(siblings);
        });
    }

    validateAvailabeCheckboxes(nodes, highestAvailableNodeId) {
        this.findNodeAndEdit(nodes, {
            id: highestAvailableNodeId
        }, node => {
            node.availableCheckbox = true;
            this.performFunctionOnAllNodes(node.children, node => {
                node.availableCheckbox = true;
            });
        });
    }

    expandToHighestPossibleBasedOnObject(nodes, objectToValidateChildren) {
        function validateChildren(children) {
            return _.filter(children, objectToValidateChildren).length;
        }
        let validate = false;
        _.forEach(nodes, node => {
            if (node.children) {
                if (validateChildren(node.children)) {
                    node.showChildren = true;
                    validate = true;
                }
                if (this.expandToHighestPossibleBasedOnObject(node.children, objectToValidateChildren)) {
                    node.showChildren = true;
                    validate = true;
                }

            }
        });
        return validate;
    }

    expandToHighestPossibleScopeId(nodes) {
        this.expandToHighestPossibleBasedOnObject(nodes, {
            possibleToBeSelectedScope: true
        });
    }

    expandChildrenToLowestChecked(nodes) {
        this.expandToHighestPossibleBasedOnObject(nodes, {
            checked: true
        });
    }

    callPassedInFunction(boundThis, functionName, ...args) {
        const functionToCall = _.get(boundThis, functionName);
        if (!!functionToCall) {
            functionToCall(...args);
        }
    }

    hideUnavailableChecbkoxNodes(nodes) {
        this.performFunctionOnAllNodes(nodes, node => {
            if (!node.availableCheckbox) {
                node.showNode = false;
            }
        });
    }

    setAbleToToggleCheckbox(nodes, boolean) {
        this.performFunctionOnAllNodes(nodes, node => {
            node.ableToToggleCheckbox = boolean;
        });
    }

    setAbleToToggleScope(nodes, boolean) {
        this.performFunctionOnAllNodes(nodes, node => {
            node.ableToToggleScope = boolean;
        });
    }

    checkIfHighestPossibleScopeLowerThanScopeId(nodes, highestPossibleScopeId, scopeId) {
        let highestPossibleScopeIdIsHigherEqualToScopeId = true;
        this.findNodeAndEdit(nodes, {
            id: scopeId
        }, node => {
            if (node.id !== highestPossibleScopeId) {
                if (node.children) {
                    this.performFunctionOnAllNodes(node.children, node => {
                        if (node.id === highestPossibleScopeId) {
                            highestPossibleScopeIdIsHigherEqualToScopeId = false;
                        }
                    });
                }
            }
        });
        return highestPossibleScopeIdIsHigherEqualToScopeId;
    }

    disableCheckboxToggleIfHighestPossibleScopeLowerThanScopeId(nodes, highestPossibleScopeId, scopeId) {
        if (!this.checkIfHighestPossibleScopeLowerThanScopeId(nodes, highestPossibleScopeId, scopeId)) {
            this.setAbleToToggleCheckbox(nodes, false);
        }
    }

    disableScopeToggleIfHighestPossibleScopeLowerThanScopeId(nodes, highestPossibleScopeId, scopeId) {
        if (!this.checkIfHighestPossibleScopeLowerThanScopeId(nodes, highestPossibleScopeId, scopeId)) {
            this.setAbleToToggleScope(nodes, false);
        }
    }

    mapNodesIdText(nodes, mapNodeIdText) {
        this.performFunctionOnAllNodes(nodes, node => {
            node.id = node[mapNodeIdText.id];
            node.text = node[mapNodeIdText.text];
        });
    }

    areAllChildrenExpanded(nodes) {
        let allChildrenExpanded = true;
        this.performFunctionOnAllNodes(nodes, node => {
            if (!this.isNodeALeaf(node) && !node.showChildren) {
                allChildrenExpanded = false;
                return true;
            }
        });
        return allChildrenExpanded;
    }

    hideNonInderterminateOrNotCheckedNodes(nodes) {
        this.performFunctionOnAllNodes(nodes, node => {
            if (!node.indeterminate && !node.checked) {
                node.showNode = false;
            }
        });
    }

    hideAllNodesCheckBoxes(nodes) {
        this.performFunctionOnAllNodes(nodes, node => {
            node.availableCheckbox = false;
        });
    }

    disableToggleScopeOnAllNodes(nodes) {
        this.performFunctionOnAllNodes(nodes, node => {
            node.ableToToggleScope = false;
        });
    }

    enableSelectNodes(nodes, selectedNodeId) {
        this.performFunctionOnAllNodes(nodes, node => {
            if (node.id !== selectedNodeId) {
                node.ableToSelectNode = true;
                node.selectedNode = false;
            } else {
                node.ableToSelectNode = false;
                node.selectedNode = true;
            }
        });
    }

}

module.exports = new NodeUtil();
