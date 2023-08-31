import { StaticImport } from 'next/dist/shared/lib/get-img-props';
export interface Option {
    imgSrc: string | StaticImport;
    title: string;
    url: string;
  }
  