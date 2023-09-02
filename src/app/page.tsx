'use client'
import { useState } from 'react';
import DropDown from "./components/DropDown";
import PulseStoresLoading from './components/PulseStoresLoading';
import StoresGrid from './components/StoresGrid'
import { getStores } from './services/getStoresInfo'
import { Store } from './interfaces/Store'
import { Option } from './interfaces/Option'
import AreaInput from './components/AreaInput';
import ManageOptions from './components/MangeOptions';

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [area, setArea] = useState<string>('')
  const [stores, setStores] = useState<Store[]>([])
  const [canSubmit, setCanSubmit] = useState(false);
  const [errorMessage, setErrorMessage] = useState('')
  const [showManageOptions, setShowManageOptoins] = useState(false)
  const [searchedOption, setSearchedOption] = useState<Option>({
    imgSrc: '',
    title: '',
    url: '',
  })
  const [selected, setSelected] = useState<Option>({
    imgSrc: '',
    title: 'Välj en dryck *',
    url: '',
  });

  async function fetchAndLoadStores() {
    try {
      setErrorMessage('')
      setIsLoading(true)
      const response = await getStores(selected.url, area);
      setSearchedOption(selected)
      setStores(response.storesList)
      
      if (response.storesList.length < 1) 
        setErrorMessage(`Inga butiker i ${area} hade ${selected.title}.`);
      

    } catch (error) {
      console.error('Error fetching stores:', error);
      setStores([]);
      setErrorMessage('Det gick inte att hämta informationen')
    }
    finally {
      setIsLoading(false)
    }
  }

  const handleStateChange = (newValue: string) => {
    setArea(newValue);
    setCanSubmit(newValue !== '');
  };

  const handleOnClose = () => setShowManageOptoins(false)


  return (
    <>
      <h1 className='text-2xl mt-14 text-center'>Välj en alkoholhaltig dryck och sedan  &#x1F37B;</h1>
      <h2 className='text-sm mt-3 text-center text-gray-500 mx-4'>...och sedan få information i vilka butiker i din stad den finns.</h2>
      <div className='flex flex-col md:flex-row justify-center items-center space-x-4 h-80 mt-20'>
        <div className='relative'>
          <button className='text-xs underline font-medium text-gray-600' onClick={(e) => setShowManageOptoins(true)}>Lägg till fler drycker<i className="fa-solid fa-circle-plus ms-2"></i></button>
          <DropDown selected={selected} setSelected={setSelected} />
        </div>
         <label htmlFor='area' className='sr-only'>area</label>
         <AreaInput onInputChange={handleStateChange} />
          <button onClick={fetchAndLoadStores} type='button' className={`btn-search bg-green-800 ${canSubmit ? "cursor-pointer": "cursor-not-allowed"}`} disabled={!canSubmit} title='SÖK'>Hämta från bolaget
            {isLoading ? (<i className="fa-solid fa-circle-notch animate-spin mx-2"></i>) : ( '' )}
          </button>
      </div>
      <div className='container mx-auto my-32'>
        {isLoading ? ( <PulseStoresLoading /> ) : (<StoresGrid selected={selected} searchedImgSrc={searchedOption.imgSrc} stores={stores}/> )}
        <div className="flex justify-center items-center">
          {errorMessage && (
            <p className="text-red-300 bg-red-900 border-red-400 px-12 py-2 border rounded-md">
              {errorMessage}
            </p>
          )}
        </div>
      </div>
      <ManageOptions onClose={handleOnClose} visible={showManageOptions} />
    </>
  );
};

export default Home;