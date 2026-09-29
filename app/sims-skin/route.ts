import {NextResponse} from "next/server";

export function GET(request: Request) {
  return NextResponse.redirect(new URL("/sims-skin/index.html", request.url));
}
