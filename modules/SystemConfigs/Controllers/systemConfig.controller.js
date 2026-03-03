import { bankListingService, titleFetchService } from "../services/systemConfig.services.js";
import { apiResponse } from "../../../utils/utils.js";

export const bankListingController = async (req, reply) => {
    try {
        const data = await bankListingService(req);

        return reply.status(200).send(apiResponse(true, "Bank listing fetched successfully", data, 200, "SUCCESS"));
    } catch (error) {
        return reply.status(400).send(apiResponse(false, error.message, null, 400, "FAILURE"));
    }
}

export const titleFetchController = async (req, reply) => {
    try {
        const data = await titleFetchService(req);

        return reply.status(200).send(apiResponse(true, "Title fetched successfully", data, 200, "SUCCESS"));
    } catch (error) {
        return reply.status(400).send(apiResponse(false, error.message, null, 400, "FAILURE"));
    }
}
