export default function Skeleton() {
  return (
    <div className="flex flex-row gap-6 flex-wrap">
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className="flex flex-col ring-1 ring-foreground/10 gap-3 pt-4 pr-4 pb-4 pl-4 w-80 rounded-xl"
        >
          <div className="flex flex-col gap-1.5 items-start w-full">
            <div className="bg-zinc-300 animate-pulse [animation-duration:1.5s] w-10 h-6 rounded" />
            <div className="flex flex-col gap-2">
              <div className="bg-zinc-300 animate-pulse [animation-duration:1.5s] w-[267px] h-3.5 rounded" />
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-col gap-2">
              <div className="bg-zinc-300 animate-pulse [animation-duration:1.5s] w-[100px] h-4 rounded" />
              <div className="bg-zinc-300 animate-pulse [animation-duration:1.5s] w-[100px] h-4 rounded" />
              <div className="bg-zinc-300 animate-pulse [animation-duration:1.5s] w-[100px] h-4 rounded" />
            </div>
          </div>
          <div className="flex flex-row gap-2 w-full">
            <div className="bg-zinc-300 animate-pulse [animation-duration:1.5s] w-[100px] h-10 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
