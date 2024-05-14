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
import prisma from "@/app/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { RichTextEditor } from "@/app/components/Editor";

let desc: string | null = null;

async function getData({ userId }: { userId: string }) {
  noStore();

  const data = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      Subscription: {
        select: {
          status: true,
        },
      },
      Notes: {
        select: {
          id: true,
        },
      },
    },
  });

  return {
    SubscriptionStatus: data?.Subscription?.status,
    NotesCount: data?.Notes.length,
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

    if (!user) {
      throw new Error("Not authorized");
    }

    const title = formData.get("title") as string;

    if (!title) {
      return;
    }

    if (!desc || desc == null) {
      return;
    }

    await prisma.note.create({
      data: {
        userId: user?.id,
        description: desc ?? "",
        title: title,
      },
    });

    return redirect("/dashboard");
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
              {/* <Textarea
                name="description"
                id="description"
                placeholder="Describe your note"
                required
                className="w-full h-[32vh] p-4"
              /> */}
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
