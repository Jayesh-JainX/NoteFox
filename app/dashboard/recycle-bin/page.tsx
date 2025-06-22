import { Button } from "@/components/ui/button";
import Link from "next/link";
import supabase from "../../lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { RotateCcw, Trash2, Pin, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import CollapsibleDescription from "../../components/CollapsibleDescription";

async function getRecycleBinData(userId: string) {
  try {
    noStore();

    if (!userId) {
      console.error("No user ID provided");
      return null;
    }

    // Get user's deleted notes from recycle bin
    const { data: deletedNotes, error: notesError } = await supabase
      .from("recycle_bin")
      .select("*")
      .eq("user_id", userId)
      .order("deleted_at", { ascending: false });

    if (notesError) {
      console.error("Error fetching recycle bin notes:", notesError);
      return null;
    }

    return deletedNotes || [];
  } catch (error) {
    console.error("Error in getRecycleBinData function:", error);
    return null;
  }
}

// Server actions
async function restoreNote(formData: FormData) {
  "use server";

  try {
    const noteId = formData.get("noteId") as string;

    if (!noteId) {
      console.error("No note ID provided for restoration");
      return;
    }

    // Get the note data from recycle bin
    const { data: deletedNote, error: fetchError } = await supabase
      .from("recycle_bin")
      .select("*")
      .eq("id", noteId)
      .single();

    if (fetchError || !deletedNote) {
      console.error("Error fetching deleted note:", fetchError);
      return;
    }

    // Insert back into notes table
    const { error: insertError } = await supabase.from("notes").insert([
      {
        id: deletedNote.original_note_id,
        title: deletedNote.title,
        description: deletedNote.description,
        created_at: deletedNote.created_at,
        updated_at: new Date().toISOString(),
        user_id: deletedNote.user_id,
        pinned: deletedNote.pinned,
      },
    ]);

    if (insertError) {
      console.error("Error restoring note:", insertError);
      return;
    }

    // Remove from recycle bin
    const { error: deleteError } = await supabase
      .from("recycle_bin")
      .delete()
      .eq("id", noteId);

    if (deleteError) {
      console.error("Error removing from recycle bin:", deleteError);
      // If removal fails, delete the restored note to maintain consistency
      await supabase
        .from("notes")
        .delete()
        .eq("id", deletedNote.original_note_id);
      return;
    }

    console.log("Note restored successfully");
    revalidatePath("/dashboard/recycle-bin");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Error in restoreNote function:", error);
  }
}

async function permanentlyDeleteNote(formData: FormData) {
  "use server";

  try {
    const noteId = formData.get("noteId") as string;

    if (!noteId) {
      console.error("No note ID provided for permanent deletion");
      return;
    }

    // Delete from recycle bin permanently
    const { error } = await supabase
      .from("recycle_bin")
      .delete()
      .eq("id", noteId);

    if (error) {
      console.error("Error permanently deleting note:", error);
      return;
    }

    console.log("Note permanently deleted successfully");
    revalidatePath("/dashboard/recycle-bin");
  } catch (error) {
    console.error("Error in permanentlyDeleteNote function:", error);
  }
}

async function emptyRecycleBin(formData: FormData) {
  "use server";

  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    // Delete all items from recycle bin for this user
    const { error } = await supabase
      .from("recycle_bin")
      .delete()
      .eq("user_id", user?.id);

    if (error) {
      console.error("Error emptying recycle bin:", error);
      return;
    }

    console.log("Recycle bin emptied successfully");
    revalidatePath("/dashboard/recycle-bin");
  } catch (error) {
    console.error("Error in emptyRecycleBin function:", error);
  }
}

