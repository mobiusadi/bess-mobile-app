import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './index.css';
import bessData from './data/bessData.json';

function App() {
  const [selectedId, setSelectedId] = useState(null);

  const handleMarkerClick = (id) => {
    setSelectedId(id);
    const card = document.getElementById(`card-${id}`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCardClick = (id, lat, lng) => {
    setSelectedId(id);
    const map = document.querySelector('.leaflet-container')?._leaflet_map;
    if (map) {
      map.setView([lat, lng], 8);
    }
  };

  return (
    <div className="font-sans">
      <h1 className="text-2xl font-bold text-center p-4">BESS Incident Map</h1>
      <p className="text-center mb-4">Click a marker or card to view details</p>
      <div className="flex flex-col md:flex-row min-h-screen">
        <div className="w-full md:w-3/5 h-[50vh] md:h-screen relative">
          <MapContainer
            center={[0, 0]}
            zoom={2}
            minZoom={2}
            maxBounds={[[-90, -180], [90, 180]]}
            maxBoundsViscosity={1.0}
            className="w-full h-full"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {bessData.map((item) => (
              <CircleMarker
                key={item.id}
                center={[item.latitude, item.longitude]}
                radius={Math.min(5 + item.capacityMW / 10, 20)}
                color={selectedId === item.id ? 'red' : 'blue'}
                fillColor={selectedId === item.id ? 'red' : 'blue'}
                fillOpacity={0.8}
                eventHandlers={{ click: () => handleMarkerClick(item.id) }}
              >
                <Popup>{item.location}</Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
        <div className="w-full md:w-2/5 overflow-y-auto h-[50vh] md:h-screen p-4">
          {bessData.map((item) => (
            <Card
              key={item.id}
              item={item}
              isSelected={selectedId === item.id}
              onClick={() => handleCardClick(item.id, item.latitude, item.longitude)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ item, isSelected, onClick }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      id={`card-${item.id}`}
      className={`p-4 mb-4 border rounded-lg cursor-pointer transition-all ${
        isSelected ? 'border-red-500 border-2' : 'border-gray-300'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start">
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.location}
            className="w-20 h-auto mr-4 md:w-32"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold truncate">{item.location}</h3>
          <p className="text-sm">Capacity: {item.capacityMW} MW</p>
          <p className="text-sm">Date: {item.eventDate}</p>
          <p className="text-sm">Battery: {item.batteryModules}</p>
          <button
            className="text-blue-500 text-sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </button>
          {isExpanded && (
            <div className="mt-2 text-sm">
              <p>Cause: {item.cause}</p>
              <p>Installation: {item.installation}</p>
              <p>
                Source:{' '}
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  Link
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
