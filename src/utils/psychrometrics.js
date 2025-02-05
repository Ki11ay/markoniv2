/**
 * Calculate dew point temperature using Magnus formula
 * @param {number} temp - Dry bulb temperature in °C
 * @param {number} rh - Relative humidity (0-100)
 * @returns {number} Dew point temperature in °C
 */
export function calcDewPoint(temp, rh) {
  // Constants for Magnus formula
  const a = 17.27;
  const b = 237.7;

  // Normalize RH to 0-1
  const rh01 = rh / 100;

  // Calculate gamma
  const gamma = ((a * temp) / (b + temp)) + Math.log(rh01);

  // Calculate dew point
  const dewPoint = (b * gamma) / (a - gamma);
  return Number(dewPoint.toFixed(2));
}

/**
 * Calculate saturation vapor pressure using ASHRAE method
 * @param {number} temp - Temperature in °C
 * @returns {number} Saturation vapor pressure in kPa
 */
function calcSaturationVaporPressure(temp) {
  const T = temp + 273.15; // Convert to Kelvin
  const C1 = -5.6745359e3;
  const C2 = 6.3925247;
  const C3 = -9.6778430e-3;
  const C4 = 6.2215701e-7;
  const C5 = 2.0747825e-9;
  const C6 = -9.4840240e-13;
  const C7 = 4.1635019;

  const lnPws = C1/T + C2 + C3*T + C4*T*T + C5*T*T*T + C6*T*T*T*T + C7*Math.log(T);
  return Math.exp(lnPws) / 1000; // Convert to kPa
}

/**
 * Calculate humidity ratio
 * @param {number} temp - Temperature in °C
 * @param {number} rh - Relative humidity (0-100)
 * @param {number} pressure - Atmospheric pressure in kPa
 * @returns {number} Humidity ratio (kg water / kg dry air)
 */
function calcHumidityRatio(temp, rh, pressure = 101.325) {
  const pws = calcSaturationVaporPressure(temp);
  const pw = (rh / 100) * pws;
  return 0.62198 * pw / (pressure - pw);
}

/**
 * Calculate wet bulb temperature using modified ASHRAE method
 * @param {number} dryBulb - Dry bulb temperature in °C
 * @param {number} rh - Relative humidity (0-100)
 * @returns {number} Wet bulb temperature in °C
 */
export function calcWetBulb(dryBulb, rh) {
  const dewPoint = calcDewPoint(dryBulb, rh);
  
  // Check bounds
  if (dewPoint > dryBulb) return dryBulb;
  if (rh >= 100) return dryBulb;
  if (rh <= 0) return dewPoint;

  // Constants
  const pressure = 101.325;  // Standard atmospheric pressure (kPa)
  const cp = 1.006;         // Specific heat of dry air (kJ/kg·K)
  const cpw = 4.186;        // Specific heat of water (kJ/kg·K)
  const hfg = 2501;         // Latent heat of vaporization at 0°C (kJ/kg)

  // Calculate actual humidity ratio
  const W = calcHumidityRatio(dryBulb, rh, pressure);

  // Binary search for wet bulb temperature
  let low = dewPoint;
  let high = dryBulb;
  let wetBulb;
  const tolerance = 0.01;

  for (let i = 0; i < 50; i++) {
    wetBulb = (low + high) / 2;
    
    // Calculate saturation humidity ratio at wet bulb temp
    const Ws = calcHumidityRatio(wetBulb, 100, pressure);
    
    // Energy balance equation
    const LHS = (hfg + cpw * wetBulb) * (Ws - W);
    const RHS = cp * (dryBulb - wetBulb);
    
    if (Math.abs(LHS - RHS) < tolerance) {
      break;
    }
    
    if (LHS > RHS) {
      high = wetBulb;
    } else {
      low = wetBulb;
    }
  }

  // Validate result
  if (wetBulb < dewPoint) wetBulb = dewPoint;
  if (wetBulb > dryBulb) wetBulb = dryBulb;
  
  return Number(wetBulb.toFixed(2));
}

/**
 * Calculate air enthalpy using ASHRAE method
 * @param {number} temp - Dry bulb temperature in °C
 * @param {number} rh - Relative humidity (0-100)
 * @returns {number} Enthalpy in kJ/kg
 */
