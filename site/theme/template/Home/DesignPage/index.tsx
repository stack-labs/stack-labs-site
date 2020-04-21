import * as React from 'react';
import { Row, Col, Typography, Card } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'bisheng/router';
import { getLocalizedPathname } from '../../utils';
import './index.less';
import Certainty from './Certainty';
import Meaningful from './Meaningful';
import Growth from './Growth';
import Natural from './Natural';

const { Title } = Typography;

interface PanelProps {
  img: string;
  title: React.ReactNode;
  description: string;
  href?: string;
  link?: string;
}

const MINI_LIST: PanelProps[] = [
  {
    img: 'https://gw.alipayobjects.com/mdn/rms_08e378/afts/img/A*ZhzDQLMyYlYAAAAAAAAAAABkARQnAQ',
    title: 'Platform Web',
    description: 'app.home.product-platformWeb-slogan',
    href: 'https://github.com/micro-in-cn/platform-web',
  },
  {
    img: 'https://gw.alipayobjects.com/mdn/rms_08e378/afts/img/A*I-ygS5prYksAAAAAAAAAAABkARQnAQ',
    title: 'XConf',
    description: 'app.home.product-XConf-slogan',
    href: 'https://github.com/micro-in-cn/XConf',
  },
  {
    img: 'https://gw.alipayobjects.com/mdn/rms_08e378/afts/img/A*mb-WQILTlSEAAAAAAAAAAABkARQnAQ',
    title: 'x-apisix',
    description: 'app.home.product-xapisix-slogan',
    href: 'https://github.com/micro-in-cn/x-apisix',
  },
];

