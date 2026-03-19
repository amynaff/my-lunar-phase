import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const dbUser = await prisma.user.findUnique({ where: { id: user!.id } });
  if (!dbUser?.stripeCustomerId) {
    return NextResponse.json({ error: "No subscription found" }, { status: 400 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: dbUser.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  });

  return NextResponse.json({ url: session.url });
}
