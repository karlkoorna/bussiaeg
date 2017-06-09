const fs = require('fs');

var panels = JSON.parse(fs.readFileSync('./providers/panels.json').toString());

fs.watch('./providers/panels.json', (e, f) => {
	
	if (e === 'change') try {
		panels = JSON.parse(fs.readFileSync('./providers/panels.json').toString());
	} catch(ex) {}
	
});

function getPanel(id) {
	
	return panels[id];
	
}

module.exports.getPanel = getPanel;