import * as React from 'react';
import './Logo.less';
import { preLoad } from '../util';
import microChina from '../../../images/micro-china.svg';

const ICON_IMAGES = [
  'https://gw.alipayobjects.com/zos/basement_prod/fef2f3d5-9326-48e3-a8f3-a99584efd425.svg',
  'https://gw.alipayobjects.com/zos/basement_prod/95736b64-de90-4fcd-bae9-a827091a247d.svg',
  'https://gw.alipayobjects.com/zos/basement_prod/7002f57b-bf16-4640-8373-2c4cfcfa7f8c.svg',
  'https://gw.alipayobjects.com/zos/basement_prod/29aa8cd8-de97-42b8-a370-f901be43e18a.svg',
  'https://gw.alipayobjects.com/zos/basement_prod/d7bc5cdf-07f9-4ddf-8135-78d3cc6ca009.svg',
  'https://gw.alipayobjects.com/zos/basement_prod/8737ccb7-3b5d-40ca-ae36-6a904047caa4.svg',
  'https://gw.alipayobjects.com/zos/basement_prod/1fdf5981-2d9d-4315-bb84-4590d5c5b989.svg',
  'https://gw.alipayobjects.com/zos/basement_prod/b9d17ebc-2af1-4926-ba1b-c1376ddaa479.svg',
  'https://gw.alipayobjects.com/zos/basement_prod/dcb1b8f8-becd-4f90-ba32-574260a7b18d.svg',
  'https://gw.alipayobjects.com/zos/basement_prod/ba0958ce-b194-4910-84de-7e3274742dbb.svg',
  'https://gw.alipayobjects.com/zos/basement_prod/ad510b94-5f85-4b30-b929-2e3a34ad673c.svg',
  'https://gw.alipayobjects.com/zos/basement_prod/43d010fa-71ac-44e3-8475-bb77d95c331c.svg',
];

preLoad(ICON_IMAGES);

const AntDesign = () => (
  <svg>
    <circle cx="16" cy="16" r="9" fill="#F74455" />
  </svg>
);

AntDesign.width = 32;
AntDesign.height = 32;

export default function Logo() {
  return (
    <div className="home-card-logo">
      <img
        width="490"
        height="87"
        alt="Stack Labs"
        src={microChina}
        className="home-banner-normal"
      />
    </div>
  );
}
