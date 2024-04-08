import { Logger } from '@nestjs/common';

import axios from 'axios';

const logger = new Logger('verifyEmail');

export const verifyEmail = async (email: string) => {
  try {
    const response = await axios.get(
      `https://api.hunter.io/v2/email-verifier?email=${email}&api_key=${process.env.EMAIL_VERIFICATION_TOKEN}`,
    );

    const { data } = response.data;

    return (
      data.status === 'valid' &&
      data.regexp === true &&
      data.result === 'deliverable'
    );
  } catch (e) {
    logger.error('Error verifying email:', e);
    return false;
  }
};
