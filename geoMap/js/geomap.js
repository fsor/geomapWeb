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
var GMstrokeColor = '#FF0000';
var pathObj = {
//        'Path1': {'coords':[],pathColor:''},
//        'Path2': {'coords':[],pathColor:''}
};
var activePathName = '';
var pathCoords = [];
var userId = 'default';
var prasedResponse;



//declare map
var map;
var clickCount = 0;

//set the geocoder
var geocoder = new google.maps.Geocoder();
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
            $('.loggedin_form').html('Sie sind eingelogged als: '+data+' <span id="logout">abmelden</span>');
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
    
    
    
    function createPathList(pathID, pathCoords, thisPathColor){
                var pathLi = $(document.createElement('li'));
                var pathLink = $(document.createElement('a'));
                    pathLink.html(pathID);
                    pathLink.attr({
                        "class": 'btn'
                    });
                    pathLi.append(pathLink);
                
                var editPathLink = $(document.createElement('a'));
                    editPathLink.html('<span class="fa fa-map fa-2x" aria-hidden="true"></span>');
        
                var deletePathLink = $(document.createElement('a'));
                    deletePathLink.html('<span class="fa fa-times fa-2x" aria-hidden="true"></span>');
        
                var renamePathLink = $(document.createElement('a'));
                    renamePathLink.html('<span class="fa fa-pencil fa-2x" aria-hidden="true"></span>');
 
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
                pathLi.append(editPathColorForm);
                pathLi.append(editPathLink);
                pathLi.append(deletePathLink);
                pathLi.append(renamePathLink);

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
        
        
                $('#pathList li a span.fa-pencil').unbind().click(function(e){
                    if($(this).parent().hasClass('active')){
                         flightPath.set('editable', true);
                    }
                });
        
       
                $('#pathList li a span.fa-times').unbind().click(function(e){
                    if($(this).parent().hasClass('active')){
                        console.log(userId);
                        var thisPath = $(this).parent().siblings('a:first').text();
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

                                    } else {
                                         console.log('error: '+data);
                                }
                            }
                        });
                    }
                });
        
                $('#pathList li a:first-child').unbind().click(function(e){
                    //console.log($(this).text());
                    var thisPathId = $(this).text();
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
                    drawLine(pathObj[activePathName].coords, pathObj[activePathName].pathColor);
                    //console.log(pathObj[activePathName].coords, pathObj[activePathName].pathColor);
                    //console.log(pathObj[activePathName].coords);
                    $('#pathList li a').removeClass('btn-inverse active');
                    $('li a:contains("'+activePathName+'")').addClass('btn-inverse');
                    $(this).siblings().addClass('active');
                    
                    
                    flightPath.set('editable', false);
                    if(pathObj[activePathName].coords.length == 0){
                       flightPath.set('editable', true); 
                    }
                    refreshGraph(pathObj[activePathName].coords);

                    zoom(pathObj[activePathName].coords);
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
//                   console.log('####');
                   console.log(pathObj);
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
              var contentString = "<a target='_blank' href='http://www.ff-stlorenz.at/geomap/upload/uploads/"+loc[i].img+"'><img width='80' src='http://www.ff-stlorenz.at/geomap/upload/uploads/"+loc[i].img+"'></a>" ;
              var infowindow = new google.maps.InfoWindow({
                content: contentString
              });
          
                              
              marker = new google.maps.Marker({
              position: new google.maps.LatLng(loc[i].lat, loc[i].lng),
              icon: 'http://maps.google.com/mapfiles/ms/micons/red-pushpin.png',
              map: map
                });
             markers.push(marker);
                 
             
            google.maps.event.addListener(marker, 'click', function() {
                //infowindow.open(map, this);
            });
                 
                 marker.addListener('click', function() {
                    infowindow.open(map, this);
                  });
                 
                 
            infowindow.open(map,marker);
                 
                 
             }
              }(i));
             

             if(i == (middleRounded)){
                 //map.panTo(marker.position); //Make map global
                    var middleLatLng = new google.maps.LatLng(loc[i].lat, loc[i].lng); //Makes a latlng
                    map.panTo(middleLatLng); //Make map global
             }
         }

        function setMapOnAll(map) {
          for (var j = 0; j < markers.length; j++) {
            markers[j].setMap(map);
          }
        }


        function deleteMarker() {
            setMapOnAll(null);
            marker=null;
        }
           

    
        

        google.maps.event.addListener(flightPath.getPath(), "insert_at", updatePath);
        google.maps.event.addListener(flightPath.getPath(), "remove_at", updatePath);
        google.maps.event.addListener(flightPath.getPath(), "set_at", updatePath);
        flightPath.setMap(map);
        

    };


    function updatePath() {
        path = flightPath.getPath();
        len = path.getLength();
        coordStr = '';
        mapPath = [];
        mapPath.length = 0;
        if (len > 1) {
            $('a[href="#tab2"]').removeClass('inactive');
       

        for (var i = 0; i < len; i++) {
            coordStr += path.getAt(i).toUrlValue(6) + "<br>";

            var movedPointGMap = path.getAt(i).toUrlValue(6);
            var movedPointCoords = movedPointGMap.split(',');
            var movedPoint = {
                lat: (movedPointCoords[0] * 1)
                , lng: (movedPointCoords[1] * 1)
            }
            mapPath.push(movedPoint);
        }
            pathObj[activePathName].coords = mapPath.slice();
            //console.log(pathObj[activePathName].coords);
        //pathObj[(pathId-1)][2] = flightPlanCoordinates; 
        //console.log(pathObj);

        var distance = (google.maps.geometry.spherical.computeLength(path.getArray()) / 1000);
        var distanceRnd = parseFloat(distance).toFixed(1);
      
        if (distanceRnd != 0) $('#charts').html('Ihr Track hat eine L&auml;nge von ' + pathDist + ' Kilometer');
        $('#elevation_chart').css('display', 'block');

        function distanceWithCommas(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        }
              pathDist = distanceWithCommas(distanceRnd);
       
        createJSON(path);
            
            if (pathObj[activePathName].coords.length > 1) displayPathElevation(pathObj[activePathName].coords, elevator, map);
        }
    
    }


    function CenterControl(controlDiv, map) {
        // Set CSS for the control border.
        var createNewPath = $(document.createElement('div'));
        createNewPath.attr('class','GMbtn');
        createNewPath.title = 'Click to recenter the map######';
        //controlDiv.appendChild(createNewPath);
        createNewPath.appendTo(controlDiv);

        // Set CSS for the control interior.
        var createNewPathTxt = $(document.createElement('div'));
        createNewPathTxt.attr('class','GMbtnTxt');
        createNewPathTxt.html('Create New Path');
        createNewPath.append(createNewPathTxt);
        
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
        



        createNewPath.on('click', function () {
            checkPathLength();
            //console.log('######');
            //console.log(checkPathLength());
            var createNewPathBool = checkPathLength();
            
            mapPath.length = 0;
            if(createNewPathBool) pathId++;
            pathCoords.length = 0;
            activePath = pathId;
            
            flightPath.set('editable', false);
            flightPath.setMap(null);

            var pathName = prompt("Please enter Path Name", "Path "+pathId);
            flightPath.set('editable', true);
            //pathObj.push([pathId, pathName, pathCoords]);
            
            var element = {};
            element.coords = pathCoords;
            pathObj[pathName] = element;
            activePathName = pathName; 
            pathObj[activePathName].pathColor = '#FF0000';
            
            
            if (pathName && createNewPathBool) {
               var emptyPath = '';
                createPathList(pathName, emptyPath, pathObj[activePathName].pathColor);
                //$('#pathList li a:contains("'+activePathName+'")').addClass('btn-inverse'); 
            }
            
            
            
//            $('#pathList li a').click(function () {
//                console.log('click');
//                var showPathWithID = $(this).text();
//                activePathName = showPathWithID;
//                drawLine(pathObj[activePathName].coords, pathObj[activePathName].pathColor);
//                console.log(pathObj[activePathName].coords, pathObj[activePathName].pathColor);
//                //console.log(pathObj[activePathName].coords);
//                $('#pathList li a').removeClass('btn-inverse');
//                $('li a:contains("'+activePathName+'")').addClass('btn-inverse');
//                flightPath.set('editable', false);
//                if(pathObj[activePathName].coords.length == 0){
//                   flightPath.set('editable', true); 
//                }
//                refreshGraph(pathObj[activePathName].coords);
//                
//            });
            
        });   
            //Event listener
            google.maps.event.addListener(map, 'click', function (event) {

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

        // Set CSS for the control border.
        var clearPath = $(document.createElement('div'));
        clearPath.attr('class','GMbtn');
        clearPath.title = 'Click to recenter the map######';
        clearPath.appendTo(controlDiv);

        // Set CSS for the control interior.
        var controlText = $(document.createElement('div'));
        controlText.attr('class','GMbtnTxt');
        controlText.html('Clear Path');
        clearPath.append(controlText);

        // Setup the click event listeners: simply set the map to Chicago.
        clearPath.on('click', function () {
            if (confirm("Are you sure?"))
                {
                    CPbuttonClick();
                    flightPath.set('editable', true);
                }
            
        });

        // Set CSS for the control border.
        var finishPath = $(document.createElement('div'));
        finishPath.attr('class','GMbtn');
        finishPath.title = 'Click to recenter the map######';
        finishPath.appendTo(controlDiv);

        // Set CSS for the control interior.
        var finishPathTxt = $(document.createElement('div'));
        finishPathTxt.attr('class','GMbtnTxt');
        finishPathTxt.html('Finish Path');
        finishPath.append(finishPathTxt);

        // Setup the click event listeners: simply set the map to Chicago.
        finishPath.on('click', function () {
            flightPath.set('editable', false);
            checkPathLength();
            var thisPathColor = pathObj[activePathName].pathColor;
            
            //console.log(len);
            //console.log(activePathName);
            if(len > 1){
               uploadPath(activePathName, thisPathColor);
            }
           
        });

    }
    
    function uploadPath(activePathName, thisPathColor) {
        //console.log('upload path');
        var pathString = JSON.stringify(path.j);

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
    
    function showKML() {
        gob = '';
        gob += kmlheading();
        var meereshoehe = 0;

        for (var i = 0; i < len; i++) {
            coordStr += path.getAt(i).toUrlValue(6) + "<br>";
            var movedPointGMap = path.getAt(i).toUrlValue(6);

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

    function kmlheading() {
        var heading = "";

        var pathName = 'activePathName';
        var pathDesc = 'Just another Path';

        var i;
        heading = '<?xml version="1.0" encoding="UTF-8"?>\n' +
            '<kml xmlns="http://www.opengis.net/kml/2.2">\n' +
            '<Document>\n\t' +
            '<name>' + pathName + '</name>\n\t' +
            '<open>1</open>\n\t' +
            '<description>' + pathDesc + '</description>\n\t' +
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
        if(path.length > 1){
            elevator.getElevationAlongPath({
                'path': path
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
                , titleY: 'Meereshöhe (m)'
            });
        }
    }


    function createJSON(path) {
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
            "class": 'btn btn-inverse'
            , "data-id": 'downloadJSON'
        });
        a.href = 'data:' + data;
        a.download = 'data.json';
        a.innerHTML = 'download JSON';

        var container = document.getElementById('downloadList');
        container.appendChild(a);


        $('a[data-id="downloadKML"]').remove();
        var a2 = document.createElement('a');
        $(a2).attr({
            "class": 'btn btn-inverse'
            , "data-id": 'downloadKML'
            });
        a2.innerHTML = 'download KML';
        a2.download = 'data.kml';
        container.appendChild(a2);

        $('a[data-id="downloadKML"]').click(function () {
            showKML();
            this.href = "data:text/plain;charset=UTF-8," + encodeURIComponent(gob);
        });
    }

    $('a[href="#tab3"]').click(function () {
        refreshGraph();
    });
    
    function refreshGraph(coords){
        $('#elevation_chart').css('display', 'none');
        $('#charts').html('');
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
    
    function refreshGmap(){
    clearTimeout(reloadMap);
        var reloadMap = setTimeout(
          function() {
            google.maps.event.trigger(map_canvas, 'resize');
          }, 250);
    }
}