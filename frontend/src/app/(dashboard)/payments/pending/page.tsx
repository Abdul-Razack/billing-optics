import { redirect } from "next/navigation";

export default function PendingPaymentsPage() {
  redirect("/invoices?paymentStatus=UNPAID");
}
