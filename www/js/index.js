
var ooh = {
    version: '0.0.0',
    host: null,
    contractor: null,
    workOrders: null,
    currWorkOrder: null,
    activeWorkOrderId: null,
    currTask: null,
    activeTaskId: null,
    answers: [],
    comments: [],
    photos: [],
    modifiedWorkOrders: [],
    modifiedTasks: [],
    timeline: [],
    orientation: null,
    lowerSide: null,
    biggerSite: null,
    heightDelta: null,
    mapInitialize: false,
    workTabWiewState: null,
    breadcrumbs: [],
    readyCount: 0, // 2 for ready

    coordinates: {lat: null, lng: null}
};

var ptrn = {
    workItemPtrn: null,
    taskItemPtrn: null,
    detailsPtrn: null,
    detailsCompletePtrn: null,
    sitePtrn: null,
    siteImagePtrn: null,
    siteDocumentPtrn: null,
    paragraphQstPtrn: null,
    textFieldQstPtrn: null,
    textAreaQstPtrn: null,
    checkboxesQstPtrn: null,
    radioQstPtrn: null,
    selectboxQstPtrn: null,
    fileQstPtrn: null,
    uploadPhotoItemPtrn: null,
    checkboxQstPtrn: null,
    radioBtnQstPtrn: null,
    selectOptionQstPtrn: null,
    commentPtrn: null,
    photoPtrn: null,
    breadcrumbsItemPtrn: null,
    timelinePtrn: null
};

var store = window.localStorage;

function log(msg) {
    console.log('::OOH:: ' + msg);
}

$(document).ready(function () {
    console.log('document ready');
    fullReady();
});

function fullReady() {
    ooh.readyCount++;
    if (!isMobile) {
        ooh.readyCount++;
    }
    if (ooh.readyCount === 2) {
        log('full ready');
        fixHeight();
        onDeviceReady();
        initApp();
        initRotation(); // todo for desctop
    }

}

function initApp() {
    correctiveScale();

    readSavedLoginData();
    if (ooh.contractor && ooh.contractor.isLogged === true) {
        loadContent('main');
    } else {
        initIndex();
    }


    googleMapLoadScript();
    var positionInterval = setInterval(
            getCurrentPosition(
                    function (result) {
                    }, 15000),
            30000
            );

    var synchronizeInterval = 30 * 60 * 1000;
    var timelineInterval = setInterval(
            function () {
                if (hasInternet()) {
                    sendEntityesFromTimelineToServer(afterSending);
                    function afterSending(result) {
                        if (result.status.error) {
                            showErrorMessage(result.error);
                            return false;
                        }
                        updateWorkOrders();
                    }
                }
            }
    , synchronizeInterval);

}

function initIndex() {
    $('#inner-body').css({'visibility': 'visible'});
    readSavedLoginData();
    //addScrolls();
    fixHover();
}

function initMain() {
//addScrolls();
    $('#inner-body').css({'visibility': 'visible'});
    initMenu();
    fixHover();

    $('body').on('click', '.detail-content a', function (e) {
        e.preventDefault();
        var href = $(this).attr('href');
        openDocument(href);
    });


    $('#user-name').html(ooh.contractor.firstname + " " + ooh.contractor.lastname);
    var currDate = new Date();
    $('#date').html(currDate.format('dddd') + '\n' + currDate.format(' d, mmmm, yyyy'));
    // load or getting workOrders



    // answers newer getting from server
    var storedAnswers = readAnswersFromLocalStore();
    if (storedAnswers) {
        ooh.answers = storedAnswers;
    }

    var storedTimeline = readTimelineFromLocalStore();
    if (storedTimeline) {
        ooh.timeline = storedTimeline;
    }

    var storedComments = readCommentsFromLocalStore();
    if (storedComments) {
        ooh.comments = storedComments;
    }
    var storedPhotos = readPhotosFromLocalStore();
    if (storedPhotos) {
        ooh.photos = storedPhotos;
    }

    var storedModWorkOrders = readModWorkOrdersFromLocalStore();
    if (storedModWorkOrders) {
        ooh.modifiedWorkOrders = storedModWorkOrders;
    }

    var storedModTasks = readModTasksFromLocalStore();
    if (storedModTasks) {
        ooh.modifiedTasks = storedModTasks;
    }

    if (hasInternet()) {
        setTimeout(function () {
            sendEntityesFromTimelineToServer(afterSending);
            function afterSending(result) {
                if (result.status.error) {
                    showErrorMessage(result.error);
                    return false;
                }
                updateWorkOrders();
            }

        }, 500);
    } else {
        showMessage(aMsg.willUsedLocalStoredData);
        var storedWorkOrders = readWorkOrdersFromLocalStore();
        ooh.workOrders = storedWorkOrders;
    }









// swipe
    try {
        $("#work-tab").swipe({
//Generic swipe handler for all directions
            swipeLeft: function (event, direction, distance, duration, fingerCount, fingerData) {
                if (ooh.orientation === 'portrait') {
                    return;
                }
                moveDetailsPanel(direction);
            },
            swipeRight: function (event, direction, distance, duration, fingerCount, fingerData) {
                if (ooh.orientation === 'portrait') {
                    return;
                }
                moveDetailsPanel(direction);
            },
            //Default is 75px, set to 0 for demo so any distance triggers swipe
            threshold: 75,
            //allowPageScroll: 'auto'
        });
    } catch (e) {
        log('swipe function not defined')
    }

}



function fixHeight() {
    var currHeight = $('body').height();
    var currWidth = $('body').width();
    //var minHeight = Math.min(currHeight, currWidth);
    if (currWidth > 250 && currHeight > 250) {
        if (currHeight > currWidth) {
// is portrait
            ooh.lowerSide = currWidth;
            ooh.biggerSite = currHeight;
        } else {
//landscape
            ooh.lowerSide = currHeight;
            ooh.biggerSite = currWidth;
        }
    }

}

