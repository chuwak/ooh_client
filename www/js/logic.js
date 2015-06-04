
//=============================   check login form   ===========================

function submitLoginForm() {
    var checked = true;
    var $loginForm = $('#login-form');
    var $userLogin = $loginForm.find('input[name=username]');
    var $userPwd = $loginForm.find('input[name=password]');
    if (hasFieldError($userLogin)) {
        checked = false;
    }

    if (hasFieldError($userPwd)) {
        checked = false;
    }

    if (checked) {
        authorizeOnServer(afterGettingResponse);

        function afterGettingResponse(result) {
            if (result.status.error) {
                if (result.error.login) {
                    setErrorToField($userLogin, result.error.login);
                    return;
                }
                if (result.error.password) {
                    setErrorToField($userPwd, result.error.password);
                    return;
                }

                if (result.error) {
                    showErrorMessage(result.error);
                    return;
                }
            }

            ooh.contractor = result.data.Contractor;
            ooh.contractor.isLogged = true;
            ooh.sessionCode = ooh.contractor.sessionCode;

            writeLoginData();
            resetSavedData();

            loadContent('main');
        }
    }

}

function hasFieldError($inputField) {
    var val = $inputField.val();
    if (val.length === 0) {
        setErrorToField($inputField, eMsg.fieldBlankError);
        return true;
    }

    if (val.length < 1) {
        setErrorToField($inputField, eMsg.fieldTooShortError);
        return true;
    }

    if (val.length > 25) {
        setErrorToField($inputField, eMsg.fieldTooLongError);
        return true;
    }

    removeErrorFromField($inputField);
    return false;
}

function setErrorToField($inputField, msg) {
    var $container = $inputField.parent('.row');
    var $errorTxtCntr = $container.find('.errMsg');
    $container.addClass('error');
    $errorTxtCntr.html(msg);
}

function removeErrorFromField($inputField) {
    var $container = $inputField.parent('.row');
    var $errorTxtCntr = $container.find('.errMsg');
    $container.removeClass('error');
    $errorTxtCntr.html('');
}






//==========================  login data  ======================================

function readSavedLoginData() {
    var contractorJsonStr = store.getItem("contractor");
    if (contractorJsonStr) {
        var contractor = new Contractor(JSON.parse(contractorJsonStr));
        ooh.contractor = contractor;
        if (ooh.contractor) {
            $('#login-form input[name=username]').val(ooh.contractor.username);
            $('#login-form input[name=password]').val('');
        }
    }
}


function writeLoginData() {
    store.setItem("contractor", JSON.stringify(ooh.contractor));
}

function removeloginData() {
    store.removeItem("contractor");
}




//==========================   Synchronize  ====================================

function updateWorkOrders() {
    getAllWorkOrders(afterUpdatingWorkOrders);
    function afterUpdatingWorkOrders(result) {
        if (result.status.error) {
            showErrorMessage(result.error);

            // loading existed in memory workorders
            var storedWorkOrders = readWorkOrdersFromLocalStore();
            ooh.workOrders = storedWorkOrders;
            $('#work-btn').click();

            return;
        }
        ooh.workOrders = result.data.WorkOrders;
        updateIncomingWorkOrders(ooh.workOrders, ooh.modifiedWorkOrders);



        writeWorkOrdersToLocalStore(ooh.workOrders);

        //fillWorkOrdersTab();
        //showWorkOrdersPanel();
        $('#work-btn').click();
    }
}

function actionUpdateWorkOrders() {
    if (!hasInternet()) {
        showErrorMessage(aMsg.internetNotAvailable);
        closeMenu();
        return;
    }
    updateWorkOrders();
    closeMenu();
}



function updateIncomingWorkOrders(incomingWorkOrders, savedModifiedWorkOrders) {
    for (var i in incomingWorkOrders) {
        var incomingWorkOrder = incomingWorkOrders[i];
        updateIncomingTask(incomingWorkOrder.tasks, ooh.modifiedTasks);
        var relatedModifiedWorkOrder = null;
        for (var j in savedModifiedWorkOrders) {
            var currSavedModifiedWorkOrder = savedModifiedWorkOrders[j];
            if (incomingWorkOrder.id === currSavedModifiedWorkOrder.id) {
                relatedModifiedWorkOrder = currSavedModifiedWorkOrder;

                break;
            }
        }
        if (relatedModifiedWorkOrder) {
            incomingWorkOrder.statusId = relatedModifiedWorkOrder.statusId;
            incomingWorkOrder.reviewAnswersCompleted = relatedModifiedWorkOrder.reviewAnswersCompleted;
            incomingWorkOrder.suspendAnswersCompleted = relatedModifiedWorkOrder.suspendAnswersCompleted;
            incomingWorkOrder.finalAnswersCompleted = relatedModifiedWorkOrder.finalAnswersCompleted;
        }

    }
}

function updateIncomingTask(incomingTasks, savedModifiedTasks) {
    for (var i in incomingTasks) {
        var incomingTask = incomingTasks[i];
        mergeIncomingPhotos(incomingTask, ooh.photos);
        mergeIncomingComments(incomingTask, ooh.comments);
        var relatedModifiedTask = null;
        for (var j in savedModifiedTasks) {
            var currSavedModifiedTask = savedModifiedTasks[j];
            if (incomingTask.id === currSavedModifiedTask.id) {
                relatedModifiedTask = currSavedModifiedTask;
                break;
            }
        }
        if (relatedModifiedTask) {
            incomingTask.statusId = relatedModifiedTask.statusId;
            //incomingWorkOrder.reviewAnswersCompleted = relatedModifiedWorkOrder.reviewAnswersCompleted;
            //incomingWorkOrder.suspendAnswersCompleted = relatedModifiedWorkOrder.suspendAnswersCompleted;
            //incomingWorkOrder.finalAnswersCompleted = relatedModifiedWorkOrder.finalAnswersCompleted;
        }
    }
}


