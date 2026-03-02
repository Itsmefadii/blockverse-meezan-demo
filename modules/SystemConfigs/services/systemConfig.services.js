import { Banks } from "../models/banks.model.js";

export const bankListingService = async (req) => {
  try {
    const { bankId } = req.query;
    let bank;
    if (bankId) {
      bank = await Banks.findOne({
        where: {
          id: bankId,
        },
      });

      return bank;
    }
    bank = await Banks.findAll();

    return bank;
  } catch (error) {}
};
