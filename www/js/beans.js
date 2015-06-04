

var Contractor = function Contractor(params)
{
    this.id = -1;
    this.username = '';
    this.password = '';
    this.firstname = '';
    this.lastname = '';
    this.email = '';
    this.address = '';
    this.address = '';
    this.country = '';
    this.phone = '';
    this.mobile = '';
    this.website = '';
    this.roleId = -1;   // 1=Admin, 2=Client, 3=Contractor

    // local variable
    this.isLogged = false;

    var self = this;
    var __constructor = function () {
        fill(self, params);
    };
    __constructor();
};


function Site(params) {
    this.id = -1;
    this.title = '';
    this.description = '';
    this.location = '';
    this.lat = 0;
    this.lng = 0;
    this.statusId = -1;

    if (params) {
        this.images = params.Images;
        delete params.Images;
    }
    
    this.documents = [];

    var self = this;
    var __constructor = function () {
        fill(self, params);
    };
    __constructor();
}



var WorkOrder = function WorkOrder(params)
{
    this.id = -1;
    this.uid = '';
    this.title = '';
    this.subtitle = '';
    this.description = '';
    this.contractorId = -1;
    this.clientId = -1;
    this.statusId = -1;
    this.complete = 0;
    this.createdOn = new Date(0);
    this.finishedOn = new Date(0);
    
    this.tasks = [];
    this.questions = [];
    
    if (params) {
        this.images = params.Images;
        delete params.Images;
    }

    //local state
    this.reviewAnswersCompleted = false;
    this.suspendAnswersCompleted = false;
    this.finalAnswersCompleted = false;

    var self = this;
    var __constructor = function () {
        fill(self, params);
    };
    __constructor();
};

function ModWorkOrder(params)
{
    var __params = $.extend(true, {}, params);
    this.id = -1;
    this.uid = '';
    this.statusId = -1;
    
    this.finishedOn = new Date(0);
    
    //local state
    this.reviewAnswersCompleted = false;
    this.suspendAnswersCompleted = false;
    this.finalAnswersCompleted = false;
    this.lat = 0;
    this.lng = 0;


    var __constructor = function (self) {
        fill(self, __params, true);
    };
    __constructor(this);
    
};


function Task(params)
{
    this.id = -1;
    this.workOrderId = -1;
    this.uid = '';
    this.title = '';
    this.subtitle = '';
    this.description = '';
    this.commentRequired = false;
    this.photoRequired = false;
    this.statusId = -1;       //1=created, 2=reveived, 3=improves (no percentage)  4=finished, 5=aborted (percentage)
    this.createdOn = new Date(0);
    this.finishedOn = new Date(0);
    
    this.documents = [];
    this.comments = [];
    this.photos = [];


    var self = this;
    var __constructor = function () {
        fill(self, params);
    };
    __constructor();
};


function ModTask(params)
{
    var __params = $.extend(true, {}, params);
    
    this.id = -1;
    this.workOrderId = -1;
    this.uid = '';
    
    this.statusId = -1;       //1=created, 2=reveived, 3=in progress 5=aborted(no percentage)  4=finished,  (percentage)
    this.finishedOn = new Date(0);
    
    this.lat = 0;
    this.lng = 0;
    
    
    var __constructor = function (self) {
        fill(self, __params, true);
    };
    __constructor(this);
};


var Photo = function Photo(params)
{
    this.id = -1;
    this.uid = '';
    this.name = '';
    this.nativePath = '';
    this.path = '';
    this.url = '';
    this.createdOn = new Date(0);
    this.uid = '';
    this.type = ''; // 'question' , 'task'
    this.ownerId = -1; // contractor or admin id
    this.ownerName = '';  // contractor or admin username
    
    this.parentId = -1; // task or question id
    this.parentUid = ''; // task or question uid
    
    this.lat = 0;
    this.lng = 0;

    var self = this;
    var __constructor = function () {
        fill(self, params);
    };
    __constructor();
};


