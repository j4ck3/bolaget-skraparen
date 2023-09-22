import { useState } from 'react';
import { Option } from '../interfaces/Option';
import BackToTopButton from './BackToTopButton';
import { type NextPage } from 'next';
import { Store } from '../interfaces/Store';
import Image from 'next/image';

interface Props {
  searchedOption: Option;
  stores: Store[];
  area: string;
}

const StoresGrid: NextPage<Props> = ({ searchedOption, stores, area }) => {
  const [showAll, setShowAll] = useState(false);
  const itemsToShow = showAll ? stores.length : 4;

  return (
    <>
      {stores.length > 0 && (
        <div className="mt-16 mx-4 border border-gray-200 rounded-xl container mx-auto w-2/3 lg:w-1/3">
          <div className="">
            <Image
              alt={searchedOption.title}
              src={searchedOption.imgSrc}
              width={25}
              height={25}
              title={searchedOption.title}
              className="w-auto mx-auto mt-3 max-h-[48px]"
            />
          </div>
          <h3 className="text-center my-5">
            I <strong>{area}</strong> finns
            <strong> {searchedOption.title}</strong> i {stores.length} butiker:
          </h3>
          {stores.slice(0, itemsToShow).map((store, index) => (
            <div className="rounded-xl p-2 flex justify-between" key={index}>
              <div className="w-4/6">
                <h3 className="text-base font-medium">{store.address}</h3>
              </div>
              <p className="text-lg font-medium amount">{store.amount}</p>
            </div>
          ))}
          {stores.length > 4 && !showAll && (
            <div className="col-span-full flex justify-center">
              <button
                type="button"
                className="text-white font-bold tracking-wide btn-search rounded-xl m-5 py-2"
                onClick={() => setShowAll(true)}
              >
                Visa alla
              </button>
            </div>
          )}
          <BackToTopButton />
        </div>
      )}
    </>
  );
};

export default StoresGrid;
