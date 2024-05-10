"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Pin, PinOff, Trash } from "lucide-react";
import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ? (
        <Button disabled className="w-fit">
          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
          Please wait...
        </Button>
      ) : (
        <Button className="w-fit" type="submit">
          Save Now
        </Button>
      )}
    </>
  );
}

export function StripeSubscriptionCreationButton() {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ? (
        <Button disabled className="w-full">
          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
          Please wait...
        </Button>
      ) : (
        <Button type="submit" className="w-full">
          Create Subscription
        </Button>
      )}
    </>
  );
}

export function StripePortal() {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ? (
        <Button disabled className="w-fit">
          <Loader2 className="mr-2 w-4 h-4 animate-spin" /> Please Wait
        </Button>
      ) : (
        <Button className="w-fit" type="submit">
          View payment details
        </Button>
      )}
    </>
  );
}

interface PinButtonProps {
  isPinned: boolean;
}

export function PinButton({ isPinned }: PinButtonProps) {
  return (
    <>
      <Button size="icon" type="submit" variant="outline">
        {isPinned ? (
          <PinOff
            style={{
              transform: "rotate(45deg)",
              width: "16px",
              height: "16px",
            }}
          />
        ) : (
          <Pin
            style={{
              transform: "rotate(45deg)",
              width: "16px",
              height: "16px",
            }}
          />
        )}
      </Button>
    </>
  );
}

export function TrashDelete() {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ? (
        <Button variant={"destructive"} size="icon" disabled>
          <Loader2 className="h-4 w-4 animate-spin" />
        </Button>
      ) : (
        <Button variant={"destructive"} size="icon" type="submit">
          <Trash className="h-4 w-4" />
        </Button>
      )}
    </>
  );
}
