import { Suspense } from "react";
import NpsSurveyForm from "@/features/nps/components/NpsSurveyForm";

export default function NpsPage() {
  return (
    <div className="flex flex-1 flex-col bg-white font-sans text-[#151515]">
      <div className="mx-auto w-full max-w-[720px] px-6 py-10 sm:py-12">
        <Suspense
          fallback={
            <div className="rounded-3xl border border-[#e6e6e6] bg-white p-8 text-sm text-[#666]">
              Loading quest…
            </div>
          }
        >
          <NpsSurveyForm />
        </Suspense>
      </div>
    </div>
  );
}
