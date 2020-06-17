import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreatePlantRequest } from '../../requests/CreatePlantRequest'
import { ApiResponseHelper } from '../../helpers/apiResponseHelper'
import { PlantsAccess } from '../../data/plantsAccess'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../../helpers/authHelper'

const logger = createLogger('plants')
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newPlant: CreatePlantRequest = JSON.parse(event.body)

  const userId = getUserId(event.headers['Authorization']) 
  logger.info(`create plant for user ${userId} with data ${newPlant}`)
  const item = await new PlantsAccess().createPlant(newPlant, userId)

  return new ApiResponseHelper().generateDataSuccessResponse(201, 'item', item)
}
