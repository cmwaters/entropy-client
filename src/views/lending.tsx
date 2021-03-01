import React from "react";
import { Button, Card, Popover } from "antd";
import { DepositReserve } from "../components/lending/deposit"
import { WithdrawReserve } from "../components/lending/withdraw"
import { Settings } from "../components/settings";
import { SettingOutlined } from "@ant-design/icons";
import { AppBar } from "../components/appBar";
import { useHistory, useLocation } from "react-router-dom";

export const LendingView = (props: {}) => {
  const tabStyle: React.CSSProperties = { width: 120 };
  const tabList = [
    {
      key: "deposit",
      tab: <div style={tabStyle}>Deposit</div>,
      render: () => {
        return <DepositReserve />;
      },
    },
    {
      key: "withdraw",
      tab: <div style={tabStyle}>Withdraw</div>,
      render: () => {
        return <WithdrawReserve />;
      },
    },
  ];

  const location = useLocation();
  const history = useHistory();
  const activeTab = location.pathname.indexOf("withdraw") < 0 ? "deposit" : "withdraw";

  const handleTabChange = (key: any) => {
    if (activeTab !== key) {
      if (key === "deposit") {
        history.push("/lend/deposit");
      } else {
        history.push("/lend/withdraw");
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
