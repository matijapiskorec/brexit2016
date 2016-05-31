$(document).ready(function() {
    var map = new L.Map('map');
    map.setView(new L.LatLng(45.8150, 15.9819), 10);
    var googleLayer = new L.Google('ROADMAP');
    map.addLayer(googleLayer);
    //map.attributionControl.setPrefix('');
    var kmlLayer = new L.KML("../data/karta_zagreb.kml", {async: true});
    map.addLayer(kmlLayer);

    var markerA = new L.Marker([45.870282, 15.94305], {opacity: 0.01});
    markerA.bindLabel(
      "I", {noHide: true, className: "map-label", offset: [0, 0] });
    markerA.addTo(map);

    var markerB = new L.Marker([45.89282, 16.10305], {opacity: 0.01});
    markerB.bindLabel(
      "II", {noHide: true, className: "map-label", offset: [0, 0] });
    markerB.addTo(map);

    var markerC = new L.Marker([45.81282, 16.03305], {opacity: 0.01});
    markerC.bindLabel(
      "VI", {noHide: true, className: "map-label", offset: [0, 0] });
    markerC.addTo(map);

    var markerD = new L.Marker([45.73282, 15.89], {opacity: 0.01});
    markerD.bindLabel(
      "VII", {noHide: true, className: "map-label", offset: [0, 0] });
    markerD.addTo(map);

});
