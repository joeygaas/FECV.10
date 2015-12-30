angular.module('fireExMonitor.services', ['ionic', 'ngCordova', 'fireExMonitor.filters'])


/**
*@Service CompanySvc
*/
.factory('CompanySvc', function($cordovaSQLite, $ionicPlatform, $filter, $q){
    return {
        // All 
        all : function(){
            var deffered = $q.defer();
            
            $ionicPlatform.ready(function(){
                var query = "SELECT * FROM companies";
                $cordovaSQLite.execute(db, query, []).then(function(res){
                    // convert the data into object
                    var newData = $filter('sqlResultSanitize')(res);
                    
                    deffered.resolve(newData);
                }, function(error){
                    alert("Error message: " + error.message);
                });
            });
            return deffered.promise;
        },
        
        // Create
        create : function(name, person, number){
            var deffered = $q.defer();
            
            $ionicPlatform.ready(function(){
                var query = "INSERT INTO companies(name, person, contact_no) VALUES(?, ?, ?)";
                $cordovaSQLite.execute(db, query, [name, person, number]).then(function(res){
                    deffered.resolve(res.insertId);
                }, function(error){
                    alert("Error message: " + error.message);
                }); 
            });
            return deffered.promise;
        },
        
        // Read
        read: function(id){ 
            var deffered = $q.defer();
            
            $ionicPlatform.ready(function(){ 
                var query = "SELECT * FROM companies WHERE id = ?";
                $cordovaSQLite.execute(db, query, [id]).then(function(res){
                    deffered.resolve(res.rows.item(0));
                }, function(error){
                    alert("Error" + error);
                    deffered.reject(error);
                });   
            });
            return deffered.promise;
        },
        
        // Update
        update : function(companyObj, id){
            var deffered = $q.defer();
            
            $ionicPlatform.ready(function(){
                var query= "UPDATE companies SET name = ?, person = ?, contact_no = ? WHERE id = ?";
                $cordovaSQLite.execute(db, query, [companyObj.name, companyObj.person, companyObj.contact_no, id]).then(function(res){
                    deffered.resolve(true);
                }, function(error){
                    alert("Error: " + error);
                    deffered.reject(error);
                })
            });
            return deffered.promise;
        },
        
        // Delete
        delete : function(id){
            var deffered= $q.defer();
            
            $ionicPlatform.ready(function(){
                var query = "DELETE FROM companies WHERE id = ?";
                $cordovaSQLite.execute(db, query, [id]).then(function(res){
                    deffered.resolve(true);
                }, function(error){
                    alert("Error: " + error);
                    deffered.reject(error);
                })
            });
            return deffered.promise;
        },

        // Custom query
        query : function(query, params){
            var deffered = $q.defer();

            $ionicPlatform.ready(function(){
                $cordovaSQLite.execute(db, query, params).then(function(res){
                    deffered.resolve(res);
                }, function(error){
                    alert("Error: " + error);
                    deffered.reject(error);
                });
            });
            return deffered.promise;
        }
    };
})