function fixHover() {
//$('.btn').on('click', function () {
    $('body').on('click', '.btn', function () {
        var $innerImg = $(this).find('.inner-bg');
        if ($innerImg && $innerImg.length > 0) {
            var parentBgImg = $(this).css('background-image');
            var lastDotPos = parentBgImg.lastIndexOf('.');
            if (lastDotPos > 0) {
                var newBgImgAttr = parentBgImg.splice(lastDotPos, 0, '-pressed');
                //console.log(newBgImgAttr);
                $innerImg.css('background-image', newBgImgAttr);
            }
            $innerImg.stop(true, true).fadeIn(100,
                    function () {
                        //console.log('fade in success');
                        $innerImg.stop(true, true).fadeOut(1000);
                    });
            return;
        }

        var $innerColor = $(this).find('.inner-bg-color');
        if ($innerColor && $innerColor.length > 0) {
            var baseColor = $(this).css('backgroundColor');
            var innerBgColor = $innerColor.css('backgroundColor');
//            $innerColor.stop(true, true).fadeIn(100,
//                    function () {
//                        //console.log('fade in success');
//                        $innerColor.stop(true, true).fadeOut(1000);
//                    });
            $(this).stop().animate({'backgroundColor': innerBgColor}, 200);
            $(this).animate({'backgroundColor': baseColor}, 200);
            return;
        }

        var $innerColorMenu = $(this).find('.inner-bg-color-menu');
        if ($innerColorMenu && $innerColorMenu.length > 0) {
            /*.css('background-color', "#3DBFD9")*/
            var innerBgColor = $innerColorMenu.css('backgroundColor');
            //var baseColor = $(this).css('backgroundColor');
            var baseColor = getDefaultCssStyle('.main-menu .menu-btn', 'backgroundColor') //$(this).css('backgroundColor');
            $(this).siblings().stop().animate({'backgroundColor': baseColor}, 200);
            $(this).stop().animate({'backgroundColor': innerBgColor}, 300);
        }
    }
    );
}

//===========================  cordova js init  ================================
var deviceIsReady = false;
document.addEventListener("deviceready", fullReady, false);
function onDeviceReady() {

    if (!isMobile) {
        return;
    }
    deviceIsReady = true;
    getAppVersion(function (version) {
        ooh.version = version;
        log('VERSION of App: ' + version);
        //$('#version').html(ooh.version);
    });

//    document.addEventListener('backbutton', function (e) {
//        e.preventDefault();
//        $('section:visible').find('.back-button').click();
//    }, false);
    document.addEventListener('menubutton', function (e) {
        e.preventDefault();
        function onConfirm(buttonIndex) {
            if (buttonIndex === 2) {
                exitFromApp();
            }
        }

        navigator.notification.confirm(
                'Exit from app?',
                onConfirm,
                'Exit',
                'Cancel, Ok'
                );
    }, false);

    var width = document.body.clientWidth;
    var height = document.body.clientHeight;
    var angle = 0;
    width > height ? angle = 90 : angle = 0;
    switchOrientation(angle);


    window.addEventListener('orientationchange', doOnOrientationChange);

    navigator.splashscreen.hide();
}



function isDeviceReady() {
    if (deviceIsReady === false) {
        showErrorMessage('device not ready');
        log('device not ready');
        return false;
    }
    return true;
}


function doOnOrientationChange()
{
    log('orientation change, window.orientation: ' + window.orientation);
    var $body = $('body');
    setTimeout(function () {
        log('$body.width(): ' + $body.width() + '  $body.height(): ' + $body.height());
        if ($body.width() < 250 || $body.height() < 250) {
            log('width or height < 250, breaking');
            return;
        }
        switchOrientation(window.orientation);
//        alert(  'ooh.lowerSide:   ' + ooh.lowerSide +  '\n' +
//                'ooh.biggerSite:  ' + ooh.biggerSite + '\n' +
//                '$body.width():   ' + $body.width() +  '\n' +
//                '$body.height():  ' + $body.height() + '\n' +
//                'ooh.heightDelta: ' + ooh.heightDelta);

    }, 600);
}

function switchOrientation(angle) {
    var $body = $('body');
    switch (angle)
    {
        case -90:
        case 90:
        case 270:
        case -270:
            // landscape
            $body.removeClass('portrait');
            $body.addClass('landscape');
            ooh.orientation = 'landscape';
            ooh.heightDelta = Math.abs(ooh.biggerSite - $body.width());
            $body.css('height', ooh.lowerSide - ooh.heightDelta + 'px');
            break;
        default:
            // portrait
            $body.removeClass('landscape');
            $body.addClass('portrait');
            ooh.orientation = 'portrait';
            ooh.heightDelta = Math.abs(ooh.lowerSide - $body.width());
            var newHeight = ooh.biggerSite - ooh.heightDelta;
            if (newHeight < 250) {
                log('newHeight <250 breaking');
                return;
            }
            $body.css('height', ooh.biggerSite - ooh.heightDelta + 'px');
            break;
    }
}



// emulation rotation in desctop browser 
function initRotation() {
    if (isMobile) {
        return false;
    }


//start
    var width = document.body.clientWidth;
    var height = document.body.clientHeight;
    width > height ? window.orientation = 90 : window.orientation = 0;
    createEvent(); //call to init once 
    var interval = setInterval(function () {
        var width = $(window).width();
        var height = $(window).height();
        if (width > height && window.orientation === 0) {
            window.orientation = 90;
            createEvent();
            return;
        }
        if (height > width && window.orientation === 90) {
            window.orientation = 0;
            createEvent();
            return;
        }
    }, 2000);
    function createEvent() {
        var event; // The custom event that will be created
        if (document.createEvent) {
            event = document.createEvent("HTMLEvents");
            event.initEvent("orientationchange", true, true);
        } else {
            event = document.createEventObject();
            event.eventType = "orientationchange";
        }

        event.eventName = "orientationchange";
        if (document.createEvent) {
            window.dispatchEvent(event);
        } else {
            window.fireEvent("on" + event.eventType, event);
        }
    }

    window.addEventListener('orientationchange', doOnOrientationChange);
    doOnOrientationChange();
}


function exitFromApp()
{
    if (navigator.app && navigator.app.exitApp) {
        navigator.app.exitApp();
    } else if (navigator.device && navigator.device.exitApp) {
        navigator.device.exitApp();
    }
}



function logout() {
    ooh.contractor.isLogged = false;
    loadContent('index');
}




//================================  tabs  ======================================
function loadContent(page) {
    if (page === 'main') {
        $('#body').load('main.html #inner-body', function () {
            initMain();
            showWorkTab();
        });
    }
    if (page === 'index') {  //  index is login page
        $('#body').load('index.html #inner-body', function () {
            ooh.contractor.isLogged = false;
            writeLoginData();
            initIndex();
        });
    }
    if (page === 'settings') {
        $('#body').load('settings.html #inner-body', function () {
            initSettings();
        });
    }
}


function showLoginTab() {
    $('#login-tab').show().siblings().hide();
    return false;
}

function showSettingsTab() {
    addToBreadcrumbs('Settings');
    showTab('settings-tab');
    return false;
}

function showWorkTab() {
    addToBreadcrumbs('Work Orders');
    showTab('work-tab');
    fillWorkOrdersTab();
    showWorkOrdersPanel();
    return false;
}

function showFilesTab() {
    addToBreadcrumbs('Files');
    showTab('files-tab');
    drawFilesTab();
    return false;
}

function showHelpTab() {
    addToBreadcrumbs('Help');
    showTab('help-tab');
    drawHelpTab();
    return false;
}

