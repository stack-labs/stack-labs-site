import React from 'react';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import { message, Modal } from 'antd';
import { Link } from 'bisheng/router';
import RcFooter from 'rc-footer';
import { presetPalettes } from '@ant-design/colors';
import { CommentOutlined, GithubOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { getLocalizedPathname, isLocalStorageNameSupported, loadScript } from '../utils';
import ColorPicker from '../Color/ColorPicker';

class Footer extends React.Component<WrappedComponentProps> {
  lessLoaded = false;

  state = {
    color: presetPalettes.blue.primary,
  };

  componentDidMount() {
    // for some iOS
    // http://stackoverflow.com/a/14555361
    if (!isLocalStorageNameSupported()) {
      return;
    }
    // 大版本发布后全局弹窗提示
    //   1. 点击『知道了』之后不再提示
    //   2. 超过截止日期后不再提示
    if (
      localStorage.getItem('antd@3.0.0-notification-sent') !== 'true' &&
      Date.now() < new Date('2017/12/20').getTime()
    ) {
      this.infoNewVersion();
    }
  }

  getColumns() {
    const { intl } = this.props;
    const isZhCN = intl.locale === 'zh-CN';

    const col1 = {
      title: <FormattedMessage id="app.footer.resources"/>,
      items: [
        {
          title: 'Platform Web 治理平台',
          url: 'https://github.com/micro-in-cn/platform-web',
          openExternal: true,
        },
        {
          title: 'XConf 配置中心',
          url: 'https://github.com/micro-in-cn/XConf',
          openExternal: true,
        },
      ],
    };

    const col2 = {
      title: <FormattedMessage id="app.footer.community"/>,
      items: [
        {
          icon: <CommentOutlined/>,
          title: <FormattedMessage id="app.footer.awesome"/>,
          url: 'https://github.com/websemantics/awesome-ant-design',
          openExternal: true,
        },
      ],
    };

    if (isZhCN) {
      col2.items.push({
        icon: <UsergroupAddOutlined/>,
        title: <FormattedMessage id="app.footer.work_with_us"/>,
        url: getLocalizedPathname('/docs/community/join-us', isZhCN, {
          zhCN: '加入我们',
          enUS: 'JoinUs',
        }),
        LinkComponent: Link,
      } as any);
    }

    const col3 = {
      title: <FormattedMessage id="app.footer.help"/>,
      items: [
        {
          icon: <GithubOutlined/>,
          title: 'GitHub',
          url: 'https://github.com/micro-in-cn/questions',
          openExternal: true,
        },
      ],
    };

    const col4 = {
      icon: (
        <img
          src="https://gw.alipayobjects.com/zos/rmsportal/nBVXkrFdWHxbZlmMbsaH.svg"
          alt="Ant XTech"
        />
      ),
      title: <FormattedMessage id="app.footer.more-product"/>,
      items: [
        {
          icon: (
            <img
              src="https://gw.alipayobjects.com/zos/rmsportal/XuVpGqBFxXplzvLjJBZB.svg"
              alt="yuque"
            />
          ),
          title: <FormattedMessage id="app.footer.yuque"/>,
          url: 'https://yuque.com',
          description: <FormattedMessage id="app.footer.yuque.slogan"/>,
          openExternal: true,
        },
      ],
    };

    return [col1, col2, col3, col4];
  }

  handleColorChange = (color: string) => {
    const {
      intl: { messages },
    } = this.props;
    message.loading({
      content: messages['app.footer.primary-color-changing'],
      key: 'change-primary-color',
    });
    const changeColor = () => {
      (window as any).less
        .modifyVars({
          '@primary-color': color,
        })
        .then(() => {
          message.success({
            content: messages['app.footer.primary-color-changed'],
            key: 'change-primary-color',
          });
          this.setState({ color });
        });
    };

    const lessUrl = 'https://gw.alipayobjects.com/os/lib/less/3.10.3/dist/less.min.js';

    if (this.lessLoaded) {
      changeColor();
    } else {
      (window as any).less = {
        async: true,
        javascriptEnabled: true,
      };
      loadScript(lessUrl).then(() => {
        this.lessLoaded = true;
        changeColor();
      });
    }
  };

  infoNewVersion() {
    const {
      intl: { messages },
    } = this.props;
    Modal.info({
      title: messages['app.publish.title'],
      content: (
        <div>
          <img
            src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
            alt="Ant Design"
          />
          <p>
            {messages['app.publish.greeting']}
            <a target="_blank" rel="noopener noreferrer" href="/changelog">
              antd@3.0.0
            </a>
            {messages['app.publish.intro']}
            {messages['app.publish.old-version-guide']}
            <a target="_blank" rel="noopener noreferrer" href="http://2x.ant.design">
              2x.ant.design
            </a>
            {messages['app.publish.old-version-tips']}
          </p>
        </div>
      ),
      okText: 'OK',
      onOk: () => localStorage.setItem('antd@3.0.0-notification-sent', 'true'),
      className: 'new-version-info-modal',
      width: 470,
    });
  }

  renderThemeChanger() {
    const { color } = this.state;
    const colors = Object.keys(presetPalettes).filter(item => item !== 'grey');
    return (
      <ColorPicker
        small
        color={color}
        position="top"
        presetColors={[
          ...colors.map(c => presetPalettes[c][5]),
          ...colors.map(c => presetPalettes[c][4]),
          ...colors.map(c => presetPalettes[c][6]),
        ]}
        onChangeComplete={this.handleColorChange}
      />
    );
  }

  render() {
    return (
      <RcFooter
        columns={this.getColumns()}
        bottom={
          <>
            Made with <span style={{ color: '#fff' }}>❤</span> by
            {/* eslint-disable-next-line react/jsx-curly-brace-presence */}{' '}
            <a target="_blank" rel="noopener noreferrer" href="https://xtech.antfin.com">
              <FormattedMessage id="app.footer.company"/>
            </a>
          </>
        }
      />
    );
  }
}

export default injectIntl(Footer);
