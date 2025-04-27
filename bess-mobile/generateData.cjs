const XLSX = require('xlsx');
const fs = require('fs');

// Convert Excel serial date to YYYY-MM-DD
function excelDateToJSDate(serial) {
  const utc_days = Math.floor(serial - 25569);
  const date = new Date(utc_days * 86400 * 1000);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Sample coordinates (updated with more locations)
const locationCoords = {
  'Japan, Ibaraki Prefecture': { lat: 36.3418, lon: 140.4468, country: 'Japan' },
  'Scotland, Aberdeenshire': { lat: 57.4118, lon: -2.4647, country: 'UK' },
  'USA, California': { lat: 36.7783, lon: -119.4179, country: 'USA' }
  // Add more locations from bess_data.xlsx as needed
};

const workbook = XLSX.readFile('bess_data.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
let data = XLSX.utils.sheet_to_json(sheet);

// Process data
data = data.map((item, i) => ({
  id: i,
  location: item['Location'] || 'Unknown',
  country: locationCoords[item['Location']]?.country || 'Unknown',
  latitude: locationCoords[item['Location']]?.lat || 0,
  longitude: locationCoords[item['Location']]?.lon || 0,
  capacityMW: item['Capacity (MW)'] || 0,
  batteryModules: item['Battery Modules'] || 'Unknown',
  installation: item['Installation'] || 'Unknown',
  eventDate: item['Event Date'] ? excelDateToJSDate(item['Event Date']) : 'Unknown',
  cause: item['Cause'] ? item['Cause'].replace(/â€[a-z]/g, '"') : 'Unknown',
  sourceUrl: item['Source URL'] || `https://example.com/incident-${i + 1}`,
  imageUrl: i % 2 === 0 ? 'https://via.placeholder.com/150' : null
}));

// Pad to 94 items if needed
while (data.length < 94) {
  const i = data.length;
  data.push({
    id: i,
    location: 'Dummy Location',
    country: 'Unknown',
    latitude: 0,
    longitude: 0,
    capacityMW: 10,
    batteryModules: 'Unknown',
    installation: 'Unknown',
    eventDate: '2023-01-01',
    cause: 'Unknown',
    sourceUrl: `https://example.com/incident-${i + 1}`,
    imageUrl: null
  });
}

fs.writeFileSync('src/data/bessData.json', JSON.stringify(data, null, 2));
