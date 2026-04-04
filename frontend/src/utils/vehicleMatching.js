const normalizeVehicleValue = (value) => String(value || '')
  .toUpperCase()
  .replace(/[^A-Z0-9]/g, '');

const getLastDigits = (value, count = 4) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.slice(-count);
};

export const getSmartVehicleMatch = (ocrValue, vehicles = [], getVehicleDisplayName = (vehicle) => vehicle?.vehicleNumber || vehicle?.vehicleNo || '') => {
  const normalizedOcr = normalizeVehicleValue(ocrValue);
  if (!normalizedOcr) {
    return {
      matchedVehicle: null,
      isMismatch: false,
      matchedValue: ''
    };
  }

  const exactVehicle = vehicles.find((vehicle) => normalizeVehicleValue(getVehicleDisplayName(vehicle)) === normalizedOcr) || null;
  if (exactVehicle) {
    return {
      matchedVehicle: exactVehicle,
      isMismatch: false,
      matchedValue: String(getVehicleDisplayName(exactVehicle) || '').trim()
    };
  }

  const ocrLastDigits = getLastDigits(normalizedOcr);
  if (ocrLastDigits.length < 4) {
    return {
      matchedVehicle: null,
      isMismatch: false,
      matchedValue: ''
    };
  }

  const digitMatches = vehicles.filter((vehicle) => getLastDigits(getVehicleDisplayName(vehicle)) === ocrLastDigits);
  if (digitMatches.length === 1) {
    const matchedVehicle = digitMatches[0];
    return {
      matchedVehicle,
      isMismatch: normalizeVehicleValue(getVehicleDisplayName(matchedVehicle)) !== normalizedOcr,
      matchedValue: String(getVehicleDisplayName(matchedVehicle) || '').trim()
    };
  }

  return {
    matchedVehicle: null,
    isMismatch: false,
    matchedValue: ''
  };
};

export { normalizeVehicleValue };
