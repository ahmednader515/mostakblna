import { SidebarRoutes } from "./sidebar-routes"

export const Sidebar = () => {
    return (
        <div className="h-full border-r flex flex-col overflow-y-auto bg-card shadow-sm">
            <div className="flex flex-col w-full rtl:border-l-2 ltr:border-r-2 pt-0">
                <SidebarRoutes />
            </div>
        </div>
    )
}