/**
*@Service UnitSvc
*/
.factory('UnitSvc', function($cordovaSQLite, $ionicPlatform, $q, $filter){
    return {
        //All
        all : function(){
            var deffered = $q.defer();

            $ionicPlatform.ready(function(){
                var query = "SELECT * FROM units";
                $cordovaSQLite.execute(db, query, []).then(function(res){
                    // clean return object data to plain object
                    var newData = $filter('sqlResultSanitize')(res);
                    
                    deffered.resolve(newData);
                }, function(error){
                    alert("Error: " + error);
                    deffered.reject(error);
                });
            });
            return deffered.promise;
        },

        // Create
        create : function(unitObj){
            var deffered = $q.defer();
            
            var date_refilled = (unitObj.date_refilled == undefined) ? 'n/a' : $filter('date')(unitObj.date_refilled, 'yyyy/MM/dd');

            var dop = $filter('date')(unitObj.dop, 'yyyy/MM/dd');
            var expiration_date = $filter('date')(unitObj.expiration_date, 'yyyy/MM/dd');

            var params = [];
            params[0] = unitObj.serial_no;
            params[1] = unitObj.model;
            params[2] = unitObj.company_name;
            params[3] = unitObj.location;
            params[4] = dop;
            params[5] = date_refilled;
            params[6] = expiration_date;

            // check if the unit is expired
            var dateToday = new Date();
            dateToday = $filter('date')(dateToday, 'yyyy/MM/dd');

            if( Number(dateToday.split('/').join('')) > Number(expiration_date.split('/').join('')) ){
                params[7] = 'yes';
            } else {
                params[7] = 'no';
            }

            // checklist params
            params[8] = (unitObj.checklist1 == undefined) ? 'passed' : unitObj.checklist1;
            params[9] = (unitObj.checklist1 == undefined) ? 'passed' : unitObj.checklist2;
            params[10] = (unitObj.checklist1 == undefined) ? 'passed' : unitObj.checklist3;
            params[11] = (unitObj.checklist1 == undefined) ? 'passed' : unitObj.checklist4;
            params[12] = (unitObj.checklist1 == undefined) ? 'passed' : unitObj.checklist5;
            params[13] = (unitObj.checklist1 == undefined) ? 'passed' : unitObj.checklist6;
            params[14] = (unitObj.checklist1 == undefined) ? 'passed' : unitObj.checklist7;
            params[15] = (unitObj.checklist1 == undefined) ? 'passed' : unitObj.checklist8;

            $ionicPlatform.ready(function(){
                var query = "INSERT INTO units(serial_no, model, company_name, location, dop, date_refilled, expiration_date, expired, checklist1, checklist2, checklist3, checklist4, checklist5, checklist6, checklist7, checklist8) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                $cordovaSQLite.execute(db, query, params)
                .then(function(res){
                    deffered.resolve(res);
                }, function(error){
                    deffered.reject(error);
                });
            });
            return deffered.promise;
        },


        // fromFile
        fromFile : function(unitObj){
            var deffered = $q.defer();

            try{

            if(unitObj.date_refilled == undefined){
                var date_refilled = 'n/a';
            }else {
                var date_refilled = $filter('MMddyyToyyyyMMdd')(unitObj.date_refilled);
            }

            var expiration_date = $filter('MMddyyToyyyyMMdd')(unitObj.expiration_date);
            var dop = $filter('MMddyyToyyyyMMdd')(unitObj.dop);

            var params = [];
            params[0] = unitObj.serial_no;
            params[1] = unitObj.model;
            params[2] = unitObj.company_name;
            params[3] = unitObj.location;
            params[4] = dop;
            params[5] = date_refilled;
            params[6] = expiration_date;

            // check if the unit is expired
            var dateToday = new Date();
            dateToday = $filter('date')(dateToday, 'yyyy/MM/dd');

            if( Number(dateToday.split('/').join('')) > Number(expiration_date.split('/').join('')) ){
                params[7] = 'yes';
            } else {
                params[7] = 'no';
            }

            // checklist params
            params[8] = (unitObj.checklist1 == undefined) ? 'passed' : unitObj.checklist1;
            params[9] = (unitObj.checklist1 == undefined) ? 'passed' : unitObj.checklist2;
            params[10] = (unitObj.checklist1 == undefined) ? 'passed' : unitObj.checklist3;
            params[11] = (unitObj.checklist1 == undefined) ? 'passed' : unitObj.checklist4;
            params[12] = (unitObj.checklist1 == undefined) ? 'passed' : unitObj.checklist5;
            params[13] = (unitObj.checklist1 == undefined) ? 'passed' : unitObj.checklist6;
            params[14] = (unitObj.checklist1 == undefined) ? 'passed' : unitObj.checklist7;
            params[15] = (unitObj.checklist1 == undefined) ? 'passed' : unitObj.checklist8;


            $ionicPlatform.ready(function(){
                var query = "INSERT INTO units(serial_no, model, company_name, location, dop, date_refilled, expiration_date, expired, checklist1, checklist2, checklist3, checklist4, checklist5, checklist6, checklist7, checklist8) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                $cordovaSQLite.execute(db, query, params)
                .then(function(res){
                    deffered.resolve(res);
                }, function(error){
                    deffered.reject(error);
                });
            });
            } catch(e){
                alert("fromFile " + e);
            }
            return deffered.promise;
        },

        // Read
        read : function(serial_no){
            var deffered = $q.defer();

            $ionicPlatform.ready(function(){
                var query = "SELECT * FROM units WHERE serial_no = ?";
                $cordovaSQLite.execute(db, query, [serial_no]).then(function(res){
                    if(res.rows.length != 0){
                        deffered.resolve(res.rows.item(0));
                    }else {
                        deffered.resolve(false);
                    }
                }, function(error){
                    alert("Error: " + error);
                    deffered.reject(error);
                });
            });
            return deffered.promise;
        },

        // Update the units records
        update : function(unitObj){
            var deffered = $q.defer();

            try{

                if(unitObj.date_refilled == undefined){
                    var date_refilled = 'n/a';
                }else {
                    var date_refilled = $filter('MMddyyToyyyyMMdd')(unitObj.date_refilled);
                }

                var expiration_date = $filter('MMddyyToyyyyMMdd')(unitObj.expiration_date);
                var dop = $filter('MMddyyToyyyyMMdd')(unitObj.dop);

                var params = [];
                params[0] = unitObj.serial_no;
                params[1] = unitObj.model;
                params[2] = unitObj.company_name;
                params[3] = unitObj.location;
                params[4] = dop;
                params[5] = date_refilled;
                params[6] = expiration_date;

                // check if the unit is expired
                var dateToday = new Date();
                dateToday = $filter('date')(dateToday, 'yyyy/MM/dd');

                if( Number(dateToday.split('/').join('')) > Number(expiration_date.split('/').join('')) ){
                    params[7] = 'yes';
                } else {
                    params[7] = 'no';
                }

                // checklist params
                params[8] = (unitObj.checklist1 == undefined) ? 'passed' : unitObj.checklist1;
                params[9] = (unitObj.checklist1 == undefined) ? 'passed' : unitObj.checklist2;
                params[10] = (unitObj.checklist1 == undefined) ? 'passed' : unitObj.checklist3;
                params[11] = (unitObj.checklist1 == undefined) ? 'passed' : unitObj.checklist4;
                params[12] = (unitObj.checklist1 == undefined) ? 'passed' : unitObj.checklist5;
                params[13] = (unitObj.checklist1 == undefined) ? 'passed' : unitObj.checklist6;
                params[14] = (unitObj.checklist1 == undefined) ? 'passed' : unitObj.checklist7;
                params[15] = (unitObj.checklist1 == undefined) ? 'passed' : unitObj.checklist8;

                params[16] = unitObj.serial_no;

                var query = "UPDATE units SET model = ?, company_name = ?, location = ?, dop = ?, date_refilled = ?, expiration_date = ?, expired = ?, checklist1 = ?, checklist2 = ?, checklist3 = ?, checklist4 = ?, checklist5 = ?, checklist6 = ?, checklist7 = ?, checklist8 = ? WHERE serial_no = ?";
                $ionicPlatform.ready(function(){
                    $cordovaSQLite.execute(db, query, params).then(function(res){
                        deffered.resolve(res);
                    }, function(error){
                        deffered.reject(error);
                        alert("Update " + error);
                    });
                });
            } catch(e){
                alert("Update " + e);
                deffered.reject(e);
            }

            return deffered.promise;
        },

        // Custom query
        query : function(query, param){
            var deffered = $q.defer();

            $ionicPlatform.ready(function(){
                $cordovaSQLite.execute(db, query, param).then(function(res){
                    deffered.resolve(res);
                }, function(error){
                    alert("Error: " + error.message);
                    deffered.reject(error);
                });
            });
            return deffered.promise;
        },

        // Delete
        delete : function(id){
            var deffered = $q.defer();

            $ionicPlatform.ready(function(){
                var query = "DELETE FROM units WHERE id = ?";
                $cordovaSQLite.execute(db, query, [id]).then(function(res){
                    deffered.resolve(res);
                }, function(error){
                    alert("Error: " + error);
                    deffered.reject(error);
                });
            });
            return deffered.promise;
        },
    }
})


