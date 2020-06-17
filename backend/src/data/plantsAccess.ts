import { PlantItem } from "../models/plantItem";
import { CreatePlantRequest } from "../requests/createPlantRequest";
import { UpdatePlantRequest } from "../requests/updatePlantRequest";
const uuid = require('uuid/v4')
import * as AWS from 'aws-sdk'

//..


export class PlantsAccess{
    constructor(
        private readonly docClient: AWS.DynamoDB.DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly plantsTable = process.env.PLANT_TABLE,
        private readonly userIdIndex = process.env.USER_ID_INDEX
    )
        {}

    async getUserPlants(userId: string): Promise<PlantItem[]>{
        const result = await this.docClient.query({
            TableName: this.plantsTable,
            IndexName: this.userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues:{
                ':userId':userId
            }
        }).promise()
        return result.Items as PlantItem[]
    }

    async createPlant(request: CreatePlantRequest,userId: string): Promise<PlantItem>{
        const newId = uuid()
        let item  : PlantItem = new PlantItem();
        item.userId= userId
        item.Id= newId
        item.createdAt= new Date().toISOString()
        item.name= request.name
        item.dueDate= request.dueDate
        item.done= false
  
        await this.docClient.put({
            TableName: this.plantsTable,
            Item: item
        }).promise()

        return item
    }


    async getPlantById(id: string): Promise<AWS.DynamoDB.QueryOutput>{
        return await this.docClient.query({
            TableName: this.plantsTable,
            KeyConditionExpression: 'Id = :Id',
            ExpressionAttributeValues:{
                ':Id': id
            }
        }).promise()
    }

    async updatePlant(updatedPlant:UpdatePlantRequest,Id:string,userId:string){
        await this.docClient.update({
            TableName: this.plantsTable,
            Key:{
                'Id':Id,
                "userId":userId
            },
            UpdateExpression: 'set #namefield = :n, dueDate = :d, done = :done, attachmentUrl = :url',
            ExpressionAttributeValues: {
                ':n' : updatedPlant.name,
                ':d' : updatedPlant.dueDate,
                ':done' : updatedPlant.done,
                ':url': updatedPlant.attachmentUrl
            },
            ExpressionAttributeNames:{
                "#namefield": "name"
              }
          }).promise()
    }

    async deletePlantById(Id: string, userId:string){
        const param = {
            TableName: this.plantsTable,
            Key:{
                "Id":Id ,
                "userId":userId
            }
        }
      
         await this.docClient.delete(param).promise()
    }
    
}