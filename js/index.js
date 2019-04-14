var addresses = {};
var locations = {};
var map;

$(document).ready(function() {
  if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
    alert("Your browser does not support the HTML5 File API.");
  }
  map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 55, lng: -4.0},
            zoom: 5
          });
  map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
});

var processFile = function(files) {
  var file = files[0];

  if (file.type != 'text/csv') {
    $('#error').html("<p>Please upload a CSV file.</p>");
  }

  // Read file buffer as text file
  var reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function(event) {
    // Parse CSV file
    var csv = event.target.result;
    $.csv.toObjects(csv, {}, function(err, data) {
      if (err) {
        alert("Error processing CSV.");
        return;
      }

      console.log("CSV processed");

      // Find entries with addresses
      for (var i = 0; i < data.length; i++) {
        var address = data[i].address.trim();
        if (address) {
          // Store addresses in dict with freq. they appear
          if (addresses[address]) {
            addresses[address] += 1;
          } else {
            addresses[address] = 1;
          }
        }
      }

      var addressStrs = Object.keys(addresses);
      $.ajax("http://localhost:5000/geocode", {
        data: JSON.stringify(addressStrs),
        contentType: 'application/json',
        type: 'POST',
        complete: function(res, status) {
          if (res.status == 200){
            locations = res.responseJSON;
            drawHeatmap();
            console.log("Locations populated");
          } else {
            console.log("Request error.");
          }
        }
      });
    });

  };
};

var drawHeatmap = function() {
  var data = Object.keys(locations).map(function(address) {
    var weight = addresses[address];
    var loc = locations[address];
    var latlng = new google.maps.LatLng(loc.lat, loc.lng);
    return { location: latlng, weight: weight };
  });

  var heatmap = new google.maps.visualization.HeatmapLayer({
    data: data,
    dissipate: false,
    radius: 30
  });
  heatmap.setMap(map);
};
