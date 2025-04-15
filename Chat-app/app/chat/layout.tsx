
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-blue-200 p-10">{children}</div>
  )
}
