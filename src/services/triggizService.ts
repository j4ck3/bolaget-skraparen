import puppeteer from 'puppeteer'

interface TriggizResult {
	triggiz: string
	milestone: string
}

const getTriggiz = async (): Promise<TriggizResult> => {
	const isProduction = process.env.NODE_ENV === 'production'

	const browser = await puppeteer.launch({
		executablePath: isProduction ? '/usr/bin/chromium' : undefined,
		headless: isProduction ? true : false,
		ignoreDefaultArgs: ['--disable-extensions'],
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
	})

	const page = await browser.newPage()

	try {
		await page.goto(process.env.LOGIN_URL!, {
			waitUntil: 'networkidle2',
		})

		const email = process.env.NORDIC_WELLNESS_LOGIN_EMAIL
		const password = process.env.NORDIC_WELLNESS_LOGIN_PASSWORD

		await page.evaluate(
			(email, password) => {
				;(
					document.querySelector(
						'input[id="UserName"]'
					) as HTMLInputElement
				).value = email!
				;(
					document.querySelector(
						'input[id="Password"]'
					) as HTMLInputElement
				).value = password!
			},
			email,
			password
		)

		await Promise.all([
			page.$eval('button[type="submit"]', (form) =>
				(form as HTMLButtonElement).click()
			),
			page.waitForNavigation({ waitUntil: 'networkidle2' }),
		])

		const triggiz = await page.$eval(
			'.independent-section .content-wrapper .drop-chart .drops-text',
			(el) => el.textContent || ''
		)
		const milestone = await page.$eval(
			'.independent-section .content-wrapper .drop-chart .sub-text',
			(el) => el.textContent || ''
		)

		return { triggiz, milestone }
	} catch (error) {
		console.error('Error during login with Puppeteer:', error)
		return { triggiz: '', milestone: '' }
	} finally {
		await browser.close()
	}
}

export default getTriggiz
