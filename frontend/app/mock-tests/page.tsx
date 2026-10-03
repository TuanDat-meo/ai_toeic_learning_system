import { redirect } from "next/navigation";

export default function MockTestsRedirect() {
  redirect("/admin/content/mock-tests");
}
