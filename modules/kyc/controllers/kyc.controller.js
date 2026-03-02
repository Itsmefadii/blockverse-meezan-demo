import { apiResponse } from "../../../utils/utils.js";
import { bankKycService, nonBankKycService} from "../services/kyc.services.js";

export const bankKycController = async (req, reply) => {
    try {
        const data = await bankKycService(req);

        return reply.status(200).send(apiResponse(true, "Transaction successful", data, 200, "SUCCESS"));
    } catch (error) {
        return reply.status(400).send(apiResponse(false, `Transactio failed: ${error.message}`, null, 400, "FAILURE"));
    }
}

export const nonBankKycController = async (req, reply) => {
    try {
        const data = await nonBankKycService(req);

        return reply.status(200).send(apiResponse(true, "Transaction successful", data, 200, "SUCCESS"));
    } catch (error) {
        return reply.status(400).send(apiResponse(false, `Transactio failed: ${error.message}`, null, 400, "FAILURE"));
    }
}