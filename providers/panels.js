const fs = require('fs');

let panels = {};

update();
function update() {
	
	try {
		panels = JSON.parse(fs.readFileSync('./providers/panels.json').toString());
	} catch (ex) {}
	
}

fs.watch('./providers/panels.json', (e) => {
	if (e === 'change') update();
});

function getPanel(id) {
	return panels[id];
}

module.exports.getPanel = getPanel;
