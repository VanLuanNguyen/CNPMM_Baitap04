import { useContext, useState } from "react";
import {
  UsergroupAddOutlined,
  HomeOutlined,
  SettingOutlined,
  HeartOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/auth.context";

const Header = () => {
  const { auth } = useContext(AuthContext);
  console.log(">>> check auth: ", auth);
  const items = [
    {
      label: <Link to={"/"}>Home Page</Link>,
      key: "home",
      icon: <HomeOutlined />,
    },
    ...(auth.isAuthenticated
      ? [
          {
            label: <Link to={"/favorites"}>Yêu thích</Link>,
            key: "favorites",
            icon: <HeartOutlined />,
          },
          {
            label: <Link to={"/viewed-products"}>Đã xem</Link>,
            key: "viewed-products",
            icon: <HistoryOutlined />,
          },
          {
            label: <Link to={"/user"}>Users</Link>,
            key: "user",
            icon: <UsergroupAddOutlined />,
          },
        ]
      : []),

    {
      label: `Welcome ${auth?.user?.email ?? ""}`,
      key: "SubMenu",
      icon: <SettingOutlined />,
      children: [
        ...(auth.isAuthenticated
          ? [
              {
                label: (
                  <span
                    onClick={() => {
                      localStorage.removeItem("access_token");
                      setCurrent("home");
                    }}
                  >
                    Đăng xuất
                  </span>
                ),
                key: "logout",
              },
            ]
          : [
              {
                label: <Link to={"/login"}>Đăng nhập</Link>,
                key: "login",
              },
            ]),
      ],
    },
  ];
  const [current, setCurrent] = useState("mail");
  const onClick = (e: any) => {
    console.log("click ", e);
    setCurrent(e.key);
  };
  return (
    <Menu
      onClick={onClick}
      selectedKeys={[current]}
      mode="horizontal"
      items={items}
    />
  );
};

export default Header;