function showTimelineTab() {
    showTab('timeline-tab');
    addToBreadcrumbs('Timeline');
    updateViewOfTimeline();
    return false;
}


function showTab(tabName) {
    var $tab = $('#' + tabName);
    var hided = false;
    $tab.siblings().fadeOut(200, function () {
        if (!hided) {
            $tab.fadeIn(300);
        }
        hided = true;
    });
}

function logout() {
    loadContent('index');
    return false;
}


function addToBreadcrumbs(title, level) {
    if (!level) {
        level = 0;
    }
    ooh.breadcrumbs[level] = {title: title};
    ooh.breadcrumbs.splice(level + 1, 3);
    rebuildBreadcrumbs();
}

function rebuildBreadcrumbs() {
    if (ptrn.breadcrumbsItemPtrn === null) {
        ptrn.breadcrumbsItemPtrn = getPattern($('#breadcrumbs-item-pattern'));
    }
    var htmlArr = [];
    for (var i in ooh.breadcrumbs) {
        var breadcrumbsItem = ooh.breadcrumbs[i];
        var breadcrumbsHtmlItem = ptrn.breadcrumbsItemPtrn.prop('outerHTML').render(breadcrumbsItem);
        htmlArr.push(breadcrumbsHtmlItem);
    }

    var $breadcrumbs = $('.breadcrumbs');
    $breadcrumbs.html(htmlArr.join('\n'));
}





//=================== filling tabs  ================================
function fillWorkOrdersTab() {
    if (ptrn.workItemPtrn === null) {
        ptrn.workItemPtrn = getPattern($('#work-item-pattern'));
    }
    var $workList = $('#work-list');
    var $scroller = $('.work-list-scroller');
    var workOrders = ooh.workOrders;
    var htmlArr = [];
    for (var i in workOrders) {
        var currWorkOrder = workOrders[i];
        // define complete percentage for tasks
        var complete = 0;
        var tasksCount = 0;
        var completeCount = 0;
        for (var j in currWorkOrder.tasks) {
            tasksCount++;
            var currTask = currWorkOrder.tasks[j];
            var cTaskstatusId = currTask.statusId;
            if (cTaskstatusId === 4) {
                completeCount++;
            }
        }
        if (tasksCount > 0) {
            complete = parseInt(100 * completeCount / tasksCount);
        }

        currWorkOrder.complete = complete;
//        if (tasksCount > 0 && tasksCount === completeCount) {
//            currWorkOrder.statusId = 4;
//        }



        currWorkOrder.activeOrSuspendedClass = ''; // empty by default (new or in progress)
        if (currWorkOrder.statusId === 4) {
            currWorkOrder.activeOrSuspendedClass = 'work-item-completed'; // finished
        }
        if (currWorkOrder.statusId === 5) {
            currWorkOrder.activeOrSuspendedClass = 'work-item-suspended'; // suspended
        }

        var workOrderHtmlItem = ptrn.workItemPtrn.prop('outerHTML').render(currWorkOrder);
        htmlArr.push(workOrderHtmlItem);
    }
    $workList.html(htmlArr.join('\n'));
    $workList.on("click", "li", function () {
//        var id = parseInt( $(this).attr('data-bind') );
//        var workOrder = findWorkOrderById(ooh.workOrders, id);
//        addToBreadcrumbs(workOrder.title, 1);

        if ($(this).hasClass('work-item-active')) {
            return;
        }
        $(this).siblings().removeClass('work-item-active');
        $(this).addClass('work-item-active');
    });
    // finding active
    if (ooh.activeWorkOrderId) {
        var $activeLi = $workList.find('li[data-bind=' + ooh.activeWorkOrderId + ']');
        $activeLi.addClass('work-item-active');
        var workOrder = findWorkOrderById(ooh.workOrders, ooh.activeWorkOrderId);
        addToBreadcrumbs(workOrder.title, 1);
    }

}


function fillTasksTab(tasksArr) {
    if (ptrn.taskItemPtrn === null) {
        ptrn.taskItemPtrn = getPattern($('#task-item-pattern'));
    }
    var $tasksPanel = $('#tasks-panel');
    $tasksPanel.fadeIn(200);
    var $tasksList = $('#tasks-list');
    var $tasksComplete = $('#task-complete');
    if ($tasksList.is(":hidden")) {
        onFadeOut();
    } else {
        $tasksList.fadeOut(200, onFadeOut);
    }

    function onFadeOut() {
        $tasksList.html('');
        var tasksCount = 0;
        var completeCount = 0;
        var n = 1;
        for (var i in tasksArr) {
            tasksCount++;
            var currTask = tasksArr[i];
            currTask.n = n;
            n++;
            var canBeDone = false;
            // not ===
            if (i == 0) {
                canBeDone = true;
            }
            if (i > 0 && (tasksArr[i - 1].statusId === 4)) {
                canBeDone = true;
            }
            currTask.canBeDone = canBeDone;
            if (currTask.finishedOn) {
                try {
                    currTask.fTime = currTask.finishedOn.format("h:MM TT");
                } catch (e) {
                    currTask.fTime = currTask.finishedOn;
                }
            } else {
                currTask.fTime = "--";
            }
            
            currTask.activeOrSuspendedClass = '';
            var cTaskStatusId = currTask.statusId;
            currTask.status = getStatusById(cTaskStatusId);
            if (cTaskStatusId === 4) {
                completeCount++;
                currTask.cssComplete = 'round-status-completed';
            } else {
                currTask.cssComplete = '';
            }
            
            if(cTaskStatusId === 5){
                currTask.activeOrSuspendedClass = 'task-item-suspended';
            }
        }


        $tasksComplete.html(completeCount + ' of ' + tasksCount);
        var htmlArr = [];
        for (var i in tasksArr) {
            var currTask = tasksArr[i];
            var taskHtmlItem = ptrn.taskItemPtrn.prop('outerHTML').render(currTask);
            htmlArr.push(taskHtmlItem);
        }
        $tasksList.html(htmlArr.join('\n'));
        $tasksList.on("click", "li", function () {
//            if ($(this).hasClass('task-item-active')) {
//                return;
//            }
//            $(this).siblings().removeClass('task-item-active');
//            $(this).addClass('task-item-active');
            setVisualActiveTaskItem(this);
        });
        function setVisualActiveTaskItem(element) {
            if ($(element).hasClass('task-item-active')) {
                return;
            }
            $(element).siblings().removeClass('task-item-active');
            $(element).addClass('task-item-active');
        }

        $tasksList.show(); //fadeIn(200);
        if (tasksCount > 0 && tasksCount === completeCount) {
//            showQuestionPanel();
//            fillQuestionsList('final');
//return;
        }

        if (tasksArr === null || tasksArr.length === 0) {
            // details arr is void  (clearing details)
            fillDetailsTab(null);
            return;
        }

//and first detail
        if (ooh.activeTaskId === null) {
//fillDetailsTab(tasksArr[0]);
            setVisualActiveTaskItem($tasksList.find('li:first').get(0));
            ooh.activeTaskId = $tasksList.find('li:first').attr('data-bind');
            setVisualActiveTaskItem($tasksList.find('li[data-bind=' + ooh.activeTaskId + ']').get(0));
        } else {

//fillDetailsTab(ooh.currTask);
            setVisualActiveTaskItem($tasksList.find('li[data-bind=' + ooh.activeTaskId + ']').get(0));
            //$tasksList.find('li[data-bind=' + ooh.activeTaskId + ']').click();
        }
        setActiveTask(ooh.activeTaskId);
    }

}



