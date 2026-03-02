import { addBeneficiariesController, findBeneficiariesController } from "../controller/beneficiaries.controller.js";

export const beneficiaryRoutes = (fastify, options, done) => {
    fastify.route({
    method: ["GET", "POST", "PUT", "DELETE"],
    url: "/",
    handler: (req, reply) => {
      if (req.method == "POST") {
        addBeneficiariesController(req, reply)
      }
      if (req.method == "GET") {
        findBeneficiariesController(req, reply)
      }
    },
  });


  done();
}