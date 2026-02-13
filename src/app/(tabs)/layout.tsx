
import TabsLayout from "@/components/layout/TabsLayout"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <TabsLayout>{children}</TabsLayout>
    )
}
