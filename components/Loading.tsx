import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="mt-24 flex h-48 items-center justify-center">
      <LoaderCircle className={`h-${10} w-${10} animate-spin text-blue-500 `} />
    </div>
  );
}
