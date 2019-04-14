var addresses = {};
var locations = {};
var map;
var spinner;

$(document).ready(function() {
  if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
    alert("Your browser does not support the HTML5 File API.");
  }
  map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 55, lng: -4.0},
            zoom: 5
          });
  map.setMapTypeId(google.maps.MapTypeId.SATELLITE);

  spinner = new Spin.Spinner({color: '#000', lines: 12});
});

var processFile = function(files) {
  var files = document.getElementById('fileInput').files;
  if (files.length !== 1) {
    $('#error p').text("Please select a file.");
    $('#error').css('display', 'block');
    return;
  }

  var file = files[0];

  if (file.type != 'text/csv') {
    $('#error p').text("Please upload a valid CSV file.");
    $('#error').css('display', 'block');
    return;
  }

  // Read file buffer as text file
  var reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function(event) {
    // Parse CSV file
    var csv = event.target.result;
    $.csv.toObjects(csv, {}, function(err, data) {
      if (err || data.length === 0) {
        $('#error p').text("Error processing CSV file.");
        $('#error').css('display', 'block');
        return;
      }

      if (Object.keys(data[0]).indexOf('address') == -1) {
        $('#error p').text("File doesn't contain address field.");
        $('#error').css('display', 'block');
        return;
      }

      $('#error').css('display', 'none');
      $('#subBtn').prop('disabled', true);

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
      spinner.spin(document.getElementById('spinner'));
      $.ajax("/geocode", {
        data: JSON.stringify(addressStrs),
        contentType: 'application/json',
        type: 'POST',
        complete: function(res, status) {
          if (res.status == 200){
            locations = res.responseJSON;
            spinner.stop();
            drawHeatmap();
          } else {
            $('#error p').text("There was an error processing your request.");
            $('#error').css('display', 'block');
            spinner.stop();
          }
        }
      });
    });

  };
};

var drawHeatmap = function() {
  $('#error').css('display', 'none');

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

  $('#subBtn').prop('disabled', false);
};
