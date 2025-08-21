// ==UserScript==
// @name         Customizer for glass css General+borders
// @namespace    http://tampermonkey.net/
// @version      2
// @description  Customize bg,color, etc (css tab in settings), without touching css
// @author       -deusVult
// @match        https://krunker.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=krunker.io
// @grant        none
// @run-at       document-end  // Waits for page to fully load dynamic content
// ==/UserScript==

// | IGN: -deusVult
// | Github: https://github.com/deusVult69
// | Discord: hardypr0

;(function () {
	'use strict'

	const STORAGE_KEY = 'cssCustomVarsV2'
	const DEFAULT_VARS = {
		primaryColor: {
			name: '--color-primary',
			value: '#ff79ac',
		},
		colorTextPrimary: {
			name: '--color-text-primary',
			value: '#e7e7e7',
		},
		colorBgPrimary: {
			name: '--color-bg-primary',
			value: '#24292e',
		},
		glassBg: {
			name: '--glass-bg',
			value: '#ffffff20',
		},
		logoCaption: {
			name: '--logo-caption',
			value: 'Meow clan',
		},
		borderStyle: {
			name: '--border',
			checked: false,
			value: '2px solid var(--color-primary)',
		},
	}

	let vars =
		JSON.parse(localStorage.getItem(STORAGE_KEY)) ||
		JSON.parse(JSON.stringify(DEFAULT_VARS))

	function saveVars() {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(vars))
	}

	function updateVar(varKey) {
		if (!vars.hasOwnProperty(varKey)) {
			console.warn(`Variable ${varKey} not found in vars obj`)
			return
		}

		const { name, value, checked = undefined } = vars[varKey]

		if (varKey === 'borderStyle') {
			applyBorderStyle()
			return
		}

		const formattedValue = name.includes('logo') ? `"${value}"` : value
		document.documentElement.style.setProperty(name, formattedValue)

		if (varKey === 'primaryColor') {
			applyBorderStyle()
		}
	}

	function updateAllVars() {
		Object.keys(vars).forEach(updateVar)
	}

	function resetVarsToDefault() {
		vars = JSON.parse(JSON.stringify(DEFAULT_VARS))
		updateAllVars()
		localStorage.removeItem(STORAGE_KEY)
		resetInputValues()
	}

	function applyBorderStyle() {
		const borderValue = vars.borderStyle.checked
			? `2px solid ${vars.primaryColor.value}`
			: 'none'

		document.documentElement.style.setProperty('--border', borderValue)
	}

	//apply changes when refresh
	updateAllVars()

	const observer = new MutationObserver(() => {
		if (isTabsLoaded()) {
			createCustomTab()
		}
	})

	observer.observe(document.getElementById('menuWindow'), {
		childList: true,
		subtree: true,
	})

	function isTabsLoaded() {
		return !!document.getElementById('settingsTabLayout')
	}

	function createCustomTab() {
		const settingsTabs = document.getElementById('settingsTabLayout')
		if (!settingsTabs) return

		if (document.querySelector('#cssTab')) {
			console.log('CSS tab already exists.')
			return
		}

		const cssTab = document.createElement('div')
		cssTab.id = 'cssTab'
		cssTab.className = 'settingTab'
		cssTab.setAttribute('onmouseenter', 'playTick()')
		cssTab.setAttribute(
			'onclick',
			'playSelect(0.1); window.windows[0].changeTab(6)'
		)
		cssTab.textContent = 'CSS'

		settingsTabs.appendChild(cssTab)

		cssTab.addEventListener('click', () => {
			cssTab.classList.add('tabANew')
			createCustomSettings()
		})
	}

	function getInputId(varKey) {
		return `customVarInput_${varKey}`
	}
	function resetInputValues() {
		Object.keys(vars).forEach(varKey => {
			const input = document.getElementById(getInputId(varKey))

			if (!input) return

			if (input.type === 'color' && vars[varKey].value.length > 7) {
				input.value = vars[varKey].value.substring(0, 7)
			} else if (input.type === 'checkbox') {
				input.checked = vars[varKey].checked
			} else {
				input.value = vars[varKey].value
			}
		})
	}

	function createSetting(desc, varKey, type, id, placeholder) {
		const { value } = vars[varKey]

		const setContainer = document.createElement('div')
		setContainer.className = 'settName'
		setContainer.style = 'display: block'
		setContainer.textContent = desc

		const input = document.createElement('input')
		input.type = type
		input.id = id
		input.value = value
		input.style.cssText = 'float:right;margin-top:5px;'

		if (type === 'text') {
			input.className = 'inputGrey2'
			if (placeholder) input.placeholder = placeholder
		}

		input.addEventListener('input', () => {
			vars[varKey].value = input.value
			updateVar(varKey)
			saveVars()
		})

		setContainer.appendChild(input)
		return setContainer
	}

	function createToggleSetting(desc, varKey, id) {
		if (!vars.hasOwnProperty(varKey)) {
			console.warn(`Variable ${varKey} not found in vars object`)
			return
		}
		const { checked } = vars[varKey]

		const setContainer = document.createElement('div')
		setContainer.className = 'settName'
		setContainer.style = 'display: block'
		setContainer.textContent = desc

		const label = document.createElement('label')
		label.className = 'switch'
		label.style = 'margin-left:10px'

		const slider = document.createElement('span')
		slider.className = 'slider'

		const checkbox = document.createElement('input')
		checkbox.type = 'checkbox'
		checkbox.id = id
		checkbox.checked = checked
		checkbox.style.cssText = 'float:right;margin-top:5px;'

		checkbox.addEventListener('change', () => {
			vars[varKey].checked = checkbox.checked
			updateVar(varKey)
			saveVars()
		})

		label.append(checkbox, slider)

		setContainer.appendChild(label)
		return setContainer
	}

	function createResetButton() {
		const button = document.createElement('button')
		button.textContent = 'Reset settings'
		button.className = 'settingsBtn'
		button.style.cssText += 'border:0;width:auto;'

		button.addEventListener('click', () => {
			alert('Reset your custom css settings?')
			resetVarsToDefault()
		})

		const setContainer = document.createElement('div')
		setContainer.className = 'settName'
		setContainer.style.display = 'block'
		setContainer.textContent = 'Reset your custom settings to default'
		setContainer.appendChild(button)

		return setContainer
	}

	function createCustomSettings() {
		const settingsTabContent = document.querySelector('#settHolder')
		if (
			!settingsTabContent ||
			document.getElementById('customCssInputPrimaryColor')
		) {
			return
		}

		settingsTabContent.innerHTML = ''

		const setHeader = document.createElement('div')
		setHeader.className = 'setHed'
		setHeader.setAttribute('onclick', 'window.windows[0].collapseFolder(this)')
		setHeader.textContent = 'Custom settings'

		const setBody = document.createElement('div')
		setBody.className = 'setBodH'

		const settings = [
			createSetting(
				'Accent Color',
				'primaryColor',
				'color',
				getInputId('primaryColor')
			),
			createSetting(
				'Glass bg color',
				'glassBg',
				'color',
				getInputId('glassBg')
			),

			createSetting(
				'Primary background color',
				'colorBgPrimary',
				'color',
				getInputId('colorBgPrimary')
			),

			createSetting(
				'Primary text color',
				'colorTextPrimary',
				'color',
				getInputId('colorTextPrimary')
			),
			createSetting(
				'Logo caption in menu',
				'logoCaption',
				'text',
				getInputId('logoCaption'),
				'Logo caption'
			),
			createToggleSetting(
				'Enable borders',
				'borderStyle',
				getInputId('borderStyle')
			),
			createResetButton(),
		]

		setBody.append(...settings)
		settingsTabContent.append(setHeader, setBody)
	}
})()
