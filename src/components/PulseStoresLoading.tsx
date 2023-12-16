import { type NextPage } from 'next'

const PulseStoresLoading: NextPage = () => {
	return (
		<>
			<div className='border border-gray-200 rounded-xl container mx-auto w-full lg:w-1/3'>
				<div className='flex justify-center items-center m-3 animate-pulse'>
					<div className='w-12 h-12 bg-slate-300 p-7 rounded-full me-4'></div>
					<h3 className='flex items-center flex-wrap'>
						<div className='h-5 bg-slate-300 rounded w-20'></div>
						<span className='mx-2 text-gray-600'>|</span>
						<div className='h-5 bg-slate-300 rounded w-20'></div>
						<span className='mx-2 text-gray-600'>|</span>
						<div className='h-5 bg-slate-300 rounded w-20'></div>
						<span className='mx-2 text-gray-600'>|</span>
						<div className='h-5 bg-slate-300 rounded w-20'></div>
					</h3>
				</div>
				<div className='p-2 flex justify-between border-t-[1px] border-gray-700 animate-pulse'>
					<div className='w-4/6 space-y-2'>
						<div className='h-5 bg-slate-300 rounded w-24'></div>
						<div className='h-3 bg-slate-300 rounded w-36'></div>
					</div>
					<div className='h-5 bg-slate-300 rounded w-16 inline-block'></div>
				</div>
				<div className='p-2 flex justify-between border-t-[1px] border-gray-700 animate-pulse'>
					<div className='w-4/6 space-y-2'>
						<div className='h-5 bg-slate-300 rounded w-24'></div>
						<div className='h-3 bg-slate-300 rounded w-36'></div>
					</div>
					<div className='h-5 bg-slate-300 rounded w-16 inline-block'></div>
				</div>
				<div className='p-2 flex justify-between border-t-[1px] border-gray-700 animate-pulse'>
					<div className='w-4/6 space-y-2'>
						<div className='h-5 bg-slate-300 rounded w-24'></div>
						<div className='h-3 bg-slate-300 rounded w-36'></div>
					</div>
					<div className='h-5 bg-slate-300 rounded w-16 inline-block'></div>
				</div>
				<div className='p-2 flex justify-between border-t-[1px] border-gray-700 animate-pulse'>
					<div className='w-4/6 space-y-2'>
						<div className='h-5 bg-slate-300 rounded w-24'></div>
						<div className='h-3 bg-slate-300 rounded w-36'></div>
					</div>
					<div className='h-5 bg-slate-300 rounded w-16 inline-block'></div>
				</div>
			</div>
		</>
	)
}

export default PulseStoresLoading
