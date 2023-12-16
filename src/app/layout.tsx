import React from 'react'
import '../styles/globals.css'
import '../styles/main.css'
import { Montserrat } from 'next/font/google'
const mont = Montserrat({ subsets: ['latin'] })

export default function RootLayout({
	children
}: {
	children: React.ReactNode
}) {
	return (
		<>
			<html lang='sv' className='h-screen'>
				<head>
					<title>Lagerstatus i butiker nära dig</title>
					<script
						src='https://kit.fontawesome.com/acc20ec783.js'
						crossOrigin='anonymous'
						async
					></script>
					<link rel='icon' href='./icon.png' type='image/png' />
					<link
						rel='apple-touch-icon'
						href='./icon.png'
						type='image/png'
					/>
				</head>
				<body className={mont.className}>{children}</body>
			</html>
		</>
	)
}
