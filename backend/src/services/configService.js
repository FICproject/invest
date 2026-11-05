import { PlatformConfig } from '../models/PlatformConfig.js';

export async function getSubscriptionFeeConfig() {
  try {
    let config = await PlatformConfig.findOne({ key: 'subscription_fees' });
    if (!config) {
      config = await PlatformConfig.create({
        key: 'subscription_fees',
        value: {
          companyFee: 500,
          investorFee: 500
        },
        description: 'Monthly platform membership subscription fees (INR)'
      });
    }
    return {
      companyFee: Number(config.value?.companyFee) || 500,
      investorFee: Number(config.value?.investorFee) || 500
    };
  } catch (err) {
    console.error('Error fetching subscription fees config:', err);
    return { companyFee: 500, investorFee: 500 };
  }
}

