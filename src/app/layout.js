import "./globals.css";
import Providers from "@/components/Providers";

export const metadata = {
  title: "Mini Project Manager",
  description: "Manage projects and tasks",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
