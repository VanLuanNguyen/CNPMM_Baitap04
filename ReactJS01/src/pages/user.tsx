import { useEffect, useState } from "react";
import { getUserApi } from "../util/api";
import { notification, Table } from "antd";

const UserPage = () => {
  const [dataSource, setDataSource] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      const res: any = await getUserApi();
      if (res) {
        setDataSource(res);
      } else {
        notification.error({
          message: "Unauthorized",
          description: "Failed to fetch user data",
        });
      }
    };
    fetchUser();
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "_id",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Role",
      dataIndex: "role",
    },
  ];

  return (
    <div style={{ padding: 30 }}>
      <Table
        bordered
        dataSource={dataSource}
        columns={columns}
        rowKey={"_id"}
      />
    </div>
  );
};

export default UserPage;
