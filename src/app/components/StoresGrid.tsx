import { useState } from 'react';
import Image from 'next/image';
import { Option } from '../interfaces/Option';
import BackToTopButton from './BackToTopButton';
import { type NextPage } from 'next';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import { Store } from '../interfaces/Store';




interface Props {
    selected: Option;
    searchedImgSrc: string | StaticImport;
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
        {
          address: "101 Pine Ave",
          city: "Hamletville",
          amount: 1200
        },
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
        {
          address: "101 Pine Ave",
          city: "Hamletville",
          amount: 1200
        },
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
        {
          address: "101 Pine Ave",
          city: "Hamletville",
          amount: 1200
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
        {
          address: "101 Pine Ave",
          city: "Hamletville",
          amount: 1200
        }
      ];


      const [showAll, setShowAll] = useState(false);
      const itemsToShow = showAll ? storeArray.length : 4;

      
  return (
    <>
        <div className='grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
          {stores.slice(0, itemsToShow).map((store, index) => (
            <div className='border-2 border-gray-700 rounded-2xl p-7 flex justify-center' key={index}>
              <div>
                <Image alt={selected.title} src={searchedImgSrc} width={30} height={30} className='me-10' title={selected.title} />
              </div>
              <div>
                <h3 className='md:pe-14 text-base'>{store.address}</h3>
                <p className='text-gray-700'>{store.city}</p>
                <p className='mt-3 text-lg text-white font-bold'>{store.amount} st</p>
              </div>
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