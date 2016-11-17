module.exports = ''+
'<script type="text/ng-template" id="treeviewGroup">'+
				'<div ng-if="node.showNode">'+
				'<div class="toggleChildren pointer" ng-click="$ctrl.treeview.toggleShowChildren(node.id)">'+
								'<span ng-if="node.children" class="treeviewComponentNoFocusBorder">'+
								'<i ng-class="node.showChildren ? \'fa-minus\' : \'fa-plus\'" class="fa" aria-hidden="true"></i>'+
				'</span>'+
				'</div>'+
				'<div class="checkboxDiv" ng-if="node.availableCheckbox">'+
								'<md-checkbox ng-checked="node.checked" ng-click="$ctrl.treeview.ToggleCheckbox(node.id)" md-indeterminate="node.indeterminate && !node.checked" aria-label="{{node.text}}" ng-class="node.selectedScope ? \'selectedScope\' : \'\';"'+
												'class="treeviewComponentNoFocusBorder">'+
								'</md-checkbox>'+
				'</div>'+
				'<span ng-class="node.availableCheckbox ? \'pointer\' : \'\'" class="ToggleCheckbox" ng-click="node.availableCheckbox ? $ctrl.treeview.ToggleCheckbox(node.id) : null">{{node.text}}</span>'+
				'<a ng-if="node.ableToToggleScope" ng-class="(!$ctrl.alwaysHaveScopeSelected || !node.selectedScope) ? \'pointer\' : \'\'" ng-show="node.possibleToBeSelectedScope " ng-style="node.selectedScope ? {\'color\': $ctrl.selectedScopeColor} : {\'color\': $ctrl.selectScopeColor}" ng-click="$ctrl.treeview.toggleAsScope(node.id)"> {{node.selectedScope'+
								'? (!$ctrl.alwaysHaveScopeSelected ? $ctrl.getResourceLabel(\'deselectScope\') : $ctrl.getResourceLabel(\'selectedScope\')) : $ctrl.getResourceLabel(\'selectScope\')}}</a>'+
								'<a ng-if="node.ableToSelectNode || node.selectedNode" ng-class="!node.selectedNode ? \'pointer\' : \'\'" ng-style="node.selectedNode ? {\'color\': $ctrl.selectedScopeColor} : {\'color\': $ctrl.selectScopeColor}" ng-click="!node.selectedNode ? $ctrl.treeview.selectNode(node) : \'\'"> {{node.selectedNode ? $ctrl.getResourceLabel(\'selectedNode\') : $ctrl.getResourceLabel(\'selectNode\')}}</a>'+
				'</div>'+
				'<ul ng-if="node.showNode && node.children && node.showChildren">'+
								'<li ng-repeat="node in node.children" ng-include="\'treeviewGroup\'">'+
								'</li>'+
				'</ul>'+
''+
				'<div ng-if="!node.showNode && node.children && node.showChildren">'+
								'<li ng-repeat="node in node.children" ng-include="\'treeviewGroup\'">'+
								'</li>'+
				'</div>'+
'</script>'+
''+
''+
'<div class="treeviewComponent">'+
				'<a class="pointer" ng-click="$ctrl.toggleExpandAllChildren()">{{$ctrl.getResourceLabel($ctrl.toggleExpandAllChildrenText)}}</a>'+
				'<p ng-repeat="(key, value) in $ctrl.alerts"> {{key}}: {{value}}</p>'+
								'<ul>'+
												'<li>'+
																'<div ng-repeat="node in $ctrl.treeview.toJSON().nodes" ng-include="\'treeviewGroup\'">'+
																'</div>'+
												'</li>'+
								'</ul>'+
'</div>'+
'';
