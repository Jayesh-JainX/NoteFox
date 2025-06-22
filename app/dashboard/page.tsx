import { Button } from "@/components/ui/button";
import Link from "next/link";
import supabase from "../lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Edit, File, Trash, Pin, PinOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PinButton, TrashDelete } from "../components/Submitbuttons";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";

async function getData(userId: string) {
  try {
    console.log("Fetching data for user ID:", userId);
    noStore();

    if (!userId) {
      console.error("No user ID provided");
      return null;
    }

    // Get user's notes with better error handling
    const { data: notes, error: notesError } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });

    console.log("Notes query result:", { notes, notesError });

    if (notesError) {
      console.error("Error fetching notes:", notesError);
    }

    // Get user's subscription status
    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", userId)
      .maybeSingle(); // Use maybeSingle() instead of single() to handle no results

    console.log("Subscription query result:", {
      subscription,
      subscriptionError,
    });

    if (subscriptionError) {
      console.error("Error fetching subscription:", subscriptionError);
    }

    return {
      Notes: notes || [],
      Subscription: subscription || null,
    };
  } catch (error) {
    console.error("Error in getData function:", error);
    return null;
  }
}

async function deleteNote(formData: FormData) {
  "use server";

  try {
    const noteId = formData.get("noteId") as string;
    console.log("Deleting note with ID:", noteId);

    if (!noteId) {
      console.error("No note ID provided for deletion");
      return;
    }

    const { error } = await supabase.from("notes").delete().eq("id", noteId);

    if (error) {
      console.error("Error deleting note:", error);
      return;
    }

    console.log("Note deleted successfully");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Error in deleteNote function:", error);
  }
}

async function pinNote(formData: FormData) {
  "use server";

  try {
    const noteId = formData.get("noteId") as string;
    console.log("Toggling pin for note ID:", noteId);

    if (!noteId) {
      console.error("No note ID provided for pinning");
      return;
    }

    // Get current pin status
    const { data: currentNote, error: fetchError } = await supabase
      .from("notes")
      .select("pinned")
      .eq("id", noteId)
      .single();

    if (fetchError) {
      console.error("Error fetching current note:", fetchError);
      return;
    }

    const newPinnedStatus = !currentNote?.pinned;
    console.log("Updating pin status to:", newPinnedStatus);

    // Update pin status
    const { error: updateError } = await supabase
      .from("notes")
      .update({ pinned: newPinnedStatus })
      .eq("id", noteId);

    if (updateError) {
      console.error("Error updating pin status:", updateError);
      return;
    }

    console.log("Pin status updated successfully");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Error in pinNote function:", error);
  }
}

export default async function DashboardPage() {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    console.log("Dashboard - Current user:", user);

    if (!user || !user.id) {
      console.log("No user found in dashboard, redirecting");
      return redirect("/");
    }

    console.log("Fetching data for user ID:", user.id);
    const data = await getData(user.id);

    console.log("Dashboard data:", data);

    // Show loading state if data is still being fetched
    if (!data) {
      return (
        <div className="grid gap-y-8 pt-[10vh] pb-[10vh]">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">
                Loading your notes...
              </p>
            </div>
          </div>
        </div>
      );
    }

    const isSubscriptionActive = data.Subscription?.status === "active";
    const notesCount = data.Notes?.length || 0;
    const hasReachedLimit = notesCount >= 10;

    return (
      <div className="grid gap-y-8 pt-[10vh] pb-[10vh]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 space-y-4 sm:space-y-0">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl">Your Notes</h1>
            <p className="text-md sm:text-lg text-muted-foreground">
              Manage and create new notes here. ({notesCount} notes)
            </p>
          </div>

          <div className="sm:ml-4">
            {isSubscriptionActive ? (
              <Button asChild>
                <Link href="/dashboard/new">Create a new Note</Link>
              </Button>
            ) : hasReachedLimit ? (
              <Button asChild>
                <Link href="/dashboard/billing">Upgrade to Create More</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/dashboard/new">Create a new Note</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Free tier limit warning */}
        {!isSubscriptionActive && notesCount >= 8 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Approaching limit
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    You have {notesCount}/10 notes.
                    {hasReachedLimit
                      ? " Upgrade to create unlimited notes."
                      : ` ${10 - notesCount} notes remaining.`}
                  </p>
                </div>
                {hasReachedLimit && (
                  <div className="mt-4">
                    <Button asChild size="sm">
                      <Link href="/dashboard/billing">Upgrade Now</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {notesCount === 0 ? (
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
            {data.Notes.map((item) => (
              <Card
                key={item.id}
                className={`flex items-center justify-between p-4 transition-all hover:shadow-md ${
                  item.pinned ? "ring-2 ring-primary/20 bg-primary/5" : ""
                }`}
              >
                <Link href={`/dashboard/show/${item.id}`} className="flex-1">
                  <div className="flex items-start gap-3">
                    {item.pinned && (
                      <Pin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <h2 className="font-semibold text-xl text-primary hover:text-primary/80 transition-colors">
                        {item.title}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Intl.DateTimeFormat("en-US", {
                          dateStyle: "full",
                          timeStyle: "short",
                        }).format(new Date(item.created_at))}
                      </p>
                    </div>
                  </div>
                </Link>

                <div className="flex gap-x-2 ml-4">
                  <form action={pinNote}>
                    <input type="hidden" name="noteId" value={item.id} />
                    <PinButton isPinned={item.pinned} />
                  </form>

                  <Link href={`/dashboard/new/${item.id}`}>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Edit note"
                    >
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
  } catch (error) {
    console.error("Error in DashboardPage:", error);
    return (
      <div className="grid gap-y-8 pt-[10vh] pb-[10vh]">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600">
              Something went wrong
            </h2>
            <p className="mt-2 text-muted-foreground">
              Please try refreshing the page.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard">Refresh</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
