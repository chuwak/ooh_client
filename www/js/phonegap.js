//============  camera  ===============

function getImageFromCamera(type, callback) {
    if (!isDeviceReady()) {
        return false;
    }
    var sourceType = Camera.PictureSourceType.CAMERA;
    if (type === 'saved') {
        sourceType = Camera.PictureSourceType.PHOTOLIBRARY;//   SAVEDPHOTOALBUM;
    }
    navigator.camera.getPicture(
//            onSuccessCapture,
            function (mediaFiles) {
                if (typeof (mediaFiles) === 'string') {
                    var fileObj = {};
                    fileObj.fakePath = mediaFiles;
                    // name is fake on localstorage and real on camera, will be replaced
                    fileObj.name = mediaFiles.substr(mediaFiles.lastIndexOf('/') + 1);
                    mediaFiles = [];
                    mediaFiles.push(fileObj);
                }
                log('photo captured success');

                var mediaFile = mediaFiles[0];

                //alert('mediaFiles 1   ...\n'+JSON.stringify(mediaFiles));

                window.resolveLocalFileSystemURL(mediaFile.fakePath,
                        function (fileEntry) {

                            //alert('resolveLocalFileSystemURL: ' + JSON.stringify(fileEntry));
                            mediaFile.nativePath = fileEntry.nativeURL;
                            //mediaFile.relativePath = fileEntry.fullPath;
                            mediaFiles[0] = mediaFile;
                            //alert('mediaFiles 2   ...\n'+JSON.stringify(mediaFiles));
                            callback({status: {success: true}, mediaFiles: mediaFiles});
                        },
                        function (error) {
                            callback({status: {error: true}, error: 'resolveLocalFileSystemURL error:  \n imageURI: ' + imageURI + ' \n' + JSON.stringify(error)});
                        }
                );
            },
            function (message) {
                if (message.indexof('no image selected') > -1) {
                    // no need to show error message;
                } else {
                    log('error on capturing photo: ' + message);
                    callback({status: {error: true}, error: message});
                }
            },
            {
                quality: 90,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: sourceType
            }
    );

}







//=============  file  ==============

//==copy or move===
function moveOrCopyFile(imageURI, newName, action, callback) {

    // resolve file system for image
    window.resolveLocalFileSystemURL(imageURI,
            gotFileEntry,
            function (error) {
                callback({status: {error: true}, error: 'resolveLocalFileSystemURL error:  \n imageURI: ' + imageURI + ' \n' + JSON.stringify(error)});
            }
    );

    function gotFileEntry(fileEntry) {
        // get file system to copy or move image file
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
                gotFileSystem,
                function (error) {
                    callback({status: {error: true}, error: 'requestFileSystem error:  \n imageURI: ' + imageURI + ' \n' + JSON.stringify(error)});
                }
        );

        function gotFileSystem(fileSystem) {

            fileSystem.root.getDirectory("OOH", {
                create: true
            }, function (dataDir) {
                // copy the file
                if (action === 'move') {
                    fileEntry.moveTo(dataDir, newName, function (entry) {
                        callback({status: {success: true}, data: entry});
                    }, function (error) {
                        callback({status: {error: true}, error: 'File entry, moveTo error: \n imageURI: ' + imageURI + ' \n' + JSON.stringify(error)});
                    });
                } else {
                    fileEntry.copyTo(dataDir, newName, function (entry) {
                        callback({status: {success: true}, data: entry});
                    }, function (error) {
                        callback({status: {error: true}, error: 'File entry, copyTo error:  \n imageURI: ' + imageURI + ' \n' + JSON.stringify(error)});
                    });
                }

            }, function (error) {
                callback({status: {error: true}, error: 'Directory error:  \n imageURI: ' + imageURI + ' \n' + JSON.stringify(error)});
            });

        }


    }


}



//===== ohter






/**
 * function is not synchronous
 * */
function readFileWithCallback(relPathToFile, callback) {
    var tempRelPathToFile = null;
    var tempCallbackFunction = null;

    //alert('readFileWithCallback: ' + relPathTofile);
    if (relPathToFile.charAt(0) === '/') {
        relPathToFile = relPathToFile.substr(1);
    }
    if (!callback) {
        showErrorMessage('callback for function readFileWithCallback not setted');
    }
    tempRelPathToFile = relPathToFile;
    tempCallbackFunction = callback;

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
            gotFS,
            function (error) {
                tempCallbackFunction({status: {error: true}, error: 'requestFileSystem:\n ' + tempRelPathToFile + '\n error \n' + JSON.stringify(error)});
            });

    function gotFS(fileSystem) {
        fileSystem.root.getFile(tempRelPathToFile, null,
                gotFileEntry,
                function (error) {
                    tempCallbackFunction({status: {error: true}, error: 'FileSystem getting file : "' + tempRelPathToFile + '"\n error \n' + JSON.stringify(error)});
                }
        );
    }

    function gotFileEntry(fileEntry) {
        fileEntry.file(
                gotFile,
                function (error) {
                    tempCallbackFunction({status: {error: true}, error: 'File Entry error : "' + tempRelPathToFile + '"\n error \n' + JSON.stringify(error)});
                }
        );
    }

    function gotFile(file) {
        var reader = new FileReader();
        reader.onloadend = function (evt) {
            if (!tempCallbackFunction) {
                alert('tempCallbackFunction not defined');
            }
            tempCallbackFunction({status: {success: true}, data: reader.result});
        };
        //reader.readAsBinaryString(file);
        reader.readAsDataURL(file);
    }

}