/**
*@service PhotoSVc
*@description photos CRUD services
*/
.factory('PhotoSvc', function($filter, $cordovaSQLite, $q, $ionicPlatform){
    return {
        // Get all the unit photos
        all : function(serial){
            var deffered = $q.defer();

            $ionicPlatform.ready(function(){
                var query = "SELECT * FROM photos WHERE unit_serial = ?";
                $cordovaSQLite.execute(db, query, [serial]).then(function(res){
                    var data = $filter('sqlResultSanitize')(res);
                    deffered.resolve(data);
                }, function(error){
                    alert("Error : " + error.message);
                    deffered.reject(error);
                });
            });
            return deffered.promise;
        },

        // Create a new photo
        create : function(photoObj){
            var deffered = $q.defer();

            $ionicPlatform.ready(function(){
                var params = [];
                params[0] = photoObj.unitSerial;
                params[1] = photoObj.description;
                params[2] = photoObj.imgURL;

                // get the date today
                var dateToday = new Date();
                var month = dateToday.getMonth();
                var date = dateToday.getDate();
                var year = dateToday.getFullYear();

                // store the date in DB
                params[3] = month + '/' + date + '/' + year;

                var query = "INSERT INTO photos(unit_serial, description, imgURI, date_taken) VALUES(?, ?, ?, ?)";
                $cordovaSQLite.execute(db, query, params).then(function(res){
                    deffered.resolve(res);
                }, function(error){
                    alert("Error : " + error.message);
                    deffered.reject(error);
                });
            }); 
            return deffered.promise;
        },

        // retrieve a single photo
        read : function(id){
            var deffered = $q.defer();

            $ionicPlatform.ready(function(){
                var query = "SELECT * FROM photos WHERE id = ?";
                $cordovaSQLite.execute(db, query, [id]).then(function(res){
                    deffered.resolve(res);
                }, function(error){
                    alert("Error : " + error.message);
                    deffered.reject(error);
                });
            });
            return deffered.promise;
        },

        // delete photo
        delete : function(id){
            var deffered = $q.defer();

            $ionicPlatform.ready(function(){
                var query = "DELETE FROM photos WHERE id = ?";
                $cordovaSQLite.execute(db, query, [id]).then(function(res){
                    deffered.resolve(res);
                }, function(error){
                    alert("Error : " + error.message);
                    deffered.reject(error);
                });
            });
            return deffered.promise;
        },

        // custom query
        query : function(query, params){
            var deffered = $q.defer();

            $ionicPlatform.ready(function(){
                $cordovaSQLite.execute(db, query, params).then(function(res){
                    deffered.resolve(res);
                }, function(error){
                    alert("Error : " + error.message);
                    deffered.reject(error);
                });
            });
            return deffered.promise;
        }
    }
})


/**
*@service FileSvc
*@description file browsin and reading service
*/
.factory('FileSvc', function(
    $rootScope,
    $q,
    $ionicPlatform, 
    $ionicPopup , 
    $cordovaFile, 
    $cordovaFileOpener2
){ 
    return {

        /**
        *@function readFile
        *@description read selected excel file
        */
        read : function(){
            var deffered = $q.defer();

            /*
            // Dont work on android 4.4 and up
            var file = document.getElementById(id).files[0];
            */

            // The walk around. Using cordova-filechooser plugin
            // Todo need testing 
            fileChooser.open(function(file){

                window.resolveLocalFileSystemURL(file, gotFile, fail);

                // got file
                function gotFile(fileEntry){
                    // read file content
                    fileEntry.file(function(file){
                        var reader = new FileReader();
                
                        reader.onloadend = function(e){
                            if(file.type == "application/vnd.ms-excel"){
                                var data = e.target.result;
                                deffered.resolve(data);
                            }else {
                                deffered.reject("Invalid file");
                                alert("Upload only MS-Excel file");
                            }
                        }
                        // read the file
                        reader.readAsBinaryString(file);
                    });
                }

                // failed 
                function fail(error){
                    deffered.reject(error);
                    alert("Error : " + error.code);
                }
            });

            // return the promise object 
            return deffered.promise;
        },

        /**
        *@function createDir
        *@description create new dir in the app external storage
        */
        createDirInExternal : function(dirName){
            var deffered = $q.defer();

            try {
                $ionicPlatform.ready(function(){
                    $cordovaFile.createDir(cordova.file.externalDataDirectory, dirName, false)
                    .then(function(success){
                        deffered.resolve(success);
                    }, function(error){
                        alert("createDirInExternal " + e);
                        deffered.reject(error);
                    });
                });
            } catch(e){
                alert("createDirInExternal " + e);
                deffered.reject(e);
            }

            return deffered.promise;
        },

        /**
        *@function open
        *@description open a file using default application
        */
        fileOpener : function(path, type){
            var deffered = $q.defer();
            try{
                $ionicPlatform.ready(function(){
                    $cordovaFileOpener2.open(path, type).then(function(success){
                        deffered.resolve(success);
                    }, function(error){
                        alert("fileOpener " + error);
                        deffered.reject(error);
                    });
                });
            } catch(e){
                alert("fileOpener " + e);
                deffered.reject(e);
            }

            return deffered.promise;
        },

        /**
        *@function readDirExternal
        *@description read dirs in the external file storage 
        *@and returns the list of available dirs or file in the given path
        */
        readDirExternal : function(path){
            var deffered = $q.defer()

            try{
                // Base path
                var basePath = cordova.file.externalDataDirectory;

                $ionicPlatform.ready(function(){
                    // check if the dir already exists
                    $cordovaFile.checkDir(basePath, path).then(function(success){
                        // get the dir path localFileSystem
                        window.resolveLocalFileSystemURL(basePath + path, onResolveSuccess, fail);

                    }, function(error){
                        if(error.code == 1){
                            var confirm = $ionicPopup.confirm({
                                title :'Directory Not Pressent',
                                template : 'Do you want to create it?'
                            }).then(function(res){
                                if(res){
                                    // create the dir
                                    $cordovaFile.createDir(basePath, path).then(function(success){
                                        // Notify the user
                                        var alertPopup = $ionicPopup.alert({
                                            title : 'Directory Created'
                                        });
                                        alertPopup;

                                        // get the dir files
                                        window.resolveLocalFileSystemURL(basePath + path, onResolveSuccess, fail);

                                    }, function(error){
                                        alert("readDirExternal createDir " + error.code);
                                        deffered.reject(error.code);
                                    });
                                }
                            });
                        }else {
                            alert("readDirExternal " + error.code);
                            deffered.reject(error.code);
                        }
                    });

                    // onResolveSuccess callback
                    function onResolveSuccess(fileEntry){
                        // read the fileEntry dirs
                        var reader = fileEntry.createReader();
                        reader.readEntries(function(entries){
                            deffered.resolve(entries);
                        });
                    }

                    // onFileSystemError callback
                    function fail(evt){
                        alert('readDirExternal ' + evt.target.error.code);
                        deffered.reject(evt.targe.error.code);
                    }

                });
            } catch(e){
                alert('readDirExternal ' + e);
                deffered.reject(e);
            }

            return deffered.promise;
        },

        /**
        *@function removeDirExternal
        *@description remove all file in the selected dir path
        */
        removeDirExternal : function(dirPath){
            var deffered = $q.defer();
            try {
                $ionicPlatform.ready(function(){
                    $cordovaFile.removeDir(cordova.file.externalDataDirectory, dirPath).then(function(success){
                        deffered.resolve(success);
                    }, function(error){
                        alert("removeDirExternal " + error.code);
                        deffered.reject(error);
                    });
                });
            } catch(e){
                alert("removeDirExternal " + e);
                deffered.reject(e);
            }

            return deffered.promise;
        },

        /**
        *@function removeFile
        *@description remove a single file
        */
        removeFileExternal : function(filePath){
            var deffered = $q.defer();
            try {
                // Remove the slash in the front of the filePath
                if(filePath.charAt(0) === '/'){
                    var validFilePath = filePath.slice( 1 );  
                }

                $ionicPlatform.ready(function(){
                    // base path of the file
                    var basePath = cordova.file.externalDataDirectory;

                    $cordovaFile.removeFile(basePath, validFilePath).then(function(success){
                        deffered.resolve(success);
                    }, function(error){
                        alert("removeFile " + error);
                        deffered.reject(e);
                    });
                });
            } catch(e){
                alert("removeFileExternal " + e);
                deffered.reject(e);
            }
            return deffered.promise;
        }
    };
})

