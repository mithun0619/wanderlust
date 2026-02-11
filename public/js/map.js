const mapElement = document.getElementById("map");
const hasCoordinates =
  listing &&
  listing.geometry &&
  Array.isArray(listing.geometry.coordinates) &&
  listing.geometry.coordinates.length === 2;

if (!mapToken || !hasCoordinates) {
  if (mapElement) {
    mapElement.style.height = "auto";
    mapElement.style.padding = "1rem";
    mapElement.style.border = "1px solid #dee2e6";
    mapElement.style.borderRadius = "0.5rem";
    mapElement.textContent = "Map is unavailable for this listing.";
  }
} else {
  mapboxgl.accessToken = mapToken;
  const map = new mapboxgl.Map({
    container: "map",
    center: listing.geometry.coordinates,
    zoom: 9,
  });

  new mapboxgl.Marker({ color: "red" })
    .setLngLat(listing.geometry.coordinates)
    .setPopup(
      new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<h4>${listing.title}</h4><p>Exact location will be provided after booking</p>`
      )
    )
    .addTo(map)
    .togglePopup();
}