function actionStartWork() {
    hideSiteInfoPanel();
    showQuestionPanel();
    fillQuestionsList('review');
    var currWorkOrder = ooh.currWorkOrder;
    currWorkOrder.statusId = 2;
    var modWorkOrder = new ModWorkOrder(currWorkOrder);
    addEntityToTimeline(modWorkOrder);
}


function hideTasksAndDetailsPanel() {
    var $tasksPanel = $('#tasks-panel');
    var $detailsPanel = $('#details-panel');
    //var $questionsPanel = $('#questions-panel');

    $tasksPanel.hide();
    $detailsPanel.hide();
}



function showTasksPanel() {
    var $tasksPanel = $('#tasks-panel');
    var $detailsPanel = $('#details-panel');
    var $questionsPanel = $('#questions-panel');
    $questionsPanel.hide();
    $tasksPanel.fadeIn(200);
    $detailsPanel.fadeIn(200);
}

function showSiteInfoPanel() {
    if (ptrn.sitePtrn === null) {
        ptrn.sitePtrn = getPattern($('#site-pattern'));
    }
    if (ptrn.siteImagePtrn === null) {
        ptrn.siteImagePtrn = getPattern($('#site-image-pattern'));
    }
    if (ptrn.siteDocumentPtrn === null) {
        ptrn.siteDocumentPtrn = getPattern($('#site-document-pattern'));
    }

    var $siteInfoPanel = $('#site-info-panel');
    $siteInfoPanel.show();
    var workOrder = ooh.currWorkOrder;
    var site = workOrder.site;
    //var workOrder = findWorkOrderById(ooh.workOrders, task.workOrderId);
    var siteHtml = 'void';
    if (workOrder) {
        var site = new Site();
        site = workOrder.site;
        // images
        var $images = ptrn.sitePtrn.find('.images');
        var imagesHtmlArr = [];
        for (var i in site.images) {
            var image = site.images[i];
            image.fullUrl = ooh.host + image.url;
            var html = ptrn.siteImagePtrn.prop('outerHTML').render(image);
            imagesHtmlArr.push(html);
        }
        $images.html(imagesHtmlArr.join('\n'));
        // documents
        var $documents = ptrn.sitePtrn.find('.documents');
        var documentsHtmlArr = [];
        for (var i in site.documents) {
            var document = site.documents[i];
            document.fullUrl = ooh.host + document.url;
            var html = ptrn.siteDocumentPtrn.prop('outerHTML').render(document);
            documentsHtmlArr.push(html);
        }
        $documents.html(documentsHtmlArr.join('\n'));
        siteHtml = ptrn.sitePtrn.prop('outerHTML').render(site);
    }
    $siteInfoPanel.html(siteHtml);
    var $startBtn = $siteInfoPanel.find('.start-btn');
    var $backBtn = $siteInfoPanel.find('.back-btn');
    if (workOrder.statusId === 1) {
        $startBtn.show();
        $backBtn.hide();
    } else {
        $startBtn.hide();
        $backBtn.show();
    }

    var siteLat = site.lat;
    var siteLng = site.lng;
    if (!ooh.mapInitialize) {
        showMessage(eMsg.mapsNotInit, 'alert');
        googleMapLoadScript();
        return;
    }

    getCurrentPosition(afterGettingPosition);
    function afterGettingPosition(result) {
        if (result.error === true) {
            showErrorMessage(result.error);
            return;
        }
        var currLat = result.data.latitude;
        var currLng = result.data.longitude;
        var latlngList = [];
        latlngList.push(new google.maps.LatLng(currLat, currLng));
        latlngList.push(new google.maps.LatLng(siteLat, siteLng));
        var bounds = new google.maps.LatLngBounds();
        for (var i in latlngList) {
            bounds.extend(latlngList[i]);
        }

        var mapContainer = $('#map-container').get(0);
        var map = new google.maps.Map(mapContainer, mapObject.voidOptions);
        map.setCenter(bounds.getCenter()); //or use custom center
        map.fitBounds(bounds);
        var currentPosMarker = new google.maps.Marker({
            position: new google.maps.LatLng(currLat, currLng),
            map: map,
            title: 'me'
        });
        var currPosIcon = new google.maps.MarkerImage(
                'img/icons/map_marker_green.png',
                null, /* size is determined at runtime */
                null, /* origin is 0,0 */
                null, /* anchor is bottom center of the scaled image */
                new google.maps.Size(32, 32)
                );
        currentPosMarker.setIcon(currPosIcon);
        var siteMarker = new google.maps.Marker({
            position: new google.maps.LatLng(siteLat, siteLng),
            map: map,
            title: 'site',
            icon: 'img/icons/map_marker_blue.png'
        });
        var sitePosIcon = new google.maps.MarkerImage(
                'img/icons/map_marker_blue.png',
                null, /* size is determined at runtime */
                null, /* origin is 0,0 */
                null, /* anchor is bottom center of the scaled image */
                new google.maps.Size(32, 32)
                );
        siteMarker.setIcon(sitePosIcon);
        $('#map-container').click(function (e) {
            e.preventDefault();
            //e.stopPropagation();
            var target = e.target;
            if (target.tagName === 'IMG') {
                return false;
            }
        });
    }


}

function hideSiteInfoPanel() {
    var siteInfoPanel = $('#site-info-panel');
    siteInfoPanel.hide();
}

function showWorkOrdersPanel() {
// todo next remove from hier
    var $tasksPanel = $('#tasks-panel');
    var $detailsPanel = $('#details-panel');
    var $workList = $('#work-list');
    $tasksPanel.hide();
    $detailsPanel.hide();
    // and showing first task
    if (ooh.activeWorkOrderId === null) {
        $workList.find('li:first').click();
    } else {
        $workList.find('li[data-bind=' + ooh.activeWorkOrderId + ']').click();
    }
}

function showQuestionPanel() {
    var $questionsPanel = $('#questions-panel');
    $questionsPanel.show();
}

