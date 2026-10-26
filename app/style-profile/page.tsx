"use client";

import { StyleProfileForm } from "@/components/style-profile/style-profile-form";
import { DraftTool } from "@/components/style-profile/draft-tool";

export default function StyleProfilePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-5">
      <DraftTool />
      <StyleProfileForm />
    </div>
  );
}
