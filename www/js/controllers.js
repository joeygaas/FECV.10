angular.module('fireExMonitor.controllers', [
    'ionic',
    'ngCordova',
    'fireExMonitor.services',
    'fireExMonitor.filters'
     ])

.controller('AppCtrl',
function($scope, $location, $ionicPlatform, $ionicModal, $cordovaBarcodeScanner, $ionicPopup, $ionicLoading) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
    
    /**
    *@function showLoading
    *@description show loading spinner
    */
    $scope.showLoading = function(){
        $ionicLoading.show({
            template : '<span class="assertive">LOADING</span> <br /> <ion-spinner icon="lines" class="spinner-assertive"></ion-spinner>'
        });
    };

    /**
    *@function hideLoading
    *@description hide loading spinner
    */
    $scope.hideLoading = function(){
        $ionicLoading.hide();
    };

    /**
    *@function scanUnit
    *@description scan the qr code of the unit
    */
    $scope.scanUnit = function(name, company_id){
        try {
            // Ask for confirmation using native dialog
            $ionicPlatform.ready(function(){
                navigator.notification.confirm("Position your camera now.", function(buttonIndex){
                    switch(buttonIndex){
                        case 1 :
                                startScanner();
                                break;
                            case 2 :
                                // do nothing
                                break;
                        }   
                }, "Start Scanner", ["Yes", "No"]);
            });

            // Start the scanner
            function startScanner(){
                // Scan the barcode
                $cordovaBarcodeScanner.scan().then(function(imageData) {
                    if(!imageData.cancelled){
                        // TODO : add QR code data filtering
                        $location.path('app/unitRecords/' + imageData.text + '/' + name + '/' + company_id);
                    }else {
                        var alertPopup = $ionicPopup.alert({
                            title : 'Scann cancelled'
                        });
                        alertPopup;
                    }
                }, function(error) {
                    var alertPopup = $ionicPopup.alert({
                        title : 'Scanner Error',
                        template : 'An error occured ->' + error
                    });
                    alertPopup;
                });
            }
        }
        catch(e){
            alert(e);
        }
    };

    /**
    *@function saveForReport
    *@description save data for generating report
    */
    $scope.saveForReport = function(data, companyName, docTitle){
        console.log(data);
        // Save data to localStorage
        localStorage.setItem("report", angular.toJson(data));
        localStorage.setItem("company", companyName);

        // get the current data and append it to the document name
        var dateToday = new Date();
        var month = dateToday.getMonth() + 1;
        var date = dateToday.getDate();
        var year = dateToday.getFullYear();

        var title = docTitle + '-'  + month + '-' + date + '-' + year;
        // save the document title
        localStorage.setItem("docTitle", title);
    };
})


/**
*@controller RecordsCtrl
*/
.controller('RecordsCtrl', function($scope, $q, $ionicModal, CompanySvc, FileSvc){
     /**
    *@process 
    *@description create a modal box
    */
    $ionicModal.fromTemplateUrl('addCompanyModal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal){
        $scope.modal = modal;
    });
    
    /**
    *@function openModal
    *@description show the modal box
    */
    $scope.openModal = function(){
        $scope.modal.show();
    };
    
   /**
    *@function hideModal
    *@description hide the modal box 
    */
    $scope.hideModal = function(){
        $scope.modal.hide();
    };
    
    /**
    *@process 
    *@description destroY the modal box if not after using
    */
    $scope.$on('$destroy', function(){
        $scope.modal.remove();
    });
    
    /**
    *@function all
    *@description get all the records from the database
    */
    $scope.getAll = function(){
        CompanySvc.all().then(function(res){
            $scope.companies = res;
        });
    };
    
    /**
    *@function addCompany
    *@description add a new company records in the database
    *@param companyObj {{ obj }} company name
    *
    *@return object
    */
    $scope.addCompany = function(companyObj){

        CompanySvc.create(companyObj.name, companyObj.person, companyObj.number).then(function(success){
            // generate a valid company dir name
            var companyName = companyObj.name.split(' ').join('');
            // generate company dir
            FileSvc.createDirInExternal(companyName);
            // Update the list of companies
            $scope.getAll();
        });
    };
    
     /**
    *@process 
    *@description This process will run every when this page is loaded
    */
    $scope.$on('$ionicView.enter', function(e){
        $scope.getAll(); // Generate a list of stored company names
    });
    
})


