class SetsCalc {
	constructor(){
		this.rows = [];
		this.table = $('#table');
		this.row_tpl = $('#row_tpl');
		this.summary_fields = [
			$('#summary .item_component'),
			$('#summary .item_bulb'),
			$('#summary .item_coil'),
			$('#summary .item_gear'),
			$('#summary .item_brotonium'),
			$('#summary .item_blueprints'),
			$('#summary .item_hours_premium'),
			$('#summary .item_hours'),
		];
		this.add_button = $('#add_button');
		this.add_button.click(this.addRow.bind(this));
		this.add_button.prop('disabled', true);
		$.get('base.json', this.onBaseLoad.bind(this));
	}
	
	addRow(){
		this.rows.push(new SetsCalcRow(this));
	}
	
	onBaseLoad(base){
		this.base = base;
		this.add_button.prop('disabled', false);
		this.add_button.click();
	}
	
	calc(){
		var summary = [0,0,0,0,0,0,0,0];
		this.rows.forEach((row)=>{
			let row_summary = [0,0,0,0,0,0,0,0];
			let results = this.base.filter(r=>r[0]>row.level_from&&r[0]<=row.level_to&&r[9]==row.type);
			results.forEach(r=>{
				row_summary[0]+=(r[1]);
				row_summary[1]+=(r[2]);
				row_summary[2]+=(r[3]);
				row_summary[3]+=(r[4]);
				row_summary[4]+=(r[5]);
				row_summary[5]+=(r[6]);
				row_summary[6]+=(r[7]);
				row_summary[7]+=(r[8]);
			});
			row.setCalc(row_summary);
			row_summary.forEach((r,k)=>summary[k]+=r);
		});
		this.setSummary(summary)
	}
	
	setSummary(summary){
		this.summary_fields.forEach((f, k)=>f.html(summary[k]));
	}
	
}

class SetsCalcRow {
	constructor(calc){
		this.calc = calc;
		this.row = this.calc.row_tpl.clone();
		this.calc.table.append(this.row);
		this.row.removeClass('d-none');
		this.row.attr({id:''});
		this.type_dropdown = this.row.find('.item_type_dropdown');
		this.type_dropdown.find('.dropdown-item').click(this.onTypeSelect.bind(this));
		this.type_field = this.row.find('.item_type');
		this.type_field.change(this.calc.calc.bind(this.calc));
		this.level_from_field = this.row.find('.item_level_from');
		this.level_from_field.change(this.onFromChanged.bind(this));
		this.level_to_field = this.row.find('.item_level_to');
		this.level_to_field.change(this.onToChanged.bind(this));
		this.summary_fields = [
			this.row.find('.item_component'),
			this.row.find('.item_bulb'),
			this.row.find('.item_coil'),
			this.row.find('.item_gear'),
			this.row.find('.item_brotonium'),
			this.row.find('.item_blueprints'),
			this.row.find('.item_hours_premium'),
			this.row.find('.item_hours'),
		];
	}
	
	onFromChanged(e){		
		if(this.level_from<1)
			this.level_from = 1;
		if(this.level_from>70)
			this.level_from = 70;
		this.calc.calc();
	}
	
	onToChanged(e){
		if(this.level_to<1)
			this.level_to = 1;
		if(this.level_to>70)
			this.level_to = 70;
		this.calc.calc();
	}
	
	onTypeSelect(e){
		this.type_dropdown.find('.dropdown-toggle').html($(e.currentTarget).html());
		this.type_field.val($(e.currentTarget).data('value')).change();
	}
	
	setCalc(summary){
		this.summary_fields.forEach((f, k)=>f.html(summary[k]));
	}
	
	get type(){
		return this.type_field.val();
	}
	
	get level_from(){
		return this.level_from_field.val();
	}
	
	get level_to(){
		return this.level_to_field.val();
	}
	
	set type(v){
		this.type_field.val(v);
	}
	
	set level_from(v){
		this.level_from_field.val(v);
	}
	
	set level_to(v){
		this.level_to_field.val(v);
	}
}
$(document).ready(function(){
window.calcInstace = new SetsCalc();
});