/**
*@service ExcelSvc
*@function excel services
*/
.factory('ExcelSvc', function($q, $rootScope, $cordovaFile, $ionicPlatform){
        /**
        *@function __showLoading
        *@description Loading UI function :: utility function that will show the loading status in the UI
        */
        function __showLoading(msg){
            $rootScope.$broadcast('ExcelSvc::Progress', msg);
        }

        /**
        *@function __hideLoading
        *@description Loading UI function :: utility function that will hide the loading status in the UI
        */
        function __hideLoading(){
            $rootScope.$broadcast('ExcelSvc::Done');
        }

        /**
        *@function __generateExcelFile
        *@description generate excel file
        */
        function __generateExcelFile(data, ws_name){
            var deffered = $q.defer();
            try{

               function datenum(v, date1904) {
                    if(date1904) v+=1462;
                    var epoch = Date.parse(v);
                    return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
                }
                 
                function sheet_from_array_of_arrays(data, opts) {
                    var ws = {};
                    var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
                    for(var R = 0; R != data.length; ++R) {
                        for(var C = 0; C != data[R].length; ++C) {
                            if(range.s.r > R) range.s.r = R;
                            if(range.s.c > C) range.s.c = C;
                            if(range.e.r < R) range.e.r = R;
                            if(range.e.c < C) range.e.c = C;
                            var cell = {v: data[R][C] };
                            if(cell.v == null) continue;
                            var cell_ref = XLSX.utils.encode_cell({c:C,r:R});
                            
                            // check for the cell.v data type
                            if(typeof cell.v === 'number') cell.t = 'n';
                            else if(typeof cell.v === 'boolean') cell.t = 'b';
                            else if(cell.v instanceof Date) {
                                cell.t = 'n'; cell.z = XLSX.SSF._table[14];
                                cell.v = datenum(cell.v);
                            }
                            else cell.t = 's';
                            
                            ws[cell_ref] = cell;
                        }
                    }
                    if(range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
                    return ws;
                }
                 
                function Workbook() {
                    if(!(this instanceof Workbook)) return new Workbook();
                    this.SheetNames = [];
                    this.Sheets = {};
                }
                 
                var wb = new Workbook(), ws = sheet_from_array_of_arrays(data);
                 
                /* add worksheet to workbook */
                wb.SheetNames.push(ws_name);
                wb.Sheets[ws_name] = ws;
                var wbout = XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'binary'});

                //saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), "test.xlsx")
                blobUtil.binaryStringToBlob(wbout, "application/octet-stream").then(function (blob) {
                    deffered.resolve(blob);
                }).catch(function (err) {
                  alert("binaryStringToBlob " + err);
                  deffered.reject(err);
                });

            } catch(e){
                alert("__generate " + e);
                deffered.reject(e);
            }

            return deffered.promise;
        }

        /**
        *@function __saveSync
        *@description save the file inthe application external data directory
        */
        function __saveSync(excelBlob, fileName, company) {
            var deffered = $q.defer();
            $ionicPlatform.ready(function(){
                try {

                    // split and join the fileName string
                    // to generate a valid file name and dir
                    var file = fileName.split(' ').join('') + '.xlsx';
                    var dir = company.split(' ').join('');

                    // Check the dir if it exist before saving the data
                    // if dir don't exist create it and save the data
                    $cordovaFile.checkDir(cordova.file.externalDataDirectory, dir).then(function(success){
                        // write the file using ngCordova file api
                        $cordovaFile.writeFile(cordova.file.externalDataDirectory + dir, file, excelBlob, {'append' : false})
                        .then(function(success){
                            deffered.resolve(success);

                        }, function(e){
                            deffered.reject(e);
                            alert("__saveFile WriteFile1 " + e.code)

                        });
                    }, function(error){
                        if(error.code == 1){
                            // Create the missing dir
                            $cordovaFile.createDir(cordova.file.externalDataDirectory, dir).then(function(success){
                                // Write the file
                                $cordovaFile.writeFile(cordova.file.externalDataDirectory + dir, file, excelBlob, {'append' : false})
                                .then(function(success){
                                    deffered.resolve(success);

                                }, function(e){
                                    deffered.reject(e);
                                    alert("__saveFile WriteFile1 " + e.code);
                                });

                            }, function(error){
                                deffered.reject(error);
                                alert("__saveFile CreateDir " + error.code);
                            });
                        }
                        else {
                            deffered.reject(error);
                            alert("__saveFile CheckDir " + error.code);
                        }
                    });

                } catch(e){
                    deffered.reject(e);
                    alert("__saveFile " + e);
                }
            });

            return deffered.promise;
        }

        /**
        *@function __save
        *@description save the file inthe application external data directory
        */
        function __saveFile(excelBlob, fileName, company) {
            var deffered = $q.defer();
            $ionicPlatform.ready(function(){
                try {

                    // split and join the fileName string
                    // to generate a valid file name and dir
                    var file = fileName.split(' ').join('') + '.xlsx';
                    var dir = company.split(' ').join('') + '/ExcelReports';

                    // Check the dir if it exist before saving the data
                    // if dir don't exist create it and save the data
                    $cordovaFile.checkDir(cordova.file.externalDataDirectory, dir).then(function(success){
                        // write the file using ngCordova file api
                        $cordovaFile.writeFile(cordova.file.externalDataDirectory + dir, file, excelBlob, {'append' : false})
                        .then(function(success){
                            deffered.resolve(success);

                        }, function(e){
                            deffered.reject(e);
                            alert("__saveFile WriteFile1 " + e.code)

                        });
                    }, function(error){
                        if(error.code == 1){
                            // Create the missing dir
                            $cordovaFile.createDir(cordova.file.externalDataDirectory, dir).then(function(success){
                                // Write the file
                                $cordovaFile.writeFile(cordova.file.externalDataDirectory + dir, file, excelBlob, {'append' : false})
                                .then(function(success){
                                    deffered.resolve(success);

                                }, function(e){
                                    deffered.reject(e);
                                    alert("__saveFile WriteFile1 " + e.code);
                                });

                            }, function(error){
                                deffered.reject(error);
                                alert("__saveFile CreateDir " + error.code);
                            });
                        }
                        else {
                            deffered.reject(error);
                            alert("__saveFile CheckDir " + error.code);
                        }
                    });

                } catch(e){
                    deffered.reject(e);
                    alert("__saveFile " + e);
                }
            });

            return deffered.promise;
        }

        /**
        *@function __completeReportFrmt
        *@description generate a complete report format about the units
        */
        function __completeReportFrmt (data){
            var deffered = $q.defer();
            try{
                // template array
                var tpl = [
                            ['model', 
                            'serial_no', 
                            'inspection_date', 
                            'dop', 
                            'expiration_date', 
                            'date_refilled', 
                            'location', 
                            'Hose/Nozzle', 
                            'accessible', 
                            'safety_pin', 
                            'pressure_gauge', 
                            'label', 
                            'corrosion', 
                            'turned_upside_down', 
                            'signs', 
                            'status', 
                            'missing']
                          ];

                for(var i = 0; i < data.length; i++){
                    // convert object to array 
                    var value = [];

                    // push all object data into the array using for in 
                    // to insure that this code will work the same in all devices
                    value.push(data[i].model);
                    value.push(data[i].serial_no);
                    value.push(data[i].inspection_date);
                    value.push(data[i].dop);
                    value.push(data[i].expiration_date);
                    value.push(data[i].date_refilled);
                    value.push(data[i].location);
                    value.push(data[i].checklist1);
                    value.push(data[i].checklist2);
                    value.push(data[i].checklist3);
                    value.push(data[i].checklist4);
                    value.push(data[i].checklist5);
                    value.push(data[i].checklist6);
                    value.push(data[i].checklist7);
                    value.push(data[i].checklist8);
                    value.push(data[i].status);
                    value.push(data[i].missing);

                    // store the value into the template
                    tpl.push(value);
                }

                deffered.resolve(tpl);

            } catch(e){
                alert("__completeReportFrmt " + e);
                deffered.reject(e);
            }

            return deffered.promise;
        }

        /**
        *@function __summaryReportFrmt
        *@description generate a summary report format about the company
        */
        function __summaryReportFrmt(data){
            var deffered = $q.defer();
            try{
                // Summary template
                var tpl = [
                            ["Last Inspection",
                            "Total Units", 
                            "Operational", 
                            "Deffective", 
                            "Missing Units",
                            "Near Expiration",
                            "Expired", 
                            "Not Inspected", 
                            "deffective Discharge hose nozzle", 
                            "Not Easily accessible", 
                            "Safety pin not inplace", 
                            "Deffective pressure gauge/showing recharge",
                            "Label not readable",
                            "Rusty or has corrosion",
                            "Location not easily identifiable"]
                          ];

                var value = [];

                value.push(data.lastInspect);
                value.push(data.totalUnits);
                value.push(data.good);
                value.push(data.deffective);
                value.push(data.missingUnits);
                value.push(data.newExpire);
                value.push(data.expired);
                value.push(data.notInspectedUnits);
                value.push(data.checklist1Total);
                value.push(data.checklist2Total);
                value.push(data.checklist3Total);
                value.push(data.checklist4Total);
                value.push(data.checklist5Total);
                value.push(data.checklist6Total);
                value.push(data.checklist8Total);

                tpl.push(value);

                deffered.resolve(tpl);

            } catch(e){
                alert("__summaryReportFrmt " + e);
                deffered.reject(e);
            }
            return deffered.promise;
        }

        /**
        *@function __syncFormatUnits
        *@description generate a summary report format about the company
        */
        function __syncFormatUnits(data){
            var deffered = $q.defer();

             try{
                // Summary template
                var tpl = [
                            ["company_name",
                            "model", 
                            "serial_no", 
                            "inspection_date", 
                            "dop",
                            "expiration_date",
                            "date_refilled", 
                            "location", 
                            "checklist1", 
                            "checklist2", 
                            "checklist3", 
                            "checklist4",
                            "checklist5",
                            "checklist6",
                            "checklist7",
                            "checklist8",
                            "status",
                            "missing",
                            "expired"]
                          ];

                for(var i =0; i < data.length; i++){
                    var value = [];

                    value.push(data[i].company_name);
                    value.push(data[i].model);
                    value.push(data[i].serial_no);
                    value.push(data[i].inspection_date);
                    value.push(data[i].dop);
                    value.push(data[i].expiration_date);
                    value.push(data[i].date_refilled);
                    value.push(data[i].location);
                    value.push(data[i].checklist1);
                    value.push(data[i].checklist2);
                    value.push(data[i].checklist3);
                    value.push(data[i].checklist4);
                    value.push(data[i].checklist5);
                    value.push(data[i].checklist6);
                    value.push(data[i].checklist7);
                    value.push(data[i].checklist8);
                    value.push(data[i].status);
                    value.push(data[i].missing);
                    value.push(data[i].expired);

                    tpl.push(value);
                }
                deffered.resolve(tpl);

            } catch(e){
                alert("__summaryReportFrmt " + e);
                deffered.reject(e);
            }

            return deffered.promise;
        }

        /**
        *@function __syncFormatCompanies
        *@description generate sync data for companies
        */
        function __syncFormatCompanies(data){
            var deffered = $q.defer();

            try{
                var tpl = [
                            ["id",
                            "name",
                            "person",
                            "contact_no",
                            "inspect_date",
                            "start"]
                          ];

                for(var i = 0; i < data.length; i++){
                    var value = [];

                    value.push(data[i].id);
                    value.push(data[i].name);
                    value.push(data[i].person);
                    value.push(data[i].contact_no);
                    value.push(data[i].inspect_date);
                    value.push(data[i].start);

                    tpl.push(value);
                }

                deffered.resolve(tpl);

            } catch(e){
                alert("__syncFormatCompanies " + e);
                deffered.reject(e);
            }

            return deffered.promise;
        }

    return {
        /**
        *@function generate
        *@description generate excel file
        */
        generate : function(){
            var deffered = $q.defer();
                try{
                // get data from the localStorage
                var data = angular.fromJson(localStorage.getItem('report'));
                // get the company name
                var company = localStorage.getItem('company');
                //alert(localStorage.getItem('company'));
                // get the document name
                var docTitle = localStorage.getItem('docTitle');
                //alert(localStorage.getItem('docTitle'));

                var ws_name = docTitle;

                if(angular.isArray(data)){
                    // generate a complete report format
                    __showLoading("Preparing data...");
                    __completeReportFrmt(data).then(function(tpl){
                        __showLoading('Generating Excel File');
                        return __generateExcelFile(tpl, ws_name);
                    }).then(function(excelBlob){
                        __showLoading('Saving File...');
                        return __saveFile(excelBlob, docTitle, company);
                    }).then(function(success){
                        __hideLoading();
                        deffered.resolve(success);
                    }, function(error){
                        __hideLoading();
                        alert("saveFile " + error);
                        deffered.reject(error);
                    });
                } else{
                    // generate a summary report format
                    __showLoading('Preparing data...');
                    __summaryReportFrmt(data).then(function(tpl){
                        __showLoading('Generating Excel File');
                        return __generateExcelFile(tpl, ws_name);
                    }).then(function(excelBlob){
                        __showLoading('Saving File...');
                        return __saveFile(excelBlob, docTitle, company);
                    }).then(function(success){
                        __hideLoading();
                        deffered.resolve(success);
                    }, function(error){
                        __hideLoading();
                        alert("saveFile " + error);
                        deffered.reject(error);
                    });
                }
            } catch(e){
                alert("generate " + e);
                deffered.reject(e);
            }

            return deffered.promise;
        },

        /**
        *@function genForSycnUnits
        *@description generate data for synchronizing with other dive
        */
        genForSycnUnits : function(data){
            var deffered = $q.defer()
            try{
                var ws_name = 'SyncDataUnits';

                // generate a summary report format
                __showLoading('Preparing data...');
                __syncFormatUnits(data).then(function(tpl){
                    __showLoading('Generating Excel File');
                    return __generateExcelFile(tpl, ws_name);
                }).then(function(excelBlob){
                    __showLoading('Saving units data...');
                    return __saveSync(excelBlob, 'SyncDataUnits', 'Backup');
                }).then(function(success){
                    __hideLoading();
                    deffered.resolve(success);
                }, function(error){
                    __hideLoading();
                    alert("saveFile " + error);
                    deffered.reject(error);
                });

            } catch(e){
                alert("generate " + e);
                deffered.reject(e);
            }
            return deffered.promise;
        },

        /**
        *@function genForSycnCompnies
        *@description generate data for synchronizing with other dive
        */
        genForSycnCompanies : function(data){
            var deffered = $q.defer()
            try{
                var ws_name = 'SyncDataCompanies';

                // generate a summary report format
                __showLoading('Preparing data...');
                __syncFormatCompanies(data).then(function(tpl){
                    __showLoading('Generating Excel File');
                    return __generateExcelFile(tpl, ws_name);
                }).then(function(excelBlob){
                    __showLoading('Saving companies data...');
                    return __saveSync(excelBlob, 'SyncDataCompanies', 'Backup');
                }).then(function(success){
                    __hideLoading();
                    deffered.resolve(success);
                }, function(error){
                    __hideLoading();
                    alert("saveFile " + error);
                    deffered.reject(error);
                });

            } catch(e){
                alert("generate " + e);
                deffered.reject(e);
            }
            return deffered.promise;
        },

        /**
        *@function parse
        *@description parse the selected excel file
        */
        parse : function(data){
            var deffered = $q.defer();

            var workbook = XLSX.read(data, {type: 'binary'});
            var first_sheet_name = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[first_sheet_name];

            var data = XLSX.utils.sheet_to_json(worksheet);

            deffered.resolve(data);

            return deffered.promise;
        }
    };
})


