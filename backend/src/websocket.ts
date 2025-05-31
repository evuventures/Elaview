const socket = new WebSocket('ws://localhost:4000');

// Send location updates
navigator.geolocation.watchPosition(position => {
  const location = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude
  };
  socket.send(JSON.stringify(location));
}, error => console.error('Geolocation error:', error));

// Listen for location updates from backend
socket.onmessage = (event) => {
  const updatedLocation = JSON.parse(event.data);
  console.log('New location:', updatedLocation);
};

export default socket;