function isExistsFileOnDisk(relPathToFile, callback) {
    var tempRelPathToFile = null;
    var tempCallbackFunction = null;

    if (relPathToFile.charAt(0) === '/') {
        relPathToFile = relPathToFile.substr(1);
    }
    if (!callback) {
        showErrorMessage('callback for function readFileWithCallback not setted');
    }
    tempRelPathToFile = relPathToFile;
    tempCallbackFunction = callback;

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
            gotFS,
            function (error) {
                tempCallbackFunction({status: {error: true}, error: 'requestFileSystem:\n ' + tempRelPathToFile + '\n error \n' + JSON.stringify(error)});
            });

    function gotFS(fileSystem) {
        fileSystem.root.getFile(tempRelPathToFile, null,
                tempCallbackFunction({status: {success: true}, data: true}),
                function (error) {
                    tempCallbackFunction({status: {success: true}, data: false});
                }
        );
    }
}







//=================  geolocation  =============


function getCurrentPosition(callback, innerTtimeout) {
    //if(! isDeviceReady() ){ return false;}
    var timeout = 100;
    if (innerTtimeout) {
        timeout = innerTtimeout;
    }
    navigator.geolocation.getCurrentPosition(
            function (position) {
                ooh.coordinates = {lat: position.coords.latitude, lng: position.coords.longitude};
                callback({status: {success: true}, data: position.coords});
            },
            function (error) {
                log('geolocation error. will be returned last saved coordinates' + JSON.stringify(error));
                callback({status: {success: true}, data: {latitude: ooh.coordinates.lat, longitude: ooh.coordinates.lng}});
                //callback({status: {error: true}, error: 'geolocation error:\n'+ JSON.stringify(error)});
            },
            {timeout: timeout, enableHighAccuracy: true, maximumAge: 60000}
    );
}





function uploadFile(url, mediaFile, filename, formParams, fileKey, callback) {
    if(!callback){
        showErrorMessage('callack not defined');
    }
    if (!isDeviceReady()) {
        callback({status: {error: true}, error: eMsg.deviceNotReady});
        return false;
    }
    

    var isConnected = checkConnection();
    if (!isConnected) {
        //callback({status:'error', error: eMsg.tryLater});
        $.unblockUI();
        return false;
    }

    //alert(url +'\n' + dump(mediaFile)+ '\n'+filename +'\n'+dump(formParams)+ '\n'+fileKey);
    var path = mediaFile.fullPath;
    var name = filename ? filename : mediaFile.name;

    var options = new FileUploadOptions();
    options.fileKey = fileKey;
    options.fileName = name;
    options.mimeType = "image/jpeg";

    options.params = formParams;
    options.chunkedMode = false;
    options.headers = {
        Connection: "close"
    };

    var $uploadBlock = $('#upload-block');
    var $percentageComplete = $('#upload-percentage-complete');
    $percentageComplete.html('0 %');
    $uploadBlock.show();

    var ft = new FileTransfer();


    ft.upload(path, url,
            uploadSuccess,
            uploadError,
            options
            );

    function uploadSuccess(response) {
        if (!response || response === '') {
            callback({status: {error: true}, error: eMsg.voidResponse});
            $.unblockUI();
            return;
        }
        try {
            var result = JSON.parse(response.response);

        } catch (e) {
            log('response: \n' + dump(response) + '\n\n error e \n:' + JSON.stringify(e));
            callback({status: {error: true}, error: 'response: \n' + dump(response) + '\n\n error e \n:' + JSON.stringify(e)});
        }
        var status = result.status;
        if (status === 'success') {
            log('photo uploaded success');
            callback({status: {success: true}, data: result.data});
        } else {
            log('error after uploading file: ' + JSON.stringify(result));
            callback({status: {error: true}, error: result.errors});
        }
        $uploadBlock.hide();
    }

    function uploadError(errorObj) {
        log('error on uploading file: ' + dump(errorObj));
        callback({status: {error: true}, error: errorObj.body});
        $uploadBlock.hide();
    }



    var timeout = setTimeout(function () {
        ft.abort();
        $uploadBlock.hide();
        showErrorMessage(eMsg.timeoutReached);
        return false;
    }, 10000);

    ft.onprogress = function (progressEvent) {
        clearTimeout(timeout);
        if (progressEvent.lengthComputable) {
            var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
            $percentageComplete.html(perc + ' % ');
        } else {
            $percentageComplete.html('...');
        }
    };
}



function openDocument(url) {
    if(isMobile){
        openSiteInDefaultBrowser(url);
    }else{
        window.open(url,'_blank');
    }
}


function openSiteInDefaultBrowser(url) {
    log('open external url: ' + url);
    if (isIos) {
        window.open(url, '_system');
    } else {
        navigator.app.loadUrl(url, {openExternal: true});
    }
    return false;
}