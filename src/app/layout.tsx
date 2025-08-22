import "./globals.css";

export const metadata = { title: "Matrika" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 ">
        <div className="">{children}</div>
      </body>
    </html>
  );
}
