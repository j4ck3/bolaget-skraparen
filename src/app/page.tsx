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
  const [showManageOptions, setShowManageOptions] = useState(false)
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
      if(selected.url !== '') {
        const response = await getStores(selected.url, area);
        setSearchedOption(selected)
        setStores(response.storesList)

        if (response.storesList.length < 1) 
          setErrorMessage(`Inga butiker i ${area} hade ${selected.title}.`);
      }
      else {
        setErrorMessage('Välj en dryck')
      }

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

  const handleOnClose = () => setShowManageOptions(false)

  return (
    <>
      <h1 className='text-md mt-14 text-center mx-4 lg:text-2xl'>Välj en alkoholhaltig dryck och sedan  &#x1F37B;</h1>
      <h2 className='text-xs md:text-md mt-3 text-center text-gray-500 mx-4'>...och sedan få information i vilka butiker i din stad den finns.</h2>
      <div className='w-auto md:container mx-auto'>
        <div className='flex flex-col md:flex-row justify-center items-center mt-20 mx-5 space-y-4 md:space-y-0 md:space-x-4'>
          <div className='w-full relative'>
            <button
              className="text-xs add-drink-btn rounded-full px-8 py-[2px] hover:text-yellow-400 transition duration-300 ease-in-out"
              onClick={(e) => setShowManageOptions(true)}
            >
              <span className="font-medium text-sm ">
                Lägg till <i className="ms-2 fa-solid fa-wine-glass"></i>
              </span>
            </button>
                
            <DropDown selected={selected} setSelected={setSelected} />
          </div>
          <label htmlFor='area' className='sr-only'>stad</label>
          <AreaInput onInputChange={handleStateChange} />
          <button onClick={fetchAndLoadStores} type='button' className={`btn-search w-full ${canSubmit ? "cursor-pointer text-yellow-400": "cursor-not-allowed text-gray-400"}`} disabled={!canSubmit} title='SÖK'>
            Hämta från bolaget
            {isLoading ? (<i className="fa-solid fa-circle-notch animate-spin mx-2"></i>) : ( '' )}
          </button>
        </div>
        <div className='my-32'>
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
      </div>
    </>
  );
};

export default Home;