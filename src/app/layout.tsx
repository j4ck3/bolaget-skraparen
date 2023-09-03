import React from 'react'
import './styles/globals.css'
import './styles/main.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <head>
        <title>Lagerstatus i butiker nära dig</title>
        <script src="https://kit.fontawesome.com/acc20ec783.js" crossOrigin="anonymous" async></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;900&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="./styles/main.css" />
      </head>
      <body>{children}</body>
    </>
  );
}