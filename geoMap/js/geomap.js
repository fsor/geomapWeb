// Screenshot function
//multiple lines 
// create json after button click
$(document).ready(function () {
    up206b.initialize();
});

//declare namespace
var up206b = {};
var flightPlanCoordinates = [];
var mapPath = [];
var flightPath = null;
var coordStr = "";
var path = [];
var len = 0;
var gob;
var activePath = 0;
var pathDist = 0;
var clickCount = 0;
var thisKML;
var GMstrokeColor = '#FF0000';
var infowindows = [];
var pathObj = {
//        'Path1': {'coords':[],pathColor:''},
//        'Path2': {'coords':[],pathColor:''}
};
var activePathName = '';
var pathCoords = [];
var userId = 'default';
var prasedResponse, lastEmptyString, oldPathID;
var geocoder = new google.maps.Geocoder();


var createTools;
var editTools;
var finishPathLink;
var clearPathLink;

//declare map
var map;
var clickCount = 0;
//set the geocoder

google.load('visualization', '1', {
    packages: ['columnchart']
});

//declare direction variables
var directionsDisplay = new google.maps.DirectionsRenderer();
var directionsService = new google.maps.DirectionsService();

//ArcGIS Map Service Layer
var censustracts;

//map styles
var mapStyles = {};

mapStyles.regular = [
    {
        stylers: [
            {
                saturation: 0
            }
            
            , {
                lightness: 0
            }
            
            , {
                gamma: 0
            }
	]
  }
]




