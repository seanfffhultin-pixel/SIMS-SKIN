import {NextResponse} from "next/server";
/*
 Personal completion state belongs to YOUR app, not SIMS.
 In production replace this demo response with a database write keyed to
 authenticated user + SIMS assignment ID.
*/
export async function POST(_req:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 return NextResponse.json({ok:true,homeworkId:id,completed:true,completedAt:new Date().toISOString()});
}