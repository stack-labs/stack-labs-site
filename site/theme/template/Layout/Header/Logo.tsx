import * as React from 'react';
import { Link } from 'bisheng/router';
import * as utils from '../../utils';
import { SharedProps } from './interface';

import './Logo.less';

export default ({ isZhCN }: SharedProps) => (
  <h1>
    <Link to={utils.getLocalizedPathname('/', isZhCN)} id="logo">
      <img alt="logo" src="https://avatars2.githubusercontent.com/u/20906580?s=200&v=4" />
      Micro 中国
    </Link>
  </h1>
);