/**
*@controller CompanyCtrl
*/
.controller('CompanyCtrl',
function(
    $scope, 
    $q, 
    $stateParams, 
    $ionicPopover, 
    $ionicModal, 
    $location, 
    $ionicPopup, 
    $filter, 
    $cordovaBarcodeScanner, 
    FileSvc,
    CompanySvc, 
    UnitSvc
){
     /** 
    *@process 
    *@description Create a pop-over 
    */
    $ionicPopover.fromTemplateUrl('details-popover.html', {
        scope: $scope
    }).then(function(popover){
        $scope.popover = popover;
    });
    
    /**
    *@function openPopover
    *@description show the popover
    */
    $scope.openPopover = function($event){
        $scope.popover.show($event);
    };
    
    /**
    *@function openPopover
    *@description hide the popover
    */
    $scope.hidePopover = function(){
        $scope.popover.hide();
    };
    
    /**
    *@process
    *@description cleanup the popover when whe're done with it
    */
    $scope.$on('$destroy', function(){
        $scope.popover.remove();
    });
    
    
    /**
    *@function deleteAll
    *@descripton Remove all data
    */
    $scope.deleteAll = function(id){
        
    }
    
    /**
    *@process 
    *@description edit-modal box
    */
    $ionicModal.fromTemplateUrl('edit-modal.html', {
        id : '1',
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal){
        $scope.editModal = modal;
    });

    /**
    *@process 
    *@description summar modal box
    */
    $ionicModal.fromTemplateUrl('summary-modal.html', {
        id : '2',
        scope : $scope,
        animation : 'slide-in-up'
    }).then(function(modal){
        $scope.summaryModal = modal;
    });

    /**
    *@function openModal
    *@description open the selected modal box
    */
    $scope.openModal = function(index){
        if(index == 1){
            $scope.editModal.show();
        } else {
            $scope.summaryModal.show();
        }
    }

    /**
    *@function closeModal
    *@description close the selected modal box
    */
    $scope.hideModal = function(index) {
        if(index == 1){
            $scope.editModal.hide();
        } else {
            $scope.summaryModal.hide();
        }
    };

    /**
    *@process clean up the modals when were done with them.
    */
    $scope.$on('$destroy', function(){
        $scope.editModal.remove();
        $scope.summaryModal.remove();
    });
    
    
    /**
    *@function editCompany
    *@description edit the company details
    */
    $scope.editCompany = function(id){
        // get the selected company details
        CompanySvc.read(id).then(function(res){
            // pass the data into the scope
            $scope.company = res;
        });
         $scope.update = false;
         $scope.add = false;

        // hide popover
        $scope.hidePopover();

        // Show the modal box
        $scope.openModal(1);
    }
    
    /**
    *@function updateCompany
    *@description update the company details in the database
    */
    $scope.updateCompany = function(companyObj, id){
        CompanySvc.update(companyObj, id).then(function(res){
            // update the title of the page
            $scope.companyName = companyObj.name;

            // hide modal box
            $scope.hideModal(1);
        });
    }
    
    /**
    *@function deleteAllRecords
    *@param name {{ str }} company name
    */
    $scope.deleteAllRecords = function(name, id){
        try{
            // Show confirmation box
            var confirmation = $ionicPopup.confirm({
                title : 'Delete All Data',
                template : 'You will lost all data permanently. Do you want to proceed?'
            });
            
            confirmation.then(function(res){
                if(res){
                    // delete all the records
                    CompanySvc.delete(id).then(function(res){
                        // Remove data directory
                        var dirName = $stateParams.name.split(' ').join('');
                        FileSvc.removeDirExternal(dirName);
                        // Delete also the stored units data
                        UnitSvc.query('DELETE FROM units WHERE company_name = ?', [name]);
                        // data has been deleted redirect user
                        $location.path('/app/records');
                    });
                } else {
                    // Do nothing
                }
            });
        } catch(e){
            alert("deleteAllRecords " + e);
        }
    }
    
    /**
    *@function getNotInspected
    *@description get the not inspected units
    */
    $scope.getNotInspected = function(){
        var deffered = $q.defer();
        var notInspected = "SELECT * FROM units WHERE company_name = ?";
        UnitSvc.query(notInspected, [$stateParams.name]).then(function(res){

            var units = []; // holds the not inspected units

            // get the inpection date of the units
            for(var i = 0; i < res.rows.length; i++){
                // split the date
                if(res.rows.item(i).inspection_date != 'n/a'){
                    var date = res.rows.item(i).inspection_date.split('/');
                    // last inspection date of the unit summary
                    var inspectDate = $scope.summary.lastInspect.split('/');

                    date = Number(date.join(''));
                    inspectDate = Number(inspectDate.join(''));

                    if(date < inspectDate){
                        units.push(res.rows.item(i));
                    }
                }
            }

            deffered.resolve(units);
            
        });

        return deffered.promise;
    }

    /**
    *@function displayNotInspected
    *@descrtiption diplay the no inspected units
    */
    $scope.displayNotInspected = function(){
        $scope.summaryTitle = "Not Inspected Units";

        $scope.getNotInspected().then(function(res){
            if(res.length != 0){
                $scope.results = res;
                $scope.content = true;
            }else {
                $scope.content = false;
            }

            $scope.openModal(2);
        });
    }

    /**
    *@function getGoodUnits
    *@description get the good units
    */
    $scope.getGoodUnits = function(){
        var deffered = $q.defer();
        var goodUnits = "SELECT * FROM units WHERE company_name = ? AND status = 'operational' AND expired = 'no'";

        UnitSvc.query(goodUnits, [$stateParams.name]).then(function(res){
            var data = $filter('sqlResultSanitize')(res);
            deffered.resolve(data);
        });

        return deffered.promise;
    }

    /**
    *@function displayGoodUnits
    *@description displat the good units
    */
    $scope.displayGoodUnits = function(){
        $scope.summaryTitle = "Operational Units";

        $scope.getGoodUnits().then(function(res){

            if(res.length != 0){
                $scope.results = res;
                $scope.content = true;
            }else {
                $scope.content = false;
            }

            $scope.openModal(2);
        });
    };


    /**
    *@function getDeffectiveUnits
    *@description get the deffective units
    */
    $scope.getDeffectiveUnits = function(){
        var deffered = $q.defer();
        var deffectiveUnits = "SELECT * FRoM units WHERE company_name = ? AND status = 'deffective'";

        UnitSvc.query(deffectiveUnits, [$stateParams.name]).then(function(res){
            var data = $filter('sqlResultSanitize')(res);
            deffered.resolve(data);
        });

        return deffered.promise;
    };

    /**
    *@function displayDeffectiveUnits
    *@description display the deffective units
    */
    $scope.displayDeffectiveUnits = function(){
        $scope.summaryTitle = "Deffective Units";

        $scope.getDeffectiveUnits().then(function(res){
            if(res.length != 0){
                $scope.results = res;
                $scope.content = true;
            }else {
                $scope.content = false;
            }

            $scope.openModal(2);
        });
    };

    /**
    *@function getMissingUnits
    *@description get the missing units
    */
    $scope.getMissingUnits = function(){
        var deffered = $q.defer();
        var missing = "SELECT * FROM units WHERE company_name = ? AND missing = 'yes'";

        UnitSvc.query(missing, [$stateParams.name]).then(function(res){
            var data = $filter('sqlResultSanitize')(res);
            deffered.resolve(data);
        });

        return deffered.promise;
    };

    /**
    *@function displayMissingUnits
    *@description display the missing units
    */
    $scope.displayMissingUnits = function(){
        $scope.summaryTitle = "Missing Units";

        $scope.getMissingUnits().then(function(res){
            if(res.length != 0){
                $scope.results = res;
                $scope.content = true;
            }else {
                $scope.content = false;
            }

            $scope.openModal(2);
        });
    };

    /**
    *@function getChecklist1Failed
    *@description get the checklist1 failed units
    */
    $scope.getChecklist1Failed = function(){
        var deffered = $q.defer();
        var checklist1 = "SELECT * FROM units WHERE company_name = ? AND checklist1 = 'failed'";

        UnitSvc.query(checklist1, [$stateParams.name]).then(function(res){
            var data = $filter('sqlResultSanitize')(res);
            deffered.resolve(data);
        });

        return deffered.promise;
    };

    /**
    *@function displayChecklist1Failed
    *@description get the checklist1 failed units
    */
    $scope.displayChecklist1Failed = function(){
        $scope.summaryTitle = "Deffective Discharge Hose or Nozzle";

        $scope.getChecklist1Failed().then(function(res){
            if(res.length != 0){
                $scope.results = res;
                $scope.content = true;
            }else {
                $scope.content = false;
            }

            $scope.openModal(2);
        });
    }

    /**
    *@function getCheclist2Failed
    *@description get the checklist1 failed units
    */
    $scope.getChecklist2Failed = function(){
        var deffered = $q.defer();
        var checklist2 = "SELECT * FROM units WHERE company_name = ? AND checklist2 = 'failed'";

        UnitSvc.query(checklist2, [$stateParams.name]).then(function(res){
            var data = $filter('sqlResultSanitize')(res);
            deffered.resolve(data);
        });

        return deffered.promise;
    };

    /**
    *@function displayChecklist2Failed
    *@description get the checklist2 failed units
    */
    $scope.displayChecklist2Failed = function(){
        $scope.summaryTitle = "Not Easily Accessible";

        $scope.getChecklist2Failed().then(function(res){
            if(res.length != 0){
                $scope.results = res;
                $scope.content = true;
            }else {
                $scope.content = false;
            }

            $scope.openModal(2);
        });
    }

    /**
    *@function getCheclist3Failed
    *@description get the checklist1 failed units
    */
    $scope.getChecklist3Failed = function(){
        var deffered = $q.defer();
        var checklist3 = "SELECT * FROM units WHERE company_name = ? AND checklist3 = 'failed'";

        UnitSvc.query(checklist3, [$stateParams.name]).then(function(res){
            var data = $filter('sqlResultSanitize')(res);
            deffered.resolve(data);
        });

        return deffered.promise;
    };

    /**
    *@function displayChecklist3Failed
    *@description get the checklist3 failed units
    */
    $scope.displayChecklist3Failed = function(){
        $scope.summaryTitle = "Safety Pin Is Damaged Or Not In Place";

        $scope.getChecklist3Failed().then(function(res){
            if(res.length != 0){
                $scope.results = res;
                $scope.content = true;
            }else {
                $scope.content = false;
            }

            $scope.openModal(2);
        });
    }

    /**
    *@function getCheclist4Failed
    *@description get the checklist1 failed units
    */
    $scope.getChecklist4Failed = function(){
        var deffered = $q.defer();
        var checklist4 = "SELECT * FROM units WHERE company_name = ? AND checklist4 = 'failed'";

        UnitSvc.query(checklist4, [$stateParams.name]).then(function(res){
            var data = $filter('sqlResultSanitize')(res);
            deffered.resolve(data);
        });

        return deffered.promise;
    };

    /**
    *@function displayChecklist4Failed
    *@description get the checklist4 failed units
    */
    $scope.displayChecklist4Failed = function(){
        $scope.summaryTitle = "Pressure Gauge is Damaged Or Showing “Recharge”";

        $scope.getChecklist4Failed().then(function(res){
            if(res.length != 0){
                $scope.results = res;
                $scope.content = true;
            }else {
                $scope.content = false;
            }

            $scope.openModal(2);
        });
    }

    /**
    *@function getCheclist5Failed
    *@description get the checklist1 failed units
    */
    $scope.getChecklist5Failed = function(){
        var deffered = $q.defer();
        var checklist5 = "SELECT * FROM units WHERE company_name = ? AND checklist5 = 'failed'";

        UnitSvc.query(checklist5, [$stateParams.name]).then(function(res){
            var data = $filter('sqlResultSanitize')(res);
            deffered.resolve(data);
        });

        return deffered.promise;
    };

    /**
    *@function displayChecklist5Failed
    *@description get the checklist5 failed units
    */
    $scope.displayChecklist5Failed = function(){
        $scope.summaryTitle = "Label Problem";

        $scope.getChecklist5Failed().then(function(res){
            if(res.length != 0){
                $scope.results = res;
                $scope.content = true;
            }else {
                $scope.content = false;
            }

            $scope.openModal(2);
        });
    }

    /**
    *@function getCheclist6Failed
    *@description get the checklist1 failed units
    */
    $scope.getChecklist6Failed = function(){
        var deffered = $q.defer();
        var checklist6 = "SELECT * FROM units WHERE company_name = ? AND checklist6 = 'failed'";

        UnitSvc.query(checklist6, [$stateParams.name]).then(function(res){
            var data = $filter('sqlResultSanitize')(res);
            deffered.resolve(data);
        });

        return deffered.promise;
    };

    /**
    *@function displayChecklist6Failed
    *@description get the checklist6 failed units
    */
    $scope.displayChecklist6Failed = function(){
        $scope.summaryTitle = "Rusty, Or Has Corrosion Build Up";

        $scope.getChecklist6Failed().then(function(res){
            if(res.length != 0){
                $scope.results = res;
                $scope.content = true;
            }else {
                $scope.content = false;
            }

            $scope.openModal(2);
        });
    }

    /**
    *@function getCheclist7Failed
    *@description get the checklist1 failed units
    */
    $scope.getChecklist8Failed = function(){
        var deffered = $q.defer();
        var checklist8 = "SELECT * FROM units WHERE company_name = ? AND checklist8 = 'failed'";

        UnitSvc.query(checklist8, [$stateParams.name]).then(function(res){
            var data = $filter('sqlResultSanitize')(res);
            deffered.resolve(data);
        });

        return deffered.promise;
    }; 

    /**
    *@function displayChecklist8Failed
    *@description get the checklist8 failed units
    */
    $scope.displayChecklist8Failed = function(){
        $scope.summaryTitle = "The location Is Not Easily Identifiable";

        $scope.getChecklist8Failed().then(function(res){
            if(res.length != 0){
                $scope.results = res;
                $scope.content = true;
            }else {
                $scope.content = false;
            }

            $scope.openModal(2);
        });
    } 

    /**
    *@function getNearExpirationUnits
    *@description get the units that will expire 
    */  
    $scope.getNearExpire = function(){
        var deffered = $q.defer();

        // get the date today
        var dateToday = new Date();
        var month = dateToday.getMonth();
        var date = dateToday.getDate();
        var year = dateToday.getFullYear();

        // check if the month toda + 3 exceds 12
        if( (month + 3) > 12 ){
            var tmpYear = year + 1;
            var tmpMonth = '0' + ((month + 3) - 12);  
        } 

        // add leading zeroes to month and date
        date = $filter('addLeadingZero')(date);
        month = $filter('addLeadingZero')(month);

        var tmpDate = tmpYear + '/' + tmpMonth + '/' + date;
        var actualDate = year + '/' + month + '/' + date;

        var nearExpire = "SELECT * FROM units WHERE company_name = ?";

        UnitSvc.query(nearExpire, [$stateParams.name]).then(function(res){
            var data = $filter('sqlResultSanitize')(res);
            var testDate = Number(tmpDate.split('/').join('')); 
            var actDate = Number(actualDate.split('/').join(''));
            var newData = []; // Holds the new data

            // check the date of the returned data
            for(var i = 0; i < data.length; i++){
                var expireDate = Number(data[i].expiration_date.split('/').join(''));
                
                if( testDate > expireDate && data[i].expired != 'yes' ){
                    newData.push(data[i]);
                }
            }

            deffered.resolve(newData);
        });

        return deffered.promise;
    }

    /**
    *@function displayNearExpire
    *@description display the unit that will expire after 3 months
    */
    $scope.displayNearExpire = function(){
        $scope.summaryTitle = "Units that will expire after 3 months";
        $scope.getNearExpire().then(function(res){
            if(res.length != 0){
                $scope.results = res;
                $scope.content = true;
            }else{
                $scope.content = false;
            }

            $scope.openModal(2);
        });
    }

    /**
    *@function checkExpired
    *@description check the expiration date of the unit
    */
    $scope.checkExpired = function(){
        var dateToday = new Date();
        var month = dateToday.getMonth()+1;
        var date = dateToday.getDate();
        var year = dateToday.getFullYear();

        date = $filter('addLeadingZero')(date);
        month = $filter('addLeadingZero')(month);

        var actualDate = year + '/' + month + date;

        var query = "SELECT * FROM units WHERE company_name = ?";
        // Get the unit data
        UnitSvc.query(query, [$stateParams.name]).then(function(res){
            var actual = Number(actualDate.split('/').join(''));
            var data = $filter('sqlResultSanitize')(res);
            var query = "UPDATE units SET expired = ? WHERE serial_no = ?";

            for(var i = 0; i < data.length; i++){
                var expire = Number(data[i].expiration_date.split('/').join(''));
                // check if the actual date is == expiration date
                if(expire <= actual){
                    // Update the unit expire status to yes
                    UnitSvc.query(query, ['yes', data[i].serial_no]);
                } else {
                    // Update the unit expire status to no
                    UnitSvc.query(query, ['no', data[i].serial_no]);
                }
            }
        });
    }  

    /**
    *@function getExpired
    *@description get the expired units
    */
    $scope.getExpired = function(){
        var deffered = $q.defer();

        var query = "SELECT * FROM units WHERE expired = 'yes' AND company_name = ?";
        UnitSvc.query(query, [$stateParams.name]).then(function(res){
            var data = $filter('sqlResultSanitize')(res);
            deffered.resolve(data);
        });

        return deffered.promise;  
    }

    /**
    *@function displayExpired
    *@description display the expired units
    */
    $scope.displayExpired = function(){
        $scope.summaryTitle = "Expired Units";
        $scope.getExpired().then(function(res){
            if(res.length != 0){
                $scope.results = res;
                $scope.content = true;
            }else {
                $scope.content = false;
            }

            $scope.openModal(2);
        });
    }

    /** 
    *@function statusReport
    *$decription create a quick summary report about the selected company fire extinguisher units
    */
    $scope.statusReport = function(){
        $scope.summary = {};
        // Show loading
        $scope.showLoading();

        // Get the company last inspection data
        CompanySvc.read($stateParams.id).then(function(res){
            $scope.summary.lastInspect = res.inspect_date;
        });

        // Get the total fire extinguiser units of the company
        var total = "SELECT serial_no FROM units WHERE company_name = ?";
        UnitSvc.query(total, [$stateParams.name]).then(function(res){
            $scope.summary.totalUnits = res.rows.length;

        });

        // Get the good units
        $scope.getGoodUnits().then(function(res){
            $scope.summary.good = res.length;
        });

        // Get the deffective units
        $scope.getDeffectiveUnits().then(function(res){
            $scope.summary.deffective = res.length;
        });

        // Get the units that will expire after 3 months
        $scope.getNearExpire().then(function(res){
            $scope.summary.nearExpire = res.length;
        });

        // Get the expired units
        $scope.getExpired().then(function(res){
            $scope.summary.expired = res.length;
        });

        // Get the units that is not inspected
        $scope.getNotInspected().then(function(res){
            $scope.summary.notInspectedUnits = res.length;
        });

        // Get the missing units
        $scope.getMissingUnits().then(function(res){
            $scope.summary.missingUnits = res.length;
        });

        // Get the units inspection status
        $scope.getChecklist1Failed().then(function(res){
            $scope.summary.checklist1Total = res.length;
        });

        $scope.getChecklist2Failed().then(function(res){
            $scope.summary.checklist2Total = res.length;
        });

        $scope.getChecklist3Failed().then(function(res){
            $scope.summary.checklist3Total = res.length;
        });
        
        $scope.getChecklist4Failed().then(function(res){
            $scope.summary.checklist4Total = res.length;
        });
        
        $scope.getChecklist5Failed().then(function(res){
            $scope.summary.checklist5Total = res.length;
        });

        $scope.getChecklist6Failed().then(function(res){
            $scope.summary.checklist6Total = res.length;
        });

        $scope.getChecklist8Failed().then(function(res){
            $scope.summary.checklist8Total = res.length;

            // Hide spinner
            $scope.hideLoading();
        });

    };
    
    /**
    *@fuction startInspection
    *@description start the inspection of all the company units
    */
    $scope.startInspection = function(id){
        // Update the company inspection to date to current date
        var dateToday = new Date();
        var month = dateToday.getMonth() + 1;
        var date = dateToday.getDate();
        var year = dateToday.getFullYear();

        // Set the inspection data
        var query1 = "UPDATE companies SET inspect_date = ?, start = 1 WHERE id = ?";
        var param = [];
        param[0] = year + '/' + month + '/' + date;
        param[1] = id;

        var confirmation = $ionicPopup.confirm({
            title : 'Start Inspection',
            template: 'Do you want to start inspection now?'
        }).then(function(res){
            if(res){
                CompanySvc.query(query1, param);
                $scope.started = true;
                $scope.lastInspect = param[0];

                // Update the view
                $scope.statusReport();
            }
        });
    }

    /**
    *@function check for inspection status
    *@description check for the inspection status
    */
    $scope.checkInspectionStat = function(id){
        CompanySvc.read(id).then(function(res){
            if(res.start == 1){
                $scope.started = true;
            }else{
                $scope.started = false;
            }
        });
    }
    
    /**
    *@function endInspection 
    *@description end the inspection of the company units
    */
    $scope.endInspection = function(id){
        // set startInspection to false;
        var query = "UPDATE companies SET start = 0 WHERE id = ?"
        CompanySvc.query(query, [id]).then(function(res){
            // show alert
            var confirmation = $ionicPopup.confirm({
                title : 'End Inspection',
                template : 'Do you want to end inspection?'

            });
            confirmation.then(function(res){
                if(res){
                    $scope.started = false;
                }
            });
        });

    }

    /**
    *@process 
    *@description This process will run every when this page is loaded
    */
    $scope.$on('$ionicView.enter', function(e){
        $scope.showLoading();
        // Page variables
        $scope.companyId = $stateParams.id;
        $scope.companyName = $stateParams.name;

        $scope.checkExpired();
        $scope.checkInspectionStat($stateParams.id);
        $scope.statusReport();
    });
})


