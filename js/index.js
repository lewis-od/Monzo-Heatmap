let addresses = {};
let locations = {};
let map, spinner;

$(document).ready(() => {
  if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
    alert("Your browser does not support the HTML5 File API. This website " 
      + "will not work. Try using a newer browser.");
    
    $('#subBtn').prop('disabled', true);
  }

  map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 55, lng: -4.0},
            zoom: 6,
            streetViewControl: false,
            mapTypeId: google.maps.MapTypeId.HYBRID
          });

  spinner = new Spin.Spinner({color: '#000', lines: 12});
});

function processFile() {
  const files = document.getElementById('fileInput').files;
  if (files.length !== 1) {
    showError("Please select a file.");
    return;
  }

  const file = files[0];

  if (file.type != 'text/csv') {
    showError("Please upload a valid CSV file.");
    return;
  }

  // Read file buffer as text file
  const reader = new FileReader();
  reader.readAsText(file);
  reader.onload = event => {
    // Parse CSV file
    const csv = event.target.result;
    try { // $.csv.toObjects throws TypeErrror if uploaded file is blank
      $.csv.toObjects(csv, {}, function(err, data) {
        if (err || data.length === 0) {
          showError("Error processing CSV file.");
          if (err) {
            console.error(error);
          } else {
            console.error("No data found in CSV file.");
          }
          return;
        }

        if (Object.keys(data[0]).indexOf('address') == -1) {
          showError("File doesn't contain address field.");
          console.error("No address column found in CSV file.");
          return;
        }

        $('#error').css('display', 'none');
        $('#subBtn').prop('disabled', true);

        // Find entries with addresses
        for (let i = 0; i < data.length; i++) {
          const address = data[i].address.trim();
          if (address) {
            // Store addresses in dict with freq. they appear
            if (addresses[address]) {
              addresses[address] += 1;
            } else {
              addresses[address] = 1;
            }
          }
        }

        const addressStrs = Object.keys(addresses);
        spinner.spin(document.getElementById('spinner'));
        $.ajax("/geocode", {
          data: JSON.stringify(addressStrs),
          contentType: 'application/json',
          type: 'POST',
          complete: (res, status) => {
            if (res.status == 200){
              locations = res.responseJSON;
              drawHeatmap();
            } else {
              showError("There was an error processing your request.");
              console.error(res.statusText);
            }
            // Reset UI
            $('#subBtn').prop('disabled', false);
            spinner.stop();
          }
        });
      });
    } catch (e) {
      showError("Error processing CSV file");
      console.log("Error thrown by $.csv.toObject()");
      console.error(e);
    }

  };
};

function drawHeatmap() {
  $('#error').css('display', 'none');

  const data = Object.keys(locations).map(address => {
    const weight = addresses[address];
    const loc = locations[address];
    const latlng = new google.maps.LatLng(loc.lat, loc.lng);
    return { location: latlng, weight: weight };
  });

  const heatmap = new google.maps.visualization.HeatmapLayer({
    data: data,
    dissipate: false,
    radius: 30
  });
  heatmap.setMap(map);
};

function showError(errorText) {
  $('#error p').text(errorText);
  $('#error').css('display', 'block');
}
