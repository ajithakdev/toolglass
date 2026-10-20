/** Factor to the category's base unit (metre, kilogram, litre, square metre, m/s, byte, second). */
type Unit = { label: string; factor: number };

export const UNITS: Record<string, Record<string, Unit>> = {
  Length: {
    mm: { label: 'Millimetre', factor: 0.001 },
    cm: { label: 'Centimetre', factor: 0.01 },
    m: { label: 'Metre', factor: 1 },
    km: { label: 'Kilometre', factor: 1000 },
    in: { label: 'Inch', factor: 0.0254 },
    ft: { label: 'Foot', factor: 0.3048 },
    yd: { label: 'Yard', factor: 0.9144 },
    mi: { label: 'Mile', factor: 1609.344 },
    nmi: { label: 'Nautical mile', factor: 1852 },
  },
  Mass: {
    mg: { label: 'Milligram', factor: 1e-6 },
    g: { label: 'Gram', factor: 0.001 },
    kg: { label: 'Kilogram', factor: 1 },
    t: { label: 'Tonne', factor: 1000 },
    oz: { label: 'Ounce', factor: 0.028349523125 },
    lb: { label: 'Pound', factor: 0.45359237 },
    st: { label: 'Stone', factor: 6.35029318 },
  },
  Temperature: {
    C: { label: 'Celsius', factor: 1 },
    F: { label: 'Fahrenheit', factor: 1 },
    K: { label: 'Kelvin', factor: 1 },
  },
  Volume: {
    ml: { label: 'Millilitre', factor: 0.001 },
    l: { label: 'Litre', factor: 1 },
    m3: { label: 'Cubic metre', factor: 1000 },
    tsp: { label: 'Teaspoon (US)', factor: 0.00492892159375 },
    tbsp: { label: 'Tablespoon (US)', factor: 0.01478676478125 },
    cup: { label: 'Cup (US)', factor: 0.2365882365 },
    floz: { label: 'Fluid ounce (US)', factor: 0.0295735295625 },
    gal: { label: 'Gallon (US)', factor: 3.785411784 },
    galuk: { label: 'Gallon (UK)', factor: 4.54609 },
  },
  Area: {
    m2: { label: 'Square metre', factor: 1 },
    km2: { label: 'Square kilometre', factor: 1e6 },
    ft2: { label: 'Square foot', factor: 0.09290304 },
    ac: { label: 'Acre', factor: 4046.8564224 },
    ha: { label: 'Hectare', factor: 10000 },
  },
  Speed: {
    ms: { label: 'Metres per second', factor: 1 },
    kmh: { label: 'Kilometres per hour', factor: 1 / 3.6 },
    mph: { label: 'Miles per hour', factor: 0.44704 },
    kn: { label: 'Knot', factor: 1852 / 3600 },
  },
  'Digital storage': {
    B: { label: 'Byte', factor: 1 },
    KB: { label: 'Kilobyte (1000)', factor: 1e3 },
    MB: { label: 'Megabyte (1000²)', factor: 1e6 },
    GB: { label: 'Gigabyte (1000³)', factor: 1e9 },
    TB: { label: 'Terabyte (1000⁴)', factor: 1e12 },
    KiB: { label: 'Kibibyte (1024)', factor: 1024 },
    MiB: { label: 'Mebibyte (1024²)', factor: 1024 ** 2 },
    GiB: { label: 'Gibibyte (1024³)', factor: 1024 ** 3 },
  },
  Time: {
    s: { label: 'Second', factor: 1 },
    min: { label: 'Minute', factor: 60 },
    h: { label: 'Hour', factor: 3600 },
    d: { label: 'Day', factor: 86400 },
    wk: { label: 'Week', factor: 604800 },
    yr: { label: 'Year (365.25 d)', factor: 31557600 },
  },
};

const toKelvin: Record<string, (v: number) => number> = { C: (v) => v + 273.15, F: (v) => ((v - 32) * 5) / 9 + 273.15, K: (v) => v };
const fromKelvin: Record<string, (v: number) => number> = { C: (v) => v - 273.15, F: (v) => ((v - 273.15) * 9) / 5 + 32, K: (v) => v };

export function convert(category: string, from: string, to: string, value: number): number {
  if (category === 'Temperature') return fromKelvin[to]!(toKelvin[from]!(value));
  const units = UNITS[category]!;
  return (value * units[from]!.factor) / units[to]!.factor;
}

/** Up to 10 significant digits, without float noise like 0.30000000000000004. */
export const formatNumber = (n: number) => (Number.isFinite(n) ? String(Number(n.toPrecision(10))) : '');
