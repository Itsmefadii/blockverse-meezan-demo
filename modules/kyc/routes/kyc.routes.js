import { bankKycController, nonBankKycController } from "../controllers/kyc.controller.js";

export const kycRoutes = (fastify, options, done) => {
    fastify.route({
    method: ["GET", "POST", "PUT", "DELETE"],
    url: "/bankKyc",
    handler: (req, reply) => {
      if (req.method == "POST") {
        bankKycController(req, reply)
      }
    },
  });

   fastify.route({
    method: ["GET", "POST", "PUT", "DELETE"],
    url: "/nonBankKyc",
    handler: (req, reply) => {
      if (req.method == "POST") {
        nonBankKycController(req, reply)
      }
    },
  });

  done();
}