function mergeIncomingComments(incomingTask, savedComments) {
    for (var i in savedComments) {
        var currSavedComment = savedComments[i];
        if (currSavedComment.taskId === incomingTask.id) {
            var commentExistInIncomingTasks = false;
            for (var j in incomingTask.comments) {
                var currIncComment = incomingTask.comments[j];
                if (currIncComment.uid == currSavedComment.uid) {
                    commentExistInIncomingTasks = true;
                }
            }
            if (!commentExistInIncomingTasks) {
                incomingTask.comments.push(currSavedComment);
            }

        }
    }
}

function mergeIncomingPhotos(incomingTask, savedPhotos) {
    for (var i in savedPhotos) {
        var currSavedPhoto = savedPhotos[i];
        if (currSavedPhoto.type === 'task' && currSavedPhoto.parentId === incomingTask.id) {
            var photoExistInIncomingTasks = false;
            for (var j in incomingTask.photos) {
                var currIncPhoto = incomingTask.photos[j];
                if (currIncPhoto.uid == currSavedPhoto.uid) {
                    photoExistInIncomingTasks = true;
                }
            }
            if (!photoExistInIncomingTasks) {
                incomingTask.photos.push(currSavedPhoto);
            }

        }
    }
}



//======== write and read ========
function writeWorkOrdersToLocalStore(workOrders) {
    saveObject('workOrders', workOrders);
}

function readWorkOrdersFromLocalStore() {
    var workOrdersJsonStr = store.getItem('workOrders');
    if (!workOrdersJsonStr) {
        return null;
    }
    var workOrdersJsonData = JSON.parse(workOrdersJsonStr);
    var workOrders = [];
    for (var i in workOrdersJsonData) {
        var oneWokrJson = workOrdersJsonData[i];
        var workOrder = new WorkOrder(oneWokrJson);
        workOrders.push(workOrder);
    }
    return workOrders;
}


function writeAnswersToLocalStore() {
    saveObject('answers', ooh.answers);
}

function readAnswersFromLocalStore() {
    var answersJsonStr = store.getItem('answers');
    if (!answersJsonStr) {
        return null;
    }
    var answersJsonData = JSON.parse(answersJsonStr);
    var answers = [];
    for (var i in answersJsonData) {
        var oneAnswerJson = answersJsonData[i];
        var answer = new Answer(oneAnswerJson);
        answers.push(answer);
    }
    return answers;
}


function writeCommentsToLocalStore() {
    saveObject('comments', ooh.comments);
}

function readCommentsFromLocalStore() {
    var commentsJsonStr = store.getItem('comments');
    if (!commentsJsonStr) {
        return null;
    }
    var commentsJsonData = JSON.parse(commentsJsonStr);
    var comments = [];
    for (var i in commentsJsonData) {
        var oneCommentJson = commentsJsonData[i];
        var comment = new Comment(oneCommentJson);
        comments.push(comment);
    }
    return comments;
}

function writePhotosToLocalStore() {
    saveObject('photos', ooh.photos);
}

function readPhotosFromLocalStore() {
    var photosJsonStr = store.getItem('photos');
    if (!photosJsonStr) {
        return null;
    }
    var photosJsonData = JSON.parse(photosJsonStr);
    var photos = [];
    for (var i in photosJsonData) {
        var onePhotoJson = photosJsonData[i];
        var photo = new Photo(onePhotoJson);
        photos.push(photo);
    }
    return photos;
}


function readModWorkOrdersFromLocalStore() {
    var modWorkOrdersJsonStr = store.getItem('modifiedWorkOrders');
    if (!modWorkOrdersJsonStr) {
        return null;
    }
    var modWorkOrdersJsonData = JSON.parse(modWorkOrdersJsonStr);
    var modWorkOrders = [];
    for (var i in modWorkOrdersJsonData) {
        var oneModWorkOrderJson = modWorkOrdersJsonData[i];
        var modWorkOrder = new ModWorkOrder(oneModWorkOrderJson);
        modWorkOrders.push(modWorkOrder);
    }
    return modWorkOrders;
}



function readModTasksFromLocalStore() {
    var modTasksJsonStr = store.getItem('modifiedTasks');
    if (!modTasksJsonStr) {
        return null;
    }
    var modTasksJsonData = JSON.parse(modTasksJsonStr);
    var modTasks = [];
    for (var i in modTasksJsonData) {
        var oneModTaskJson = modTasksJsonData[i];
        var modTask = new ModTask(oneModTaskJson);
        modTasks.push(modTask);
    }
    return modTasks;
}


function readTimelineFromLocalStore() {
    var timelineJsonStr = store.getItem('timeline');
    if (!timelineJsonStr) {
        return null;
    }
    var timelineJsonData = JSON.parse(timelineJsonStr);
    var timeline = [];
    for (var i in timelineJsonData) {
        var oneTimelineJson = timelineJsonData[i];
        var timeItem = oneTimelineJson;
        timeItem.time = getDateFromField(timeItem.time);
        var oneTimelineEntityJson = oneTimelineJson.entity;
        var realType = timeItem.realType;

        var entity = null;
        if (realType === 'ModTask') {
            entity = new ModTask(oneTimelineEntityJson);
        }
        if (realType === 'ModWorkOrder') {
            entity = new ModWorkOrder(oneTimelineEntityJson);
        }
        if (realType === 'Photo') {
            entity = new Photo(oneTimelineEntityJson);
        }
        if (realType === 'Comment') {
            entity = new Comment(oneTimelineEntityJson);
        }
        if (realType === 'Array') {
            // answers
            var answers = oneTimelineEntityJson;
            for (var j in answers) {
                var currAnswer = answers[j];
                answers[j] = new Answer(currAnswer);
            }
            entity = answers;

        }
        timeItem.entity = entity;
        timeline.push(timeItem);
    }
    return timeline;
}





