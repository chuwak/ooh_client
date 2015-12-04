
//ooh.host = 'http://www.app.oohmanager.com/';
//ooh.host = 'http://localhost/ooh/';
ooh.host = 'http://b.www.rocbeta.com/';

var urls = {
    login: 'api/login', // contractor.json
    workOrders: 'api/getworkordersbyuserid', //'works.json'
    save: 'api/answer',
    uploadPhoto: 'api/uploadPhoto',
    timeline: 'api/timeLine',
    help: 'api/getHelp',
    file: 'api/getFiles',
    version: 'api/getVersion',
    download: 'apk/ooh.apk'
};


function authorizeOnServer(callback) {
    var $loginForm = $('#login-form');
    var formData = $loginForm.serialize();
    var url = ooh.host + urls.login;

    var params = {
        url: url,
        type: 'POST',
        formData: formData
    };

    function after (result) {
        if (result.status.success) {
            var contractor = new Contractor(result.data.Contractor);
            result.data.Contractor = contractor;
        }
        callback(result);
    };

    ajaxRequest(params, after);
    return false;
}


function getAllWorkOrders(callback) {
    var url = ooh.host + urls.workOrders;
    var params = {
        url: url,
        type: 'POST',
        formData: {user_id: ooh.contractor.id},
        blockText: msg.updating 
    };
    ajaxRequest(params, after);

    function after(result) {
        if (result.status.success) {
            var workOrders = [];
            for (var i in result.data.WorkOrders) {
                var oneWokrJson = result.data.WorkOrders[i];
                var workOrder = new WorkOrder(oneWokrJson);
                workOrders.push(workOrder);
            }

            result.data.WorkOrders = workOrders;
        }
        callback(result);
    }
}

function getFiles(callback){
    var url = ooh.host + urls.file;
    var params = {
        url: url,
        dataType: 'text',
        formData: {user_id: ooh.contractor.id}
    };
    ajaxRequest(params, after);
    function after (result) {
        callback(result);
    };
}

function getHelp(callback){
    var url = ooh.host + urls.help;
    var params = {
        url: url,
        dataType: 'text',
        formData: {user_id: ooh.contractor.id}
    };
    ajaxRequest(params, after);
    function after (result) {
        callback(result);
    };
}



function getServerAppVersion(callback){
    var url = ooh.host + urls.version;
    var params = {
        url: url,
        formData: {user_id: ooh.contractor.id}
    };
    ajaxRequest(params, after);
    function after (result) {
        callback(result);
    };
}


function sendObjectsToServer(data, callback) {
    var url = ooh.host + urls.timeline;
    var params = {
        url: url,
        type: 'POST',
        formData: {data: data, user_id: ooh.contractor.id},
        needBlock: true
    };
    ajaxRequest(params, callback);
}





function ajaxRequest(params, callback) {
    hideKeyboard();
    var isConnected = checkConnection();
    if (!isConnected) {
        callback({status: {error: true}, error: aMsg.notConnectedToNet});
    }

    var needBlock = true;
    if (params.needBlock !== 'undefined' && params.needBlock === false) {
        needBlock = false;
    }
    var blockText = '';
    if (typeof (params.blockText) !== 'undefined') {
        blockText = params.blockText;
    }

    if (needBlock) {
        $.blockUI(blockParams);
        $('#block-text').html(blockText);
    }
    var type = 'GET';
    var formData = [];
    if (typeof (params.type) !== 'undefined') {
        type = params.type;
    }
    var dataType = 'json';
    if (typeof (params.dataType) !== 'undefined') {
        dataType = params.dataType;
    }
    if (typeof (params.formData) !== 'undefined') {
        formData = params.formData;
    }
    if (typeof (params.url) === 'undefined') {
        log('params.url not setted');
        return;
    }
    if (typeof (callback) === 'undefined') {
        log('callback not setted');
        return;
    }

    log('ajax: ' + params.url);

    $.ajax({
        type: type,
        url: params.url,
        crossDomain: true,
        dataType: dataType,//'json',
        data: formData,
        cache: false,
        timeout: 15000,
        xhr: function () {
            var req = $.ajaxSettings.xhr();
//            if (req) {
//                req.upload.addEventListener('progress', function (event) {
//                    if (event.lengthComputable) {
//                        //var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
//                        var percentage = Math.round((event.loaded * 100) / event.total);
//                        $('#block-text').html(percentage + ' % ');
//                    } else {
//                        $('#block-text').html('uploading...');
//                    }
//                }, false);
//            }
            return req;
        },
        success: function (response, textStatus, jqXHR) {
            if (needBlock) {
                    $.unblockUI();
                }
            if (!response) {
                callback({status: {error: true}, error: eMsg.voidResponse});
                $.unblockUI();
                return;
            }
            if(dataType !== 'json'){
                callback({status: {success: true}, data: response, text: jqXHR.responseText});
                return;
            }
            if (response.status === 'success') {
                
                callback({status: {success: true}, data: response.data, text: jqXHR.responseText});
                //log(jqXHR.responseText);
            } else {
                callback({status: {error: true}, error: response.error});
                $.unblockUI();
            }
            return;
        },
        error: function (jqXHR, textStatus, errorMessage) {
            $.unblockUI();
            var msg;
            if (textStatus === 'parsererror') {
                msg = eMsg.parserError;
            } else if (textStatus === 'timeout') {
                msg = eMsg.timeoutReached;
            } else if (textStatus === 'abort') {
                msg = eMsg.ajaxAborted;
            } else if (jqXHR.status === 0) {
                msg = eMsg.connectionError;
            } else if (jqXHR.status === 404) {
                msg = eMsg.urlNotFound;
            } else if (jqXHR.status === 500) {
                msg = eMsg.serverError;
            } else {
                msg = jqXHR.responseText;
                
            }

            var logMsg = 'Request error:' + params.url + ';  jqXHR.status: ' + jqXHR.status + ';  textStatus:' + textStatus + ';  errorMessage:' + errorMessage;
            log(logMsg);
            log(jqXHR.responseText);
            showErrorMessage(msg); // maybe del
            callback( {status: {error: true}, error: msg} );
            
            return;
        }
    });
}