/**
*@controller LocationsCtrl
*@description locations Ctrl
*/
.controller('LocationsCtrl', function($scope, $stateParams, $ionicPopover, UnitSvc){
    /**
    *@function viewRecords
    *@description view company units records
    */
    $scope.viewRecords = function(companyName){
        // Get all the company units
        var query = "SELECT * FROM units WHERE company_name = ?";

        UnitSvc.query(query, [companyName]).then(function(res){
            // Generate a list of the units locations
            var unitLocations = [];
            for(var i = 0; i < res.rows.length; i++){
                if(unitLocations.indexOf(res.rows.item(i).location) == -1){
                    unitLocations.push(res.rows.item(i).location);
                }
            }

            // Pass the date into the view
            $scope.locations = unitLocations;
            $scope.locationsPage = true;
            $scope.printRecords = true;
        });
    }

    /**
    *@process 
    *@description This process will run every when this page is loaded
    */
    $scope.$on('$ionicView.enter', function(e){
        $scope.companyName = $stateParams.name;
        $scope.viewRecords($stateParams.name);
    });

})


/**
*@controller UnitListCtrl
*@description unit controller
*/
.controller('UnitsListCtrl', function(
    $scope, 
    $stateParams, 
    $ionicPopover, 
    $ionicPopup,
    $location,
    $filter,
    UnitSvc
){
    /** 
    *@process 
    *@description Create a pop-over 
    */
    $ionicPopover.fromTemplateUrl('menu-popover.html', {
        scope: $scope
    }).then(function(popover){
        $scope.popover = popover;
    });
    
    /**
    *@function openPopover
    *@description show the popover
    */
    $scope.openPopover = function($event){
        $scope.popover.show($event);
    };
    
    /**
    *@function openPopover
    *@description hide the popover
    */
    $scope.closePopover = function(){
        $scope.popover.hide();
    };
    
    /**
    *@process
    *@description cleanup the popover when whe're done with it
    */
    $scope.$on('$destroy', function(){
        $scope.popover.remove();
    });

    /**
    *@function locationRecords
    *@description show the list of units in the location
    */
    $scope.locationRecords = function(company_name, location){
        // get the units data
        var param = [];
        param[0] = company_name;
        param[1] = location;

        var query = "SELECT * FROM units WHERE company_name = ? AND location = ?";

        UnitSvc.query(query, param).then(function(res){
            var newData = $filter('sqlResultSanitize')(res);

            $scope.units = newData; 
            $scope.title = location;
            $scope.companyName = $stateParams.name;
        });
    }

    /**
    *@function deleteRecords
    *@description delete all the records in the list
    */
    $scope.deleteAll = function(location){
        var query = "DELETE FROM units WHERE location = ? AND company_name = ?";

        // ask for confirmation to the user
        var confirmation = $ionicPopup.confirm({
            title : 'Delete Records',
            template : 'You will lost all the data permanently. Do you want to proceed?'
        }).then(function(res){
            if(res){
                 UnitSvc.query(query, [$stateParams.location, $stateParams.name]).then(function(res){
                    var alertPopup = $ionicPopup.alert({
                        title : 'Data has been deleted.'
                    });
                    alertPopup;
                    // redirect the user
                    $location.path('/app/locations/' + $stateParams.id + '/' + $stateParams.name);
                 });
            }
        });  
    }

    /**
    *@process 
    *@description This process will run every time when this page is loaded
    */
    $scope.$on('$ionicView.enter', function(e){
        $scope.locationRecords($stateParams.name, $stateParams.location);
    });

})


