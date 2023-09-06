import { useEffect, useRef, useState } from 'react';
import { type NextPage } from 'next';
import { Option } from '../interfaces/Option'
import Image from 'next/image';
import ab from '../../content/ab.png';
import ey from '../../content/ey.png';
import tc from '../../content/tc.png';

interface Props {
  selected: Option;
  setSelected: React.Dispatch<React.SetStateAction<Option>>;
}

const Dropdown: NextPage<Props> = ({ selected, setSelected }) => {
  const [isActive, setIsActive] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const toggleDropDown = () => {
    setIsActive(!isActive);
  };

  useEffect(() => {
    try {
      const storedOptions = JSON.parse(localStorage.getItem('options') || '[]');
      setOptions(storedOptions);
    } catch (error) {
      console.error('Error parsing stored options:', error);
    }
    

    const closeDropdown = () => {
      setIsActive(false);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    if (isActive) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isActive]);

  const startOptions: Option[] = [
    {
      title: 'Ey Bro',
      url: 'https://www.systembolaget.se/produkt/ol/ey-bro-143215/',
      imgSrc: ey.src,
    },
    {
      title: 'Absolult Pears',
      url: 'https://www.systembolaget.se/produkt/sprit/absolut-8901/',
      imgSrc: ab.src,
    },
    {
      title: 'Tom Collins',
      url: 'https://www.systembolaget.se/produkt/cider-blanddrycker/fors-cocktails-107315/',
      imgSrc: tc.src,
    },
  ];
  const combinedOptions = [...options, ...startOptions];
  const filteredOptions = selected ? combinedOptions.filter((option) => option.title !== selected.title) : combinedOptions;



  return (
    <div className='relative z-10'>
      <div 
        ref={dropdownRef} 
        onClick={toggleDropDown} 
        className={`border bg-black w-full border-radius-2 select-none rounded-md cursor-pointer hover:border-gray-200 overflow-x-auto${
          isActive ? 'border-gray-200 absolute md:static' : 'border-gray-400 '
          }`}
          >
          <div className='p-4 font-semibold hover:bg-slate-600 rounded-md'>
            {selected.imgSrc !== '' && (selected.imgSrc.startsWith('http') || selected.imgSrc.startsWith('/')) && (
              <Image 
                alt='dricka' 
                src={selected.imgSrc}
                width={22}
                height={22}
                className='inline mr-4 w-auto'
              />
            )}
            <p className='font-regular inline text-gray-300'>{selected.title}</p>
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
                  className='font-semibold p-4 hover:bg-slate-600 rounded-md'
                  >
                  {option.imgSrc !== '' && (option.imgSrc.startsWith('http') || option.imgSrc.startsWith('/')) && (
                    <Image 
                      alt='dricka' 
                      src={option.imgSrc}
                      width={22}
                      height={22}
                      className='inline mr-4 w-auto'
                    />
                  )}
                  <p className='text-white inline'>{option.title}</p>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
};

export default Dropdown;