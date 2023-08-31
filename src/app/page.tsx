'use client'
import Head from 'next/head'
import { ChangeEvent, useState } from 'react';
import DropDown from "./components/DropDown";
import PulseStoresLoading from './components/PulseStoresLoading';
import StoresGrid from './components/StoresGrid'
import { getStores } from './services/getStoresInfo'
import { Store } from './interfaces/Store'
import { Option } from './interfaces/Option'
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import AreaInput from './components/AreaInput';


const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [area, setArea] = useState<string>('')
  const [searchedImgSrc, setSearchedImgSrc] = useState<string | StaticImport>('')
  const [stores, setStores] = useState<Store[]>([])
  const [selected, setSelected] = useState<Option>({
    imgSrc: '',
    title: 'Välj en dryck...',
    url: '',
  });

  async function fetchAndLoadStores() {
    try {
      setIsLoading(true)
      const response = await getStores(selected.url, area);
      setSearchedImgSrc(selected.imgSrc)
      setStores(response.storesList)
    } catch (error) {
      console.error('Error fetching stores:', error);
      setStores([]);
    }
    finally {
      setIsLoading(false)
    }
  }


  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setArea(event.target.value);
  };

  return (
    <>
      <Head>
        <title>Lagerstatus nära dig!</title>
      </Head>
      <h1 className='text-2xl mt-14 text-center'>Välj en alkoholhaltig dryck och sedan  &#x1F37B;</h1>
<h2 className='text-sm mt-3 text-center text-gray-500 mx-4'>...och sedan få information i vilka butiker i din stad den finns.</h2>

      <div className='flex flex-col md:flex-row justify-center items-center space-x-4 h-80'>
        <DropDown selected={selected} setSelected={setSelected} />
         <label htmlFor='area' className='hidden'>cringe lägger ner lite för mycket tid på detta projeketet</label>
         <input id='area' type='text' required className='py-5 bg-black rounded-lg border border-gray-700 p-4 ps-5 focus:outline-none mb-5' onChange={handleInputChange} value={area} placeholder='Stad / Ort'/>
         <AreaInput />
         <button onClick={fetchAndLoadStores} type='button' className='bg-black rounded-lg font-bold btn-theme text-white p-5 mb-5' title='SÖK'>Hämta från bolaget
         {isLoading ? (
          <i className="fa-solid fa-circle-notch animate-spin mx-2"></i>
        ) : ( <i className="fa-solid fa-magnifying-glass mx-2"></i> )}</button>
      </div>
      <div className='container mx-auto mb-14'>
        {isLoading ? (
          <PulseStoresLoading />
          ) :
          (
           <StoresGrid selected={selected} searchedImgSrc={searchedImgSrc} stores={stores}/>
         )}

      </div>
    </>
  );
};

export default Home;