import * as React from 'react';
import { Link } from 'bisheng/router';
import * as utils from '../../utils';
import { SharedProps } from './interface';

import microLogo from '../../../images/micro-logo.svg';

import './Logo.less';

export default ({ isZhCN }: SharedProps) => (
  <h1>
    <Link to={utils.getLocalizedPathname('/', isZhCN)} id="logo">
      <img alt="logo" src={microLogo}/>
      Micro 中国
    </Link>
  </h1>
);
