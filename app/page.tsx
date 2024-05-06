import { Button } from "@/components/ui/button";
import { RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { isAuthenticated } = getKindeServerSession();

  if (await isAuthenticated()) {
    return redirect("/dashboard");
  }
  return (
    <div>
      <section className="flex items-center justify-center bg-background h-[80vh]">
        <div className="relative w-full px-5 py-12 mx-auto max-w-7xl lg:px-16 md:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <div>
              <span className="w-auto px-6 py-3 rounded-full bg-secondary">
                <span className="text-sm font-medium text-primary">
                  Sort Your Notes Easily
                </span>
              </span>
              <h1 className="mt-8 text-3xl font-extrabold tracking-tight lg:text-6xl">
                Create Notes with Ease
              </h1>
              <p className="max-w-xl mx-auto mt-8 text-base text-secondary-foreground lg:text-xl">
                Effortlessly create and organize notes to maintain clarity in
                your thoughts and track ideas for improved productivity.
              </p>
            </div>
            <div className="flex justify-center max-w-sm mx-auto mt-10">
              <RegisterLink className="w-full">
                <Button size="lg" className="w-full">
                  Sign Up for Free
                </Button>
              </RegisterLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
