import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { env } from "./env";

export async function middleware(request: NextRequest) {
  // let token = await getToken({
  //   req: request,
  //   secret: env.AUTH_SECRET,
  // });
  // console.log(env.NODE_ENV);
  // if (env.NODE_ENV === "production") {
  //   console.log("Production---------------------------------------"); // DEVELOPMENT , NODE ENV IS NOT WORKING AS EXPECTED
  //   token = await getToken({
  //     req: request,
  //     secret: env.AUTH_SECRET,
  //     cookieName: "next-auth.session-token",
  //   });
  // } else {
  //   console.log("Development---------------------------------------");
  // }

  const token = await getToken({
    // PRODUCTION
    req: request,
    secret: env.AUTH_SECRET,
    cookieName: "next-auth.session-token",
  });
  if (
    request.nextUrl.pathname === "/signin" ||
    request.nextUrl.pathname === "/login"
  ) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }
  if (
    request.nextUrl.pathname === "/signup" ||
    request.nextUrl.pathname === "/register"
  ) {
    return NextResponse.redirect(new URL("/auth/signup", request.url));
  }
  if (request.nextUrl.pathname === "/dashboard") {
    if (token) {
      if (token.role === "OWNER") {
        return NextResponse.redirect(new URL("/dashboard/owner", request.url));
      } else if (token.role === "EMPLOYEE") {
        return NextResponse.redirect(
          new URL("/dashboard/employee", request.url),
        );
      }
    }
  }
  if (request.nextUrl.pathname === "/dashboard/owner") {
    if (token && token.role === "EMPLOYEE") {
      return NextResponse.redirect(new URL("/dashboard/employee", request.url));
    } else if (!token || token.role !== "OWNER") {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }
  if (request.nextUrl.pathname === "/dashboard/employee") {
    if (token && token.role === "OWNER") {
      return NextResponse.redirect(new URL("/dashboard/owner", request.url));
    } else if (!token || token.role !== "EMPLOYEE") {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }

  if (request.nextUrl.pathname === "/auth/verifyotp") {
    const referer = request.headers.get("referer");
    if (
      !referer ||
      (!referer.includes("/signup") && !referer.includes("/signin"))
    ) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/signin",
    "/login",
    "/register",
    "/signup",
    "/dashboard",
    "/dashboard/owner",
    "/dashboard/employee",
    "/auth/verifyotp",
  ],
};
