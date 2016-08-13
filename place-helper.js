var fetch = require('node-fetch');
fetch.Promise = require('bluebird');
var _ = require('lodash');

try {
  var key = require('../../../../carvis/carvis-web/secret/config').GOOGLE_PLACES_API_KEY;
} catch (ex) {
  // use local repo's config file as fallback
  console.log('exception:', ex);
  var key = require('./config').GOOGLE_PLACES_API_KEY;
}

var placesCall = function(place, cb) {
  // TODO: make location and radius for destination call dynamic to origin's location
  var url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${place}&location=0,0&radius=20000000&key=${key}';
  url = _.template(url)({
    place: place,
    key: key
  });

  fetch(url).then( function(res) {
    return res.json();
  }).then( function(data) {
    var placeDesc = data.predictions[0].description;
    console.log('Place found:', placeDesc);
    // TODO: filter out place results with distance from home > 100 miles
    var placeId = data.predictions[0].place_id;
    var detailURL = 'https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${key}';
    detailURL = _.template(detailURL)({
      placeId: placeId,
      key: key
    });

    fetch(detailURL).then( function(res) {
      return res.json();
    }).then( function(data) {
      var placeLat = data.result.geometry.location.lat;
      var placeLong = data.result.geometry.location.lng;
      var routableAddress = data.result.formatted_address;
      // ie. "48 Pirrama Road, Pyrmont NSW, Australia"
      // NOTE: we need this for both origin and destination.
      // store this somewhere ? 

      cb(placeDesc, [placeLat, placeLong]);
    }).catch( function(err) {
      console.log('error on place detail', err);
    });

  }).catch(function(err) {
    console.log('err in places', err);
  });

};

module.exports = placesCall;
