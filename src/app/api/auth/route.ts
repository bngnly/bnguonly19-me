import { signIn } from "@/auth";

export async function GET() {
  return signIn("credentials");
}