/**
*@service PDFSvc
*@function excel services
*/
.factory('PDFSvc', function($q, $timeout, $rootScope, $cordovaFile, $ionicPlatform){
    /**
    *@function __showLoading
    *@description Loading UI function :: utility function that will show the loading status in the UI
    */
    function __showLoading(msg){
        $rootScope.$broadcast('PDFSvc::Progress', msg);
    }

    /**
    *@function __hideLoading
    *@description Loading UI function :: utility function that will hide the loading status in the UI
    */
    function __hideLoading(){
        $rootScope.$broadcast('PDFSvc::Done');
    }

    /**
    *@function __generatePDF
    *@description generate the PDF document
    */
    function __generatePDF(docDef){
        var deffered = $q.defer();

        try {
            var pdfDoc = window.pdfMake.createPdf(docDef).getBuffer(function(buffer){
                deffered.resolve(buffer);
            });
        } catch(e){
            alert("__generatePDF" + e);
            console.log(e);
            deffered.reject(e);
        }

        return deffered.promise;
    }  

    /**
    *@function __getBlob
    *@description convert data url to blob
    */
    function __getBlob(buffer){
        var deffered = $q.defer();
        try {
            window.blobUtil.arrayBufferToBlob(buffer, 'application/pdf').then(function(blob){
                deffered.resolve(blob);
            }, function(e){
                deffered.reject(e);
                alert(e);
            });
        } catch(e){
            deffered.reject(e);
            alert("__getBlob " + e);
        }

        return deffered.promise;
    }

    /**
    *@function __saveFile
    *@description use the ngCordova file plugin to save the pdfBlob and return a filePath to the client
    */
    function __saveFile(pdfBlob, fileName, company) {
        var deffered = $q.defer();
        $ionicPlatform.ready(function(){
            try {

                // split and join the fileName string
                // to generate a valid file name and dir
                var file = fileName.split(' ').join('') + '.pdf';
                var dir = company.split(' ').join('') + '/PDFReports';

                // Check the dir if it exist before saving the data
                // if dir don't exist create it and save the data
                $cordovaFile.checkDir(cordova.file.externalDataDirectory, dir).then(function(success){
                    // write the file using ngCordova file api
                    $cordovaFile.writeFile(cordova.file.externalDataDirectory + dir, file, pdfBlob, {'append' : false})
                    .then(function(success){
                        deffered.resolve(success);

                    }, function(e){
                        deffered.reject(e);
                        alert("__saveFile WriteFile1 " + e.code)

                    });
                }, function(error){
                    if(error.code == 1){
                        // Create the missing dir
                        $cordovaFile.createDir(cordova.file.externalDataDirectory, dir).then(function(success){
                            // Write the file
                            $cordovaFile.writeFile(cordova.file.externalDataDirectory + dir, file, pdfBlob, {'append' : false})
                            .then(function(success){
                                deffered.resolve(success);

                            }, function(e){
                                deffered.reject(e);
                                alert("__saveFile WriteFile1 " + e.code);
                            });

                        }, function(error){
                            deffered.reject(error);
                            alert("__saveFile CreateDir " + error.code);
                        });
                    }
                    else {
                        deffered.reject(error);
                        alert("__saveFile CheckDir " + error.code);
                    }
                });

            } catch(e){
                deffered.reject(e);
                alert("__saveFile " + e);
            }
        });

        return deffered.promise;
    }

        /**
        *@function completeReportFrmt
        *@description generate a complete report pdf format of the units
        */
        function __completeReportFrmt(data, companyName){
            var deffered = $q.defer();

            try {
                // base pdfMake declaration
                var dd = {
                    header : {
                            columns: [
                              
                            ]
                    },

                    content : [
                        // will created dymaicaly
                    ],

                    styles: {
                            // header
                            header : {
                                fontSize : 22
                            },
                            
                            // status
                            status : {
                                margin : [100, 5, 100, 5]
                            },

                            // subheader
                            subHeader : {
                                fontSize : 18,
                                margin: [0, 5, 0, 5],
                                bold: true
                            },
                            
                            // spacer
                            space : {
                                margin : [0, 10, 0, 0]
                            },
                            
                            // center
                            center : {
                                margin : [, 5, , 5]
                            },
                            
                            // table
                            rows: {
                                margin: [0, 5, 0, 5]
                            }
                        }
                };

                // generate pdf content dynamicaly
                for(var i = 0; i < data.length; i++){
                    //dd.header.columns.push({ text: 'Page ' + (i+1) + ' of ' + data.length, alignment: 'center', style: 'rows' });
                    dd.content.push({ text : 'SAFEWAY', style : 'header'});

                    // Table 1
                    dd.content.push(
                                { 
                                    style: 'space',
                                    table: {
                                            // headers are automatically repeated if the table spans over multiple pages
                                            // you can declare how many rows should be treated as headers
                                            headerRows: 1,
                                            widths: [ 100, '*'],

                                            body: [
                                              [ {text: 'Company Name', style: 'rows'}, {text : companyName, style: 'rows'}],
                                              [ {text: 'Unit Model', style: 'rows'}, {text : data[i].model, style: 'rows'} ],
                                              [ {text : 'Serial No.', style: 'rows'}, {text : data[i].serial_no, style: 'rows'}],
                                              [ {text: 'Date Aquired', style: 'rows'}, {text : data[i].dop, style: 'rows'}],
                                              [ {text: 'Date Refilled', style: 'rows'}, {text : data[i].date_refilled, style: 'rows'}],
                                              [ {text: 'Expiration Date ', style: 'rows'}, {text : data[i].expiration_date, style: 'rows'}]
                                            ]
                                    }
                                });
                    
                    // Table 2
                    dd.content.push(
                                {   
                                    style: 'space',
                                    table: {
                                        headerRows: 1,
                                        widths: [100, '*'],
                                        
                                        body: [
                                            [{text : 'Location', style : 'rows'}, {text : data[i].location}],
                                            [{text : 'Overal Status', style: 'rows'}, {text : data[i].status}],
                                            [{text : 'Missing', style: 'rows'}, {text : data[i].missing}],
                                            [{text : 'Last Inspection', style: 'rows'}, {text : data[i].inspection_date, style : 'rows'}]
                                        ]
                                    }
                                });

                    // Table 3
                    dd.content.push(
                                {
                                    style : 'space',
                                    table: {
                                        headerRows: 1,
                                        widths: ['*'],
                                        
                                        body: [
                                            [{text : 'Inspection Report', style : 'subHeader'}]
                                        ]
                                    }
                                });

                    // Table 4
                    dd.content.push(
                                {
                                    table: {
                                        headerRoes: 1,
                                        widths: ['*', '*'],
                                        
                                        body: [
                                            [{text : 'Discharge hose nozzle is in good condition and not clogged, cracked, or broken.', style : 'rows'}, {text : data[i].checklist1, style: 'status'}],
                                            [{text : 'It is mounted in an easily accessible area, with nothing stacked around it.', style : 'rows'}, {text : data[i].checklist2, style: 'status'}],
                                            [{text : 'Safety Pin is in place and not damaged.', style: 'rows'}, {text : data[i].checklist3, style: 'status'}],
                                            [{text : 'Pressure gauge is in the green and not damaged or showing “recharge”', style: 'rows'}, {text : data[i].checklist4, style: 'status'}],
                                            [{text : 'Label is readable and displays the type of fire extinguisher and the instructions for use', style: 'rows'}, {text : data[i].checklist5, style: 'status'}],
                                            [{text : 'It is not rusty, or has any type of corrosion build up.', style : 'rows'}, {text : data[i].checklist6, style: 'status'}],
                                            [{text : 'Extinguisher was turned upside down at least three times. (Shaken)', style : 'rows'}, {text : data[i].checklist7, style: 'status'}],
                                            [{text : 'The location of the extinguisher is easily identifiable. (Signs)', style : 'rows'}, {text : data[i].checklist8, style: 'status'}]
                                        ]
                                    }
                                });
                    
                    // Page Break
                    dd.content.push({ text: '', fontSize: 14, bold: true, pageBreak: 'before', margin: [0, 0, 0, 8] });
                } // end of for loop
                
                // pass doc defination
                $timeout(function(){
                    deffered.resolve(dd);
                }, 100);

            } catch(e){
                alert("__completeReportFrmt " + e);
                deffered.reject(e);
            }
            return deffered.promise;
        }

        /**
        *@function summaryReportFrmt
        *@description  genereate summary report PDf file
        */
        function __summaryReportFrmt(data, companyName){
            var deffered = $q.defer();
            console.log(data);

            try {
                // convert data number values to string
                var lastInspect = (data.lastInspect == null) ? 'N/A' : data.lastInspect;
                var totalUnits = data.totalUnits.toString();
                var deffective = data.deffective.toString();
                var good = data.good.toString();
                var notInspectedUnits = (data.notInspectedUnits == null) ? '0' : data.notInspectedUnits.toString();
                var missingUnits = data.missingUnits.toString();
                var nearExpire = data.nearExpire.toString();
                var expired = data.expired.toString();

                // checklist summary report
                var checklist1Total = data.checklist1Total.toString();
                var checklist2Total = data.checklist2Total.toString();
                var checklist3Total = data.checklist3Total.toString();
                var checklist4Total = data.checklist4Total.toString();
                var checklist5Total = data.checklist5Total.toString();
                var checklist6Total = data.checklist6Total.toString();
                var checklist8Total = data.checklist8Total.toString();

                // report format
                var dd = {
                    content: [
                        {text : 'SAFEWAY', style: 'header'},
                        
                        // table 1
                        {
                            table : {
                                headerRows : 1,
                                widths : [100, '*'],
                                
                                body : [
                                    [{text : 'Company Name', style : 'rows'}, {text : companyName, style : 'rows'}],
                                    [{text : 'Last Inspection', style : 'rows'}, {text : lastInspect , style : 'rows'}]
                                ]
                            }
                        },
                        
                        // table 2
                        {
                            style: 'space',
                            table : {
                              headerRows : 1,
                              widths : ['*'],
                              
                              body : [
                                    [{text : 'Company Inspection Summary Report', style : 'rows'}]
                              ]
                          }  
                        },
                        
                        // table 3
                        {
                            table : {
                                headerRows : 1,
                                widths : [100, '*'],
                                
                                body : [
                                    [{text : 'Total Units', style : 'rows'}, {text : totalUnits, style : 'value'}],
                                    [{text : 'Passed', style :'rows'}, {text: good, style : 'value'}],
                                    [{text : 'Failed', style : 'rows'}, {text: deffective, style : 'value'}],
                                    [{text : 'Not Inspected', style: 'rows'}, {text: notInspectedUnits, style : 'value'}],
                                    [{text : 'Missing Units', style: 'rows'}, {text: missingUnits, style : 'value'}],
                                    [{text : 'Near Expiration', style : 'rows'}, {text: nearExpire, style : 'value'}],
                                    [{text : 'Expired', style : 'rows'}, {text: expired, style: 'value'}]
                                ]
                            }
                        },
                        
                        // table 4
                        {
                            style: 'space',
                            table : {
                                headerRows : 1,
                                widths : ['*'],
                                
                                body : [
                                    [{text : 'Checklist Summary Report', style: 'rows'}]
                                ]
                            }
                        },
                        
                        // table 5
                        {
                          table : {
                              headerRows : 1,
                              widths : ['*', '*'],
                              
                              body : [
                                [{text : 'Discharge Hose/nozzle is not in good shape.', style: 'rows'}, {text: checklist1Total, style: 'value'}],
                                [{text : 'Not mounted in an easily accessible area.', style: 'rows'}, {text: checklist2Total, style: 'value'}],
                                [{text : 'Safety Pin is not in place and damaged.', style: 'rows'}, {text: checklist3Total, style: 'value'}],
                                [{text : 'Pressure gauge is not in the green or damaged or showing “recharge”', style: 'rows'}, {text: checklist4Total, style: 'value'}],
                                [{text : "Label is not readable, don't display the type of fire extinguisher and the instructions for use", style: 'rows'}, {text: checklist5Total, style: 'value'}],
                                [{text : 'Rusty, or has any type of corrosion build up.', style: 'rows'}, {text: checklist6Total, style: 'value'}],
                                [{text : 'The location of the extinguisher is not easily identifiable.  (signs)', style: 'rows'}, {text : checklist8Total, style: 'value'}]
                              ]
                          }  
                        }
                    ],
                    
                    styles : {
                          header : {
                              fontSize: 22
                          },
                          
                          rows : {
                              margin : [0, 5, 0, 5]
                          },
                          
                          space : {
                              margin : [0, 10, 0, 0]
                          },

                          value : {
                              margin : [100, 5, 100, 5]
                          }
                    }
                };

                // pass doc defination
                $timeout(function(){
                    deffered.resolve(dd);
                }, 100);

            } catch(e){
                alert("__summaryReportFrmt " + e);
                console.log(e);
                deffered.reject(e);
            }

            return deffered.promise;
        }

    return {
        /**
        *@function completeReport
        *@description generate complete report pdf file
        */
        generate : function(){
            var deffered = $q.defer();
            try{

                // get data from the localStorage
                var data = angular.fromJson(localStorage.getItem('report'));
                console.log(data);
                // get the company name
                var company = localStorage.getItem('company');
                //alert(localStorage.getItem('company'));
                // get the document name
                var docTitle = localStorage.getItem('docTitle');
                //alert(localStorage.getItem('docTitle'));

                // check if the returned data is an array
                if(angular.isArray(data)){
                    // Unit Records report format
                    __showLoading('Preparing data...');
                    __completeReportFrmt(data, company).then(function(docDef){
                        __showLoading('Generating data buffer...');
                        return __generatePDF(docDef);
                    }).then(function(buffer){
                        __showLoading('Generating data blob...');
                        return __getBlob(buffer);
                    }).then(function(pdfBlob){
                        __showLoading('Saving file to storage...');
                        return __saveFile(pdfBlob, docTitle, company);
                    }).then(function(success){
                        __hideLoading();
                        deffered.resolve(success);
                    }, function(error){
                        __hideLoading();
                        deffered.reject(error);
                    });


                }else {
                    // Company Summary report Format
                    __showLoading('Preparing data...');
                    __summaryReportFrmt(data, company).then(function(docDef){
                        __showLoading('Generating data buffer...');
                        return __generatePDF(docDef);
                    }).then(function(buffer){
                        __showLoading('Generating data blob...');
                        return __getBlob(buffer);
                    }).then(function(pdfBlob){
                        __showLoading('Saving file to storage...');
                        return __saveFile(pdfBlob, docTitle, company);
                    }).then(function(success){
                        __hideLoading();
                        deffered.resolve(success);
                    }, function(error){
                        __hideLoading();
                        deffered.reject(error);
                    });
                }
            } catch(e){
                alert("generate" + e);
            }


            return deffered.promise;
        }
    };
});