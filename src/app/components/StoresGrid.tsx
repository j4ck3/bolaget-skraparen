import { useState } from 'react';
import { Option } from '../interfaces/Option';
import BackToTopButton from './BackToTopButton';
import { type NextPage } from 'next';
import { Store } from '../interfaces/Store';

interface Props {
    selected: Option;
    searchedImgSrc: string;
    stores: Store[]
  }

const StoresGrid: NextPage<Props> = ({ selected, searchedImgSrc, stores}) => {

    const storeArray = [
        {
          address: "123 Main St",
          city: "Cityville",
          amount: 1000
        },
        {
          address: "456 Elm St",
          city: "Townburg",
          amount: 1500
        },
        {
          address: "789 Oak Rd",
          city: "Villagetown",
          amount: 800
        },
      ];
      const [showAll, setShowAll] = useState(false);
      const itemsToShow = showAll ? storeArray.length : 4;

  return (
    <>
        <div className='grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-16 mx-4'>
          {stores.slice(0, itemsToShow).map((store, index) => (
            <div className='border border-gray-200 rounded-xl p-4 flex justify-between' key={index}>
                <img alt={selected.title} src={searchedImgSrc} width={30} height={30} title={selected.title} />
                  <div className='w-4/6'>
                    <h3 className='text-base font-medium'>{store.address}</h3>
                    <p className='text-gray-700'>{store.city}</p>
                  </div>
                  <p className='text-lg font-regular text-green-600'>{store.amount} st</p>
            </div>  
          ))}
            {stores.length > 4 && (
                !showAll && (
                <div className='col-span-full flex justify-center'>
                    <button
                      type='button'
                      className='text-white font-bold tracking-wide btn-theme rounded-xl mt-4 py-2 px-4'
                      onClick={() => setShowAll(true)}>
                      Visa alla
                    </button>
                </div>
                )
            )}
          <BackToTopButton />
        </div>
    </>
  );
};

export default StoresGrid;