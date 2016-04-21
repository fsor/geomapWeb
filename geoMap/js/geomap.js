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
up206b.initialize = function () {
    var pathUl = $('#pathList');
    
    
    function createPathList(pathID, pathCoords){
                var pathLi = $(document.createElement('li'));
                var pathLink = $(document.createElement('a'));
                    pathLink.html(pathID);
                    pathLink.attr({
                        "class": 'btn'
                    });
                    pathLi.append(pathLink);
                
                var editPathLink = $(document.createElement('a'));
                    editPathLink.html('edit');
                    editPathLink.attr('class','btn');
        
                var deletePathLink = $(document.createElement('a'));
                    deletePathLink.html('delete');
                    deletePathLink.attr('class','btn');
 
                var editPathColorForm = $(document.createElement('form'));
                editPathColorForm.attr({
                    'action':'#',
                    'method':'post'
                });
                
                var editPathColorset = $(document.createElement('div'));
                editPathColorset.addClass('controlset');
                
                var editPathColorInput = $(document.createElement('input'));
                editPathColorInput.attr({
                    'id': 'color'+pathId,
                    'type': 'text',
                    'name' : 'color'+pathId,
                    'value' : '#FF0000'
                });                
                
                
                editPathColorset.append(editPathColorInput);
                editPathColorForm.append(editPathColorset);
                pathLi.append(editPathColorForm);
                pathLi.append(editPathLink);
                pathLi.append(deletePathLink);

                editPathColorInput.colorPicker();
                editPathColorInput.change(function(){
                    GMstrokeColor = editPathColorInput.val();
                    flightPath.set('strokeColor', GMstrokeColor);
                    pathObj[activePathName].pathColor = GMstrokeColor;
                });
                

                $('#pathList li a').removeClass('btn-inverse');
                $('#pathList li a:contains("'+activePathName+'")').addClass('btn-inverse'); 
                
                pathUl.append(pathLi);
        
       
                $('#pathList li a:contains("delete")').unbind().click(function(e){
                    console.log(userId);
                    var thisPath = $(this).siblings('a:first').text();
                    console.log(thisPath)
                    
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
                    
                });
        
                $('#pathList li a:first-child').unbind().click(function(e){
                    //console.log($(this).text());
                    var thisPathId = $(this).text();
                    var result = $.grep(prasedResponse, function(e){ return e.pathID == thisPathId && e.userID == userId; });
                    //console.log(result[0].path);
                    var thisPathPath = result[0].path;
                    var thisPathPathString = thisPathPath.replace(/\'/g, '"');
                   //console.log(thisPathPathString);
                    
                    var thisPathPathObj = JSON.parse(thisPathPathString);
                    //console.log(thisPathPathObj);
                    
                    activePathName = thisPathId;

                    console.log(pathObj);
                     console.log(pathObj[thisPathId].coords);
                    
                    
                    
                    drawLine(pathObj[activePathName].coords, pathObj[activePathName].pathColor);
                    console.log(pathObj[activePathName].coords, pathObj[activePathName].pathColor);
                    //console.log(pathObj[activePathName].coords);
                    $('#pathList li a').removeClass('btn-inverse');
                    $('li a:contains("'+activePathName+'")').addClass('btn-inverse');
                    flightPath.set('editable', false);
                    if(pathObj[activePathName].coords.length == 0){
                       flightPath.set('editable', true); 
                    }
                    refreshGraph(pathObj[activePathName].coords);
                    
                    
                    
                });
        

    }
    
//                    $('body').on('click', '#pathList li a', function (e) {
//                     console.log(e.currentTarget.nodeValue);
//                });
    


    
    function loadDBpaths(){
        $.ajax({    //create an ajax request to load_page.php
            type: "GET",
            url: "http://www.ff-stlorenz.at/geomap/mysql/api.php",                      
            success: function(response){ 
               if(response[0]*1 != 0){
                    var responseString1 = '['+response.replace(/\}{/g, '},{')+']';
                    var responseString3 = responseString1.replace(/\\"/g, "'");
                    prasedResponse  = JSON.parse(responseString3);

                    for(var i=0;i<prasedResponse.length;i++){
                        //console.log(prasedResponse[i].path);
                        createPathList(prasedResponse[i].pathID, prasedResponse[i].path);
                        
                    var thisPathPath = prasedResponse[i].path;
                    var thisPathPathString = thisPathPath.replace(/\'/g, '"');
                    var thisPathPathObj = JSON.parse(thisPathPathString);
                        
                    pathObj[prasedResponse[i].pathID] = {
                        pathColor : '#555555',
                        coords : thisPathPathObj
                    }
                        
                    }
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
    loadDBpaths();

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


    var map, flightPath = new google.maps.Polyline();

    function drawLine(loc, color) {
        flightPath.setMap(null);
        //console.log(loc);
        var currCoords, pathColor;
        flightPath = new google.maps.Polyline({
            path: loc
            , geodesic: true
            , strokeColor: color
            , strokeOpacity: 1.0
            , editable: true
            , strokeWeight: 2
        });
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
            createPathList(pathName);
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
                var myLatLng = {
                    lat: event.latLng.lat()
                    , lng: event.latLng.lng()
                };

                var newPoint = {
                    lat: event.latLng.lat()
                    , lng: event.latLng.lng()
                };
                 
               var editable = flightPath.get('editable');
                if(editable){
                    pathObj[activePathName].coords.push(newPoint);
                    drawLine(pathObj[activePathName].coords);
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
            //console.log(len);
            //console.log(activePathName);
            if(len > 1){
                uploadPath(activePathName);
            }
           
        });

        // Set CSS for the control border.
        var editPath = $(document.createElement('div'));
        editPath.attr('class','GMbtn');
        editPath.title = 'Click to recenter the map######';
        editPath.appendTo(controlDiv);

        // Set CSS for the control interior.
        var editPathTxt = $(document.createElement('div'));
        editPathTxt.attr('class','GMbtnTxt');
        editPathTxt.html('Edit Path');
        editPath.append(editPathTxt);

        // Setup the click event listeners: simply set the map to Chicago.
        editPath.on('click', function () {
            flightPath.set('editable', true);
            console.log('EDIT');
        });
    }
    
    function uploadPath(activePathName) {
        //console.log('upload path');
        var pathString = JSON.stringify(path.j);

        var postData = { userID: userId, 
                          pathID: activePathName,
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
          $('.sidePanel, #map_canvas, #mobileMenu').toggleClass('mobile');
      }
        else{
            $('.mobile').removeClass('mobile');
        }
    });
    
    $('#mobileMenu').click(function(){
      
        $('.sidePanel, #map_canvas, #mobileMenu').toggleClass('mobile');
    });

}