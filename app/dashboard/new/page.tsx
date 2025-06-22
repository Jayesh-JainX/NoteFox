import { SubmitButton } from "@/app/components/Submitbuttons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import supabase from "@/app/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { RichTextEditor } from "@/app/components/Editor";

let desc: string | null = null;

async function getData({ userId }: { userId: string }) {
  noStore();

  // Get subscription status
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", userId)
    .single();

  // Get notes count
  const { count: notesCount } = await supabase
    .from("notes")
    .select("id", { count: "exact" })
    .eq("user_id", userId);

  return {
    SubscriptionStatus: subscription?.status,
    NotesCount: notesCount || 0,
  };
}

export default async function NewNoteRoute() {
  noStore();
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const data = await getData({ userId: user?.id as string });

  if (
    data?.SubscriptionStatus !== "active" &&
    data?.NotesCount &&
    data?.NotesCount > 9
  ) {
    return redirect("/dashboard/billing");
  }

  async function handleDescriptionUpdate(description: string) {
    "use server";
    desc = description;
  }

  async function postData(formData: FormData) {
    "use server";

    try {
      if (!user) {
        throw new Error("Not authorized");
      }

      const title = formData.get("title") as string;

      if (!title) {
        throw new Error("Title is required");
      }

      if (!desc) {
        throw new Error("Description is required");
      }

      // Generate a UUID for the id field
      const { data: insertData, error } = await supabase
        .from("notes")
        .insert({
          id: crypto.randomUUID(), // Add this line to generate a UUID
          user_id: user?.id,
          description: desc,
          title: title,
          created_at: new Date().toISOString(), // Add timestamp if needed
        })
        .select();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Failed to create note: ${error.message}`);
      }

      // Reset the description after successful insert
      desc = null;

      return redirect("/dashboard");
    } catch (error) {
      console.error("Error creating note:", error);
      throw error;
    }
  }

  return (
    <div className="pt-[10vh]">
      <Card>
        <form action={postData}>
          <CardHeader>
            <CardTitle>New Note</CardTitle>
            <CardDescription>Create your new note here</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                required
                type="text"
                name="title"
                id="title"
                placeholder="Title for your note"
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-y-2">
              <Label htmlFor="description">Description</Label>
              <RichTextEditor
                content=""
                setDescription={handleDescriptionUpdate}
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between space-x-4">
            <Button asChild variant="destructive">
              <Link href="/dashboard">Cancel</Link>
            </Button>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