//==========================    Settings   =====================================

function readHost() {
    var storedHost = store.getItem('host');
    if (storedHost) {
        ooh.host = storedHost;
    } else {
        ooh.host = ooh.originalHost;
    }
}


function saveSettings() {
    var $modifiedHost = $('#url-input');
    var modifiedHost = $modifiedHost.val();
    if (checkUrl(modifiedHost) === false) {
        setErrorToField($modifiedHost, eMsg.incorrectUrl);
        return false;
    } else {
        removeErrorFromField($modifiedHost);
    }
    ooh.host = modifiedHost;
    store.setItem('host', modifiedHost);
    showMessage(aMsg.settingsSaved, 'information');
}


function resetSettings() {
    ooh.host = ooh.originalHost;
    store.removeItem('host');
    $('#url-input').val(ooh.host);
    //  no need in last t3
//    ooh.contractor.modifiedName = ooh.contractor.name;
//    $('#name-input').val(ooh.contractor.modifiedName);
//
//    ooh.contractor.modifiedCompany = ooh.contractor.company;
//    $('#company-name-input').val(ooh.contractor.modifiedCompany);
//    writeLoginData();


    showMessage(aMsg.settingsResetted, 'information');
}


function saveObject(name, object) {
    var jsonStr = JSON.stringify(object);
    jsonStr = replaceObjectNames(jsonStr);
    store.setItem(name, jsonStr);
}


function readObject(name) {
    store.getItem(name);
}


function resetSavedData() {
    ooh.workOrders = null;
    ooh.currWorkOrder = null;
    ooh.activeWorkOrderId = null;
    ooh.currTask = null;
    ooh.activeTaskId = null;
    ooh.answers = [];
    ooh.comments = [];
    ooh.modifiedWorkOrders = [];
    ooh.timeline = [];
    store.removeItem('workOrders');
    store.removeItem('timeline');
    store.removeItem('answers');
    store.removeItem('comments');
    store.removeItem('photos');
    store.removeItem('documents');

}





//==================  finders  =========================

function findWorkOrderById(workOrders, id) {
    return findObjById(workOrders, id);
}

function findTaskById(tasks, id) {
    return findObjById(tasks, id);
}

function findQuestionById(questions, id) {
    return findObjById(questions, id);
}




function findAnswerOfQuestionById(answers, id) {
    id = parseInt(id);
    for (var i in answers) {
        var answer = answers[i];
        if (answer.questionId === id) {
            return answer;
        }
    }
    return null;
}


function findCommentsByTaskId(array, taskId) {
    var searched = [];
    for (var i in array) {
        if (array[i].taskId === taskId) {
            searched.push(array[i]);
        }
    }
    return searched;
}

function findObjById(array, id) {
    id = parseInt(id);
    for (var i in array) {
        if (array[i].id === id) {
            return array[i];
        }
    }
    return null;
}


function getStatusById(statusesArr, statusId) {
    for (var i in statusesArr) {
        var currStatus = statusesArr[i];
        if (currStatus.id === statusId) {
            return currStatus.title;
        }
    }
    return null;
}

//===========================  filter  ============================

function filterQuestions(allQuestions, questionTypeId) {
    var filteredQuestions = [];
    for (var i in allQuestions) {
        if (allQuestions[i].questionTypeId === questionTypeId) {
            filteredQuestions.push(allQuestions[i]);
        }
    }
    return filteredQuestions;
}



//===============  task actions  =====================

function actionCommentTask(element) {
    var isDibabled = isButtonsDisabled(element);
    if (isDibabled) {
        return;
    }
    var $additionals = $(element).parent().parent().parent().find('.additionals');
    var visibleSaveButtons = $additionals.find('.comment-btn:visible');
    if (visibleSaveButtons.length > 0) {
        showMessage('fill active comment before add new', 'warning');
        return;
    }

    if (ptrn.commentPtrn === null) {
        ptrn.commentPtrn = getPattern($('#comment-pattern'));
    }
    var voidComment = {
        text: '',
        ownerId: ooh.contractor.id,
        ownerName: ooh.contractor.firstname,
        fDate: new Date().format('commentDate')
    };
    var taskId = ooh.currTask.id;

    var commentHtml = ptrn.commentPtrn.prop('outerHTML').render(voidComment);

    $additionals.append(commentHtml);

}


function actionDoneTask(element) {
    var isDibabled = isButtonsDisabled(element);
    if (isDibabled) {
        return;
    }

    var currTask = ooh.currTask;

    if (currTask.commentRequired) {
        if (currTask.comments.length === 0) {
            showErrorMessage(msg.commentRequired);
            return false;
        }
    }
    if (currTask.photoRequired) {
        if (currTask.photos.length === 0) {
            showErrorMessage(msg.photoRequired);
            return false;
        }
    }


    showConfirmDialog(
            msg.taskConfirmation,
            function (result) {
                actionDoneTaskProcess(element);
            },
            function (result) {
            }
    );
}