function hideQuestionPanel() {
    var $questionsPanel = $('#questions-panel');
    $questionsPanel.hide();
}

function fillDetailsTab(task) {
    if (ptrn.detailsPtrn === null) {
        ptrn.detailsPtrn = getPattern($('#details-pattern'));
    }
    if (ptrn.detailsCompletePtrn === null) {
        ptrn.detailsCompletePtrn = getPattern($('#details-complete-pattern'));
    }
    if (ptrn.siteDocumentPtrn === null) {
        ptrn.siteDocumentPtrn = getPattern($('#site-document-pattern'));
    }
    if (ptrn.commentPtrn === null) {
        ptrn.commentPtrn = getPattern($('#comment-pattern'));
    }
    if (ptrn.siteImagePtrn === null) {
        ptrn.siteImagePtrn = getPattern($('#site-image-pattern'));
    }
    if (ptrn.photoPtrn === null) {
        ptrn.photoPtrn = getPattern($('#photo-pattern'));
    }


    var $detailsPanel = $('#details-panel');
    if ($detailsPanel.is(":hidden")) {
        afterFadeOut();
    } else {
        //$detailsPanel.fadeOut(200, afterFadeOut);
        $detailsPanel.hide(0, afterFadeOut);
    }



    function afterFadeOut() {
        if (task === null) {
            // void task list or task not found
            return;
        }
        addToBreadcrumbs(task.title, 2);
        if (task.canBeDone) {
            task.buttonsDisabled = 'false';
            task.buttonsDisabledClass = '';
        } else {
            task.buttonsDisabled = 'true';
            task.buttonsDisabledClass = 'disabled-buttons';
        }
        $detailsPanel.html('');
        var detailHtmlItem;
        task.status = getStatusById(statuses, task.statusId);
        if (ooh.currWorkOrder.statusId === 5) {
            task.doneSuspendClass = 'invisible';
            task.resumeClass = '';
        } else {
            task.doneSuspendClass = '';
            task.resumeClass = 'invisible';
        }

        if (task.statusId === 4) {
            detailHtmlItem = ptrn.detailsCompletePtrn.prop('outerHTML').render(task);
        } else {
            detailHtmlItem = ptrn.detailsPtrn.prop('outerHTML').render(task);
        }

        $detailsPanel.html(detailHtmlItem);
        // documents
        var $documents = $detailsPanel.find('.documents');
        var documentsHtmlArr = [];
        for (var i in task.documents) {
            var document = task.documents[i];
            document.fullUrl = ooh.host + document.url;
            var html = ptrn.siteDocumentPtrn.prop('outerHTML').render(document);
            documentsHtmlArr.push(html);
        }
        $documents.html(documentsHtmlArr.join('\n'));
        //images (of work order of current task) from server 
        var $images = $detailsPanel.find('.images');
        var imagesHtmlArr = [];
        var imagesArr = ooh.currWorkOrder.images;
        for (var i in imagesArr) {
            var image = imagesArr[i];
            image.fullUrl = image.url;
            var html = ptrn.siteImagePtrn.prop('outerHTML').render(image);
            imagesHtmlArr.push(html);
        }

        $images.html(imagesHtmlArr.join('\n'));
        // comments preparing
//        var existedComments = findCommentsByTaskId(ooh.comments, task.id);
//        var serverComments = task.comments;
//        for (var i in serverComments) {
//            var currServerComment = serverComments[i];
//            var existsInSaved = false;
//            for (var j in existedComments) {
//                var currExistedComment = existedComments[j];
//                if (currExistedComment.uid === currServerComment.uid) {
//                    existsInSaved = true;
//                }
//                /// fix for old
//                if (currExistedComment.uid === -1) {
//                    existsInSaved = false;
//                }
//            }
//            if (!existsInSaved) {
//                existedComments.push(currServerComment);
//            }
//
//        }


        // comments view
        var existedComments = task.comments;
        var commentsPhotosArr = [];
        var commentsPhotosHtmlArr = [];
        commentsPhotosArr = commentsPhotosArr.concat(existedComments);
        commentsPhotosArr = commentsPhotosArr.concat(task.photos);
        commentsPhotosArr.sort(function (a, b) {
            if (a.createdOn > b.createdOn) {
                return 1;
            }
            if (a.createdOn < b.createdOn) {
                return -1;
            }
            return 0;
        });
        for (var i in commentsPhotosArr) {
            if (getObjectType(commentsPhotosArr[i]) === 'Comment') {
                commentsPhotosHtmlArr.push(getHtmlFromComment(commentsPhotosArr[i]));
            }
            if (getObjectType(commentsPhotosArr[i]) === 'Photo') {
                commentsPhotosHtmlArr.push(getHtmlFromPhoto(commentsPhotosArr[i]));
            }
        }

        function getHtmlFromComment(comment) {
            var exComment = comment;
            exComment.readonly = 'readonly';
            exComment.visibleBtnClass = 'invisible';
            exComment.fDate = exComment.createdOn.format('commentDate');
            exComment.ownerName = (exComment.ownerId === ooh.contractor.id) ? ooh.contractor.firstname : 'admin';
            var commentHtml = ptrn.commentPtrn.prop('outerHTML').render(exComment);
            return commentHtml;
        }



//photos (lacally created and loaded from server);
        function getHtmlFromPhoto(photo) {
            if (photo.nativePath && photo.nativePath !== '') {
                photo.imageSrc = photo.nativePath;
            } else {
                photo.imageSrc = photo.url;
            }
//hack
            if (!isMobile) {
                if (photo.url) {
                    photo.imageSrc = photo.url;
                } else {
                    photo.imageSrc = photo.path;
                }
            }


            photo.fDate = photo.createdOn.format('commentDate');
            photo.ownerName = (photo.ownerId === ooh.contractor.id) ? ooh.contractor.firstname : 'admin';
            var html = ptrn.photoPtrn.prop('outerHTML').render(photo);
            return html;
        }

//====
        var $additionals = $detailsPanel.find('.additionals');
        $additionals.append(commentsPhotosHtmlArr.join('\n'));
        $detailsPanel.fadeIn(300);
    }

}



