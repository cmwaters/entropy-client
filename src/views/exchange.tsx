import React from "react";
import { Button, Card, Popover } from "antd";
import { TradeEntry } from "../components/trade";
import { AddToLiquidity } from "../components/pool/add";
import { Settings } from "../components/settings";
import { SettingOutlined } from "@ant-design/icons";
import { AppBar } from "../components/appBar";
import { useHistory, useLocation } from "react-router-dom";

export const ExchangeView = (props: {}) => {
  const tabStyle: React.CSSProperties = { width: 120 };
  const tabList = [
    {
      key: "trade",
      tab: <div style={tabStyle}>Trade</div>,
      render: () => {
        return <TradeEntry />;
      },
    },
    {
      key: "pool",
      tab: <div style={tabStyle}>Pool</div>,
      render: () => {
        return <AddToLiquidity />;
      },
    },
  ];

  const location = useLocation();
  const history = useHistory();
  const activeTab = location.pathname.indexOf("pool") < 0 ? "trade" : "pool";

  const handleTabChange = (key: any) => {
    if (activeTab !== key) {
      if (key === "trade") {
        history.push("/swap/trade");
      } else {
        history.push("/swap/pool");
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