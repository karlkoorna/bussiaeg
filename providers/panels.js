const fs = require('fs');

var panels = {};

update();
function update() {
	
	try {
		panels = JSON.parse(fs.readFileSync('./providers/panels.json').toString());
	} catch (ex) {}
	
}

fs.watch('./providers/panels.json', (e, f) => {
	if (e === 'change') update();
});

function getPanel(id) {
	return panels[id];
}

module.exports.getPanel = getPanel;
