import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdatePlantRequest } from '../../requests/UpdatePlantRequest'
import { PlantsAccess } from '../../data/plantsAccess'
import { ApiResponseHelper } from '../../helpers/apiResponseHelper'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../../helpers/authHelper'

const logger = createLogger('plants')
const plantsAccess = new PlantsAccess()
const apiResponseHelper = new ApiResponseHelper()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const Id = event.pathParameters.Id
    const updatedPlant: UpdatePlantRequest = JSON.parse(event.body)
    const userId = getUserId(event.headers['Authorization']) 
  
    const item = await plantsAccess.getPlantById(Id)
  
    if(item.Count == 0){
        logger.error(`user ${userId} requesting update for non existing plant with id ${Id}`)
        return apiResponseHelper.generateErrorResponse(400,'PLANT does not exist')
    } 

    if(item.Items[0].userId !== userId){
        logger.error(`user ${userId} requesting update: plant does not belong to this account with id ${Id}`)
        return apiResponseHelper.generateErrorResponse(400,'PLANT does not belong to the authorized user')
    }

    logger.info(`User ${userId} updating plant ${Id} to be ${updatedPlant}`)
    await new PlantsAccess().updatePlant(updatedPlant,Id,userId)
    return apiResponseHelper.generateEmptySuccessResponse(204)
}