function trace(message) {
    if (typeof console != 'undefined') {
        console.log(message);
    }
}
//Function that gets run when the document loads
up206b.initialize = function (userData) {
    var pathUl = $('#pathList');

    function checkLogStatus(userData){
        var data;
            if(!userData){
                data = sessionStorage.getItem('geomap_user');
            }else{
                data = userData;
            }

        if(data){
           console.log('logged in as user: '+data);
            $('.loggedin_form').html('You are logged in as User: '+data+' <span id="logout">Sing out</span>');
            $('.login_form').hide();
            $('.tabbable, #pathList').show();
            loadDBpaths(data);
            userId = data;
             $('#logout').unbind().click(function(){
                 sessionStorage.clear();
                  $('.login_form').show();
                  $('.loggedin_form, #pathList, .tabbable').hide();
                
             });
            
        }else{
             $('.login_form').show();
            $('.tabbable, #pathList').hide();
        }
        
    }
    checkLogStatus(userData);
    
                function choosePath(locThis, thisText){
                        //console.log(locThis);
                    //console.log($(this).text());
                    var thisPathId = locThis;
                    
                    //console.log(thisPathId, lastEmptyString);
                    
                    
                    //var checkIfEmpty = $("#pathList").find('li a:contains("'+locThis+'")').length;
//                    if(checkIfEmpty == 0){
//                        thisPathId = lastEmptyString;
//                    }

                    var result = $.grep(prasedResponse, function(e){ return e.pathID == thisPathId && e.userID == userId; });
                    if(result.length){
                        //console.log(result);
                        var thisPathPath = result[0].path;
                        var thisPathPathString = thisPathPath.replace(/\'/g, '"');
                       //console.log(thisPathPathString);

                        var thisPathPathObj = JSON.parse(thisPathPathString);
                        //console.log(thisPathPathObj);
                    }
                    activePathName = thisPathId;
//                    var checkIfEmpty = $("#pathList").find('li a:contains("'+activePathName+'")').length;
//                    
//                    if(checkIfEmpty == 0){
//                        alert('empty');
//                        console.log(lastEmptyString);
//                        //activePathName = lastEmptyString;
//
//                    }
                     $('#pathList li a').removeClass('btn-inverse active');
                    
                    if(pathObj[activePathName]){
                        drawLine(pathObj[activePathName].coords, pathObj[activePathName].pathColor);
                    }else{
                        drawLine(pathObj[activePathName].coords, pathObj[activePathName].pathColor);
                    }
                 
                    var checkIfEmpty = $("#pathList").find('li a:contains("'+activePathName+'")').length;
                    if(checkIfEmpty == 0){
                        activePathName = lastEmptyString;
                    }
                    
                    var checkIfEmpty2 = $("#pathList").find('li a:contains("'+activePathName+'")').length;
                    if(checkIfEmpty2 == 0){
                        activePathName = oldPathID;
                    }

                    
                    $("li a").filter(function() {
                        return $(this).text() === activePathName;
                    }).addClass('btn-inverse');
                    
                    
                    $("li a").filter(function() {
                        return $(this).text() === activePathName;
                    }).siblings().children().addClass('active');
                    
                    
                    
                    flightPath.set('editable', false);
                    //console.log(pathObj[activePathName]);
                    if(!pathObj[activePathName]){
                        activePathName = oldPathID;
                    } 
                    if(!pathObj[activePathName]){
                        activePathName = lastEmptyString;
                    } 


                    if(pathObj[activePathName].coords.length == 0){
                       flightPath.set('editable', true); 
                    }
                    refreshGraph(pathObj[activePathName].coords);

                    //zoom(pathObj[activePathName].coords);
                    updatePath(); 
//                    if (pathObj[activePathName].coords.length > 1) displayPathElevation(pathObj[activePathName].coords, elevator, map);
                        }
    
    function createPathList(pathID, pathCoords, thisPathColor){
        //console.log(pathID, pathCoords, thisPathColor);
        var allData = pathID + pathCoords + thisPathColor;
        if(allData.length > 3){
            $('#noPathsYet').hide();
                var pathLi = $(document.createElement('li'));
                var pathLink = $(document.createElement('a'));
                    pathLink.html(pathID);
                    pathLink.attr({
                        "class": 'btn'
                    });
                    pathLi.append(pathLink);
                    createTools = $(document.createElement('div'));
                    createTools.addClass('createTools');
                    editTools = $(document.createElement('div'));
                    editTools.addClass('editTools');
                
                var editPathLink = $(document.createElement('a'));
                    editPathLink.html('<span class="fa fa-map fa-2x" aria-hidden="true"></span>');
            
                    finishPathLink = $(document.createElement('a'));
                    finishPathLink.html('<span class="fa fa-check fa-2x" aria-hidden="true"></span>');
                    finishPathLink.hide();
                    
            
                    clearPathLink = $(document.createElement('a'));
                    clearPathLink.html('<span class="fa fa-eraser fa-2x" aria-hidden="true"></span>');
                    clearPathLink.hide();
        
                var deletePathLink = $(document.createElement('a'));
                    deletePathLink.html('<span class="fa fa-times fa-2x" aria-hidden="true"></span>');
        
                var renamePathLink = $(document.createElement('a'));
                    renamePathLink.html('<span class="fa fa-pencil fa-2x" aria-hidden="true"></span>');
            
                var downloadPathLink = $(document.createElement('a'));
                    downloadPathLink.html('<span class="fa fa-download fa-2x" aria-hidden="true"></span>');
            
                var dataPathLink = $(document.createElement('a'));
                    dataPathLink.html('<span class="fa fa-area-chart fa-2x" aria-hidden="true"></span>');
 
                var editPathColorForm = $(document.createElement('form'));
                editPathColorForm.attr({
                    'action':'#',
                    'method':'post'
                });
                
                var editPathColorset = $(document.createElement('div'));
                editPathColorset.addClass('controlset');
                
                var editPathColorInput = $(document.createElement('input'));
                editPathColorInput.attr({
                    'id': pathID,
                    'type': 'text',
                    'name' : 'color'+pathID,
                    'value' : thisPathColor
                });  

                
                editPathColorset.append(editPathColorInput);
                editPathColorForm.append(editPathColorset);
                editPathColorForm.appendTo(pathLi);
            
                editPathLink.appendTo(editTools);
                dataPathLink.appendTo(editTools);
                downloadPathLink.appendTo(editTools);
                renamePathLink.appendTo(editTools);
                finishPathLink.appendTo(createTools);
                clearPathLink.appendTo(createTools);
                renamePathLink.clone().appendTo(createTools);
                deletePathLink.appendTo(editTools);
                deletePathLink.clone().appendTo(createTools);
            
                pathLi.append(createTools);
                pathLi.append(editTools);
            
                createTools.hide();
                

                editPathColorInput.colorPicker();
                editPathColorInput.change(function(){
                    GMstrokeColor = editPathColorInput.val();
                    flightPath.set('strokeColor', GMstrokeColor);
                    
                    //console.log(this.id);
                    //console.log(GMstrokeColor);

                    
                    if(!activePathName){
                        activePathName = this.id;
                    }
                    pathObj[activePathName].pathColor = GMstrokeColor;
                    uploadPathColor(this.id, GMstrokeColor);
                });
                
                $('#pathList li a').removeClass('btn-inverse');
                //$('#pathList li a:contains("'+activePathName+'")').addClass('btn-inverse'); 
                
                pathUl.append(pathLi);
        
        
                $('#pathList li a span.fa-map').unbind().click(function(e){
                    var getEditable = flightPath.get('editable');
                    if($(this).parent().hasClass('active') && (getEditable == false)){
                         flightPath.set('editable', true);
                    }
                     else if($(this).parent().hasClass('active') && (getEditable == true)){
                        flightPath.set('editable', false);
                }
                });
            
                $('#pathList li a span.fa-eraser').unbind().click(function(e){
                    if (confirm("Are you sure?")){
                        CPbuttonClick();
                        flightPath.set('editable', true);
                        deleteMarker();
                    }
                });
            
                $('#pathList li a span.fa-check').unbind().click(function(e){
                    flightPath.set('editable', false);

                    //checkPathLength();
                    var thisPathColor = pathObj[activePathName].pathColor;

                    //console.log(len);
                    //console.log(activePathName);
                    if(len > 1){
                       uploadPath(activePathName, thisPathColor);
                        createTools.hide();
                        editTools.show();
                    }
                    
                });
            
                $('#pathList li a span.fa-area-chart').unbind().click(function(e){
                    if($(this).parent().hasClass('active')){
                        $('#elevation_chart, #charts').toggle();
                        if (pathObj[activePathName].coords.length > 1) displayPathElevation(pathObj[activePathName].coords, elevator, map);
                        
                        var distance = (google.maps.geometry.spherical.computeLength(gMapath.getArray()) / 1000);
                        var distanceRnd = parseFloat(distance).toFixed(1);

                        if (distanceRnd != 0) $('#charts').html('This path has a length of ' + pathDist + ' kilometers.');
                        //$('#elevation_chart').css('display', 'block');

                        function distanceWithCommas(x) {
                            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                        }
                              pathDist = distanceWithCommas(distanceRnd);
                    }
                });
            
                $('#pathList li a span.fa-download').unbind().click(function(e){
                    if($(this).parent().hasClass('active')){
                        $('#downloadList').toggle();
                    }
                });
            
            
        
                $('#pathList li a span.fa-pencil').unbind().click(function(e){
                    
                    // console.log($(this).parent().parent().siblings('.btn-inverse').text());
                    if($(this).parent().hasClass('active')){

                        //$(this).parent().siblings('.btn-inverse').remove();
                        if(clickCount == 0){
                            oldPathID = $(this).parent().parent().siblings('.btn-inverse').text();
                            clickCount++;
                        }

                        $(this).parent().parent().siblings('.btn-inverse').replaceWith('<input class="pathNameInput" type="text" name="newPathName">');
                        $('input.pathNameInput').focus();
                        $('input.pathNameInput').keyup(function(e){
                            if(e.keyCode == 13)
                            {
                                if ($('#pathList li a:contains("' + $('input.pathNameInput').val() + '")').length === 0) {
                                  
                                var newPathId = $('input.pathNameInput').val();
                                lastEmptyString = newPathId;
                                $(this).replaceWith('<a class="btn btn-inverse">'+$('input.pathNameInput').val()+'</a>');
                                var pathData = { 
                                            userID: userId, 
                                            pathID: newPathId,
                                            oldPathID: oldPathID
                                        };
                                
                                $.ajax({
                                  type: "POST",
                                  url: "http://www.ff-stlorenz.at/geomap/mysql/updatePathname.php",
                                  dataType: "text",
                                  data: pathData,
                                  success: function (response) {
                                      console.log('success: '+response);
                                      
                                  },
                                  error: function (response) {
                                        console.log('error: '+response);
                                  }
                                });
                                
                                
                                $('.btn.btn-inverse').unbind().click(function(e){
                                    var thisText = $(this).text();
                                    var locThis = oldPathID;
                                    choosePath(oldPathID, thisText);
                                    $('#pathList li a').removeClass('btn-inverse active');
                                    //$($("a:contains('"+$(this).text()+"')")).siblings().addClass('active');
                                    
                                    

                                    var checkIfEmpty = $("#pathList").find('li a:contains("'+activePathName+'")').length;
                                    if(checkIfEmpty == 0){
                                        activePathName = thisText;
                                    }


                                    $("li a").filter(function() {
                                        return $(this).text() === activePathName;
                                    }).addClass('btn-inverse');


                                    $("li a").filter(function() {
                                        return $(this).text() === activePathName;
                                    }).siblings().children().addClass('active');

                                    });
        
 
                                }else{
                                    alert('Pathname already exists');
                                    return false;
                                }
                                
       
                            }
                        });
                        
                        $('input.pathNameInput').focusout(function() {
                           $(this).replaceWith('<a class="btn btn-inverse">'+oldPathID+'</a>'); 
                        });

                    }
            
                });
        
       
                $('#pathList li a span.fa-times').unbind().click(function(e){
                    if($(this).parent().hasClass('active')){
                        console.log(userId);
                        var thisPath = $(this).parent().parent().siblings('a:first').text();
                        //console.log(thisPath)
                        console.log(thisPath);
                        $.ajax({
                          type:'POST',
                          url:'http://www.ff-stlorenz.at/geomap/mysql/delete.php',
                          data:'userID='+userId+'&pathID='+thisPath,
                          success:function(data) {
                                    if(data) { 
                                        console.log('success: '+data);
                                        $("#pathList").find('li a:contains("'+thisPath+'")').parent().remove();
                                        var count = $("#pathList a.btn").length;
                                        console.log(count);
                                        deleteMarker();     
                                        
                                        CPbuttonClick();
           
                                        if(count == 0){
                                             $('#tab4').append("<span id='noPathsYet'>There aren't any paths yet. </span>");
                                        }
    
                                    } else {
                                         console.log('error: '+data);
                                }
                            }
                        });
                    }
                });
            

        
                $('#pathList li > a:first-child').unbind().click(function(e){
                       //console.log('click first child');
                    var locThis = $(this);
                    thisKML = locThis;
                    locThis = locThis.text();
                    choosePath(locThis);
                    
                                                        
//                    $("#pathList li > a:first-child").filter(function() {
//                        return $(this).text() === locThis;
//                    }).siblings().children().addClass('active');
                    
                    //$($("a:contains('"+locThis+"')")).siblings().addClass('active');
                     });
        

               
        
                    function zoom(coords) {

                      //Add new bounds object to map
                     //map.fitBounds(bounds);
                        
//                        console.log(map.getBounds());
//                        console.log(map.getBounds().R.R);
//                        console.log(map.getBounds().R.j);
//                        console.log(map.getBounds().j.R);
//                        console.log(map.getBounds().j.j);
                        //console.log(map.getZoom());
  

                        }
                     }else{
                         $('#tab4').append("<span id='noPathsYet'>There aren't any paths yet. </span><span class='btn' id='createPa'>Create new path</span><br/><br/>");
                         
        $('#createPa').unbind().click(function(){
            var lokalThis = $(this);
            console.log(lokalThis);
            createNewPath(lokalThis);
             });
            
            function createNewPath(localThis){
            var pathName;
            $('#createPa').replaceWith('<input id="pathNameInput" class="pathNameInput" placeholder="Pathname" type="text" name="newPathName">');
            $('#pathNameInput').focus();
            $('#pathNameInput').keyup(function(e){
                            if(e.keyCode == 13){
                                deleteMarker();  
                                pathName = $('#pathNameInput').val();
                                lastEmptyString = pathName;
                                $(this).replaceWith('<span class="btn" id="createPa">Create new path</span>');
                                $('#createPa').unbind().click(function(){
                                    createNewPath();
                                });
                                
                                
            checkPathLength();
            //console.log(checkPathLength());
            var createNewPathBool = checkPathLength();
            
            mapPath.length = 0;
            if(createNewPathBool) pathId++;
            pathCoords.length = 0;
            activePath = pathId;
            
            flightPath.set('editable', false);
            flightPath.setMap(null);

            //var pathName = prompt("Please enter Path Name", "");
            
            flightPath.set('editable', true);
            //pathObj.push([pathId, pathName, pathCoords]);
            
            var element = {};
            element.coords = pathCoords;
            pathObj[pathName] = element;
            activePathName = pathName; 
            pathObj[activePathName].pathColor = '#FF0000';
                                
            
            if (pathName && createNewPathBool) {
                console.log(createNewPathBool, pathName);
//               deleteMarker();
//               var emptyPath = '';
//                createPathList(pathName, emptyPath, pathObj[activePathName].pathColor);
                //console.log(pathName);

                //$('#pathList li a:contains("'+activePathName+'")').addClass('btn-inverse'); 
            }
                
                pathObj[activePathName].coords = [];
      console.log( pathObj);
                        $('body').keyup(function(e){
                            
                 var editable = flightPath.get('editable');
                            
                            if(pathObj[activePathName].coords.length != 0 && editable && e.keyCode == 13){
                                flightPath.set('editable', false);

                                //checkPathLength();
                                var thisPathColor = pathObj[activePathName].pathColor;

                                //console.log(len);
                                //console.log(activePathName);

                                   uploadPath(activePathName, thisPathColor);
                                    createTools.hide();
                                    editTools.show();
                                
                            }
                        });
               
                function checkPathLength(){
                    if(pathObj[activePathName]) { 
                        if(pathObj[activePathName].coords.length == 0){
                            //console.log('delete');
                            //$('li:contains("'+activePathName+'")').remove();
                            return false;
                        }
                        else{
                            return true;
                        }
                        //console.log(pathObj[(pathId-1)][2].length);
                    }
                    else{
                        return true
                    }
                };
                
                createPathList(pathName, pathCoords, pathObj[activePathName].pathColor);
                $('#pathList li a:contains("'+pathName+'")').addClass('active');
                $('#pathList li a').removeClass('btn-inverse active');
                    //$($("a:contains('"+pathName+"')")).siblings().addClass('active');
                
                    $("li a").filter(function() {
                        return $(this).text() === pathName;
                    }).addClass('btn-inverse');
                    
                    
                    $("li a").filter(function() {
                        return $(this).text() === pathName;
                    }).siblings().children().addClass('active');
                                
                createTools.show();
                editTools.hide();
     
                 $('#pathList li > a:first-child').unbind().click(function(e){

                     if(pathObj[lastEmptyString].coords.length < 2){
                         $("#pathList").find('li a:contains("'+lastEmptyString+'")').parent().remove();
                         var count = $("#pathList a.btn").length;
                                        
                        if(count == 0){
                             $('#tab4').append("<span id='noPathsYet'>There aren't any paths yet. </span>");
                        }
                     }else{
                         
                    flightPath.set('editable', false);
                    var thisPathColor = pathObj[activePathName].pathColor;
                
                       uploadPath(activePathName, thisPathColor);
                        createTools.hide();
                        editTools.show();
                         
                     }
                     console.log(pathObj);
                     $('#pathList li a').removeClass('active btn-inverse');
                    var locThis = $(this);
                    locThis = locThis.text();
                     //console.log(locThis);
                     choosePath(locThis);
                     
                    $(this).addClass('btn-inverse');
                    
                                                        
//                    $("li a").filter(function() {
//                        return $(this).text() === locThis;
//                    }).siblings().children().addClass('active');
                     
                

                    
                    //$($("a:contains('"+locThis+"')")).siblings().addClass('active');
                     });
 
                            }
                        });

                        $('#pathNameInput').focusout(function() {
                           $(this).replaceWith('<span class="btn" id="createPa">Create new path</span>');
                        
                
                        $('#createPa').unbind().click(function(){
                            var lokalThis = $(this);
                            console.log(lokalThis);
                            createNewPath(lokalThis);
                        });
                });
            }
            

                            
                        
                     }

                }
    
//                    $('body').on('click', '#pathList li a', function (e) {
//                     console.log(e.currentTarget.nodeValue);
//                });
    


    
    function loadDBpaths(userIdentitiy){
        
        $.ajax({    //create an ajax request to load_page.php
          type: "POST",
            data: {'userID': userIdentitiy},
            url: "http://www.ff-stlorenz.at/geomap/mysql/api.php",                      
            success: function(response){ 
               if(response[0]*1 != 0){
                    var responseString1 = '['+response.replace(/\}{/g, '},{')+']';
                    var responseString3 = responseString1.replace(/\\"/g, "'");
                    prasedResponse  = JSON.parse(responseString3);

                    for(var i=0;i<prasedResponse.length;i++){
                        //console.log(prasedResponse[i].path);
                       

                    var thisPath = prasedResponse[i].pathID;    
                    var thisPathPath = prasedResponse[i].path;
                    var thisPathColor = prasedResponse[i].pathColor;
                    var thisPathPathString = thisPathPath.replace(/\'/g, '"');
                    var thisPathPathObj = JSON.parse(thisPathPathString);
                        
                    //console.log(prasedResponse[i].pathColor);
                        
                    pathObj[prasedResponse[i].pathID] = {
                        pathColor : thisPathColor,
                        coords : thisPathPathObj
                        }
                     createPathList(prasedResponse[i].pathID, prasedResponse[i].path, thisPathColor);
   
                    }
                   //console.log(pathObj);
                }
                //alert(response);
                $("#DBpathList a").click(function(e){
                    e.preventDefault();
                    console.log('load path');
                })
                 //console.log(response);
            },
             error: function(response){ 
                    console.log(response);
                }
        });
    }
    

    var latlng = new google.maps.LatLng(48.226804, 16.348822);
    var myOptions = {
        zoom: 12
        , center: latlng
        , mapTypeId: google.maps.MapTypeId.TERRAIN
        , mapTypeControl: false //disable the map type control
    };
    
    
    
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    map.setOptions({
        styles: mapStyles.regular
    });

    //draw arcgis layer
    var url = 'js/arcgislink.js';
    censustracts = new gmaps.ags.MapOverlay(url, {
        opacity: 0.8
    });
    setTimeout("censustracts.setMap(map)", 200);

    var centerControlDiv = document.createElement('div');
    centerControlDiv.setAttribute('style','z-index:1000!important');
    var centerControl = new CenterControl(centerControlDiv, map);

    centerControlDiv.index = 1;
    //map.controls[google.maps.ControlPosition.LEFT_CENTER].push(centerControlDiv);

    $('a[href="#tab2"]').addClass('inactive');
    $('a.inactive').on("click", function (e) {
        e.preventDefault();
    });

    var elevator = new google.maps.ElevationService;
    var newPointCounter = 0;
    var pathId = 0;

    //console.log(pathObj);
    
    
    

    if (flightPlanCoordinates.length == 0) {
        map.controls[google.maps.ControlPosition.LEFT_CENTER].clear();
        map.controls[google.maps.ControlPosition.LEFT_CENTER].push(centerControlDiv);
    }


    var map, flightPath = new google.maps.Polyline(), marker = new google.maps.Marker(), markers = [];

    function drawLine(loc, color) {
//        console.log('#####');
//        console.log(pathObj[activePathName].coords);
//        console.log(loc);
        deleteMarker();
        flightPath.setMap(null);
        
        var currCoords, pathColor;
        flightPath = new google.maps.Polyline({
            path: loc
            , geodesic: true
            , strokeColor: color
            , strokeOpacity: 1.0
            , editable: true
            , strokeWeight: 2
        });
        
        var middle = loc.length/2;
             var middleRounded = Math.round(middle * Math.pow(10, 0)) / Math.pow(10, 0);
             //console.log(middleRounded);

         for (i = 0; i < loc.length; i++) {
             
             if(i == 0){
                //console.log('first-marker: '+i);
                 
             firstmarker = new google.maps.Marker({
              position: new google.maps.LatLng(loc[i].lat, loc[i].lng),
              icon: 'http://maps.google.com/mapfiles/ms/micons/green.png',
              map: map
                });
             markers.push(firstmarker);
                 
                 
             }else if(i == loc.length-1){
                 //console.log('last-marker: '+i);
                 
             lastmarker = new google.maps.Marker({
              position: new google.maps.LatLng(loc[i].lat, loc[i].lng),
              icon: 'http://maps.google.com/mapfiles/ms/micons/red.png',
              map: map
                });
             markers.push(lastmarker);
             }
             
             (function(i) {
                             //if "img"@mysql !empty
             if((loc[i].img)){
              var contentString = "<a target='_blank' href='http://www.ff-stlorenz.at/geomap/upload/uploads/"+loc[i].img+"'><img width='200' src='http://www.ff-stlorenz.at/geomap/upload/uploads/"+loc[i].img+"'></a>" ;
              var infowindow = new google.maps.InfoWindow({
                content: contentString
              });
            infowindows.push(infowindow);
                              
              marker = new google.maps.Marker({
              position: new google.maps.LatLng(loc[i].lat, loc[i].lng),
              icon: 'http://www.ff-stlorenz.at/geomap/img/photo.png',
              map: map
                });
             marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
             markers.push(marker);
                 
             
            google.maps.event.addListener(marker, 'click', function() {
                //infowindow.open(map, this);
                 
            });
                 
                       function closeInfoWindows() {
                        for (var i = 0; i < infowindows.length; i++) {
                          infowindows[i].close();
                        }
                      }
                 
             
                 marker.addListener('click', function() {
                    infowindow.close(); //close all infowindows does not work
                    closeInfoWindows()
                    infowindow.open(map, this);
                    
                  });
                 
                 
            //infowindow.open(map,marker); //show infowindow by default
                 
                 
             }
              }(i));
             
             
             
             

             if(i == (middleRounded)){
                 //map.panTo(marker.position); //Make map global
                    var middleLatLng = new google.maps.LatLng(loc[i].lat, loc[i].lng); //Makes a latlng
                    map.panTo(middleLatLng); //Make map global
             }
         }




        google.maps.event.addListener(flightPath.getPath(), "insert_at", updatePath);
        google.maps.event.addListener(flightPath.getPath(), "remove_at", updatePath);
        google.maps.event.addListener(flightPath.getPath(), "set_at", updatePath);
        flightPath.setMap(map);
        

    };
    
    function setMapOnAll(map) {
          for (var j = 0; j < markers.length; j++) {
            markers[j].setMap(map);
          }
        }
    
    function deleteMarker() {
            setMapOnAll(null);
            marker=null;
        }


    function updatePath() {
             
        //console.log('update path');
        gMapath = flightPath.getPath();        
        len = gMapath.getLength();
        //console.log(gMapath);
        coordStr = '';
        mapPath = [];
        mapPath.length = 0;
        if (len > 1) {
            finishPathLink.show();
            clearPathLink.show();
            $('a[href="#tab2"]').removeClass('inactive');
       

        for (var i = 0; i < len; i++) { 
            coordStr += gMapath.getAt(i).toUrlValue(6) + "<br>";

            var movedPointGMap = gMapath.getAt(i).toUrlValue(6);
            var movedPointCoords = movedPointGMap.split(',');
            var movedPoint = {
                lat: (movedPointCoords[0] * 1)
                , lng: (movedPointCoords[1] * 1)
            }
            mapPath.push(movedPoint);
        }
//            console.log('####');
//            console.log(pathObj[activePathName].coords);
//            console.log(mapPath);
            
            for (var i = 0; i < pathObj[activePathName].coords.length; i++){
                //console.log(mapPath[i].img);
                if(pathObj[activePathName].coords[i].time){
                    mapPath[i].time = pathObj[activePathName].coords[i].time;
                }
                if(pathObj[activePathName].coords[i].img){
                    mapPath[i].img = pathObj[activePathName].coords[i].img;
                }
               
            }
            
            
            
            pathObj[activePathName].coords = mapPath.slice(); //slice Path xxx
            
            
            //console.log(pathObj[activePathName].coords);
        //pathObj[(pathId-1)][2] = flightPlanCoordinates; 
        //console.log(pathObj);

        var distance = (google.maps.geometry.spherical.computeLength(gMapath.getArray()) / 1000);
        var distanceRnd = parseFloat(distance).toFixed(1);
      
     
        //$('#elevation_chart').css('display', 'block');

        function distanceWithCommas(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        }
              pathDist = distanceWithCommas(distanceRnd);
       
        if (distanceRnd != 0) $('#charts').html('This path has a length of ' + pathDist + ' kilometers.');
            
        createJSON(gMapath);
           
            //drawLine(pathObj[activePathName].coords, pathObj[activePathName].pathColor);
            //if (pathObj[activePathName].coords.length > 1) displayPathElevation(pathObj[activePathName].coords, elevator, map);
        }

    }


    function CenterControl(controlDiv, map) {
        // Set CSS for the control border.

        
//        function checkPathLength(){
//            if(pathObj[activePathName]) { 
//                if(pathObj[activePathName].coords.length == 0){
//                    //console.log('delete');
//                    //$('li:contains("'+activePathName+'")').remove();
//                    return false;
//                }
//                else{
//                    return true;
//                }
//                //console.log(pathObj[(pathId-1)][2].length);
//            }
//            else{
//                return true
//            }
//        };
        

            //Event listener
            google.maps.event.addListener(map, 'click', function (event) {
                console.log();

                var newPoint = {
                    lat: event.latLng.lat()
                    , lng: event.latLng.lng()
                };
                 
               var editable = flightPath.get('editable');
                if(editable){
                    pathObj[activePathName].coords.push(newPoint);
                    drawLine(pathObj[activePathName].coords, pathObj[activePathName].pathColor);
                    updatePath(pathObj[activePathName].coords);    
                }

            });
    }
    
    function uploadPath(activePathName, thisPathColor) {
        //console.log(pathObj[activePathName].coords);

        //console.log('upload path');
        //console.log(path.j);
        var pathString = JSON.stringify(pathObj[activePathName].coords);
        //console.log(userId, activePathName, thisPathColor, pathString);
        var postData = { userID: userId, 
                          pathID: activePathName,
                          pathColor: thisPathColor,
                          path: pathString
                         };
        
        $.ajax({
          type: "POST",
          url: "http://www.ff-stlorenz.at/geomap/insert.php",
          dataType: "text",
          data: postData,
          success: function (response) {
              console.log('success: '+response);
          },
          error: function (response) {
                console.log('error: '+response);
          }
        });

        
    }
    function uploadPathColor(pathId, pathColor) {
        console.log('update color');
        console.log(pathId, pathColor);
        //uploadPath(activePathName, GMstrokeColor);
//
        var postData = { userID: userId, 
                          pathID: pathId,
                          pathColor: pathColor
                         };
        
        $.ajax({
          type: "POST",
          url: "http://www.ff-stlorenz.at/geomap/mysql/updateColor.php",
          dataType: "text",
          data: postData,
          success: function (response) {
              console.log('success: '+response);
          },
          error: function (response) {
                console.log('error: '+response);
          }
        });

        
    }

    function CPbuttonClick() {
        flightPath.setMap(null);
        flightPlanCoordinates.length = 0;
        pathObj[activePathName].coords.length = 0;
        mapPath.length = 0;
        //console.log(mapPath);
        //console.log(flightPlanCoordinates);
        coordStr = "";
        $('#charts').html('');
        createJSON('');
        $('#elevation_chart').html('');
    }
    
    function showKML(definePath) {
        gob = '';
        gob += kmlheading(definePath);
        var meereshoehe = 0;

        for (var i = 0; i < len; i++) {
            console.log(definePath);
            //coordStr += definePath.getAt(i).toUrlValue(6) + "<br>";
            //var movedPointGMap = definePath.getAt(i).toUrlValue(6);
            var movedPointGMap = 'assssssssss';

            var movedPointCoords = movedPointGMap.split(',');
            var movedPoint = {
                lat: (movedPointCoords[0] * 1)
                , lng: (movedPointCoords[1] * 1)
            }
            gob += '\t\t' + movedPoint.lng + ',' + movedPoint.lat + ',' + meereshoehe + '\n\t';

        }


        gob += kmlend();
        //console.log(gob);
    }

    function kmlheading(definePath) {
        var heading = "";

        var pathName = definePath;

        var i;
        heading = '<?xml version="1.0" encoding="UTF-8"?>\n' +
            '<kml xmlns="http://www.opengis.net/kml/2.2">\n' +
            '<Document>\n\t' +
            '<name>' + pathName + '</name>\n\t' +
            '<Style id="redLinePoly">\n\t\t<LineStyle>\n\t\t<color>ff0000ff</color>\n\t\t</LineStyle>\n\t\t<PolyStyle>\n\t\t<color>ffff0000</color>\n\t\t</PolyStyle>\n\t\t</Style>\n\t' +
            '<Folder>\n\t' +
            '<name>Paths</name>\n\t<visibility>0</visibility>\n\t<description></description>\n\t' +
            '<Placemark>\n\t' +
            '<LookAt>\n\t\t<longitude>48.281137</longitude>\n\t\t<latitude>16.358986</latitude>\n\t\t<altitude>0</altitude>\n\t\t<range></range>\n\t\t<tilt></tilt>\n\t\t<heading></heading>\n\t</LookAt>\n\t' +
            '<styleUrl>#redLinePoly</styleUrl>\n\t<LineString>\n\t\t<altitudeMode>absolute</altitudeMode>\n\t\t<coordinates>\n\t';
        return heading;
    }

    function kmlend() {
        var ending;
        return ending = '\t</coordinates>\n\t</LineString>\n\t</Placemark>\n' +
            '</Folder>\n</Document>\n</kml>';
    }

    function displayPathElevation(path, elevator, map) {
        var googlePathArr = [];
        if(path.length > 1){
            for(i = 0; i < path.length; i++){
                console.log();
                var googleLatLng = new google.maps.LatLng(path[i].lat, path[i].lng);
                googlePathArr.push(googleLatLng);
            }

            elevator.getElevationAlongPath({
                'path': googlePathArr
                , 'samples': 256
            }, plotElevation);
        }
    }

    function plotElevation(elevations, status) {
        var chartDiv = document.getElementById('elevation_chart');
        var chart;
        if (status == google.maps.ElevationStatus.OK) {
            chart = new google.visualization.ColumnChart(chartDiv);
        }

        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Sample');
        data.addColumn('number', 'Elevation');
        if (elevations) {
            for (var i = 0; i < elevations.length; i++) {
                data.addRow(['', elevations[i].elevation]);
            }

            chart.draw(data, {
                height: 150
                , legend: 'none'
                , titleY: 'Sealevel (m)'
            });
        }
    }
    

    function geocode() {
	var address = $('#address').val();
	geocoder.geocode( { 'address': address}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) 
		{
			map.setCenter(results[0].geometry.location);
			var marker = new google.maps.Marker({
				map: map, 
				position: results[0].geometry.location
			});
		} 
		else 
		{
			alert("Geocode was not successful for the following reason: " + status);
		}
	});
}


    function createJSON(path) {
        //console.log('create JSON');
        var pathPoints = [];
        for (var i = 0; i < path.length; i++) {
            var p = path.getAt(i).toUrlValue(6).split(',');
            var points = {
                "lat": parseFloat(p[0])
                , "lng": parseFloat(p[1])
            };
            pathPoints.push(points);
        }


        $('a[data-id="downloadJSON"]').remove();
        var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pathPoints));
        var a = document.createElement('a');
        $(a).attr({
            "class": 'btn download'
            , "data-id": 'downloadJSON'
        });
        a.href = 'data:' + data;
        a.download = 'data.json';
        a.innerHTML = 'download JSON';

        var container = document.getElementById('downloadList');
        if(container)
        container.appendChild(a);


        $('a[data-id="downloadKML"]').remove();
        var a2 = document.createElement('a');
        $(a2).attr({
            "class": 'btn download'
            , "data-id": 'downloadKML'
            });
        a2.innerHTML = 'download KML';
        a2.download = 'data.kml';
        if(container)
        container.appendChild(a2);

        $('a[data-id="downloadKML"]').click(function () {
            //console.log(thisKML.text());
            showKML(thisKML.text());
            this.href = "data:text/plain;charset=UTF-8," + encodeURIComponent(gob);
        });
    }


    
    function refreshGraph(coords){
        $('#elevation_chart, #charts').css('display', 'none');
    }
    
    
    $(window).on('load resize',function(){
      var win = $(this);
      if (win.width() <= 992) {
          $('#wrapper').addClass('toggled mobile');
          $(".mobileMenu").removeClass("closed");
      }
        else{
            $('#wrapper').removeClass('toggled mobile');
            $(".mobileMenu").addClass("closed");
        }
        refreshGmap();
    });
    
//    $('#mobileMenu').click(function(){
//      
//        $('.sidePanel, #map_canvas, #mobileMenu').toggleClass('mobile');
//    });
    
    $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
        $(".mobileMenu").toggleClass("closed");
        
        refreshGmap();
    });
    
    $("#findBtn").click(function(e) {
        geocode();
    });
    
    $('#searchForm input#address').keyup(function(e){
        e.preventDefault();
    if(e.keyCode == 13){
         geocode();
        }
        });
    


    $( "#sidebar-wrapper" ).click(function( event ) {
    if( !$( event.target ).is( "a, span, form, input, .colorPicker-picker" ) )
    {
       flightPath.set('editable', false);
    }
});
    


    function refreshGmap(){
    clearTimeout(reloadMap);
        var reloadMap = setTimeout(
          function() {
            google.maps.event.trigger(map_canvas, 'resize');
          }, 250);
    }
}


