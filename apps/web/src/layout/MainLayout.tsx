import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";

import { Layout, Menu, Drawer, Button } from "antd";
import { MenuOutlined } from "@ant-design/icons";

/**
 * MainLayout Component
 *
 * Provides the main application layout structure including:
 * - Sidebar navigation (desktop)
 * - Drawer navigation (mobile)
 * - Header with mobile menu toggle
 * - Content area for routed pages (Outlet)
 *
 * Features:
 * - Responsive sidebar that collapses into a drawer on mobile
 * - Navigation highlighting based on current route
 * - Shared layout for all application pages
 */
export default function MainLayout() {
    const location = useLocation();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const { Header, Sider, Content } = Layout;

    const navItems = [
        {
            key: "/",
            label: <Link to="/" onClick={() => setDrawerOpen(false)}>Dashboard</Link>,
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                </svg>
            ),
        },
        {
            key: "/candidates",
            label: <Link to="/candidates" onClick={() => setDrawerOpen(false)}>Candidates</Link>,
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            ),
        },
        {
            key: "/applications",
            label: <Link to="/applications" onClick={() => setDrawerOpen(false)}>Applications</Link>,
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
            ),
        },
    ];

    const menu = (
        <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={navItems}
            style={{ border: "none", height: "100%" }}
        />
    );

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider
                width={220}
                breakpoint="lg"
                collapsedWidth={0}
                trigger={null}
                style={{ background: "#fff", borderRight: "1px solid #f0f0f0" }}
            >
                <div style={{ height: 64, display: "flex", alignItems: "center", padding: "0 16px", borderBottom: "1px solid #f0f0f0" }}>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>Candidate Tracker</div>
                        <div style={{ fontSize: 11, color: "#aaa" }}>
                            {new Date().toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                            })}
                        </div>
                    </div>
                </div>

                {menu}
            </Sider>

            <Drawer
                placement="left"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                width={220}
                styles={{ body: { padding: 0 }, header: { display: "none" } }}
            >
                <div style={{ height: 64, display: "flex", alignItems: "center", padding: "0 16px", borderBottom: "1px solid #f0f0f0" }}>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>Candidate Tracker</div>
                        <div style={{ fontSize: 11, color: "#aaa" }}>
                            {new Date().toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                            })}
                        </div>
                    </div>
                </div>

                {menu}
            </Drawer>

            <Layout style={{ height: "100vh", minWidth: 0, overflow: "hidden", width: "100%" }}>
                <Header
                    style={{
                        flexShrink: 0,
                        background: "#fff",
                        borderBottom: "1px solid #f0f0f0",
                        padding: "0 24px",
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                    }}
                >
                    <Button
                        type="text"
                        icon={<MenuOutlined />}
                        onClick={() => setDrawerOpen(true)}
                        style={{ display: "none" }}
                        className="mobile-menu-btn"
                    />
                </Header>

                <Content
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        overflowX: "hidden",
                        padding: 24,
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>

            <style>{`
                @media (max-width: 991px) {
                    .mobile-menu-btn { display: flex !important; }
                    .ant-layout-sider { display: none !important; }
                }
            `}</style>
        </Layout>
    );
}