const MiniPanel = ({
  title,
  img,
  description,
  href,
  link,
  isZhCN,
}: PanelProps & { isZhCN: boolean }) => {
  let content = (
    <Card
      hoverable
      className="design-mini-panel"
      cover={<img alt={typeof title === 'string' ? title : 'Hitu'} src={img} />}
    >
      <Card.Meta title={title} description={<FormattedMessage id={description} />} />
    </Card>
  );

  if (href) {
    content = (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  } else if (link) {
    content = <Link to={getLocalizedPathname(link, isZhCN)}>{content}</Link>;
  }

  return (
    <Col xs={24} sm={8}>
      {content}
    </Col>
  );
};

export default function DesignPage() {
  const { locale } = useIntl();
  const isZhCN = locale === 'zh-CN';

  return (
    <div style={{ marginBottom: -28 }}>
      {/* ***************************** Group 1 ***************************** */}
      <Row gutter={[40, 40]}>
        {/* *********************** Design Values *********************** */}
        <Col span={24}>
          <div className="design-card main-card">
            <Title level={3}>
              <FormattedMessage id="app.home.design-values" />
            </Title>

            <Row align="stretch">
              <Col xs={24} sm={8}>
                <FormattedMessage id="app.home.design-values-description" />

                <Link
                  className="design-card-detail"
                  to={getLocalizedPathname('/docs/spec/values', isZhCN)}
                >
                  <FormattedMessage id="app.home.detail" />
                  <RightOutlined className="home-link-arrow" />
                </Link>
              </Col>
              <Col xs={24} sm={16}>
                <Row className="design-values">
                  <Col xs={12} sm={6}>
                    <img
                      alt="certainty"
                      src="https://gw.alipayobjects.com/mdn/rms_08e378/afts/img/A*43rfS4dD0MUAAAAAAAAAAABkARQnAQ"
                    />
                    <Certainty />
                    <h4>
                      <FormattedMessage id="app.home.pluggable" />
                    </h4>
                  </Col>
                  <Col xs={12} sm={6}>
                    <img
                      alt="meaningful"
                      src="https://gw.alipayobjects.com/mdn/rms_08e378/afts/img/A*abGUQKUocSMAAAAAAAAAAABkARQnAQ"
                    />
                    <Meaningful />
                    <h4>
                      <FormattedMessage id="app.home.veryeasy" />
                    </h4>
                  </Col>
                  <Col xs={12} sm={6}>
                    <img
                      alt="growth"
                      src="https://gw.alipayobjects.com/mdn/rms_08e378/afts/img/A*NvhsRKmTLwUAAAAAAAAAAABkARQnAQ"
                    />
                    <Growth />
                    <h4>
                      <FormattedMessage id="app.home.growth" />
                    </h4>
                  </Col>
                  <Col xs={12} sm={6}>
                    <img
                      alt="natural"
                      src="https://gw.alipayobjects.com/mdn/rms_08e378/afts/img/A*cY0tTr8q3Y4AAAAAAAAAAABkARQnAQ"
                    />
                    <Natural />
                    <h4>
                      <FormattedMessage id="app.home.natural" />
                    </h4>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        </Col>

        {/* *********************** Design Guides *********************** */}
        <Col xs={24} sm={12}>
          <div
            className="design-card sub-card"
            style={{
              background: '#E6F1FF',
              backgroundImage:
                'url(https://gw.alipayobjects.com/mdn/rms_08e378/afts/img/A*0oaHSYRcnT4AAAAAAAAAAABkARQnAQ)',
            }}
          >
            <Row>
              <Col xs={24} sm={9} className="card-info">
                <Title level={3}>
                  <FormattedMessage id="app.home.develop-guide" />
                </Title>

                <ul>
                  <li>
                    <Link to={getLocalizedPathname('/docs/spec/colors', isZhCN)}>
                      <FormattedMessage id="app.home.develop-docs" />
                      <RightOutlined className="home-link-arrow" />
                    </Link>
                  </li>
                  <li>
                    <Link to={getLocalizedPathname('/docs/spec/overview', isZhCN)}>
                      <FormattedMessage id="app.home.tutorials" />
                      <RightOutlined className="home-link-arrow" />
                    </Link>
                  </li>
                </ul>
              </Col>
              <Col
                xs={24}
                sm={15}
                className="design-card-img-col"
                style={{ alignSelf: 'flex-end', textAlign: 'right' }}
              >
                <img
                  alt="design guide"
                  style={{ maxHeight: 278, maxWidth: '100%' }}
                  src="https://gw.alipayobjects.com/mdn/rms_08e378/afts/img/A*5PRzTL4pwuYAAAAAAAAAAABkARQnAQ"
                />
              </Col>
            </Row>
          </div>
        </Col>

        {/* ************************* Component ************************* */}
        <Col xs={24} sm={12}>
          <div
            className="design-card sub-card"
            style={{
              background: '#DEF6FF',
              backgroundImage:
                'url(https://gw.alipayobjects.com/mdn/rms_08e378/afts/img/A*TLJTT78n7rMAAAAAAAAAAABkARQnAQ)',
            }}
          >
            <Row>
              <Col xs={24} sm={9} className="card-info">
                <Title level={3}>
                  <FormattedMessage id="app.home.plugins" />
                </Title>

                <ul>
                  <li>
                    <Link to={getLocalizedPathname('/docs/micro/introduce', isZhCN)}>
                      官方插件
                      <RightOutlined className="home-link-arrow" />
                    </Link>
                  </li>
                  <li>
                    <a href="https://ng.ant.design/" target="_blank" rel="noopener noreferrer">
                      中国站插件
                      <RightOutlined className="home-link-arrow" />
                    </a>
                  </li>
                </ul>
              </Col>
              <Col xs={24} sm={15} style={{ alignSelf: 'flex-end', textAlign: 'right' }}>
                <img
                  alt="components"
                  className="design-card-img-col"
                  style={{ maxHeight: 278, maxWidth: '100%' }}
                  src="https://gw.alipayobjects.com/mdn/rms_08e378/afts/img/A*8VDFTbQn4UAAAAAAAAAAAABkARQnAQ"
                />
              </Col>
            </Row>
          </div>
        </Col>
      </Row>

      {/* ***************************** Group 2 ***************************** */}
      <Row
        style={{ marginTop: 40 }}
        gutter={[
          { xs: 32, sm: 40 },
          { xs: 32, sm: 40 },
        ]}
        className="design-mini-panels"
      >
        {MINI_LIST.map(panel => (
          <MiniPanel key={panel.description} {...panel} isZhCN={isZhCN} />
        ))}
      </Row>
    </div>
  );
}
