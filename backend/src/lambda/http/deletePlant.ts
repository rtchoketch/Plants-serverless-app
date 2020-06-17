import 'source-map-support/register'

import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { PlantsAccess } from '../../data/plantsAccess'
import { ApiResponseHelper } from '../../helpers/apiResponseHelper'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../../helpers/authHelper'

const plantsAccess = new PlantsAccess()
const apiResponseHelper = new ApiResponseHelper()
const logger = createLogger('plants')
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const Id = event.pathParameters.Id
  
  if(!Id){
      logger.error('deletion attempt without id failed')
      return apiResponseHelper.generateErrorResponse(400,'invalid parameters')
  }

  const userId = getUserId(event.headers['Authorization']) 

  const item = await plantsAccess.getPlantById(Id)
  if(item.Count == 0){
      logger.error(`user ${userId} requesting deletion for non existing plant with id ${Id}`)
      return apiResponseHelper.generateErrorResponse(400,'PLANT does not exist')
  }

  if(item.Items[0].userId !== userId){
      logger.error(`user ${userId} requesting delete plant does not belong to this account with id ${Id}`)
      return apiResponseHelper.generateErrorResponse(400,'PLANT does not belong to the authorized user')
  }

  logger.info(`User ${userId} deleting plant ${Id}`)
  await plantsAccess.deletePlantById(Id , userId)
  return apiResponseHelper.generateEmptySuccessResponse(204)
}