function setActiveWorkOrder(workId) {
    var workOrder = findWorkOrderById(ooh.workOrders, workId);
    addToBreadcrumbs(workOrder.title, 1);
    ooh.currWorkOrder = workOrder;
    ooh.activeWorkOrderId = workOrder.id;
    ooh.activeTaskId = null;
    var tasks = workOrder.tasks;
    if (workOrder.statusId === -1) {
        showMessage('work orders statusId not setted. will be setted 1');
        workOrder.statusId = 1;
    }

    if (workOrder.statusId === 1) {
// is new -> need show site info
        hideTasksAndDetailsPanel();
        hideQuestionPanel();
        showSiteInfoPanel();
    } else if (workOrder.statusId === 2) {
// is viewed -> need show tasks with details
        if (workOrder.reviewAnswersCompleted) {
            hideQuestionPanel();
            hideSiteInfoPanel();
            fillTasksTab(tasks);
        } else {
            hideTasksAndDetailsPanel();
            hideSiteInfoPanel();
            showQuestionPanel();
            fillQuestionsList('review');
        }
    } else if (workOrder.statusId === 3) {
// 3=in progress  
        hideQuestionPanel();
        hideSiteInfoPanel();
        fillTasksTab(tasks);
    } else if (workOrder.statusId === 4) {
// is finished -> need show tasks with details
        if (workOrder.finalAnswersCompleted) {
            hideQuestionPanel();
            hideSiteInfoPanel();
            fillTasksTab(tasks);
        } else {
            hideTasksAndDetailsPanel();
            hideSiteInfoPanel();
            showQuestionPanel();
            fillQuestionsList('final');
        }

    } else if (workOrder.statusId === 5) {
// is suspended -> need show tasks with details
        if (workOrder.suspendAnswersCompleted) {
            hideQuestionPanel();
            hideSiteInfoPanel();
            fillTasksTab(tasks);
        } else {
            hideTasksAndDetailsPanel();
            hideSiteInfoPanel();
            showQuestionPanel();
            fillQuestionsList('suspend');
        }

    }


}

function setActiveTask(taskId) {

    var currTasks = ooh.currWorkOrder.tasks;
    var task = findTaskById(currTasks, taskId);
    if (!task) {
//showErrorMessage(eMsg.taskNotFound);
//return;
        ooh.currTask = null;
        ooh.activeTaskId = null;
    }
    ooh.currTask = task;
    ooh.activeTaskId = task.id;
    fillDetailsTab(task);
}


function actionShowSiteInfo() {
    showSiteInfoPanel();
    hideTasksAndDetailsPanel();
}

//function switchToSiteView() {
//    ooh.detailsViewType = 'site';
//    fillDetailsTab(ooh.currTask);
//}
//
//function switchToTaskView() {
//    ooh.detailsViewType = 'task';
//    fillDetailsTab(ooh.currTask);
//}


function actionSetFullscreen(element) {
    if (ooh.workTabWiewState === null) {
        ooh.workTabWiewState = 'small-width';
    }
    if (ooh.workTabWiewState === 'small-width') {
        moveDetailsPanel('left');
        return;
    }
    if (ooh.workTabWiewState === 'full-width') {
        moveDetailsPanel('right');
        return;
    }
}


function moveDetailsPanel(direction) {
    var time = 800;
    var maxFontSize = '1.35em';
    var minFontSize = '1em';
    var easing = 'linear'; // 'linear', 'swing'
    var $workOrdersPanel = $('#work-orders-panel');
    var $tasksPanel = $('#tasks-panel');
    var $detailsPanel = $('#details-panel');
    var $siteInfoPanel = $('#site-info-panel');
    var $questionsPanel = $('#questions-panel');
    if (ooh.workTabWiewState === null) {
        ooh.workTabWiewState = 'small-width';
    }

    if (ooh.workTabWiewState === 'small-width') {
        if (direction === 'right') {
            return;
        }
        if (direction === 'left') {

//            ooh.workTabWiewState = 'half-width';
//            $workOrdersPanel.animate({width: '13%'}, time, easing);
//            $tasksPanel.animate({width: '13%', 'margin-left': '-2%'}, time, easing);
//            $detailsPanel.animate({width: '74%'}, time, easing);
//            $siteInfoPanel.animate({width: '85%'}, time, easing);
//            $questionsPanel.animate({width: '85%'}, time, easing);
//            return;

            ooh.workTabWiewState = 'full-width';
            $workOrdersPanel.animate({width: '0%'}, time, easing);
            $tasksPanel.animate({width: '0%', /*'margin-left': '0%'*/}, time, easing);
            $workOrdersPanel.css({paddingLeft: 0, paddingRight: 0});
            $tasksPanel.css({paddingLeft: 0, paddingRight: 0});
            $detailsPanel.animate({width: '98%', fontSize: maxFontSize}, time, easing);
            $siteInfoPanel.animate({width: '98%', fontSize: maxFontSize}, time, easing);
            $questionsPanel.animate({width: '98%', fontSize: maxFontSize}, time, easing);
            return;
        }
    }

//    if (ooh.workTabWiewState === 'half-width') {
//        if (direction === 'right') {
//            ooh.workTabWiewState = 'small-width';  // to default
//            $workOrdersPanel.animate({width: '28%'}, time, easing);
//            $tasksPanel.animate({width: '28%', 'margin-left': '0%'}, time, easing);
//            $detailsPanel.animate({width: '42%'}, time, easing);
//            $siteInfoPanel.animate({width: '70%'}, time, easing);
//            $questionsPanel.animate({width: '70%'}, time, easing);
//            return;
//        }
//        if (direction === 'left') {
//            ooh.workTabWiewState = 'full-width';
//            $workOrdersPanel.animate({width: '0%'}, time, easing);
//            $tasksPanel.animate({width: '0%', 'margin-left': '0%'}, time, easing);
//            $workOrdersPanel.css({paddingLeft: 0, paddingRight: 0});
//            $tasksPanel.css({paddingLeft: 0, paddingRight: 0});
//            $detailsPanel.animate({width: '98%'}, time, easing);
//            $siteInfoPanel.animate({width: '98%'}, time, easing);
//            $questionsPanel.animate({width: '98%'}, time, easing);
//            return;
//        }
//    }

    if (ooh.workTabWiewState === 'full-width') {
        if (direction === 'left') {
            return;
        }
        if (direction === 'right') {
            ooh.workTabWiewState = 'small-width'; // to default
            $workOrdersPanel.animate({width: '28%'}, time, easing);
            $tasksPanel.animate({width: '28%', /*'margin-left': '0%'*/}, time, easing);
            $detailsPanel.animate({width: '42%', fontSize: minFontSize}, time, easing);
            $siteInfoPanel.animate({width: '70%', fontSize: minFontSize}, time, easing);
            $questionsPanel.animate({width: '70%', fontSize: minFontSize}, time, easing);
            return;
//            ooh.workTabWiewState = 'half-width';
//            $workOrdersPanel.animate({width: '13%'}, time, easing, function () {
//                $workOrdersPanel.css({padding: ''});
//                $tasksPanel.css({padding: ''});
//            });
//            $tasksPanel.animate({width: '13%', 'margin-left': '-2%'}, time, easing);
//
//            $detailsPanel.animate({width: '74%'}, time, easing);
//            $siteInfoPanel.animate({width: '85%'}, time, easing);
//            $questionsPanel.animate({width: '85%'}, time, easing);
//            return;
        }
    }


}











