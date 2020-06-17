/**
 * Fields in a request to update a single PLANT item.
 */
export interface UpdatePlantRequest {
  name: string
  dueDate: string
  done: boolean
  attachmentUrl : string
}