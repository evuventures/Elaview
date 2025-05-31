const socket = new WebSocket('ws://localhost:4000');

socket.onopen = () => {
  console.log('Connected to WebSocket server');
};

socket.onmessage = (event) => {
  const updatedLocation = JSON.parse(event.data);
  console.log('New location:', updatedLocation);
};

export default socket;