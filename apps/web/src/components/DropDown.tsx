import { useEffect, useRef, useState } from 'react'
import { type NextPage } from 'next'
import { Option } from '../interfaces/Option'
import Image from 'next/image'
import ab from '../../static/ab.png'
import ey from '../../static/ey.png'
import tc from '../../static/tc.png'

interface Props {
	selected: Option[]
	setSelected: React.Dispatch<React.SetStateAction<Option[]>>
}

const DrinkImage = ({ src, className = 'h-12' }: { src: string; className?: string }) =>
	src !== '' && (src.startsWith('http') || src.startsWith('/')) ? (
		<Image
			alt='dricka'
			src={src}
			width={20}
			height={20}
			className={`inline w-auto ${className}`}
		/>
	) : null

const Dropdown: NextPage<Props> = ({ selected, setSelected }) => {
	const [isActive, setIsActive] = useState(false)
	const [options, setOptions] = useState<Option[]>([])
	const dropdownRef = useRef<HTMLDivElement | null>(null)

	const toggleDropDown = () => {
		setIsActive(!isActive)
	}

	useEffect(() => {
		try {
			const storedOptions = JSON.parse(
				localStorage.getItem('options') || '[]'
			)
			setOptions(storedOptions)
		} catch (error) {
			console.error('Error parsing stored options:', error)
		}

		const closeDropdown = () => {
			setIsActive(false)
		}

		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				closeDropdown()
			}
		}

		if (isActive) {
			document.addEventListener('click', handleClickOutside)
		} else {
			document.removeEventListener('click', handleClickOutside)
		}
		return () => {
			document.removeEventListener('click', handleClickOutside)
		}
	}, [isActive])

	const startOptions: Option[] = [
		{
			title: 'Ey Bro',
			url: 'https://www.systembolaget.se/produkt/ol/ey-bro-143215/',
			imgSrc: ey.src
		},
		{
			title: 'Absolult Pears',
			url: 'https://www.systembolaget.se/produkt/sprit/absolut-8901/',
			imgSrc: ab.src
		},
		{
			title: 'Tom Collins',
			url: 'https://www.systembolaget.se/produkt/cider-blanddrycker/fors-cocktails-107315/',
			imgSrc: tc.src
		}
	]
	const combinedOptions = [...options, ...startOptions].filter(
		(option, index, all) => all.findIndex((o) => o.url === option.url) === index
	)
	const isSelected = (option: Option) =>
		selected.some((s) => s.url === option.url)

	const toggle = (option: Option) =>
		setSelected((prev) =>
			prev.some((s) => s.url === option.url)
				? prev.filter((s) => s.url !== option.url)
				: [...prev, option]
		)

	return (
		<div className='relative z-10' ref={dropdownRef}>
			<div
				className={`border bg-black w-full select-none rounded-md overflow-x-auto ${
					isActive
						? 'border-gray-200 absolute md:static'
						: 'border-gray-400 hover:border-gray-200'
				}`}
			>
				<div
					onClick={toggleDropDown}
					className='p-4 font-regular hover:bg-slate-600 rounded-md cursor-pointer'
				>
					{selected.length === 0 ? (
						<p className='text-white'>Välj en eller flera drycker *</p>
					) : (
						<div className='flex flex-wrap gap-2'>
							{selected.map((option) => (
								<span
									key={option.url}
									className='flex items-center gap-2 rounded-full border border-gray-500 py-1 ps-2 pe-1 text-sm text-white'
								>
									<DrinkImage src={option.imgSrc} className='h-6' />
									{option.title}
									<button
										type='button'
										aria-label={`Ta bort ${option.title}`}
										onClick={(e) => {
											e.stopPropagation()
											toggle(option)
										}}
										className='rounded-full px-2 text-gray-400 hover:bg-slate-500 hover:text-white'
									>
										×
									</button>
								</span>
							))}
						</div>
					)}
				</div>

				{isActive && (
					<div>
						{combinedOptions.map((option) => (
							<div
								key={option.url}
								role='checkbox'
								aria-checked={isSelected(option)}
								onClick={() => toggle(option)}
								className='font-semibold p-4 hover:bg-slate-600 rounded-md cursor-pointer'
							>
								<div className='grid grid-cols-6 items-center'>
									<div className='w-12 flex justify-center col-span-1'>
										<DrinkImage src={option.imgSrc} />
									</div>
									<p className='text-white col-span-4'>{option.title}</p>
									<span className='col-span-1 text-end text-yellow-400'>
										{isSelected(option) ? '✓' : ''}
									</span>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}

export default Dropdown