function actionDoneTaskProcess(element) {
    var isDibabled = isButtonsDisabled(element);
    if (isDibabled) {
        return;
    }


    var currTask = ooh.currTask;

    currTask.statusId = 4;
    currTask.finishedOn = new Date();

    var modTask = new ModTask(currTask);
    addTaskToModifiedTasks(modTask);
    addEntityToTimeline(modTask);


    var currWorkOrder = ooh.currWorkOrder;
    var tasks = currWorkOrder.tasks;

    // check for completed
    var count = 0;
    var completed = 0;
    for (var i in tasks) {
        var cTask = tasks[i];
        count++;
        if (cTask.statusId === 4) {
            completed++;
        }
    }
    if (count > 0 && count === completed) {
        currWorkOrder.statusId = 4;
        currWorkOrder.finishedOn = new Date();
        var modWorkOrder = new ModWorkOrder(currWorkOrder);
        addWorkOrderToModifiedWorkOrders(modWorkOrder);
        addEntityToTimeline(modWorkOrder);
    }


    //updateView
    fillWorkOrdersTab();



    if (currWorkOrder.statusId === 4) {
        //setTimeout(function () {
        hideTasksAndDetailsPanel();
        fillQuestionsList('final');
        showQuestionPanel();

        //}, 600);

    } else {
        var $currentActiveTask = $('#tasks-list .task-item-active');
        var $nextTask = $currentActiveTask.next();
        if ($nextTask) {
            var nextTaskId = $nextTask.attr('data-bind');
            ooh.activeTaskId = parseInt(nextTaskId);
        }
        fillTasksTab(tasks);
    }
}




function actionSuspendWork(element) {
    var isDibabled = isButtonsDisabled(element);
    if (isDibabled) {
        return;
    }
    var currTask = ooh.currTask;
    currTask.statusId = 5;
    var modTask = new ModTask(currTask);
    addTaskToModifiedTasks(modTask);
    addEntityToTimeline(modTask);
    
    var currWorkOrder = ooh.currWorkOrder;
    currWorkOrder.statusId = 5;
    var modWorkOrder = new ModWorkOrder(currWorkOrder);
    addWorkOrderToModifiedWorkOrders(modWorkOrder);
    addEntityToTimeline(modWorkOrder);
    fillWorkOrdersTab();
    fillQuestionsList('suspend');
    currWorkOrder.suspendAnswersCompleted = false;

    hideSiteInfoPanel();
    hideTasksAndDetailsPanel();
    showQuestionPanel();
}

function actionResumeWork(element) {
    var isDibabled = isButtonsDisabled(element);
    if (isDibabled) {
        return;
    }
    
    var currTask = ooh.currTask;
    currTask.statusId = 3;
    var modTask = new ModTask(currTask);
    addTaskToModifiedTasks(modTask);
    addEntityToTimeline(modTask);
    
    
    var currWorkOrder = ooh.currWorkOrder;
    currWorkOrder.statusId = 1;
    currWorkOrder.suspendAnswersCompleted = false; // reset

    var modWorkOrder = new ModWorkOrder(currWorkOrder);
    addWorkOrderToModifiedWorkOrders(modWorkOrder);
    addEntityToTimeline(modWorkOrder);

    fillWorkOrdersTab();
    hideQuestionPanel();

    hideTasksAndDetailsPanel();
    showSiteInfoPanel();
}


function actionAddPhoto(element, type) {
    var isDibabled = isButtonsDisabled(element);
    if (isDibabled) {
        return;
    }

    if (ptrn.photoPtrn === null) {
        ptrn.photoPtrn = getPattern($('#photo-pattern'));
    }

    var currTask = ooh.currTask;

    var $additionals = $(element).parent().parent().parent().find('.additionals');

    getCurrentPosition(afterGettingPosition);
    function afterGettingPosition(result) {
        if (result.status.error) {
            showErrorMessage(result.error);
            return;
        }

        var currLat = result.data.latitude;
        var currLng = result.data.longitude;


        if (!isMobile) {
            var photo = new Photo();
            photo.createdOn = new Date();
            photo.uid = generateUUID();
            photo.name = 'ooh_' + (new Date().format('dd-mm-yyyy_HH-MM-ss')) + '.jpg';
            photo.path = 'img/' + 'movie.jpg';
            photo.nativePath = 'img/movie.jpg';  // in real device it will be      file///.......img/movie.jpg
            photo.parentId = currTask.id;
            photo.parentUid = currTask.uid;
            photo.ownerId = ooh.contractor.id;
            photo.ownerName = ooh.contractor.firstname;
            photo.lat = currLat;
            photo.lng = currLng;
            photo.type = 'task';

            var voidPhoto = {
                ownerName: photo.ownerName,
                fDate: photo.createdOn.format('commentDate'),
                imageSrc: photo.nativePath
            };

            currTask.photos.push(photo);
            ooh.photos.push(photo);
            writePhotosToLocalStore();
            addEntityToTimeline(photo);

            var photoHtml = ptrn.photoPtrn.prop('outerHTML').render(voidPhoto);
            $additionals.append(photoHtml);
            return;
        }


        getImageFromCamera(type, afterGettingImage);
        function afterGettingImage(result) {
            if (result.status.error) {
                showErrorMessage(result.error);
                return;
            }
            var mediaFile = result.mediaFiles[0];
            var now = new Date();
            var newNameWithoutExt = 'ooh_' + now.format('dd-mm-yyyy_HH-MM-ss');
            var newName = newNameWithoutExt + '.jpg';

            // relative file path is wrong.
            // actual will be in folder OOH , and his name will be newName(after copy to folder)
            var relativePath = 'OOH/' + newName;

            moveOrCopyFile(mediaFile.nativePath, newName, 'move', afterMoveOrCopy);
            function afterMoveOrCopy(result) {
                if (result.status.error) {
                    showErrorMessage(result.error);
                    return;
                }


                // creating photo object
                var photo = new Photo();
                photo.name = newName;
                photo.createdOn = new Date();
                photo.uid = generateUUID();
                photo.path = relativePath;
                photo.nativePath = result.data.nativeURL;
                photo.ownerId = ooh.contractor.id;
                photo.ownerName = ooh.contractor.firstname;
                photo.parentId = currTask.id;
                photo.parentUid = currTask.uid;
                photo.lat = currLat;
                photo.lng = currLng;
                photo.type = 'task';

                currTask.photos.push(photo);
                ooh.photos.push(photo);
                writePhotosToLocalStore();
                addEntityToTimeline(photo);

                // check
                var voidPhoto = {
                    ownerName: ooh.contractor.firstname,
                    fDate: new Date().format('commentDate'),
                    imageSrc: photo.nativePath
                };


                var photoHtml = ptrn.photoPtrn.prop('outerHTML').render(voidPhoto);
                $additionals.append(photoHtml);

            }
        }


    }


}