/**
*@controller UnitRecordsCtrl
*@description unit records controller
*/
.controller('UnitRecordsCtrl', function(
    $scope,
    $stateParams, 
    $ionicPopup, 
    $ionicModal, 
    $filter, 
    $ionicPopover, 
    $ionicPlatform, 
    $cordovaCamera,
    $ionicHistory,
    $location,
    UnitSvc, 
    CompanySvc,
    PhotoSvc
){
    /**
    *@process Generate popovers
    */
    $ionicPopover.fromTemplateUrl('menu-popover.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.popover = popover;
    });

    $scope.openPopover = function($event) {
        $scope.popover.show($event);
    };
    $scope.closePopover = function() {
        $scope.popover.hide();
    };
    //Cleanup the popover when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.popover.remove();
    });


    /**
    *@process Generate modal boxes
    */
    $ionicModal.fromTemplateUrl('add-modal.html', {
        id : '1',
        scope : $scope,
        animation : 'slide-in-up'
    }).then(function(modal){
        $scope.addModal = modal; 
    });

    $ionicModal.fromTemplateUrl('checklist-modal.html', {
        id : '2',
        scope : $scope,
        animation : 'slide-in-up'
    }).then(function(modal){
        $scope.checklistModal = modal;
    })

    $ionicModal.fromTemplateUrl('details-modal.html', {
        id : '3',
        scope : $scope,
        animation : 'slide-in-up'
    }).then(function(modal){
        $scope.detailsModal = modal;
    });

    $ionicModal.fromTemplateUrl('add-photo.html', {
        id : '4',
        scope : $scope,
        animation : 'slide-in-up'
    }).then(function(modal){
        $scope.photoModal = modal;
    });

    /**
    *@function openModal
    *@description open the selected modal box
    */
    $scope.openModal = function(index){
        if(index == 1){
            $scope.addModal.show();
        } else if(index == 2){
            $scope.checklistModal.show();
        } else  if(index == 3){
            $scope.detailsModal.show();
        } else {
            $scope.photoModal.show();
        }
    }

    /**
    *@function closeModal
    *@description close the selected modal box
    */
    $scope.hideModal = function(index) {
        if(index == 1){
            $scope.addModal.hide();
        } else if(index == 2){
            $scope.checklistModal.hide();
        } else if(index == 3){
            $scope.detailsModal.hide();
        } else {
            $scope.photoModal.hide();
        }
    };

    /**
    *@process clean up the modals when were done with them.
    */
    $scope.$on('$destroy', function(){
        $scope.addModal.remove();
        $scope.checklistModal.remove();
        $scope.detailsModal.remove();
        $scope.photoModal.remove();
    });

    /**
    *@function updateUnit
    *@description show the update form
    */
    $scope.inspectForm = function(){
        $scope.unitChecklist = {}; // initialize the object
        $scope.openModal(2); // open the modal box
    }
    
    /**
    *@function inspectUnit
    *@description update unit inspection data records
    */
    $scope.inspectUnit = function(unitObj){
        // update the units records
        if(unitObj != undefined){
            var params = [];
            // set the undefined data to false
            params[0] = (unitObj.checkbox1 == undefined) ? "failed" : "passed";
            params[1] = (unitObj.checkbox2 == undefined) ? "failed" : "passed";
            params[2] = (unitObj.checkbox3 == undefined) ? "failed" : "passed";
            params[3] = (unitObj.checkbox4 == undefined) ? "failed" : "passed";
            params[4] = (unitObj.checkbox5 == undefined) ? "failed" : "passed";
            params[5] = (unitObj.checkbox6 == undefined) ? "failed" : "passed";
            params[6] = (unitObj.checkbox7 == undefined) ? "failed" : "passed";
            params[7] = (unitObj.checkbox8 == undefined) ? "failed" : "passed";

            // set the inspection date to the current date 
            var dateToday = new Date();
            var month = dateToday.getMonth()+1;
            var date = dateToday.getDate();
            var year = dateToday.getFullYear();

            params[8] = month + '/' + date + '/' + year;

            if(params.indexOf("failed") == -1){
                // check list array don't contain a failed value
                params[9] = 'operational';
            }else {
                // check list array contain a failed value
                params[9] = "deffective";
            }

            params[10] = $stateParams.serial;

            // Update the units records
            var query = "UPDATE units SET checklist1 = ?, checklist2 = ?, checklist3 = ?, checklist4 = ?, checklist5 = ?, checklist6 = ?, checklist7 = ?, checklist8 = ?, inspection_date = ?, status = ? WHERE serial_no = ?";
            UnitSvc.query(query, params).then(function(res){
                // Update view
                $scope.viewUnit($stateParams.serial);
            });

            $scope.hideModal(2);
        }
    }

    /**
    *@function detailsForm
    *@description updateDetails form
    */
    $scope.detailsForm = function(){
        // Get the list of companies
        CompanySvc.all().then(function(res){
            // Generate a list of companies 
            $scope.companies = res;
        });
        $scope.openModal(3); // open the modal box
    }


    /**
    *@function updateDetails
    *description update unit details
    */
    $scope.updateDetails = function(unitObj){
        // Update the units details
        var params = [];
        params[0] = (unitObj.company_name == undefined) ? $stateParams.name : unitObj.company_name;
        params[1] = unitObj.model;
        params[2] = unitObj.location;
        params[3] = $filter('date')(unitObj.dop, 'yyyy/MM/dd');
        params[4] = $filter('date')(unitObj.date_refilled, 'yyyy/MM/dd');
        params[5] = $filter('date')(unitObj.expiration_date, 'yyyy/MM/dd');

        // check if the unit is expired
        var dateToday = new Date();
        var month = dateToday.getMonth()+1;
        var date = dateToday.getDate();
        var year = dateToday.getFullYear();
        var actualDate = month + '/' + date + '/' + year;
        actualDate = actualDate.split('/').join('');

        var expireDate = Number(params[5].split('/').join(''));

        if(expireDate <= actualDate){
            params[6] = 'yes';
        }else {
            params[6] = 'no';
        }

        params[7] = unitObj.serial_no;
        
        var query = "UPDATE units SET company_name = ?, model = ?, location = ?, dop = ?, date_refilled = ?, expiration_date = ?, expired = ? WHERE serial_no = ?";
        UnitSvc.query(query, params).then(function(res){
            // notify the user
            var alertPopup = $ionicPopup.alert({
                title : 'Unit Details Updated'
            });
            alertPopup;

            $scope.viewUnit($stateParams.serial); // view the unit
        });
        $scope.hideModal(3); // Hide the modal box
    }

    /**
    *@function tagAsMissing
    *@description tag the unit as missing
    */
    $scope.tagAsMissing = function(serial){

        var confirmation = $ionicPopup.confirm({
            title : 'Tag the unit as missing',
            tempalte : 'Are you sure?'
        }).then(function(res){
            if(res){
                var query = "UPDATE units SET missing = 'yes' WHERE serial_no = ?";
                UnitSvc.query(query, [serial]).then(function(res){
                    var alertPopup = $ionicPopup.alert({
                        title : 'Unit is tagged as missing'
                    });
                    alertPopup;

                    // show the found button
                    $scope.missingBtn = true;
                });
            }
        });
    }

    /**
    *@function tagAsFound
    *@description tag the unit as found
    */
    $scope.tagAsFound = function(serial){
        var confirmation = $ionicPopup.confirm({
            title : 'Tag the unit as found',
            tempalte : 'Are you sure?'
        }).then(function(res){
            var query = "UPDATE units SET missing = 'no' WHERE serial_no = ?";
            UnitSvc.query(query, [serial]).then(function(res){
                var alertPopup = $ionicPopup.alert({
                    title : 'Unit is tagged as found'
                });
                alertPopup;

                // show the missing button
                $scope.missingBtn = false;
            });
        });
    }

    /**
    *@function missing status
    *@description check for the missing status and display the right button
    */
    $scope.missingStatus = function(serial){
        var query = "SELECT missing FROM units WHERE serial_no = ?";
        UnitSvc.query(query, [serial]).then(function(res){
            if(res.rows.item(0).missing == 'no'){
                $scope.missingBtn = false;
            }else {
                $scope.missingBtn = true;
            }
        });
    }

    /**
    *@function addForm
    *@description show the add unit form
    */
    $scope.addForm = function(serial){
        $scope.add = {};
        $scope.add.serial_no = serial;
        $scope.add.company_name = $stateParams.name;

        $scope.openModal(1); // open the modal box
    }

    /**
    *@function addUnit
    *@description add new company unit
    */
    $scope.addUnit = function(unitObj){

        console.log(unitObj);
        UnitSvc.create(unitObj).then(function(res){
            var alertPopup = $ionicPopup.alert({
                title : 'New Unit Added',
                template : 'New Unit has been added in the records.',
            });
            $scope.hideModal(1);
            alertPopup;
            $scope.viewUnit(unitObj.serialNo);
        });
    }

    /**
    *@function viewUnit 
    *@description view units records
    */
    $scope.viewUnit = function(serial){
        // show the loading spinner
        $scope.showLoading();

        UnitSvc.read(serial).then(function(res){
            if(res != false){
                // pass the data into the view
                $scope.unit = res;
                $scope.noResults = false;
            }else {
                $scope.noResults = true;
                var confirmation = $ionicPopup.confirm({
                    title : 'No Records Found.',
                    template : 'Do you want to create a new record for this unit?'
                });
                confirmation.then(function(res){
                    if(res){
                        $scope.addForm(serial);
                    }
                });
            }
            // hide the loading spinner
            $scope.hideLoading();
        });
    }

    /**
    *@function deleteUnit
    *@description delete unit records
    */
    $scope.deleteUnit = function(id){
        // show confirmation box
        var confirmation = $ionicPopup.confirm({
            title : 'Delete Records',
            template : 'Do you want to delete this records permanently?'
        }).then(function(res){
            if(res){
                // Delete the uni records
                UnitSvc.delete(id).then(function(res){
                    $location.path($ionicHistory.backView().url); // Redirect to the last viewed page
                    // notify the user and redirect to units list
                    var alertPopup = $ionicPopup.alert({
                        title : 'Records has been successfuly deleted.'
                    });
                    alertPopup;

                    // Hide popover
                   $scope.closePopover();
                });
            }
        });
    }

    /**
    *@function takePicture
    *@description take units picture
    */
    $scope.takePicture = function(serial){
        $ionicPlatform.ready(function(){
            var options = {
                quality: 80,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: false,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 250,
                targetHeight: 250,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false,
                correctOrientation: true
            };

            $cordovaCamera.getPicture(options).then(function(imageURL){
                $scope.addPhotoFrm('data:image/jpeg;base64,' + imageURL);
            }, function(error){
                // Error occured
                alert("Error : " + error);
            });
    
        });
    }

    /**
    *@function addPhotoFrm
    *@description show add photo form
    */
    $scope.addPhotoFrm = function(data){
        $scope.imageData = {};
        $scope.imageData.unitSerial = $stateParams.serial;
        $scope.imageData.imgURL = data;
        $scope.openModal(4);
    }

    /**
    *@function savePhoto
    *@description save the photo
    */
    $scope.savePhoto = function(imageData){
        // Save the photo URL in db
        PhotoSvc.create(imageData).then(function(res){
            var alertPopup = $ionicPopup.alert({
                title : 'Photo successfuly saved'
            });
            alertPopup;
            $scope.hideModal(4); 
        });
    } 

    /**
    *@process 
    *@description This process will run every time when this page is loaded
    */
    $scope.$on('$ionicView.enter', function(e){
        $scope.companyId = $stateParams.companyId;
        $scope.companyName = $stateParams.name;
        $scope.viewUnit($stateParams.serial);
        $scope.missingStatus($stateParams.serial);
    });
})


