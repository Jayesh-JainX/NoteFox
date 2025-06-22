import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import supabase from "@/app/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { getStripeSession, stripe } from "@/app/lib/stripe";
import { redirect } from "next/navigation";
import {
  StripePortal,
  StripeSubscriptionCreationButton,
} from "@/app/components/Submitbuttons";
import { unstable_noStore as noStore } from "next/cache";

const featureItems = [
  { name: "Unlimited Notes" },
  { name: "Priority Customer Support" },
  { name: "Ad-Free Experience" },
  { name: "Additional Features" },
];

async function getData(userId: string) {
  noStore();
  // Get subscription data
  const { data: subscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", userId)
    .single();

  // Get user's stripe customer ID
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", userId)
    .single();

  if (subscriptionError || userError) {
    console.error("Error fetching data:", subscriptionError || userError);
    return null;
  }

  return {
    status: subscription?.status,
    user: {
      stripeCustomerId: user?.stripe_customer_id,
    },
  };
}

export default async function BillingPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const data = await getData(user?.id as string);

  async function createSubscription() {
    "use server";

    const { data: dbUser, error } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("id", user?.id)
      .single();

    if (!dbUser?.stripe_customer_id) {
      throw new Error("Unable to get customer id");
    }

    const subscriptionUrl = await getStripeSession({
      customerId: dbUser.stripe_customer_id,
      domainUrl:
        process.env.NODE_ENV == "production"
          ? (process.env.PRODUCTION_URL as string)
          : "http://localhost:3000",
      priceId: process.env.PRICE_ID as string,
    });

    return redirect(subscriptionUrl);
  }

  async function createCustomerPortal() {
    "use server";
    const session = await stripe.billingPortal.sessions.create({
      customer: data?.user.stripeCustomerId as string,
      return_url:
        process.env.NODE_ENV === "production"
          ? (process.env.PRODUCTION_URL as string)
          : "http://localhost:3000/dashboard",
    });

    return redirect(session.url);
  }

  if (data?.status === "active") {
    return (
      <div className="grid items-start gap-8 ">
        <div className="flex items-center justify-between px-2">
          <div className="grid gap-1">
            <h1 className="text-3xl md:text-4xl ">Subscription</h1>
            <p className="text-lg text-muted-foreground">
              Settings regarding your subscription
            </p>
          </div>
        </div>

        <Card className="w-full lg:w-2/3">
          <CardHeader>
            <CardTitle>Edit Subscription</CardTitle>
            <CardDescription>
              Click on the button below, this will give you the opportunity to
              change your payment details and view your statement at the same
              time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createCustomerPortal}>
              <StripePortal />
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-4 pt-[10vh]">
      <Card className="flex flex-col">
        <CardContent className="py-8">
          <div>
            <h3 className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-primary/10 text-primary">
              Monthly
            </h3>
          </div>

          <div className="mt-4 flex items-baseline text-6xl font-extrabold">
            $30 <span className="ml-1 text-2xl text-muted-foreground">/mo</span>
          </div>
          <p className="mt-5 text-lg text-muted-foreground">
            Write as many notes as you want for $30 a Month
          </p>
        </CardContent>
        <div className="flex-1 flex flex-col justify-between px-6 pt-6 pb-8 bg-secondary rounded-lg m-1 space-y-6 sm:p-10 sm:pt-6">
          <ul className="space-y-4">
            {featureItems.map((item, index) => (
              <li key={index} className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <p className="ml-3 text-base">{item.name}</p>
              </li>
            ))}
          </ul>

          <form className="w-full" action={createSubscription}>
            <StripeSubscriptionCreationButton />
          </form>
        </div>
      </Card>
    </div>
  );
}
