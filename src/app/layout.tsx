import "./globals.css";
import ClientLayout from "./_components/ClientLayout";

export const metadata = {
  title: "bnguonly19-me",
  description: "What I've Been Up To",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
