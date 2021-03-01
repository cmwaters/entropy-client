import React from "react";
import { Button, Card, Popover } from "antd";
import { OpenPosition } from "../components/margin/open";
import { ClosePosition } from "../components/margin/close";
import { Settings } from "../components/settings";
import { SettingOutlined } from "@ant-design/icons";
import { AppBar } from "../components/appBar";
import { useHistory, useLocation } from "react-router-dom";

export const MarginView = (props: {}) => {
    const tabStyle: React.CSSProperties = { width: 120 };
    const tabList = [
        {
            key: "open",
            tab: <div style={tabStyle}>Open</div>,
            render: () => {
                return <OpenPosition />;
            },
        },
        {
            key: "close",
            tab: <div style={tabStyle}>Close</div>,
            render: () => {
                return <ClosePosition />;
            },
        },
    ];

    const location = useLocation();
    const history = useHistory();
    const activeTab = location.pathname.indexOf("open") < 0 ? "close" : "open";

    const handleTabChange = (key: any) => {
        if (activeTab !== key) {
            if (key === "open") {
                history.push("/margin/open");
            } else {
                history.push("/margin/close");
            }
        }
    };

    return (
        <>
            <AppBar
                right={
                    <Popover
                        placement="topRight"
                        title="Settings"
                        content={<Settings />}
                        trigger="click"
                    >
                        <Button
                            shape="circle"
                            size="large"
                            type="text"
                            icon={<SettingOutlined />}
                        />
                    </Popover>
                }
            />
            <Card
                className="exchange-card"
                headStyle={{ padding: 0 }}
                bodyStyle={{ position: "relative" }}
                tabList={tabList}
                tabProps={{
                    tabBarGutter: 0,
                }}
                activeTabKey={activeTab}
                onTabChange={(key) => {
                    handleTabChange(key);
                }}
            >
                {tabList.find((t) => t.key === activeTab)?.render()}
            </Card>
        </>
    );
};