export function calcEnthalpy(temp, rh) {
  // Constants
  const cp = 1.006;    // Specific heat of dry air (kJ/kg·K)
  const cpv = 1.84;    // Specific heat of water vapor (kJ/kg·K)
  const hfg = 2501;    // Latent heat of vaporization at 0°C (kJ/kg)

  // Calculate humidity ratio
  const W = calcHumidityRatio(temp, rh);
  
  // Calculate enthalpy
  const h = cp * temp + W * (hfg + cpv * temp);
  
  return Number(h.toFixed(2));
}

/**
 * Calculate COP and power consumption
 * @param {number} inletTemp - Inlet air temperature in °C
 * @param {number} outletTemp - Outlet air temperature in °C
 * @param {number} inletRH - Inlet relative humidity (0-100)
 * @param {number} outletRH - Outlet relative humidity (0-100)
 * @param {number} dryFanSpeed - Dry fan speed (0-100)
 * @param {number} wetFanSpeed - Wet fan speed (0-100)
 * @param {boolean} isPumpActive - Pump state
 * @returns {Object} COP, cooling effect, and power consumption data
 */
export function calculateCOP(
  inletTemp,
  outletTemp,
  inletRH,
  outletRH,
  dryFanSpeed,
  wetFanSpeed,
  isPumpActive
) {
  // Constants
  const MIN_FAN_POWER = 90;   // Minimum fan power in Watts
  const MAX_FAN_POWER = 110;  // Maximum fan power in Watts
  const PUMP_POWER = 90;      // Pump power in Watts
  const cp = 1.005;           // Specific heat of air (kJ/kg·K)
  const baseMassFlow = 0.259; // Base mass flow rate at 50% fan speed (kg/s)
  
  // Calculate mass flow rate based on dry fan speed
  const massFlowRate = (dryFanSpeed / 50) * baseMassFlow;

  // Calculate fan power (scales between MIN and MAX power based on speed)
  const calculateFanPower = (speedPercent) => {
    if (speedPercent === 0) return 0;
    return MIN_FAN_POWER + (speedPercent / 100) * (MAX_FAN_POWER - MIN_FAN_POWER);
  };

  // Calculate power consumption
  const actualDryFanPower = calculateFanPower(dryFanSpeed);
  const actualWetFanPower = calculateFanPower(wetFanSpeed);
  const actualPumpPower = isPumpActive ? PUMP_POWER : 0;
  const totalPower = actualDryFanPower + actualWetFanPower + actualPumpPower;

  // Calculate temperature difference
  const tempDiff = inletTemp - outletTemp;

  // Calculate cooling effect (W)
  const coolingEffect = massFlowRate * cp * tempDiff * 1000; // Convert from kW to W

  // Calculate COP
  const cop = totalPower > 0 ? Math.abs(coolingEffect) / totalPower : 0;

  // Calculate wet bulb and dew point temperatures for inlet air
  const inletWetBulb = calcWetBulb(inletTemp, inletRH);
  const inletDewPoint = calcDewPoint(inletTemp, inletRH);

  // Calculate effectiveness
  const wetBulbEffectiveness = (inletTemp - outletTemp) / (inletTemp - inletWetBulb);
  const dewPointEffectiveness = (inletTemp - outletTemp) / (inletTemp - inletDewPoint);

  return {
    cop: Number(cop.toFixed(2)),
    coolingEffect: Number(coolingEffect.toFixed(2)),
    powerConsumption: {
      total: Number(totalPower.toFixed(2)),
      dryFan: Number(actualDryFanPower.toFixed(2)),
      wetFan: Number(actualWetFanPower.toFixed(2)),
      pump: Number(actualPumpPower.toFixed(2))
    },
    massFlowRate: Number(massFlowRate.toFixed(3)),
    effectiveness: {
      wetBulb: Number(wetBulbEffectiveness.toFixed(2)),
      dewPoint: Number(dewPointEffectiveness.toFixed(2))
    },
    temperatures: {
      inletWetBulb: Number(inletWetBulb.toFixed(2)),
      inletDewPoint: Number(inletDewPoint.toFixed(2))
    }
  };
}
