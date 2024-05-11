import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import prisma from "@/app/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { Label } from "@/components/ui/label";

async function fetchNoteData({
  userId,
  noteId,
}: {
  userId: string;
  noteId: string;
}) {
  noStore();
  // Retrieve the note data for the specified user and note ID
  const noteData = await prisma.note.findUnique({
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

  return noteData;
}

export default async function DynamicRoute({
  params,
}: {
  params: { id: string };
}) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const data = await fetchNoteData({
    userId: user?.id as string,
    noteId: params.id,
  });

  return (
    <div className="pt-[10vh]">
      <Card>
        <CardHeader>
          <CardTitle>Note Details</CardTitle>
          <CardDescription>Review the details of your note</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-y-5">
          <div className="gap-y-2 flex flex-col">
            <span>
              <Label className="font-bold">Title: </Label>
              {data?.title}{" "}
            </span>
          </div>

          <div className="gap-y-2 flex flex-col">
            <Label className="font-bold">Description:</Label>
            <p>{data?.description}</p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button asChild variant="secondary">
            <Link href="/dashboard">&larr; Back</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
