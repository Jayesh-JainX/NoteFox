import { stripe } from "@/app/lib/stripe";
import { headers } from "next/headers";
import Stripe from "stripe";
import supabase from "@/app/lib/db";

export async function POST(req: Request) {
  const body = await req.text();

  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error: unknown) {
    return new Response("webhook error", { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );
    const customerId = String(session.customer);

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .single();

    if (!user || userError) throw new Error("User not found...");

    const { error: subscriptionError } = await supabase
      .from("subscriptions")
      .insert({
        stripe_subscription_id: subscription.id,
        user_id: user.id,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        status: subscription.status,
        plan_id: subscription.items.data[0].price.id,
        interval: String(subscription.items.data[0].plan.interval),
      });
  }

  if (event.type === "invoice.payment_succeeded") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    const { error } = await supabase
      .from("subscriptions")
      .update({
        plan_id: subscription.items.data[0].price.id,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        status: subscription.status,
      })
      .eq("stripe_subscription_id", subscription.id);
  }

  return new Response(null, { status: 200 });
}
