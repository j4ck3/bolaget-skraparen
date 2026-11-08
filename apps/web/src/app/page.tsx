"use client";
import Image from "next/image";
import { useState } from "react";
import { getStores } from "../services/getStoresInfo";
import { Store } from "../interfaces/Store";
import { Option } from "../interfaces/Option";
import DropDown from "../components/DropDown";
import PulseStoresLoading from "../components/PulseStoresLoading";
import StoresGrid from "../components/StoresGrid";
import AreaInput from "../components/AreaInput";
import ManageOptions from "../components/MangeOptions";
import ClosedDays from "../components/ClosedDays";
import BackToTopButton from "../components/BackToTopButton";
import logo from "../../static/bolaget.png";

interface DrinkResult {
  option: Option;
  price: string;
  stores: Store[];
}

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [area, setArea] = useState<string>("");
  const [searchedArea, setSearchedArea] = useState<string>("");
  const [canSubmit, setCanSubmit] = useState(false);
  const [results, setResults] = useState<DrinkResult[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showManageOptions, setShowManageOptions] = useState(false);
  const [selected, setSelected] = useState<Option[]>([]);

  async function fetchAndLoadStores() {
    setErrorMessage("");

    if (selected.length === 0) {
      setErrorMessage("Välj minst en dryck");
      return;
    }

    setIsLoading(true);
    setSearchedArea(area);
    setResults([]);

    const settled = await Promise.allSettled(
      selected.map((option) => getStores(option.url, area))
    );

    const found: DrinkResult[] = [];
    const errors: string[] = [];
    settled.forEach((outcome, i) => {
      const option = selected[i];
      if (outcome.status === "rejected") {
        console.error("Error fetching stores:", outcome.reason);
        errors.push(`Det gick inte att hämta ${option.title}`);
        return;
      }
      const data = outcome.value?.data;
      if (!data?.success) {
        errors.push(`Det gick inte att hämta ${option.title}`);
      } else if (data.stores.length < 1) {
        errors.push(`Inga butiker i ${area} hade ${option.title}`);
      } else {
        found.push({ option, price: data.price, stores: data.stores });
      }
    });

    setResults(found);
    if (errors.length > 0) setErrorMessage(errors.join(". "));
    setIsLoading(false);
  }

  const handleStateChange = (newValue: string) => {
    setArea(newValue);
    setCanSubmit(newValue !== "");
  };

  const handleOnClose = () => setShowManageOptions(false);

  return (
    <>
      <Image alt="bolaget" src={logo} width={120} className="m-auto mt-14" />
      <h1 className="text-md mt-8 text-center mx-4 lg:text-2xl">
        Välj en eller flera drycker och sedan &#x1F37B;
      </h1>
      <h2 className="text-sm md:text-md mt-3 text-center text-gray-500 mx-4">
        ...få detaljerad information om tillgänglighet i butiker nära dig.
      </h2>
      <div className="w-auto md:container mx-auto">
        <div className="flex flex-col md:flex-row justify-center items-center mt-20 mx-5 space-y-4 md:space-y-0 md:space-x-4 md:h-56">
          <div className="w-full relative">
            <button
              className="text-xs add-drink-btn rounded-full px-8 py-[2px] hover:text-yellow-400 transition duration-300 ease-in-out"
              onClick={() => setShowManageOptions(true)}
            >
              <span className="font-medium text-sm text-white">
                Lägg till
                <i
                  className="ms-2 fa-solid fa-wine-glass"
                  aria-hidden="true"
                ></i>
              </span>
            </button>

            <DropDown selected={selected} setSelected={setSelected} />
          </div>
          <label htmlFor="area" className="sr-only">
            stad
          </label>
          <AreaInput onInputChange={handleStateChange} />
          <button
            onClick={fetchAndLoadStores}
            type="button"
            className={`btn-search w-full ${
              canSubmit
                ? "cursor-pointer text-yellow-400"
                : "cursor-not-allowed text-gray-400"
            }`}
            disabled={!canSubmit}
            title="SÖK"
          >
            Hämta från bolaget
            {isLoading ? (
              <i
                className="fa-solid fa-circle-notch animate-spin mx-2"
                aria-hidden="true"
              ></i>
            ) : (
              ""
            )}
          </button>
        </div>
        <div className="my-32 mx-4">
          {isLoading ? (
            <PulseStoresLoading />
          ) : (
            <div
              className={
                results.length > 1
                  ? "flex flex-wrap justify-center gap-x-6"
                  : undefined
              }
            >
              {results.map((r) => (
                <StoresGrid
                  key={r.option.url}
                  searchedOption={r.option}
                  result={{ price: r.price, stores: r.stores }}
                  searchedArea={searchedArea}
                  compact={results.length > 1}
                />
              ))}
            </div>
          )}
          {results.length > 0 && <BackToTopButton />}
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

      <ClosedDays />

      <div className="flex justify-center gap-3 text-xs text-slate-600">
        <a
          href="https://github.com/j4ck3/bolaget-skraparen/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline cursor-pointer flex items-center gap-1 my-4"
        >
          Rapportera problem
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    </>
  );
};

export default Home;
