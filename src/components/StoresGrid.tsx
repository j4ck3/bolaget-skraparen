import { useState } from 'react'
import { Option } from '../interfaces/Option'
import BackToTopButton from './BackToTopButton'
import { type NextPage } from 'next'
import { Store } from '../interfaces/Store'
import Image from 'next/image'

interface Props {
	searchedOption: Option
	searchedArea: string
	result: {
		price: string
		stores: Store[]
	}
}

const StoresGrid: NextPage<Props> = ({
	searchedOption,
	searchedArea,
	result
}) => {
	const [showAll, setShowAll] = useState(false)
	const itemsToShow = showAll ? result.stores.length : 4

	return (
		<>
			{result.stores.length > 0 && (
				<div className='border border-gray-200 rounded-xl container mx-auto w-full lg:w-1/3'>
					<div className='flex justify-center items-center m-3'>
						<Image
							alt={searchedOption.title}
							src={searchedOption.imgSrc}
							width={25}
							height={25}
							title={searchedOption.title}
							className='w-auto me-2 max-h-[48px]'
						/>
						<h3>
							{searchedOption.title}
							<span className='mx-2 text-gray-600'>|</span>
							{result.price}
							<span className='mx-2 text-gray-600'>|</span>
							{result.stores.length} butiker
							<span className='mx-2 text-gray-600'>|</span>
							{searchedArea}
						</h3>
					</div>

					{result.stores.slice(0, itemsToShow).map((store, index) => (
						<div
							className='p-2 flex justify-between border-t-[1px] border-gray-700'
							key={index}
						>
							<div className='w-4/6'>
								<h3 className='text-base font-medium'>{store.city}</h3>
								<h3 className='text-sm font-medium text-gray-600'>
									{store.address}
								</h3>
							</div>
							<p className='text-lg font-medium amount'>
								{store.amount}
							</p>
						</div>
					))}
					{result.stores.length > 4 && !showAll && (
						<div className='col-span-full flex justify-center'>
							<button
								type='button'
								className='text-white font-bold tracking-wide btn-search rounded-xl m-5 py-2'
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
	)
}

export default StoresGrid
