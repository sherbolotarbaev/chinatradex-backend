import { Logger } from '@nestjs/common';

import IPinfo from 'node-ipinfo';

const iPinfo = new IPinfo(process.env.IP_INFO_SECRET_KEY);

const logger = new Logger('getLocation');

export const getLocation = async (ip: string): Promise<LocationData> => {
  try {
    const response = await iPinfo.lookupIp(ip);
    const { city, region, country, timezone, countryFlag }: LocationData =
      response;

    const locationData: LocationData = {
      city,
      region,
      country,
      timezone,
      countryFlag,
    };

    return locationData;
  } catch (e: any) {
    logger.error('Error receiving location:', e);
  }
};
