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
		this.share_modal = $('#share_modal');
		this.share_modal_input = $('#share_modal_input');
		this.share_button = $('#share_button');
		this.share_button.click(this.share.bind(this));
		this.add_button.prop('disabled', true);
		$.get('base.json', this.onBaseLoad.bind(this));
	}
	
	getShareUrl(){
		var url = window.location.origin+window.location.pathname,
			data = [];
		this.rows.forEach((row)=>{
			data.push(row.url_data);
		});
		url += '#'+data.join('|');
		return url;
	}
	
	share(){
		var url = this.getShareUrl();
		SetsCalcHelper.copyTextToClipboard(url, this.onShareUrlCopied.bind(this));
	}
	
	onShareUrlCopied(result){
		if(result){
			this.share_button.html('COPIED');
			setTimeout(a=>{this.share_button.html('SHARE');}, 1500);
		}else{
			var url = this.getShareUrl();
			this.share_modal_input.val(url);
			this.share_modal.modal('show');
		}
	}
	
	formatTime(s){
		 var fm = [
			Math.floor(s / 60 / 60 / 24),
			Math.floor(s / 60 / 60) % 24,
			Math.floor(s / 60) % 60,
			s % 60
		],
		map = ['d','h', 'm','s'],
		str = '';
		fm.forEach((v,k)=>{
			if(v>0){
				str+=v+map[k]+' ';
			}
		});
      return str;
	}
	
	addRow(){
		this.rows.push(new SetsCalcRow(this));
	}
	
	onBaseLoad(base){
		this.base = base;
		this.add_button.prop('disabled', false);
		if(this.parseHash()){
			this.applyHash();
		}else{
			this.add_button.click();
		}
	}
	
	parseHash(){
		return window.location.hash.match(/(([a-z]+):(\d+):(\d+):(\d+))/g);
	}
	
	applyHash(){
		var matches = this.parseHash();
		matches.forEach(str=>{
			let row = new SetsCalcRow(this);
			row.url_data = str;
			this.rows.push(row);
		});
		this.calc();
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
			row_summary.forEach((r,k)=>row_summary[k]*=row.quantity); 
			row_summary.forEach((r,k)=>summary[k]+=r);
			row.setCalc(row_summary);
		});
		this.setSummary(summary)
	}
	
	setSummary(summary){
		this.summary_fields.forEach((f, k)=>{
			if(f.is('.item_hours_premium, .item_hours')){
				f.html(this.formatTime(summary[k]));
			}else{
				f.html(summary[k]);
			}
		});
	}
	
}

class SetsCalcRow {
	constructor(calc, data){
		this.calc = calc;
		this.row = this.calc.row_tpl.clone();
		this.calc.table.append(this.row);
		this.row.removeClass('d-none');
		this.row.attr({id:''});
		this.type_dropdown = this.row.find('.item_type_dropdown');
		this.type_dropdown.find('.dropdown-item').click(this.onTypeSelect.bind(this));
		this.type_field = this.row.find('.item_type');
		this.type_field.change(this.calc.calc.bind(this.calc));
		this.quantity_field = this.row.find('.item_quantity');
		this.quantity_field.change(this.calc.calc.bind(this.calc));
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
		if(typeof data == 'object'){
			Object.keys(data).forEach(k=>{
				if(typeof this[k] != 'undefined'){
					this[k] = data[k];
				}
			});
		}
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
	
	setTypeDropDownVal(v){
		this.type_dropdown.find('.dropdown-toggle').html(this.type_dropdown.find('[data-value="'+v+'"]').html());
	}
	
	onTypeSelect(e){
		this.type = $(e.currentTarget).data('value');
		this.type_field.change();
	}
	
	setCalc(summary){
		this.summary_fields.forEach((f, k)=>{
			if(f.is('.item_hours_premium, .item_hours')){
				f.html(this.calc.formatTime(summary[k]));
			}else{
				f.html(summary[k]);
			}
		});
	}
	
	get url_data(){
		return this.type+':'+this.level_from+':'+this.level_to+':'+this.quantity;
	}
	
	get quantity(){
		return this.quantity_field.val();
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
	
	set url_data(v){
		let split_data = v.split(':');
		this.type = split_data[0];
		this.level_from = split_data[1];
		this.level_to = split_data[2];
		this.quantity = split_data[3];
	}
	
	set quantity(v){
		return this.quantity_field.val(v);
	}
	
	set type(v){
		this.setTypeDropDownVal(v);
		this.type_field.val(v);
	}
	
	set level_from(v){
		this.level_from_field.val(v);
	}
	
	set level_to(v){
		this.level_to_field.val(v);
	}
}

class SetsCalcHelper {
	static fallbackCopyTextToClipboard(text, cb) {
	  var ta = document.createElement("textarea");
	  ta.value = text;
	  ta.style.top = "0";
	  ta.style.left = "0";
	  ta.style.opacity = "0";
	  ta.style.position = "fixed";

	  document.body.appendChild(ta);
	  ta.focus();
	  ta.select();

	  try {
		var successful = document.execCommand('copy');
		cb(successful);
	  } catch (err) {
		cb(false);
	  }

	  document.body.removeChild(ta);
	}
	static copyTextToClipboard(text, cb) {
	  if (!navigator.clipboard) {
		this.fallbackCopyTextToClipboard(text, cb);
		return;
	  }
	  navigator.clipboard.writeText(text).then(function() {
		cb(true);
	  }, function(err) {
		cb(false);
	  });
	}
}

$(document).ready(function(){
window.calcInstace = new SetsCalc();
});