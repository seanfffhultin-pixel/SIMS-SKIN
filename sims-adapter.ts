import {mockData} from "./mock-data"; import {StudentData} from "./types";
/** Read-only SIMS boundary. Never collect or store a student's SIMS password. */
export interface SimsAdapter{getStudentData(externalStudentId:string):Promise<StudentData>}
export class MockSimsAdapter implements SimsAdapter{
 async getStudentData(_externalStudentId:string){return {...mockData,syncedAt:new Date().toISOString()}}
}
export const sims=new MockSimsAdapter();