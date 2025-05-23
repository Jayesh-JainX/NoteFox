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
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { RichTextEditor } from "@/app/components/Editor";

let desc = "";

async function getData({ userId, noteId }: { userId: string; noteId: string }) {
  noStore();
  const data = await prisma.note.findUnique({
    where: {
      id: noteId,
      userId: userId,
    },
    select: {
      title: true,
      description: true,
      id: true,
    },
  });

  return data;
}

export default async function DynamicRoute({
  params,
}: {
  params: { id: string };
}) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const data = await getData({ userId: user?.id as string, noteId: params.id });
  desc = data?.description ?? "";

  async function postData(formData: FormData) {
    "use server";

    if (!user) throw new Error("you are not allowed");

    const title = formData.get("title") as string;

    await prisma.note.update({
      where: {
        id: data?.id,
        userId: user.id,
      },
      data: {
        description: desc,
        title: title,
      },
    });

    revalidatePath("/dashboard");

    return redirect("/dashboard");
  }

  async function handleDescriptionUpdate(description: string) {
    "use server";
    desc = description;
  }

  return (
    <div className="pt-[10vh]">
      <Card>
        <form action={postData}>
          <CardHeader>
            <CardTitle>Edit Note</CardTitle>
            <CardDescription>Edit your notes here.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-y-5">
            <div className="gap-y-2 flex flex-col">
              <Label>Title</Label>
              <Input
                required
                type="text"
                name="title"
                placeholder="Title for your note"
                defaultValue={data?.title}
              />
            </div>

            <div className="flex flex-col gap-y-2">
              <Label>Description</Label>
              {/* <Textarea
                name="description"
                placeholder="Describe your note as you want"
                required
                defaultValue={data?.description}
                className="w-full h-[32vh] p-4"
              /> */}
              <RichTextEditor
                content={data?.description ?? ""}
                setDescription={handleDescriptionUpdate}
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
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
