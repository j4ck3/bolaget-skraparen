import './styles/globals.css'
import './styles/main.css'
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>Lagerstatus i butiker nära dig</title>
        <script src="https://kit.fontawesome.com/acc20ec783.js" crossOrigin="anonymous"></script>
        <link rel="stylesheet" href="./styles/main.css" />
      </head>
      <body>{children}</body>
    </html>
  )
}
