import { useEffect, useRef, useState } from 'react';
import { cities } from '../data/cities'
import { type NextPage } from 'next';

interface Props {
  onInputChange: (newValue: string) => void;
}

const AreaInput: NextPage<Props> = ({ onInputChange}) => {
      const [inputValue, setInputValue] = useState('');
      const [suggestions, setSuggestions] = useState<string[]>([]);
      const suggestionRef = useRef<HTMLDivElement | null>(null);
      const inputRef = useRef<HTMLInputElement | null>(null);
      const [isActive, setIsActive] = useState(false);

      const [savedAreas, setSavedAreas] = useState<string[]>([])
      
      const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setIsActive(true);
        setInputValue(value);
        onInputChange(value)
        
        const filteredSuggestions = cities
        .filter((city) =>
          city.toLowerCase().includes(value.toLowerCase().trim())
        )
        .filter((suggestion) => suggestion.toLowerCase() !== value.toLowerCase().trim());
  
      setSuggestions(filteredSuggestions);
      };

      const handlePinClick = (suggestion: string) => {
        const savedAreaExists = savedAreas.some((area) => area === suggestion);

        if(!savedAreaExists) {
          const updatedAreas = [...savedAreas, suggestion];
          localStorage.setItem('areas', JSON.stringify(updatedAreas));
          setSavedAreas(updatedAreas)
        }
      }

      const handleDeleteArea = (indexToDelete: number) => {
        const updatedAreas = savedAreas.filter((_, index) => index !== indexToDelete);
        setSavedAreas(updatedAreas);
        localStorage.setItem('areas', JSON.stringify(updatedAreas));
      }

      const handleSuggestionClick = (suggestion: string) => {
        setInputValue(suggestion);
        onInputChange(suggestion)
        setSuggestions([]);
      };

      const handleClear = () => {
        setInputValue('')
        onInputChange('')
      }

      const closeSuggestions = () => {
        setIsActive(false);
      }

      useEffect(() => {
        try {
          const storedOptions = JSON.parse(localStorage.getItem('areas') || '[]');
          setSavedAreas(storedOptions);
        } catch (error) {
          console.error('Error parsing stored options:', error);
        }
        const handleClickOutside = (event: MouseEvent) => {
          if (
            inputRef.current &&
            !inputRef.current.contains(event.target as Node) &&
            suggestionRef.current &&
            !suggestionRef.current.contains(event.target as Node)
          ) {
            closeSuggestions();
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

      return ( 
        <div className='relative w-full'>
            <input
              ref={inputRef}
              type='text'
              value={inputValue}
              required
              onFocus={handleInputChange}
              onChange={handleInputChange}
              placeholder='Stad / Ort *'
              className='bg-black w-full rounded-lg border border-gray-400 p-4 focus:outline-none hover:border-gray-200 focus:border-gray-200'
            />
            {inputValue && (
              <button
                type='button'
                className='absolute right-3 top-0 mt-2 mr-2 p-2 bg-transparent rounded-full text-gray-400 hover:text-gray-900 focus:outline-none'
                onClick={handleClear}
                title='Rensa'
              >
                <i className='fa-solid fa-x'></i>
                <div className='sr-only'>Rensa</div>
              </button>
            )}

          {isActive && suggestions.length > 0 && (
          <div ref={suggestionRef} className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'} max-h-64 mt-4 w-full overflow-y-auto absolute rounded-lg border border-gray-200 bg-black z-10`}>
            {savedAreas.length > 0 && (
              <div>
                <h4 className='text-center text-xs text-slate-500 my-2'>Pinnade Städer<i className='ms-2 fa-solid fa-location-dot'></i></h4>
                <ul className='p-2'>
                  {savedAreas.map((item, index) => (
                    <li
                      className='font-regular text-md cursor-pointer border-gray-900 rounded-md p-1 hover:bg-slate-600 hover:text-white'
                      key={index}
                      onClick={() => handleSuggestionClick(item)}
                    >
                      <div className='flex flex-row justify-between items-center'>
                        {item}
                        <button
                          title='ta bort'
                          onClick={() => handleDeleteArea(index)}
                          className='w-[35px] bg-slate-700 hover:bg-red-900 rounded-md'
                        >
                          <i className='fa-solid fa-minus'></i>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <hr className='my-3' />
              </div>
            )}

            <ul className='p-2'>
              {suggestions.map((suggestion, index) => (
                <li 
                className='font-regular text-md cursor-pointer border-gray-900 rounded-md p-1 hover:bg-slate-600 hover:text-white'
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className='flex flex-row justify-between items-center'>
                    {suggestion}
                    <button
                      title='pinna'
                      onClick={() => handlePinClick(suggestion)}
                      className='w-[35px] bg-slate-700 hover:bg-green-900 rounded-md'
                    >
                        <i className='fa-solid text-xs fa-thumbtack'></i>
                      </button>

                  </div>
                </li>
                
              ))}
            </ul> 
          </div>
          )}
        </div>
      );
    };

export default AreaInput;