//==================   menu    ==============================

function initMenu() {
    $('#open-menu-btn, #context-menu, #settings-menu, #settings-menu-btn').click(function (event) {
//event.stopPropagation();
    });
    $(document).on('click', function () {
        closeMenu();
    });
//    $('iframe').each(function () {
//        $(this).get(0).contentWindow.document.body.onclick =
//                function () {
//                    alert("iframe clicked");
//                }
////                .bind('click', function(event) {
////            closeMenu();
////        })
//    });
}

function openMenu(type) {
    setTimeout(function () {
        if (type === 'main') {
            var $menu = $('#context-menu');
            var $menuBtn = $('#open-menu-btn');
            $menuBtn.addClass('pressed');
            $menu.fadeIn(500);
            //closeMenu('settings');
        }
        if (type === 'settings') {
            $('#version').html(ooh.version);
            var $menu = $('#settings-menu');
            var $menuBtn = $('#settings-menu-btn');
            $menuBtn.addClass('pressed');
            $menu.fadeIn(500);
            //closeMenu('main');
        }

    }, 200);
}

function closeMenu(type) {
    if (!type || type === 'main') {
        var $menu = $('#context-menu');
        var $menuBtn = $('#open-menu-btn');
        $menuBtn.removeClass('pressed');
        $menu.stop().fadeOut(500);
    }
    if (!type || type === 'settings') {
        var $menu = $('#settings-menu');
        var $menuBtn = $('#settings-menu-btn');
        $menuBtn.removeClass('pressed');
        $menu.stop().fadeOut(500);
    }

}




function fillQuestionsList(type) {
    var currWorkOrder = ooh.currWorkOrder;
    var allQuestions = currWorkOrder.questions;
    var questions = [];
    var $continueBtn = $('#continue-btn');
    var $cancelBtn = $('#cancel-btn');
    var $completeBtn = $('#complete-btn');
    $continueBtn.attr('data-bind', type);
    $cancelBtn.attr('data-bind', type);
    $completeBtn.attr('data-bind', type);
    var $questionTitle = $('#q-title');
    switch (type) {
        case 'review':
            questions = filterQuestions(allQuestions, 1);
            $continueBtn.show();
            $cancelBtn.show();
            $completeBtn.hide();
            $questionTitle.html(msg.reviewList);
            break;
        case 'suspend':
            questions = filterQuestions(allQuestions, 2);
            $continueBtn.show();
            $cancelBtn.show();
            $completeBtn.hide();
            $questionTitle.html(msg.suspendList);
            break;
        case 'final':
            questions = filterQuestions(allQuestions, 3);
            $continueBtn.hide();
            $cancelBtn.hide();
            $completeBtn.show();
            $questionTitle.html(msg.finalList);
            break;
    }



    if (ptrn.paragraphQstPtrn === null) {
        ptrn.paragraphQstPtrn = getPattern($('#paragraph-question-pattern'));
    }
    if (ptrn.textFieldQstPtrn === null) {
        ptrn.textFieldQstPtrn = getPattern($('#text-question-pattern'));
    }
    if (ptrn.textAreaQstPtrn === null) {
        ptrn.textAreaQstPtrn = getPattern($('#textarea-question-pattern'));
    }
    if (ptrn.checkboxesQstPtrn === null) {
        ptrn.checkboxesQstPtrn = getPattern($('#checkboxes-question-pattern'));
    }
    if (ptrn.radioQstPtrn === null) {
        ptrn.radioQstPtrn = getPattern($('#radio-question-pattern'));
    }
    if (ptrn.selectboxQstPtrn === null) {
        ptrn.selectboxQstPtrn = getPattern($('#selectbox-question-pattern'));
    }
    if (ptrn.fileQstPtrn === null) {
        ptrn.fileQstPtrn = getPattern($('#file-question-pattern'));
    }

    if (ptrn.checkboxQstPtrn === null) {
        ptrn.checkboxQstPtrn = getPattern($('#checkbox-question-pattern'));
    }
    if (ptrn.radioBtnQstPtrn === null) {
        ptrn.radioBtnQstPtrn = getPattern($('#radio-button-question-pattern'));
    }
    if (ptrn.selectOptionQstPtrn === null) {
        ptrn.selectOptionQstPtrn = getPattern($('#selectbox-option-question-pattern'));
    }
    if (ptrn.uploadPhotoItemPtrn === null) {
        ptrn.uploadPhotoItemPtrn = getPattern($('#upload-photo-item-pattern'));
    }



    var questionsHtmlArr = [];
    for (var i in questions) {
        var question = questions[i];
        var fieldOptions = question.json.field_options;
        question.requiredClass = question.json.required ? 'required' : 'invisible';
        var questionHtml = '';
        var answerOfQuestion = findAnswerOfQuestionById(ooh.answers, question.id);
        if (answerOfQuestion) {
            question.data = answerOfQuestion.data;
        } else {
            question.data = {value: '', values: [], name: '', path: ''};
        }

        var answerDataObj = {};
        answerDataObj.enum = question.questionEnumId;
        answerDataObj.required = question.json.required;
        question.answerData = objectToString(answerDataObj);
        switch (question.questionEnumId) {
            case 1: // text
                questionHtml = ptrn.textFieldQstPtrn.prop('outerHTML').render(question, true);
                break;
            case 3: // checkboxes
                var checkboxesQstPtrnCloned = $(ptrn.checkboxesQstPtrn).clone();
                var cboxHtmlArr = [];
                for (var j in fieldOptions.options) {
                    var currOption = fieldOptions.options[j];
                    cboxHtmlArr.push(ptrn.checkboxQstPtrn.prop('outerHTML').render(currOption));
                }
                checkboxesQstPtrnCloned.find('.answer').html(cboxHtmlArr.join('\n'));
                checkboxesQstPtrnCloned.find('input:checkbox').each(function () {
                    for (var i in question.data.values) {
                        if (question.data.values[i] === $(this).attr('value')) {
                            $(this).attr('checked', true);
                        }
                    }
                });
                questionHtml = checkboxesQstPtrnCloned.prop('outerHTML').render(question, true);
                break;
            case 6: // file
                var fileQstPtrnCloned = $(ptrn.fileQstPtrn).clone();
                var $answer = fileQstPtrnCloned.find('.answer');
                var $uploadPhotosList = $answer.find('.upload-photos-list');
                var values = question.data.values;
                for (var i in values) {
                    var html = ptrn.uploadPhotoItemPtrn.prop('outerHTML').render(values[i]);
                    $uploadPhotosList.append(html);
                }
                questionHtml = fileQstPtrnCloned.prop('outerHTML').render(question, true);
                break;
            case 7: // selectbox(dropdown)
                var selectboxesQstPtrnCloned = $(ptrn.selectboxQstPtrn).clone();
                var optionsArr = [];
                if (fieldOptions.include_blank_option === true) {
                    optionsArr.push(ptrn.selectOptionQstPtrn.prop('outerHTML').render({label: ''}));
                }
                for (var j in fieldOptions.options) {
                    var currOption = fieldOptions.options[j];
                    optionsArr.push(ptrn.selectOptionQstPtrn.prop('outerHTML').render(currOption));
                }
                selectboxesQstPtrnCloned.find('.answer .selectbox').html(optionsArr.join('\n'));
                selectboxesQstPtrnCloned.find('.answer .selectbox option[value=' + question.data.value + ']').attr('selected', 'selected');
                questionHtml = selectboxesQstPtrnCloned.prop('outerHTML').render(question, true);
                break;
            case 8: // radio
                var radioQstPtrnCloned = $(ptrn.radioQstPtrn).clone();
                var radiosArr = [];
                for (var j in fieldOptions.options) {
                    var currOption = fieldOptions.options[j];
                    radiosArr.push(ptrn.radioBtnQstPtrn.prop('outerHTML').render(currOption));
                }
                radioQstPtrnCloned.find('.answer').html(radiosArr.join('\n'));
                radioQstPtrnCloned.find('input[value=' + question.data.value + ']').attr('checked', true);
                questionHtml = radioQstPtrnCloned.prop('outerHTML').render(question, true);
                break;
            case 9: // paragraph
                questionHtml = ptrn.paragraphQstPtrn.prop('outerHTML').render(question, true);
                break;
            case 10:  // textarea
                questionHtml = ptrn.textAreaQstPtrn.prop('outerHTML').render(question, true);
                break;
            default:
                questionHtml = 'error unknown question enum ' + question.questionEnumId;
        }
        questionsHtmlArr.push(questionHtml);
    }

    var $questionsContainer = $('#questions-container');
    var $questionsWrapper = $('#questions-wrapper');
    var $scrollUpButton = $questionsContainer.find('.scroll-up');
    var $scrollDownButton = $questionsContainer.find('.scroll-down');
    $questionsContainer.scroll(inScroll);
    function inScroll() {
        if ($questionsContainer.scrollTop() <= 0) {
            $scrollUpButton.fadeOut('slow');
        } else {
            $scrollUpButton.fadeIn('slow');
        }
        var maxH = $questionsWrapper.prop('offsetHeight') - $questionsContainer.height();
        if ($questionsContainer.scrollTop() >= maxH) {  //todo arrow down visible if is one question
            $scrollDownButton.fadeOut('slow');
        } else {
            $scrollDownButton.fadeIn('slow');
        }
    }
    inScroll();
    //$questionsContainer.animate({ scrollTop: 0}, 100)


    $questionsWrapper.html(questionsHtmlArr.join('\n\n'));
    //var $workTaskDetailPanel = $('#work-task-detail-panel');
//    var $questionsPanel = $('#questions-panel');
//    var $tasksPanel = $('#tasks-panel');
//    var $tasksDetail = $('#details-panel');
//
//    //$workTaskDetailPanel.hide();
//    $tasksDetail.hide();
//    $tasksPanel.hide();
//    $questionsPanel.show();
}

