import {
  AUTH_PAGE,
  AUTH_ROUTES,
  DEFAULT_LOGIN_REDIRECT,
  PUBLIC_ROUTES,
} from "@/../routes.config";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "./lib/config/auth/auth.config";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session && !("message" in session);
  const pathname = nextUrl.pathname;

  const headers = new Headers(req.headers);
  headers.set("x-pathname", pathname);

  const isApiRoute = pathname.startsWith("/api");
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (isApiRoute)
    return NextResponse.next({
      request: {
        headers,
      },
    });

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return NextResponse.next({
      request: {
        headers,
      },
    });
  }

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL(AUTH_PAGE, nextUrl));
  }
  return NextResponse.next({
    request: {
      headers,
    },
  });
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
