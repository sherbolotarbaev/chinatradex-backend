import IPinfo from 'node-ipinfo';

const iPinfo = new IPinfo(process.env.IP_INFO_SECRET_KEY);

export const getLocation = async (ip: string): Promise<LocationData> => {
  try {
    const response = await iPinfo.lookupIp(ip);
    const {
      city,
      region,
      country,
      timezone,
      countryFlag,
      countryCurrency,
      countryFlagURL,
    }: LocationData = response;

    const locationData: LocationData = {
      city,
      region,
      country,
      timezone,
      countryFlag,
      countryCurrency,
      countryFlagURL,
    };

    return locationData;
  } catch (e: any) {
    console.error('Error get location:', e);
  }
};
