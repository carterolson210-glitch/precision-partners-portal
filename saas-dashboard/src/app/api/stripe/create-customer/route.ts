import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.stripeCustomerId) {
      return NextResponse.json({ customerId: user.stripeCustomerId })
    }

    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
    })

    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customer.id },
    })

    return NextResponse.json({ customerId: customer.id })
  } catch (error) {
    console.error("Error creating Stripe customer:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}