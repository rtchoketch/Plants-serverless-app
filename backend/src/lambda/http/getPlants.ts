import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { PlantsAccess } from '../../data/plantsAccess'
import { S3Helper } from '../../helpers/s3Helper'
import { ApiResponseHelper } from '../../helpers/apiResponseHelper'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../../helpers/authHelper'
const s3Helper = new S3Helper()
const apiResponseHelper= new ApiResponseHelper()
const logger = createLogger('plants')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event.headers['Authorization']) 
  logger.info(`get plants for user ${userId}`)
  const result = await new PlantsAccess().getUserPlants(userId)
  for(const record of result){
      record.attachmentUrl = await s3Helper.getPlantAttachmentUrl(record.Id)
  }

  return apiResponseHelper.generateDataSuccessResponse(200,'items',result)

}
