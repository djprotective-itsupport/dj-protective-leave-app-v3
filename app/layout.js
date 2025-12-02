import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: `${process.env.NEXT_PUBLIC_COMPANY_NAME} - Leave Planner`,
  description: 'Leave & timetable system',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-primary text-white p-6 shadow-md">
          <h1 className="text-2xl font-bold">{process.env.NEXT_PUBLIC_COMPANY_NAME}</h1>
          <p className="text-sm opacity-90">Leave & Timetable System</p>
        </header>
        <main className="min-h-screen bg-gray-50">{children}</main>
      </body>
    </html>
  )
}
