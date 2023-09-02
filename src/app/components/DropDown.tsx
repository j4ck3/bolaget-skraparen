import { useEffect, useState } from 'react';
import { type NextPage } from 'next';
import { Option } from '../interfaces/Option'

interface Props {
  selected: Option;
  setSelected: React.Dispatch<React.SetStateAction<Option>>;
}

const Dropdown: NextPage<Props> = ({ selected, setSelected }) => {
  const [isActive, setIsActive] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);

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
  }, []);

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
    <div onClick={toggleDropDown} className={`border border-radius-2 select-none p-4 rounded-md w-72 cursor-pointer mb-5 hover:border-gray-900 overflow-x-auto ${
      isActive ? 'border-gray-900 h-96' : 'border-gray-700'
      }`}>
      <div className='dropdown-btn font-semibold hover:bg-slate-600 rounded-md p-2'>
        {selected.imgSrc !== '' && ( <img alt='dricka' src={selected.imgSrc} width={25} height={25} className={`inline mr-4 ${isActive ? 'mb-4' : ''}`} />)}
        <p className='font-light inline text-gray-400'>{selected.title}</p>
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
              <img alt='dricka' src={option.imgSrc} width={25} height={25} className='inline mr-4' />
              {option.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;