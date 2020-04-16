import * as React from 'react';
import { Dropdown, Menu, Button } from 'antd';
import { FormattedMessage } from 'react-intl';
import { DownOutlined } from '@ant-design/icons';
import { SharedProps } from './interface';

export function getEcosystemGroup({ isZhCN }: SharedProps): React.ReactElement {
  return (
    <Menu.ItemGroup key="ecosystem" title={<FormattedMessage id="app.header.menu.ecosystem" />}>
      <Menu.Item key="platform-web">
        <a
          href="https://github.com/micro-in-cn/platform-web"
          className="header-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FormattedMessage id="app.header.menu.platform-web" />
        </a>
      </Menu.Item>
      <Menu.Item key="xconf">
        <a
          href="https://github.com/micro-in-cn/XConf"
          className="header-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FormattedMessage id="app.header.menu.x-conf" />
        </a>
      </Menu.Item>
      {isZhCN ? (
        <Menu.Item key="course" className="hide-in-home-page">
          <a
            href="https://github.com/micro-in-cn/tutorials"
            className="header-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Micro 实战教程
          </a>
        </Menu.Item>
      ) : null}
    </Menu.ItemGroup>
  );
}

export default (props: SharedProps) => {
  const menu = <Menu>{getEcosystemGroup(props)}</Menu>;

  return (
    <Dropdown overlay={menu} placement="bottomRight">
      <Button size="small" className="header-button">
        <FormattedMessage id="app.header.menu.more" />
        <DownOutlined
          style={{
            fontSize: '9px',
            marginLeft: 2,
            verticalAlign: 'middle',
            marginTop: -1,
          }}
        />
      </Button>
    </Dropdown>
  );
};
