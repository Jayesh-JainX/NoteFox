import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  RegisterLink,
  LoginLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { UserNav } from "./UserNav";

export async function Navbar() {
  const { isAuthenticated, getUser } = getKindeServerSession();
  const user = await getUser();
  return (
    <nav className="border-b bg-background h-[10vh] flex items-center fixed top-0 left-0 right-0 z-50">
      <div className="container flex items-center justify-between">
        <Link href="/">
          <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
            Note<span className="text-primary">Fox</span>
          </h1>
        </Link>

        <div className="flex items-center ml-8 gap-2 sm:gap-5">
          <ThemeToggle />

          {(await isAuthenticated()) ? (
            <div className="flex items-center gap-2 sm:gap-5">
              <UserNav
                email={user?.email as string}
                image={user?.picture as string}
                name={user?.given_name as string}
                last_name={user?.family_name as string}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-5">
              <LoginLink>
                <Button variant={"secondary"} className="sm:w-auto">
                  Log In
                </Button>
              </LoginLink>

              <RegisterLink>
                <Button className="sm:w-auto">Sign Up</Button>
              </RegisterLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
