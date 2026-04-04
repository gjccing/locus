
export default function WorkstationLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="fixed top-16 left-0 w-dvw h-[calc(100dvh-4rem)]">
      {children}
    </div>
  )
}
