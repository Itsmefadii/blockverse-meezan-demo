import { apiResponse } from "../../../utils/utils.js";
import { bankKycService, checkExistingKycService, checkKycService, nonBankKycService} from "../services/kyc.services.js";

export const bankKycController = async (req, reply) => {
    try {
        const data = await bankKycService(req);

        return reply.status(200).send(apiResponse(true, "KYC Completed", data, 200, "SUCCESS"));
    } catch (error) {
        return reply.status(400).send(apiResponse(false, `KYC failed: ${error.message}`, null, 400, "FAILURE"));
    }
}

export const nonBankKycController = async (req, reply) => {
    try {
        const data = await nonBankKycService(req);

        return reply.status(200).send(apiResponse(true, "KYC successfull", data, 200, "SUCCESS"));
    } catch (error) {
        return reply.status(400).send(apiResponse(false, `KYC failed: ${error.message}`, null, 400, "FAILURE"));
    }
}

export const checkKycController = async (req, reply) => {
    try {
        const data = await checkKycService(req);

        return reply.status(200).send(apiResponse(true, "KYC successfull", data, 200, "SUCCESS"));
    } catch (error) {
        return reply.status(400).send(apiResponse(false, `KYC failed: ${error.message}`, null, 400, "FAILURE"));
    }
}

export const checkExistingKycController = async (req, reply) => {
    try {
        const data = await checkExistingKycService(req);

        return reply.status(200).send(apiResponse(true, "Sender info retrieved successfully", data, 200, "SUCCESS"));
    } catch (error) {
        return reply.status(400).send(apiResponse(false, `Failed to fetch sender info: ${error.message}`, null, 400, "FAILURE"));
    }
}