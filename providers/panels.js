const fs = require('fs');

let panels = {};

update();
function update() {
	
	try {
		panels = JSON.parse(fs.readFileSync('data/panels.json').toString());
	} catch (ex) {}
	
}

if (fs.existsSync('data/panels.json')) fs.watch('data/panels.json', (e) => {
	if (e === 'change') update();
});

module.exports.getPanel = (id) => panels[id] || null;