var Question = function Question(params)
{
    // temp todo chanhge
    this.id = -1;
    this.workOrderId = -1;
    this.cId = '';

    this.questionTypeId = -1; // 1=review, 2=abort, 3=final
    this.questionEnumId = -1; // 1=text, , 3=checkboxes, 4=time, 5=date, 6=file, 7=dropdown, 8=radio
    this.statusId = -1;
    this.required = false;
    this.json = params.json;
    delete params.json;



    var self = this;
    var __constructor = function () {
        fill(self, params);
    };
    __constructor();
};



function Answer(params)
{
    this.id = -1;
    this.questionId = -1;
    this.description = '';
    this.answerEnumId = -1;
    this.data = {};
    if(params && params.data){
        this.data = params.data;
        delete params.data;
    };
    this.sync = false;

    this.lat = -1;
    this.lng = -1;
    this.createdOn = new Date(0);
    this.createdBy = -1;
    this.uid = '';

    var self = this;
    var __constructor = function () {
        fill(self, params);
    };
    __constructor();
}





function Comment(params)
{
    this.id = -1;
    this.taskId = -1;
    this.uid = '';
    this.text = '';
    this.createdOn = new Date();
    this.ownerId = -1;  // contractor or admin id
    this.ownerName = ''; // contractor or admin username

    this.lat = -1;
    this.lng = -1;


    var self = this;
    var __constructor = function () {
        fill(self, params);
    };
    __constructor();
}



function Document(params)
{
    this.id = -1;
    this.name = '';
    this.path = '';
    this.url = '';

    var self = this;
    var __constructor = function () {
        fill(self, params);
        self.createdOn = new Date(self.createdOn)
    };
    __constructor();
}


function __clone(obj) {
    if(obj == null || typeof(obj) != 'object')
        return obj;

    var temp = obj.constructor(); // changed

    for(var key in obj) {
        if(obj.hasOwnProperty(key)) {
            temp[key] = __clone(obj[key]);
        }
    }
    return temp;
}


// enum
//var Status = function Status() {
//
//}
var statuses = [{
        id: 1,
        title: msg.created
    }, {
        id: 2,
        title: msg.reviewed
    }, {
        id: 3,
        title:  msg.inProgress
    }, {
        id: 4,
        title: msg.finished
    }, {
        id: 5,
        title: msg.suspended
    }];




