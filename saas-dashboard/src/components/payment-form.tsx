"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { toast } from "sonner"

interface PaymentFormProps {
  plan: string
  onSuccess: () => void
}

export function PaymentForm({ plan, onSuccess }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)

    try {
      // Create payment method
      const { error: methodError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardElement)!,
      })

      if (methodError) {
        toast.error(methodError.message)
        return
      }

      // Create subscription
      const response = await fetch("/api/stripe/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan,
          paymentMethodId: paymentMethod.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error)
        return
      }

      // Confirm payment
      const { error: confirmError } = await stripe.confirmCardPayment(data.clientSecret)

      if (confirmError) {
        toast.error(confirmError.message)
        return
      }

      toast.success("Subscription created successfully!")
      onSuccess()
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Card Information</label>
        <div className="border rounded-md p-3">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
              },
            }}
          />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={!stripe || isLoading}>
        {isLoading ? "Processing..." : `Subscribe to ${plan}`}
      </Button>
    </form>
  )
}