/**
*@controller PicturesCtrl
*@description pictures main controller
*/
.controller('GaleryCtrl', function(
    $scope,
    $stateParams,
    $ionicModal,
    $cordovaCamera,
    $filter,
    $ionicPopup,
    PhotoSvc
){
    /**
    *@proccess
    *@description generate modal box
    */
    $ionicModal.fromTemplateUrl('photo-modal.html', {
        id : '1',
        scope : $scope,
        animation : 'slide-in-up'
    }).then(function(modal){
        $scope.photoModal = modal; 
    });

    $ionicModal.fromTemplateUrl('editPhoto-modal.html', {
        id : '2',
        scope : $scope,
        animation : 'slide-in-up'
    }).then(function(modal){
        $scope.editPhotoModal = modal;
    });

    /**
    *@function openModal
    *@description open the photo modal box
    */
    $scope.openModal = function(index){
        if(index == 1){
            $scope.photoModal.show();
        }else if(index == 2){
            $scope.editPhotoModal.show();
        }
    }

    /**
    *@function openModal
    *@description open the photo modal box
    */
    $scope.hideModal = function(index){
        if(index == 1){
            $scope.photoModal.hide();
        }else if(index == 2){
            $scope.editPhotoModal.hide();
        }
    }

    /**
    *@process clean up the modals when were done with them.
    */
    $scope.$on('$destroy', function(){
        $scope.photoModal.remove();
        $scope.editPhotoModal.remove();
    });

    /**
    *@function allPhotos
    *@description view all the unit photos
    */
    $scope.allPhotos = function(serial){
        $scope.noResults = false; // hide the no results text by default

        PhotoSvc.all(serial).then(function(res){
            if(res.length != 0){
                $scope.unitImg = res;
            }else {
                $scope.noResults = true;
            }
        });
    }

    /**
    *@function viewPhotos
    *@description view single photo
    */
    $scope.viewPhoto = function(imgData){
        $scope.selectedImg = imgData;
        $scope.openModal(1);
    }

    /**
    *@function editPhoto
    *@description edit selected photo
    */
    $scope.editPhoto = function(imgData){
        var query = "UPDATE photos SET description = ? WHERE id = ?";
        PhotoSvc.query(query, [imgData.description, imgData.id]).then(function(res){
            // update the galery
            $scope.allPhotos($stateParams.unitSerial);
            
            var alertPopup = $ionicPopup.alert({
                title : 'Updated',
                template : 'Unit data has been updated'
            });
            alertPopup;
            $scope.hideModal(2);
        });
    }

    /**
    *@function editPhotoFrm
    *@description show the edit photo form
    */
    $scope.editPhotoFrm = function(imgData){
        $scope.selectedImg = imgData;
        $scope.openModal(2);
    }

    /**
    *@function removePhoto
    *@description remove a selected photo
    */
    $scope.removePhoto = function(id){
        var confirmation = $ionicPopup.confirm({
            title : 'Remove Photo',
            template : 'Delete this photo permanently?'
        }).then(function(res){
            if(res){
                // Delete photo
                PhotoSvc.delete(id).then(function(res){
                    // update the galery
                    $scope.allPhotos($stateParams.unitSerial);

                    var alertPopup = $ionicPopup.alert({
                        title : 'Photo Deleted',
                        template : 'Photo deleted successfuly.'
                    });
                    alertPopup;

                    $scope.hideModal(1);
                });
            }
        });
    }

    /**
    *@process 
    *@description This process will run every when this page is loaded
    */
    $scope.$on('$ionicView.enter', function(e){
        // Get all the photos
        $scope.allPhotos($stateParams.unitSerial);
    });    
})