export default async function RecycleBinPage() {
  // Get user session first
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    console.log("No user found in recycle bin, redirecting");
    return redirect("/");
  }

  try {
    const deletedNotes = await getRecycleBinData(user.id);

    // Show loading state if data is still being fetched
    if (deletedNotes === null) {
      return (
        <div className="grid gap-y-8 pt-[10vh] pb-[10vh]">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">
                Loading recycle bin...
              </p>
            </div>
          </div>
        </div>
      );
    }

    const deletedNotesCount = deletedNotes.length;

    return (
      <div className="grid gap-y-8 pt-[10vh] pb-[10vh]">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 space-y-4 sm:space-y-0">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl flex items-center gap-3">
              <Trash2 className="w-8 h-8" />
              Recycle Bin
            </h1>
            <p className="text-md sm:text-lg text-muted-foreground">
              Restore or permanently delete your notes. ({deletedNotesCount}{" "}
              items)
            </p>
          </div>

          {deletedNotesCount > 0 && (
            <div className="flex gap-2">
              <form action={emptyRecycleBin}>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Empty Recycle Bin
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Auto-deletion warning */}
        {deletedNotesCount > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Automatic Cleanup Notice
                </h3>
                <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                  <p>
                    Items in the recycle bin are automatically deleted after 30
                    days. Restore important notes before they&apos;re
                    permanently removed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {deletedNotesCount === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Trash2 className="w-10 h-10 text-muted-foreground" />
            </div>

            <h2 className="mt-6 text-xl font-semibold">
              Your recycle bin is empty
            </h2>
            <p className="mb-8 mt-2 text-center text-sm leading-6 text-muted-foreground max-w-sm mx-auto">
              Deleted notes will appear here. You can restore them within 30
              days before they&apos;re permanently deleted.
            </p>

            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        ) : (
          /* Notes List */
          <div className="flex flex-col gap-y-6">
            {deletedNotes.map((item) => {
              const deletedDate = new Date(item.deleted_at);
              const daysSinceDeleted = Math.floor(
                (Date.now() - deletedDate.getTime()) / (1000 * 60 * 60 * 24)
              );
              const daysRemaining = 30 - daysSinceDeleted;

              return (
                <Card
                  key={item.id}
                  className="p-6 transition-all hover:shadow-md bg-destructive/5 dark:bg-destructive/10 border-destructive/20 dark:border-destructive/30 hover:bg-destructive/10 dark:hover:bg-destructive/15"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Content Section */}
                    <div className="flex-1 space-y-4">
                      {/* Header with title and pin */}
                      <div className="flex items-start gap-3">
                        {item.pinned && (
                          <Pin className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <h2 className="font-semibold text-xl text-foreground mb-3">
                            {item.title}
                          </h2>

                          {/* Metadata Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div className="flex flex-col space-y-1">
                              <span className="font-medium text-foreground/70">
                                Created:
                              </span>
                              <span>
                                {new Intl.DateTimeFormat("en-US", {
                                  dateStyle: "medium",
                                }).format(new Date(item.created_at))}
                              </span>
                            </div>

                            <div className="flex flex-col space-y-1">
                              <span className="font-medium text-foreground/70">
                                Deleted:
                              </span>
                              <span>
                                {new Intl.DateTimeFormat("en-US", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                }).format(deletedDate)}
                              </span>
                            </div>
                          </div>

                          {/* Days remaining warning */}
                          <div className="mt-3">
                            <p
                              className={`text-sm font-medium px-3 py-2 rounded-lg inline-block ${
                                daysRemaining <= 7
                                  ? "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                                  : "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                              }`}
                            >
                              {daysRemaining > 0
                                ? `${daysRemaining} days until permanent deletion`
                                : "Will be permanently deleted soon"}
                            </p>
                          </div>

                          {/* Collapsible Description */}
                          {item.description && (
                            <div className="mt-4">
                              <CollapsibleDescription
                                description={item.description}
                                title={item.title}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons Section */}
                    <div className="flex flex-col gap-3 ml-4 min-w-[80px]">
                      {/* Restore Button */}
                      <form action={restoreNote}>
                        <input type="hidden" name="noteId" value={item.id} />
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full hover:bg-green-50 dark:hover:bg-green-950/20 hover:border-green-300 dark:hover:border-green-700 flex items-center justify-center gap-2"
                          aria-label="Restore note"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span className="hidden sm:inline">Restore</span>
                        </Button>
                      </form>

                      {/* Delete Permanently Button */}
                      <form action={permanentlyDeleteNote}>
                        <input type="hidden" name="noteId" value={item.id} />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full flex items-center justify-center gap-2"
                          aria-label="Delete permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </form>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error in RecycleBinPage:", error);
    return (
      <div className="grid gap-y-8 pt-[10vh] pb-[10vh]">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">
              Something went wrong
            </h2>
            <p className="mt-2 text-muted-foreground">
              Please try refreshing the page.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/recycle-bin">Refresh</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
