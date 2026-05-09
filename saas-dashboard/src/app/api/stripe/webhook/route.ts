import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"
import { headers } from "next/headers"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = headers().get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message)
    return NextResponse.json({ error: "Webhook error" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "invoice.payment_succeeded":
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          // Update subscription status
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: invoice.subscription as string },
            data: { status: "active" },
          })
        }
        break

      case "invoice.payment_failed":
        const failedInvoice = event.data.object as Stripe.Invoice
        if (failedInvoice.subscription) {
          // Update subscription status
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: failedInvoice.subscription as string },
            data: { status: "past_due" },
          })
        }
        break

      case "customer.subscription.updated":
        const subscription = event.data.object as Stripe.Subscription
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        })
        break

      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object as Stripe.Subscription
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: deletedSubscription.id },
          data: { status: "canceled" },
        })
        break

      case "invoice.created":
        const createdInvoice = event.data.object as Stripe.Invoice
        if (createdInvoice.customer) {
          const user = await prisma.user.findFirst({
            where: { stripeCustomerId: createdInvoice.customer as string },
          })
          if (user) {
            await prisma.invoice.create({
              data: {
                userId: user.id,
                stripeInvoiceId: createdInvoice.id,
                amount: createdInvoice.amount_due,
                currency: createdInvoice.currency,
                status: createdInvoice.status || "draft",
                pdfUrl: createdInvoice.invoice_pdf || undefined,
              },
            })
          }
        }
        break

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}