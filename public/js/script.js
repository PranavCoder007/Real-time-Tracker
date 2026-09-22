const socket = io();

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;

            socket.emit("send-location", {
                latitude,
                longitude
            });
        },
        (error) => {
            console.error(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

const map = L.map("map").setView([0, 0], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Arkham007"
}).addTo(map);

const markers = {};

// Different colors for different users
const colors = [
    "#e74c3c", // Red
    "#3498db", // Blue
    "#2ecc71", // Green
    "#f39c12", // Orange
    "#9b59b6", // Purple
    "#e91e63", // Pink
    "#34495e"  // Dark blue
];

let colorIndex = 0;
const userColors = {};

socket.on("receive-location", (data) => {

    const { id, latitude, longitude } = data;

    map.setView([latitude, longitude]);

    // Assign a color to a new user
    if (!userColors[id]) {
        userColors[id] = colors[colorIndex % colors.length];
        colorIndex++;
    }

    const color = userColors[id];

    if (markers[id]) {

        // Move existing marker
        markers[id].setLatLng([latitude, longitude]);

    } else {

        // Create custom pin
        const icon = L.divIcon({
            className: "",
            html: `
                <div 
                    class="user-marker"
                    style="
                        width: 25px;
                        height: 25px;
                        background-color: ${color};
                        border-radius: 50% 50% 50% 0;
                        border: 3px solid white;
                        transform: rotate(-45deg);
                        position: relative;
                    "
                >
                    <div style="
                        width: 8px;
                        height: 8px;
                        background-color: white;
                        border-radius: 50%;
                        position: absolute;
                        top: 6px;
                        left: 6px;
                    "></div>
                </div>
            `,
            iconSize: [25, 25],
            iconAnchor: [12, 25],
            popupAnchor: [0, -25]
        });

        markers[id] = L.marker(
            [latitude, longitude],
            { icon: icon }
        ).addTo(map);
    }
});

socket.on("user-disconnected", (id) => {

    if (markers[id]) {
        map.removeLayer(markers[id]);

        delete markers[id];
        delete userColors[id];
    }

});