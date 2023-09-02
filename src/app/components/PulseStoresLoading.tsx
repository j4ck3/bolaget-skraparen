import { type NextPage } from 'next';



const PulseStoresLoading: NextPage = () => {
  return (
    <>
        <div className='grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
            <div className='animate-pulse border-2 border-gray-700 rounded-2xl p-7 flex'>
              <div className='w-16 h-16 bg-slate-300 p-7 rounded-full me-5'>
              </div>
              <div>
                <h3 className='h-4  bg-slate-300 rounded w-32 mb-4 '></h3>
                <p className='h-2 bg-slate-300 rounded'></p>
                <p className='h-2 mt-3 bg-slate-300 rounded'></p>
              </div>
            </div>
            <div className='animate-pulse border-2 border-gray-700 rounded-2xl p-7 flex'>
              <div className='w-16 h-16 bg-slate-300 p-7 rounded-full me-5'>
              </div>
              <div>
                <h3 className='h-4  bg-slate-300 rounded w-32 mb-4 '></h3>
                <p className='h-2 bg-slate-300 rounded'></p>
                <p className='h-2 mt-3 bg-slate-300 rounded'></p>
              </div>
            </div>
            <div className='animate-pulse border-2 border-gray-700 rounded-2xl p-7 flex'>
              <div className='w-16 h-16 bg-slate-300 p-7 rounded-full me-5'>
              </div>
              <div>
                <h3 className='h-4  bg-slate-300 rounded w-32 mb-4 '></h3>
                <p className='h-2 bg-slate-300 rounded'></p>
                <p className='h-2 mt-3 bg-slate-300 rounded'></p>
              </div>
            </div>
            <div className='animate-pulse border-2 border-gray-700 rounded-2xl p-7 flex'>
              <div className='w-16 h-16 bg-slate-300 p-7 rounded-full me-5'>
              </div>
              <div>
                <h3 className='h-4  bg-slate-300 rounded w-32 mb-4 '></h3>
                <p className='h-2 bg-slate-300 rounded'></p>
                <p className='h-2 mt-3 bg-slate-300 rounded'></p>
              </div>
            </div>
        </div>
    </>
  );
};

export default PulseStoresLoading;