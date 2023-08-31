import { useState } from 'react';
import { type NextPage } from 'next';
import Image from 'next/image';

import ab from '../../content/ab.png';
import ey from '../../content/ey.png';
import tc from '../../content/tc.png';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';

interface Option {
  imgSrc: string | StaticImport
  title: string;
  url: string;
}

interface Props {
  selected: Option;
  setSelected: React.Dispatch<React.SetStateAction<Option>>;
}

const Dropdown: NextPage<Props> = ({ selected, setSelected }) => {
  const [isActive, setIsActive] = useState(false);

  const options: Option[] = [
    {
      title: 'Ey Bro',
      url: 'https://www.systembolaget.se/produkt/ol/ey-bro-143215/',
      imgSrc: ey,
    },
    {
      title: 'Absolult Pears',
      url: 'https://www.systembolaget.se/produkt/sprit/absolut-8901/',
      imgSrc: ab,
    },
    {
      title: 'Tom Collins',
      url: 'https://www.systembolaget.se/produkt/cider-blanddrycker/fors-cocktails-107315/',
      imgSrc: tc,
    },
  ];

  const toggleDropDown = () => {
    setIsActive(!isActive);
  };

  const filteredOptions = selected ? options.filter((option) => option.title !== selected.title) : options;

  return (
    <div onClick={toggleDropDown} className='border border-radius-2 select-none p-4 rounded-md w-72 border-gray-700 cursor-pointer mb-5'>
      <div className='dropdown-btn font-semibold hover:bg-slate-600 rounded-md p-2'>
        <Image alt='dricka' src={selected.imgSrc} width={25} height={25} className='inline my-4 mr-4 ' />
        {selected.title}
      </div>

      {isActive && (
        <div>
          {filteredOptions.map((option, index) => (
            <div
              key={index}
              onClick={() => {
                setSelected(option);
                setIsActive(false);
              }}
              className='mb-7 font-semibold hover:bg-slate-600 rounded-md p-2'
            >
              <Image alt='dricka' src={option.imgSrc} width={25} height={25} className='inline mr-4' />
              {option.title}
            </div>
          ))}
        </div>
      )}


    </div>
  );
};

export default Dropdown;