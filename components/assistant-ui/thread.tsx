import {
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from "@assistant-ui/react";
import type { FC } from "react";
import {
  ArrowDownIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  ImageIcon,
  PencilIcon,
  RefreshCwIcon,
  SendHorizontalIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNanoImage } from "@/lib/nano-image";

import { Button } from "@/components/ui/button";
import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { ToolFallback } from "./tool-fallback";

export const Thread: FC = () => {
  return (
    <ThreadPrimitive.Root
      className="bg-background relative box-border flex h-full flex-col overflow-hidden"
      style={{
        ["--thread-max-width" as string]: "42rem",
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="anim-orb bg-mint/20 absolute -left-16 top-24 size-56 rounded-full blur-3xl" />
        <div className="anim-drift bg-sky/20 absolute -right-10 top-1/3 size-64 rounded-full blur-3xl" />
        <div
          className="anim-orb bg-plum/15 absolute bottom-10 left-1/3 size-48 rounded-full blur-3xl"
          style={{ animationDelay: "2s" }}
        />
      </div>
      <ThreadPrimitive.Viewport className="scroll-thin relative flex h-full flex-col items-center overflow-y-scroll scroll-smooth bg-transparent px-4 pt-8">
        <ThreadWelcome />

        <ThreadPrimitive.Messages
          components={{
            UserMessage: UserMessage,
            EditComposer: EditComposer,
            AssistantMessage: AssistantMessage,
          }}
        />

        <ThreadPrimitive.If empty={false}>
          <div className="min-h-8 flex-grow" />
        </ThreadPrimitive.If>

        <div className="sticky bottom-0 mt-3 flex w-full max-w-[var(--thread-max-width)] flex-col items-center justify-end rounded-t-lg pb-4">
          <ThreadScrollToBottom />
          <Composer />
        </div>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
};

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="absolute -top-8 rounded-full disabled:invisible"
      >
        <ArrowDownIcon />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};

const ThreadWelcome: FC = () => {
  return (
    <ThreadPrimitive.Empty>
      <div className="flex w-full max-w-[var(--thread-max-width)] flex-grow flex-col">
        <div className="anim-slideup flex w-full flex-grow flex-col items-center justify-center text-center">
          <div className="anim-floaty bg-mint shadow-pop ring-ink/5 mb-5 flex size-16 items-center justify-center rounded-3xl text-3xl ring-1">
            ✦
          </div>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">What&apos;s on your mind?</h1>
          <p className="text-muted-foreground mt-3 max-w-[42ch] text-pretty text-sm">
            Ask me anything, or tap <span className="bg-ink/5 rounded-md px-1.5 py-0.5 font-semibold">Nano Image</span>{" "}
            and describe a picture to create it.
          </p>
        </div>
        <ThreadWelcomeSuggestions />
      </div>
    </ThreadPrimitive.Empty>
  );
};

const SUGGESTIONS = [
  "Give me 3 ideas for a weekend project",
  "Explain how the internet works, simply",
  "Plan a relaxed 3-day trip to Istanbul",
  "Help me write a friendly follow-up email",
];

const ThreadWelcomeSuggestions: FC = () => {
  return (
    <div className="mt-7 grid w-full gap-2 sm:grid-cols-2">
      {SUGGESTIONS.map((prompt, i) => (
        <ThreadPrimitive.Suggestion
          key={prompt}
          className="anim-slideup press lift bg-paper/90 ring-ink/5 flex flex-col items-start justify-center rounded-2xl px-4 py-3 text-left ring-1 backdrop-blur"
          style={{ animationDelay: `${80 * i}ms` }}
          prompt={prompt}
          method="replace"
          autoSend
        >
          <span className="line-clamp-2 text-ellipsis text-sm font-medium">{prompt}</span>
        </ThreadPrimitive.Suggestion>
      ))}
    </div>
  );
};

const Composer: FC = () => {
  const { nano } = useNanoImage();
  return (
    <ComposerPrimitive.Root className="bg-paper ring-ink/5 focus-within:ring-mint flex w-full flex-wrap items-end rounded-2xl px-2.5 shadow-sm ring-1 transition focus-within:ring-2">
      <ComposerPrimitive.Input
        rows={1}
        autoFocus
        placeholder={nano ? "Describe the image you want…" : "Message Cheap Mind AI…"}
        className="placeholder:text-muted-foreground max-h-40 flex-grow resize-none border-none bg-transparent px-2 py-4 text-sm outline-none focus:ring-0 disabled:cursor-not-allowed"
      />
      <ComposerAction />
    </ComposerPrimitive.Root>
  );
};

const NanoImageButton: FC = () => {
  const { nano, setNano } = useNanoImage();
  return (
    <button
      type="button"
      onClick={() => setNano(!nano)}
      aria-pressed={nano}
      title={nano ? "Nano Image is on: your next message creates a picture" : "Turn on Nano Image to create a picture"}
      className={`press my-2.5 mr-1 inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold ring-1 transition-colors ${
        nano
          ? "bg-mint text-ink ring-gold-deep/40"
          : "bg-paper text-ink/70 ring-ink/10 hover:text-ink"
      }`}
    >
      <ImageIcon className="size-4" />
      Nano Image
    </button>
  );
};

const ComposerAction: FC = () => {
  return (
    <>
      <NanoImageButton />
      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send asChild>
          <TooltipIconButton
            tooltip="Send"
            variant="default"
            className="press lift my-2.5 size-9 rounded-xl p-2 transition-opacity ease-in"
          >
            <SendHorizontalIcon />
          </TooltipIconButton>
        </ComposerPrimitive.Send>
      </ThreadPrimitive.If>
      <ThreadPrimitive.If running>
        <ComposerPrimitive.Cancel asChild>
          <TooltipIconButton
            tooltip="Cancel"
            variant="default"
            className="press lift my-2.5 size-9 rounded-xl p-2 transition-opacity ease-in"
          >
            <CircleStopIcon />
          </TooltipIconButton>
        </ComposerPrimitive.Cancel>
      </ThreadPrimitive.If>
    </>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="grid auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] gap-y-2 [&:where(>*)]:col-start-2 w-full max-w-[var(--thread-max-width)] py-4">
      <UserActionBar />

      <div className="anim-slideup bg-sky/25 ring-ink/5 text-foreground max-w-[calc(var(--thread-max-width)*0.8)] break-words rounded-3xl rounded-br-lg px-5 py-2.5 ring-1 col-start-2 row-start-2">
        <MessagePrimitive.Content />
      </div>

      <BranchPicker className="col-span-full col-start-1 row-start-3 -mr-1 justify-end" />
    </MessagePrimitive.Root>
  );
};

const UserActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="flex flex-col items-end col-start-1 row-start-2 mr-3 mt-2.5"
    >
      <ActionBarPrimitive.Edit asChild>
        <TooltipIconButton tooltip="Edit">
          <PencilIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  );
};

const EditComposer: FC = () => {
  return (
    <ComposerPrimitive.Root className="bg-paper ring-ink/5 my-4 flex w-full max-w-[var(--thread-max-width)] flex-col gap-2 rounded-2xl ring-1">
      <ComposerPrimitive.Input className="text-foreground flex h-8 w-full resize-none bg-transparent p-4 pb-0 outline-none" />

      <div className="mx-3 mb-3 flex items-center justify-center gap-2 self-end">
        <ComposerPrimitive.Cancel asChild>
          <Button variant="ghost">Cancel</Button>
        </ComposerPrimitive.Cancel>
        <ComposerPrimitive.Send asChild>
          <Button>Send</Button>
        </ComposerPrimitive.Send>
      </div>
    </ComposerPrimitive.Root>
  );
};

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="grid grid-cols-[auto_auto_1fr] grid-rows-[auto_1fr] relative w-full max-w-[var(--thread-max-width)] py-4">
      <div className="anim-slideup bg-paper shadow-pop-sm ring-ink/5 text-foreground max-w-[calc(var(--thread-max-width)*0.85)] break-words rounded-3xl rounded-bl-lg px-5 py-3 text-sm leading-7 ring-1 col-span-2 col-start-2 row-start-1 my-1.5">
        <MessagePrimitive.Content
          components={{ Text: MarkdownText, tools: { Fallback: ToolFallback } }}
        />
      </div>

      <AssistantActionBar />

      <BranchPicker className="col-start-2 row-start-2 -ml-2 mr-2" />
    </MessagePrimitive.Root>
  );
};

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      autohideFloat="single-branch"
      className="text-muted-foreground flex gap-1 col-start-3 row-start-2 -ml-1 data-[floating]:bg-paper data-[floating]:absolute data-[floating]:rounded-xl data-[floating]:ring-1 data-[floating]:ring-ink/5 data-[floating]:p-1 data-[floating]:shadow-sm"
    >
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip="Copy">
          <MessagePrimitive.If copied>
            <CheckIcon />
          </MessagePrimitive.If>
          <MessagePrimitive.If copied={false}>
            <CopyIcon />
          </MessagePrimitive.If>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton tooltip="Refresh">
          <RefreshCwIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
    </ActionBarPrimitive.Root>
  );
};

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({
  className,
  ...rest
}) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn(
        "text-muted-foreground inline-flex items-center text-xs",
        className
      )}
      {...rest}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Previous">
          <ChevronLeftIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className="font-medium">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next">
          <ChevronRightIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
};

const CircleStopIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      width="16"
      height="16"
    >
      <rect width="10" height="10" x="3" y="3" rx="2" />
    </svg>
  );
};