function actionSaveComment(element) {
    var $commentContainer = $(element).parents('.comment-container');
    var $textArea = $commentContainer.find('.comment-text-area');
    var $buttonsArea = $commentContainer.find('.comment-buttons-area');
    var text = $textArea.val();
    if (text === '') {
        showMessage(eMsg.fieldBlankError, 'warning');
        return;
    }

    $textArea.attr('readonly', 'readonly');
    $buttonsArea.hide();
    getCurrentPosition(afterGettingPosition);
    function afterGettingPosition(result) {
        if (result.status.error) {
            showErrorMessage(result.error);
            return;
        }
        var comment = new Comment();
        comment.taskId = ooh.activeTaskId; // todo maybe change
        comment.text = text;
        comment.lat = result.data.latitude;
        comment.lng = result.data.longitude;
        comment.uid = generateUUID();
        comment.ownerId = ooh.contractor.id;
        comment.ownerName = ooh.contractor.firstname;

        ooh.currTask.comments.push(comment);
        ooh.comments.push(comment);
        writeCommentsToLocalStore();

        addEntityToTimeline(comment);

    }
}


function actionCancelComment(element) {
    var $commentContainer = $(element).parents('.comment-container');
    $commentContainer.remove();
}


function isButtonsDisabled(element) {
    var $buttonsPanel = $(element).parents('.details-panel-buttons');
    var isDisabled = $buttonsPanel.hasClass('disabled-buttons');
    return isDisabled;
}




//=======================  check answers  ========================
function actionCheckAnswers(element) {
    var $answers = $('.answer');
    var checked = true;
    $answers.each(function () {
        var $answer = $(this);
        var answerDataStr = $answer.attr('data-bind');
        var answerData = stringToObject(answerDataStr);
        if (answerData.required === true) {
            if (answerData.enum === 1) {
                var $inputField = $answer.find('input');
                if (hasAnswerTextFieldError($inputField)) {
                    checked = false;
                }
            }
            if (answerData.enum === 3) {
                var $checkboxes = $answer.find('input[type=checkbox]');
                if (hasAnswerCheckboxesError($checkboxes)) {
                    checked = false;
                }
            }
            if (answerData.enum === 6) {
                //var $filePathField = $answer.find('input[name=path]');
                //var $fileNameField = $answer.find('input[name=name]');
                var $uploadPhotosList = $answer.find('.upload-photos-list');
                if (hasAnswerFileError($uploadPhotosList)) {
                    checked = false;
                }
            }
            if (answerData.enum === 7) {
                var $selectbox = $answer.find('select');
                if (hasAnswerSelectboxError($selectbox)) {
                    checked = false;
                }
            }
            if (answerData.enum === 8) {
                var $radioButtons = $answer.find('input[type=radio]');
                if (hasAnswerRadioButtonError($radioButtons)) {
                    checked = false;
                }
            }
            if (answerData.enum === 10) {
                var $inputField = $answer.find('textarea');
                if (hasAnswerTextFieldError($inputField)) {
                    checked = false;
                }
            }
        }

    });
    if (checked === false) {
        showMessage(aMsg.answersHasErrors, 'warning');
        return;
    }


    questionsListProcess(element);

}


function questionsListProcess(element) {

    var listType = $(element).attr('data-bind');

    var currWorkOrder = ooh.currWorkOrder;
    var allQuestions = currWorkOrder.questions;
    var questionsOfSelectedType = [];

    if (listType === 'review') {
        currWorkOrder.reviewAnswersCompleted = true;
        questionsOfSelectedType = filterQuestions(allQuestions, 1);
    }
    if (listType === 'suspend') {
        currWorkOrder.suspendAnswersCompleted = true;
        questionsOfSelectedType = filterQuestions(allQuestions, 2);
    }
    if (listType === 'final') {
        currWorkOrder.finalAnswersCompleted = true;
        questionsOfSelectedType = filterQuestions(allQuestions, 3);
    }

    var modWorkOrder = new ModWorkOrder(currWorkOrder);
    addWorkOrderToModifiedWorkOrders(modWorkOrder);




    fillWorkOrdersTab();
    var tasks = ooh.currWorkOrder.tasks;
    fillTasksTab(tasks);
    showTasksPanel();
    if (!hasInternet()) {
        showMessage(aMsg.dataWillSaveTolocalStore);
        return;
    }


    // creating array of answers for needed typed questions 
    var answersOfQuestions = [];
    var answerUidsToDelete = [];
    for (var i in questionsOfSelectedType) {
        var questionOfSelectedType = questionsOfSelectedType[i];
        var answerOfQuestion = findAnswerOfQuestionById(ooh.answers, questionOfSelectedType.id);
        if(answerOfQuestion){
            answerUidsToDelete.push(answerOfQuestion.uid);
            answersOfQuestions.push(answerOfQuestion);
        }
    }

    // cloning ansfer
    var clonedAnswers = answersOfQuestions.slice(0);

    //only after cloning deleting original answers from global array of answers
    for (var i = ooh.answers.length - 1; i >= 0; i--) {
        var currGlobalAnswerUid = ooh.answers[i].uid;
        if (answerUidsToDelete.indexOf(currGlobalAnswerUid) !== -1) {
            ooh.answers.splice(i, 1);
        }
    }
    writeAnswersToLocalStore();

    addEntityToTimeline(clonedAnswers, 'Answers');

}


