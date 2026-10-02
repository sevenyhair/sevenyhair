import type { Metadata } from "next";
import ReviewsEditor from "@/components/admin/editors/ReviewsEditor";
import { getTestimonials } from "@/lib/queries";

export const metadata: Metadata = { title: "후기" };

export default async function ReviewsAdminPage() {
  return <ReviewsEditor initial={await getTestimonials()} />;
}
