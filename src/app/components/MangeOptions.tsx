'use client'
import React, { useEffect, useState } from 'react';
import { Option } from '../interfaces/Option';
import { NextPage } from 'next';
import Image from 'next/image';
interface Props {
  visible: boolean
  onClose: () => void
}


const ManageOptions: NextPage<Props> = ({visible, onClose}) => {
  
  const [options, setOptions] = useState<Option[]>([]);
  const [newOption, setNewOption] = useState<Option>({
    imgSrc: '',
    title: '',
    url: '',
  });
  
  useEffect(() => {
    try {
      const storedOptions = JSON.parse(localStorage.getItem('options') || '[]');
      setOptions(storedOptions);
    } catch (error) {
      console.error('Error parsing stored options:', error);
    }
  }, []);
  
  const handleDeleteOption = (indexToDelete: number) => {
    const updatedOptions = options.filter((_, index) => index !== indexToDelete);
    setOptions(updatedOptions);
    localStorage.setItem('options', JSON.stringify(updatedOptions));
  };
  
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewOption((prevOption) => ({ ...prevOption, [name]: value }));
  };
  
  const handleAddOption = () => {
    if (newOption.title && newOption.url) {
      const optionExists = options.some((option) => option.title === newOption.title);
  
      if (!optionExists) {
        const updatedOptions = [...options, newOption];
        setOptions(updatedOptions);
        localStorage.setItem('options', JSON.stringify(updatedOptions));
        setNewOption({ imgSrc: '', title: '', url: '' });
      } else {
        alert('Titeln måste vara unik.');
      }
    }else {
      alert('Fyll i Titel och Url');
    }
  };
  
  if (!visible) return null
  return (
    <div className='fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center mx-3 z-20'>
  <div className='bg-slate-900 w-96 p-6 rounded-lg shadow-lg'>
    <div className='flex justify-between flex-row mb-4'>
      <h2 className='text-md font-medium'>Mina drycker</h2>
      <button
        type='button'
        className='self-end text-white px-6 py-1 bg-slate-500 rounded-full hover:text-gray-800'
        onClick={onClose}
      >
        <span>Stäng</span>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-6 w-6 ms-2 inline'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M6 18L18 6M6 6l12 12'
          />
        </svg>
      </button>
    </div>
  {options.length > 0 ? (
  <ul>
    {options.map((option, index) => (
      <li key={index} className='flex items-center justify-between mb-4'>
        <div className='flex items-center space-x-4'>
          <div className='w-12'>
            {option.imgSrc && (option.imgSrc.startsWith('http') || option.imgSrc.startsWith('/')) ?(
              <Image 
              alt='dricka' 
              src={option.imgSrc}
              width={20}
              height={20}
              className='inline w-auto h-12'
              />
            )
            : (<span className='text-2xl'><i className="fa-solid fa-martini-glass"></i></span>)
            }
          </div>
          <p className='text-lg'>{option.title}</p>
        </div>
        <button
          type='button'
          className='text-yellow-500 text-sm font-medium'
          onClick={() => handleDeleteOption(index)}
        >
          Radera
        </button>
      </li>
    ))}
  </ul>
) : (
  <p className='text-center font-regular text-sm text-slate-400 mb-6'>Inga tillagda drycker</p>
)}
  <div className='flex justify-between flex-row mb-2'>
  <h2 className='text-sm font-regular'>Lägg till</h2>
    <div>
      <a 
      rel="noopener"
        className='text-sm hover:underline p-1 px-4 bg-slate-500 rounded-md' 
        href='https://www.systembolaget.se/' 
        target='_blank'
        >
        Systembolaget
        <i className="text-sm fa-solid fa-up-right-from-square ms-2"></i>
      </a>
    </div>
  </div>
    <div>
      <input
        type='text'
        name='url'
        placeholder='Url *'
        value={newOption.url}
        onChange={handleInputChange}
        className='w-full mt-1 px-4 py-2 bg-gray-800 rounded-lg option-input'
        required
      />
      <input
        type='text'
        name='title'
        placeholder='Titel *'
        value={newOption.title}
        onChange={handleInputChange}
        className='w-full mt-4 px-4 py-2 bg-gray-800 rounded-lg option-input'
        required
      />
      <input
        type='text'
        name='imgSrc'
        placeholder='Bild Url'
        value={newOption.imgSrc}
        onChange={handleInputChange}
        className='w-full mt-4 px-4 py-2 bg-gray-800 rounded-lg option-input'
      />
      <div className='w-100'>
        <button
          type='button'
          className='mt-4 w-full bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-700'
          onClick={handleAddOption}
        >
          Spara
        </button>
      </div>
    </div>
  </div>
</div>
  );
};

export default ManageOptions;