/**
*@controllerrtRecordsCtrl
*@description import ms excel records
*/
.controller('ImportRecordsCtrl', function(
    $scope,
    $stateParams,
    $ionicLoading,
    $ionicPlatform,
    $ionicPopup,
    $timeout,
    FileSvc,
    UnitSvc,
    ExcelSvc
){
    /**
    *@function uploadFile
    *@descrtiption get the file from the form
    */
    $scope.uploadFile = function(){
        $scope.uploaded = false;
            // get the excel file
            FileSvc.read().then(function(res){
                // parse the excel file
                ExcelSvc.parse(res).then(function(data){
                    // save to db
                    $scope.saveToDB(data);
                    $scope.uploaded = true;
                    // hide the notification image after 3 seconds
                    $timeout(function(){
                        $scope.uploaded = false;
                    }, 300);
                });
            });
    };

    /**
    *@function saveToDB
    *@descrtiption save data to DB
    */
    $scope.saveToDB = function(data){
        var e = [];
        for(var i = 0; i < data.length; i++){
            // if the company_name is not defined set the units company id to the current company
            data[i].company_name = (data[i].company_name == undefined) ? $stateParams.companyName : data[i].company_name;
            UnitSvc.fromFile(data[i]);
        }
        
        $scope.uploaded = true;
    };
})


