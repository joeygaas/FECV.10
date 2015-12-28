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
})

/**
*@filter MMddyyToyyyyMMdd
*@description convert date fomr MM/dd/yy to yyyy/MM/dd
*/
.filter('MMddyyToyyyyMMdd', function(){
	return function(input){
		var output;

		if(input != ''){
			// Do the filtering
			var splitDateR = input.split('/');
            var dateRarray = [];

            // modify the splited arrays
            dateRarray.push('20' + splitDateR[2]);
            dateRarray.push(splitDateR[0]);
            dateRarray.push(splitDateR[1]);

            var output = dateRarray.join('/');
		}

		return output;
	}
})

/**
*@filter addLeadingZero
*@description add a leading zero to date
*/
.filter('addLeadingZero', function(){
	return function(input){
		var output;
		
		if(input < 10){
			output = '0' + input;
		}else{
			output = input;
		}

		return output;
	}
});