function fill(object, params, deleteNotUsedValues) {
    if (params) {
        //object = setToNullAllVariables(object);
        var msg = '';
        for (var currParam in params) {
            //alert(currParam+"  "+params[currParam]);
            //alert('typeof self.'+currParam+': '+typeof self[currParam]);
            var camelCasedParam = toCamelCase(currParam);
            var currParamValue = params[currParam];

            // param is object like Week, Shift  and it is not null
            if (typeof currParamValue === 'object' & currParamValue !== null & !isArray(currParamValue) ) {
                
                // is date (real date or string, which can be converted to date)
                if(isDate(currParamValue)){
                    if(typeof object[camelCasedParam] !== "undefined" && object[camelCasedParam] !== null){
                        object[camelCasedParam] = getDateFromField(currParamValue);
                    }
                    continue;
                }
                
                var className = '' + currParam;

                if (!(window[className] && typeof (window[className]) === 'function')) {
                    // function with name 'window[className]' not exists
                    if(deleteNotUsedValues === true){
                        continue;
                    }
                    msg += ('Object with name "' + className + '" not exists \n');
                    continue;
                }

                var currParamName = currParam[0].toLowerCase() + currParam.slice(1);
                var nestedClass = new window[className](params[currParam]);
                object[currParamName] = nestedClass;
                continue;
            }
            
            
           

            // param is array of some objects
            if (typeof currParamValue === 'object' & currParamValue !== null & isArray(currParamValue)) {

                // deleting letter 's' example  Shifts => Shift
                var className = currParam.slice(0, -1);

                if (!(window[className] && typeof (window[className]) === 'function')) {
                    // function with name 'window[className]' not exists
                    if(deleteNotUsedValues === true){
                        continue;
                    }
                    msg += ('Object with name "' + className + '" not exists \n');
                    continue;
                }

                var currParamValueArr = currParamValue;
                var nestedClassesArr = [];
                for (var i in currParamValueArr) {
                    var nestedClass = new window["" + className](currParamValueArr[i]);
                    nestedClassesArr.push(nestedClass);
                }
                var currParamName = currParam[0].toLowerCase() + currParam.slice(1);
                object[currParamName] = nestedClassesArr;
                continue;
            }

            // param is null-type
            if (typeof currParamValue === 'object' & currParamValue === null) {
                // if null-type is object(class)
                if (window[currParam] && typeof (window[currParam]) === 'function') {
                    var nestedClass = new window["" + currParam]();
                    var currParamName = currParam[0].toLowerCase() + currParam.slice(1);
                    object[currParamName] = nestedClass;

                }
                // if null-type is simple param
                else {
                    object[camelCasedParam] = null;
                }

            }


            if (typeof object[camelCasedParam] !== "undefined" && object[camelCasedParam] !== null) {
                // if(!(camelCasedParam in object)){
                var type = typeof object[camelCasedParam];
                if(isDate(object[camelCasedParam])){
                    type='date';
                }
                var currParamValueWithType = getVariableWithItRealType(type, currParamValue);
                object[camelCasedParam] = currParamValueWithType; //currParamValue;
            } else {
                // msg+=("variable  '"+camelCasedParam+"' not found in object '"+object.constructor.name+ "' ::  create it or change model ! \n");
            }
        }
        //msg += check(object);
        if (msg !== '') {
            alert(msg);
            //log(msg);
        }
    } else {
        //object = null;
    }
}


function getVariableWithItRealType(type, value) {

    if (type === 'number') {
        return parseFloat(value);
    }else{
        if(type === 'date'){
            return getDateFromField(value);
        }
    }
    
    
    return value;
}



function check(object) {
    var objClassName = getObjectClass(object);
    var msg = '';
    if (object === null || typeof (object) === 'undefined') {
        msg += 'object' + objClassName + ' is null';
    } else {
        for (var attr in object) {
//            if(typeof(object[attr])==='undefined'){
//                msg += objClassName+'['+ attr +'] is undefined \n';
//            }
            if (object[attr] === null) {
                msg += objClassName + '[' + attr + '] is null or undefined \n';
            }
        }
    }
    return msg;
}

function getObjectType(obj) {
    if (typeof obj !== "object" || obj === null)
        return false;
    else
        return /(\w+)\(/.exec(obj.constructor.toString())[1];
}

function toCamelCase(input) {
    return input./*toLowerCase(). */replace(/_([A-z])/g, function (match, group1) {
        return group1.toUpperCase();
    });
}

function setToNullAllVariables(object) {
    for (var attr in object) {
        var isDate = Object.prototype.toString.call(object[attr]) === '[object Date]';
        if (isArray(object[attr])) {
            continue;
        }
        if (typeof object[attr] === 'object' & !isDate) {
            continue;
        }
        if (typeof object[attr] === 'function') {
            continue;
        }
        object[attr] = null;
    }
    return object;
}




function getDateFromField(field){
    if(field === null){
        return null;
    }
    if(Object.prototype.toString.call(field) === '[object Date]'){
        return field;
    }
    return new Date(field);
}

/*
 function toCamelCase(input) {
 for(var i=0; i<input.length; i++){
 if(input[i]=='_'){
 if(input[i+1]){ input[i+1] = input[i+1].toUpperCase(); }
 input.replaceAt(i, '');
 i++;
 }
 }
 
 return input;
 }
 */