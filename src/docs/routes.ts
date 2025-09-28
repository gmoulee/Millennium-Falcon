/**
 * @swagger
 * /compute:
 *   post:
 *     summary: Compute optimal route to destination planet
 *     description: Calculates the most efficient route from Tatooine to the specified destination planet, considering fuel constraints and refueling stops
 *     tags: [Routes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ComputeRequest'
 *           examples:
 *             endor:
 *               summary: Route to Endor
 *               value:
 *                 arrival: "Endor"
 *             dagobah:
 *               summary: Route to Dagobah
 *               value:
 *                 arrival: "Dagobah"
 *             hoth:
 *               summary: Route to Hoth
 *               value:
 *                 arrival: "Hoth"
 *     responses:
 *       200:
 *         description: Route computed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ComputeResponse'
 *             examples:
 *               endor-route:
 *                 summary: Route to Endor
 *                 value:
 *                   duration: 8
 *                   route: ["Tatooine", "Hoth", "Endor"]
 *               dagobah-route:
 *                 summary: Route to Dagobah
 *                 value:
 *                   duration: 6
 *                   route: ["Tatooine", "Dagobah"]
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

// This file contains Swagger/OpenAPI documentation for route computation endpoints
// The JSDoc comments above are parsed by swagger-jsdoc to generate API documentation
export const routeDocs = 'Route computation endpoint documentation'
