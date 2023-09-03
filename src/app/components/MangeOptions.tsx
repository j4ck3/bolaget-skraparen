'use client'
import React, { useEffect, useState } from 'react';
import { Option } from '../interfaces/Option';
import { NextPage } from 'next';

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
    if (newOption.title && newOption.url && newOption.imgSrc) {
      const updatedOptions = [...options, newOption];
      setOptions(updatedOptions);
      localStorage.setItem('options', JSON.stringify(updatedOptions));
      setNewOption({ imgSrc: '', title: '', url: ''});
    }
  };
  
  if (!visible) return null
  return (
    <div className='fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center mx-3'>
  <div className='bg-slate-900 w-96 p-6 rounded-lg shadow-lg'>
    <div className='flex justify-between flex-row mb-4'>
      <h2 className='text-md font-medium'>Mina drycker</h2>
      <button
        type='button'
        className='self-end text-gray-600 hover:text-gray-800'
        onClick={onClose}
      >
        <span className='sr-only'>Close</span>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-6 w-6'
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
    <ul>
  {options.map((option, index) => (
    <li key={index} className='flex items-center justify-between mb-4'>
      <div className='flex items-center space-x-4'>
        <div className='w-12'>
          <img className='w-auto h-16' src={option.imgSrc} alt={option.title} />
        </div>
        <p className='text-lg'>{option.title}</p>
      </div>
      <button
        type='button'
        className='text-red-800 hover:text-red-900 text-sm font-medium'
        onClick={() => handleDeleteOption(index)}
      >
        Radera
      </button>
    </li>
    ))}
  </ul>
    <h2 className='text-md font-medium'>Lägg till</h2>
    <div>
      <input
        type='text'
        name='url'
        placeholder='Länk-adress *'
        value={newOption.url}
        onChange={handleInputChange}
        className='w-full mt-1 px-4 py-2 bg-gray-800 rounded-lg focus:outline-none'
        required
      />
      <input
        type='text'
        name='title'
        placeholder='Titel *'
        value={newOption.title}
        onChange={handleInputChange}
        className='w-full mt-4 px-4 py-2 bg-gray-800 rounded-lg focus:outline-none'
        required
      />
      <input
        type='text'
        name='imgSrc'
        placeholder='Bild Url'
        value={newOption.imgSrc}
        onChange={handleInputChange}
        className='w-full mt-4 px-4 py-2 bg-gray-800 rounded-lg focus:outline-none'
      />
      <button
        type='button'
        className='mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700'
        onClick={handleAddOption}
      >
        Spara
      </button>
    </div>
  </div>
</div>
  );
};

export default ManageOptions;