/**
*@controller SearchCtrl
*@description search controller
*/
.controller('SearchCtrl', function($scope, UnitSvc){
    /**
    *@function loadAllData
    *@descrtiption load all the data 
    */
    $scope.loadAllData = function(){
        UnitSvc.all().then(function(res){
            $scope.results = res;
        });
    };

    // get all the data
    $scope.loadAllData();
})



/**
*@controller ReportCtrl
*@description report generation controller
*/
.controller('ReportCtrl', function(
    $scope,
    $ionicModal, 
    $ionicLoading,
    $ionicPopup,
    PDFSvc,
    ExcelSvc
){
    /**
    *@process 
    *@description This process will run every when this page is loaded
    */
    $scope.$on('$ionicView.enter', function(e){
        $scope.companyName = localStorage.getItem('company');
         __activate();
    });


    /**
    *@function activate
    *@description ReportSvc Event Listeners: Progress/Done
    *used to listen for async progress updates so loading text can change in 
    *UI to be repsonsive because the report process can be 'lengthy' on 
    *older devices (chk reportSvc for emitting events)
    */
    function __activate(){
        $scope.$on('PDFSvc::Progress', function(evt, msg){
            __showLoading(msg);
        });
        $scope.$on('PDFSvc::Done', function(evt, msg){
            __hideLoading();
        });

        $scope.$on('ExcelSvc::Progress', function(evt, msg){
            __showLoading(msg);
        });
        $scope.$on('ExcelSvc::Done', function(evt, msg){
            __hideLoading();
        });
    }

    /**
    *@function __showLoading
    *@description helper function that shows the loading status in the UI
    */
    function __showLoading(msg){
        $ionicLoading.show({
            template : msg +  '<br /><ion-spinner icon="lines"></ion-spinner>'
        });
    }

    /**
    *@function __hideLoading
    *@description helper function that hide the loading status in the UI
    */
    function __hideLoading(){
        $ionicLoading.hide();
    }

    /**
    *@function generatePDFReport
    *@description generate PDF File
    */
    $scope.generatePDFReport = function(){
        // ask confirmation to the user
        // because this may take a while deppending on how fast is your mobile device
        var confirmation = $ionicPopup.confirm({
            title: 'Generate PDF File',
            template : 'This may take a while. Do you want to proceed?'
        }).then(function(res){
            if(res){
                PDFSvc.generate().then(function(success){
                    // Notify the user that the pdf file has been generated
                    var alertPopup  = $ionicPopup.alert({
                        title : 'PDF File has been generated',
                        template : 'You can view it now in the reports browser'
                    });
                    alertPopup;
                });
            }
        });

        
    };

    /**
    *@function generateExcelReport
    *@description generate excel file
    */
    $scope.generateExcelReport = function(){
        try{
            // Ask confirmation to the user
            // because this may take a while depending on how fast is you mobile device
            var confirmation = $ionicPopup.confirm({
                title : 'Generate Excel File',
                template : 'This may take a while. Do you want to proceed?'
            }).then(function(res){
                if(res){
                    ExcelSvc.generate().then(function(success){
                        // Notify the user
                        var alertPopup = $ionicPopup.alert({
                            title : 'Excel file has been generated',
                            template : 'You can view it now in the reports browser'
                        });
                        alertPopup;
                    });
                }
            });
        } catch(e){
            alert("generateExcelReport " + e);
        }
    };
})