function actionCancelAnswers(element) {
    var listType = $(element).attr('data-bind');

    var currWorkOrder = ooh.currWorkOrder;
    var task = currWorkOrder.tasks[0];
    if (ooh.currTask !== null) {
        task = ooh.currTask;
    }


    if (listType === 'review') {
        currWorkOrder.statusId = 1;
        hideQuestionPanel();
        showSiteInfoPanel();

    }
    if (listType === 'suspend') {
        currWorkOrder.statusId = 3;
        hideQuestionPanel();
        showTasksPanel();
        fillDetailsTab(task);
        fillWorkOrdersTab();
        showTasksPanel();
        
    }
    if (listType === 'final') {
        currWorkOrder.statusId = 3;
        hideQuestionPanel();
        fillWorkOrdersTab();
        fillDetailsTab(task);
        showTasksPanel();
    }

    var modWorkOrder = new ModWorkOrder(currWorkOrder);
    addWorkOrderToModifiedWorkOrders(modWorkOrder);

    addEntityToTimeline(modWorkOrder);
}



function uploadingImagesAfterAnswer(answersArr, callback) {
    var count = 0;
    var uploaded = 0;
    var tempAnswerPhotos = [];
    //var currTempAnswer = null;
    for (var i in answersArr) {
        var answer = answersArr[i];
        var values = answer.data.values;
        for (var j in values) {
            var value = values[j];
            if (value.name && value.path) {
                count++;
                var clonedAnswer = $.extend({}, answer);
                delete clonedAnswer.data;
                value.answer = clonedAnswer;
                tempAnswerPhotos.push(value);
            }
        }

    }

    if (count > 0) {
        var currTempAnswerPhoto = tempAnswerPhotos[0];
        var url;
        var mediaFile;
        var additionalParams;
        var formParams;
        url = ooh.host + urls.uploadPhoto;
        
        function oneFileUploaded(result) {
            if (result.status.error) {
                callback({status: {error: true}, error: result.error});
                return;
            }

            uploaded++;
            if (uploaded === count) {
                callback({status: {success: true}, data: uploaded});
            } else {
                tempAnswerPhotos.shift();
                //alert('shifted first and now length = '+tempAnswers.length);
                if (tempAnswerPhotos.length > 0) {
                    currTempAnswerPhoto = tempAnswerPhotos[0];
                    prepareParams(currTempAnswerPhoto);
                    uploadFile(url, mediaFile, currTempAnswerPhoto.name, formParams, 'image', oneFileUploaded);
                } else {
                    callback({status: {success: true}, data: uploaded});
                }
            }


        }

        prepareParams(currTempAnswerPhoto);
        uploadFile(url, mediaFile, currTempAnswerPhoto.name, formParams, 'image', oneFileUploaded);
        
        
        function prepareParams(value) {
            mediaFile = {
                fullPath: currTempAnswerPhoto.path,
                name: currTempAnswerPhoto.name
            };
            var photo = new Photo();
            photo.type = 'question';
            photo.createdOn = value.answer.createdOn; // or new Date();
            photo.name = currTempAnswerPhoto.name;
            photo.path = currTempAnswerPhoto.path;
            photo.parentId = value.answer.id;
            photo.parentUid = value.answer.uid;
            photo.lat = answer.lat;
            photo.lng = answer.lng;

            photo.ownerId = ooh.contractor.id;
            photo.ownerName = ooh.contractor.firstname;
            additionalParams = {
                data: {
                    Photo: photo
                }
            };
            formParams = {};
            formParams['data'] = JSON.stringify(additionalParams);
            formParams['user_id'] = ooh.contractor.id;
            //alert('url:'+url);
            //alert('mediaFile:' + JSON.stringify(mediaFile));
            //alert('formParams:' + JSON.stringify(formParams));
        }

        //readFileWithCallback(currTempAnswer.data.path, onePhotoReaded);
    } else {
        callback({status: {success: true}, data: uploaded});
    }


}


//
//function fillImageDataToAnswers(answersArr, callback) {
//    var count = 0;
//    var loaded = 0;
//    var tempAnswers = [];
//    var currTempAnswer = null;
//    for (var i in answersArr) {
//        var answer = answersArr[i];
//        if (answer.data.name && answer.data.path) {
//            count++;
//            tempAnswers.push(answer);
//        }
//    }
//
//    if (count > 0) {
//        var currTempAnswer = tempAnswers[0];
//        readFileWithCallback(currTempAnswer.data.path, onePhotoReaded);
//    } else {
//        callback({status: {success: true}, data: loaded});
//    }
//
//
//    function onePhotoReaded(result) {
//
//        if (result.error) {
//            callback({status: {error: true}, error: result.error});
//            return;
//        }
//
//        loaded++;
//        currTempAnswer.data.image = result.data.substring(23); //result.data;
////            alert('one photo Readed: currTempAnswer:'+currTempAnswer.data.path +'\n image length\n'+ 
////                    +'\n'+currTempAnswer.data.image.length );
//        if (loaded === count) {
//            callback({status: {success: true}, data: loaded});
//        } else {
//            tempAnswers.shift();
//            //alert('shifted first and now length = '+tempAnswers.length);
//            if (tempAnswers.length > 0) {
//                currTempAnswer = tempAnswers[0];
//                readFileWithCallback(currTempAnswer.data.path, onePhotoReaded);
//            } else {
//                callback({status: {success: true}, data: loaded});
//            }
//        }
//    }
//}








