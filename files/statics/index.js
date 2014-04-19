$(document).ready(function() {
	$.fn.fullpage({
		'verticalCentered': true,
		'resize' : true,
		'paddingTop': '60px',
		'horizontalCentered': true,
		'slidesNavigation': true,
		'css3': true,
		'slidesColor': ['#3B9FB7','#A4C400','#3B9FB7','#00C1A0','#FF8500'],
		'navigation': true,
		'navigationPosition': 'right',
		'navigationTooltips': ['Mobile & Web Apps','Prozess', 'Technologie', 'Projekte', 'Kontakt'],
		'anchors': ['mobilewebapps','process', 'technology', 'projects', 'contact'],
		'easing': 'easeOutBack',
		'fixedElements': 'header, footer',
		'afterLoad': function(anchorLink, index){
		},		
		'onLeave': function(index, direction){
		},
		afterRender: function(){
		}
	});
});