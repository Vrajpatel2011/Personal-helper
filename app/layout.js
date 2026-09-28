import "./globals.css"

export const metadata = {
  title: {
    default: "Personal Helper",
    template: "%s · Personal Helper",
  },
  description: "A private personal helper.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
