import { apiResponse } from "../../../utils/utils.js";
import { addBeneficiariesService, findBenficiaryService } from "../services/beneficiaries.services.js";

export const addBeneficiariesController = async (req, reply) => {
    try {
        const data = await addBeneficiariesService(req);

        return reply.status(200).send(apiResponse(true, "Beneficiary successfully", data, 200, "SUCCESS"));
    } catch (error) {
        return reply.status(400).send(apiResponse(false, error.message, null, 400, "FAILURE"));
    }
}

export const findBeneficiariesController = async (req, reply) => {
    try {
        const data = await findBenficiaryService(req);

        return reply.status(200).send(apiResponse(true, "Beneficiary fetched successfully", data, 200, "SUCCESS"));
    } catch (error) {
        return reply.status(400).send(apiResponse(false, error.message, null, 400, "FAILURE"));
    }
}