export const printerConfig = {
  type: 'THERMAL_80MM', // or A4
  interface: 'TCP',      // TCP, USB, SERIAL
  ipAddress: '192.168.1.100',
  port: 9100,
  characterSet: 'PC437_USA',
  margin: {
    left: 0,
    right: 0,
  },
  fontSize: 'MEDIUM',
};
export default printerConfig;