/**
*@controller ReportsBrowserCtrl
*@description reports browser controller
*/
.controller('ReportsBrowserCtrl', function(
    $scope,
    $stateParams,
    $ionicPopup,
    FileSvc
){
    /**
    *@process 
    *@description This process will run every when this page is loaded
    */
    $scope.$on('$ionicView.enter', function(e){

    }); 

    /**
    *@variable declaration 
    *@description file paths
    */
    var PDFFilePath = $stateParams.companyName.split(' ').join('') + '/PDFReports';
    var ExcelFilePath = $stateParams.companyName.split(' ').join('') + '/ExcelReports';

    /**
    *@function PdfReports
    *@description generate a list of available pdf docs that
    *@is stored in the application data storage
    */
    $scope.pdfReports = function(){
        $scope.showLoading()
        $scope.fileList = true;

        FileSvc.readDirExternal(PDFFilePath).then(function(files){
            if(files.length != 0){
                $scope.isExcel = false;
                $scope.isPDF = true;
                $scope.noResults = false;
                $scope.files = files;

                $scope.hideLoading();
            }else {
                $scope.isExcel = false;
                $scope.isPDF = false;
                $scope.noResults = true;

                $scope.hideLoading();
            }
        });
    }

    /**
    *@function openReport
    *@description open a file using default app
    */
    $scope.openPdfReport = function(path){
        FileSvc.fileOpener(path, 'application/pdf');
    }

    /**
    *@function removeReport
    *@description remove a file in the externalDataDirectory
    */
    $scope.removePdfReport = function(path){
        try{
            // Ask for user confirmation
            var confirmation = $ionicPopup.confirm({
                title : 'Delete Report',
                template : 'Are you sure you want to delete this file permanently'
            }).then(function(res){
                if(res){
                    // remove the file 
                    FileSvc.removeFileExternal(path).then(function(success){
                        // Update the view
                        $scope.pdfReports(PDFFilePath);
                    });
                }
            });
        } catch(e){
            alert(e);
        }
    }

    /**
    *@function ExcelReports
    *@description generate a list of available excel docs docs that
    *@is stored in the application data storage
    */
    $scope.excelReports = function(){
        $scope.showLoading();
        $scope.fileList= true;

        FileSvc.readDirExternal(ExcelFilePath).then(function(files){
            if(files.length != 0){
                $scope.isExcel = true;
                $scope.isPDF = false;
                $scope.noResults = false;
                $scope.files = files;

                $scope.hideLoading();
            }else {
                $scope.isExcel = false;
                $scope.isPDF = false;
                $scope.noResults = true;

                $scope.hideLoading();
            }
        });
    }

    /**
    *@function openExcelReport
    *@description open file using default app
    */
    $scope.openExcelReport = function(path){
        FileSvc.fileOpener(path, 'application/octet-stream');
    }

    /**
    *@function removeReport
    *@description remove a file in the externalDataDirectory
    */
    $scope.removeExcelReport = function(path){
        try{
            // Ask for user confirmation
            var confirmation = $ionicPopup.confirm({
                title : 'Delete Report',
                template : 'Are you sure you want to delete this file permanently'
            }).then(function(res){
                if(res){
                    // remove the file 
                    FileSvc.removeFileExternal(path).then(function(success){
                        // Update the view
                        $scope.excelReports(ExcelFilePath);
                    });
                }
            });
        } catch(e){
            alert(e);
        }
    }

    /**
    *@function upFolder
    *@description back to the documents options
    */
    $scope.upFolder = function(){
        $scope.fileList = false;
    }
})

/**
*@controller SyncCtrl
*@description sync date controller
*/
.controller('SyncCtrl', function(
    $scope, 
    $ionicPlatform,
    $ionicPopup,
    $ionicLoading,
    $filter,
    UnitSvc,
    CompanySvc,
    ExcelSvc,
    FileSvc
){
    $ionicPlatform.ready(function(){
        /**
        *@function activate
        *@description ReportSvc Event Listeners: Progress/Done
        *used to listen for async progress updates so loading text can change in 
        *UI to be repsonsive because the report process can be 'lengthy' on 
        *older devices (chk reportSvc for emitting events)
        */
        function __activate(){
            $scope.$on('ExcelSvc::Progress', function(evt, msg){
                __showLoading(msg);
            });
            $scope.$on('ExcelSvc::Done', function(evt, msg){
                __hideLoading();
            });
        }

        /**
        *@function __showLoading
        *@description helper function that shows the loading status in the UI
        */
        function __showLoading(msg){
            $ionicLoading.show({
                template : msg +  '<br /><ion-spinner icon="lines"></ion-spinner>'
            });
        }

        /**
        *@function __hideLoading
        *@description helper function that hide the loading status in the UI
        */
        function __hideLoading(){
            $ionicLoading.hide();
        }

        /**
        *@function genSyncData
        *@description generate excel file for all the data in the database
        */
        $scope.genSyncData = function(){
            // get all the data in the units table
            UnitSvc.all().then(function(res){
                console.log(res);
                ExcelSvc.genForSycnUnits(res).then(function(success){
                    // get all company data
                    CompanySvc.all().then(function(res){
                        console.log(res);
                        ExcelSvc.genForSycnCompanies(res).then(function(success){
                            // notify the user
                            var alertPopup = $ionicPopup.alert({
                                title : 'Sync Data generated'
                            });
                        });
                    });
                });
            });
        }

        /**
        *@function uploadFile
        *@descrtiption get the file from the form
        */
        $scope.uploadSyncData = function(id){
           // Open file1
           FileSvc.read().then(function(data1){
                ExcelSvc.parse(data1).then(function(res){
                    syncData(res);
                });
           }, function(error){
                alert("uploadSyncData " + error);
           });
            
           // Sync data functions
           function syncData(data){
                try{
                    // SQL queries
                    var compSelectQuery = "SELECT * FROM companies WHERE name = ?";
                    var compUpdateQuery = "UPDATE companies SET person = ?, contact_no = ? WHERE name = ? ";

                    for(var i = 0; i < data.length; i++){
                        var tmpData = data[i];
                        // if the name attribute is pressent this is the companies backup records
                        if(tmpData.name != undefined){ 
                            CompanySvc.query(compSelectQuery, [tmpData.name]).then(function(res){
                                var length = res.rows.length;
                                if(length == 0){
                                    var companyName = tmpData.name.split(' ').join('');

                                    CompanySvc.create(tmpData.name, tmpData.person, tmpData.number);
                                    FileSvc.createDirInExternal(companyName);
                                }
                                else {
                                    CompanySvc.query(compUpdateQuery, [tmpData.person, tmpData.number, tmpData.name]);
                                }
                            });
                        }
                        // if the serial_no attribute is pressent this is the unit backup records
                        else if(tmpData.company_name != undefined){
                            UnitSvc.read(tmpData.serial_no).then(function(res){
                                var length = res.rows.length;
                                if(length <= 0){
                                    // Create a new unit
                                    UnitSvc.create(tmpData);
                                }
                                else {
                                    // Update the existing data
                                    UnitSvc.update(tmpData);
                                }
                            });
                        }
                    } // end of for loop
                    
                    alert("Done Sir!!!");

                } catch(e){
                    alert("syncData " + e);
                }
           }
        }
            
        /**
        *@process 
        *@description This process will run every when this page is loaded
        */
        $scope.$on('$ionicView.enter', function(e){
             __activate();
        });
    });
});