import { useState } from 'react';

import { cities } from '../data/cities'
const AreaInput = () => {
      const [inputValue, setInputValue] = useState('');
      const [suggestions, setSuggestions] = useState<string[]>([]);
    
      const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setInputValue(value);
    
        const filteredSuggestions = cities.filter(city =>
          city.toLowerCase().includes(value.toLowerCase().trim())
        );

        setSuggestions(filteredSuggestions);
      };
      const handleSuggestionClick = (suggestion: string) => {
        setInputValue(suggestion);
        setSuggestions([]);
      };

      const handleClearClick = () => {
        setInputValue('')
      }
    
      return ( 
        <div>
          <input
            type="text"
            value={inputValue}
            required
            onFocus={handleInputChange}
            onChange={handleInputChange}
            placeholder="Stad / Ort"
            className='py-5 bg-black rounded-lg border border-gray-700 p-4 ps-5 focus:outline-none mb-5'
          />
          {inputValue.length > 0 && (
            <button type='button' className='relative' onClick={handleClearClick} title='Rensa'>
              <i className="fa-solid fa-x absolute bottom-0 right-6 text-gray-400 hover:text-gray-300"></i>
              <div className='sr-only'>Rensa</div>
            </button>
          )}

          {suggestions.length > 0 && (
            <div className='max-h-56 overflow-y-auto fixed rounded-lg border border-gray-700 w-56'>
              <ul className='p-2'>
                {suggestions.map((suggestion, index) => (
                  <li className='mb-1 text-gray-400 font-semibold text-md cursor-pointer hover:bg-slate-600 rounded-md p-1'  key={index} onClick={() => handleSuggestionClick(suggestion)}>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    };

export default AreaInput;