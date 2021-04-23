import { CoCActor } from '../actors/actor.js';
import { CoC7Check } from '../check.js';
import { CoC7Link } from './link.js';

export class CoC7LinkCreationDialog extends FormApplication{

	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			id: 'link-creation',
			classes: ['coc7'],
			title: 'Link creation',
			template: 'systems/CoC7/templates/apps/link-creation.html',
			closeOnSubmit: false,
			submitOnClose: true,
			submitOnChange: true,
			width: 400,
			height: 'auto',
			choices: {},
			allowCustom: true,
			minimum: 0,
			maximum: null
		});
	}

	/** @override */
	getData() {
		const data = super.getData();

		data.link = this.link;
		data.data = this.link.data;

		//Prepare difficulty select data
		data.difficultyLevel = CoC7Check.difficultyLevel;
		data.selectedDifficulty = {
			unknown: CoC7Check.difficultyLevel.unknown == this.link.data.difficulty,
			regular: CoC7Check.difficultyLevel.regular == this.link.data.difficulty,
			hard: CoC7Check.difficultyLevel.hard == this.link.data.difficulty,
			extreme: CoC7Check.difficultyLevel.extreme == this.link.data.difficulty,
			critical: CoC7Check.difficultyLevel.critical == this.link.data.difficulty
		};
		if( !this.link.data.difficulty){
			if( 'unknown' === game.settings.get('CoC7', 'defaultCheckDifficulty')) data.selectedDifficulty.unknown = true;
			else data.selectedDifficulty.regular = true;
		}

		//Prepare link type
		data.linkType = [
			{
				key: CoC7Link.LINK_TYPE.CHECK,
				label: 'Check',
				selected: this.link.is.check

			},{
				key: CoC7Link.LINK_TYPE.SANLOSS,
				label: 'Sanity Loss',
				selected: this.link.is.sanloss

			},{
				key: CoC7Link.LINK_TYPE.ITEM,
				label: 'Item (weapon)',
				selected: this.link.is.item
	
			}
		];

		//Prepare check type data
		data.checkType = CoC7Link.CHECK_TYPE;
		data.selectedCheckType = {
			characteristic: CoC7Link.CHECK_TYPE.CHARACTERISTIC == this.link.check,
			attribute: CoC7Link.CHECK_TYPE.ATTRIBUTE == this.link.check,
			skill: CoC7Link.CHECK_TYPE.SKILL == this.link.check,
		};
		if( !this.link.check) data.selectedCheckType.characteristic = true;

		//Prepare characteristics
		data.characteristics = CoCActor.getCharacteristicDefinition();
		for (let i = 0; i < data.characteristics.length; i++) {
			if( data.data.characteristicKey == data.characteristics[i].key||
				data.data.characteristicKey == data.characteristics[i].shortName ||
				data.data.characteristicKey == data.characteristics[i].label ) data.characteristics[i].selected = true;
			else data.characteristics[i].selected = false;			
		}

		//Prepare characteristics
		data.attributes = [
			{
				key: 'lck',
				label: game.i18n.localize( 'CoC7.Luck'),
				selected: data.data.attributeKey == 'lck'
			},
			{
				key: 'san',
				label: game.i18n.localize( 'CoC7.Sanity'),
				selected: data.data.attributeKey == 'san'
			}
		];
		

		return data;
	}

	get link(){
		return this.object;
	}

	activateListeners(html) {
		html.find('.submit-button').click(this._onClickSubmit.bind(this));

		super.activateListeners( html);
	}

	_onClickSubmit(event){
		const action = event.currentTarget.dataset.action;
		switch (action) {
		case 'clipboard':
			ui.notifications.info(`Submit ${action} clicked`);
			ui.notifications.info( `Link created :${this.link.link}`);
			navigator.clipboard.writeText(this.link.link);
			break;
		
		default:
			break;
		}
		this.close();
	}

	/** @override */
	_updateObject(event, formData) {
		const target = event.currentTarget;
		const group = target?.closest( '.form-group');
		const groupName = group?.dataset.group;
		if( 'link-type' == groupName){ // Deprecated
			if( target.name == 'isCheck') this.link.is.check = true;
			else if( target.name == 'isSanloss') this.link.is.sanloss = true;
			else if( target.name == 'isItem') this.link.is.item = true;
		} else {
			const formDataEx = expandObject( formData);
			if( formDataEx.check) formDataEx.check = Number(formDataEx.check);
			if( formDataEx.difficulty) formDataEx.difficulty = Number(formDataEx.difficulty);
			if( formDataEx.type) formDataEx.type = Number(formDataEx.type);
			const diffData = diffObject(this.link.data, formDataEx);
			this.link.update( diffData);
		}
		this.render(true);
	}

	// /** @override */
	// _getSubmitData(updateData={}) {
	// 	ui.notifications.info(`_getSubmitData: ${updateData}`);

	// 	// Create the expanded update data object
	// 	const fd = new FormDataExtended(this.form, {editors: this.editors});
	// 	let data = fd.toObject();
	// 	if ( updateData ) data = mergeObject(data, updateData);
	// 	else data = expandObject(data);
	
	// 	// Handle Damage array
	// 	const damage = data.data?.damage;
	// 	if ( damage ) damage.parts = Object.values(damage?.parts || {}).map(d => [d[0] || '', d[1] || '']);
	
	// 	// Return the flattened submission data
	// 	return flattenObject(data);
	// }

	// /** @override */
	// _onSubmit

	static async create(){
		const link = new CoC7Link();
		await new CoC7LinkCreationDialog(link, {}).render(true);
		ui.notifications.info('Link created');
	}
}