import { Button } from "@/components/ui/button";
import {
  RegisterLink,
  LoginLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { isAuthenticated } = getKindeServerSession();

  if (await isAuthenticated()) {
    return redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Hero Section */}
      <section className="flex items-center justify-center h-screen px-4">
        <div className="relative w-full max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center justify-center">
              <span className="inline-flex items-center px-6 py-3 rounded-full bg-secondary/80 backdrop-blur-sm border border-secondary-foreground/10 shadow-lg">
                <span className="text-sm font-semibold text-primary">
                  ✨ Sort Your Notes Easily
                </span>
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-7xl">
              Create Notes with{" "}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Ease
              </span>
            </h1>

            {/* Description */}
            <p className="max-w-2xl mx-auto mt-6 text-lg text-muted-foreground lg:text-xl leading-relaxed">
              Effortlessly create and organize notes to maintain clarity in your
              thoughts and track ideas for improved productivity.
              <span className="block mt-2 font-medium text-foreground">
                Start your journey to better organization today.
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto mt-10">
              <RegisterLink className="flex-1">
                <Button
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Sign Up for Free
                </Button>
              </RegisterLink>

              <LoginLink className="flex-1">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-2 border-primary/20 hover:border-primary/40 text-foreground font-semibold py-3 px-8 rounded-lg hover:bg-secondary/50 transition-all duration-200"
                >
                  Login
                </Button>
              </LoginLink>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Get started with zero commitment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Secure & private</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose Our Note-Taking App?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover the features that make organizing your thoughts
              effortless and enjoyable.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-background/50 backdrop-blur-sm border border-border shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Creation</h3>
              <p className="text-muted-foreground">
                Create notes instantly with our intuitive interface
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-background/50 backdrop-blur-sm border border-border shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🗂️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Organization</h3>
              <p className="text-muted-foreground">
                Automatically categorize and sort your notes
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-background/50 backdrop-blur-sm border border-border shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Quick Search</h3>
              <p className="text-muted-foreground">
                Find any note instantly with powerful search
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