function scrollDown(element) {
    var $scrollContainer = $(element).parent();
    $scrollContainer.animate({scrollTop: $scrollContainer.height()}, 600)
}
function scrollUp(element) {
    var $scrollContainer = $(element).parent();
    $scrollContainer.animate({scrollTop: 0}, 600)
}


function actionBackToWorkOrders() {
//var $workTaskDetailPanel = $('#work-task-detail-panel');
    var $siteInfoPanel = $('#site-info-panel');
    var $questionsPanel = $('#questions-panel');
    var $tasksPanel = $('#tasks-panel');
    var $detailsPanel = $('#details-panel');
    //$workTaskDetailPanel.show();
    $siteInfoPanel.hide();
    $questionsPanel.hide();
    $detailsPanel.show();
    $tasksPanel.show();
}




//==================  answers  =============================

function addAnswer(element) {
    var questionId = $(element).parents('.qst').children('.qst-text').attr('data-bind');
    questionId = parseInt(questionId);
    if (!questionId) {
        showErrorMessage('questionId not setted');
        return;
    }
    var existedAnswers = ooh.answers;
    var question = findQuestionById(ooh.currWorkOrder.questions, questionId);
    if (!question) {
        showErrorMessage('question with id ' + questionId + ' not found');
        return;
    }

    var data = {};
    switch (question.questionEnumId) {
        case 1: //text
            data.value = $(element).val();
            break;
        case 3: //checkboxes
            data = {values: []};
            var $checkboxes = $(element).parents('.answer').find('input:checkbox:checked');
            $checkboxes.each(function () {
                data.values.push($(this).val());
            });
            break;
        case 6:  // file
            // saving file happens by button click
            // and this method called when photo is prepared
            data = {values: []};
            var $answer = $(element).parents('.answer');
            var $uploadPhotosList = $answer.find('.upload-photos-list');
            var $photoItems = $uploadPhotosList.find('.upload-photo-item');
            $photoItems.each(function () {
                var $fileNameInput = $(this).find('input[name=name]');
                var $filePathInput = $(this).find('input[name=path]');
                var photoData = {};
                photoData.name = $fileNameInput.val();
                photoData.path = $filePathInput.val();
                data.values.push(photoData);
            });
//            var $fileNameInput = $answer.find('input[name=name]');
//            var $filePathInput = $answer.find('input[name=path]');
//            data.name = $fileNameInput.val();
//            data.path = $filePathInput.val();
            break;
        case 7: // dropdown
            data.value = $(element).val();
            break;
        case 8: // radio
            data.value = $(element).val();
            break;
        case 10: // textarea
            data.value = $(element).val();
            break;
    }

    var answer = findAnswerOfQuestionById(existedAnswers, questionId);
    getCurrentPosition(afterGettingPosition);
    function afterGettingPosition(result) {
        if (result.status.error) {
            showErrorMessage(result.error);
            return;
        }
        processAnswer();
        function processAnswer() {
            if (!answer) {
                answer = new Answer();
                answer.questionId = question.id;
                answer.answerEnumId = question.questionEnumId;
                answer.createdBy = ooh.contractor.id;
                answer.uid = generateUUID();
                ooh.answers.push(answer);
            }
            answer.createdOn = new Date();
            answer.lat = result.data.latitude;
            answer.lng = result.data.longitude;
            answer.data = data;
            // and saving locally all answers
            writeAnswersToLocalStore();
        }

    }



}