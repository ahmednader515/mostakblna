import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const isTeacherRoute = req.nextUrl.pathname.startsWith("/dashboard/dashboard/teacher");
    const isTeacher = req.nextauth.token?.role === "TEACHER";
    const isAuthPage = req.nextUrl.pathname.startsWith("/sign-in") || 
                      req.nextUrl.pathname.startsWith("/sign-up") ||
                      req.nextUrl.pathname.startsWith("/forgot-password") ||
                      req.nextUrl.pathname.startsWith("/reset-password");
    
    // Add check for payment status page
    const isPaymentStatusPage = req.nextUrl.pathname.includes("/payment-status");

    // If user is on auth page and is authenticated, redirect to dashboard
    if (isAuthPage && req.nextauth.token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // If user is not authenticated and trying to access protected routes
    // But exclude payment status page from this check
    if (!req.nextauth.token && !isAuthPage && !isPaymentStatusPage) {
      return NextResponse.redirect(new URL("/sign-in", req.url), { status: 302 });
    }

    // If user is not a teacher but trying to access teacher routes
    if (isTeacherRoute && !isTeacher) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Handle POST requests to payment status page
    if (isPaymentStatusPage && req.method === "POST") {
      // Convert POST to GET by redirecting to the same URL
      return NextResponse.redirect(req.url, { status: 303 });
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => true, // We'll handle authorization in the middleware function
    },
  }
);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|teacher-image.png|logo.png|male.png|eraser.png|pencil.png|ruler.png|$).*)",
  ],
};