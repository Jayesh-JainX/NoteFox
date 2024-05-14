import { Button } from "@/components/ui/button";
import Link from "next/link";
import prisma from "../lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Edit, File, Trash } from "lucide-react";
import { Card } from "@/components/ui/card";

import { PinButton, TrashDelete } from "../components/Submitbuttons";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";

async function getData(userId: string) {
  noStore();
  const data = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      Notes: {
        select: {
          title: true,
          id: true,
          description: true,
          createdAt: true,
          pinned: true,
        },
        orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      },

      Subscription: {
        select: {
          status: true,
        },
      },
    },
  });

  return data;
}

export default async function DashboardPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const data = await getData(user?.id as string);

  async function deleteNote(formData: FormData) {
    "use server";

    const noteId = formData.get("noteId") as string;

    await prisma.note.delete({
      where: {
        id: noteId,
      },
    });

    revalidatePath("/dashboard");
  }

  async function pinNote(formData: FormData) {
    "use server";

    const noteId = formData.get("noteId") as string;

    const currentNote = await prisma.note.findUnique({
      where: { id: noteId },
      select: { pinned: true },
    });

    const newPinnedStatus = !currentNote?.pinned;

    await prisma.note.update({
      where: { id: noteId },
      data: { pinned: newPinnedStatus },
    });

    revalidatePath("/dashboard");
  }

  return (
    <div className="grid gap-y-8 pt-[10vh] pb-[10vh]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 space-y-4 sm:space-y-0">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl">Your Notes</h1>
          <p className="text-md sm:text-lg text-muted-foreground">
            Manage and create new notes here.
          </p>
        </div>

        <div className="sm:ml-4">
          {data?.Subscription?.status === "active" ? (
            <Button asChild>
              <Link href="/dashboard/new">Create a new Note</Link>
            </Button>
          ) : data?.Notes?.length === 10 ? (
            <Button asChild>
              <Link href="/dashboard/billing">Create a new Note</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/dashboard/new">Create a new Note</Link>
            </Button>
          )}
        </div>
      </div>

      {!data ||
      data?.Notes === null ||
      data?.Notes?.length === 0 ||
      data?.Notes.length == 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <File className="w-10 h-10 text-primary" />
          </div>

          <h2 className="mt-6 text-xl font-semibold">
            You don&apos;t have any notes created
          </h2>
          <p className="mb-8 mt-2 text-center text-sm leading-6 text-muted-foreground max-w-sm mx-auto">
            You currently don&apos;t have any notes. Please create some to see
            them here.
          </p>

          <Button asChild>
            <Link href="/dashboard/new">Create a new Note</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-y-4">
          {data?.Notes.map((item) => (
            <Card
              key={item.id}
              className="flex items-center justify-between p-4"
            >
              <Link href={`/dashboard/show/${item.id}`} className="w-full">
                <div>
                  <h2 className="font-semibold text-xl text-primary">
                    {item.title}
                  </h2>
                  <p>
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "full",
                    }).format(new Date(item.createdAt))}
                  </p>
                </div>
              </Link>
              <div id="uniqueDiv" className="flex gap-x-4">
                <form action={pinNote}>
                  <input type="hidden" name="noteId" value={item.id} />
                  <PinButton isPinned={item.pinned} />
                </form>
                <Link href={`/dashboard/new/${item.id}`}>
                  <Button variant="outline" size="icon" aria-label="Edit note">
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
                <form action={deleteNote}>
                  <input type="hidden" name="noteId" value={item.id} />
                  <TrashDelete />
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