function makePhoto(element, type) {

    var $answer = $(element).parents('.answer');
    var $uploadPhotosList = $answer.find('.upload-photos-list');
    var copyMoveAction = (type === 'saved' ? 'copy' : 'move');

    if (ptrn.uploadPhotoItemPtrn === null) {
        ptrn.uploadPhotoItemPtrn = getPattern($('#upload-photo-item-pattern'));
    }


    if (!isMobile) {
        var photoData = {
            name: 'emulatedName',
            path: 'nativePath'
        };
        var html = ptrn.uploadPhotoItemPtrn.prop('outerHTML').render(photoData);
        $uploadPhotosList.append(html);
        addAnswer(element);
        return;
    }

    getImageFromCamera(type, afterGettingImage);
    function afterGettingImage(result) {
        if (result.status.error) {
            showErrorMessage(result.error);
            return;
        }
        // alert('afterGettingImage \n' + JSON.stringify(result))

        var mediaFile = result.mediaFiles[0];
        var now = new Date();
        var newNameWithoutExt = 'ooh_' + now.format('dd-mm-yyyy_HH-MM-ss');
        var newName = newNameWithoutExt + '.jpg';


        moveOrCopyFile(mediaFile.nativePath, newName, copyMoveAction, afterMoveOrCopy);

        function afterMoveOrCopy(result) {
            if (result.status.error) {
                showErrorMessage(result.error);
                return;
            }
            var photoData = {
                name: newName,
                path: result.data.nativeURL
            };
            var html = ptrn.uploadPhotoItemPtrn.prop('outerHTML').render(photoData);
            $uploadPhotosList.append(html);
            addAnswer(element);
        }

    }

}





/*=====================   Timeline   =============================*/

function addEntityToTimeline(entity, entityType) {
    var map = {};
    map.time = new Date();
    map.uid = generateUUID();

    map.realType = getObjectType(entity);
    map.type = map.realType;
    if (entityType) {
        map.type = entityType;
    }
    map.entity = entity;

    if (map.type === 'ModWorkOrder' || map.type === 'ModTask') {
        getCurrentPosition(afterGettingPosition);
        function afterGettingPosition(result) {
            if (result.status.error) {
                showErrorMessage(result.error);
                return false;
            }
            map.entity.lat = result.data.latitude;
            map.entity.lng = result.data.longitude;
            process();
        }
    } else {
        process();
    }

    function process() {
        ooh.timeline.push(map);
        saveObject('timeline', ooh.timeline);
        sendEntityesFromTimelineToServer(afterSending);

        function afterSending(result) {
            if (result.status.error) {
                showErrorMessage(result.error);
                return;
            }
        }
    }



}

function actionSynchronize() {
    closeMenu('main');
    var timeline = ooh.timeline;
//    if (timeline.length === 0) {
//        showMessage('timeline is empty', 'information');
//        return;
//    }
    sendEntityesFromTimelineToServer(afterSending);
    function afterSending(result) {
        if (result.status.error) {
            showErrorMessage(result.error);
            return false;
        }
        updateWorkOrders();
    }

}



function sendEntityesFromTimelineToServer(callback) {

    if (!hasInternet()) {
        callback({status: {error: true}, error: aMsg.internetNotAvailbable});
        return false;
    }

    var timeline = ooh.timeline;
    if (timeline.length === 0) {
        callback({status: {success: true}, data: {}});
        return;
    }

    var map = timeline[0];

    var type = map.type;

    var dataObj = {data: [map]};
    sendObjectsToServer(JSON.stringify(dataObj), afterSendingObject);
    function afterSendingObject(result) {
        if (result.status.error) {
            callback({status: {error: true}, error: result.error});
            return;
        }
        ooh.timeline.shift();
        saveObject('timeline', ooh.timeline);
        sendEntityesFromTimelineToServer(callback);
        if (type === 'Answers') {
            var answers = map.entity;
            uploadingImagesAfterAnswer(answers, function (result) {
                if (result.status.error) {
                    showErrorMessage(result.error);
                    answers = null;
                    return;
                }
                if (result.data.uploaded > 0) {
                    //showMessage('photos sent');
                }
            });
        } else if (type === 'Photo') {
            var photo = map.entity;

            var url;
            var mediaFile;
            var additionalParams;
            var formParams;
            url = ooh.host + urls.uploadPhoto;

            prepareParams();

            function prepareParams() {

                mediaFile = {
                    fullPath: photo.nativePath,
                    name: photo.name
                };
                additionalParams = {
                    data: {
                        Photo: photo
                    }
                };
                formParams = {};
                formParams['data'] = JSON.stringify(additionalParams);
                formParams['user_id'] = ooh.contractor.id;
                //alert('url:'+url);
                //alert('mediaFile:' + JSON.stringify(mediaFile));
                //alert('formParams:' + JSON.stringify(formParams));
            }

            uploadFile(url, mediaFile, photo.name, formParams, 'image', oneFileUploaded);

            function oneFileUploaded(result) {
                if (result.status.error) {
                    showErrorMessage(result.error);
                    return;
                }

            }
        }

    }

}


function updateViewOfTimeline() {
    if (ptrn.timelinePtrn === null) {
        ptrn.timelinePtrn = getPattern($('#timeline-pattern'));
    }
    var timeline = ooh.timeline;
    var $timeline = $('#timeline');

    var htmlArr = [];
    for (var i in timeline) {
        var timeItem = timeline[i];
        timeItem.fDate = timeItem.time.format('commentDate');
        timeItem.entityData = JSON.stringify(timeItem.entity);
        var htmlItem = ptrn.timelinePtrn.prop('outerHTML').render(timeItem);
        htmlArr.push(htmlItem);
    }

    $timeline.html(htmlArr.join('\n'));
}





///========================== check for errors questions  ======================
function hasAnswerTextFieldError($inputField) {
    var val = $inputField.val();
    if (val.length === 0) {
        setAnswerErrorToField($inputField, eMsg.fieldBlankError);
        return true;
    }
    if (val.length < 1) {
        setAnswerErrorToField($inputField, eMsg.fieldTooShortError);
        return true;
    }
    if (val.length > 255) {
        setAnswerErrorToField($inputField, eMsg.fieldTooLongError);
        return true;
    }
    removeAnswerErrorFromField($inputField);
    return false;
}


