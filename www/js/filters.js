angular.module('fireExMonitor.filters', ['ionic', 'ngCordova'])

/**
*@filter sqlresultToArrayObj
*@description generate array of objects
*/
.filter('sqlResultSanitize', function(){
	return function(input){
		var output = [];
		
		if(input.rows.length != 0){
			// Do the filtering here
			for(var i = 0; i < input.rows.length; i++){
				output.push(input.rows.item(i));
			}
		}
		return output;
	}
});