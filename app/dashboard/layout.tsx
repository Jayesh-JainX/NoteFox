import { ReactNode } from "react";
import { DashboardNav } from "../components/DashboardNav";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import supabase from "../lib/db";
import { stripe } from "../lib/stripe";

async function getData({
  email,
  id,
  firstName,
  lastName,
  profileImage,
}: {
  email: string;
  id: string;
  firstName: string | undefined | null;
  lastName: string | undefined | null;
  profileImage: string | undefined | null;
}) {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, stripe_customer_id")
      .eq("id", id)
      .single();

    if (!user || error) {
      const name = `${firstName ?? ""} ${lastName ?? ""}`.trim();

      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert([
          {
            id: id,
            email: email,
            name: name,
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error("Error creating user:", createError);
        throw new Error("Failed to create user");
      }

      // Create Stripe customer for new user
      const stripeCustomer = await stripe.customers.create({
        email: email,
        name: name,
      });

      const { error: updateError } = await supabase
        .from("users")
        .update({ stripe_customer_id: stripeCustomer.id })
        .eq("id", id);

      if (updateError) {
        console.error("Error updating user with Stripe ID:", updateError);
      }

      return newUser;
    }

    // If user exists but doesn't have Stripe customer ID
    if (!user.stripe_customer_id) {
      const name = `${firstName ?? ""} ${lastName ?? ""}`.trim();

      const stripeCustomer = await stripe.customers.create({
        email: email,
        name: name,
      });

      const { error: updateError } = await supabase
        .from("users")
        .update({ stripe_customer_id: stripeCustomer.id })
        .eq("id", id);

      if (updateError) {
        console.error("Error updating user with Stripe ID:", updateError);
      }
    }

    return user;
  } catch (error) {
    console.error("Error in getData function:", error);
    throw error;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
      return redirect("/");
    }

    await getData({
      email: user.email as string,
      firstName: user.given_name,
      id: user.id,
      lastName: user.family_name,
      profileImage: user.picture,
    });

    return (
      <div className="flex flex-col space-y-6 mt-10">
        <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
          <aside className="hidden w-[200px] flex-col md:flex">
            <DashboardNav />
          </aside>
          <main>{children}</main>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in DashboardLayout:", error);
    return redirect("/");
  }
}
