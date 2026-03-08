import type { Metadata } from "next";
import "./globals.css";
import Provider from "@/Provider";
import StoreProvider from "@/redux/StoreProvider";
import InitUser from "@/InitUser";

export const metadata: Metadata = {
  title: "Item7 Go",
  description:
    "Item7 Go brings your favorite restaurants to your doorstep with fast delivery, easy ordering, and secure payments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="w-full min-h-screen bg-linear-to-b from-green-50 to-white">
        <Provider>
          <StoreProvider>
            <InitUser />
            {children}
          </StoreProvider>
        </Provider>
      </body>
    </html>
  );
}