function hasAnswerCheckboxesError($checkboxes) {
    var checkedCount = $checkboxes.filter(':checked').length;
    if (checkedCount === 0) {
        setAnswerErrorToField($checkboxes, eMsg.checkboxNotCheckedError);
        return true;
    }
    removeAnswerErrorFromField($checkboxes);
    return false;
}


function hasAnswerFileError($uploadPhotosList) {
    var $items = $uploadPhotosList.find('.upload-photo-item');

    if ($items.length === 0) {
        //var val = $inputField.val();
        setAnswerErrorToField($uploadPhotosList, eMsg.imageNotChoosen);
        return true;
    }
    $items.each(function () {
        var $pathInput = $(this).find('input[name=path]');
        if ($pathInput && $pathInput.val() === '') {
            setAnswerErrorToField($pathInput, eMsg.imageNotChoosen);
        } else {
            removeAnswerErrorFromField($pathInput);
        }
    });

    removeAnswerErrorFromField($uploadPhotosList);
    return false;
}


function hasAnswerSelectboxError($inputField) {
    var val = $inputField.val();
    if (val === '') {
        setAnswerErrorToField($inputField, eMsg.selectOption);
        return true;
    }
    removeAnswerErrorFromField($inputField);
    return false;
}

function hasAnswerRadioButtonError($radioButtons) {
    var checkedCount = $radioButtons.filter(':checked').length;
    if (checkedCount === 0) {
        setAnswerErrorToField($radioButtons, eMsg.selectOption);
        return true;
    }
    removeAnswerErrorFromField($radioButtons);
    return false;
}


function setAnswerErrorToField($inputField, msg) {
    var $container = $inputField.parents('.qst');
    var $errorTxtCntr = $container.find('.errMsg');
    $container.addClass('error');
    $errorTxtCntr.html(msg);
}

function removeAnswerErrorFromField($inputField) {
    var $container = $inputField.parents('.qst');
    var $errorTxtCntr = $container.find('.errMsg');
    $container.removeClass('error');
    $errorTxtCntr.html('');
}



//=========================   frames   ================================
function drawHelpTab() {
    getHelp(afterGettingHelp);
    function afterGettingHelp(result) {
        var html = result.data;
        $('#helpIframe').contents().find('body').html(html);
    }

}

function drawFilesTab() {
    getFiles(afterGettingFiles);
    function afterGettingFiles(result) {
        var html = result.data;
        $('#fileIframe').contents().find('body').html(html);
    }

}




function addWorkOrderToModifiedWorkOrders(modWorkOrder) {
    var modifiedWorkOrders = ooh.modifiedWorkOrders;
    // search existed work order by id
    var exists = false;
    for (var i in modifiedWorkOrders) {
        var currModWorkOrder = modifiedWorkOrders[i];
        if (modWorkOrder.id === currModWorkOrder.id) {
            modifiedWorkOrders[i] = modWorkOrder;
            exists = true;
            break;
        }
    }
    if (!exists) {
        modifiedWorkOrders.push(modWorkOrder);
    }
    saveObject('modifiedWorkOrders', ooh.modifiedWorkOrders);
}


function getFromModifiedWorkOrdersById(id) {
    var modifiedWorkOrders = ooh.modifiedWorkOrders;
    for (var i in modifiedWorkOrders) {
        var currModWorkOrder = modifiedWorkOrders[i];
        if (id === currModWorkOrder.id) {
            return currModWorkOrder;
        }
    }
    return null;
}


function addTaskToModifiedTasks(modTask) {
    var modifiedTasks = ooh.modifiedTasks;
    // search existed work order by id
    var exists = false;
    for (var i in modifiedTasks) {
        var currModTask = modifiedTasks[i];
        if (modTask.id === currModTask.id) {
            modifiedTasks[i] = modTask;
            exists = true;
            break;
        }
    }
    if (!exists) {
        modifiedTasks.push(modTask);
    }
    saveObject('modifiedTasks', ooh.modifiedTasks);
}


function getFromModifiedTaskById(id) {
    var modifiedTasks = ooh.modifiedTasks;
    for (var i in modifiedTasks) {
        var currModTask = modifiedTasks[i];
        if (id === currModTask.id) {
            return currModTask;
        }
    }
    return null;
}


function actionCheckForUpdate() {

    getServerAppVersion(afterGettingVersion);
    function afterGettingVersion(result) {
        if (result.status.error) {
            showErrorMessage(result.error);
            return;
        }
        var serverVersion = result.data;
        var currentVersion = ooh.version;
        var existNewVersion = checkExistVersion(currentVersion, serverVersion);

        if (existNewVersion) {
            showConfirmDialog(
                    currentVersion + ' => ' + serverVersion + ' ' + msg.availableNewVersion,
                    function () {
                        openDocument(ooh.host + urls.download);
                    },
                    function () {
                    }
            );

        } else {
            showMessage(msg.lastVersionUsed);
        }

    }
}

function checkExistVersion(currentVersion, serverVersion) {
    var existNewVersion = false;
    var serverVersionArr = serverVersion.split('.');
    var currentVersionArr = currentVersion.split('.');
    for (var n in serverVersionArr) {
        serverVersionArr[n] = parseInt(serverVersionArr[n]);
        currentVersionArr[n] = parseInt(currentVersionArr[n]);
    }
    if (serverVersionArr[0] > currentVersionArr[0]) {
        existNewVersion = true;
        return true;
    } else if (serverVersionArr[1] > currentVersionArr[1]) {
        existNewVersion = true;
        return true;
    } else if (serverVersionArr[2] > currentVersionArr[2]) {
        existNewVersion = true;
        return true;
    } else {
        existNewVersion = false;
    }

    return existNewVersion;
}