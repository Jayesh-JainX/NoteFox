import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

export default async function ShowNoteRoute() {
  noStore();
  return redirect("/dashboard");
}
