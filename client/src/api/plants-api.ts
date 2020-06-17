import { apiEndpoint } from '../config'
import { Plant } from '../types/Plant';
import { CreatePlantRequest } from '../types/CreatePlantRequest';
import Axios from 'axios'
import { UpdatePlantRequest } from '../types/UpdatePlantRequest';

export async function getPlants(idToken: string): Promise<Plant[]> {
  console.log('Fetching plants')

  const response = await Axios.get(`${apiEndpoint}/plants`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Plants:', response.data)
  return response.data.items
}

export async function createPlant(
  idToken: string,
  newPlant: CreatePlantRequest
): Promise<Plant> {
  const response = await Axios.post(`${apiEndpoint}/plants`,  JSON.stringify(newPlant), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchPlant(
  idToken: string,
  Id: string,
  updatedPlant: UpdatePlantRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/plants/${Id}`, JSON.stringify(updatedPlant), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deletePlant(
  idToken: string,
  Id: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/plants/${Id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  Id: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/plants/${Id}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
