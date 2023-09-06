import { useEffect, useRef, useState } from 'react';
import { type NextPage } from 'next';
import { Option } from '../interfaces/Option'
import Image from 'next/image';


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
      imgSrc: 'https://sb-product-media-prod.azureedge.net/productimages/24463370/24463370_400.png?q=75&w=100',
    },
    {
      title: 'Absolult Pears',
      url: 'https://www.systembolaget.se/produkt/sprit/absolut-8901/',
      imgSrc: 'https://product-cdn.systembolaget.se/productimages/26391668/26391668_400.png?q=75&w=2000',
    },
    {
      title: 'Tom Collins',
      url: 'https://www.systembolaget.se/produkt/cider-blanddrycker/fors-cocktails-107315/',
      imgSrc: 'https://product-cdn.systembolaget.se/productimages/25244459/25244459_400.png?q=75&w=2000',
    },
  ];
  const combinedOptions = [...options, ...startOptions];
  const filteredOptions = selected ? combinedOptions.filter((option) => option.title !== selected.title) : combinedOptions;



  return (
    <div 
      ref={dropdownRef} 
      onClick={toggleDropDown} 
      className={`border w-full border-radius-2 select-none p-2 rounded-md cursor-pointer hover:border-gray-200 overflow-x-auto ${
        isActive ? 'border-gray-200 h-96' : 'border-gray-400'
        }`}
        >
        <div className='dropdown-btn font-semibold hover:bg-slate-600 rounded-md p-2'>
          {selected.imgSrc !== '' && ( 
            <div className='w-16 inline'>
              <Image 
                alt='dricka' 
                src={selected.imgSrc}
                width={22}
                height={22}
                className={`inline mr-4 w-auto h-16 ${isActive ? 'mb-4' : ''}`} />
            </div>
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
                className='mb-7 font-semibold hover:bg-slate-600 rounded-md p-2'
                >
                <Image 
                  alt='dricka' 
                  src={option.imgSrc} 
                  width={22} 
                  height={22} 
                  quality={100}
                  className='inline mr-4 h-16 w-auto'
                  />
                  <p className='text-white inline'>{option.title}</p>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default Dropdown;