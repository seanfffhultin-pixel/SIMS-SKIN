import {NextResponse} from "next/server"; import {sims} from "@/lib/sims-adapter";
export async function GET(){return NextResponse.json(await sims.getStudentData("demo-student-001"))}