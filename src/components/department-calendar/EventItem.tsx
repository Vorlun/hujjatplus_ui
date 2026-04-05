import { forwardRef, useEffect, useState } from "react";
import * as HoverCard from "@radix-ui/react-hover-card";
import * as Popover from "@radix-ui/react-popover";
import clsx from "clsx";
import type { CalendarRequestEvent } from "./types";
import { eventTone, priorityBadgeClass } from "./priorityStyles";
import { EventDetailsPanel } from "./EventDetailsPanel";

interface EventItemProps {
  event: CalendarRequestEvent;
  compact?: boolean;
  className?: string;
}

function usePrefersCoarsePointer() {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const sync = () => setCoarse(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return coarse;
}

const pillBase =
  "group w-full min-w-0 cursor-pointer text-left rounded-full border px-2 py-0.5 text-xs font-medium leading-tight shadow-sm outline-none transition-all duration-150 ease-out hover:scale-105 hover:shadow-md active:scale-100 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-1";

const EventPill = forwardRef<
  HTMLButtonElement,
  { event: CalendarRequestEvent; compact: boolean; className?: string }
>(function EventPill({ event, compact, className }, ref) {
  const tone = eventTone(event);
  const badge = priorityBadgeClass(tone);

  return (
    <button ref={ref} type="button" className={clsx(pillBase, badge, className)}>
      <span className="flex min-w-0 items-center gap-1">
        <span className="shrink-0 truncate font-mono text-[11px] tabular-nums opacity-90">{event.id}</span>
        {!compact && <span className="min-w-0 flex-1 truncate">{event.title}</span>}
      </span>
      {compact && <span className="block min-w-0 truncate font-normal">{event.title}</span>}
    </button>
  );
});

const panelChrome =
  "z-50 w-[min(18rem,calc(100vw-1.5rem))] rounded-lg border border-slate-200/90 bg-white p-3 text-xs shadow-lg shadow-slate-200/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1";

/**
 * Desktop: HoverCard on hover. Touch / coarse pointer: Popover on tap (after mount to match SSR).
 */
export function EventItem({ event, compact = true, className }: EventItemProps) {
  const [hydrated, setHydrated] = useState(false);
  const coarse = usePrefersCoarsePointer();

  useEffect(() => {
    setHydrated(true);
  }, []);

  const usePopover = hydrated && coarse;

  if (usePopover) {
    return (
      <Popover.Root>
        <Popover.Trigger asChild>
          <EventPill event={event} compact={compact} className={className} />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content side="top" sideOffset={8} align="start" className={panelChrome}>
            <EventDetailsPanel event={event} />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  }

  return (
    <HoverCard.Root openDelay={150} closeDelay={100}>
      <HoverCard.Trigger asChild>
        <EventPill event={event} compact={compact} className={className} />
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content side="top" align="start" sideOffset={8} className={panelChrome}>
          <EventDetailsPanel event={event} />
          <HoverCard.Arrow className="fill-white drop-shadow-[0_1px_0_rgba(15,23,42,0.06)]" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}
