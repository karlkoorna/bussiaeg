const fs = require('fs');

let panels = {};

update();
function update() {
	
	try {
		panels = JSON.parse(fs.readFileSync('./providers/panels.json').toString());
	} catch (ex) {}
	
}

if (fs.existsSync('./providers/panels.json')) fs.watch('./providers/panels.json', (e) => {
	if (e === 'change') update();
});

module.exports.getPanel = (id) => panels[id] || null;
